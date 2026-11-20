import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import type {
  EpilogueContent,
  Lang,
  MetaInfo,
  NavContent,
  ReferenceItem,
  UiLabels,
} from '../data/content';

export interface EpilogueProps {
  lang: Lang;
  epilogue: EpilogueContent;
  references: readonly ReferenceItem[];
  meta: MetaInfo;
  nav: NavContent;
  ui: UiLabels;
  onNavigate: (targetId: string) => void;
  reducedMotion: boolean;
}

export function Epilogue({
  lang,
  epilogue,
  references,
  meta,
  nav,
  ui,
  onNavigate,
  reducedMotion,
}: EpilogueProps) {
  const isRu = lang === 'ru';
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const filterOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const ref of references) {
      if (!map.has(ref.tag)) {
        map.set(ref.tag, isRu ? ref.tagRu : ref.tag);
      }
    }
    return Array.from(map.entries());
  }, [references, isRu]);

  const filteredRefs = useMemo(() => {
    if (selectedTag === 'ALL') return references;
    return references.filter((ref) => ref.tag === selectedTag);
  }, [references, selectedTag]);

  const revealProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-8% 0px' },
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div className="relative bg-[var(--bg-page)]">
      {/* ====================================================================
          CLOSING SYNTHESIS SECTION
         ==================================================================== */}
      <section
        id="epilogue"
        aria-labelledby="epilogue-title"
        className="relative scroll-mt-[84px] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-[1520px] px-4 sm:px-7 lg:px-10">
          <div className="hairline-accent mb-16" aria-hidden="true" />

          <motion.div
            {...revealProps}
            className="max-w-[780px]"
          >
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3 py-1 font-mono text-[0.66rem] font-semibold tracking-[0.12em] text-[var(--accent-a)] uppercase">
                {epilogue.plateCode}
              </span>
              <span className="font-mono text-[0.66rem] tracking-[0.14em] text-[var(--text-muted)] uppercase">
                {epilogue.eyebrow}
              </span>
            </div>

            <h2
              id="epilogue-title"
              className="kinetic-heading font-display font-semibold tracking-[-0.034em] leading-[1.08]"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.35rem)',
              }}
            >
              {epilogue.title}
            </h2>

            <p className="mt-6 max-w-[62ch] text-[1.04rem] leading-[1.78] font-normal text-[var(--text-secondary)] sm:text-[1.12rem]">
              {epilogue.body}
            </p>

            <p className="mt-5 font-mono text-[0.7rem] tracking-[0.06em] text-[var(--accent-a)]">
              {epilogue.plateCaption}
            </p>
          </motion.div>

          {/* 3-Column Synthesis Grid */}
          <motion.div
            {...revealProps}
            className="mt-14 grid grid-cols-1 gap-x-9 gap-y-8 md:grid-cols-3"
          >
            {epilogue.cards.map((card, idx) => (
              <div
                key={idx}
                className="flex flex-col border-t border-[var(--border-strong)] pt-5"
              >
                <span className="font-mono text-[0.66rem] font-semibold tracking-[0.14em] text-[var(--accent-a)]">
                  0{idx + 1}
                </span>
                <h3 className="mt-2 font-display text-[1.08rem] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[0.9rem] leading-[1.68] text-[var(--text-secondary)]">
                  {card.text}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====================================================================
          FILTERABLE BILINGUAL BIBLIOGRAPHY
         ==================================================================== */}
      <section
        id="references"
        aria-labelledby="references-title"
        className="relative scroll-mt-[84px] py-16 sm:py-24"
      >
        <div className="mx-auto max-w-[1520px] px-4 sm:px-7 lg:px-10">
          <div className="hairline mb-14" aria-hidden="true" />

          <motion.div
            {...revealProps}
            className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <span className="font-mono text-[0.66rem] font-semibold tracking-[0.16em] text-[var(--accent-a)] uppercase">
                {ui.sourceBadge}
              </span>
              <h2
                id="references-title"
                className="mt-2 font-display text-2xl font-semibold tracking-[-0.025em] text-[var(--text-primary)] sm:text-3xl"
              >
                {epilogue.referencesTitle}
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div
              role="group"
              aria-label={isRu ? 'Фильтр библиографии' : 'Bibliography filter'}
              className="flex flex-wrap gap-1.5"
            >
              <button
                type="button"
                onClick={() => setSelectedTag('ALL')}
                aria-pressed={selectedTag === 'ALL'}
                className={`cursor-pointer rounded-full px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.05em] transition-colors ${
                  selectedTag === 'ALL'
                    ? 'bg-[var(--text-primary)] font-semibold text-[var(--bg-page)]'
                    : 'border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isRu ? `Все (${references.length})` : `All (${references.length})`}
              </button>

              {filterOptions.map(([canonicalTag, localizedLabel]) => {
                const isSelected = selectedTag === canonicalTag;
                return (
                  <button
                    key={canonicalTag}
                    type="button"
                    onClick={() => setSelectedTag(canonicalTag)}
                    aria-pressed={isSelected}
                    className={`cursor-pointer rounded-full px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.05em] transition-colors ${
                      isSelected
                        ? 'bg-[var(--text-primary)] font-semibold text-[var(--bg-page)]'
                        : 'border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {localizedLabel}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Reference List */}
          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
            {filteredRefs.map((ref, idx) => (
              <article
                key={`${ref.year}-${ref.title}-${idx}`}
                className="flex flex-col border-t border-[var(--border-hairline)] pt-4"
              >
                <span className="font-mono text-[0.66rem] font-semibold tracking-[0.08em] text-[var(--accent-a)]">
                  {ref.year} · {isRu ? ref.tagRu : ref.tag}
                </span>

                <h3 className="mt-1.5 font-display text-[0.98rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--text-primary)]">
                  {ref.title}
                </h3>

                <p className="mt-1 text-[0.84rem] leading-relaxed text-[var(--text-secondary)]">
                  {ref.authors}
                </p>

                <p className="mt-auto pt-2 font-mono text-[0.68rem] leading-relaxed text-[var(--text-muted)]">
                  {isRu ? ref.venueRu : ref.venue}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          BIOTECH COLOPHON FOOTER
         ==================================================================== */}
      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)] py-9">
        <div className="mx-auto flex max-w-[1520px] flex-col items-start justify-between gap-5 px-4 sm:flex-row sm:items-center sm:px-7 lg:px-10">
          <p className="max-w-[60ch] text-[0.8rem] leading-relaxed text-[var(--text-secondary)]">
            {epilogue.footerNote}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-[0.66rem] tracking-[0.06em] text-[var(--text-muted)]">
              {meta.readingTime}
            </span>

            <button
              type="button"
              onClick={() => onNavigate('top')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-1.5 font-mono text-[0.66rem] font-medium tracking-[0.08em] text-[var(--text-primary)] uppercase transition-transform hover:-translate-y-0.5"
            >
              <ArrowUp className="h-3.5 w-3.5 text-[var(--accent-a)]" aria-hidden="true" />
              <span>{nav.jumpTop}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
