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

  const revealStart = (e: PointerEvent<HTMLButtonElement>) => {
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

  const revealEnd = (e: PointerEvent<HTMLButtonElement>) => {
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

  const revealCancel = (e: PointerEvent<HTMLButtonElement>) => {
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
      className="relative min-h-[100svh] bg-[#FAF9F5] text-[#141413] pt-20 pb-10 md:pt-22 md:pb-14 px-5 md:px-12 lg:px-20 flex flex-col justify-between border-b border-[#141413]/10"
      aria-label="Таблица 00 — Порог восприятия"
    >
      <div className="max-w-[1240px] mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Top Book Plate Folio Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#FC4109]" />
            <span>NOESIS · АКТ I · ИНТЕРАКТИВНАЯ КНИГА О СОЗНАНИИ</span>
          </span>
          <span>ТАБЛ. 00 · ПРОВЕРКА ОПТИКИ · стр. 01</span>
        </div>

        {/* Main Asymmetric Book Spread — items-start guarantees 0.0px button shift before/during/after click! */}
        <div className="mt-7 md:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Static Hook + Unmoving Primary Control + Post-Reveal Below */}
          <div className="lg:col-span-6 lg:pt-6 space-y-6">
            <h1 className="text-[clamp(38px,5.4vw,68px)] leading-[1.02] tracking-[-0.032em]">
              <span className="font-display font-bold block">Не верьте</span>
              <span className="font-serif-display italic font-normal block text-[#2D2C2A] mt-1">
                своим глазам.
              </span>
            </h1>

            <p className="text-[17px] md:text-[18.5px] leading-[1.6] text-[#2F2E2B] max-w-lg">
              {ruTypo(
                'Посмотрите на этот чёрно-белый оттиск справа. Сейчас перед вами лишь случайные кляксы чернил. Но стоит на секунду увидеть исходный снимок — и ваш мозг уже никогда не сможет «развидеть» его обратно.',
              )}
            </p>

            {/* Primary Tactile Exposure Control — position NEVER shifts before/during/after click */}
            <div className="pt-1 flex flex-wrap items-center gap-3.5">
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
                className={`v6-pill h-12 px-6 rounded-full font-sans-ui text-[14px] font-medium inline-flex items-center gap-2.5 cursor-pointer select-none touch-none ${
                  showingKey
                    ? 'bg-[#FC4109] text-[#FAF9F5]'
                    : 'bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5]'
                }`}
              >
                <Eye className={`w-4 h-4 ${showingKey ? 'text-[#FAF9F5]' : 'text-[#FC4109]'}`} />
                <span>
                  {showingKey
                    ? 'Проявка исходного снимка…'
                    : state.mooneyExposed
                      ? 'Проявить ещё раз'
                      : 'Зажми или нажми — проявить снимок'}
                </span>
              </button>
            </div>

            {/* Post-Reveal Editorial Insight (STRICTLY below the button so button coordinates stay 100% locked!) */}
            <div className="min-h-[156px]">
              {!state.mooneyExposed ? (
                <p className="font-mono-tech text-[11px] leading-[1.6] text-[#7A7872] max-w-md pt-1">
                  Нажмите один раз (снимок удержится на 1.6 с) или зажмите кнопку — затем отпустите и снова посмотрите на те же пятна.
                </p>
              ) : (
                <div className="rounded-2xl border border-[#141413]/12 bg-[#F3F1E9] p-5 space-y-4 animate-[beatRise_380ms_cubic-bezier(0.22,1,0.36,1)]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FC4109]/10 border border-[#FC4109]/25 font-mono-tech text-[10.5px] uppercase tracking-[0.11em] text-[#C83407] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FC4109]" />
                    <span>НЕОБРАТИМЫЙ ЩЕЛЧОК · ПИКСЕЛИ ТЕ ЖЕ</span>
                  </div>

                  <p className="text-[15.5px] leading-[1.62] text-[#252422]">
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

          {/* Right Column: Leica Contact-Sheet Exposure Plate */}
          <div className="lg:col-span-6">
            <NoesisInstrumentFrame
              code="ОТТИСК № 00 · ИЛЛЮЗИЯ МУНИ"
              badge="self-test"
              telemetry={showingKey ? '● ИСХОДНИК' : '○ 2 ТОНА'}
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

      {/* Domino Bridge to Chapter 01 */}
      <div className="max-w-[1240px] mx-auto w-full mt-12 pt-5 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-4">
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
