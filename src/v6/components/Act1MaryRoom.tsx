import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, X } from 'lucide-react';
import { PHASE1_COPY, type Lang } from '../data/phase1Copy';

gsap.registerPlugin(ScrollTrigger);

interface Act1MaryRoomProps {
  lang: Lang;
  onHudThemeChange: (theme: 'light' | 'dark') => void;
  onActiveChange: (active: boolean) => void;
}

function wavelengthToHex(nm: number): { hex: string; nameRu: string; nameEn: string; lCone: number; mCone: number; sCone: number } {
  const rawL = Math.exp(-Math.pow((nm - 595) / 58, 2));
  const rawM = Math.exp(-Math.pow((nm - 538) / 45, 2));
  const rawS = Math.exp(-Math.pow((nm - 442) / 34, 2));
  const maxC = Math.max(rawL, rawM, rawS, 0.001);
  // Relative channel dominance normalized to dominant cone class at this wavelength
  const l = Math.round((rawL / maxC) * 100);
  const m = Math.round((rawM / maxC) * 100);
  const s = Math.round((rawS / maxC) * 100);

  if (nm < 455) return { hex: '#4338CA', nameRu: 'Индиго-фиолетовый', nameEn: 'Deep Violet', lCone: l, mCone: m, sCone: s };
  if (nm < 495) return { hex: '#1D4ED8', nameRu: 'Кобальтово-синий', nameEn: 'Cobalt Blue', lCone: l, mCone: m, sCone: s };
  if (nm < 545) return { hex: '#0D7A5F', nameRu: 'Изумрудно-зелёный', nameEn: 'Emerald Green', lCone: l, mCone: m, sCone: s };
  if (nm < 585) return { hex: '#CA8A04', nameRu: 'Янтарно-золотой', nameEn: 'Amber Gold', lCone: l, mCone: m, sCone: s };
  if (nm < 625) return { hex: '#EA580C', nameRu: 'Киноварь', nameEn: 'Vermilion', lCone: l, mCone: m, sCone: s };
  return { hex: '#C92A2A', nameRu: 'Живой алый', nameEn: 'Living Crimson', lCone: l, mCone: m, sCone: s };
}

const DEFAULT_650 = wavelengthToHex(650);

export function Act1MaryRoom({ lang, onHudThemeChange, onActiveChange }: Act1MaryRoomProps) {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const stageRootRef = useRef<HTMLDivElement | null>(null);
  const colorLayerRef = useRef<HTMLDivElement | null>(null);
  const cobaltWashRef = useRef<HTMLDivElement | null>(null);
  const prismSpectrumRef = useRef<SVGGElement | null>(null);
  const rayWavePathRef = useRef<SVGPathElement | null>(null);
  const spikePathRef = useRef<SVGPathElement | null>(null);
  const kineticDotRef = useRef<HTMLDivElement | null>(null);
  const qualiaValueRef = useRef<HTMLSpanElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const hudDarkFlagRef = useRef(false);
  const lastColorTRef = useRef(0);

  const [activeBeat, setActiveBeat] = useState(0);
  const [isColoredPhase, setIsColoredPhase] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [wavelength, setWavelength] = useState(650);

  const langRef = useRef(lang);
  langRef.current = lang;

  // Immediately update imperative telemetry label when user switches RU / EN without waiting for scroll
  useEffect(() => {
    if (!qualiaValueRef.current) return;
    const tCopy = PHASE1_COPY.act1.telemetry;
    const c = lastColorTRef.current;
    qualiaValueRef.current.textContent =
      c > 0.35
        ? `${Math.round(c * 100)}% · ${tCopy.crimsonLabel[lang]}`
        : `0% · ${tCopy.monochromeLabel[lang]}`;
  }, [lang]);

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;

    const trigger = ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.55,
      onToggle: (self) => {
        onActiveChange(self.isActive);
        if (!self.isActive && hudDarkFlagRef.current) {
          hudDarkFlagRef.current = false;
          onHudThemeChange('light');
        }
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 -> 1

        // 1. Discrete story beat update (only triggers React state on 4 transitions, not per pixel!)
        const nextBeat = p < 0.25 ? 0 : p < 0.52 ? 1 : p < 0.72 ? 2 : 3;
        setActiveBeat((prev) => (prev === nextBeat ? prev : nextBeat));

        // 2. Optical Sine Ray & Spike Cascade draw progress (0.05 -> 0.58)
        if (rayWavePathRef.current) {
          const len = rayWavePathRef.current.getTotalLength();
          const waveT = Math.max(0, Math.min(1, (p - 0.04) / 0.28));
          rayWavePathRef.current.style.strokeDasharray = `${len}`;
          rayWavePathRef.current.style.strokeDashoffset = `${len * (1 - waveT)}`;
        }
        if (spikePathRef.current) {
          const len = spikePathRef.current.getTotalLength();
          const spikeT = Math.max(0, Math.min(1, (p - 0.24) / 0.32));
          spikePathRef.current.style.strokeDasharray = `${len}`;
          spikePathRef.current.style.strokeDashoffset = `${len * (1 - spikeT)}`;
        }

        // 3. Radial Physical Color Flood centered directly on the crimson rose (63.5% X, 57% Y)
        const colorT = Math.max(0, Math.min(1, (p - 0.58) / 0.34));
        const easedColor = colorT * colorT * (3 - 2 * colorT);
        const radiusPct = easedColor * 145;

        if (colorLayerRef.current) {
          colorLayerRef.current.style.clipPath = `circle(${radiusPct.toFixed(2)}% at 63.5% 57%)`;
        }
        if (cobaltWashRef.current) {
          cobaltWashRef.current.style.clipPath = `circle(${radiusPct.toFixed(2)}% at 63.5% 57%)`;
          cobaltWashRef.current.style.opacity = `${(easedColor * 0.92).toFixed(3)}`;
        }
        if (prismSpectrumRef.current) {
          prismSpectrumRef.current.style.opacity = `${easedColor.toFixed(3)}`;
        }

        // 4. Refined Architectural Optical Reticle Dot gliding cleanly from Prism -> Crimson Rose
        if (kineticDotRef.current) {
          const travelT = Math.max(0, Math.min(1, p / 0.64));
          // Aligns cleanly along the prism exit ray directly onto the rose center (62.8%, 55.5%)
          const xPct = 28.5 + travelT * 34.3;
          const yPct = 70.5 - travelT * 15.0;
          const igniteScale = 1 + easedColor * 0.35;

          kineticDotRef.current.style.left = `${xPct.toFixed(2)}%`;
          kineticDotRef.current.style.top = `${yPct.toFixed(2)}%`;
          kineticDotRef.current.style.transform = `translate(-50%, -50%) scale(${igniteScale.toFixed(3)})`;
          kineticDotRef.current.style.opacity = `${(0.2 + Math.min(1, p * 4) * 0.8).toFixed(2)}`;
        }

        // 5. Direct ref updates for bottom telemetry & progress hairline
        lastColorTRef.current = easedColor;
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }
        if (qualiaValueRef.current) {
          const tCopy = PHASE1_COPY.act1.telemetry;
          qualiaValueRef.current.textContent =
            easedColor > 0.35
              ? `${Math.round(easedColor * 100)}% · ${tCopy.crimsonLabel[langRef.current]}`
              : `0% · ${tCopy.monochromeLabel[langRef.current]}`;
        }

        // 6. Lock white-on-cobalt typography & HUD contrast synchronously with color-burst progress!
        const shouldBeColored = easedColor > 0.36;
        if (stageRootRef.current) {
          stageRootRef.current.dataset.colored = shouldBeColored ? 'true' : 'false';
        }
        setIsColoredPhase((prev) => (prev === shouldBeColored ? prev : shouldBeColored));
        if (shouldBeColored !== hudDarkFlagRef.current) {
          hudDarkFlagRef.current = shouldBeColored;
          onHudThemeChange(shouldBeColored ? 'dark' : 'light');
        }
      },
    });

    // Also observe section visibility cleanly so HUD switches to Chamber 01 immediately even on instant jumps
    const visObserver = new IntersectionObserver(
      ([entry]) => {
        onActiveChange(entry.isIntersecting);
      },
      { threshold: 0.15 },
    );
    visObserver.observe(runway);

    return () => {
      visObserver.disconnect();
      trigger.kill();
    };
  }, [onHudThemeChange, onActiveChange]);

  const beat = PHASE1_COPY.act1.beats[activeBeat] ?? PHASE1_COPY.act1.beats[0];
  const spec = wavelengthToHex(wavelength);
  const frequencyThz = Math.round(299792 / wavelength);

  return (
    <section
      id="act-1"
      ref={runwayRef}
      className="relative h-[360vh] bg-[#ECEAE4]"
      aria-label={lang === 'ru' ? 'Зал 01 — Комната Мэри' : 'Chamber 01 — Mary’s Room'}
    >
      {/* Sticky Full-Viewport Theatrical 2.5D Stage (HUMAN.md architecture) */}
      <div
        ref={stageRootRef}
        data-colored={isColoredPhase ? 'true' : 'false'}
        className="sticky top-0 h-[100svh] w-full overflow-hidden group/mary"
      >
        {/* LAYER A: Stark 100% Monochrome Studio Photograph (Mary's Physics Room) */}
        <div className="absolute inset-0">
          <img
            src="/v6/mary-still-life.jpg"
            alt=""
            className="w-full h-full object-cover object-bottom select-none"
            style={{ filter: 'grayscale(1) contrast(1.06) brightness(0.98)' }}
          />
        </div>

        {/* LAYER B: Full Vivid Color Studio Photograph revealed radially from the Crimson Rose */}
        <div
          ref={colorLayerRef}
          className="absolute inset-0 will-change-[clip-path]"
          style={{ clipPath: 'circle(0% at 63.5% 57%)' }}
        >
          <img
            src="/v6/mary-still-life.jpg"
            alt={
              lang === 'ru'
                ? 'Хрустальная призма, алая роза и латунная линза на каменной полке'
                : 'Crystal prism, crimson rose, and brass optical lens on a travertine shelf'
            }
            className="w-full h-full object-cover object-bottom select-none"
            style={{ filter: 'saturate(1.16) contrast(1.03)' }}
          />
        </div>

        {/* LAYER C: Theatrical Klein Cobalt (#004EDF) Upper Wall Wash (keeps stone shelf & rose crisp!) */}
        <div
          ref={cobaltWashRef}
          className="absolute inset-0 pointer-events-none will-change-[clip-path,opacity]"
          style={{
            opacity: 0,
            clipPath: 'circle(0% at 63.5% 57%)',
            background:
              'linear-gradient(180deg, rgba(0, 78, 223, 0.94) 0%, rgba(0, 78, 223, 0.86) 48%, rgba(0, 78, 223, 0.25) 68%, rgba(0, 78, 223, 0) 80%)',
            mixBlendMode: 'multiply',
          }}
        />

        {/* LAYER D: Precision Optical Vector Overlay (650nm Sine Wave -> Prism -> Cortical Spikes) */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          {/* Monochrome incoming photon wave (left -> prism) */}
          <path
            ref={rayWavePathRef}
            d="M 0 650 Q 25 620 50 650 T 100 650 T 150 650 T 200 650 T 250 650 T 300 650"
            fill="none"
            stroke={isColoredPhase ? '#FAF9F5' : '#141413'}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.72"
            style={{ strokeDasharray: 500, strokeDashoffset: 500 }}
          />

          {/* Cortical neural spike cascade between Prism and Crimson Rose */}
          <path
            ref={spikePathRef}
            d="M 420 635 L 490 618 L 502 572 L 514 636 L 526 606 L 570 595 L 582 544 L 594 612 L 606 584 L 665 568 L 677 518 L 689 586 L 702 558 L 855 516"
            fill="none"
            stroke={isColoredPhase ? '#FAF9F5' : '#141413'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.78"
            style={{ strokeDasharray: 900, strokeDashoffset: 900 }}
          />

          {/* Prismatic Color Dispersion Fan blossoming out of the crystal prism on color reveal */}
          <g ref={prismSpectrumRef} style={{ opacity: 0 }}>
            <line x1="405" y1="635" x2="885" y2="486" stroke="#FC4109" strokeWidth="3.5" opacity="0.65" />
            <line x1="408" y1="642" x2="890" y2="514" stroke="#F59E0B" strokeWidth="2.6" opacity="0.55" />
            <line x1="412" y1="648" x2="892" y2="544" stroke="#10B981" strokeWidth="2.2" opacity="0.45" />
            <line x1="415" y1="654" x2="892" y2="574" stroke="#60A5FA" strokeWidth="2.2" opacity="0.45" />
          </g>
        </svg>

        {/* LAYER E: Delicate Architectural Optical Reticle & Soft Translucent Light Bloom */}
        <div
          ref={kineticDotRef}
          className="absolute z-20 pointer-events-none will-change-transform flex items-center justify-center"
          style={{
            left: '28.5%',
            top: '70.5%',
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 0.2,
          }}
        >
          <span
            className="w-7 h-7 rounded-full border transition-all duration-500 flex items-center justify-center"
            style={{
              borderColor: isColoredPhase ? 'rgba(250, 249, 245, 0.78)' : 'rgba(20, 20, 19, 0.45)',
              backgroundColor: isColoredPhase ? 'rgba(252, 65, 9, 0.24)' : 'rgba(250, 249, 245, 0.25)',
              boxShadow: isColoredPhase ? '0 0 36px 8px rgba(252, 65, 9, 0.42)' : 'none',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: isColoredPhase ? '#FC4109' : '#141413' }}
            />
          </span>
        </div>

        {/* Soft studio shadow blend over the lower plinth edge so bottom edge never looks abrupt */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 z-20"
          style={{
            background: 'linear-gradient(180deg, rgba(20,18,16,0) 0%, rgba(28,24,19,0.44) 100%)',
          }}
        />

        {/* LAYER F: Monumental HUMAN.md Editorial Typography cleanly framed LEFT of the rose (guaranteed white on cobalt!) */}
        <div className="relative z-30 max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20 pt-20 md:pt-24">
          <div className="max-w-2xl lg:max-w-[740px]">
            <div className="font-mono-tech text-[11px] md:text-[12px] tracking-[0.06em] uppercase transition-colors duration-300 text-[#5E5D59] group-data-[colored=true]/mary:text-[#FAF9F5]/85">
              {beat.kicker[lang]}
            </div>

            <h2
              key={activeBeat}
              className="mt-3 text-[clamp(26px,3.6vw,52px)] leading-[1.09] tracking-[-0.026em] transition-colors duration-300 text-[#141413] group-data-[colored=true]/mary:text-[#FAF9F5] animate-[beatRise_420ms_cubic-bezier(0.22,1,0.36,1)]"
            >
              <span className="font-display font-bold block">{beat.headlineMain[lang]}</span>
              <span className="font-serif-editorial italic font-normal block mt-1 text-[#3B3A37] group-data-[colored=true]/mary:text-[#FFE4D6]">
                {beat.headlineAccent[lang]}
              </span>
            </h2>

            <p
              key={`note-${activeBeat}`}
              className="mt-3.5 max-w-lg text-[14px] md:text-[15px] leading-[1.58] transition-colors duration-300 text-[#3B3A37] group-data-[colored=true]/mary:text-[#FAF9F5]/90 animate-[beatRise_480ms_cubic-bezier(0.22,1,0.36,1)]"
            >
              {beat.note[lang]}
            </p>
          </div>
        </div>

        {/* LAYER G: Whisper-Quiet Bottom Telemetry & Anthropic Dossier Trigger */}
        <div className="absolute bottom-5 md:bottom-7 inset-x-0 z-30">
          <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20 flex flex-wrap items-end justify-between gap-4">
            {/* Compact Frosted Telemetry Bar (Zero Dashboard Clutter) */}
            <div className="inline-flex flex-wrap items-center gap-4 md:gap-6 px-4 py-2.5 rounded-2xl bg-[#FAF9F5]/90 backdrop-blur-md border border-[#141413]/12 text-[#141413] shadow-[0_8px_28px_rgba(20,20,19,0.08)]">
              <div>
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                  {PHASE1_COPY.act1.telemetry.wavelength[lang]}
                </div>
                <div className="font-mono-tech text-[13px] font-semibold">
                  {lang === 'ru' ? '650 нм · 461 ТГц' : '650 nm · 461 THz'}
                </div>
              </div>
              <div className="h-6 w-[1px] bg-[#141413]/12" />
              <div>
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                  {PHASE1_COPY.act1.telemetry.cones[lang]}
                </div>
                <div className="font-mono-tech text-[13px] font-semibold">
                  L: {DEFAULT_650.lCone}% · M: {DEFAULT_650.mCone}%
                </div>
              </div>
              <div className="h-6 w-[1px] bg-[#141413]/12 hidden sm:block" />
              <div className="hidden sm:block min-w-[138px]">
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                  {PHASE1_COPY.act1.telemetry.qualia[lang]}
                </div>
                <span
                  ref={qualiaValueRef}
                  className="font-mono-tech text-[13px] font-semibold text-[#FC4109]"
                >
                  0% · {PHASE1_COPY.act1.telemetry.monochromeLabel[lang]}
                </span>
              </div>
            </div>

            {/* Clean Progress + Anthropic Dossier Button */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block w-28 h-[3px] rounded-full bg-[#141413]/16 overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full w-full origin-left bg-[#FC4109]"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>

              <button
                type="button"
                onClick={() => setDossierOpen(true)}
                className="v6-pill h-10 px-4 rounded-full bg-[#FAF9F5]/94 hover:bg-[#FAF9F5] text-[#141413] border border-[#141413]/15 shadow-[0_8px_24px_rgba(20,20,19,0.10)] backdrop-blur-md inline-flex items-center gap-2 text-[13px] font-medium cursor-pointer"
              >
                <span>{PHASE1_COPY.act1.dossierBtn[lang]}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#FC4109]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Anthropic-Style Warm Ivory Slide-Over Research Dossier */}
      {dossierOpen && (
        <div
          className="fixed inset-0 z-[75] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={PHASE1_COPY.act1.dossier.title[lang]}
        >
          <button
            type="button"
            onClick={() => setDossierOpen(false)}
            className="absolute inset-0 bg-[#141413]/38 backdrop-blur-xs cursor-default"
            aria-label="Close dossier"
          />

          <aside
            data-lenis-prevent
            className="relative z-10 w-full max-w-xl h-full overflow-y-auto bg-[#FAF9F5] text-[#141413] border-l border-[#141413]/12 shadow-2xl p-6 md:p-10 space-y-8"
          >
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#141413]/10">
              <div>
                <div className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#FC4109]">
                  {PHASE1_COPY.act1.dossier.eyebrow[lang]}
                </div>
                <h3 className="font-serif-editorial text-2xl md:text-3xl mt-2 leading-snug">
                  {PHASE1_COPY.act1.dossier.title[lang]}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDossierOpen(false)}
                className="v6-pill w-9 h-9 rounded-full bg-[#E8E6DC] hover:bg-[#DFDCD0] flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[15px] leading-[1.65] text-[#3B3A37]">
              {PHASE1_COPY.act1.dossier.intro[lang]}
            </p>

            {/* Interactive Spectrum & Cone Response Explorer */}
            <div className="rounded-2xl bg-[#F0EEE6] border border-[#141413]/10 p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#5E5D59]">
                  {PHASE1_COPY.act1.dossier.wavelengthLabel[lang]}
                </span>
                <span className="inline-flex items-center gap-2 font-mono-tech text-xs font-semibold">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-[#141413]/20"
                    style={{ backgroundColor: spec.hex }}
                  />
                  <span>
                    {wavelength} {lang === 'ru' ? 'нм' : 'nm'} · {lang === 'ru' ? spec.nameRu : spec.nameEn}
                  </span>
                </span>
              </div>

              <input
                type="range"
                min={420}
                max={690}
                value={wavelength}
                onChange={(e) => setWavelength(Number(e.target.value))}
                className="v6-wavelength-slider w-full cursor-pointer"
              />

              <div className="grid grid-cols-4 gap-2 pt-1 font-mono-tech text-[11px]">
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#141413]/8">
                  <div className="text-[#5E5D59]">f</div>
                  <div className="font-semibold text-sm mt-0.5">{frequencyThz} THz</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#141413]/8">
                  <div className="text-[#5E5D59]">L-cone</div>
                  <div className="font-semibold text-sm mt-0.5">{spec.lCone}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#141413]/8">
                  <div className="text-[#5E5D59]">M-cone</div>
                  <div className="font-semibold text-sm mt-0.5">{spec.mCone}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#141413]/8">
                  <div className="text-[#5E5D59]">S-cone</div>
                  <div className="font-semibold text-sm mt-0.5">{spec.sCone}%</div>
                </div>
              </div>
            </div>

            {/* Philosophical Schools Hairline List (Anthropic System-Card elegance) */}
            <div className="divide-y divide-[#141413]/10 border-t border-b border-[#141413]/10">
              {PHASE1_COPY.act1.dossier.schools.map((school) => (
                <div key={school.author} className="py-4 space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-display font-semibold text-[15px] text-[#141413]">
                      {school.name[lang]}
                    </h4>
                    <span className="font-mono-tech text-[11px] text-[#5E5D59]">
                      {school.author}
                    </span>
                  </div>
                  <p className="text-[14px] leading-[1.6] text-[#4B4A46]">
                    {school.stance[lang]}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
