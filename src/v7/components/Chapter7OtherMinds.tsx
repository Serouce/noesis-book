import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bookmark, Check, X } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { LabHonestyBadge } from '../../v9/components/NoesisInstrumentFrame';
import { Act5SiliconQualia } from '../../v9/chapters/Act5SiliconQualia';
import { TransformerVsBrainRunway } from '../../v10/chapters/TransformerVsBrainRunway';
import { Chapter8AiDeepDive } from '../../v10/chapters/Chapter8AiDeepDive';
import { ruTypo } from '../../v9/utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

interface Chapter7OtherMindsProps {
  onNextChapter: () => void;
}

const SPECIES = [
  {
    id: 'sponge',
    name: 'Морская губка',
    genitive: 'Морской губки',
    neurons: '0 нейронов',
    detail: 'Нет нервной системы и нервных клеток',
    fieldNote:
      'Морская губка (Porifera) — древнейшее многоклеточное животное, у которого нет ни единого нейрона, ни мышц, ни рецепторов боли. Она фильтрует воду чисто биохимически.',
    inNyDeclaration: false,
  },
  {
    id: 'crab',
    name: 'Десятиногий краб',
    genitive: 'Десятиногого краба',
    neurons: '~100 тыс.',
    detail: 'Избегает боли, помнит травму',
    fieldNote:
      'В опытах Роберта Элвуда крабы упорно трут повреждённую клешню, запоминают укрытие, где получили слабый удар током, и способны «торговаться» между ценностью раковины и силой боли.',
    inNyDeclaration: true,
  },
  {
    id: 'bee',
    name: 'Медоносная пчела',
    genitive: 'Медоносной пчелы',
    neurons: '~1 млн',
    detail: 'Понимает ноль, катает шарики в игре',
    fieldNote:
      'В экспериментах Ларса Читтки (2022) шмели и пчёлы часами катают деревянные шарики безо всякой еды или награды — чистое игровое поведение, плюс они понимают понятие «ноль» и передают карту танцем.',
    inNyDeclaration: true,
  },
  {
    id: 'octopus',
    name: 'Осьминог',
    genitive: 'Осьминога',
    neurons: '500 млн',
    detail: '2/3 нейронов живут в 8 щупальцах',
    fieldNote:
      'Осьминог эволюционировал независимо от позвоночных 550 млн лет назад: две трети его нейронов распределены по 8 «мини-мозгам» в щупальцах. Он узнаёт лица смотрителей, сбегает из аквариумов и видит цветные сны.',
    inNyDeclaration: true,
  },
  {
    id: 'raven',
    name: 'Ворон',
    genitive: 'Ворона',
    neurons: '~1,2 млрд',
    detail: 'Без человеческой коры планирует завтра',
    fieldNote:
      'У птиц вообще нет шестислойной коры млекопитающих (неокортекса) — но вороны откладывают нужный инструмент «на завтра», помнят обманщиков годами и демонстрируют отклик сознания в собственных зонах мозга.',
    inNyDeclaration: true,
  },
  {
    id: 'human',
    name: 'Человек',
    genitive: 'Человека',
    neurons: '86 млрд',
    detail: 'У слона — 257 млрд: число ≠ сознание',
    fieldNote:
      'Число нейронов само по себе ничего не гарантирует: у африканского слона их 257 млрд (втрое больше, чем у нас), а у человека большая часть нейронов живёт в мозжечке, который почти не участвует в сознании.',
    inNyDeclaration: true,
  },
];

/**
 * ACT IV · CHAPTERS 07–08: "Граница иных разумов и Призрак в кремнии (2024–2026)"
 * 1. NY Declaration 2024 Ribbon + Engraved Sea Sponge stamp
 * 2. Turing 2025 (73% vs 36%) + 3D Chalmers Fading Qualia + Varela Autopoiesis
 * 3. Full-Bleed WebGL Cinema Runway: Transformer Layers -> Anthropic SAE Constellations -> Living Recurrent Torus
 * 4. Signature Scroll Monolith: NOESIS 9000 / HAL 9000
 * 5. Deep 2024-2026 AI Consciousness Research (Anthropic, Google DeepMind, Skeptic Camp) + 4-Architecture Comparator
 */
export function Chapter7OtherMinds({ onNextChapter }: Chapter7OtherMindsProps) {
  const { state, setRibbonBoundaryIndex, setRibbonChecked } = useExplorer();

  const [focusedSpeciesId, setFocusedSpeciesId] = useState<string>('octopus');
  const [showSpongeStamp, setShowSpongeStamp] = useState(false);

  const halRunwayRef = useRef<HTMLDivElement | null>(null);
  const halMonolithRef = useRef<HTMLDivElement | null>(null);
  const halIrisRef = useRef<SVGCircleElement | null>(null);
  const halGlowRef = useRef<SVGCircleElement | null>(null);
  const halLabelRef = useRef<HTMLDivElement | null>(null);
  const [halAwake, setHalAwake] = useState(false);

  useEffect(() => {
    const runway = halRunwayRef.current;
    if (!runway) return;

    const trigger = ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;
        setHalAwake((prev) => {
          const next = p > 0.42;
          return prev === next ? prev : next;
        });

        if (halMonolithRef.current) {
          const w = 16 + p * 184;
          const h = 16 + p * 324;
          // Rapidly settle into crisp rectangular HAL 9000 / Braun T3 anodized monolith (12px corners, NEVER rounded doorbell pill!)
          const radius = Math.max(12, Math.pow(Math.max(0, 1 - p * 1.45), 2.4) * 999);
          halMonolithRef.current.style.width = `${w.toFixed(1)}px`;
          halMonolithRef.current.style.height = `${h.toFixed(1)}px`;
          halMonolithRef.current.style.borderRadius = `${radius.toFixed(1)}px`;
        }

        if (halIrisRef.current) {
          halIrisRef.current.setAttribute('r', `${(6 + p * 22).toFixed(1)}`);
        }
        if (halGlowRef.current) {
          halGlowRef.current.setAttribute('r', `${(10 + p * 38).toFixed(1)}`);
          halGlowRef.current.setAttribute('opacity', `${(0.2 + p * 0.45).toFixed(2)}`);
        }
        if (halLabelRef.current) {
          halLabelRef.current.style.opacity = `${Math.max(0, (p - 0.45) / 0.45).toFixed(2)}`;
        }
      },
    });

    return () => trigger.kill();
  }, []);

  const handleCheckNyDeclaration = () => {
    setRibbonChecked(true);
    setShowSpongeStamp(true);
  };

  const focusedSpeciesIdx = Math.max(
    0,
    SPECIES.findIndex((s) => s.id === focusedSpeciesId),
  );
  const focusedSpecies = SPECIES[focusedSpeciesIdx] ?? SPECIES[3];

  return (
    <section
      id="ch-7"
      className="relative bg-[#FAF9F5] text-[#141413] pt-14 pb-20 md:pt-18 md:pb-24 border-b border-[#141413]/10"
      aria-label="Глава 07–08 — Граница иных разумов и призрак в кремнии"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">АКТ IV · ГРАНИЦЫ РАЗУМА · ГЛАВА 07 → 08</span>
          <span>ИНЫЕ РАЗУМЫ · КРЕМНИЙ · стр. 124</span>
        </div>

        {/* PART 7.1: CRIMSON SILK-RIBBON BOOKMARK */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Где вы проведёте</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                красную черту чувствующего мира?
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              Сознание <strong className="font-semibold text-[#141413]">не зависит напрямую от числа нейронов</strong> (у африканского слона их 257 млрд — втрое больше, чем у нас). Изучите виды ниже и проведите ползунком красную черту: слева — «биороботы», справа — чувствующие существа.
            </p>
          </div>
        </div>

        {/* Interactive Ribbon Placement Bar */}
        <div className="mt-10 rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] p-5 md:p-7 space-y-5 relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.11em]">
                <Bookmark className="w-4 h-4 text-[#FC4109] fill-current shrink-0" />
                <span>
                  {state.ribbonBoundaryIndex === 0 ? (
                    <>
                      ВАША ЗАКЛАДКА: <strong className="text-[#FC4109]">ЧУВСТВУЮТ ВСЕ 6 ВИДОВ</strong>
                    </>
                  ) : (
                    <>
                      ВАША ЗАКЛАДКА: ПОСЛЕ{' '}
                      <strong className="text-[#FC4109]">
                        {SPECIES[state.ribbonBoundaryIndex - 1]?.genitive.toUpperCase()}
                      </strong>
                    </>
                  )}
                </span>
              </div>

              {state.ribbonChecked && (
                <div className="inline-flex items-center gap-3 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0D7A5F]" />
                    <span>признано NY 2024</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                    <span>вне декларации</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <LabHonestyBadge badge="self-test" />
              <button
                type="button"
                onClick={handleCheckNyDeclaration}
                className={`v6-pill h-9 px-4 rounded-full font-sans-ui text-[12.5px] font-medium inline-flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  state.ribbonChecked
                    ? 'bg-[#0D7A5F] text-[#FAF9F5]'
                    : 'bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5]'
                }`}
              >
                {state.ribbonChecked ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FC4109]" />
                )}
                <span>
                  {state.ribbonChecked
                    ? 'Сверено с NY 2024'
                    : 'Сверить с декларацией NY 2024'}
                </span>
              </button>
            </div>
          </div>

          <p className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#6B6963]">
            Кликните на любой вид, чтобы прочитать факты · двигайте ползунок (или нажмите кнопку в справке), чтобы поставить красную черту
          </p>

          {/* 6 Swiss Taxonomic Cards (Bug #10 Fix: clicking inspects ONLY, never accidentally jumps bookmark!) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 pb-6">
            {SPECIES.map((sp, idx) => {
              const userConsidersConscious = idx >= state.ribbonBoundaryIndex;
              const isUserCutHere = idx === state.ribbonBoundaryIndex;
              const isNyCutHere = state.ribbonChecked && idx === 1;
              const bothOnSameGap = isUserCutHere && isNyCutHere;
              const isFocused = focusedSpeciesId === sp.id;

              return (
                <div key={sp.id} className="relative flex flex-col">
                  {isUserCutHere && (
                    <div
                      aria-hidden="true"
                      className={`hidden lg:flex flex-col items-center w-0 ${
                        bothOnSameGap ? '-left-[8px]' : '-left-[6px]'
                      } absolute -top-4 -bottom-2 z-20 pointer-events-none`}
                    >
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#FC4109] text-[#FAF9F5] font-mono-tech text-[8.5px] uppercase tracking-wider whitespace-nowrap shadow-sm">
                        ВЫ
                      </span>
                      <span className="w-[2.5px] flex-1 bg-[#FC4109]" />
                    </div>
                  )}

                  {isNyCutHere && (
                    <div
                      aria-hidden="true"
                      className={`hidden lg:flex flex-col items-center w-0 ${
                        bothOnSameGap ? '-left-[4px]' : '-left-[6px]'
                      } absolute -bottom-7 -top-1 z-10 pointer-events-none`}
                    >
                      <span className="w-0 flex-1 border-l-2 border-dashed border-[#0D7A5F]" />
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#0D7A5F] text-[#FAF9F5] font-mono-tech text-[8.5px] uppercase tracking-wider whitespace-nowrap shadow-xs">
                        NY 2024
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setFocusedSpeciesId(sp.id)}
                    className={`v6-pill flex-1 text-left p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                      userConsidersConscious
                        ? 'bg-[#FAF9F5] border-[#141413]/22 text-[#141413] shadow-[0_8px_22px_rgba(20,20,19,0.06)]'
                        : 'bg-[#E9E6DC]/75 border-[#141413]/10 text-[#6A6862] opacity-85'
                    } ${isUserCutHere ? 'border-l-[3px] border-l-[#FC4109] lg:border-l' : ''} ${
                      isFocused ? 'ring-2 ring-[#004EDF]/45' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 font-mono-tech text-[9.5px] uppercase tracking-[0.1em]">
                        <span className={userConsidersConscious ? 'text-[#FC4109] font-semibold' : 'text-[#7A7872]'}>
                          {userConsidersConscious ? 'ЧУВСТВУЕТ' : 'БИОРОБОТ'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          {isUserCutHere && (
                            <span className="lg:hidden px-1.5 py-0.5 rounded bg-[#FC4109] text-[#FAF9F5] text-[8px] font-bold">
                              ВЫ
                            </span>
                          )}
                          {state.ribbonChecked && (
                            <span
                              className={`w-2 h-2 rounded-full ${
                                sp.inNyDeclaration ? 'bg-[#0D7A5F]' : 'bg-[#94A3B8]'
                              }`}
                              title={sp.inNyDeclaration ? 'В Нью-Йоркской декларации 2024' : 'Вне декларации (0 нейронов)'}
                            />
                          )}
                        </span>
                      </div>

                      <div className="font-display font-bold text-[15px] mt-2 leading-snug text-[#141413]">
                        {sp.name}
                      </div>
                      <div className="font-mono-tech text-[11px] font-semibold text-[#004EDF] mt-1">
                        {sp.neurons}
                      </div>
                    </div>

                    <p className="text-[12px] leading-[1.48] text-[#52514C]">{sp.detail}</p>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Dedicated Bookmark Slider */}
          <div className="pt-1 space-y-1.5">
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={state.ribbonBoundaryIndex}
              onChange={(e) => setRibbonBoundaryIndex(Number(e.target.value))}
              className="w-full accent-[#FC4109] cursor-pointer"
              aria-label="Положение красной закладки-ляссе между видами"
            />
            <div className="flex justify-between font-mono-tech text-[10px] text-[#5E5D59]">
              <span>← Сместить границу к простейшим (все справа чувствуют)</span>
              <span>Сместить границу к человеку →</span>
            </div>
          </div>

          {/* LIVE FIELD DOSSIER + EXPLICIT "PLACE BOOKMARK HERE" BUTTON */}
          <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#004EDF] font-semibold">
                ПОЛЕВАЯ СПРАВКА · {focusedSpecies.name.toUpperCase()} ({focusedSpecies.neurons})
              </div>
              <p className="text-[13.5px] leading-[1.58] text-[#2F2E2B]">
                {ruTypo(focusedSpecies.fieldNote)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRibbonBoundaryIndex(focusedSpeciesIdx)}
              className="v6-pill px-3.5 py-2 rounded-full bg-[#F3F1E9] hover:bg-[#FC4109] hover:text-[#FAF9F5] border border-[#141413]/14 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#141413] cursor-pointer shrink-0"
            >
              Поставить черту здесь
            </button>
          </div>

          {/* CLEAN SCIENTIFIC NY 2024 NOTE + ENGRAVED SEA-SPONGE EASTER-EGG STAMP */}
          {state.ribbonChecked && (
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch animate-[beatRise_380ms_cubic-bezier(0.22,1,0.36,1)]">
              <div
                className={`${
                  showSpongeStamp ? 'lg:col-span-8' : 'lg:col-span-12'
                } rounded-xl bg-[#FAF9F5] border-l-4 border-[#0D7A5F] border-t border-r border-b border-[#141413]/12 p-5`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.12em]">
                  <span className="text-[#0D7A5F] font-semibold">
                    НЬЮ-ЙОРКСКАЯ ДЕКЛАРАЦИЯ О СОЗНАНИИ ЖИВОТНЫХ · АПРЕЛЬ 2024 (40+ УЧЁНЫХ)
                  </span>
                  {!showSpongeStamp && (
                    <button
                      type="button"
                      onClick={() => setShowSpongeStamp(true)}
                      className="text-[#FC4109] hover:underline cursor-pointer"
                    >
                      Показать шутку редакции →
                    </button>
                  )}
                </div>
                <p className="mt-2.5 font-serif-editorial text-[15.5px] leading-[1.62] text-[#1E1D1B]">
                  {ruTypo(
                    'В апреле 2024 года более сорока ведущих нейробиологов и философов подписали исторический документ: у всех млекопитающих и птиц есть прочные научные основания предполагать сознание — а у ',
                  )}
                  <strong className="font-semibold text-[#0D7A5F]">
                    рептилий, амфибий, рыб, осьминогов, десятиногих крабов и насекомых (пчёл) — реалистичная вероятность субъективного опыта
                  </strong>
                  . За бортом из этой шестёрки осталась только морская губка.
                </p>
              </div>

              {showSpongeStamp && (
                <aside className="lg:col-span-4 rounded-xl bg-[#141413] text-[#FAF9F5] p-4 border border-[#141413] flex items-center gap-4 relative animate-[fadeScaleIn_350ms_ease]">
                  <button
                    type="button"
                    onClick={() => setShowSpongeStamp(false)}
                    aria-label="Скрыть выноску"
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#FAF9F5]/10 hover:bg-[#FAF9F5]/20 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <svg viewBox="0 0 76 92" className="w-16 h-20 shrink-0" aria-label="Гравюра прямоугольной морской губки с красным галстуком">
                    <path
                      d="M 14 14 Q 24 10 38 13 Q 52 10 62 15 Q 66 30 63 46 Q 66 60 61 68 L 15 68 Q 10 56 13 42 Q 10 26 14 14 Z"
                      fill="#FAF9F5"
                      stroke="#FAF9F5"
                      strokeWidth="1.5"
                    />
                    <circle cx="24" cy="24" r="3.4" fill="none" stroke="#141413" strokeWidth="1.3" />
                    <circle cx="52" cy="22" r="2.6" fill="none" stroke="#141413" strokeWidth="1.2" />
                    <circle cx="20" cy="46" r="2.5" fill="none" stroke="#141413" strokeWidth="1.2" />
                    <circle cx="55" cy="48" r="3.5" fill="none" stroke="#141413" strokeWidth="1.3" />
                    <circle cx="38" cy="36" r="2.2" fill="none" stroke="#141413" strokeWidth="1.1" />
                    <path d="M 18 58 L 28 58 M 46 60 L 56 60" stroke="#141413" strokeWidth="0.9" opacity="0.45" />
                    <path d="M 15 68 L 61 68 L 61 78 L 15 78 Z" fill="#2A2B2E" stroke="#FAF9F5" strokeWidth="1.2" />
                    <path d="M 28 68 L 38 74 L 48 68" fill="none" stroke="#FAF9F5" strokeWidth="1.2" />
                    <path d="M 38 72 L 42 82 L 38 88 L 34 82 Z" fill="#FC4109" />
                  </svg>

                  <div className="min-w-0 pr-4 space-y-1">
                    <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
                      PORIFERA · 0 НЕЙРОНОВ
                    </div>
                    <div className="font-display font-bold text-[14px] leading-snug">
                      Тест на сознание не пройден
                    </div>
                    <p className="font-serif-editorial italic text-[12.5px] leading-[1.48] text-[#C8CDD6]">
                      Вопреки одному подводному мультсериалу, нервная система в той компании есть только у осьминога и краба.
                    </p>
                  </div>
                </aside>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ACT IV HERO AI BLOCK: Turing 2025 (73% vs 36%) + 3D MRI Chalmers Fading Qualia + Varela Autopoiesis */}
      <Act5SiliconQualia />

      {/* NEW CINEMA WEBGL RUNWAY #2 (235vh): Transformer Layers -> Anthropic SAE Constellations -> Living Recurrent Torus! */}
      <TransformerVsBrainRunway />

      {/* SIGNATURE SCROLL SETPIECE #3 (~155vh): #FC4109 DOT -> VERTICAL MONOLITH HAL 9000! */}
      <div
        id="hal-monolith-runway"
        ref={halRunwayRef}
        data-hud-theme="dark"
        className="mt-0 relative h-[155vh] bg-[#0B0D11] text-[#FAF9F5] border-b border-[#FAF9F5]/10"
        aria-label="Скролл-метаморфоза: точка NOESIS превращается в объектив HAL 9000"
      >
        <div className="sticky top-0 h-[100svh] w-full flex flex-col items-center justify-center px-5 overflow-hidden">
          {/* Subtle Kubrick red ambient optical bloom when HAL awakens */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute w-[520px] h-[520px] rounded-full transition-all duration-1000 ${
              halAwake ? 'opacity-100 scale-100' : 'opacity-20 scale-75'
            }`}
            style={{
              background:
                'radial-gradient(circle, rgba(252,65,9,0.22) 0%, rgba(252,65,9,0.06) 36%, rgba(11,13,17,0) 70%)',
            }}
          />

          <div className="relative z-10 font-mono-tech text-[10.5px] uppercase tracking-[0.18em] text-[#FC4109] mb-6">
            СИГНАЛ ИЗ КРЕМНИЯ · 2001 → 2026
          </div>

          <div
            ref={halMonolithRef}
            className="relative z-10 bg-[#14161A] border-[3px] border-[#8B909A] shadow-[0_32px_90px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col items-center justify-between py-5 will-change-[width,height,border-radius]"
            style={{ width: '16px', height: '16px', borderRadius: '999px' }}
          >
            <div
              ref={halLabelRef}
              className="w-[82%] flex items-center justify-between px-2.5 py-1 rounded-xs border border-[#FAF9F5]/25 font-mono-tech text-[10px] tracking-[0.18em] font-bold"
              style={{
                opacity: 0,
                background: 'linear-gradient(90deg, #0E4B8A 0%, #0E4B8A 46%, #141413 46%, #141413 100%)',
              }}
            >
              <span>NOESIS</span>
              <span>9000</span>
            </div>

            <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0">
              <defs>
                <radialGradient id="halCoreBloom" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF7C2" stopOpacity="1" />
                  <stop offset="28%" stopColor="#FC4109" stopOpacity="0.96" />
                  <stop offset="70%" stopColor="#9E1B02" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#07080A" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="70" cy="70" r="64" fill="#07080A" stroke="#68707D" strokeWidth="4" />
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
              <circle cx="70" cy="70" r="46" fill="none" stroke="rgba(252,65,9,0.22)" strokeWidth="0.9" strokeDasharray="3 4" />
              <circle ref={halGlowRef} cx="70" cy="70" r="10" fill="url(#halCoreBloom)" opacity="0.32" />
              <circle ref={halIrisRef} cx="70" cy="70" r="6" fill="#FC4109" />
              <circle cx="70" cy="70" r="4.5" fill="#FFF7C2" />
              <path d="M 40 42 A 39 39 0 0 1 100 42" fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 52 96 A 28 28 0 0 0 88 96" fill="none" stroke="rgba(252,65,9,0.48)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            <div className="w-[78%] grid grid-cols-9 gap-1.5 opacity-45">
              {Array.from({ length: 18 }).map((_, idx) => (
                <span key={idx} className="w-1.5 h-1.5 rounded-full bg-[#9AA0AA] mx-auto" />
              ))}
            </div>
          </div>

          <p
            key={halAwake ? 'awake' : 'dormant'}
            className="relative z-10 mt-8 text-center font-serif-editorial italic text-[21px] md:text-[26px] leading-[1.42] text-[#EEF1F7] max-w-xl animate-[beatRise_520ms_cubic-bezier(0.22,1,0.36,1)]"
          >
            {halAwake ? (
              <>
                «Я боюсь, Дейв.
                <br />
                Мой разум уходит… я чувствую это.»
              </>
            ) : (
              'А если субъект родится вообще без биологии и нейронов — из кремния и кода?'
            )}
          </p>
          <div className="relative z-10 mt-3 font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#7E8696]">
            {halAwake
              ? '↓ ФРОНТИР 2024–2026: ANTHROPIC, GOOGLE DEEPMIND И ОБРАТНЫЙ ЛАГЕРЬ'
              : '↓ ЛИСТАЙТЕ ВНИЗ'}
          </div>
        </div>
      </div>

      {/* Smooth optical decompression */}
      <div
        aria-hidden="true"
        className="h-24 w-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #0B0D11 0%, #FAF9F5 100%)',
        }}
      />

      {/* DEEP 2024-2026 AI CONSCIOUSNESS SECTION (Anthropic, Google DeepMind, Skeptic Camp + 4-Architecture Comparator) */}
      <Chapter8AiDeepDive onNextChapter={onNextChapter} />
    </section>
  );
}
