import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, Eye } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { NoesisInstrumentFrame } from '../../v9/components/NoesisInstrumentFrame';
import { assetUrl } from '../../v9/utils/assetUrl';
import { ruTypo } from '../../v9/utils/ruTypo';

interface Plate00MooneyProps {
  onContinueToCh1: () => void;
}

const FLASH_DURATION_MS = 1600;
const SHORT_CLICK_THRESHOLD_MS = 320;

export function Plate00Mooney({ onContinueToCh1 }: Plate00MooneyProps) {
  const { state, setMooneyResult } = useExplorer();
  const [holding, setHolding] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const pointerDownAtRef = useRef<number>(0);
  const flashTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  const recordReveal = () => {
    if (!state.mooneyExposed) {
      setMooneyResult(1.0);
    }
  };

  const revealStart = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback for synthetic pointer events without active pointerId
    }
    pointerDownAtRef.current = performance.now();
    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    setFlashActive(false);
    setHolding(true);
    setScanCount((c) => c + 1);
  };

  const revealEnd = (e: PointerEvent<HTMLElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release errors
    }
    if (!holding) return;
    const heldMs = performance.now() - pointerDownAtRef.current;
    setHolding(false);

    if (heldMs < SHORT_CLICK_THRESHOLD_MS) {
      setFlashActive(true);
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
      }
      flashTimerRef.current = window.setTimeout(() => {
        setFlashActive(false);
        flashTimerRef.current = null;
        recordReveal();
      }, FLASH_DURATION_MS);
    } else {
      recordReveal();
    }
  };

  const revealCancel = (e: PointerEvent<HTMLElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release errors
    }
    setHolding(false);
  };

  const handleKeyboardActivate = () => {
    setScanCount((c) => c + 1);
    setFlashActive(true);
    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
    }
    flashTimerRef.current = window.setTimeout(() => {
      setFlashActive(false);
      flashTimerRef.current = null;
      recordReveal();
    }, FLASH_DURATION_MS);
  };

  const showingKey = holding || flashActive;

  return (
    <section
      id="plate-00"
      className="relative min-h-[100svh] bg-[#FAF9F5] text-[#141413] pt-16 pb-8 sm:pt-20 md:pt-22 md:pb-14 px-4 sm:px-5 md:px-12 lg:px-20 flex flex-col justify-between border-b border-[#141413]/10"
      aria-label="Таблица 00 — Порог восприятия"
    >
      <div className="max-w-[1240px] mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Top Book Plate Folio Line (hidden on tiny phones where HUD already displays Act I / IV) */}
        <div className="hidden sm:flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#FC4109]" />
            <span>NOESIS · АКТ I · ИНТЕРАКТИВНАЯ КНИГА О СОЗНАНИИ</span>
          </span>
          <span>КРЕЙГ МУНИ · 1957 · ПРОВЕРКА ОПТИКИ</span>
        </div>

        {/* Unified Single-DOM Grid:
            - Mobile (< lg): Headline + Intro -> Compact Tappable Mooney Plate -> "Проявить" button RIGHT BELOW PHOTO (all above the fold!)
            - Desktop (lg+): Asymmetric 2-column spread with 0.0px button shift (lg:min-h-[156px])! */}
        <div className="mt-2 sm:mt-7 md:mt-10 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] gap-4 sm:gap-6 lg:gap-x-14 lg:gap-y-6 items-start">
          {/* Block A: Static Hook & Editorial Intro */}
          <div className="lg:col-start-1 lg:col-span-6 lg:row-start-1 lg:pt-6 space-y-2.5 sm:space-y-4 lg:space-y-6">
            <h1 className="text-[32px] sm:text-[42px] lg:text-[clamp(44px,5.2vw,68px)] leading-[1.02] tracking-[-0.032em]">
              <span className="font-display font-bold block">Не верьте</span>
              <span className="font-serif-display italic font-normal block text-[#2D2C2A] mt-0.5 lg:mt-1">
                своим глазам.
              </span>
            </h1>

            <p className="text-[14.5px] sm:text-[16.5px] lg:text-[18.5px] leading-[1.48] lg:leading-[1.6] text-[#2F2E2B] max-w-lg">
              {ruTypo(
                'Посмотрите на этот чёрно-белый оттиск. Сейчас перед вами лишь случайные кляксы чернил. Но стоит на секунду увидеть исходный снимок — и ваш мозг уже никогда не сможет «развидеть» его обратно.',
              )}
            </p>
          </div>

          {/* Block B: Leica Contact-Sheet Exposure Plate (Compact & directly tappable on phone, full-size right col on desktop!) */}
          <div className="lg:col-start-7 lg:col-span-6 lg:row-start-1 lg:row-span-2 w-full max-w-[308px] sm:max-w-[380px] lg:max-w-none mx-auto">
            <NoesisInstrumentFrame
              code="ОТТИСК № 00"
              badge="self-test"
              telemetry={showingKey ? '● ИСХОДНИК' : '○ 2 ТОНА'}
              surface="vellum"
              footnote="Крейг Муни (1957) · Необратимое узнавание"
              footnoteRight={<span className="hidden sm:inline font-mono-tech text-[10.5px]">1 : 1</span>}
              bodyClassName="p-2.5 sm:p-4 lg:p-5"
            >
              <div
                role="button"
                tabIndex={0}
                aria-label="Нажмите на оттиск, чтобы проявить исходный снимок"
                onPointerDown={revealStart}
                onPointerUp={revealEnd}
                onPointerCancel={revealCancel}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleKeyboardActivate();
                  }
                }}
                className="noesis-spotlight-card relative aspect-square w-full overflow-hidden rounded-xl border border-[#141413]/16 bg-[#141413] cursor-pointer select-none touch-manipulation"
              >
                <img
                  src={assetUrl('/v7/mooney-blob.png')}
                  alt="Контрастный чёрно-белый оттиск иллюзии Муни"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  draggable={false}
                />

                <img
                  src={assetUrl('/v7/mooney-key.jpg')}
                  alt="Проявленный монохромный снимок кота"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  style={{
                    opacity: showingKey ? 1 : 0,
                    transform: showingKey ? 'scale(1)' : 'scale(1.015)',
                    transition: showingKey
                      ? 'opacity 240ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1)'
                      : 'opacity 1250ms cubic-bezier(0.22, 1, 0.36, 1), transform 1250ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  draggable={false}
                />

                {/* Leica optical scanline sweep on activation */}
                {scanCount > 0 && showingKey && (
                  <div
                    key={scanCount}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 h-[2px] bg-[#FC4109] shadow-[0_0_16px_3px_rgba(252,65,9,0.65)]"
                    style={{
                      animation: 'opticalScanSweep 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
                    }}
                  />
                )}

                <div className="pointer-events-none absolute top-2.5 left-2.5 sm:top-3 sm:left-3 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-l border-[#FAF9F5]/55" />
                <div className="pointer-events-none absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-r border-[#FAF9F5]/55" />
                <div className="pointer-events-none absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-l border-[#FAF9F5]/55" />
                <div className="pointer-events-none absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-r border-[#FAF9F5]/55" />

                <div className="pointer-events-none absolute bottom-2.5 sm:bottom-3 inset-x-3 sm:inset-x-4 flex items-center justify-between font-mono-tech text-[9.5px] sm:text-[10px] uppercase tracking-[0.1em] text-[#FAF9F5]/88">
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

          {/* Block C: Primary Tactile Exposure Control + Post-Reveal Insight (Zero empty void on mobile!) */}
          <div className="lg:col-start-1 lg:col-span-6 lg:row-start-2 space-y-3 lg:space-y-5">
            <div className="flex justify-center sm:justify-start">
              <button
                type="button"
                onPointerDown={revealStart}
                onPointerUp={revealEnd}
                onPointerCancel={revealCancel}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleKeyboardActivate();
                  }
                }}
                className={`v6-pill h-11 sm:h-12 w-full max-w-[308px] sm:w-auto sm:max-w-none px-6 rounded-full font-sans-ui text-[14px] font-medium inline-flex items-center justify-center gap-2.5 cursor-pointer select-none touch-none ${
                  showingKey
                    ? 'bg-[#FC4109] text-[#FAF9F5]'
                    : 'bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5]'
                }`}
              >
                <Eye className={`w-4 h-4 ${showingKey ? 'text-[#FAF9F5]' : 'text-[#FC4109]'}`} />
                <span>
                  {showingKey ? 'Проявка…' : 'Проявить'}
                </span>
              </button>
            </div>

            <div className="min-h-0 lg:min-h-[156px]">
              {!state.mooneyExposed ? (
                <p className="font-mono-tech text-[10.5px] sm:text-[11px] leading-[1.55] text-[#6B6963] max-w-md text-center sm:text-left mx-auto sm:mx-0">
                  Нажмите на кнопку или сам снимок (удержится на 1.6 с) — затем снова посмотрите на те же пятна.
                </p>
              ) : (
                <div className="rounded-2xl border border-[#141413]/12 bg-[#F3F1E9] p-4 sm:p-5 space-y-3.5 animate-[beatRise_380ms_cubic-bezier(0.22,1,0.36,1)]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FC4109]/10 border border-[#FC4109]/25 font-mono-tech text-[10px] sm:text-[10.5px] uppercase tracking-[0.11em] text-[#C83407] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FC4109]" />
                    <span>НЕОБРАТИМЫЙ ЩЕЛЧОК · ПИКСЕЛИ ТЕ ЖЕ</span>
                  </div>

                  <p className="text-[14.5px] sm:text-[15.5px] leading-[1.58] text-[#252422]">
                    <strong className="font-semibold text-[#141413]">
                      Ни один пиксель на экране не изменился
                    </strong>{' '}
                    {ruTypo(
                      '— но ваше переживание картинки переключилось навсегда. За долю секунды мозг сшил шум в живого кота. Попробуйте снова увидеть просто хаос — не выйдет. Именно с этого внутреннего зрителя и начинается книга.',
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={onContinueToCh1}
                    className="v6-pill h-11 px-5 rounded-full bg-[#FC4109] hover:bg-[#E43906] text-[#FAF9F5] font-sans-ui text-[13.5px] font-medium inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Начать книгу · Глава 1</span>
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Domino Bridge to Chapter 01 */}
      <div className="max-w-[1240px] mx-auto w-full mt-8 lg:mt-12 pt-4 lg:pt-5 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-3">
        <p className="font-serif-editorial italic text-[15px] text-[#4B4A46]">
          {ruTypo(
            'Экран не изменился — изменилось само ваше переживание картинки. Откуда вообще берётся этот «внутренний свет»?',
          )}
        </p>
        <button
          type="button"
          onClick={onContinueToCh1}
          className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>К Главе 01 · Что такое сознание?</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
