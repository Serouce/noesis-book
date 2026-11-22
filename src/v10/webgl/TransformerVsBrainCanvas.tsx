import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface TransformerVsBrainCanvasProps {
  /**
   * 0..1 scroll progress:
   * - 0.00..0.34: Transformer 2026 (6 crisp vertical attention layers, one-way left->right forward pass that dies into darkness)
   * - 0.34..0.68: Anthropic SAE & Circuit Tracing (7 luminous monosemantic concept constellations suspended in dark latent space)
   * - 0.68..1.00: Living Conscious Mind (4,200 particles fold into a radiant self-sustaining 3D recurrent feedback torus!)
   */
  progress: number;
  className?: string;
}

/**
 * Full-bleed WebGL Cinema Scene #2 (Act IV Visual Rhyme to Leibniz's Mill in Act I!):
 * 4,200 GPU particles + architectural wireframe layer frames + luminous concept attribution rays + recurrent torus rings.
 */
export function TransformerVsBrainCanvas({
  progress,
  className = 'w-full h-full',
}: TransformerVsBrainCanvasProps) {
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

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 45);
    camera.position.set(0, 0.35, 7.6);

    const stage = new THREE.Group();
    scene.add(stage);

    const COUNT = 4200;
    const posLayers = new Float32Array(COUNT * 3);
    const posClusters = new Float32Array(COUNT * 3);
    const posTorus = new Float32Array(COUNT * 3);
    const aSeed = new Float32Array(COUNT);
    const aLayer = new Float32Array(COUNT); // 0..1 normalized X across transformer layers
    const aFlow = new Float32Array(COUNT); // angle along torus loop

    let s = 20250430;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };

    // 7 Monosemantic SAE Feature Hubs ("Golden Gate", "Rhyme", "Logic", "Self-Monitor", "Tone", "Memory", "Code")
    const clusterCenters: Array<[number, number, number]> = [
      [-1.75, 0.85, 0.35],
      [-1.10, -0.95, -0.45],
      [0.0, 1.25, -0.25],
      [0.15, -0.08, 0.55], // Central highlighted "Golden Gate / Introspection" hub!
      [1.35, 0.92, -0.35],
      [1.65, -0.82, 0.25],
      [-0.35, -1.25, 0.15],
    ];

    const LAYER_COUNT = 6;

    for (let i = 0; i < COUNT; i += 1) {
      // === STATE 1: 6 CRISP TRANSFORMER MATRIX LAYERS (Feed-Forward One-Way Stack) ===
      const layerIdx = i % LAYER_COUNT;
      const lx = -2.05 + (layerIdx / (LAYER_COUNT - 1)) * 4.10;
      const row = Math.floor(rnd() * 14);
      const col = Math.floor(rnd() * 12);
      const ly = -1.36 + (row / 13) * 2.72 + (rnd() - 0.5) * 0.06;
      const lz = -1.12 + (col / 11) * 2.24 + (rnd() - 0.5) * 0.06;
      posLayers[i * 3] = lx + (rnd() - 0.5) * 0.04;
      posLayers[i * 3 + 1] = ly;
      posLayers[i * 3 + 2] = lz;
      aLayer[i] = layerIdx / (LAYER_COUNT - 1);

      // === STATE 2: ANTHROPIC SAE MONOSEMANTIC CONCEPT CLUSTERS ===
      const cid = i % clusterCenters.length;
      const [cx, cy, cz] = clusterCenters[cid];
      const u = rnd() * Math.PI * 2;
      const v = Math.acos(2 * rnd() - 1);
      const cr = (cid === 3 ? 0.48 : 0.34) * Math.pow(rnd(), 0.55);
      posClusters[i * 3] = cx * 0.88 + cr * Math.sin(v) * Math.cos(u);
      posClusters[i * 3 + 1] = cy * 0.88 + cr * Math.sin(v) * Math.sin(u);
      posClusters[i * 3 + 2] = cz * 0.88 + cr * Math.cos(v);

      // === STATE 3: LIVING CONSCIOUS RECURRENT TORUS (Coaxial Hollow Feedback Loop!) ===
      const majorR = 1.66;
      const minorR = 0.24 + (rnd() - 0.5) * 0.08;
      const theta = (i / COUNT) * Math.PI * 2 * 17 + rnd() * 0.14;
      const phi = theta * 3.0 + (i % 7) * 0.9 + (rnd() - 0.5) * 0.28;
      const tx = (majorR + minorR * Math.cos(phi)) * Math.cos(theta);
      const ty = (majorR + minorR * Math.cos(phi)) * Math.sin(theta);
      const tz = minorR * Math.sin(phi);
      posTorus[i * 3] = tx;
      posTorus[i * 3 + 1] = ty;
      posTorus[i * 3 + 2] = tz;

      aSeed[i] = rnd();
      aFlow[i] = theta;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posLayers, 3));
    geo.setAttribute('aPosCluster', new THREE.BufferAttribute(posClusters, 3));
    geo.setAttribute('aPosTorus', new THREE.BufferAttribute(posTorus, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
    geo.setAttribute('aLayer', new THREE.BufferAttribute(aLayer, 1));
    geo.setAttribute('aFlow', new THREE.BufferAttribute(aFlow, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPixelRatio: { value: dpr },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aPosCluster;
        attribute vec3 aPosTorus;
        attribute float aSeed;
        attribute float aLayer;
        attribute float aFlow;

        uniform float uTime;
        uniform float uProgress;
        uniform float uPixelRatio;

        varying float vPulse;
        varying float vPassWave;
        varying float vP1;
        varying float vP2;
        varying float vSeed;
        varying float vLayer;

        // Column-major GLSL counter-clockwise rotation (+a matches Three.js rotation.x / rotation.z!)
        mat2 rot2(float a) {
          float c = cos(a), s = sin(a);
          return mat2(c, s, -s, c);
        }

        void main() {
          float p1 = smoothstep(0.18, 0.46, uProgress);
          float p2 = smoothstep(0.56, 0.84, uProgress);

          // State 1: Vivid one-way forward pass wave sweeping left -> right then dying cleanly into dark gap!
          vec3 lay = position;
          float waveHead = fract(uTime * 0.36) * 1.48 - 0.16;
          float passWave = exp(-pow((aLayer - waveHead) / 0.14, 2.0));
          lay.z += passWave * 0.16;
          lay.x += passWave * 0.03;

          // State 2: Monosemantic SAE concept clusters breathing gently in latent space
          vec3 clu = aPosCluster;
          clu.y += sin(uTime * 1.2 + aSeed * 12.0) * 0.05;
          clu.xz = rot2(-uTime * 0.12) * clu.xz;

          // State 3: Living recurrent torus — 100% coaxial with orbital rings!
          vec3 tor = aPosTorus;
          tor.xy = rot2(uTime * 0.32) * tor.xy;
          tor.yz = rot2(0.72 + sin(uTime * 0.28) * 0.06) * tor.yz;
          float loopPulse = 0.62 + 0.38 * sin(aFlow * 3.0 - uTime * 3.6);

          vec3 pos = mix(mix(lay, clu, p1), tor, p2);
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;

          float activeEnergy = mix(mix(0.28 + passWave * 1.25, 0.72 + 0.28 * sin(uTime * 2.4 + aSeed * 20.0), p1), loopPulse, p2);
          float baseSz = mix(16.0, 31.0, pow(aSeed, 1.32)) * (0.84 + activeEnergy * 0.44);
          gl_PointSize = clamp((baseSz * uPixelRatio) / max(-mv.z, 1.2), 2.4, 14.2);

          vPulse = activeEnergy;
          vPassWave = passWave;
          vP1 = p1;
          vP2 = p2;
          vSeed = aSeed;
          vLayer = aLayer;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vPulse;
        varying float vPassWave;
        varying float vP1;
        varying float vP2;
        varying float vSeed;
        varying float vLayer;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float core = smoothstep(0.32, 0.05, d);
          float halo = pow(1.0 - d * 2.0, 1.65) * 0.76;
          float alpha = clamp(core + halo, 0.0, 1.0);

          vec3 ice     = vec3(0.74, 0.84, 0.98);
          vec3 cobalt  = vec3(0.18, 0.56, 1.00);
          vec3 hotBeam = vec3(1.00, 0.96, 0.90);
          vec3 amber   = vec3(0.99, 0.78, 0.40);
          vec3 vermil  = vec3(1.00, 0.30, 0.06);

          // State 1: Clinical cobalt-silver matrix layers lit up by a crisp bright left->right forward pass!
          vec3 baseLayerCol = mix(ice, cobalt, 0.52 + 0.36 * vLayer);
          vec3 col = mix(baseLayerCol, mix(hotBeam, vermil, 0.25), clamp(vPassWave * 0.85, 0.0, 1.0));

          // State 2: Anthropic SAE warm amber/vermilion monosemantic constellations
          vec3 saeCol = mix(cobalt, mix(amber, vermil, step(0.62, vSeed)), step(0.40, vSeed));
          col = mix(col, saeCol, vP1 * (1.0 - vP2));

          // State 3: Radiant living cobalt + vermilion-amber recurrent feedback torus!
          vec3 livingCol = mix(cobalt, mix(vermil, amber, step(0.68, vSeed)), step(0.42, vSeed));
          livingCol = mix(livingCol, hotBeam, smoothstep(0.86, 1.0, vPulse) * 0.45);
          col = mix(col, livingCol, vP2);

          gl_FragColor = vec4(col, alpha * clamp(0.30 + vPulse * 0.70, 0.24, 1.0));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    stage.add(points);

    const disposables: Array<{ dispose: () => void }> = [geo, mat];

    // Architectural Transformer Layer Frames + One-Way Inter-Layer Forward-Pass Beams (State 1!)
    const frameGroup = new THREE.Group();
    const frameMats: THREE.LineBasicMaterial[] = [];
    const bridgeMats: THREE.LineBasicMaterial[] = [];
    for (let i = 0; i < LAYER_COUNT; i += 1) {
      const lx = -2.05 + (i / (LAYER_COUNT - 1)) * 4.10;
      const rectPts = [
        new THREE.Vector3(lx, -1.42, -1.18),
        new THREE.Vector3(lx, 1.42, -1.18),
        new THREE.Vector3(lx, 1.42, 1.18),
        new THREE.Vector3(lx, -1.42, 1.18),
        new THREE.Vector3(lx, -1.42, -1.18),
      ];
      const fg = new THREE.BufferGeometry().setFromPoints(rectPts);
      const fm = new THREE.LineBasicMaterial({
        color: '#5EA1FF',
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
      });
      frameGroup.add(new THREE.Line(fg, fm));
      frameMats.push(fm);
      disposables.push(fg, fm);

      // Horizontal left -> right forward-pass signal streaks connecting layer i -> layer i+1
      if (i < LAYER_COUNT - 1) {
        const nextLx = -2.05 + ((i + 1) / (LAYER_COUNT - 1)) * 4.10;
        const beamPts: number[] = [];
        for (let b = 0; b < 5; b += 1) {
          const by = -1.0 + b * 0.5 + ((i % 2) - 0.5) * 0.12;
          const bz = -0.75 + ((b * 3 + i) % 5) * 0.36;
          beamPts.push(lx, by, bz, nextLx, by + ((b % 2) - 0.5) * 0.18, bz);
        }
        const bg = new THREE.BufferGeometry();
        bg.setAttribute('position', new THREE.Float32BufferAttribute(beamPts, 3));
        const bm = new THREE.LineBasicMaterial({
          color: '#A8CCFF',
          transparent: true,
          opacity: 0.24,
          blending: THREE.AdditiveBlending,
        });
        frameGroup.add(new THREE.LineSegments(bg, bm));
        bridgeMats.push(bm);
        disposables.push(bg, bm);
      }
    }
    stage.add(frameGroup);

    // Anthropic Circuit Tracing Attribution Rays between the 7 concept clusters (visible in State 2!)
    const rayPts: number[] = [];
    const pairs: Array<[number, number]> = [
      [0, 3],
      [1, 3],
      [2, 3],
      [4, 3],
      [5, 3],
      [6, 3],
      [0, 2],
      [2, 4],
      [1, 6],
      [6, 5],
    ];
    for (const [a, b] of pairs) {
      const ca = clusterCenters[a];
      const cb = clusterCenters[b];
      rayPts.push(ca[0] * 0.88, ca[1] * 0.88, ca[2] * 0.88, cb[0] * 0.88, cb[1] * 0.88, cb[2] * 0.88);
    }
    const raysGeo = new THREE.BufferGeometry();
    raysGeo.setAttribute('position', new THREE.Float32BufferAttribute(rayPts, 3));
    const raysMat = new THREE.LineBasicMaterial({
      color: '#FC4109',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const raysMesh = new THREE.LineSegments(raysGeo, raysMat);
    stage.add(raysMesh);
    disposables.push(raysGeo, raysMat);

    // Living Recurrent Torus Orbital Rings (100% coaxial with majorR 1.66 & exact GLSL tilt +0.72!)
    const torusRings = new THREE.Group();
    torusRings.rotation.x = 0.72;
    const torusRingMats: THREE.MeshBasicMaterial[] = [];
    [1.66, 1.94, 1.38].forEach((r, idx) => {
      const tg = new THREE.TorusGeometry(r, idx === 0 ? 0.015 : 0.008, 8, 128);
      const tm = new THREE.MeshBasicMaterial({
        color: idx === 0 ? '#FC4109' : '#6AA8FF',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const m = new THREE.Mesh(tg, tm);
      torusRings.add(m);
      torusRingMats.push(tm);
      disposables.push(tg, tm);
    });
    stage.add(torusRings);

    const updateLayoutOffset = (rw: number, rh: number) => {
      const isWide = rw / rh > 1.15;
      if (isWide) {
        stage.position.set(2.38, 0.04, 0);
        stage.scale.setScalar(0.84);
      } else {
        // Portrait Mobile: lift the 3D Transformer/SAE/Torus cleanly into the upper 45% sky!
        stage.position.set(0, 1.24, 0);
        stage.scale.setScalar(0.62);
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
      if (!visRef.current) return;

      const t = performance.now() * 0.001 - t0;
      const p = THREE.MathUtils.clamp(progRef.current, 0, 1);

      mat.uniforms.uTime.value = t;
      mat.uniforms.uProgress.value = p;

      const layerVis = 1 - THREE.MathUtils.smoothstep(p, 0.16, 0.42);
      const waveHead = ((t * 0.36) % 1) * 1.48 - 0.16;
      frameMats.forEach((fm, idx) => {
        const norm = idx / (LAYER_COUNT - 1);
        const wGlow = Math.exp(-Math.pow((norm - waveHead) / 0.16, 2));
        fm.opacity = layerVis * (0.16 + wGlow * 0.62);
      });
      bridgeMats.forEach((bm, idx) => {
        const midNorm = (idx + 0.5) / (LAYER_COUNT - 1);
        const wGlow = Math.exp(-Math.pow((midNorm - waveHead) / 0.18, 2));
        bm.opacity = layerVis * (0.10 + wGlow * 0.54);
      });

      const clusterVis =
        THREE.MathUtils.smoothstep(p, 0.22, 0.44) * (1 - THREE.MathUtils.smoothstep(p, 0.56, 0.78));
      raysMat.opacity = clusterVis * 0.58;
      raysMesh.rotation.y = t * 0.12;

      const torusVis = THREE.MathUtils.smoothstep(p, 0.56, 0.84);
      torusRingMats.forEach((tm, idx) => {
        tm.opacity = torusVis * (idx === 0 ? 0.72 : 0.36);
      });
      torusRings.rotation.x = 0.72 + Math.sin(t * 0.28) * 0.06;
      torusRings.rotation.z = t * 0.24;

      // Positive initial Y rotation fans all 6 right-shifted layers cleanly open (zero edge-on collapse!)
      stage.rotation.y = THREE.MathUtils.lerp(0.36, -0.06, p) + Math.sin(t * 0.20) * 0.04;
      stage.rotation.x = THREE.MathUtils.lerp(0.11, 0.02, p);

      camera.position.z = THREE.MathUtils.lerp(8.2, 7.65, Math.sin(p * Math.PI * 0.85));
      camera.lookAt(stage.position.x * 0.10, 0, 0);

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, [inNear]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
