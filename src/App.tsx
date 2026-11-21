import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ExplorerProvider, useExplorer } from './v7/context/ExplorerContext';
import { BookHud } from './v7/components/BookHud';
import { BookIndexDrawer } from './v7/components/BookIndexDrawer';
import { DossierProvider } from './v9/components/DossierContext';
import { NoesisDossierSheet } from './v9/components/NoesisDossierSheet';
import { ACTS_META, getActMeta } from './v9/data/actsMeta';
import {
  buildHashUrl,
  getNextAct,
  parseHashRoute,
  type ActId,
} from './v9/utils/hashRouter';
import type { ActViewProps } from './v9/acts/Act1View';

gsap.registerPlugin(ScrollTrigger);

// Dynamic chunk loaders — allow both React.lazy rendering AND idle prefetch at 70% scroll!
const ACT_LOADERS: Record<ActId, () => Promise<{ default: ComponentType<ActViewProps> }>> = {
  'act-1': () => import('./v9/acts/Act1View'),
  'act-2': () => import('./v9/acts/Act2View'),
  'act-3': () => import('./v9/acts/Act3View'),
  'act-4': () => import('./v9/acts/Act4View'),
  'act-5': () => import('./v9/acts/Act5View'),
};

const ACT_COMPONENTS: Record<ActId, ComponentType<ActViewProps>> = {
  'act-1': lazy(ACT_LOADERS['act-1']),
  'act-2': lazy(ACT_LOADERS['act-2']),
  'act-3': lazy(ACT_LOADERS['act-3']),
  'act-4': lazy(ACT_LOADERS['act-4']),
  'act-5': lazy(ACT_LOADERS['act-5']),
};

function ActLoadingPaper() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#141413] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.16em] text-[#5E5D59]">
          <span className="w-2 h-2 rounded-full bg-[#FC4109] animate-pulse" />
          <span>ПЕРЕЛИСТЫВАНИЕ АКТА…</span>
        </div>
      </div>
    </div>
  );
}

function ActMountSignal({
  actId,
  onReady,
}: {
  actId: ActId;
  onReady: (actId: ActId) => (() => void) | void;
}) {
  useLayoutEffect(() => onReady(actId), [actId, onReady]);
  return null;
}

function NoesisBookShell() {
  const { state, markActVisited, markDossierRead } = useExplorer();

  const initialRoute = parseHashRoute(typeof window !== 'undefined' ? window.location.hash : '');
  const [activeAct, setActiveAct] = useState<ActId>(initialRoute.act);
  const [activeChapterId, setActiveChapterId] = useState<string>(
    initialRoute.section ?? getActMeta(initialRoute.act).chapters[0].id,
  );
  const [indexOpen, setIndexOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [isCurtainVisible, setIsCurtainVisible] = useState(false);

  const [hudTheme, setHudTheme] = useState<'light' | 'dark'>('light');
  const [immersiveCanvas, setImmersiveCanvas] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const lenisRef = useRef<Lenis | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const ch1DarkRef = useRef(false);
  const pendingSectionRef = useRef<string | null>(initialRoute.section);
  const activeActRef = useRef<ActId>(activeAct);
  activeActRef.current = activeAct;
  const prefetchedActsRef = useRef<Record<string, boolean>>({});
  const transitionTimerRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);
  const lastMetricsRef = useRef<{ y: number; h: number }>({ y: -1, h: -1 });

  // Zero-Reflow HUD sync: only measures DOM rects when scrollY or documentHeight actually changed (or forced!)
  const syncHudFromViewport = useCallback((force = false) => {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const docHeight = document.documentElement.scrollHeight;
    if (
      !force &&
      Math.abs(scrollY - lastMetricsRef.current.y) < 0.5 &&
      docHeight === lastMetricsRef.current.h
    ) {
      return;
    }
    lastMetricsRef.current = { y: scrollY, h: docHeight };

    const maxScroll = Math.max(1, docHeight - window.innerHeight);
    const nextProgress = Math.max(0, Math.min(1, scrollY / maxScroll));

    setIsScrolled((prev) => {
      const next = scrollY > 44;
      return prev === next ? prev : next;
    });
    setScrollProgress((prev) => (Math.abs(prev - nextProgress) < 0.001 ? prev : nextProgress));

    // Idle prefetch of the next Act once reader crosses 68% of current Act
    if (nextProgress > 0.68) {
      const nextAct = getNextAct(activeActRef.current);
      if (nextAct && !prefetchedActsRef.current[nextAct]) {
        prefetchedActsRef.current[nextAct] = true;
        ACT_LOADERS[nextAct]().catch(() => {
          prefetchedActsRef.current[nextAct] = false;
        });
      }
    }

    // Active chapter within current Act
    const actChapters = getActMeta(activeActRef.current).chapters;
    const anchorY = Math.max(88, window.innerHeight * 0.28);
    let current = actChapters[0].id;
    for (const ch of actChapters) {
      const el = document.getElementById(ch.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= anchorY) {
        current = ch.id;
      }
    }
    setActiveChapterId((prev) => (prev === current ? prev : current));

    // Declarative HUD Theme & Immersive Canvas probing right behind top 60px bar (probeY = 32px)
    const probeY = 32;

    const runwayEl = document.getElementById('ch-1-runway');
    const inCh1Canvas = runwayEl
      ? runwayEl.getBoundingClientRect().top <= probeY &&
        runwayEl.getBoundingClientRect().bottom >= window.innerHeight - 16
      : false;

    const halEl = document.getElementById('hal-monolith-runway');
    const inHalMonolith = halEl
      ? halEl.getBoundingClientRect().top <= probeY && halEl.getBoundingClientRect().bottom > probeY
      : false;

    const ch6El = document.getElementById('ch-6');
    const inCh6Dark = ch6El
      ? ch6El.getBoundingClientRect().top <= probeY && ch6El.getBoundingClientRect().bottom > probeY
      : false;

    const footerEl = document.getElementById('book-colophon-footer');
    const inFooterDark = footerEl
      ? footerEl.getBoundingClientRect().top <= probeY &&
        footerEl.getBoundingClientRect().bottom > probeY
      : false;

    // Also scan declarative [data-hud-theme="dark"] wrappers (e.g., Act IV dark bottom bridge)
    let inDeclarativeDark = false;
    const darkNodes = document.querySelectorAll<HTMLElement>('[data-hud-theme="dark"]');
    for (let i = 0; i < darkNodes.length; i += 1) {
      const rect = darkNodes[i].getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > probeY) {
        inDeclarativeDark = true;
        break;
      }
    }

    const nextImmersive = inCh1Canvas || inHalMonolith;
    setImmersiveCanvas((prev) => (prev === nextImmersive ? prev : nextImmersive));

    const nextTheme: 'light' | 'dark' =
      inCh6Dark || inHalMonolith || inFooterDark || inDeclarativeDark || (inCh1Canvas && ch1DarkRef.current)
        ? 'dark'
        : 'light';
    setHudTheme((prev) => (prev === nextTheme ? prev : nextTheme));
  }, []);

  // Configure manual scroll restoration + unified Lenis/GSAP clock
  useEffect(() => {
    document.documentElement.lang = 'ru';
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({
      duration: prefersReduced ? 0.01 : 0.96,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReduced,
      touchMultiplier: 1.35,
    });
    lenisRef.current = lenis;

    const onScroll = () => {
      ScrollTrigger.update();
      syncHudFromViewport(false);
    };
    lenis.on('scroll', onScroll);

    const onNativeScroll = () => {
      ScrollTrigger.update();
      syncHudFromViewport(false);
    };
    const onResize = () => {
      ScrollTrigger.refresh();
      syncHudFromViewport(true);
    };

    window.addEventListener('scroll', onNativeScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    syncHudFromViewport(true);

    return () => {
      window.removeEventListener('scroll', onNativeScroll);
      window.removeEventListener('resize', onResize);
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [syncHudFromViewport]);

  // Pause Lenis while either the Index Drawer or the Level-2 Dossier Sheet is open
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (indexOpen || dossierOpen) {
      lenis.stop();
    } else if (!isTransitioningRef.current) {
      lenis.start();
    }
  }, [indexOpen, dossierOpen]);

  // Global debounced ResizeObserver on <main> so any dynamic layout change keeps ScrollTrigger accurate
  useEffect(() => {
    const el = mainRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let timer: number | null = null;
    const ro = new ResizeObserver(() => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        syncHudFromViewport(true);
      }, 130);
    });
    ro.observe(el);
    return () => {
      if (timer !== null) window.clearTimeout(timer);
      ro.disconnect();
    };
  }, [syncHudFromViewport]);

  // Update page title & mark visited Act
  useEffect(() => {
    const meta = getActMeta(activeAct);
    document.title = `NOESIS · Акт ${meta.roman}: ${meta.title}`;
    markActVisited(activeAct);
  }, [activeAct, markActVisited]);

  // 4-Phase Safe Act Transition (Lock & Curtain -> Unmount & Purge -> Hard Scroll & HUD Reset -> Lazy Mount, 2x rAF & Reveal)
  const switchAct = useCallback(
    (targetAct: ActId, targetSection?: string, updateHash = true) => {
      // Same-act local section jump
      if (targetAct === activeActRef.current) {
        if (updateHash) {
          const desiredHash = buildHashUrl(targetAct, targetSection ?? null);
          if (window.location.hash !== desiredHash) {
            window.history.replaceState(null, '', desiredHash);
          }
        }
        if (targetSection) {
          const el = document.getElementById(targetSection);
          if (el) {
            if (lenisRef.current) {
              lenisRef.current.scrollTo(el, { offset: 0, duration: 0.95 });
            } else {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }
        } else if (lenisRef.current) {
          lenisRef.current.scrollTo(0, { duration: 0.85 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }

      // Phase 1: Lock & Curtain
      isTransitioningRef.current = true;
      setIsCurtainVisible(true);
      setIndexOpen(false);
      setDossierOpen(false);
      lenisRef.current?.stop();

      if (updateHash) {
        const nextHash = buildHashUrl(targetAct, targetSection ?? null);
        if (window.location.hash !== nextHash) {
          window.history.pushState(null, '', nextHash);
        }
      }

      transitionTimerRef.current = window.setTimeout(() => {
        // Phase 2: Unmount & Purge GSAP ScrollTriggers cleanly BEFORE switching React tree
        ScrollTrigger.getAll().forEach((st) => st.kill(true));
        ch1DarkRef.current = false;

        // Phase 3: Hard Scroll & HUD Reset
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, { immediate: true, force: true });
        }
        lastMetricsRef.current = { y: -1, h: -1 };
        setHudTheme('light');
        setImmersiveCanvas(false);
        setIsScrolled(false);
        setScrollProgress(0);

        pendingSectionRef.current = targetSection ?? null;
        setActiveChapterId(targetSection ?? getActMeta(targetAct).chapters[0].id);
        setActiveAct(targetAct);
      }, 130);
    },
    [],
  );

  const indexOpenRef = useRef(indexOpen);
  indexOpenRef.current = indexOpen;
  const dossierOpenRef = useRef(dossierOpen);
  dossierOpenRef.current = dossierOpen;

  // Phase 4: Called deterministically AFTER lazy Act component finishes mounting inside Suspense!
  const handleActMounted = useCallback(
    (_mountedAct: ActId) => {
      let raf1 = 0;
      let raf2 = 0;
      let revealTimer = 0;

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          const pendingSec = pendingSectionRef.current;
          if (pendingSec) {
            const targetEl = document.getElementById(pendingSec);
            if (targetEl) {
              const top = targetEl.getBoundingClientRect().top + window.scrollY;
              window.scrollTo(0, Math.max(0, top));
              if (lenisRef.current) {
                lenisRef.current.scrollTo(Math.max(0, top), { immediate: true, force: true });
              }
            }
            pendingSectionRef.current = null;
          } else {
            window.scrollTo(0, 0);
            if (lenisRef.current) {
              lenisRef.current.scrollTo(0, { immediate: true, force: true });
            }
          }

          ScrollTrigger.refresh(true);
          syncHudFromViewport(true);

          revealTimer = window.setTimeout(() => {
            isTransitioningRef.current = false;
            setIsCurtainVisible(false);
            if (!indexOpenRef.current && !dossierOpenRef.current) {
              lenisRef.current?.start();
            }
            ScrollTrigger.refresh();
            syncHudFromViewport(true);
          }, 70);
        });
      });

      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        window.clearTimeout(revealTimer);
      };
    },
    [syncHudFromViewport],
  );

  const lastPopRouteRef = useRef<{ key: string; ts: number }>({ key: '', ts: 0 });

  // Listen to browser Back/Forward (both popstate for pushState and hashchange)
  useEffect(() => {
    const onRouteSync = () => {
      const parsed = parseHashRoute(window.location.hash);
      const key = buildHashUrl(parsed.act, parsed.section);
      const now = performance.now();
      if (lastPopRouteRef.current.key === key && now - lastPopRouteRef.current.ts < 80) {
        return;
      }
      lastPopRouteRef.current = { key, ts: now };
      switchAct(parsed.act, parsed.section ?? undefined, false);
    };
    window.addEventListener('hashchange', onRouteSync);
    window.addEventListener('popstate', onRouteSync);
    return () => {
      window.removeEventListener('hashchange', onRouteSync);
      window.removeEventListener('popstate', onRouteSync);
    };
  }, [switchAct]);

  // Ensure initial URL always has canonical hash if blank
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', buildHashUrl(activeAct, null));
    }
  }, [activeAct]);

  const handleNavigateLocal = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: 0, duration: 1.0 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScrollTop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0.9 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleCh1HudTheme = useCallback(
    (theme: 'light' | 'dark') => {
      ch1DarkRef.current = theme === 'dark';
      syncHudFromViewport(true);
    },
    [syncHudFromViewport],
  );

  const ActiveActComponent = ACT_COMPONENTS[activeAct];

  return (
    <DossierProvider onDossierRead={markDossierRead}>
      <div className="relative min-h-screen bg-[#FAF9F5] text-[#141413]">
        {/* Analog film grain overlay (0 GPU cost) */}
        <div className="v6-grain" aria-hidden="true" />

        {/* Atomic Vellum Page-Turn Curtain (hides ScrollTrigger teardown/mount flicker) */}
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[70] pointer-events-none bg-[#FAF9F5] transition-opacity duration-150 ${
            isCurtainVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Dieter Rams 3-Node v9 HUD */}
        <BookHud
          activeAct={activeAct}
          activeChapterId={activeChapterId}
          visitedActs={state.visitedActs}
          hudTheme={hudTheme}
          isScrolled={isScrolled}
          immersiveCanvas={immersiveCanvas}
          scrollProgress={scrollProgress}
          onSelectAct={(actId) => switchAct(actId)}
          onOpenIndex={() => setIndexOpen(true)}
          onScrollTop={handleScrollTop}
        />

        <main ref={mainRef}>
          <Suspense fallback={<ActLoadingPaper />}>
            <ActiveActComponent
              key={activeAct}
              onNavigateLocal={handleNavigateLocal}
              onSwitchAct={(actId, secId) => switchAct(actId, secId)}
              onCh1HudTheme={handleCh1HudTheme}
              onScrollTop={handleScrollTop}
              visitedActs={state.visitedActs}
            />
            <ActMountSignal key={`sig-${activeAct}`} actId={activeAct} onReady={handleActMounted} />
          </Suspense>
        </main>

        {/* 5-Act Atlas Index Drawer */}
        <BookIndexDrawer
          open={indexOpen}
          onClose={() => setIndexOpen(false)}
          activeAct={activeAct}
          activeChapterId={activeChapterId}
          onNavigate={(actId, chapterId) => switchAct(actId, chapterId)}
        />

        {/* Global Level-2 Archival Dossier Sheet */}
        <NoesisDossierSheet onOpenStateChange={setDossierOpen} />
      </div>
    </DossierProvider>
  );
}

export default function App() {
  return (
    <ExplorerProvider>
      <NoesisBookShell />
    </ExplorerProvider>
  );
}

// Keep ACTS_META referenced so Vite never drops metadata tree unexpectedly
void ACTS_META;
