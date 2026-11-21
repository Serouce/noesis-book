import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Eye } from 'lucide-react';
import { useExplorer, type MooneyGuess } from '../context/ExplorerContext';
import { NoesisInstrumentFrame } from '../../v9/components/NoesisInstrumentFrame';
import { assetUrl } from '../../v9/utils/assetUrl';
import { ruTypo } from '../../v9/utils/ruTypo';

interface Plate00MooneyProps {
  onContinueToCh1: () => void;
}

const GUESS_OPTIONS: Array<{ id: Exclude<MooneyGuess, null>; label: string }> = [
  { id: 'blobs', label: 'Только пятна чернил' },
  { id: 'face_or_animal', label: 'Кажется, лицо или зверь' },
  { id: 'object', label: 'Кажется, предмет' },
];

export function Plate00Mooney({ onContinueToCh1 }: Plate00MooneyProps) {
  const { state, setMooneyGuess, setMooneyResult } = useExplorer();
  const [holding, setHolding] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const plateWrapRef = useRef<HTMLDivElement | null>(null);
  const visibleAccumMsRef = useRef<number>(0);
  const lastTickMsRef = useRef<number | null>(null);
  const pointerDownAtRef = useRef<number>(0);
  const flashTimerRef = useRef<number | null>(null);

  // Bug #1 Fix: Stopwatch ticks ONLY while the Mooney plate is actually visible in the viewport AND tab is active!
  useEffect(() => {
    if (state.mooneyExposed) return;
    const el = plateWrapRef.current;
    if (!el) return;

    let isInView = false;
    let isTabVisible = document.visibilityState === 'visible';
    let intervalId: number | null = null;

    const startClock = () => {
      if (intervalId !== null) return;
      lastTickMsRef.current = performance.now();
      intervalId = window.setInterval(() => {
        if (!isInView || !isTabVisible) return;
        const now = performance.now();
        if (lastTickMsRef.current !== null) {
          visibleAccumMsRef.current += Math.min(300, now - lastTickMsRef.current);
          setElapsedSec(visibleAccumMsRef.current / 1000);
        }
        lastTickMsRef.current = now;
      }, 100);
    };

    const stopClock = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      lastTickMsRef.current = null;
    };

    const syncClock = () => {
      if (isInView && isTabVisible) startClock();
      else stopClock();
    };

    const io = new IntersectionObserver(
      (entries) => {
        isInView = Boolean(entries[0]?.isIntersecting);
        syncClock();
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    const onVisibility = () => {
      isTabVisible = document.visibilityState === 'visible';
      syncClock();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopClock();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [state.mooneyExposed]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  const recordReveal = () => {
    if (!state.mooneyExposed) {
      const secs = Math.max(0.6, visibleAccumMsRef.current / 1000);
      setMooneyResult(secs);
    }
  };

  const revealStart = () => {
    pointerDownAtRef.current = Date.now();
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    setFlashActive(false);
    setHolding(true);
    recordReveal();
  };

  const revealEnd = () => {
    if (!holding) return;
    const heldMs = Date.now() - pointerDownAtRef.current;
    setHolding(false);
    if (heldMs < 260) {
      setFlashActive(true);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = window.setTimeout(() => {
        setFlashActive(false);
      }, 1050);
    }
  };

  const revealCancel = () => {
    setHolding(false);
  };

  const handleKeyboardActivate = () => {
    recordReveal();
    setFlashActive(true);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => {
      setFlashActive(false);
    }, 1050);
  };

  const showingKey = holding || flashActive;
  const shownSeconds = state.mooneySeconds ?? elapsedSec;

  const guessFeedback = (() => {
    if (state.mooneyGuess === 'blobs') {
      return 'Секунду назад вы честно отметили «только пятна чернил» — и мозг действительно не видел ничего, пока не получил ключ.';
    }
    if (state.mooneyGuess === 'face_or_animal') {
      return 'Хорошая догадка! Даже если силуэт мелькал на грани, после проявки образ «щёлкает» в замок и больше не рассыпается.';
    }
    if (state.mooneyGuess === 'object') {
      return 'Вы ждали неодушевлённый предмет — но стоило мозгу увидеть живую фигуру, старая гипотеза исчезла без следа.';
    }
    return null;
  })();

  return (
    <section
      id="plate-00"
      className="relative min-h-[100svh] bg-[#FAF9F5] text-[#141413] pt-24 pb-16 md:pt-28 md:pb-24 px-5 md:px-12 lg:px-20 flex flex-col justify-between border-b border-[#141413]/10"
      aria-label="Таблица 00 — Порог восприятия"
    >
      <div className="max-w-[1240px] mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Top Book Plate Folio Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#FC4109]" />
            <span>NOESIS · АКТ I · ИНТЕРАКТИВНЫЙ АТЛАС СОЗНАНИЯ</span>
          </span>
          <span>ТАБЛ. 00 · ПРОВЕРКА ОПТИКИ · стр. 01</span>
        </div>

        {/* Main Asymmetric Book Spread */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Cold Human Hook */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-[clamp(36px,5.2vw,66px)] leading-[1.03] tracking-[-0.032em]">
              <span className="font-display font-bold block">Не верьте</span>
              <span className="font-serif-display italic font-normal block text-[#2D2C2A] mt-1">
                своим глазам.
              </span>
            </h1>

            {!state.mooneyExposed ? (
              <div className="space-y-4">
                <p className="text-[17px] md:text-[18.5px] leading-[1.58] text-[#2F2E2B] max-w-lg">
                  {ruTypo(
                    'Посмотрите на этот чёрно-белый оттиск справа. Зафиксируйте свою первую догадку — и только потом проявляйте снимок.',
                  )}
                </p>

                {/* Pre-reveal honest intuition chip */}
                <div className="space-y-2">
                  <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                    Шаг 1 · Что вы видите прямо сейчас?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {GUESS_OPTIONS.map((opt) => {
                      const active = state.mooneyGuess === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setMooneyGuess(opt.id)}
                          className={`v6-pill px-3.5 py-2 rounded-full border text-[12.5px] font-medium cursor-pointer ${
                            active
                              ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                              : 'bg-[#F3F1E9] hover:bg-[#EAE7DD] text-[#141413] border-[#141413]/14'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#F0EEE6] border border-[#141413]/10 font-mono-tech text-[12px] text-[#454440]">
                  <span className="w-2 h-2 rounded-full bg-[#FC4109] animate-pulse" />
                  <span>Время взгляда на пластину:</span>
                  <span className="font-semibold text-[#141413] min-w-[44px]">
                    {elapsedSec.toFixed(1)} с
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-[beatRise_420ms_cubic-bezier(0.22,1,0.36,1)]">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FC4109]/10 border border-[#FC4109]/25 font-mono-tech text-[11px] uppercase tracking-[0.1em] text-[#C83407] font-semibold">
                  <span>НЕОБРАТИМЫЙ ЩЕЛЧОК · {shownSeconds.toFixed(1)} СЕК ПОИСКА</span>
                </div>

                {guessFeedback && (
                  <p className="text-[14.5px] leading-[1.58] text-[#004EDF] bg-[#004EDF]/6 border-l-2 border-[#004EDF] pl-3.5 pr-4 py-2.5 rounded-r-lg max-w-lg">
                    {ruTypo(guessFeedback)}
                  </p>
                )}

                <p className="text-[16px] md:text-[17.5px] leading-[1.62] text-[#252422] max-w-lg">
                  Теперь отпустите кнопку и снова посмотрите на те же пятна.{' '}
                  <strong className="font-semibold text-[#141413]">
                    Ни один пиксель на экране не изменился
                  </strong>{' '}
                  — но ваше переживание этого снимка изменилось навсегда.
                </p>

                <p className="text-[15px] leading-[1.62] text-[#4D4C48] max-w-lg">
                  {ruTypo(
                    'Вы только что поймали собственный мозг за работой: за долю секунды он склеил бессмысленный шум в живой образ. Попробуйте снова «развидеть» его — не получится. Мы вернёмся к этой проверке на последней странице книги.',
                  )}
                </p>
              </div>
            )}

            {/* Primary Tactile Exposure Control */}
            <div className="pt-1 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onPointerDown={revealStart}
                onPointerUp={revealEnd}
                onPointerLeave={revealCancel}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleKeyboardActivate();
                  }
                }}
                className="v6-pill h-12 px-6 rounded-full bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5] font-sans-ui text-[14px] font-medium inline-flex items-center gap-2.5 shadow-[0_12px_30px_rgba(20,20,19,0.16)] cursor-pointer select-none"
              >
                <Eye className="w-4 h-4 text-[#FC4109]" />
                <span>
                  {showingKey
                    ? 'Проявка исходного снимка…'
                    : state.mooneyExposed
                      ? 'Проявить ещё раз'
                      : 'Зажми — проявить снимок'}
                </span>
              </button>

              {state.mooneyExposed && (
                <button
                  type="button"
                  onClick={onContinueToCh1}
                  className="v6-pill h-12 px-6 rounded-full bg-[#FC4109] hover:bg-[#E43906] text-[#FAF9F5] font-sans-ui text-[14px] font-medium inline-flex items-center gap-2 cursor-pointer animate-[fadeScaleIn_350ms_ease]"
                >
                  <span>Что только что произошло?</span>
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}
            </div>

            {!state.mooneyExposed && (
              <p className="font-mono-tech text-[11px] text-[#7A7872]">
                Совет: удержите кнопку или коротко кликните — исходный кадр вспыхнет на секунду.
              </p>
            )}
          </div>

          {/* Right Column: Leica Contact-Sheet Exposure Plate */}
          <div className="lg:col-span-6" ref={plateWrapRef}>
            <NoesisInstrumentFrame
              code="ОТТИСК № 00 · ИЛЛЮЗИЯ МУНИ"
              badge="self-test"
              telemetry={showingKey ? '● ИСХОДНИК (ЭКСПОЗИЦИЯ)' : '○ ДВУХТОНОВАЯ МАТРИЦА'}
              surface="vellum"
              footnote="Крейг Муни (1957) · Необратимое узнавание"
              footnoteRight={<span className="font-mono-tech text-[10.5px]">1 : 1</span>}
              bodyClassName="p-4 sm:p-5"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#141413]/16 bg-[#141413]">
                <img
                  src={assetUrl('/v7/mooney-blob.png')}
                  alt="Контрастный чёрно-белый оттиск иллюзии Муни"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  draggable={false}
                />

                <img
                  src={assetUrl('/v7/mooney-key.jpg')}
                  alt="Проявленный монохромный снимок"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  style={{
                    opacity: showingKey ? 1 : 0,
                    transition: showingKey
                      ? 'opacity 220ms cubic-bezier(0.22, 1, 0.36, 1)'
                      : 'opacity 1450ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  draggable={false}
                />

                <div className="pointer-events-none absolute top-3 left-3 w-4 h-4 border-t border-l border-[#FAF9F5]/55" />
                <div className="pointer-events-none absolute top-3 right-3 w-4 h-4 border-t border-r border-[#FAF9F5]/55" />
                <div className="pointer-events-none absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#FAF9F5]/55" />
                <div className="pointer-events-none absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#FAF9F5]/55" />

                <div className="pointer-events-none absolute bottom-3 inset-x-4 flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#FAF9F5]/88">
                  <span className="px-2 py-0.5 rounded bg-[#141413]/72 backdrop-blur-xs">
                    {showingKey ? 'ОРИГИНАЛ · СВЕТ И ТЕНЬ' : '0% ЦВЕТА · 2 ТОНА'}
                  </span>
                  {state.mooneyExposed && !showingKey && (
                    <span className="px-2 py-0.5 rounded bg-[#FC4109]/92 text-[#FAF9F5] font-semibold">
                      ПИКСЕЛИ ТЕ ЖЕ
                    </span>
                  )}
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>
      </div>

      {/* Domino Bridge to Prologue */}
      <div className="max-w-[1240px] mx-auto w-full mt-12 pt-5 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-4">
        <p className="font-serif-editorial italic text-[15px] text-[#4B4A46]">
          {ruTypo(
            'Экран не изменился — изменилось само ваше ощущение картинки. С этого и начинается главная загадка науки: что вообще такое сознание?',
          )}
        </p>
        <button
          type="button"
          onClick={onContinueToCh1}
          className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>К Прологу · Что такое сознание?</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
