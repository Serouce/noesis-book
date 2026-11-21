import { useEffect, useRef, type RefObject } from 'react';

interface UseViewportRafOptions {
  /** Extra toggle to pause the instrument even while visible. Default: true */
  enabled?: boolean;
  /** IntersectionObserver margin around viewport. Default: '120px 0px' */
  rootMargin?: string;
}

/**
 * Law of the "Sleeping Instrument" (NOESIS v9.1 Zero-Jank Engine):
 * Runs a requestAnimationFrame loop ONLY while `targetRef` intersects the viewport
 * AND `document.visibilityState === 'visible'` AND `enabled === true`.
 * Guarantees 0% background CPU/GPU drain across all 5 Acts!
 */
export function useViewportRaf(
  targetRef: RefObject<Element | null>,
  callback: (nowMs: number, dtMs: number) => void,
  options: UseViewportRafOptions = {},
): void {
  const { enabled = true, rootMargin = '120px 0px' } = options;
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled) return;

    let isVisibleInViewport = false;
    let isTabVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
    let rafId: number | null = null;
    let lastMs = 0;

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastMs = 0;
    };

    const tick = (nowMs: number) => {
      if (!isVisibleInViewport || !isTabVisible) {
        stopLoop();
        return;
      }
      const dt = lastMs ? Math.min(64, nowMs - lastMs) : 16.67;
      lastMs = nowMs;
      cbRef.current(nowMs, dt);
      rafId = requestAnimationFrame(tick);
    };

    const syncLoop = () => {
      if (isVisibleInViewport && isTabVisible) {
        if (rafId === null) {
          lastMs = 0;
          rafId = requestAnimationFrame(tick);
        }
      } else {
        stopLoop();
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisibleInViewport = Boolean(entry && entry.isIntersecting);
        syncLoop();
      },
      { rootMargin },
    );
    io.observe(el);

    const onVisibility = () => {
      isTabVisible = document.visibilityState === 'visible';
      syncLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [targetRef, enabled, rootMargin]);
}
