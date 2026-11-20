import { useRef, useState } from 'react';
import { ArrowDown, Crosshair, Scissors, Sparkles } from 'lucide-react';
import { useExplorer, type CogitateBet } from '../context/ExplorerContext';
import { ScholarMarginNote } from './ScholarMarginalia';

interface Chapter4WagerAndDiopterProps {
  onNextChapter: () => void;
}

type OpticalMode = 'raw' | 'iit' | 'gnwt' | 'verdict';

const TIMELINE_MILESTONES = [
  {
    year: '1998',
    place: 'Бремен · Бар после конференции',
    title: 'Пари на ящик вина',
    text: 'Нейробиолог Кристоф Кох уверен: за 25 лет наука найдёт чистую «нейронную подпись» сознания. Философ Дэвид Чалмерс ставит против — и оба расписываются на бланке пари.',
  },
  {
    year: '2019–2023',
    place: '12 лабораторий · 256 испытуемых',
    title: 'Состязательный протокол COGITATE',
    text: 'Впервые в истории нейронауки главные конкурирующие теории (IIT и GNWT) заранее зафиксировали жёсткие предсказания и отдали проверку независимым лабораториям на fMRI, MEG и iEEG.',
  },
  {
    year: 'Июнь 2023',
    place: 'Нью-Йорк · Конференция ASSC',
    title: 'Ящик мадеры сменил владельца',
    text: 'Первые итоги эксперимента оглашают прямо со сцены. Ни одна теория не взяла чистую победу — Кох признаёт поражение и приносит редкое вино на сцену.',
  },
  {
    year: 'Апрель 2025',
    place: 'Журнал Nature (Vol. 642)',
    title: 'Официальный вердикт опубликован',
    text: 'Обе доминирующие теории сознания XX–XXI века получили болезненные эмпирические пробоины. Старые школьные схемы мозга больше не работают.',
  },
];

const DIOPTER_PRESETS = [
  { label: 'Таламус (Центр)', x: 50, y: 47 },
  { label: 'Затылок · IIT', x: 70, y: 46 },
  { label: 'Лобная кора · GNWT', x: 29, y: 39 },
];

/**
 * CHAPTER IV: "Большое пари" (0% Pop Culture — Pure Museum Science!)
 * Mechanic 4.1: Swiss Timeline with tactile #FC4109 Perforated Tear-Strip ("Вскрыть протокол 1998→2023")
 * Mechanic 4.2: Photorealistic Studio Brain on matte #FAF9F5 + Leica/Dieter Rams Optical Diopter Lens!
 */
export function Chapter4WagerAndDiopter({ onNextChapter }: Chapter4WagerAndDiopterProps) {
  const { state, setWagerUnsealed, setCogitateBet } = useExplorer();
  const [opticalMode, setOpticalMode] = useState<OpticalMode>('raw');
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 50, y: 47 });
  const [isDraggingLens, setIsDraggingLens] = useState(false);
  const plateRef = useRef<HTMLDivElement | null>(null);

  const updateLensFromPointer = (clientX: number, clientY: number) => {
    const el = plateRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xPct = Math.max(12, Math.min(88, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(14, Math.min(86, ((clientY - rect.top) / rect.height) * 100));
    setLensPos({ x: xPct, y: yPct });
  };

  const handleBet = (bet: Exclude<CogitateBet, null>) => {
    setCogitateBet(bet);
    setOpticalMode('verdict');
  };

  const lensZoneLabel =
    lensPos.x < 40
      ? 'ПРЕФРОНТАЛЬНАЯ КОРА (ЗОНА GNWT)'
      : lensPos.x > 61
        ? 'ЗАДНЯЯ «ГОРЯЧАЯ ЗОНА» (ЗОНА IIT)'
        : 'ТАЛАМУС И МОЗОЛИСТОЕ ТЕЛО · САГИТТАЛЬНЫЙ СРЕЗ';

  return (
    <section
      id="ch-4"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Глава IV — Большое пари и оптический диоптр COGITATE 2025"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ЧАСТЬ II · ПОД ЧЕРЕПОМ · ГЛАВА IV</span>
          <span>БОЛЬШОЕ ПАРИ · COGITATE 2025 · стр. 52</span>
        </div>

        {/* PART 4.1: SWISS 4-COLUMN TIMELINE + PERFORATED TEAR-STRIP */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">25 лет спора</span>
              <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
                и один проигранный ящик мадеры.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              Два главных лагеря нейронауки четверть века спорили о том, где именно в коре зажигается сознание: в{' '}
              <strong className="font-semibold text-[#141413]">задней сенсорной зоне</strong> (Теория интегрированной информации, IIT) или во{' '}
              <strong className="font-semibold text-[#141413]">вспышке лобной коры</strong> (Глобальное нейронное рабочее пространство, GNWT).
            </p>
          </div>
        </div>

        {/* 4-Column Crisp Swiss Fact Ribbon */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-b border-[#141413]/14 divide-y sm:divide-y-0 sm:divide-x divide-[#141413]/12">
          {TIMELINE_MILESTONES.map((item, idx) => (
            <div key={item.year} className="py-6 sm:px-5 first:sm:pl-0 last:sm:pr-0 space-y-2.5">
              <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase tracking-[0.12em]">
                <span className="text-[#FC4109] font-semibold">{item.year}</span>
                <span className="text-[#7A7872]">0{idx + 1}</span>
              </div>
              <div className="font-mono-tech text-[10px] text-[#5E5D59]">{item.place}</div>
              <h3 className="font-display font-bold text-[17px] leading-snug text-[#141413]">
                {item.title}
              </h3>
              <p className="text-[13.5px] leading-[1.58] text-[#4A4945]">{item.text}</p>
            </div>
          ))}
        </div>

        {/* MECHANIC 4.1: TACTILE #FC4109 PERFORATED TEAR-STRIP ("Вскрыть протокол пари") */}
        <div className="mt-6">
          {!state.wagerUnsealed ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                window.getSelection()?.removeAllRanges();
                setWagerUnsealed(true);
              }}
              className="group select-none w-full relative overflow-hidden rounded-xl border-2 border-dashed border-[#FC4109]/70 bg-[#FC4109]/5 hover:bg-[#FC4109]/10 px-5 py-4 transition-all cursor-pointer flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FC4109] text-[#FAF9F5] flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12">
                  <Scissors className="w-4 h-4" />
                </span>
                <div className="text-left">
                  <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
                    ОТРЫВНАЯ ПЕРФОРАЦИЯ · ПРОТОКОЛ ASSC 2023
                  </div>
                  <div className="font-display font-semibold text-[15.5px] text-[#141413]">
                    Надорвать пломбу — прочитать признание Коха и ставку до 2048 года
                  </div>
                </div>
              </div>
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#FC4109]">
                Вскрыть →
              </span>
            </button>
          ) : (
            <div className="rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] p-5 md:p-6 animate-[beatRise_380ms_cubic-bezier(0.22,1,0.36,1)]">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#141413]/10 font-mono-tech text-[10.5px] uppercase tracking-[0.13em]">
                <span className="text-[#FC4109] font-semibold">
                  ПЛОМБА ВСКРЫТА · 23 ИЮНЯ 2023 · НЬЮ-ЙОРК
                </span>
                <span className="text-[#5E5D59]">НОВОЕ ПАРИ ПРОДЛЕНО ДО 2048 ГОДА</span>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <ScholarMarginNote
                  scholar="koch"
                  gesture="clink"
                  tag="ПРОИГРАЛ 1998→2023"
                  quote="Я был уверен, что к 2023-му мы найдём чистый код сознания. Я ошибался. Держи свою мадеру, Дэвид — но я удваиваю ставку: к 2048 году мы всё-таки решим эту загадку."
                />
                <ScholarMarginNote
                  scholar="chalmers"
                  gesture="clink"
                  tag="ВЫИГРАЛ МАДЕРУ"
                  quote="Самое вкусное вино в истории философии! Но рад я другому: впервые в науке о сознании оппоненты не отмахнулись от данных, а публично проверили свои модели."
                />
              </div>
            </div>
          )}
        </div>

        {/* PART 4.2: STUDIO ANATOMICAL PLATE + SWISS OPTICAL DIOPTER (LEICA / DIETER RAMS) */}
        <div className="mt-16 pt-12 border-t border-[#141413]/12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 4 cols: User's Bet + Optical Filter Controls */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                  АТЛАС ВСКРЫТИЯ · NATURE 2025 (N = 256)
                </div>
                <h3 className="font-display font-bold text-[26px] md:text-[30px] leading-tight mt-2">
                  Сделайте ставку — и просветите мозг диоптром
                </h3>
                <p className="text-[14.5px] leading-[1.6] text-[#4A4945] mt-2.5">
                  Водите графитовым оптическим диоптром по анатомической таблице справа, чтобы заглянуть сквозь кору вглубь — до таламуса и мозолистого тела.
                </p>
              </div>

              {/* Pre-Reveal Bet Buttons */}
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#5E5D59]">
                  {state.cogitateBet
                    ? '✓ ВАША СТАВКА ЗАПИСАНА · ДАННЫЕ ВСКРЫТЫ:'
                    : 'НА КОГО ВЫ ПОСТАВИТЕ ДО ВСКРЫТИЯ ДАННЫХ?'}
                </div>

                {(
                  [
                    {
                      id: 'iit',
                      title: 'Затылок (IIT · Тонони / Кох)',
                      sub: 'Сознание — устойчивая связность в задней коре',
                    },
                    {
                      id: 'gnwt',
                      title: 'Лобная кора (GNWT · Деан)',
                      sub: 'Сознание — вспышка «воспламенения» во лбу',
                    },
                    {
                      id: 'draw',
                      title: 'Обе теории ошибутся',
                      sub: 'Мозг окажется сложнее обеих школьных моделей',
                    },
                  ] as const
                ).map((opt) => {
                  const chosen = state.cogitateBet === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleBet(opt.id)}
                      className={`v6-pill w-full text-left px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                        chosen
                          ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                          : 'bg-[#F3F1E9] hover:bg-[#EAE7DD] text-[#141413] border-[#141413]/12'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-semibold text-[14px]">{opt.title}</span>
                        <span className="font-mono-tech text-[10.5px] text-[#FC4109]">
                          {chosen ? '● СТАВКА' : '→'}
                        </span>
                      </div>
                      <div
                        className={`text-[12.5px] mt-0.5 ${
                          chosen ? 'text-[#FAF9F5]/72' : 'text-[#5E5D59]'
                        }`}
                      >
                        {opt.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optical Filter Turret Modes */}
              <div className="pt-3 border-t border-[#141413]/10 space-y-2.5">
                <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#5E5D59]">
                  РЕВОЛЬВЕР ОПТИЧЕСКИХ ФИЛЬТРОВ:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'raw', label: 'Чистая анатомия' },
                      { id: 'iit', label: 'Прогноз IIT' },
                      { id: 'gnwt', label: 'Прогноз GNWT' },
                      { id: 'verdict', label: 'Nature 2025' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setOpticalMode(m.id)}
                      className={`v6-pill px-3 py-2 rounded-lg border font-mono-tech text-[11px] cursor-pointer ${
                        opticalMode === m.id
                          ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109]'
                          : 'bg-[#FAF9F5] hover:bg-[#F0EEE6] text-[#141413] border-[#141413]/15'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Empirical Readout */}
              <div className="rounded-xl bg-[#F3F1E9] border border-[#141413]/12 p-4 space-y-2">
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FC4109] font-semibold">
                  {opticalMode === 'raw' && 'РЕЖИМ · АНАТОМИЧЕСКИЙ ДИОПТР'}
                  {opticalMode === 'iit' && 'ОЖИДАНИЕ IIT · ЗАДНЯЯ КОРА'}
                  {opticalMode === 'gnwt' && 'ОЖИДАНИЕ GNWT · ЛОБНАЯ КОРА'}
                  {opticalMode === 'verdict' && 'ВЕРДИКТ NATURE · АПРЕЛЬ 2025'}
                </div>
                <p className="text-[13.5px] leading-[1.58] text-[#2F2E2B]">
                  {opticalMode === 'raw' &&
                    'Наведите курсор (или нажмите пресет ниже) на кору мозга, чтобы сдвинуть оптический диоптр и увидеть внутренний сагиттальный срез: мозолистое тело и таламус.'}
                  {opticalMode === 'iit' &&
                    'IIT предсказывала устойчивую синхронизацию в задней «горячей зоне» (затылок + темя + висок) на всё время, пока испытуемый видит объект.'}
                  {opticalMode === 'gnwt' &&
                    'GNWT предсказывала яркую двойную вспышку «воспламенения» в префронтальной коре — в момент появления стимула и в момент его исчезновения.'}
                  {opticalMode === 'verdict' &&
                    (state.cogitateBet === 'draw'
                      ? 'В точку! Обе теории получили серьёзные пробоины: в задней коре нашли длительное кодирование образа, но БЕЗ предсказанной IIT синхронизации; в лобной коре — БЕЗ второй вспышки GNWT.'
                      : 'Сюрприз апреля 2025-го: ни одна теория не победила! В задней коре не нашлось устойчивой синхронизации IIT, а в лобной — не оказалось финальной вспышки GNWT. Пришлось пересматривать обе модели.')}
                </p>
              </div>
            </div>

            {/* Right 8 cols: Monumental Studio Brain Plate + Swiss Matte-Graphite Optical Diopter */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-[#141413]/14 bg-[#FAF9F5] p-4 md:p-6 shadow-[0_24px_60px_rgba(20,20,19,0.06)]">
                {/* Top Instrument Telemetry */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#141413]/10 font-mono-tech text-[10.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                  <span className="flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-[#FC4109]" />
                    <span>{lensZoneLabel}</span>
                  </span>
                  <span>
                    X: {Math.round(lensPos.x)}% · Y: {Math.round(lensPos.y)}%
                  </span>
                </div>

                {/* INTERACTIVE OPTICAL DIOPTER VIEWPORT (16:10 aligned plates!) */}
                <div
                  ref={plateRef}
                  onPointerMove={(e) => {
                    if (e.pointerType === 'mouse' || isDraggingLens) {
                      updateLensFromPointer(e.clientX, e.clientY);
                    }
                  }}
                  onPointerDown={(e) => {
                    setIsDraggingLens(true);
                    updateLensFromPointer(e.clientX, e.clientY);
                  }}
                  onPointerUp={() => setIsDraggingLens(false)}
                  onPointerLeave={() => setIsDraggingLens(false)}
                  className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#FAF9F5] select-none cursor-crosshair touch-none"
                >
                  {/* BASE LAYER: Photorealistic Sculptural Lateral Cortex */}
                  <img
                    src="/v7/brain-lateral.jpg"
                    alt="Студийная анатомическая пластина коры головного мозга"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />

                  {/* OPTICAL FILTER HEATWAVES (IIT / GNWT / Nature 2025 Verdict) */}
                  <svg
                    viewBox="0 0 1600 1000"
                    className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
                    aria-hidden="true"
                  >
                    <defs>
                      <radialGradient id="iitAura" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#004EDF" stopOpacity="0.46" />
                        <stop offset="65%" stopColor="#004EDF" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#004EDF" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="gnwtAura" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FC4109" stopOpacity="0.48" />
                        <stop offset="65%" stopColor="#FC4109" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#FC4109" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {(opticalMode === 'iit' || opticalMode === 'verdict') && (
                      <g>
                        <ellipse cx="1090" cy="460" rx="220" ry="185" fill="url(#iitAura)" />
                        <circle
                          cx="1090"
                          cy="460"
                          r="138"
                          fill="none"
                          stroke="#004EDF"
                          strokeWidth="2"
                          strokeDasharray="6 6"
                          opacity="0.72"
                        />
                        {/* Clean Swiss leader line up into clear #FAF9F5 sky above brain & diopter */}
                        <line
                          x1="1090"
                          y1="322"
                          x2="1090"
                          y2="134"
                          stroke="#004EDF"
                          strokeWidth="2"
                          strokeDasharray="5 5"
                          opacity="0.8"
                        />
                        <circle cx="1090" cy="322" r="5" fill="#004EDF" />
                        <rect
                          x={opticalMode === 'verdict' ? 868 : 908}
                          y="78"
                          width={opticalMode === 'verdict' ? 544 : 444}
                          height="56"
                          rx="10"
                          fill="#FAF9F5"
                          fillOpacity="0.98"
                          stroke="#004EDF"
                          strokeOpacity="0.42"
                          strokeWidth="1.8"
                        />
                        <text
                          x={opticalMode === 'verdict' ? 1140 : 1130}
                          y="114"
                          textAnchor="middle"
                          fill="#004EDF"
                          fontSize="24"
                          fontWeight="600"
                          fontFamily="JetBrains Mono Variable, monospace"
                        >
                          {opticalMode === 'verdict' ? 'ЗАТЫЛОК: ОБРАЗ ЕСТЬ · СИНХР. НЕТ' : 'IIT · ЗАДНЯЯ ГОРЯЧАЯ ЗОНА'}
                        </text>
                      </g>
                    )}

                    {(opticalMode === 'gnwt' || opticalMode === 'verdict') && (
                      <g>
                        <ellipse cx="485" cy="395" rx="195" ry="165" fill="url(#gnwtAura)" />
                        <circle
                          cx="485"
                          cy="395"
                          r="122"
                          fill="none"
                          stroke="#FC4109"
                          strokeWidth="2"
                          strokeDasharray="6 6"
                          opacity="0.78"
                        />
                        {/* Clean Swiss leader line up into clear #FAF9F5 sky above brain & diopter */}
                        <line
                          x1="485"
                          y1="273"
                          x2="485"
                          y2="134"
                          stroke="#FC4109"
                          strokeWidth="2"
                          strokeDasharray="5 5"
                          opacity="0.85"
                        />
                        <circle cx="485" cy="273" r="5" fill="#FC4109" />
                        <rect
                          x="228"
                          y="78"
                          width="464"
                          height="56"
                          rx="10"
                          fill="#FAF9F5"
                          fillOpacity="0.98"
                          stroke="#FC4109"
                          strokeOpacity="0.45"
                          strokeWidth="1.8"
                        />
                        <text
                          x="460"
                          y="114"
                          textAnchor="middle"
                          fill="#FC4109"
                          fontSize="24"
                          fontWeight="600"
                          fontFamily="JetBrains Mono Variable, monospace"
                        >
                          {opticalMode === 'verdict' ? 'ЛОБ: НЕТ ВСПЫШКИ НА СМЕНУ' : 'GNWT · ЛОБНОЕ ВОСПЛАМЕНЕНИЕ'}
                        </text>
                      </g>
                    )}
                  </svg>

                  {/* CLIPPED SAGITTAL THALAMUS LAYER REVEALED INSIDE THE SWISS OPTICAL DIOPTER */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      clipPath: `circle(14.5% at ${lensPos.x}% ${lensPos.y}%)`,
                    }}
                  >
                    <img
                      src="/v7/brain-sagittal.jpg"
                      alt="Сагиттальный анатомический срез: мозолистое тело и таламус"
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>

                  {/* SWISS LEICA / DIETER RAMS MATTE-GRAPHITE OPTICAL DIOPTER RING */}
                  <div
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
                    style={{
                      left: `${lensPos.x}%`,
                      top: `${lensPos.y}%`,
                      width: '29%',
                      aspectRatio: '1 / 1',
                      border: '3px solid #1C1C1B',
                      boxShadow:
                        '0 0 0 1px rgba(250,249,245,0.85) inset, 0 16px 38px rgba(20,20,19,0.22)',
                    }}
                  >
                    {/* Crisp Leica hairline reticle & crimson #FC4109 center pip */}
                    <span className="absolute inset-2 rounded-full border border-[#1C1C1B]/25" />
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-3 bg-[#FC4109]" />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-3 bg-[#FC4109]" />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] w-3 bg-[#FC4109]" />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5px] w-3 bg-[#FC4109]" />
                    <span className="w-2 h-2 rounded-full border border-[#FC4109] bg-[#FC4109]/25" />
                  </div>
                </div>

                {/* Quick Focus Presets below plate (great for mobile & curious clicks!) */}
                <div className="mt-4 pt-3.5 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#5E5D59] mr-1">
                      Навести диоптр:
                    </span>
                    {DIOPTER_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setLensPos({ x: preset.x, y: preset.y })}
                        className="v6-pill px-3 py-1 rounded-full bg-[#F2F0E8] hover:bg-[#141413] hover:text-[#FAF9F5] border border-[#141413]/12 font-mono-tech text-[10.5px] cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <span className="font-mono-tech text-[10.5px] text-[#5E5D59] inline-flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#FC4109]" />
                    <span>Cogitate Consortium · Nature 2025</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Domino Bridge -> Chapter V (Micro-Zoom x1000!) */}
        <div className="mt-14 pt-6 border-t border-[#141413]/12 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[17px] text-[#2D2C2A] max-w-2xl">
            Макро-карта мозга не нашла единую «кнопку сознания» ни во лбу, ни на затылке. Значит ли это, что настоящий выключатель спрятан в тысячу раз глубже — внутри одной-единственной нервной клетки?
          </p>
          <button
            type="button"
            onClick={onNextChapter}
            className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>К Главе V · Клеточный транзистор</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
