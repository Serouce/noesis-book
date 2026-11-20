import { useEffect, useRef, useState } from 'react';
import { Play, X, RotateCcw, ArrowDown } from 'lucide-react';
import { PHASE1_COPY, type Lang } from '../data/phase1Copy';

interface Act0PrologueProps {
  lang: Lang;
  onScrollToAct1: () => void;
}

export function Act0Prologue({ lang, onScrollToAct1 }: Act0PrologueProps) {
  const [mibActive, setMibActive] = useState(false);
  const [mibSeconds, setMibSeconds] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef(true);

  // Viewport-gated Motion-Induced Blindness optical simulation (runs ONLY when active & visible)
  useEffect(() => {
    if (!mibActive) {
      setMibSeconds(0);
      return;
    }

    const canvas = canvasRef.current;
    const wrapper = containerRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );
    observer.observe(wrapper);

    let rafId = 0;
    let angle = 0;
    const startTime = performance.now();
    let lastSecondTick = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      if (!isVisibleRef.current) return;

      const elapsedSec = Math.floor((now - startTime) / 1000);
      if (elapsedSec !== lastSecondTick) {
        lastSecondTick = elapsedSec;
        setMibSeconds(elapsedSec);
      }

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#121418';
      ctx.fillRect(0, 0, w, h);

      // Rotating blue distractor cross lattice (Bonneh et al., Nature 2001)
      angle += 0.017;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = 'rgba(72, 138, 255, 0.72)';
      ctx.lineWidth = 1.65;
      const span = Math.max(w, h) * 0.56;
      const step = 38;
      for (let gx = -span; gx <= span; gx += step) {
        for (let gy = -span; gy <= span; gy += step) {
          ctx.beginPath();
          ctx.moveTo(gx - 5.5, gy);
          ctx.lineTo(gx + 5.5, gy);
          ctx.moveTo(gx, gy - 5.5);
          ctx.lineTo(gx, gy + 5.5);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Subtle protection ring around the 3 stationary targets so grid crosses don't collide directly
      const radius = Math.min(w, h) * 0.28;
      const targetAngles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

      targetAngles.forEach((a) => {
        const tx = cx + Math.cos(a) * radius;
        const ty = cy + Math.sin(a) * radius;
        ctx.fillStyle = '#121418';
        ctx.beginPath();
        ctx.arc(tx, ty, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(tx, ty, 6.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Blinking vermilion fixation point (#FC4109 — the Kinetic Qualia Dot!)
      const blinkOn = Math.sin(now * 0.011) > -0.35;
      if (blinkOn) {
        ctx.fillStyle = '#FC4109';
        ctx.beginPath();
        ctx.arc(cx, cy, 5.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [mibActive]);

  const copy = PHASE1_COPY.act0;

  return (
    <section
      id="act-0"
      className="relative bg-[#FAF9F5] text-[#141413] pt-20 md:pt-24 pb-20 md:pb-26"
    >
      <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Quiet Monograph Eyebrow */}
        <div className="flex items-center gap-2.5 font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[#5E5D59] mb-4 md:mb-5">
          <span className="w-2 h-2 rounded-full bg-[#FC4109]" />
          <span>{copy.eyebrow[lang]}</span>
        </div>

        {/* Authentic Anthropic Dual-Voice Editorial Statement (Bold Grotesque + Optical Serif) */}
        <h1 className="max-w-[1040px] text-[clamp(25px,3.2vw,44px)] leading-[1.22] tracking-[-0.018em] text-[#141413] font-normal">
          <span className="font-display font-semibold text-[#141413]">
            {copy.leadBold[lang]}
          </span>
          <span className="font-serif-editorial font-normal text-[#4B4A46]">
            {copy.leadSerif[lang]}
          </span>
        </h1>

        {/* Wide Serene Anthropic-Inspired Sky Frame / Interactive 4-Second Optical Trigger */}
        <div
          ref={containerRef}
          className="relative mt-7 md:mt-9 w-full aspect-[16/9] max-h-[580px] rounded-[20px] overflow-hidden border border-[#141413]/10 bg-[#E8E6DC] shadow-[0_24px_70px_rgba(20,20,19,0.06)]"
        >
          {!mibActive ? (
            <>
              <img
                src="/v6/hero-sky.jpg"
                alt={
                  lang === 'ru'
                    ? 'Солнечные облака и тонкое преломление света'
                    : 'Sunlit cumulus clouds with warm prismatic light refraction'
                }
                className="w-full h-full object-cover object-center scale-[1.01] transition-transform duration-700 ease-out"
              />
              {/* Very delicate bottom gradient solely for caption legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/28 via-transparent to-transparent pointer-events-none" />

              {/* Centered Anthropic-Style Glass Ivory Play Trigger */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <button
                  type="button"
                  onClick={() => setMibActive(true)}
                  className="v6-pill group inline-flex items-center gap-3.5 pl-4 pr-5 py-3 rounded-full bg-[#FAF9F5]/92 hover:bg-[#FAF9F5] text-[#141413] border border-[#141413]/12 shadow-[0_14px_40px_rgba(20,20,19,0.18)] backdrop-blur-md cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-[#141413] text-[#FAF9F5] flex items-center justify-center group-hover:bg-[#FC4109] transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </span>
                  <span className="font-sans-ui text-[13px] md:text-[14px] font-medium tracking-[-0.01em]">
                    {copy.skyPlayCta[lang]}
                  </span>
                </button>
              </div>

              {/* Quiet bottom caption inside frame */}
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-4 text-[12px] text-[#FAF9F5]/92 font-sans-ui pointer-events-none">
                <span>{copy.skyCaptionLeft[lang]}</span>
                <span className="hidden sm:inline font-mono-tech text-[11px] opacity-85">
                  NOESIS · 00 / 06
                </span>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full bg-[#121418]">
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Minimal top overlay controls */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
                <div className="px-3 py-1.5 rounded-full bg-[#141413]/75 backdrop-blur-md border border-[#FAF9F5]/14 font-mono-tech text-[11px] text-[#FAF9F5]/85">
                  {copy.mibBadge[lang]} · <span className="text-[#FC4109]">{mibSeconds}s</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMibActive(false);
                      setTimeout(() => setMibActive(true), 40);
                    }}
                    className="v6-pill h-8 px-3 rounded-full bg-[#FAF9F5]/12 hover:bg-[#FAF9F5]/20 text-[#FAF9F5] border border-[#FAF9F5]/18 inline-flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">{copy.mibReset[lang]}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMibActive(false)}
                    className="v6-pill h-8 px-3.5 rounded-full bg-[#FAF9F5] text-[#141413] inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  >
                    <span>{copy.mibClose[lang]}</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Clean bottom instruction bar */}
              <div className="absolute bottom-4 left-4 right-4 max-w-2xl px-4 py-3 rounded-2xl bg-[#141413]/82 backdrop-blur-md border border-[#FAF9F5]/12 text-[12px] md:text-[13px] leading-relaxed text-[#FAF9F5]/90">
                {copy.mibInstruction[lang]}
              </div>
            </div>
          )}
        </div>

        {/* Restrained Anthropic 3-Column Hairline Research Strip */}
        <div className="mt-14 md:mt-16 pt-8 border-t border-[#141413]/12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {copy.highlights.map((item) => (
            <div key={item.stat} className="space-y-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#5E5D59]">
                  {item.tag[lang]}
                </span>
                <span className="font-display font-semibold text-2xl md:text-3xl text-[#141413] font-mono-tech">
                  {item.stat}
                </span>
              </div>
              <h2 className="font-display font-semibold text-[15px] text-[#141413]">
                {item.title[lang]}
              </h2>
              <p className="text-[14px] leading-[1.58] text-[#5E5D59]">
                {item.desc[lang]}
              </p>
            </div>
          ))}
        </div>

        {/* Gentle Scroll Cue leading directly into Act 1 (Mary's Room) */}
        <div className="mt-14 md:mt-20 flex items-center justify-between pt-6 border-t border-[#141413]/8">
          <button
            type="button"
            onClick={onScrollToAct1}
            className="v6-pill group inline-flex items-center gap-3 text-sm font-medium text-[#141413] hover:text-[#FC4109] cursor-pointer"
          >
            <span className="w-8 h-8 rounded-full border border-[#141413]/18 group-hover:border-[#FC4109] flex items-center justify-center transition-colors">
              <ArrowDown className="w-3.5 h-3.5" />
            </span>
            <span>{copy.scrollPrompt[lang]}</span>
          </button>

          <span className="hidden sm:inline font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
            {lang === 'ru' ? 'СКРОЛЛ УПРАВЛЯЕТ СЦЕНОЙ' : 'SCROLL DRIVES THE STAGE'}
          </span>
        </div>
      </div>
    </section>
  );
}
