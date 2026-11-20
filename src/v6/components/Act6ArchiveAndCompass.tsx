import { useEffect, useRef, useState } from 'react';
import { RotateCcw, ArrowUp } from 'lucide-react';
import type { Lang } from '../data/phase1Copy';
import { PHASE345_COPY } from '../data/phase345Copy';

interface Act6ArchiveAndCompassProps {
  lang: Lang;
  onArchiveInView: (inView: boolean) => void;
  onFooterInView: (inView: boolean) => void;
  onScrollTop: () => void;
}

type SchoolId = 'seth' | 'iit' | 'gnwt';

export function Act6ArchiveAndCompass({
  lang,
  onArchiveInView,
  onFooterInView,
  onScrollTop,
}: Act6ArchiveAndCompassProps) {
  const archiveSectionRef = useRef<HTMLElement | null>(null);
  const darkFooterRef = useRef<HTMLElement | null>(null);
  const [answers, setAnswers] = useState<Record<number, SchoolId>>({});

  useEffect(() => {
    const el = archiveSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => onArchiveInView(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onArchiveInView]);

  useEffect(() => {
    const el = darkFooterRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => onFooterInView(entry.isIntersecting),
      { rootMargin: '-8% 0px -80% 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onFooterInView]);

  const copy = PHASE345_COPY.act6;
  const totalQ = copy.compass.questions.length;
  const answeredCount = Object.keys(answers).length;
  const completed = answeredCount === totalQ;

  const winningSchool: SchoolId = (() => {
    const counts: Record<SchoolId, number> = { seth: 0, iit: 0, gnwt: 0 };
    Object.values(answers).forEach((s) => {
      counts[s] += 1;
    });
    if (counts.iit >= counts.seth && counts.iit >= counts.gnwt) return 'iit';
    if (counts.gnwt >= counts.seth && counts.gnwt >= counts.iit) return 'gnwt';
    return 'seth';
  })();

  const result = copy.compass.results[winningSchool];

  return (
    <>
      {/* ==================== PART 6A: ANTHROPIC WARM IVORY ARCHIVAL GALLERY ==================== */}
      <section
        id="act-6"
        ref={archiveSectionRef}
        className="bg-[#FAF9F5] text-[#141413] pt-28 md:pt-32 pb-16 md:pb-20 border-t border-[#141413]/10"
      >
        <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[#5E5D59]">
              <span className="w-2 h-2 rounded-full bg-[#FC4109]" />
              <span>{copy.archiveEyebrow[lang]}</span>
            </div>
            <h2 className="font-serif-editorial text-3xl md:text-5xl mt-3 leading-[1.14] text-[#141413]">
              {copy.archiveTitle[lang]}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.62] text-[#4B4A46]">
              {copy.archiveSubtitle[lang]}
            </p>
          </div>

          {/* Anthropic-Inspired Split-Color Archival Collage Cards (matching anthropic.com editorial craft) */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copy.cards.map((card) => (
              <article
                key={card.meta}
                className="group rounded-[20px] overflow-hidden bg-[#F5F4ED] border border-[#141413]/10 flex flex-col justify-between transition-shadow hover:shadow-[0_18px_48px_rgba(20,20,19,0.08)]"
              >
                <div>
                  {/* Split-Panel Visual Plate: Bold Flat Pigment Band + Archival Documentary Photograph */}
                  <div className="relative h-48 grid grid-cols-12 overflow-hidden border-b border-[#141413]/10">
                    <div
                      className="col-span-4 h-full flex flex-col justify-between p-3.5"
                      style={{ backgroundColor: card.accent }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#141413]/80" />
                      <div className="font-mono-tech text-[9.5px] font-semibold uppercase tracking-[0.09em] leading-[1.35] text-[#141413]">
                        <div>{card.tagLine1}</div>
                        <div className="opacity-75">{card.tagLine2}</div>
                      </div>
                    </div>
                    <div className="col-span-8 h-full relative overflow-hidden bg-[#E8E6DC]">
                      <img
                        src={card.image}
                        alt={card.title[lang]}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        style={{ filter: 'contrast(1.04) saturate(0.92)' }}
                      />
                    </div>
                  </div>

                  <div className="p-6 space-y-2.5">
                    <h3 className="font-display font-semibold text-[17px] leading-snug text-[#141413]">
                      {card.title[lang]}
                    </h3>
                    <p className="text-[13.5px] leading-[1.6] text-[#4B4A46]">
                      {card.desc[lang]}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-3.5 border-t border-[#141413]/10 font-mono-tech text-[11px] text-[#5E5D59]">
                  {card.meta}
                </div>
              </article>
            ))}
          </div>

          {/* ==================== PART 6B: INTERACTIVE CONSCIOUSNESS COMPASS ==================== */}
          <div className="mt-24 md:mt-28 rounded-[26px] bg-[#F5F4ED] border border-[#141413]/12 p-6 md:p-12">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-[#141413]/10">
              <div className="max-w-2xl">
                <div className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[#FC4109]">
                  {copy.compass.eyebrow[lang]}
                </div>
                <h2 className="font-serif-editorial text-2xl md:text-4xl mt-2 leading-tight text-[#141413]">
                  {copy.compass.title[lang]}
                </h2>
                <p className="mt-3 text-[15px] leading-[1.6] text-[#4B4A46]">
                  {copy.compass.subtitle[lang]}
                </p>
              </div>
              <div className="font-mono-tech text-xs px-3.5 py-1.5 rounded-full bg-[#E8E6DC] text-[#141413]">
                {answeredCount} / {totalQ}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {copy.compass.questions.map((item, qIdx) => (
                <div
                  key={qIdx}
                  className="rounded-2xl bg-[#FAF9F5] border border-[#141413]/10 p-5 md:p-6 space-y-4"
                >
                  <h3 className="font-display font-semibold text-[15px] leading-snug text-[#141413]">
                    {item.q[lang]}
                  </h3>
                  <div className="space-y-2">
                    {item.options.map((opt, oIdx) => {
                      const picked = answers[qIdx] === opt.school;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [qIdx]: opt.school as SchoolId,
                            }))
                          }
                          className={`v6-pill w-full text-left px-4 py-3 rounded-xl border text-[13.5px] leading-snug cursor-pointer ${
                            picked
                              ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                              : 'bg-[#F5F4ED] text-[#30302E] border-[#141413]/10 hover:bg-[#EAE7DD]'
                          }`}
                        >
                          {opt.label[lang]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Instant Compass Verdict Banner */}
            {completed && (
              <div className="mt-8 rounded-2xl bg-[#141413] text-[#FAF9F5] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-[fadeScaleIn_260ms_cubic-bezier(0.22,1,0.36,1)]">
                <div className="space-y-2 max-w-2xl">
                  <div className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[#FC4109]">
                    {lang === 'ru' ? 'ВАШ ФИЛОСОФСКИЙ ПРОФИЛЬ' : 'YOUR PHILOSOPHICAL PROFILE'}
                  </div>
                  <h3 className="font-serif-editorial text-2xl md:text-3xl text-[#FAF9F5]">
                    {result.title[lang]}
                  </h3>
                  <div className="font-mono-tech text-xs text-[#FAF9F5]/65">
                    {result.thinkers[lang]}
                  </div>
                  <p className="text-[14.5px] leading-[1.65] text-[#FAF9F5]/86 pt-1">
                    {result.desc[lang]}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAnswers({})}
                  className="v6-pill shrink-0 h-10 px-4 rounded-full bg-[#FAF9F5] text-[#141413] inline-flex items-center gap-2 text-xs font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{copy.compass.resetBtn[lang]}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== PART 6C: AUTHENTIC ANTHROPIC OBSIDIAN FOOTER ==================== */}
      <footer ref={darkFooterRef} className="bg-[#141413] text-[#FAF9F5] py-20 md:py-24">
        <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2.5">
              <span className="font-display font-bold text-xl tracking-[0.06em]">NOESIS</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FC4109]" />
            </div>
            <p className="font-serif-editorial text-lg md:text-xl text-[#FAF9F5]/85 leading-relaxed">
              {lang === 'ru'
                ? 'Атлас Сознания — интерактивное визуальное эссе о философии и нейронауке (редакция 2025–2026).'
                : 'Atlas of Consciousness — an interactive visual essay on philosophy & neuroscience (2025–2026 edition).'}
            </p>
            <div className="font-mono-tech text-[11.5px] tracking-[0.04em] text-[#FAF9F5]/55 pt-1">
              Nature 2025 · NEJM 2024 · TiCS 2025 · NYU Declaration 2024 · MIT Press 2024
            </div>
          </div>

          <button
            type="button"
            onClick={onScrollTop}
            className="v6-pill h-10 px-4 rounded-full bg-[#FAF9F5]/10 hover:bg-[#FAF9F5]/18 text-[#FAF9F5] border border-[#FAF9F5]/18 inline-flex items-center gap-2 font-mono-tech text-xs cursor-pointer self-start md:self-end"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Наверх · К порогу' : 'Back to top'}</span>
          </button>
        </div>
      </footer>
    </>
  );
}
