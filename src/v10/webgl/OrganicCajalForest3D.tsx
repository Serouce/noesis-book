import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface OrganicCajalForest3DProps {
  /** 0..1 scroll progress flying through a darkroom Leica confocal 3D branching forest to the Layer V Larkum Ca²⁺ nexus */
  progress: number;
  className?: string;
}

function makeSeeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function createSparkTexture(innerHex: string, outerHex: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
    g.addColorStop(0, '#FFFFFF');
    g.addColorStop(0.24, innerHex);
    g.addColorStop(0.58, outerHex);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * NOESIS v10 Darkroom Confocal 3D Cajal/Golgi Branching Cortical Forest (×1000)
 * - 84 multi-order gracefully branching 3D dendritic trees glowing in silver-ivory & deep-cobalt confocal fog
 * - Sculptural Hero Layer V Larkum Pyramidal Neuron built from smooth organic LatheGeometry soma + curved TubeGeometry branches
 * - Branching luminous cobalt Layer I apical prediction canopy (16 curved primary + secondary twigs!)
 * - Pulsing signal-red Ca²⁺ apical nexus orb + dual concentric optical rings
 * - 36 bioluminescent travelling action-potential sparks racing top-down & bottom-up to collide at the Ca²⁺ switch!
 */
export function OrganicCajalForest3D({ progress, className = 'w-full h-full' }: OrganicCajalForest3DProps) {
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#0B0D11', 0.115);

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 40);
    camera.position.set(0, 0.45, 9.2);

    const amb = new THREE.AmbientLight('#8FA8D6', 0.85);
    const keyLight = new THREE.DirectionalLight('#FFF7EC', 1.45);
    keyLight.position.set(4, 7, 6);
    const cobaltRim = new THREE.PointLight('#2D74FF', 3.2, 12);
    cobaltRim.position.set(-1.2, 2.5, 2.2);
    const nexusLight = new THREE.PointLight('#FC4109', 2.6, 6);
    nexusLight.position.set(0, 0.72, 0.6);
    scene.add(amb, keyLight, cobaltRim, nexusLight);

    const disposables: Array<{ dispose: () => void }> = [];
    const rand = makeSeeded(19061210);

    // === 1. CONFOCAL MULTI-ORDER BRANCHING GOLGI FOREST (84 curved organic trees!) ===
    const branchSegs: number[] = [];
    const crownSegs: number[] = [];
    const somaPositions: Array<{ x: number; y: number; z: number; s: number }> = [];

    const pushCurve = (target: number[], curve: THREE.CatmullRomCurve3, steps: number) => {
      const pts = curve.getPoints(steps);
      for (let i = 0; i < pts.length - 1; i += 1) {
        target.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
      }
    };

    for (let i = 0; i < 84; i += 1) {
      let x = (rand() - 0.5) * 12.4;
      let z = (rand() - 0.5) * 10.6;
      if (Math.hypot(x, z) < 1.65) {
        const a = rand() * Math.PI * 2;
        x = Math.cos(a) * (1.75 + rand() * 2.6);
        z = Math.sin(a) * (1.75 + rand() * 2.6);
      }
      const isLayer5 = rand() < 0.58;
      const sy = isLayer5 ? -1.55 + rand() * 0.9 : 0.15 + rand() * 0.95;
      const topY = isLayer5 ? 1.85 + rand() * 0.65 : sy + 0.9 + rand() * 0.65;
      const swayX = (rand() - 0.5) * 0.42;
      const swayZ = (rand() - 0.5) * 0.42;

      somaPositions.push({ x, y: sy, z, s: isLayer5 ? 0.055 : 0.036 });

      const trunk = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, sy, z),
        new THREE.Vector3(x + swayX * 0.45, sy + (topY - sy) * 0.35, z + swayZ * 0.45),
        new THREE.Vector3(x - swayX * 0.25, sy + (topY - sy) * 0.72, z + swayZ * 0.65),
        new THREE.Vector3(x + swayX, topY, z + swayZ),
      ]);
      pushCurve(branchSegs, trunk, 12);

      // Primary + secondary Layer I apical crown forks
      for (let b = 0; b < 4; b += 1) {
        const ba = (b / 4) * Math.PI * 2 + rand() * 0.8;
        const br = 0.28 + rand() * 0.44;
        const forkStart = trunk.getPoint(0.72 + rand() * 0.22);
        const midPt = new THREE.Vector3(
          forkStart.x + Math.cos(ba) * br * 0.55,
          forkStart.y + 0.18 + rand() * 0.16,
          forkStart.z + Math.sin(ba) * br * 0.55,
        );
        const endPt = new THREE.Vector3(
          forkStart.x + Math.cos(ba) * br,
          forkStart.y + 0.36 + rand() * 0.28,
          forkStart.z + Math.sin(ba) * br,
        );
        pushCurve(crownSegs, new THREE.CatmullRomCurve3([forkStart, midPt, endPt]), 6);

        // Delicate secondary twig fork!
        const ba2 = ba + (rand() > 0.5 ? 0.55 : -0.55);
        const twigEnd = new THREE.Vector3(
          midPt.x + Math.cos(ba2) * br * 0.55,
          midPt.y + 0.22 + rand() * 0.14,
          midPt.z + Math.sin(ba2) * br * 0.55,
        );
        pushCurve(crownSegs, new THREE.CatmullRomCurve3([midPt, twigEnd]), 3);
      }

      // 4 fine basal roots near soma
      for (let b = 0; b < 4; b += 1) {
        const ba = (b / 4) * Math.PI * 2 + rand() * 0.6;
        const br = 0.30 + rand() * 0.35;
        pushCurve(
          branchSegs,
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(x, sy, z),
            new THREE.Vector3(x + Math.cos(ba) * br * 0.5, sy - 0.12, z + Math.sin(ba) * br * 0.5),
            new THREE.Vector3(x + Math.cos(ba) * br, sy - 0.28 - rand() * 0.14, z + Math.sin(ba) * br),
          ]),
          5,
        );
      }
    }

    const forestGeo = new THREE.BufferGeometry();
    forestGeo.setAttribute('position', new THREE.Float32BufferAttribute(branchSegs, 3));
    const forestMat = new THREE.LineBasicMaterial({
      color: '#9BA9C4',
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.LineSegments(forestGeo, forestMat));

    const crownGeo = new THREE.BufferGeometry();
    crownGeo.setAttribute('position', new THREE.Float32BufferAttribute(crownSegs, 3));
    const crownMat = new THREE.LineBasicMaterial({
      color: '#4B8BFF',
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.LineSegments(crownGeo, crownMat));
    disposables.push(forestGeo, forestMat, crownGeo, crownMat);

    // Soft circular confocal bokeh dust motes (NEVER square WebGL default point quads!)
    const dustTex = createSparkTexture('#B8D4FF', '#2852A8');
    const dustPts = new Float32Array(220 * 3);
    for (let i = 0; i < 220; i += 1) {
      dustPts[i * 3] = (rand() - 0.5) * 11;
      dustPts[i * 3 + 1] = -2.2 + rand() * 4.8;
      dustPts[i * 3 + 2] = (rand() - 0.5) * 9;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPts, 3));
    const dustMat = new THREE.PointsMaterial({
      color: '#9EC5FF',
      map: dustTex,
      size: 0.11,
      transparent: true,
      opacity: 0.42,
      alphaTest: 0.01,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(dustGeo, dustMat));
    disposables.push(dustTex, dustGeo, dustMat);

    // Smooth organic teardrop somata (LatheGeometry — NEVER harsh low-poly cones!)
    const lathePts = [
      new THREE.Vector2(0.0, -1.0),
      new THREE.Vector2(0.76, -0.78),
      new THREE.Vector2(0.84, -0.22),
      new THREE.Vector2(0.40, 0.52),
      new THREE.Vector2(0.14, 1.05),
      new THREE.Vector2(0.0, 1.25),
    ];
    const organicSomaGeo = new THREE.LatheGeometry(lathePts, 16);
    const organicSomaMat = new THREE.MeshPhysicalMaterial({
      color: '#B8C4DC',
      emissive: '#1B2A4A',
      emissiveIntensity: 0.5,
      roughness: 0.38,
      transparent: true,
      opacity: 0.62,
    });
    const somataInst = new THREE.InstancedMesh(organicSomaGeo, organicSomaMat, somaPositions.length);
    somataInst.frustumCulled = false;
    const dummy = new THREE.Object3D();
    somaPositions.forEach((sp, idx) => {
      dummy.position.set(sp.x, sp.y, sp.z);
      dummy.scale.setScalar(sp.s);
      dummy.updateMatrix();
      somataInst.setMatrixAt(idx, dummy.matrix);
    });
    somataInst.instanceMatrix.needsUpdate = true;
    scene.add(somataInst);
    disposables.push(organicSomaGeo, organicSomaMat);

    // === 2. MONUMENTAL SCULPTURAL HERO LAYER V LARKUM PYRAMIDAL NEURON ===
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    const heroSomaMat = new THREE.MeshPhysicalMaterial({
      color: '#E8ECF5',
      emissive: '#3B4D70',
      emissiveIntensity: 0.45,
      roughness: 0.28,
      clearcoat: 0.4,
    });
    const heroSomaMesh = new THREE.Mesh(organicSomaGeo, heroSomaMat);
    heroSomaMesh.position.set(0, -1.05, 0);
    heroSomaMesh.scale.setScalar(0.175);
    heroGroup.add(heroSomaMesh);
    disposables.push(heroSomaMat);

    // Graceful S-curved apical shaft
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.88, 0),
      new THREE.Vector3(0.045, -0.20, 0.02),
      new THREE.Vector3(-0.035, 0.54, -0.02),
      new THREE.Vector3(0.015, 1.24, 0),
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 44, 0.025, 10, false);
    const trunkMat = new THREE.MeshPhysicalMaterial({
      color: '#D8E0F0',
      emissive: '#2B3B5E',
      emissiveIntensity: 0.55,
      roughness: 0.34,
    });
    heroGroup.add(new THREE.Mesh(trunkGeo, trunkMat));
    disposables.push(trunkGeo, trunkMat);

    // Rich Multi-Order Branching Cobalt Apical Canopy (Layer I — Top-Down Predictions!)
    const cobaltBranchMat = new THREE.MeshPhysicalMaterial({
      color: '#4F92FF',
      emissive: '#004EDF',
      emissiveIntensity: 0.85,
      roughness: 0.25,
    });
    const basalMat = new THREE.MeshPhysicalMaterial({
      color: '#DCE4F4',
      emissive: '#26344E',
      emissiveIntensity: 0.45,
      roughness: 0.36,
    });
    disposables.push(cobaltBranchMat, basalMat);

    const apicalCurves: THREE.CatmullRomCurve3[] = [];
    const primaryTargets: Array<[number, number, number]> = [
      [-0.95, 2.02, 0.26],
      [-0.52, 2.28, -0.34],
      [-0.08, 2.38, 0.14],
      [0.44, 2.32, -0.22],
      [0.92, 2.06, 0.24],
      [0.24, 2.18, 0.52],
      [-0.36, 2.14, -0.52],
    ];

    const tuftRoot = trunkCurve.getPoint(0.95);
    primaryTargets.forEach(([tx, ty, tz], idx) => {
      const mid = new THREE.Vector3(tx * 0.48, tuftRoot.y + (ty - tuftRoot.y) * 0.52, tz * 0.52);
      const end = new THREE.Vector3(tx, ty, tz);
      const curve = new THREE.CatmullRomCurve3([tuftRoot, mid, end]);
      apicalCurves.push(curve);
      const g = new THREE.TubeGeometry(curve, 22, 0.014, 8, false);
      heroGroup.add(new THREE.Mesh(g, cobaltBranchMat));
      disposables.push(g);

      // Graceful secondary sub-fork branching outward organically!
      const sideSign = idx % 2 === 0 ? 1 : -1;
      const forkEnd = new THREE.Vector3(
        tx + sideSign * 0.34,
        ty + 0.16,
        tz - sideSign * 0.22,
      );
      const forkCurve = new THREE.CatmullRomCurve3([
        mid,
        new THREE.Vector3((mid.x + forkEnd.x) * 0.5, mid.y + 0.24, (mid.z + forkEnd.z) * 0.5),
        forkEnd,
      ]);
      apicalCurves.push(forkCurve);
      const fg = new THREE.TubeGeometry(forkCurve, 14, 0.0085, 6, false);
      heroGroup.add(new THREE.Mesh(fg, cobaltBranchMat));
      disposables.push(fg);
    });

    // Organic Ivory Basal Sensory Roots (Bottom-Up World Input)
    const basalCurves: THREE.CatmullRomCurve3[] = [];
    const basalTargets: Array<[number, number, number]> = [
      [-0.86, -1.52, 0.24],
      [-0.48, -1.68, -0.44],
      [0.44, -1.64, 0.42],
      [0.88, -1.48, -0.22],
      [-0.18, -1.74, 0.52],
      [0.24, -1.72, -0.48],
    ];
    const somaBase = new THREE.Vector3(0, -1.12, 0);
    basalTargets.forEach(([bx, by, bz]) => {
      const mid = new THREE.Vector3(bx * 0.52, -1.28, bz * 0.52);
      const curve = new THREE.CatmullRomCurve3([somaBase, mid, new THREE.Vector3(bx, by, bz)]);
      basalCurves.push(curve);
      const g = new THREE.TubeGeometry(curve, 18, 0.013, 8, false);
      heroGroup.add(new THREE.Mesh(g, basalMat));
      disposables.push(g);
    });

    // Descending axon into white matter
    const axonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.22, 0),
      new THREE.Vector3(-0.04, -1.85, 0.02),
      new THREE.Vector3(0.02, -2.6, 0),
    ]);
    const axonGeo = new THREE.TubeGeometry(axonCurve, 16, 0.009, 6, false);
    heroGroup.add(new THREE.Mesh(axonGeo, basalMat));
    disposables.push(axonGeo);

    // === 3. PULSING SIGNAL-RED Ca²⁺ APICAL NEXUS SWITCH (Suzuki & Larkum, Cell 2020) ===
    const nexusPos = trunkCurve.getPoint(0.76);
    const nexusGeo = new THREE.SphereGeometry(0.068, 24, 24);
    const nexusMat = new THREE.MeshBasicMaterial({ color: '#FFF2DC' });
    const nexusCore = new THREE.Mesh(nexusGeo, nexusMat);
    nexusCore.position.copy(nexusPos);
    heroGroup.add(nexusCore);

    const ringGeo1 = new THREE.TorusGeometry(0.145, 0.009, 10, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: '#FC4109',
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const nexusRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    nexusRing1.position.copy(nexusPos);
    heroGroup.add(nexusRing1);

    const ringGeo2 = new THREE.TorusGeometry(0.24, 0.005, 8, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: '#FF7D4D',
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    });
    const nexusRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    nexusRing2.position.copy(nexusPos);
    heroGroup.add(nexusRing2);

    const redSparkTex = createSparkTexture('#FF8855', '#FC4109');
    const blueSparkTex = createSparkTexture('#8CC4FF', '#004EDF');
    const goldSparkTex = createSparkTexture('#FFF3C4', '#FC4109');

    const nexusHaloMat = new THREE.SpriteMaterial({
      map: redSparkTex,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nexusHalo = new THREE.Sprite(nexusHaloMat);
    nexusHalo.position.copy(nexusPos);
    nexusHalo.scale.set(0.68, 0.68, 1);
    heroGroup.add(nexusHalo);
    disposables.push(nexusGeo, nexusMat, ringGeo1, ringMat1, ringGeo2, ringMat2, redSparkTex, blueSparkTex, goldSparkTex, nexusHaloMat);

    // === 4. 36 BIOLUMINESCENT TRAVELLING ACTION-POTENTIAL SPARKS ===
    interface SparkSpec {
      sprite: THREE.Sprite;
      curve: THREE.CatmullRomCurve3;
      phase: number;
      speed: number;
      reverse: boolean;
      baseScale: number;
    }
    const sparks: SparkSpec[] = [];

    const addSpark = (curve: THREE.CatmullRomCurve3, tex: THREE.CanvasTexture, phase: number, speed: number, reverse: boolean, baseScale: number) => {
      const m = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sp = new THREE.Sprite(m);
      sp.scale.set(baseScale, baseScale, 1);
      heroGroup.add(sp);
      sparks.push({ sprite: sp, curve, phase, speed, reverse, baseScale });
      disposables.push(m);
    };

    // 18 Cobalt top-down prediction sparks flowing DOWN from Layer I canopy -> Ca²⁺ nexus
    apicalCurves.forEach((c, idx) => {
      addSpark(c, blueSparkTex, idx * 0.14, 0.46 + (idx % 3) * 0.08, true, 0.24);
      if (idx < 4) addSpark(c, blueSparkTex, idx * 0.22 + 0.5, 0.52, true, 0.18);
    });
    // 12 Warm sensory sparks rising UP from basal roots -> soma -> apical trunk
    basalCurves.forEach((c, idx) => {
      addSpark(c, goldSparkTex, idx * 0.17, 0.52, true, 0.22);
      addSpark(c, redSparkTex, idx * 0.17 + 0.5, 0.44, true, 0.18);
    });
    // 6 Bright integration pulses racing along the main trunk!
    for (let i = 0; i < 6; i += 1) {
      addSpark(trunkCurve, i % 2 === 0 ? goldSparkTex : redSparkTex, i / 6, 0.62, i % 2 === 1, 0.28);
    }

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

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!visRef.current) return;

      const t = performance.now() * 0.001 - t0;
      const p = THREE.MathUtils.clamp(progRef.current, 0, 1);

      // Generous optical microscopy framing: full Layer I cobalt canopy + Ca²⁺ switch + soma + basal roots all breathe inside frame!
      const camZ = THREE.MathUtils.lerp(9.4, 5.25, THREE.MathUtils.smoothstep(p, 0, 1));
      const camY = THREE.MathUtils.lerp(0.50, 0.25, p) + Math.sin(t * 0.45) * 0.04;
      const camX = Math.sin(p * Math.PI * 0.9 + t * 0.14) * 0.78;
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, THREE.MathUtils.lerp(0.24, 0.24, p), 0);

      // Organic micro-sway of hero neuron
      heroGroup.rotation.y = Math.sin(t * 0.28) * 0.10;

      // Rhythmic Ca²⁺ switch ignition pulse
      const pulse = 0.5 + 0.5 * Math.sin(t * 4.4);
      nexusHalo.scale.setScalar(0.58 + pulse * 0.34);
      nexusRing1.rotation.z = t * 0.6;
      nexusRing1.rotation.x = Math.sin(t * 0.8) * 0.45;
      nexusRing1.scale.setScalar(0.95 + pulse * 0.18);
      nexusRing2.rotation.y = -t * 0.5;
      nexusRing2.scale.setScalar(0.92 + (1 - pulse) * 0.24);
      nexusLight.intensity = 2.0 + pulse * 1.8;

      for (const sp of sparks) {
        const raw = (t * sp.speed + sp.phase) % 1;
        const u = sp.reverse ? 1 - raw : raw;
        sp.curve.getPoint(u, sp.sprite.position);
        const fade = Math.sin(raw * Math.PI);
        sp.sprite.scale.setScalar(sp.baseScale * (0.55 + fade * 0.72));
      }

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
