import * as THREE from 'three';

export type BrainVisualMode =
  | 'cerebellum'
  | 'scan'
  | 'cogitate'
  | 'tms'
  | 'silicon';

export interface CortexUniforms {
  [uniform: string]: THREE.IUniform<unknown>;
  uTime: THREE.IUniform<number>;
  uMode: THREE.IUniform<number>; // 0=cerebellum, 1=scan, 2=cogitate, 3=tms, 4=silicon
  uDarkTheme: THREE.IUniform<number>; // 0=paper #FAF9F5, 1=darkroom #111419
  uOpacity: THREE.IUniform<number>;
  uProgress: THREE.IUniform<number>; // SCAN fracture (0..1), Feedback loops (0..1), Silicon ratio (0..1)
  uFocusMode: THREE.IUniform<number>; // COGITATE: 0=neutral, 1=iit, 2=gnwt, 3=both+thalamus | TMS: 0=coma(0.21), 1=cmd(0.44)
  uPulseTime: THREE.IUniform<number>; // seconds since impulse (negative = idle)
  uClipZ: THREE.IUniform<number>; // Smooth animated optical slice Z plane (disabled when > 1.8)
}

const CORTEX_VERT = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying vec3 vColorAttr;

  void main() {
    vLocalPos = position;
    vColorAttr = color;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

/**
 * Swiss Optical Cortical Shader (Leica × Dieter Rams × Allen Brain Institute):
 * - Uses real FreeSurfer fsaverage5 sulcal depth (vColorAttr.r) & curvature (vColorAttr.g) for sculptural shading.
 * - Supports 5 unified scientific modes with 0% cheap neon cyberpunk:
 *   0: Cerebellum Paradox (semi-transparent alabaster shell revealing recurrent feedback web & blue cerebellum)
 *   1: Homunculus -> SCAN 2023 (real M1 precentral cobalt ribbon physically fracturing into 3 crimson SCAN inter-effector nodes + clean optical cutline)
 *   2: COGITATE 2025 X-Ray Glass (Fresnel glass cortex + anatomical IIT posterior hot zone vs GNWT prefrontal glow)
 *   3: ICU TMS-EEG PCI* Wave (3D cortical propagation from Pz: local dead thud for coma vs cross-hemisphere complex echo for CMD)
 *   4: Chalmers Fading Qualia (phase-transition crystallization from warm organic cortex into faceted geometric silicon)
 */
const CORTEX_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uMode;
  uniform float uDarkTheme;
  uniform float uOpacity;
  uniform float uProgress;
  uniform float uFocusMode;
  uniform float uPulseTime;
  uniform float uClipZ;

  varying vec3 vNormalView;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying vec3 vColorAttr;

  // Swiss optical palette (linearized approximations tuned for sRGB output)
  const vec3 PAPER_CREST  = vec3(0.935, 0.918, 0.875);
  const vec3 PAPER_SULCUS = vec3(0.680, 0.655, 0.605);
  const vec3 DARK_CREST   = vec3(0.245, 0.275, 0.335);
  const vec3 DARK_SULCUS  = vec3(0.085, 0.100, 0.130);
  const vec3 COBALT       = vec3(0.015, 0.305, 0.875);
  const vec3 SIGNAL_RED   = vec3(0.988, 0.255, 0.035);
  const vec3 EMERALD      = vec3(0.180, 0.820, 0.590);
  const vec3 SILICON_COLD = vec3(0.165, 0.205, 0.280);

  void main() {
    // Optional animated optical slice plane along Z (anterior-posterior)
    if (uClipZ < 1.75 && vLocalPos.z < uClipZ) {
      discard;
    }

    vec3 N = normalize(vNormalView);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(vViewPos);
    float ndotv = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = pow(1.0 - ndotv, 2.35);

    // Real MRI sulcal depth (0 = deep sulcus, 1 = gyral crown)
    float sulc = clamp(vColorAttr.r, 0.0, 1.0);
    float curv = clamp(vColorAttr.g, 0.0, 1.0);

    // Three-point Leica studio lighting (Key + Soft Fill + Subtle Rim)
    vec3 L1 = normalize(vec3(0.55, 0.78, 0.62));
    vec3 L2 = normalize(vec3(-0.72, -0.25, 0.45));
    float diff1 = max(dot(N, L1), 0.0) * 0.74 + 0.26;
    float diff2 = max(dot(N, L2), 0.0) * 0.22;
    vec3 H1 = normalize(L1 + V);
    float spec = pow(max(dot(N, H1), 0.0), 28.0) * 0.12;

    vec3 baseCrest = mix(PAPER_CREST, DARK_CREST, uDarkTheme);
    vec3 baseSulc  = mix(PAPER_SULCUS, DARK_SULCUS, uDarkTheme);
    vec3 col = mix(baseSulc, baseCrest, smoothstep(0.08, 0.92, sulc));
    col *= (diff1 + diff2);
    col += vec3(spec) * mix(vec3(1.0, 0.99, 0.95), vec3(0.75, 0.85, 1.0), uDarkTheme);

    // Subtle Swiss architectural contour rim
    vec3 rimTone = mix(vec3(0.32, 0.31, 0.29), vec3(0.55, 0.68, 0.92), uDarkTheme);
    col = mix(col, rimTone, fresnel * mix(0.28, 0.62, uDarkTheme));

    float alpha = uOpacity;

    // Sharp glowing cut edge when optical clipping plane slices through cortex
    if (uClipZ < 1.75) {
      float sliceEdge = 1.0 - smoothstep(0.0, 0.032, abs(vLocalPos.z - uClipZ));
      col = mix(col, SIGNAL_RED, sliceEdge * 0.92);
      if (!gl_FrontFacing) {
        col = mix(vec3(0.78, 0.75, 0.69), vec3(0.14, 0.17, 0.22), uDarkTheme) * (0.7 + 0.3 * ndotv);
      }
    }

    // === MODE 0: CEREBELLUM PARADOX (Recurrent cortical reverberation wave!) ===
    if (uMode < 0.5) {
      float feedback = uProgress; // 0..1 feedback loop strength
      if (uPulseTime >= 0.0 && uPulseTime < 4.5) {
        float wave1 = sin(vLocalPos.z * 7.5 - uPulseTime * 6.0) * 0.5 + 0.5;
        float wave2 = sin(vLocalPos.x * 8.5 + vLocalPos.y * 6.0 + uPulseTime * 5.2) * 0.5 + 0.5;
        float decay = exp(-uPulseTime * mix(2.8, 0.42, feedback));
        float echo = pow(wave1 * wave2, 1.6) * decay * (0.25 + 0.85 * feedback);
        col = mix(col, SIGNAL_RED, clamp(echo * 0.9, 0.0, 0.88));
      }
      // Subtle translucent window when inspecting deep recurrent arcs
      alpha = mix(uOpacity, clamp(0.24 + fresnel * 0.55, 0.2, 0.85), feedback * 0.65);
    }

    // === MODE 1: HOMUNCULUS (1937) -> SCAN INTER-EFFECTOR FRACTURE (Nature 2023) ===
    else if (uMode < 1.5) {
      float fracture = clamp(uProgress, 0.0, 1.0);
      float ax = abs(vLocalPos.x);
      // Anatomically calibrated M1 Precentral Gyrus band along the central sulcus (angled slightly forward laterally!)
      float m1CenterZ = 0.035 - ax * 0.22;
      float m1Band = exp(-pow((vLocalPos.z - m1CenterZ) / 0.072, 2.0)) * smoothstep(0.04, 0.12, vLocalPos.y + 0.04);

      // 3 anatomically positioned bilateral SCAN inter-effector nodes along M1 (Gordon & Dosenbach, Nature 2023):
      // SCAN 1 (between Foot & Hand), SCAN 2 (between Hand & Mouth), SCAN 3 (inferior to Mouth)
      vec3 s1 = vec3(0.22, 0.72, 0.01);
      vec3 s2 = vec3(0.55, 0.43, -0.08);
      vec3 s3 = vec3(0.68, 0.11, -0.11);
      vec3 symPos = vec3(ax, vLocalPos.y, vLocalPos.z);

      float d1 = length(symPos - s1);
      float d2 = length(symPos - s2);
      float d3 = length(symPos - s3);
      float scanMask = max(
        exp(-pow(d1 / 0.085, 2.0)),
        max(exp(-pow(d2 / 0.088, 2.0)), exp(-pow(d3 / 0.085, 2.0)))
      );

      // Penfield 1937 continuous cobalt ribbon PHYSICALLY fractures as SCAN nodes carve 3 gaps through it!
      float carvedGap = smoothstep(0.18, 0.52, scanMask) * fracture;
      float penfieldRibbon = m1Band * (1.0 - carvedGap * 0.96) * (1.0 - fracture * 0.15);
      col = mix(col, COBALT, clamp(penfieldRibbon * 0.82, 0.0, 0.85));

      // 3 Crimson SCAN inter-effector hubs ignite inside the fractures with soft pulse!
      float pulse = 0.88 + 0.12 * sin(uTime * 3.4);
      float scanGlow = smoothstep(0.14, 0.75, scanMask) * fracture * pulse;
      col = mix(col, SIGNAL_RED, clamp(scanGlow * 0.96, 0.0, 0.96));
    }

    // === MODE 2: COGITATE 2025 X-RAY GLASS (IIT Posterior Hot Zone vs GNWT Prefrontal Ignition) ===
    else if (uMode < 2.5) {
      // Fresnel X-Ray glass look so internal 3D Thalamus & white-matter tracts shine cleanly through!
      float iitZone = smoothstep(0.18, 0.58, vLocalPos.z) * smoothstep(-0.35, 0.08, vLocalPos.y);
      float gnwtZone = smoothstep(-0.26, -0.62, vLocalPos.z) * smoothstep(-0.28, 0.10, vLocalPos.y);

      float showIit = (uFocusMode > 0.5 && uFocusMode < 1.5) || uFocusMode > 2.5 ? 1.0 : 0.0;
      float showGnwt = (uFocusMode > 1.5 && uFocusMode < 2.5) || uFocusMode > 2.5 ? 1.0 : 0.0;

      float breath = 0.85 + 0.15 * sin(uTime * 2.8);
      col = mix(col, COBALT, iitZone * showIit * 0.85 * breath);
      col = mix(col, SIGNAL_RED, gnwtZone * showGnwt * 0.85 * breath);

      // Subtle architectural engraving lines along sulcal curvature
      float glassAlpha = clamp(0.16 + fresnel * 0.62 + (iitZone * showIit + gnwtZone * showGnwt) * 0.22, 0.15, 0.88);
      alpha = glassAlpha * uOpacity;
    }

    // === MODE 3: ICU TMS-EEG 3D COMPLEXITY WAVE (Massimini PCI* = 0.31) ===
    else if (uMode < 3.5) {
      // Stimulation site Pz: midline superior parietal cortex
      vec3 pzSite = vec3(0.0, 0.66, 0.42);
      float distPz = length(vLocalPos - pzSite);

      // Subtle cobalt target ring at Pz
      float targetRing = exp(-pow((distPz - 0.09) / 0.018, 2.0)) * 0.55;
      col = mix(col, COBALT, targetRing);

      if (uPulseTime >= 0.0 && uPulseTime < 3.2) {
        if (uFocusMode < 0.5) {
          // DEEP COMA (PCI* = 0.21): Local slow stereotypical thud that dies rapidly near Pz!
          float radius = uPulseTime * 0.55;
          float localRing = exp(-pow((distPz - radius) / 0.11, 2.0)) * exp(-distPz * 4.2) * exp(-uPulseTime * 2.4);
          col = mix(col, vec3(0.55, 0.62, 0.72), clamp(localRing * 1.15, 0.0, 0.92));
        } else {
          // COVERT CONSCIOUSNESS CMD (PCI* = 0.44): Complex differentiated ripple cascading across BOTH hemispheres!
          float front = uPulseTime * 1.35;
          float primaryWave = exp(-pow((distPz - front) / 0.12, 2.0)) * exp(-uPulseTime * 0.65);
          float secondaryEcho = (sin(distPz * 14.0 - uPulseTime * 9.5 + curv * 6.0) * 0.5 + 0.5)
                              * smoothstep(front + 0.05, front - 0.35, distPz)
                              * exp(-uPulseTime * 0.75) * 0.65;
          float intensity = clamp(primaryWave + secondaryEcho, 0.0, 1.0);
          vec3 waveCol = mix(EMERALD, SIGNAL_RED, smoothstep(0.55, 1.25, distPz) * 0.55);
          col = mix(col, waveCol, intensity * 0.92);
        }
      }
      alpha = clamp(0.76 + fresnel * 0.24, 0.0, 1.0) * uOpacity;
    }

    // === MODE 4: CHALMERS FADING QUALIA (Block-by-block cortical parcel replacement 0% -> 100%!) ===
    else {
      // Deterministic 3D anatomical parcel hash (Voronoi-like regional blocks along posterior->anterior axis)
      vec3 cell = floor(vLocalPos * 4.2);
      float parcelHash = fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
      float parcelRank = clamp((1.0 - (vLocalPos.z + 1.02) / 2.04) * 0.72 + parcelHash * 0.28, 0.0, 1.0);

      float isSilicon = smoothstep(parcelRank - 0.015, parcelRank + 0.015, uProgress) * step(0.005, uProgress);
      float switching = exp(-pow((uProgress - parcelRank) / 0.045, 2.0)) * step(0.01, uProgress) * step(uProgress, 0.99);

      // Architectural micro-circuit grid on replaced silicon parcels
      vec3 g = abs(fract(vLocalPos * 15.0 - 0.5) - 0.5) / max(fwidth(vLocalPos * 15.0), vec3(0.001));
      float gridLine = 1.0 - min(min(g.x, g.y), g.z);
      float circuit = smoothstep(0.45, 0.95, gridLine);

      // Cold geometric faceted silicon shading
      vec3 flatN = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
      float flatDiff = max(dot(flatN, L1), 0.0) * 0.78 + 0.22;
      vec3 siliconCol = SILICON_COLD * flatDiff + COBALT * circuit * 0.58 + vec3(0.45, 0.62, 0.95) * fresnel * 0.42;

      col = mix(col, siliconCol, isSilicon);
      col = mix(col, SIGNAL_RED, switching * 0.92);
    }

    gl_FragColor = vec4(col, alpha);
  }
`;

export function createCortexShaderMaterial(initialDark = false): THREE.ShaderMaterial {
  const uniforms: CortexUniforms = {
    uTime: { value: 0 },
    uMode: { value: 0 },
    uDarkTheme: { value: initialDark ? 1 : 0 },
    uOpacity: { value: 1 },
    uProgress: { value: 0 },
    uFocusMode: { value: 0 },
    uPulseTime: { value: -1 },
    uClipZ: { value: 2.5 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: CORTEX_VERT,
    fragmentShader: CORTEX_FRAG,
    vertexColors: true,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

const SUB_VERT = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying vec3 vColorAttr;

  void main() {
    vLocalPos = position;
    vColorAttr = color;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const SUB_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform float uPulseSpeed;
  uniform float uPulseStrength;
  uniform float uOpacity;
  uniform float uFeedForwardWave; // >0 for Cerebellum parallel non-recurrent lanes!

  varying vec3 vNormalView;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying vec3 vColorAttr;

  void main() {
    vec3 N = normalize(vNormalView);
    vec3 V = normalize(vViewPos);
    float ndotv = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = pow(1.0 - ndotv, 2.2);

    vec3 L = normalize(vec3(0.5, 0.8, 0.6));
    float diff = max(dot(N, L), 0.0) * 0.72 + 0.28;
    float fold = clamp(vColorAttr.r, 0.0, 1.0);

    vec3 col = uBaseColor * mix(0.68, 1.12, fold) * diff;
    float pulse = 0.5 + 0.5 * sin(uTime * uPulseSpeed);
    col = mix(col, uAccentColor, pulse * uPulseStrength + fresnel * 0.35);

    // Parallel downward modular impulse sweep on Cerebellum (dies fast, no reverberation!)
    if (uFeedForwardWave >= 0.0 && uFeedForwardWave < 0.75) {
      float sweepY = mix(-0.10, -0.82, uFeedForwardWave / 0.65);
      float band = exp(-pow((vLocalPos.y - sweepY) / 0.09, 2.0));
      col = mix(col, vec3(0.95, 0.98, 1.0), band * 0.78);
    }

    gl_FragColor = vec4(col, uOpacity);
  }
`;

export function createSubstructureMaterial(
  baseHex: string,
  accentHex: string,
  opacity = 1,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(baseHex) },
      uAccentColor: { value: new THREE.Color(accentHex) },
      uPulseSpeed: { value: 4.5 },
      uPulseStrength: { value: 0.15 },
      uOpacity: { value: opacity },
      uFeedForwardWave: { value: -1 },
    },
    vertexShader: SUB_VERT,
    fragmentShader: SUB_FRAG,
    vertexColors: true,
    transparent: opacity < 0.99,
    depthWrite: opacity >= 0.95,
  });
}

const TRACT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TRACT_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uSpeed;
  uniform float uReverse;
  varying vec2 vUv;

  void main() {
    float dir = mix(1.0, -1.0, uReverse);
    float travel = fract(vUv.x * 2.2 - uTime * uSpeed * dir);
    float packet = smoothstep(0.62, 0.92, travel) * (1.0 - smoothstep(0.92, 1.0, travel));
    vec3 col = mix(uColor * 0.65, vec3(1.0, 0.96, 0.90), packet * 0.78);
    float a = uOpacity * (0.28 + packet * 0.72);
    gl_FragColor = vec4(col, a);
  }
`;

export function createTractMaterial(colorHex: string, speed = 0.85, reverse = false): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(colorHex) },
      uOpacity: { value: 0.85 },
      uSpeed: { value: speed },
      uReverse: { value: reverse ? 1 : 0 },
    },
    vertexShader: TRACT_VERT,
    fragmentShader: TRACT_FRAG,
    transparent: true,
    depthWrite: false,
  });
}
