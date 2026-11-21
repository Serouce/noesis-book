import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

interface BookInterludeProps {
  id: string;
  partCode: string;
  title: string;
  statement: string;
  footnote: string;
  fromDark?: boolean;
}

/**
 * Quiet full-screen Swiss book half-title spread (Шмуцтитул).
 * Enhanced with GSAP 3.15 SplitText editorial reveal (strictly reverted on unmount for React 19 StrictMode).
 */
export function BookInterlude({
  id,
  partCode,
  title,
  statement,
  footnote,
  fromDark = false,
}: BookInterludeProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const statementRef = useRef<HTMLParagraphElement | null>(null);
  const ruleRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    const h2 = titleRef.current;
    const p = statementRef.current;
    if (!el || !h2 || !p) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let splitTitle: SplitText | null = null;
    const ctx = gsap.context(() => {
      splitTitle = SplitText.create(h2, { type: 'words', mask: 'words' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 78%',
          once: true,
        },
      });

      if (ruleRef.current) {
        tl.fromTo(
          ruleRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.55, ease: 'power3.out' },
          0,
        );
      }

      tl.from(
        splitTitle.words,
        {
          yPercent: 108,
          opacity: 0,
          duration: 0.72,
          stagger: 0.045,
          ease: 'power3.out',
        },
        0.05,
      ).from(
        p,
        {
          y: 16,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
        },
        0.24,
      );
    }, el);

    return () => {
      ctx.revert();
      splitTitle?.revert();
    };
  }, [title, statement]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative min-h-[78svh] flex flex-col justify-between px-5 md:px-12 lg:px-20 py-24 md:py-32"
      style={{
        background: fromDark
          ? 'linear-gradient(180deg, #111419 0%, #2C3038 14%, #E8E5DC 44%, #FAF9F5 74%)'
          : '#FAF9F5',
      }}
      aria-label={`${partCode} — ${title}`}
    >
      <div className="max-w-[1160px] mx-auto w-full flex-1 flex flex-col justify-center">
        <div className={fromDark ? 'pt-20 md:pt-28' : ''}>
          <div className="flex items-center gap-3 font-mono-tech text-[11px] uppercase tracking-[0.18em] text-[#FC4109]">
            <span ref={ruleRef} className="w-8 h-[1px] bg-[#FC4109] inline-block" />
            <span>{partCode}</span>
          </div>

          <h2
            ref={titleRef}
            className="mt-5 font-display font-bold text-[clamp(34px,5.2vw,68px)] leading-[1.04] tracking-[-0.032em] text-[#141413]"
          >
            {title}
          </h2>

          <p
            ref={statementRef}
            className="mt-8 max-w-2xl font-serif-editorial italic text-[clamp(20px,2.3vw,30px)] leading-[1.45] text-[#2F2E2B]"
          >
            {statement}
          </p>

          <div className="mt-12 pt-5 border-t border-[#141413]/12 flex items-center justify-between font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#5E5D59]">
            <span>{footnote}</span>
            <span>↓ Листайте дальше</span>
          </div>
        </div>
      </div>
    </section>
  );
}
