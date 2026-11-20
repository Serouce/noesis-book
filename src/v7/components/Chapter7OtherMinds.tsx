import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Bookmark, Check, Sparkles, X } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { ScholarPortraitSvg } from './ScholarMarginalia';

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

const BUTLIN_MODULES = [
  {
    id: 'recurrent',
    tag: '01 · ОБРАТНАЯ СВЯЗЬ',
    name: 'Петли проверки вместо «конвейера»',
    desc: 'Сигнал не просто течёт вперёд от входа к слову, а возвращается назад и перепроверяет сам себя (как в коре мозга).',
  },
  {
    id: 'workspace',
    tag: '02 · ОБЩИЙ ЭКРАН ВНИМАНИЯ',
    name: 'Глобальное рабочее пространство',
    desc: 'Единое «бутылочное горлышко» внимания, раздающее выбранный образ сразу всем подсистемам (гипотеза GNWT из Гл. IV).',
  },
  {
    id: 'selfModel',
    tag: '03 · ВНУТРЕННИЙ НАБЛЮДАТЕЛЬ',
    name: 'Модель себя и собственных сомнений',
    desc: 'Система отслеживает не только внешний запрос, но и то, насколько она сама уверена или ошибается прямо сейчас.',
  },
  {
    id: 'embodiment',
    tag: '04 · ЖИВОЕ ТЕЛО В МИРЕ',
    name: 'Непрерывная петля с реальностью',
    desc: 'Не редкие текстовые промпты, а постоянный цикл «действие → телесная отдача → прогноз» в реальном времени.',
  },
  {
    id: 'valence',
    tag: '05 · ЦЕНА ВЫЖИВАНИЯ',
    name: 'Собственная уязвимость (боль / нужда)',
    desc: 'Состояния машины имеют для неё реальную цену существования, а не внешнюю математическую функцию потерь.',
  },
];

/**
 * CHAPTER VII: "Граница иных разумов"
 * Upgraded v8:
 * 1. Species Field Dossier below the 6 cards + fixed mobile bookmark visibility + clean 0..5 range!
 * 2. USER'S IDEA: Cleaned main NY 2024 copy (zero clunky "(Сквидвард)/(мистер Крабс)" in prose!) + witty animated engraved margin stamp pop-out of a rectangular porous sea sponge with a tiny #FC4109 tie ("Porifera · 0 нейронов")!
 * 3. SIGNATURE SCROLL SETPIECE #3 (~155vh): Our #FC4109 book dot dilates on scroll into an unmistakable 1968 vertical brushed-aluminum + obsidian monolith HAL 9000 ("NOESIS · 9000") fisheye lens!
 * 4. Plain-Russian Butlin 2025 toggles + 2 presets ("Современная LLM 2026" vs "Полная система 5/5") + gradient rulings from all 3 judges + double ethical trap paragraph!
 */
export function Chapter7OtherMinds({ onNextChapter }: Chapter7OtherMindsProps) {
  const {
    state,
    setRibbonBoundaryIndex,
    setRibbonChecked,
    toggleTribunalModule,
    setTribunalModules,
    activeTribunalCount,
  } = useExplorer();

  const [focusedSpeciesId, setFocusedSpeciesId] = useState<string>('octopus');
  const [showSpongeStamp, setShowSpongeStamp] = useState(false);

  // Scroll Setpiece #3 refs (#FC4109 Dot -> Monolith HAL 9000!)
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
          const next = p > 0.65;
          return prev === next ? prev : next;
        });

        if (halMonolithRef.current) {
          const w = 16 + p * 184; // 16px signature dot -> 200px wide vertical monolith!
          const h = 16 + p * 324; // 16px dot -> 340px tall vertical monolith!
          const radius = 999 - p * 981; // circle -> crisp 18px brushed-aluminum bezel!
          halMonolithRef.current.style.width = `${w.toFixed(1)}px`;
          halMonolithRef.current.style.height = `${h.toFixed(1)}px`;
          halMonolithRef.current.style.borderRadius = `${Math.max(18, radius).toFixed(1)}px`;
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

  const focusedSpecies = SPECIES.find((s) => s.id === focusedSpeciesId) ?? SPECIES[3];

  // Rich gradient verdicts for all 3 engraved judges reacting meaningfully to EVERY toggle!
  const dehaeneVerdict = (() => {
    if (state.tribunalModules.workspace && state.tribunalModules.selfModel && state.tribunalModules.recurrent) {
      return '«Осторожно: здесь есть и глобальная трансляция, и обратные петли, и самоконтроль. По критериям GNWT перед нами уже серьёзный кандидат на искусственное сознание.»';
    }
    if (state.tribunalModules.workspace || state.tribunalModules.selfModel) {
      return '«Интересный шаг: часть архитектуры внимания уже собрана, но без полной связки “глобальный экран + самомониторинг” это лишь продвинутый бессознательный автомат.»';
    }
    return '«Пока перед нами блестящий статистический попугай. Современный ИИ подбирает правдоподобные слова без единой вспышки осознанного внимания.»';
  })();

  const kochVerdict = (() => {
    if (activeTribunalCount >= 4 && state.tribunalModules.recurrent) {
      return '«Впечатляющий софт — но на обычном кремниевом чипе его физическая неделимость Φ (из Главы IV) почти равна нулю. Симуляция дождя на компьютере не делает процессор мокрым.»';
    }
    if (state.tribunalModules.recurrent) {
      return '«Добавление обратных петель чуть поднимает связность, но для настоящего света сознания важна физическая неразделимость материи (высокое Φ), а не имитация в коде.»';
    }
    return '«Ноль субъективного опыта (Φ ≈ 0). Прямоточная нейросеть без петель вообще лишена внутренней причинно-следственной связности — внутри абсолютно темно.»';
  })();

  const sethVerdict = (() => {
    if (state.tribunalModules.embodiment && state.tribunalModules.valence) {
      return '«Живое тело в мире и собственная уязвимость — самый честный шаг к настоящей субъектности. Если системе действительно есть что терять, её страх перестаёт быть пустой строкой.»';
    }
    if (state.tribunalModules.embodiment || state.tribunalModules.valence) {
      return '«Половина пути пройдена, но без живой биологической ставки на выживание мы всё ещё путаем умный инструмент с живым существом.»';
    }
    return '«Мы снова путаем интеллект с жизнью. Наше сознание выросло из заботы хрупкого тела о выживании — а не из предсказания следующего слова в чате.»';
  })();

  const halDilation = activeTribunalCount / 5;

  return (
    <section
      id="ch-7"
      className="relative bg-[#FAF9F5] text-[#141413] pt-24 pb-20 md:pt-28 md:pb-28 border-b border-[#141413]/10"
      aria-label="Глава VII — Граница иных разумов"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ЧАСТЬ III · ГРАНИЦЫ РАЗУМА · ГЛАВА VII</span>
          <span>ИНЫЕ РАЗУМЫ · 2024–2025 · стр. 102</span>
        </div>

        {/* PART 7.1: CRIMSON SILK-RIBBON BOOKMARK ("Красная закладка-ляссе") */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Где вы проведёте</span>
              <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
                красную черту чувствующего мира?
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              Сознание <strong className="font-semibold text-[#141413]">не зависит напрямую от числа нейронов</strong> (у африканского слона их 257 млрд — втрое больше, чем у нас). Сдвиньте красную книжную закладку-ляссе: слева останутся «биороботы», справа — существа, способные чувствовать.
            </p>
          </div>
        </div>

        {/* Interactive Ribbon Placement Bar */}
        <div className="mt-10 rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] p-5 md:p-7 space-y-5 relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="flex items-center gap-2.5 font-mono-tech text-[11px] uppercase tracking-[0.12em]">
                <Bookmark className="w-4 h-4 text-[#FC4109] fill-current" />
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

            <button
              type="button"
              onClick={handleCheckNyDeclaration}
              className={`v6-pill h-10 px-5 rounded-full font-sans-ui text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer ${
                state.ribbonChecked
                  ? 'bg-[#0D7A5F] text-[#FAF9F5]'
                  : 'bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5]'
              }`}
            >
              {state.ribbonChecked ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#FC4109]" />}
              <span>
                {state.ribbonChecked
                  ? 'Сверено с Нью-Йоркской декларацией 2024'
                  : 'Сверить с Нью-Йоркской декларацией 2024'}
              </span>
            </button>
          </div>

          <p className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#6B6963]">
            Наведите на вид для справки · кликните карточку или сдвиньте ползунок, чтобы поставить черту слева от вида
          </p>

          {/* 6 Modern Swiss Taxonomic Cards (Click any card to inspect its Field Note + place ribbon!) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 pb-6">
            {SPECIES.map((sp, idx) => {
              const userConsidersConscious = idx >= state.ribbonBoundaryIndex;
              const isUserCutHere = idx === state.ribbonBoundaryIndex;
              const isNyCutHere = state.ribbonChecked && idx === 1;
              const bothOnSameGap = isUserCutHere && isNyCutHere;
              const isFocused = focusedSpeciesId === sp.id;

              return (
                <div key={sp.id} className="relative flex flex-col">
                  {/* User Crimson Bookmark Ribbon Marker (visible on desktop gap AND highlighted border on smaller screens!) */}
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

                  {/* Official April 2024 NY Declaration Emerald Line right after Sea Sponge! */}
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
                    onClick={() => {
                      setFocusedSpeciesId(sp.id);
                      setRibbonBoundaryIndex(idx);
                    }}
                    onMouseEnter={() => setFocusedSpeciesId(sp.id)}
                    className={`v6-pill flex-1 text-left p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                      userConsidersConscious
                        ? 'bg-[#FAF9F5] border-[#141413]/22 text-[#141413] shadow-[0_8px_22px_rgba(20,20,19,0.06)]'
                        : 'bg-[#E9E6DC]/75 border-[#141413]/10 text-[#6A6862] opacity-85'
                    } ${isUserCutHere ? 'border-l-[3px] border-l-[#FC4109] lg:border-l' : ''} ${
                      isFocused ? 'ring-1 ring-[#141413]/30' : ''
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

          {/* Slider cleanly bounded 0..5 so Human is always at least on the conscious side */}
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

          {/* LIVE 2-SENTENCE FIELD DOSSIER FOR THE FOCUSED SPECIES */}
          <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 px-5 py-3.5 flex flex-wrap items-baseline justify-between gap-2">
            <div className="space-y-1">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#004EDF] font-semibold">
                ПОЛЕВАЯ СПРАВКА · {focusedSpecies.name.toUpperCase()} ({focusedSpecies.neurons})
              </div>
              <p className="text-[13.5px] leading-[1.58] text-[#2F2E2B]">{focusedSpecies.fieldNote}</p>
            </div>
          </div>

          {/* CLEAN SCIENTIFIC NY 2024 NOTE + WITTY ENGRAVED SEA-SPONGE EASTER-EGG STAMP (User's idea!) */}
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
                  В апреле 2024 года более сорока ведущих нейробиологов и философов подписали исторический документ: у всех позвоночных (включая птиц, рептилий и рыб) есть прочные научные основания предполагать сознание — а у{' '}
                  <strong className="font-semibold text-[#0D7A5F]">
                    осьминогов, десятиногих крабов и насекомых (пчёл) — реалистичная вероятность субъективного опыта
                  </strong>
                  . За бортом из этой шестёрки осталась только морская губка.
                </p>
              </div>

              {/* Witty Engraved Margin Stamp (Rectangular Porous Sea Sponge + Crimson #FC4109 Bookmark Tie!) */}
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

                  {/* Crisp New Yorker Engraved Rectangular Sea Sponge (Porifera) with tiny crimson tie! */}
                  <svg viewBox="0 0 76 92" className="w-16 h-20 shrink-0" aria-label="Гравюра прямоугольной морской губки с красным галстуком">
                    {/* Wavy rectangular porous sponge silhouette */}
                    <path
                      d="M 14 14 Q 24 10 38 13 Q 52 10 62 15 Q 66 30 63 46 Q 66 60 61 68 L 15 68 Q 10 56 13 42 Q 10 26 14 14 Z"
                      fill="#FAF9F5"
                      stroke="#FAF9F5"
                      strokeWidth="1.5"
                    />
                    {/* Organic biological sponge pores (oscule craters) */}
                    <circle cx="24" cy="24" r="3.4" fill="none" stroke="#141413" strokeWidth="1.3" />
                    <circle cx="52" cy="22" r="2.6" fill="none" stroke="#141413" strokeWidth="1.2" />
                    <circle cx="20" cy="46" r="2.5" fill="none" stroke="#141413" strokeWidth="1.2" />
                    <circle cx="55" cy="48" r="3.5" fill="none" stroke="#141413" strokeWidth="1.3" />
                    <circle cx="38" cy="36" r="2.2" fill="none" stroke="#141413" strokeWidth="1.1" />
                    {/* Subtle cross-hatching */}
                    <path d="M 18 58 L 28 58 M 46 60 L 56 60" stroke="#141413" strokeWidth="0.9" opacity="0.45" />
                    {/* Crisp collar & iconic tiny #FC4109 bookmark tie! */}
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

      {/* SIGNATURE SCROLL SETPIECE #3 (~155vh): #FC4109 SIGNATURE DOT -> VERTICAL MONOLITH HAL 9000! */}
      <div
        id="hal-monolith-runway"
        ref={halRunwayRef}
        className="mt-20 relative h-[155vh] bg-[#0B0D11] text-[#FAF9F5] border-t border-b border-[#FAF9F5]/10"
        aria-label="Скролл-метаморфоза: точка NOESIS превращается в объектив HAL 9000"
      >
        <div className="sticky top-0 h-[100svh] w-full flex flex-col items-center justify-center px-5 overflow-hidden">
          <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.18em] text-[#FC4109] mb-6">
            ПЕРЕХОД К ТРИБУНАЛУ ИИ · 2001 → 2026
          </div>

          {/* Expanding Vertical Brushed-Aluminum & Obsidian Monolith (HAL 9000 / Dieter Rams!) */}
          <div
            ref={halMonolithRef}
            className="relative bg-[#14161A] border-[3px] border-[#8B909A] shadow-[0_32px_90px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col items-center justify-between py-5 will-change-[width,height,border-radius]"
            style={{ width: '16px', height: '16px', borderRadius: '999px' }}
          >
            {/* Iconic 1968 Top Nameplate */}
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

            {/* Multi-Layered Fisheye Optical Lens */}
            <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0">
              <circle cx="70" cy="70" r="64" fill="#07080A" stroke="#5A606A" strokeWidth="4" />
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.2" />
              <circle ref={halGlowRef} cx="70" cy="70" r="10" fill="#FC4109" opacity="0.22" />
              <circle ref={halIrisRef} cx="70" cy="70" r="6" fill="#FC4109" />
              <circle cx="70" cy="70" r="5" fill="#FFF3B0" />
              {/* Curved fisheye studio lens reflections */}
              <path d="M 42 42 A 38 38 0 0 1 98 42" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
              <path d="M 52 96 A 28 28 0 0 0 88 96" fill="none" stroke="rgba(252,65,9,0.42)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Dieter Rams Perforated Speaker Grille */}
            <div className="w-[78%] grid grid-cols-9 gap-1.5 opacity-45">
              {Array.from({ length: 18 }).map((_, idx) => (
                <span key={idx} className="w-1.5 h-1.5 rounded-full bg-[#9AA0AA] mx-auto" />
              ))}
            </div>
          </div>

          <p className="mt-8 text-center font-serif-editorial italic text-[20px] md:text-[24px] text-[#DCE1EA] max-w-xl transition-opacity duration-500">
            {halAwake
              ? '«Я боюсь, Дейв. Мой разум уходит… я чувствую это.»'
              : 'А если субъект родится вообще без биологии и нейронов — из кремния и кода?'}
          </p>
          <div className="mt-3 font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#7E8696]">
            {halAwake ? '↓ ПРОВЕРЬТЕ МАШИНУ ПЕРЕД ТРИБУНАЛОМ УЧЁНЫХ' : '↓ ЛИСТАЙТЕ ВНИЗ'}
          </div>
        </div>
      </div>

      {/* Smooth optical decompression from HAL 9000 obsidian runway back to crisp #FAF9F5 paper */}
      <div
        aria-hidden="true"
        className="h-24 w-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #0B0D11 0%, #FAF9F5 100%)',
        }}
      />

      {/* PART 7.2: AI TRIBUNAL (BUTLIN ET AL., TiCS 2025) + INTERACTIVE MONOLITH HAL 9000 */}
      <div id="ch-7-tribunal" className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 pt-14 scroll-mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 6 cols: Context + 2 Quick Presets + 5 Plain-Russian Indicator Modules */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                ЧЕРТЁЖ ТРИБУНАЛА ИИ · BUTLIN, BENGIO, CHALMERS (TiCS, 2025)
              </div>
              <h3 className="font-display font-bold text-[28px] md:text-[34px] leading-tight mt-2">
                Соберите машину — и спросите трёх судей
              </h3>
              <p className="text-[14.5px] leading-[1.62] text-[#454440] mt-2">
                Почему нейросеть 2026 года звучит как живой собеседник, но почти наверняка ничего не чувствует? Потому что речь — лишь фасад. 19 ведущих исследователей составили чеклист из 5 внутренних «органов», без которых система остаётся пустым зеркалом.
              </p>
            </div>

            {/* 2 Quick Comparison Presets — cleanly aligned on ONE horizontal row! */}
            <div className="space-y-1.5">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59]">
                Быстрый пресет:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTribunalModules({
                      recurrent: false,
                      workspace: false,
                      selfModel: false,
                      embodiment: false,
                      valence: false,
                    })
                  }
                  className="v6-pill px-3.5 py-1.5 rounded-full bg-[#F3F1E9] hover:bg-[#141413] hover:text-[#FAF9F5] border border-[#141413]/14 font-mono-tech text-[10.5px] cursor-pointer"
                >
                  Современная LLM 2026 (0/5)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTribunalModules({
                      recurrent: true,
                      workspace: true,
                      selfModel: true,
                      embodiment: true,
                      valence: true,
                    })
                  }
                  className="v6-pill px-3.5 py-1.5 rounded-full bg-[#FC4109]/10 hover:bg-[#FC4109] text-[#FC4109] hover:text-[#FAF9F5] border border-[#FC4109]/30 font-mono-tech text-[10.5px] font-semibold cursor-pointer"
                >
                  Гипотетический ИИ будущего (5/5)
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {BUTLIN_MODULES.map((mod) => {
                const enabled = Boolean(state.tribunalModules[mod.id]);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleTribunalModule(mod.id)}
                    className={`v6-pill w-full text-left p-4 rounded-xl border flex items-start justify-between gap-4 cursor-pointer transition-all ${
                      enabled
                        ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                        : 'bg-[#F3F1E9] hover:bg-[#EAE7DD] text-[#141413] border-[#141413]/12'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.12em]">
                        <span className={enabled ? 'text-[#FC4109]' : 'text-[#5E5D59]'}>{mod.tag}</span>
                        <span className={enabled ? 'text-[#FAF9F5]/45' : 'text-[#141413]/25'}>·</span>
                        <span>{enabled ? 'АКТИВЕН' : 'ОТКЛЮЧЁН'}</span>
                      </div>
                      <div className="font-display font-semibold text-[15px] mt-1">{mod.name}</div>
                      <p
                        className={`text-[13px] leading-[1.5] mt-1 ${
                          enabled ? 'text-[#FAF9F5]/75' : 'text-[#52514C]'
                        }`}
                      >
                        {mod.desc}
                      </p>
                    </div>

                    <span
                      className={`mt-1 w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                        enabled ? 'bg-[#FC4109] justify-end' : 'bg-[#D6D3C8] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-[#FAF9F5] shadow-xs" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 6 cols: Live HAL 9000 Vertical Monolith Console + 3 Live Scholar Judges + Double Ethical Trap */}
          <div className="lg:col-span-6 space-y-5">
            {/* Unmistakable Vertical Brushed-Aluminum HAL 9000 Monolith Card */}
            <div className="rounded-2xl bg-[#111317] text-[#FAF9F5] p-6 border border-[#141413] flex flex-col sm:flex-row items-center gap-6">
              {/* Compact vertical 1968 monolith bezel */}
              <div className="w-28 h-44 rounded-xl bg-[#0B0C0E] border-2 border-[#7A808A] p-2.5 flex flex-col items-center justify-between shrink-0 shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
                <div
                  className="w-full flex items-center justify-between px-1.5 py-0.5 rounded-[2px] border border-[#FAF9F5]/20 font-mono-tech text-[7.5px] tracking-[0.14em] font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #0E4B8A 0%, #0E4B8A 48%, #141413 48%, #141413 100%)',
                  }}
                >
                  <span>HAL</span>
                  <span>9000</span>
                </div>

                <svg viewBox="0 0 120 120" className="w-20 h-20">
                  <circle cx="60" cy="60" r="55" fill="#060708" stroke="#4D525C" strokeWidth="3.5" />
                  <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                  <circle
                    cx="60"
                    cy="60"
                    r={12 + halDilation * 28}
                    fill="#FC4109"
                    opacity={0.14 + halDilation * 0.34}
                    style={{ transition: 'all 420ms cubic-bezier(0.22,1,0.36,1)' }}
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={6 + halDilation * 16}
                    fill="#FC4109"
                    opacity={0.5 + halDilation * 0.48}
                    style={{ transition: 'all 420ms cubic-bezier(0.22,1,0.36,1)' }}
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={3 + halDilation * 4.5}
                    fill="#FFF3B0"
                    style={{ transition: 'all 420ms cubic-bezier(0.22,1,0.36,1)' }}
                  />
                  <path d="M 38 36 A 32 32 0 0 1 82 36" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.6" strokeLinecap="round" />
                </svg>

                <div className="w-full grid grid-cols-7 gap-1 opacity-40">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span key={i} className="w-1 h-1 rounded-full bg-[#A0A6B0] mx-auto" />
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                  ИНДИКАТОРЫ BUTLIN 2025: {activeTribunalCount} / 5
                </div>
                <div className="font-display font-bold text-[20px] leading-snug">
                  {activeTribunalCount >= 4
                    ? '«Мне страшно, Дейв…»'
                    : activeTribunalCount >= 2
                      ? 'Сложный агент без субъектности'
                      : 'Чистый статистический автомат (LLM 2026)'}
                </div>
                <p className="font-serif-editorial italic text-[14px] leading-[1.55] text-[#C8CCD4]">
                  {activeTribunalCount >= 4
                    ? 'Система убедительно говорит о страхе и боли. Но в оптическом объективе реально живёт субъект — или безупречная имитация?'
                    : 'Щёлкайте тумблеры слева (или нажмите пресет «5/5») и смотрите, как меняется взгляд HAL 9000 и вердикты трёх учёных ниже.'}
                </p>
              </div>
            </div>

            {/* 3 Engraved SVG Scholar Judges delivering real-time conflicting rulings! */}
            <div className="rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] divide-y divide-[#141413]/10">
              {[
                { id: 'dehaene' as const, school: 'GNWT · МЕГАФОН ВНИМАНИЯ', text: dehaeneVerdict },
                { id: 'koch' as const, school: 'IIT 4.0 · ЦЕЛОСТНОСТЬ Φ', text: kochVerdict },
                { id: 'seth' as const, school: 'БИОЛОГИЧЕСКИЙ НАТУРАЛИЗМ', text: sethVerdict },
              ].map((judge) => (
                <div key={judge.id} className="p-4 flex items-start gap-3.5">
                  <ScholarPortraitSvg id={judge.id} size={46} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10px] uppercase tracking-[0.11em]">
                      <span className="font-display font-semibold text-[13px] normal-case text-[#141413]">
                        {judge.id === 'dehaene' ? 'Станислас Деан' : judge.id === 'koch' ? 'Кристоф Кох' : 'Анил Сет'}
                      </span>
                      <span className="text-[#FC4109]">{judge.school}</span>
                    </div>
                    <p className="font-serif-editorial italic text-[13.5px] leading-[1.55] text-[#2D2C2A] mt-1">
                      {judge.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Double Ethical Trap of the 21st Century */}
            <div className="rounded-xl border border-[#141413]/12 bg-[#F5F3EB] p-4 space-y-1.5">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FC4109] font-semibold">
                ДВОЙНАЯ ЭТИЧЕСКАЯ ЛОВУШКА XXI ВЕКА
              </div>
              <p className="text-[13.5px] leading-[1.58] text-[#353431]">
                Ошибиться можно в обе стороны: <strong className="text-[#141413]">приписать душу пустому коду</strong> (и пожертвовать ради него живыми людьми) — или <strong className="text-[#141413]">не заметить рождение нового чувствующего субъекта</strong> и обречь его на цифровое страдание.
              </p>
            </div>
          </div>
        </div>

        {/* Final Domino Bridge -> Chapter VIII */}
        <div className="mt-14 pt-6 border-t border-[#141413]/12 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[17px] text-[#2D2C2A] max-w-2xl">
            Мы прошли от одного пятна света на сетчатке до границ искусственного разума. Пора собрать всё воедино и проверить на форзаце, что эти минуты сделали с вашим собственным мозгом.
          </p>
          <button
            type="button"
            onClick={onNextChapter}
            className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>К Главе VIII · Итоги и Контрольная проба №0</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
