import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ErrorInfo,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

type OrbitControlsImpl = ComponentRef<typeof OrbitControls>;

// ============================================================================
// Public Contract
// ============================================================================

export type SceneChapterId =
  | 'hero'
  | 'ch1'
  | 'ch2'
  | 'ch3'
  | 'ch4'
  | 'ch5'
  | 'ch6'
  | 'epilogue';

export type BrainTheoryId = 'gnwt' | 'iit' | 'pp' | 'hot' | 'rpt';
export type ObservatoryScaleMode =
  | 'auto'
  | 'macro'
  | 'connectome'
  | 'neurons'
  | 'slice';
export type MriSliceAxis = 'sagittal' | 'axial' | 'coronal';

export interface HoveredAnatomyInfo {
  label: string;
  region: string;
  category: string;
  side?: string;
}

export interface ConsciousnessCanvas3DProps {
  scrollProgress: MutableRefObject<number>;
  activeChapter: SceneChapterId;
  activeTheory: BrainTheoryId;
  pciPulseNonce: number;
  pciPulseValue: number;
  predictivePrior: number;
  reducedMotion: boolean;
  scaleMode?: ObservatoryScaleMode;
  sliceAxis?: MriSliceAxis;
  sliceOffset?: number;
  onHoverAnatomy?: (info: HoveredAnatomyInfo | null) => void;
}

// ============================================================================
// Restrained Architectural Ivory-Silver & Biotech Clinical Palette
// (ZERO radioactive turquoise jelly, ZERO opaque grey clay!)
// ============================================================================

// Baseline Z-Anatomy Cortical Point-Cloud Regional Palette
const COLOR_PT_FRONTAL = new THREE.Color('#E8C5B0'); // Warm Champagne-Peach Ivory
const COLOR_PT_PARIETAL = new THREE.Color('#DFCFA8'); // Architectural Champagne Gold
const COLOR_PT_OCCIPITAL = new THREE.Color('#A8D5CF'); // Soft Sage-Silver
const COLOR_PT_TEMPORAL = new THREE.Color('#C8C0B4'); // Warm Alabaster-Silver
const COLOR_PT_LIMBIC = new THREE.Color('#E2C29B'); // Warm Amber-Ivory
const COLOR_PT_CEREBELLUM = new THREE.Color('#928D84'); // Foliated Stone-Silver
const COLOR_PT_BRAINSTEM = new THREE.Color('#7C7870'); // Basal Graphite-Silver

// Dark depth-occluding inner cortical shell (eliminates translucent triangle soup)
const COLOR_DARK_HULL = new THREE.Color('#151514');
const COLOR_DARK_EMISSIVE = new THREE.Color('#090908');
const COLOR_SLICE_CORTEX = new THREE.Color('#C8C2B6');

// Functional Highlight & DTI Tractography Palette
const COLOR_TERRACOTTA = new THREE.Color('#E05A47'); // Surgical Terracotta
const COLOR_WARM_AMBER = new THREE.Color('#D99B4E'); // Warm Amber-Gold
const COLOR_BIO_TEAL = new THREE.Color('#2AB3A6'); // Clinical Bio-Teal
const COLOR_SOFT_TEAL = new THREE.Color('#68B8AE'); // Softened Teal-Sage
const COLOR_CHAMPAGNE = new THREE.Color('#E6DEC8'); // Warm Ivory-Champagne
const COLOR_DIM_GRAPHITE = new THREE.Color('#5C5954'); // Dimmed Inactive Graphite
const COLOR_ARTERIAL_CRIMSON = new THREE.Color('#C94A40');
const COLOR_VENTRICLE_SLATE = new THREE.Color('#68899E');

// Normalized target brain size (2.12 units) with generous studio negative space
const TARGET_BRAIN_SPAN = 2.12;
const BRAIN_Y_OFFSET = 0.08;

// Right-hemisphere dorsal premotor/parietal TMS stimulation locus
const TMS_LOCUS = new THREE.Vector3(-0.41, 0.74, 0.14);

interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  autoRotateSpeed: number;
  lockBrainYaw: boolean;
  targetYaw: number;
}

const CAMERA_PRESETS: Record<SceneChapterId, CameraPreset> = {
  hero: {
    position: [2.88, 0.94, 3.08],
    target: [0, 0.04, 0],
    autoRotateSpeed: 0.1,
    lockBrainYaw: false,
    targetYaw: 0.25,
  },
  ch1: {
    position: [2.82, 0.9, -2.75],
    target: [0, 0.03, -0.04],
    autoRotateSpeed: 0.0,
    lockBrainYaw: true,
    targetYaw: 0.0,
  },
  ch2: {
    position: [3.88, 0.6, 0.7],
    target: [0, 0.04, 0.0],
    autoRotateSpeed: 0.0,
    lockBrainYaw: true,
    targetYaw: 0.0,
  },
  ch3: {
    position: [-2.74, 2.0, 2.74],
    target: [0, 0.04, 0.0],
    autoRotateSpeed: 0.0,
    lockBrainYaw: true,
    targetYaw: 0.0,
  },
  ch4: {
    position: [0.0, 0.12, 4.28],
    target: [0, 0.04, 0],
    autoRotateSpeed: 0.07,
    lockBrainYaw: false,
    targetYaw: 0.0,
  },
  ch5: {
    position: [-0.38, 3.84, 1.54],
    target: [0, 0.04, 0.0],
    autoRotateSpeed: 0.0,
    lockBrainYaw: true,
    targetYaw: 0.0,
  },
  ch6: {
    position: [-2.82, 1.06, 2.86],
    target: [0, 0.04, 0],
    autoRotateSpeed: 0.085,
    lockBrainYaw: false,
    targetYaw: -0.25,
  },
  epilogue: {
    position: [2.65, 0.86, 2.98],
    target: [0, 0.04, 0],
    autoRotateSpeed: 0.075,
    lockBrainYaw: false,
    targetYaw: 0.2,
  },
};

const SLICE_CAMERA_PRESETS: Record<MriSliceAxis, [number, number, number]> = {
  sagittal: [3.25, 0.72, 2.15],
  axial: [2.15, 3.15, 2.15],
  coronal: [2.25, 0.78, 3.25],
};

function resolveEffectiveMode(
  scaleMode: ObservatoryScaleMode | undefined,
  activeChapter: SceneChapterId,
): 'macro' | 'connectome' | 'neurons' | 'slice' {
  if (scaleMode && scaleMode !== 'auto') {
    return scaleMode;
  }
  if (activeChapter === 'ch4') {
    return 'neurons';
  }
  if (activeChapter === 'ch6' || activeChapter === 'epilogue') {
    return 'connectome';
  }
  return 'macro';
}

function createMulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function shortestAngleDelta(current: number, target: number): number {
  const diff = (target - current) % (Math.PI * 2);
  if (diff > Math.PI) return diff - Math.PI * 2;
  if (diff < -Math.PI) return diff + Math.PI * 2;
  return diff;
}

// ============================================================================
// Z-Anatomy Metadata & Sub-Hub Classification Helpers
// ============================================================================

type CorticalLobeGroup =
  | 'frontal'
  | 'parietal'
  | 'occipital'
  | 'temporal'
  | 'insula'
  | 'limbic'
  | 'other';

/**
 * Functional group index (0..8) stored per point in the 28,000-point Z-Anatomy cloud:
 *   0 = Frontal Prefrontal Workspace Hub
 *   1 = Frontal Motor / Precentral
 *   2 = Parietal Workspace Hub (Angular / Supramarginal / Precuneus)
 *   3 = Parietal Somatosensory / Postcentral
 *   4 = Occipital Primary Visual V1 (Calcarine / Cuneus / Lingual)
 *   5 = Occipital Lateral Association
 *   6 = Temporal Lobe
 *   7 = Insula & Limbic Cingulate
 *   8 = Cerebellum & Brainstem
 */
type PointFunctionalGroup = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface AnatomyStructureRecord {
  id: string;
  mesh: THREE.Mesh;
  material: THREE.MeshPhysicalMaterial;
  category: string;
  region: string;
  label: string;
  side: 'left' | 'right' | 'median';
  lobeGroup: CorticalLobeGroup;
  functionalGroup: PointFunctionalGroup;
  basePointColor: THREE.Color;
  centroid: THREE.Vector3;
  distFromTms: number;
  isPrefrontalWorkspaceHub: boolean;
  isParietalWorkspaceHub: boolean;
  isPrimaryVisualV1: boolean;
  isOpticOrVisualTract: boolean;
  targetColor: THREE.Color;
  targetEmissive: THREE.Color;
}

function classifyLobeGroup(
  category: string,
  region: string,
  label: string,
  centroid: THREE.Vector3,
): CorticalLobeGroup {
  if (category !== 'cortex') return 'other';
  const r = region.toLowerCase();
  const l = label.toLowerCase();

  if (
    r.includes('frontal') ||
    l.includes('frontal') ||
    l.includes('precentral') ||
    l.includes('rectus') ||
    l.includes('orbital') ||
    l.includes('subcallosal') ||
    l.includes('paracentral') ||
    l.includes('triangular') ||
    l.includes('opercular')
  ) {
    return 'frontal';
  }
  if (
    r.includes('parietal') ||
    l.includes('parietal') ||
    l.includes('postcentral') ||
    l.includes('supramarginal') ||
    l.includes('angular') ||
    l.includes('precuneus') ||
    l.includes('jensen') ||
    l.includes('central sulcus')
  ) {
    return 'parietal';
  }
  if (
    r.includes('occipital') ||
    l.includes('occipital') ||
    l.includes('calcarine') ||
    l.includes('cuneus') ||
    l.includes('lingual')
  ) {
    return 'occipital';
  }
  if (
    r.includes('temporal') ||
    l.includes('temporal') ||
    l.includes('fusiform') ||
    l.includes('collateral') ||
    l.includes('hippocamp') ||
    l.includes('lat fis')
  ) {
    return 'temporal';
  }
  if (r.includes('insula') || l.includes('insula')) {
    return 'insula';
  }
  if (r.includes('limbic') || l.includes('cingulate')) {
    return 'limbic';
  }

  if (centroid.z > 0.2) return 'frontal';
  if (centroid.z < -0.42) return 'occipital';
  if (centroid.y > 0.12) return 'parietal';
  return 'temporal';
}

function getBasePointColor(
  category: string,
  lobeGroup: CorticalLobeGroup,
): THREE.Color {
  if (category === 'cerebellum') return COLOR_PT_CEREBELLUM;
  if (category === 'brainstem') return COLOR_PT_BRAINSTEM;
  switch (lobeGroup) {
    case 'frontal':
      return COLOR_PT_FRONTAL;
    case 'parietal':
      return COLOR_PT_PARIETAL;
    case 'occipital':
      return COLOR_PT_OCCIPITAL;
    case 'temporal':
      return COLOR_PT_TEMPORAL;
    case 'insula':
    case 'limbic':
      return COLOR_PT_LIMBIC;
    default:
      return COLOR_PT_PARIETAL;
  }
}

function formatCategoryDisplay(cat: string): string {
  switch (cat) {
    case 'cortex':
      return 'Cerebral Cortex (Gyri & Sulci)';
    case 'tracts':
      return 'White-Matter Association Tract';
    case 'white_matter':
      return 'Commissural White Matter';
    case 'diencephalon':
      return 'Diencephalon (Thalamic Nuclei)';
    case 'deep_grey':
      return 'Deep Subcortical Nuclei (Basal Ganglia)';
    case 'cerebellum':
      return 'Cerebellum';
    case 'brainstem':
      return 'Brainstem';
    case 'ventricles':
      return 'Ventricular System';
    case 'arteries':
      return 'Cerebral Vasculature';
    default:
      return cat;
  }
}

// ============================================================================
// Custom GLSL Shader for the 28,000-Point Z-Anatomy Cortical Scan
// ============================================================================

const Z_ANATOMY_POINTS_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aBaseColor;
  attribute float aGroup;
  attribute float aSide;
  attribute float aPhase;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uGroupColor[9];
  uniform float uGroupAlpha[9];
  uniform float uGroupSize[9];
  uniform float uRightHemiAlphaMult;
  uniform float uTmsActive;
  uniform float uTmsAge;
  uniform float uTmsHighPci;
  uniform vec3 uTmsLocus;
  uniform float uClipActive;
  uniform vec3 uClipNormal;
  uniform float uClipConstant;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vClipDist;

  void main() {
    int gIdx = int(clamp(aGroup + 0.5, 0.0, 8.0));
    vec3 targetCol = uGroupColor[gIdx];
    float groupAlpha = uGroupAlpha[gIdx];
    float groupSize = uGroupSize[gIdx];

    vec4 worldPos4 = modelMatrix * vec4(position, 1.0);
    vec3 worldPos = worldPos4.xyz;
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vec3 viewDir = normalize(cameraPosition - worldPos);

    // Clipping plane signed distance (for 3D MRI Slicer mode)
    vClipDist = dot(worldPos, uClipNormal) + uClipConstant;

    // Normal-based rim prominence: outer gyral ridges & sulcal edges are crisp and luminous,
    // while front-facing center points are slightly softer so internal DTI tracts shine through!
    float ndotv = clamp(abs(dot(worldNormal, viewDir)), 0.0, 1.0);
    float rim = pow(1.0 - ndotv, 1.35);

    // Subtle organic gyral relief shimmer
    float shimmer = 0.94 + 0.06 * sin(uTime * 1.8 + aPhase);
    vec3 finalColor = mix(aBaseColor * 0.45, targetCol, clamp(groupAlpha * 1.15, 0.0, 1.0)) * shimmer;
    finalColor *= (0.76 + 0.48 * rim);

    float finalAlpha = groupAlpha * (0.48 + 0.52 * rim);

    // COGITATE ch3 right-hemisphere surgical window cutaway
    if (aSide < -0.5) {
      finalAlpha *= uRightHemiAlphaMult;
    }

    // ch5 Dorsal TMS 3D Activation Wave across cortical points
    if (uTmsActive > 0.5) {
      float distFromTms = distance(position, uTmsLocus);
      float waveSpeed = uTmsHighPci > 0.5 ? 1.28 : 0.78;
      float maxReach = uTmsHighPci > 0.5 ? 2.25 : 0.56;
      if (distFromTms <= maxReach) {
        float waveRadius = uTmsAge * waveSpeed;
        float primaryFront = smoothstep(0.34, 0.0, abs(distFromTms - waveRadius));
        float reverbFront = uTmsHighPci > 0.5
          ? smoothstep(0.40, 0.0, abs(distFromTms - (waveRadius - 0.56))) * 0.75
          : 0.0;
        float env = uTmsHighPci > 0.5
          ? smoothstep(3.4, 0.35, uTmsAge)
          : smoothstep(1.3, 0.15, uTmsAge);
        float act = clamp((primaryFront + reverbFront) * env, 0.0, 1.0);

        if (act > 0.01) {
          if (uTmsHighPci > 0.5) {
            vec3 tmsCol = mix(vec3(0.165, 0.702, 0.651), vec3(0.851, 0.608, 0.306), clamp(distFromTms / 1.65, 0.0, 1.0));
            finalColor = mix(finalColor, tmsCol * 1.45, act);
            finalAlpha = max(finalAlpha, 0.95 * act);
            groupSize += act * 1.15;
          } else if (aSide < -0.5) {
            vec3 tmsCol = vec3(0.878, 0.353, 0.278);
            finalColor = mix(finalColor, tmsCol * 1.4, act);
            finalAlpha = max(finalAlpha, 0.92 * act);
            groupSize += act * 0.95;
          }
        }
      }
    }

    // Highlight points right along the 3D MRI Laser Cut Plane boundary
    if (uClipActive > 0.5 && vClipDist >= 0.0 && vClipDist < 0.055) {
      float cutGlow = 1.0 - (vClipDist / 0.055);
      finalColor = mix(finalColor, vec3(0.95, 0.68, 0.32) * 1.45, cutGlow * 0.85);
      finalAlpha = max(finalAlpha, 0.95);
      groupSize += cutGlow * 0.85;
    }

    vColor = finalColor;
    vAlpha = clamp(finalAlpha, 0.0, 0.98);

    vec4 mvPosition = viewMatrix * worldPos4;
    gl_Position = projectionMatrix * mvPosition;

    float perspectiveSize = groupSize * uPixelRatio * (4.1 / max(-mvPosition.z, 1.2));
    gl_PointSize = clamp(perspectiveSize * (0.82 + 0.32 * rim), 1.1, 6.5);
  }
`;

const Z_ANATOMY_POINTS_FRAGMENT_SHADER = /* glsl */ `
  uniform float uClipActive;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vClipDist;

  void main() {
    if (uClipActive > 0.5 && vClipDist < 0.0) {
      discard;
    }
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) {
      discard;
    }
    float softDisc = exp(-r2 * 2.4);
    gl_FragColor = vec4(vColor, vAlpha * softDisc);
  }
`;

// ============================================================================
// 1. Instant Uncompressed Suspense Placeholder: FallbackLobesBrain (98 KB)
// ============================================================================

function FallbackLobesBrain({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const gltf = useGLTF('./models/brain_lobes.glb');
  const groupRef = useRef<THREE.Group | null>(null);

  const placeholderGroup = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.updateMatrixWorld(true);

    const box = new THREE.Box3();
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.name === 'Cube' || mesh.parent?.name === 'Cube') {
          mesh.visible = false;
          return;
        }
        box.expandByObject(mesh);
      }
    });

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const scale = (TARGET_BRAIN_SPAN * 0.98) / maxDim;

    const pts: number[] = [];
    const cols: number[] = [];
    const tempV = new THREE.Vector3();

    root.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      if (!mesh.visible) return;
      const n = mesh.name.toLowerCase();
      let col = COLOR_PT_PARIETAL;
      if (n.includes('frontal')) col = COLOR_PT_FRONTAL;
      else if (n.includes('occipital')) col = COLOR_PT_OCCIPITAL;
      else if (n.includes('temporal')) col = COLOR_PT_TEMPORAL;
      else if (n.includes('cerebellum')) col = COLOR_PT_CEREBELLUM;

      const posAttr = mesh.geometry.attributes.position as THREE.BufferAttribute | undefined;
      if (posAttr) {
        for (let i = 0; i < posAttr.count; i++) {
          tempV.fromBufferAttribute(posAttr, i);
          tempV.applyMatrix4(mesh.matrixWorld);
          const x = -(tempV.x - center.x) * scale;
          const y = (tempV.y - center.y) * scale + BRAIN_Y_OFFSET;
          const z = -(tempV.z - center.z) * scale;
          pts.push(x, y, z);
          cols.push(col.r, col.g, col.b);
        }
      }
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(cols), 3));

    const mat = new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });

    const wrapper = new THREE.Group();
    wrapper.add(new THREE.Points(geom, mat));
    return wrapper;
  }, [gltf.scene]);

  useFrame((_, delta) => {
    if (!reducedMotion && groupRef.current) {
      groupRef.current.rotation.y += Math.min(delta, 0.05) * 0.09;
    }
  });

  return <primitive ref={groupRef} object={placeholderGroup} />;
}

// ============================================================================
// 2. Real 437-Structure Z-Anatomy 3D Brain:
//    Dark Inner Occluding Shell + ~29,000-Point Z-Anatomy Cortical Scan +
//    184 3D DTI Fiber Streamlines + Interactive 3D MRI Cross-Section Slicer
// ============================================================================

interface DtiFiberSpec {
  curve: THREE.CatmullRomCurve3;
  tractKind: 'callosal' | 'frontoParietal' | 'thalamocortical' | 'ventralVisual';
  color: THREE.Color;
  isTopDown: boolean;
}

interface ZAnatomyBrainProps {
  activeChapter: SceneChapterId;
  activeTheory: BrainTheoryId;
  effectiveMode: 'macro' | 'connectome' | 'neurons' | 'slice';
  sliceAxis: MriSliceAxis;
  sliceOffset: number;
  pciPulseNonce: number;
  pciPulseValue: number;
  predictivePrior: number;
  reducedMotion: boolean;
  onHoverAnatomy?: (info: HoveredAnatomyInfo | null) => void;
}

function ZAnatomyBrain({
  activeChapter,
  activeTheory,
  effectiveMode,
  sliceAxis,
  sliceOffset,
  pciPulseNonce,
  pciPulseValue,
  predictivePrior,
  reducedMotion,
  onHoverAnatomy,
}: ZAnatomyBrainProps) {
  const gltf = useGLTF('./models/brain_anatomy.glb', './draco/');
  const outerGroupRef = useRef<THREE.Group | null>(null);
  const tmsCoilRef = useRef<THREE.Group | null>(null);
  const tmsWaveRingRef = useRef<THREE.Mesh | null>(null);
  const mriLaserFrameRef = useRef<THREE.Group | null>(null);
  const mriScanlineRef = useRef<THREE.Mesh | null>(null);

  const hoveredIdRef = useRef<string | null>(null);
  const pulseStateRef = useRef({
    active: false,
    age: 99,
    value: pciPulseValue,
    lastNonce: pciPulseNonce,
    autoCooldown: 1.4,
  });

  const rotationStateRef = useRef({
    yaw: 0.25,
    modeScale: effectiveMode === 'neurons' ? 0.001 : 1,
    dampedSliceOffset: sliceOffset,
    dampedRightHemiAlpha: 1.0,
  });

  // Smoothly damped per-group state for the 9 functional point-cloud territories
  const pointGroupStateRef = useRef<{
    colors: THREE.Color[];
    targetColors: THREE.Color[];
    alphas: number[];
    targetAlphas: number[];
    sizes: number[];
    targetSizes: number[];
  }>({
    colors: [
      COLOR_PT_FRONTAL.clone(),
      COLOR_PT_FRONTAL.clone(),
      COLOR_PT_PARIETAL.clone(),
      COLOR_PT_PARIETAL.clone(),
      COLOR_PT_OCCIPITAL.clone(),
      COLOR_PT_OCCIPITAL.clone(),
      COLOR_PT_TEMPORAL.clone(),
      COLOR_PT_LIMBIC.clone(),
      COLOR_PT_CEREBELLUM.clone(),
    ],
    targetColors: [
      COLOR_PT_FRONTAL.clone(),
      COLOR_PT_FRONTAL.clone(),
      COLOR_PT_PARIETAL.clone(),
      COLOR_PT_PARIETAL.clone(),
      COLOR_PT_OCCIPITAL.clone(),
      COLOR_PT_OCCIPITAL.clone(),
      COLOR_PT_TEMPORAL.clone(),
      COLOR_PT_LIMBIC.clone(),
      COLOR_PT_CEREBELLUM.clone(),
    ],
    alphas: [0.85, 0.82, 0.85, 0.82, 0.85, 0.82, 0.82, 0.8, 0.72],
    targetAlphas: [0.85, 0.82, 0.85, 0.82, 0.85, 0.82, 0.82, 0.8, 0.72],
    sizes: [2.0, 1.85, 2.0, 1.85, 2.0, 1.85, 1.85, 1.8, 1.65],
    targetSizes: [2.0, 1.85, 2.0, 1.85, 2.0, 1.85, 1.85, 1.8, 1.65],
  });

  // Shared world-space clipping plane for Interactive 3D MRI Cross-Section Slicer
  const worldClipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.15),
    [],
  );

  // Clone and normalize the 437 Z-Anatomy medical structures +
  // extract ~29,000 outer surface points + build 184 3D DTI Fiber Streamlines
  const {
    normalizedBrainGroup,
    records,
    recordByUuid,
    zAnatomyPointsGeometry,
    zAnatomyPointsMaterial,
    dtiFibers,
    dtiLineGeometry,
    dtiLineMaterial,
    mriFrameBorderGeometry,
    mriFrameGridGeometry,
  } = useMemo(() => {
    const clonedRoot = gltf.scene.clone(true);
    clonedRoot.updateMatrixWorld(true);

    // 1. Compute bounding box across cortex, cerebellum, diencephalon, and tracts
    const refBox = new THREE.Box3();
    clonedRoot.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const ud = { ...(mesh.parent?.userData ?? {}), ...(mesh.userData ?? {}) };
      const cat = String(ud.bx_cat ?? '');
      if (
        cat === 'cortex' ||
        cat === 'cerebellum' ||
        cat === 'diencephalon' ||
        cat === 'tracts'
      ) {
        refBox.expandByObject(mesh);
      }
    });

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    refBox.getCenter(center);
    refBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const uniformScale = TARGET_BRAIN_SPAN / maxDim;

    clonedRoot.position.set(
      -center.x * uniformScale,
      -center.y * uniformScale + BRAIN_Y_OFFSET,
      -center.z * uniformScale,
    );
    clonedRoot.scale.setScalar(uniformScale);
    clonedRoot.updateMatrixWorld(true);

    const structureRecords: AnatomyStructureRecord[] = [];
    const uuidMap = new Map<string, AnatomyStructureRecord>();
    const meshBox = new THREE.Box3();

    // Buffers for the ~29,000-point Z-Anatomy Cortical Scan
    const ptPositions: number[] = [];
    const ptNormals: number[] = [];
    const ptBaseColors: number[] = [];
    const ptGroups: number[] = [];
    const ptSides: number[] = [];
    const ptPhases: number[] = [];

    const rng = createMulberry32(20261128);
    const tempV = new THREE.Vector3();
    const tempN = new THREE.Vector3();
    const outwardDir = new THREE.Vector3();
    const normalMatrix = new THREE.Matrix3();

    clonedRoot.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const ud = { ...(mesh.parent?.userData ?? {}), ...(mesh.userData ?? {}) };

      const category = String(ud.bx_cat ?? 'cortex');
      const region = String(ud.bx_region ?? 'Cerebral Cortex');
      const label = String(
        ud.bx_label ?? (mesh.name.replace(/\.(l|r)$/i, '') || 'Cortical Structure'),
      );
      const rawSide = String(ud.bx_side ?? '');
      const side: 'left' | 'right' | 'median' =
        rawSide === 'left' || rawSide === 'right' || rawSide === 'median'
          ? rawSide
          : mesh.name.endsWith('.l')
            ? 'left'
            : mesh.name.endsWith('.r')
              ? 'right'
              : 'median';

      mesh.userData = {
        ...ud,
        bx_cat: category,
        bx_region: region,
        bx_label: label,
        bx_side: side,
      };

      if (
        category === 'meninges_dura' ||
        category === 'veins_sinuses' ||
        category === 'cranial_nerves'
      ) {
        mesh.visible = false;
        return;
      }

      meshBox.setFromObject(mesh);
      const centroid = new THREE.Vector3();
      meshBox.getCenter(centroid);

      const lobeGroup = classifyLobeGroup(category, region, label, centroid);
      const basePointColor = getBasePointColor(category, lobeGroup);
      const lowerLabel = label.toLowerCase();

      const isMotorOrCentral =
        lowerLabel.includes('precentral') ||
        lowerLabel.includes('postcentral') ||
        lowerLabel.includes('central sulcus') ||
        lowerLabel.includes('paracentral');

      const isPrefrontalWorkspaceHub =
        category === 'cortex' &&
        !isMotorOrCentral &&
        ((lobeGroup === 'frontal' &&
          (lowerLabel.includes('inferior frontal') ||
            lowerLabel.includes('middle frontal') ||
            lowerLabel.includes('superior frontal') ||
            lowerLabel.includes('triangular') ||
            lowerLabel.includes('opercular') ||
            lowerLabel.includes('orbital') ||
            lowerLabel.includes('frontomarginal') ||
            lowerLabel.includes('frontopolar') ||
            centroid.z > 0.34)) ||
          (lobeGroup === 'limbic' && lowerLabel.includes('anterior')));

      const isParietalWorkspaceHub =
        category === 'cortex' &&
        !isMotorOrCentral &&
        (lowerLabel.includes('angular') ||
          lowerLabel.includes('supramarginal') ||
          lowerLabel.includes('precuneus') ||
          lowerLabel.includes('inferior parietal') ||
          lowerLabel.includes('superior parietal') ||
          lowerLabel.includes('intraparietal') ||
          (lobeGroup === 'limbic' && lowerLabel.includes('posterior')));

      const isPrimaryVisualV1 =
        category === 'cortex' &&
        (lowerLabel.includes('calcarine') ||
          lowerLabel.includes('cuneus') ||
          lowerLabel.includes('occipital pole') ||
          lowerLabel.includes('lingual'));

      const isOpticOrVisualTract =
        lowerLabel.includes('optic') ||
        lowerLabel.includes('geniculate') ||
        lowerLabel.includes('thalamic radiation') ||
        lowerLabel.includes('inferior fronto-occipital') ||
        lowerLabel.includes('inferior longitudinal') ||
        lowerLabel.includes('splenium');

      // Assign functional group index (0..8) for instant GPU uniform choreography
      let functionalGroup: PointFunctionalGroup = 8;
      if (category === 'cortex') {
        if (isPrefrontalWorkspaceHub) functionalGroup = 0;
        else if (lobeGroup === 'frontal') functionalGroup = 1;
        else if (isParietalWorkspaceHub) functionalGroup = 2;
        else if (lobeGroup === 'parietal') functionalGroup = 3;
        else if (isPrimaryVisualV1) functionalGroup = 4;
        else if (lobeGroup === 'occipital') functionalGroup = 5;
        else if (lobeGroup === 'temporal') functionalGroup = 6;
        else functionalGroup = 7;
      }

      // Extract high-density Z-Anatomy surface vertices for cortex, cerebellum, and brainstem
      if (
        (category === 'cortex' ||
          category === 'cerebellum' ||
          category === 'brainstem') &&
        mesh.geometry
      ) {
        const posAttr = mesh.geometry.attributes.position as
          | THREE.BufferAttribute
          | undefined;
        const normAttr = mesh.geometry.attributes.normal as
          | THREE.BufferAttribute
          | undefined;

        if (posAttr && posAttr.count > 0) {
          normalMatrix.getNormalMatrix(mesh.matrixWorld);
          const stride =
            category === 'cortex' ? 1 : category === 'cerebellum' ? 16 : 22;
          const sideVal = side === 'left' ? 1.0 : side === 'right' ? -1.0 : 0.0;
          const hemiAnchorX = side === 'left' ? 0.22 : side === 'right' ? -0.22 : 0.0;

          for (let vi = 0; vi < posAttr.count; vi += stride) {
            tempV.fromBufferAttribute(posAttr, vi);
            tempV.applyMatrix4(mesh.matrixWorld);

            if (normAttr) {
              tempN.fromBufferAttribute(normAttr, vi);
              tempN.applyMatrix3(normalMatrix).normalize();
            } else {
              tempN.set(tempV.x, tempV.y - BRAIN_Y_OFFSET, tempV.z).normalize();
            }

            // For cortical gyri, filter out deep internal partition wall vertices
            // so the point cloud concentrates on the true outer pial gyri & sulcal folds!
            if (category === 'cortex') {
              outwardDir
                .set(
                  tempV.x - hemiAnchorX,
                  tempV.y - BRAIN_Y_OFFSET,
                  tempV.z,
                )
                .normalize();
              const facingOutward = tempN.dot(outwardDir);
              const radialDist = Math.hypot(
                tempV.x * 1.15,
                tempV.y - BRAIN_Y_OFFSET,
                tempV.z * 0.9,
              );
              if (facingOutward < -0.22 && radialDist < 0.52) {
                continue;
              }
            }

            ptPositions.push(tempV.x, tempV.y, tempV.z);
            ptNormals.push(tempN.x, tempN.y, tempN.z);
            ptBaseColors.push(
              basePointColor.r,
              basePointColor.g,
              basePointColor.b,
            );
            ptGroups.push(functionalGroup);
            ptSides.push(sideVal);
            ptPhases.push(rng() * Math.PI * 2);
          }
        }
      }

      // Mesh Material:
      // For outer cortex/cerebellum/brainstem in macro/connectome mode, render as a subtle
      // dark obsidian-graphite hull (zero turquoise jelly, zero grey clay!), while keeping
      // the mesh raycastable for pointer hover and solid for 3D MRI cross-section slices!
      const isOuterHull =
        category === 'cortex' ||
        category === 'cerebellum' ||
        category === 'brainstem';

      const material = new THREE.MeshPhysicalMaterial({
        color: isOuterHull ? COLOR_DARK_HULL.clone() : basePointColor.clone(),
        emissive: COLOR_DARK_EMISSIVE.clone(),
        emissiveIntensity: isOuterHull ? 0.02 : 0.28,
        roughness: isOuterHull ? 0.78 : 0.45,
        metalness: 0.05,
        clearcoat: 0.08,
        transparent: true,
        opacity: isOuterHull ? 0.08 : 0.72,
        depthWrite: !isOuterHull,
        side: THREE.DoubleSide,
      });

      mesh.material = material;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      const record: AnatomyStructureRecord = {
        id: mesh.uuid,
        mesh,
        material,
        category,
        region,
        label,
        side,
        lobeGroup,
        functionalGroup,
        basePointColor,
        centroid,
        distFromTms: centroid.distanceTo(TMS_LOCUS),
        isPrefrontalWorkspaceHub,
        isParietalWorkspaceHub,
        isPrimaryVisualV1,
        isOpticOrVisualTract,
        targetColor: isOuterHull ? COLOR_DARK_HULL.clone() : basePointColor.clone(),
        targetEmissive: COLOR_DARK_EMISSIVE.clone(),
      };

      structureRecords.push(record);
      uuidMap.set(mesh.uuid, record);
    });

    // Build the ~29,000-Point Z-Anatomy BufferGeometry & ShaderMaterial
    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(ptPositions), 3),
    );
    pointsGeom.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(ptNormals), 3),
    );
    pointsGeom.setAttribute(
      'aBaseColor',
      new THREE.BufferAttribute(new Float32Array(ptBaseColors), 3),
    );
    pointsGeom.setAttribute(
      'aGroup',
      new THREE.BufferAttribute(new Float32Array(ptGroups), 1),
    );
    pointsGeom.setAttribute(
      'aSide',
      new THREE.BufferAttribute(new Float32Array(ptSides), 1),
    );
    pointsGeom.setAttribute(
      'aPhase',
      new THREE.BufferAttribute(new Float32Array(ptPhases), 1),
    );
    pointsGeom.computeBoundingSphere();

    const pointsMat = new THREE.ShaderMaterial({
      vertexShader: Z_ANATOMY_POINTS_VERTEX_SHADER,
      fragmentShader: Z_ANATOMY_POINTS_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: {
          value:
            typeof window !== 'undefined'
              ? Math.min(window.devicePixelRatio || 1, 1.75)
              : 1.5,
        },
        uGroupColor: {
          value: [
            COLOR_PT_FRONTAL.clone(),
            COLOR_PT_FRONTAL.clone(),
            COLOR_PT_PARIETAL.clone(),
            COLOR_PT_PARIETAL.clone(),
            COLOR_PT_OCCIPITAL.clone(),
            COLOR_PT_OCCIPITAL.clone(),
            COLOR_PT_TEMPORAL.clone(),
            COLOR_PT_LIMBIC.clone(),
            COLOR_PT_CEREBELLUM.clone(),
          ],
        },
        uGroupAlpha: {
          value: [0.85, 0.82, 0.85, 0.82, 0.85, 0.82, 0.82, 0.8, 0.72],
        },
        uGroupSize: {
          value: [2.0, 1.85, 2.0, 1.85, 2.0, 1.85, 1.85, 1.8, 1.65],
        },
        uRightHemiAlphaMult: { value: 1.0 },
        uTmsActive: { value: 0.0 },
        uTmsAge: { value: 99.0 },
        uTmsHighPci: { value: 1.0 },
        uTmsLocus: { value: TMS_LOCUS.clone() },
        uClipActive: { value: 0.0 },
        uClipNormal: { value: new THREE.Vector3(-1, 0, 0) },
        uClipConstant: { value: 0.15 },
      },
    });

    // ========================================================================
    // Build 184 Dense 3D DTI White-Matter Tractography Fiber Streamlines
    // ========================================================================
    const filterCentroids = (
      predicate: (r: AnatomyStructureRecord) => boolean,
    ): THREE.Vector3[] =>
      structureRecords.filter(predicate).map((r) => r.centroid);

    const frontalL = filterCentroids((r) => r.lobeGroup === 'frontal' && r.side === 'left');
    const frontalR = filterCentroids((r) => r.lobeGroup === 'frontal' && r.side === 'right');
    const parietalL = filterCentroids((r) => r.lobeGroup === 'parietal' && r.side === 'left');
    const parietalR = filterCentroids((r) => r.lobeGroup === 'parietal' && r.side === 'right');
    const occipitalL = filterCentroids((r) => r.lobeGroup === 'occipital' && r.side === 'left');
    const occipitalR = filterCentroids((r) => r.lobeGroup === 'occipital' && r.side === 'right');
    const temporalL = filterCentroids((r) => r.lobeGroup === 'temporal' && r.side === 'left');
    const temporalR = filterCentroids((r) => r.lobeGroup === 'temporal' && r.side === 'right');
    const thalamusL = filterCentroids(
      (r) => (r.category === 'diencephalon' || r.category === 'deep_grey') && r.side !== 'right',
    );
    const thalamusR = filterCentroids(
      (r) => (r.category === 'diencephalon' || r.category === 'deep_grey') && r.side !== 'left',
    );

    const pickInward = (
      arr: THREE.Vector3[],
      fallback: THREE.Vector3,
      inwardPull = 0.85,
      jitter = 0.06,
    ): THREE.Vector3 => {
      const base =
        arr.length > 0
          ? arr[Math.floor(rng() * arr.length)].clone()
          : fallback.clone();
      base.x = base.x * inwardPull + (rng() - 0.5) * jitter;
      base.y =
        (base.y - BRAIN_Y_OFFSET) * inwardPull +
        BRAIN_Y_OFFSET +
        (rng() - 0.5) * jitter;
      base.z = base.z * inwardPull + (rng() - 0.5) * jitter;
      return base;
    };

    const fibers: DtiFiberSpec[] = [];

    // 1. 52 Corpus Callosum Inter-Hemispheric Arch Fibers (Clinical Bio-Teal #2AB3A6)
    for (let i = 0; i < 52; i++) {
      const sector = i % 3;
      const pL =
        sector === 0
          ? pickInward(frontalL, new THREE.Vector3(0.45, 0.28, 0.58), 0.85)
          : sector === 1
            ? pickInward(parietalL, new THREE.Vector3(0.48, 0.46, -0.15), 0.85)
            : pickInward(occipitalL, new THREE.Vector3(0.36, 0.16, -0.68), 0.85);
      const pR =
        sector === 0
          ? pickInward(frontalR, new THREE.Vector3(-0.45, 0.28, 0.58), 0.85)
          : sector === 1
            ? pickInward(parietalR, new THREE.Vector3(-0.48, 0.46, -0.15), 0.85)
            : pickInward(occipitalR, new THREE.Vector3(-0.36, 0.16, -0.68), 0.85);

      const midArch = new THREE.Vector3(
        (rng() - 0.5) * 0.04,
        0.18 + (rng() - 0.5) * 0.08,
        THREE.MathUtils.lerp(pL.z, pR.z, 0.5) * 0.72,
      );
      const qL = pL.clone().lerp(midArch, 0.45);
      qL.y += 0.08;
      const qR = pR.clone().lerp(midArch, 0.45);
      qR.y += 0.08;

      fibers.push({
        curve: new THREE.CatmullRomCurve3([pL, qL, midArch, qR, pR]),
        tractKind: 'callosal',
        color: COLOR_BIO_TEAL.clone(),
        isTopDown: i % 2 === 0,
      });
    }

    // 2. 48 Fronto-Parietal Superior Longitudinal & Arcuate Fasciculus Fibers (Surgical Terracotta #E05A47)
    for (let i = 0; i < 48; i++) {
      const isLeft = i % 2 === 0;
      const fPt = pickInward(
        isLeft ? frontalL : frontalR,
        new THREE.Vector3(isLeft ? 0.44 : -0.44, 0.26, 0.62),
        0.86,
      );
      const pPt = pickInward(
        isLeft ? parietalL : parietalR,
        new THREE.Vector3(isLeft ? 0.48 : -0.48, 0.44, -0.22),
        0.86,
      );
      const endPool =
        i % 3 === 0
          ? isLeft
            ? temporalL
            : temporalR
          : isLeft
            ? occipitalL
            : occipitalR;
      const dstPt = pickInward(
        endPool,
        new THREE.Vector3(isLeft ? 0.46 : -0.46, 0.04, -0.58),
        0.86,
      );

      const archMid = fPt.clone().lerp(pPt, 0.52);
      archMid.y += 0.12 + rng() * 0.08;

      fibers.push({
        curve: new THREE.CatmullRomCurve3([fPt, archMid, pPt, dstPt]),
        tractKind: 'frontoParietal',
        color: COLOR_TERRACOTTA.clone(),
        isTopDown: true,
      });
    }

    // 3. 44 Thalamocortical Corona Radiata & Internal Capsule Fibers (Warm Amber-Gold #D99B4E)
    for (let i = 0; i < 44; i++) {
      const isLeft = i % 2 === 0;
      const thalPt = pickInward(
        isLeft ? thalamusL : thalamusR,
        new THREE.Vector3(isLeft ? 0.12 : -0.12, 0.06, -0.04),
        0.9,
        0.04,
      );
      const lobeChoice = i % 4;
      const targetPool =
        lobeChoice === 0
          ? isLeft
            ? frontalL
            : frontalR
          : lobeChoice === 1
            ? isLeft
              ? parietalL
              : parietalR
            : lobeChoice === 2
              ? isLeft
                ? occipitalL
                : occipitalR
              : isLeft
                ? temporalL
                : temporalR;
      const cortexPt = pickInward(
        targetPool,
        new THREE.Vector3(isLeft ? 0.45 : -0.45, 0.42, 0.15),
        0.87,
      );
      const midFan = thalPt.clone().lerp(cortexPt, 0.52);
      midFan.y += 0.1;
      midFan.x *= 0.85;

      fibers.push({
        curve: new THREE.CatmullRomCurve3([thalPt, midFan, cortexPt]),
        tractKind: 'thalamocortical',
        color: COLOR_WARM_AMBER.clone(),
        isTopDown: false,
      });
    }

    // 4. 40 Occipito-Temporal Ventral Stream & Optic Radiation Fibers (Soft Bio-Teal #68B8AE)
    for (let i = 0; i < 40; i++) {
      const isLeft = i % 2 === 0;
      const occPt = pickInward(
        isLeft ? occipitalL : occipitalR,
        new THREE.Vector3(isLeft ? 0.34 : -0.34, 0.08, -0.74),
        0.86,
      );
      const tempPt = pickInward(
        isLeft ? temporalL : temporalR,
        new THREE.Vector3(isLeft ? 0.52 : -0.52, -0.14, 0.08),
        0.86,
      );
      const thalPt = pickInward(
        isLeft ? thalamusL : thalamusR,
        new THREE.Vector3(isLeft ? 0.14 : -0.14, 0.04, -0.08),
        0.88,
      );
      const midStream = occPt.clone().lerp(tempPt, 0.5);
      midStream.y -= 0.04;

      fibers.push({
        curve:
          i % 2 === 0
            ? new THREE.CatmullRomCurve3([thalPt, occPt, midStream, tempPt])
            : new THREE.CatmullRomCurve3([occPt, midStream, tempPt]),
        tractKind: 'ventralVisual',
        color: COLOR_SOFT_TEAL.clone(),
        isTopDown: false,
      });
    }

    const segmentsPerFiber = 26;
    const totalLineVertices = fibers.length * segmentsPerFiber * 2;
    const linePositions = new Float32Array(totalLineVertices * 3);
    const lineColors = new Float32Array(totalLineVertices * 3);

    let lv = 0;
    for (let f = 0; f < fibers.length; f++) {
      const fiber = fibers[f];
      const pts = fiber.curve.getPoints(segmentsPerFiber);
      for (let s = 0; s < segmentsPerFiber; s++) {
        const p0 = pts[s];
        const p1 = pts[s + 1];
        const fade0 = 0.42 + 0.58 * Math.sin((s / segmentsPerFiber) * Math.PI);
        const fade1 = 0.42 + 0.58 * Math.sin(((s + 1) / segmentsPerFiber) * Math.PI);

        linePositions[lv * 3] = p0.x;
        linePositions[lv * 3 + 1] = p0.y;
        linePositions[lv * 3 + 2] = p0.z;
        lineColors[lv * 3] = fiber.color.r * fade0;
        lineColors[lv * 3 + 1] = fiber.color.g * fade0;
        lineColors[lv * 3 + 2] = fiber.color.b * fade0;
        lv++;

        linePositions[lv * 3] = p1.x;
        linePositions[lv * 3 + 1] = p1.y;
        linePositions[lv * 3 + 2] = p1.z;
        lineColors[lv * 3] = fiber.color.r * fade1;
        lineColors[lv * 3 + 1] = fiber.color.g * fade1;
        lineColors[lv * 3 + 2] = fiber.color.b * fade1;
        lv++;
      }
    }

    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    lineGeom.computeBoundingSphere();

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.44,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Build 3D Laser MRI Scan Plane Frame Border & Medical Stereotactic Grid
    const halfW = 1.18;
    const halfH = 1.05;
    const borderVerts = new Float32Array([
      -halfW, -halfH, 0,  halfW, -halfH, 0,
       halfW, -halfH, 0,  halfW,  halfH, 0,
       halfW,  halfH, 0, -halfW,  halfH, 0,
      -halfW,  halfH, 0, -halfW, -halfH, 0,
    ]);
    const borderGeom = new THREE.BufferGeometry();
    borderGeom.setAttribute('position', new THREE.BufferAttribute(borderVerts, 3));

    const gridLines: number[] = [];
    const gridSteps = 6;
    for (let g = -gridSteps + 1; g < gridSteps; g++) {
      const gx = (g / gridSteps) * halfW;
      const gy = (g / gridSteps) * halfH;
      gridLines.push(gx, -halfH, 0, gx, halfH, 0);
      gridLines.push(-halfW, gy, 0, halfW, gy, 0);
    }
    const gridGeom = new THREE.BufferGeometry();
    gridGeom.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(gridLines), 3),
    );

    const container = new THREE.Group();
    container.add(clonedRoot);

    return {
      normalizedBrainGroup: container,
      records: structureRecords,
      recordByUuid: uuidMap,
      zAnatomyPointsGeometry: pointsGeom,
      zAnatomyPointsMaterial: pointsMat,
      dtiFibers: fibers,
      dtiLineGeometry: lineGeom,
      dtiLineMaterial: lineMat,
      mriFrameBorderGeometry: borderGeom,
      mriFrameGridGeometry: gridGeom,
    };
  }, [gltf.scene]);

  useEffect(() => {
    return () => {
      for (const rec of records) {
        rec.material.dispose();
      }
      zAnatomyPointsGeometry.dispose();
      zAnatomyPointsMaterial.dispose();
      dtiLineGeometry.dispose();
      dtiLineMaterial.dispose();
      mriFrameBorderGeometry.dispose();
      mriFrameGridGeometry.dispose();
    };
  }, [
    records,
    zAnatomyPointsGeometry,
    zAnatomyPointsMaterial,
    dtiLineGeometry,
    dtiLineMaterial,
    mriFrameBorderGeometry,
    mriFrameGridGeometry,
  ]);

  useEffect(() => {
    if (pciPulseNonce !== pulseStateRef.current.lastNonce) {
      pulseStateRef.current.lastNonce = pciPulseNonce;
      pulseStateRef.current.active = true;
      pulseStateRef.current.age = 0.001;
      pulseStateRef.current.value = pciPulseValue;
      pulseStateRef.current.autoCooldown = 4.8;
    }
  }, [pciPulseNonce, pciPulseValue]);

  useEffect(() => {
    if (activeChapter === 'ch5' && effectiveMode === 'macro') {
      pulseStateRef.current.active = true;
      pulseStateRef.current.age = 0.001;
      pulseStateRef.current.value = pciPulseValue;
      pulseStateRef.current.autoCooldown = 4.6;
    }
  }, [activeChapter, effectiveMode, pciPulseValue]);

  // 160 Animated Action-Potential Photon Sparks racing along the 184 3D DTI Fibers
  const SPARK_COUNT = 160;
  const sparkCoreRef = useRef<THREE.InstancedMesh | null>(null);
  const sparkHaloRef = useRef<THREE.InstancedMesh | null>(null);
  const sparkDummy = useMemo(() => new THREE.Object3D(), []);
  const sparkColor = useMemo(() => new THREE.Color(), []);
  const sparkCoreGeom = useMemo(() => new THREE.SphereGeometry(0.015, 8, 8), []);
  const sparkCoreMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );
  const sparkHaloGeom = useMemo(() => new THREE.SphereGeometry(0.032, 8, 8), []);
  const sparkHaloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      sparkCoreGeom.dispose();
      sparkCoreMat.dispose();
      sparkHaloGeom.dispose();
      sparkHaloMat.dispose();
    };
  }, [sparkCoreGeom, sparkCoreMat, sparkHaloGeom, sparkHaloMat]);

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (effectiveMode === 'neurons') return;
      e.stopPropagation();
      const hitMesh = e.object as THREE.Mesh;
      const rec = recordByUuid.get(hitMesh.uuid);
      if (!rec) return;

      if (hoveredIdRef.current !== rec.id) {
        hoveredIdRef.current = rec.id;
        document.body.style.cursor = 'pointer';
        onHoverAnatomy?.({
          label: rec.label,
          region: rec.region,
          category: formatCategoryDisplay(rec.category),
          side: rec.side,
        });
      }
    },
    [effectiveMode, onHoverAnatomy, recordByUuid],
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (effectiveMode === 'neurons') return;
      e.stopPropagation();
      if (hoveredIdRef.current !== null) {
        hoveredIdRef.current = null;
        document.body.style.cursor = 'auto';
        onHoverAnatomy?.(null);
      }
    },
    [effectiveMode, onHoverAnatomy],
  );

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const isBrainVisible = effectiveMode !== 'neurons';
    const isSliceMode = effectiveMode === 'slice';

    const desiredScale = isBrainVisible ? 1.0 : 0.001;
    rotationStateRef.current.modeScale = THREE.MathUtils.damp(
      rotationStateRef.current.modeScale,
      desiredScale,
      7.5,
      dt,
    );

    if (outerGroupRef.current) {
      const s = rotationStateRef.current.modeScale;
      outerGroupRef.current.scale.setScalar(s);
      outerGroupRef.current.visible = s > 0.02;

      const preset = CAMERA_PRESETS[activeChapter];
      if (isSliceMode) {
        const deltaYaw = shortestAngleDelta(rotationStateRef.current.yaw, 0);
        rotationStateRef.current.yaw += deltaYaw * (1 - Math.exp(-6.0 * dt));
      } else if (effectiveMode === 'connectome' || !preset.lockBrainYaw) {
        if (!reducedMotion && hoveredIdRef.current === null) {
          rotationStateRef.current.yaw += dt * (preset.autoRotateSpeed || 0.09);
        }
      } else {
        const sway = reducedMotion ? 0 : Math.sin(t * 0.42) * 0.035;
        const deltaYaw = shortestAngleDelta(
          rotationStateRef.current.yaw,
          preset.targetYaw + sway,
        );
        rotationStateRef.current.yaw += deltaYaw * (1 - Math.exp(-3.5 * dt));
      }
      outerGroupRef.current.rotation.y = rotationStateRef.current.yaw;
    }

    if (!isBrainVisible && rotationStateRef.current.modeScale <= 0.025) {
      return;
    }

    // ========================================================================
    // 1. Update Interactive 3D MRI / CT Cross-Section Clipping Plane & Laser Frame
    // ========================================================================
    rotationStateRef.current.dampedSliceOffset = THREE.MathUtils.damp(
      rotationStateRef.current.dampedSliceOffset,
      sliceOffset,
      10.0,
      dt,
    );
    const planeCoord = rotationStateRef.current.dampedSliceOffset * 1.05;
    const yaw = rotationStateRef.current.yaw;

    if (isSliceMode) {
      const localNormal =
        sliceAxis === 'sagittal'
          ? new THREE.Vector3(-1, 0, 0)
          : sliceAxis === 'axial'
            ? new THREE.Vector3(0, -1, 0)
            : new THREE.Vector3(0, 0, -1);

      localNormal.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      const planeConstant =
        sliceAxis === 'axial' ? planeCoord + BRAIN_Y_OFFSET : planeCoord;
      worldClipPlane.set(localNormal, planeConstant);

      dtiLineMaterial.clippingPlanes = [worldClipPlane];
      sparkCoreMat.clippingPlanes = [worldClipPlane];
      sparkHaloMat.clippingPlanes = [worldClipPlane];

      zAnatomyPointsMaterial.uniforms.uClipActive.value = 1.0;
      (zAnatomyPointsMaterial.uniforms.uClipNormal.value as THREE.Vector3).copy(
        localNormal,
      );
      zAnatomyPointsMaterial.uniforms.uClipConstant.value = planeConstant;
    } else {
      dtiLineMaterial.clippingPlanes = null;
      sparkCoreMat.clippingPlanes = null;
      sparkHaloMat.clippingPlanes = null;
      zAnatomyPointsMaterial.uniforms.uClipActive.value = 0.0;
    }

    if (mriLaserFrameRef.current) {
      mriLaserFrameRef.current.visible = isSliceMode;
      if (isSliceMode) {
        if (sliceAxis === 'sagittal') {
          mriLaserFrameRef.current.position.set(planeCoord, BRAIN_Y_OFFSET, 0);
          mriLaserFrameRef.current.rotation.set(0, Math.PI / 2, 0);
        } else if (sliceAxis === 'axial') {
          mriLaserFrameRef.current.position.set(0, planeCoord + BRAIN_Y_OFFSET, 0);
          mriLaserFrameRef.current.rotation.set(Math.PI / 2, 0, 0);
        } else {
          mriLaserFrameRef.current.position.set(0, BRAIN_Y_OFFSET, planeCoord);
          mriLaserFrameRef.current.rotation.set(0, 0, 0);
        }

        if (mriScanlineRef.current) {
          mriScanlineRef.current.position.y = reducedMotion
            ? 0
            : Math.sin(t * 1.65) * 0.96;
        }
      }
    }

    // ========================================================================
    // 2. Update TMS Pulse Age & Dorsal Coil
    // ========================================================================
    const ps = pulseStateRef.current;
    ps.value = pciPulseValue;
    if (ps.active) {
      ps.age += dt;
      if (ps.age > 3.6) {
        ps.active = false;
      }
    } else if (activeChapter === 'ch5' && effectiveMode === 'macro' && !reducedMotion) {
      ps.autoCooldown -= dt;
      if (ps.autoCooldown <= 0) {
        ps.active = true;
        ps.age = 0.001;
        ps.autoCooldown = 4.6;
      }
    }

    if (tmsCoilRef.current) {
      const showTms = activeChapter === 'ch5' && effectiveMode === 'macro';
      tmsCoilRef.current.visible = showTms;
      if (showTms && tmsWaveRingRef.current) {
        const ringMat = tmsWaveRingRef.current.material as THREE.MeshBasicMaterial;
        if (ps.active && ps.age < 1.8) {
          const prog = ps.age / 1.8;
          const maxSpread = ps.value > 0.31 ? 2.1 : 0.78;
          tmsWaveRingRef.current.scale.setScalar(0.2 + prog * maxSpread);
          ringMat.opacity = (1 - prog) * 0.75;
          ringMat.color.copy(ps.value > 0.31 ? COLOR_BIO_TEAL : COLOR_WARM_AMBER);
        } else {
          tmsWaveRingRef.current.scale.setScalar(0.2);
          ringMat.opacity = 0.0;
        }
      }
    }

    // ========================================================================
    // 3. Configure Target Colors & Opacities for the 9 Z-Anatomy Point-Cloud Groups
    // ========================================================================
    const pgs = pointGroupStateRef.current;

    // Default baseline: Warm Architectural Ivory-Silver & Champagne Gold
    pgs.targetColors[0].copy(COLOR_PT_FRONTAL);
    pgs.targetColors[1].copy(COLOR_PT_FRONTAL);
    pgs.targetColors[2].copy(COLOR_PT_PARIETAL);
    pgs.targetColors[3].copy(COLOR_PT_PARIETAL);
    pgs.targetColors[4].copy(COLOR_PT_OCCIPITAL);
    pgs.targetColors[5].copy(COLOR_PT_OCCIPITAL);
    pgs.targetColors[6].copy(COLOR_PT_TEMPORAL);
    pgs.targetColors[7].copy(COLOR_PT_LIMBIC);
    pgs.targetColors[8].copy(COLOR_PT_CEREBELLUM);

    for (let g = 0; g < 9; g++) {
      pgs.targetAlphas[g] = g === 8 ? 0.72 : 0.88;
      pgs.targetSizes[g] = g === 8 ? 1.65 : 2.05;
    }

    let desiredRightHemiAlpha = 1.0;

    if (effectiveMode === 'connectome') {
      // Connectome mode: subtle champagne-silver ghost cloud (0.34) so the 184 DTI tracts blaze inside
      for (let g = 0; g < 9; g++) {
        pgs.targetAlphas[g] = 0.32;
        pgs.targetSizes[g] = 1.6;
      }
    } else if (isSliceMode) {
      // Slice mode: crisp anatomical point cloud defining gyral contours around the MRI cross-section
      for (let g = 0; g < 9; g++) {
        pgs.targetAlphas[g] = 0.88;
        pgs.targetSizes[g] = 2.0;
      }
    } else {
      // Macro mode chapter-specific functional choreography
      if (activeChapter === 'ch1') {
        // ch1 (Visual Qualia): Frontal & Parietal dim cleanly to expose Thalamus & Optic Tracts,
        // while Primary Visual Cortex V1 (Group 4) & Lateral Occipital (Group 5) ignite!
        pgs.targetAlphas[0] = 0.25;
        pgs.targetAlphas[1] = 0.25;
        pgs.targetAlphas[2] = 0.28;
        pgs.targetAlphas[3] = 0.28;
        pgs.targetColors[0].copy(COLOR_DIM_GRAPHITE);
        pgs.targetColors[1].copy(COLOR_DIM_GRAPHITE);
        pgs.targetColors[2].copy(COLOR_DIM_GRAPHITE);
        pgs.targetColors[3].copy(COLOR_DIM_GRAPHITE);

        pgs.targetColors[4].copy(COLOR_TERRACOTTA);
        pgs.targetAlphas[4] = 0.98;
        pgs.targetSizes[4] = 2.45;

        pgs.targetColors[5].copy(COLOR_WARM_AMBER);
        pgs.targetAlphas[5] = 0.95;
        pgs.targetSizes[5] = 2.25;
      } else if (activeChapter === 'ch2') {
        if (activeTheory === 'gnwt') {
          // GNWT: Prefrontal Workspace Hubs (0) in Surgical Terracotta (#E05A47),
          // Parietal Workspace Hubs (2) in Warm Amber (#D99B4E),
          // Motor/Somatosensory strips (1, 3) in Warm Champagne (#E6DEC8),
          // Occipital & Temporal (4, 5, 6) dimmed to graphite-silver (0.34)
          pgs.targetColors[0].copy(COLOR_TERRACOTTA);
          pgs.targetAlphas[0] = 0.98;
          pgs.targetSizes[0] = 2.45;

          pgs.targetColors[1].copy(COLOR_CHAMPAGNE);
          pgs.targetAlphas[1] = 0.78;

          pgs.targetColors[2].copy(COLOR_WARM_AMBER);
          pgs.targetAlphas[2] = 0.96;
          pgs.targetSizes[2] = 2.38;

          pgs.targetColors[3].copy(COLOR_CHAMPAGNE);
          pgs.targetAlphas[3] = 0.75;

          for (const g of [4, 5, 6, 8]) {
            pgs.targetColors[g].copy(COLOR_DIM_GRAPHITE);
            pgs.targetAlphas[g] = 0.34;
            pgs.targetSizes[g] = 1.65;
          }
        } else if (activeTheory === 'iit') {
          // IIT: Posterior Hot Zone (Occipital 4,5 in Bio-Teal #2AB3A6, Parietal 2 in Warm Amber #D99B4E,
          // Temporal 6 in Soft Teal #68B8AE), while Frontal (0, 1) dims to 0.28
          pgs.targetColors[0].copy(COLOR_DIM_GRAPHITE);
          pgs.targetAlphas[0] = 0.26;
          pgs.targetSizes[0] = 1.6;

          pgs.targetColors[1].copy(COLOR_DIM_GRAPHITE);
          pgs.targetAlphas[1] = 0.32;

          pgs.targetColors[2].copy(COLOR_WARM_AMBER);
          pgs.targetAlphas[2] = 0.96;
          pgs.targetSizes[2] = 2.35;

          pgs.targetColors[3].copy(COLOR_SOFT_TEAL);
          pgs.targetAlphas[3] = 0.88;

          pgs.targetColors[4].copy(COLOR_BIO_TEAL);
          pgs.targetAlphas[4] = 0.98;
          pgs.targetSizes[4] = 2.45;

          pgs.targetColors[5].copy(COLOR_BIO_TEAL);
          pgs.targetAlphas[5] = 0.96;
          pgs.targetSizes[5] = 2.35;

          pgs.targetColors[6].copy(COLOR_SOFT_TEAL);
          pgs.targetAlphas[6] = 0.92;
          pgs.targetSizes[6] = 2.2;
        } else if (activeTheory === 'pp') {
          // PP: Top-Down Prefrontal (0) in Warm Amber (#D99B4E) +
          // Bottom-Up Occipital V1 (4, 5) & Insula (7) in Clinical Bio-Teal (#2AB3A6)
          pgs.targetColors[0].copy(COLOR_WARM_AMBER);
          pgs.targetAlphas[0] = 0.96;
          pgs.targetSizes[0] = 2.38;

          pgs.targetColors[4].copy(COLOR_BIO_TEAL);
          pgs.targetAlphas[4] = 0.98;
          pgs.targetSizes[4] = 2.42;

          pgs.targetColors[5].copy(COLOR_BIO_TEAL);
          pgs.targetAlphas[5] = 0.94;
          pgs.targetSizes[5] = 2.28;

          pgs.targetColors[7].copy(COLOR_BIO_TEAL);
          pgs.targetAlphas[7] = 0.94;

          for (const g of [1, 2, 3, 6]) {
            pgs.targetColors[g].copy(COLOR_DIM_GRAPHITE);
            pgs.targetAlphas[g] = 0.32;
            pgs.targetSizes[g] = 1.65;
          }
        } else if (activeTheory === 'hot') {
          // HOT: Prefrontal Metacognitive Hubs (0) in Warm Amber (#D99B4E) monitoring
          // Primary Visual Occipital (4, 5) in Surgical Terracotta (#E05A47)
          pgs.targetColors[0].copy(COLOR_WARM_AMBER);
          pgs.targetAlphas[0] = 0.98;
          pgs.targetSizes[0] = 2.42;

          pgs.targetColors[4].copy(COLOR_TERRACOTTA);
          pgs.targetAlphas[4] = 0.98;
          pgs.targetSizes[4] = 2.42;

          pgs.targetColors[5].copy(COLOR_TERRACOTTA);
          pgs.targetAlphas[5] = 0.92;
          pgs.targetSizes[5] = 2.25;

          for (const g of [1, 2, 3, 6]) {
            pgs.targetColors[g].copy(COLOR_DIM_GRAPHITE);
            pgs.targetAlphas[g] = 0.32;
            pgs.targetSizes[g] = 1.65;
          }
        } else if (activeTheory === 'rpt') {
          // RPT: Local Recurrent Occipital & Temporal Sensory Cortex (4, 5, 6)
          pgs.targetColors[4].copy(COLOR_BIO_TEAL);
          pgs.targetAlphas[4] = 0.98;
          pgs.targetSizes[4] = 2.45;

          pgs.targetColors[5].copy(COLOR_BIO_TEAL);
          pgs.targetAlphas[5] = 0.95;
          pgs.targetSizes[5] = 2.32;

          pgs.targetColors[6].copy(COLOR_WARM_AMBER);
          pgs.targetAlphas[6] = 0.92;
          pgs.targetSizes[6] = 2.22;

          for (const g of [0, 1, 2, 3]) {
            pgs.targetColors[g].copy(COLOR_DIM_GRAPHITE);
            pgs.targetAlphas[g] = 0.28;
            pgs.targetSizes[g] = 1.6;
          }
        }
      } else if (activeChapter === 'ch3') {
        // ch3 (COGITATE 2025 — Split-Hemisphere Surgical Cutaway):
        // Right hemisphere dims to 0.20 exposing internal DTI tracts & Thalamus,
        // Left hemisphere contrasts Frontal Terracotta (#E05A47) vs Posterior Bio-Teal (#2AB3A6)
        desiredRightHemiAlpha = 0.2;
        pgs.targetColors[0].copy(COLOR_TERRACOTTA);
        pgs.targetAlphas[0] = 0.98;
        pgs.targetSizes[0] = 2.4;

        pgs.targetColors[2].copy(COLOR_WARM_AMBER);
        pgs.targetAlphas[2] = 0.94;
        pgs.targetSizes[2] = 2.28;

        pgs.targetColors[4].copy(COLOR_BIO_TEAL);
        pgs.targetAlphas[4] = 0.98;
        pgs.targetSizes[4] = 2.4;

        pgs.targetColors[5].copy(COLOR_BIO_TEAL);
        pgs.targetAlphas[5] = 0.95;
        pgs.targetSizes[5] = 2.3;

        pgs.targetColors[6].copy(COLOR_SOFT_TEAL);
        pgs.targetAlphas[6] = 0.92;
      }
    }

    const dampLambda = 6.8;
    const uColors = zAnatomyPointsMaterial.uniforms.uGroupColor.value as THREE.Color[];
    const uAlphas = zAnatomyPointsMaterial.uniforms.uGroupAlpha.value as number[];
    const uSizes = zAnatomyPointsMaterial.uniforms.uGroupSize.value as number[];

    for (let g = 0; g < 9; g++) {
      pgs.colors[g].lerp(pgs.targetColors[g], 1 - Math.exp(-dampLambda * dt));
      pgs.alphas[g] = THREE.MathUtils.damp(
        pgs.alphas[g],
        pgs.targetAlphas[g],
        dampLambda,
        dt,
      );
      pgs.sizes[g] = THREE.MathUtils.damp(
        pgs.sizes[g],
        pgs.targetSizes[g],
        dampLambda,
        dt,
      );
      uColors[g].copy(pgs.colors[g]);
      uAlphas[g] = pgs.alphas[g];
      uSizes[g] = pgs.sizes[g];
    }

    rotationStateRef.current.dampedRightHemiAlpha = THREE.MathUtils.damp(
      rotationStateRef.current.dampedRightHemiAlpha,
      desiredRightHemiAlpha,
      dampLambda,
      dt,
    );

    zAnatomyPointsMaterial.uniforms.uTime.value = t;
    zAnatomyPointsMaterial.uniforms.uRightHemiAlphaMult.value =
      rotationStateRef.current.dampedRightHemiAlpha;
    zAnatomyPointsMaterial.uniforms.uTmsActive.value =
      activeChapter === 'ch5' && ps.active ? 1.0 : 0.0;
    zAnatomyPointsMaterial.uniforms.uTmsAge.value = ps.age;
    zAnatomyPointsMaterial.uniforms.uTmsHighPci.value =
      ps.value > 0.31 ? 1.0 : 0.0;

    // Modulate DTI Fiber Tractography opacity
    const targetDtiOpacity =
      effectiveMode === 'connectome'
        ? 0.68
        : isSliceMode
          ? 0.54
          : 0.46;
    dtiLineMaterial.opacity = THREE.MathUtils.damp(
      dtiLineMaterial.opacity,
      targetDtiOpacity,
      6.0,
      dt,
    );

    const breath = reducedMotion ? 0 : Math.sin(t * 2.1) * 0.04;

    // ========================================================================
    // 4. Update the 437 Z-Anatomy Solid Meshes:
    //    - In macro/connectome: Outer cortex is a subtle dark obsidian hull (opacity 0.08)
    //      except when hovered (lights up THAT single hovered gyrus in Warm Amber!).
    //      Internal Thalamus (diencephalon) and Deep Grey nuclei glow softly inside.
    //    - In slice mode: Solid anatomical cross-section of cortex, white matter,
    //      thalamus, basal ganglia, ventricles, cerebellum, and brainstem!
    // ========================================================================
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const { category, material, mesh, basePointColor } = rec;
      const isHovered = hoveredIdRef.current === rec.id;

      material.clippingPlanes = isSliceMode ? [worldClipPlane] : null;

      if (category === 'arteries') {
        if (effectiveMode === 'connectome' || isSliceMode) {
          mesh.visible = true;
          rec.targetColor.copy(COLOR_ARTERIAL_CRIMSON);
          rec.targetEmissive.copy(COLOR_ARTERIAL_CRIMSON);
          material.opacity = THREE.MathUtils.damp(
            material.opacity,
            isSliceMode ? 0.62 : 0.25,
            dampLambda,
            dt,
          );
          material.emissiveIntensity = THREE.MathUtils.damp(
            material.emissiveIntensity,
            isSliceMode ? 0.32 : 0.18,
            dampLambda,
            dt,
          );
          material.depthWrite = isSliceMode;
          mesh.renderOrder = 1;
        } else {
          mesh.visible = false;
        }
        continue;
      }

      // Hide solid tract meshes in macro mode so the 184 silky DTI fiber curves shine cleanly;
      // show them in connectome & slice modes!
      if (category === 'tracts' || category === 'white_matter') {
        if (isSliceMode || effectiveMode === 'connectome' || isHovered) {
          mesh.visible = true;
          rec.targetColor.copy(COLOR_BIO_TEAL);
          rec.targetEmissive.copy(COLOR_BIO_TEAL);
          const targetOp = isSliceMode ? 0.92 : isHovered ? 0.75 : 0.28;
          material.opacity = THREE.MathUtils.damp(material.opacity, targetOp, dampLambda, dt);
          material.emissiveIntensity = THREE.MathUtils.damp(
            material.emissiveIntensity,
            isSliceMode ? 0.42 : 0.28,
            dampLambda,
            dt,
          );
          material.color.lerp(rec.targetColor, 1 - Math.exp(-dampLambda * dt));
          material.emissive.lerp(rec.targetEmissive, 1 - Math.exp(-dampLambda * dt));
          material.depthWrite = isSliceMode;
          mesh.renderOrder = 1;
        } else {
          mesh.visible = false;
        }
        continue;
      }

      mesh.visible = true;

      let targetOpacity = 0.08;
      let targetEmissiveIntensity = 0.02;
      rec.targetColor.copy(COLOR_DARK_HULL);
      rec.targetEmissive.copy(COLOR_DARK_EMISSIVE);

      if (isSliceMode) {
        // 3D MRI Cross-Section Slice Mode: Solid internal anatomical differentiation
        if (category === 'cortex') {
          rec.targetColor.copy(COLOR_SLICE_CORTEX).lerp(basePointColor, 0.35);
          rec.targetEmissive.copy(basePointColor);
          targetOpacity = 0.86;
          targetEmissiveIntensity = 0.16;
        } else if (category === 'diencephalon') {
          rec.targetColor.copy(COLOR_WARM_AMBER);
          rec.targetEmissive.copy(COLOR_WARM_AMBER);
          targetOpacity = 0.96;
          targetEmissiveIntensity = 0.45 + breath;
        } else if (category === 'deep_grey') {
          rec.targetColor.copy(COLOR_TERRACOTTA);
          rec.targetEmissive.copy(COLOR_TERRACOTTA);
          targetOpacity = 0.96;
          targetEmissiveIntensity = 0.42 + breath;
        } else if (category === 'ventricles') {
          rec.targetColor.copy(COLOR_VENTRICLE_SLATE);
          rec.targetEmissive.copy(COLOR_VENTRICLE_SLATE);
          targetOpacity = 0.72;
          targetEmissiveIntensity = 0.28;
        } else {
          rec.targetColor.copy(basePointColor);
          rec.targetEmissive.copy(COLOR_DARK_EMISSIVE);
          targetOpacity = 0.82;
          targetEmissiveIntensity = 0.12;
        }
      } else {
        // Macro & Connectome modes:
        // Deep nuclei (Thalamus & Basal Ganglia) glow at the center of the brain,
        // while outer cortex is a subtle dark obsidian hull (no triangle soup!)
        if (category === 'diencephalon') {
          rec.targetColor.copy(COLOR_WARM_AMBER);
          rec.targetEmissive.copy(COLOR_WARM_AMBER);
          targetOpacity = effectiveMode === 'connectome' ? 0.82 : 0.64;
          targetEmissiveIntensity = 0.38 + breath;
        } else if (category === 'deep_grey') {
          rec.targetColor.copy(COLOR_TERRACOTTA);
          rec.targetEmissive.copy(COLOR_TERRACOTTA);
          targetOpacity = effectiveMode === 'connectome' ? 0.78 : 0.52;
          targetEmissiveIntensity = 0.32 + breath;
        } else if (category === 'ventricles') {
          rec.targetColor.copy(COLOR_VENTRICLE_SLATE);
          rec.targetEmissive.copy(COLOR_DARK_EMISSIVE);
          targetOpacity = 0.18;
          targetEmissiveIntensity = 0.08;
        } else {
          // Outer cortex, cerebellum, brainstem: dark obsidian hull unless hovered!
          rec.targetColor.copy(COLOR_DARK_HULL);
          rec.targetEmissive.copy(COLOR_DARK_EMISSIVE);
          targetOpacity = 0.07;
          targetEmissiveIntensity = 0.0;
        }
      }

      // Single-structure surgical highlight when hovered by user's pointer!
      if (isHovered) {
        rec.targetColor.copy(COLOR_WARM_AMBER);
        rec.targetEmissive.copy(COLOR_WARM_AMBER);
        targetOpacity = isSliceMode ? 0.96 : 0.44;
        targetEmissiveIntensity = 0.38;
      }

      material.color.lerp(rec.targetColor, 1 - Math.exp(-dampLambda * dt));
      material.emissive.lerp(rec.targetEmissive, 1 - Math.exp(-dampLambda * dt));
      material.emissiveIntensity = THREE.MathUtils.damp(
        material.emissiveIntensity,
        targetEmissiveIntensity,
        dampLambda,
        dt,
      );
      material.opacity = THREE.MathUtils.damp(
        material.opacity,
        targetOpacity,
        dampLambda,
        dt,
      );

      const isDeepCore = category === 'diencephalon' || category === 'deep_grey';
      material.transparent = true;
      material.depthWrite = isSliceMode ? material.opacity > 0.65 : isDeepCore;
      mesh.renderOrder = isDeepCore ? 1 : 2;
    }

    // ========================================================================
    // 5. Animate 160 Action-Potential Photon Sparks along the 184 3D DTI Fibers
    // ========================================================================
    if (sparkCoreRef.current && sparkHaloRef.current) {
      const priorNorm = clamp01(predictivePrior / 100);
      const baseSpeed = reducedMotion ? 0.12 : 0.36 + priorNorm * 0.28;

      for (let i = 0; i < SPARK_COUNT; i++) {
        const fiber = dtiFibers[i % dtiFibers.length];
        const rawT = (t * baseSpeed * (0.85 + (i % 5) * 0.08) + i * 0.0618) % 1;
        const u = fiber.isTopDown ? rawT : 1 - rawT;
        const pos = fiber.curve.getPointAt(u);

        sparkDummy.position.copy(pos);
        const edgeFade = Math.sin(u * Math.PI);
        sparkDummy.scale.setScalar(0.55 + edgeFade * 0.85);
        sparkDummy.updateMatrix();

        sparkCoreRef.current.setMatrixAt(i, sparkDummy.matrix);
        sparkHaloRef.current.setMatrixAt(i, sparkDummy.matrix);

        sparkColor.copy(fiber.color);
        if (activeChapter === 'ch2') {
          if (activeTheory === 'gnwt' && fiber.tractKind === 'frontoParietal') {
            sparkColor.copy(COLOR_TERRACOTTA);
          } else if (activeTheory === 'iit' && fiber.tractKind === 'ventralVisual') {
            sparkColor.copy(COLOR_BIO_TEAL);
          }
        }
        sparkCoreRef.current.setColorAt(i, sparkColor);
        sparkHaloRef.current.setColorAt(i, sparkColor);
      }

      sparkCoreRef.current.instanceMatrix.needsUpdate = true;
      sparkHaloRef.current.instanceMatrix.needsUpdate = true;
      if (sparkCoreRef.current.instanceColor) {
        sparkCoreRef.current.instanceColor.needsUpdate = true;
      }
      if (sparkHaloRef.current.instanceColor) {
        sparkHaloRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <group
      ref={outerGroupRef}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      {/* 437 Z-Anatomy Meshes (Dark Inner Hull + Glowing Thalamus + Pointer Raycast Target) */}
      <primitive object={normalizedBrainGroup} />

      {/* ~29,000-Point High-Definition Z-Anatomy Cortical Gyri & Sulci Point-Cloud Scan */}
      <points
        geometry={zAnatomyPointsGeometry}
        material={zAnatomyPointsMaterial}
        renderOrder={3}
      />

      {/* 184 3D DTI White-Matter Tractography Fiber Streamlines */}
      <lineSegments
        geometry={dtiLineGeometry}
        material={dtiLineMaterial}
        renderOrder={2}
      />

      {/* 160 Racing Action-Potential Photon Sparks inside the DTI Fibers */}
      <instancedMesh
        ref={sparkCoreRef}
        args={[sparkCoreGeom, sparkCoreMat, SPARK_COUNT]}
        renderOrder={2}
      />
      <instancedMesh
        ref={sparkHaloRef}
        args={[sparkHaloGeom, sparkHaloMat, SPARK_COUNT]}
        renderOrder={2}
      />

      {/* Interactive 3D Laser MRI / CT Tomographic Scan Plane Frame (Active in 'slice' mode) */}
      <group ref={mriLaserFrameRef} visible={false}>
        <mesh renderOrder={4}>
          <planeGeometry args={[2.36, 2.1]} />
          <meshBasicMaterial
            color="#D99B4E"
            transparent
            opacity={0.045}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <lineSegments geometry={mriFrameBorderGeometry} renderOrder={5}>
          <lineBasicMaterial
            color="#D99B4E"
            transparent
            opacity={0.82}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
        <lineSegments geometry={mriFrameGridGeometry} renderOrder={4}>
          <lineBasicMaterial
            color="#2AB3A6"
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
        <mesh ref={mriScanlineRef} renderOrder={5}>
          <planeGeometry args={[2.34, 0.014]} />
          <meshBasicMaterial
            color="#E05A47"
            transparent
            opacity={0.78}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Dorsal Clinical TMS Magnetic Ring Coil (Active in ch5) */}
      <group
        ref={tmsCoilRef}
        position={[TMS_LOCUS.x, TMS_LOCUS.y + 0.16, TMS_LOCUS.z]}
        rotation={[0.22, 0.0, 0.42]}
        visible={false}
      >
        <mesh>
          <torusGeometry args={[0.19, 0.019, 16, 48]} />
          <meshPhysicalMaterial
            color="#E05A47"
            emissive="#E05A47"
            emissiveIntensity={0.55}
            roughness={0.28}
            metalness={0.15}
          />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <torusGeometry args={[0.11, 0.01, 12, 36]} />
          <meshBasicMaterial color="#D99B4E" />
        </mesh>
        <mesh ref={tmsWaveRingRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.82, 1.0, 48]} />
          <meshBasicMaterial
            color="#2AB3A6"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// 3. 3D Cellular Pyramidal Neurons ('neurons' mode — Two-Photon Confocal Scan)
// ============================================================================

interface NeuronSignalCurve {
  curve: THREE.CatmullRomCurve3;
  kind: 'topDown' | 'bottomUp';
  neuronIndex: number;
}

interface PyramidalNeuronDescriptor {
  index: number;
  label: string;
  layerTag: string;
  isLayerV: boolean;
  somaPosition: THREE.Vector3;
  depthFactor: number;
  somaGeometry: THREE.BufferGeometry;
  arborGeometry: THREE.BufferGeometry;
}

interface PyramidalMicrocircuitBundle {
  neurons: PyramidalNeuronDescriptor[];
  boutonPositions: THREE.Vector3[];
  signalCurves: NeuronSignalCurve[];
}

function createSmoothLatheSomaGeometry(radius: number): THREE.BufferGeometry {
  const profileControlPoints = [
    new THREE.Vector2(0.0, -radius * 0.95),
    new THREE.Vector2(radius * 0.48, -radius * 0.86),
    new THREE.Vector2(radius * 0.88, -radius * 0.56),
    new THREE.Vector2(radius * 1.02, -radius * 0.16),
    new THREE.Vector2(radius * 0.86, radius * 0.28),
    new THREE.Vector2(radius * 0.56, radius * 0.78),
    new THREE.Vector2(radius * 0.31, radius * 1.32),
    new THREE.Vector2(radius * 0.16, radius * 1.85),
    new THREE.Vector2(0.015, radius * 2.25),
  ];

  const spline = new THREE.SplineCurve(profileControlPoints);
  const lathePoints = spline.getPoints(28);
  const geom = new THREE.LatheGeometry(lathePoints, 32);

  const pos = geom.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const basalWeight = smoothstep(radius * 0.65, -radius * 0.65, y);
    const triMod = 1.0 + 0.08 * Math.cos(angle * 3.0) * basalWeight;
    pos.setXYZ(i, x * triMod, y, z * triMod);
  }

  geom.computeVertexNormals();
  return geom;
}

function mergeTubeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVerts = 0;
  let totalIndices = 0;

  for (const g of geometries) {
    totalVerts += g.attributes.position.count;
    if (g.index) {
      totalIndices += g.index.count;
    }
  }

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const indices = new Uint32Array(totalIndices);

  let vertOffset = 0;
  let idxOffset = 0;

  for (const g of geometries) {
    const posAttr = g.attributes.position as THREE.BufferAttribute;
    const normAttr = g.attributes.normal as THREE.BufferAttribute;
    positions.set(posAttr.array as Float32Array, vertOffset * 3);
    if (normAttr) {
      normals.set(normAttr.array as Float32Array, vertOffset * 3);
    }

    if (g.index) {
      const idxArray = g.index.array;
      for (let i = 0; i < idxArray.length; i++) {
        indices[idxOffset + i] = idxArray[i] + vertOffset;
      }
      idxOffset += idxArray.length;
    }

    vertOffset += posAttr.count;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  merged.computeBoundingSphere();
  return merged;
}

function buildPyramidalMicrocircuit(): PyramidalMicrocircuitBundle {
  const rng = createMulberry32(20260505);
  const neurons: PyramidalNeuronDescriptor[] = [];
  const boutonPositions: THREE.Vector3[] = [];
  const signalCurves: NeuronSignalCurve[] = [];

  const NEURON_COUNT = 16;

  const anchorBoutonsOnCurve = (
    curve: THREE.CatmullRomCurve3,
    fractions: number[],
    offsetRadius: number,
  ) => {
    for (const f of fractions) {
      const pt = curve.getPointAt(f);
      const theta = rng() * Math.PI * 2;
      pt.x += Math.cos(theta) * offsetRadius;
      pt.z += Math.sin(theta) * offsetRadius;
      boutonPositions.push(pt);
    }
  };

  for (let n = 0; n < NEURON_COUNT; n++) {
    const ring = n < 5 ? 0 : n < 11 ? 1 : 2;
    const angle =
      ring === 0
        ? (n / 5) * Math.PI * 2 + 0.25
        : ring === 1
          ? ((n - 5) / 6) * Math.PI * 2 + 0.62
          : ((n - 11) / 5) * Math.PI * 2 + 0.12;
    const radius =
      ring === 0
        ? 0.44 + rng() * 0.16
        : ring === 1
          ? 0.98 + rng() * 0.2
          : 1.48 + rng() * 0.22;

    const sx = Math.cos(angle) * radius;
    const sz = Math.sin(angle) * (radius * 0.82);
    const isLayerV = n % 3 !== 0;
    const sy = isLayerV
      ? -0.56 + (rng() - 0.5) * 0.24
      : -0.16 + (rng() - 0.5) * 0.2;

    const somaPos = new THREE.Vector3(sx, sy, sz);
    const depthFactor = THREE.MathUtils.clamp((sz + 1.45) / 2.9, 0.32, 1.0);

    const somaRadius = isLayerV ? 0.105 : 0.088;
    const somaGeometry = createSmoothLatheSomaGeometry(somaRadius);

    const tubeParts: THREE.BufferGeometry[] = [];

    // 1. Apical Dendrite Trunk rising vertically (+Y) to Layer I
    const apicalTopY = 0.82 + (rng() - 0.5) * 0.14;
    const trunkStart = new THREE.Vector3(sx, sy + somaRadius * 2.0, sz);
    const apicalMid1 = new THREE.Vector3(
      sx + (rng() - 0.5) * 0.07,
      THREE.MathUtils.lerp(trunkStart.y, apicalTopY, 0.36),
      sz + (rng() - 0.5) * 0.07,
    );
    const apicalMid2 = new THREE.Vector3(
      sx + (rng() - 0.5) * 0.09,
      THREE.MathUtils.lerp(trunkStart.y, apicalTopY, 0.72),
      sz + (rng() - 0.5) * 0.09,
    );
    const apicalApex = new THREE.Vector3(
      sx + (rng() - 0.5) * 0.07,
      apicalTopY,
      sz + (rng() - 0.5) * 0.07,
    );

    const apicalTrunkCurve = new THREE.CatmullRomCurve3([
      trunkStart,
      apicalMid1,
      apicalMid2,
      apicalApex,
    ]);
    tubeParts.push(new THREE.TubeGeometry(apicalTrunkCurve, 22, 0.015, 8, false));
    anchorBoutonsOnCurve(apicalTrunkCurve, [0.32, 0.58, 0.82], 0.016);

    signalCurves.push({
      curve: new THREE.CatmullRomCurve3([
        apicalApex.clone(),
        apicalMid2.clone(),
        apicalMid1.clone(),
        somaPos.clone(),
      ]),
      kind: 'topDown',
      neuronIndex: n,
    });

    for (let ob = 0; ob < 3; ob++) {
      const branchStart = apicalTrunkCurve.getPointAt(0.24 + ob * 0.24);
      const obAngle = angle + (ob - 1) * 2.1 + (rng() - 0.5) * 0.5;
      const obLen = 0.22 + rng() * 0.12;
      const obMid = branchStart
        .clone()
        .add(
          new THREE.Vector3(
            Math.cos(obAngle) * obLen * 0.55,
            0.06,
            Math.sin(obAngle) * obLen * 0.55,
          ),
        );
      const obEnd = branchStart
        .clone()
        .add(
          new THREE.Vector3(
            Math.cos(obAngle) * obLen,
            0.12 + rng() * 0.05,
            Math.sin(obAngle) * obLen,
          ),
        );
      const obCurve = new THREE.CatmullRomCurve3([branchStart, obMid, obEnd]);
      tubeParts.push(new THREE.TubeGeometry(obCurve, 10, 0.0075, 6, false));
      anchorBoutonsOnCurve(obCurve, [0.55, 0.92], 0.01);
    }

    // 2. Layer-I Apical Tuft (5 canopy branches)
    const tuftCount = 5;
    for (let tb = 0; tb < tuftCount; tb++) {
      const tuftAngle = (tb / tuftCount) * Math.PI * 2 + rng() * 0.4;
      const spread = 0.26 + rng() * 0.18;
      const tuftMid = new THREE.Vector3(
        apicalApex.x + Math.cos(tuftAngle) * spread * 0.48,
        apicalApex.y + 0.14 + rng() * 0.06,
        apicalApex.z + Math.sin(tuftAngle) * spread * 0.48,
      );
      const tuftTip = new THREE.Vector3(
        apicalApex.x + Math.cos(tuftAngle) * spread,
        apicalApex.y + 0.24 + rng() * 0.1,
        apicalApex.z + Math.sin(tuftAngle) * spread,
      );
      const tuftCurve = new THREE.CatmullRomCurve3([apicalApex, tuftMid, tuftTip]);
      tubeParts.push(new THREE.TubeGeometry(tuftCurve, 12, 0.0085, 6, false));
      anchorBoutonsOnCurve(tuftCurve, [0.48, 0.88], 0.01);

      if (tb % 2 === 0) {
        signalCurves.push({
          curve: new THREE.CatmullRomCurve3([
            tuftTip.clone(),
            tuftMid.clone(),
            apicalApex.clone(),
            apicalMid1.clone(),
            somaPos.clone(),
          ]),
          kind: 'topDown',
          neuronIndex: n,
        });
      }
    }

    // 3. Basal Dendritic Arbor (6 radiating branches)
    const basalCount = 6;
    for (let bb = 0; bb < basalCount; bb++) {
      const bAngle = (bb / basalCount) * Math.PI * 2 + (rng() - 0.5) * 0.35;
      const bSpread = 0.26 + rng() * 0.18;
      const bDrop = -0.11 - rng() * 0.12;
      const bStart = new THREE.Vector3(
        sx + Math.cos(bAngle) * somaRadius * 0.72,
        sy - somaRadius * 0.38,
        sz + Math.sin(bAngle) * somaRadius * 0.72,
      );
      const bMid = new THREE.Vector3(
        sx + Math.cos(bAngle + 0.14) * bSpread * 0.55,
        sy + bDrop * 0.55,
        sz + Math.sin(bAngle + 0.14) * bSpread * 0.55,
      );
      const bTip = new THREE.Vector3(
        sx + Math.cos(bAngle) * bSpread,
        sy + bDrop,
        sz + Math.sin(bAngle) * bSpread,
      );
      const basalCurve = new THREE.CatmullRomCurve3([bStart, bMid, bTip]);
      tubeParts.push(new THREE.TubeGeometry(basalCurve, 12, 0.008, 6, false));
      anchorBoutonsOnCurve(basalCurve, [0.52, 0.9], 0.01);

      if (bb % 2 === 0) {
        signalCurves.push({
          curve: new THREE.CatmullRomCurve3([
            bTip.clone(),
            bMid.clone(),
            somaPos.clone(),
            apicalMid1.clone(),
          ]),
          kind: 'bottomUp',
          neuronIndex: n,
        });
      }
    }

    // 4. Descending Axon & Collateral Branches (-Y)
    const axonBottomY = -1.16 - rng() * 0.12;
    const axonMid = new THREE.Vector3(
      sx + (rng() - 0.5) * 0.04,
      (sy + axonBottomY) * 0.5,
      sz + (rng() - 0.5) * 0.04,
    );
    const axonEnd = new THREE.Vector3(
      sx + (rng() - 0.5) * 0.06,
      axonBottomY,
      sz + (rng() - 0.5) * 0.06,
    );
    const axonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, sy - somaRadius * 0.85, sz),
      axonMid,
      axonEnd,
    ]);
    tubeParts.push(new THREE.TubeGeometry(axonCurve, 14, 0.0058, 6, false));

    signalCurves.push({
      curve: new THREE.CatmullRomCurve3([
        axonEnd.clone(),
        axonMid.clone(),
        somaPos.clone(),
        apicalMid2.clone(),
      ]),
      kind: 'bottomUp',
      neuronIndex: n,
    });

    for (let ac = 0; ac < 2; ac++) {
      const colStart = axonCurve.getPointAt(0.35 + ac * 0.25);
      const colAngle = angle + (ac === 0 ? 1.2 : -1.2);
      const colEnd = colStart
        .clone()
        .add(
          new THREE.Vector3(
            Math.cos(colAngle) * 0.22,
            0.07 + rng() * 0.08,
            Math.sin(colAngle) * 0.22,
          ),
        );
      const colMid = colStart
        .clone()
        .lerp(colEnd, 0.5)
        .add(new THREE.Vector3(0, -0.03, 0));
      const colCurve = new THREE.CatmullRomCurve3([colStart, colMid, colEnd]);
      tubeParts.push(new THREE.TubeGeometry(colCurve, 8, 0.005, 5, false));
      anchorBoutonsOnCurve(colCurve, [0.85], 0.008);
    }

    const arborGeometry = mergeTubeGeometries(tubeParts);

    neurons.push({
      index: n,
      label: isLayerV
        ? `Layer V Pyramidal Neuron #${n + 1}`
        : `Layer III Associative Pyramidal Neuron #${n + 1}`,
      layerTag: isLayerV ? 'Layer Vb Deep Output' : 'Layer II/III Associative',
      isLayerV,
      somaPosition: somaPos,
      depthFactor,
      somaGeometry,
      arborGeometry,
    });
  }

  return {
    neurons,
    boutonPositions,
    signalCurves,
  };
}

const CONFOCAL_FG_SOMA = new THREE.Color('#D8C8B0');
const CONFOCAL_BG_SOMA = new THREE.Color('#5A5044');
const CONFOCAL_FG_ARBOR = new THREE.Color('#C4B59E');
const CONFOCAL_BG_ARBOR = new THREE.Color('#4E453B');
const CONFOCAL_RIM_EMISSIVE = new THREE.Color('#3D2E1E');

interface PyramidalNeuronMicrocircuitProps {
  effectiveMode: 'macro' | 'connectome' | 'neurons' | 'slice';
  predictivePrior: number;
  reducedMotion: boolean;
  onHoverAnatomy?: (info: HoveredAnatomyInfo | null) => void;
}

function PyramidalNeuronMicrocircuit({
  effectiveMode,
  predictivePrior,
  reducedMotion,
  onHoverAnatomy,
}: PyramidalNeuronMicrocircuitProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const scaleRef = useRef(effectiveMode === 'neurons' ? 0.78 : 0.001);
  const hoveredNeuronRef = useRef<number | null>(null);

  const { neurons, boutonPositions, signalCurves } = useMemo(
    () => buildPyramidalMicrocircuit(),
    [],
  );

  const neuronMaterials = useMemo(() => {
    return neurons.map((n) => {
      const d = n.depthFactor;
      const somaColor = new THREE.Color().lerpColors(
        CONFOCAL_BG_SOMA,
        CONFOCAL_FG_SOMA,
        d,
      );
      const arborColor = new THREE.Color().lerpColors(
        CONFOCAL_BG_ARBOR,
        CONFOCAL_FG_ARBOR,
        d,
      );
      const isForeground = d > 0.58;

      const somaMat = new THREE.MeshPhysicalMaterial({
        color: somaColor,
        emissive: CONFOCAL_RIM_EMISSIVE.clone(),
        emissiveIntensity: 0.18 * d,
        roughness: 0.42,
        metalness: 0.04,
        clearcoat: 0.1,
        clearcoatRoughness: 0.38,
        transparent: true,
        opacity: 0.45 + 0.5 * d,
        depthWrite: isForeground,
      });

      const arborMat = new THREE.MeshPhysicalMaterial({
        color: arborColor,
        emissive: CONFOCAL_RIM_EMISSIVE.clone(),
        emissiveIntensity: 0.14 * d,
        roughness: 0.44,
        metalness: 0.04,
        clearcoat: 0.08,
        transparent: true,
        opacity: 0.38 + 0.54 * d,
        depthWrite: isForeground,
      });

      return { somaMat, arborMat };
    });
  }, [neurons]);

  const nucleusGeometry = useMemo(() => new THREE.SphereGeometry(0.036, 14, 14), []);
  const nucleusMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#E05A47',
        transparent: true,
        opacity: 0.78,
      }),
    [],
  );

  const boutonGeometry = useMemo(() => new THREE.SphereGeometry(0.011, 8, 8), []);
  const boutonMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#D99B4E',
        transparent: true,
        opacity: 0.76,
      }),
    [],
  );

  const signalCoreGeometry = useMemo(() => new THREE.SphereGeometry(0.018, 10, 10), []);
  const signalCoreMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.96,
      }),
    [],
  );

  const signalHaloGeometry = useMemo(() => new THREE.SphereGeometry(0.04, 10, 10), []);
  const signalHaloMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  const corticalColumnGridGeometry = useMemo(() => {
    const lines: number[] = [];
    const r = 1.82;
    const pillars = 8;
    for (let p = 0; p < pillars; p++) {
      const a = (p / pillars) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      lines.push(x, -1.18, z, x, 1.08, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lines), 3));
    return g;
  }, []);

  const boutonInstancedRef = useRef<THREE.InstancedMesh | null>(null);
  const signalCoreInstancedRef = useRef<THREE.InstancedMesh | null>(null);
  const signalHaloInstancedRef = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    if (!boutonInstancedRef.current) return;
    for (let i = 0; i < boutonPositions.length; i++) {
      const pt = boutonPositions[i];
      const depth = THREE.MathUtils.clamp((pt.z + 1.45) / 2.9, 0.3, 1.0);
      dummy.position.copy(pt);
      dummy.scale.setScalar((0.68 + (i % 3) * 0.16) * (0.65 + 0.35 * depth));
      dummy.updateMatrix();
      boutonInstancedRef.current.setMatrixAt(i, dummy.matrix);

      tempColor
        .copy(i % 2 === 0 ? COLOR_WARM_AMBER : COLOR_BIO_TEAL)
        .multiplyScalar(0.5 + 0.5 * depth);
      boutonInstancedRef.current.setColorAt(i, tempColor);
    }
    boutonInstancedRef.current.instanceMatrix.needsUpdate = true;
    if (boutonInstancedRef.current.instanceColor) {
      boutonInstancedRef.current.instanceColor.needsUpdate = true;
    }
  }, [boutonPositions, dummy, tempColor]);

  useEffect(() => {
    return () => {
      for (const n of neurons) {
        n.somaGeometry.dispose();
        n.arborGeometry.dispose();
      }
      for (const m of neuronMaterials) {
        m.somaMat.dispose();
        m.arborMat.dispose();
      }
      nucleusGeometry.dispose();
      nucleusMaterial.dispose();
      boutonGeometry.dispose();
      boutonMaterial.dispose();
      signalCoreGeometry.dispose();
      signalCoreMaterial.dispose();
      signalHaloGeometry.dispose();
      signalHaloMaterial.dispose();
      corticalColumnGridGeometry.dispose();
    };
  }, [
    neurons,
    neuronMaterials,
    nucleusGeometry,
    nucleusMaterial,
    boutonGeometry,
    boutonMaterial,
    signalCoreGeometry,
    signalCoreMaterial,
    signalHaloGeometry,
    signalHaloMaterial,
    corticalColumnGridGeometry,
  ]);

  const handleNeuronPointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>, neuron: PyramidalNeuronDescriptor) => {
      if (effectiveMode !== 'neurons') return;
      e.stopPropagation();
      if (hoveredNeuronRef.current !== neuron.index) {
        hoveredNeuronRef.current = neuron.index;
        document.body.style.cursor = 'pointer';
        onHoverAnatomy?.({
          label: 'Layer V Pyramidal Neuron',
          region: 'Neocortical Column (Layers I–VI)',
          category: 'Apical Tuft · Soma · Basal Dendrites · Synapses',
          side: neuron.layerTag,
        });
      }
    },
    [effectiveMode, onHoverAnatomy],
  );

  const handleNeuronPointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (effectiveMode !== 'neurons') return;
      e.stopPropagation();
      if (hoveredNeuronRef.current !== null) {
        hoveredNeuronRef.current = null;
        document.body.style.cursor = 'auto';
        onHoverAnatomy?.(null);
      }
    },
    [effectiveMode, onHoverAnatomy],
  );

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const isActive = effectiveMode === 'neurons';

    const targetScale = isActive ? 0.78 : 0.001;
    scaleRef.current = THREE.MathUtils.damp(scaleRef.current, targetScale, 7.0, dt);

    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);
      groupRef.current.visible = scaleRef.current > 0.02;
      if (isActive && !reducedMotion && hoveredNeuronRef.current === null) {
        groupRef.current.rotation.y += dt * 0.068;
      }
    }

    if (!isActive && scaleRef.current <= 0.025) {
      return;
    }

    const priorNorm = clamp01(predictivePrior / 100);
    const topDownSpeed = reducedMotion ? 0.14 : 0.28 + priorNorm * 0.62;
    const bottomUpSpeed = reducedMotion ? 0.14 : 0.34 + (1.0 - priorNorm * 0.55) * 0.48;

    const somaExcitation = new Float32Array(neurons.length);

    if (signalCoreInstancedRef.current && signalHaloInstancedRef.current) {
      for (let i = 0; i < signalCurves.length; i++) {
        const sc = signalCurves[i];
        const isTopDown = sc.kind === 'topDown';
        const speed = isTopDown ? topDownSpeed : bottomUpSpeed;
        const u = (t * speed + i * 0.137) % 1;

        const pt = sc.curve.getPointAt(u);
        const depth = neurons[sc.neuronIndex].depthFactor;
        dummy.position.copy(pt);

        const weight = isTopDown
          ? 0.5 + priorNorm * 0.9
          : 0.54 + (1.0 - priorNorm * 0.6) * 0.85;
        const pulseEnvelope = Math.sin(u * Math.PI);
        const s = Math.max(0.24, pulseEnvelope * weight * (0.58 + 0.42 * depth));
        dummy.scale.setScalar(s);
        dummy.updateMatrix();

        signalCoreInstancedRef.current.setMatrixAt(i, dummy.matrix);
        signalHaloInstancedRef.current.setMatrixAt(i, dummy.matrix);

        if (isTopDown) {
          tempColor.lerpColors(COLOR_WARM_AMBER, COLOR_TERRACOTTA, priorNorm * 0.6);
          if (u > 0.78) {
            somaExcitation[sc.neuronIndex] += (u - 0.78) * 1.9 * priorNorm;
          }
        } else {
          tempColor.copy(COLOR_BIO_TEAL);
          if (u > 0.45 && u < 0.75) {
            somaExcitation[sc.neuronIndex] += 0.32;
          }
        }
        tempColor.multiplyScalar(0.5 + 0.5 * depth);
        signalCoreInstancedRef.current.setColorAt(i, tempColor);
        signalHaloInstancedRef.current.setColorAt(i, tempColor);
      }

      signalCoreInstancedRef.current.instanceMatrix.needsUpdate = true;
      signalHaloInstancedRef.current.instanceMatrix.needsUpdate = true;
      if (signalCoreInstancedRef.current.instanceColor) {
        signalCoreInstancedRef.current.instanceColor.needsUpdate = true;
      }
      if (signalHaloInstancedRef.current.instanceColor) {
        signalHaloInstancedRef.current.instanceColor.needsUpdate = true;
      }
    }

    for (let n = 0; n < neurons.length; n++) {
      const isHovered = hoveredNeuronRef.current === n;
      const d = neurons[n].depthFactor;
      const { somaMat, arborMat } = neuronMaterials[n];
      const excite = Math.min(0.55, somaExcitation[n]) * d;

      const targetSomaEmissive = 0.16 * d + excite * 0.45 + (isHovered ? 0.38 : 0);
      const targetArborEmissive = 0.12 * d + excite * 0.28 + (isHovered ? 0.32 : 0);

      somaMat.emissiveIntensity = THREE.MathUtils.damp(
        somaMat.emissiveIntensity,
        targetSomaEmissive,
        8.0,
        dt,
      );
      arborMat.emissiveIntensity = THREE.MathUtils.damp(
        arborMat.emissiveIntensity,
        targetArborEmissive,
        8.0,
        dt,
      );
      arborMat.emissive.copy(
        isHovered
          ? COLOR_WARM_AMBER
          : priorNorm > 0.55
            ? CONFOCAL_RIM_EMISSIVE
            : COLOR_BIO_TEAL,
      );
    }
  });

  const laminarLayers = [
    { y: 1.06, color: '#D99B4E', opacity: 0.22 },
    { y: 0.48, color: '#C8C0B4', opacity: 0.12 },
    { y: 0.04, color: '#2AB3A6', opacity: 0.15 },
    { y: -0.56, color: '#2AB3A6', opacity: 0.22 },
    { y: -1.12, color: '#8E8A82', opacity: 0.12 },
  ];

  return (
    <group ref={groupRef} visible={effectiveMode === 'neurons'}>
      {/* Vertical Neocortical Column Laminar Depth Grid (Layers I–VI) */}
      <lineSegments geometry={corticalColumnGridGeometry}>
        <lineBasicMaterial
          color="#C8C0B4"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {laminarLayers.map((layer, idx) => (
        <mesh key={idx} position={[0, layer.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 1.825, 64]} />
          <meshBasicMaterial
            color={layer.color}
            transparent
            opacity={layer.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* 16 Sculpted 3D Pyramidal Neurons (Two-Photon Confocal Fluorescence) */}
      {neurons.map((neuron, idx) => {
        const mats = neuronMaterials[idx];
        return (
          <group
            key={neuron.index}
            onPointerOver={(e) => handleNeuronPointerOver(e, neuron)}
            onPointerOut={handleNeuronPointerOut}
          >
            <mesh
              position={neuron.somaPosition}
              geometry={neuron.somaGeometry}
              material={mats.somaMat}
            />
            <mesh
              position={neuron.somaPosition}
              geometry={nucleusGeometry}
              material={nucleusMaterial}
            />
            <mesh geometry={neuron.arborGeometry} material={mats.arborMat} />
          </group>
        );
      })}

      {/* Tiny, Crisp Synaptic Boutons Anchored on Dendrite Surfaces */}
      <instancedMesh
        ref={boutonInstancedRef}
        args={[boutonGeometry, boutonMaterial, boutonPositions.length]}
      />

      {/* Live Action Potential Impulses (Core + Additive Bioluminescent Halo) */}
      <instancedMesh
        ref={signalCoreInstancedRef}
        args={[signalCoreGeometry, signalCoreMaterial, signalCurves.length]}
      />
      <instancedMesh
        ref={signalHaloInstancedRef}
        args={[signalHaloGeometry, signalHaloMaterial, signalCurves.length]}
      />
    </group>
  );
}

// ============================================================================
// 4. Camera Choreography & Interactive OrbitControls Rig
// ============================================================================

function ObservatoryCameraRig({
  activeChapter,
  effectiveMode,
  sliceAxis,
  reducedMotion,
}: {
  activeChapter: SceneChapterId;
  effectiveMode: 'macro' | 'connectome' | 'neurons' | 'slice';
  sliceAxis: MriSliceAxis;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const transitionRemainingRef = useRef(0.95);
  const desiredCameraPosRef = useRef(new THREE.Vector3(2.88, 0.94, 3.08));
  const desiredTargetRef = useRef(new THREE.Vector3(0, 0.04, 0));

  useEffect(() => {
    if (effectiveMode === 'slice') {
      const sliceCam = SLICE_CAMERA_PRESETS[sliceAxis];
      desiredCameraPosRef.current.set(...sliceCam);
      desiredTargetRef.current.set(0, 0.05, 0);
      transitionRemainingRef.current = reducedMotion ? 0.35 : 1.05;
      return;
    }

    let preset = CAMERA_PRESETS[activeChapter];
    if (effectiveMode === 'neurons') {
      preset = CAMERA_PRESETS.ch4;
    } else if (effectiveMode === 'connectome' && activeChapter !== 'epilogue') {
      preset = CAMERA_PRESETS.ch6;
    }

    desiredCameraPosRef.current.set(...preset.position);
    desiredTargetRef.current.set(...preset.target);
    transitionRemainingRef.current = reducedMotion ? 0.35 : 1.25;
  }, [activeChapter, effectiveMode, sliceAxis, reducedMotion]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const stopTransitionOnUserGrab = () => {
      transitionRemainingRef.current = 0;
    };
    controls.addEventListener('start', stopTransitionOnUserGrab);
    return () => {
      controls.removeEventListener('start', stopTransitionOnUserGrab);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (transitionRemainingRef.current > 0) {
      transitionRemainingRef.current = Math.max(0, transitionRemainingRef.current - dt);
      const lambda = reducedMotion ? 9.0 : 4.2;

      camera.position.lerp(
        desiredCameraPosRef.current,
        1 - Math.exp(-lambda * dt),
      );
      if (controlsRef.current) {
        controlsRef.current.target.lerp(
          desiredTargetRef.current,
          1 - Math.exp(-lambda * dt),
        );
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableZoom={true}
      minDistance={1.85}
      maxDistance={6.4}
      enableDamping
      dampingFactor={0.07}
    />
  );
}

// ============================================================================
// 5. Complete 3D Neuro-Observatory Scene
// ============================================================================

function ConsciousnessScene({
  activeChapter,
  activeTheory,
  pciPulseNonce,
  pciPulseValue,
  predictivePrior,
  reducedMotion,
  scaleMode = 'auto',
  sliceAxis = 'sagittal',
  sliceOffset = 0.15,
  onHoverAnatomy,
}: ConsciousnessCanvas3DProps) {
  const effectiveMode = resolveEffectiveMode(scaleMode, activeChapter);

  return (
    <>
      <color attach="background" args={['#0C0C0B']} />
      <fogExp2 attach="fog" args={['#0C0C0B', 0.042]} />

      {/* Warm Architectural & Biotech Studio Multi-Point Lighting */}
      <ambientLight intensity={0.65} color="#EAE6DF" />
      <hemisphereLight args={['#F2EFE9', '#141413', 0.8]} />
      <directionalLight position={[4.2, 5.8, 4.8]} intensity={1.28} color="#F7F4EE" />
      <directionalLight position={[-4.8, 2.4, -3.8]} intensity={0.72} color="#2AB3A6" />
      <directionalLight position={[0.0, -4.8, 3.0]} intensity={0.52} color="#D99B4E" />
      <pointLight position={[0, 0.12, 0]} intensity={0.75} distance={4.2} color="#D99B4E" />

      <ObservatoryCameraRig
        activeChapter={activeChapter}
        effectiveMode={effectiveMode}
        sliceAxis={sliceAxis}
        reducedMotion={reducedMotion}
      />

      {/* Real 3D Z-Anatomy Human Brain: 29,000-Point Scan + 184 DTI Fibers + 3D MRI Slicer */}
      <Suspense fallback={<FallbackLobesBrain reducedMotion={reducedMotion} />}>
        <ZAnatomyBrain
          activeChapter={activeChapter}
          activeTheory={activeTheory}
          effectiveMode={effectiveMode}
          sliceAxis={sliceAxis}
          sliceOffset={sliceOffset}
          pciPulseNonce={pciPulseNonce}
          pciPulseValue={pciPulseValue}
          predictivePrior={predictivePrior}
          reducedMotion={reducedMotion}
          onHoverAnatomy={onHoverAnatomy}
        />
      </Suspense>

      {/* 3D Cellular Pyramidal Neurons Microcircuit (Layers I-VI Confocal Fluorescence) */}
      <PyramidalNeuronMicrocircuit
        effectiveMode={effectiveMode}
        predictivePrior={predictivePrior}
        reducedMotion={reducedMotion}
        onHoverAnatomy={onHoverAnatomy}
      />

    </>
  );
}

// ============================================================================
// Pure CSS Biotech Editorial Graceful Fallback & Error Boundary
// ============================================================================

const CHAPTER_FALLBACK_ACCENTS: Record<SceneChapterId, [string, string]> = {
  hero: ['rgba(230, 225, 214, 0.18)', 'rgba(42, 179, 166, 0.15)'],
  ch1: ['rgba(224, 90, 71, 0.22)', 'rgba(217, 155, 78, 0.18)'],
  ch2: ['rgba(224, 90, 71, 0.24)', 'rgba(42, 179, 166, 0.2)'],
  ch3: ['rgba(42, 179, 166, 0.24)', 'rgba(224, 90, 71, 0.2)'],
  ch4: ['rgba(217, 155, 78, 0.24)', 'rgba(42, 179, 166, 0.18)'],
  ch5: ['rgba(42, 179, 166, 0.26)', 'rgba(217, 155, 78, 0.2)'],
  ch6: ['rgba(42, 179, 166, 0.24)', 'rgba(230, 225, 214, 0.16)'],
  epilogue: ['rgba(217, 155, 78, 0.2)', 'rgba(42, 179, 166, 0.16)'],
};

function BiotechVoidFallback({
  activeChapter,
  predictivePrior,
}: {
  activeChapter: SceneChapterId;
  predictivePrior: number;
}) {
  const [accentA, accentB] = CHAPTER_FALLBACK_ACCENTS[activeChapter];
  const ringScale = 0.94 + clamp01(predictivePrior / 100) * 0.16;

  return (
    <div
      aria-hidden="true"
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 48%, ${accentA} 0%, ${accentB} 30%, rgba(18, 18, 17, 0.96) 64%, #0C0C0B 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        style={{
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          boxShadow: `0 0 110px ${accentA}, inset 0 0 70px ${accentB}`,
          transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  );
}

interface WebGLErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Graceful fallback handles constrained GPUs / headless environments silently
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Preload both real 3D medical assets
useGLTF.preload('./models/brain_lobes.glb');
useGLTF.preload('./models/brain_anatomy.glb', './draco/');

// ============================================================================
// Main Exported Component
// ============================================================================

export function ConsciousnessCanvas3D(props: ConsciousnessCanvas3DProps) {
  const { activeChapter, predictivePrior } = props;
  const [contextLost, setContextLost] = useState(false);
  const cleanupContextListenersRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupContextListenersRef.current?.();
      cleanupContextListenersRef.current = null;
      document.body.style.cursor = 'auto';
    };
  }, []);

  const handleCreated = useCallback(
    ({ gl }: { gl: THREE.WebGLRenderer }) => {
      gl.localClippingEnabled = true;
      cleanupContextListenersRef.current?.();
      const canvas = gl.domElement;

      const onContextLost = (event: Event) => {
        event.preventDefault();
        setContextLost(true);
      };
      const onContextRestored = () => {
        setContextLost(false);
      };

      canvas.addEventListener('webglcontextlost', onContextLost, false);
      canvas.addEventListener('webglcontextrestored', onContextRestored, false);

      cleanupContextListenersRef.current = () => {
        canvas.removeEventListener('webglcontextlost', onContextLost);
        canvas.removeEventListener('webglcontextrestored', onContextRestored);
      };
    },
    [],
  );

  const fallbackNode = (
    <BiotechVoidFallback
      activeChapter={activeChapter}
      predictivePrior={predictivePrior}
    />
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#0C0C0B]"
      aria-label="Interactive 3D Human Brain, DTI Tractography, MRI Cross-Section Slicer, and Cellular Pyramidal Neuron Observatory"
    >
      <WebGLErrorBoundary fallback={fallbackNode}>
        {contextLost ? (
          fallbackNode
        ) : (
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [2.88, 0.94, 3.08], fov: 40, near: 0.1, far: 50 }}
            gl={{
              localClippingEnabled: true,
              antialias: true,
              alpha: false,
              stencil: false,
              depth: true,
              powerPreference: 'high-performance',
            }}
            fallback={fallbackNode}
            onCreated={handleCreated}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <ConsciousnessScene {...props} />
          </Canvas>
        )}
      </WebGLErrorBoundary>
    </div>
  );
}

export default ConsciousnessCanvas3D;
