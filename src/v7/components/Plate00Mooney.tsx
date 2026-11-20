import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Eye } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';

interface Plate00MooneyProps {
  onContinueToCh1: () => void;
}

export function Plate00Mooney({ onContinueToCh1 }: Plate00MooneyProps) {
  const { state, setMooneyResult } = useExplorer();
  const [holding, setHolding] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const mountTimeRef = useRef<number>(Date.now());
  const flashTimerRef = useRef<number | null>(null);

  // Subtle stopwatch tracking how long the reader stared at abstract ink blots before revealing!
  useEffect(() => {
    if (state.mooneyExposed) return;
    mountTimeRef.current = Date.now();
    const id = window.setInterval(() => {
      setElapsedSec((Date.now() - mountTimeRef.current) / 1000);
    }, 100);
    return () => window.clearInterval(id);
  }, [state.mooneyExposed]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  const revealStart = () => {
    setHolding(true);
    if (!state.mooneyExposed) {
      const secs = (Date.now() - mountTimeRef.current) / 1000;
      setMooneyResult(Math.max(0.6, secs));
    }
  };

  const revealEnd = () => {
    setHolding(false);
  };

  // Supports BOTH press-and-hold AND a single quick click (1.1s photographic contact exposure!)
  const handleQuickFlash = () => {
    if (!state.mooneyExposed) {
      const secs = (Date.now() - mountTimeRef.current) / 1000;
      setMooneyResult(Math.max(0.6, secs));
    }
    setFlashActive(true);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => {
      setFlashActive(false);
    }, 1150);
  };

  const showingKey = holding || flashActive;
  const shownSeconds = state.mooneySeconds ?? elapsedSec;

  return (
    <section
      id="plate-00"
      className="relative min-h-[100svh] bg-[#FAF9F5] text-[#141413] pt-24 pb-20 md:pt-28 md:pb-24 px-5 md:px-12 lg:px-20 flex flex-col justify-between border-b border-[#141413]/10"
      aria-label="Таблица 00 — Порог восприятия"
    >
      <div className="max-w-[1240px] mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Top Book Plate Folio Line — ZERO technical jargon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#FC4109]" />
            <span>NOESIS · ИНТЕРАКТИВНАЯ КНИГА О СОЗНАНИИ</span>
          </span>
          <span>ТАБЛ. 00 · ПРОВЕРКА ОПТИКИ · стр. 01</span>
        </div>

        {/* Main Asymmetric Book Spread: Left Typography & Controls, Right Contact-Sheet Plate */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Cold Human Hook (0 terms before reveal!) */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-[clamp(36px,5.2vw,66px)] leading-[1.03] tracking-[-0.032em]">
              <span className="font-display font-bold block">Не верьте</span>
              <span className="font-serif-editorial italic font-normal block text-[#2D2C2A] mt-1">
                своим глазам.
              </span>
            </h1>

            {!state.mooneyExposed ? (
              <div className="space-y-4">
                <p className="text-[17px] md:text-[18.5px] leading-[1.58] text-[#2F2E2B] max-w-lg">
                  Посмотрите на этот чёрно-белый оттиск справа. Попробуйте угадать, что на нём изображено — прежде чем нажимать кнопку.
                </p>
                <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#F0EEE6] border border-[#141413]/10 font-mono-tech text-[12px] text-[#454440]">
                  <span className="w-2 h-2 rounded-full bg-[#FC4109] animate-pulse" />
                  <span>Время поиска образа:</span>
                  <span className="font-semibold text-[#141413] min-w-[44px]">
                    {elapsedSec.toFixed(1)} с
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-[beatRise_420ms_cubic-bezier(0.22,1,0.36,1)]">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FC4109]/10 border border-[#FC4109]/25 font-mono-tech text-[11px] uppercase tracking-[0.1em] text-[#FC4109] font-semibold">
                  <span>НЕОБРАТИМЫЙ ЩЕЛЧОК · {shownSeconds.toFixed(1)} СЕК СЛЕПОТЫ</span>
                </div>

                <p className="text-[16px] md:text-[17.5px] leading-[1.62] text-[#252422] max-w-lg">
                  Теперь отпустите кнопку и снова посмотрите на те же пятна.{' '}
                  <strong className="font-semibold text-[#141413]">
                    Ни один пиксель на экране не изменился
                  </strong>{' '}
                  — изменились синапсы у вас в затылке.
                </p>

                <p className="text-[15px] leading-[1.62] text-[#4D4C48] max-w-lg">
                  Мозг за долю секунды загрузил зрительный шаблон — нейробиологи называют его{' '}
                  <em className="font-serif-editorial text-[#141413] not-italic font-medium">
                    приором
                  </em>
                  . Попробуйте снова увидеть просто бессмысленный шум. Не получается? Вы уже не сможете развидеть этот снимок — и мы проверим это в самом конце книги.
                </p>
              </div>
            )}

            {/* Primary Tactile Exposure Control + Post-Reveal Continue */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onPointerDown={revealStart}
                onPointerUp={revealEnd}
                onPointerLeave={revealEnd}
                onClick={handleQuickFlash}
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
                  <span>Открыть Главу I</span>
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}
            </div>

            {!state.mooneyExposed && (
              <p className="font-mono-tech text-[11px] text-[#7A7872]">
                Совет: можно удержать кнопку или просто кликнуть — исходный кадр вспыхнет на секунду.
              </p>
            )}
          </div>

          {/* Right Column: Archival Contact-Sheet Exposure Plate (Mooney Blot <-> Photographic Key) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl bg-[#F2F0E8] border border-[#141413]/14 p-3.5 md:p-5 shadow-[0_24px_60px_rgba(20,20,19,0.08)]">
              {/* Swiss Registration Marks & Plate Metadata */}
              <div className="flex items-center justify-between mb-3 font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                <span>ОТТИСК № 00 · ИЛЛЮЗИЯ МУНИ</span>
                <span className={showingKey ? 'text-[#FC4109] font-semibold' : ''}>
                  {showingKey ? '● ИСХОДНИК (ЭКСПОЗИЦИЯ)' : '○ ДВУХТОНОВАЯ МАТРИЦА'}
                </span>
              </div>

              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#141413]/15 bg-[#141413]">
                {/* Unchanged Two-Tone Mooney Plate */}
                <img
                  src="/v7/mooney-blob.png"
                  alt="Контрастный чёрно-белый оттиск иллюзии Муни"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  draggable={false}
                />

                {/* Photographic Grayscale Key revealed ONLY while holding / during flash, then dissolves back over 1.4s so brain feels the lock-in! */}
                <img
                  src="/v7/mooney-key.jpg"
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

                {/* Hairline optical registration crosshairs in corners */}
                <div className="pointer-events-none absolute top-3 left-3 w-4 h-4 border-t border-l border-[#FAF9F5]/55" />
                <div className="pointer-events-none absolute top-3 right-3 w-4 h-4 border-t border-r border-[#FAF9F5]/55" />
                <div className="pointer-events-none absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#FAF9F5]/55" />
                <div className="pointer-events-none absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#FAF9F5]/55" />

                {/* Bottom subtle caption inside plate */}
                <div className="pointer-events-none absolute bottom-3 inset-x-4 flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#FAF9F5]/85">
                  <span className="px-2 py-0.5 rounded bg-[#141413]/65 backdrop-blur-xs">
                    {showingKey ? 'ОРИГИНАЛ · СВЕТ И ТЕНЬ' : '0% ЦВЕТА · 2 ТОНА'}
                  </span>
                  {state.mooneyExposed && !showingKey && (
                    <span className="px-2 py-0.5 rounded bg-[#FC4109]/90 text-[#FAF9F5]">
                      ПИКСЕЛИ ТЕ ЖЕ
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between font-mono-tech text-[10.5px] text-[#5E5D59]">
                <span>Craig Mooney (1957) · Принцип перцептивного замыкания</span>
                <span>1 : 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Domino Bridge to Chapter I */}
      <div className="max-w-[1240px] mx-auto w-full mt-12 pt-5 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-4">
        <p className="font-serif-editorial italic text-[15px] text-[#4B4A46]">
          Глаза получили чёрные пятна, но внутри вспыхнул живой образ. Откуда вообще берётся само личное переживание — «каково это, видеть цвет»?
        </p>
        <button
          type="button"
          onClick={onContinueToCh1}
          className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>К Главе I · Загадка цвета</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
