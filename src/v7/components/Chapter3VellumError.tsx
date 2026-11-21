import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertTriangle, ArrowDown, CheckCircle2, RotateCcw, Sliders } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { ScholarMarginNote } from './ScholarMarginalia';
import { NoesisInstrumentFrame } from '../../v9/components/NoesisInstrumentFrame';
import { assetUrl } from '../../v9/utils/assetUrl';
import { ruTypo } from '../../v9/utils/ruTypo';
import { useViewportRaf } from '../../v9/hooks/useViewportRaf';
import { releaseCanvasMemory } from '../../v9/canvas/noesisCanvasKit';

gsap.registerPlugin(ScrollTrigger);

interface Chapter3VellumErrorProps {
  onNextChapter: () => void;
}

type GestureMode = 'german' | 'british';

/**
 * ACT III · CHAPTER II (v9.1 Fixed Order & Bug #5 Fixes):
 * 1. Comes FIRST in Act III to establish the Bayesian Prior cleanly before Split-Brain.
 * 2. Bug #5A Fix: NO blurry myopia `blur(2.1px)` on Hyper-Prior (83..100%)!
 *    Instead, keeps the 35mm Leica frame tack-sharp and composites a sharp feathered local mask
 *    of the real photographic continental hand (tavern-gesture-a.jpg) directly onto tavern-gesture-b.jpg!
 * 3. Bug #5B Fix: Replaces static SVG feTurbulence tile on < 28% with a live 60 FPS Canvas 2D
 *    Mooney retinal snow storm powered by `useViewportRaf` (0% CPU when prior >= 28% or offscreen!).
 */
export function Chapter3VellumError({ onNextChapter }: Chapter3VellumErrorProps) {
  const { setVellumTriggered } = useExplorer();
  const [gesture, setGesture] = useState<GestureMode>('german');
  const [priorWeight, setPriorWeight] = useState(68);
  const stageCardRef = useRef<HTMLDivElement | null>(null);
  const frameBoxRef = useRef<HTMLDivElement | null>(null);
  const chaosCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isBritish = gesture === 'british';
  const isSensoryChaos = priorWeight < 28;
  const isHyperPrior = priorWeight >= 83;
  const errorDetected = isBritish && !isHyperPrior && !isSensoryChaos;

  const chaosFactor = isSensoryChaos ? (28 - priorWeight) / 28 : 0; // 0..1
  const hyperFactor = isHyperPrior ? Math.min(1, (priorWeight - 82) / 16) : 0; // 0..1
  const phantomThumbOpacity = isBritish && isHyperPrior ? Math.min(0.98, 0.25 + hyperFactor * 0.73) : 0;

  // Live 60 FPS Mooney Retinal Snow Canvas ONLY when Prior < 28% AND visible in viewport!
  const chaosFactorRef = useRef(chaosFactor);
  chaosFactorRef.current = chaosFactor;

  const drawRetinalChaos = useCallback(() => {
    const canvas = chaosCanvasRef.current;
    if (!canvas) return;
    const w = 192;
    const h = 108;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = ctx.createImageData(w, h);
    const data = img.data;
    const intensity = chaosFactorRef.current;
    const threshold = 0.52 - intensity * 0.08;

    for (let i = 0; i < data.length; i += 4) {
      const n = Math.random();
      const tone = n > threshold ? 245 : 16;
      data[i] = tone;
      data[i + 1] = tone;
      data[i + 2] = tone;
      data[i + 3] = Math.round((0.35 + intensity * 0.52) * 255);
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  useViewportRaf(frameBoxRef, drawRetinalChaos, { enabled: isSensoryChaos });

  useEffect(() => {
    const canvas = chaosCanvasRef.current;
    if (!isSensoryChaos && canvas) {
      releaseCanvasMemory(canvas);
    }
    return () => {
      releaseCanvasMemory(canvas);
    };
  }, [isSensoryChaos]);

  // Subtle entrance settle
  useEffect(() => {
    const card = stageCardRef.current;
    if (!card) return;
    const tween = gsap.fromTo(
      card,
      { y: 16 },
      {
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          end: 'top 38%',
          scrub: 0.4,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const triggerError = () => {
    setGesture('british');
    setVellumTriggered(true);
  };

  const resetMatch = () => {
    setGesture('german');
  };

  // Tack-sharp Leica optics in normal & hyper-prior modes (ZERO blurry myopia!)
  const photoFilter = isSensoryChaos
    ? `contrast(${(1.25 + chaosFactor * 2.3).toFixed(2)}) brightness(${(1 - chaosFactor * 0.14).toFixed(2)})`
    : 'contrast(1.06)';

  const statusBadge = (() => {
    if (isSensoryChaos) return { cls: 'bg-[#141413] text-[#FAF9F5]', text: 'ПРИОРЫ ОТКЛЮЧЕНЫ · ХАОС СЕТЧАТКИ' };
    if (isBritish && isHyperPrior) return { cls: 'bg-[#004EDF] text-[#FAF9F5]', text: 'ГИПЕРПРИОР · МОЗГ ДОРИСОВАЛ БОЛЬШОЙ ПАЛЕЦ!' };
    if (!isBritish && isHyperPrior) return { cls: 'bg-[#004EDF] text-[#FAF9F5]', text: 'ГИПЕРПРИОР · МОЗГ СЛЕПО ВЕРИТ В «СВОЕГО»' };
    if (errorDetected) return { cls: 'bg-[#FC4109] text-[#FAF9F5]', text: 'Δ = +28 PX · СРЫВ ПРОГНОЗА · ВАС РАСКУСИЛИ!' };
    return { cls: 'bg-[#0D7A5F] text-[#FAF9F5]', text: 'Δ = 0.0 PX · ПРОГНОЗ СОВПАЛ (99%)' };
  })();

  const sceneHeadline = (() => {
    if (isSensoryChaos) return '«Только живой шум — лицо не\u00A0складывается»';
    if (isBritish && isHyperPrior) return '«Свой за\u00A0столиком» — ошибка стёрта приором';
    if (!isBritish && isHyperPrior) return '«Мозг перестал проверять глаза — включите Жест B»';
    if (errorDetected) return '«Стоп — почему подняты не\u00A0те три\u00A0пальца?!»';
    return '«Свой человек за\u00A0столиком»';
  })();

  const sceneExplain = (() => {
    if (isSensoryChaos) {
      return 'Когда вес внутренних прогнозов падает ниже 28%, мозг тонет в сыром «снеге» сетчатки — картинка рассыпается в живой двухтоновый хаос, как клякса Муни в Акте I.';
    }
    if (isBritish && isHyperPrior) {
      return 'Приор выкручен до предела: обратите внимание на руку слева — кадр остался абсолютно резким, но мозг буквально вклеил на вашу реальную ладонь фантомный большой палец из ожидания! Взгляд собеседника остаётся спокойным: он ослеп к ошибке.';
    }
    if (!isBritish && isHyperPrior) {
      return 'Приор на максимуме — мозг сейчас на 100% уверен, что напротив сидит «свой», и почти не слушает сетчатку. Нажмите выше «Жест B», чтобы увидеть, как мозг вклеит фантомный палец поверх реальности!';
    }
    if (errorDetected) {
      return 'Единственная крошечная деталь — три средних пальца вместо большого, указательного и среднего — пробивает 99%-ный прогноз насквозь. За 200 миллисекунд взгляд собеседника сужается, а вся модель реальности переписывается.';
    }
    return 'Большой, указательный и средний пальцы идеально совпали с привычным европейским счётом. Ошибка предсказания равна нулю — собеседник спокоен.';
  })();

  const plateASrc = assetUrl('/v8/tavern-gesture-a.jpg');
  const plateBSrc = assetUrl('/v8/tavern-gesture-b.jpg');

  return (
    <section
      id="ch-3"
      className="relative bg-[#FAF9F5] text-[#141413] pt-14 pb-20 md:pt-18 md:pb-24 border-b border-[#141413]/10"
      aria-label="Глава 03 — Управляемая галлюцинация"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">АКТ II · ТЕАТР ВОСПРИЯТИЯ · ГЛАВА 03</span>
          <span>УПРАВЛЯЕМАЯ ГАЛЛЮЦИНАЦИЯ · стр. 40</span>
        </div>

        {/* Opening Editorial Prose */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Мозг не фотографирует мир —</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                он галлюцинирует его и правит ошибки.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-3 text-[15px] leading-[1.64] text-[#353431]">
            <p>
              {ruTypo(
                'Череп темен и глух. Чтобы не тратить энергию на каждый пиксель, мозг непрерывно строит ',
              )}
              <strong className="font-semibold text-[#141413]">приор</strong>
              {ruTypo(
                ' — внутренний чертёж ожиданий (поэтому через минуту вы перестаёте чувствовать одежду на коже и не замечаете опечаток).',
              )}
            </p>
            <p className="text-[#4F4E4A]">
              {ruTypo(
                'Представьте разведчика в подвальном баре 1940-х: костюм и акцент идеальны на 99%. Но заказывая ',
              )}
              <span className="font-serif-editorial italic text-[#141413]">«три бокала» (Drei Gläser)</span>, он поднимает не те три пальца, какими считают в Европе — и 99%-ный прогноз собеседника мгновенно рушится.
            </p>
          </div>
        </div>

        {/* MAIN STAGE */}
        <div ref={stageCardRef} className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <NoesisInstrumentFrame
              code="ПРИБОР II.2 · ОПТИКА ПРЕДСКАЗАНИЯ «DREI GLÄSER»"
              badge="reconstruction"
              telemetry={`ПРИОР: ${priorWeight}%`}
              surface="vellum"
              className="flex-1 flex flex-col"
              bodyClassName="flex-1 flex flex-col justify-between gap-5"
            >
              {/* Step 1: Gesture Switcher */}
              <div className="space-y-2 pb-4 border-b border-[#141413]/10">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Шаг 1 · Закажите 3 бокала:
                  </span>
                  {(isBritish || priorWeight !== 68) && (
                    <button
                      type="button"
                      onClick={() => {
                        resetMatch();
                        setPriorWeight(68);
                      }}
                      className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59] hover:text-[#141413] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Сброс</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={resetMatch}
                    className={`v6-pill h-9 px-3.5 rounded-full text-[12.5px] font-medium border inline-flex items-center gap-1.5 cursor-pointer ${
                      !isBritish
                        ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                        : 'bg-[#FAF9F5] text-[#141413] border-[#141413]/15 hover:bg-[#EAE7DD]'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${!isBritish ? 'text-[#34D399]' : 'text-[#0D7A5F]'}`} />
                    <span>Жест A: Большой + 2 пальца</span>
                  </button>

                  <button
                    type="button"
                    onClick={triggerError}
                    className={`v6-pill h-9 px-3.5 rounded-full text-[12.5px] font-medium border inline-flex items-center gap-1.5 cursor-pointer ${
                      isBritish
                        ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109] shadow-[0_8px_24px_rgba(252,65,9,0.28)]'
                        : 'bg-[#FAF9F5] text-[#141413] border-[#141413]/15 hover:border-[#FC4109]'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Жест B: Три средних («Drei Gläser»)</span>
                  </button>
                </div>
              </div>

              {/* 35MM LEICA MONOCHROM NOIR POV FRAME */}
              <div
                ref={frameBoxRef}
                className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#141413]/20 bg-[#111214] select-none"
              >
                {/* PLATE A: Continental 3 + Calm Observer */}
                <img
                  src={plateASrc}
                  alt="Чёрно-белый 35мм POV-кадр: ваша рука показывает большой, указательный и средний пальцы; собеседник напротив спокоен"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                  style={{ filter: photoFilter }}
                  draggable={false}
                />

                {/* PLATE B: British 3 (no thumb) + Narrowed Suspicious Eyes */}
                <img
                  src={plateBSrc}
                  alt="Чёрно-белый 35мм POV-кадр: три вертикальных пальца без большого; взгляд собеседника мгновенно сужается"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-220"
                  style={{
                    opacity: isBritish ? 1 : 0,
                    filter: photoFilter,
                  }}
                  draggable={false}
                />

                {/* Calm face mask when observer misses the spy (Hyper-prior or Chaos) */}
                {isBritish && !errorDetected && (
                  <img
                    src={plateASrc}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                      clipPath: 'inset(0 0 0 46%)',
                      filter: photoFilter,
                    }}
                    draggable={false}
                  />
                )}

                {/* BUG #5A + P1-2 FIX: ORGANIC FEATHERED THUMB COMPOSITE (Zero harsh box seam, seamless luminance!) */}
                {isBritish && isHyperPrior && (
                  <img
                    src={plateASrc}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
                    style={{
                      opacity: phantomThumbOpacity,
                      maskImage:
                        'radial-gradient(ellipse 14% 30% at 22.5% 58%, black 34%, transparent 86%)',
                      WebkitMaskImage:
                        'radial-gradient(ellipse 14% 30% at 22.5% 58%, black 34%, transparent 86%)',
                      filter: 'contrast(1.06)',
                    }}
                    draggable={false}
                  />
                )}

                {/* BUG #5B FIX: LIVE 60 FPS CANVAS RETINAL SNOW on Prior < 28% (0% CPU otherwise!) */}
                {isSensoryChaos && (
                  <canvas
                    ref={chaosCanvasRef}
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full pointer-events-none mix-blend-hard-light"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}

                {/* Top telemetry inside frame */}
                <div className="pointer-events-none absolute top-3 inset-x-3.5 z-20 flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[9.5px] uppercase tracking-[0.12em]">
                  <span className="px-2 py-0.5 rounded bg-[#141413]/78 text-[#FAF9F5]/90 backdrop-blur-xs">
                    35ММ · POV КАДР · «DREI GLÄSER»
                  </span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${statusBadge.cls}`}>
                    {statusBadge.text}
                  </span>
                </div>

                {/* Crimson Eye-Lock Bracket */}
                {errorDetected && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute z-20 border border-[#FC4109] rounded-xs animate-[fadeScaleIn_220ms_ease]"
                    style={{
                      left: '55.8%',
                      top: '25.2%',
                      width: '9.0%',
                      height: '7.4%',
                    }}
                  >
                    <span className="absolute left-[calc(100%+7px)] top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-xs bg-[#FC4109] text-[#FAF9F5] font-mono-tech text-[8.5px] uppercase tracking-[0.1em] whitespace-nowrap font-bold">
                      ОШИБКА · 200 МС
                    </span>
                  </div>
                )}

                {/* Full-Frame Swiss 1px Viewfinder Optics */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
                  <svg viewBox="0 0 1600 900" className="w-full h-full block">
                    {errorDetected && (
                      <g>
                        <rect
                          x="252"
                          y="176"
                          width="302"
                          height="528"
                          rx="14"
                          fill="none"
                          stroke="#FC4109"
                          strokeOpacity="0.62"
                          strokeWidth="1.8"
                          strokeDasharray="9 6"
                        />
                        <path
                          d="M 272 590 C 238 548, 204 494, 178 430 C 169 408, 188 386, 212 396 C 236 408, 256 446, 276 488"
                          fill="rgba(252,65,9,0.18)"
                          stroke="#FC4109"
                          strokeWidth="2.6"
                          strokeDasharray="8 6"
                          strokeLinecap="round"
                        />
                        <line
                          x1="150"
                          y1="304"
                          x2="192"
                          y2="394"
                          stroke="#FC4109"
                          strokeWidth="1.8"
                          strokeDasharray="4 4"
                        />
                        <circle cx="192" cy="394" r="5" fill="#FC4109" />
                        <rect
                          x="32"
                          y="246"
                          width="216"
                          height="58"
                          rx="8"
                          fill="rgba(16,17,20,0.88)"
                          stroke="#FC4109"
                          strokeOpacity="0.65"
                          strokeWidth="1.5"
                        />
                        <text
                          x="46"
                          y="270"
                          fill="#FC4109"
                          fontSize="15"
                          fontWeight="700"
                          fontFamily="JetBrains Mono Variable, monospace"
                        >
                          ⊕ ОЖИДАЛ ПРОГНОЗ
                        </text>
                        <text
                          x="46"
                          y="293"
                          fill="#FAF9F5"
                          fontSize="15.5"
                          fontWeight="600"
                          fontFamily="Inter Variable, sans-serif"
                        >
                          Большой палец здесь
                        </text>
                      </g>
                    )}

                    {/* Clean organic thumb guide + legible high-contrast Klein Cobalt callout (NO harsh rectangular box!) */}
                    {isBritish && isHyperPrior && (
                      <g opacity={phantomThumbOpacity}>
                        <path
                          d="M 272 586 C 238 544, 206 492, 184 432 C 176 410, 194 390, 214 402"
                          fill="none"
                          stroke="#7CB0FF"
                          strokeWidth="2.4"
                          strokeDasharray="7 5"
                          strokeLinecap="round"
                        />
                        <line
                          x1="184"
                          y1="306"
                          x2="206"
                          y2="394"
                          stroke="#7CB0FF"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />
                        <circle cx="206" cy="394" r="5.5" fill="#7CB0FF" />
                        <rect
                          x="28"
                          y="222"
                          width="326"
                          height="84"
                          rx="10"
                          fill="rgba(16,17,20,0.92)"
                          stroke="#004EDF"
                          strokeWidth="2"
                        />
                        <text
                          x="46"
                          y="256"
                          fill="#89B0FF"
                          fontSize="19"
                          fontWeight="700"
                          fontFamily="JetBrains Mono Variable, monospace"
                        >
                          ФАНТОМ ПРИОРА ({priorWeight}%)
                        </text>
                        <text
                          x="46"
                          y="289"
                          fill="#FAF9F5"
                          fontSize="20"
                          fontWeight="600"
                          fontFamily="Inter Variable, sans-serif"
                        >
                          Мозг дорисовал палец
                        </text>
                      </g>
                    )}
                  </svg>
                </div>

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-10"
                  style={{
                    background: 'linear-gradient(180deg, rgba(17,18,20,0) 0%, rgba(17,18,20,0.82) 100%)',
                  }}
                />
                <div className="pointer-events-none absolute bottom-3 right-4 z-20 text-right max-w-[65%]">
                  <div className="font-display font-bold text-[15px] md:text-[17px] text-[#FAF9F5] leading-snug">
                    {sceneHeadline}
                  </div>
                </div>
              </div>

              {/* Live Explanation Strip */}
              <p className="text-[13.5px] leading-[1.58] text-[#353431] bg-[#FAF9F5] rounded-xl border border-[#141413]/10 px-4 py-3">
                {ruTypo(sceneExplain)}
              </p>

              {/* Step 2: Live Prior Slider */}
              <div className="pt-3 border-t border-[#141413]/10 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[11px]">
                  <span className="uppercase tracking-[0.1em] text-[#141413] font-semibold inline-flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#FC4109]" />
                    <span>Шаг 2 · Сила внутренних прогнозов (Приор): {priorWeight}%</span>
                  </span>
                  <span className="text-[#FC4109] font-medium">
                    {isSensoryChaos
                      ? '0–27% · Живой шум сетчатки'
                      : isHyperPrior
                        ? '83–100% · Галлюцинация (палец вклеен!)'
                        : '28–82% · Норма (ошибка пробивается)'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={priorWeight}
                  onChange={(e) => setPriorWeight(Number(e.target.value))}
                  className="w-full accent-[#FC4109] cursor-pointer"
                  aria-label="Сила внутренних прогнозов мозга (Приор) от 0 до 100 процентов"
                />
                <div className="flex justify-between font-mono-tech text-[10px] text-[#5E5D59]">
                  <span>0% · Сырой снег сетчатки</span>
                  <span>68% · Обычное зрение</span>
                  <span>100% · Фантомный палец</span>
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>

          {/* Right 4 cols: Anil Seth Marginalia + Bridge to Split-Brain */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-5">
            <ScholarMarginNote
              scholar="seth"
              tag="BEING YOU · 2021"
              quote="Мы не воспринимаем мир таким, каков он есть. Мы воспринимаем лучший прогноз нашего мозга — просто в бодрствовании эта галлюцинация держится на коротком поводке органов чувств."
            />

            <div className="rounded-2xl border border-[#141413]/12 bg-[#FAF9F5] p-5 space-y-2.5">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.13em] text-[#004EDF] font-semibold">
                ПОПРОБУЙТЕ ДВА КРАЯ ПОЛЗУНКА СЛЕВА
              </div>
              <ul className="text-[13.5px] leading-[1.58] text-[#3B3A37] space-y-2">
                <li>
                  <strong className="text-[#141413]">Уведите к 0%:</strong> без готовых шаблонов кадр рассыпается в живой «снег» сетчатки — ровно как клякса Муни на 1-й странице.
                </li>
                <li>
                  <strong className="text-[#141413]">Включите Жест B и уведите к 100%:</strong> картинка остаётся резкой, но мозг вклеивает фантомный большой палец и слепнет к чужаку.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#141413]/12 bg-[#F5F3EB] p-5 space-y-3">
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.13em] text-[#FC4109]">
                ДАЛЬШЕ В ГЛАВЕ 03 · МОНТАЖ ВРЕМЕНИ
              </div>
              <p className="font-serif-editorial italic text-[15.5px] leading-[1.55] text-[#282725]">
                {ruTypo(
                  'Если мозг дорисовывает картинку прямо перед глазами, не редактирует ли он и само «сейчас»? Проверим за 5 секунд на живой оптической вспышке.',
                )}
              </p>
              <button
                type="button"
                onClick={onNextChapter}
                className="pt-1 font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>К опыту Flash-Lag (80 мс)</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
