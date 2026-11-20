import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, ShieldAlert, Zap } from 'lucide-react';
import type {
  ChapterCh5,
  Lang,
  LocalizedContent,
  PciState,
  PciStateId,
  PciWavePattern,
} from '../../data/content';
import {
  SPATIAL_SPRING,
  handleRovingTabKeyDown,
  syncCanvasHiDpi,
  usePrefersReducedMotion,
} from './labUtils';

export interface PciZapLabProps {
  lab: ChapterCh5['lab'];
  ui: LocalizedContent['ui'];
  lang: Lang;
  onFirePulse: (pci: number) => void;
}

const MAX_PCI = 0.7;
const THRESHOLD_PCI = 0.31;
const THRESHOLD_PCT = (THRESHOLD_PCI / MAX_PCI) * 100; // 44.2857% (~44.3%)

interface CorticalNode {
  /** Normalized position in overhead view [-1..1] */
  x: number;
  y: number;
  hemi: 'L' | 'R';
  /** Distance from right-parietal/premotor TMS coil */
  distFromTms: number;
  phaseOffset: number;
}

const TMS_POS = { x: 0.36, y: -0.22 };

const OVERHEAD_NODES: readonly CorticalNode[] = (() => {
  const raw: ReadonlyArray<[number, number, 'L' | 'R']> = [
    // Right hemisphere (stimulated side)
    [0.24, -0.64, 'R'],
    [0.52, -0.44, 'R'],
    [0.36, -0.22, 'R'], // TMS site
    [0.64, -0.06, 'R'],
    [0.34, 0.14, 'R'],
    [0.58, 0.34, 'R'],
    [0.26, 0.56, 'R'],
    [0.44, 0.68, 'R'],
    // Left hemisphere (contralateral)
    [-0.24, -0.64, 'L'],
    [-0.52, -0.44, 'L'],
    [-0.36, -0.22, 'L'],
    [-0.64, -0.06, 'L'],
    [-0.34, 0.14, 'L'],
    [-0.58, 0.34, 'L'],
    [-0.26, 0.56, 'L'],
    [-0.44, 0.68, 'L'],
  ];

  return raw.map(([x, y, hemi], idx) => ({
    x,
    y,
    hemi,
    distFromTms: Math.hypot(x - TMS_POS.x, y - TMS_POS.y),
    phaseOffset: idx * 0.67,
  }));
})();

const EEG_CHANNEL_COLORS = [
  '#2AB3A6', // Ch 1 Clinical Bio-Teal
  '#D99B4E', // Ch 2 Warm Amber
  '#7E9C76', // Ch 3 Clinical Sage
  '#5B8DEF', // Ch 4 Clinical Cobalt
  '#E05A47', // Ch 5 Surgical Terracotta
] as const;

/**
 * Evaluates a realistic single-channel TMS-EEG voltage curve for normalized time `u` in [0..1]
 * where `tZero = 0.18` represents `0 ms` (TMS pulse onset).
 */
function evalEegChannel(
  pattern: PciWavePattern,
  u: number,
  chIdx: number,
  tZero: number
): number {
  const phase = chIdx * 1.18;
  // Pre-stimulus baseline micro-oscillations
  if (u < tZero) {
    return Math.sin(u * 46 + phase) * 0.045 + Math.cos(u * 19 + phase * 1.3) * 0.025;
  }

  const dt = (u - tZero) / (1 - tZero); // 0..1 post-TMS (~0..300 ms)
  // Crisp TMS stimulation impulse artifact right at 0 ms
  const artifact = Math.exp(-Math.pow(dt * 34, 2)) * (chIdx % 2 === 0 ? 0.92 : -0.78);

  if (pattern === 'complex-distributed') {
    const env = Math.exp(-dt * 1.65) * (0.55 + 0.45 * Math.sin(dt * 8.5 + phase * 0.4));
    const wave =
      0.52 * Math.sin(dt * 24 + phase) +
      0.34 * Math.sin(dt * 43 - phase * 1.4) +
      0.22 * Math.cos(dt * 67 + chIdx * 2.1);
    return artifact * 0.65 + wave * env * 0.85;
  }

  if (pattern === 'vivid-internal') {
    const env = Math.exp(-dt * 1.9);
    const wave =
      0.56 * Math.sin(dt * 21 + phase * 0.9) +
      0.32 * Math.cos(dt * 37 + phase * 1.5) +
      0.16 * Math.sin(dt * 54 - chIdx);
    return artifact * 0.65 + wave * env * 0.78;
  }

  if (pattern === 'dissociated-rich') {
    const env = Math.exp(-dt * 1.8) * (0.65 + 0.35 * Math.cos(dt * 11 + chIdx));
    const wave =
      0.48 * Math.sin(dt * 28 + phase * 1.25) +
      0.36 * Math.cos(dt * 49 - phase) +
      0.18 * Math.sin(dt * 72 + chIdx * 1.7);
    return artifact * 0.68 + wave * env * 0.82;
  }

  if (pattern === 'entropic-cascade') {
    const env = Math.exp(-dt * 1.45);
    const wave =
      0.44 * Math.sin(dt * 31 + phase * 1.4) +
      0.34 * Math.sin(dt * 56 - phase * 1.8) +
      0.28 * Math.cos(dt * 83 + chIdx * 2.5);
    return artifact * 0.65 + wave * env * 0.88;
  }

  if (pattern === 'slow-stereotyped') {
    // Classic NREM N3 bistable large stereotyped slow wave followed by flat "off-period" silence!
    const slowWave =
      Math.sin(dt * Math.PI * 2.4) * Math.exp(-dt * 4.4) * (0.85 + chIdx * 0.04);
    const silence = dt > 0.38 ? 0.14 : 1.0;
    return artifact * 0.7 + slowWave * 0.88 * silence;
  }

  // 'local-damped' (Propofol): strongly localized, rapidly extinguished echo
  const localWeight = chIdx === 0 ? 0.85 : chIdx === 1 ? 0.48 : 0.14;
  const damped = Math.sin(dt * 14 + chIdx * 0.25) * Math.exp(-dt * 8.5) * localWeight;
  return artifact * (0.35 + localWeight * 0.5) + damped * 0.85;
}

export function PciZapLab({ lab, ui, lang, onFirePulse }: PciZapLabProps) {
  const [activeStateId, setActiveStateId] = useState<PciStateId>(
    lab.states[0]?.id ?? 'awake'
  );
  const [zapBurstKey, setZapBurstKey] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pulseStartRef = useRef<number>(performance.now() - 350);
  const drawNowRef = useRef<(() => void) | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const activeIndex = Math.max(
    0,
    lab.states.findIndex((s) => s.id === activeStateId)
  );
  const activeState: PciState = lab.states[activeIndex] ?? lab.states[0];

  // Trigger BOTH 2D cortical/EEG cascade AND 3D WebGL shockwave via onFirePulse(pci)
  const triggerZap = useCallback(
    (targetState: PciState) => {
      pulseStartRef.current = performance.now();
      setZapBurstKey((k) => k + 1);
      onFirePulse(targetState.pci);
    },
    [onFirePulse]
  );

  const handleSelectState = useCallback(
    (state: PciState) => {
      setActiveStateId(state.id);
      triggerZap(state);
    },
    [triggerZap]
  );

  const liveRef = useRef({
    state: activeState,
    lang,
    reducedMotion,
  });
  liveRef.current = {
    state: activeState,
    lang,
    reducedMotion,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = container.clientWidth || 540;
    let height = container.clientHeight || 270;

    const drawFrame = (now: number) => {
      const { state, lang: curLang, reducedMotion: isReduced } = liveRef.current;
      const { w, h, dpr } = syncCanvasHiDpi(canvas, width, height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#10100F';
      ctx.fillRect(0, 0, w, h);

      const isCompact = w < 400;
      const isStacked = w < 500;
      // Elapsed time since last TMS pulse in seconds (loop subtle idle echo gently if reduced motion off)
      const rawElapsed = (now - pulseStartRef.current) * 0.001;
      const pulseAge = isReduced ? 0.72 : Math.max(0, rawElapsed);
      // Sweep progress [0..1] over 1.35 s, then stay revealed with gentle living micro-drift
      const sweep = isReduced ? 1 : Math.min(1, pulseAge / 1.15);
      const waveDecay = isReduced ? 0.78 : Math.exp(-Math.max(0, pulseAge - 0.15) * 0.55);
      const tIdle = isReduced ? 1.2 : now * 0.001;

      const isConscious = state.conscious;
      const primaryColor = isConscious
        ? state.id === 'psilocybin'
          ? '#D99B4E'
          : state.id === 'ketamine'
            ? '#5B8DEF'
            : '#2AB3A6'
        : state.id === 'nrem'
          ? '#D99B4E'
          : '#E05A47';

      // Layout boxes: side-by-side on tablet/desktop, crisp top/bottom stack on narrow phones
      const netRect = isStacked
        ? { x: 0, y: 0, w, h: Math.round(h * 0.52) }
        : { x: 0, y: 0, w: Math.round(w * 0.43), h };

      const eegRect = isStacked
        ? { x: 0, y: netRect.h, w, h: h - netRect.h }
        : { x: netRect.w, y: 0, w: w - netRect.w, h };

      // Hairline divider between Overhead Network & Butterfly EEG
      ctx.save();
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (isStacked) {
        ctx.moveTo(12, netRect.h);
        ctx.lineTo(w - 12, netRect.h);
      } else {
        ctx.moveTo(netRect.w, 14);
        ctx.lineTo(netRect.w, h - 14);
      }
      ctx.stroke();
      ctx.restore();

      // ================================================================
      // PANEL A: Overhead Bilateral Cortical Network + TMS Magnetic Halo
      // ================================================================
      const ncx = netRect.x + netRect.w * 0.5;
      const ncy = netRect.y + netRect.h * 0.54;
      const rx = Math.min(netRect.w * 0.34, netRect.h * 0.38);
      const ry = Math.min(netRect.h * 0.41, rx * 1.18);

      // Subtle cortical dorsal aura
      const aura = ctx.createRadialGradient(ncx, ncy, 4, ncx, ncy, Math.max(rx, ry) * 1.55);
      aura.addColorStop(0, `${primaryColor}22`);
      aura.addColorStop(1, 'rgba(16, 16, 15, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(netRect.x, netRect.y, netRect.w, netRect.h);

      // Overhead bilateral hemisphere silhouettes (Left & Right)
      ctx.save();
      for (const side of [-1, 1] as const) {
        ctx.beginPath();
        ctx.ellipse(
          ncx + side * rx * 0.44,
          ncy,
          rx * 0.46,
          ry * 0.86,
          side * -0.05,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(243, 242, 238, 0.032)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(243, 242, 238, 0.16)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Longitudinal fissure hairline
      ctx.beginPath();
      ctx.moveTo(ncx, ncy - ry * 0.82);
      ctx.lineTo(ncx, ncy + ry * 0.82);
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.08)';
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Map normalized node coordinates to pixels
      const toPx = (nx: number, ny: number): [number, number] => [
        ncx + nx * rx,
        ncy + ny * ry,
      ];
      const [tmsX, tmsY] = toPx(TMS_POS.x, TMS_POS.y);

      // Determine propagation reach based on state complexity
      const maxReach =
        state.wavePattern === 'local-damped'
          ? 0.48
          : state.wavePattern === 'slow-stereotyped'
            ? 1.18
            : 1.85;
      const frontDist = Math.min(maxReach, pulseAge * (isConscious ? 1.55 : 0.95));

      // Draw cortical connections (intra + trans-callosal)
      ctx.save();
      for (let i = 0; i < OVERHEAD_NODES.length; i++) {
        const a = OVERHEAD_NODES[i];
        const [ax, ay] = toPx(a.x, a.y);
        for (let j = i + 1; j < OVERHEAD_NODES.length; j++) {
          const b = OVERHEAD_NODES[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const isHomotopicCallosal =
            a.hemi !== b.hemi && Math.abs(a.y - b.y) < 0.05 && Math.abs(a.x + b.x) < 0.05;
          if (d > 0.56 && !isHomotopicCallosal) continue;

          const [bx, by] = toPx(b.x, b.y);
          const avgDist = (a.distFromTms + b.distFromTms) * 0.5;
          const reached = avgDist <= frontDist;

          let edgeAlpha = 0.07;
          if (reached) {
            if (state.wavePattern === 'local-damped') {
              edgeAlpha = Math.max(0.06, (1 - avgDist / 0.55) * 0.65 * waveDecay);
            } else if (state.wavePattern === 'slow-stereotyped') {
              const offPeriod = pulseAge > 0.85 ? 0.14 : 1;
              edgeAlpha = 0.34 * waveDecay * offPeriod;
            } else {
              const ripple = 0.55 + 0.45 * Math.sin(tIdle * 5.2 - avgDist * 4.5 + i);
              edgeAlpha = (0.24 + 0.46 * ripple) * (0.4 + 0.6 * waveDecay);
            }
          }

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = reached
            ? `${primaryColor}${Math.round(Math.min(0.85, edgeAlpha) * 255)
                .toString(16)
                .padStart(2, '0')}`
            : 'rgba(243, 242, 238, 0.065)';
          ctx.lineWidth = reached && isConscious ? 1.2 : 0.8;
          ctx.stroke();
        }
      }
      ctx.restore();

      // Expanding TMS Magnetic Shockwave Halos
      const ringCount = isConscious ? 3 : 1;
      for (let rIdx = 0; rIdx < ringCount; rIdx++) {
        const ringAge = pulseAge - rIdx * 0.22;
        if (ringAge < 0 || ringAge > 1.75) continue;
        const prog = ringAge / 1.75;
        const maxRingR =
          state.wavePattern === 'local-damped'
            ? rx * 0.48
            : state.wavePattern === 'slow-stereotyped'
              ? rx * 1.15
              : rx * 1.68;
        const rad = 6 + prog * maxRingR;
        const alpha = (1 - prog) * (isConscious ? 0.55 : 0.42);
        ctx.beginPath();
        ctx.arc(tmsX, tmsY, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `${primaryColor}${Math.round(alpha * 255)
          .toString(16)
          .padStart(2, '0')}`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // Draw Bilateral Cortical Nodes
      for (let i = 0; i < OVERHEAD_NODES.length; i++) {
        const node = OVERHEAD_NODES[i];
        const [nx, ny] = toPx(node.x, node.y);
        const reached = node.distFromTms <= frontDist;

        let energy = 0.16;
        if (reached) {
          if (state.wavePattern === 'local-damped') {
            energy = Math.max(0.15, (1 - node.distFromTms / 0.52) * waveDecay);
          } else if (state.wavePattern === 'slow-stereotyped') {
            energy = pulseAge > 0.85 ? 0.14 : 0.72 * waveDecay;
          } else {
            const osc = 0.5 + 0.5 * Math.sin(tIdle * 5.8 + node.phaseOffset - node.distFromTms * 4);
            energy = (0.35 + 0.65 * osc) * (0.45 + 0.55 * waveDecay);
          }
        }

        const nodeCol =
          state.wavePattern === 'entropic-cascade' && reached
            ? EEG_CHANNEL_COLORS[i % EEG_CHANNEL_COLORS.length]
            : primaryColor;

        if (energy > 0.35) {
          const halo = ctx.createRadialGradient(nx, ny, 1, nx, ny, 11);
          halo.addColorStop(0, `${nodeCol}99`);
          halo.addColorStop(1, `${nodeCol}00`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(nx, ny, 11, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(nx, ny, energy > 0.38 ? 3.2 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = energy > 0.38 ? '#F3F2EE' : 'rgba(184, 181, 173, 0.38)';
        ctx.fill();
      }

      // Glowing TMS Stimulation Coil Marker (Figure-8 Halo)
      ctx.save();
      const coilPulse = 1 + 0.18 * Math.sin(tIdle * 6) * Math.max(0.2, waveDecay);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tmsX, tmsY, 9.5 * coilPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tmsX, tmsY, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = '#F3F2EE';
      ctx.fill();
      ctx.restore();

      // Overhead Panel Top-Left Label
      ctx.font = `500 ${isCompact ? 8.5 : 9.5}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(184, 181, 173, 0.78)';
      ctx.fillText(
        curLang === 'ru'
          ? isCompact
            ? 'КОРА · ТМС'
            : 'КОРА · СЕТЬ ТМС'
          : isCompact
            ? 'CORTEX · TMS'
            : 'BILATERAL CORTEX',
        netRect.x + 12,
        netRect.y + 9
      );

      // ================================================================
      // PANEL B: Live 5-Channel TMS-EEG Butterfly Trace
      // ================================================================
      const padL = 14;
      const padR = 14;
      const padT = isStacked ? 26 : 30;
      const padB = 22;
      const plotX = eegRect.x + padL;
      const plotY = eegRect.y + padT;
      const plotW = Math.max(40, eegRect.w - padL - padR);
      const plotH = Math.max(40, eegRect.h - padT - padB);
      const midY = plotY + plotH * 0.52;
      const ampScale = plotH * 0.42;
      const tZero = 0.18;
      const zeroX = plotX + plotW * tZero;

      // Subtle baseline & horizontal reference guides
      ctx.save();
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.06)';
      ctx.lineWidth = 0.8;
      for (const yRatio of [0.2, 0.52, 0.84]) {
        const gy = plotY + plotH * yRatio;
        ctx.beginPath();
        ctx.moveTo(plotX, gy);
        ctx.lineTo(plotX + plotW, gy);
        ctx.stroke();
      }

      // Glowing Vertical TMS 0 ms Stimulus Line
      ctx.beginPath();
      ctx.moveTo(zeroX, plotY - 2);
      ctx.lineTo(zeroX, plotY + plotH + 2);
      ctx.strokeStyle = `${primaryColor}AA`;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Draw 5 Superposed Translucent Butterfly EEG Channels
      const samples = Math.min(180, Math.max(80, Math.round(plotW * 0.65)));
      const maxVisibleU = tZero + (1 - tZero) * sweep;

      for (let ch = 0; ch < 5; ch++) {
        ctx.beginPath();
        let started = false;
        for (let s = 0; s <= samples; s++) {
          const u = s / samples;
          if (u > maxVisibleU) break;
          const vx = plotX + u * plotW;
          // Subtle living micro-shimmer post-sweep so live EEG feels organic
          const shimmer =
            !isReduced && u > tZero
              ? Math.sin(tIdle * 4.2 + u * 22 + ch * 1.4) * 0.035 * Math.exp(-(u - tZero) * 1.4)
              : 0;
          const val = evalEegChannel(state.wavePattern, u, ch, tZero) + shimmer;
          const vy = midY - val * ampScale;
          if (!started) {
            ctx.moveTo(vx, vy);
            started = true;
          } else {
            ctx.lineTo(vx, vy);
          }
        }
        ctx.strokeStyle = isConscious
          ? `${EEG_CHANNEL_COLORS[ch]}B8`
          : ch < 2
            ? `${primaryColor}BA`
            : 'rgba(184, 181, 173, 0.34)';
        ctx.lineWidth = ch === 0 ? 1.55 : 1.1;
        ctx.stroke();
      }

      // Glowing live sweep cursor dot during pulse propagation
      if (!isReduced && sweep < 0.995) {
        const curX = plotX + maxVisibleU * plotW;
        ctx.beginPath();
        ctx.moveTo(curX, plotY);
        ctx.lineTo(curX, plotY + plotH);
        ctx.strokeStyle = `${primaryColor}55`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Trace Top-Left TMS 0 ms Label (strictly `ТМС 0 мс` in RU / `TMS 0 ms` in EN!)
      const traceFontSize = isCompact ? 8.5 : 9.5;
      ctx.font = `500 ${traceFontSize}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = primaryColor;
      const tmsZeroLabel = curLang === 'ru' ? 'ТМС 0 мс' : 'TMS 0 ms';
      ctx.fillText(tmsZeroLabel, plotX, eegRect.y + 9);

      // Trace Top-Right Compact Telemetry Label (`ЭЭГ · PCI = ...` below 400px!)
      ctx.textAlign = 'right';
      ctx.fillStyle = '#F3F2EE';
      const pciStr = state.pci.toFixed(2);
      const traceRightLabel = isCompact
        ? curLang === 'ru'
          ? `ЭЭГ · PCI = ${pciStr}`
          : `EEG · PCI = ${pciStr}`
        : curLang === 'ru'
          ? `ТМС-ЭЭГ · PCI = ${pciStr}`
          : `TMS-EEG · PCI = ${pciStr}`;
      ctx.fillText(traceRightLabel, eegRect.x + eegRect.w - padR, eegRect.y + 9);

      // Bottom time axis ticks (0 ms / +150 ms / +300 ms)
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'rgba(142, 139, 130, 0.85)';
      ctx.font = `500 8.5px "JetBrains Mono", monospace`;
      const msUnit = curLang === 'ru' ? 'мс' : 'ms';
      ctx.textAlign = 'center';
      ctx.fillText(`0 ${msUnit}`, zeroX, eegRect.y + eegRect.h - 6);
      ctx.fillText(
        `+150 ${msUnit}`,
        zeroX + (plotX + plotW - zeroX) * 0.5,
        eegRect.y + eegRect.h - 6
      );
      ctx.textAlign = 'right';
      ctx.fillText(`+300 ${msUnit}`, plotX + plotW, eegRect.y + eegRect.h - 6);
    };

    drawNowRef.current = () => drawFrame(performance.now());

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
      drawFrame(performance.now());
    } else {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      drawNowRef.current = null;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [reducedMotion]);

  // Repaint immediately when state, language, or pulse changes under reduced motion
  useEffect(() => {
    if (reducedMotion) {
      drawNowRef.current?.();
    }
  }, [activeStateId, lang, zapBurstKey, reducedMotion]);

  const gaugeFillPct = Math.min(100, Math.max(0, (activeState.pci / MAX_PCI) * 100));
  const accentColor = activeState.conscious ? '#2AB3A6' : '#E05A47';
  const statesAriaLabel =
    lang === 'ru'
      ? 'Состояния мозга для теста ТМС-ЭЭГ PCI'
      : 'Brain states for TMS-EEG PCI test';

  return (
    <section
      className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-7"
      aria-label={lab.title}
    >
      {/* Subtle conscious-bio-teal / unconscious-terracotta ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-60 w-60 rounded-full blur-3xl transition-all duration-700"
        style={{
          background: activeState.conscious
            ? 'radial-gradient(circle, rgba(42, 179, 166, 0.22) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(224, 90, 71, 0.22) 0%, transparent 70%)',
        }}
      />

      {/* Lab Header */}
      <div className="relative flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[var(--accent-a)] uppercase">
            <span
              className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
            />
            {lab.badge}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-[#D6D3CB]">
            <Activity className="h-3 w-3 text-[var(--accent-a)]" strokeWidth={1.65} />
            {lang === 'ru' ? '3D-волна ТМС активна' : '3D Shockwave Live'}
          </span>
        </div>

        <h3 className="font-[var(--font-display)] text-lg font-medium tracking-[-0.025em] text-[#F3F2EE] sm:text-2xl">
          {lab.title}
        </h3>
        <p className="max-w-3xl text-sm leading-relaxed text-[#B8B5AD]">
          {lab.instruction}
        </p>
      </div>

      {/* HiDPI Overhead Bilateral Cortex + 5-Channel TMS-EEG Canvas */}
      <div
        ref={containerRef}
        className="relative mt-5 h-[310px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#10100F]/90 sm:h-[250px]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          role="img"
          aria-label={`${activeState.name} — PCI ${activeState.pci.toFixed(2)}`}
        />
      </div>

      {/* Tactile Glowing Deliver TMS Pulse CTA + Live Metric Readout */}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <motion.button
          type="button"
          onClick={() => triggerZap(activeState)}
          whileTap={reducedMotion ? undefined : { scale: 0.965 }}
          whileHover={reducedMotion ? undefined : { scale: 1.015 }}
          transition={SPATIAL_SPRING}
          className="group relative inline-flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full px-5 py-3 text-sm font-medium text-[#F3F2EE] sm:w-auto"
          style={{
            background: activeState.conscious
              ? 'linear-gradient(135deg, rgba(42, 179, 166, 0.28), rgba(217, 155, 78, 0.20))'
              : 'linear-gradient(135deg, rgba(224, 90, 71, 0.26), rgba(217, 155, 78, 0.18))',
            border: `1px solid ${accentColor}88`,
            boxShadow: `0 0 30px -8px ${accentColor}80, inset 0 1px 0 rgba(255,255,255,0.28)`,
          }}
        >
          {/* Pulse flash feedback ring */}
          {!reducedMotion && zapBurstKey > 0 && (
            <motion.span
              key={zapBurstKey}
              initial={{ opacity: 0.65, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.45 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 rounded-full border"
              style={{ borderColor: accentColor }}
            />
          )}
          <Zap
            className="h-4 w-4 shrink-0"
            style={{ color: accentColor }}
            strokeWidth={1.85}
          />
          <span>{lab.zapBtn}</span>
        </motion.button>

        {/* Conscious / Unconscious Classification Pill */}
        <div
          className="inline-flex items-center gap-2 self-start rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-medium sm:self-center"
          style={{
            backgroundColor: activeState.conscious
              ? 'rgba(42, 179, 166, 0.11)'
              : 'rgba(224, 90, 71, 0.11)',
            borderColor: activeState.conscious
              ? 'rgba(42, 179, 166, 0.36)'
              : 'rgba(224, 90, 71, 0.36)',
            color: activeState.conscious ? '#6AD5CB' : '#F29A8E',
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
          <span>
            {activeState.conscious ? ui.thresholdReached : ui.belowThreshold}
          </span>
        </div>
      </div>

      {/* 6 Brain States Grid (Clicking any state fires BOTH 2D cascade + 3D shockwave!) */}
      <div
        role="tablist"
        aria-label={statesAriaLabel}
        className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {lab.states.map((st, index) => {
          const isSelected = st.id === activeState.id;
          const dotColor = st.conscious ? '#2AB3A6' : '#E05A47';
          return (
            <button
              key={st.id}
              ref={(el) => {
                stateRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`pci-state-tab-${st.id}`}
              aria-selected={isSelected}
              aria-controls="pci-state-panel"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleSelectState(st)}
              onKeyDown={(e) =>
                handleRovingTabKeyDown(
                  e,
                  lab.states,
                  index,
                  (item) => handleSelectState(item),
                  (nextIdx) => stateRefs.current[nextIdx]?.focus()
                )
              }
              className={`relative flex cursor-pointer flex-col items-start gap-1 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                isSelected
                  ? 'border-transparent text-[#F3F2EE]'
                  : 'border-white/[0.07] bg-white/[0.02] text-[#B8B5AD] hover:border-white/[0.16] hover:text-[#F3F2EE]'
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="pci-state-active-card"
                  transition={reducedMotion ? { duration: 0 } : SPATIAL_SPRING}
                  className="pointer-events-none absolute inset-0 rounded-2xl border bg-white/[0.075]"
                  style={{
                    borderColor: `${dotColor}66`,
                    boxShadow: `0 0 26px -10px ${dotColor}75`,
                  }}
                />
              )}

              <div className="relative z-10 flex w-full items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-[#F3F2EE]">
                  {st.pci.toFixed(2)}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: dotColor,
                    boxShadow: isSelected ? `0 0 8px ${dotColor}` : 'none',
                  }}
                />
              </div>

              <span className="relative z-10 line-clamp-2 text-[11px] leading-snug font-medium sm:text-xs">
                {st.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Animated PCI Gauge Bar (0.00 -> 0.70 with glowing PCI* = 0.31 marker at 44.3%) */}
      <div
        id="pci-state-panel"
        role="tabpanel"
        aria-labelledby={`pci-state-tab-${activeState.id}`}
        className="mt-6"
      >
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] tracking-[0.12em] text-[#8E8B82] uppercase">
              {lab.metricComplexity}
            </span>
            <span className="font-mono text-xl font-semibold tracking-tight text-[#F3F2EE]">
              PCI = {activeState.pci.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="font-mono text-[10px] tracking-[0.12em] text-[#8E8B82] uppercase">
              {lab.metricState}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: accentColor }}
            >
              {activeState.statusLabel}
            </span>
          </div>
        </div>

        {/* Gauge Track */}
        <div className="relative h-3 w-full rounded-full bg-white/[0.06] ring-1 ring-white/[0.08]">
          <motion.div
            className="h-full rounded-full"
            initial={false}
            animate={{ width: `${gaugeFillPct}%` }}
            transition={reducedMotion ? { duration: 0 } : SPATIAL_SPRING}
            style={{
              background: activeState.conscious
                ? 'linear-gradient(90deg, #7E9C76 0%, #2AB3A6 100%)'
                : 'linear-gradient(90deg, #E05A47 0%, #D99B4E 100%)',
              boxShadow: `0 0 18px -2px ${accentColor}88`,
            }}
          />

          {/* Glowing vertical PCI* = 0.31 threshold marker at 44.3% */}
          <div
            className="pointer-events-none absolute -top-1.5 -bottom-1.5 w-[2px] -translate-x-1/2 rounded-full bg-[#F3F2EE] shadow-[0_0_12px_#F3F2EE]"
            style={{ left: `${THRESHOLD_PCT.toFixed(1)}%` }}
            aria-hidden="true"
          />
        </div>

        {/* Gauge Scale Axis */}
        <div className="relative mt-2 flex items-center justify-between font-mono text-[10px] text-[#8E8B82]">
          <span>0.00</span>
          <span
            className="absolute -translate-x-1/2 font-medium text-[#F3F2EE]"
            style={{ left: `${THRESHOLD_PCT.toFixed(1)}%` }}
          >
            PCI* = 0.31
          </span>
          <span>0.70</span>
        </div>

        {/* Active State Description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activeState.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            className="mt-4 text-xs leading-relaxed text-[#D6D3CB] sm:text-[13px]"
          >
            {activeState.desc}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Clinical NEJM Aug 2024 CMD 25% (60/241) Highlight Strip */}
      <hr className="hairline-accent my-5" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-start gap-2.5">
          <ShieldAlert
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-a)]"
            strokeWidth={1.7}
          />
          <div>
            <div className="font-mono text-[10px] tracking-[0.13em] text-[var(--accent-a)] uppercase">
              {ui.cmdHighlightTitle}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#B8B5AD]">
              {ui.cmdHighlightDesc}
            </p>
          </div>
        </div>

        <div className="shrink-0 font-mono text-lg font-semibold tracking-tight text-[#F3F2EE] sm:text-right sm:text-xl">
          {ui.cmdHighlightStat}
        </div>
      </div>
    </section>
  );
}
