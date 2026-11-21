import { useState } from 'react';
import { Zap, RotateCcw } from 'lucide-react';
import { useExplorer } from '../../v7/context/ExplorerContext';
import { NoesisInstrumentFrame } from '../components/NoesisInstrumentFrame';
import { NoesisBrain3D } from '../three/NoesisBrain3D';
import { ruTypo } from '../utils/ruTypo';

/**
 * ACT I · CHAPTER I.1: "Парадокс 69 миллиардов" (NOESIS v9.2 Real 3D MRI Upgrade)
 * - Replaces squished 2D canvas with real FreeSurfer fsaverage5 + SUIT MNI152 3D MRI Brain!
 * - Interactive "Обратные петли коры: 0% -> 100%" slider lets reader physically reveal internal recurrent tracts & adjust cortical reverberation!
 * - Scientifically accurate: Cerebellum has parallel modular fibers without global recurrent cross-module loops (Azevedo 2009; Yu et al., Brain 2014).
 */
export function Act1CerebellumParadox() {
  const { state, setCerebellumTested } = useExplorer();
  const [pulseCount, setPulseCount] = useState(0);
  const [feedbackPct, setFeedbackPct] = useState(82);

  const fireImpulse = () => {
    setPulseCount((c) => c + 1);
    setCerebellumTested(true);
  };

  const resetSim = () => {
    setPulseCount(0);
    setFeedbackPct(82);
  };

  const feedbackRatio = feedbackPct / 100;

  return (
    <section
      id="ch-cerebellum"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Глава I.1 — Парадокс 69 миллиардов нейронов"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">АКТ I · ЖИВАЯ МАШИНА · ГЛАВА I.1</span>
          <span>ПАРАДОКС 69 МИЛЛИАРДОВ · стр. 08</span>
        </div>

        {/* Opening Editorial Prose (5 cols) + Real 3D MRI Brain Comparator (7 cols) */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-[clamp(32px,4.2vw,52px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">80% ваших нейронов</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                живут в полной темноте.
              </span>
            </h2>

            <p className="text-[15.5px] leading-[1.68] text-[#282725]">
              {ruTypo(
                'Ещё в 1714 году Готфрид Лейбниц предложил увеличить мозг до размеров мельницы и войти внутрь: вы увидите лишь шестерни, толкающие друг друга, — но нигде не найдёте самой мысли. Внутри черепа вместо шестерён трудятся ',
              )}
              <strong className="font-semibold text-[#141413]">86 миллиардов нейронов</strong>
              {ruTypo(
                ', перебрасывающихся крошечными электрическими разрядами (от −70 до +30 милливольт, мВ) в живой локальной ткани, где память и вычисление слиты в одном синапсе — живом стыке двух клеток.',
              )}
            </p>

            <p className="text-[15px] leading-[1.68] text-[#454440]">
              {ruTypo(
                'Кажется очевидным: чем больше нейронов — тем ярче сознание. Но нейробиология ломает эту интуицию на первом же шаге. Ровно ',
              )}
              <strong className="font-semibold text-[#141413]">69 миллиардов нейронов (80% всего мозга!)</strong>
              {ruTypo(
                ' упакованы в небольшой мозжечок у затылка — а в коре больших полушарий их всего 16 миллиардов. В 2014 году китайские врачи описали 24-летнюю пациентку, родившуюся вообще без мозжечка (Yu et al., Brain 2014): она страдала от нарушений равновесия и нечёткости речи, ',
              )}
              <strong className="font-semibold text-[#141413]">
                но её внутренний мир и ясность сознания оказались полностью сохранны.
              </strong>
            </p>

            {/* Key Architectural Takeaway Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-[#F3F1E9] border border-[#004EDF]/25">
                <div className="font-serif-display text-[26px] leading-none text-[#004EDF]">69 млрд</div>
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59] mt-2">
                  МОЗЖЕЧОК · ПАРАЛЛЕЛЬНЫЕ МОДУЛИ
                </div>
                <p className="text-[12.5px] leading-[1.52] text-[#3F3E3A] mt-1.5">
                  Сотни изолированных микромодулей без глобальных обратных петель между разными зонами — идеальный моторный автопилот без «Я».
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F3F1E9] border border-[#FC4109]/30">
                <div className="font-serif-display text-[26px] leading-none text-[#FC4109]">16 млрд</div>
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59] mt-2">
                  КОРА · ГЛОБАЛЬНЫЕ ОБРАТНЫЕ ПЕТЛИ
                </div>
                <p className="text-[12.5px] leading-[1.52] text-[#3F3E3A] mt-1.5">
                  В четыре раза меньше клеток — но длинные обратные тракты бесконечно возвращают сигнал назад, сшивая весь опыт воедино.
                </p>
              </div>
            </div>
          </div>

          {/* Right 7 cols: Real 3D MRI Brain (FreeSurfer fsaverage5 Cortex + SUIT Cerebellum + Recurrent Loops) */}
          <div className="lg:col-span-7">
            <NoesisInstrumentFrame
              code="ПРИБОР I.1 · 3D МРТ-АНАТОМИЯ: МОЗЖЕЧОК ПРОТИВ КОРЫ"
              badge="reconstruction"
              telemetry={
                pulseCount > 0
                  ? `ОБРАТНЫЕ ПЕТЛИ: ${feedbackPct}% · ИМПУЛЬС #${pulseCount}`
                  : `ОБРАТНЫЕ ПЕТЛИ КОРЫ: ${feedbackPct}%`
              }
              surface="vellum"
              footnote="Реальная МРТ-поверхность FreeSurfer fsaverage5 + мозжечок SUIT MNI152 · Azevedo (2009) · Yu et al. (Brain, 2014)"
            >
              <div className="space-y-4">
                {/* Interactive Controls: Pulse trigger + Real Feedback Loop Strength Slider */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={fireImpulse}
                    className="v6-pill h-10 px-5 rounded-full bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5] font-sans-ui text-[13.5px] font-medium inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#FC4109] fill-current" />
                    <span>{pulseCount > 0 ? 'Подать импульс ещё раз' : 'Подать импульс в обе сети'}</span>
                  </button>

                  {pulseCount > 0 && (
                    <button
                      type="button"
                      onClick={resetSim}
                      className="font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#5E5D59] hover:text-[#141413] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Сброс</span>
                    </button>
                  )}
                </div>

                {/* Live Interactive 3D MRI Stage */}
                <div className="rounded-xl border border-[#141413]/14 bg-[#FAF9F5] overflow-hidden">
                  <NoesisBrain3D
                    mode="cerebellum"
                    progress={feedbackRatio}
                    pulseKey={pulseCount}
                    className="w-full h-[340px] sm:h-[380px]"
                    caption="3D МРТ · Вращайте мышкой · Кобальт = мозжечок (69 млрд) · Алый = обратные петли коры (16 млрд)"
                  />
                </div>

                {/* Tactile Feedback-Loop Density Slider */}
                <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.11em]">
                    <span className="text-[#141413] font-semibold">
                      СИЛА ОБРАТНЫХ ПЕТЕЛЬ КОРЫ: <span className="text-[#FC4109]">{feedbackPct}%</span>
                    </span>
                    <span className="text-[#5E5D59]">
                      {feedbackPct < 25
                        ? 'РЕЖИМ КОНВЕЙЕРА (ГАСНЕТ СРАЗУ)'
                        : feedbackPct < 65
                          ? 'СЛАБАЯ СВЯЗНОСТЬ (ЛОКАЛЬНЫЙ ОТКЛИК)'
                          : 'ГЛОБАЛЬНАЯ РЕВЕРБЕРАЦИЯ ОПЫТА'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={feedbackPct}
                    onChange={(e) => {
                      setFeedbackPct(Number(e.target.value));
                      setCerebellumTested(true);
                    }}
                    className="w-full accent-[#FC4109] cursor-pointer"
                    aria-label="Сила обратных петель коры от 0 до 100 процентов"
                  />
                  <p className="text-[13px] leading-[1.58] text-[#2F2E2B]">
                    {state.cerebellumTested ? (
                      feedbackPct < 25 ? (
                        ruTypo(
                          'При 0–20% обратных связей кора ведёт себя почти как мозжечок: импульс проскакивает насквозь и гаснет за доли секунды. Увеличьте ползунок выше 65% и подайте импульс — увидите, как сеть удерживает живое эхо.',
                        )
                      ) : (
                        ruTypo(
                          'В синем мозжечке снизу импульс пролетает по параллельным модулям и затихает за доли секунды. В коре над ним длинные обратные тракты возвращают сигнал между долями, поддерживая единый отклик. Дело не в числе клеток, а в схеме связей.',
                        )
                      )
                    ) : (
                      ruTypo(
                        'Поверните 3D-мозг мышкой, сдвиньте ползунок обратных петель и нажмите «Подать импульс», чтобы сравнить синий мозжечок (69 млрд) и полупрозрачную кору (16 млрд).',
                      )
                    )}
                  </p>
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>

        {/* Domino transition bridge to Ch. I.2 */}
        <div className="mt-12 pt-6 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[16px] text-[#3B3A37] max-w-[680px]">
            {ruTypo(
              'Если опыт рождается в связной коре, а не в «числе клеток», то как именно эта кора вшита в живое тело — в мышцы, волю и биение собственного сердца?',
            )}
          </p>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#FC4109]">
            ДАЛЕЕ · ГЛАВА I.2 ↓
          </span>
        </div>
      </div>
    </section>
  );
}
