import { motion } from 'motion/react';
import { ArrowDownRight, FlaskConical, Sparkles } from 'lucide-react';
import type { HeroContent, Lang, MetaInfo, NavContent, UiLabels } from '../data/content';

export interface HeroProps {
  lang: Lang;
  hero: HeroContent;
  meta: MetaInfo;
  nav: NavContent;
  ui: UiLabels;
  onNavigate: (targetId: string) => void;
  reducedMotion: boolean;
}

const STAT_ACCENTS = [
  'text-[#E05A47]',
  'text-[#2AB3A6]',
  'text-[#D99B4E]',
  'text-[var(--text-primary)]',
];

export function Hero({
  lang,
  hero,
  meta,
  ui,
  onNavigate,
  reducedMotion,
}: HeroProps) {
  const ease = [0.22, 1, 0.36, 1] as const;
  const isRu = lang === 'ru';

  const fadeUp = (_delay: number) => ({});

  return (
    <section
      id="top"
      aria-labelledby="hero-title-heading"
      className="relative flex min-h-[calc(100svh-76px)] flex-col justify-between pt-8 pb-14 sm:pt-12 sm:pb-16"
    >
      {/* Pure Matte Editorial Reading Zone — ZERO 3D Particles Behind Text! */}
      <div className="my-auto">
        {/* Biotech Clinical Specification Badge */}
        <motion.div
          {...fadeUp(0.04)}
          className="mb-6 flex flex-wrap items-center gap-2.5"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3 py-1 font-mono text-[0.66rem] font-medium tracking-[0.1em] text-[var(--text-primary)] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-a)]" aria-hidden="true" />
            {isRu ? 'Z-Anatomy 3D · 437 структур + Нейроны' : 'Z-Anatomy 3D · 437 Structures + Neurons'}
          </span>

          <span className="font-mono text-[0.66rem] tracking-[0.14em] text-[var(--text-muted)] uppercase">
            {hero.eyebrow}
          </span>
        </motion.div>

        {/* Clean Authoritative Inter Display Title (Isomorphic Labs / Arc Institute style) */}
        <motion.h1
          id="hero-title-heading"
          {...fadeUp(0.1)}
          className="font-display font-semibold tracking-[-0.036em] leading-[1.06] text-balance"
          style={{
            fontSize: 'clamp(2.25rem, 4.2vw, 3.85rem)',
          }}
        >
          <span className="block text-[var(--text-primary)]">{hero.title}</span>
          <span className="mt-1 block text-[var(--accent-a)]">
            {hero.titleAccent}
          </span>
        </motion.h1>

        {/* Comfortable High-Contrast Lead Paragraph */}
        <motion.p
          {...fadeUp(0.18)}
          className="mt-6 max-w-[54ch] text-[1.04rem] leading-[1.74] font-normal text-[var(--text-secondary)] sm:text-[1.12rem]"
        >
          {hero.subtitle}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          {...fadeUp(0.26)}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a
            href="#ch1"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('ch1');
            }}
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--text-primary)] px-5 py-2.5 text-[0.88rem] font-semibold text-[var(--bg-page)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span>{hero.ctaStart}</span>
            <ArrowDownRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </a>

          <a
            href="#lab-ch1"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('lab-ch1');
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-5 py-2.5 text-[0.88rem] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)]"
          >
            <FlaskConical
              className="h-4 w-4 text-[var(--accent-a)]"
              aria-hidden="true"
            />
            <span>{hero.ctaExplore}</span>
          </a>
        </motion.div>

        {/* Telemetry Meta Hint */}
        <motion.div
          {...fadeUp(0.32)}
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] tracking-[0.06em] text-[var(--text-muted)]"
        >
          <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
            <Sparkles className="h-3 w-3 text-[var(--accent-b)]" aria-hidden="true" />
            {isRu
              ? 'Вращайте 3D-мозг справа · Наводите на извилины и нейроны'
              : 'Rotate 3D brain on the right · Hover gyri & neurons'}
          </span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span>{meta.readingTime}</span>
        </motion.div>
      </div>

      {/* Bottom Data-First Biotech Proof Metrics Strip */}
      <motion.div {...fadeUp(0.38)} className="mt-12">
        <div className="hairline mb-5" aria-hidden="true" />

        <div
          id="hero-stats"
          role="region"
          aria-label={ui.ariaHeroStats}
          className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"
        >
          {hero.stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <span
                className={`font-mono text-[1.5rem] font-semibold tracking-[-0.03em] tabular-nums sm:text-[1.75rem] ${
                  STAT_ACCENTS[idx % STAT_ACCENTS.length]
                }`}
              >
                {stat.value}
              </span>
              <span className="text-[0.76rem] leading-[1.4] text-[var(--text-muted)]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
