import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import { ArrowDown, CheckCircle2, Lock, XCircle, Zap } from 'lucide-react';
import { ICU_TRUTH, useExplorer, type IcuVerdict } from '../context/ExplorerContext';

interface Chapter6IcuJournalProps {
  onDarkInView: (inView: boolean) => void;
  onNextChapter: () => void;
}

interface PatientCase {
  id: 'p1' | 'p2' | 'p3';
  code: string;
  genitive: string;
  bedTitle: string;
  clinicalChart: string;
  pci: number;
  decay: number;
  complexity: number;
  spread: number;
  revealFact: string;
}

interface PciAnalogyCase {
  id: 'pillow' | 'bell' | 'orchestra';
  title: string;
  stateLabel: string;
  pci: number;
  zipRatio: string;
  explain: string;
  wavePath: string;
  above: boolean;
}

// Scientifically rigorous 3-pole PCI* intuition (No integration / No differentiation / Both!)
const PCI_ANALOGIES: PciAnalogyCase[] = [
  {
    id: 'pillow',
    title: '1. Удар по подушке',
    stateLabel: 'Кома / Пропофол · нет связности',
    pci: 0.18,
    zipRatio: 'ZIP сжал на 82%',
    explain: 'Магнитный импульс даёт глухой, короткий всплеск в одной точке и сразу гаснет. Простой узор сжимается как крошечный ZIP-файл — внутри темно.',
    wavePath: 'M 4 22 L 26 22 L 36 8 L 48 25 L 62 21 L 196 22',
    above: false,
  },
  {
    id: 'bell',
    title: '2. Один большой колокол',
    stateLabel: 'Глубокий сон без снов · нет разнообразия',
    pci: 0.24,
    zipRatio: 'ZIP сжал на 76%',
    explain: 'Волна разлетается по всей коре, НО все зоны гудят монотонно в унисон. Повторяющийся ритм ZIP снова легко сжимает — сознания всё ещё нет.',
    wavePath: 'M 4 22 Q 20 6, 36 22 T 68 22 T 100 22 T 132 22 T 164 22 T 196 22',
    above: false,
  },
  {
    id: 'orchestra',
    title: '3. Оркестр колокольчиков',
    stateLabel: 'Бодрствование / Скрытое сознание',
    pci: 0.54,
    zipRatio: 'ZIP почти бессилен',
    explain: 'Импульс запускает сложный, неповторяющийся перезвон по обоим полушариям: есть и связность, и разнообразие. Сжать это невозможно — внутри кто-то есть!',
    wavePath: 'M 4 22 L 22 22 L 30 6 L 40 34 L 52 12 L 66 28 L 80 9 L 94 31 L 110 14 L 126 26 L 142 11 L 158 29 L 176 17 L 196 22',
    above: true,
  },
];

const PATIENTS: PatientCase[] = [
  {
    id: 'p1',
    code: 'ПАЦИЕНТ № 01',
    genitive: 'ПАЦИЕНТА № 01',
    bedTitle: 'Койка 04 · Травма головы · 6 сут.',
    clinicalChart: 'Глаза закрыты, на голос и прикосновения не реагирует. Родственники спрашивают, слышит ли он их.',
    pci: 0.21,
    decay: 3.1,
    complexity: 0.14,
    spread: 0.24,
    revealFact:
      'Это глубокая бессознательная кома (PCI* = 0.21 < 0.31). Магнитный импульс вызывает лишь глухой локальный удар («подушка») без сложного эха по коре.',
  },
  {
    id: 'p2',
    code: 'ПАЦИЕНТ № 02',
    genitive: 'ПАЦИЕНТА № 02',
    bedTitle: 'Койка 09 · Инсульт ствола · 19 сут.',
    clinicalChart: 'Полная внешняя неподвижность. По внешним тестам поставлен диагноз «вегетативное состояние».',
    pci: 0.44,
    decay: 0.72,
    complexity: 0.92,
    spread: 0.95,
    revealFact:
      'Скрытое сознание (PCI* = 0.44 > 0.31)! Как доказало исследование NEJM (август 2024), каждый четвёртый такой пациент (60 из 241 — ровно 25%) полностью понимает речь врача внутри парализованного тела.',
  },
  {
    id: 'p3',
    code: 'ПАЦИЕНТ № 03',
    genitive: 'ПАЦИЕНТА № 03',
    bedTitle: 'Койка 12 · Остановка сердца',
    clinicalChart: 'Внешне нет ни моргания, ни сжатия руки по команде. Пограничный случай — решайте строго по индексу эха.',
    pci: 0.37,
    decay: 0.96,
    complexity: 0.76,
    spread: 0.84,
    revealFact:
      'Выше золотого порога Массимини (PCI* = 0.37 > 0.31)! Сложная волна пересекает оба полушария: здесь сохраняется остров внутреннего опыта, и пациенту нужны бережное общение и нейрореабилитация.',
  },
];

const CHANNEL_COUNT = 5;
const SAMPLES = 96;

/**
 * CHAPTER VI: "Тихий свет в реанимации" (Single deliberate dark spread #111419).
 * Upgraded v8:
 * 1. NEW 15-second interactive 3-pole PCI* = 0.31 Prelude ("Подушка / Один колокол / Оркестр + ZIP") ABOVE the ICU console!
 * 2. ZERO COLOR SPOILER before user picks a diagnosis (neutral clinical amber-ivory EEG until verdict is submitted!)
 * 3. Step 2 diagnosis buttons gated cleanly until Step 1 (ZAP) is fired
 * 4. Fixed Patient #01 reveal text (no hardcoded "Верно:" when user got it wrong!)
 * 5. Plain Russian clinical labels + clinically accurate 10-20 midline Fz-Cz-Pz montage ("Вид сверху · нос вверху")!
 */
export function Chapter6IcuJournal({ onDarkInView, onNextChapter }: Chapter6IcuJournalProps) {
  const { state, setIcuDiagnosis, icuStats } = useExplorer();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [analogyId, setAnalogyId] = useState<'pillow' | 'bell' | 'orchestra'>('orchestra');
  const [activeId, setActiveId] = useState<'p1' | 'p2' | 'p3'>('p1');
  const [zappedMap, setZappedMap] = useState<Record<string, boolean>>({});
  const [pulseKey, setPulseKey] = useState(0);
  const [sweepProgress, setSweepProgress] = useState(0);

  const analogy = PCI_ANALOGIES.find((a) => a.id === analogyId) ?? PCI_ANALOGIES[2];
  const patient = PATIENTS.find((p) => p.id === activeId) ?? PATIENTS[0];
  const isZapped = Boolean(zappedMap[patient.id]);
  const userVerdict = state.icuDiagnoses[patient.id];
  const isDiagnosed = Boolean(userVerdict);
  const truth = ICU_TRUTH[patient.id];
  const isAbove = patient.pci >= 0.31;

  // Neutral clinical ivory-amber UNTIL diagnosed (zero green/grey spoiler!), then reveal true diagnostic color!
  const activeWaveColor = isDiagnosed ? (isAbove ? '#34D399' : '#94A3B8') : '#E5C67A';

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => onDarkInView(entry.isIntersecting),
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
    if (!isZapped) return;
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
      className="relative bg-[#111419] text-[#FAF9F5] pt-24 pb-20 md:pt-28 md:pb-24 overflow-hidden scroll-mt-0"
      aria-label="Глава VI — Тихий свет в реанимации"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Dark Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#FAF9F5]/14 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#8E98A8]">
          <span className="text-[#34D399] font-semibold">ЧАСТЬ II · ПОД ЧЕРЕПОМ · ГЛАВА VI</span>
          <span>ДЕЖУРСТВО В РЕАНИМАЦИИ · NEJM 2024 · стр. 86</span>
        </div>

        {/* Clinical Opening */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(30px,4vw,52px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block text-[#FAF9F5]">Постучать по мозгу</span>
              <span className="font-serif-editorial italic font-normal text-[#C8D0DC] block mt-1">
                и услышать эхо разума.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15px] leading-[1.62] text-[#A8B2C1]">
            <p>
              В августе 2024 года журнал <strong className="text-[#FAF9F5]">NEJM</strong> потряс медицину: у{' '}
              <strong className="text-[#34D399]">25% неподвижных пациентов в коме</strong> (60 из 241) сохраняется скрытое сознание — они слышат врачей, но не могут подать знак. Как их найти?
            </p>
          </div>
        </div>

        {/* NEW 15-SECOND PRELUDE: "КАК РАБОТАЕТ РАДАР СОЗНАНИЯ PCI* = 0.31 (Подушка / Один колокол / Оркестр + ZIP)" */}
        <div className="mt-9 rounded-[22px] bg-[#181C23] border border-[#FAF9F5]/12 p-5 md:p-6 space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FACC15] font-semibold">
                КАК РАБОТАЕТ ИНДЕКС PCI* И ОТКУДА ВЗЯЛОСЬ ЧИСЛО 0.31 (15 СЕК)
              </div>
              <p className="text-[14px] leading-[1.6] text-[#C8D0DC] mt-1.5 max-w-3xl">
                Врач подносит к голове магнитную катушку (<strong className="text-[#FAF9F5]">ТМС</strong> — безболезненный щелчок), а датчики на коже (<strong className="text-[#FAF9F5]">ЭЭГ</strong>) записывают эхо. Затем компьютер сжимает запись как <strong className="text-[#FAF9F5]">ZIP-архив</strong> и выдаёт число от 0 до 1 — <code className="text-[#FACC15]">PCI*</code>. Команда Марчелло Массимини проверила прибор на 150 людях в сознании и под наркозом: ровно на отметке <strong className="text-[#FACC15]">0.31</strong> прошла почти безошибочная граница.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PCI_ANALOGIES.map((item) => {
                const active = item.id === analogy.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAnalogyId(item.id)}
                    className={`v6-pill text-left p-3.5 rounded-xl border cursor-pointer transition-all ${
                      active
                        ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5]'
                        : 'bg-[#111419] hover:bg-[#1E232C] text-[#D8DEE9] border-[#FAF9F5]/12'
                    }`}
                  >
                    <div className="font-display font-bold text-[13.5px]">{item.title}</div>
                    <div className={`font-mono-tech text-[10px] mt-1 ${active ? 'text-[#4B4A46]' : 'text-[#B5BECD]'}`}>
                      {item.stateLabel}
                    </div>
                    <div
                      className={`font-mono-tech text-[12px] font-bold mt-2 ${
                        item.above
                          ? active
                            ? 'text-[#0D7A5F]'
                            : 'text-[#34D399]'
                          : active
                            ? 'text-[#C83509]'
                            : 'text-[#CBD5E1]'
                      }`}
                    >
                      PCI* = {item.pci.toFixed(2)} {item.above ? '> 0.31' : '< 0.31'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-5 rounded-xl bg-[#0D1015] border border-[#FAF9F5]/10 p-4 space-y-2.5">
              <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.11em]">
                <span className="text-[#FACC15]">{analogy.zipRatio}</span>
                <span className={analogy.above ? 'text-[#34D399] font-semibold' : 'text-[#94A3B8]'}>
                  {analogy.above ? 'ВЫШЕ ПОРОГА 0.31 · СОЗНАНИЕ' : 'НИЖЕ ПОРОГА 0.31 · ТИШИНА'}
                </span>
              </div>
              <svg viewBox="0 0 200 42" className="w-full h-10 block">
                <line x1="0" y1="22" x2="200" y2="22" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <path
                  d={analogy.wavePath}
                  fill="none"
                  stroke={analogy.above ? '#34D399' : '#94A3B8'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-[12.5px] leading-[1.52] text-[#B7C0CE]">{analogy.explain}</p>
            </div>
          </div>
        </div>

        {/* NOW THE HANDS-ON ICU SHIFT: 3 ANONYMOUS PATIENTS + LIVE SHIFT SCORE */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#8E98A8] mr-1">
              ВАШЕ ДЕЖУРСТВО:
            </span>
            {PATIENTS.map((p) => {
              const active = p.id === activeId;
              const verdict = state.icuDiagnoses[p.id];
              const isRight = verdict && verdict === ICU_TRUTH[p.id];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  className={`v6-pill px-4 py-2 rounded-full border text-[13px] font-medium inline-flex items-center gap-2.5 cursor-pointer ${
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
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left 4 cols: Patient Chart + 10-20 Midline Montage + ZAP Trigger */}
          <div className="lg:col-span-4 rounded-[22px] bg-[#181C23] border border-[#FAF9F5]/10 p-5 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 font-mono-tech text-[10.5px] text-[#9AA3B2]">
                <span className="min-w-0 truncate">{patient.bedTitle}</span>
                <span
                  className="whitespace-nowrap shrink-0 font-semibold"
                  style={{ color: isZapped ? activeWaveColor : '#64748B' }}
                >
                  {isZapped ? `PCI* = ${patient.pci.toFixed(2)}` : 'НЕТ ЗАМЕРА'}
                </span>
              </div>
              <p className="text-[13px] leading-[1.52] text-[#C8D0DC]">{patient.clinicalChart}</p>
            </div>

            {/* 10-20 Top-Down Cortical Montage: strictly aligned midline Fz - Cz - Pz */}
            <div className="relative mx-auto w-44 h-48 flex flex-col items-center justify-center">
              <svg viewBox="0 0 220 220" className="w-44 h-44 block">
                <path d="M 102 14 L 110 4 L 118 14" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" />
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
                        cx="110"
                        cy="152"
                        r={r}
                        fill="none"
                        stroke={activeWaveColor}
                        strokeWidth={i === 0 ? 2.2 : 1.3}
                        opacity={alpha}
                      />
                    );
                  })}

                {[
                  { x: 110, y: 152, delay: 0.0, lbl: 'Pz', dx: 11, dy: 3, anchor: 'start' as const, isZap: true },
                  { x: 110, y: 108, delay: 0.24, lbl: 'Cz', dx: 10, dy: 3, anchor: 'start' as const, isZap: false },
                  { x: 82, y: 180, delay: 0.28, lbl: 'O1', dx: -9, dy: 3, anchor: 'end' as const, isZap: false },
                  { x: 56, y: 112, delay: 0.42, lbl: 'T3', dx: -9, dy: 3, anchor: 'end' as const, isZap: false },
                  { x: 164, y: 112, delay: 0.44, lbl: 'T4', dx: 9, dy: 3, anchor: 'start' as const, isZap: false },
                  { x: 152, y: 72, delay: 0.56, lbl: 'F4', dx: 9, dy: 3, anchor: 'start' as const, isZap: false },
                  { x: 110, y: 56, delay: 0.66, lbl: 'Fz', dx: 10, dy: 3, anchor: 'start' as const, isZap: false },
                ].map((node) => {
                  const reached = isZapped && sweepProgress >= node.delay && (node.isZap || patient.spread > node.delay * 0.92);
                  return (
                    <g key={node.lbl}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.isZap ? 5.5 : 3.8}
                        fill={node.isZap ? '#FC4109' : reached ? activeWaveColor : '#343D4D'}
                      />
                      <text
                        x={node.x + node.dx}
                        y={node.y + node.dy}
                        textAnchor={node.anchor}
                        fill={node.isZap ? '#FF9B7D' : 'rgba(255,255,255,0.55)'}
                        fontSize="8.5"
                        fontFamily="JetBrains Mono Variable, monospace"
                      >
                        {node.lbl}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <span className="font-mono-tech text-[9.5px] uppercase tracking-[0.1em] text-[#7D8796]">
                Вид сверху · нос вверху · датчики ЭЭГ
              </span>
            </div>

            <button
              type="button"
              onClick={handleZap}
              className="v6-pill w-full py-2.5 px-4 rounded-full bg-[#FC4109] hover:bg-[#E53906] text-[#FAF9F5] font-sans-ui text-[13.5px] font-medium inline-flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(252,65,9,0.28)] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isZapped ? 'Повторить магнитный импульс' : 'Шаг 1 · Подать магнитный импульс (ZAP)'}</span>
            </button>
          </div>

          {/* Right 8 cols: 5-Channel D3 EEG Oscilloscope (NO SPOILER COLOR!) + Golden 0.31 Gauge + Gated Diagnosis Buttons */}
          <div className="lg:col-span-8 rounded-[22px] bg-[#181C23] border border-[#FAF9F5]/10 p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[11px]">
              <span className="text-[#C8D0DC]">
                {isZapped
                  ? '5-КАНАЛЬНАЯ ЭЭГ · ОТКЛИК ОТ Pz · 0 → 300 МС'
                  : 'НАЖМИТЕ «ШАГ 1 · ПОДАТЬ ИМПУЛЬС», ЧТОБЫ СНЯТЬ ЭХО КОРЫ'}
              </span>
              <span className="text-[#FACC15]">ПОРОГ МАССИМИНИ: PCI* = 0.31</span>
            </div>

            <div className="relative rounded-2xl bg-[#0D1015] border border-[#FAF9F5]/8 p-2.5 overflow-hidden">
              <svg viewBox="0 0 680 250" className="w-full h-[170px] md:h-[180px] block">
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
                        stroke={activeWaveColor}
                        strokeWidth={ch === 2 ? 2.15 : 1.35}
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

            {/* Golden 0.31 Calibrated Bar (Neutral amber until diagnosed — ZERO color spoiler!) */}
            <div>
              <div className="flex items-center justify-between font-mono-tech text-[11px] mb-2">
                <span className="text-[#9AA3B2]">Сравните замеренный индекс PCI* с порогом 0.31</span>
                <span className="text-base font-semibold text-[#FAF9F5]">
                  {isZapped ? `PCI* = ${patient.pci.toFixed(2)}` : '— . — —'}
                </span>
              </div>
              <div className="relative h-3 w-full rounded-full bg-[#FAF9F5]/10 overflow-visible mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pciBarPct}%`,
                    backgroundColor: activeWaveColor,
                  }}
                />
                <div className="absolute -top-1.5 -bottom-1.5 w-[2px] bg-[#FACC15]" style={{ left: `${thresholdPct}%` }}>
                  <span className="absolute top-5 -translate-x-1/2 font-mono-tech text-[10px] font-semibold text-[#FACC15] whitespace-nowrap">
                    0.31
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Physician's Diagnosis Decision (Gated cleanly until Step 1 ZAP is pressed!) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#9AA3B2]">
                <span>ШАГ 2 · ВАШ КЛИНИЧЕСКИЙ ДИАГНОЗ ДЛЯ {patient.genitive}:</span>
                {!isZapped && (
                  <span className="inline-flex items-center gap-1 text-[#FACC15]">
                    <Lock className="w-3 h-3" />
                    <span>Сначала подайте импульс</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!isZapped}
                  onClick={() => handleDiagnose('coma')}
                  className={`v6-pill px-4 py-3 rounded-xl border text-left text-[13.5px] font-medium ${
                    !isZapped
                      ? 'bg-[#FAF9F5]/4 text-[#64748B] border-[#FAF9F5]/8 cursor-not-allowed'
                      : userVerdict === 'coma'
                        ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5] cursor-pointer'
                        : 'bg-[#FAF9F5]/6 hover:bg-[#FAF9F5]/12 text-[#FAF9F5] border-[#FAF9F5]/16 cursor-pointer'
                  }`}
                >
                  Глубокая кома (нет сознания)
                </button>
                <button
                  type="button"
                  disabled={!isZapped}
                  onClick={() => handleDiagnose('cmd')}
                  className={`v6-pill px-4 py-3 rounded-xl border text-left text-[13.5px] font-medium ${
                    !isZapped
                      ? 'bg-[#FAF9F5]/4 text-[#64748B] border-[#FAF9F5]/8 cursor-not-allowed'
                      : userVerdict === 'cmd'
                        ? 'bg-[#34D399] text-[#081A14] border-[#34D399] cursor-pointer'
                        : 'bg-[#FAF9F5]/6 hover:bg-[#FAF9F5]/12 text-[#FAF9F5] border-[#FAF9F5]/16 cursor-pointer'
                  }`}
                >
                  Скрытое сознание (пациент слышит!)
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
            В реанимации нас спасла магнитная катушка над человеческой корой. Но как искать сознание там, где вообще нет человеческого мозга — у осьминога — или вообще нет нейронов — у ИИ?
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
