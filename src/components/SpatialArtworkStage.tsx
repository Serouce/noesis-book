import { useEffect, useState, type MutableRefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, Brain, Cpu, Expand, Eye, Network, Scissors } from 'lucide-react';
import {
  PLATE_ASSETS,
  type ChapterData,
  type ChapterId,
  type Lang,
  type NavContent,
  type UiLabels,
} from '../data/content';
import {
  ConsciousnessCanvas3D,
  type BrainTheoryId,
  type HoveredAnatomyInfo,
  type MriSliceAxis,
  type ObservatoryScaleMode,
  type SceneChapterId,
} from './ConsciousnessCanvas3D';
import type { VisualMode } from './Header';

export interface SpatialArtworkStageProps {
  lang: Lang;
  chapters: readonly ChapterData[];
  activeChapter: ChapterData;
  activeSceneChapter: SceneChapterId;
  activeTheory: BrainTheoryId;
  pciPulseNonce: number;
  pciPulseValue: number;
  predictivePrior: number;
  scrollProgress: MutableRefObject<number>;
  visualMode: VisualMode;
  onChangeVisualMode: (mode: VisualMode) => void;
  onSelectChapter: (chapterId: ChapterId) => void;
  onOpenModal: (chapterId: ChapterId) => void;
  nav: NavContent;
  ui: UiLabels;
  reducedMotion: boolean;
}

const CHAPTER_DIGITS: Record<ChapterId, string> = {
  ch1: '01',
  ch2: '02',
  ch3: '03',
  ch4: '04',
  ch5: '05',
  ch6: '06',
};

export function SpatialArtworkStage({
  lang,
  chapters,
  activeChapter,
  activeSceneChapter,
  activeTheory,
  pciPulseNonce,
  pciPulseValue,
  predictivePrior,
  scrollProgress,
  visualMode,
  onChangeVisualMode,
  onSelectChapter,
  onOpenModal,
  ui,
  reducedMotion,
}: SpatialArtworkStageProps) {
  const isRu = lang === 'ru';
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(min-width: 1024px)').matches
      : true,
  );
  const [hoveredAnatomy, setHoveredAnatomy] = useState<HoveredAnatomyInfo | null>(null);

  // Interactive 3D MRI Slicer Controls State
  const [sliceAxis, setSliceAxis] = useState<MriSliceAxis>('sagittal');
  const [sliceOffset, setSliceOffset] = useState<number>(0.08);

  const isArtPlateMode = visualMode === 'art';
  const isSliceMode = visualMode === 'slice';
  const scaleMode: ObservatoryScaleMode =
    visualMode === 'art' ? 'auto' : visualMode;

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const effectiveScaleBadge = (() => {
    if (isArtPlateMode) {
      return isRu ? '3D-СКУЛЬПТУРА ГЛАВЫ' : 'CHAPTER 3D SCULPTURE';
    }
    if (isSliceMode) {
      return isRu
        ? 'МРТ-ТОМОГРАФИЯ 3D · ИНТЕРАКТИВНЫЙ ЛАЗЕРНЫЙ СРЕЗ'
        : '3D MRI TOMOGRAPHY · INTERACTIVE LASER CROSS-SECTION';
    }
    const mode =
      scaleMode === 'auto'
        ? activeSceneChapter === 'ch4'
          ? 'neurons'
          : activeSceneChapter === 'ch6' || activeSceneChapter === 'epilogue'
            ? 'connectome'
            : 'macro'
        : scaleMode;

    if (mode === 'neurons') {
      return isRu
        ? 'ДВУХФОТОННАЯ МИКРОСКОПИЯ · 3D ПИРАМИДАЛЬНЫЕ НЕЙРОНЫ (СЛОИ I–VI)'
        : 'TWO-PHOTON CONFOCAL · 3D PYRAMIDAL NEURONS (LAYERS I–VI)';
    }
    if (mode === 'connectome') {
      return isRu
        ? 'DTI-ТРАКТОГРАФИЯ · 184 ВОЛОКНА БЕЛОГО ВЕЩЕСТВА И ТАЛАМУС'
        : 'DTI TRACTOGRAPHY · 184 WHITE-MATTER FIBERS & THALAMUS';
    }
    return isRu
      ? 'ОПТИЧЕСКИЙ РЕНТГЕН (FRESNEL X-RAY) · 437 СТРУКТУР + DTI'
      : 'OPTICAL FRESNEL X-RAY · 437 STRUCTURES + DTI FIBERS';
  })();

  const modeButtons: ReadonlyArray<{
    id: VisualMode;
    labelRu: string;
    labelEn: string;
    icon: typeof Brain;
  }> = [
    { id: 'auto', labelRu: 'Авто', labelEn: 'Auto', icon: Activity },
    { id: 'macro', labelRu: '3D Мозг', labelEn: '3D Brain', icon: Brain },
    { id: 'slice', labelRu: 'МРТ-Срез 3D', labelEn: '3D MRI Slice', icon: Scissors },
    { id: 'neurons', labelRu: '3D Нейроны', labelEn: '3D Neurons', icon: Cpu },
    { id: 'connectome', labelRu: 'DTI-Тракты', labelEn: 'DTI Tracts', icon: Network },
    { id: 'art', labelRu: 'Арт', labelEn: 'Art', icon: Eye },
  ];

  const axisButtons: ReadonlyArray<{
    id: MriSliceAxis;
    labelRu: string;
    labelEn: string;
  }> = [
    { id: 'sagittal', labelRu: 'Сагиттальный (X)', labelEn: 'Sagittal (X)' },
    { id: 'axial', labelRu: 'Аксиальный (Y)', labelEn: 'Axial (Y)' },
    { id: 'coronal', labelRu: 'Корональный (Z)', labelEn: 'Coronal (Z)' },
  ];

  return (
    <aside
      aria-label={ui.ariaPlatesColumn}
      className="hidden lg:block lg:self-stretch"
    >
      <div className="sticky top-[74px] flex h-[calc(100svh-90px)] flex-col">
        {/* Dedicated Biotech 3D Neuro-Observatory Pod */}
        <div className="observatory-pod observatory-grid-bg relative flex flex-1 flex-col justify-between">
          {/* Top Clinical Telemetry Bar inside Observatory */}
          <div className="relative z-20 flex flex-col gap-2.5 border-b border-white/[0.08] bg-[#10100F]/90 px-4 py-3 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-[var(--accent-a)]"
                />
                <span className="font-mono text-[0.62rem] font-medium tracking-[0.1em] text-[#F3F2EE] uppercase">
                  {effectiveScaleBadge}
                </span>
              </div>

              {/* Interactive Scale Mode Switcher */}
              <div
                role="group"
                aria-label={isRu ? 'Режим 3D-обсерватории' : '3D Observatory mode'}
                className="inline-flex flex-wrap items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-0.5"
              >
                {modeButtons.map((btn) => {
                  const Icon = btn.icon;
                  const isSelected = visualMode === btn.id;
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => onChangeVisualMode(btn.id)}
                      aria-pressed={isSelected}
                      className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[0.61rem] font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#F3F2EE] text-[#0D0D0C] font-semibold'
                          : 'text-[#B8B5AD] hover:text-[#F3F2EE]'
                      }`}
                    >
                      <Icon className="h-3 w-3" aria-hidden="true" />
                      <span>{isRu ? btn.labelRu : btn.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive 3D MRI Laser Slicer Controls (Shown when "МРТ-Срез 3D" is selected!) */}
            {isSliceMode && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2AB3A6]/35 bg-[#161817] px-3 py-2">
                <div className="flex items-center gap-1">
                  {axisButtons.map((ax) => {
                    const active = sliceAxis === ax.id;
                    return (
                      <button
                        key={ax.id}
                        type="button"
                        onClick={() => setSliceAxis(ax.id)}
                        aria-pressed={active}
                        className={`cursor-pointer rounded-lg px-2 py-1 font-mono text-[0.61rem] transition-colors ${
                          active
                            ? 'bg-[#2AB3A6] font-semibold text-[#0D0D0C]'
                            : 'text-[#B8B5AD] hover:text-white'
                        }`}
                      >
                        {isRu ? ax.labelRu : ax.labelEn}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-1 items-center gap-2.5 min-w-[180px]">
                  <span className="font-mono text-[0.61rem] text-[#2AB3A6] whitespace-nowrap">
                    {isRu ? 'Глубина среза:' : 'Slice depth:'}{' '}
                    {Math.round(sliceOffset * 100)}%
                  </span>
                  <input
                    type="range"
                    min={-85}
                    max={85}
                    value={Math.round(sliceOffset * 100)}
                    onChange={(e) => setSliceOffset(Number(e.target.value) / 100)}
                    aria-label={isRu ? 'Глубина 3D МРТ-среза' : '3D MRI slice depth'}
                    className="optical-slider flex-1"
                    style={
                      {
                        '--slider-fill': `${((sliceOffset + 0.85) / 1.7) * 100}%`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center Viewport */}
          <div className="relative flex-1 overflow-hidden">
            {!isArtPlateMode ? (
              <div className="h-full w-full">
                {isDesktop && (
                  <ConsciousnessCanvas3D
                    scrollProgress={scrollProgress}
                    activeChapter={activeSceneChapter}
                    activeTheory={activeTheory}
                    pciPulseNonce={pciPulseNonce}
                    pciPulseValue={pciPulseValue}
                    predictivePrior={predictivePrior}
                    reducedMotion={reducedMotion}
                    scaleMode={scaleMode}
                    sliceAxis={sliceAxis}
                    sliceOffset={sliceOffset}
                    onHoverAnatomy={setHoveredAnatomy}
                  />
                )}
              </div>
            ) : (
              <div className="relative flex h-full w-full items-center justify-center p-6">
                <button
                  type="button"
                  onClick={() => onOpenModal(activeChapter.id)}
                  aria-label={`${ui.zoomPlate}: ${activeChapter.plate.title}`}
                  className="group relative flex h-full w-full cursor-zoom-in items-center justify-center"
                >
                  <AnimatePresence initial={false}>
                    <motion.img
                      key={activeChapter.id}
                      src={PLATE_ASSETS[activeChapter.id]}
                      alt={`${activeChapter.plate.code} — ${activeChapter.plate.title}`}
                      decoding="async"
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 1.02 }}
                      transition={{ duration: reducedMotion ? 0 : 0.35 }}
                      className="artwork-blend absolute inset-0 m-auto max-h-[88%] max-w-[88%] object-contain"
                    />
                  </AnimatePresence>
                </button>
              </div>
            )}

            {/* Live Anatomical Structure Hover Readout Pill */}
            <div className="pointer-events-none absolute inset-x-4 bottom-3 z-20 flex items-center justify-between gap-2">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-[#10100F]/90 px-3 py-1 font-mono text-[0.64rem] text-[#B8B5AD] backdrop-blur-md">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-b)]"
                  aria-hidden="true"
                />
                {hoveredAnatomy && !isArtPlateMode ? (
                  <span className="truncate text-[#F3F2EE]">
                    <strong className="font-semibold text-[var(--accent-b)]">
                      {hoveredAnatomy.label}
                    </strong>
                    {' · '}
                    <span className="text-[#B8B5AD]">{hoveredAnatomy.region}</span>
                  </span>
                ) : (
                  <span className="truncate">
                    {isArtPlateMode
                      ? isRu
                        ? 'Нажмите на 3D-скульптуру для увеличения'
                        : 'Click sculpture to expand fullscreen'
                      : isSliceMode
                        ? isRu
                          ? 'Двигайте ползунок сверху для реального 3D МРТ-среза мозга'
                          : 'Drag the top slider to slice through the 3D brain in real time'
                        : isRu
                          ? 'Вращайте мышью (360°) · Наведите на кору или нейрон для анатомии'
                          : 'Drag to orbit (360°) · Hover cortex or neuron for anatomical ID'}
                  </span>
                )}
              </div>

              {isArtPlateMode && (
                <button
                  type="button"
                  onClick={() => onOpenModal(activeChapter.id)}
                  aria-label={ui.zoomPlate}
                  title={ui.zoomPlate}
                  className="pointer-events-auto inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#10100F]/90 text-[#F3F2EE] transition-colors hover:border-white/30"
                >
                  <Expand className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Observatory Footer */}
          <div className="relative z-20 border-t border-white/[0.08] bg-[#10100F]/95 px-5 py-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-[var(--accent-a)] uppercase">
                  {activeChapter.plate.code}
                </span>
                <span aria-hidden="true" className="text-[#8E8B82]">
                  ·
                </span>
                <span className="font-mono text-[0.63rem] text-[#8E8B82]">
                  {CHAPTER_DIGITS[activeChapter.id]} / 06
                </span>
              </div>

              <div
                id="plate-dots"
                role="navigation"
                aria-label={ui.ariaPlateDots}
                className="inline-flex items-center gap-1.5"
              >
                {chapters.map((ch) => {
                  const isActive = ch.id === activeChapter.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => onSelectChapter(ch.id)}
                      aria-current={isActive ? 'step' : undefined}
                      aria-label={`${ch.plate.code}: ${ch.plate.title}`}
                      title={`${ch.plate.code} — ${ch.plate.title}`}
                      className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-6 bg-[var(--accent-a)]'
                          : 'w-2 bg-white/20 hover:bg-white/45'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-1.5 flex flex-col gap-0.5">
              <h3 className="font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-[#F3F2EE]">
                {activeChapter.plate.title}
              </h3>
              <p className="line-clamp-2 text-[0.78rem] leading-[1.5] text-[#B8B5AD]">
                {activeChapter.plate.caption}
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-2 font-mono text-[0.63rem]">
              <span className="text-[#8E8B82]">
                {activeChapter.plate.telemetryLabel}
              </span>
              <span className="text-[#D6D3CB]">
                {activeChapter.plate.telemetryValue}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
