import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertTriangle, ArrowDown, CheckCircle2, RotateCcw, Sliders } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { ScholarMarginNote } from './ScholarMarginalia';

gsap.registerPlugin(ScrollTrigger);

interface Chapter3VellumErrorProps {
  onNextChapter: () => void;
}

type GestureMode = 'german' | 'british';

/**
 * CHAPTER III: "Управляемая галлюцинация"
 * Upgraded v8:
 * 1. Plain-Russian 3-line setup of the cellar tavern scene + everyday "Приор" explanation (zero Tarantino prerequisite!)
 * 2. 35mm Leica Monochrom Noir POV Tavern (pixel-aligned tavern-calm.jpg <-> tavern-suspicious.jpg — 0% Nazi uniform!)
 * 3. Anatomically unmistakable foreground right-hand POV illustration over the clean lower-left oak table space
 * 4. TRULY LIVE Bayesian Prior Slider (0% -> 100%):
 *    - 0..27%: Mooney-style threshold & monochrome noise chaos (direct callback to Plate 00!)
 *    - 28..82%: Crisp noir; Gesture B snaps narrowed suspicious eyes + persistent #FC4109 registration shear + eye targeting bracket!
 *    - 83..100%: Hyper-prior hallucination — phantom crimson thumb fades in over the real British hand, error vanishes, observer stays calm & misses the spy!
 * 5. ScrollTrigger parallax registration reveal on entering the chapter.
 */
export function Chapter3VellumError({ onNextChapter }: Chapter3VellumErrorProps) {
  const { setVellumTriggered } = useExplorer();
  const [gesture, setGesture] = useState<GestureMode>('german');
  const [priorWeight, setPriorWeight] = useState(68);
  const stageCardRef = useRef<HTMLDivElement | null>(null);
  const vellumOverlayRef = useRef<HTMLDivElement | null>(null);

  // Subtle ScrollTrigger entrance settle on the whole cinema stage (keeps viewfinder optics 100% pixel-locked to the 35mm hand!)
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

  const isBritish = gesture === 'british';
  const isSensoryChaos = priorWeight < 28;
  const isHyperPrior = priorWeight >= 83;
  // Error breaks through ONLY when Gesture B is shown AND Prior isn't drowning reality out (< 83%) AND brain isn't in raw chaos (>= 28%)
  const errorDetected = isBritish && !isHyperPrior && !isSensoryChaos;

  // Dynamic optical transforms driven honestly by priorWeight!
  const chaosFactor = isSensoryChaos ? (28 - priorWeight) / 28 : 0; // 0..1
  const phantomThumbOpacity = isBritish && isHyperPrior ? Math.min(0.96, (priorWeight - 80) / 15) : 0;

  const photoFilter = isSensoryChaos
    ? `contrast(${(1.2 + chaosFactor * 2.4).toFixed(2)}) brightness(${(1 - chaosFactor * 0.14).toFixed(2)})`
    : isHyperPrior
      ? `blur(${(((priorWeight - 82) / 16) * 2.1).toFixed(2)}px) contrast(0.96)`
      : 'contrast(1.06)';

  const statusBadge = (() => {
    if (isSensoryChaos) return { cls: 'bg-[#141413] text-[#FAF9F5]', text: 'ПРИОРЫ ОТКЛЮЧЕНЫ · ХАОС (КАК В ТАБЛ. 00)' };
    if (isBritish && isHyperPrior) return { cls: 'bg-[#004EDF] text-[#FAF9F5]', text: 'ГИПЕРПРИОР · МОЗГ ДОРИСОВАЛ БОЛЬШОЙ ПАЛЕЦ!' };
    if (!isBritish && isHyperPrior) return { cls: 'bg-[#004EDF] text-[#FAF9F5]', text: 'ГИПЕРПРИОР · МОЗГ СЛЕПО ВЕРИТ В «СВОЕГО»' };
    if (errorDetected) return { cls: 'bg-[#FC4109] text-[#FAF9F5]', text: 'Δ = +28 PX · СРЫВ ПРОГНОЗА · ВАС РАСКУСИЛИ!' };
    return { cls: 'bg-[#0D7A5F] text-[#FAF9F5]', text: 'Δ = 0.0 PX · ПРОГНОЗ СОВПАЛ (99%)' };
  })();

  const sceneHeadline = (() => {
    if (isSensoryChaos) return '«Только пятна света — лицо не\u00A0складывается»';
    if (isBritish && isHyperPrior) return '«Свой за\u00A0столиком» — ошибка не\u00A0замечена';
    if (!isBritish && isHyperPrior) return '«Слишком сильный прогноз — реальность размыта»';
    if (errorDetected) return '«Стоп — почему подняты не\u00A0те три\u00A0пальца?!»';
    return '«Свой человек за\u00A0столиком»';
  })();

  const sceneExplain = (() => {
    if (isSensoryChaos) {
      return 'Когда вес внутренних прогнозов падает ниже 25%, мозг тонет в сыром потоке сетчатки — картинка рассыпается в чёрно-белый шум, как на самой первой странице книги.';
    }
    if (isBritish && isHyperPrior) {
      return 'Приор выкручен до предела: мозг настолько уверен, что перед ним «свой», что буквально дорисовывает поверх вашей руки фантомный большой палец и слепнет к чужаку. Именно так рождаются галлюцинации.';
    }
    if (!isBritish && isHyperPrior) {
      return 'Приор на максимуме — мозг сейчас слепо верит в «своего» и почти не проверяет глаза. Нажмите выше Жест B, чтобы увидеть, как он дорисует фантомный палец и пропустит чужака!';
    }
    if (errorDetected) {
      return 'Единственная крошечная деталь — три средних пальца вместо большого, указательного и среднего — пробивает 99%-ный прогноз насквозь. За 200 миллисекунд взгляд собеседника сужается, а вся модель реальности переписывается.';
    }
    return 'Большой, указательный и средний пальцы идеально совпали с привычным европейским счётом. Ошибка предсказания равна нулю — собеседник спокоен.';
  })();

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
          <span>УПРАВЛЯЕМАЯ ГАЛЛЮЦИНАЦИЯ · стр. 38</span>
        </div>

        {/* Opening Editorial Prose — 100% self-contained even without watching Tarantino! */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Мозг не фотографирует мир —</span>
              <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
                он галлюцинирует его и правит ошибки.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-3 text-[15px] leading-[1.64] text-[#353431]">
            <p>
              Череп темен и глух. Чтобы не тратить энергию на каждый пиксель, мозг непрерывно строит <strong className="font-semibold text-[#141413]">приор</strong> — внутренний чертёж ожиданий (поэтому через минуту вы перестаёте чувствовать одежду на коже и не замечаете мелких опечаток в тексте).
            </p>
            <p className="text-[#4F4E4A]">
              Представьте разведчика в подвальном баре 1940-х: костюм и акцент идеальны на 99%. Но заказывая{' '}
              <span className="font-serif-editorial italic text-[#141413]">«три бокала» (Drei Gläser)</span>, он поднимает не те три пальца, какими считают в Европе — и 99%-ный прогноз собеседника мгновенно рушится.
            </p>
          </div>
        </div>

        {/* MAIN STAGE: 35MM LEICA MONOCHROM NOIR POV + LIVE BAYESIAN PRIOR SLIDER */}
        <div ref={stageCardRef} className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 8 cols: Interactive Two-Layer 35mm POV Cinema & Risograph Plate */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] p-5 md:p-6 gap-5">
            {/* Step 1: Gesture Switcher — clean kicker above, both buttons on ONE crisp horizontal row! */}
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

            {/* 35MM LEICA MONOCHROM NOIR POV FRAME (SEAMLESS PIXEL-ALIGNED 35MM HAND + EYES · SWISS 1PX VIEWFINDER OPTICS!) */}
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#141413]/20 bg-[#111214] select-none">
              {/* PLATE A: Seamless 35mm Continental 3 (Thumb + Index + Middle) & Calm Observer */}
              <img
                src="/v8/tavern-gesture-a.jpg"
                alt="Чёрно-белый 35мм POV-кадр: ваша рука показывает большой, указательный и средний пальцы; собеседник напротив спокоен"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                style={{ filter: photoFilter }}
                draggable={false}
              />

              {/* PLATE B: Seamless 35mm British 3 (Index + Middle + Ring, NO thumb!) & Narrowed Suspicious Eyes */}
              <img
                src="/v8/tavern-gesture-b.jpg"
                alt="Чёрно-белый 35мм POV-кадр: три вертикальных пальца без большого; взгляд собеседника мгновенно сужается"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-220"
                style={{
                  opacity: isBritish ? 1 : 0,
                  filter: photoFilter,
                }}
                draggable={false}
              />

              {/* PIXEL-ALIGNED HYPER-PRIOR / CHAOS FACE MASK:
                  When Gesture B is shown but Prior >= 83% (or < 28%), observer's brain misses the spy -> right half keeps his CALM face! */}
              {isBritish && !errorDetected && (
                <img
                  src="/v8/tavern-gesture-a.jpg"
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

              {/* MOONEY-STYLE RAW SENSORY NOISE OVERLAY when Prior Slider < 28% (Callback to Plate 00!) */}
              {isSensoryChaos && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none mix-blend-hard-light"
                  style={{
                    opacity: Math.min(0.86, chaosFactor * 0.9),
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.48' numOctaves='3' stitchTiles='stitch'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 1'/%3E%3CfeFuncG type='discrete' tableValues='0 1'/%3E%3CfeFuncB type='discrete' tableValues='0 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    backgroundSize: '150px 150px',
                  }}
                />
              )}

              {/* Subtle 35mm contact-sheet top telemetry inside frame */}
              <div className="pointer-events-none absolute top-3 inset-x-3.5 z-20 flex items-center justify-between font-mono-tech text-[9.5px] uppercase tracking-[0.12em]">
                <span className="px-2 py-0.5 rounded bg-[#141413]/78 text-[#FAF9F5]/90 backdrop-blur-xs">
                  35ММ · POV КАДР · «DREI GLÄSER»
                </span>
                <span className={`px-2 py-0.5 rounded font-semibold ${statusBadge.cls}`}>
                  {statusBadge.text}
                </span>
              </div>

              {/* CRIMSON EYE-LOCK BRACKET laser-aligned to his narrowed eyes, tag floating cleanly in dark brick space to the right! */}
              {errorDetected && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute z-20 border border-[#FC4109] rounded-xs shadow-[0_0_24px_rgba(252,65,9,0.45)] animate-[fadeScaleIn_220ms_ease]"
                  style={{
                    left: '55.8%',
                    top: '25.2%',
                    width: '9.0%',
                    height: '7.4%',
                  }}
                >
                  <span className="absolute left-[calc(100%+7px)] top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-xs bg-[#FC4109] text-[#FAF9F5] font-mono-tech text-[8.5px] uppercase tracking-[0.1em] whitespace-nowrap font-bold shadow-sm">
                    ОШИБКА · 200 МС
                  </span>
                </div>
              )}

              {/* FULL-FRAME SWISS 1PX VIEWFINDER OPTICS (NO cartoon glove — pure precision crimson registration marks over real 35mm hand!) */}
              <div
                ref={vellumOverlayRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20"
              >
                <svg viewBox="0 0 1600 900" className="w-full h-full block">
                  {/* CASE 1: PREDICTION ERROR DETECTED (Gesture B + Normal Prior 28..82%) */}
                  {errorDetected && (
                    <g>
                      {/* Delicate 1px Leica/Swiss viewfinder corner brackets framing the real 35mm hand */}
                      <rect
                        x="252"
                        y="176"
                        width="302"
                        height="528"
                        rx="14"
                        fill="none"
                        stroke="#FC4109"
                        strokeOpacity="0.58"
                        strokeWidth="1.8"
                        strokeDasharray="9 6"
                      />
                      {/* Expected continental thumb silhouette ghost emerging cleanly from the real left edge of the hand */}
                      <path
                        d="M 272 590 C 238 548, 204 494, 178 430 C 169 408, 188 386, 212 396 C 236 408, 256 446, 276 488"
                        fill="rgba(252,65,9,0.18)"
                        stroke="#FC4109"
                        strokeWidth="2.6"
                        strokeDasharray="8 6"
                        strokeLinecap="round"
                      />
                      {/* Clean dark-backed Swiss callout in pure open cellar arch space (ZERO overlap with any finger!) */}
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

                  {/* CASE 2: HYPER-PRIOR HALLUCINATION (Gesture B + Prior 83..100%) */}
                  {phantomThumbOpacity > 0.02 && (
                    <g opacity={phantomThumbOpacity}>
                      {/* Glowing hallucinated phantom thumb painted by the observer's overconfident brain */}
                      <path
                        d="M 272 590 C 238 548, 204 494, 178 430 C 169 408, 188 386, 212 396 C 236 408, 256 446, 276 488 Z"
                        fill="rgba(252,65,9,0.34)"
                        stroke="#FC4109"
                        strokeWidth="3"
                        strokeDasharray="10 6"
                        strokeLinecap="round"
                      />
                      {/* Clean dark-backed Swiss callout in open cellar arch space (ZERO finger overlap!) */}
                      <line
                        x1="150"
                        y1="304"
                        x2="192"
                        y2="394"
                        stroke="#FC4109"
                        strokeWidth="1.8"
                        strokeDasharray="4 4"
                      />
                      <circle cx="192" cy="394" r="5.5" fill="#FC4109" />
                      <rect
                        x="32"
                        y="246"
                        width="224"
                        height="58"
                        rx="8"
                        fill="rgba(16,17,20,0.9)"
                        stroke="#004EDF"
                        strokeOpacity="0.85"
                        strokeWidth="1.6"
                      />
                      <text
                        x="46"
                        y="270"
                        fill="#7CB0FF"
                        fontSize="15"
                        fontWeight="700"
                        fontFamily="JetBrains Mono Variable, monospace"
                      >
                        ФАНТОМ ПРИОРА
                      </text>
                      <text
                        x="46"
                        y="293"
                        fill="#FAF9F5"
                        fontSize="15"
                        fontWeight="600"
                        fontFamily="Inter Variable, sans-serif"
                      >
                        Мозг дорисовал палец
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Bottom caption gradient inside cinema still */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-10"
                style={{
                  background: 'linear-gradient(180deg, rgba(17,18,20,0) 0%, rgba(17,18,20,0.82) 100%)',
                }}
              />
              <div className="pointer-events-none absolute bottom-3 right-4 z-20 text-right max-w-[60%]">
                <div className="font-display font-bold text-[15px] md:text-[17px] text-[#FAF9F5] leading-snug">
                  {sceneHeadline}
                </div>
              </div>
            </div>

            {/* Live Explanation Strip directly under the cinema still */}
            <p className="text-[13.5px] leading-[1.58] text-[#353431] bg-[#FAF9F5] rounded-xl border border-[#141413]/10 px-4 py-3">
              {sceneExplain}
            </p>

            {/* STEP 2: TRULY LIVE PRIOR SLIDER (Explicit instruction + visible real-time image transform!) */}
            <div className="pt-3 border-t border-[#141413]/10 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[11px]">
                <span className="uppercase tracking-[0.1em] text-[#141413] font-semibold inline-flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#FC4109]" />
                  <span>Шаг 2 · Покрутите силу приора (прогнозов): {priorWeight}%</span>
                </span>
                <span className="text-[#FC4109] font-medium">
                  {isSensoryChaos
                    ? '0–27% · Хаос сетчатки'
                    : isHyperPrior
                      ? '83–100% · Галлюцинация (мозг дорисовывает!)'
                      : '28–82% · Норма (мозг ловит ошибку)'}
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
                <span>0% · Сырой шум (без приоров)</span>
                <span>68% · Обычное зрение</span>
                <span>100% · Фантомный палец (слепота к ошибке)</span>
              </div>
            </div>
          </div>

          {/* Right 4 cols: Anil Seth Marginalia + Everyday Explanation + Bridge to Part II */}
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
                  <strong className="text-[#141413]">Уведите к 0%:</strong> без готовых шаблонов кадр распадается на бессмысленный контрастный шум — ровно как клякса Муни на 1-й странице.
                </li>
                <li>
                  <strong className="text-[#141413]">Включите Жест B и уведите к 100%:</strong> мозг так верит в «своего», что дорисовывает фантомный большой палец и пропускает шпиона.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#141413]/12 bg-[#F5F3EB] p-5 space-y-3">
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.13em] text-[#FC4109]">
                МОСТИК К ЧАСТИ II
              </div>
              <p className="font-serif-editorial italic text-[16px] leading-[1.55] text-[#282725]">
                Мы поняли, <strong>ЧТО</strong> делает сознание: строит и правит управляемую модель мира. Теперь главный вопрос биологии: <strong>ГДЕ</strong> именно в живой ткани зажигается сам опыт?
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
