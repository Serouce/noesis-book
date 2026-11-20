import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import type {
  ChapterCh6,
  Lang,
  LocalizedContent,
  MindEntity,
  MindEntityId,
} from '../../data/content';
import {
  SPATIAL_SPRING,
  syncCanvasHiDpi,
  usePrefersReducedMotion,
} from './labUtils';

export interface MindspaceLabProps {
  lab: ChapterCh6['lab'];
  ui: LocalizedContent['ui'];
  lang: Lang;
}

const DEFAULT_SELECTED: readonly MindEntityId[] = ['human', 'octopus', 'llm'];
const MAX_ACTIVE_ENTITIES = 4;

const ENTITY_COLORS: Record<MindEntityId, string> = {
  human: '#2AB3A6',
  octopus: '#D99B4E',
  corvid: '#5B8DEF',
  bumblebee: '#7E9C76',
  organoid: '#A39E93',
  llm: '#E05A47',
};

interface EntityAnimState {
  opacity: number;
  scale: number;
}

/**
 * Splits a bilingual radar axis label into 1–2 balanced lines for crisp wrapping on narrow viewports.
 */
function wrapAxisLabel(label: string): string[] {
  const words = label.trim().split(/\s+/);
  if (words.length <= 1) return [label];
  if (words.length === 2) return [words[0], words[1]];

  // Find split point closest to the middle character length
  let bestSplit = 1;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i++) {
    const l1 = words.slice(0, i).join(' ').length;
    const l2 = words.slice(i).join(' ').length;
    const diff = Math.abs(l1 - l2);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestSplit = i;
    }
  }
  return [words.slice(0, bestSplit).join(' '), words.slice(bestSplit).join(' ')];
}

function getAxisAngle(index: number): number {
  return -Math.PI / 2 + (index * Math.PI * 2) / 5;
}

export function MindspaceLab({ lab, lang }: MindspaceLabProps) {
  const [selectedIds, setSelectedIds] = useState<MindEntityId[]>([
    ...DEFAULT_SELECTED,
  ]);
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Persistent damped animation state per entity for liquid polygon morphing
  const animMapRef = useRef<Record<MindEntityId, EntityAnimState>>({
    human: { opacity: 1, scale: 1 },
    octopus: { opacity: 1, scale: 1 },
    corvid: { opacity: 0, scale: 0.72 },
    bumblebee: { opacity: 0, scale: 0.72 },
    organoid: { opacity: 0, scale: 0.72 },
    llm: { opacity: 1, scale: 1 },
  });

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const activeEntities = useMemo(
    () => lab.entities.filter((e) => selectedSet.has(e.id)),
    [lab.entities, selectedSet]
  );

  const toggleEntity = useCallback((id: MindEntityId) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // Keep at least 1 active entity so radar never becomes blank
        if (prev.length <= 1) return prev;
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= MAX_ACTIVE_ENTITIES) {
        // Smooth FIFO swap when at max 4 so every chip remains immediately responsive
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  }, []);

  // Store live values in ref for RAF render loop
  const liveRef = useRef({
    entities: lab.entities,
    axes: lab.axes,
    selectedSet,
    hoveredAxis,
    reducedMotion,
  });
  liveRef.current = {
    entities: lab.entities,
    axes: lab.axes,
    selectedSet,
    hoveredAxis,
    reducedMotion,
  };

  // Interactive pointer detection for axis hover / mobile tap
  const updateHoveredAxisFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      const cx = w * 0.5;
      const cy = h * 0.51;
      const radius =
        w < 460
          ? Math.min(w * 0.20, h * 0.25)
          : Math.min(w * 0.27, h * 0.34);

      const distFromCenter = Math.hypot(x - cx, y - cy);
      if (distFromCenter < 14 || distFromCenter > radius * 1.65) {
        setHoveredAxis(null);
        return;
      }

      let nearestIdx: number | null = null;
      let bestAngleDiff = 0.48; // radians (~27 deg wedge around spoke)
      const pointerAngle = Math.atan2(y - cy, x - cx);

      for (let i = 0; i < 5; i++) {
        const axisAng = getAxisAngle(i);
        let diff = Math.abs(pointerAngle - axisAng);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff < bestAngleDiff) {
          bestAngleDiff = diff;
          nearestIdx = i;
        }
      }
      setHoveredAxis(nearestIdx);
    },
    []
  );

  const requestDrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = container.clientWidth || 520;
    let height = container.clientHeight || 315;

    const drawFrame = () => {
      const {
        entities,
        axes,
        selectedSet: selSet,
        hoveredAxis: hovAxis,
        reducedMotion: isReduced,
      } = liveRef.current;

      const { w, h, dpr } = syncCanvasHiDpi(canvas, width, height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#10100F';
      ctx.fillRect(0, 0, w, h);

      const isNarrow = w < 460;
      const cx = w * 0.5;
      const cy = h * 0.51;
      // Tighter radius below 460px to guarantee zero clipping of wrapped bilingual labels on 375px phones!
      const radius = isNarrow
        ? Math.min(w * 0.20, h * 0.25)
        : Math.min(w * 0.27, h * 0.34);

      // 1. Subtle observatory central glow
      const bgGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius * 1.45);
      bgGlow.addColorStop(0, 'rgba(217, 155, 78, 0.08)');
      bgGlow.addColorStop(0.55, 'rgba(42, 179, 166, 0.04)');
      bgGlow.addColorStop(1, 'rgba(16, 16, 15, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // 2. Concentric Pentagonal Observatory Grid Rings (25, 50, 75, 100)
      const levels = [0.25, 0.5, 0.75, 1.0];
      ctx.save();
      for (const lvl of levels) {
        const r = radius * lvl;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const ang = getAxisAngle(i);
          const vx = cx + Math.cos(ang) * r;
          const vy = cy + Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.strokeStyle =
          lvl === 1.0
            ? 'rgba(243, 242, 238, 0.16)'
            : 'rgba(243, 242, 238, 0.065)';
        ctx.lineWidth = lvl === 1.0 ? 1.05 : 0.8;
        ctx.stroke();
      }

      // Subtle outer circular observatory degree ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.06, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.045)';
      ctx.setLineDash([2, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Radial Spokes (highlight hovered spoke cleanly)
      for (let i = 0; i < 5; i++) {
        const ang = getAxisAngle(i);
        const vx = cx + Math.cos(ang) * radius;
        const vy = cy + Math.sin(ang) * radius;
        const isHov = hovAxis === i;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(vx, vy);
        ctx.strokeStyle = isHov
          ? 'rgba(243, 242, 238, 0.52)'
          : 'rgba(243, 242, 238, 0.095)';
        ctx.lineWidth = isHov ? 1.5 : 0.85;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(vx, vy, isHov ? 3.2 : 2.0, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? '#F3F2EE' : 'rgba(184, 181, 173, 0.44)';
        ctx.fill();
      }
      ctx.restore();

      // Scale percentage numerals on vertical axis (50 / 100)
      ctx.font = `500 8.5px "JetBrains Mono", monospace`;
      ctx.fillStyle = 'rgba(142, 139, 130, 0.76)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('50', cx + 4, cy - radius * 0.5 + 1);
      ctx.fillText('100', cx + 4, cy - radius + 7);

      // 4. Damped Morphing Entity Polygons
      let stillAnimating = false;
      const animMap = animMapRef.current;

      for (const entity of entities) {
        const isActive = selSet.has(entity.id);
        const state = animMap[entity.id];
        const targetOpacity = isActive ? 1 : 0;
        const targetScale = isActive ? 1 : 0.72;

        if (isReduced) {
          state.opacity = targetOpacity;
          state.scale = targetScale;
        } else {
          const dOp = targetOpacity - state.opacity;
          const dSc = targetScale - state.scale;
          if (Math.abs(dOp) > 0.004 || Math.abs(dSc) > 0.004) {
            state.opacity += dOp * 0.14;
            state.scale += dSc * 0.14;
            stillAnimating = true;
          } else {
            state.opacity = targetOpacity;
            state.scale = targetScale;
          }
        }

        if (state.opacity < 0.015) continue;

        const color = ENTITY_COLORS[entity.id];
        const pts: Array<[number, number]> = [];
        for (let i = 0; i < 5; i++) {
          const ang = getAxisAngle(i);
          const norm = Math.max(0.03, entity.scores[i] / 100) * state.scale;
          pts.push([cx + Math.cos(ang) * radius * norm, cy + Math.sin(ang) * radius * norm]);
        }

        ctx.save();
        ctx.globalAlpha = state.opacity;

        ctx.beginPath();
        pts.forEach(([px, py], i) => {
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = `${color}24`;
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.85;
        ctx.lineJoin = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        for (let i = 0; i < 5; i++) {
          const [px, py] = pts[i];
          const isHov = hovAxis === i;
          ctx.beginPath();
          ctx.arc(px, py, isHov ? 4.4 : 2.8, 0, Math.PI * 2);
          ctx.fillStyle = isHov ? '#F3F2EE' : color;
          ctx.fill();
          if (isHov) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 5. Wrapped Bilingual Axis Labels Strictly Clamped Inside [8, w - 8]!
      const fontSize = isNarrow ? 9.5 : 11;
      const lineHeight = isNarrow ? 11.5 : 13.5;
      ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const labelGap = isNarrow ? 16 : 22;

      for (let i = 0; i < 5; i++) {
        const ang = getAxisAngle(i);
        const lines = wrapAxisLabel(axes[i]);
        const isHov = hovAxis === i;
        const maxLineW = Math.max(...lines.map((line) => ctx.measureText(line).width));
        const halfW = maxLineW * 0.5;
        const blockH = lines.length * lineHeight;

        const cosA = Math.cos(ang);
        const sinA = Math.sin(ang);

        const extraX = Math.abs(cosA) > 0.5 ? (isNarrow ? 16 : 26) * Math.sign(cosA) : 0;
        const extraY = sinA > 0.5 ? (isNarrow ? 8 : 10) : sinA < -0.5 ? -8 : 0;

        let lx = cx + cosA * (radius + labelGap) + extraX;
        let ly = cy + sinA * (radius + labelGap) + extraY;

        // Strict horizontal clamp inside [8, w - 8]
        lx = Math.max(8 + halfW, Math.min(w - 8 - halfW, lx));
        // Strict vertical clamp inside [8, h - 8]
        ly = Math.max(8 + blockH * 0.5, Math.min(h - 8 - blockH * 0.5, ly));

        ctx.fillStyle = isHov ? '#F3F2EE' : 'rgba(214, 211, 203, 0.88)';
        const startY = ly - ((lines.length - 1) * lineHeight) * 0.5;
        lines.forEach((line, lIdx) => {
          ctx.fillText(line, lx, startY + lIdx * lineHeight);
        });
      }

      if (stillAnimating && !isReduced) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    const scheduleDraw = () => {
      window.cancelAnimationFrame(rafId);
      drawFrame();
    };
    requestDrawRef.current = scheduleDraw;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      scheduleDraw();
    });
    resizeObserver.observe(container);

    scheduleDraw();

    return () => {
      requestDrawRef.current = null;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  // Re-trigger smooth damped polygon morphing or hover redraw without tearing down ResizeObserver
  useEffect(() => {
    requestDrawRef.current?.();
  }, [selectedIds, hoveredAxis, lab.axes, lab.entities, reducedMotion]);

  const hoverHint =
    lang === 'ru'
      ? 'Наведите или коснитесь оси для сравнения баллов'
      : 'Hover or tap any axis to inspect scores';

  const countLabel =
    lang === 'ru'
      ? `${selectedIds.length} / ${MAX_ACTIVE_ENTITIES} активн.`
      : `${selectedIds.length} / ${MAX_ACTIVE_ENTITIES} active`;

  const evidenceHeading = lang === 'ru' ? 'Эмпирическая база:' : 'Evidence:';

  return (
    <section
      className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-7"
      aria-label={lab.title}
    >
      {/* Ambient warm amber & terracotta spatial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(217, 155, 78, 0.18) 0%, rgba(224, 90, 71, 0.12) 45%, transparent 72%)',
        }}
      />

      {/* Lab Header */}
      <div className="relative flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[var(--accent-a)] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-a)] shadow-[0_0_10px_var(--accent-a)]" />
            {lab.badge}
          </span>
          <span className="font-mono text-[10px] tracking-[0.1em] text-[#B8B5AD] uppercase">
            {countLabel}
          </span>
        </div>

        <h3 className="font-[var(--font-display)] text-lg font-medium tracking-[-0.025em] text-[#F3F2EE] sm:text-2xl">
          {lab.title}
        </h3>
        <p className="max-w-3xl text-sm leading-relaxed text-[#B8B5AD]">
          {lab.instruction}
        </p>
      </div>

      {/* Multi-Select Entity Toggle Chips (1–4 active entities) */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {lab.entities.map((entity) => {
          const isSelected = selectedSet.has(entity.id);
          const color = ENTITY_COLORS[entity.id];
          return (
            <motion.button
              key={entity.id}
              type="button"
              onClick={() => toggleEntity(entity.id)}
              whileTap={reducedMotion ? undefined : { scale: 0.96 }}
              aria-pressed={isSelected}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                backgroundColor: isSelected ? `${color}1C` : 'rgba(255,255,255,0.025)',
                borderColor: isSelected ? `${color}88` : 'rgba(255,255,255,0.09)',
                color: isSelected ? '#F3F2EE' : '#B8B5AD',
                boxShadow: isSelected ? `0 0 22px -8px ${color}99` : 'none',
              }}
            >
              <span
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isSelected ? color : 'transparent',
                  border: isSelected ? 'none' : `1.5px solid ${color}80`,
                }}
              >
                {isSelected && (
                  <Check className="h-2.5 w-2.5 text-[#10100F]" strokeWidth={3} />
                )}
              </span>
              <span>{entity.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* HiDPI 5-Axis Polar Radar Observatory Canvas + Axis Hover Tooltip */}
      <div
        ref={containerRef}
        onPointerMove={(e) => updateHoveredAxisFromClient(e.clientX, e.clientY)}
        onPointerDown={(e) => updateHoveredAxisFromClient(e.clientX, e.clientY)}
        onPointerLeave={() => setHoveredAxis(null)}
        className="relative mt-4 h-[300px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#10100F]/90 sm:h-[345px]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-crosshair"
          role="img"
          aria-label={`${lab.title} — ${activeEntities.map((e) => e.name).join(', ')}`}
        />

        {/* Subtle interactive axis tooltip anchored cleanly away from the hovered spoke */}
        <AnimatePresence>
          {hoveredAxis !== null && (
            <motion.div
              key={`tooltip-${hoveredAxis}`}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 2, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className={`pointer-events-none absolute top-2.5 z-10 max-w-[188px] rounded-2xl border border-white/[0.14] bg-[#141412]/92 px-3 py-2.5 shadow-xl backdrop-blur-xl sm:top-3 sm:max-w-[220px] ${
                hoveredAxis === 1 || hoveredAxis === 2
                  ? 'left-2.5 sm:left-3'
                  : 'right-2.5 sm:right-3'
              }`}
            >
              <div className="font-mono text-[10px] tracking-[0.08em] text-[#F3F2EE] uppercase">
                {lab.axes[hoveredAxis]}
              </div>
              <div className="mt-1.5 flex flex-col gap-1">
                {activeEntities.map((entity) => {
                  const score = entity.scores[hoveredAxis];
                  const color = ENTITY_COLORS[entity.id];
                  return (
                    <div
                      key={`tt-${entity.id}`}
                      className="flex items-center justify-between gap-3 text-[11px]"
                    >
                      <span className="flex min-w-0 items-center gap-1.5 truncate text-[#D6D3CB]">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate">{entity.name.split(' (')[0]}</span>
                      </span>
                      <span
                        className="shrink-0 font-mono font-semibold"
                        style={{ color }}
                      >
                        {score}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle bottom-left hint */}
        <div className="pointer-events-none absolute bottom-2 left-3 inline-flex items-center gap-1.5 font-mono text-[9.5px] text-[#8E8B82]">
          <Sparkles className="h-3 w-3 text-[var(--accent-a)]/75" strokeWidth={1.6} />
          <span>{hoverHint}</span>
        </div>
      </div>

      {/* Sleek Comparative Evidence Rows Below */}
      <div className="mt-5 flex flex-col">
        <AnimatePresence initial={false}>
          {activeEntities.map((entity: MindEntity) => {
            const color = ENTITY_COLORS[entity.id];
            return (
              <motion.article
                key={entity.id}
                layout={!reducedMotion}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={reducedMotion ? { duration: 0 } : SPATIAL_SPRING}
                className="border-t border-white/[0.08] py-4 first:pt-4 last:pb-1"
              >
                {/* Top identity + badge row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 12px ${color}`,
                      }}
                    />
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                      <h4 className="font-[var(--font-display)] text-sm font-medium text-[#F3F2EE] sm:text-[15px]">
                        {entity.name}
                      </h4>
                      <span className="font-mono text-[10px] text-[#8E8B82]">
                        {entity.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className="inline-flex self-start rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium sm:self-auto"
                    style={{
                      backgroundColor: `${color}15`,
                      borderColor: `${color}45`,
                      color,
                    }}
                  >
                    {entity.badge}
                  </span>
                </div>

                {/* 5-Axis Micro Score Strip */}
                <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
                  {entity.scores.map((val, axIdx) => {
                    const isAxisHov = hoveredAxis === axIdx;
                    return (
                      <button
                        key={`${entity.id}-ax-${axIdx}`}
                        type="button"
                        onMouseEnter={() => setHoveredAxis(axIdx)}
                        onMouseLeave={() => setHoveredAxis(null)}
                        onFocus={() => setHoveredAxis(axIdx)}
                        onBlur={() => setHoveredAxis(null)}
                        className={`flex cursor-pointer flex-col gap-1 rounded-lg px-1.5 py-1 text-left transition-colors ${
                          isAxisHov ? 'bg-white/[0.07]' : 'bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                        title={`${lab.axes[axIdx]}: ${val}/100`}
                      >
                        <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                          <span className="truncate text-[#8E8B82]">
                            {axIdx + 1}
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: isAxisHov ? '#F3F2EE' : color }}
                          >
                            {val}
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${val}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Summary & Peer-Reviewed Evidence */}
                <p className="mt-3 text-xs leading-relaxed text-[#D6D3CB] sm:text-[13px]">
                  {entity.summary}
                </p>
                <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-[#B8B5AD]">
                  <span className="mr-1.5 text-[#8E8B82]">{evidenceHeading}</span>
                  {entity.evidence}
                </p>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
