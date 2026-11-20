import { useEffect, useMemo, useRef, useState } from 'react';
import { lineRadial, curveLinearClosed } from 'd3-shape';
import type { Lang } from '../data/phase1Copy';
import { PHASE345_COPY } from '../data/phase345Copy';

interface Act5OtherMindsProps {
  lang: Lang;
  onActiveChange: (active: boolean) => void;
}

// Bespoke Anthropic-grade architectural ink-print emblems (uniform visual weight, zero thin clip-art!)
function BeingEmblem({ id, active }: { id: string; active: boolean }) {
  const ink = active ? '#141413' : '#2C2B29';
  const accent = active ? '#FC4109' : 'rgba(20,20,19,0.28)';
  const fill = active ? '#EFECE4' : 'rgba(250,249,245,0.45)';

  if (id === 'human') {
    // Architectural Vitruvian / Concentric Cortical Profile Stamp
    return (
      <svg viewBox="0 0 88 88" className="w-16 h-16 md:w-[74px] md:h-[74px]">
        <circle cx="44" cy="44" r="38" fill={fill} stroke={ink} strokeWidth="1.6" />
        <circle cx="44" cy="44" r="24" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="3 3" />
        <path d="M 44 14 A 30 30 0 0 1 74 44 L 44 44 Z" fill={ink} opacity="0.12" />
        <circle cx="44" cy="36" r="10" fill={ink} />
        <path d="M 26 68 C 28 54, 35 49, 44 49 C 53 49, 60 54, 62 68" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="44" cy="36" r="3.2" fill={accent} />
      </svg>
    );
  }
  if (id === 'octopus') {
    // Nautilus / Eight-Fold Distributed Ganglia Print Emblem
    return (
      <svg viewBox="0 0 88 88" className="w-16 h-16 md:w-[74px] md:h-[74px]">
        <circle cx="44" cy="44" r="38" fill={fill} stroke={ink} strokeWidth="1.6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <g key={deg} transform={`translate(44,44) rotate(${deg})`}>
            <path d="M 0 -10 Q 7 -20 2 -30" fill="none" stroke={ink} strokeWidth="2.1" strokeLinecap="round" />
            <circle cx="2" cy="-30" r="2.2" fill={ink} />
          </g>
        ))}
        <circle cx="44" cy="44" r="11" fill={ink} />
        <circle cx="44" cy="44" r="4" fill={accent} />
      </svg>
    );
  }
  if (id === 'corvid') {
    // Architectural Avian Pallium Wing & Compass Geometry
    return (
      <svg viewBox="0 0 88 88" className="w-16 h-16 md:w-[74px] md:h-[74px]">
        <circle cx="44" cy="44" r="38" fill={fill} stroke={ink} strokeWidth="1.6" />
        <path d="M 20 58 C 26 36, 44 22, 66 24 C 54 34, 48 44, 46 62 Z" fill={ink} />
        <path d="M 26 64 C 38 50, 52 44, 68 42" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
        <circle cx="54" cy="32" r="3.4" fill={accent} />
      </svg>
    );
  }
  if (id === 'organoid') {
    // Cellular Rosette / Petri Culture Ring Emblem
    return (
      <svg viewBox="0 0 88 88" className="w-16 h-16 md:w-[74px] md:h-[74px]">
        <circle cx="44" cy="44" r="38" fill={fill} stroke={ink} strokeWidth="1.6" />
        <circle cx="44" cy="44" r="26" fill="none" stroke={ink} strokeWidth="1.4" />
        <circle cx="36" cy="38" r="9" fill={ink} opacity="0.88" />
        <circle cx="52" cy="40" r="7.5" fill={ink} opacity="0.65" />
        <circle cx="43" cy="52" r="8" fill={ink} opacity="0.45" />
        <circle cx="44" cy="44" r="3.2" fill={accent} />
      </svg>
    );
  }
  // Frontier LLM 2025: Feedforward Attention Matrix Emblem
  return (
    <svg viewBox="0 0 88 88" className="w-16 h-16 md:w-[74px] md:h-[74px]">
      <circle cx="44" cy="44" r="38" fill={fill} stroke={ink} strokeWidth="1.6" />
      {[28, 44, 60].map((x) =>
        [28, 44, 60].map((y) => (
          <rect
            key={`${x}-${y}`}
            x={x - 4.5}
            y={y - 4.5}
            width="9"
            height="9"
            rx="1.5"
            fill={x === 44 && y === 44 ? accent : ink}
            opacity={x === y ? 0.95 : 0.35}
          />
        )),
      )}
    </svg>
  );
}

export function Act5OtherMinds({ lang, onActiveChange }: Act5OtherMindsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(1);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => onActiveChange(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onActiveChange]);

  const copy = PHASE345_COPY.act5;
  const activeBeing = copy.beings[selectedIdx] ?? copy.beings[0];

  // Spacious D3 5-Axis Radar with smart text-anchoring (ZERO vertex/label overlap!)
  const { polygonPath, humanRefPath, axisPoints } = useMemo(() => {
    const maxR = 80;
    const radialGen = lineRadial<number>()
      .angle((_, i) => (i / 5) * Math.PI * 2)
      .radius((d) => (d / 100) * maxR)
      .curve(curveLinearClosed);

    const pts = copy.axes.map((ax, i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const anchor: 'middle' | 'start' | 'end' =
        Math.abs(cosA) < 0.2 ? 'middle' : cosA > 0 ? 'start' : 'end';
      const padX = Math.abs(cosA) < 0.2 ? 0 : cosA > 0 ? 14 : -14;
      const padY = sinA < -0.5 ? -16 : sinA > 0.5 ? 20 : 2;
      return {
        label: ax[lang],
        anchor,
        x: cosA * maxR + padX,
        y: sinA * maxR + padY,
        ex: cosA * maxR,
        ey: sinA * maxR,
      };
    });

    return {
      polygonPath: radialGen([...activeBeing.scores]) ?? '',
      humanRefPath: radialGen([...copy.beings[0].scores]) ?? '',
      axisPoints: pts,
    };
  }, [activeBeing, copy.axes, copy.beings, lang]);

  return (
    <section
      id="act-5"
      ref={sectionRef}
      className="relative overflow-hidden text-[#141413]"
      style={{
        background:
          'linear-gradient(180deg, #5D9DC5 0%, #6DA9CE 56%, #EBC7D4 56.15%, #F2D4DF 100%)',
      }}
      aria-label={lang === 'ru' ? 'Зал 05 — Линейка иных разумов' : 'Chamber 05 — Lineup of Other Minds'}
    >
      <div
        className="pointer-events-none absolute inset-x-0"
        style={{
          top: '56%',
          height: '20px',
          background: 'linear-gradient(180deg, rgba(20,20,19,0.08) 0%, rgba(20,20,19,0) 100%)',
        }}
      />

      <div className="relative z-10 max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20 pt-28 md:pt-32 pb-20 md:pb-26">
        {/* Monumental Header on the Cerulean Sky Wall */}
        <div className="max-w-3xl">
          <div className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#141413]/75">
            {copy.eyebrow[lang]}
          </div>
          <h2 className="mt-3 text-[clamp(28px,4.2vw,58px)] leading-[1.07] tracking-[-0.028em] text-[#141413]">
            <span className="font-display font-bold block">{copy.titleMain[lang]}</span>
            <span className="font-serif-editorial italic font-normal text-[#FAF9F5] block mt-0.5">
              {copy.titleAccent[lang]}
            </span>
          </h2>
        </div>

        {/* Interactive HUMAN.md Character Lineup with Bespoke Ink-Print Emblems */}
        <div className="mt-12 md:mt-14 grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4 items-end">
          {copy.beings.map((being, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={being.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`v6-pill group relative rounded-2xl px-4 py-5 flex flex-col items-center text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FAF9F5] border-[#141413]/18 shadow-[0_18px_42px_rgba(20,20,19,0.14)] -translate-y-2'
                    : 'bg-[#FAF9F5]/48 hover:bg-[#FAF9F5]/76 border-[#141413]/10'
                }`}
              >
                <BeingEmblem id={being.id} active={isSelected} />
                <div className="mt-3 font-display font-semibold text-[15px] text-[#141413]">
                  {being.name[lang]}
                </div>
                <div className="font-mono-tech text-[10px] text-[#5E5D59] mt-0.5">
                  {being.latin}
                </div>

                <span
                  className={`mt-3 w-2.5 h-2.5 rounded-full transition-transform duration-300 ${
                    isSelected ? 'bg-[#FC4109] scale-110' : 'bg-[#141413]/18 scale-75'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Active Mind Scientific Dossier + Collision-Free D3 5-Axis Radar */}
        <div className="mt-9 rounded-[24px] bg-[#FAF9F5] border border-[#141413]/12 shadow-[0_24px_65px_rgba(20,20,19,0.10)] p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Spacious Collision-Free D3 5-Axis Radar */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <svg viewBox="-215 -132 430 264" className="w-full max-w-[400px] h-auto overflow-visible">
              {[0.33, 0.66, 1.0].map((r) => (
                <circle
                  key={r}
                  cx="0"
                  cy="0"
                  r={80 * r}
                  fill="none"
                  stroke="rgba(20,20,19,0.09)"
                  strokeDasharray={r < 1 ? '3 3' : undefined}
                />
              ))}

              {axisPoints.map((pt, i) => (
                <g key={i}>
                  <line x1="0" y1="0" x2={pt.ex} y2={pt.ey} stroke="rgba(20,20,19,0.12)" strokeWidth="1" />
                  <text
                    x={pt.x}
                    y={pt.y}
                    textAnchor={pt.anchor}
                    dominantBaseline="middle"
                    fill="#30302E"
                    fontSize="10.5"
                    fontFamily="JetBrains Mono Variable, monospace"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}

              <path
                d={humanRefPath}
                fill="none"
                stroke="rgba(20,20,19,0.24)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />

              <path
                d={polygonPath}
                fill={activeBeing.badgeColor}
                fillOpacity="0.18"
                stroke={activeBeing.badgeColor}
                strokeWidth="2.4"
              />
            </svg>
          </div>

          {/* Right: Structured Editorial Profile + Full Un-Truncated Score Cards */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-2xl md:text-3xl text-[#141413]">
                  {activeBeing.name[lang]}
                </h3>
                <div className="font-serif-editorial italic text-sm text-[#5E5D59]">
                  {activeBeing.latin}
                </div>
              </div>
              <span
                className="font-mono-tech text-[11px] px-3 py-1 rounded-full text-[#FAF9F5] font-medium"
                style={{ backgroundColor: activeBeing.badgeColor }}
              >
                {activeBeing.status[lang]}
              </span>
            </div>

            <p className="text-[15.5px] leading-[1.65] text-[#30302E]">
              {activeBeing.summary[lang]}
            </p>

            {/* 5 Score Cards — Zero Ellipsis / Zero Truncation! */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              {copy.axes.map((ax, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#F0EEE6] px-3 py-2.5 border border-[#141413]/8 flex flex-col justify-between gap-1.5"
                >
                  <div className="font-mono-tech text-[10px] leading-[1.3] text-[#5E5D59]">
                    {ax[lang]}
                  </div>
                  <div className="font-mono-tech text-lg font-semibold text-[#141413]">
                    {activeBeing.scores[i]}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#141413]/10 flex flex-col sm:flex-row sm:items-center gap-4">
              {activeBeing.id === 'octopus' && (
                <img
                  src="/photos/octopus_lab.jpg"
                  alt="Octopus vulgaris"
                  className="w-20 h-14 rounded-xl object-cover border border-[#141413]/12 shrink-0"
                />
              )}
              <p className="font-mono-tech text-[11.5px] leading-relaxed text-[#5E5D59]">
                {activeBeing.evidence[lang]}
              </p>
            </div>
          </div>
        </div>

        {/* New York Declaration on Animal Consciousness Pull-Quote */}
        <div className="mt-10 pt-7 border-t border-[#141413]/14 max-w-3xl">
          <blockquote className="font-serif-editorial italic text-xl md:text-2xl leading-[1.38] text-[#141413]">
            {copy.quote[lang]}
          </blockquote>
          <div className="mt-2 font-mono-tech text-[11px] text-[#30302E]/80">
            {copy.quoteCite[lang]}
          </div>
        </div>
      </div>
    </section>
  );
}
