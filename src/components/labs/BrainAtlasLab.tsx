import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Cpu } from 'lucide-react';
import type {
  BrainRegionId,
  ChapterCh2,
  Lang,
  LocalizedContent,
  TheoryId,
} from '../../data/content';
import {
  SPATIAL_SPRING,
  handleRovingTabKeyDown,
  syncCanvasHiDpi,
  usePrefersReducedMotion,
} from './labUtils';

export interface BrainAtlasLabProps {
  lab: ChapterCh2['lab'];
  ui: LocalizedContent['ui'];
  lang: Lang;
  activeTheory: TheoryId;
  onSelectTheory: (id: TheoryId) => void;
}

interface RegionMeta {
  id: BrainRegionId;
  /** Normalized position inside the cortical bounding frame [0..1] */
  nx: number;
  ny: number;
  labelEn: string;
  labelRu: string;
  shortEn: string;
  shortRu: string;
  labelOffset: [number, number];
  align: CanvasTextAlign;
}

const REGIONS: readonly RegionMeta[] = [
  {
    id: 'pfc',
    nx: 0.20,
    ny: 0.41,
    labelEn: 'Prefrontal (PFC)',
    labelRu: 'Префронтальная (ПФК)',
    shortEn: 'PFC',
    shortRu: 'ПФК',
    labelOffset: [0, -16],
    align: 'center',
  },
  {
    id: 'parietal',
    nx: 0.61,
    ny: 0.24,
    labelEn: 'Parietal',
    labelRu: 'Теменная',
    shortEn: 'Parietal',
    shortRu: 'Теменная',
    labelOffset: [0, -15],
    align: 'center',
  },
  {
    id: 'insula',
    nx: 0.37,
    ny: 0.51,
    labelEn: 'Insula',
    labelRu: 'Островок',
    shortEn: 'Insula',
    shortRu: 'Островок',
    labelOffset: [-8, 17],
    align: 'center',
  },
  {
    id: 'thalamus',
    nx: 0.52,
    ny: 0.47,
    labelEn: 'Thalamus',
    labelRu: 'Таламус',
    shortEn: 'Thalamus',
    shortRu: 'Таламус',
    labelOffset: [4, -14],
    align: 'center',
  },
  {
    id: 'temporal',
    nx: 0.55,
    ny: 0.71,
    labelEn: 'Temporal',
    labelRu: 'Височная',
    shortEn: 'Temporal',
    shortRu: 'Височная',
    labelOffset: [0, 18],
    align: 'center',
  },
  {
    id: 'occipital',
    nx: 0.81,
    ny: 0.46,
    labelEn: 'Occipital',
    labelRu: 'Затылочная',
    shortEn: 'Occipital',
    shortRu: 'Затылочная',
    labelOffset: [2, 18],
    align: 'center',
  },
];

interface TheoryVisualProfile {
  primary: string;
  secondary: string;
  glow: string;
  modeEn: string;
  modeRu: string;
  edges: ReadonlyArray<[BrainRegionId, BrainRegionId, 'forward' | 'backward' | 'bidirectional']>;
}

const THEORY_PROFILES: Record<TheoryId, TheoryVisualProfile> = {
  gnwt: {
    primary: '#E05A47',
    secondary: '#D99B4E',
    glow: 'rgba(224, 90, 71, 0.34)',
    modeEn: 'FRONTO-PARIETAL GLOBAL IGNITION',
    modeRu: 'ЛОБНО-ТЕМЕННОЕ ВОСПЛАМЕНЕНИЕ',
    edges: [
      ['occipital', 'temporal', 'forward'],
      ['temporal', 'pfc', 'bidirectional'],
      ['occipital', 'parietal', 'forward'],
      ['pfc', 'parietal', 'bidirectional'],
      ['parietal', 'temporal', 'bidirectional'],
    ],
  },
  iit: {
    primary: '#2AB3A6',
    secondary: '#7E9C76',
    glow: 'rgba(42, 179, 166, 0.36)',
    modeEn: 'POSTERIOR HOT ZONE · Φ INTEGRATION',
    modeRu: 'ЗАДНЯЯ «ГОРЯЧАЯ ЗОНА» · ИНТЕГРАЦИЯ Φ',
    edges: [
      ['occipital', 'parietal', 'bidirectional'],
      ['parietal', 'temporal', 'bidirectional'],
      ['temporal', 'occipital', 'bidirectional'],
    ],
  },
  pp: {
    primary: '#D99B4E',
    secondary: '#2AB3A6',
    glow: 'rgba(217, 155, 78, 0.32)',
    modeEn: 'TOP-DOWN PRIORS ↔ PREDICTION ERRORS',
    modeRu: 'НИСХОД. ПРИОРЫ ↔ ОШИБКИ ПРОГНОЗА',
    edges: [
      ['pfc', 'insula', 'bidirectional'],
      ['pfc', 'thalamus', 'bidirectional'],
      ['insula', 'thalamus', 'bidirectional'],
      ['thalamus', 'occipital', 'bidirectional'],
      ['thalamus', 'temporal', 'bidirectional'],
      ['temporal', 'occipital', 'bidirectional'],
    ],
  },
  hot: {
    primary: '#5B8DEF',
    secondary: '#A39E93',
    glow: 'rgba(91, 141, 239, 0.34)',
    modeEn: 'PREFRONTAL META-REPRESENTATION',
    modeRu: 'ПРЕФРОНТАЛЬНАЯ МЕТАРЕПРЕЗЕНТАЦИЯ',
    edges: [
      ['pfc', 'parietal', 'forward'],
      ['pfc', 'occipital', 'forward'],
      ['occipital', 'parietal', 'forward'],
    ],
  },
  rpt: {
    primary: '#7E9C76',
    secondary: '#2AB3A6',
    glow: 'rgba(126, 156, 118, 0.34)',
    modeEn: 'LOCAL SENSORY RECURRENT LOOPS',
    modeRu: 'ЛОКАЛЬНЫЕ СЕНСОРНЫЕ ПЕТЛИ',
    edges: [
      ['occipital', 'temporal', 'bidirectional'],
    ],
  },
};

/**
 * Draws a clean architectural lateral brain silhouette scaled to the bounding box.
 */
function traceLateralCortex(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number
): void {
  const px = (nx: number) => bx + nx * bw;
  const py = (ny: number) => by + ny * bh;

  ctx.beginPath();
  // Start at frontal pole (left)
  ctx.moveTo(px(0.11), py(0.49));
  // Superior frontal curve -> parietal vertex
  ctx.bezierCurveTo(px(0.10), py(0.24), px(0.29), py(0.10), px(0.55), py(0.11));
  // Parietal -> occipital pole (right)
  ctx.bezierCurveTo(px(0.76), py(0.12), px(0.91), py(0.28), px(0.90), py(0.49));
  // Occipital notch -> inferior temporal base
  ctx.bezierCurveTo(px(0.89), py(0.66), px(0.75), py(0.73), px(0.64), py(0.74));
  // Temporal lobe belly curving forward
  ctx.bezierCurveTo(px(0.55), py(0.83), px(0.39), py(0.81), px(0.33), py(0.70));
  // Frontotemporal insula indentation -> orbitofrontal underside
  ctx.bezierCurveTo(px(0.24), py(0.67), px(0.12), py(0.63), px(0.11), py(0.49));
  ctx.closePath();
}

export function BrainAtlasLab({
  lab,
  ui,
  lang,
  activeTheory,
  onSelectTheory,
}: BrainAtlasLabProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const activeIndex = Math.max(
    0,
    lab.theories.findIndex((t) => t.id === activeTheory)
  );
  const theory = lab.theories[activeIndex] ?? lab.theories[0];
  const profile = THEORY_PROFILES[theory.id];

  const activeRegionSet = useMemo(
    () => new Set<BrainRegionId>(theory.activeRegions),
    [theory.activeRegions]
  );

  // Store live state in refs so RAF loop stays smooth without tearing down observers unnecessarily
  const stateRef = useRef({
    theoryId: theory.id,
    activeRegionSet,
    lang,
    reducedMotion,
  });
  stateRef.current = {
    theoryId: theory.id,
    activeRegionSet,
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
    let height = container.clientHeight || 260;

    const drawFrame = (timeMs: number) => {
      const { theoryId, activeRegionSet: activeSet, lang: curLang, reducedMotion: isReduced } =
        stateRef.current;
      const curProfile = THEORY_PROFILES[theoryId];
      const { w, h, dpr } = syncCanvasHiDpi(canvas, width, height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#10100F';
      ctx.fillRect(0, 0, w, h);

      const t = isReduced ? 1.4 : timeMs * 0.001;
      const isCompact = w < 420;

      // Subtle architectural radial background sheen
      const bgGrad = ctx.createRadialGradient(w * 0.52, h * 0.48, 8, w * 0.52, h * 0.48, w * 0.55);
      bgGrad.addColorStop(0, curProfile.glow.replace(/0\.\d+\)$/, '0.13)'));
      bgGrad.addColorStop(1, 'rgba(16, 16, 15, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Compute balanced cortical bounding box
      const padTop = isCompact ? 34 : 36;
      const padBottom = isCompact ? 30 : 26;
      const availH = Math.max(120, h - padTop - padBottom);
      const bh = availH;
      const bw = Math.min(w - 28, bh * 1.56);
      const bx = (w - bw) * 0.5;
      const by = padTop;

      const pt = (r: RegionMeta): [number, number] => [bx + r.nx * bw, by + r.ny * bh];
      const regionById = new Map<BrainRegionId, [number, number]>();
      for (const r of REGIONS) {
        regionById.set(r.id, pt(r));
      }

      // 1. Subtle cerebellum & brainstem architectural contour
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx + 0.65 * bw, by + 0.74 * bh);
      ctx.bezierCurveTo(
        bx + 0.80 * bw,
        by + 0.72 * bh,
        bx + 0.86 * bw,
        by + 0.85 * bh,
        bx + 0.72 * bw,
        by + 0.91 * bh
      );
      ctx.bezierCurveTo(
        bx + 0.62 * bw,
        by + 0.93 * bh,
        bx + 0.57 * bw,
        by + 0.84 * bh,
        bx + 0.57 * bw,
        by + 0.77 * bh
      );
      ctx.strokeStyle = 'rgba(184, 181, 173, 0.16)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2.5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 2. Lateral cortical glass silhouette
      ctx.save();
      traceLateralCortex(ctx, bx, by, bw, bh);
      const cortexFill = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
      cortexFill.addColorStop(0, 'rgba(243, 242, 238, 0.055)');
      cortexFill.addColorStop(0.5, 'rgba(20, 20, 18, 0.42)');
      cortexFill.addColorStop(1, 'rgba(243, 242, 238, 0.025)');
      ctx.fillStyle = cortexFill;
      ctx.fill();
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.20)';
      ctx.lineWidth = 1.15;
      ctx.stroke();

      // Clip internal cortical sulci & theory-specific glow fields cleanly inside cortex
      ctx.clip();

      // Whisper-thin anatomical sulci landmarks (Central & Sylvian)
      ctx.beginPath();
      ctx.moveTo(bx + 0.50 * bw, by + 0.12 * bh);
      ctx.quadraticCurveTo(bx + 0.45 * bw, by + 0.31 * bh, bx + 0.40 * bw, by + 0.46 * bh);
      ctx.moveTo(bx + 0.30 * bw, by + 0.58 * bh);
      ctx.quadraticCurveTo(bx + 0.47 * bw, by + 0.53 * bh, bx + 0.64 * bw, by + 0.45 * bh);
      ctx.moveTo(bx + 0.72 * bw, by + 0.19 * bh);
      ctx.quadraticCurveTo(bx + 0.69 * bw, by + 0.35 * bh, bx + 0.73 * bw, by + 0.48 * bh);
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.08)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Theory-specific spatial luminance fields inside the cortex
      if (theoryId === 'iit') {
        const cx = bx + 0.68 * bw;
        const cy = by + 0.48 * bh;
        const pulse = 0.85 + 0.15 * Math.sin(t * 2.1);
        const hotGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, bw * 0.34 * pulse);
        hotGrad.addColorStop(0, 'rgba(42, 179, 166, 0.34)');
        hotGrad.addColorStop(0.55, 'rgba(42, 179, 166, 0.10)');
        hotGrad.addColorStop(1, 'rgba(42, 179, 166, 0)');
        ctx.fillStyle = hotGrad;
        ctx.fillRect(bx, by, bw, bh);
      } else if (theoryId === 'hot') {
        const pfcPos = regionById.get('pfc')!;
        const occPos = regionById.get('occipital')!;
        const sweep = Math.sin(t * 1.45) * 0.08 * bh;
        const beamGrad = ctx.createLinearGradient(pfcPos[0], pfcPos[1], occPos[0], occPos[1]);
        beamGrad.addColorStop(0, 'rgba(91, 141, 239, 0.36)');
        beamGrad.addColorStop(0.65, 'rgba(91, 141, 239, 0.10)');
        beamGrad.addColorStop(1, 'rgba(91, 141, 239, 0.01)');
        ctx.beginPath();
        ctx.moveTo(pfcPos[0], pfcPos[1]);
        ctx.lineTo(bx + 0.90 * bw, by + 0.18 * bh + sweep);
        ctx.lineTo(bx + 0.90 * bw, by + 0.70 * bh + sweep);
        ctx.closePath();
        ctx.fillStyle = beamGrad;
        ctx.fill();
      } else if (theoryId === 'gnwt') {
        const pfcPos = regionById.get('pfc')!;
        const parPos = regionById.get('parietal')!;
        const wavePhase = (t * 0.55) % 1;
        const rIgnite = wavePhase * bw * 0.44;
        const alphaIgnite = (1 - wavePhase) * 0.42;
        for (const [cx, cy] of [pfcPos, parPos]) {
          ctx.beginPath();
          ctx.arc(cx, cy, rIgnite, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(224, 90, 71, ${alphaIgnite.toFixed(3)})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      } else if (theoryId === 'rpt') {
        const occPos = regionById.get('occipital')!;
        const tmpPos = regionById.get('temporal')!;
        const mx = (occPos[0] + tmpPos[0]) * 0.5;
        const my = (occPos[1] + tmpPos[1]) * 0.5;
        const loopGrad = ctx.createRadialGradient(mx, my, 4, mx, my, bw * 0.25);
        loopGrad.addColorStop(0, 'rgba(126, 156, 118, 0.32)');
        loopGrad.addColorStop(1, 'rgba(126, 156, 118, 0)');
        ctx.fillStyle = loopGrad;
        ctx.fillRect(bx, by, bw, bh);
      } else if (theoryId === 'pp') {
        const insPos = regionById.get('insula')!;
        const p = (t * 0.7) % 1;
        ctx.beginPath();
        ctx.arc(insPos[0], insPos[1], 10 + p * 34, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(217, 155, 78, ${((1 - p) * 0.36).toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
      ctx.restore();

      // 3. Structural baseline white-matter mesh (very faint)
      const basePairs: ReadonlyArray<[BrainRegionId, BrainRegionId]> = [
        ['pfc', 'parietal'],
        ['pfc', 'insula'],
        ['insula', 'thalamus'],
        ['thalamus', 'parietal'],
        ['thalamus', 'temporal'],
        ['thalamus', 'occipital'],
        ['parietal', 'occipital'],
        ['temporal', 'occipital'],
        ['temporal', 'parietal'],
      ];

      ctx.save();
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.065)';
      ctx.lineWidth = 0.85;
      for (const [a, b] of basePairs) {
        const pa = regionById.get(a)!;
        const pb = regionById.get(b)!;
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Active theory signal arcs & animated traveling pulses
      const drawCurvedArc = (
        p0: [number, number],
        p1: [number, number],
        bend: number,
        stroke: string | CanvasGradient,
        lineW: number
      ): [number, number] => {
        const mx = (p0[0] + p1[0]) * 0.5;
        const my = (p0[1] + p1[1]) * 0.5;
        const dx = p1[0] - p0[0];
        const dy = p1[1] - p0[1];
        const len = Math.hypot(dx, dy) || 1;
        const cx = mx - (dy / len) * bend;
        const cy = my + (dx / len) * bend;

        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.quadraticCurveTo(cx, cy, p1[0], p1[1]);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineW;
        ctx.stroke();
        return [cx, cy];
      };

      const evalQuad = (
        p0: [number, number],
        c: [number, number],
        p1: [number, number],
        u: number
      ): [number, number] => {
        const inv = 1 - u;
        return [
          inv * inv * p0[0] + 2 * inv * u * c[0] + u * u * p1[0],
          inv * inv * p0[1] + 2 * inv * u * c[1] + u * u * p1[1],
        ];
      };

      curProfile.edges.forEach(([fromId, toId, dir], idx) => {
        const p0 = regionById.get(fromId)!;
        const p1 = regionById.get(toId)!;

        if (theoryId === 'rpt') {
          const cTop = drawCurvedArc(p0, p1, -24, 'rgba(126, 156, 118, 0.58)', 1.6);
          const cBot = drawCurvedArc(p0, p1, 24, 'rgba(42, 179, 166, 0.58)', 1.6);
          for (let k = 0; k < 2; k++) {
            const u1 = (t * 0.85 + k * 0.5) % 1;
            const u2 = 1 - ((t * 0.85 + k * 0.5 + 0.25) % 1);
            const [x1, y1] = evalQuad(p0, cTop, p1, u1);
            const [x2, y2] = evalQuad(p0, cBot, p1, u2);
            for (const [pxDot, pyDot, col] of [
              [x1, y1, '#7E9C76'] as const,
              [x2, y2, '#2AB3A6'] as const,
            ]) {
              ctx.beginPath();
              ctx.arc(pxDot, pyDot, 3.2, 0, Math.PI * 2);
              ctx.fillStyle = col;
              ctx.fill();
            }
          }
          return;
        }

        const bend = idx % 2 === 0 ? -15 : 15;
        const edgeGrad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        edgeGrad.addColorStop(0, `${curProfile.primary}66`);
        edgeGrad.addColorStop(1, `${curProfile.secondary}66`);
        const ctrl = drawCurvedArc(p0, p1, bend, edgeGrad, 1.5);

        const speed = theoryId === 'gnwt' ? 0.72 : 0.54;
        const uFwd = (t * speed + idx * 0.21) % 1;
        const [fx, fy] = evalQuad(p0, ctrl, p1, uFwd);

        ctx.save();
        ctx.shadowColor = curProfile.primary;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(fx, fy, 3.1, 0, Math.PI * 2);
        ctx.fillStyle = curProfile.primary;
        ctx.fill();
        ctx.restore();

        if (dir === 'bidirectional') {
          const uRev = 1 - ((t * speed + idx * 0.21 + 0.48) % 1);
          const [rx, ry] = evalQuad(p0, ctrl, p1, uRev);
          ctx.save();
          ctx.shadowColor = curProfile.secondary;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(rx, ry, 2.7, 0, Math.PI * 2);
          ctx.fillStyle = curProfile.secondary;
          ctx.fill();
          ctx.restore();
        }
      });

      // 5. Six Anatomical Hub Nodes + Clamped Bilingual Labels
      const fontSize = isCompact ? 9.5 : 10.5;
      ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = 'middle';

      for (const region of REGIONS) {
        const [nx, ny] = regionById.get(region.id)!;
        const isActive = activeSet.has(region.id);
        const pulse = isActive ? 1 + 0.14 * Math.sin(t * 3.1 + region.nx * 8) : 1;

        if (isActive) {
          const halo = ctx.createRadialGradient(nx, ny, 2, nx, ny, 19 * pulse);
          halo.addColorStop(0, `${curProfile.primary}75`);
          halo.addColorStop(1, `${curProfile.primary}00`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(nx, ny, 19 * pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(nx, ny, 8.2 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `${curProfile.primary}AA`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(nx, ny, isActive ? 4.4 : 3.0, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#F3F2EE' : 'rgba(184, 181, 173, 0.38)';
        ctx.fill();
        if (isActive) {
          ctx.strokeStyle = curProfile.primary;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        const text =
          curLang === 'ru'
            ? isCompact
              ? region.shortRu
              : region.labelRu
            : isCompact
              ? region.shortEn
              : region.labelEn;

        const textW = ctx.measureText(text).width;
        let lx = nx + region.labelOffset[0];
        const ly = Math.max(24, Math.min(h - 12, ny + region.labelOffset[1]));
        const halfW = textW * 0.5;
        lx = Math.max(halfW + 8, Math.min(w - halfW - 8, lx));

        ctx.textAlign = 'center';
        ctx.fillStyle = isActive ? '#F3F2EE' : 'rgba(184, 181, 173, 0.56)';
        ctx.fillText(text, lx, ly);
      }

      // 6. Subtle Spatial HUD Bar (keeps full top width clear on compact mobile < 420px!)
      ctx.font = `500 ${isCompact ? 8.5 : 9.5}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = curProfile.primary;
      const modeText = curLang === 'ru' ? curProfile.modeRu : curProfile.modeEn;
      ctx.fillText(modeText, 12, 10);

      const latText = curLang === 'ru' ? 'ЛАТЕРАЛЬНАЯ ПРОЕКЦИЯ' : 'LATERAL VIEW';

      if (isCompact) {
        // Place view indicator cleanly at bottom-right so top HUD never collides on 375px RU/EN
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(184, 181, 173, 0.76)';
        ctx.fillText(latText, w - 12, h - 8);
      } else if (theoryId === 'pp') {
        // Color-coded legend for PP opposing arrows (Warm Amber Priors + Bio-Teal Errors)
        const errWord = curLang === 'ru' ? 'Ошибки' : 'Errors';
        const priWord = curLang === 'ru' ? 'Приоры' : 'Priors';
        const errW = ctx.measureText(errWord).width;
        const rightEdge = w - 12;

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(214, 211, 203, 0.86)';
        ctx.fillText(errWord, rightEdge, 10);

        ctx.beginPath();
        ctx.arc(rightEdge - errW - 7, 14.5, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = curProfile.secondary;
        ctx.fill();

        const priRight = rightEdge - errW - 18;
        const priW = ctx.measureText(priWord).width;
        ctx.fillStyle = 'rgba(214, 211, 203, 0.86)';
        ctx.fillText(priWord, priRight, 10);

        ctx.beginPath();
        ctx.arc(priRight - priW - 7, 14.5, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = curProfile.primary;
        ctx.fill();
      } else {
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(184, 181, 173, 0.76)';
        ctx.fillText(latText, w - 12, 10);
      }
    };

    drawNowRef.current = () => drawFrame(performance.now());

    const tick = (now: number) => {
      drawFrame(now);
      if (!stateRef.current.reducedMotion) {
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
      drawFrame(1400);
    } else {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      drawNowRef.current = null;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [reducedMotion]);

  // Repaint static frame immediately when theory or language switches under reduced motion
  useEffect(() => {
    if (reducedMotion) {
      drawNowRef.current?.();
    }
  }, [activeTheory, lang, reducedMotion]);

  const breakdownItems = [
    {
      id: 'founders',
      k: lang === 'ru' ? 'Авторы и сторонники' : 'Proponents',
      v: theory.founders,
    },
    {
      id: 'mechanism',
      k: lang === 'ru' ? 'Нейронный механизм' : 'Mechanism',
      v: theory.mechanism,
    },
    {
      id: 'hotspot',
      k: lang === 'ru' ? 'Анатомический фокус' : 'Anatomical Locus',
      v: theory.hotspot,
    },
    {
      id: 'critique',
      k: lang === 'ru' ? 'Ключевая критика' : 'Key Critique',
      v: theory.critique,
    },
  ];

  const syncBadge = lang === 'ru' ? 'Синхр. с 3D-мозгом' : '3D Cortex Synced';

  return (
    <section
      className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-7"
      aria-label={lab.title}
    >
      {/* Ambient theory-colored halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-16 h-60 w-60 rounded-full blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${profile.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Lab Header */}
      <div className="relative flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[var(--accent-a)] uppercase">
            <span
              className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
              style={{
                backgroundColor: profile.primary,
                boxShadow: `0 0 10px ${profile.primary}`,
              }}
            />
            {lab.badge}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-[#D6D3CB]">
            <Cpu className="h-3 w-3 text-[var(--accent-a)]" strokeWidth={1.65} />
            {syncBadge}
          </span>
        </div>

        <h3 className="font-[var(--font-display)] text-lg font-medium tracking-[-0.025em] text-[#F3F2EE] sm:text-2xl">
          {lab.title}
        </h3>
        <p className="max-w-3xl text-sm leading-relaxed text-[#B8B5AD]">
          {lab.instruction}
        </p>
      </div>

      {/* Theory Selector Pills (Roving Tablist -> Live 3D Brain Sync) */}
      <div
        role="tablist"
        aria-label={ui.ariaBrainTheories}
        className="mt-5 flex flex-wrap gap-1.5"
      >
        {lab.theories.map((item, index) => {
          const isSelected = item.id === theory.id;
          const itemProfile = THEORY_PROFILES[item.id];
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`brain-theory-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={`brain-theory-panel-${item.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectTheory(item.id)}
              onKeyDown={(e) =>
                handleRovingTabKeyDown(
                  e,
                  lab.theories,
                  index,
                  (tItem) => onSelectTheory(tItem.id),
                  (nextIdx) => tabRefs.current[nextIdx]?.focus()
                )
              }
              className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs font-medium transition-colors ${
                isSelected
                  ? 'text-[#F3F2EE]'
                  : 'text-[#B8B5AD] hover:text-[#F3F2EE]'
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="brain-theory-active-pill"
                  transition={reducedMotion ? { duration: 0 } : SPATIAL_SPRING}
                  className="pointer-events-none absolute inset-0 rounded-full border bg-white/[0.08]"
                  style={{
                    borderColor: `${itemProfile.primary}70`,
                    boxShadow: `0 0 24px -6px ${itemProfile.glow}`,
                  }}
                />
              )}
              <span
                className="relative z-10 h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: isSelected ? itemProfile.primary : 'rgba(184,181,173,0.45)',
                }}
              />
              <span className="relative z-10">{item.short}</span>
            </button>
          );
        })}
      </div>

      {/* HiDPI Translucent Lateral Cortex Schematic Canvas */}
      <div
        ref={containerRef}
        className="relative mt-4 h-[235px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#10100F]/90 sm:h-[270px]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          role="img"
          aria-label={`${theory.name} — ${theory.hotspot}`}
        />
      </div>

      <hr className="hairline my-5" />

      {/* Clean 4-Item Hairline Breakdown */}
      <AnimatePresence mode="wait">
        <motion.div
          key={theory.id}
          role="tabpanel"
          id={`brain-theory-panel-${theory.id}`}
          aria-labelledby={`brain-theory-tab-${theory.id}`}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-[var(--font-display)] text-base font-medium tracking-[-0.02em] text-[#F3F2EE] sm:text-lg">
              {theory.name}
            </h4>
            <span
              className="font-mono text-[11px] tracking-[0.12em] uppercase"
              style={{ color: profile.primary }}
            >
              {theory.short}
            </span>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {breakdownItems.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-1 border-t border-white/[0.07] pt-3"
              >
                <dt className="font-mono text-[10px] tracking-[0.13em] text-[#8E8B82] uppercase">
                  {row.k}
                </dt>
                <dd className="text-xs leading-relaxed text-[#D6D3CB] sm:text-[13px]">
                  {row.v}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
