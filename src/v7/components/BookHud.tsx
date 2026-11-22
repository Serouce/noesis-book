import { BookOpen, ChevronDown, Menu } from 'lucide-react';
import { ACTS_META, getActMeta } from '../../v9/data/actsMeta';
import type { ActId } from '../../v9/utils/hashRouter';

interface BookHudProps {
  activeAct: ActId;
  activeChapterId: string;
  visitedActs: Record<string, boolean>;
  hudTheme: 'light' | 'dark';
  isScrolled: boolean;
  immersiveCanvas?: boolean;
  scrollProgress: number;
  onSelectAct: (act: ActId) => void;
  onOpenIndex: () => void;
  onScrollTop: () => void;
}

/**
 * Dieter Rams 3-Node Optical HUD (NOESIS v10):
 * - Top 2px 4-segment Act progress hairline.
 * - Desktop (>= 1024px): grid-cols-[1fr_auto_1fr] -> [NOESIS • | ГЛ. · стр.] — [I II III IV] — [Оглавление]
 * - Tablet (768–1023px): [NOESIS •] — [I II III IV] — [Оглавление]
 * - Mobile (< 768px): [NOESIS •] — [АКТ II / IV ▾] — [≡]
 * - Atomic light/dark contrast swap (zero muddy grey midpoints).
 */
export function BookHud({
  activeAct,
  activeChapterId,
  visitedActs,
  hudTheme,
  isScrolled,
  immersiveCanvas = false,
  scrollProgress,
  onSelectAct,
  onOpenIndex,
  onScrollTop,
}: BookHudProps) {
  const actMeta = getActMeta(activeAct);
  const activeActIndex = Math.max(
    0,
    ACTS_META.findIndex((a) => a.id === activeAct),
  );
  const chapter =
    actMeta.chapters.find((c) => c.id === activeChapterId) ?? actMeta.chapters[0];
  const displayLabel = `${chapter.code} · ${chapter.shortTitle}`;

  const isDark = hudTheme === 'dark';

  const pillCls = isDark
    ? 'bg-[#14161B]/92 text-[#FAF9F5] border-[#FAF9F5]/22 hover:bg-[#1E222A]'
    : 'bg-[#FAF9F5] text-[#141413] border-[#141413]/14 hover:bg-[#F1EFE7]';

  const indexPillCls = isDark
    ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5] hover:bg-[#ECEAE2]'
    : 'bg-[#141413] text-[#FAF9F5] border-[#141413] hover:bg-[#2A2A28]';

  const solidHeaderBg = isDark
    ? 'bg-[#111419]/96 border-b border-[#FAF9F5]/10'
    : 'bg-[#FAF9F5]/96 border-b border-[#141413]/8';

  const clampedProgress = Math.max(0, Math.min(1, scrollProgress));

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      {/* 4-Segment Optical Act Progress Hairline (2px) */}
      <div
        className="relative z-20 h-[2px] w-full grid grid-cols-4 gap-[2px] px-[1px]"
        aria-label={`Прогресс: Акт ${actMeta.roman}, ${Math.round(clampedProgress * 100)}%`}
      >
        {ACTS_META.map((act, idx) => {
          const fill =
            idx < activeActIndex ? 1 : idx === activeActIndex ? clampedProgress : 0;
          const trackBg = isDark ? 'bg-[#FAF9F5]/12' : 'bg-[#141413]/8';
          return (
            <div key={act.id} className={`h-full overflow-hidden ${trackBg}`}>
              <div
                className="h-full bg-[#FC4109] origin-left will-change-transform"
                style={{ transform: `scaleX(${fill})` }}
              />
            </div>
          );
        })}
      </div>

      {/* Solid frosted editorial running header + subtle lower feather */}
      {isScrolled && !immersiveCanvas && (
        <>
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 top-0 h-[60px] backdrop-blur-md ${solidHeaderBg}`}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[60px] h-3.5"
            style={{
              background: isDark
                ? 'linear-gradient(180deg, rgba(17,20,25,0.88) 0%, rgba(17,20,25,0) 100%)'
                : 'linear-gradient(180deg, rgba(250,249,245,0.94) 0%, rgba(250,249,245,0) 100%)',
            }}
          />
        </>
      )}

      {/* Photo-safe edge scrim ONLY over full-bleed scroll setpieces */}
      {isScrolled && immersiveCanvas && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-14"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(12,18,36,0.56) 0%, rgba(12,18,36,0) 100%)'
              : 'linear-gradient(180deg, rgba(236,234,228,0.72) 0%, rgba(236,234,228,0) 100%)',
          }}
        />
      )}

      {/* Dieter Rams 3-Node Grid */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 md:px-10 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* NODE 1 (Left): Colophon Mark + Live Running Folio (lg+) */}
        <div className="flex items-center gap-2 justify-self-start pointer-events-auto min-w-0">
          <button
            type="button"
            onClick={onScrollTop}
            aria-label="NOESIS — к началу акта"
            className={`h-9 px-3.5 rounded-full border backdrop-blur-md inline-flex items-center gap-2 cursor-pointer shrink-0 transition-transform duration-150 active:scale-[0.97] ${pillCls}`}
          >
            <span className="font-display font-bold text-[12.5px] tracking-[0.08em]">NOESIS</span>
            <span className="noesis-live-dot w-1.5 h-1.5 rounded-full bg-[#FC4109]" />
          </button>

          <button
            type="button"
            onClick={onOpenIndex}
            className={`hidden xl:inline-flex h-9 px-3.5 rounded-full border backdrop-blur-md items-center gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.07em] cursor-pointer whitespace-nowrap max-w-[390px] transition-transform duration-150 active:scale-[0.97] ${pillCls}`}
          >
            <span className="truncate">{displayLabel}</span>
            <span className={isDark ? 'text-[#FAF9F5]/40' : 'text-[#141413]/32'}>·</span>
            <span className={`shrink-0 ${isDark ? 'text-[#FAF9F5]/72' : 'text-[#5E5D59]'}`}>
              {chapter.folio}
            </span>
          </button>
        </div>

        {/* NODE 2 (Center): Leica Rangefinder Act Dial (md+) OR Compact Mobile Picker (< md) */}
        <nav
          aria-label="Навигация по четырём актам NOESIS"
          className="justify-self-center pointer-events-auto"
        >
          {/* Desktop & Tablet Leica Dial [I II III IV] */}
          <div
            className={`hidden md:inline-flex items-center h-9 p-1 rounded-full border backdrop-blur-md ${
              isDark
                ? 'bg-[#14161B]/92 border-[#FAF9F5]/20'
                : 'bg-[#FAF9F5]/95 border-[#141413]/14'
            }`}
          >
            {ACTS_META.map((act) => {
              const isCurrent = act.id === activeAct;
              const isVisited = Boolean(visitedActs[act.id]);
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => onSelectAct(act.id)}
                  title={`Акт ${act.roman}: ${act.title}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`relative h-7 px-3 rounded-full font-mono-tech text-[11px] tracking-[0.08em] cursor-pointer inline-flex items-center justify-center gap-1 transition-transform duration-150 active:scale-[0.95] ${
                    isCurrent
                      ? isDark
                        ? 'bg-[#FAF9F5] text-[#141413] font-bold'
                        : 'bg-[#141413] text-[#FAF9F5] font-bold'
                      : isDark
                        ? 'text-[#FAF9F5]/72 hover:text-[#FAF9F5] hover:bg-[#FAF9F5]/8'
                        : 'text-[#5E5D59] hover:text-[#141413] hover:bg-[#141413]/6'
                  }`}
                >
                  <span>{act.roman}</span>
                  {isCurrent && (
                    <span
                      className="w-1 h-1 rounded-full bg-[#FC4109]"
                      aria-hidden="true"
                    />
                  )}
                  {!isCurrent && isVisited && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isDark ? 'bg-[#34D399]/70' : 'bg-[#0D7A5F]/65'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile (< 768px) Compact Act Pill */}
          <button
            type="button"
            onClick={onOpenIndex}
            className={`md:hidden h-9 px-3.5 rounded-full border backdrop-blur-md inline-flex items-center gap-1.5 font-mono-tech text-[10.5px] uppercase tracking-[0.1em] font-semibold cursor-pointer transition-transform duration-150 active:scale-[0.97] ${pillCls}`}
          >
            <span>АКТ {actMeta.roman} / IV</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
        </nav>

        {/* NODE 3 (Right): Atlas Index Drawer Button */}
        <div className="justify-self-end pointer-events-auto">
          <button
            type="button"
            onClick={onOpenIndex}
            aria-label="Открыть оглавление атласа"
            className={`h-9 px-3 sm:px-4 rounded-full border inline-flex items-center gap-2 font-sans-ui text-[12.5px] font-medium cursor-pointer shadow-[0_6px_20px_rgba(20,20,19,0.12)] transition-transform duration-150 active:scale-[0.97] ${indexPillCls}`}
          >
            <BookOpen className="hidden sm:block w-3.5 h-3.5" />
            <Menu className="sm:hidden w-4 h-4" />
            <span className="hidden sm:inline">Оглавление</span>
          </button>
        </div>
      </div>
    </header>
  );
}
