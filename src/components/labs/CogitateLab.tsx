import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, ChevronDown, FlaskConical, Radio, Scan } from 'lucide-react';
import type {
  ChapterCh3,
  CogitateTestId,
  CogitateVerdict,
  Lang,
  LocalizedContent,
} from '../../data/content';
import {
  SPATIAL_SPRING,
  handleRovingTabKeyDown,
  usePrefersReducedMotion,
} from './labUtils';

export interface CogitateLabProps {
  lab: ChapterCh3['lab'];
  ui: LocalizedContent['ui'];
  lang: Lang;
}

interface ModalityMeta {
  index: 0 | 1 | 2;
  resolutionEn: string;
  resolutionRu: string;
  roleEn: string;
  roleRu: string;
  perTestEn: Record<CogitateTestId, string>;
  perTestRu: Record<CogitateTestId, string>;
}

const MODALITY_META: readonly ModalityMeta[] = [
  {
    index: 0,
    resolutionEn: 'Millimeter Spatial · ~1–2 s BOLD · Whole-Brain Mapping',
    resolutionRu: 'Миллиметровая локализация · ~1–2 с BOLD · Вся кора',
    roleEn:
      'Pinpoints anatomical specificity across posterior visual-ventrotemporal regions versus inferior frontal and parietal hubs without relying on active motor reports.',
    roleRu:
      'Точно локализует активность в задней зрительно-височной коре против нижней лобной и теменной областей без примеси двигательного отчёта.',
    perTestEn: {
      decoding:
        'fMRI lens: multivariate pattern decoding cleanly separated category and orientation in posterior occipitotemporal ROIs, whereas prefrontal voxels showed weak orientation sensitivity.',
      synchrony:
        'fMRI lens: steady-state functional connectivity failed to reveal the predicted sustained, content-selective binding across posterior sensory hierarchies.',
      ignition:
        'fMRI lens: hemodynamic signals confirmed sustained posterior duration tracking, though sluggish BOLD dynamics require MEG/iEEG to resolve crisp offset timing.',
    },
    perTestRu: {
      decoding:
        'Фокус фМРТ: многомерное декодирование чётко различало категорию и ориентацию в задних зрительно-височных зонах при слабой чувствительности ПФК к ориентации.',
      synchrony:
        'Фокус фМРТ: анализ функциональной связности не выявил предсказанного устойчивого содержательного связывания внутри задней коры.',
      ignition:
        'Фокус фМРТ: гемодинамика подтвердила длительное отслеживание стимула в задней коре, тогда как точное время его исчезновения уточняют МЭГ и иЭЭГ.',
    },
  },
  {
    index: 1,
    resolutionEn: 'Millisecond Temporal · Whole-Head Neuromagnetic Tracking',
    resolutionRu: 'Миллисекундная точность · Магнитоэнцефалография всей коры',
    roleEn:
      'Captures fast onset/offset dynamics, temporal generalization of stimulus duration, and cross-regional oscillatory synchrony across the intact human brain.',
    roleRu:
      'Фиксирует быструю динамику появления и исчезновения образа, временное удержание длительности и межзонную осцилляторную синхронизацию.',
    perTestEn: {
      decoding:
        'MEG lens: temporal generalization matrices stayed stably decodable throughout the full stimulus duration over posterior sensors.',
      synchrony:
        'MEG lens: inter-areal coherence showed only brief early bursts rather than the sustained intra-posterior synchronization predicted by IIT.',
      ignition:
        'MEG lens: crisp stimulus-onset responses emerged broadly, yet the signature fronto-parietal offset ignition burst did not materialize when stimuli vanished.',
    },
    perTestRu: {
      decoding:
        'Фокус МЭГ: матрицы временного обобщения стабильно декодировали содержание на всём протяжении показа над задними сенсорами.',
      synchrony:
        'Фокус МЭГ: межзонная когерентность показала лишь краткие ранние всплески вместо устойчивой задней синхронизации по прогнозу IIT.',
      ignition:
        'Фокус МЭГ: отчётливый отклик возникал при появлении образа, но ожидаемой лобно-теменной вспышки при исчезновении (offset ignition) не произошло.',
    },
  },
  {
    index: 2,
    resolutionEn: 'Direct Cortical Electrodes · Millimeter × Millisecond Precision',
    resolutionRu: 'Прямые корковые электроды · Миллиметры × миллисекунды',
    roleEn:
      'Records high-gamma local field potentials directly from human cortex in neurosurgical cohorts, eliminating skull distortion to adjudicate posterior vs. prefrontal signals.',
    roleRu:
      'Регистрирует высокочастотную гамма-активность непосредственно с коры у нейрохирургических пациентов без искажений черепа.',
    perTestEn: {
      decoding:
        'iEEG lens: direct high-gamma recordings in ventrotemporal cortex tracked exact category, orientation, and duration; prefrontal contacts tracked category narrowly.',
      synchrony:
        'iEEG lens: phase and amplitude coupling between early visual and high-level ventrotemporal contacts remained transient rather than continuously sustained.',
      ignition:
        'iEEG lens: prefrontal contacts showed no consistent broadband offset ignition wave, directly challenging GNWT’s workspace-update prediction.',
    },
    perTestRu: {
      decoding:
        'Фокус иЭЭГ: прямые высокочастотные записи в вентротемпоральной коре точно считывали категорию, ориентацию и длительность; лобные контакты — лишь узко категорию.',
      synchrony:
        'Фокус иЭЭГ: фазовая и амплитудная связность между ранними зрительными и вентротемпоральными электродами оставалась кратковременной.',
      ignition:
        'Фокус иЭЭГ: префронтальные электроды не зафиксировали устойчивой вспышки при исчезновении стимула, что прямо оспорило прогноз GNWT.',
    },
  },
];

const VERDICT_STYLES: Record<
  CogitateVerdict,
  {
    dot: string;
    glow: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
  }
> = {
  supported: {
    dot: '#2AB3A6',
    glow: '0 0 10px rgba(42, 179, 166, 0.75)',
    badgeBg: 'rgba(42, 179, 166, 0.12)',
    badgeBorder: 'rgba(42, 179, 166, 0.34)',
    badgeText: '#6AD5CB',
  },
  partial: {
    dot: '#D99B4E',
    glow: '0 0 10px rgba(217, 155, 78, 0.72)',
    badgeBg: 'rgba(217, 155, 78, 0.12)',
    badgeBorder: 'rgba(217, 155, 78, 0.34)',
    badgeText: '#EFC288',
  },
  challenged: {
    dot: '#E05A47',
    glow: '0 0 10px rgba(224, 90, 71, 0.75)',
    badgeBg: 'rgba(224, 90, 71, 0.12)',
    badgeBorder: 'rgba(224, 90, 71, 0.36)',
    badgeText: '#F29A8E',
  },
};

export function CogitateLab({ lab, ui, lang }: CogitateLabProps) {
  const [activeModality, setActiveModality] = useState<0 | 1 | 2>(0);
  const [expandedTestId, setExpandedTestId] = useState<CogitateTestId | null>('decoding');
  const modalityRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const modalityMeta = MODALITY_META[activeModality];
  const modalityIcons = [Scan, Radio, Activity] as const;

  const modalityAriaLabel =
    lang === 'ru'
      ? 'Методы нейровизуализации COGITATE'
      : 'COGITATE neuroimaging modalities';

  const legendItems: ReadonlyArray<{ key: CogitateVerdict; label: string }> = [
    { key: 'supported', label: lang === 'ru' ? 'Подтверждено' : 'Supported' },
    { key: 'partial', label: lang === 'ru' ? 'Частично' : 'Partial' },
    { key: 'challenged', label: lang === 'ru' ? 'Оспорено' : 'Challenged' },
  ];

  const toggleTest = (id: CogitateTestId) => {
    setExpandedTestId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-7"
      aria-label={lab.title}
    >
      {/* Subtle surgical terracotta spatial aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(224, 90, 71, 0.20) 0%, transparent 70%)',
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
            {lab.subtitle}
          </span>
        </div>

        <h3 className="font-[var(--font-display)] text-lg font-medium tracking-[-0.025em] text-[#F3F2EE] sm:text-2xl">
          {lab.title}
        </h3>
        <p className="max-w-3xl text-sm leading-relaxed text-[#B8B5AD]">
          {lab.instruction}
        </p>
      </div>

      <hr className="hairline my-5" />

      {/* Modality Selector Pill Bar + Scientific Role Explanation */}
      <div className="flex flex-col gap-3">
        <div
          role="tablist"
          aria-label={modalityAriaLabel}
          className="inline-flex w-fit flex-wrap items-center gap-1 rounded-full border border-white/[0.09] bg-white/[0.03] p-1"
        >
          {lab.modalities.map((label, idx) => {
            const modIdx = idx as 0 | 1 | 2;
            const isSelected = activeModality === modIdx;
            const Icon = modalityIcons[modIdx];
            return (
              <button
                key={`cogitate-mod-${modIdx}`}
                ref={(el) => {
                  modalityRefs.current[modIdx] = el;
                }}
                type="button"
                role="tab"
                id={`cogitate-mod-tab-${modIdx}`}
                aria-selected={isSelected}
                aria-controls="cogitate-mod-panel"
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveModality(modIdx)}
                onKeyDown={(e) =>
                  handleRovingTabKeyDown(
                    e,
                    [0, 1, 2] as const,
                    modIdx,
                    (next) => setActiveModality(next),
                    (nextIdx) => modalityRefs.current[nextIdx]?.focus()
                  )
                }
                className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs font-medium transition-colors ${
                  isSelected
                    ? 'text-[#F3F2EE]'
                    : 'text-[#B8B5AD] hover:text-[#F3F2EE]'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="cogitate-modality-pill"
                    transition={reducedMotion ? { duration: 0 } : SPATIAL_SPRING}
                    className="pointer-events-none absolute inset-0 rounded-full border border-white/20 bg-white/[0.10] shadow-[0_0_20px_-6px_var(--accent-glow)]"
                  />
                )}
                <Icon className="relative z-10 h-3.5 w-3.5 text-[var(--accent-a)]" strokeWidth={1.7} />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        <div
          id="cogitate-mod-panel"
          role="tabpanel"
          aria-labelledby={`cogitate-mod-tab-${activeModality}`}
          className="flex flex-col gap-1.5"
        >
          <span className="font-mono text-[10px] tracking-[0.08em] text-[#B8B5AD]">
            {lang === 'ru' ? modalityMeta.resolutionRu : modalityMeta.resolutionEn}
          </span>

          <AnimatePresence mode="wait">
            <motion.p
              key={`mod-role-${activeModality}`}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
              transition={{ duration: 0.18 }}
              className="text-xs leading-relaxed text-[#D6D3CB] sm:text-[13px]"
            >
              {lang === 'ru' ? modalityMeta.roleRu : modalityMeta.roleEn}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <hr className="hairline my-5" />

      {/* Crisp Adversarial Scorecard Strip (NEVER "3/3" — strictly `${ui.cogitateTestsLabel}`) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
          {/* IIT 4.0 Row */}
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-medium text-[#F3F2EE]">
              IIT 4.0 · {ui.cogitateTestsLabel}
            </span>
            <div className="flex items-center gap-1.5">
              {lab.tests.map((t) => {
                const st = VERDICT_STYLES[t.verdictIit];
                return (
                  <button
                    key={`score-iit-${t.id}`}
                    type="button"
                    onClick={() => setExpandedTestId(t.id)}
                    title={`${t.title} — IIT 4.0: ${t.verdictLabelIit}`}
                    aria-label={`${t.title} — IIT 4.0: ${t.verdictLabelIit}`}
                    className="h-3 w-3 cursor-pointer rounded-full transition-transform hover:scale-125"
                    style={{ backgroundColor: st.dot, boxShadow: st.glow }}
                  />
                );
              })}
            </div>
          </div>

          {/* GNWT Row */}
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-medium text-[#F3F2EE]">
              GNWT · {ui.cogitateTestsLabel}
            </span>
            <div className="flex items-center gap-1.5">
              {lab.tests.map((t) => {
                const st = VERDICT_STYLES[t.verdictGnwt];
                return (
                  <button
                    key={`score-gnwt-${t.id}`}
                    type="button"
                    onClick={() => setExpandedTestId(t.id)}
                    title={`${t.title} — GNWT: ${t.verdictLabelGnwt}`}
                    aria-label={`${t.title} — GNWT: ${t.verdictLabelGnwt}`}
                    className="h-3 w-3 cursor-pointer rounded-full transition-transform hover:scale-125"
                    style={{ backgroundColor: st.dot, boxShadow: st.glow }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Semantic Legend */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-[#B8B5AD]">
          {legendItems.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: VERDICT_STYLES[item.key].dot }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* 3 Adversarial Test Rows */}
      <div className="mt-5 flex flex-col">
        {lab.tests.map((test) => {
          const isOpen = expandedTestId === test.id;
          const iitSt = VERDICT_STYLES[test.verdictIit];
          const gnwtSt = VERDICT_STYLES[test.verdictGnwt];
          const modalityInsight =
            lang === 'ru'
              ? modalityMeta.perTestRu[test.id]
              : modalityMeta.perTestEn[test.id];

          return (
            <article
              key={test.id}
              className="border-t border-white/[0.08] py-4 first:pt-4 last:pb-1"
            >
              {/* Test Row Header */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                <h4 className="font-[var(--font-display)] text-sm font-medium tracking-[-0.015em] text-[#F3F2EE] sm:text-[15px]">
                  {test.title}
                </h4>

                {/* Semantic Verdict Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium"
                    style={{
                      backgroundColor: iitSt.badgeBg,
                      borderColor: iitSt.badgeBorder,
                      color: iitSt.badgeText,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: iitSt.dot }}
                    />
                    IIT 4.0: {test.verdictLabelIit}
                  </span>

                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium"
                    style={{
                      backgroundColor: gnwtSt.badgeBg,
                      borderColor: gnwtSt.badgeBorder,
                      color: gnwtSt.badgeText,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: gnwtSt.dot }}
                    />
                    GNWT: {test.verdictLabelGnwt}
                  </span>
                </div>
              </div>

              {/* Side-by-side Preregistered Predictions */}
              <div className="mt-3.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border-l border-[#2AB3A6]/40 pl-3">
                  <div className="font-mono text-[10px] tracking-[0.12em] text-[#2AB3A6] uppercase">
                    {ui.predictionIit}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#B8B5AD]">
                    {test.iitPred}
                  </p>
                </div>

                <div className="border-l border-[#E05A47]/40 pl-3">
                  <div className="font-mono text-[10px] tracking-[0.12em] text-[#E05A47] uppercase">
                    {ui.predictionGnwt}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#B8B5AD]">
                    {test.gnwtPred}
                  </p>
                </div>
              </div>

              {/* Empirical Finding Hairline Row */}
              <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-3xl">
                  <div className="font-mono text-[10px] tracking-[0.12em] text-[#D6D3CB] uppercase">
                    {ui.empiricalResult}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#F3F2EE] sm:text-[13px]">
                    {test.finding}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleTest(test.id)}
                  aria-expanded={isOpen}
                  aria-controls={`cogitate-drawer-${test.id}`}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-full border border-white/[0.10] bg-white/[0.03] px-3 py-1 font-mono text-[10px] tracking-[0.08em] text-[#D6D3CB] uppercase transition-colors hover:border-white/25 hover:bg-white/[0.07] hover:text-[#F3F2EE] sm:self-end"
                >
                  <FlaskConical className="h-3 w-3 text-[var(--accent-a)]" strokeWidth={1.7} />
                  <span>
                    {isOpen
                      ? lang === 'ru'
                        ? 'Скрыть разбор'
                        : 'Hide Analysis'
                      : lang === 'ru'
                        ? 'Глубокий разбор'
                        : 'Deep Analysis'}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    strokeWidth={1.75}
                  />
                </button>
              </div>

              {/* Smooth Expandable Deep-Analysis Drawer */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`drawer-${test.id}`}
                    id={`cogitate-drawer-${test.id}`}
                    initial={reducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3.5 flex flex-col gap-2.5 border-t border-white/[0.06] pt-3.5">
                      <p className="text-xs leading-relaxed text-[#D6D3CB] sm:text-[13px]">
                        {test.detail}
                      </p>
                      <div className="border-l border-[var(--accent-a)]/55 pl-3 font-mono text-[11px] leading-relaxed text-[#B8B5AD]">
                        <span className="mr-1.5 text-[var(--accent-a)]">
                          [{lab.modalities[activeModality]}]
                        </span>
                        {modalityInsight}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </section>
  );
}
