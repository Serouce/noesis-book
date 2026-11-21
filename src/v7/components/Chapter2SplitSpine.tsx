import { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, Scissors, Undo2 } from 'lucide-react';
import { useExplorer, type SplitBrainCard } from '../context/ExplorerContext';
import { ScholarMarginNote } from './ScholarMarginalia';
import { DossierTrigger } from '../../v9/components/NoesisDossierSheet';
import { LabHonestyBadge } from '../../v9/components/NoesisInstrumentFrame';
import { useViewportRaf } from '../../v9/hooks/useViewportRaf';
import { ruTypo } from '../../v9/utils/ruTypo';

interface Chapter2SplitSpineProps {
  onNextChapter: () => void;
}

interface ExperimentCard {
  id: Exclude<SplitBrainCard, null>;
  label: string;
  leftFieldShort: string;
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
    leftFieldShort: 'СНЕГ',
    rightPrompt: 'В левом поле зрения (→ правое полушарие) на 150 мс мелькнул зимний пейзаж со снегом.',
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
    leftFieldShort: 'ПРОЙДИСЬ',
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
    leftFieldShort: 'КАРИКАТУРА',
    rightPrompt: 'В левом поле зрения на 150 мс показали нелепую смешную карикатуру на профессора.',
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

const CALLOSAL_FIBERS = Array.from({ length: 14 }, (_, i) => i);

/**
 * ACT III · CHAPTER III: "Расколотый штурвал" (Bug #4 Fixes):
 * 1. Real Optic Chiasm diagram with BOTH eyes + crossing visual field rays + 150ms < 200ms saccade rule!
 * 2. Damped Hooke's Law spring recoil animation on all 14 snapped callosal fibers (useViewportRaf, 0% idle CPU!).
 * 3. Level-2 Archival Dossier trigger ("split-brain-chiasm").
 * 4. Updated chapter number (ГЛ. III, стр. 38) and bridge to Act IV ("Под черепом").
 */
export function Chapter2SplitSpine({ onNextChapter: _onNextChapter }: Chapter2SplitSpineProps) {
  const { state, setSplitBrainCut, setSplitBrainCard } = useExplorer();
  const [typedLength, setTypedLength] = useState(0);
  const [recoiling, setRecoiling] = useState(false);

  const spreadRef = useRef<HTMLDivElement | null>(null);
  const leftFiberRefs = useRef<Array<SVGPathElement | null>>([]);
  const rightFiberRefs = useRef<Array<SVGPathElement | null>>([]);
  const recoilStartMsRef = useRef<number>(0);

  const selectedCard = CARDS.find((c) => c.id === state.splitBrainCard) ?? CARDS[0];
  const activeStatement = state.splitBrainCut
    ? selectedCard.confabulation
    : selectedCard.wholeBrainAnswer;

  // Typewriter ink animation
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

  // Damped Hooke's-law spring whip animation for the 14 snapped fibers (~780ms active window, 0% idle CPU!)
  const animateRecoil = useCallback((nowMs: number) => {
    const elapsed = (nowMs - recoilStartMsRef.current) / 1000;
    if (elapsed > 0.85) {
      setRecoiling(false);
      return;
    }
    const damping = Math.exp(-5.4 * elapsed);
    const osc = Math.cos(24 * elapsed);

    CALLOSAL_FIBERS.forEach((idx) => {
      const y = 32 + idx * 23;
      if (Math.abs(y - 180) <= 46) return;
      const sign = idx % 2 === 0 ? 1 : -1;
      const amp = (5.5 + 14 * damping * osc) * sign;
      const tipShift = 3 * damping * Math.sin(18 * elapsed);
      const lEl = leftFiberRefs.current[idx];
      const rEl = rightFiberRefs.current[idx];
      if (lEl) {
        lEl.setAttribute(
          'd',
          `M 10 ${y} Q ${(17 + tipShift * 0.4).toFixed(1)} ${(y + amp * 0.72).toFixed(1)} ${(23 + tipShift).toFixed(1)} ${(y + amp).toFixed(1)}`,
        );
      }
      if (rEl) {
        rEl.setAttribute(
          'd',
          `M 54 ${y} Q ${(47 - tipShift * 0.4).toFixed(1)} ${(y - amp * 0.72).toFixed(1)} ${(41 - tipShift).toFixed(1)} ${(y - amp).toFixed(1)}`,
        );
      }
    });
  }, []);

  useViewportRaf(spreadRef, animateRecoil, { enabled: recoiling && state.splitBrainCut });

  const handleToggleCut = () => {
    const next = !state.splitBrainCut;
    setSplitBrainCut(next);
    if (next) {
      recoilStartMsRef.current = performance.now();
      setRecoiling(true);
    } else {
      setRecoiling(false);
    }
  };

  const handleSelectCard = (id: Exclude<SplitBrainCard, null>) => {
    setSplitBrainCard(id);
  };

  const isDoneTyping = typedLength >= activeStatement.length;

  return (
    <section
      id="ch-2"
      className="relative bg-[#FAF9F5] text-[#141413] pt-20 pb-20 md:pt-24 md:pb-24 border-b border-[#141413]/10"
      aria-label="Глава III.2 — Расколотый штурвал"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">АКТ III · КОНСТРУКТОР «Я» · ГЛАВА III.2</span>
          <span>РАСКОЛОТЫЙ ШТУРВАЛ · стр. 60</span>
        </div>

        {/* Editorial Opening */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Кто на самом деле</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                держит штурвал?
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-3 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              {ruTypo(
                'В 1960–70-х врачи спасали пациентов с тяжелейшей эпилепсией, рассекая ',
              )}
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

        {/* BUG #4 FIX: TRUE OPTIC CHIASM DIAGRAM WITH BOTH EYES + CROSSING RAYS + 150ms < 200ms SACCADE RULE! */}
        <div className="mt-9 rounded-2xl border border-[#141413]/12 bg-[#F3F1E9] p-5 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
                  КАК УСТРОЕН ОПЫТ · ЗРИТЕЛЬНАЯ ХИАЗМА И ОКНО 150 МС
                </span>
                <LabHonestyBadge badge="reconstruction" />
              </div>
              <p className="text-[14px] leading-[1.62] text-[#2F2E2B]">
                {ruTypo(
                  'Каждый глаз разделён пополам, а нервы перекрещиваются в зрительной хиазме. Всё, что мелькает в ',
                )}
                <strong className="text-[#FC4109]">левом поле зрения обоих глаз</strong>, идёт в{' '}
                <strong className="text-[#141413]">правое полушарие</strong> (оно молчит, но управляет левой рукой). Картинку вспыхивают ровно на{' '}
                <strong className="text-[#141413]">150 мс</strong> — это быстрее любого перевода взгляда (саккада занимает ~200 мс), поэтому говорящее полушарие физически не успевает подсмотреть!
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono-tech text-[10px]">
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#141413]/10 text-[#141413]">
                  1. Посмотрите ответ ЦЕЛОГО мозга
                </span>
                <span className="text-[#FC4109]">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#141413]/10 text-[#141413]">
                  2. Рассеките мозолистое тело
                </span>
                <span className="text-[#FC4109]">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#141413]/10 text-[#141413]">
                  3. Поймайте алиби
                </span>
              </div>
            </div>

            {/* Dynamic Anatomical Optic Chiasm SVG — reacts to selectedCard + larger crisp readability! */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <svg
                viewBox="0 0 440 194"
                className="w-full max-w-[465px] h-auto block"
                aria-label="Схема зрительной хиазмы: лучи из левого и правого полей зрения попадают в оба глаза и перекрещиваются в противоположные полушария"
              >
                {/* Top: Dynamic Visual Fields (150ms Tachistoscope Flash) */}
                <rect x="8" y="4" width="194" height="25" rx="6" fill="rgba(252,65,9,0.10)" stroke="#FC4109" strokeOpacity="0.45" />
                <text x="105" y="20" textAnchor="middle" fill="#C83407" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                  ЛЕВ. ПОЛЕ · 150 МС ({selectedCard.leftFieldShort})
                </text>
                <circle cx="220" cy="16.5" r="3.2" fill="#141413" />
                <rect x="238" y="4" width="194" height="25" rx="6" fill="rgba(0,78,223,0.10)" stroke="#004EDF" strokeOpacity="0.45" />
                <text x="335" y="20" textAnchor="middle" fill="#004EDF" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                  ПРАВ. ПОЛЕ ({selectedCard.leftVisibleCard.toUpperCase()})
                </text>

                {/* Two Anatomical Eyes */}
                <g>
                  <circle cx="164" cy="56" r="14" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />
                  <circle cx="164" cy="49" r="4.8" fill="#141413" />
                  <circle cx="276" cy="56" r="14" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />
                  <circle cx="276" cy="49" r="4.8" fill="#141413" />
                  <text x="142" y="60" textAnchor="end" fill="#5E5D59" fontSize="9" fontWeight="600" fontFamily="JetBrains Mono Variable, monospace">
                    ЛЕВ. ГЛАЗ
                  </text>
                  <text x="298" y="60" textAnchor="start" fill="#5E5D59" fontSize="9" fontWeight="600" fontFamily="JetBrains Mono Variable, monospace">
                    ПРАВ. ГЛАЗ
                  </text>
                </g>

                {/* Crossing Light Rays into Both Eyes */}
                <path d="M 98 29 L 159 48" stroke="#FC4109" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.72" />
                <path d="M 114 29 L 269 49" stroke="#FC4109" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.72" />
                <path d="M 342 29 L 281 48" stroke="#004EDF" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.72" />
                <path d="M 326 29 L 171 49" stroke="#004EDF" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.72" />

                {/* Optic Chiasm (Generous clean X-crossing below eyes!) */}
                <path d="M 171 69 C 182 94, 252 98, 286 118" fill="none" stroke="#FC4109" strokeWidth="2.2" />
                <path d="M 282 69 C 292 88, 298 102, 300 118" fill="none" stroke="#FC4109" strokeWidth="2.2" />
                <path d="M 269 69 C 258 94, 188 98, 154 118" fill="none" stroke="#004EDF" strokeWidth="2.2" />
                <path d="M 158 69 C 148 88, 142 102, 140 118" fill="none" stroke="#004EDF" strokeWidth="2.2" />

                {/* Spacious Chiasm Callout Pill */}
                <rect x="176" y="83" width="88" height="19" rx="9.5" fill="#FAF9F5" stroke="#141413" strokeOpacity="0.24" />
                <text x="220" y="96" textAnchor="middle" fill="#141413" fontSize="8.5" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                  ХИАЗМА (X)
                </text>

                {/* Bottom Left: Speaking Left Hemisphere */}
                <rect x="8" y="118" width="156" height="70" rx="10" fill="#FAF9F5" stroke="#004EDF" strokeOpacity="0.34" />
                <text x="20" y="137" fill="#004EDF" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                  ЛЕВОЕ ПОЛУШАРИЕ
                </text>
                <text x="20" y="155" fill="#141413" fontSize="10.5" fontFamily="Inter Variable, sans-serif">
                  Речь и «алиби»
                </text>
                <text x="20" y="173" fill="#5E5D59" fontSize="9" fontFamily="JetBrains Mono Variable, monospace">
                  → ПРАВАЯ РУКА
                </text>

                {/* Center Split Hoodie Silhouette */}
                <g transform="translate(182, 116)">
                  <path
                    d="M 36 6 C 21 6, 15 17, 15 31 C 15 40, 18 46, 22 49 C 14 53, 8 59, 6 70 L 36 70 Z"
                    fill="#FAF9F5"
                    stroke="#141413"
                    strokeWidth="1.35"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 40 6 C 55 6, 61 17, 61 31 C 61 40, 58 46, 54 49 C 62 53, 68 59, 70 70 L 40 70 Z"
                    fill={state.splitBrainCut ? '#17181B' : '#E8E5DA'}
                    stroke="#141413"
                    strokeWidth="1.35"
                    strokeLinejoin="round"
                  />
                  <ellipse cx="29.5" cy="29" rx="2" ry="1.3" fill="#141413" />
                  <ellipse cx="46.5" cy="29" rx="2" ry="1.3" fill={state.splitBrainCut ? '#FC4109' : '#141413'} />
                  <line
                    x1="38"
                    y1="0"
                    x2="38"
                    y2="72"
                    stroke={state.splitBrainCut ? '#FC4109' : '#004EDF'}
                    strokeWidth="1.6"
                    strokeDasharray={state.splitBrainCut ? '3 3' : undefined}
                  />
                </g>

                {/* Bottom Right: Silent Right Hemisphere */}
                <rect
                  x="276"
                  y="118"
                  width="156"
                  height="70"
                  rx="10"
                  fill={state.splitBrainCut ? '#17181B' : '#FAF9F5'}
                  stroke="#FC4109"
                  strokeOpacity={state.splitBrainCut ? '0.72' : '0.34'}
                />
                <text x="288" y="137" fill="#FC4109" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                  ПРАВОЕ ПОЛУШАРИЕ
                </text>
                <text x="288" y="155" fill={state.splitBrainCut ? '#FAF9F5' : '#141413'} fontSize="10.5" fontFamily="Inter Variable, sans-serif">
                  Молчит, но действует
                </text>
                <text x="288" y="173" fill={state.splitBrainCut ? '#FF9B7D' : '#FC4109'} fontSize="9" fontFamily="JetBrains Mono Variable, monospace">
                  → ЛЕВАЯ РУКА
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* GUIDED 1 -> 2 CONTROL RIBBON */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-5">
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

        {/* THE PHYSICAL SPLIT-SPINE BOOK SPREAD WITH SPRING-RECOILING CALLOSAL FIBERS */}
        <div
          ref={spreadRef}
          className="relative grid grid-cols-1 md:grid-cols-2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            gap: state.splitBrainCut ? '48px' : '0px',
          }}
        >
          {/* Central Surgical Spine Seam + 14 Spring-Recoiling Callosal Fibers */}
          <div
            aria-hidden="true"
            className="hidden md:flex flex-col items-center justify-center pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 w-16"
          >
            <svg viewBox="0 0 64 360" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
              {CALLOSAL_FIBERS.map((idx) => {
                const y = 32 + idx * 23;
                const restCurve = (idx % 2 === 0 ? 1 : -1) * 5.5;
                if (!state.splitBrainCut) {
                  return (
                    <line
                      key={idx}
                      x1="14"
                      y1={y}
                      x2="50"
                      y2={y}
                      stroke="#004EDF"
                      strokeOpacity="0.26"
                      strokeWidth="1.35"
                    />
                  );
                }
                return (
                  <g key={idx}>
                    {Math.abs(y - 180) > 46 && (
                      <>
                        <path
                          ref={(el) => {
                            leftFiberRefs.current[idx] = el;
                          }}
                          d={`M 10 ${y} Q 17 ${y + restCurve * 0.72} 23 ${y + restCurve}`}
                          fill="none"
                          stroke="#FC4109"
                          strokeOpacity="0.54"
                          strokeWidth="1.45"
                          strokeLinecap="round"
                        />
                        <path
                          ref={(el) => {
                            rightFiberRefs.current[idx] = el;
                          }}
                          d={`M 54 ${y} Q 47 ${y - restCurve * 0.72} 41 ${y - restCurve}`}
                          fill="none"
                          stroke="#FC4109"
                          strokeOpacity="0.54"
                          strokeWidth="1.45"
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

          {/* LEFT PAGE: Talking Left Hemisphere */}
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

            <div className="mt-5 pt-4 border-t border-[#141413]/10 space-y-3">
              {state.splitBrainCut ? (
                <div className="p-3.5 rounded-xl bg-[#FC4109]/8 border border-[#FC4109]/25 text-[13.5px] leading-[1.56] text-[#2A2927] animate-[beatRise_300ms_ease]">
                  <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#FC4109] font-semibold mb-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>РЕНТГЕН ПРАВДЫ · УВЕРЕННОСТЬ ПАЦИЕНТА 100%</span>
                    </span>
                  </div>
                  <p>{ruTypo(selectedCard.clinicalFact)}</p>
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

          {/* RIGHT PAGE: Silent Right Hemisphere */}
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

              <div className="mt-6 space-y-4">
                <div
                  className={`p-5 rounded-xl border flex items-center gap-5 transition-colors ${
                    state.splitBrainCut
                      ? 'border-[#FAF9F5]/16 bg-[#FAF9F5]/6'
                      : 'border-[#141413]/12 bg-[#FAF9F5]'
                  }`}
                >
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
                      {ruTypo(selectedCard.rightPrompt)}
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
                  {ruTypo(
                    state.splitBrainCut
                      ? 'Справа всё поняли и выполнили действие молча — но из-за разрыва правое полушарие не может шепнуть левому, зачем именно тело так поступило.'
                      : 'Сейчас мост цел: правое полушарие мгновенно передало образ налево, поэтому человек спокойно называет настоящую причину своего поступка.',
                  )}
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

        {/* Margin Commentary + Level-2 Dossier + Bridge to Act IV */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4">
            <ScholarMarginNote
              scholar="dennett"
              tag="МИФ О «ДИРЕКТОРЕ В ГОЛОВЕ»"
              quote="Внутри черепа нет никакой маленькой кабины пилота, где сидит ваш «главный директор». Наше «Я» — это история, которую говорящая часть мозга сочиняет на лету, чтобы склеить действия тела воедино."
            />
            <DossierTrigger
              dossier="split-brain-chiasm"
              label="Зрительная хиазма, окно 150 мс и уточнение Пинто (Brain, 2017)"
              meta="Архивное досье III.1 · Уровень 2"
              className="w-full"
            />
          </div>
          <div className="lg:col-span-6 space-y-3 lg:pt-2">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.13em] text-[#FC4109]">
              ВЫВОД АКТА III · КОНСТРУКТОР «Я»
            </div>
            <p className="font-serif-editorial italic text-[18px] leading-[1.52] text-[#282725]">
              {ruTypo(
                'Мы увидели, ЧТО делает сознание изнутри: предсказывает мир и сочиняет историю нашего «Я». Теперь главный вопрос нейробиологии: ГДЕ именно в полутора килограммах живой ткани зажигается этот свет?',
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
