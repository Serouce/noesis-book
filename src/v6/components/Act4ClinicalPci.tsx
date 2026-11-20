import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import { Zap } from 'lucide-react';
import type { Lang } from '../data/phase1Copy';
import { PHASE2_COPY } from '../data/phase2Copy';

interface Act4ClinicalPciProps {
  lang: Lang;
  onDarkInView: (inView: boolean) => void;
}

const CHANNEL_COUNT = 5;
const SAMPLES = 96;

export function Act4ClinicalPci({ lang, onDarkInView }: Act4ClinicalPciProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string>('cmd');
  const [pulseKey, setPulseKey] = useState(0);
  const [sweepProgress, setSweepProgress] = useState(1);

  const copy = PHASE2_COPY.act4Pci;
  const activeState = copy.states.find((s) => s.id === selectedId) ?? copy.states[1];
  const isConscious = activeState.pci >= 0.31;

  // Adaptive HUD switches smoothly to light-on-dark ONLY inside this single dark clinical interlude
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onDarkInView(entry.isIntersecting);
      },
      { rootMargin: '-8% 0px -75% 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onDarkInView]);

  // Smooth real-time TMS-EEG oscilloscope sweep animation when user triggers Zap or switches state
  useEffect(() => {
    let rafId = 0;
    const start = performance.now();
    const duration = 950;
    setSweepProgress(0);

    const step = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      setSweepProgress(eased);
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [selectedId, pulseKey]);

  // Precompute crisp D3-shaped 5-channel TMS-EEG cortical reverberation waveforms
  const { channelPaths, xScale } = useMemo(() => {
    const width = 680;
    const height = 250;
    const xs = scaleLinear().domain([0, SAMPLES - 1]).range([28, width - 18]);

    const paths: string[] = [];
    for (let ch = 0; ch < CHANNEL_COUNT; ch++) {
      const baseY = 36 + ch * 44;
      const ys = scaleLinear().domain([-1, 1]).range([baseY + 19, baseY - 19]);
      const pts: [number, number][] = [];

      for (let i = 0; i < SAMPLES; i++) {
        // TMS magnetic zap strikes at sample index 10 (t = 0 ms)
        const dt = (i - 10) / 26;
        let val = 0;
        if (dt < 0) {
          val = Math.sin(i * 0.7 + ch * 1.3) * 0.04;
        } else {
          const envelope = Math.exp(-dt * activeState.decay);
          const primary = Math.sin(dt * 8.5 + ch * 0.85) * 0.72;
          // Higher complexity adds differentiated non-repeating spatiotemporal harmonics across channels
          const harmonic1 = Math.sin(dt * (16 + ch * 3.1) - ch * 1.7) * 0.34 * activeState.complexity;
          const harmonic2 = Math.cos(dt * (27 - ch * 2.4) + ch * 2.2) * 0.22 * activeState.complexity;
          // Channel spatial propagation attenuation in coma/NREM
          const spatialGain = ch === 2 ? 1 : Math.max(0.12, activeState.spread - Math.abs(ch - 2) * (1 - activeState.spread) * 0.45);
          val = envelope * (primary + harmonic1 + harmonic2) * spatialGain;
        }
        pts.push([xs(i), ys(Math.max(-1, Math.min(1, val)))]);
      }

      const gen = line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(curveMonotoneX);

      paths.push(gen(pts) ?? '');
    }

    return { channelPaths: paths, xScale: xs, height };
  }, [activeState]);

  const pciBarPct = Math.min(100, (activeState.pci / 0.65) * 100);
  const thresholdPct = (0.31 / 0.65) * 100;
  const zapX = xScale(10);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#111419] text-[#FAF9F5] py-24 md:py-32 overflow-hidden"
      aria-label={lang === 'ru' ? 'Зал 04B — Клинический порог PCI 0.31' : 'Chamber 04B — Clinical PCI 0.31'}
    >
      <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#34D399]">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            <span>{copy.eyebrow[lang]}</span>
          </div>

          <h2 className="mt-4 text-[clamp(30px,4.4vw,60px)] leading-[1.08] tracking-[-0.028em]">
            <span className="font-display font-bold text-[#FAF9F5]">{copy.titleMain[lang]} </span>
            <span className="font-serif-editorial italic font-normal text-[#C8D0DC]">
              {copy.titleAccent[lang]}
            </span>
          </h2>

          <p className="mt-5 text-[15px] md:text-[16px] leading-[1.65] text-[#A2AAB8]">
            {copy.subtitle[lang]}
          </p>
        </div>

        {/* Balanced 3x2 Clinical State Selector Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {copy.states.map((st) => {
            const active = st.id === activeState.id;
            const above = st.pci >= 0.31;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedId(st.id)}
                className={`v6-pill px-4 py-2.5 rounded-full border text-[13px] font-medium inline-flex items-center justify-between gap-2.5 cursor-pointer ${
                  active
                    ? above
                      ? 'bg-[#34D399] text-[#081A14] border-[#34D399]'
                      : 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5]'
                    : 'bg-[#FAF9F5]/6 text-[#D8DEE9] border-[#FAF9F5]/14 hover:bg-[#FAF9F5]/12'
                }`}
              >
                <span>{st.name[lang]}</span>
                <span className={`font-mono-tech text-[11.5px] font-semibold ${active ? 'opacity-95' : 'opacity-70'}`}>
                  {st.pci.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Clinical Instrument Grid (D3 EEG + Architectural 10-20 Cortical Montage) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Architectural Top-Down 10-20 Cortical Montage + Trigger Button */}
          <div className="lg:col-span-4 rounded-[22px] bg-[#181C23] border border-[#FAF9F5]/10 p-6 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between font-mono-tech text-[11px] text-[#9AA3B2]">
              <span>TMS-EEG · 10-20 CORTICAL ECHO</span>
              <span className={isConscious ? 'text-[#34D399]' : 'text-[#94A3B8]'}>
                PCI* = {activeState.pci.toFixed(2)}
              </span>
            </div>

            {/* Enriched Top-Down Architectural Cortical Contour + 10-20 Electrode Montage */}
            <div className="relative mx-auto w-60 h-60 flex items-center justify-center">
              <svg viewBox="0 0 220 220" className="w-full h-full">
                {/* Subtle nasion triangle & ear ticks (standard clinical 10-20 scalp map) */}
                <path d="M 102 14 L 110 4 L 118 14" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
                <path d="M 28 98 C 20 102, 20 118, 28 122" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
                <path d="M 192 98 C 200 102, 200 118, 192 122" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />

                {/* Left & Right Hemisphere Architectural Silhouettes */}
                <path
                  d="M 107 20 C 66 22, 34 58, 34 110 C 34 162, 64 198, 107 200 C 107 148, 107 72, 107 20 Z"
                  fill="rgba(255,255,255,0.035)"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 113 20 C 154 22, 186 58, 186 110 C 186 162, 156 198, 113 200 C 113 148, 113 72, 113 20 Z"
                  fill="rgba(255,255,255,0.035)"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1.2"
                />

                {/* Subtle cortical sulcal contour lines */}
                <path d="M 46 82 Q 74 96 102 88 M 118 88 Q 146 96 174 82" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <path d="M 44 134 Q 76 124 102 138 M 118 138 Q 144 124 176 134" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {/* Propagating TMS shockwave rings */}
                {[0.32, 0.62, 0.94].map((ringRatio, i) => {
                  const r = 10 + sweepProgress * 84 * activeState.spread * ringRatio;
                  const alpha = Math.max(0, (1 - sweepProgress * 0.72) * (isConscious ? 0.88 : 0.45));
                  return (
                    <circle
                      key={i}
                      cx="84"
                      cy="74"
                      r={r}
                      fill="none"
                      stroke={isConscious ? '#34D399' : '#94A3B8'}
                      strokeWidth={i === 0 ? 2.2 : 1.3}
                      opacity={alpha}
                    />
                  );
                })}

                {/* 10-20 Clinical Electrode Montage Nodes with labels */}
                {[
                  { x: 84, y: 74, delay: 0.0, lbl: 'Fz' },
                  { x: 136, y: 74, delay: 0.24, lbl: 'F4' },
                  { x: 110, y: 110, delay: 0.30, lbl: 'Cz' },
                  { x: 64, y: 126, delay: 0.38, lbl: 'T3' },
                  { x: 156, y: 126, delay: 0.50, lbl: 'T4' },
                  { x: 88, y: 168, delay: 0.60, lbl: 'O1' },
                  { x: 132, y: 168, delay: 0.68, lbl: 'Pz' },
                ].map((node, idx) => {
                  const reached = sweepProgress >= node.delay && (idx === 0 || activeState.spread > node.delay * 0.92);
                  return (
                    <g key={node.lbl}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={idx === 0 ? 5.5 : 3.8}
                        fill={idx === 0 ? '#FC4109' : reached ? (isConscious ? '#34D399' : '#94A3B8') : '#343D4D'}
                      />
                      <text
                        x={node.x + (node.x < 110 ? -10 : 9)}
                        y={node.y + 3}
                        textAnchor={node.x < 110 ? 'end' : 'start'}
                        fill="rgba(255,255,255,0.45)"
                        fontSize="8.5"
                        fontFamily="JetBrains Mono Variable, monospace"
                      >
                        {node.lbl}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <button
              type="button"
              onClick={() => setPulseKey((k) => k + 1)}
              className="v6-pill w-full py-3 px-4 rounded-full bg-[#FC4109] hover:bg-[#E53906] text-[#FAF9F5] font-sans-ui text-[13.5px] font-medium inline-flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(252,65,9,0.28)] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{copy.zapBtn[lang]}</span>
            </button>
          </div>

          {/* Right: 5-Channel D3-Shape EEG Oscilloscope + PCI* = 0.31 Calibrated Threshold Gauge */}
          <div className="lg:col-span-8 rounded-[22px] bg-[#181C23] border border-[#FAF9F5]/10 p-6 flex flex-col justify-between gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    isConscious ? 'bg-[#34D399]' : 'bg-[#94A3B8]'
                  }`}
                />
                <span className="font-mono-tech text-[11px] uppercase tracking-[0.1em] text-[#FAF9F5]">
                  {isConscious ? copy.aboveThreshold[lang] : copy.belowThreshold[lang]}
                </span>
              </div>
              <span className="font-mono-tech text-[11px] text-[#8E98A8]">{activeState.citation}</span>
            </div>

            {/* Razor-Sharp D3-Shape 5-Channel Oscilloscope */}
            <div className="relative rounded-2xl bg-[#0D1015] border border-[#FAF9F5]/8 p-3 overflow-hidden">
              <svg viewBox="0 0 680 250" className="w-full h-[210px] md:h-[240px] block">
                <defs>
                  <clipPath id="eegSweepClip">
                    <rect x="0" y="0" width={Math.max(0, 680 * sweepProgress)} height="250" />
                  </clipPath>
                </defs>

                {/* Subtle time grid */}
                {[10, 32, 54, 76, 94].map((sampleIdx) => (
                  <line
                    key={sampleIdx}
                    x1={xScale(sampleIdx)}
                    y1="10"
                    x2={xScale(sampleIdx)}
                    y2="240"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                ))}

                {/* TMS Magnetic Strike Vertical Line (t = 0 ms) */}
                <line
                  x1={zapX}
                  y1="8"
                  x2={zapX}
                  y2="242"
                  stroke="#FC4109"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={zapX + 6}
                  y="20"
                  fill="#FC4109"
                  fontSize="10"
                  fontFamily="JetBrains Mono Variable, monospace"
                >
                  ZAP · 0 ms
                </text>

                {/* 5 Clinical Electrode Channel Labels (Fz, Cz, Pz, O1, T4) */}
                {['Fz', 'Cz', 'Pz', 'O1', 'T4'].map((lbl, ch) => (
                  <text
                    key={lbl}
                    x="4"
                    y={40 + ch * 44}
                    fill="#64748B"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono Variable, monospace"
                  >
                    {lbl}
                  </text>
                ))}

                {/* 5 D3-computed EEG traces */}
                <g clipPath="url(#eegSweepClip)">
                  {channelPaths.map((d, ch) => (
                    <path
                      key={ch}
                      d={d}
                      fill="none"
                      stroke={isConscious ? '#34D399' : '#94A3B8'}
                      strokeWidth={ch === 2 ? 2.1 : 1.35}
                      opacity={ch === 2 ? 0.96 : 0.48}
                    />
                  ))}
                </g>

                {/* Time axis labels */}
                <text x={xScale(32)} y="244" fill="#64748B" fontSize="9.5" fontFamily="JetBrains Mono Variable, monospace">
                  +100 ms
                </text>
                <text x={xScale(54)} y="244" fill="#64748B" fontSize="9.5" fontFamily="JetBrains Mono Variable, monospace">
                  +200 ms
                </text>
                <text x={xScale(76)} y="244" fill="#64748B" fontSize="9.5" fontFamily="JetBrains Mono Variable, monospace">
                  +300 ms
                </text>
              </svg>
            </div>

            {/* Calibrated PCI* = 0.31 Empirical Threshold Gauge + Clinical Explanation */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between font-mono-tech text-[11px] mb-2">
                  <span className="text-[#9AA3B2]">{copy.thresholdLabel[lang]}</span>
                  <span className="text-base font-semibold text-[#FAF9F5]">
                    PCI* = {activeState.pci.toFixed(2)}
                  </span>
                </div>

                <div className="relative h-3 w-full rounded-full bg-[#FAF9F5]/10 overflow-visible mb-6">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${pciBarPct}%`,
                      backgroundColor: isConscious ? '#34D399' : '#64748B',
                    }}
                  />
                  {/* Golden Massimini 0.31 Threshold Marker cleanly placed BELOW bar (zero text collision) */}
                  <div
                    className="absolute -top-1.5 -bottom-1.5 w-[2px] bg-[#FACC15]"
                    style={{ left: `${thresholdPct}%` }}
                  >
                    <span className="absolute top-5 -translate-x-1/2 font-mono-tech text-[10px] font-semibold text-[#FACC15] whitespace-nowrap">
                      0.31
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[14px] leading-[1.6] text-[#B8C0CE]">{activeState.note[lang]}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
