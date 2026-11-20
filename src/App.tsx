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
import { PrologueConsciousness } from './v7/components/PrologueConsciousness';
import { Chapter1MaryRoom } from './v7/components/Chapter1MaryRoom';
import { Chapter2SplitSpine } from './v7/components/Chapter2SplitSpine';
import { Chapter3VellumError } from './v7/components/Chapter3VellumError';
import { Chapter4WagerAndDiopter } from './v7/components/Chapter4WagerAndDiopter';
import { ScrollMicroZoom } from './v7/components/ScrollMicroZoom';
import { Chapter5CajalTurntable } from './v7/components/Chapter5CajalTurntable';
import { Chapter6IcuJournal } from './v7/components/Chapter6IcuJournal';
import { Chapter7OtherMinds } from './v7/components/Chapter7OtherMinds';
import { Chapter8BoneEndpaper } from './v7/components/Chapter8BoneEndpaper';

gsap.registerPlugin(ScrollTrigger);

function NoesisBookShell() {
  const [indexOpen, setIndexOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string>('plate-00');
  const [ch1DarkHud, setCh1DarkHud] = useState(false);
  const [ch1CanvasInHud, setCh1CanvasInHud] = useState(false);
  const [ch6DarkHud, setCh6DarkHud] = useState(false);
  const [halDarkHud, setHalDarkHud] = useState(false);
  const [footerDarkHud, setFooterDarkHud] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const lenisRef = useRef<Lenis | null>(null);

  // Unified Lenis + GSAP ScrollTrigger clock + 100% deterministic per-frame viewport HUD sync
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

    const chapterIds = BOOK_CHAPTERS.map((c) => c.id);

    // Single deterministic source of truth directly from live DOM geometry (0 lag, 0 stale IntersectionObserver!)
    const syncHudFromViewport = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const nextProgress = Math.max(0, Math.min(1, scrollY / maxScroll));

      setIsScrolled((prev) => {
        const next = scrollY > 48;
        return prev === next ? prev : next;
      });
      setScrollProgress((prev) => (Math.abs(prev - nextProgress) < 0.0005 ? prev : nextProgress));

      // Active chapter: last section whose top crossed the upper 28% reading line
      const anchorY = Math.max(84, window.innerHeight * 0.28);
      let current = chapterIds[0];
      for (const id of chapterIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= anchorY) {
          current = id;
        }
      }
      setActiveChapterId((prev) => (prev === current ? prev : current));

      // Per-spread exact header probe right behind the 60px top HUD bar (y = 32px)
      const probeY = 32;

      const runwayEl = document.getElementById('ch-1-runway');
      // Hide solid header backdrop ONLY while the full-bleed Mary's Room canvas is pinned;
      // as soon as it unsticks and scrolls upward, turn the solid frosted Swiss header ON so prism rays/brass never pass behind HUD pills!
      const nextCh1Canvas = runwayEl
        ? runwayEl.getBoundingClientRect().top <= probeY &&
          runwayEl.getBoundingClientRect().bottom >= window.innerHeight - 16
        : false;
      setCh1CanvasInHud((prev) => (prev === nextCh1Canvas ? prev : nextCh1Canvas));

      const ch6El = document.getElementById('ch-6');
      const nextCh6Dark = ch6El
        ? ch6El.getBoundingClientRect().top <= probeY && ch6El.getBoundingClientRect().bottom > probeY
        : false;
      setCh6DarkHud((prev) => (prev === nextCh6Dark ? prev : nextCh6Dark));

      const halEl = document.getElementById('hal-monolith-runway');
      const nextHalDark = halEl
        ? halEl.getBoundingClientRect().top <= probeY && halEl.getBoundingClientRect().bottom > probeY
        : false;
      setHalDarkHud((prev) => (prev === nextHalDark ? prev : nextHalDark));

      const footerEl = document.getElementById('book-colophon-footer');
      const nextFooterDark = footerEl
        ? footerEl.getBoundingClientRect().top <= probeY && footerEl.getBoundingClientRect().bottom > probeY
        : false;
      setFooterDarkHud((prev) => (prev === nextFooterDark ? prev : nextFooterDark));
    };

    const onLenisScroll = () => {
      ScrollTrigger.update();
      syncHudFromViewport();
    };
    lenis.on('scroll', onLenisScroll);

    const onNativeScroll = () => {
      ScrollTrigger.update();
      syncHudFromViewport();
    };
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    window.addEventListener('resize', syncHudFromViewport, { passive: true });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
      // Cheap <0.05ms deterministic check ensures programmatic jumps/scrollIntoView sync on the very next frame!
      syncHudFromViewport();
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    syncHudFromViewport();
    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      syncHudFromViewport();
    }, 320);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('scroll', onNativeScroll);
      window.removeEventListener('resize', syncHudFromViewport);
      lenis.off('scroll', onLenisScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
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

  const noopBool = useCallback(() => undefined, []);

  // 100% deterministic contrast strictly matching what is physically under the top 60px HUD bar!
  const hudTheme: 'light' | 'dark' = (() => {
    if (ch6DarkHud || halDarkHud || footerDarkHud) return 'dark';
    if (ch1CanvasInHud && ch1DarkHud) return 'dark';
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
        immersiveCanvas={ch1CanvasInHud || halDarkHud}
        scrollProgress={scrollProgress}
        onOpenIndex={() => setIndexOpen(true)}
        onScrollTop={handleScrollTop}
      />

      <main>
        {/* TABLE 00: Cold Human Threshold — Mooney Contact-Sheet Exposure (0 jargon!) */}
        <Plate00Mooney onContinueToCh1={() => handleNavigate('prologue')} />

        {/* PROLOGUE: Human Definition of Consciousness, 3 Common Traps & 3 21st-Century Stakes */}
        <PrologueConsciousness onContinueToPart1={() => handleNavigate('interlude-part-1')} />

        {/* QUIET HALF-TITLE INTERLUDE 0: Part I Symmetry! */}
        <BookInterlude
          id="interlude-part-1"
          partCode="ЧАСТЬ I · ИЗНУТРИ"
          title="Мир глазами субъекта"
          statement="Прежде чем вскрывать череп, посмотрим на сознание из единственной точки, откуда оно реально существует — изнутри первого лица."
          footnote="Главы I–III · Загадка цвета, расщеплённое «Я» и управляемая галлюцинация"
        />

        {/* PART I · CHAPTER I: Qualia & Mary's Room (Scroll Setpiece #1 + Inline Wavelength Explorer!) */}
        <Chapter1MaryRoom
          onHudThemeChange={handleCh1HudTheme}
          onActiveChange={noopBool}
          onNextChapter={() => handleNavigate('ch-2')}
        />

        {/* PART I · CHAPTER II: Split-Spine Book (Optic Chiasm Primer + Whole->Cut Snapping Fibers + Mr. Robot) */}
        <Chapter2SplitSpine onNextChapter={() => handleNavigate('ch-3')} />

        {/* PART I · CHAPTER III: Controlled Hallucination (35mm Leica Monochrom Noir POV + Live Bayesian Prior!) */}
        <Chapter3VellumError onNextChapter={() => handleNavigate('interlude-part-2')} />

        {/* QUIET HALF-TITLE INTERLUDE I (80% calm air, 0 buttons) */}
        <BookInterlude
          id="interlude-part-2"
          partCode="ЧАСТЬ II · ВСКРЫТИЕ"
          title="Под черепом"
          statement="До этой страницы мы говорили только о том, как сознание ощущается изнутри. Но всё это происходит в полутора килограммах мокрой, тёплой, беззвучной ткани. Пора заглянуть под череп."
          footnote="Главы IV–VI · Биология, химия и клинический порог"
        />

        {/* PART II · CHAPTER IV: The 25-Year Wager (Zero Spoiler + GNWT/IIT Metaphors + Optical Diopter) */}
        <Chapter4WagerAndDiopter onNextChapter={() => handleNavigate('micro-zoom')} />

        {/* SCROLL SETPIECE #2 (~210vh): Macro-to-Micro x1000 Optical Dive (10 см -> 2 мм -> 200 мкм Cajal Neuron!) */}
        <ScrollMicroZoom />

        {/* PART II · CHAPTER V: Cajal Layer-5 Neuron × Dieter Rams Turntable (2.2s Sopranos Propofol Cutoff + Smooth Lights-Out Bridge!) */}
        <Chapter5CajalTurntable onNextChapter={() => handleNavigate('ch-6')} />

        {/* PART II · CHAPTER VI: Single Deliberate Dark Clinical Spread — 3-Pole PCI* Prelude + Honest 3-Patient ICU Shift */}
        <Chapter6IcuJournal
          onDarkInView={noopBool}
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

        {/* PART III · CHAPTER VII: Crimson Bookmark + Engraved Sea-Sponge Stamp + Scroll Setpiece #3 (HAL 9000 Monolith) + AI Tribunal */}
        <Chapter7OtherMinds onNextChapter={() => handleNavigate('ch-8')} />

        {/* PART III · CHAPTER VIII: 5-Takeaway Synthesis + 3D-Flippable Cotton Bone Card + Bibliography & Colophon */}
        <Chapter8BoneEndpaper
          onFooterInView={noopBool}
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
