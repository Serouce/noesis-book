import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface LeibnizMillCanvasProps {
  /** 0..1 scroll progress: 0=blind physical atoms -> 0.5=Leibniz's giant spinning mechanical mill -> 1.0=first-person inner light focus */
  progress: number;
  className?: string;
}

function createGearRingGeometry(radius: number, teeth: number, toothDepth: number): THREE.BufferGeometry {
  const pts: number[] = [];
  const segs = teeth * 8;
  for (let i = 0; i <= segs; i += 1) {
    const a = (i / segs) * Math.PI * 2;
    const phase = (a * teeth) % (Math.PI * 2);
    const r = phase < Math.PI * 0.9 ? radius + toothDepth : radius;
    pts.push(Math.cos(a) * r, Math.sin(a) * r, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

/**
 * Full-screen WebGL Shader Scene #1: "Leibniz's Mill (1714)" — Showreel Luminous Edition
 * 4,200 crisp starlight GPU particles + 4 counter-rotating architectural etched cog-rings morph seamlessly on scroll:
 * - State A (p=0.0): Chaotic physical matter & electrical micro-spikes in pitch dark
 * - State B (p=0.5): Luminous counter-rotating interlocking mechanical gear rings of Leibniz's giant brain-mill
 * - State C (p=1.0): Coherent radiant vermilion-gold inner light iris ("first-person subjective light")
 */
export function LeibnizMillCanvas({ progress, className = 'w-full h-full' }: LeibnizMillCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const progRef = useRef(progress);
  progRef.current = progress;

  const [inNear, setInNear] = useState(false);
  const visRef = useRef(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(
      ([e]) => setInNear(e.isIntersecting),
      { rootMargin: '120px 0px 120px 0px', threshold: 0 },
    );
    const visObs = new IntersectionObserver(
      ([e]) => {
        visRef.current = e.isIntersecting;
      },
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

    const w = Math.max(240, container.clientWidth);
    const h = Math.max(200, container.clientHeight);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    const isCompactDevice = w < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isCompactDevice ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    let contextLost = false;
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
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 45);
    camera.position.set(0, 0, 7.6);

    const stage = new THREE.Group();
    scene.add(stage);

    const COUNT = isCompactDevice ? 2400 : 4200;
    const posChaos = new Float32Array(COUNT * 3);
    const posMill = new Float32Array(COUNT * 3);
    const posFocus = new Float32Array(COUNT * 3);
    const aSeed = new Float32Array(COUNT);
    const aRing = new Float32Array(COUNT);
    const aRingMeta = new Float32Array(COUNT * 2);

    let s = 17140826;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };

    const ringSpecs = [
      { r: 0.92, teeth: 12, tilt: 0.12, zOff: 0.45 },
      { r: 1.54, teeth: 18, tilt: -0.32, zOff: -0.15 },
      { r: 2.18, teeth: 24, tilt: 0.28, zOff: -0.45 },
      { r: 2.82, teeth: 32, tilt: -0.18, zOff: 0.15 },
    ];

    for (let i = 0; i < COUNT; i += 1) {
      // State A: Expansive physical atom cloud
      const u = rnd() * Math.PI * 2;
      const v = Math.acos(2 * rnd() - 1);
      const rad = 0.8 + Math.pow(rnd(), 0.58) * 3.8;
      posChaos[i * 3] = rad * Math.sin(v) * Math.cos(u);
      posChaos[i * 3 + 1] = rad * Math.sin(v) * Math.sin(u) * 0.78;
      posChaos[i * 3 + 2] = rad * Math.cos(v) * 1.1;

      // State B: 4 Crisp Interlocking Mechanical Gear Rings (flat local XY; shader applies Rz then Rx(tilt) + zOff!)
      const ringId = i % 4;
      const spec = ringSpecs[ringId];
      aRing[i] = ringId;
      aRingMeta[i * 2] = spec.tilt;
      aRingMeta[i * 2 + 1] = spec.zOff;
      const ang = (i / (COUNT / 4)) * Math.PI * 2 + rnd() * 0.06;
      const toothPhase = (ang * spec.teeth) % (Math.PI * 2);
      const toothWave = toothPhase < Math.PI * 0.9 ? 0.16 : 0.0;
      const rM = spec.r + toothWave + (rnd() - 0.5) * 0.09;
      posMill[i * 3] = Math.cos(ang) * rM;
      posMill[i * 3 + 1] = Math.sin(ang) * rM;
      posMill[i * 3 + 2] = 0;

      // State C: Coherent First-Person Inner Light Sphere / Iris Aperture
      const phi = Math.acos(1 - (2 * (i + 0.5)) / COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const sr = 1.62 + (rnd() - 0.5) * 0.06;
      posFocus[i * 3] = sr * Math.sin(phi) * Math.cos(theta);
      posFocus[i * 3 + 1] = sr * Math.sin(phi) * Math.sin(theta);
      posFocus[i * 3 + 2] = sr * Math.cos(phi);

      aSeed[i] = rnd();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posChaos, 3));
    geo.setAttribute('aPosMill', new THREE.BufferAttribute(posMill, 3));
    geo.setAttribute('aPosFocus', new THREE.BufferAttribute(posFocus, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
    geo.setAttribute('aRing', new THREE.BufferAttribute(aRing, 1));
    geo.setAttribute('aRingMeta', new THREE.BufferAttribute(aRingMeta, 2));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPixelRatio: { value: dpr },
        uPointScale: { value: 1.0 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aPosMill;
        attribute vec3 aPosFocus;
        attribute float aSeed;
        attribute float aRing;
        attribute vec2 aRingMeta;

        uniform float uTime;
        uniform float uProgress;
        uniform float uPixelRatio;
        uniform float uPointScale;

        varying float vGlow;
        varying float vPhaseMill;
        varying float vPhaseFocus;
        varying float vSeed;
        varying float vRing;

        // Column-major GLSL counter-clockwise rotation (+a matches Three.js Euler XYZ rotation!)
        mat2 rot2(float a) {
          float c = cos(a), s = sin(a);
          return mat2(c, s, -s, c);
        }

        void main() {
          float p1 = smoothstep(0.06, 0.46, uProgress);
          float p2 = smoothstep(0.56, 0.94, uProgress);

          // Mechanical counter-rotation coplanar with THREE.Line gear rings (Rz -> Rx(tilt) -> +zOff)
          vec3 mill = aPosMill;
          float dir = mod(aRing, 2.0) < 0.5 ? 1.0 : -1.0;
          mill.xy = rot2(uTime * 0.28 * dir / (1.0 + aRing * 0.22)) * mill.xy;
          mill.yz = rot2(aRingMeta.x) * mill.yz;
          mill.z += aRingMeta.y;

          // Gentle physical drift in Chaos state
          vec3 chaos = position;
          chaos.x += sin(uTime * 0.55 + aSeed * 12.0) * 0.16;
          chaos.y += cos(uTime * 0.45 + aSeed * 9.0) * 0.16;

          // Radiant breathing in Inner Light Focus sphere
          vec3 focus = aPosFocus * (1.0 + 0.04 * sin(uTime * 2.1 + aSeed * 6.28));
          focus.xz = rot2(uTime * 0.18) * focus.xz;

          vec3 pos = mix(mix(chaos, mill, p1), focus, p2);
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;

          float baseSz = mix(18.0, 32.0, pow(aSeed, 1.4)) * uPointScale;
          gl_PointSize = clamp((baseSz * uPixelRatio) / max(-mv.z, 1.2), 2.2, 13.5 * uPointScale);
          vGlow = 0.62 + 0.38 * sin(uTime * 2.8 + aSeed * 25.0);
          vPhaseMill = p1 * (1.0 - p2);
          vPhaseFocus = p2;
          vSeed = aSeed;
          vRing = aRing;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vGlow;
        varying float vPhaseMill;
        varying float vPhaseFocus;
        varying float vSeed;
        varying float vRing;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          // Crisp starlight core + luminous optical halo
          float core = smoothstep(0.32, 0.05, d);
          float halo = pow(1.0 - d * 2.0, 1.55) * 0.72;
          float alpha = clamp(core + halo, 0.0, 1.0);

          vec3 silver   = vec3(0.82, 0.87, 0.96);
          vec3 cobalt   = vec3(0.24, 0.58, 1.00);
          vec3 vermil   = vec3(1.00, 0.34, 0.09);
          vec3 gold     = vec3(1.00, 0.90, 0.68);

          vec3 col = mix(silver, cobalt, step(0.45, vSeed) * 0.78);
          // Highlight alternating mill rings in crisp Leica cobalt + signal red accents!
          if (vPhaseMill > 0.01) {
            vec3 millCol = mod(vRing, 2.0) < 0.5 ? mix(silver, cobalt, 0.65) : mix(silver, vermil, step(0.68, vSeed) * 0.85);
            col = mix(col, millCol, vPhaseMill);
          }
          // Ignite into luminous warm gold + signal red at Inner Light stage!
          col = mix(col, mix(gold, vermil, step(0.58, vSeed)), vPhaseFocus);

          gl_FragColor = vec4(col, alpha * (0.68 + 0.32 * vGlow));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    stage.add(points);

    // 4 Crisp Etched Architectural Wireframe Cog-Rings (Leica / Swiss Blueprint Optics!)
    const gearMeshes: Array<{ mesh: THREE.Line; mat: THREE.LineBasicMaterial; speed: number }> = [];
    const disposables: Array<{ dispose: () => void }> = [geo, mat];

    ringSpecs.forEach((spec, idx) => {
      const gGeo = createGearRingGeometry(spec.r, spec.teeth, 0.16);
      const gMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? '#5EA1FF' : '#FC4109',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(gGeo, gMat);
      line.rotation.x = spec.tilt;
      line.position.z = spec.zOff;
      stage.add(line);
      gearMeshes.push({ mesh: line, mat: gMat, speed: (idx % 2 === 0 ? 1 : -1) * (0.28 / (1 + idx * 0.22)) });
      disposables.push(gGeo, gMat);
    });

    // Inner-light luminous optical iris ring (ignites in State C)
    const irisGeo = new THREE.TorusGeometry(1.66, 0.012, 10, 128);
    const irisMat = new THREE.MeshBasicMaterial({
      color: '#FC4109',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const irisMesh = new THREE.Mesh(irisGeo, irisMat);
    stage.add(irisMesh);
    disposables.push(irisGeo, irisMat);

    // Core inner-light radial glow sprite (gives true museum cinema presence at center of Mill / Focus!)
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const gCtx = glowCanvas.getContext('2d');
    if (gCtx) {
      const grad = gCtx.createRadialGradient(64, 64, 2, 64, 64, 62);
      grad.addColorStop(0, 'rgba(255, 240, 210, 0.95)');
      grad.addColorStop(0.28, 'rgba(252, 65, 9, 0.45)');
      grad.addColorStop(0.65, 'rgba(0, 78, 223, 0.16)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      gCtx.fillStyle = grad;
      gCtx.fillRect(0, 0, 128, 128);
    }
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowSprite = new THREE.Sprite(glowMat);
    glowSprite.scale.set(4.4, 4.4, 1);
    stage.add(glowSprite);
    disposables.push(glowTex, glowMat);

    const updateLayoutOffset = (rw: number, rh: number) => {
      const aspect = rw / rh;
      if (rw >= 1024) {
        // Matches Tailwind `lg:` desktop split: typography left, luminous 3D sculpture right!
        const desktopScale = aspect < 1.25 ? 0.84 : 1.0;
        stage.position.set(aspect < 1.25 ? 1.32 : 1.55, 0, 0);
        stage.scale.setScalar(desktopScale);
        mat.uniforms.uPointScale.value = 1.0;
      } else if (aspect > 1.2) {
        // Landscape phone / compact tablet (< 1024px): keep sculpture centered in upper-right clear zone
        stage.position.set(0.85, 0.35, 0);
        stage.scale.setScalar(0.58);
        mat.uniforms.uPointScale.value = 0.82;
      } else {
        // Portrait Mobile: frame ALL 4 cog-rings 100% inside 390px width with generous black air under top kicker!
        stage.position.set(0, 0.44, 0);
        stage.scale.setScalar(0.37);
        mat.uniforms.uPointScale.value = 0.68;
      }
    };
    updateLayoutOffset(w, h);

    const resizeObs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const rw = Math.max(200, Math.floor(e.contentRect.width));
      const rh = Math.max(180, Math.floor(e.contentRect.height));
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh, false);
      updateLayoutOffset(rw, rh);
    });
    resizeObs.observe(container);

    let rafId = 0;
    const t0 = performance.now() * 0.001;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!visRef.current || contextLost) return;

      const t = performance.now() * 0.001 - t0;
      const p = THREE.MathUtils.clamp(progRef.current, 0, 1);

      mat.uniforms.uTime.value = t;
      mat.uniforms.uProgress.value = p;

      const millVis = THREE.MathUtils.smoothstep(p, 0.14, 0.42) * (1 - THREE.MathUtils.smoothstep(p, 0.62, 0.88));
      gearMeshes.forEach((gm, idx) => {
        gm.mesh.rotation.z = t * gm.speed;
        gm.mat.opacity = millVis * (idx % 2 === 0 ? 0.68 : 0.48);
      });

      const focusVis = THREE.MathUtils.smoothstep(p, 0.58, 0.94);
      irisMat.opacity = focusVis * 0.78;
      irisMesh.rotation.z = t * 0.14;
      irisMesh.rotation.y = Math.sin(t * 0.45) * 0.22;

      // Keep the core crystalline & tight during Mill stage (ZERO muddy grey blob!), igniting cleanly at Stage 3 Focus!
      glowMat.opacity = 0.08 + focusVis * 0.72;
      const pulse = 1.45 + Math.sin(t * 1.8) * 0.14 + focusVis * 2.1;
      glowSprite.scale.set(pulse, pulse, 1);

      // Gentle 3D parallax pitch so interlocking cog rings read with true architectural depth
      stage.rotation.y = Math.sin(t * 0.22) * 0.18 - 0.16;
      stage.rotation.x = Math.cos(t * 0.18) * 0.08 + 0.12;

      // Smooth cinematic camera glide
      camera.position.z = THREE.MathUtils.lerp(7.6, 5.9, Math.sin(p * Math.PI * 0.85));
      camera.position.y = Math.sin(t * 0.35) * 0.14;
      camera.lookAt(stage.position.x * 0.18, 0, 0);

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, [inNear]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
