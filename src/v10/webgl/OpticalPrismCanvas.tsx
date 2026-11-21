import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type PrismMode = 'spectrum' | 'magenta';

interface OpticalPrismCanvasProps {
  mode: PrismMode;
  /** 0..1 continuous user control: wavelength focus in 'spectrum' mode OR red+blue convergence in 'magenta' mode */
  mix: number;
  className?: string;
}

/**
 * Live WebGL Fragment Shader #2: "Glass Optical Prism & Impossible Magenta"
 * Renders a razor-sharp Leica/Pink-Floyd museum glass prism in pure real-time GLSL:
 * - 'spectrum': White beam hits the glass prism and disperses into true physical chromatic bands (420 -> 690 nm)
 * - 'magenta': Two physical lasers (660 nm Crimson + 440 nm Cobalt) converge across the glass prism —
 *   where they cross, the human brain hallucinates dazzling MAGENTA, a color absent from the physical spectrum!
 */
export function OpticalPrismCanvas({ mode, mix, className = 'w-full h-[320px] sm:h-[360px]' }: OpticalPrismCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ mode, mix, visible: false });
  stateRef.current.mode = mode;
  stateRef.current.mix = mix;

  const [inNear, setInNear] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(
      ([e]) => setInNear(e.isIntersecting),
      { rootMargin: '120px 0px 120px 0px', threshold: 0 },
    );
    const visObs = new IntersectionObserver(
      ([e]) => {
        stateRef.current.visible = e.isIntersecting;
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

    const w = Math.max(260, container.clientWidth);
    const h = Math.max(200, container.clientHeight);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(w, h) },
        uMode: { value: 0 },
        uMix: { value: 0.5 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec2 uRes;
        uniform float uMode;
        uniform float uMix;
        varying vec2 vUv;

        // Signed distance to an equilateral optical prism centered at p
        float sdEquilateralTriangle(vec2 p, float r) {
          const float k = sqrt(3.0);
          p.x = abs(p.x) - r;
          p.y = p.y + r / k;
          if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
          p.x -= clamp(p.x, -2.0 * r, 0.0);
          return -length(p) * sign(p.y);
        }

        // Distance to a line segment ab
        float sdSegment(vec2 p, vec2 a, vec2 b) {
          vec2 pa = p - a, ba = b - a;
          float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
          return length(pa - ba * h);
        }

        // Spectral wavelength RGB approximation (0 = 420nm violet-blue .. 1 = 680nm deep red)
        vec3 spectralColor(float t) {
          vec3 c0 = vec3(0.28, 0.14, 0.95); // 430nm
          vec3 c1 = vec3(0.02, 0.42, 0.98); // 470nm
          vec3 c2 = vec3(0.08, 0.85, 0.56); // 525nm
          vec3 c3 = vec3(0.96, 0.84, 0.14); // 580nm
          vec3 c4 = vec3(0.99, 0.25, 0.04); // 655nm
          if (t < 0.25) return mix(c0, c1, t / 0.25);
          if (t < 0.50) return mix(c1, c2, (t - 0.25) / 0.25);
          if (t < 0.75) return mix(c2, c3, (t - 0.50) / 0.25);
          return mix(c3, c4, (t - 0.75) / 0.25);
        }

        void main() {
          vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
          vec3 bg = vec3(0.045, 0.052, 0.072);

          // Ultra-fine Swiss optical reticle grid
          vec2 grid = abs(fract(uv * 8.0 - 0.5) - 0.5) / max(fwidth(uv * 8.0), vec2(0.001));
          float gLine = 1.0 - min(grid.x, grid.y);
          vec3 col = bg + vec3(0.025, 0.03, 0.042) * smoothstep(0.6, 1.0, gLine);

          vec2 prismCenter = vec2(-0.04, -0.02);
          float dTri = sdEquilateralTriangle(uv - prismCenter, 0.30);

          if (uMode < 0.5) {
            // === MODE 0: PHYSICAL PRISM DISPERSION (White light -> Rainbow Fan) ===
            vec2 entry = vec2(-0.18, 0.04);
            vec2 beamStart = vec2(-1.15, -0.14 + (uMix - 0.5) * 0.16);

            // Incoming crisp white beam
            float dIn = sdSegment(uv, beamStart, entry);
            float inBeam = exp(-dIn * 58.0) + 0.38 * exp(-dIn * 14.0);
            col += vec3(0.98, 0.96, 0.91) * inBeam * 0.92;

            // Internal refracted caustic fan inside glass
            if (dTri < 0.0) {
              float dInt = sdSegment(uv, entry, vec2(0.11, 0.01));
              col += vec3(0.75, 0.84, 0.98) * exp(-dInt * 16.0) * 0.32;
            }

            // 9 dispersed chromatic rays exiting the right glass face!
            for (int i = 0; i < 9; i++) {
              float t = float(i) / 8.0; // 0=violet .. 1=red
              float spread = mix(-0.34, 0.16, t) + (uMix - 0.5) * 0.10;
              vec2 exitPt = vec2(0.105, mix(-0.04, 0.06, t));
              vec2 rayEnd = vec2(1.25, exitPt.y + spread * 1.15);
              float dRay = sdSegment(uv, exitPt, rayEnd);
              float focusBoost = 0.55 + 0.75 * exp(-pow((t - uMix) / 0.24, 2.0));
              float rayGlow = (exp(-dRay * 42.0) + 0.32 * exp(-dRay * 11.0)) * focusBoost;
              col += spectralColor(t) * rayGlow * 0.42;
            }
          } else {
            // === MODE 1: IMPOSSIBLE MAGENTA WITH TRUE 2-FACE OPTICAL REFRACTION THROUGH LEICA PRISM! ===
            float conv = smoothstep(0.0, 1.0, uMix);
            vec2 target = vec2(0.56, 0.0);

            // Red 660 nm beam: enters upper-left prism face, refracts downward through glass, exits right face -> converges!
            vec2 redStart = vec2(-1.12, 0.26);
            vec2 redIn    = vec2(-0.145, 0.115);
            vec2 redOut   = vec2(0.085, 0.082);
            vec2 redEnd   = mix(vec2(1.02, 0.02), target, conv);

            // Blue 440 nm beam: enters lower-left prism face with steeper dispersion angle, refracts upward -> converges!
            vec2 blueStart = vec2(-1.12, -0.28);
            vec2 blueIn    = vec2(-0.235, -0.055);
            vec2 blueOut   = vec2(0.145, -0.032);
            vec2 blueEnd   = mix(vec2(1.02, -0.09), target, conv);

            float dRedOut  = min(sdSegment(uv, redStart, redIn), sdSegment(uv, redOut, redEnd));
            float dRedInt  = sdSegment(uv, redIn, redOut);
            float dBlueOut = min(sdSegment(uv, blueStart, blueIn), sdSegment(uv, blueOut, blueEnd));
            float dBlueInt = sdSegment(uv, blueIn, blueOut);

            float redI  = exp(-dRedOut * 54.0) + 0.28 * exp(-dRedOut * 14.0) + 0.62 * exp(-dRedInt * 42.0);
            float blueI = exp(-dBlueOut * 54.0) + 0.28 * exp(-dBlueOut * 14.0) + 0.62 * exp(-dBlueInt * 42.0);

            col += vec3(0.99, 0.22, 0.06) * redI * 0.88;
            col += vec3(0.08, 0.42, 1.00) * blueI * 0.92;

            // Delicate non-spectral MAGENTA focal interference ring where both refracted beams cross!
            float dSpot = length(uv - target);
            float magBloom = exp(-dSpot * 8.5) * conv * (0.86 + 0.14 * sin(uTime * 2.8));
            float magCore  = exp(-dSpot * 24.0) * conv;
            float magRing  = exp(-pow((dSpot - 0.085) * 32.0, 2.0)) * conv * 0.35;
            col += vec3(0.92, 0.12, 0.64) * (magBloom * 0.88 + magRing);
            col += vec3(1.0, 0.72, 0.94) * magCore * 0.62;
          }

          // Refined Leica Optical Glass Prism Body (Crisp physical bevel, ZERO cheap synthwave neon!)
          if (dTri < 0.0) {
            float innerDepth = clamp(-dTri * 5.0, 0.0, 1.0);
            float glassSheen = smoothstep(-0.35, 0.35, uv.x * 0.6 + uv.y * 0.8) * 0.09;
            col = mix(col, col * 1.14 + vec3(0.06, 0.085, 0.12) + vec3(glassSheen), 0.42 * (1.0 - innerDepth * 0.45));
          }
          float edgeLine = exp(-abs(dTri) * 185.0);
          float bevelRim = exp(-abs(dTri) * 48.0) * 0.16;
          col += vec3(0.78, 0.85, 0.95) * (edgeLine * 0.72 + bevelRim);

          // Subtle filmic vignette
          col *= 1.0 - dot(uv * 0.42, uv * 0.42);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    scene.add(new THREE.Mesh(geo, mat));

    const resizeObs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const rw = Math.max(200, Math.floor(e.contentRect.width));
      const rh = Math.max(180, Math.floor(e.contentRect.height));
      renderer.setSize(rw, rh, false);
      mat.uniforms.uRes.value.set(rw, rh);
    });
    resizeObs.observe(container);

    let rafId = 0;
    const t0 = performance.now() * 0.001;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!stateRef.current.visible) return;
      mat.uniforms.uTime.value = performance.now() * 0.001 - t0;
      mat.uniforms.uMode.value = stateRef.current.mode === 'magenta' ? 1 : 0;
      mat.uniforms.uMix.value = stateRef.current.mix;
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, [inNear]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
