import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '../data/phase1Copy';
import { PHASE2_COPY } from '../data/phase2Copy';

gsap.registerPlugin(ScrollTrigger);

interface Act4ScienceTableProps {
  lang: Lang;
  onHudThemeChange: (theme: 'light' | 'dark') => void;
  onActiveChange: (active: boolean) => void;
}

export function Act4ScienceTable({
  lang,
  onHudThemeChange,
  onActiveChange,
}: Act4ScienceTableProps) {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const [activeStation, setActiveStation] = useState(0);

  useEffect(() => {
    const runway = runwayRef.current;
    const track = trackRef.current;
    if (!runway || !track) return;

    const trigger = ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.55,
      onToggle: (self) => {
        onActiveChange(self.isActive);
        if (self.isActive) {
          onHudThemeChange('light');
        }
      },
      onUpdate: (self) => {
        const p = self.progress;
        // Brief 8% dwell on Station 01 before panning smoothly across Stations 01 -> 04
        const panP = Math.max(0, Math.min(1, (p - 0.08) / 0.86));
        const maxShift = Math.max(0, track.scrollWidth - window.innerWidth + 80);
        track.style.transform = `translate3d(${(-panP * maxShift).toFixed(1)}px, 0, 0)`;

        if (dotRef.current) {
          const leftPct = 8 + panP * 84;
          const bob = Math.abs(Math.sin(panP * Math.PI * 3)) * -12;
          dotRef.current.style.left = `${leftPct.toFixed(2)}%`;
          dotRef.current.style.transform = `translate3d(-50%, ${bob.toFixed(1)}px, 0)`;
        }
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }

        const idx = panP < 0.25 ? 0 : panP < 0.56 ? 1 : panP < 0.84 ? 2 : 3;
        setActiveStation((prev) => (prev === idx ? prev : idx));
      },
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      trigger.kill();
    };
  }, [onHudThemeChange, onActiveChange]);

  const copy = PHASE2_COPY.act4Table;

  return (
    <section
      id="act-4"
      ref={runwayRef}
      className="relative h-[360vh]"
      style={{ backgroundColor: '#B8842E' }}
      aria-label={lang === 'ru' ? 'Зал 04A — Длинный стол науки' : 'Chamber 04A — The Long Table of Science'}
    >
      {/* Sticky Horizontal Banquet Stage (HUMAN.md Ochre Wall + Crisp White Linen Tablecloth) */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between">
        {/* Painterly Museum Ochre Wall (Upper 68%) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, #AE7B26 0%, #BD8A34 55%, #A77422 68%, #F4F2EC 68.1%, #FAF9F5 72%, #ECEAE2 100%)',
          }}
        />
        {/* Crisp White Linen Tablecloth Drop Shadow along the horizon */}
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            top: '68%',
            height: '28px',
            background:
              'linear-gradient(180deg, rgba(20,20,19,0.08) 0%, rgba(20,20,19,0) 100%)',
          }}
        />

        {/* Top Editorial Header fixed neatly on the Ochre Wall with generous breathing room above cards */}
        <div className="relative z-20 max-w-[1360px] w-full mx-auto px-5 md:px-12 lg:px-20 pt-22 md:pt-24 pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#141413]/72">
              {copy.eyebrow[lang]}
            </div>
            <h2 className="mt-1.5 text-[clamp(24px,3.3vw,46px)] leading-[1.06] tracking-[-0.026em] text-[#141413]">
              <span className="font-display font-bold">{copy.titleMain[lang]} </span>
              <span className="font-serif-editorial italic font-normal text-[#FAF9F5]">
                {copy.titleAccent[lang]}
              </span>
            </h2>
          </div>

          <div className="font-mono-tech text-[11px] px-3.5 py-1.5 rounded-full bg-[#FAF9F5]/90 text-[#141413] border border-[#141413]/12">
            {copy.scrollHint[lang]}
          </div>
        </div>

        {/* Horizontally Panning Banquet Track of 4 Documentary Stations */}
        <div className="relative z-10 flex-1 flex items-center overflow-visible">
          <div
            ref={trackRef}
            className="flex items-end gap-8 md:gap-12 pl-5 md:pl-16 lg:pl-24 pr-24 will-change-transform"
          >
            {copy.stations.map((st, idx) => (
              <article
                key={st.year}
                className="w-[84vw] sm:w-[540px] md:w-[620px] shrink-0 rounded-[22px] overflow-hidden bg-[#FAF9F5] text-[#141413] border border-[#141413]/14 shadow-[0_24px_60px_rgba(45,28,5,0.22)] flex flex-col"
              >
                {/* Visual Plate Top Half (Cohesive Warm Documentary Photography — Zero Neon Clipart!) */}
                <div className="relative h-[205px] md:h-[225px] w-full overflow-hidden bg-[#ECE8DF]">
                  {idx === 0 ? (
                    /* Station 1: Archival Chalmers vs Koch Wager Diptych (1998 -> 2023) */
                    <div className="relative w-full h-full grid grid-cols-2 bg-[#B8842E]">
                      <div className="relative overflow-hidden border-r border-[#FAF9F5]/30">
                        <img
                          src="/photos/chalmers.jpg"
                          alt="David Chalmers"
                          className="w-full h-full object-cover object-top"
                          style={{ filter: 'sepia(0.16) contrast(1.04)' }}
                        />
                        <span className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-full bg-[#141413]/78 text-[#FAF9F5] font-mono-tech text-[10px]">
                          {st.portraits[0].name[lang]} · 1998
                        </span>
                      </div>
                      <div className="relative overflow-hidden">
                        <img
                          src="/photos/koch.jpg"
                          alt="Christof Koch"
                          className="w-full h-full object-cover object-top"
                          style={{ filter: 'sepia(0.16) contrast(1.04)' }}
                        />
                        <span className="absolute bottom-2.5 right-3 px-2.5 py-0.5 rounded-full bg-[#141413]/78 text-[#FAF9F5] font-mono-tech text-[10px]">
                          {st.portraits[1]?.name[lang] ?? 'C. Koch'} · 2023
                        </span>
                      </div>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#FC4109] text-[#FAF9F5] border-[3px] border-[#FAF9F5] shadow-xl flex flex-col items-center justify-center text-center">
                        <span className="font-mono-tech text-[9px] tracking-widest uppercase">WAGER</span>
                        <span className="font-serif-editorial italic text-sm font-bold leading-tight">25 yrs</span>
                        <span className="font-mono-tech text-[8px] opacity-85">MADEIRA</span>
                      </div>
                    </div>
                  ) : idx === 2 ? (
                    /* Station 3: Clean Documentary COGITATE Adversaries Diptych (Koch IIT vs Dehaene GNWT — Zero Neon Stock!) */
                    <div className="relative w-full h-full grid grid-cols-2 bg-[#ECE8DF]">
                      <div className="relative overflow-hidden border-r border-[#FAF9F5]/35">
                        <img
                          src="/photos/koch.jpg"
                          alt="Christof Koch (IIT)"
                          className="w-full h-full object-cover object-top"
                          style={{ filter: 'sepia(0.10) contrast(1.05)' }}
                        />
                        <span className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-full bg-[#D94225]/92 text-[#FAF9F5] font-mono-tech text-[10px]">
                          IIT · {lang === 'ru' ? 'К. Кох' : 'C. Koch'}
                        </span>
                      </div>
                      <div className="relative overflow-hidden">
                        <img
                          src="/photos/dehaene.jpg"
                          alt="Stanislas Dehaene (GNWT)"
                          className="w-full h-full object-cover object-top"
                          style={{ filter: 'sepia(0.10) contrast(1.05)' }}
                        />
                        <span className="absolute bottom-2.5 right-3 px-2.5 py-0.5 rounded-full bg-[#004EDF]/92 text-[#FAF9F5] font-mono-tech text-[10px]">
                          GNWT · {lang === 'ru' ? 'С. Деан' : 'S. Dehaene'}
                        </span>
                      </div>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-[#FAF9F5] text-[#141413] border border-[#141413]/14 shadow-lg font-mono-tech text-[10.5px] font-bold">
                        IIT vs GNWT
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={st.image}
                        alt={st.title[lang]}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/20 via-transparent to-transparent" />
                    </>
                  )}

                  {/* Top-Right Year Stamp */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FAF9F5]/92 text-[#141413] font-mono-tech text-[11px] font-semibold border border-[#141413]/12">
                    {st.year}
                  </div>
                </div>

                {/* Clean Editorial Card Body resting visually on the White Linen Tablecloth */}
                <div className="p-5 md:p-6 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#C84319] font-semibold">
                      {st.tag[lang]}
                    </div>
                    <h3 className="font-display font-semibold text-lg md:text-xl mt-1 leading-snug text-[#141413]">
                      {st.title[lang]}
                    </h3>
                    <p className="mt-2 text-[13.5px] md:text-[14px] leading-[1.58] text-[#4B4A46]">
                      {st.body[lang]}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#141413]/10 flex items-center justify-between font-mono-tech text-[11px] text-[#5E5D59]">
                    <span>{st.metric[lang]}</span>
                    <span className="text-[#141413] font-semibold">0{idx + 1} / 04</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom Linen Table Timeline + Rolling Kinetic Qualia Dot (#FC4109) */}
        <div className="relative z-20 max-w-[1360px] w-full mx-auto px-5 md:px-12 lg:px-20 pb-6 md:pb-8">
          <div className="relative pt-5">
            {/* Kinetic #FC4109 Dot rolling along the white linen tablecloth */}
            <div
              ref={dotRef}
              className="absolute top-0 w-4 h-4 rounded-full bg-[#FC4109] shadow-[0_4px_14px_rgba(252,65,9,0.45)] pointer-events-none will-change-transform"
              style={{ left: '8%', transform: 'translate3d(-50%, 0, 0)' }}
            />

            <div className="h-[2px] w-full bg-[#141413]/12 rounded-full overflow-hidden">
              <div
                ref={barRef}
                className="h-full w-full origin-left bg-[#141413]"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between font-mono-tech text-[11px]">
              {copy.stations.map((st, idx) => (
                <span
                  key={st.year}
                  className={`transition-colors ${
                    idx === activeStation ? 'text-[#141413] font-semibold' : 'text-[#5E5D59]'
                  }`}
                >
                  {st.year}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
