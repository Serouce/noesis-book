import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import { ArrowDown, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { ICU_TRUTH, useExplorer, type IcuVerdict } from '../context/ExplorerContext';

interface Chapter6IcuJournalProps {
  onDarkInView: (inView: boolean) => void;
  onNextChapter: () => void;
}

interface PatientCase {
  id: 'p1' | 'p2' | 'p3';
  code: string;
  bedTitle: string;
  clinicalChart: string;
  pci: number;
  decay: number;
  complexity: number;
  spread: number;
  revealFact: string;
}

const PATIENTS: PatientCase[] = [
  {
    id: 'p1',
    code: 'ПАЦИЕНТ № 01',
    bedTitle: 'Койка 04 · ЧМТ, 6-е сутки',
    clinicalChart: 'Глаза закрыты, на голос и болевые стимулы не реагирует. Родственники спрашивают, слышит ли он их.',
    pci: 0.21,
    decay: 3.1,
    complexity: 0.14,
    spread: 0.24,
    revealFact:
      'Верно: это глубокая бессознательная кома (PCI* = 0.21 < 0.31). Магнитный импульс вызывает лишь глухой локальный удар без эха по коре.',
  },
  {
    id: 'p2',
    code: 'ПАЦИЕНТ № 02',
    bedTitle: 'Койка 09 · Инсульт ствола, 19-е сутки',
    clinicalChart: 'Полная внешняя неподвижность. По шкале Глазго поставлен диагноз «вегетативное состояние».',
    pci: 0.44,
    decay: 0.72,
    complexity: 0.92,
    spread: 0.95,
    revealFact:
      'Скрытое сознание (CMD, PCI* = 0.44 > 0.31)! Как показало эпохальное исследование NEJM (август 2024), каждый четвёртый такой пациент (60 из 241 — ровно 25%) полностью понимает речь врача внутри неподвижного тела.',
  },
  {
    id: 'p3',
    code: 'ПАЦИЕНТ № 03',
    bedTitle: 'Койка 12 · После остановки сердца',
    clinicalChart: 'Внешне нет ни моргания, ни сжатия руки по команде. Пограничный случай — решайте строго по ЭЭГ.',
    pci: 0.37,
    decay: 0.96,
    complexity: 0.76,
    spread: 0.84,
    revealFact:
      'Выше золотого порога Массимини (PCI* = 0.37 > 0.31)! Сложная волна пересекает оба полушария: здесь сохраняется остров внутреннего опыта, и пациент нуждается в бережном общении и нейрореабилитации.',
  },
];

const CHANNEL_COUNT = 5;
const SAMPLES = 96;

/**
 * CHAPTER VI: "Тихий свет в реанимации" (Single deliberate dark spread #111419).
 * Interactive ICU Shift: Zap 3 anonymous patients with TMS, read their D3 EEG vs PCI* = 0.31,
 * and file your clinical diagnosis (NEJM Aug 2024 CMD 25%!).
 */
export function Chapter6IcuJournal({ onDarkInView, onNextChapter }: Chapter6IcuJournalProps) {
  const { state, setIcuDiagnosis, icuStats } = useExplorer();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState<'p1' | 'p2' | 'p3'>('p1');
  const [zappedMap, setZappedMap] = useState<Record<string, boolean>>({});
  const [pulseKey, setPulseKey] = useState(0);
  const [sweepProgress, setSweepProgress] = useState(0);

  const patient = PATIENTS.find((p) => p.id === activeId) ?? PATIENTS[0];
  const isZapped = Boolean(zappedMap[patient.id]);
  const userVerdict = state.icuDiagnoses[patient.id];
  const truth = ICU_TRUTH[patient.id];
  const isAbove = patient.pci >= 0.31;

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

  // Animate real-time TMS-EEG oscilloscope sweep when user clicks ZAP
  useEffect(() => {
    if (!zappedMap[activeId]) {
      setSweepProgress(0);
      return;
    }
    let rafId = 0;
    const start = performance.now();
    const duration = 920;
    setSweepProgress(0);

    const step = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      setSweepProgress(eased);
      if (t < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [activeId, pulseKey, zappedMap]);

  const handleZap = () => {
    setZappedMap((prev) => ({ ...prev, [patient.id]: true }));
    setPulseKey((k) => k + 1);
  };

  const handleDiagnose = (verdict: IcuVerdict) => {
    if (!isZapped) {
      setZappedMap((prev) => ({ ...prev, [patient.id]: true }));
      setPulseKey((k) => k + 1);
    }
    setIcuDiagnosis(patient.id, verdict);
  };

  const { channelPaths, xScale } = useMemo(() => {
    const width = 680;
    const xs = scaleLinear().domain([0, SAMPLES - 1]).range([28, width - 18]);

    const paths: string[] = [];
    for (let ch = 0; ch < CHANNEL_COUNT; ch += 1) {
      const baseY = 36 + ch * 44;
      const ys = scaleLinear().domain([-1, 1]).range([baseY + 19, baseY - 19]);
      const pts: [number, number][] = [];

      for (let i = 0; i < SAMPLES; i += 1) {
        const dt = (i - 10) / 26;
        let val = 0;
        if (dt < 0) {
          val = Math.sin(i * 0.7 + ch * 1.3) * 0.04;
        } else {
          const envelope = Math.exp(-dt * patient.decay);
          const primary = Math.sin(dt * 8.5 + ch * 0.85) * 0.72;
          const harmonic1 = Math.sin(dt * (16 + ch * 3.1) - ch * 1.7) * 0.34 * patient.complexity;
          const harmonic2 = Math.cos(dt * (27 - ch * 2.4) + ch * 2.2) * 0.22 * patient.complexity;
          const spatialGain =
            ch === 2 ? 1 : Math.max(0.12, patient.spread - Math.abs(ch - 2) * (1 - patient.spread) * 0.45);
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

    return { channelPaths: paths, xScale: xs };
  }, [patient]);

  const pciBarPct = isZapped ? Math.min(100, (patient.pci / 0.65) * 100) : 0;
  const thresholdPct = (0.31 / 0.65) * 100;
  const zapX = xScale(10);

  return (
    <section
      id="ch-6"
      ref={sectionRef}
      className="relative bg-[#111419] text-[#FAF9F5] py-24 md:py-32 overflow-hidden"
      aria-label="Глава VI — Тихий свет в реанимации"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Dark Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#FAF9F5]/14 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#8E98A8]">
          <span className="text-[#34D399] font-semibold">ЧАСТЬ II · ПОД ЧЕРЕПОМ · ГЛАВА VI</span>
          <span>ДЕЖУРСТВО В РЕАНИМАЦИИ · NEJM 2024 · стр. 84</span>
        </div>

        {/* Clinical Opening */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block text-[#FAF9F5]">Постучать по мозгу</span>
              <span className="font-serif-editorial italic font-normal text-[#C8D0DC] block mt-1">
                и услышать эхо разума.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15px] leading-[1.64] text-[#A4AEBD]">
            <p>
              В августе 2024 года журнал <strong className="text-[#FAF9F5]">NEJM</strong> потряс медицину: у{' '}
              <strong className="text-[#34D399]">25% пациентов в глубокой коме</strong> (60 из 241) сохраняется скрытое сознание. Метод Марчелло Массимини бьёт мягким магнитным импульсом по коре и считает сложность эха — индекс <code className="text-[#FACC15]">PCI*</code> (порог жизни сознания: <strong className="text-[#FACC15]">0.31</strong>).
            </p>
          </div>
        </div>

        {/* 3 ANONYMOUS PATIENT TABS + LIVE SHIFT SCORE */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {PATIENTS.map((p) => {
              const active = p.id === activeId;
              const verdict = state.icuDiagnoses[p.id];
              const isRight = verdict && verdict === ICU_TRUTH[p.id];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  className={`v6-pill px-4 py-2.5 rounded-full border text-[13px] font-medium inline-flex items-center gap-2.5 cursor-pointer ${
                    active
                      ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5]'
                      : 'bg-[#FAF9F5]/6 text-[#D8DEE9] border-[#FAF9F5]/14 hover:bg-[#FAF9F5]/12'
                  }`}
                >
                  <span>{p.code}</span>
                  {verdict && (
                    <span className={isRight ? 'text-[#0D7A5F]' : 'text-[#FC4109]'}>
                      {isRight ? '✓' : '✕'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2 rounded-full bg-[#181C23] border border-[#FAF9F5]/12 font-mono-tech text-[11px] text-[#C8D0DC]">
            <span>ТОЧНОСТЬ ДЕЖУРСТВА: </span>
            <span className="text-[#34D399] font-semibold">
              {icuStats.correct} / {icuStats.total}
            </span>
          </div>
        </div>

        {/* MAIN CLINICAL CONSOLE */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 4 cols: Patient Chart + 10-20 Cortical Echo + ZAP Trigger */}
          <div className="lg:col-span-4 rounded-[22px] bg-[#181C23] border border-[#FAF9F5]/10 p-6 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono-tech text-[10.5px] text-[#9AA3B2]">
                <span>{patient.bedTitle}</span>
                <span className={isZapped ? (isAbove ? 'text-[#34D399]' : 'text-[#94A3B8]') : 'text-[#64748B]'}>
                  {isZapped ? `PCI* = ${patient.pci.toFixed(2)}` : 'НЕТ ЗАМЕРА'}
                </span>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#C8D0DC]">{patient.clinicalChart}</p>
            </div>

            {/* 10-20 Top-Down Cortical Montage */}
            <div className="relative mx-auto w-52 h-52 flex items-center justify-center">
              <svg viewBox="0 0 220 220" className="w-full h-full">
                <path d="M 102 14 L 110 4 L 118 14" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
                <path
                  d="M 107 20 C 66 22, 34 58, 34 110 C 34 162, 64 198, 107 200 Z"
                  fill="rgba(255,255,255,0.035)"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 113 20 C 154 22, 186 58, 186 110 C 186 162, 156 198, 113 200 Z"
                  fill="rgba(255,255,255,0.035)"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1.2"
                />

                {isZapped &&
                  [0.32, 0.62, 0.94].map((ringRatio, i) => {
                    const r = 10 + sweepProgress * 84 * patient.spread * ringRatio;
                    const alpha = Math.max(0, (1 - sweepProgress * 0.72) * (isAbove ? 0.88 : 0.45));
                    return (
                      <circle
                        key={i}
                        cx="84"
                        cy="74"
                        r={r}
                        fill="none"
                        stroke={isAbove ? '#34D399' : '#94A3B8'}
                        strokeWidth={i === 0 ? 2.2 : 1.3}
                        opacity={alpha}
                      />
                    );
                  })}

                {[
                  { x: 84, y: 74, delay: 0.0, lbl: 'Fz' },
                  { x: 136, y: 74, delay: 0.24, lbl: 'F4' },
                  { x: 110, y: 110, delay: 0.3, lbl: 'Cz' },
                  { x: 64, y: 126, delay: 0.38, lbl: 'T3' },
                  { x: 156, y: 126, delay: 0.5, lbl: 'T4' },
                  { x: 88, y: 168, delay: 0.6, lbl: 'O1' },
                  { x: 132, y: 168, delay: 0.68, lbl: 'Pz' },
                ].map((node, idx) => {
                  const reached = isZapped && sweepProgress >= node.delay && (idx === 0 || patient.spread > node.delay * 0.92);
                  return (
                    <g key={node.lbl}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={idx === 0 ? 5.5 : 3.8}
                        fill={idx === 0 ? '#FC4109' : reached ? (isAbove ? '#34D399' : '#94A3B8') : '#343D4D'}
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
              onClick={handleZap}
              className="v6-pill w-full py-3 px-4 rounded-full bg-[#FC4109] hover:bg-[#E53906] text-[#FAF9F5] font-sans-ui text-[13.5px] font-medium inline-flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(252,65,9,0.28)] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isZapped ? 'Повторить ТМС-импульс' : '1. Подать ТМС-импульс (ZAP)'}</span>
            </button>
          </div>

          {/* Right 8 cols: 5-Channel D3 EEG Oscilloscope + Golden 0.31 Gauge + Physician Diagnosis Buttons */}
          <div className="lg:col-span-8 rounded-[22px] bg-[#181C23] border border-[#FAF9F5]/10 p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[11px]">
              <span className="text-[#C8D0DC]">
                {isZapped
                  ? '5-КАНАЛЬНАЯ ЭЭГ · ОТКЛИК КОРЫ 0 → 300 МС'
                  : 'НАЖМИТЕ «ПОДАТЬ ТМС-ИМПУЛЬС», ЧТОБЫ СНЯТЬ ЭХО КОРЫ'}
              </span>
              <span className="text-[#FACC15]">ПОРОГ МАССИМИНИ: PCI* = 0.31</span>
            </div>

            {/* D3-Shape 5-Channel Oscilloscope */}
            <div className="relative rounded-2xl bg-[#0D1015] border border-[#FAF9F5]/8 p-3 overflow-hidden">
              <svg viewBox="0 0 680 250" className="w-full h-[200px] md:h-[225px] block">
                <defs>
                  <clipPath id="icuSweepClip">
                    <rect x="0" y="0" width={Math.max(0, 680 * sweepProgress)} height="250" />
                  </clipPath>
                </defs>

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

                <line x1={zapX} y1="8" x2={zapX} y2="242" stroke="#FC4109" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x={zapX + 6} y="20" fill="#FC4109" fontSize="10" fontFamily="JetBrains Mono Variable, monospace">
                  ZAP · 0 мс
                </text>

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

                {isZapped ? (
                  <g clipPath="url(#icuSweepClip)">
                    {channelPaths.map((d, ch) => (
                      <path
                        key={ch}
                        d={d}
                        fill="none"
                        stroke={isAbove ? '#34D399' : '#94A3B8'}
                        strokeWidth={ch === 2 ? 2.1 : 1.35}
                        opacity={ch === 2 ? 0.96 : 0.48}
                      />
                    ))}
                  </g>
                ) : (
                  <text
                    x="355"
                    y="128"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="13"
                    fontFamily="JetBrains Mono Variable, monospace"
                  >
                    ОЖИДАНИЕ МАГНИТНОГО ИМПУЛЬСА…
                  </text>
                )}
              </svg>
            </div>

            {/* Golden 0.31 Calibrated Bar */}
            <div>
              <div className="flex items-center justify-between font-mono-tech text-[11px] mb-2">
                <span className="text-[#9AA3B2]">Индекс сложности возмущения (PCI*)</span>
                <span className="text-base font-semibold text-[#FAF9F5]">
                  {isZapped ? `PCI* = ${patient.pci.toFixed(2)}` : '— . — —'}
                </span>
              </div>
              <div className="relative h-3 w-full rounded-full bg-[#FAF9F5]/10 overflow-visible mb-6">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pciBarPct}%`,
                    backgroundColor: isAbove ? '#34D399' : '#64748B',
                  }}
                />
                <div className="absolute -top-1.5 -bottom-1.5 w-[2px] bg-[#FACC15]" style={{ left: `${thresholdPct}%` }}>
                  <span className="absolute top-5 -translate-x-1/2 font-mono-tech text-[10px] font-semibold text-[#FACC15] whitespace-nowrap">
                    0.31
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Physician's Diagnosis Decision */}
            <div className="space-y-3">
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#9AA3B2]">
                2. ВАШ КЛИНИЧЕСКИЙ ДИАГНОЗ ДЛЯ {patient.code}:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDiagnose('coma')}
                  className={`v6-pill px-4 py-3 rounded-xl border text-left text-[13.5px] font-medium cursor-pointer ${
                    userVerdict === 'coma'
                      ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5]'
                      : 'bg-[#FAF9F5]/6 hover:bg-[#FAF9F5]/12 text-[#FAF9F5] border-[#FAF9F5]/16'
                  }`}
                >
                  Глубокая кома (нет сознания)
                </button>
                <button
                  type="button"
                  onClick={() => handleDiagnose('cmd')}
                  className={`v6-pill px-4 py-3 rounded-xl border text-left text-[13.5px] font-medium cursor-pointer ${
                    userVerdict === 'cmd'
                      ? 'bg-[#34D399] text-[#081A14] border-[#34D399]'
                      : 'bg-[#FAF9F5]/6 hover:bg-[#FAF9F5]/12 text-[#FAF9F5] border-[#FAF9F5]/16'
                  }`}
                >
                  Скрытое сознание (CMD — пациент слышит!)
                </button>
              </div>

              {userVerdict && (
                <div
                  className={`p-4 rounded-xl border text-[13.5px] leading-[1.58] flex items-start gap-3 animate-[beatRise_300ms_ease] ${
                    userVerdict === truth
                      ? 'bg-[#34D399]/12 border-[#34D399]/35 text-[#D8F5E8]'
                      : 'bg-[#FC4109]/14 border-[#FC4109]/40 text-[#FFE2D9]'
                  }`}
                >
                  {userVerdict === truth ? (
                    <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#FC4109] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.11em] font-semibold mb-1">
                      {userVerdict === truth ? 'ДИАГНОЗ ПОДТВЕРЖДЁН ПРОТОКОЛОМ' : 'КЛИНИЧЕСКАЯ ОШИБКА — СВЕРЬТЕ С ПОРОГОМ 0.31'}
                    </div>
                    <p>{patient.revealFact}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scientifically Honest Domino Bridge -> Interlude Part III */}
        <div className="mt-14 pt-6 border-t border-[#FAF9F5]/14 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[17px] text-[#C8D0DC] max-w-2xl">
            В реанимации нас спасла магнитная катушка над корой. Но как искать сознание там, где вообще нет человеческой коры — у осьминога — или вообще нет нейронов — у ИИ?
          </p>
          <button
            type="button"
            onClick={onNextChapter}
            className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#34D399] hover:text-[#FAF9F5] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Выйти к Части III · За пределы человека</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
