import { useCallback, useRef, useState } from 'react';
import { ArrowDown, Crosshair, Lock, Scissors, Sparkles } from 'lucide-react';
import { useExplorer, type CogitateBet } from '../context/ExplorerContext';
import { ScholarMarginNote } from './ScholarMarginalia';
import { DossierTrigger } from '../../v9/components/NoesisDossierSheet';
import { LabHonestyBadge } from '../../v9/components/NoesisInstrumentFrame';
import { useViewportRaf } from '../../v9/hooks/useViewportRaf';
import { assetUrl } from '../../v9/utils/assetUrl';
import { ruTypo } from '../../v9/utils/ruTypo';

interface Chapter4WagerAndDiopterProps {
  onNextChapter: () => void;
}

type OpticalMode = 'raw' | 'iit' | 'gnwt' | 'verdict';

const DIOPTER_PRESETS = [
  { label: 'Таламус (Центр)', x: 50, y: 47 },
  { label: 'Затылок · IIT', x: 70, y: 46 },
  { label: 'Лобная кора · GNWT', x: 29, y: 39 },
];

function computeZoneLabel(x: number, y: number): string {
  const dx = (x - 51) / 29;
  const dy = (y - 48) / 29;
  const insideBrain = dx * dx + dy * dy <= 1.05;
  if (!insideBrain) return 'ПОЛЕ АТЛАСА · НАВЕДИТЕ ДИОПТР НА КОРУ МОЗГА';
  if (y > 67 && x > 55) return 'МОЗЖЕЧОК · КООРДИНАЦИЯ (ПОЧТИ БЕЗ СОЗНАНИЯ)';
  if (x < 40) return 'ЛОБНАЯ (ПРЕФРОНТАЛЬНАЯ) КОРА · ЗОНА GNWT';
  if (x > 61) return 'ЗАДНЯЯ «ГОРЯЧАЯ ЗОНА» · ЗОНА IIT';
  return 'ТАЛАМУС (ДИСПЕТЧЕР) И МОЗОЛИСТОЕ ТЕЛО · ГЛУБИННЫЙ СРЕЗ';
}

/**
 * ACT IV · CHAPTER IV: "Большое пари" (Bug #6 Fixes):
 * 1. Synchronized wager seal: betting automatically unseals the ASSC 2023 perforation block (zero double spoiler!).
 * 2. Zero-re-render Diopter: pointermove writes only to targetRef + sleeping lerp loop mutates clipPath/left/top DOM refs directly!
 * 3. Level-2 Archival Dossier trigger ("cogitate-2025") + safe assetUrl() studio brain plates.
 */
export function Chapter4WagerAndDiopter({ onNextChapter }: Chapter4WagerAndDiopterProps) {
  const { state, setWagerUnsealed, setCogitateBet } = useExplorer();
  const [opticalMode, setOpticalMode] = useState<OpticalMode>(
    state.cogitateBet ? 'verdict' : 'raw',
  );
  const [zoneLabel, setZoneLabel] = useState<string>(() => computeZoneLabel(50, 47));
  const [isEasing, setIsEasing] = useState(false);

  const plateRef = useRef<HTMLDivElement | null>(null);
  const clipLayerRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const coordsTextRef = useRef<HTMLSpanElement | null>(null);

  const isDraggingRef = useRef(false);
  const targetPosRef = useRef({ x: 50, y: 47 });
  const currentPosRef = useRef({ x: 50, y: 47 });
  const lastZoneRef = useRef(zoneLabel);

  const outcomeRevealed = Boolean(state.cogitateBet || state.wagerUnsealed || opticalMode === 'verdict');

  // Zero-re-render Leica inertial lerp loop (sleeps immediately when lens reaches target!)
  const stepDiopter = useCallback((_nowMs: number, dtMs: number) => {
    const cur = currentPosRef.current;
    const tgt = targetPosRef.current;
    const k = Math.min(1, (dtMs / 16.67) * 0.24);
    cur.x += (tgt.x - cur.x) * k;
    cur.y += (tgt.y - cur.y) * k;

    const done = Math.hypot(tgt.x - cur.x, tgt.y - cur.y) < 0.08;
    if (done) {
      cur.x = tgt.x;
      cur.y = tgt.y;
    }

    if (clipLayerRef.current) {
      clipLayerRef.current.style.clipPath = `circle(14.5% at ${cur.x.toFixed(2)}% ${cur.y.toFixed(2)}%)`;
    }
    if (ringRef.current) {
      ringRef.current.style.left = `${cur.x.toFixed(2)}%`;
      ringRef.current.style.top = `${cur.y.toFixed(2)}%`;
    }
    if (coordsTextRef.current) {
      coordsTextRef.current.textContent = `X: ${Math.round(cur.x)}% · Y: ${Math.round(cur.y)}%`;
    }

    const nextZone = computeZoneLabel(cur.x, cur.y);
    if (nextZone !== lastZoneRef.current) {
      lastZoneRef.current = nextZone;
      setZoneLabel(nextZone);
    }

    if (done) {
      setIsEasing(false);
    }
  }, []);

  useViewportRaf(plateRef, stepDiopter, { enabled: isEasing });

  const setDiopterTarget = (xPct: number, yPct: number) => {
    targetPosRef.current = {
      x: Math.max(12, Math.min(88, xPct)),
      y: Math.max(14, Math.min(86, yPct)),
    };
    setIsEasing(true);
  };

  const updateLensFromPointer = (clientX: number, clientY: number) => {
    const el = plateRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;
    setDiopterTarget(xPct, yPct);
  };

  const handleBet = (bet: Exclude<CogitateBet, null>) => {
    setCogitateBet(bet);
    setOpticalMode('verdict');
  };

  const timelineMilestones = [
    {
      year: '1998',
      place: 'Бремен · Бар после конференции',
      title: 'Пари на ящик вина',
      text: 'Нейробиолог Кристоф Кох уверен: за 25 лет наука найдёт чистую «нейронную подпись» сознания. Философ Дэвид Чалмерс ставит против — оба расписываются на бланке.',
      locked: false,
    },
    {
      year: '2019–2023',
      place: '12 лабораторий · 256 человек',
      title: 'Честная дуэль COGITATE',
      text: 'Две главные теории заранее записали жёсткие прогнозы и отдали проверку независимым лабораториям — сразу на трёх видах сканеров (МРТ кровотока, магнитные поля и прямые электроды на коре).',
      locked: false,
    },
    {
      year: 'Июнь 2023',
      place: 'Нью-Йорк · Конференция ASSC',
      title: outcomeRevealed ? 'Ящик мадеры сменил владельца' : 'Конверт запечатан',
      text: outcomeRevealed
        ? 'Первые итоги оглашают прямо со сцены. Ни одна теория не взяла чистую победу — Кох признаёт поражение и дарит Чалмерсу ящик редкой мадеры.'
        : 'Сделайте ставку ниже или надорвите пломбу перфорации, чтобы узнать, кто проиграл 25-летнее пари и чья теория устояла.',
      locked: !outcomeRevealed,
    },
    {
      year: 'Апрель 2025',
      place: 'Журнал Nature (Vol. 642)',
      title: outcomeRevealed ? 'Официальный вердикт опубликован' : 'Результаты под пломбой',
      text: outcomeRevealed
        ? 'Обе доминирующие теории сознания получили болезненные эмпирические пробоины. Старые школьные схемы мозга пришлось срочно пересматривать.'
        : 'После вашей ставки ниже на атласе мозга раскроются реальные данные 256 испытуемых из публикации Nature 2025.',
      locked: !outcomeRevealed,
    },
  ];

  const lateralSrc = assetUrl('/v7/brain-lateral.jpg');
  const sagittalSrc = assetUrl('/v7/brain-sagittal.jpg');

  return (
    <section
      id="ch-4"
      className="relative bg-[#FAF9F5] text-[#141413] pt-14 pb-20 md:pt-18 md:pb-24 border-b border-[#141413]/10"
      aria-label="Глава IV — Большое пари и оптический диоптр COGITATE 2025"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">АКТ IV · ПОД ЧЕРЕПОМ · ГЛАВА IV</span>
          <span>БОЛЬШОЕ ПАРИ · COGITATE 2025 · стр. 54</span>
        </div>

        {/* Opening + 2 Human-Language Theory Cards */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">25 лет спора</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                и один ящик редкой мадеры.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              {ruTypo(
                'Два главных лагеря нейронауки четверть века спорили о том, где именно в коре зажигается субъективный опыт. Прежде чем вскрыть итоги гигантского эксперимента 2025 года — познакомьтесь с обоими соперниками за 15 секунд.',
              )}
            </p>
          </div>
        </div>

        {/* 2 Metaphor Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#FC4109]/25 bg-[#FC4109]/5 p-5 space-y-2">
            <div className="flex items-center justify-between font-mono-tech text-[10.5px] uppercase tracking-[0.12em]">
              <span className="text-[#FC4109] font-semibold">ЛАГЕРЬ 1 · GNWT (СТАНИСЛАС ДЕАН)</span>
              <span className="text-[#5E5D59]">ЛОБНАЯ КОРА</span>
            </div>
            <div className="font-display font-bold text-[18px] text-[#141413]">
              «Сцена с мегафоном во лбу»
            </div>
            <p className="text-[14px] leading-[1.58] text-[#353431]">
              {ruTypo(
                'Большая часть работы мозга идёт в темноте на автомате. Информация становится осознанной только в тот миг, когда в ',
              )}
              <strong className="text-[#141413]">лобной коре</strong> вспыхивает глобальная рассылка («воспламенение») — и сигнал раздаётся сразу всем отделам мозга.
            </p>
          </div>

          <div className="rounded-2xl border border-[#004EDF]/25 bg-[#004EDF]/5 p-5 space-y-2">
            <div className="flex items-center justify-between font-mono-tech text-[10.5px] uppercase tracking-[0.12em]">
              <span className="text-[#004EDF] font-semibold">ЛАГЕРЬ 2 · IIT (ДЖ. ТОНОНИ / К. КОХ)</span>
              <span className="text-[#5E5D59]">ЗАДНЯЯ КОРА · МЕРА Φ</span>
            </div>
            <div className="font-display font-bold text-[18px] text-[#141413]">
              «Неделимая паутина в затылке»
            </div>
            <p className="text-[14px] leading-[1.58] text-[#353431]">
              {ruTypo(
                'Сознание — это не мегафон, а сама плотность сплетения связей в ',
              )}
              <strong className="text-[#141413]">задней «горячей зоне»</strong> (учёные обозначают её целостность греческой буквой <strong className="text-[#004EDF]">Φ</strong>). Лобная кора нужна лишь чтобы <em>рассказать</em> об опыте, а не <em>пережить</em> его.
            </p>
          </div>
        </div>

        {/* 4-Column Timeline */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-b border-[#141413]/14 divide-y sm:divide-y-0 sm:divide-x divide-[#141413]/12">
          {timelineMilestones.map((item, idx) => (
            <div
              key={item.year}
              className={`py-5 sm:px-5 first:sm:pl-0 last:sm:pr-0 space-y-2 transition-opacity ${
                item.locked ? 'opacity-72' : 'opacity-100'
              }`}
            >
              <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase tracking-[0.12em]">
                <span className="text-[#FC4109] font-semibold">{item.year}</span>
                <span className="text-[#7A7872] inline-flex items-center gap-1">
                  {item.locked && <Lock className="w-3 h-3 text-[#FC4109]" />}
                  <span>0{idx + 1}</span>
                </span>
              </div>
              <div className="font-mono-tech text-[10px] text-[#5E5D59]">{item.place}</div>
              <h3 className="font-display font-bold text-[16.5px] leading-snug text-[#141413]">
                {item.title}
              </h3>
              <p className="text-[13.5px] leading-[1.56] text-[#4A4945]">{ruTypo(item.text)}</p>
            </div>
          ))}
        </div>

        {/* STUDIO ANATOMICAL PLATE + ZERO-RERENDER SWISS OPTICAL DIOPTER */}
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-5">
              <div>
                <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                  АТЛАС ВСКРЫТИЯ · NATURE 2025 (N = 256)
                </div>
                <h3 className="font-display font-bold text-[25px] md:text-[29px] leading-tight mt-2">
                  Просветите мозг — и сделайте ставку
                </h3>
                <p className="text-[14px] leading-[1.6] text-[#4A4945] mt-2">
                  {ruTypo(
                    'Водите диоптром справа, чтобы заглянуть сквозь кору вглубь — к таламусу (главному внутреннему диспетчеру, связывающему органы чувств с корой).',
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#5E5D59]">
                  ШАГ 1 · ПОСМОТРИТЕ ОЖИДАНИЯ НА МОЗГЕ:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'raw', label: 'Анатомия' },
                      { id: 'iit', label: 'Прогноз IIT' },
                      { id: 'gnwt', label: 'Прогноз GNWT' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setOpticalMode(m.id)}
                      className={`v6-pill px-2.5 py-2 rounded-lg border font-mono-tech text-[10.5px] cursor-pointer ${
                        opticalMode === m.id
                          ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                          : 'bg-[#FAF9F5] hover:bg-[#F0EEE6] text-[#141413] border-[#141413]/15'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[#141413]/10">
                <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#FC4109] font-semibold">
                  {state.cogitateBet
                    ? '✓ ШАГ 2 · СТАВКА ЗАПИСАНА · ВЕРДИКТ ВСКРЫТ:'
                    : 'ШАГ 2 · НА КОГО СТАВИТЕ ДО ВСКРЫТИЯ ДАННЫХ?'}
                </div>

                {(
                  [
                    {
                      id: 'iit',
                      title: 'Затылок (IIT · Тонони / Кох)',
                      sub: 'Победит устойчивая паутина связей в задней коре',
                    },
                    {
                      id: 'gnwt',
                      title: 'Лобная кора (GNWT · Деан)',
                      sub: 'Победит двойная вспышка «мегафона» во лбу',
                    },
                    {
                      id: 'draw',
                      title: 'Обе теории ошибутся',
                      sub: 'Живой мозг окажется хитрее обеих моделей',
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
                        <span className="font-mono-tech text-[10.5px] text-[#FC4109] whitespace-nowrap shrink-0">
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

              <div
                className={`rounded-xl border p-4 space-y-2 transition-colors ${
                  opticalMode === 'verdict'
                    ? 'bg-[#FC4109]/8 border-[#FC4109]/30'
                    : 'bg-[#F3F1E9] border-[#141413]/12'
                }`}
              >
                <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FC4109] font-semibold">
                  <span>
                    {opticalMode === 'raw' && 'РЕЖИМ · АНАТОМИЧЕСКИЙ ДИОПТР'}
                    {opticalMode === 'iit' && 'ОЖИДАНИЕ IIT · ЗАДНЯЯ КОРА'}
                    {opticalMode === 'gnwt' && 'ОЖИДАНИЕ GNWT · ЛОБНАЯ КОРА'}
                    {opticalMode === 'verdict' && 'ВЕРДИКТ NATURE · АПРЕЛЬ 2025'}
                  </span>
                  {state.cogitateBet && opticalMode !== 'verdict' && (
                    <button
                      type="button"
                      onClick={() => setOpticalMode('verdict')}
                      className="underline cursor-pointer"
                    >
                      Вердикт →
                    </button>
                  )}
                </div>
                <p className="text-[13.5px] leading-[1.58] text-[#2F2E2B]">
                  {ruTypo(
                    opticalMode === 'raw'
                      ? 'Сдвиньте линзу на центр мозга: внутри коры виден таламус — в апреле 2025 года в Science показали, что именно этот глубинный диспетчер опережает лобную кору в ритме 2–8 Гц.'
                      : opticalMode === 'iit'
                        ? 'IIT предсказывала устойчивую синхронизацию в задней «горячей зоне» на всё время, пока человек видит картинку.'
                        : opticalMode === 'gnwt'
                          ? 'GNWT предсказывала яркую двойную вспышку в лобной коре — когда стимул появляется и когда он исчезает.'
                          : state.cogitateBet === 'draw'
                            ? 'В точку! Обе теории получили серьёзные пробоины: в задней коре нашли длительный след образа, но БЕЗ предсказанной IIT синхронизации; а во лбу не оказалось второй вспышки на смену стимула.'
                            : 'Сюрприз апреля 2025-го: ни одна теория не взяла чистую победу! В задней коре не нашлось устойчивой синхронизации IIT, а во лбу — вспышки на исчезновение стимула (GNWT).',
                  )}
                </p>
              </div>

              <DossierTrigger
                dossier="cogitate-2025"
                label="Протокол COGITATE (500/1000/1500 мс) + Таламус (Science, апр. 2025)"
                meta="Архивное досье IV.1 · Уровень 2"
                className="w-full"
              />
            </div>

            {/* Right 8 cols: Monumental Studio Brain Plate + Zero-Re-Render Swiss Optical Diopter */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-[#141413]/14 bg-[#FAF9F5] p-4 md:p-6 shadow-[0_24px_60px_rgba(20,20,19,0.06)]">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#141413]/10 font-mono-tech text-[10.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                  <span className="flex flex-wrap items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-[#FC4109]" />
                    <span>{zoneLabel}</span>
                    <LabHonestyBadge badge="reconstruction" />
                  </span>
                  <span ref={coordsTextRef} className="whitespace-nowrap">
                    X: 50% · Y: 47%
                  </span>
                </div>

                <div
                  ref={plateRef}
                  onPointerMove={(e) => {
                    if (e.pointerType === 'mouse' || isDraggingRef.current) {
                      updateLensFromPointer(e.clientX, e.clientY);
                    }
                  }}
                  onPointerDown={(e) => {
                    isDraggingRef.current = true;
                    updateLensFromPointer(e.clientX, e.clientY);
                  }}
                  onPointerUp={() => {
                    isDraggingRef.current = false;
                  }}
                  onPointerLeave={() => {
                    isDraggingRef.current = false;
                  }}
                  className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#FAF9F5] select-none cursor-crosshair touch-none"
                >
                  <img
                    src={lateralSrc}
                    alt="Студийная анатомическая пластина коры головного мозга"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />

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

                  {/* Clipped Sagittal Layer mutated directly via ref */}
                  <div
                    ref={clipLayerRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ clipPath: 'circle(14.5% at 50% 47%)' }}
                  >
                    <img
                      src={sagittalSrc}
                      alt="Сагиттальный анатомический срез: мозолистое тело и таламус"
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>

                  {/* Leica Optical Diopter Ring mutated directly via ref */}
                  <div
                    ref={ringRef}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center will-change-[left,top]"
                    style={{
                      left: '50%',
                      top: '47%',
                      width: '29%',
                      aspectRatio: '1 / 1',
                      border: '3px solid #1C1C1B',
                      boxShadow:
                        '0 0 0 1px rgba(250,249,245,0.85) inset, 0 16px 38px rgba(20,20,19,0.22)',
                    }}
                  >
                    <span className="absolute inset-2 rounded-full border border-[#1C1C1B]/25" />
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-3 bg-[#FC4109]" />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-3 bg-[#FC4109]" />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] w-3 bg-[#FC4109]" />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5px] w-3 bg-[#FC4109]" />
                    <span className="w-2 h-2 rounded-full border border-[#FC4109] bg-[#FC4109]/25" />
                  </div>
                </div>

                {/* Quick Focus Presets */}
                <div className="mt-4 pt-3.5 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#5E5D59] mr-1">
                      Навести диоптр:
                    </span>
                    {DIOPTER_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setDiopterTarget(preset.x, preset.y)}
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

        {/* SYNCHRONIZED PERFORATION SEAL (Bug #6 Fix: automatically reveals once user bets, zero double spoiler!) */}
        <div className="mt-10">
          {!outcomeRevealed ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                window.getSelection()?.removeAllRanges();
                setWagerUnsealed(true);
                setOpticalMode('verdict');
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
                    Или надорвите пломбу без ставки — узнать, кто проиграл ящик мадеры и какое пари заключили до 2048 года
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

        {/* Domino Bridge -> ScrollMicroZoom x1000 */}
        <div className="mt-12 pt-6 border-t border-[#141413]/12 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[17px] text-[#2D2C2A] max-w-2xl">
            {ruTypo(
              'На масштабе целых полушарий «кнопку сознания» найти не удалось. Значит, спускаемся в тысячу раз глубже — внутрь шести слоёв коры и одной-единственной нервной клетки.',
            )}
          </p>
          <button
            type="button"
            onClick={onNextChapter}
            className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Микрозум ×1000 · Спуститься в клетку</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
