import { useEffect, useState } from 'react';
import { CHAMBERS, PHASE1_COPY, type Lang } from '../data/phase1Copy';

interface AdaptiveHudProps {
  lang: Lang;
  onToggleLang: () => void;
  activeChamberIdx: number;
  hudTheme: 'light' | 'dark';
  isScrolled: boolean;
  onOpenIndex: () => void;
  scrollProgress: number;
}

const SCRAMBLE_CHARS = 'абвгдежзиклмнопрстуфхцчшщэюя·#0123456789abcdefghijklmnopqrstuvwxyz';

function useScrambleText(target: string, scrambleKey: number) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    setDisplay(target);
  }, [target]);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 12;
    let rafId = 0;

    const step = () => {
      frame += 1;
      const revealCount = Math.floor((frame / totalFrames) * target.length);
      let next = '';
      for (let i = 0; i < target.length; i++) {
        if (i < revealCount || target[i] === ' ') {
          next += target[i];
        } else {
          next += SCRAMBLE_CHARS[(i * 7 + frame * 3) % SCRAMBLE_CHARS.length];
        }
      }
      setDisplay(next);
      if (frame < totalFrames) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplay(target);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
    // Only scramble when chapter index changes; language switch updates instantaneously!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrambleKey]);

  return display;
}

export function AdaptiveHud({
  lang,
  onToggleLang,
  activeChamberIdx,
  hudTheme,
  isScrolled,
  onOpenIndex,
  scrollProgress,
}: AdaptiveHudProps) {
  const activeChamber = CHAMBERS[activeChamberIdx] ?? CHAMBERS[0];
  const rawLabel = activeChamber.breadcrumb[lang];
  const breadcrumb = useScrambleText(rawLabel, activeChamberIdx);

  const isDark = hudTheme === 'dark';

  const pillSurface = isDark
    ? 'bg-[#FAF9F5]/12 text-[#FAF9F5] border-[#FAF9F5]/22 hover:bg-[#FAF9F5]/20'
    : 'bg-[#E8E6DC]/80 text-[#141413] border-[#141413]/10 hover:bg-[#E0DDD1]';

  const primaryPill = isDark
    ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5] hover:bg-[#F4EFE8]'
    : 'bg-[#141413] text-[#FAF9F5] border-[#141413] hover:bg-[#2B2A28]';

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 pointer-events-none transition-colors duration-300"
      aria-label="NOESIS Navigation"
    >
      {/* Subtle surface-matched top edge scrim ONLY on dark scenes or clean ivory scroll (zero grey soot!) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 transition-opacity duration-300"
        style={{
          opacity: isScrolled && (isDark || activeChamberIdx === 0 || activeChamberIdx === 6) ? 1 : 0,
          background: isDark
            ? 'linear-gradient(180deg, rgba(17,20,25,0.44) 0%, rgba(17,20,25,0) 100%)'
            : 'linear-gradient(180deg, rgba(250,249,245,0.88) 0%, rgba(250,249,245,0) 100%)',
        }}
      />

      {/* Ultra-thin 2px reading progress bar along the top edge */}
      <div className="relative z-10 h-[2px] w-full bg-transparent overflow-hidden">
        <div
          className="h-full origin-left transition-transform duration-100 ease-out"
          style={{
            transform: `scaleX(${Math.max(0, Math.min(1, scrollProgress))})`,
            backgroundColor: isDark ? '#FAF9F5' : '#FC4109',
          }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-5 md:px-12 lg:px-16 pt-4 md:pt-5 flex items-center justify-between gap-4">
        {/* Left: Compact brand mark + HUMAN.md scrambling chapter breadcrumb */}
        <div className="flex items-center gap-3.5 pointer-events-auto">
          <a
            href="#act-0"
            className={`v6-pill inline-flex items-center gap-2 px-3.5 h-9 rounded-full border backdrop-blur-md ${pillSurface}`}
          >
            <span className="font-display font-bold text-[13px] tracking-[0.06em] uppercase">
              {isScrolled ? 'N' : 'NOESIS'}
            </span>
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-transform duration-300"
              style={{
                backgroundColor: '#FC4109',
                transform: isScrolled ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          </a>

          <div
            className={`hidden sm:flex items-center px-3.5 h-9 rounded-full border backdrop-blur-md font-mono-tech text-[12px] tracking-[-0.01em] transition-colors duration-300 ${
              isDark
                ? 'bg-[#141413]/22 text-[#FAF9F5]/90 border-[#FAF9F5]/16'
                : 'bg-[#FAF9F5]/78 text-[#30302E] border-[#141413]/8'
            }`}
          >
            {breadcrumb}
          </div>
        </div>

        {/* Right: Minimal Anthropic-style floating pills */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onToggleLang}
            className={`v6-pill h-9 px-3.5 rounded-full border backdrop-blur-md font-mono-tech text-[12px] font-medium cursor-pointer ${pillSurface}`}
            aria-label="Switch language"
          >
            <span className={lang === 'ru' ? 'opacity-100 font-semibold' : 'opacity-45'}>RU</span>
            <span className="mx-1 opacity-35">/</span>
            <span className={lang === 'en' ? 'opacity-100 font-semibold' : 'opacity-45'}>EN</span>
          </button>

          <button
            type="button"
            onClick={onOpenIndex}
            className={`v6-pill h-9 px-4 rounded-full border backdrop-blur-md font-sans-ui text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer ${primaryPill}`}
          >
            <span>{PHASE1_COPY.hud.indexBtn[lang]}</span>
            <span className="font-mono-tech text-[14px] leading-none opacity-80">=</span>
          </button>
        </div>
      </div>
    </header>
  );
}
