import { BookOpen } from 'lucide-react';
import { BOOK_CHAPTERS } from '../data/bookMeta';

interface BookHudProps {
  activeChapterId: string;
  hudTheme: 'light' | 'dark';
  isScrolled: boolean;
  immersiveCanvas?: boolean;
  scrollProgress: number;
  onOpenIndex: () => void;
  onScrollTop: () => void;
}

export function BookHud({
  activeChapterId,
  hudTheme,
  isScrolled,
  immersiveCanvas = false,
  scrollProgress,
  onOpenIndex,
  onScrollTop,
}: BookHudProps) {
  const chapter = BOOK_CHAPTERS.find((c) => c.id === activeChapterId) ?? BOOK_CHAPTERS[0];
  // Strictly atomic chapter code + title + folio — zero scramble lag or mismatched chapter/page chimeras!
  const displayLabel = `${chapter.code} · ${chapter.shortTitle}`;

  const isDark = hudTheme === 'dark';
  const pct = Math.max(0, Math.min(100, Math.round(scrollProgress * 100)));

  // Atomic contrast pills (NO color/background-color cross-fade, preventing muddy grey-on-grey midpoints!)
  const pillCls = isDark
    ? 'bg-[#14161B]/92 text-[#FAF9F5] border-[#FAF9F5]/22 hover:bg-[#1E222A]'
    : 'bg-[#FAF9F5] text-[#141413] border-[#141413]/14 hover:bg-[#F1EFE7]';

  const indexPillCls = isDark
    ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5] hover:bg-[#ECEAE2]'
    : 'bg-[#141413] text-[#FAF9F5] border-[#141413] hover:bg-[#2A2A28]';

  const solidHeaderBg = isDark
    ? 'bg-[#111419]/96 border-b border-[#FAF9F5]/10'
    : 'bg-[#FAF9F5]/96 border-b border-[#141413]/8';

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      {/* Hairline crimson reading-ribbon progress track */}
      <div className="relative z-20 h-[2px] w-full bg-transparent overflow-hidden">
        <div
          className="h-full bg-[#FC4109] origin-left will-change-transform"
          style={{ transform: `scaleX(${Math.max(0, Math.min(1, scrollProgress))})` }}
        />
      </div>

      {/* Crisp Swiss running-header backdrop on editorial spreads + 8px micro-feather so descenders never slice harshly */}
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

      {/* Subtle photo-safe edge scrim ONLY while over the full-bleed Mary's Room canvas */}
      {isScrolled && immersiveCanvas && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-14"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(12,18,36,0.52) 0%, rgba(12,18,36,0) 100%)'
              : 'linear-gradient(180deg, rgba(236,234,228,0.68) 0%, rgba(236,234,228,0) 100%)',
          }}
        />
      )}

      <div className="relative z-10 max-w-[1360px] mx-auto px-5 md:px-10 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Book Colophon Mark + Live Running Folio */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onScrollTop}
            aria-label="NOESIS — к началу книги"
            className={`h-9 px-3.5 rounded-full border backdrop-blur-md inline-flex items-center gap-2 cursor-pointer transition-transform duration-150 active:scale-[0.97] ${pillCls}`}
          >
            <span className="font-display font-bold text-[12.5px] tracking-[0.08em]">NOESIS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FC4109]" />
          </button>

          <button
            type="button"
            onClick={onOpenIndex}
            className={`hidden sm:inline-flex h-9 px-3.5 rounded-full border backdrop-blur-md items-center gap-2.5 font-mono-tech text-[11px] uppercase tracking-[0.07em] cursor-pointer transition-transform duration-150 active:scale-[0.97] ${pillCls}`}
          >
            <span>{displayLabel}</span>
            <span className={isDark ? 'text-[#FAF9F5]/45' : 'text-[#141413]/35'}>·</span>
            <span className={isDark ? 'text-[#FAF9F5]/75' : 'text-[#5E5D59]'}>{chapter.folio}</span>
          </button>
        </div>

        {/* Right: Reading Percentage + Book Contents Bookmark */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className={`hidden md:inline-flex h-9 px-3 rounded-full border backdrop-blur-md items-center font-mono-tech text-[11px] tracking-[0.06em] ${pillCls}`}
            aria-label={`Прочитано ${pct}%`}
          >
            <span>{pct}%</span>
          </div>

          <button
            type="button"
            onClick={onOpenIndex}
            className={`h-9 px-4 rounded-full border inline-flex items-center gap-2 font-sans-ui text-[12.5px] font-medium cursor-pointer shadow-[0_6px_20px_rgba(20,20,19,0.12)] transition-transform duration-150 active:scale-[0.97] ${indexPillCls}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Оглавление</span>
          </button>
        </div>
      </div>
    </header>
  );
}
