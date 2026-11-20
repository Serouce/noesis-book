import { useEffect, useRef } from 'react';
import { CHAMBERS, PHASE1_COPY, type Lang } from '../data/phase1Copy';

interface Phase1OutroAndRoadmapProps {
  lang: Lang;
  onFooterInView: (inView: boolean) => void;
  onRoadmapInView: (inView: boolean) => void;
}

export function Phase1OutroAndRoadmap({
  lang,
  onFooterInView,
  onRoadmapInView,
}: Phase1OutroAndRoadmapProps) {
  const roadmapRef = useRef<HTMLElement | null>(null);
  const darkFooterRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = roadmapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onRoadmapInView(entry.isIntersecting);
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onRoadmapInView]);

  // Adaptive HUD automatically inverts to light-on-dark when the Anthropic dark footer reaches the top
  useEffect(() => {
    const el = darkFooterRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onFooterInView(entry.isIntersecting);
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onFooterInView]);

  const upcomingChambers = CHAMBERS.filter((c) => c.status === 'next');
  const copy = PHASE1_COPY.outro;

  return (
    <>
      {/* Serene Anthropic Warm Ivory Transition & Phase Roadmap */}
      <section
        ref={roadmapRef}
        className="bg-[#FAF9F5] text-[#141413] py-24 md:py-32 border-t border-[#141413]/10"
      >
        <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20">
          <div className="max-w-2xl">
            <div className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[#FC4109]">
              {copy.eyebrow[lang]}
            </div>
            <h2 className="font-serif-editorial text-3xl md:text-5xl mt-3 leading-[1.14] text-[#141413]">
              {copy.title[lang]}
            </h2>
            <p className="mt-5 text-[16px] leading-[1.65] text-[#4B4A46]">
              {copy.subtitle[lang]}
            </p>
          </div>

          {/* Anthropic-style Structured Hairline Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingChambers.map((chamber) => (
              <article
                key={chamber.id}
                className="rounded-[20px] bg-[#F5F4ED] border border-[#141413]/10 p-6 md:p-7 flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono-tech text-xs px-2.5 py-0.5 rounded-full bg-[#E8E6DC] text-[#30302E]">
                      {chamber.num}
                    </span>
                    <span className="font-mono-tech text-[11px] uppercase tracking-[0.1em] text-[#5E5D59]">
                      {chamber.phaseLabel[lang]}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-xl text-[#141413]">
                    {chamber.title[lang]}
                  </h3>
                  <p className="text-[14px] leading-[1.6] text-[#5E5D59]">
                    {chamber.subtitle[lang]}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#141413]/10 flex items-center justify-between font-mono-tech text-[11px] text-[#5E5D59]">
                  <span>{chamber.breadcrumb[lang]}</span>
                  <span>60 FPS · Lenis + GSAP</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Authentic Anthropic Deep Obsidian Footer (#141413) */}
      <footer
        ref={darkFooterRef}
        className="bg-[#141413] text-[#FAF9F5] py-16 md:py-24"
      >
        <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-2.5">
              <span className="font-display font-bold text-lg tracking-[0.06em]">NOESIS</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FC4109]" />
            </div>
            <p className="font-serif-editorial text-lg text-[#FAF9F5]/85 leading-relaxed">
              {copy.footerTagline[lang]}
            </p>
          </div>

          <div className="font-mono-tech text-[12px] text-[#FAF9F5]/55 space-y-1 md:text-right">
            <div>{copy.footerNote[lang]}</div>
            <div>v6.0 · Phase 1 Verification Build</div>
          </div>
        </div>
      </footer>
    </>
  );
}
