import { useState } from 'react';
import { AlertTriangle, ArrowDown, CheckCircle2, RotateCcw } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { ScholarMarginNote } from './ScholarMarginalia';

interface Chapter3VellumErrorProps {
  onNextChapter: () => void;
}

type GestureMode = 'german' | 'british';

/**
 * ORIGINAL BOOK MECHANISM #4: "Сдвиг ризограф-кальки / Оверпринт" (Risograph Overprint Registration Shift).
 * 100% original Swiss graphic printmaking metaphor replacing the removed gears!
 * Illustrates Predictive Processing & Prediction Error via "Drei Gläser" (3 fingers).
 */
export function Chapter3VellumError({ onNextChapter }: Chapter3VellumErrorProps) {
  const { setVellumTriggered } = useExplorer();
  const [gesture, setGesture] = useState<GestureMode>('german');
  const [reprinted, setReprinted] = useState(false);
  const [priorWeight, setPriorWeight] = useState(72); // 0 = raw chaos, 72 = healthy balance, 100 = hallucination

  const triggerError = () => {
    setGesture('british');
    setReprinted(false);
    setVellumTriggered(true);
    window.setTimeout(() => {
      setReprinted(true);
    }, 950);
  };

  const resetMatch = () => {
    setGesture('german');
    setReprinted(false);
  };

  const isError = gesture === 'british';
  // Physical risograph registration shear offset in px during Prediction Error!
  const shearX = isError ? (reprinted ? 0 : 28) : 0;
  const shearY = isError ? (reprinted ? 0 : -12) : 0;
  const shearRot = isError ? (reprinted ? 0 : -2.2) : 0;

  const balanceLabel =
    priorWeight > 84
      ? 'Перекос в прогнозы — галлюцинация (мозг игнорирует глаза)'
      : priorWeight < 28
        ? 'Отключены прогнозы — сенсорный шторм (мир распадается на шум)'
        : 'Здоровый баланс — управляемая галлюцинация (прогноз + поправка мира)';

  return (
    <section
      id="ch-3"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Глава III — Управляемая галлюцинация"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ЧАСТЬ I · ИЗНУТРИ · ГЛАВА III</span>
          <span>УПРАВЛЯЕМАЯ ГАЛЛЮЦИНАЦИЯ · стр. 36</span>
        </div>

        {/* Opening Editorial Prose */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Мозг не фотографирует мир —</span>
              <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
                он галлюцинирует его и правит ошибки.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-3 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              Череп абсолютно темен и глух. Всё, что вы видите прямо сейчас, — это{' '}
              <strong className="font-semibold text-[#141413]">прогноз сверху вниз</strong>, который кора непрерывно сверяет с потоком от сетчатки. Когда мир совпадает с ожиданием, мозг вообще не тратит силы на детали.
            </p>
            <p className="text-[#4F4E4A]">
              Но стоит появиться крошечной детали, ломающей 99%-ный прогноз — как в подвальном баре «Бесславных ублюдков» на фразе{' '}
              <span className="font-serif-editorial italic text-[#141413]">«Drei Gläser»</span>, — верхний слой модели мгновенно срывает.
            </p>
          </div>
        </div>

        {/* ORIGINAL MECHANIC: SWISS RISOGRAPH OVERPRINT / VELLUM REGISTRATION STAGE */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 8 cols: Interactive Two-Layer Overprint Sheet */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] p-5 md:p-7">
            {/* Gesture Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/10">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={resetMatch}
                  className={`v6-pill h-10 px-4 rounded-full text-[13px] font-medium border inline-flex items-center gap-2 cursor-pointer ${
                    !isError
                      ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                      : 'bg-[#FAF9F5] text-[#141413] border-[#141413]/15 hover:bg-[#EAE7DD]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0D7A5F]" />
                  <span>Жест A: Большой + 2 пальца</span>
                </button>

                <button
                  type="button"
                  onClick={triggerError}
                  className={`v6-pill h-10 px-4 rounded-full text-[13px] font-medium border inline-flex items-center gap-2 cursor-pointer ${
                    isError
                      ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109] shadow-[0_10px_28px_rgba(252,65,9,0.28)]'
                      : 'bg-[#FAF9F5] text-[#141413] border-[#141413]/15 hover:border-[#FC4109]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Жест B: Три средних пальца («Drei Gläser»)</span>
                </button>
              </div>

              {isError && (
                <button
                  type="button"
                  onClick={resetMatch}
                  className="font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#5E5D59] hover:text-[#141413] inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сброс</span>
                </button>
              )}
            </div>

            {/* Dual-Layer Swiss Printmaking Canvas (Bottom Raw Input + Top Translucent Vellum Prior) */}
            <div className="relative my-6 min-h-[310px] md:min-h-[340px] rounded-xl bg-[#FAF9F5] border border-[#141413]/14 overflow-hidden flex items-center justify-center p-6">
              {/* Layer 1 (Base Lithograph): Raw Sensory Signal from Retina */}
              <div className="absolute inset-4 border border-[#141413]/12 rounded-lg p-4 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59]">
                  <span>⊕ СЛОЙ 01 · СЫРОЙ СИГНАЛ СЕТЧАТКИ</span>
                  <span>ЗАКАЗ: 3 БОКАЛА</span>
                </div>
                <div className="flex justify-between font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59]">
                  <span>⊕ АКЦЕНТ: 98% НОРМА · ФОРМА: 100%</span>
                  <span>
                    ЖЕСТ: {isError ? 'АНОМАЛИЯ (БРИТАНСКИЙ)' : 'НОРМА (КОНТИНЕНТАЛЬНЫЙ)'}
                  </span>
                </div>
              </div>

              {/* Center Hand Illustration (Base Layer in Klein Cobalt / Graphite) */}
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  {/* Base Raw Ink Print (Cobalt #004EDF) */}
                  <svg
                    viewBox="0 0 180 180"
                    className="w-full h-full"
                    aria-label={isError ? 'Три средних пальца вверх' : 'Большой, указательный и средний пальцы вверх'}
                  >
                    {/* Registration crosshairs */}
                    <path d="M 16 16 L 26 16 M 21 11 L 21 21" stroke="#004EDF" strokeWidth="1" opacity="0.5" />
                    <path d="M 154 164 L 164 164 M 159 159 L 159 169" stroke="#004EDF" strokeWidth="1" opacity="0.5" />

                    {/* Palm contour */}
                    <path
                      d="M 58 102 C 56 128, 66 150, 92 150 C 118 150, 128 130, 128 102 L 128 84 C 128 76, 118 76, 116 84"
                      fill="none"
                      stroke="#141413"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />

                    {!isError ? (
                      /* GERMAN 3: Thumb + Index + Middle */
                      <g stroke="#004EDF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="rgba(0,78,223,0.08)">
                        {/* Extended Thumb */}
                        <path d="M 58 106 L 34 78 C 30 72, 37 64, 44 70 L 64 90" />
                        {/* Extended Index */}
                        <path d="M 66 94 L 66 36 C 66 28, 78 28, 78 36 L 78 92" />
                        {/* Extended Middle */}
                        <path d="M 82 92 L 85 28 C 86 20, 98 20, 98 28 L 96 92" />
                        {/* Curled Ring & Pinky */}
                        <rect x="98" y="84" width="13" height="22" rx="6" fill="#FAF9F5" stroke="#141413" strokeWidth="2" />
                        <rect x="112" y="88" width="13" height="19" rx="6" fill="#FAF9F5" stroke="#141413" strokeWidth="2" />
                      </g>
                    ) : (
                      /* BRITISH 3: Index + Middle + Ring (Thumb tucked!) */
                      <g stroke="#FC4109" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="rgba(252,65,9,0.10)">
                        {/* Index */}
                        <path d="M 65 94 L 63 36 C 63 28, 75 28, 75 36 L 77 92" />
                        {/* Middle */}
                        <path d="M 81 92 L 84 26 C 85 18, 97 18, 97 26 L 95 92" />
                        {/* Ring (THE FATAL GIVEAWAY!) */}
                        <path d="M 99 92 L 106 38 C 107 30, 119 32, 118 40 L 112 94" />
                        {/* Tucked Thumb & Pinky */}
                        <path d="M 58 106 C 68 98, 92 98, 102 108" fill="none" stroke="#141413" strokeWidth="2.2" />
                        <rect x="114" y="88" width="13" height="19" rx="6" fill="#FAF9F5" stroke="#141413" strokeWidth="2" />
                      </g>
                    )}
                  </svg>

                  {/* LAYER 2 (FLOATING TRANSLUCENT VELLUM OVERPRINT SHEET — Physically Shears on Error!) */}
                  <div
                    className="pointer-events-none absolute -inset-3 rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      transform: `translate3d(${shearX}px, ${shearY}px, 0) rotate(${shearRot}deg)`,
                      borderColor: isError ? '#FC4109' : 'rgba(0, 78, 223, 0.35)',
                      backgroundColor: isError
                        ? 'rgba(252, 65, 9, 0.06)'
                        : 'rgba(250, 249, 245, 0.22)',
                      backdropFilter: 'blur(1px)',
                      boxShadow: isError
                        ? '0 14px 36px rgba(252, 65, 9, 0.16)'
                        : '0 4px 16px rgba(20, 20, 19, 0.04)',
                    }}
                  >
                    {/* Corner printmaker registration ticks */}
                    <span className="absolute -top-2 -left-2 font-mono-tech text-[11px] text-[#FC4109]">
                      ⊕
                    </span>
                    <span className="absolute -bottom-2 -right-2 font-mono-tech text-[11px] text-[#FC4109]">
                      ⊕
                    </span>
                  </div>
                </div>

                {/* Live Model Interpretation Card */}
                <div className="max-w-xs space-y-2.5 text-center md:text-left">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-tech text-[10px] uppercase tracking-[0.12em] font-semibold ${
                      isError
                        ? 'bg-[#FC4109] text-[#FAF9F5]'
                        : 'bg-[#0D7A5F]/12 text-[#0D7A5F]'
                    }`}
                  >
                    {!isError
                      ? 'Δ = 0.0 PX · ПРИВОДКА СОВПАЛА'
                      : reprinted
                        ? 'МОДЕЛЬ ПЕРЕПЕЧАТАНА ЗА 0.2 СЕК'
                        : 'Δ = +28 PX · СРЫВ КАЛЬКИ (ERROR!)'}
                  </div>

                  <div className="font-display font-bold text-[22px] leading-tight text-[#141413]">
                    {!isError
                      ? '«Свой офицер за столиком»'
                      : reprinted
                        ? '«Передо мной чужак!»'
                        : '«СТОП — ЧТО С ПАЛЬЦАМИ?!»'}
                  </div>

                  <p className="text-[13.5px] leading-[1.55] text-[#4A4945]">
                    {!isError
                      ? '99%-ный прогноз мозга идеально лёг поверх картинки. Ошибка предсказания близка к нулю — сигнал гасится в зародыше.'
                      : 'Единственная деталь в 3 градуса угла зрения пробивает 99%-ный прогноз насквозь. Вся картина реальности переписывается за 200 миллисекунд.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Prior vs Sensory Balance Slider */}
            <div className="pt-4 border-t border-[#141413]/10 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[11px]">
                <span className="uppercase tracking-[0.1em] text-[#5E5D59]">
                  Вес внутренних прогнозов (Приор): <strong className="text-[#141413]">{priorWeight}%</strong>
                </span>
                <span className="text-[#FC4109] font-medium">{balanceLabel}</span>
              </div>
              <input
                type="range"
                min={5}
                max={98}
                value={priorWeight}
                onChange={(e) => setPriorWeight(Number(e.target.value))}
                className="w-full accent-[#FC4109] cursor-pointer"
                aria-label="Баланс прогноза мозга и сенсорного сигнала"
              />
              <div className="flex justify-between font-mono-tech text-[10px] text-[#7A7872]">
                <span>0% · Сырой хаос сетчатки</span>
                <span>70% · Обычное зрение</span>
                <span>100% · Сон / Галлюцинация</span>
              </div>
            </div>
          </div>

          {/* Right 4 cols: Anil Seth Marginalia + Scientifically Clean Domino Bridge */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            <ScholarMarginNote
              scholar="seth"
              tag="BEING YOU · 2021"
              quote="Мы не воспринимаем мир таким, каков он есть. Мы воспринимаем лучший прогноз нашего мозга — просто в состоянии бодрствования эта галлюцинация держится на коротком поводке органов чувств."
            />

            <div className="rounded-2xl border border-[#141413]/12 bg-[#F5F3EB] p-5 space-y-3">
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.13em] text-[#FC4109]">
                МОСТИК К ЧАСТИ II
              </div>
              <p className="font-serif-editorial italic text-[16px] leading-[1.55] text-[#282725]">
                Мы поняли, <strong>ЧТО</strong> делает сознание: непрерывно строит и правит управляемую модель мира. Теперь главный вопрос биологии: <strong>ГДЕ</strong> именно в полутора килограммах живой ткани зажигается сам опыт?
              </p>
              <button
                type="button"
                onClick={onNextChapter}
                className="pt-1 font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>К Части II · Вскрытие</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
