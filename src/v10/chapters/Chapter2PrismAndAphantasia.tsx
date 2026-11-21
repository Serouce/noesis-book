import { useState } from 'react';
import { OpticalPrismCanvas, type PrismMode } from '../webgl/OpticalPrismCanvas';
import { Act2AphantasiaLab } from '../../v9/chapters/Act2AphantasiaLab';
import { ruTypo } from '../../v9/utils/ruTypo';

/**
 * ACT II · PART 2.2: Live Optical Prism (Impossible Magenta) + Clean 5-Second Aphantasia Test
 */
export function Chapter2PrismAndAphantasia() {
  const [prismMode, setPrismMode] = useState<PrismMode>('magenta');
  const [mixPct, setMixPct] = useState(82);

  const nmApprox = Math.round(425 + (mixPct / 100) * 255);

  return (
    <div className="bg-[#FAF9F5] text-[#141413]">
      {/* LIVE OPTICAL GLASS PRISM SPREAD */}
      <section
        id="ch-prism"
        className="py-20 md:py-28 border-b border-[#141413]/10"
        aria-label="Живая оптическая призма и невозможный пурпурный"
      >
        <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
            <span className="text-[#FC4109] font-semibold">ГЛАВА 02 · ОПТИЧЕСКАЯ ПРИЗМА · НЕВОЗМОЖНЫЙ ЦВЕТ</span>
            <span>ДИСПЕРСИЯ И ПУРПУР · стр. 26</span>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <h3 className="text-[clamp(28px,3.8vw,46px)] leading-[1.06] tracking-[-0.03em]">
                <span className="font-display font-bold block">Пурпурного цвета</span>
                <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                  не существует в физике.
                </span>
              </h3>

              <p className="text-[15.5px] leading-[1.68] text-[#2F2E2B]">
                {ruTypo(
                  'Радуга — это прямая линия от коротких синих волн (440 нм) к длинным красным (660 нм). Вы никогда не найдёте в ней пурпурного (magenta). Когда на сетчатку одновременно попадают красный и синий свет, мозг отказывается усреднять их в зелёный — и буквально ',
                )}
                <strong className="font-semibold text-[#141413]">
                  изобретает несуществующий цвет, чтобы замкнуть спектр в кольцо.
                </strong>
              </p>

              {/* Crisp Swiss Segmented Mode Switcher (equal width) */}
              <div className="inline-grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#EEECE4] border border-[#141413]/10 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setPrismMode('magenta');
                    setMixPct(82);
                  }}
                  className={`v6-pill px-3.5 py-2 rounded-xl text-[12px] font-medium cursor-pointer text-center ${
                    prismMode === 'magenta'
                      ? 'bg-[#141413] text-[#FAF9F5]'
                      : 'text-[#353431] hover:bg-[#E4E1D6]'
                  }`}
                >
                  660 + 440 нм → Пурпур
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrismMode('spectrum');
                    setMixPct(62);
                  }}
                  className={`v6-pill px-3.5 py-2 rounded-xl text-[12px] font-medium cursor-pointer text-center ${
                    prismMode === 'spectrum'
                      ? 'bg-[#141413] text-[#FAF9F5]'
                      : 'text-[#353431] hover:bg-[#E4E1D6]'
                  }`}
                >
                  Белый луч → Спектр
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-[#141413]/18 shadow-[0_24px_64px_rgba(11,13,17,0.18)] bg-[#0B0D12]">
                <OpticalPrismCanvas mode={prismMode} mix={mixPct / 100} className="w-full h-[320px] sm:h-[370px]" />
                <div className="pointer-events-none absolute top-3.5 left-4 right-4 flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.13em] text-[#C8D0DC]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FC4109]" />
                    <span>
                      {prismMode === 'magenta'
                        ? 'СВЕДЕНИЕ 660 НМ (L) + 440 НМ (S)'
                        : `ФОКУС СПЕКТРА · ~${nmApprox} НМ`}
                    </span>
                  </span>
                  <span className="text-[#FAF9F5]/72">ОПТИЧЕСКАЯ ДИСПЕРСИЯ</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#F3F1E9] border border-[#141413]/12 px-4 py-3 flex flex-wrap items-center gap-4">
                <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#141413] font-semibold shrink-0">
                  {prismMode === 'magenta' ? `Сведение лучей: ${mixPct}%` : `Фокус спектра: ~${nmApprox} нм`}
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={mixPct}
                  onChange={(e) => setMixPct(Number(e.target.value))}
                  className="flex-1 min-w-[160px] accent-[#FC4109] cursor-pointer"
                  aria-label="Управление стеклянной оптической призмой"
                />
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59]">
                  {prismMode === 'magenta'
                    ? mixPct > 65
                      ? '● Рождён пурпурный'
                      : 'Раздельные лучи'
                    : 'Дисперсия света'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLEAN 5-SECOND APHANTASIA TEST (With anti-priming shutter & eLife 2022 pupil proof!) */}
      <Act2AphantasiaLab />
    </div>
  );
}
