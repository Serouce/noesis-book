import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Compass, Layers } from 'lucide-react';
import type {
  ChapterCh4,
  Lang,
  LocalizedContent,
  PredictivePreset,
  PredictivePresetId,
} from '../../data/content';
import {
  SPATIAL_SPRING,
  getSliderFillStyle,
  syncCanvasHiDpi,
  usePrefersReducedMotion,
} from './labUtils';

export interface PredictiveLabProps {
  lab: ChapterCh4['lab'];
  ui: LocalizedContent['ui'];
  lang: Lang;
  prior: number;
  onPriorChange: (prior: number) => void;
}

interface SensoryParticle {
  /** Base target ring index (0..2) */
  ring: number;
  /** Target angle on geometric contour */
  angle: number;
  /** Deterministic pseudo-random phase seed */
  seed: number;
  /** Current normalized offset from center */
  x: number;
  y: number;
  /** Color variant: 0 cyan, 1 violet */
  tint: 0 | 1;
}

function createInitialParticles(count: number): SensoryParticle[] {
  const list: SensoryParticle[] = [];
  for (let i = 0; i < count; i++) {
    const phi = (i / count) * Math.PI * 2;
    const seed = ((i * 7919) % 997) / 997;
    const ring = i % 3;
    list.push({
      ring,
      angle: phi,
      seed,
      x: Math.cos(phi) * (0.28 + ring * 0.22),
      y: Math.sin(phi) * (0.28 + ring * 0.22),
      tint: i % 4 === 0 ? 1 : 0,
    });
  }
  return list;
}

interface RegimeDiagnosis {
  id: PredictivePresetId | 'custom-lock';
  title: string;
  desc: string;
  accent: string;
}

export function PredictiveLab({
  lab,
  lang,
  prior,
  onPriorChange,
}: PredictiveLabProps) {
  const defaultNoise =
    lab.presets.find((p) => p.id === 'balanced')?.noise ?? 28;
  const [noise, setNoise] = useState<number>(defaultNoise);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<SensoryParticle[]>(createInitialParticles(138));
  const reducedMotion = usePrefersReducedMotion();

  const clampedPrior = Math.max(0, Math.min(100, Math.round(prior)));
  const clampedNoise = Math.max(0, Math.min(100, Math.round(noise)));

  // Determine exact preset match (within 2 points)
  const matchedPreset: PredictivePreset | undefined = useMemo(
    () =>
      lab.presets.find(
        (p) =>
          Math.abs(p.prior - clampedPrior) <= 2 &&
          Math.abs(p.noise - clampedNoise) <= 2
      ),
    [lab.presets, clampedPrior, clampedNoise]
  );

  // Compute prediction error & perceptual coherence metrics
  const metrics = useMemo(() => {
    const p = clampedPrior / 100;
    const n = clampedNoise / 100;
    // Free-energy prediction error peaks when noise is high or prior strongly conflicts with input
    const mismatch = Math.abs(p - (1 - n));
    const errorPct = Math.round(
      Math.min(98, Math.max(4, (n * 0.58 + mismatch * 0.52) * 100))
    );
    const lockPct = Math.round(
      Math.min(
        98,
        Math.max(
          5,
          (1 - n * 0.65) * (0.45 + 0.55 * Math.sin(p * Math.PI * 0.85 + 0.2)) * 100
        )
      )
    );
    return { errorPct, lockPct };
  }, [clampedPrior, clampedNoise]);

  // Dynamic bilingual state interpretation
  const diagnosis: RegimeDiagnosis = useMemo(() => {
    if (matchedPreset) {
      const accentMap: Record<PredictivePresetId, string> = {
        chaos: '#E05A47',
        balanced: '#2AB3A6',
        illusion: '#D99B4E',
        rebus: '#5B8DEF',
      };
      return {
        id: matchedPreset.id,
        title: matchedPreset.stateTitle,
        desc: matchedPreset.stateDesc,
        accent: accentMap[matchedPreset.id],
      };
    }

    const byId = (id: PredictivePresetId) =>
      lab.presets.find((p) => p.id === id) ?? lab.presets[0];

    if (clampedPrior >= 72 && clampedNoise >= 52) {
      const p = byId('illusion');
      return { id: 'illusion', title: p.stateTitle, desc: p.stateDesc, accent: '#D99B4E' };
    }
    if (clampedPrior <= 34 && clampedNoise >= 60) {
      const p = byId('chaos');
      return { id: 'chaos', title: p.stateTitle, desc: p.stateDesc, accent: '#E05A47' };
    }
    if (clampedPrior <= 42 && clampedNoise < 60) {
      const p = byId('rebus');
      return { id: 'rebus', title: p.stateTitle, desc: p.stateDesc, accent: '#5B8DEF' };
    }
    if (clampedPrior >= 76 && clampedNoise < 52) {
      return {
        id: 'custom-lock',
        title:
          lang === 'ru'
            ? 'Гиперустойчивый приорный захват'
            : 'Hyper-Rigid Prior Lock',
        desc:
          lang === 'ru'
            ? 'Высокая точность ожиданий при чистом сенсорном потоке стабилизирует образ, но снижает гибкость к тонким аномалиям и неожиданным деталям.'
            : 'Very high top-down precision paired with clean input locks perception firmly in place, trading away rapid openness to subtle sensory anomalies.',
        accent: '#7E9C76',
      };
    }
    const balanced = byId('balanced');
    return {
      id: 'balanced',
      title: balanced.stateTitle,
      desc: balanced.stateDesc,
      accent: '#2AB3A6',
    };
  }, [matchedPreset, lab.presets, clampedPrior, clampedNoise, lang]);

  // Ref snapshot for RAF loop
  const liveRef = useRef({
    prior: clampedPrior,
    noise: clampedNoise,
    errorPct: metrics.errorPct,
    lockPct: metrics.lockPct,
    lang,
    reducedMotion,
  });
  liveRef.current = {
    prior: clampedPrior,
    noise: clampedNoise,
    errorPct: metrics.errorPct,
    lockPct: metrics.lockPct,
    lang,
    reducedMotion,
  };

  const drawNowRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = container.clientWidth || 520;
    let height = container.clientHeight || 245;

    const drawFrame = (timeMs: number) => {
      const {
        prior: curPrior,
        noise: curNoise,
        errorPct,
        lockPct,
        lang: curLang,
        reducedMotion: isReduced,
      } = liveRef.current;

      const { w, h, dpr } = syncCanvasHiDpi(canvas, width, height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#10100F';
      ctx.fillRect(0, 0, w, h);

      const t = isReduced ? 2.4 : timeMs * 0.001;
      const pNorm = curPrior / 100;
      const nNorm = curNoise / 100;
      const pareidolia = Math.max(0, (pNorm - 0.55) * 2.2) * (0.4 + 0.6 * nNorm);
      const cx = w * 0.5;
      const cy = h * 0.51;
      const baseR = Math.min(w * 0.31, h * 0.36);
      const isCompact = w < 400;

      // 1. Subtle deep spatial field aura
      const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, baseR * 1.85);
      aura.addColorStop(
        0,
        pareidolia > 0.35
          ? 'rgba(217, 155, 78, 0.16)'
          : pNorm < 0.38
            ? 'rgba(91, 141, 239, 0.14)'
            : 'rgba(42, 179, 166, 0.14)'
      );
      aura.addColorStop(0.6, 'rgba(42, 179, 166, 0.05)');
      aura.addColorStop(1, 'rgba(16, 16, 15, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, w, h);

      // 2. Subtle polar inference reticle
      ctx.save();
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.045)';
      ctx.lineWidth = 0.8;
      for (const mult of [0.45, 0.85, 1.2]) {
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * mult, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Bottom-up Sensory Particles & Static Noise Stream (Bio-Teal / Warm Amber)
      const particles = particlesRef.current;
      const attraction = (1 - nNorm * 0.72) * (0.25 + 0.75 * pNorm);
      const jitterAmp = nNorm * 0.62 + (1 - pNorm) * 0.18;

      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        const rot = t * (0.14 + (1 - pNorm) * 0.24) * (pt.ring === 1 ? -1 : 1);
        const a = pt.angle + rot;

        const polyMod = 1 + 0.08 * Math.cos(a * 6);
        const rTarget =
          (pt.ring === 0 ? 0.42 : pt.ring === 1 ? 0.76 : 1.04) * polyMod;

        const nAngle = pt.seed * Math.PI * 12 + t * (1.4 + nNorm * 2.8);
        const nRad =
          (0.18 + pt.seed * 1.15) * jitterAmp * (0.7 + 0.3 * Math.sin(t * 2.3 + i));

        const targetX =
          Math.cos(a) * rTarget * attraction +
          Math.cos(nAngle) * nRad * (1 - attraction * 0.55);
        const targetY =
          Math.sin(a) * rTarget * attraction +
          Math.sin(nAngle * 1.17) * nRad * (1 - attraction * 0.55);

        if (isReduced) {
          pt.x = targetX;
          pt.y = targetY;
        } else {
          pt.x += (targetX - pt.x) * 0.12;
          pt.y += (targetY - pt.y) * 0.12;
        }

        const sx = cx + pt.x * baseR;
        const sy = cy + pt.y * baseR;

        const idealX = cx + Math.cos(a) * rTarget * baseR;
        const idealY = cy + Math.sin(a) * rTarget * baseR;
        const errDist = Math.hypot(sx - idealX, sy - idealY);

        if (i % 7 === 0 && errDist > baseR * 0.26 && errorPct > 28) {
          const errAlpha = Math.min(0.45, ((errDist / baseR) - 0.2) * 0.55);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(idealX, idealY);
          ctx.strokeStyle = `rgba(224, 90, 71, ${errAlpha.toFixed(3)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }

        const alpha = 0.35 + (1 - nNorm * 0.35) * 0.52;
        const radius = pt.ring === 0 ? 1.85 : 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle =
          pt.tint === 0
            ? `rgba(42, 179, 166, ${alpha.toFixed(3)})`
            : `rgba(217, 155, 78, ${(alpha * 0.9).toFixed(3)})`;
        ctx.fill();
      }
      ctx.restore();

      // 4. Top-Down Generative Prior Contour (Bio-Teal -> Warm Amber as prior precision rises!)
      const priorAlpha = 0.14 + pNorm * 0.78;
      const priorColor =
        pNorm > 0.72
          ? `rgba(217, 155, 78, ${priorAlpha.toFixed(3)})`
          : `rgba(42, 179, 166, ${priorAlpha.toFixed(3)})`;

      const priorStrokeThin =
        pNorm > 0.72
          ? `rgba(217, 155, 78, ${(priorAlpha * 0.45).toFixed(3)})`
          : `rgba(42, 179, 166, ${(priorAlpha * 0.45).toFixed(3)})`;

      ctx.save();
      const wobble = (1 - pNorm) * 0.14 + nNorm * (1 - pNorm) * 0.18;
      const sides = 6;
      const rotBase = t * (0.12 - pNorm * 0.06);

      for (const layer of [
        { scale: 1.0, phase: 0, lw: 1.45, stroke: priorColor },
        { scale: 0.68, phase: Math.PI / 6, lw: 1.0, stroke: priorStrokeThin },
      ]) {
        ctx.beginPath();
        for (let k = 0; k <= sides; k++) {
          const ang = (k / sides) * Math.PI * 2 + rotBase + layer.phase;
          const rWobble =
            1 +
            wobble * Math.sin(t * 2.1 + k * 1.9) +
            0.03 * Math.cos(t * 1.4 + k);
          const vx = cx + Math.cos(ang) * baseR * layer.scale * rWobble;
          const vy = cy + Math.sin(ang) * baseR * layer.scale * rWobble;
          if (k === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = layer.lw;
        ctx.stroke();
      }

      if (pNorm > 0.35) {
        const motifAlpha = Math.min(0.85, (pNorm - 0.32) * 1.15);
        const rInner = baseR * 0.42;

        ctx.strokeStyle =
          pNorm > 0.72
            ? `rgba(217, 155, 78, ${motifAlpha.toFixed(3)})`
            : `rgba(42, 179, 166, ${motifAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.25;

        ctx.beginPath();
        ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
        ctx.stroke();

        if (pareidolia > 0.25) {
          const pAlpha = Math.min(0.9, pareidolia * 0.95);
          ctx.fillStyle = `rgba(217, 155, 78, ${pAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(cx - rInner * 0.38, cy - rInner * 0.14, 2.8, 0, Math.PI * 2);
          ctx.arc(cx + rInner * 0.38, cy - rInner * 0.14, 2.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx, cy + rInner * 0.12, rInner * 0.42, 0.22 * Math.PI, 0.78 * Math.PI);
          ctx.strokeStyle = `rgba(217, 155, 78, ${(pAlpha * 0.85).toFixed(3)})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(42, 179, 166, ${motifAlpha.toFixed(3)})`;
          ctx.fill();
        }
      }
      ctx.restore();

      // 5. Compact Mobile-Safe HUD Overlay (< 400px uses strictly 8.5px + ultra-concise labels!)
      const hudSize = isCompact ? 8.5 : 10;
      ctx.font = `500 ${hudSize}px "JetBrains Mono", monospace`;
      const padX = isCompact ? 10 : 14;
      const padTop = isCompact ? 9 : 11;
      const padBot = h - (isCompact ? 9 : 11);

      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = curPrior > 72 ? '#D99B4E' : '#2AB3A6';
      const priorHud = isCompact
        ? curLang === 'ru'
          ? `ПРИОР ${curPrior}%`
          : `PRIOR ${curPrior}%`
        : curLang === 'ru'
          ? `НИСХОД. ПРИОР · ${curPrior}%`
          : `TOP-DOWN PRIOR · ${curPrior}%`;
      ctx.fillText(priorHud, padX, padTop);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#A39E93';
      const noiseHud = isCompact
        ? curLang === 'ru'
          ? `ШУМ ${curNoise}%`
          : `NOISE ${curNoise}%`
        : curLang === 'ru'
          ? `СЕНСОРНЫЙ ШУМ · ${curNoise}%`
          : `SENSORY NOISE · ${curNoise}%`;
      ctx.fillText(noiseHud, w - padX, padTop);

      ctx.textBaseline = 'bottom';
      ctx.textAlign = 'left';
      ctx.fillStyle = errorPct > 55 ? '#E05A47' : 'rgba(184, 181, 173, 0.85)';
      const errHud = isCompact
        ? curLang === 'ru'
          ? `ОШИБКА ${errorPct}%`
          : `ERR ${errorPct}%`
        : curLang === 'ru'
          ? `ОШИБКА ПРОГНОЗА · ${errorPct}%`
          : `PREDICTION ERROR · ${errorPct}%`;
      ctx.fillText(errHud, padX, padBot);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(214, 211, 203, 0.85)';
      const lockHud = isCompact
        ? curLang === 'ru'
          ? `ЗАХВАТ ${lockPct}%`
          : `LOCK ${lockPct}%`
        : curLang === 'ru'
          ? `УСТОЙЧИВОСТЬ · ${lockPct}%`
          : `PERCEPTUAL LOCK · ${lockPct}%`;
      ctx.fillText(lockHud, w - padX, padBot);
    };

    drawNowRef.current = () => drawFrame(2400);

    const tick = (now: number) => {
      drawFrame(now);
      if (!liveRef.current.reducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      drawFrame(performance.now());
    });
    resizeObserver.observe(container);

    if (reducedMotion) {
      drawFrame(2400);
    } else {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      drawNowRef.current = null;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [reducedMotion]);

  // Repaint immediately when sliders or language change under reduced motion
  useEffect(() => {
    if (reducedMotion) {
      drawNowRef.current?.();
    }
  }, [clampedPrior, clampedNoise, lang, reducedMotion]);

  const applyPreset = (preset: PredictivePreset) => {
    onPriorChange(preset.prior);
    setNoise(preset.noise);
  };

  const sync3dBadge =
    lang === 'ru' ? '3D-сфера синхронизирована' : '3D Geodesic Synced';

  return (
    <section
      className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-7"
      aria-label={lab.title}
    >
      {/* Subtle biotech ambient halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 h-60 w-60 rounded-full blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${diagnosis.accent}2D 0%, transparent 70%)`,
        }}
      />

      {/* Lab Header */}
      <div className="relative flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[var(--accent-a)] uppercase">
            <span
              className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
              style={{
                backgroundColor: diagnosis.accent,
                boxShadow: `0 0 10px ${diagnosis.accent}`,
              }}
            />
            {lab.badge}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-[#D6D3CB]">
            <Layers className="h-3 w-3 text-[var(--accent-a)]" strokeWidth={1.65} />
            {sync3dBadge}
          </span>
        </div>

        <h3 className="font-[var(--font-display)] text-lg font-medium tracking-[-0.025em] text-[#F3F2EE] sm:text-2xl">
          {lab.title}
        </h3>
        <p className="max-w-3xl text-sm leading-relaxed text-[#B8B5AD]">
          {lab.instruction}
        </p>
      </div>

      {/* HiDPI Generative Bayesian Perceptual Synthesizer Canvas */}
      <div
        ref={containerRef}
        className="relative mt-5 h-[225px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#10100F]/90 sm:h-[255px]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          role="img"
          aria-label={`${diagnosis.title} (${clampedPrior}% / ${clampedNoise}%)`}
        />
      </div>

      {/* Two Sleek Optical Sliders */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Top-Down Prior Precision -> Syncs to 3D Geodesic Shell */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor="predictive-prior-slider"
              className="text-xs font-medium text-[#D6D3CB]"
            >
              {lab.priorLabel}
            </label>
            <span className="font-mono text-xs font-medium text-[#F3F2EE]">
              {clampedPrior}%
            </span>
          </div>
          <input
            id="predictive-prior-slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={clampedPrior}
            onChange={(e) => onPriorChange(Number(e.target.value))}
            className="optical-slider"
            style={getSliderFillStyle(clampedPrior, 0, 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedPrior}
            aria-valuetext={`${clampedPrior}%`}
          />
          <div className="mt-0.5 flex justify-between font-mono text-[10px] text-[#8E8B82]">
            <span>{lang === 'ru' ? 'Слабые приоры' : 'Relaxed'}</span>
            <span>{lang === 'ru' ? 'Жёсткие приоры' : 'Hyper-Precise'}</span>
          </div>
        </div>

        {/* Bottom-Up Sensory Noise */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor="predictive-noise-slider"
              className="text-xs font-medium text-[#D6D3CB]"
            >
              {lab.noiseLabel}
            </label>
            <span className="font-mono text-xs font-medium text-[#F3F2EE]">
              {clampedNoise}%
            </span>
          </div>
          <input
            id="predictive-noise-slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={clampedNoise}
            onChange={(e) => setNoise(Number(e.target.value))}
            className="optical-slider"
            style={getSliderFillStyle(clampedNoise, 0, 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedNoise}
            aria-valuetext={`${clampedNoise}%`}
          />
          <div className="mt-0.5 flex justify-between font-mono text-[10px] text-[#8E8B82]">
            <span>{lang === 'ru' ? 'Чистый сигнал' : 'Clear Input'}</span>
            <span>{lang === 'ru' ? 'Высокий шум' : 'High Ambiguity'}</span>
          </div>
        </div>
      </div>

      {/* 4 Motion Preset Pills */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {lab.presets.map((preset) => {
          const isSelected = matchedPreset?.id === preset.id;
          return (
            <motion.button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              whileTap={reducedMotion ? undefined : { scale: 0.97 }}
              aria-pressed={isSelected}
              className={`relative cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? 'text-[#F3F2EE]'
                  : 'border border-white/[0.08] bg-white/[0.025] text-[#B8B5AD] hover:border-white/20 hover:text-[#F3F2EE]'
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="predictive-preset-active-pill"
                  transition={reducedMotion ? { duration: 0 } : SPATIAL_SPRING}
                  className="pointer-events-none absolute inset-0 rounded-full border border-[var(--accent-a)]/55 bg-white/[0.09] shadow-[0_0_22px_-6px_var(--accent-glow)]"
                />
              )}
              <span className="relative z-10">{preset.name}</span>
            </motion.button>
          );
        })}
      </div>

      <hr className="hairline my-5" />

      {/* Dynamic Bilingual State Interpretation Readout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={diagnosis.id}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-2 border-l-2 pl-4"
          style={{ borderColor: `${diagnosis.accent}99` }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2">
              <Compass
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: diagnosis.accent }}
                strokeWidth={1.75}
              />
              <span className="font-[var(--font-display)] text-sm font-medium text-[#F3F2EE]">
                {diagnosis.title}
              </span>
            </div>

            <span className="font-mono text-[10px] tracking-[0.08em] text-[#B8B5AD]">
              {lang === 'ru'
                ? `Ошибка прогноза ${metrics.errorPct}%`
                : `Prediction Error ${metrics.errorPct}%`}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-[#D6D3CB] sm:text-[13px]">
            {diagnosis.desc}
          </p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
