import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react';

/**
 * Shared spring transition tuned for spatial VisionOS / Linear tactile glass UI.
 */
export const SPATIAL_SPRING = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 32,
  mass: 0.78,
};

/**
 * Subscribes safely to `prefers-reduced-motion: reduce`.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Computes inline CSS custom property `--slider-fill` for `.optical-slider`.
 */
export function getSliderFillStyle(
  value: number,
  min: number,
  max: number
): CSSProperties {
  const span = Math.max(1e-6, max - min);
  const pct = Math.max(0, Math.min(100, ((value - min) / span) * 100));
  return { '--slider-fill': `${pct.toFixed(2)}%` } as CSSProperties;
}

/**
 * WAI-ARIA roving tabindex keyboard handler for horizontal tablists.
 */
export function handleRovingTabKeyDown<T>(
  event: KeyboardEvent<HTMLElement>,
  items: readonly T[],
  currentIndex: number,
  onSelect: (item: T, nextIndex: number) => void,
  focusIndex: (nextIndex: number) => void
): void {
  const count = items.length;
  if (count === 0) return;

  let nextIndex: number | null = null;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % count;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + count) % count;
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = count - 1;
  }

  if (nextIndex !== null) {
    event.preventDefault();
    onSelect(items[nextIndex], nextIndex);
    focusIndex(nextIndex);
  }
}

/**
 * Syncs a canvas backing store to crisp HiDPI logical dimensions and returns `{ w, h, dpr }`.
 */
export function syncCanvasHiDpi(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): { w: number; h: number; dpr: number } {
  const w = Math.max(1, Math.round(cssWidth));
  const h = Math.max(1, Math.round(cssHeight));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const targetW = Math.round(w * dpr);
  const targetH = Math.round(h * dpr);
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }
  return { w, h, dpr };
}
