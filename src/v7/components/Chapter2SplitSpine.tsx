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
  confabulation: string;
  clinicalFact: string;
}

const CARDS: ExperimentCard[] = [
  {
    id: 'snow',
    label: 'Снежная буря',
    rightPrompt: 'Правому полушарию показали зимний пейзаж (метель и сугробы).',
    leftHandAction: 'Левая рука молча выбирает ЛОПАТУ для уборки снега.',
    leftVisibleCard: 'Куриная лапка',
    confabulation:
      '«Почему моя рука взяла лопату? Очевидно же: на моей картинке куриная лапка — а лопатой удобно вычищать курятник!»',
    clinicalFact:
      'Подлинный эксперимент Майкла Газзаниги на пациенте P.S. (1977). Говорящее левое полушарие НЕ видело снег — но ни на секунду не усомнилось в собственной выдумке.',
  },
  {
    id: 'clock',
    label: 'Команда «Встань и выйди»',
    rightPrompt: 'Правому полушарию на 150 мс мигнули табличкой «ПРОЙДИСЬ».',
    leftHandAction: 'Тело молча встаёт со стула и идёт к выходу из комнаты.',
    leftVisibleCard: 'Пустой экран',
    confabulation:
      '«Куда я пошёл? Да просто горло пересохло — решил сходить на кухню за стаканом колы!»',
    clinicalFact:
      'Правое полушарие прочитало короткий приказ и привело тело в движение. Левое — не зная причины — мгновенно сфабриковало безупречное бытовое алиби.',
  },
  {
    id: 'music',
    label: 'Смешная картинка',
    rightPrompt: 'Правому полушарию показали нелепую карикатуру на профессора.',
    leftHandAction: 'Лицо пациента внезапно расплывается в искреннем смехе.',
    leftVisibleCard: 'Геометрический круг',
    confabulation:
      '«Над чем я смеюсь? Да у вас тут на столе такой смешной, странный лабораторный аппарат стоит!»',
    clinicalFact:
      'Эмоция просачивается через подкорковые пути, а левый «PR-отдел» мозга немедленно подгоняет под неё рациональный повод.',
  },
];

/**
 * ORIGINAL BOOK MECHANISM #3: "Разворот с разрезанным корешком книги" (Split-Spine Book).
 * The vertical gutter of the book literally represents the Corpus Callosum!
 */
export function Chapter2SplitSpine({ onNextChapter }: Chapter2SplitSpineProps) {
  const { state, setSplitBrainCut, setSplitBrainCard } = useExplorer();
  const [typedLength, setTypedLength] = useState(0);
  const [revealTruth, setRevealTruth] = useState(false);

  const selectedCard = CARDS.find((c) => c.id === state.splitBrainCard) ?? null;

  // Typewriter ink animation for the Left-Hemisphere PR-Narrator fabricating an alibi live!
  useEffect(() => {
    if (!selectedCard) {
      setTypedLength(0);
      return;
    }
    setTypedLength(0);
    setRevealTruth(false);
    const full = selectedCard.confabulation;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 2;
      setTypedLength(Math.min(full.length, i));
      if (i >= full.length) window.clearInterval(timer);
    }, 20);
    return () => window.clearInterval(timer);
  }, [selectedCard]);

  const handleToggleCut = () => {
    setSplitBrainCut(!state.splitBrainCut);
    setRevealTruth(false);
  };

  const handleSelectCard = (id: Exclude<SplitBrainCard, null>) => {
    if (!state.splitBrainCut) setSplitBrainCut(true);
    setSplitBrainCard(id);
  };

  return (
    <section
      id="ch-2"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Глава II — Расколотый штурвал"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ЧАСТЬ I · ИЗНУТРИ · ГЛАВА II</span>
          <span>РАСКОЛОТЫЙ ШТУРВАЛ · стр. 22</span>
        </div>

        {/* Editorial Opening — max 2 punchy paragraphs + 1 sharp Mr. Robot line */}
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
              Нам кажется, что внутри черепа сидит единый «Я» — хозяин мыслей и рук. В 1960–70-х нейробиологи Роджер Сперри и Майкл Газзанига проверили это на пациентах с рассечённым мозолистым телом — мостом из 200 миллионов волокон между полушариями.
            </p>
            <p className="text-[#4F4E4A]">
              Оказалось, говорящее левое полушарие работает как блестящий пресс-секретарь —{' '}
              <em className="font-serif-editorial text-[#141413]">
                как Эллиот из «Мистера Робота», уверенный, что управляет ситуацией, пока его собственные руки уже сделали другое.
              </em>
            </p>
          </div>
        </div>

        {/* CONTROL RIBBON: Cut the Book Spine (= Corpus Callosum!) */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleCut}
              className={`v6-pill h-11 px-5 rounded-full font-sans-ui text-[13.5px] font-medium inline-flex items-center gap-2 cursor-pointer border ${
                state.splitBrainCut
                  ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109] shadow-[0_10px_28px_rgba(252,65,9,0.25)]'
                  : 'bg-[#141413] text-[#FAF9F5] border-[#141413] hover:bg-[#2A2A28]'
              }`}
            >
              {state.splitBrainCut ? (
                <>
                  <Undo2 className="w-4 h-4" />
                  <span>Сшить корешок обратно</span>
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 text-[#FC4109]" />
                  <span>Рассечь корешок (комиссуру)</span>
                </>
              )}
            </button>

            <span className="font-mono-tech text-[11px] uppercase tracking-[0.1em] text-[#5E5D59]">
              {state.splitBrainCut
                ? '● СВЯЗЬ ПРЕРВАНА · ОТОШЛИТЕ ТАЙНУЮ КАРТОЧКУ ПРАВОЙ ПОЛОСЕ →'
                : '○ 200 МЛН ВОЛОКОН ЦЕЛЫ · СТРАНИЦЫ ОБЩАЮТСЯ'}
            </span>
          </div>

          {/* Secret visual cards sent strictly to the Right Hemisphere */}
          <div className="flex flex-wrap items-center gap-2">
            {CARDS.map((card) => {
              const active = state.splitBrainCard === card.id;
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
        </div>

        {/* THE PHYSICAL SPLIT-SPINE BOOK SPREAD */}
        <div
          className="relative grid grid-cols-1 md:grid-cols-2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            gap: state.splitBrainCut ? '34px' : '0px',
          }}
        >
          {/* Central Surgical Spine Seam Indicator (desktop) */}
          <div
            aria-hidden="true"
            className="hidden md:flex flex-col items-center justify-center pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-500"
          >
            <div
              className={`h-full transition-all duration-700 ${
                state.splitBrainCut
                  ? 'w-[2px] border-l-2 border-dashed border-[#FC4109]'
                  : 'w-[1px] bg-[#141413]/18'
              }`}
            />
            <span
              className={`absolute top-1/2 -translate-y-1/2 px-2 py-1 rounded-full font-mono-tech text-[9.5px] uppercase tracking-[0.12em] whitespace-nowrap transition-all duration-500 ${
                state.splitBrainCut
                  ? 'bg-[#FC4109] text-[#FAF9F5] shadow-[0_6px_20px_rgba(252,65,9,0.3)]'
                  : 'bg-[#FAF9F5] text-[#5E5D59] border border-[#141413]/16'
              }`}
            >
              {state.splitBrainCut ? 'РАЗРЕЗ КОМИССУРЫ' : 'КОРЕШОК · СВЯЗЬ 100%'}
            </span>
          </div>

          {/* LEFT PAGE: Talking Left Hemisphere (PR-Interpreter) */}
          <div
            className={`relative rounded-2xl border p-6 md:p-9 min-h-[370px] flex flex-col justify-between transition-all duration-700 ${
              state.splitBrainCut
                ? 'bg-[#FAF9F5] border-[#141413]/18 shadow-[0_18px_48px_rgba(20,20,19,0.08)] md:-rotate-[0.6deg]'
                : 'bg-[#F5F3EC] border-[#141413]/14 md:rounded-r-none md:border-r-0'
            }`}
          >
            <div>
              <div className="flex items-center justify-between font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#5E5D59] pb-3 border-b border-[#141413]/10">
                <span>ЛЕВАЯ ПОЛОСА · ГОВОРЯЩЕЕ ПОЛУШАРИЕ</span>
                <span className="text-[#004EDF] font-semibold">РЕЧЬ И АЛИБИ</span>
              </div>

              <div className="mt-5">
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59]">
                  ЧТО ВИДИТ ПРАВЫЙ ГЛАЗ (ЛЕВОЕ ПОЛУШАРИЕ):
                </div>
                <div className="mt-1.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EAE7DD] font-display font-semibold text-[14px]">
                  {selectedCard ? selectedCard.leftVisibleCard : 'Ожидание эксперимента'}
                </div>
              </div>

              {/* Confabulation Live Ink Transcript */}
              <div className="mt-6">
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#FC4109]">
                  {selectedCard
                    ? 'СТЕНОГРАММА «ЛЕВОГО ИНТЕРПРЕТАТОРА» (В ПРЯМОМ ЭФИРЕ):'
                    : 'РЕЖИМ НОРМАЛЬНОЙ СВЯЗИ:'}
                </div>

                {selectedCard ? (
                  <p className="mt-3 font-serif-editorial italic text-[20px] md:text-[22px] leading-[1.45] text-[#141413] min-h-[112px]">
                    {selectedCard.confabulation.slice(0, typedLength)}
                    {typedLength < selectedCard.confabulation.length && (
                      <span className="inline-block w-[2px] h-5 ml-0.5 bg-[#FC4109] align-middle animate-pulse" />
                    )}
                  </p>
                ) : (
                  <p className="mt-3 font-serif-editorial text-[16.5px] leading-[1.6] text-[#4E4D49]">
                    Нажмите <strong>«Рассечь корешок»</strong> и выберите любую из трёх карточек выше — вы увидите, с какой железной уверенностью говорящий мозг выдумывает причину поступка, которого сам не совершал.
                  </p>
                )}
              </div>
            </div>

            {selectedCard && (
              <div className="mt-6 pt-4 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setRevealTruth((v) => !v)}
                  className="v6-pill text-[12.5px] font-mono-tech uppercase tracking-[0.08em] text-[#FC4109] hover:text-[#141413] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{revealTruth ? 'Скрыть клинический разбор' : 'Вскрыть ложь интерпретатора'}</span>
                </button>
                <span className="font-mono-tech text-[10.5px] text-[#5E5D59]">
                  Уверенность субъекта: 100%
                </span>
              </div>
            )}

            {/* Revealed clinical X-ray footnote */}
            {selectedCard && revealTruth && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#FC4109]/8 border border-[#FC4109]/25 text-[13.5px] leading-[1.55] text-[#2A2927] animate-[beatRise_300ms_ease]">
                <strong className="text-[#FC4109]">На самом деле:</strong> {selectedCard.clinicalFact}
              </div>
            )}
          </div>

          {/* RIGHT PAGE: Silent Right Hemisphere (Receives Secret Visual Card & Moves Left Hand!) */}
          <div
            className={`relative rounded-2xl border p-6 md:p-9 min-h-[370px] flex flex-col justify-between transition-all duration-700 ${
              state.splitBrainCut
                ? 'bg-[#17181B] text-[#FAF9F5] border-[#17181B] shadow-[0_18px_48px_rgba(20,20,19,0.16)] md:rotate-[0.6deg]'
                : 'bg-[#F5F3EC] text-[#141413] border-[#141413]/14 md:rounded-l-none'
            }`}
          >
            <div>
              <div
                className={`flex items-center justify-between font-mono-tech text-[10.5px] uppercase tracking-[0.12em] pb-3 border-b ${
                  state.splitBrainCut
                    ? 'text-[#FAF9F5]/60 border-[#FAF9F5]/14'
                    : 'text-[#5E5D59] border-[#141413]/10'
                }`}
              >
                <span>ПРАВАЯ ПОЛОСА · НЕМОЕ ПОЛУШАРИЕ</span>
                <span className="text-[#FC4109] font-semibold">ОБРАЗЫ И ЛЕВАЯ РУКА</span>
              </div>

              {/* Graphic Signal Plate */}
              <div className="mt-6">
                {selectedCard ? (
                  <div className="space-y-5 animate-[fadeScaleIn_320ms_ease]">
                    <div className="p-5 rounded-xl border border-[#FAF9F5]/15 bg-[#FAF9F5]/5 flex items-center gap-5">
                      {/* Crisp Swiss vector pictogram for each secret right-hemisphere card */}
                      <svg width="62" height="62" viewBox="0 0 64 64" fill="none" className="shrink-0">
                        <rect x="2" y="2" width="60" height="60" rx="12" stroke="#FC4109" strokeWidth="1.5" />
                        {selectedCard.id === 'snow' && (
                          <g stroke="#FAF9F5" strokeWidth="1.8" strokeLinecap="round">
                            <line x1="32" y1="14" x2="32" y2="50" />
                            <line x1="16" y1="23" x2="48" y2="41" />
                            <line x1="48" y1="23" x2="16" y2="41" />
                            <circle cx="32" cy="32" r="4" fill="#FC4109" stroke="none" />
                          </g>
                        )}
                        {selectedCard.id === 'clock' && (
                          <g stroke="#FAF9F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M 18 46 L 26 24 L 38 24 L 46 46" />
                            <path d="M 28 18 L 36 18" stroke="#FC4109" strokeWidth="2.4" />
                            <path d="M 22 36 L 42 36" />
                          </g>
                        )}
                        {selectedCard.id === 'music' && (
                          <g stroke="#FAF9F5" strokeWidth="1.8" strokeLinecap="round">
                            <circle cx="32" cy="32" r="16" />
                            <circle cx="26" cy="28" r="1.8" fill="#FAF9F5" />
                            <circle cx="38" cy="28" r="1.8" fill="#FAF9F5" />
                            <path d="M 24 36 Q 32 44 40 36" stroke="#FC4109" strokeWidth="2.2" />
                          </g>
                        )}
                      </svg>
                      <div>
                        <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FC4109]">
                          ТАЙНЫЙ СИГНАЛ · 150 МС
                        </div>
                        <div className="font-display font-bold text-[18px] mt-0.5 text-[#FAF9F5]">
                          {selectedCard.label}
                        </div>
                        <p className="text-[13.5px] text-[#C8CDD6] mt-1 leading-[1.48]">
                          {selectedCard.rightPrompt}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FC4109]/14 border border-[#FC4109]/35">
                      <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FF9B7D]">
                        ФИЗИЧЕСКОЕ ДЕЙСТВИЕ ТЕЛА (БЕЗ СЛОВ):
                      </div>
                      <p className="font-display font-medium text-[15.5px] text-[#FAF9F5] mt-1">
                        {selectedCard.leftHandAction}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3">
                    <div
                      className={`font-mono-tech text-[11px] uppercase tracking-[0.14em] ${
                        state.splitBrainCut ? 'text-[#FC4109]' : 'text-[#5E5D59]'
                      }`}
                    >
                      {state.splitBrainCut ? 'КОРЕШОК РАССЕЧЁН · ВЫБЕРИТЕ КАРТОЧКУ' : 'ПРАВОЕ ПОЛУШАРИЕ В СИНХРОНЕ'}
                    </div>
                    <p
                      className={`font-serif-editorial italic text-[16px] max-w-xs mx-auto ${
                        state.splitBrainCut ? 'text-[#D0D5DF]' : 'text-[#5E5D59]'
                      }`}
                    >
                      Правое полушарие почти не умеет говорить, но прекрасно понимает образы и управляет левой рукой.
                    </p>
                  </div>
                )}
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
              tag="РАСПАД «ТЕАТРА»"
              quote="Внутри черепа нет никакой маленькой кабины пилота. Ваше «Я» — это не директор, а центр гравитации истории, которую мозг сочиняет на лету."
            />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.13em] text-[#FC4109]">
              ВЫВОД И ПЕРЕХОД К ГЛАВЕ III
            </div>
            <p className="font-serif-editorial italic text-[18px] leading-[1.52] text-[#282725]">
              Мозг не ждёт фактов: сначала он придумывает версию, а потом подгоняет под неё реальность. В этой главе он сочинил алиби для вашей руки — а на следующей странице вы увидите, что ровно тот же фокус он проворачивает со всем внешним миром.
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
