import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '../data/phase1Copy';
import { PHASE345_COPY, type BrainBeatMode } from '../data/phase345Copy';

gsap.registerPlugin(ScrollTrigger);

// Patch Three.js prototypes ONCE with three-mesh-bvh for <0.1ms zero-lag raycasting
const geoProto = THREE.BufferGeometry.prototype as unknown as {
  computeBoundsTree: typeof computeBoundsTree;
  disposeBoundsTree: typeof disposeBoundsTree;
};
geoProto.computeBoundsTree = computeBoundsTree;
geoProto.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

type LobeHoverKey = keyof typeof PHASE345_COPY.act2.lobeNames;

function regionToLobeKey(name: string): LobeHoverKey {
  const n = name.toLowerCase();
  if (n.includes('frontal')) return 'frontal';
  if (n.includes('parietal')) return 'parietal';
  if (n.includes('occipital')) return 'occipital';
  if (n.includes('temporal')) return 'temporal';
  if (n.includes('thalam')) return 'thalamus';
  return 'cerebellum';
}

interface StudioBrainModelProps {
  mode: BrainBeatMode;
  hoveredLobe: LobeHoverKey | null;
  onHoverLobe: (lobe: LobeHoverKey | null) => void;
  userDraggingRef: React.MutableRefObject<boolean>;
}

// 8 delicate sculptural thalamocortical filaments revealed cleanly during Split-Hemisphere mode
const THALAMOCORTICAL_ARCS: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
  [new THREE.Vector3(0.03, 0.04, 0.05), new THREE.Vector3(0.18, 0.32, 0.34), new THREE.Vector3(0.28, 0.40, 0.52)],
  [new THREE.Vector3(0.04, 0.06, 0.02), new THREE.Vector3(0.26, 0.42, 0.14), new THREE.Vector3(0.36, 0.48, 0.22)],
  [new THREE.Vector3(0.05, 0.07, -0.04), new THREE.Vector3(0.28, 0.44, -0.18), new THREE.Vector3(0.40, 0.46, -0.26)],
  [new THREE.Vector3(0.04, 0.04, -0.08), new THREE.Vector3(0.22, 0.26, -0.44), new THREE.Vector3(0.22, 0.12, -0.70)],
  [new THREE.Vector3(0.04, 0.02, -0.06), new THREE.Vector3(0.26, 0.12, -0.42), new THREE.Vector3(0.24, 0.02, -0.68)],
  [new THREE.Vector3(0.05, -0.02, 0.02), new THREE.Vector3(0.30, 0.04, -0.06), new THREE.Vector3(0.44, 0.06, -0.14)],
  [new THREE.Vector3(0.02, 0.08, 0.08), new THREE.Vector3(0.14, 0.42, 0.28), new THREE.Vector3(0.22, 0.46, 0.46)],
  [new THREE.Vector3(0.02, 0.06, -0.10), new THREE.Vector3(0.16, 0.34, -0.38), new THREE.Vector3(0.18, 0.24, -0.62)],
];

// Generously pulled-back museum studio camera presets so the dorsal crown & brainstem breathe freely on all sides
const CAMERA_PRESETS: Record<BrainBeatMode, { pos: [number, number, number]; target: [number, number, number] }> = {
  iit: { pos: [3.75, 0.52, -3.05], target: [0.0, 0.04, -0.04] },
  gnwt: { pos: [3.75, 0.56, 3.05], target: [0.0, 0.04, 0.04] },
  cogitate: { pos: [4.65, 0.44, 0.35], target: [0.0, 0.04, 0.0] },
  split: { pos: [-4.25, 0.50, 1.42], target: [0.05, 0.04, 0.0] },
};

// Refined mineral bisque & ceramic studio pigments (never garish ketchup-red or Lego-blue!)
const COLOR_ALABASTER = new THREE.Color('#F2EEE5');
const COLOR_CEREBELLUM = new THREE.Color('#E5E0D5');
const COLOR_IIT = new THREE.Color('#DC6A52');
const COLOR_GNWT = new THREE.Color('#3F6FD9');
const COLOR_THALAMUS_ACTIVE = new THREE.Color('#D55A3E');
const COLOR_THALAMUS_IDLE = new THREE.Color('#D8C3B4');
const COLOR_HOVER_TINT = new THREE.Color('#F27852');

function StudioBrainScene({
  mode,
  hoveredLobe,
  onHoverLobe,
  userDraggingRef,
}: StudioBrainModelProps) {
  const { scene } = useGLTF('/models/brain_realistic_clean.glb');
  const rootRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();

  const desiredCamPos = useMemo(() => new THREE.Vector3(...CAMERA_PRESETS.iit.pos), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(...CAMERA_PRESETS.iit.target), []);
  const currentTarget = useMemo(() => new THREE.Vector3(...CAMERA_PRESETS.iit.target), []);
  const targetColorScratch = useMemo(() => new THREE.Color(), []);

  // Clone model once: 100% solid opaque satin bisque materials (ZERO broken-alpha ghost soup!) + BVH
  const { clonedScene, regionEntries } = useMemo(() => {
    const clone = scene.clone(true);
    const entries: {
      name: string;
      lobe: LobeHoverKey;
      isRight: boolean;
      mesh: THREE.Mesh;
      mat: THREE.MeshPhysicalMaterial;
      basePos: THREE.Vector3;
    }[] = [];

    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const geom = mesh.geometry;
        if (geom && !geom.boundsTree) {
          geom.computeBoundsTree();
        }
        const rawName = mesh.name || mesh.parent?.name || '';
        const lobe = regionToLobeKey(rawName);
        const isRight = rawName.endsWith('_R');

        const mat = new THREE.MeshPhysicalMaterial({
          color: lobe === 'cerebellum' ? COLOR_CEREBELLUM.clone() : COLOR_ALABASTER.clone(),
          vertexColors: Boolean(geom.attributes.color),
          roughness: lobe === 'thalamus' ? 0.44 : 0.64,
          metalness: 0.01,
          clearcoat: lobe === 'thalamus' ? 0.18 : 0.06,
          clearcoatRoughness: 0.55,
          transparent: false,
          depthWrite: true,
        });

        mesh.material = mat;
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        entries.push({
          name: rawName,
          lobe,
          isRight,
          mesh,
          mat,
          basePos: mesh.position.clone(),
        });
      }
    });

    return { clonedScene: clone, regionEntries: entries };
  }, [scene]);

  useEffect(() => {
    return () => {
      regionEntries.forEach((e) => {
        e.mat.dispose();
        if (e.mesh.geometry?.boundsTree) {
          e.mesh.geometry.disposeBoundsTree();
        }
      });
    };
  }, [regionEntries]);

  // Slender delicate thalamocortical fiber arcs
  const arcGeometries = useMemo(() => {
    return THALAMOCORTICAL_ARCS.map(([p0, p1, p2]) => {
      const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
      return new THREE.TubeGeometry(curve, 28, 0.0055, 8, false);
    });
  }, []);

  useEffect(() => {
    return () => {
      arcGeometries.forEach((g) => g.dispose());
    };
  }, [arcGeometries]);

  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const splitMixRef = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const lerpSpeed = 1 - Math.exp(-5.8 * dt);

    if (rootRef.current) {
      rootRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.85) * 0.022;
    }

    if (!userDraggingRef.current) {
      const preset = CAMERA_PRESETS[mode];
      desiredCamPos.set(...preset.pos);
      desiredTarget.set(...preset.target);
      camera.position.lerp(desiredCamPos, 1 - Math.exp(-3.6 * dt));
      currentTarget.lerp(desiredTarget, 1 - Math.exp(-4.0 * dt));
      camera.lookAt(currentTarget);
    }

    const targetSplit = mode === 'split' ? 1 : 0;
    splitMixRef.current += (targetSplit - splitMixRef.current) * lerpSpeed;
    const split = splitMixRef.current;

    if (arcsGroupRef.current) {
      arcsGroupRef.current.visible = split > 0.35;
      arcsGroupRef.current.scale.setScalar(0.86 + split * 0.14);
    }

    for (let i = 0; i < regionEntries.length; i++) {
      const entry = regionEntries[i];
      const { lobe, isRight, mesh, mat, basePos } = entry;

      targetColorScratch.copy(lobe === 'cerebellum' ? COLOR_CEREBELLUM : COLOR_ALABASTER);

      if (mode === 'iit' && (lobe === 'occipital' || lobe === 'parietal')) {
        targetColorScratch.copy(COLOR_IIT);
      } else if (mode === 'gnwt' && lobe === 'frontal') {
        targetColorScratch.copy(COLOR_GNWT);
      } else if (mode === 'cogitate') {
        if (lobe === 'occipital' || lobe === 'parietal') {
          targetColorScratch.copy(COLOR_IIT);
        } else if (lobe === 'frontal') {
          targetColorScratch.lerp(COLOR_GNWT, 0.72);
        }
      } else if (mode === 'split') {
        if (lobe === 'thalamus') {
          targetColorScratch.copy(COLOR_THALAMUS_ACTIVE);
        }
      } else if (lobe === 'thalamus') {
        targetColorScratch.copy(COLOR_THALAMUS_IDLE);
      }

      if (hoveredLobe && hoveredLobe === lobe) {
        targetColorScratch.lerp(COLOR_HOVER_TINT, 0.28);
      }

      mat.color.lerp(targetColorScratch, lerpSpeed);

      // Clean Architectural Cutaway: right hemisphere glides cleanly away & retracts without muddy alpha!
      if (isRight) {
        mesh.position.x = basePos.x - split * 1.45;
        mesh.position.y = basePos.y + split * 0.12;
        const retractScale = Math.max(0.001, 1 - Math.max(0, (split - 0.25) / 0.75));
        mesh.scale.setScalar(retractScale);
        mesh.visible = split < 0.88;
      }
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const hitName = e.object.name || e.object.parent?.name || '';
    onHoverLobe(regionToLobeKey(hitName));
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    onHoverLobe(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <>
      {/* Diffused Gallery Overhead Studio Lighting (soft travertine warmth, zero harsh diagonal cast!) */}
      <ambientLight intensity={0.62} color="#FAF7F0" />
      <directionalLight position={[3.2, 6.8, 3.8]} intensity={1.12} color="#FFFBF4" />
      <directionalLight position={[-4.5, 4.2, -3.2]} intensity={0.58} color="#E6EEFA" />
      <directionalLight position={[0.0, -3.5, 2.0]} intensity={0.28} color="#F2E4D2" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 7, 1]} rotation={[Math.PI / 2, 0, 0]} scale={[9, 5, 1]} color="#FFFDF8" />
        <Lightformer form="circle" intensity={1.25} position={[-6, 2, 3]} rotation={[0, Math.PI / 2, 0]} scale={4} color="#EBF1FC" />
        <Lightformer form="circle" intensity={1.1} position={[6, 2, -4]} rotation={[0, -Math.PI / 2, 0]} scale={4} color="#FDF0E2" />
      </Environment>

      <group ref={rootRef}>
        <primitive
          object={clonedScene}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />

        {/* 8 Delicate Emerald Thalamocortical Filaments (only on Split Cutaway) */}
        <group ref={arcsGroupRef} visible={false}>
          {arcGeometries.map((geom, idx) => (
            <mesh key={idx} geometry={geom}>
              <meshStandardMaterial
                color="#0D7A5F"
                roughness={0.35}
                metalness={0.08}
                emissive="#0D7A5F"
                emissiveIntensity={0.26}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* Soft Diffused Studio Pedestal AO Contact Shadow Centered Directly Beneath the Brain */}
      <ContactShadows
        position={[0, -1.06, 0]}
        opacity={0.28}
        scale={4.2}
        blur={2.8}
        far={2.0}
        color="#4B4033"
        frames={1}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.62}
        onStart={() => {
          userDraggingRef.current = true;
        }}
        onEnd={() => {
          window.setTimeout(() => {
            userDraggingRef.current = false;
          }, 2600);
        }}
      />
    </>
  );
}

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="w-full h-full flex items-center justify-center p-8 text-center text-sm text-[#5E5D59]">
          3D WebGL context unavailable on this device.
        </div>
      );
    }
    return this.props.children;
  }
}

interface Act2BrainPedestalProps {
  lang: Lang;
  onActiveChange: (active: boolean) => void;
}

export function Act2BrainPedestal({ lang, onActiveChange }: Act2BrainPedestalProps) {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const userDraggingRef = useRef(false);

  const [scrollMode, setScrollMode] = useState<BrainBeatMode>('iit');
  const [manualMode, setManualMode] = useState<BrainBeatMode | null>(null);
  const [hoveredLobe, setHoveredLobe] = useState<LobeHoverKey | null>(null);
  const [isInView, setIsInView] = useState(false);

  const activeMode: BrainBeatMode = manualMode ?? scrollMode;

  useEffect(() => {
    const el = runwayRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '250px 0px 250px 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;

    const trigger = ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.45,
      onToggle: (self) => {
        onActiveChange(self.isActive);
        if (!self.isActive) setManualMode(null);
      },
      onUpdate: (self) => {
        const p = self.progress;
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }
        const next: BrainBeatMode =
          p < 0.26 ? 'iit' : p < 0.54 ? 'gnwt' : p < 0.80 ? 'cogitate' : 'split';
        setScrollMode((prev) => {
          if (prev !== next) setManualMode(null);
          return next;
        });
      },
    });

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => {
      window.clearTimeout(refreshTimer);
      trigger.kill();
    };
  }, [onActiveChange]);

  const copy = PHASE345_COPY.act2;
  const beat = copy.beats[activeMode];
  const hoveredInfo = hoveredLobe ? copy.lobeNames[hoveredLobe] : null;

  return (
    <section
      id="act-2"
      ref={runwayRef}
      className="relative h-[340vh] bg-[#F2EFE7] text-[#141413]"
      aria-label={lang === 'ru' ? 'Зал 02 — Анатомический пьедестал 3D' : 'Chamber 02 — Anatomical 3D Pedestal'}
    >
      {/* Sticky Full-Viewport Warm Travertine Studio Stage — STRICT 42% Left Editorial / 58% Right Open 3D Studio */}
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between"
        style={{
          background:
            'radial-gradient(circle at 70% 50%, #FDFCF9 0%, #F3F0E8 52%, #EAE5D9 100%)',
        }}
      >
        {/* Architectural Concentric Gallery Ring Centered Behind the 3D Sculpture on the Right */}
        <div className="pointer-events-none hidden lg:flex absolute top-0 bottom-0 left-[42%] right-0 items-center justify-center">
          <div className="w-[460px] h-[460px] xl:w-[540px] xl:h-[540px] rounded-full border border-[#141413]/7" />
        </div>

        {/* Dedicated Open Right-Stage 3D Canvas with Soft Left Edge Feathering (Zero Vertical Seam!) */}
        <div
          className="absolute inset-x-0 bottom-14 h-[46vh] lg:inset-y-0 lg:left-[40%] lg:right-0 lg:h-full z-10"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 11%, black 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 11%, black 100%)',
          }}
        >
          <WebGLBoundary>
            <Canvas
              frameloop={isInView ? 'always' : 'never'}
              dpr={[1, 2]}
              camera={{ position: CAMERA_PRESETS.iit.pos, fov: 31, near: 0.1, far: 40 }}
              gl={{
                antialias: true,
                powerPreference: 'high-performance',
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.02,
              }}
              style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
            >
              <Suspense fallback={null}>
                <StudioBrainScene
                  mode={activeMode}
                  hoveredLobe={hoveredLobe}
                  onHoverLobe={setHoveredLobe}
                  userDraggingRef={userDraggingRef}
                />
              </Suspense>
            </Canvas>
          </WebGLBoundary>
        </div>

        {/* Left 40% Clean Warm Travertine Editorial Column (100% Unobstructed Legibility!) */}
        <div className="relative z-20 pointer-events-none max-w-[1400px] w-full mx-auto px-5 md:px-12 lg:px-16 pt-22 md:pt-28">
          <div className="lg:w-[39%] max-w-[490px] pointer-events-auto">
            <div className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
              {copy.eyebrow[lang]}
            </div>

            <div className="mt-4 font-mono-tech text-[11px] tracking-[0.04em] text-[#D94225] font-semibold">
              {beat.kicker[lang]}
            </div>

            <h2
              key={activeMode}
              className="mt-2.5 text-[clamp(25px,2.9vw,42px)] leading-[1.1] tracking-[-0.026em] text-[#141413] animate-[beatRise_380ms_cubic-bezier(0.22,1,0.36,1)]"
            >
              <span className="font-display font-bold block">{beat.titleMain[lang]}</span>
              <span className="font-serif-editorial italic font-normal text-[#4B4A46] block mt-1">
                {beat.titleAccent[lang]}
              </span>
            </h2>

            <p
              key={`b2-${activeMode}`}
              className="mt-4 text-[14px] md:text-[15px] leading-[1.62] text-[#3B3A37] animate-[beatRise_440ms_cubic-bezier(0.22,1,0.36,1)]"
            >
              {beat.body[lang]}
            </p>

            {/* Clean Hairline Empirical Readout */}
            <div className="mt-6 pt-4 border-t border-[#141413]/12">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#5E5D59]">
                {beat.statLabel[lang]}
              </div>
              <div className="font-mono-tech text-[12.5px] font-semibold text-[#141413] mt-1">
                {beat.statValue[lang]}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Studio Controls: Left Mode Pills + Right Single-Line Helper / Instant BVH Badge */}
        <div className="relative z-20 pointer-events-none max-w-[1400px] w-full mx-auto px-5 md:px-12 lg:px-16 pb-6 md:pb-8 flex flex-wrap items-center justify-between gap-4">
          {/* Interactive Mode Switcher Pills */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
            {copy.modes.map((m) => {
              const isSelected = m.id === activeMode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    userDraggingRef.current = false;
                    setManualMode(m.id);
                  }}
                  className={`v6-pill px-3.5 py-2 rounded-full border font-mono-tech text-[11.5px] font-medium cursor-pointer ${
                    isSelected
                      ? 'text-[#FAF9F5] shadow-md'
                      : 'bg-[#FAF9F5]/88 text-[#141413] border-[#141413]/12 hover:bg-[#FAF9F5]'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: m.color, borderColor: m.color }
                      : undefined
                  }
                >
                  {m.label[lang]}
                </button>
              );
            })}
          </div>

          {/* Right: Sleek Single-Line Studio Helper Pill OR Instant BVH Anatomical Readout */}
          <div className="pointer-events-auto flex items-center gap-3">
            <div className="hidden xl:block w-24 h-[3px] rounded-full bg-[#141413]/12 overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full w-full origin-left bg-[#FC4109]"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>

            <div className="px-4 py-2 rounded-full bg-[#FAF9F5]/92 backdrop-blur-md border border-[#141413]/12 shadow-[0_10px_28px_rgba(20,20,19,0.07)]">
              {hoveredInfo ? (
                <div className="flex items-center gap-2.5 text-[12px]">
                  <span className="w-2 h-2 rounded-full bg-[#D94225] shrink-0" />
                  <span className="font-display font-semibold text-[#141413] whitespace-nowrap">
                    {hoveredInfo.title[lang]}
                  </span>
                  <span className="hidden xl:inline text-[#5E5D59] truncate max-w-[260px]">
                    · {hoveredInfo.role[lang]}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 font-mono-tech text-[11px] text-[#4B4A46] whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-[#0D7A5F] shrink-0" />
                  <span>{copy.dragHint[lang]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

useGLTF.preload('/models/brain_realistic_clean.glb');
