import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useExplorer } from '../../v7/context/ExplorerContext';
import { NoesisBrainStage3D } from '../webgl/NoesisBrainStage3D';
import { DossierTrigger } from '../../v9/components/NoesisDossierSheet';
import { ScholarMarginNote } from '../../v7/components/ScholarMarginalia';
import { ruTypo } from '../../v9/utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

const SPLIT_BEATS = [
  {
    kicker: '3D-СЦЕНА · ГЛАВА 04 · КАДР 1/3 · ЦЕЛЫЙ МОЗГ',
    title: 'Два полушария связаны мостом из 200 миллионов волокон',
    body: 'Пока мозолистое тело цело, левое и правое полушария обмениваются сигналами каждую миллисекунду. Изнутри вам кажется, что в голове сидит один-единственный «директор».',
  },
  {
    kicker: '3D-СЦЕНА · ГЛАВА 04 · КАДР 2/3 · РАССЕЧЕНИЕ',
    title: 'Но в 1960-х этот мост пришлось перерезать',
    body: 'Чтобы остановить смертельные приступы эпилепсии, хирурги рассекли мозолистое тело. В опытах Роджера Сперри и Майкла Газзаниги картинки мелькали на 150 мс в левое или правое поле зрения — из-за перекрёста зрительных путей (и перекрёстного управления руками) каждое полушарие видело только свою половину экрана.',
  },
  {
    kicker: '3D-СЦЕНА · ГЛАВА 04 · КАДР 3/3 · ЛЕВЫЙ ИНТЕРПРЕТАТОР',
    title: 'Говорящее полушарие мгновенно сочиняет ложное алиби',
    body: 'В левое поле зрения (правому полушарию) показали метель — и управляемая им левая рука молча взяла лопату. Говорящее левое полушарие видело справа лишь куриную лапку, но без секунды сомнения солгало: «Я взял лопату, чтобы чистить курятник!»',
  },
];

/**
 * ACT III · CHAPTER 04: "Туннель Эго и Расколотый штурвал"
 * 1. Full-Screen 240vh 3D PBR Split-Brain Choreography:
 *    The hi-res porcelain left & right hemispheres physically glide apart in 3D, stretching 20 glowing
 *    corpus callosum tracts until a surgical crimson plane cleanly severs them!
 * 2. Concise, deep narrative uniting Thomas Metzinger's "Ego Tunnel" (Rubber Hand + aPCu Neuron 2023)
 *    and Gazzaniga's "Left Interpreter" (with subtle Mr. Robot line — zero bloated clicker forms!).
 */
export function Chapter4SplitHemispheres3D() {
  const { setSplitBrainCut } = useExplorer();
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const recordedCutRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [beatIdx, setBeatIdx] = useState(0);

  useEffect(() => {
    const el = runwayRef.current;
    if (!el) return;
    const trig = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      onUpdate: (self) => {
        const p = self.progress;
        setProgress((prev) => (Math.abs(prev - p) > 0.005 ? p : prev));
        const b = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
        setBeatIdx((prev) => (prev === b ? prev : b));
        if (p >= 0.66 && !recordedCutRef.current) {
          recordedCutRef.current = true;
          setSplitBrainCut(true);
        }
        if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      },
    });
    return () => trig.kill();
  }, [setSplitBrainCut]);

  const beat = SPLIT_BEATS[beatIdx] ?? SPLIT_BEATS[0];

  return (
    <section
      id="ch-2"
      className="relative bg-[#FAF9F5] text-[#141413] border-b border-[#141413]/10"
      aria-label="Глава 04 — Туннель Эго и 3D-рассечение полушарий"
    >
      {/* FULL-SCREEN 240vh 3D PBR SPLIT-BRAIN RUNWAY (fits 100% cleanly inside 390×844 phone!) */}
      <div ref={runwayRef} className="relative h-[240vh] border-b border-[#141413]/10">
        <div className="sticky top-0 h-[100svh] w-full flex flex-col justify-between px-4 sm:px-5 md:px-12 lg:px-20 pt-[70px] pb-4 sm:pt-20 lg:pt-24 lg:pb-10 overflow-hidden">
          <div className="max-w-[1240px] mx-auto w-full flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[9.5px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.14em] text-[#5E5D59]">
            <span className="text-[#FC4109] font-semibold">{beat.kicker}</span>
            <span className="hidden sm:inline">ГЛАВА 04 · РАСКОЛОТЫЙ ШТУРВАЛ · стр. 56</span>
          </div>

          <div className="max-w-[1240px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 lg:gap-8 items-center my-2 lg:my-4">
            <div className="order-2 lg:order-1 lg:col-span-5 space-y-2.5 sm:space-y-4 lg:space-y-5">
              <h2 className="text-[21px] sm:text-[28px] lg:text-[clamp(26px,3.1vw,40px)] leading-[1.08] tracking-[-0.03em]">
                <span className="font-display font-bold block text-[#141413]">{ruTypo(beat.title)}</span>
              </h2>
              <p className="font-serif-editorial italic text-[14px] sm:text-[16.5px] lg:text-[19px] leading-[1.46] lg:leading-[1.56] text-[#353431]">
                {ruTypo(beat.body)}
              </p>

              {/* Live Hemisphere Status Pills */}
              <div className="grid grid-cols-2 gap-2 lg:gap-2.5 pt-0.5 font-mono-tech text-[9.5px] lg:text-[10px]">
                <div className="p-2.5 lg:p-3 rounded-xl bg-[#F3F1E9] border border-[#004EDF]/30">
                  <div className="text-[#004EDF] font-bold">● ЛЕВОЕ</div>
                  <div className="font-sans-ui text-[11px] lg:text-[12px] text-[#3B3A37] mt-0.5 lg:mt-1 leading-snug">
                    {beatIdx < 2 ? 'Речь + логика в связке' : 'Видит лапку → сочиняет историю о курятнике'}
                  </div>
                </div>
                <div className="p-2.5 lg:p-3 rounded-xl bg-[#F3F1E9] border border-[#FC4109]/30">
                  <div className="text-[#FC4109] font-bold">● ПРАВОЕ</div>
                  <div className="font-sans-ui text-[11px] lg:text-[12px] text-[#3B3A37] mt-0.5 lg:mt-1 leading-snug">
                    {beatIdx < 2 ? 'Образы и левая рука' : 'Видит метель → молча тянется к лопате'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-0.5">
                <div className="w-28 lg:w-36 h-[3px] rounded-full bg-[#141413]/14 overflow-hidden">
                  <div
                    ref={barRef}
                    className="h-full w-full origin-left bg-[#FC4109]"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </div>
                <span className="font-mono-tech text-[9.5px] lg:text-[10px] uppercase tracking-[0.11em] text-[#5E5D59]">
                  {beatIdx === 2 ? 'Мозолистое тело рассечено' : 'Листайте вниз · 3D-разъезд'}
                </span>
              </div>
            </div>

            {/* Full-presence Hi-Res PBR 3D Split-Brain Stage (top on phone so it's ALWAYS in view!) */}
            <div className="order-1 lg:order-2 lg:col-span-7">
              <div className="relative rounded-2xl border border-[#141413]/12 bg-[#FAF9F5] shadow-[0_24px_64px_rgba(20,20,19,0.06)] overflow-hidden">
                <NoesisBrainStage3D
                  mode="split"
                  progress={progress}
                  className="w-full h-[230px] sm:h-[320px] lg:h-[500px]"
                  caption="МРТ ICBM152 · СВЕРХУ-СЗАДИ"
                />
                {/* Whisper-thin Leica optical midline cut axis visible once hemispheres part cleanly */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-8 bottom-12 lg:top-12 lg:bottom-16 left-1/2 -translate-x-1/2 border-l border-dashed border-[#FC4109]/35 transition-opacity duration-500"
                  style={{ opacity: progress > 0.58 ? 1 : 0 }}
                />
              </div>
            </div>
          </div>

          <div className="max-w-[1240px] mx-auto w-full hidden sm:flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#7A7872]">
            <span>Р. СПЕРРИ (НОБЕЛЕВСКАЯ ПРЕМИЯ, 1981) · М. ГАЗЗАНИГА</span>
            <span>200 МЛН ВОЛОКОН · ДВА ПОЛУШАРИЯ</span>
          </div>
        </div>
      </div>

      {/* EDITORIAL ESSAY SPREAD: THOMAS METZINGER'S EGO TUNNEL + aPCu (Neuron 2023) */}
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 py-18 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
              ТУННЕЛЬ ЭГО · ТОМАС МЕТЦИНГЕР · АРХИТЕКТУРА «Я»
            </div>
            <h3 className="font-serif-editorial text-[28px] md:text-[38px] leading-[1.12] tracking-[-0.02em] text-[#141413]">
              {ruTypo('Ваше «Я» — не пилот в кабине, а прозрачный аватар')}
            </h3>
            <p className="text-[15.5px] leading-[1.7] text-[#2F2E2B]">
              {ruTypo(
                'Как и герой «Мистера Робота», мы привыкли верить внутреннему рассказчику безоговорочно. Но немецкий философ Томас Метцингер сформулировал радикальный тезис: никакого отдельного «Я» внутри мозга не существует. Мозг непрерывно рендерит модель тела и называет её «мной» — и делает эту модель настолько прозрачной, что мы не видим самого экрана.',
              )}
            </p>
            <p className="text-[15px] leading-[1.68] text-[#454440]">
              {ruTypo(
                'В 2023 году нейрохирурги из Стэнфорда (Lyu & Parvizi, Neuron 2023) нашли точную кнопку этого чувства — переднее предклинье (aPCu) на внутренней стенке полушарий. Слабый ток в эту зону мгновенно вызывал у пациентов в сознании ощущение выхода из тела: комната оставалась на месте, зрение не мутнело, но исчезало само чувство «это происходит со мной».',
              )}
            </p>

            {/* Real-life 30-second offline experiment (no fake browser clicker!) */}
            <div className="p-5 rounded-2xl bg-[#F3F1E9] border border-[#141413]/12 space-y-2">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#004EDF] font-semibold">
                ПРОВЕРЬТЕ НА СЕБЕ ЗА 60 СЕКУНД (БЕЗ ПРИБОРОВ) · ИЛЛЮЗИЯ РЕЗИНОВОЙ РУКИ
              </div>
              <p className="text-[13.5px] leading-[1.6] text-[#353431]">
                {ruTypo(
                  'Спрячьте свою руку за книгой, положите рядом на стол перчатку и попросите друга синхронно касаться кисточкой вашей скрытой руки и перчатки. Через 40 секунд ваш мозг перепишет границы тела: вы почувствуете прикосновение внутри резины — и сердце ёкнет, если по перчатке ударить.',
                )}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <ScholarMarginNote
              scholar="dennett"
              tag="ГАЗЗАНИГА / ДЕННЕТ · 1981 → 2023"
              quote="Внутри черепа нет никакой маленькой кабины пилота, где сидит ваш «главный директор». Наше «Я» — это история, которую говорящая часть мозга сочиняет на лету, чтобы склеить действия тела воедино."
            />

            <DossierTrigger
              dossier="split-brain-chiasm"
              label="Как работает перекрёст зрительных полей (хиазма) и 150 мс окно Сперри"
              meta="Архивное досье III.1 · Уровень 2"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
