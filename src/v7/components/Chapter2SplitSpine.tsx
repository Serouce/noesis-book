import { useEffect, useState } from 'react';
import { ArrowDown, Eye, Scissors, Undo2 } from 'lucide-react';
import { useExplorer, type SplitBrainCard } from '../context/ExplorerContext';
import { ScholarMarginNote } from './ScholarMarginalia';

interface Chapter2SplitSpineProps {
  onNextChapter: () => void;
}

interface ExperimentCard {
  id: Exclude<SplitBrainCard, null>;
  label: string;
  rightPrompt: string;
  leftHandAction: string;
  leftVisibleCard: string;
  wholeBrainAnswer: string;
  confabulation: string;
  clinicalFact: string;
}

const CARDS: ExperimentCard[] = [
  {
    id: 'snow',
    label: 'Снежная буря',
    rightPrompt: 'В левом поле зрения (→ правое полушарие) мелькнул зимний пейзаж со снегом.',
    leftHandAction: 'Левая рука молча выбирает ЛОПАТУ для уборки снега.',
    leftVisibleCard: 'Куриная лапка',
    wholeBrainAnswer:
      '«Почему я взял лопату? Всё просто: у меня перед глазами снежная буря и сугробы — естественно, я потянулся за лопатой!»',
    confabulation:
      '«Почему моя рука взяла лопату? Очевидно же: на моей картинке куриная лапка — а лопатой удобно вычищать курятник!»',
    clinicalFact:
      'Подлинный эксперимент Майкла Газзаниги на пациенте P.S. (1977). Когда мост из 200 млн волокон перерезан, говорящее левое полушарие НЕ видит снег — но ни на секунду не сомневается в собственной выдумке.',
  },
  {
    id: 'clock',
    label: 'Команда «Пройдись»',
    rightPrompt: 'В левом поле зрения на 150 мс мигнула табличка с приказом «ВСТАНЬ И ПРОЙДИСЬ».',
    leftHandAction: 'Тело молча встаёт со стула и идёт к выходу из комнаты.',
    leftVisibleCard: 'Пустой экран',
    wholeBrainAnswer:
      '«Зачем я встал? Вы же сами только что показали мне карточку с командой “Пройдись” — вот я и пошёл!»',
    confabulation:
      '«Куда я пошёл? Да просто горло пересохло — решил сходить на кухню за стаканом колы!»',
    clinicalFact:
      'Правое полушарие прочитало короткий приказ и привело тело в движение. Изолированное левое — не зная причины — мгновенно сфабриковало безупречное бытовое алиби.',
  },
  {
    id: 'music',
    label: 'Смешная карикатура',
    rightPrompt: 'В левом поле зрения показали нелепую смешную карикатуру на профессора.',
    leftHandAction: 'Лицо пациента внезапно расплывается в искреннем смехе.',
    leftVisibleCard: 'Геометрический круг',
    wholeBrainAnswer:
      '«Над чем я смеюсь? Над той забавной карикатурой, которую вы только что показали слева!»',
    confabulation:
      '«Над чем я смеюсь? Да у вас тут на столе такой смешной, странный лабораторный аппарат стоит!»',
    clinicalFact:
      'Эмоция просачивается через глубокие подкорковые пути, а левый «пресс-секретарь» мозга немедленно подгоняет под неё логичный на вид повод.',
  },
];

// 14 horizontal callosal fiber lines visually stretching and snapping when the book spine is cut!
const CALLOSAL_FIBERS = Array.from({ length: 14 }, (_, i) => i);

/**
 * CHAPTER II: "Расколотый штурвал"
 * Upgraded v8:
 * 1. Accurate optic-chiasm visual diagram ("правое/левое поле зрения", zero "правый глаз" bug!)
 * 2. Subtle New Yorker engraved hoodie silhouette split cleanly along the book spine (Mr. Robot nod!)
 * 3. Crystal-clear 1 -> 2 -> 3 workflow: FIRST see Whole Brain honest answer -> THEN cut the 200M snapping fibers -> watch alibi fabricated live + automatic X-ray truth!
 * 4. 100% contrast-safe in BOTH whole & cut states!
 */
export function Chapter2SplitSpine({ onNextChapter }: Chapter2SplitSpineProps) {
  const { state, setSplitBrainCut, setSplitBrainCard } = useExplorer();
  const [typedLength, setTypedLength] = useState(0);
  const [justSnapped, setJustSnapped] = useState(false);

  const selectedCard = CARDS.find((c) => c.id === state.splitBrainCard) ?? CARDS[0];
  const activeStatement = state.splitBrainCut
    ? selectedCard.confabulation
    : selectedCard.wholeBrainAnswer;

  // Typewriter ink animation whenever card or cut state changes
  useEffect(() => {
    setTypedLength(0);
    const full = activeStatement;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 3;
      setTypedLength(Math.min(full.length, i));
      if (i >= full.length) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [activeStatement]);

  const handleToggleCut = () => {
    const next = !state.splitBrainCut;
    setSplitBrainCut(next);
    if (next) {
      setJustSnapped(true);
      window.setTimeout(() => setJustSnapped(false), 650);
    }
  };

  const handleSelectCard = (id: Exclude<SplitBrainCard, null>) => {
    setSplitBrainCard(id);
  };

  const isDoneTyping = typedLength >= activeStatement.length;

  return (
    <section
      id="ch-2"
      className="relative bg-[#FAF9F5] text-[#141413] pt-24 pb-20 md:pt-28 md:pb-28 border-b border-[#141413]/10"
      aria-label="Глава II — Расколотый штурвал"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ЧАСТЬ I · ИЗНУТРИ · ГЛАВА II</span>
          <span>РАСКОЛОТЫЙ ШТУРВАЛ · стр. 24</span>
        </div>

        {/* Editorial Opening + Subtle New Yorker Engraved Split Silhouette (Mr. Robot!) */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Кто на самом деле</span>
              <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
                держит штурвал?
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-3 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              В 1960–70-х врачи спасали пациентов с тяжелейшей эпилепсией, рассекая{' '}
              <strong className="font-semibold text-[#141413]">мозолистое тело</strong> — кабель из 200 миллионов волокон между полушариями. В быту эти люди казались абсолютно обычными — пока учёные не заглянули в оба полушария по отдельности.
            </p>
            <p className="text-[#4F4E4A]">
              Оказалось, говорящее левое полушарие работает как блестящий пресс-секретарь —{' '}
              <em className="font-serif-editorial text-[#141413]">
                как Эллиот из «Мистера Робота», уверенный, что управляет ситуацией, пока его собственные руки уже сделали другое.
              </em>
            </p>
          </div>
        </div>

        {/* 15-SECOND VISUAL OPTIC-CHIASM & CROSS-WIRING PRIMER (Solves beginner confusion BEFORE touching controls!) */}
        <div className="mt-9 rounded-2xl border border-[#141413]/12 bg-[#F3F1E9] p-5 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-2.5">
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
                КАК УСТРОЕН ОПЫТ · ПЕРЕКРЁСТ ПОЛЕЙ ЗРЕНИЯ (15 СЕК)
              </div>
              <p className="text-[14px] leading-[1.6] text-[#2F2E2B]">
                У человека пути зрения и рук перекрещены: всё, что мелькает в{' '}
                <strong className="text-[#141413]">левом поле зрения обоих глаз</strong>, попадает в{' '}
                <strong className="text-[#141413]">правое полушарие</strong> (оно почти не умеет говорить, но управляет левой рукой). А{' '}
                <strong className="text-[#141413]">правое поле зрения</strong> идёт в говорящее{' '}
                <strong className="text-[#141413]">левое полушарие</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono-tech text-[10.5px]">
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#141413]/10 text-[#141413]">
                  1. Сначала посмотрите ответ ЦЕЛОГО мозга
                </span>
                <span className="text-[#FC4109]">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#141413]/10 text-[#141413]">
                  2. Рассеките мозолистое тело
                </span>
                <span className="text-[#FC4109]">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#141413]/10 text-[#141413]">
                  3. Поймайте левое полушарие на лжи
                </span>
              </div>
            </div>

            {/* Crisp New Yorker Engraved Hooded Split Silhouette + Optic Wiring Mini-Plate */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <svg
                viewBox="0 0 360 118"
                className="w-full max-w-[360px] h-auto block"
                aria-label="Схема перекрёста полей зрения и силуэт расколотого сознания"
              >
                {/* Left side: Speaking Left Hemisphere (Blue) */}
                <rect x="4" y="10" width="128" height="98" rx="12" fill="#FAF9F5" stroke="#141413" strokeOpacity="0.16" />
                <text x="16" y="30" fill="#004EDF" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                  ЛЕВОЕ ПОЛУШАРИЕ
                </text>
                <text x="16" y="46" fill="#141413" fontSize="10" fontFamily="Inter Variable, sans-serif">
                  Видит: правое поле
                </text>
                <text x="16" y="62" fill="#5E5D59" fontSize="9.5" fontFamily="Inter Variable, sans-serif">
                  Умеет: говорить,
                </text>
                <text x="16" y="75" fill="#5E5D59" fontSize="9.5" fontFamily="Inter Variable, sans-serif">
                  сочинять объяснения
                </text>
                <text x="16" y="96" fill="#004EDF" fontSize="8.5" fontFamily="JetBrains Mono Variable, monospace">
                  → ПРАВАЯ РУКА
                </text>

                {/* Center: Crisp New Yorker Engraved Split Hoodie Portrait (Elliot / Mr. Robot subtle nod!) */}
                <g transform="translate(142, 10)">
                  {/* Left half: sloped shoulder + hood silhouette (light paper ink) */}
                  <path
                    d="M 36 10 C 20 10, 14 23, 14 39 C 14 49, 17 56, 21 60 C 12 64, 4 72, 2 88 L 36 88 Z"
                    fill="#FAF9F5"
                    stroke="#141413"
                    strokeWidth="1.45"
                    strokeLinejoin="round"
                  />
                  {/* Right half: sloped shoulder + hood silhouette (deep obsidian ink when split!) */}
                  <path
                    d="M 40 10 C 56 10, 62 23, 62 39 C 62 49, 59 56, 55 60 C 64 64, 72 72, 74 88 L 40 88 Z"
                    fill={state.splitBrainCut ? '#17181B' : '#E8E5DA'}
                    stroke="#141413"
                    strokeWidth="1.45"
                    strokeLinejoin="round"
                  />
                  {/* Inner hood aperture & chin contour */}
                  <path
                    d="M 36 20 C 26 20, 22 29, 23 41 C 24 49, 29 55, 36 56"
                    fill="none"
                    stroke="#141413"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M 40 20 C 50 20, 54 29, 53 41 C 52 49, 47 55, 40 56"
                    fill="none"
                    stroke={state.splitBrainCut ? '#FAF9F5' : '#141413'}
                    strokeWidth="1.2"
                  />
                  {/* Calm left eye vs silent right eye */}
                  <ellipse cx="29.5" cy="37" rx="2.1" ry="1.35" fill="#141413" />
                  <ellipse cx="46.5" cy="37" rx="2.1" ry="1.35" fill={state.splitBrainCut ? '#FC4109' : '#141413'} />
                  {/* Hoodie collar drawstrings */}
                  <path d="M 31 59 L 30 78" stroke="#141413" strokeWidth="1.15" strokeLinecap="round" />
                  <path d="M 45 59 L 46 78" stroke={state.splitBrainCut ? '#FAF9F5' : '#141413'} strokeWidth="1.15" strokeLinecap="round" />
                  {/* Vertical surgical split axis */}
                  <line
                    x1="38"
                    y1="2"
                    x2="38"
                    y2="94"
                    stroke={state.splitBrainCut ? '#FC4109' : '#004EDF'}
                    strokeWidth="1.6"
                    strokeDasharray={state.splitBrainCut ? '3 3' : undefined}
                  />
                </g>

                {/* Right side: Silent Right Hemisphere (Dark/Crimson) */}
                <rect
                  x="228"
                  y="10"
                  width="128"
                  height="98"
                  rx="12"
                  fill={state.splitBrainCut ? '#17181B' : '#FAF9F5'}
                  stroke="#141413"
                  strokeOpacity={state.splitBrainCut ? '0.9' : '0.16'}
                />
                <text x="240" y="30" fill="#FC4109" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                  ПРАВОЕ ПОЛУШАРИЕ
                </text>
                <text x="240" y="46" fill={state.splitBrainCut ? '#FAF9F5' : '#141413'} fontSize="10" fontFamily="Inter Variable, sans-serif">
                  Видит: левое поле
                </text>
                <text x="240" y="62" fill={state.splitBrainCut ? '#B7BECC' : '#5E5D59'} fontSize="9.5" fontFamily="Inter Variable, sans-serif">
                  Молчит, но понимает
                </text>
                <text x="240" y="75" fill={state.splitBrainCut ? '#B7BECC' : '#5E5D59'} fontSize="9.5" fontFamily="Inter Variable, sans-serif">
                  образы и действует
                </text>
                <text x="240" y="96" fill="#FC4109" fontSize="8.5" fontFamily="JetBrains Mono Variable, monospace">
                  → ЛЕВАЯ РУКА
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* GUIDED 1 -> 2 CONTROL RIBBON */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-5">
          {/* Step 1: Choose Experiment Card */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.11em] text-[#5E5D59] mr-1">
              Шаг 1 · Сцена:
            </span>
            {CARDS.map((card) => {
              const active = selectedCard.id === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectCard(card.id)}
                  className={`v6-pill h-9 px-3.5 rounded-full border text-[12.5px] font-medium cursor-pointer ${
                    active
                      ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                      : 'bg-[#F2F0E8] hover:bg-[#E7E4D8] text-[#141413] border-[#141413]/14'
                  }`}
                >
                  {card.label}
                </button>
              );
            })}
          </div>

          {/* Step 2: Cut / Stitch the Book Spine (Corpus Callosum!) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleCut}
              className={`v6-pill h-11 px-5 rounded-full font-sans-ui text-[13.5px] font-medium inline-flex items-center gap-2 cursor-pointer border ${
                state.splitBrainCut
                  ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109] shadow-[0_10px_28px_rgba(252,65,9,0.28)]'
                  : 'bg-[#141413] text-[#FAF9F5] border-[#141413] hover:bg-[#2A2A28]'
              }`}
            >
              {state.splitBrainCut ? (
                <>
                  <Undo2 className="w-4 h-4" />
                  <span>Сшить мозолистое тело обратно</span>
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 text-[#FC4109]" />
                  <span>Шаг 2 · Рассечь мозолистое тело</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* THE PHYSICAL SPLIT-SPINE BOOK SPREAD WITH SNAPPING CALLOSAL FIBERS */}
        <div
          className="relative grid grid-cols-1 md:grid-cols-2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            gap: state.splitBrainCut ? '48px' : '0px',
          }}
        >
          {/* Central Surgical Spine Seam + 14 Snapping Callosal Fibers (desktop) */}
          <div
            aria-hidden="true"
            className="hidden md:flex flex-col items-center justify-center pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 w-16"
          >
            {/* Animated Callosal White-Matter Fiber Strands bridging the two halves */}
            <svg viewBox="0 0 64 360" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
              {CALLOSAL_FIBERS.map((idx) => {
                const y = 32 + idx * 23;
                const curve = (idx % 2 === 0 ? 1 : -1) * (justSnapped ? 11 : 5);
                if (!state.splitBrainCut) {
                  return (
                    <line
                      key={idx}
                      x1="14"
                      y1={y}
                      x2="50"
                      y2={y}
                      stroke="#004EDF"
                      strokeOpacity="0.24"
                      strokeWidth="1.35"
                    />
                  );
                }
                return (
                  <g key={idx}>
                    {/* Snapped left recoil fiber (neatly recessed clear of card edge & center pill!) */}
                    {Math.abs(y - 180) > 46 && (
                      <>
                        <path
                          d={`M 10 ${y} Q 17 ${y + curve * 0.7} 23 ${y + curve}`}
                          fill="none"
                          stroke="#FC4109"
                          strokeOpacity="0.46"
                          strokeWidth="1.35"
                          strokeLinecap="round"
                        />
                        <path
                          d={`M 54 ${y} Q 47 ${y - curve * 0.7} 41 ${y - curve}`}
                          fill="none"
                          stroke="#FC4109"
                          strokeOpacity="0.46"
                          strokeWidth="1.35"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            <div
              className={`h-full transition-all duration-700 ${
                state.splitBrainCut
                  ? 'w-[2px] border-l-2 border-dashed border-[#FC4109]'
                  : 'w-[1px] bg-[#141413]/18'
              }`}
            />
            <span
              className={`absolute top-1/2 -translate-y-1/2 -rotate-90 origin-center px-2.5 py-0.5 rounded-full font-mono-tech text-[9px] uppercase tracking-[0.13em] whitespace-nowrap transition-all duration-500 ${
                state.splitBrainCut
                  ? 'bg-[#FC4109] text-[#FAF9F5] shadow-[0_6px_20px_rgba(252,65,9,0.28)]'
                  : 'bg-[#FAF9F5] text-[#004EDF] border border-[#004EDF]/28'
              }`}
            >
              {state.splitBrainCut ? 'СВЯЗЬ РАЗОРВАНА' : '200 МЛН ВОЛОКОН ЦЕЛЫ'}
            </span>
          </div>

          {/* LEFT PAGE: Talking Left Hemisphere (Honest when whole -> Fabricates alibi when cut!) */}
          <div
            className={`relative rounded-2xl border p-6 md:p-9 min-h-[390px] flex flex-col justify-between transition-all duration-700 ${
              state.splitBrainCut
                ? 'bg-[#FAF9F5] border-[#141413]/18 shadow-[0_18px_48px_rgba(20,20,19,0.08)] md:-rotate-[0.6deg]'
                : 'bg-[#F5F3EC] border-[#141413]/14 md:rounded-r-none md:border-r-0'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#5E5D59] pb-3 border-b border-[#141413]/10">
                <span>ЛЕВАЯ ПОЛОСА · ГОВОРЯЩЕЕ ПОЛУШАРИЕ</span>
                <span className="text-[#004EDF] font-semibold whitespace-nowrap">РЕЧЬ И ОБЪЯСНЕНИЯ</span>
              </div>

              <div className="mt-5">
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59]">
                  {state.splitBrainCut
                    ? `ВИДИТ ТОЛЬКО ПРАВОЕ ПОЛЕ ЗРЕНИЯ (СКРЫТО: «${selectedCard.label.toUpperCase()}»):`
                    : 'ЧЕРЕЗ МОЗОЛИСТОЕ ТЕЛО ВИДИТ ОБА ПОЛЯ ЗРЕНИЯ:'}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EAE7DD] font-display font-semibold text-[14px] text-[#141413]">
                    {selectedCard.leftVisibleCard}
                  </span>
                  {!state.splitBrainCut && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D7A5F]/12 text-[#0D7A5F] font-mono-tech text-[11px] font-semibold">
                      + сигнал от правого: «{selectedCard.label}»
                    </span>
                  )}
                </div>
              </div>

              {/* Live Transcript — Honest Whole-Brain Response vs Split-Brain Confabulation! */}
              <div className="mt-6">
                <div
                  className={`font-mono-tech text-[10px] uppercase tracking-[0.1em] font-semibold ${
                    state.splitBrainCut ? 'text-[#FC4109]' : 'text-[#0D7A5F]'
                  }`}
                >
                  {state.splitBrainCut
                    ? 'РЕЧЬ «ЛЕВОГО ИНТЕРПРЕТАТОРА» (ВЫДУМЫВАЕТ АЛИБИ В ПРЯМОМ ЭФИРЕ):'
                    : 'ОТВЕТ ЦЕЛОГО МОЗГА (СВЯЗЬ 100% — ЧЕСТНОЕ ОБЪЯСНЕНИЕ):'}
                </div>

                <p className="mt-3 font-serif-editorial italic text-[19px] md:text-[21px] leading-[1.46] text-[#141413] min-h-[104px]">
                  {activeStatement.slice(0, typedLength)}
                  {!isDoneTyping && (
                    <span className="inline-block w-[2px] h-5 ml-0.5 bg-[#FC4109] align-middle animate-pulse" />
                  )}
                </p>
              </div>
            </div>

            {/* Automatic X-Ray Truth Footnote (NO hidden link needed!) */}
            <div className="mt-5 pt-4 border-t border-[#141413]/10 space-y-3">
              {state.splitBrainCut ? (
                <div className="p-3.5 rounded-xl bg-[#FC4109]/8 border border-[#FC4109]/25 text-[13.5px] leading-[1.56] text-[#2A2927] animate-[beatRise_300ms_ease]">
                  <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#FC4109] font-semibold mb-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>РЕНТГЕН ПРАВДЫ · УВЕРЕННОСТЬ ПАЦИЕНТА 100%</span>
                    </span>
                  </div>
                  <p>{selectedCard.clinicalFact}</p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[11px] text-[#5E5D59]">
                  <span>Пока волокна целы, оба полушария знают правду.</span>
                  <button
                    type="button"
                    onClick={handleToggleCut}
                    className="text-[#FC4109] font-semibold hover:underline cursor-pointer"
                  >
                    Теперь рассеките связь →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PAGE: Silent Right Hemisphere (100% contrast-safe in BOTH light/whole and dark/cut states!) */}
          <div
            className={`relative rounded-2xl border p-6 md:p-9 min-h-[390px] flex flex-col justify-between transition-all duration-700 ${
              state.splitBrainCut
                ? 'bg-[#17181B] text-[#FAF9F5] border-[#17181B] shadow-[0_18px_48px_rgba(20,20,19,0.16)] md:rotate-[0.6deg]'
                : 'bg-[#F5F3EC] text-[#141413] border-[#141413]/14 md:rounded-l-none'
            }`}
          >
            <div>
              <div
                className={`flex items-center justify-between gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.12em] pb-3 border-b ${
                  state.splitBrainCut
                    ? 'text-[#FAF9F5]/60 border-[#FAF9F5]/14'
                    : 'text-[#5E5D59] border-[#141413]/10'
                }`}
              >
                <span>ПРАВАЯ ПОЛОСА · НЕМОЕ ПОЛУШАРИЕ</span>
                <span className="text-[#FC4109] font-semibold whitespace-nowrap">ОБРАЗЫ И ЛЕВАЯ РУКА</span>
              </div>

              {/* Graphic Signal Plate — dynamically themed so text is ALWAYS crisp high-contrast! */}
              <div className="mt-6 space-y-4">
                <div
                  className={`p-5 rounded-xl border flex items-center gap-5 transition-colors ${
                    state.splitBrainCut
                      ? 'border-[#FAF9F5]/16 bg-[#FAF9F5]/6'
                      : 'border-[#141413]/12 bg-[#FAF9F5]'
                  }`}
                >
                  {/* Crisp Swiss vector pictogram */}
                  <svg width="62" height="62" viewBox="0 0 64 64" fill="none" className="shrink-0">
                    <rect x="2" y="2" width="60" height="60" rx="12" stroke="#FC4109" strokeWidth="1.5" />
                    {selectedCard.id === 'snow' && (
                      <g stroke={state.splitBrainCut ? '#FAF9F5' : '#141413'} strokeWidth="1.8" strokeLinecap="round">
                        <line x1="32" y1="14" x2="32" y2="50" />
                        <line x1="16" y1="23" x2="48" y2="41" />
                        <line x1="48" y1="23" x2="16" y2="41" />
                        <circle cx="32" cy="32" r="4" fill="#FC4109" stroke="none" />
                      </g>
                    )}
                    {selectedCard.id === 'clock' && (
                      <g stroke={state.splitBrainCut ? '#FAF9F5' : '#141413'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 18 46 L 26 24 L 38 24 L 46 46" />
                        <path d="M 28 18 L 36 18" stroke="#FC4109" strokeWidth="2.4" />
                        <path d="M 22 36 L 42 36" />
                      </g>
                    )}
                    {selectedCard.id === 'music' && (
                      <g stroke={state.splitBrainCut ? '#FAF9F5' : '#141413'} strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="32" cy="32" r="16" />
                        <circle cx="26" cy="28" r="1.8" fill={state.splitBrainCut ? '#FAF9F5' : '#141413'} />
                        <circle cx="38" cy="28" r="1.8" fill={state.splitBrainCut ? '#FAF9F5' : '#141413'} />
                        <path d="M 24 36 Q 32 44 40 36" stroke="#FC4109" strokeWidth="2.2" />
                      </g>
                    )}
                  </svg>
                  <div>
                    <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FC4109] font-semibold">
                      {state.splitBrainCut ? 'ИЗОЛИРОВАННЫЙ СИГНАЛ · 150 МС' : 'СИГНАЛ В ЛЕВОМ ПОЛЕ ЗРЕНИЯ · 150 МС'}
                    </div>
                    <div
                      className={`font-display font-bold text-[18px] mt-0.5 ${
                        state.splitBrainCut ? 'text-[#FAF9F5]' : 'text-[#141413]'
                      }`}
                    >
                      {selectedCard.label}
                    </div>
                    <p
                      className={`text-[13.5px] mt-1 leading-[1.48] ${
                        state.splitBrainCut ? 'text-[#C8CDD6]' : 'text-[#4B4A46]'
                      }`}
                    >
                      {selectedCard.rightPrompt}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-colors ${
                    state.splitBrainCut
                      ? 'bg-[#FC4109]/14 border-[#FC4109]/38'
                      : 'bg-[#FC4109]/8 border-[#FC4109]/24'
                  }`}
                >
                  <div
                    className={`font-mono-tech text-[10px] uppercase tracking-[0.12em] font-semibold ${
                      state.splitBrainCut ? 'text-[#FF9B7D]' : 'text-[#C83509]'
                    }`}
                  >
                    ФИЗИЧЕСКОЕ ДЕЙСТВИЕ ТЕЛА (БЕЗ СЛОВ):
                  </div>
                  <p
                    className={`font-display font-semibold text-[15.5px] mt-1 ${
                      state.splitBrainCut ? 'text-[#FAF9F5]' : 'text-[#141413]'
                    }`}
                  >
                    {selectedCard.leftHandAction}
                  </p>
                </div>

                <p
                  className={`text-[13px] leading-[1.55] ${
                    state.splitBrainCut ? 'text-[#9AA2B1]' : 'text-[#5E5D59]'
                  }`}
                >
                  {state.splitBrainCut
                    ? 'Справа всё поняли и выполнили действие молча — но из-за разрыва правое полушарие не может шепнуть левому, зачем именно тело так поступило.'
                    : 'Сейчас мост цел: правое полушарие мгновенно передало образ налево, поэтому человек спокойно называет настоящую причину своего поступка.'}
                </p>
              </div>
            </div>

            <div
              className={`mt-6 pt-4 border-t font-mono-tech text-[10.5px] flex items-center justify-between ${
                state.splitBrainCut
                  ? 'border-[#FAF9F5]/12 text-[#9AA2B1]'
                  : 'border-[#141413]/10 text-[#5E5D59]'
              }`}
            >
              <span>М. Газзанига · «Левый интерпретатор»</span>
              <span>Нобелевская премия (Р. Сперри, 1981)</span>
            </div>
          </div>
        </div>

        {/* Margin Commentary + Tight Domino Bridge to Chapter III */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <ScholarMarginNote
              scholar="dennett"
              tag="МИФ О «ДИРЕКТОРЕ В ГОЛОВЕ»"
              quote="Внутри черепа нет никакой маленькой кабины пилота, где сидит ваш «главный директор». Наше «Я» — это история, которую говорящая часть мозга сочиняет на лету, чтобы склеить действия тела воедино."
            />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.13em] text-[#FC4109]">
              ВЫВОД И ПЕРЕХОД К ГЛАВЕ III
            </div>
            <p className="font-serif-editorial italic text-[18px] leading-[1.52] text-[#282725]">
              Мозг не ждёт фактов: сначала он придумывает правдоподобную версию, а потом подгоняет под неё реальность. В этой главе он сочинил алиби для руки — а на следующей странице вы увидите, что ровно так же он собирает весь видимый мир.
            </p>
            <button
              type="button"
              onClick={onNextChapter}
              className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>К Главе III · Управляемая галлюцинация</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
