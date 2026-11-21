import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw } from 'lucide-react';
import { loadMriBrainGeometries } from './mriBrainLoader';
import {
  createCortexShaderMaterial,
  createSubstructureMaterial,
  createTractMaterial,
  type BrainVisualMode,
} from './brainShaders';

export interface NoesisBrain3DProps {
  mode: BrainVisualMode;
  dark?: boolean;
  /** 0..1 continuous control: Feedback strength (cerebellum), SCAN fracture (scan), Silicon ratio (silicon) */
  progress?: number;
  /** COGITATE: 0=neutral, 1=iit, 2=gnwt, 3=both+thalamus | TMS: 0=coma(0.21), 1=cmd(0.44) */
  focusMode?: number;
  /** Incrementing integer fires a synchronized impulse wave across cortex/cerebellum/TMS */
  pulseKey?: number;
  /** Optional anterior-posterior slice plane (-0.9..+0.9, disabled when >= 1.8) */
  clipZ?: number;
  /** Optional smooth camera preset angle [x, y, z] */
  cameraPos?: [number, number, number];
  /** Optional className for container sizing */
  className?: string;
  /** Compact caption inside bottom-left */
  caption?: string;
}

const MODE_INDEX: Record<BrainVisualMode, number> = {
  cerebellum: 0,
  scan: 1,
  cogitate: 2,
  tms: 3,
  silicon: 4,
};

const DEFAULT_CAMERA: Record<BrainVisualMode, [number, number, number]> = {
  cerebellum: [2.75, 0.35, 2.05], // Rear-lateral 3/4 showcasing true-scale Cerebellum + Cortex with Swiss breathing room
  scan: [0.28, 1.18, -3.12], // Elevated frontal-coronal view facing M1 directly & opening the coronal 3D slice toward viewer!
  cogitate: [3.2, 0.5, 0.25], // Clean lateral X-Ray view: Posterior IIT (+Z) <-> Center Thalamus <-> Frontal GNWT (-Z)
  tms: [1.95, 2.15, 1.85], // High parietal angle over Pz stimulation target
  silicon: [2.75, 0.72, -1.75], // Front-lateral 3/4 view watching block-by-block silicon replacement
};

function buildTractGroup(mode: BrainVisualMode): {
  group: THREE.Group;
  materials: THREE.ShaderMaterial[];
  geometries: THREE.BufferGeometry[];
} {
  const group = new THREE.Group();
  const materials: THREE.ShaderMaterial[] = [];
  const geometries: THREE.BufferGeometry[] = [];

  const addArc = (pts: [number, number, number][], radius: number, colorHex: string, speed: number, reverse = false) => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const geo = new THREE.TubeGeometry(curve, 36, radius, 6, false);
    const mat = createTractMaterial(colorHex, speed, reverse);
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    geometries.push(geo);
    materials.push(mat);
  };

  if (mode === 'cerebellum') {
    // 10 long-range bilateral cortical recurrent loops (frontal <-> parietal <-> occipital <-> temporal)
    const loops: Array<{ pts: [number, number, number][]; col: string; spd: number; rev?: boolean }> = [
      { pts: [[-0.28, 0.32, -0.68], [-0.42, 0.56, -0.08], [-0.26, 0.34, 0.66]], col: '#FC4109', spd: 0.72 },
      { pts: [[0.28, 0.32, -0.68], [0.42, 0.56, -0.08], [0.26, 0.34, 0.66]], col: '#FC4109', spd: 0.78, rev: true },
      { pts: [[-0.48, 0.04, -0.45], [-0.52, 0.26, 0.12], [-0.36, 0.08, 0.72]], col: '#FC4109', spd: 0.65, rev: true },
      { pts: [[0.48, 0.04, -0.45], [0.52, 0.26, 0.12], [0.36, 0.08, 0.72]], col: '#FC4109', spd: 0.70 },
      // Trans-callosal cross-hemisphere recurrent bridges
      { pts: [[-0.46, 0.36, -0.32], [0.0, 0.28, -0.26], [0.46, 0.36, -0.32]], col: '#FC4109', spd: 0.92 },
      { pts: [[-0.44, 0.40, 0.24], [0.0, 0.32, 0.20], [0.44, 0.40, 0.24]], col: '#FC4109', spd: 0.88, rev: true },
      { pts: [[-0.32, 0.18, 0.58], [0.0, 0.24, 0.44], [0.32, 0.18, 0.58]], col: '#FC4109', spd: 0.82 },
      // Thalamo-cortical vertical recurrent loops
      { pts: [[-0.14, 0.02, -0.05], [-0.36, 0.44, -0.24], [-0.14, 0.04, 0.16]], col: '#004EDF', spd: 0.96 },
      { pts: [[0.14, 0.02, -0.05], [0.36, 0.44, -0.24], [0.14, 0.04, 0.16]], col: '#004EDF', spd: 0.94, rev: true },
    ];
    loops.forEach((l) => addArc(l.pts, 0.011, l.col, l.spd, Boolean(l.rev)));
  } else if (mode === 'scan') {
    // 3 bilateral SCAN deep descending action/autonomic filaments connecting M1 SCAN 1/2/3 hubs to central subcortex
    const scanHubs: [number, number, number][] = [
      [0.22, 0.72, 0.01],
      [0.55, 0.43, -0.08],
      [0.68, 0.11, -0.11],
    ];
    for (const [hx, hy, hz] of scanHubs) {
      addArc([[-hx, hy, hz], [-hx * 0.45, hy * 0.48, hz * 0.5], [0, -0.12, -0.06]], 0.011, '#FC4109', 0.62);
      addArc([[hx, hy, hz], [hx * 0.45, hy * 0.48, hz * 0.5], [0, -0.12, -0.06]], 0.011, '#FC4109', 0.62);
      // Bilateral cross-hemisphere SCAN integration bridge
      addArc([[-hx, hy, hz], [0, hy * 0.65, hz + 0.04], [hx, hy, hz]], 0.0085, '#FC4109', 0.54, true);
    }
  } else if (mode === 'cogitate') {
    // Posterior IIT <-> Thalamus (Cobalt) + Anterior GNWT <-> Thalamus (Signal Red) + Fronto-occipital longitudinal tracts
    addArc([[0.12, 0.02, 0.04], [0.24, 0.18, 0.42], [0.22, 0.10, 0.74]], 0.012, '#004EDF', 0.85);
    addArc([[-0.12, 0.02, 0.04], [-0.24, 0.18, 0.42], [-0.22, 0.10, 0.74]], 0.012, '#004EDF', 0.82, true);
    addArc([[0.12, 0.04, -0.04], [0.26, 0.24, -0.38], [0.22, 0.16, -0.74]], 0.012, '#FC4109', 0.90);
    addArc([[-0.12, 0.04, -0.04], [-0.26, 0.24, -0.38], [-0.22, 0.16, -0.74]], 0.012, '#FC4109', 0.86, true);
    // Long-range superior longitudinal fasciculus linking posterior & frontal hubs
    addArc([[0.34, 0.34, 0.58], [0.40, 0.44, 0.0], [0.30, 0.30, -0.62]], 0.0095, '#34D399', 0.68);
    addArc([[-0.34, 0.34, 0.58], [-0.40, 0.44, 0.0], [-0.30, 0.30, -0.62]], 0.0095, '#34D399', 0.68, true);
  }

  return { group, materials, geometries };
}

/**
 * Unified Museum-Grade Real MRI 3D Brain Component (NOESIS v9.2)
 * - Uses genuine FreeSurfer fsaverage5 + SUIT Cerebellum + CIT168 Subcortex (.glb cached once per session)
 * - Auto-mounts/disposes WebGL context via IntersectionObserver (+/- 520px) so <= 1 WebGL context is active at any instant
 * - Transparent alpha canvas + NoToneMapping (preserves exact #FAF9F5 paper without ACES grey/yellow tint)
 * - OrbitControls with enableZoom=false (never hijacks Lenis page scrolling!) and zero autoplay spinning
 */
export function NoesisBrain3D({
  mode,
  dark = false,
  progress = 0,
  focusMode = 0,
  pulseKey = 0,
  clipZ = 2.5,
  cameraPos,
  className = 'w-full h-[360px] md:h-[420px]',
  caption,
}: NoesisBrain3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [inNearViewport, setInNearViewport] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [userDragged, setUserDragged] = useState(false);

  const propsRef = useRef({ mode, dark, progress, focusMode, clipZ, isVisible });
  propsRef.current = { mode, dark, progress, focusMode, clipZ, isVisible };

  const pulseStartRef = useRef<number>(-999);
  const lastPulseKeyRef = useRef<number>(pulseKey);
  const resetCamFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (pulseKey !== lastPulseKeyRef.current) {
      lastPulseKeyRef.current = pulseKey;
      if (pulseKey > 0) {
        pulseStartRef.current = performance.now() * 0.001;
      } else {
        pulseStartRef.current = -999;
      }
    }
  }, [pulseKey]);

  // Two-tier IntersectionObserver: tight +/-100px margin keeps <= 1 WebGL context active at chapter boundaries!
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const nearObs = new IntersectionObserver(
      ([entry]) => setInNearViewport(entry.isIntersecting),
      { rootMargin: '100px 0px 100px 0px', threshold: 0 },
    );
    const visObs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
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
    if (!inNearViewport) return;
    const container = hostRef.current;
    if (!container) return;

    let cancelled = false;
    let rafId = 0;
    let contextLost = false;

    const width = Math.max(240, container.clientWidth);
    const height = Math.max(200, container.clientHeight);

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
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping; // Preserves exact CSS #FAF9F5 paper & #111419 darkroom!
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.cursor = 'grab';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    canvas.addEventListener('webglcontextrestored', onContextRestored, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 25);
    const targetCam = cameraPos ?? DEFAULT_CAMERA[mode];
    camera.position.set(targetCam[0], targetCam[1], targetCam[2]);

    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false; // Never hijack Lenis page scrolling!
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.rotateSpeed = 0.65;
    controls.target.set(0, -0.02, 0);
    controls.update();

    const onStartDrag = () => {
      canvas.style.cursor = 'grabbing';
      setUserDragged(true);
    };
    const onEndDrag = () => {
      canvas.style.cursor = 'grab';
    };
    controls.addEventListener('start', onStartDrag);
    controls.addEventListener('end', onEndDrag);

    resetCamFnRef.current = () => {
      const def = cameraPos ?? DEFAULT_CAMERA[propsRef.current.mode];
      camera.position.set(def[0], def[1], def[2]);
      controls.target.set(0, -0.02, 0);
      controls.update();
      setUserDragged(false);
    };

    // Root brain group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const cortexMat = createCortexShaderMaterial(dark);
    const cerebMat = createSubstructureMaterial(
      mode === 'cerebellum' ? '#004EDF' : dark ? '#323A48' : '#CFC8B8',
      mode === 'cerebellum' ? '#5B9BFF' : '#8B95A8',
      mode === 'cogitate' ? 0.28 : 1,
    );
    const subMat = createSubstructureMaterial(
      mode === 'cogitate' ? '#FC4109' : mode === 'scan' ? '#C2410C' : '#3B82F6',
      mode === 'cogitate' ? '#FF9B7D' : '#93C5FD',
      mode === 'cogitate' ? 0.96 : mode === 'scan' ? 0.72 : 0.35,
    );

    const tracts = buildTractGroup(mode);
    rootGroup.add(tracts.group);

    let leftMesh: THREE.Mesh | null = null;
    let rightMesh: THREE.Mesh | null = null;
    let cerebMesh: THREE.Mesh | null = null;
    let subMesh: THREE.Mesh | null = null;

    loadMriBrainGeometries()
      .then((geos) => {
        if (cancelled) return;
        leftMesh = new THREE.Mesh(geos.cortexLeft, cortexMat);
        rightMesh = new THREE.Mesh(geos.cortexRight, cortexMat);
        cerebMesh = new THREE.Mesh(geos.cerebellum, cerebMat);
        subMesh = new THREE.Mesh(geos.subcortex, subMat);

        // Render internal structures cleanly before translucent cortical glass
        subMesh.renderOrder = 1;
        tracts.group.renderOrder = 2;
        cerebMesh.renderOrder = 3;
        leftMesh.renderOrder = 4;
        rightMesh.renderOrder = 4;

        rootGroup.add(subMesh, cerebMesh, leftMesh, rightMesh);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    const resizeObs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(200, Math.floor(entry.contentRect.width));
      const h = Math.max(180, Math.floor(entry.contentRect.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    resizeObs.observe(container);

    const startSec = performance.now() * 0.001;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (contextLost || !propsRef.current.isVisible) return;

      const nowSec = performance.now() * 0.001;
      const elapsed = nowSec - startSec;
      const { mode: curMode, dark: curDark, progress: curProg, focusMode: curFocus, clipZ: curClipZ } = propsRef.current;

      const pulseAge = pulseStartRef.current > 0 ? nowSec - pulseStartRef.current : -1;

      cortexMat.uniforms.uTime.value = elapsed;
      cortexMat.uniforms.uMode.value = MODE_INDEX[curMode];
      cortexMat.uniforms.uDarkTheme.value = curDark ? 1 : 0;
      cortexMat.uniforms.uProgress.value = curProg;
      cortexMat.uniforms.uFocusMode.value = curFocus;
      cortexMat.uniforms.uPulseTime.value = pulseAge;
      cortexMat.uniforms.uClipZ.value = curClipZ;

      const isTranslucentMode = curMode === 'cogitate' || (curMode === 'cerebellum' && curProg > 0.12);
      cortexMat.depthWrite = !isTranslucentMode;
      // Only enable DoubleSide when optical slice plane opens the interior; FrontSide avoids translucent self-sort artifacts!
      cortexMat.side = curClipZ < 1.75 ? THREE.DoubleSide : THREE.FrontSide;

      // Update cerebellum & thalamus sub-structures
      cerebMat.uniforms.uTime.value = elapsed;
      cerebMat.uniforms.uFeedForwardWave.value = curMode === 'cerebellum' ? pulseAge : -1;

      subMat.uniforms.uTime.value = elapsed;
      if (curMode === 'cogitate') {
        // Higher-order Thalamus theta burst (2-8 Hz, Fang et al., Science Apr 2025) — strongest in focusMode 3!
        subMat.uniforms.uPulseSpeed.value = curFocus >= 2.5 ? 7.5 : 3.2;
        subMat.uniforms.uPulseStrength.value = curFocus >= 2.5 ? 0.62 : 0.25;
        subMat.uniforms.uOpacity.value = curFocus >= 2.5 ? 0.98 : 0.65;
        if (subMesh) subMesh.visible = true;
      } else if (curMode === 'scan') {
        subMat.uniforms.uOpacity.value = 0.2 + curProg * 0.65;
        if (subMesh) subMesh.visible = curProg > 0.15;
      } else if (curMode === 'cerebellum') {
        subMat.uniforms.uOpacity.value = 0.25;
        if (subMesh) subMesh.visible = curProg > 0.2;
      } else {
        if (subMesh) subMesh.visible = false;
      }

      // Update animated white-matter fiber tracts
      for (let i = 0; i < tracts.materials.length; i += 1) {
        const tm = tracts.materials[i];
        tm.uniforms.uTime.value = elapsed;
        if (curMode === 'cerebellum') {
          const activeBoost = pulseAge >= 0 && pulseAge < 4.2 ? Math.exp(-pulseAge * 0.5) * 0.55 : 0;
          tm.uniforms.uOpacity.value = Math.min(1, curProg * 0.78 + activeBoost * curProg);
          tm.uniforms.uSpeed.value = 0.25 + curProg * 1.15;
        } else if (curMode === 'scan') {
          tm.uniforms.uOpacity.value = Math.max(0, (curProg - 0.22) * 1.15);
        } else if (curMode === 'cogitate') {
          // Indices 0..1 = posterior IIT (cobalt), 2..3 = frontal GNWT (red), 4..5 = longitudinal bridge (emerald)
          const showIit = curFocus === 1 || curFocus === 3;
          const showGnwt = curFocus === 2 || curFocus === 3;
          if (i < 2) tm.uniforms.uOpacity.value = showIit ? 0.88 : 0.1;
          else if (i < 4) tm.uniforms.uOpacity.value = showGnwt ? 0.88 : 0.1;
          else tm.uniforms.uOpacity.value = curFocus === 3 ? 0.85 : 0.14;
        }
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
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      // Dispose per-instance materials & tract geometries (cached MRI BufferGeometries stay intact for reuse!)
      cortexMat.dispose();
      cerebMat.dispose();
      subMat.dispose();
      tracts.materials.forEach((m) => m.dispose());
      tracts.geometries.forEach((g) => g.dispose());
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
      resetCamFnRef.current = null;
    };
    // Re-init renderer cleanly if mode/dark changes or enters/leaves near viewport
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inNearViewport, mode, dark]);

  return (
    <div
      ref={hostRef}
      className={`relative select-none overflow-hidden ${className}`}
      role="img"
      aria-label="Интерактивная 3D МРТ-модель мозга человека (FreeSurfer fsaverage5 + SUIT + CIT168)"
    >
      {status === 'loading' && (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center font-mono-tech text-[10.5px] uppercase tracking-[0.14em] ${
            dark ? 'text-[#9AA3B2]' : 'text-[#5E5D59]'
          }`}
        >
          Загрузка МРТ-поверхности fsaverage5…
        </div>
      )}

      {status === 'error' && (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center font-mono-tech text-[11px] ${
            dark ? 'text-[#FCA5A5]' : 'text-[#B91C1C]'
          }`}
        >
          WebGL недоступен на этом устройстве — показан текстовый протокол.
        </div>
      )}

      {/* Subtle Swiss optical HUD footer inside viewport */}
      <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
        <span
          className={`font-mono-tech text-[9.5px] uppercase tracking-[0.11em] px-2 py-0.5 rounded ${
            dark
              ? 'bg-[#0B0E14]/75 text-[#9AA3B2] border border-[#FAF9F5]/10'
              : 'bg-[#FAF9F5]/85 text-[#5E5D59] border border-[#141413]/10'
          }`}
        >
          {caption ?? '3D МРТ · Перетащите для вращения · fsaverage5 + SUIT + CIT168'}
        </span>

        {userDragged && (
          <button
            type="button"
            onClick={() => resetCamFnRef.current?.()}
            className={`pointer-events-auto v6-pill px-2.5 py-1 rounded-full font-mono-tech text-[9.5px] uppercase tracking-[0.1em] inline-flex items-center gap-1 cursor-pointer ${
              dark
                ? 'bg-[#1A202C]/90 text-[#FAF9F5] border border-[#FAF9F5]/18 hover:bg-[#252D3D]'
                : 'bg-[#FAF9F5]/92 text-[#141413] border border-[#141413]/18 hover:bg-[#ECE9DF]'
            }`}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Ракурс</span>
          </button>
        )}
      </div>
    </div>
  );
}
