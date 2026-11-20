import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { BOOK_CHAPTERS } from '../data/bookMeta';

interface BookHudProps {
  activeChapterId: string;
  hudTheme: 'light' | 'dark';
  isScrolled: boolean;
  scrollProgress: number;
  onOpenIndex: () => void;
  onScrollTop: () => void;
}

export function BookHud({
  activeChapterId,
  hudTheme,
  isScrolled,
  scrollProgress,
  onOpenIndex,
  onScrollTop,
}: BookHudProps) {
  const chapter = BOOK_CHAPTERS.find((c) => c.id === activeChapterId) ?? BOOK_CHAPTERS[0];
  const targetLabel = `${chapter.code} · ${chapter.shortTitle}`;
  const [displayLabel, setDisplayLabel] = useState(targetLabel);

  // Subtle typographic chapter-folio settle transition
  useEffect(() => {
    const glyphs = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ0123456789·';
    let frame = 0;
    const totalFrames = 11;
    let rafId = 0;

    const animate = () => {
      frame += 1;
      const resolved = Math.floor((frame / totalFrames) * targetLabel.length);
      let next = '';
      for (let i = 0; i < targetLabel.length; i += 1) {
        if (i < resolved || targetLabel[i] === ' ' || targetLabel[i] === '·') {
          next += targetLabel[i];
        } else {
          next += glyphs[(i * 7 + frame * 5) % glyphs.length];
        }
      }
      setDisplayLabel(next);
      if (frame < totalFrames) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplayLabel(targetLabel);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [targetLabel]);

  const isDark = hudTheme === 'dark';
  const pct = Math.max(0, Math.min(100, Math.round(scrollProgress * 100)));

  const pillCls = isDark
    ? 'bg-[#141413]/72 text-[#FAF9F5] border-[#FAF9F5]/18 hover:bg-[#141413]/88'
    : 'bg-[#FAF9F5]/90 text-[#141413] border-[#141413]/12 hover:bg-[#FAF9F5]';

  const indexPillCls = isDark
    ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5] hover:bg-[#ECEAE2]'
    : 'bg-[#141413] text-[#FAF9F5] border-[#141413] hover:bg-[#2A2A28]';

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      {/* Hairline crimson reading-ribbon progress track */}
      <div className="h-[2px] w-full bg-transparent overflow-hidden">
        <div
          className="h-full bg-[#FC4109] origin-left will-change-transform"
          style={{ transform: `scaleX(${Math.max(0, Math.min(1, scrollProgress))})` }}
        />
      </div>

      {/* Soft adaptive top scrim for crisp legibility while scrolling */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 transition-opacity duration-300"
        style={{
          opacity: isScrolled ? 1 : 0,
          background: isDark
            ? 'linear-gradient(180deg, rgba(16,18,22,0.72) 0%, rgba(16,18,22,0) 100%)'
            : 'linear-gradient(180deg, rgba(250,249,245,0.88) 0%, rgba(250,249,245,0) 100%)',
        }}
      />

      <div className="relative max-w-[1360px] mx-auto px-5 md:px-10 pt-3.5 flex items-center justify-between gap-3">
        {/* Left: Book Colophon Mark + Live Running Folio */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onScrollTop}
            aria-label="NOESIS — к началу книги"
            className={`v6-pill h-9 px-3.5 rounded-full border backdrop-blur-md inline-flex items-center gap-2 cursor-pointer ${pillCls}`}
          >
            <span className="font-display font-bold text-[12.5px] tracking-[0.08em]">NOESIS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FC4109]" />
          </button>

          <button
            type="button"
            onClick={onOpenIndex}
            className={`v6-pill hidden sm:inline-flex h-9 px-3.5 rounded-full border backdrop-blur-md items-center gap-2.5 font-mono-tech text-[11px] uppercase tracking-[0.07em] cursor-pointer ${pillCls}`}
          >
            <span>{displayLabel}</span>
            <span className={isDark ? 'text-[#FAF9F5]/45' : 'text-[#141413]/35'}>·</span>
            <span className={isDark ? 'text-[#FAF9F5]/70' : 'text-[#5E5D59]'}>{chapter.folio}</span>
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
            className={`v6-pill h-9 px-4 rounded-full border inline-flex items-center gap-2 font-sans-ui text-[12.5px] font-medium cursor-pointer shadow-[0_6px_20px_rgba(20,20,19,0.12)] ${indexPillCls}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Оглавление</span>
          </button>
        </div>
      </div>
    </header>
  );
}
