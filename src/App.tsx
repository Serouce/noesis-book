import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ExplorerProvider } from './v7/context/ExplorerContext';
import { BOOK_CHAPTERS } from './v7/data/bookMeta';
import { BookHud } from './v7/components/BookHud';
import { BookIndexDrawer } from './v7/components/BookIndexDrawer';
import { BookInterlude } from './v7/components/BookInterlude';
import { Plate00Mooney } from './v7/components/Plate00Mooney';
import { Chapter1MaryRoom } from './v7/components/Chapter1MaryRoom';
import { Chapter2SplitSpine } from './v7/components/Chapter2SplitSpine';
import { Chapter3VellumError } from './v7/components/Chapter3VellumError';
import { Chapter4WagerAndDiopter } from './v7/components/Chapter4WagerAndDiopter';
import { Chapter5CajalTurntable } from './v7/components/Chapter5CajalTurntable';
import { Chapter6IcuJournal } from './v7/components/Chapter6IcuJournal';
import { Chapter7OtherMinds } from './v7/components/Chapter7OtherMinds';
import { Chapter8BoneEndpaper } from './v7/components/Chapter8BoneEndpaper';

gsap.registerPlugin(ScrollTrigger);

function NoesisBookShell() {
  const [indexOpen, setIndexOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string>('plate-00');
  const [ch1DarkHud, setCh1DarkHud] = useState(false);
  const [ch1Active, setCh1Active] = useState(false);
  const [ch6DarkHud, setCh6DarkHud] = useState(false);
  const [footerDarkHud, setFooterDarkHud] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const lenisRef = useRef<Lenis | null>(null);

  // Unified Lenis + GSAP ScrollTrigger clock (0 GPU bloat — 120 FPS pure editorial motion!)
  useEffect(() => {
    document.documentElement.lang = 'ru';
    document.title = 'NOESIS — Интерактивная книга о сознании';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({
      duration: prefersReduced ? 0.01 : 1.02,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReduced,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    let lastProgressUpdate = 0;
    const updateProgress = (scroll: number, limit: number) => {
      setIsScrolled((prev) => {
        const next = scroll > 64;
        return prev === next ? prev : next;
      });
      const now = performance.now();
      if (now - lastProgressUpdate > 40) {
        lastProgressUpdate = now;
        const pct = limit > 0 ? scroll / limit : 0;
        setScrollProgress(pct);
      }
    };

    const onLenisScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
      ScrollTrigger.update();
      updateProgress(scroll, limit);
    };
    lenis.on('scroll', onLenisScroll);

    const onNativeScroll = () => {
      ScrollTrigger.update();
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      updateProgress(window.scrollY || 0, maxScroll);
    };
    window.addEventListener('scroll', onNativeScroll, { passive: true });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 320);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('scroll', onNativeScroll);
      lenis.off('scroll', onLenisScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Track active book chapter cleanly across all 9 chapter anchors via IntersectionObserver
  useEffect(() => {
    const ids = BOOK_CHAPTERS.map((c) => c.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveChapterId(visible[0].target.id);
        }
      },
      { rootMargin: '-18% 0px -55% 0px', threshold: [0, 0.1, 0.35] },
    );

    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleNavigate = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: 0, duration: 1.15 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScrollTop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.15 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleCh1HudTheme = useCallback((theme: 'light' | 'dark') => {
    setCh1DarkHud(theme === 'dark');
  }, []);

  // Strict per-spread adaptive contrast (never leaks dark HUD onto light archival paper!)
  const hudTheme: 'light' | 'dark' = (() => {
    if (activeChapterId === 'ch-1' && ch1Active && ch1DarkHud) return 'dark';
    if (activeChapterId === 'ch-6' && ch6DarkHud) return 'dark';
    if (activeChapterId === 'ch-8' && footerDarkHud) return 'dark';
    return 'light';
  })();

  return (
    <div className="relative min-h-screen bg-[#FAF9F5] text-[#141413]">
      {/* Subtle analog paper texture overlay (0 GPU cost) */}
      <div className="v6-grain" aria-hidden="true" />

      {/* Swiss Book Running Header & Reading Ribbon */}
      <BookHud
        activeChapterId={activeChapterId}
        hudTheme={hudTheme}
        isScrolled={isScrolled}
        scrollProgress={scrollProgress}
        onOpenIndex={() => setIndexOpen(true)}
        onScrollTop={handleScrollTop}
      />

      <main>
        {/* TABLE 00: Cold Human Threshold — Mooney Contact-Sheet Exposure (0 jargon!) */}
        <Plate00Mooney onContinueToCh1={() => handleNavigate('ch-1')} />

        {/* PART I · CHAPTER I: Qualia & Mary's Room (Pre-exit Bet + Monochrome -> Cobalt Bloom + Chalmers vs Dennett) */}
        <Chapter1MaryRoom
          onHudThemeChange={handleCh1HudTheme}
          onActiveChange={setCh1Active}
          onNextChapter={() => handleNavigate('ch-2')}
        />

        {/* PART I · CHAPTER II: Split-Spine Book (Corpus Callosum Split-Brain + 1-line Mr. Robot) */}
        <Chapter2SplitSpine onNextChapter={() => handleNavigate('ch-3')} />

        {/* PART I · CHAPTER III: Controlled Hallucination (Risograph Vellum Registration Shift · "Drei Gläser") */}
        <Chapter3VellumError onNextChapter={() => handleNavigate('interlude-part-2')} />

        {/* QUIET HALF-TITLE INTERLUDE I (80% calm air, 0 buttons) */}
        <BookInterlude
          id="interlude-part-2"
          partCode="ЧАСТЬ II · ВСКРЫТИЕ"
          title="Под черепом"
          statement="До этой страницы мы говорили только о том, как сознание ощущается изнутри. Но всё это происходит в полутора килограммах мокрой, тёплой, беззвучной ткани. Пора заглянуть под череп."
          footnote="Главы IV–VI · Биология, химия и клинический порог"
        />

        {/* PART II · CHAPTER IV: The 25-Year Wager (Perforated Tear-Strip) + Studio Brain & Swiss Optical Diopter (COGITATE 2025) */}
        <Chapter4WagerAndDiopter onNextChapter={() => handleNavigate('ch-5')} />

        {/* PART II · CHAPTER V: Micro-Zoom x1000 — Cajal Layer-5 Neuron × Dieter Rams Turntable (Club Silencio + Sopranos Cut-to-Black) */}
        <Chapter5CajalTurntable onNextChapter={() => handleNavigate('ch-6')} />

        {/* PART II · CHAPTER VI: Single Deliberate Dark Clinical Spread — ICU Shift (3 Patients, NEJM 2024 CMD 25%, PCI* = 0.31) */}
        <Chapter6IcuJournal
          onDarkInView={setCh6DarkHud}
          onNextChapter={() => handleNavigate('interlude-part-3')}
        />

        {/* QUIET HALF-TITLE INTERLUDE II (Decompresses dark ICU back to morning #FAF9F5 paper!) */}
        <BookInterlude
          id="interlude-part-3"
          partCode="ЧАСТЬ III · ЗА ПРЕДЕЛАМИ ЧЕЛОВЕКА"
          title="Границы разума"
          statement="Только что вы искали разум в тишине человеческого тела. Но человек — лишь одна случайная ветка эволюции. И, возможно, уже не последняя."
          footnote="Главы VII–VIII · Животные, ИИ и ваш форзац"
          fromDark
        />

        {/* PART III · CHAPTER VII: Crimson Bookmark Ribbon (NY Declaration 2024 + SpongeBob/Squidward/Mr. Krabs) + AI Tribunal (HAL 9000) */}
        <Chapter7OtherMinds onNextChapter={() => handleNavigate('ch-8')} />

        {/* PART III · CHAPTER VIII: Endpaper 3D-Flippable Cotton Bone Card ("Контрольная проба №0") + Bibliography & Colophon */}
        <Chapter8BoneEndpaper
          onFooterInView={setFooterDarkHud}
          onScrollTop={handleScrollTop}
        />
      </main>

      {/* Swiss Book Contents Drawer */}
      <BookIndexDrawer
        open={indexOpen}
        onClose={() => setIndexOpen(false)}
        activeChapterId={activeChapterId}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ExplorerProvider>
      <NoesisBookShell />
    </ExplorerProvider>
  );
}
