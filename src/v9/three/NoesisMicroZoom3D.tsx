import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface NoesisMicroZoom3DProps {
  /** Scroll progress 0..1 driving the optical flight through 6 cortical layers to the Layer V Ca2+ nexus */
  progress: number;
  className?: string;
}

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * 3D Optical Golgi-Silver Cortical Column Flight (NOESIS v9.2)
 * - Renders 1,200 instanced 3D pyramidal neurons + apical shafts across 6 true cortical depths (Layers I..VI) in 2 draw calls!
 * - Zero autoplay chaos: camera flies smoothly along scroll progress (0 = 10 cm macro column -> 0.5 = 2 mm 6-layer forest -> 1.0 = 200 µm Layer V hero neuron & Ca²⁺ nexus).
 * - Strict IntersectionObserver WebGL mount/pause, frustumCulled=false on InstancedMesh, NoToneMapping on #FAF9F5 paper!
 */
export function NoesisMicroZoom3D({ progress, className = 'w-full h-full' }: NoesisMicroZoom3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const [inNear, setInNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  visibleRef.current = visible;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(
      ([e]) => setInNear(e.isIntersecting),
      { rootMargin: '100px 0px 100px 0px', threshold: 0 },
    );
    const visObs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { rootMargin: '80px 0px 80px 0px', threshold: 0 },
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#FAF9F5', 4.5, 16.5);

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.08, 40);
    camera.position.set(0, 0.2, 10.5);

    // Subtle Leica studio lighting
    const amb = new THREE.AmbientLight('#FAF9F5', 1.15);
    const dir = new THREE.DirectionalLight('#FFFDF8', 1.1);
    dir.position.set(4, 7, 6);
    scene.add(amb, dir);

    // === 1,200 INSTANCED 3D PYRAMIDAL SOMATA + APICAL DENDRITES (Layers I..VI) ===
    const COUNT = 1200;
    const rand = seededRand(20200305); // Suzuki & Larkum Cell 2020

    const somaGeo = new THREE.ConeGeometry(0.026, 0.082, 5);
    const somaMat = new THREE.MeshStandardMaterial({
      color: '#4B4A45',
      roughness: 0.78,
      metalness: 0.02,
      transparent: true,
      opacity: 0.52,
    });
    const somaInst = new THREE.InstancedMesh(somaGeo, somaMat, COUNT);
    somaInst.frustumCulled = false;

    const shaftGeo = new THREE.CylinderGeometry(0.0024, 0.0052, 1.0, 5);
    shaftGeo.translate(0, 0.5, 0);
    const shaftMat = new THREE.MeshBasicMaterial({
      color: '#7A7872',
      transparent: true,
      opacity: 0.2,
    });
    const shaftInst = new THREE.InstancedMesh(shaftGeo, shaftMat, COUNT);
    shaftInst.frustumCulled = false;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < COUNT; i += 1) {
      // Distribute across 6 cortical depths (y from +2.3 Layer I down to -2.4 Layer VI)
      const layerRoll = rand();
      let y = 0;
      let scale = 1;
      let shaftLen = 1.0;

      if (layerRoll < 0.06) {
        y = 1.9 + rand() * 0.45; // Layer I (sparse axons & apical tufts)
        scale = 0.55;
        shaftLen = 0.25;
      } else if (layerRoll < 0.34) {
        y = 0.75 + rand() * 1.05; // Layers II/III (dense small pyramids)
        scale = 0.8;
        shaftLen = 0.9;
      } else if (layerRoll < 0.52) {
        y = 0.15 + rand() * 0.55; // Layer IV (granular stellate input)
        scale = 0.65;
        shaftLen = 0.42;
      } else if (layerRoll < 0.82) {
        y = -1.35 + rand() * 1.4; // Layer V (LARGE pyramidal Larkum cells!)
        scale = 1.18;
        shaftLen = 2.0 + rand() * 0.8;
      } else {
        y = -2.35 + rand() * 0.9; // Layer VI
        scale = 0.88;
        shaftLen = 1.3;
      }

      // Leave generous museum optical corridor around (0, y, 0) so the Hero Layer V Larkum Neuron shines cleanly!
      let x = (rand() - 0.5) * 12.0;
      let z = (rand() - 0.5) * 11.0;
      if (Math.hypot(x, z) < 1.65) {
        const ang = rand() * Math.PI * 2;
        x = Math.cos(ang) * (1.75 + rand() * 1.8);
        z = Math.sin(ang) * (1.75 + rand() * 1.8);
      }

      dummy.position.set(x, y, z);
      dummy.rotation.set((rand() - 0.5) * 0.12, rand() * Math.PI * 2, (rand() - 0.5) * 0.12);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      somaInst.setMatrixAt(i, dummy.matrix);

      dummy.scale.set(scale, shaftLen, scale);
      dummy.updateMatrix();
      shaftInst.setMatrixAt(i, dummy.matrix);

      // Soft Golgi silver-ink tones: Layer V deeper ink, others airy warm graphite
      color.set(y > -1.4 && y < 0.1 ? '#2E2D2A' : '#85827A');
      somaInst.setColorAt(i, color);
    }
    somaInst.instanceMatrix.needsUpdate = true;
    if (somaInst.instanceColor) somaInst.instanceColor.needsUpdate = true;
    shaftInst.instanceMatrix.needsUpdate = true;
    scene.add(shaftInst, somaInst);

    // === 6 HORIZONTAL ARCHITECTURAL LAYER PLANES (thin Swiss glass gridlines) ===
    const layerLinesGeo = new THREE.BufferGeometry();
    const lineVerts: number[] = [];
    const layerYs = [2.25, 1.68, 0.72, 0.12, -1.42, -2.35];
    for (const ly of layerYs) {
      lineVerts.push(-5.5, ly, -1.5, 5.5, ly, -1.5);
    }
    layerLinesGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3));
    const layerLinesMat = new THREE.LineBasicMaterial({ color: '#141413', transparent: true, opacity: 0.14 });
    const layerLines = new THREE.LineSegments(layerLinesGeo, layerLinesMat);
    scene.add(layerLines);

    // === HERO LAYER V PYRAMIDAL NEURON (Suzuki & Larkum, Cell 2020) AT CENTER (0, -0.85, 0) ===
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    const heroSomaGeo = new THREE.ConeGeometry(0.16, 0.38, 6);
    const heroSomaMat = new THREE.MeshStandardMaterial({ color: '#141413', roughness: 0.45, metalness: 0.1 });
    const heroSoma = new THREE.Mesh(heroSomaGeo, heroSomaMat);
    heroSoma.position.set(0, -0.85, 0);
    heroGroup.add(heroSoma);

    // Apical trunk rising cleanly from Layer V (-0.85) all the way up to Layer I (+1.95)!
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.7, 0),
      new THREE.Vector3(0.03, 0.15, 0.02),
      new THREE.Vector3(-0.02, 1.05, -0.01),
      new THREE.Vector3(0, 1.82, 0),
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 32, 0.024, 8, false);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#1C1C1A', roughness: 0.5 });
    heroGroup.add(new THREE.Mesh(trunkGeo, trunkMat));

    // Upper Layer I Apical Tuft branches (Cobalt #004EDF — top-down predictions!)
    const branchGeos: THREE.BufferGeometry[] = [];
    const tuftMat = new THREE.MeshBasicMaterial({ color: '#004EDF' });
    const tuftTargets: [number, number, number][] = [
      [-0.58, 2.24, 0.14],
      [-0.28, 2.34, -0.18],
      [0.24, 2.32, 0.16],
      [0.62, 2.20, -0.10],
    ];
    for (const [tx, ty, tz] of tuftTargets) {
      const c = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.78, 0),
        new THREE.Vector3(tx * 0.55, 2.02, tz * 0.55),
        new THREE.Vector3(tx, ty, tz),
      ]);
      const g = new THREE.TubeGeometry(c, 16, 0.012, 6, false);
      branchGeos.push(g);
      heroGroup.add(new THREE.Mesh(g, tuftMat));
    }

    // Basal Layer V dendrites (Dark ink — bottom-up sensory world!)
    const basalMat = new THREE.MeshBasicMaterial({ color: '#2A2926' });
    const basalTargets: [number, number, number][] = [
      [-0.52, -1.16, 0.18],
      [-0.36, -1.24, -0.22],
      [0.44, -1.20, 0.14],
      [0.54, -1.10, -0.16],
    ];
    for (const [bx, by, bz] of basalTargets) {
      const c = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.94, 0),
        new THREE.Vector3(bx * 0.55, -1.08, bz * 0.55),
        new THREE.Vector3(bx, by, bz),
      ]);
      const g = new THREE.TubeGeometry(c, 14, 0.012, 6, false);
      branchGeos.push(g);
      heroGroup.add(new THREE.Mesh(g, basalMat));
    }

    // Ca²⁺ Nexus Node on the Apical Trunk (Signal Red #FC4109 — the Anesthesia switch!)
    const nexusGeo = new THREE.SphereGeometry(0.085, 20, 20);
    const nexusMat = new THREE.MeshBasicMaterial({ color: '#FC4109' });
    const nexusMesh = new THREE.Mesh(nexusGeo, nexusMat);
    nexusMesh.position.set(0, 1.26, 0);
    heroGroup.add(nexusMesh);

    const ringGeo = new THREE.TorusGeometry(0.16, 0.011, 10, 36);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#FC4109', transparent: true, opacity: 0.72 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 1.26, 0);
    heroGroup.add(ringMesh);

    // 2 travelling action-potential pulses racing up & down the Hero Apical Trunk
    const pulseGeo = new THREE.SphereGeometry(0.042, 12, 12);
    const pulseTopMat = new THREE.MeshBasicMaterial({ color: '#004EDF' });
    const pulseBotMat = new THREE.MeshBasicMaterial({ color: '#FC4109' });
    const pulseTop = new THREE.Mesh(pulseGeo, pulseTopMat);
    const pulseBot = new THREE.Mesh(pulseGeo, pulseBotMat);
    heroGroup.add(pulseTop, pulseBot);

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

    let rafId = 0;
    const t0 = performance.now() * 0.001;
    const tmpPt = new THREE.Vector3();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!visibleRef.current) return;

      const t = performance.now() * 0.001 - t0;
      const p = Math.max(0, Math.min(1, progressRef.current));

      // Smooth optical zoom flight: z=9.8 (10cm macro column) -> z=5.8 (2mm 6 layers) -> z=4.15 (full Hero Layer V neuron framed cleanly!)
      const camZ = THREE.MathUtils.lerp(9.8, 4.15, Math.pow(p, 0.85));
      const camY = THREE.MathUtils.lerp(0.25, 0.52, p);
      const camX = Math.sin(p * Math.PI * 0.65) * 0.65;
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, THREE.MathUtils.lerp(0.0, 0.55, p), 0);

      // Subtle breathing pulse on Ca²⁺ nexus ring
      const s = 1 + 0.22 * Math.sin(t * 3.8);
      ringMesh.scale.setScalar(s);
      ringMat.opacity = 0.35 + 0.45 * (0.5 + 0.5 * Math.cos(t * 3.8));

      // Synchronized top-down (cobalt) and bottom-up (crimson) dendritic pulses converging on Ca²⁺ nexus!
      const phase = (t * 0.55) % 1;
      trunkCurve.getPoint(1 - phase * 0.28, tmpPt);
      pulseTop.position.copy(tmpPt);
      trunkCurve.getPoint(phase * 0.72, tmpPt);
      pulseBot.position.copy(tmpPt);

      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      somaGeo.dispose();
      somaMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      layerLinesGeo.dispose();
      layerLinesMat.dispose();
      heroSomaGeo.dispose();
      heroSomaMat.dispose();
      trunkGeo.dispose();
      trunkMat.dispose();
      branchGeos.forEach((g) => g.dispose());
      tuftMat.dispose();
      basalMat.dispose();
      nexusGeo.dispose();
      nexusMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pulseGeo.dispose();
      pulseTopMat.dispose();
      pulseBotMat.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, [inNear]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
