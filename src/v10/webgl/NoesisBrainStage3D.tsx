import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RotateCcw } from 'lucide-react';
import { loadHiResBrainGeometries } from './brainHiresLoader';

export type BrainStageMode = 'split' | 'atlas' | 'tms' | 'silicon';

export interface NoesisBrainStage3DProps {
  mode: BrainStageMode;
  dark?: boolean;
  /** 0..1 continuous choreography driver (scroll progress or slider) */
  progress?: number;
  /** Optional explicit focus override in 'atlas' mode (0=auto-scroll, 1=cerebellum, 2=scan, 3=iit, 4=gnwt, 5=thalamus) or 'tms' (0=coma, 1=cmd) */
  focusMode?: number;
  /** Increments to trigger a cortical TMS pulse wave */
  pulseKey?: number;
  className?: string;
  caption?: string;
}

interface OverlayUniforms {
  [uniform: string]: THREE.IUniform<unknown>;
  uTime: THREE.IUniform<number>;
  uMode: THREE.IUniform<number>; // 0=split, 1=atlas, 2=tms, 3=silicon
  uProgress: THREE.IUniform<number>;
  uFocus: THREE.IUniform<number>;
  uPulseTime: THREE.IUniform<number>;
  uDark: THREE.IUniform<number>;
  uGlassMix: THREE.IUniform<number>; // 0=opaque PBR porcelain, 1=crystal 2-pass Fresnel X-ray glass
}

// Create soft procedural contact shadow texture so the 3D brain rests physically above the #FAF9F5 paper!
function createContactShadowTexture(dark: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    if (dark) {
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.22)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      grad.addColorStop(0, 'rgba(20, 20, 19, 0.22)');
      grad.addColorStop(0.52, 'rgba(20, 20, 19, 0.08)');
      grad.addColorStop(1, 'rgba(20, 20, 19, 0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * 2-Pass Crystal X-Ray / Functional Overlay Shader:
 * Runs with `depthFunc: THREE.EqualDepth` AFTER an invisible depth pre-pass (`colorWrite: false, depthWrite: true`),
 * guaranteeing ZERO z-fighting or torn interior triangles at ANY camera angle!
 */
function createGlassOverlayMaterial(dark: boolean): THREE.ShaderMaterial {
  const uniforms: OverlayUniforms = {
    uTime: { value: 0 },
    uMode: { value: 0 },
    uProgress: { value: 0 },
    uFocus: { value: 0 },
    uPulseTime: { value: -1 },
    uDark: { value: dark ? 1 : 0 },
    uGlassMix: { value: 0 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      attribute vec2 aSulc;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec3 vLocalPos;
      varying vec2 vSulc;

      void main() {
        vLocalPos = position;
        vSulc = aSulc;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mv.xyz;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uMode;
      uniform float uProgress;
      uniform float uFocus;
      uniform float uPulseTime;
      uniform float uDark;
      uniform float uGlassMix;

      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec3 vLocalPos;
      varying vec2 vSulc;

      const vec3 COBALT = vec3(0.015, 0.305, 0.875);
      const vec3 SIGNAL = vec3(0.988, 0.255, 0.035);
      const vec3 EMERALD = vec3(0.16, 0.82, 0.58);
      const vec3 SILICON_DARK = vec3(0.10, 0.13, 0.19);

      void main() {
        vec3 N = normalize(vNormalView);
        vec3 V = normalize(vViewPos);
        float ndotv = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = pow(1.0 - ndotv, 2.4);
        float sulc = clamp(vSulc.x, 0.0, 1.0);
        float curv = clamp(vSulc.y, 0.0, 1.0);

        vec3 col = vec3(0.0);
        float alpha = 0.0;

        // 2-Pass Crystal Fresnel Glass Base (only when uGlassMix > 0.01)
        if (uGlassMix > 0.01) {
          float rim = pow(1.0 - ndotv, 1.85);
          vec3 glassRim = mix(vec3(0.28, 0.34, 0.46), vec3(0.68, 0.82, 1.0), uDark);
          vec3 glassCore = mix(vec3(0.18, 0.20, 0.24), vec3(0.16, 0.24, 0.38), uDark);
          vec3 baseGlass = mix(glassCore, glassRim, rim);
          // Crisp gyral sulcal contour etching on crystal glass
          float gyriRidge = smoothstep(0.55, 0.95, curv) * 0.34;
          float sulciGroove = (1.0 - sulc) * 0.22;
          col = baseGlass + vec3(gyriRidge * mix(0.30, 0.85, uDark));
          alpha = uGlassMix * clamp(0.12 + rim * 0.72 + gyriRidge * 0.25 + sulciGroove * 0.22, 0.11, 0.88);
        }

        // === MODE 0: SPLIT-BRAIN HEMISPHERE TINT (after corpus callosum cut > 0.68) ===
        if (uMode < 0.5) {
          float cutT = smoothstep(0.65, 0.92, uProgress);
          if (cutT > 0.01) {
            bool isLeft = vLocalPos.x < 0.0;
            vec3 hemiTint = isLeft ? COBALT : SIGNAL;
            float rim = (0.14 + fresnel * 0.65) * cutT;
            col = mix(col, hemiTint, 0.85);
            alpha = max(alpha, rim * 0.52);
          }
        }

        // === MODE 1: ATLAS 4-STAGE CHOREOGRAPHY (Cerebellum -> SCAN M1 -> COGITATE IIT/GNWT -> Thalamus) ===
        else if (uMode < 1.5) {
          // Determine stage blend weights smoothly from progress (or explicit focusMode override!)
          float scanW = 0.0;
          float iitW = 0.0;
          float gnwtW = 0.0;

          if (uFocus > 0.5) {
            scanW = (uFocus > 1.5 && uFocus < 2.5) ? 1.0 : 0.0;
            iitW  = (uFocus > 2.5 && uFocus < 3.5) || (uFocus > 4.5) ? 1.0 : 0.0;
            gnwtW = (uFocus > 3.5 && uFocus < 4.5) || (uFocus > 4.5) ? 1.0 : 0.0;
          } else {
            scanW = smoothstep(0.22, 0.32, uProgress) * (1.0 - smoothstep(0.50, 0.58, uProgress));
            iitW  = smoothstep(0.52, 0.62, uProgress);
            gnwtW = smoothstep(0.56, 0.68, uProgress);
          }

          // SCAN M1 ribbon + 3 bilateral fracture hubs (Gordon & Dosenbach, Nature 2023)
          if (scanW > 0.01) {
            float ax = abs(vLocalPos.x);
            float m1Z = 0.04 - ax * 0.22;
            float m1Band = exp(-pow((vLocalPos.z - m1Z) / 0.062, 2.0)) * smoothstep(0.02, 0.14, vLocalPos.y + 0.04);
            vec3 sp = vec3(ax, vLocalPos.y, vLocalPos.z);
            float d1 = length(sp - vec3(0.22, 0.72, 0.01));
            float d2 = length(sp - vec3(0.55, 0.43, -0.08));
            float d3 = length(sp - vec3(0.68, 0.12, -0.11));
            float scanMask = max(exp(-pow(d1 / 0.075, 2.0)), max(exp(-pow(d2 / 0.078, 2.0)), exp(-pow(d3 / 0.075, 2.0))));

            float fracture = uFocus > 1.5 ? 1.0 : smoothstep(0.32, 0.46, uProgress);
            float ribbon = m1Band * (1.0 - smoothstep(0.16, 0.50, scanMask) * fracture * 0.96);
            float hubs = smoothstep(0.14, 0.72, scanMask) * fracture * (0.88 + 0.12 * sin(uTime * 3.5));

            vec3 scanCol = mix(COBALT, SIGNAL, clamp(hubs * 1.4, 0.0, 1.0));
            float mask = clamp(ribbon * 0.85 + hubs * 0.95, 0.0, 1.0) * scanW;
            col = mix(col, scanCol, mask);
            alpha = max(alpha, mask * 0.88);
          }

          // COGITATE 2025: Posterior IIT (Cobalt) vs Anterior GNWT (Signal Red)
          float breath = 0.86 + 0.14 * sin(uTime * 2.6);
          if (iitW > 0.01) {
            float iitZone = smoothstep(0.20, 0.62, vLocalPos.z) * smoothstep(-0.32, 0.12, vLocalPos.y);
            float m = iitZone * iitW * breath;
            col = mix(col, COBALT, m * 0.92);
            alpha = max(alpha, m * 0.65);
          }
          if (gnwtW > 0.01) {
            float gnwtZone = smoothstep(-0.24, -0.62, vLocalPos.z) * smoothstep(-0.26, 0.12, vLocalPos.y);
            float m = gnwtZone * gnwtW * breath;
            col = mix(col, SIGNAL, m * 0.92);
            alpha = max(alpha, m * 0.65);
          }
        }

        // === MODE 2: DARKROOM ICU TMS-EEG PCI* 3D WAVE ===
        // uFocus: 0=Revealed Coma, 1=Revealed CMD, 2=Blind Coma (neutral amber!), 3=Blind CMD (neutral amber!)
        else if (uMode < 2.5) {
          vec3 pz = vec3(0.0, 0.68, 0.42);
          float dist = length(vLocalPos - pz);
          float ring = exp(-pow((dist - 0.085) / 0.015, 2.0)) * 0.72;
          col = mix(col, COBALT, ring);
          alpha = max(alpha, ring * 0.85);

          if (uPulseTime >= 0.0 && uPulseTime < 3.4) {
            bool isBlind = uFocus > 1.5;
            bool isCmdPattern = (uFocus > 0.5 && uFocus < 1.5) || uFocus > 2.5;
            vec3 blindAmber = vec3(0.90, 0.78, 0.48);

            if (!isCmdPattern) {
              // Deep Coma (PCI* = 0.21): stereotypical local thud near Pz
              float r = uPulseTime * 0.52;
              float localW = exp(-pow((dist - r) / 0.10, 2.0)) * exp(-dist * 4.5) * exp(-uPulseTime * 2.3);
              vec3 comaCol = isBlind ? blindAmber : vec3(0.65, 0.72, 0.82);
              col = mix(col, comaCol, clamp(localW * 1.2, 0.0, 1.0));
              alpha = max(alpha, clamp(localW * 0.92, 0.0, 0.92));
            } else {
              // Covert Consciousness CMD (PCI* = 0.44): rich multi-frequency ripple cascading across BOTH hemispheres!
              float front = uPulseTime * 1.38;
              float wave = exp(-pow((dist - front) / 0.11, 2.0)) * exp(-uPulseTime * 0.55);
              float echo = (sin(dist * 15.0 - uTime * 8.5 + curv * 6.5) * 0.5 + 0.5)
                         * smoothstep(front + 0.06, front - 0.38, dist)
                         * exp(-uPulseTime * 0.70) * 0.65;
              float inten = clamp(wave + echo, 0.0, 1.0);
              vec3 revealedCol = mix(EMERALD, SIGNAL, smoothstep(0.52, 1.25, dist) * 0.58);
              vec3 wCol = isBlind ? mix(blindAmber, vec3(0.98, 0.88, 0.64), 0.35) : revealedCol;
              col = mix(col, wCol, inten);
              alpha = max(alpha, inten * 0.92);
            }
          }
        }

        // === MODE 3: CHALMERS FADING QUALIA (Architectural Micro-Voxel Silicon Crystallization!) ===
        else {
          vec3 cell = floor(vLocalPos * 6.8);
          float h = fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
          float rank = clamp((1.0 - (vLocalPos.z + 1.02) / 2.04) * 0.80 + h * 0.20, 0.0, 1.0);

          float isSil = smoothstep(rank - 0.008, rank + 0.008, uProgress) * step(0.005, uProgress);
          float front = exp(-pow((uProgress - rank) / 0.012, 2.0)) * step(0.01, uProgress) * step(uProgress, 0.99);

          // Crisp architectural circuit grid + faceted metallic silicon sheen
          vec3 g = abs(fract(vLocalPos * 18.0 - 0.5) - 0.5) / max(fwidth(vLocalPos * 18.0), vec3(0.001));
          float grid = smoothstep(0.50, 0.96, 1.0 - min(min(g.x, g.y), g.z));

          vec3 flatN = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
          vec3 L = normalize(vec3(0.55, 0.80, 0.55));
          float fDiff = max(dot(flatN, L), 0.0) * 0.75 + 0.25;
          float fSpec = pow(max(dot(flatN, normalize(L + V)), 0.0), 32.0) * 0.45;

          vec3 silCol = SILICON_DARK * fDiff + COBALT * grid * 0.65 + vec3(0.55, 0.72, 1.0) * (fresnel * 0.50 + fSpec);
          col = mix(silCol, SIGNAL, clamp(front * 1.15, 0.0, 1.0));
          alpha = clamp(isSil * 0.97 + front * 0.96, 0.0, 1.0);
        }

        if (alpha < 0.01) discard;
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    depthFunc: THREE.LessEqualDepth,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
}

function createTractMaterial(colorHex: string, speed = 0.8, reverse = false): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(colorHex) },
      uOpacity: { value: 0.9 },
      uSpeed: { value: speed },
      uReverse: { value: reverse ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uSpeed;
      uniform float uReverse;
      varying vec2 vUv;
      void main() {
        float dir = mix(1.0, -1.0, uReverse);
        float t = fract(vUv.x * 2.0 - uTime * uSpeed * dir);
        float pkt = smoothstep(0.58, 0.90, t) * (1.0 - smoothstep(0.90, 1.0, t));
        vec3 col = mix(uColor * 0.7, vec3(1.0, 0.97, 0.92), pkt * 0.82);
        gl_FragColor = vec4(col, uOpacity * (0.28 + pkt * 0.72));
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}

/**
 * NOESIS v10 Showreel 3D Brain Stage:
 * - 122k-triangle hi-res ICBM152 + SUIT Cerebellum + CIT168 Thalamus + Anatomical Brainstem
 * - True Studio PBR (MeshPhysicalMaterial + RoomEnvironment PMREM + ACESFilmicToneMapping + Contact Shadow)
 * - ZERO z-fighting via true 2-Pass Depth Pre-Pass for crystal glass / X-Ray mode!
 * - Smooth Apple-style scroll camera choreography + free OrbitControls (enableZoom=false)
 */
export function NoesisBrainStage3D({
  mode,
  dark = false,
  progress = 0,
  focusMode = 0,
  pulseKey = 0,
  className = 'w-full h-[460px] md:h-[540px]',
  caption,
}: NoesisBrainStage3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [inNear, setInNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [userDragged, setUserDragged] = useState(false);

  const propsRef = useRef({ mode, dark, progress, focusMode, visible, userDragged });
  propsRef.current = { mode, dark, progress, focusMode, visible, userDragged };

  const pulseStartRef = useRef(-999);
  const lastPulseKeyRef = useRef(pulseKey);
  const resetViewRef = useRef<(() => void) | null>(null);
  const dragOriginRef = useRef<{ progress: number; focusMode: number } | null>(null);
  const isPointerDownRef = useRef(false);

  // Auto-release manual orbit when user scrolls meaningfully or switches camera pills,
  // so scroll choreography (Split-Brain separation, SCAN, COGITATE, Thalamus) ALWAYS rotates back into crystal-clear view!
  useEffect(() => {
    if (!userDragged || isPointerDownRef.current || !dragOriginRef.current) return;
    const progDelta = Math.abs(progress - dragOriginRef.current.progress);
    const focusChanged = focusMode !== dragOriginRef.current.focusMode;
    if (progDelta > 0.035 || focusChanged) {
      dragOriginRef.current = null;
      setUserDragged(false);
    }
  }, [progress, focusMode, userDragged]);

  useEffect(() => {
    if (pulseKey !== lastPulseKeyRef.current) {
      lastPulseKeyRef.current = pulseKey;
      pulseStartRef.current = pulseKey > 0 ? performance.now() * 0.001 : -999;
    }
  }, [pulseKey]);

  // Strict +/-100px mount window keeps <= 1 WebGL context alive at chapter boundaries
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(
      ([e]) => setInNear(e.isIntersecting),
      { rootMargin: '120px 0px 120px 0px', threshold: 0 },
    );
    const visObs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { rootMargin: '60px 0px 60px 0px', threshold: 0 },
    );
    nearObs.observe(el);
    visObs.observe(el);
    return () => {
      nearObs.disconnect();
      visObs.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!inNear) return;
    const container = hostRef.current;
    if (!container) return;

    let cancelled = false;
    let rafId = 0;
    let contextLost = false;

    const w = Math.max(240, container.clientWidth);
    const h = Math.max(200, container.clientHeight);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setStatus('error');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = dark ? 1.15 : 1.06;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.cursor = 'grab';
    container.appendChild(canvas);

    const onLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onRestored = () => {
      contextLost = false;
    };
    canvas.addEventListener('webglcontextlost', onLost, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);

    const scene = new THREE.Scene();

    // True Studio IBL Softbox Environment via PMREMGenerator (Museum Sculpture Lighting!)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    // Three-point Leica gallery lighting
    const hemi = new THREE.HemisphereLight(dark ? '#9BB8E8' : '#FFFDF8', dark ? '#111622' : '#B8B1A3', dark ? 0.55 : 0.85);
    const keyLight = new THREE.DirectionalLight('#FFF9EE', dark ? 1.65 : 1.95);
    keyLight.position.set(3.4, 5.2, 3.8);
    const rimLight = new THREE.DirectionalLight('#60A5FA', dark ? 1.1 : 0.65);
    rimLight.position.set(-4.0, 2.2, -3.5);
    const fillLight = new THREE.DirectionalLight('#FDE8D8', dark ? 0.35 : 0.55);
    fillLight.position.set(-2.5, -2.0, 2.8);
    scene.add(hemi, keyLight, rimLight, fillLight);

    const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 30);
    camera.position.set(2.9, 0.55, 2.2);

    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false; // Never hijack Lenis scroll!
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = 0.6;
    controls.target.set(0, -0.05, 0);

    const onStartDrag = () => {
      isPointerDownRef.current = true;
      canvas.style.cursor = 'grabbing';
      setUserDragged(true);
    };
    const onEndDrag = () => {
      isPointerDownRef.current = false;
      canvas.style.cursor = 'grab';
      dragOriginRef.current = {
        progress: propsRef.current.progress,
        focusMode: propsRef.current.focusMode,
      };
    };
    controls.addEventListener('start', onStartDrag);
    controls.addEventListener('end', onEndDrag);

    resetViewRef.current = () => {
      setUserDragged(false);
    };

    const root = new THREE.Group();
    scene.add(root);

    // Soft museum contact shadow underneath the floating 3D brain
    const shadowTex = createContactShadowTexture(dark);
    const shadowGeo = new THREE.PlaneGeometry(2.8, 2.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -0.98, 0.05);
    root.add(shadowPlane);

    // === MATERIALS: TRUE SCULPTURAL PBR + 2-PASS DEPTH PRE-PASS FOR ZERO Z-FIGHTING! ===
    const pbrCortexMat = new THREE.MeshPhysicalMaterial({
      color: dark ? new THREE.Color('#475266') : new THREE.Color('#EAE5D9'),
      vertexColors: true,
      roughness: dark ? 0.48 : 0.44,
      metalness: dark ? 0.12 : 0.02,
      clearcoat: dark ? 0.25 : 0.22,
      clearcoatRoughness: 0.38,
      sheen: 0.28,
      sheenColor: new THREE.Color(dark ? '#94A3B8' : '#FAF9F5'),
      envMapIntensity: dark ? 0.85 : 0.56,
    });

    // Invisible Transparent Depth Pre-Pass Material:
    // Because transparent=true & renderOrder=10, it runs AFTER internal tracts (renderOrder=4)
    // and writes ONLY the front-most outer cortex surface depth -> 0% torn interior tris & 100% visible glass + tracts!
    const depthPrepassMat = new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
      transparent: true,
      opacity: 0.0,
      side: THREE.FrontSide,
    });

    const glassOverlayMat = createGlassOverlayMaterial(dark);

    const cerebMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(dark ? '#384358' : '#E3DDD0'),
      vertexColors: true,
      roughness: 0.50,
      metalness: 0.04,
      clearcoat: 0.16,
      envMapIntensity: 0.72,
    });

    const stemMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(dark ? '#353E50' : '#E7E2D6'),
      vertexColors: true,
      roughness: 0.54,
      metalness: 0.02,
      clearcoat: 0.12,
      envMapIntensity: 0.65,
    });

    const subcortexMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FC4109'),
      emissive: new THREE.Color('#FC4109'),
      emissiveIntensity: 0.32,
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.08,
      clearcoat: 0.35,
    });

    // Hemisphere containers (so in 'split' mode they literally glide apart in 3D!)
    const leftGroup = new THREE.Group();
    const rightGroup = new THREE.Group();
    root.add(leftGroup, rightGroup);

    // Corpus Callosum (20 glowing commissural arches split cleanly at midline so they physically sever at Stage 3!)
    const callosumLeftGroup = new THREE.Group();
    const callosumRightGroup = new THREE.Group();
    const tractGeos: THREE.BufferGeometry[] = [];
    const tractMats: THREE.ShaderMaterial[] = [];

    if (mode === 'split') {
      for (let i = 0; i < 20; i += 1) {
        const z = -0.46 + (i / 19) * 0.88;
        const archY = 0.18 + Math.sin((i / 19) * Math.PI) * 0.18;
        const colorHex = i % 2 === 0 ? '#004EDF' : '#FC4109';
        const spd = 0.55 + (i % 4) * 0.15;
        const rev = i % 3 === 0;

        const leftCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.34, archY - 0.05, z),
          new THREE.Vector3(-0.17, archY + 0.035, z),
          new THREE.Vector3(0.0, archY + 0.06, z),
        ]);
        const rightCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.0, archY + 0.06, z),
          new THREE.Vector3(0.17, archY + 0.035, z),
          new THREE.Vector3(0.34, archY - 0.05, z),
        ]);

        const gL = new THREE.TubeGeometry(leftCurve, 16, 0.0085, 6, false);
        const gR = new THREE.TubeGeometry(rightCurve, 16, 0.0085, 6, false);
        const mat = createTractMaterial(colorHex, spd, rev);
        tractGeos.push(gL, gR);
        tractMats.push(mat);
        callosumLeftGroup.add(new THREE.Mesh(gL, mat));
        callosumRightGroup.add(new THREE.Mesh(gR, mat));
      }
      root.add(callosumLeftGroup, callosumRightGroup);
    }

    // Long-range recurrent / thalamocortical fiber arcs for 'atlas' mode
    const atlasTractsGroup = new THREE.Group();
    if (mode === 'atlas') {
      const specs: Array<{ pts: [number, number, number][]; col: string; spd: number; rev?: boolean }> = [
        // 0..3: Recurrent cortical loops
        { pts: [[-0.26, 0.32, -0.68], [-0.42, 0.56, -0.05], [-0.26, 0.32, 0.64]], col: '#FC4109', spd: 0.72 },
        { pts: [[0.26, 0.32, -0.68], [0.42, 0.56, -0.05], [0.26, 0.32, 0.64]], col: '#FC4109', spd: 0.76, rev: true },
        { pts: [[-0.44, 0.08, -0.42], [-0.48, 0.28, 0.14], [-0.34, 0.10, 0.70]], col: '#FC4109', spd: 0.64, rev: true },
        { pts: [[0.44, 0.08, -0.42], [0.48, 0.28, 0.14], [0.34, 0.10, 0.70]], col: '#FC4109', spd: 0.68 },
        // 4..5: Thalamus <-> Posterior IIT (Cobalt)
        { pts: [[-0.10, 0.0, 0.02], [-0.22, 0.18, 0.42], [-0.20, 0.12, 0.74]], col: '#004EDF', spd: 0.85 },
        { pts: [[0.10, 0.0, 0.02], [0.22, 0.18, 0.42], [0.20, 0.12, 0.74]], col: '#004EDF', spd: 0.82, rev: true },
        // 6..7: Thalamus <-> Frontal GNWT (Signal Red)
        { pts: [[-0.10, 0.02, -0.04], [-0.24, 0.22, -0.38], [-0.20, 0.14, -0.74]], col: '#FC4109', spd: 0.88 },
        { pts: [[0.10, 0.02, -0.04], [0.24, 0.22, -0.38], [0.20, 0.14, -0.74]], col: '#FC4109', spd: 0.84, rev: true },
        // 8..9: Emerald longitudinal bridge
        { pts: [[-0.32, 0.34, 0.56], [-0.38, 0.44, 0.0], [-0.28, 0.28, -0.60]], col: '#34D399', spd: 0.62 },
        { pts: [[0.32, 0.34, 0.56], [0.38, 0.44, 0.0], [0.28, 0.28, -0.60]], col: '#34D399', spd: 0.62, rev: true },
      ];
      for (const s of specs) {
        const c = new THREE.CatmullRomCurve3(s.pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
        const g = new THREE.TubeGeometry(c, 32, 0.013, 6, false);
        const m = createTractMaterial(s.col, s.spd, Boolean(s.rev));
        tractGeos.push(g);
        tractMats.push(m);
        const tractMesh = new THREE.Mesh(g, m);
        tractMesh.renderOrder = 4;
        atlasTractsGroup.add(tractMesh);
      }
      root.add(atlasTractsGroup);
    }

    // Surgical laser plane in 'split' mode (briefly sweeps down the midline when commissure is cut!)
    const cutLineGeo = new THREE.PlaneGeometry(0.012, 1.85);
    const cutLineMat = new THREE.MeshBasicMaterial({
      color: '#FC4109',
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cutLineMesh = new THREE.Mesh(cutLineGeo, cutLineMat);
    cutLineMesh.rotation.y = Math.PI / 2;
    if (mode === 'split') root.add(cutLineMesh);

    let pbrLeft: THREE.Mesh | null = null;
    let pbrRight: THREE.Mesh | null = null;
    let preLeft: THREE.Mesh | null = null;
    let preRight: THREE.Mesh | null = null;
    let ovLeft: THREE.Mesh | null = null;
    let ovRight: THREE.Mesh | null = null;
    let cerebMesh: THREE.Mesh | null = null;
    let stemMesh: THREE.Mesh | null = null;
    let subMesh: THREE.Mesh | null = null;

    loadHiResBrainGeometries()
      .then((geos) => {
        if (cancelled) return;

        // Opaque PBR porcelain cortex meshes
        pbrLeft = new THREE.Mesh(geos.cortexLeft, pbrCortexMat);
        pbrRight = new THREE.Mesh(geos.cortexRight, pbrCortexMat);

        // 2-Pass depth pre-pass meshes (enabled when crystal glass mode is active -> 0% z-fighting!)
        preLeft = new THREE.Mesh(geos.cortexLeft, depthPrepassMat);
        preRight = new THREE.Mesh(geos.cortexRight, depthPrepassMat);
        preLeft.renderOrder = 10;
        preRight.renderOrder = 10;

        // Overlay / Crystal glass meshes (rendered cleanly on top of PBR OR cleanly after depth pre-pass!)
        ovLeft = new THREE.Mesh(geos.cortexLeft, glassOverlayMat);
        ovRight = new THREE.Mesh(geos.cortexRight, glassOverlayMat);
        ovLeft.renderOrder = 11;
        ovRight.renderOrder = 11;

        leftGroup.add(pbrLeft, preLeft, ovLeft);
        rightGroup.add(pbrRight, preRight, ovRight);

        cerebMesh = new THREE.Mesh(geos.cerebellum, cerebMat);
        stemMesh = new THREE.Mesh(geos.brainstem, stemMat);
        subMesh = new THREE.Mesh(geos.subcortex, subcortexMat);
        subMesh.renderOrder = 2;
        cerebMesh.renderOrder = 3;
        stemMesh.renderOrder = 3;
        atlasTractsGroup.renderOrder = 4;

        root.add(subMesh, cerebMesh, stemMesh);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    const resizeObs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const rw = Math.max(200, Math.floor(e.contentRect.width));
      const rh = Math.max(180, Math.floor(e.contentRect.height));
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh, false);
    });
    resizeObs.observe(container);

    const startSec = performance.now() * 0.001;
    const desiredCam = new THREE.Vector3(2.9, 0.55, 2.2);
    const modeIdx = mode === 'split' ? 0 : mode === 'atlas' ? 1 : mode === 'tms' ? 2 : 3;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (contextLost || !propsRef.current.visible) return;

      const now = performance.now() * 0.001;
      const elapsed = now - startSec;
      const { progress: p, focusMode: fm, dark: isDark, userDragged: dragged } = propsRef.current;
      const pulseAge = pulseStartRef.current > 0 ? now - pulseStartRef.current : -1;

      glassOverlayMat.uniforms.uTime.value = elapsed;
      glassOverlayMat.uniforms.uMode.value = modeIdx;
      glassOverlayMat.uniforms.uProgress.value = p;
      glassOverlayMat.uniforms.uFocus.value = fm;
      glassOverlayMat.uniforms.uPulseTime.value = pulseAge;
      glassOverlayMat.uniforms.uDark.value = isDark ? 1 : 0;

      // Subtle living gallery float (microscopic breathing, NEVER cheap dizzy spinning!)
      root.position.y = Math.sin(elapsed * 0.85) * 0.018;

      let glassMode = false;

      if (mode === 'split') {
        // Split-Brain 3D choreography: hemispheres glide smoothly apart on scroll — cleanly framed with zero edge crop!
        const sep = THREE.MathUtils.smoothstep(p, 0.12, 0.72) * 0.31;
        leftGroup.position.x = -sep;
        rightGroup.position.x = sep;
        leftGroup.rotation.y = sep * 0.16;
        rightGroup.rotation.y = -sep * 0.16;

        // Corpus callosum arches stretch intact until Frame 2/3 ("РАССЕЧЕНИЕ", p = 0.48..0.66), then physically snap open!
        const severed = THREE.MathUtils.smoothstep(p, 0.48, 0.66);
        const intactStretch = 1 + sep * (1.85 * (1 - severed));
        callosumLeftGroup.scale.x = Math.max(0.45, intactStretch - severed * 0.72);
        callosumRightGroup.scale.x = Math.max(0.45, intactStretch - severed * 0.72);
        callosumLeftGroup.position.x = -sep * severed * 1.15;
        callosumRightGroup.position.x = sep * severed * 1.15;
        callosumLeftGroup.visible = true;
        callosumRightGroup.visible = true;
        for (const tm of tractMats) {
          tm.uniforms.uTime.value = elapsed;
          tm.uniforms.uOpacity.value = 0.96 - severed * 0.44;
        }
        // Subtle laser sweep right during Frame 2/3 ("РАССЕЧЕНИЕ", peak at p = 0.58)
        const cutPeak = Math.exp(-Math.pow((p - 0.58) / 0.075, 2));
        cutLineMat.opacity = cutPeak * 0.80;
        cutLineMesh.position.y = THREE.MathUtils.lerp(0.68, -0.15, THREE.MathUtils.clamp((p - 0.46) / 0.24, 0, 1));

        if (subMesh) subMesh.visible = false;
        if (cerebMesh) cerebMesh.visible = true;
        if (stemMesh) stemMesh.visible = true;

        // Dorso-posterior framing: Left Hemisphere (Cobalt) stays strictly on viewer's LEFT, Right (Signal Red) on viewer's RIGHT!
        desiredCam.set(
          THREE.MathUtils.lerp(-1.35, 0.0, THREE.MathUtils.smoothstep(p, 0.05, 0.62)),
          THREE.MathUtils.lerp(1.05, 1.75, THREE.MathUtils.smoothstep(p, 0.1, 0.75)),
          THREE.MathUtils.lerp(3.65, 3.95, p),
        );
      } else if (mode === 'atlas') {
        // Continuous 4-Act Apple-Class 3D Brain Choreography!
        // Stage 1 (0..0.28): Cerebellum 69B (Glass cortex + Cobalt Cerebellum + Red recurrent loops)
        // Stage 2 (0.28..0.55): SCAN M1 (Opaque porcelain cortex + Cobalt->Red M1 fracture)
        // Stage 3 (0.55..0.78): COGITATE IIT vs GNWT (Glass cortex + Posterior Blue vs Frontal Red)
        // Stage 4 (0.78..1.0): High-Order Thalamus Science 2025 (Crystal glass + pulsing center Thalamus!)
        const effStage =
          fm === 1 ? 0.12 : fm === 2 ? 0.42 : fm === 3 ? 0.64 : fm === 4 ? 0.72 : fm === 5 ? 0.94 : p;

        const isCerebStage = effStage < 0.28;
        const isScanStage = effStage >= 0.28 && effStage < 0.55;
        const isCogStage = effStage >= 0.55;

        glassMode = isCerebStage || isCogStage;

        // Cobalt highlight on Cerebellum during Stage 1, warm alabaster otherwise!
        if (isCerebStage) {
          cerebMat.color.set('#004EDF');
          cerebMat.emissive.set('#002888');
          cerebMat.emissiveIntensity = 0.28 + 0.14 * Math.sin(elapsed * 3.0);
        } else {
          cerebMat.color.set(isDark ? '#384358' : '#E3DDD0');
          cerebMat.emissive.set('#000000');
          cerebMat.emissiveIntensity = 0;
        }

        // Thalamus pulsing in theta rhythm (2-8 Hz, Science Apr 2025) during Stage 3-4!
        if (subMesh) {
          subMesh.visible = isCogStage || isCerebStage;
          const thetaPulse = 0.5 + 0.5 * Math.sin(elapsed * (effStage > 0.78 ? 8.5 : 3.5));
          subcortexMat.emissiveIntensity = effStage > 0.78 ? 0.45 + thetaPulse * 0.65 : 0.18;
        }

        // Animate internal tracts by stage
        for (let i = 0; i < tractMats.length; i += 1) {
          const tm = tractMats[i];
          tm.uniforms.uTime.value = elapsed;
          if (i < 4) {
            tm.uniforms.uOpacity.value = isCerebStage ? 0.94 : 0.0;
          } else if (i < 6) {
            tm.uniforms.uOpacity.value = isCogStage && fm !== 4 ? 0.90 : 0.0;
          } else if (i < 8) {
            tm.uniforms.uOpacity.value = isCogStage && fm !== 3 ? 0.90 : 0.0;
          } else {
            tm.uniforms.uOpacity.value = effStage > 0.75 ? 0.90 : 0.0;
          }
        }
        atlasTractsGroup.visible = !isScanStage;

        // Smooth museum camera keyframes keeping the ENTIRE brain silhouette framed with breathing room!
        if (isCerebStage) {
          desiredCam.set(3.05, 0.42, 2.55); // Rear-lateral: Crystal Glass Cortex + Cobalt Cerebellum + Red loops!
        } else if (isScanStage) {
          desiredCam.set(2.35, 2.58, -1.55); // Elevated lateral-superior view showcasing ALL 3 crimson SCAN hubs along M1!
        } else if (effStage < 0.78) {
          desiredCam.set(3.65, 0.48, 0.25); // Clean full lateral profile: Posterior IIT (+Z) <-> Frontal GNWT (-Z)
        } else {
          desiredCam.set(3.20, 0.78, -1.55); // Hero 3/4 Crystal Glass peering straight at pulsing central Thalamus!
        }
      } else if (mode === 'tms') {
        glassMode = false;
        if (subMesh) subMesh.visible = false;
        desiredCam.set(2.85, 2.55, 2.55);
      } else {
        // 'silicon': Chalmers Fading Qualia — solid sculptural PBR transitioning cleanly to faceted dark silicon!
        glassMode = false;
        if (subMesh) subMesh.visible = false;
        desiredCam.set(
          THREE.MathUtils.lerp(2.95, 2.55, p),
          THREE.MathUtils.lerp(0.68, 0.92, p),
          THREE.MathUtils.lerp(-2.15, -2.40, p),
        );
      }

      // Toggle between Solid Sculptural PBR and ZERO-Z-FIGHTING 2-Pass Crystal Glass!
      // CRITICAL: Keep depthFunc = THREE.LessEqualDepth (with polygonOffset=-1 on glassOverlayMat)
      // so the front-most shell passes cleanly while all interior folds behind preLeft/preRight are rejected!
      if (pbrLeft && pbrRight && preLeft && preRight) {
        pbrLeft.visible = !glassMode;
        pbrRight.visible = !glassMode;
        preLeft.visible = glassMode;
        preRight.visible = glassMode;
      }
      glassOverlayMat.uniforms.uGlassMix.value = glassMode ? 1.0 : 0.0;
      glassOverlayMat.depthFunc = THREE.LessEqualDepth;

      // Gently guide camera along scroll choreography unless user is actively dragging manually!
      if (!dragged) {
        camera.position.lerp(desiredCam, 0.088);
      }
      controls.update();
      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      controls.removeEventListener('start', onStartDrag);
      controls.removeEventListener('end', onEndDrag);
      controls.dispose();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);

      pbrCortexMat.dispose();
      depthPrepassMat.dispose();
      glassOverlayMat.dispose();
      cerebMat.dispose();
      stemMat.dispose();
      subcortexMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      cutLineGeo.dispose();
      cutLineMat.dispose();
      tractGeos.forEach((g) => g.dispose());
      tractMats.forEach((m) => m.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) container.removeChild(canvas);
      resetViewRef.current = null;
    };
  }, [inNear, mode, dark]);

  return (
    <div
      ref={hostRef}
      className={`relative select-none overflow-hidden ${className}`}
      role="img"
      aria-label="Высокодетализированная 3D МРТ-модель мозга человека (ICBM152 + SUIT + CIT168)"
    >
      {status === 'loading' && (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center font-mono-tech text-[10.5px] uppercase tracking-[0.14em] ${
            dark ? 'text-[#9AA3B2]' : 'text-[#5E5D59]'
          }`}
        >
          Загрузка 3D МРТ-атласа высокого разрешения…
        </div>
      )}

      {status === 'error' && (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center font-mono-tech text-[11px] ${
            dark ? 'text-[#FCA5A5]' : 'text-[#B91C1C]'
          }`}
        >
          WebGL недоступен на этом устройстве.
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
        <span
          className={`font-mono-tech text-[9.5px] uppercase tracking-[0.11em] px-2.5 py-1 rounded-full ${
            dark
              ? 'bg-[#0B0E14]/75 text-[#A4AEBE] border border-[#FAF9F5]/12'
              : 'bg-[#FAF9F5]/88 text-[#5E5D59] border border-[#141413]/12'
          }`}
        >
          {caption ?? '3D МРТ ICBM152 · 122K ТРЕУГ. · ПЕРЕТАЩИТЕ ДЛЯ ВРАЩЕНИЯ'}
        </span>

        {userDragged && (
          <button
            type="button"
            onClick={() => resetViewRef.current?.()}
            className={`pointer-events-auto v6-pill px-3 py-1 rounded-full font-mono-tech text-[9.5px] uppercase tracking-[0.1em] inline-flex items-center gap-1 cursor-pointer ${
              dark
                ? 'bg-[#1A202C]/90 text-[#FAF9F5] border border-[#FAF9F5]/18 hover:bg-[#252D3D]'
                : 'bg-[#FAF9F5]/95 text-[#141413] border border-[#141413]/18 hover:bg-[#ECE9DF]'
            }`}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Авторакурс</span>
          </button>
        )}
      </div>
    </div>
  );
}
