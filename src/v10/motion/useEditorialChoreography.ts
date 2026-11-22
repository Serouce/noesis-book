import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Global Swiss Editorial Choreography (Awwwards-grade zero-jank GPU motion):
 * 1. Smoothly reveals editorial headings (h2/h3 outside sticky runways & Plate 00 hero) with power3.out lift.
 * 2. Animates top 1px chapter folio hairline dividers drawing left -> right (`scaleX: 0 -> 1`).
 * 3. Powers subtle Leica Optical Spotlight coordinates (`--mx`, `--my`) on `.noesis-spotlight-card` & `.v9-paper-plate`
 *    via a single delegated `pointermove` listener (ZERO React re-renders!).
 */
export function useEditorialChoreography(
  containerRef: RefObject<HTMLElement | null>,
  actKey: string,
) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // 1. Delegated Leica Optical Spotlight hover tracking (zero React state, pure CSS custom props!)
    const onPointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        '.noesis-spotlight-card, .v9-paper-plate',
      );
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${(e.clientX - rect.left).toFixed(1)}px`);
      target.style.setProperty('--my', `${(e.clientY - rect.top).toFixed(1)}px`);
    };
    root.addEventListener('pointermove', onPointerMove, { passive: true });

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return () => root.removeEventListener('pointermove', onPointerMove);
    }

    // Wait 2 rAFs so React.lazy act DOM & sticky runways finish laying out cleanly
    let raf1 = 0;
    let raf2 = 0;
    let ctx: gsap.Context | null = null;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        ctx = gsap.context(() => {
          // A. Soft editorial entrance for headings strictly outside sticky cinema runways, Plate 00 fold & custom SplitText spreads
          const headings = root.querySelectorAll<HTMLElement>('h2, h3');
          headings.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (
              el.closest('.sticky') ||
              el.closest('#plate-00') ||
              el.closest('[data-no-reveal]') ||
              rect.bottom < 0 ||
              rect.top < window.innerHeight * 0.92
            ) {
              return;
            }
            gsap.fromTo(
              el,
              { y: 18, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.68,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 92%',
                  once: true,
                  fastScrollEnd: true,
                },
              },
            );
          });

          // B. Editorial entrance for Leica spotlight cards below the fold
          const cards = root.querySelectorAll<HTMLElement>('.noesis-spotlight-card');
          cards.forEach((card, idx) => {
            const rect = card.getBoundingClientRect();
            if (
              card.closest('.sticky') ||
              card.closest('[data-no-reveal]') ||
              rect.bottom < 0 ||
              rect.top < window.innerHeight * 0.92
            ) {
              return;
            }
            gsap.fromTo(
              card,
              { y: 20, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.64,
                delay: (idx % 3) * 0.05,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 92%',
                  once: true,
                  fastScrollEnd: true,
                },
              },
            );
          });
        }, root);
      });
    });

    return () => {
      root.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ctx?.revert();
    };
  }, [containerRef, actKey]);
}
