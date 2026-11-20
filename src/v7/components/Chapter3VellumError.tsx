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
      className="relative bg-[#FAF9F5] text-[#141413] pt-24 pb-20 md:pt-28 md:pb-28 border-b border-[#141413]/10"
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
            <div className="relative my-6 min-h-[310px] md:min-h-[340px] rounded-xl bg-[#FAF9F5] border border-[#141413]/14 overflow-hidden flex items-center justify-center px-6 py-10 md:px-9">
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

              {/* Center Hand Illustration (Swiss Engraved Risograph Plate) */}
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-20">
                <div className="relative w-44 h-44 md:mr-2 flex items-center justify-center shrink-0">
                  {/* Base Engraved Lithograph Hand */}
                  <svg
                    viewBox="0 0 180 180"
                    className="w-full h-full"
                    aria-label={isError ? 'Три средних пальца вверх' : 'Большой, указательный и средний пальцы вверх'}
                  >
                    {/* Fine printmaker registration crosshairs */}
                    <path d="M 12 14 L 22 14 M 17 9 L 17 19" stroke="#004EDF" strokeWidth="1" opacity="0.45" />
                    <path d="M 158 164 L 168 164 M 163 159 L 163 169" stroke="#004EDF" strokeWidth="1" opacity="0.45" />

                    {/* Wrist cuff & fine engraving hatch */}
                    <path
                      d="M 67 148 L 65 167 M 115 147 L 118 167 M 65 160 Q 91 164 117 160"
                      fill="none"
                      stroke="#141413"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 74 162 L 73 167 M 82 163 L 82 168 M 91 163 L 91 168 M 100 163 L 101 168 M 108 162 L 109 167"
                      stroke="#141413"
                      strokeWidth="0.85"
                      opacity="0.45"
                    />

                    {/* Anatomical Palm Silhouette + Lifeline & Engraving Shading */}
                    <path
                      d="M 59 102 C 55 124, 62 146, 68 150 C 82 156, 102 156, 115 148 C 127 139, 132 121, 131 99"
                      fill="#FAF9F5"
                      stroke="#141413"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Palmar creases & subtle cross-hatching */}
                    <path
                      d="M 69 116 C 78 122, 83 134, 82 146 M 73 108 C 88 106, 104 109, 119 116"
                      fill="none"
                      stroke="#141413"
                      strokeWidth="1.05"
                      strokeLinecap="round"
                      opacity="0.52"
                    />
                    <path
                      d="M 116 126 L 124 121 M 114 133 L 124 128 M 111 140 L 121 135 M 106 146 L 116 141"
                      stroke="#141413"
                      strokeWidth="0.85"
                      opacity="0.38"
                    />

                    {!isError ? (
                      /* GERMAN 3 (Continental): Engraved Thumb + Index + Middle */
                      <g strokeLinecap="round" strokeLinejoin="round">
                        {/* Cobalt risograph ink wash under raised fingers */}
                        <path
                          d="M 60 116 C 47 104, 34 89, 24 75 C 20 68, 28 60, 35 66 C 46 75, 56 86, 64 96 L 63 32 C 63 23, 76 23, 76 32 L 77 90 L 81 24 C 82 15, 96 15, 96 24 L 94 92 L 60 116 Z"
                          fill="rgba(0,78,223,0.12)"
                        />
                        {/* Extended Thumb */}
                        <path
                          d="M 60 120 C 48 108, 34 91, 24 76 C 20 69, 28 61, 35 67 C 45 75, 55 86, 63 97"
                          fill="none"
                          stroke="#004EDF"
                          strokeWidth="2.0"
                        />
                        <path d="M 35 80 L 42 75 M 27 72 Q 30 68 34 71" stroke="#004EDF" strokeWidth="1" opacity="0.7" />
                        {/* Extended Index Finger */}
                        <path
                          d="M 64 96 L 63 33 C 63 24, 76 24, 76 33 L 77 92"
                          fill="none"
                          stroke="#004EDF"
                          strokeWidth="2.0"
                        />
                        <path d="M 66 51 L 73 51 M 66 69 L 74 69 M 67 31 Q 70 28 73 31" stroke="#004EDF" strokeWidth="0.95" opacity="0.65" />
                        {/* Extended Middle Finger */}
                        <path
                          d="M 80 92 L 82 24 C 83 15, 96 15, 96 24 L 94 93"
                          fill="none"
                          stroke="#004EDF"
                          strokeWidth="2.0"
                        />
                        <path d="M 85 45 L 92 45 M 84 65 L 92 65 M 86 22 Q 89 19 92 22" stroke="#004EDF" strokeWidth="0.95" opacity="0.65" />
                        {/* Curled Ring & Pinky Fingers (engraved dark ink) */}
                        <path
                          d="M 96 92 C 97 82, 111 82, 112 92 L 111 106 C 110 112, 98 112, 97 106 Z"
                          fill="#FAF9F5"
                          stroke="#141413"
                          strokeWidth="1.7"
                        />
                        <path
                          d="M 113 96 C 114 87, 127 87, 128 96 L 127 108 C 126 114, 115 114, 114 108 Z"
                          fill="#FAF9F5"
                          stroke="#141413"
                          strokeWidth="1.7"
                        />
                        <path d="M 101 97 L 107 97 M 117 100 L 123 100" stroke="#141413" strokeWidth="0.9" opacity="0.55" />
                      </g>
                    ) : (
                      /* BRITISH 3 ("Drei Gläser"): Index + Middle + Ring (Thumb tucked over curled pinky!) */
                      <g strokeLinecap="round" strokeLinejoin="round">
                        {/* Crimson risograph ink wash under raised 3 middle fingers */}
                        <path
                          d="M 62 94 L 60 32 C 60 23, 73 23, 73 32 L 75 91 L 79 23 C 80 14, 93 14, 93 23 L 92 91 L 97 31 C 99 22, 112 24, 111 33 L 107 94 Z"
                          fill="rgba(252,65,9,0.13)"
                        />
                        {/* Index */}
                        <path
                          d="M 62 95 L 60 33 C 60 24, 73 24, 73 33 L 75 92"
                          fill="none"
                          stroke="#FC4109"
                          strokeWidth="2.1"
                        />
                        <path d="M 63 51 L 70 51 M 64 69 L 71 69 M 64 31 Q 67 28 70 31" stroke="#FC4109" strokeWidth="0.95" opacity="0.65" />
                        {/* Middle */}
                        <path
                          d="M 79 92 L 80 23 C 81 14, 94 14, 94 23 L 93 92"
                          fill="none"
                          stroke="#FC4109"
                          strokeWidth="2.1"
                        />
                        <path d="M 83 45 L 90 45 M 83 65 L 90 65 M 84 21 Q 87 18 90 21" stroke="#FC4109" strokeWidth="0.95" opacity="0.65" />
                        {/* Ring (THE FATAL GIVEAWAY!) */}
                        <path
                          d="M 96 93 L 99 33 C 101 24, 114 26, 113 35 L 109 95"
                          fill="none"
                          stroke="#FC4109"
                          strokeWidth="2.1"
                        />
                        <path d="M 101 52 L 109 53 M 100 70 L 108 71 M 104 32 Q 107 29 110 33" stroke="#FC4109" strokeWidth="0.95" opacity="0.65" />
                        {/* Curled Pinky */}
                        <path
                          d="M 113 96 C 115 88, 128 89, 128 98 L 126 111 C 125 117, 114 116, 113 110 Z"
                          fill="#FAF9F5"
                          stroke="#141413"
                          strokeWidth="1.7"
                        />
                        {/* Tucked Thumb folded diagonally across palm */}
                        <path
                          d="M 59 116 C 68 103, 91 98, 113 105 C 120 107, 118 118, 109 118 C 94 117, 77 120, 65 130"
                          fill="#FAF9F5"
                          stroke="#141413"
                          strokeWidth="1.85"
                        />
                        <path d="M 85 106 L 87 115 M 106 108 Q 112 109 112 114" stroke="#141413" strokeWidth="0.95" opacity="0.58" />
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
