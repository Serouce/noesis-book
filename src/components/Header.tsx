import type { RefObject } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import type { ChapterId, Lang, NavContent, UiLabels } from '../data/content';

export type VisualMode = 'auto' | 'macro' | 'neurons' | 'connectome' | 'slice' | 'art';
export type ColorMode = 'carbon' | 'daylight';

export interface HeaderProps {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  colorMode: ColorMode;
  onToggleColorMode: () => void;
  nav: NavContent;
  ui: UiLabels;
  activeChapter: ChapterId;
  inAtlas: boolean;
  onNavigate: (targetId: string) => void;
  progressBarRef: RefObject<HTMLDivElement | null>;
}

const CHAPTER_DIGITS: Record<ChapterId, string> = {
  ch1: '01',
  ch2: '02',
  ch3: '03',
  ch4: '04',
  ch5: '05',
  ch6: '06',
};

export function Header({
  lang,
  onChangeLang,
  colorMode,
  onToggleColorMode,
  nav,
  ui,
  activeChapter,
  inAtlas,
  onNavigate,
  progressBarRef,
}: HeaderProps) {
  const isRu = lang === 'ru';
  const isDaylight = colorMode === 'daylight';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border-hairline)] bg-[var(--bg-header)] backdrop-blur-xl transition-colors duration-300">
      {/* Ultra-thin 2px reading progress bar along top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-[var(--border-hairline)]"
      >
        <div
          ref={progressBarRef}
          className="h-full w-full origin-left will-change-transform"
          style={{
            transform: 'scaleX(0)',
            background: 'linear-gradient(90deg, var(--accent-a) 0%, var(--accent-b) 100%)',
          }}
        />
      </div>

      <div className="mx-auto flex h-[60px] max-w-[1520px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-10">
        {/* Brand Lockup */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('top');
          }}
          aria-label={nav.brand}
          className="group flex shrink-0 items-center gap-2.5 rounded-lg py-1 pr-2 transition-opacity hover:opacity-85"
        >
          <span
            aria-hidden="true"
            className="relative flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-subtle)]"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--accent-a)]" />
          </span>

          <span className="flex items-baseline gap-2.5">
            <span className="font-mono text-[0.82rem] font-semibold tracking-[0.16em] text-[var(--text-primary)] uppercase">
              {nav.brand}
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px bg-[var(--border-strong)] min-[1480px]:inline-block"
            />
            <span className="hidden font-mono text-[0.65rem] tracking-[0.12em] text-[var(--text-muted)] uppercase min-[1480px]:inline-block">
              {nav.subtitle}
            </span>
          </span>
        </a>

        {/* Center Chapter Navigation (Visible >= 1240px with zero clipping) */}
        <nav
          aria-label={isRu ? 'Навигация по главам' : 'Chapter navigation'}
          className="hidden min-[1240px]:flex min-w-0 items-center gap-0.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-0.5"
        >
          {nav.items.map((item) => {
            const isActive = inAtlas && activeChapter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative isolate flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.71rem] font-medium transition-colors duration-200 min-[1380px]:px-3 min-[1380px]:text-[0.74rem] ${
                  isActive
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="noesis-nav-pill"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 34,
                    }}
                    className="absolute inset-0 z-0 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)]"
                  />
                )}
                <span
                  className={`relative z-10 font-mono text-[0.63rem] tabular-nums ${
                    isActive ? 'text-[var(--accent-a)] font-semibold' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {CHAPTER_DIGITS[item.id]}
                </span>
                <span className="relative z-10 whitespace-nowrap">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Biotech Theme Switcher (Carbon / Daylight) + EN | RU Switcher */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleColorMode}
            aria-label={
              isRu
                ? isDaylight
                  ? 'Включить тёмную тему Carbon'
                  : 'Включить светлую тему Daylight'
                : isDaylight
                  ? 'Switch to Carbon Dark mode'
                  : 'Switch to Clinical Daylight mode'
            }
            title={
              isRu
                ? isDaylight
                  ? 'Тёмная тема (Warm Carbon)'
                  : 'Светлая тема (Clinical Daylight)'
                : isDaylight
                  ? 'Warm Carbon Dark'
                  : 'Clinical Daylight'
            }
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3 font-mono text-[0.66rem] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          >
            {isDaylight ? (
              <>
                <Moon className="h-3.5 w-3.5 text-[var(--accent-a)]" aria-hidden="true" />
                <span className="hidden sm:inline">{isRu ? 'Carbon' : 'Carbon'}</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5 text-[#D99B4E]" aria-hidden="true" />
                <span className="hidden sm:inline">{isRu ? 'Daylight' : 'Daylight'}</span>
              </>
            )}
          </button>

          {/* EN | RU Switcher */}
          <div
            role="group"
            aria-label={ui.ariaLangSwitch}
            className="relative isolate inline-flex items-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-0.5"
          >
            {(['en', 'ru'] as const).map((code) => {
              const isSelected = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLang(code)}
                  aria-pressed={isSelected}
                  className={`relative isolate z-10 min-w-[34px] cursor-pointer rounded-full px-2.5 py-1 font-mono text-[0.67rem] font-semibold tracking-[0.08em] uppercase transition-colors ${
                    isSelected
                      ? 'text-[#0D0D0C]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="noesis-lang-pill"
                      transition={{
                        type: 'spring',
                        stiffness: 440,
                        damping: 34,
                      }}
                      className="absolute inset-0 z-0 rounded-full bg-[#F3F2EE] shadow-sm"
                    />
                  )}
                  <span className="relative z-10 select-none">{code.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
