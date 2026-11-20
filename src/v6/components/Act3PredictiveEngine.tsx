import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, X } from 'lucide-react';
import type { Lang } from '../data/phase1Copy';
import { PHASE2_COPY } from '../data/phase2Copy';

gsap.registerPlugin(ScrollTrigger);

interface Act3PredictiveEngineProps {
  lang: Lang;
  onHudThemeChange: (theme: 'light' | 'dark') => void;
  onActiveChange: (active: boolean) => void;
}

// Generate an authentic involute-like spur gear SVG path
function createGearPath(teeth: number, outerR: number, innerR: number, holeR: number): string {
  const step = (Math.PI * 2) / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.18;
    const a2 = a0 + step * 0.32;
    const a3 = a0 + step * 0.62;
    const a4 = a0 + step * 0.76;

    const p0x = Math.cos(a0) * innerR;
    const p0y = Math.sin(a0) * innerR;
    const p1x = Math.cos(a1) * innerR;
    const p1y = Math.sin(a1) * innerR;
    const p2x = Math.cos(a2) * outerR;
    const p2y = Math.sin(a2) * outerR;
    const p3x = Math.cos(a3) * outerR;
    const p3y = Math.sin(a3) * outerR;
    const p4x = Math.cos(a4) * innerR;
    const p4y = Math.sin(a4) * innerR;

    d += i === 0 ? `M ${p0x.toFixed(1)} ${p0y.toFixed(1)} ` : `L ${p0x.toFixed(1)} ${p0y.toFixed(1)} `;
    d += `L ${p1x.toFixed(1)} ${p1y.toFixed(1)} L ${p2x.toFixed(1)} ${p2y.toFixed(1)} L ${p3x.toFixed(1)} ${p3y.toFixed(1)} L ${p4x.toFixed(1)} ${p4y.toFixed(1)} `;
  }
  d += 'Z ';
  // Center hole (even-odd)
  d += `M ${holeR} 0 A ${holeR} ${holeR} 0 1 0 ${-holeR} 0 A ${holeR} ${holeR} 0 1 0 ${holeR} 0 Z`;
  return d;
}

const BIG_GEAR_PATH = createGearPath(22, 62, 51, 14);
const SMALL_GEAR_PATH = createGearPath(13, 38, 29, 9);

// 5 distinct sculptural cam lobe silhouettes (organic pear/egg profiles just like HUMAN.md)
const CAM_X_POSITIONS = [520, 680, 840, 1000, 1160];
const CAM_PHASES = [0.2, 1.45, 2.75, 4.05, 5.2];

export function Act3PredictiveEngine({
  lang,
  onHudThemeChange,
  onActiveChange,
}: Act3PredictiveEngineProps) {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const bigGearRef = useRef<SVGGElement | null>(null);
  const smallGearRef = useRef<SVGGElement | null>(null);
  const crankHandleRef = useRef<SVGGElement | null>(null);
  const camRefs = useRef<(SVGGElement | null)[]>([]);
  const stemRefs = useRef<(SVGGElement | null)[]>([]);
  const glyphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const priorReadoutRef = useRef<HTMLSpanElement | null>(null);
  const errorReadoutRef = useRef<HTMLSpanElement | null>(null);
  const stateReadoutRef = useRef<HTMLSpanElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [activeBeat, setActiveBeat] = useState(0);
  const [manualPrior, setManualPrior] = useState<number | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);

  const manualPriorRef = useRef<number | null>(null);
  manualPriorRef.current = manualPrior;
  const scrollProgressRef = useRef(0);
  const langRef = useRef(lang);
  langRef.current = lang;

  const applyEngineState = (p: number) => {
    const effectivePrior = manualPriorRef.current !== null ? manualPriorRef.current : Math.round(12 + p * 80);
    const errorPct = Math.max(4, Math.min(96, Math.round(100 - effectivePrior * 0.88 + Math.sin(p * 12) * 4)));

    // 1. Rotate interlocking brass spur gears + crank + #FC4109 qualia dot on the handle
    const driveDeg = p * 720 + (manualPriorRef.current !== null ? manualPriorRef.current * 4.5 : 0);
    if (bigGearRef.current) {
      bigGearRef.current.setAttribute('transform', `translate(275, 198) rotate(${driveDeg.toFixed(1)})`);
    }
    if (smallGearRef.current) {
      smallGearRef.current.setAttribute(
        'transform',
        `translate(358, 146) rotate(${(-driveDeg * (22 / 13) + 14).toFixed(1)})`,
      );
    }
    if (crankHandleRef.current) {
      crankHandleRef.current.setAttribute('transform', `translate(275, 198) rotate(${driveDeg.toFixed(1)})`);
    }

    // 2. Drive each of the 5 eccentric brass cams, follower pistons, and ceramic letters above the stone slab
    const rad = (driveDeg * Math.PI) / 180;
    // Coherence peaks in the "controlled hallucination" sweet spot (50-80%), blurs in low-prior chaos, tilts in mirage
    const chaosFactor = Math.max(0, (42 - effectivePrior) / 42);
    const mirageFactor = Math.max(0, (effectivePrior - 82) / 18);

    for (let i = 0; i < 5; i++) {
      const phase = rad + CAM_PHASES[i];
      const lobeLift = Math.sin(phase) * 14; // -14px .. +14px mechanical vertical lift
      const camEl = camRefs.current[i];
      if (camEl) {
        camEl.setAttribute('transform', `translate(${CAM_X_POSITIONS[i]}, 146) rotate(${((phase * 180) / Math.PI).toFixed(1)})`);
      }
      const stemEl = stemRefs.current[i];
      if (stemEl) {
        stemEl.setAttribute('transform', `translate(0, ${(-lobeLift).toFixed(2)})`);
      }
      const glyphEl = glyphRefs.current[i];
      if (glyphEl) {
        const tilt = Math.cos(phase) * (2.5 + chaosFactor * 8) + mirageFactor * (i % 2 === 0 ? 4 : -4);
        const blur = chaosFactor * 2.8;
        const liftY = -lobeLift * 0.9;
        glyphEl.style.transform = `translate3d(0, ${liftY.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
        glyphEl.style.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : 'none';
        glyphEl.style.opacity = `${(1 - chaosFactor * 0.32).toFixed(2)}`;
      }
    }

    // 3. Direct telemetry ref updates (zero React re-renders)
    if (priorReadoutRef.current) priorReadoutRef.current.textContent = `${effectivePrior}%`;
    if (errorReadoutRef.current) errorReadoutRef.current.textContent = `${errorPct}%`;
    if (stateReadoutRef.current) {
      const lbl = PHASE2_COPY.act3.labels;
      stateReadoutRef.current.textContent =
        effectivePrior < 35
          ? lbl.stateNoise[langRef.current]
          : effectivePrior <= 80
            ? lbl.stateBalanced[langRef.current]
            : lbl.stateMirage[langRef.current];
    }
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    }
  };

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;

    applyEngineState(0);

    const trigger = ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.45,
      onToggle: (self) => {
        onActiveChange(self.isActive);
        onHudThemeChange(self.isActive ? 'dark' : 'light');
      },
      onUpdate: (self) => {
        const p = self.progress;
        scrollProgressRef.current = p;
        const nextBeat = p < 0.25 ? 0 : p < 0.52 ? 1 : p < 0.78 ? 2 : 3;
        setActiveBeat((prev) => (prev === nextBeat ? prev : nextBeat));
        applyEngineState(p);
      },
    });

    return () => {
      trigger.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onHudThemeChange, onActiveChange]);

  // Immediately re-apply when manual slider or language changes
  useEffect(() => {
    applyEngineState(scrollProgressRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualPrior, lang]);

  const copy = PHASE2_COPY.act3;
  const beat = copy.beats[activeBeat] ?? copy.beats[0];
  const glyphs = copy.glyphs[lang];

  return (
    <section
      id="act-3"
      ref={runwayRef}
      className="relative h-[340vh] bg-[#004EDF]"
      aria-label={lang === 'ru' ? 'Зал 03 — Предиктивный двигатель' : 'Chamber 03 — Predictive Engine'}
    >
      {/* Sticky Full-Viewport Architectural Cutaway Stage (HUMAN.md homage) */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col">
        {/* ================= TOP HALF: VISIBLE SURFACE ON PAINTERLY KLEIN COBALT ================= */}
        <div
          className="relative flex-1 px-5 md:px-12 lg:px-20 pt-20 md:pt-24 pb-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 74% 35%, #1A67F5 0%, #004EDF 52%, #003CB4 100%)',
          }}
        >
          {/* Top-Left Monumental Editorial Beat */}
          <div className="relative z-20 max-w-xl">
            <div className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#FAF9F5]/75">
              {beat.kicker[lang]}
            </div>
            <h2
              key={activeBeat}
              className="mt-2.5 text-[clamp(24px,3.25vw,46px)] leading-[1.08] tracking-[-0.026em] text-[#FAF9F5] animate-[beatRise_380ms_cubic-bezier(0.22,1,0.36,1)]"
            >
              <span className="font-display font-bold block">{beat.headlineMain[lang]}</span>
              <span className="font-serif-editorial italic font-normal text-[#FFE4D6] block mt-0.5">
                {beat.headlineAccent[lang]}
              </span>
            </h2>
            <p
              key={`p3-${activeBeat}`}
              className="mt-2.5 max-w-md text-[13px] md:text-[14.5px] leading-[1.52] text-[#FAF9F5]/85 animate-[beatRise_440ms_cubic-bezier(0.22,1,0.36,1)]"
            >
              {beat.note[lang]}
            </p>
          </div>

          {/* Sculptural Ceramic Letters Pixel-Aligned 1:1 Directly Above Cams 1–5! */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 md:px-10 lg:px-16">
            <div className="relative max-w-[1360px] mx-auto h-[135px] md:h-[155px]">
              {glyphs.map((letter, idx) => {
                const leftPct = (CAM_X_POSITIONS[idx] / 1360) * 100;
                return (
                  <div
                    key={`${lang}-${idx}`}
                    ref={(el) => {
                      glyphRefs.current[idx] = el;
                    }}
                    className="absolute bottom-0 flex flex-col items-center select-none will-change-transform"
                    style={{ left: `${leftPct.toFixed(3)}%`, marginLeft: '-44px', width: '88px' }}
                  >
                    <span
                      className="font-serif-editorial italic font-semibold text-[clamp(48px,6.4vw,96px)] leading-[0.88] tracking-[-0.02em] pb-1"
                      style={{
                        color: '#FAF6EE',
                        textShadow:
                          '0 2px 0 #E4DCCB, 0 5px 0 #C8BDA8, 0 18px 28px rgba(0, 22, 74, 0.38)',
                      }}
                    >
                      {letter}
                    </span>
                    {/* Brass mounting shoe connecting letter cleanly (fixes A & P contact!) */}
                    <div
                      className="w-8 h-[4px] rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #9F7422 0%, #F7DA88 50%, #8A6118 100%)',
                      }}
                    />
                    {/* Vertical brass peg passing directly down into Cam Pushrod i */}
                    <div
                      className="w-[8px] h-5"
                      style={{
                        background: 'linear-gradient(90deg, #8A5E14 0%, #FBE18D 45%, #7C5310 100%)',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= TRAVERTINE STONE TABLETOP DIVIDER ================= */}
        <div
          className="relative z-20 h-[22px] md:h-[26px] w-full shrink-0"
          style={{
            background:
              'linear-gradient(180deg, #F3ECE0 0%, #DFD3BF 56%, #C5B59B 100%)',
            boxShadow: '0 10px 26px rgba(62, 14, 2, 0.45)',
          }}
        >
          <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20 h-full flex items-center justify-between font-mono-tech text-[9.5px] tracking-[0.14em] uppercase text-[#5C4E3A]">
            <span>{copy.labels.aboveSurface[lang]}</span>
            <span className="hidden sm:inline">↑↓ {lang === 'ru' ? 'ТОЧНОСТЬ / ПРИОРЫ' : 'PRECISION / PRIORS'}</span>
          </div>
        </div>

        {/* ================= BOTTOM HALF: BURNT TERRACOTTA CUTAWAY NICHE & BRASS ENGINE ================= */}
        <div
          className="relative h-[44vh] min-h-[290px] max-h-[410px] w-full shrink-0 flex flex-col justify-between px-4 md:px-10 lg:px-16 py-4 md:py-5"
          style={{
            background: 'linear-gradient(180deg, #C84319 0%, #B73913 100%)',
          }}
        >
          {/* Recessed 3D Shadow Niche housing the Brass Mechanism */}
          <div
            className="relative flex-1 w-full max-w-[1360px] mx-auto rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #7A1E06 0%, #99290C 18%, #A62F0E 85%, #842107 100%)',
              boxShadow:
                'inset 0 18px 34px rgba(38, 7, 0, 0.62), inset 14px 0 26px rgba(38, 7, 0, 0.35), inset -14px 0 26px rgba(38, 7, 0, 0.35)',
            }}
          >
            {/* Interactive Precision Brass Mechanism SVG (60-120 FPS pure transform rotation) */}
            <svg
              viewBox="0 0 1360 310"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full block"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="brassGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FCE79D" />
                  <stop offset="38%" stopColor="#D9A73E" />
                  <stop offset="72%" stopColor="#A8771E" />
                  <stop offset="100%" stopColor="#EBC668" />
                </linearGradient>
                <linearGradient id="brassRod" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8A5E14" />
                  <stop offset="45%" stopColor="#FBE18D" />
                  <stop offset="100%" stopColor="#7C5310" />
                </linearGradient>
                <filter id="brassShadow" x="-15%" y="-15%" width="135%" height="135%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#2A0600" floodOpacity="0.52" />
                </filter>
              </defs>

              {/* Horizontal Main Brass Camshaft + Bevel Coupling Collar to Drive Pinion */}
              <rect x="358" y="140" width="882" height="12" rx="6" fill="url(#brassGold)" filter="url(#brassShadow)" />
              <rect x="348" y="132" width="24" height="28" rx="4" fill="url(#brassGold)" stroke="#7A520F" strokeWidth="1.3" filter="url(#brassShadow)" />
              {/* Right Wall Bracket */}
              <rect x="1234" y="18" width="12" height="144" rx="3" fill="url(#brassRod)" />
              <rect x="1220" y="128" width="40" height="36" rx="5" fill="url(#brassGold)" filter="url(#brassShadow)" />
              <circle cx="1240" cy="146" r="5" fill="#6E460B" />
              {/* Left Support Bracket */}
              <rect x="424" y="18" width="12" height="144" rx="3" fill="url(#brassRod)" />
              <rect x="410" y="128" width="40" height="36" rx="5" fill="url(#brassGold)" filter="url(#brassShadow)" />
              <circle cx="430" cy="146" r="5" fill="#6E460B" />

              {/* Left Meshing Brass Gear Train */}
              <g ref={bigGearRef} transform="translate(275, 198)" filter="url(#brassShadow)">
                <path d={BIG_GEAR_PATH} fill="url(#brassGold)" fillRule="evenodd" stroke="#7A520F" strokeWidth="1.5" />
                {/* 5 Gear Spokes */}
                {[0, 72, 144, 216, 288].map((deg) => (
                  <rect
                    key={deg}
                    x="-4"
                    y="-48"
                    width="8"
                    height="36"
                    rx="3"
                    fill="url(#brassGold)"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx="0" cy="0" r="18" fill="url(#brassGold)" stroke="#7A520F" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="6" fill="#5A3806" />
              </g>

              <g ref={smallGearRef} transform="translate(358, 146)" filter="url(#brassShadow)">
                <path d={SMALL_GEAR_PATH} fill="url(#brassGold)" fillRule="evenodd" stroke="#7A520F" strokeWidth="1.4" />
                <circle cx="0" cy="0" r="10" fill="url(#brassGold)" stroke="#7A520F" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="4" fill="#5A3806" />
              </g>

              {/* Rotating Crank Arm carrying our engraved brass/enamel Qualia Pin (#FC4109)! */}
              <g ref={crankHandleRef} transform="translate(275, 198)" filter="url(#brassShadow)">
                <rect x="-7" y="-54" width="14" height="60" rx="7" fill="url(#brassGold)" stroke="#7A520F" strokeWidth="1.4" />
                <circle cx="0" cy="-48" r="13.5" fill="url(#brassGold)" stroke="#6E460B" strokeWidth="1.6" />
                <circle cx="0" cy="-48" r="9.5" fill="#FAF6EE" />
                <circle cx="0" cy="-48" r="6.5" fill="#FC4109" />
              </g>

              {/* 5 Brass Cam Lobes + Vertical Follower Push-Rods reaching up to О Б Р А З */}
              {CAM_X_POSITIONS.map((cx, i) => (
                <g key={cx}>
                  {/* Top Guide Collar attached to underside of travertine slab */}
                  <rect x={cx - 18} y="0" width="36" height="18" rx="3" fill="url(#brassGold)" stroke="#7A520F" strokeWidth="1.2" />
                  <circle cx={cx - 10} cy="9" r="2.2" fill="#5A3806" />
                  <circle cx={cx + 10} cy="9" r="2.2" fill="#5A3806" />

                  {/* Vertical Follower Stem moving up/down with the cam */}
                  <g
                    ref={(el) => {
                      stemRefs.current[i] = el;
                    }}
                  >
                    <rect x={cx - 5.5} y="-18" width="11" height="114" rx="4" fill="url(#brassRod)" filter="url(#brassShadow)" />
                    {/* Roller Bearing Wheel pressing onto the cam lobe */}
                    <circle cx={cx} cy="96" r="14" fill="url(#brassGold)" stroke="#7A520F" strokeWidth="1.5" filter="url(#brassShadow)" />
                    <circle cx={cx} cy="96" r="5" fill="#5A3806" />
                  </g>

                  {/* Asymmetric Eccentric Brass Cam Lobe */}
                  <g
                    ref={(el) => {
                      camRefs.current[i] = el;
                    }}
                    transform={`translate(${cx}, 146)`}
                    filter="url(#brassShadow)"
                  >
                    <path
                      d="M -28 0 C -28 -26, -16 -46, 0 -46 C 17 -46, 32 -24, 30 4 C 28 28, 14 36, 0 34 C -18 32, -28 18, -28 0 Z"
                      fill="url(#brassGold)"
                      stroke="#7A520F"
                      strokeWidth="1.6"
                    />
                    <circle cx="0" cy="0" r="10" fill="#B58325" stroke="#6E460B" strokeWidth="1.3" />
                    <line x1="-6" y1="0" x2="6" y2="0" stroke="#523306" strokeWidth="2" />
                  </g>
                </g>
              ))}

              {/* Subtle Engraved Niche Caption Centered Beneath Cams */}
              <text
                x="840"
                y="272"
                textAnchor="middle"
                fill="rgba(250, 246, 238, 0.72)"
                fontSize="12.5"
                fontFamily="JetBrains Mono Variable, monospace"
                letterSpacing="0.09em"
              >
                {copy.labels.underSurface[lang]}
              </text>
            </svg>
          </div>

          {/* Bottom Tactile Control Strip: Live Precision Telemetry + Optional Manual Dial + Dossier */}
          <div className="relative z-20 max-w-[1360px] mx-auto w-full pt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex flex-wrap items-center gap-4 px-4 py-2 rounded-full bg-[#FAF9F5]/94 text-[#141413] border border-[#141413]/12 shadow-md">
              <div className="flex items-center gap-2 font-mono-tech text-[12px]">
                <span className="text-[#5E5D59]">{copy.labels.priorWeight[lang]}:</span>
                <span ref={priorReadoutRef} className="font-semibold text-[#004EDF]">12%</span>
              </div>
              <div className="h-3.5 w-[1px] bg-[#141413]/15" />
              <div className="flex items-center gap-2 font-mono-tech text-[12px]">
                <span className="text-[#5E5D59]">{copy.labels.errorSignal[lang]}:</span>
                <span ref={errorReadoutRef} className="font-semibold text-[#C84319]">88%</span>
              </div>
              <div className="h-3.5 w-[1px] bg-[#141413]/15 hidden md:block" />
              <span
                ref={stateReadoutRef}
                className="hidden md:inline font-sans-ui text-[12px] font-medium text-[#141413]"
              >
                {copy.labels.stateNoise[lang]}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Optional Interactive Precision Override Dial */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#141413]/30 border border-[#FAF9F5]/20 text-[#FAF9F5] backdrop-blur-md">
                <span className="font-mono-tech text-[11px] opacity-85">
                  {copy.labels.manualOverride[lang]}
                </span>
                <input
                  type="range"
                  min={5}
                  max={98}
                  value={manualPrior ?? 55}
                  onChange={(e) => setManualPrior(Number(e.target.value))}
                  className="w-24 md:w-28 accent-[#FAF9F5] cursor-pointer"
                  aria-label="Prior precision override"
                />
                {manualPrior !== null && (
                  <button
                    type="button"
                    onClick={() => setManualPrior(null)}
                    className="font-mono-tech text-[10px] px-2 py-0.5 rounded-full bg-[#FAF9F5]/20 hover:bg-[#FAF9F5]/30 cursor-pointer"
                  >
                    {copy.labels.autoSync[lang]}
                  </button>
                )}
              </div>

              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#141413]/25 border border-[#FAF9F5]/16">
                {[0, 1, 2, 3].map((dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      dotIdx === activeBeat ? 'w-5 bg-[#FAF9F5]' : 'w-1.5 bg-[#FAF9F5]/35'
                    }`}
                  />
                ))}
                <div ref={progressBarRef} className="hidden" />
              </div>

              <button
                type="button"
                onClick={() => setDossierOpen(true)}
                className="v6-pill h-9 px-4 rounded-full bg-[#FAF9F5] hover:bg-[#F4EFE8] text-[#141413] inline-flex items-center gap-1.5 text-[12.5px] font-medium shadow-md cursor-pointer"
              >
                <span>{copy.labels.dossierBtn[lang]}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#C84319]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Anthropic Slide-Over Research Dossier */}
      {dossierOpen && (
        <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setDossierOpen(false)}
            className="absolute inset-0 bg-[#141413]/40 backdrop-blur-xs cursor-default"
            aria-label="Close"
          />
          <aside
            data-lenis-prevent
            className="relative z-10 w-full max-w-xl h-full overflow-y-auto bg-[#FAF9F5] text-[#141413] border-l border-[#141413]/12 shadow-2xl p-6 md:p-10 space-y-7"
          >
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#141413]/10">
              <div>
                <div className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#C84319]">
                  {copy.dossier.eyebrow[lang]}
                </div>
                <h3 className="font-serif-editorial text-2xl md:text-3xl mt-2 leading-snug">
                  {copy.dossier.title[lang]}
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

            <p className="text-[15px] leading-[1.65] text-[#3B3A37]">{copy.dossier.intro[lang]}</p>

            <div className="divide-y divide-[#141413]/10 border-t border-b border-[#141413]/10">
              {copy.dossier.points.map((pt) => (
                <div key={pt.ref} className="py-4 space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-display font-semibold text-[15px] text-[#141413]">
                      {pt.title[lang]}
                    </h4>
                    <span className="font-mono-tech text-[11px] text-[#5E5D59]">{pt.ref}</span>
                  </div>
                  <p className="text-[14px] leading-[1.6] text-[#4B4A46]">{pt.text[lang]}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
