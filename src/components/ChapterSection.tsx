import { motion } from 'motion/react';
import { Expand } from 'lucide-react';
import {
  PLATE_ASSETS,
  type ChapterData,
  type ChapterId,
  type Lang,
  type UiLabels,
} from '../data/content';
import type { BrainTheoryId } from './ConsciousnessCanvas3D';
import {
  BrainAtlasLab,
  CogitateLab,
  MaryRoomLab,
  MindspaceLab,
  PciZapLab,
  PredictiveLab,
} from './labs';

export interface ChapterSectionProps {
  chapter: ChapterData;
  index: number;
  lang: Lang;
  ui: UiLabels;
  activeTheory: BrainTheoryId;
  onSelectTheory: (theory: BrainTheoryId) => void;
  predictivePrior: number;
  onPriorChange: (prior: number) => void;
  onFirePulse: (pciValue: number) => void;
  onOpenModal: (chapterId: ChapterId) => void;
  reducedMotion: boolean;
}

const CHAPTER_DIGITS = ['01', '02', '03', '04', '05', '06'] as const;

export function ChapterSection({
  chapter,
  index,
  lang,
  ui,
  activeTheory,
  onSelectTheory,
  predictivePrior,
  onPriorChange,
  onFirePulse,
  onOpenModal,
  reducedMotion,
}: ChapterSectionProps) {
  const isRu = lang === 'ru';
  const digit = CHAPTER_DIGITS[index] ?? chapter.plateId;

  const revealProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-8% 0px' },
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
      };

  const renderLab = () => {
    switch (chapter.id) {
      case 'ch1':
        return <MaryRoomLab lab={chapter.lab} ui={ui} lang={lang} />;
      case 'ch2':
        return (
          <BrainAtlasLab
            lab={chapter.lab}
            ui={ui}
            lang={lang}
            activeTheory={activeTheory}
            onSelectTheory={onSelectTheory}
          />
        );
      case 'ch3':
        return <CogitateLab lab={chapter.lab} ui={ui} lang={lang} />;
      case 'ch4':
        return (
          <PredictiveLab
            lab={chapter.lab}
            ui={ui}
            lang={lang}
            prior={predictivePrior}
            onPriorChange={onPriorChange}
          />
        );
      case 'ch5':
        return (
          <PciZapLab
            lab={chapter.lab}
            ui={ui}
            lang={lang}
            onFirePulse={onFirePulse}
          />
        );
      case 'ch6':
        return <MindspaceLab lab={chapter.lab} ui={ui} lang={lang} />;
    }
  };

  return (
    <article
      id={chapter.id}
      data-chapter={chapter.id}
      data-theme={chapter.theme}
      className="relative scroll-mt-20 py-16 sm:py-22"
    >
      {/* Top Architectural Hairline Divider */}
      <div className="hairline mb-14 sm:mb-16" aria-hidden="true" />

      {/* Clean Biotech Editorial Chapter Header */}
      <motion.header {...revealProps} className="mb-10 sm:mb-12">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-8 items-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-2.5 font-mono text-[0.82rem] font-semibold tracking-[0.06em] text-[var(--accent-a)] tabular-nums"
          >
            {digit}
          </span>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] tracking-[0.14em] uppercase">
            <span className="font-semibold text-[var(--accent-a)]">
              {chapter.eyebrow}
            </span>
          </div>
        </div>

        <h2
          className="kinetic-heading font-display font-semibold tracking-[-0.032em] leading-[1.12]"
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.55rem)',
          }}
        >
          {chapter.title}
        </h2>

        <p className="mt-5 max-w-[58ch] text-[1.05rem] leading-[1.74] font-normal text-[var(--text-secondary)] sm:text-[1.12rem]">
          {chapter.lead}
        </p>
      </motion.header>

      {/* Mobile / Tablet Inline Visual Card (< 1024px) */}
      <motion.figure
        {...revealProps}
        className="my-8 overflow-hidden rounded-2xl border border-white/10 bg-[#10100F] p-4 text-[#F3F2EE] lg:hidden"
      >
        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => onOpenModal(chapter.id)}
            aria-label={`${ui.zoomPlate}: ${chapter.plate.title}`}
            className="group relative block w-full max-w-[380px] cursor-zoom-in"
          >
            <img
              src={PLATE_ASSETS[chapter.id]}
              alt={`${chapter.plate.code} — ${chapter.plate.title}`}
              loading="lazy"
              decoding="async"
              className="artwork-blend mx-auto max-h-[320px] w-full object-contain"
            />
            <span className="absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#10100F]/90 px-3 py-1 font-mono text-[0.62rem] tracking-[0.08em] text-[#F3F2EE] uppercase">
              <Expand className="h-3 w-3 text-[var(--accent-a)]" aria-hidden="true" />
              {ui.zoomPlate}
            </span>
          </button>

          <figcaption className="mt-3 w-full border-t border-white/10 pt-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[0.64rem] font-semibold tracking-[0.12em] text-[var(--accent-a)] uppercase">
                {chapter.plate.code}
              </span>
              <span className="font-mono text-[0.62rem] text-[#8E8B82]">
                {chapter.plate.telemetryValue}
              </span>
            </div>
            <div className="mt-1 font-display text-[0.94rem] font-semibold text-[#F3F2EE]">
              {chapter.plate.title}
            </div>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-[#B8B5AD]">
              {chapter.plate.caption}
            </p>
          </figcaption>
        </div>
      </motion.figure>

      {/* Clean Distraction-Free Editorial Narrative Sections */}
      <div className="space-y-10">
        {chapter.sections.map((section, sIdx) => (
          <motion.section
            key={sIdx}
            {...revealProps}
            className="max-w-[60ch] space-y-3.5"
          >
            <h3 className="font-display text-[1.18rem] font-semibold tracking-[-0.022em] leading-[1.3] text-[var(--text-primary)] sm:text-[1.32rem]">
              {section.heading}
            </h3>

            <p className="text-[1.01rem] leading-[1.78] font-normal text-[var(--text-secondary)]">
              {section.body}
            </p>

            {/* Biotech Thesis Callout */}
            {section.callout && (
              <aside className="relative mt-5 rounded-r-xl border-l-2 border-[var(--accent-a)] bg-[var(--bg-subtle)] py-3.5 pr-4 pl-4 sm:pl-5">
                <span className="mb-1 block font-mono text-[0.63rem] font-semibold tracking-[0.14em] text-[var(--accent-a)] uppercase">
                  {isRu ? 'КЛЮЧЕВОЙ ТЕЗИС' : 'KEY SIGNAL'}
                </span>
                <p className="text-[0.93rem] leading-[1.68] text-[var(--text-primary)]">
                  {section.callout}
                </p>
              </aside>
            )}
          </motion.section>
        ))}
      </div>

      {/* 2-Column Biotech Proof Matrix */}
      <motion.div
        {...revealProps}
        className="mt-12 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2"
      >
        {chapter.keyCards.map((card, kIdx) => (
          <div
            key={kIdx}
            className="flex flex-col border-t border-[var(--border-strong)] pt-4"
          >
            <span className="font-mono text-[0.63rem] font-semibold tracking-[0.12em] text-[var(--accent-a)] uppercase">
              {card.tag}
            </span>
            <h4 className="mt-1.5 font-display text-[0.98rem] font-semibold tracking-[-0.018em] leading-snug text-[var(--text-primary)]">
              {card.title}
            </h4>
            <p className="mt-1.5 text-[0.86rem] leading-[1.62] text-[var(--text-secondary)]">
              {card.detail}
            </p>
            <span className="mt-auto pt-2.5 font-mono text-[0.64rem] text-[var(--text-muted)]">
              {card.citation}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Interactive Laboratory Anchor */}
      <motion.div
        {...revealProps}
        id={`lab-${chapter.id}`}
        className="mt-14 scroll-mt-20"
      >
        {renderLab()}
      </motion.div>

      {/* Editorial Pull-Quote */}
      <motion.figure
        {...revealProps}
        className="relative mt-14 max-w-[58ch] border-l-2 border-[var(--border-strong)] py-1 pl-5 sm:pl-6"
      >
        <blockquote className="font-display text-[1.06rem] font-normal italic leading-[1.58] tracking-[-0.01em] text-[var(--text-primary)] sm:text-[1.18rem]">
          “{chapter.quote.text}”
        </blockquote>
        <figcaption className="mt-3 font-mono text-[0.68rem] tracking-[0.06em] text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--accent-a)]">
            {chapter.quote.author}
          </span>
          {' · '}
          <span>{chapter.quote.work}</span>
        </figcaption>
      </motion.figure>
    </article>
  );
}
