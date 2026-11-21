import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { ScholarMarginDuel } from './ScholarMarginalia';
import { NoesisInstrumentFrame } from '../../v9/components/NoesisInstrumentFrame';
import { useDossier } from '../../v9/components/DossierContext';
import { DossierTrigger } from '../../v9/components/NoesisDossierSheet';
import { assetUrl } from '../../v9/utils/assetUrl';
import { ruTypo } from '../../v9/utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

interface Chapter1MaryRoomProps {
  onHudThemeChange: (theme: 'light' | 'dark') => void;
  onActiveChange: (active: boolean) => void;
  onCanvasInHudChange?: (active: boolean) => void;
  onNextChapter: () => void;
}

const MARY_BEATS = [
  {
    kicker: 'ГЛАВА I · ЧАСТЬ 1/4 · КОМНАТА МЭРИ (Ф. ДЖЕКСОН, 1982)',
    headlineMain: 'Она знает о\u00A0красном всё —',
    headlineAccent: 'кроме того, каково его видеть.',
    note: 'Нейробиолог Мэри выросла в абсолютно чёрно-белой лаборатории. Она знает длину волны 650\u00A0нм, реакцию цветовых датчиков глаза и путь каждого импульса в зрительной коре — но никогда не видела ни единого цветного луча.',
  },
  {
    kicker: 'ГЛАВА I · ЧАСТЬ 2/4 · ФИЗИКА БЕЗ ОПЫТА',
    headlineMain: 'В\u00A0спектре нет красного —',
    headlineAccent: 'там есть только частота 461\u00A0ТГц.',
    note: 'В объективном мире свет бесцветен: это электромагнитные колебания разной длины. Можно выучить до микрона разницу между бумагой «слоновая кость» (Bone) и «яичная скорлупа» (Eggshell) — но это всё ещё сухие числа, а не сам оттенок перед глазами.',
  },
  {
    kicker: 'ГЛАВА I · ЧАСТЬ 3/4 · МОМЕНТ ПОРОГА',
    headlineMain: 'Дверь открывается.',
    headlineAccent: 'Мозг получает сигнал, который уже знал по\u00A0учебникам…',
    note: 'По зрительному нерву бежит точно тот каскад импульсов, который Мэри сто раз чертила на доске. Ни одной новой формулы физика ей не дала. Но происходит нечто, чего не было ни в одной книге.',
  },
  {
    kicker: 'ГЛАВА I · ЧАСТЬ 4/4 · РОЖДЕНИЕ КВАЛИА',
    headlineMain: 'Красный обрушивается на\u00A0неё.',
    headlineAccent: 'Это и есть Трудная проблема сознания.',
    note: 'Субъективное качество переживания — «красность красного», боль ожога, вкус кофе — философы называют квалиа. Почему физическая химия в темноте черепа вообще сопровождается внутренним кино?',
  },
];

type SpectrometerMode = 'single' | 'metamer' | 'magenta';

function wavelengthToHex(nm: number) {
  const rawL = Math.exp(-Math.pow((nm - 595) / 58, 2));
  const rawM = Math.exp(-Math.pow((nm - 538) / 45, 2));
  const rawS = Math.exp(-Math.pow((nm - 442) / 34, 2));
  const maxC = Math.max(rawL, rawM, rawS, 0.001);
  const l = Math.round((rawL / maxC) * 100);
  const m = Math.round((rawM / maxC) * 100);
  const s = Math.round((rawS / maxC) * 100);

  if (nm < 455) return { hex: '#4338CA', name: 'Индиго-фиолетовый', lCone: l, mCone: m, sCone: s };
  if (nm < 495) return { hex: '#1D4ED8', name: 'Кобальтово-синий', lCone: l, mCone: m, sCone: s };
  if (nm < 545) return { hex: '#0D7A5F', name: 'Изумрудно-зелёный', lCone: l, mCone: m, sCone: s };
  if (nm < 585) return { hex: '#CA8A04', name: 'Янтарно-золотой', lCone: l, mCone: m, sCone: s };
  if (nm < 625) return { hex: '#EA580C', name: 'Киноварь', lCone: l, mCone: m, sCone: s };
  return { hex: '#C92A2A', name: 'Живой алый', lCone: l, mCone: m, sCone: s };
}

const DEFAULT_650 = wavelengthToHex(650);

export function Chapter1MaryRoom({
  onHudThemeChange,
  onActiveChange,
  onCanvasInHudChange,
  onNextChapter: _onNextChapter,
}: Chapter1MaryRoomProps) {
  const { state, setMaryBet } = useExplorer();
  const { openDossier } = useDossier();

  const sectionRef = useRef<HTMLElement | null>(null);
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const stageRootRef = useRef<HTMLDivElement | null>(null);
  const colorLayerRef = useRef<HTMLDivElement | null>(null);
  const cobaltWashRef = useRef<HTMLDivElement | null>(null);
  const prismSpectrumRef = useRef<SVGGElement | null>(null);
  const rayWavePathRef = useRef<SVGPathElement | null>(null);
  const spikePathRef = useRef<SVGPathElement | null>(null);
  const kineticDotRef = useRef<HTMLDivElement | null>(null);
  const qualiaValueRef = useRef<HTMLSpanElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const hudDarkFlagRef = useRef(false);

  const [activeBeat, setActiveBeat] = useState(0);
  const [isColoredPhase, setIsColoredPhase] = useState(false);
  const [wavelength, setWavelength] = useState(650);
  const [specMode, setSpecMode] = useState<SpectrometerMode>('single');

  useEffect(() => {
    const section = sectionRef.current;
    const runway = runwayRef.current;
    if (!section || !runway) return;

    const visObserver = new IntersectionObserver(
      ([entry]) => {
        onActiveChange(entry.isIntersecting);
      },
      { threshold: 0.01 },
    );
    visObserver.observe(section);

    const canvasHudTrigger = ScrollTrigger.create({
      trigger: runway,
      start: 'top 62px',
      end: 'bottom 62px',
      onToggle: (self) => {
        onCanvasInHudChange?.(self.isActive);
      },
    });

    const trigger = ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.55,
      onLeave: () => {
        if (hudDarkFlagRef.current) {
          hudDarkFlagRef.current = false;
          onHudThemeChange('light');
        }
      },
      onLeaveBack: () => {
        if (hudDarkFlagRef.current) {
          hudDarkFlagRef.current = false;
          onHudThemeChange('light');
        }
      },
      onUpdate: (self) => {
        const p = self.progress;
        const nextBeat = p < 0.25 ? 0 : p < 0.52 ? 1 : p < 0.79 ? 2 : 3;
        setActiveBeat((prev) => (prev === nextBeat ? prev : nextBeat));

        if (rayWavePathRef.current) {
          const len = rayWavePathRef.current.getTotalLength();
          const waveT = Math.max(0, Math.min(1, (p - 0.04) / 0.28));
          rayWavePathRef.current.style.strokeDasharray = `${len}`;
          rayWavePathRef.current.style.strokeDashoffset = `${len * (1 - waveT)}`;
        }
        if (spikePathRef.current) {
          const len = spikePathRef.current.getTotalLength();
          const spikeT = Math.max(0, Math.min(1, (p - 0.24) / 0.32));
          spikePathRef.current.style.strokeDasharray = `${len}`;
          spikePathRef.current.style.strokeDashoffset = `${len * (1 - spikeT)}`;
        }

        const colorT = Math.max(0, Math.min(1, (p - 0.54) / 0.38));
        const easedColor = colorT * colorT * (3 - 2 * colorT);
        const feather = Math.min(4.5, easedColor * 18);
        const maskRadius = easedColor <= 0.001 ? 0 : Math.min(112, Math.pow(easedColor, 0.85) * 112);
        const innerStop = Math.max(0, maskRadius - feather);
        const outerStop = maskRadius + feather;
        const radialMask =
          easedColor <= 0.001
            ? 'radial-gradient(circle farthest-corner at 63.5% 57%, black 0%, transparent 0%)'
            : `radial-gradient(circle farthest-corner at 63.5% 57%, black ${innerStop.toFixed(2)}%, transparent ${outerStop.toFixed(2)}%)`;

        if (colorLayerRef.current) {
          colorLayerRef.current.style.maskImage = radialMask;
          colorLayerRef.current.style.webkitMaskImage = radialMask;
        }
        if (cobaltWashRef.current) {
          cobaltWashRef.current.style.maskImage = radialMask;
          cobaltWashRef.current.style.webkitMaskImage = radialMask;
          const cobaltOpacity = Math.min(0.95, Math.pow(easedColor, 0.78) * 0.96);
          cobaltWashRef.current.style.opacity = `${cobaltOpacity.toFixed(3)}`;
        }
        if (prismSpectrumRef.current) {
          prismSpectrumRef.current.style.opacity = `${easedColor.toFixed(3)}`;
        }

        if (kineticDotRef.current) {
          const travelT = Math.max(0, Math.min(1, p / 0.62));
          const xPct = 28.5 + travelT * 34.3;
          const yPct = 70.5 - travelT * 15.0;
          const igniteScale = 1 + easedColor * 0.35;

          kineticDotRef.current.style.left = `${xPct.toFixed(2)}%`;
          kineticDotRef.current.style.top = `${yPct.toFixed(2)}%`;
          kineticDotRef.current.style.transform = `translate(-50%, -50%) scale(${igniteScale.toFixed(3)})`;
          kineticDotRef.current.style.opacity = `${(0.2 + Math.min(1, p * 4) * 0.8).toFixed(2)}`;
        }

        if (progressBarRef.current) {
          const barFill = Math.max(0, Math.min(1, p / 0.92));
          progressBarRef.current.style.transform = `scaleX(${barFill.toFixed(4)})`;
        }
        if (qualiaValueRef.current) {
          if (easedColor >= 0.74) {
            const pct = Math.max(1, Math.round(easedColor * 100));
            qualiaValueRef.current.textContent = `${pct}% · квалиа (живой алый)`;
          } else if (easedColor > 0.02) {
            const pct = Math.max(1, Math.round(easedColor * 100));
            qualiaValueRef.current.textContent = `${pct}% · вспышка цвета`;
          } else {
            qualiaValueRef.current.textContent = '0% · только числа';
          }
        }

        const shouldBeColored = easedColor >= 0.74;
        if (stageRootRef.current) {
          stageRootRef.current.dataset.colored = shouldBeColored ? 'true' : 'false';
        }
        setIsColoredPhase((prev) => (prev === shouldBeColored ? prev : shouldBeColored));
        if (shouldBeColored !== hudDarkFlagRef.current) {
          hudDarkFlagRef.current = shouldBeColored;
          onHudThemeChange(shouldBeColored ? 'dark' : 'light');
        }
      },
    });

    return () => {
      visObserver.disconnect();
      canvasHudTrigger.kill();
      trigger.kill();
      onCanvasInHudChange?.(false);
      onHudThemeChange('light');
    };
  }, [onHudThemeChange, onActiveChange, onCanvasInHudChange]);

  const beat = MARY_BEATS[activeBeat] ?? MARY_BEATS[0];
  const baseSpec = wavelengthToHex(wavelength);
  const frequencyThz = Math.round(299792 / wavelength);

  // Active eyepiece reading (Single wavelength vs Metamerism vs Non-spectral Magenta!)
  const eyepiece = (() => {
    if (specMode === 'metamer') {
      return {
        hex: '#D4A017',
        title: 'Метамеризм: два разных света = один жёлтый',
        waveLabel: '580 нм (1 луч)  ≡  530 + 640 нм (смесь)',
        freqLabel: 'Две разные физики',
        lCone: 92,
        mCone: 81,
        sCone: 2,
        explain:
          'Ваш экран не умеет излучать настоящий жёлтый 580 нм — он смешивает зелёный и красный пиксели. Но тройка чисел (L=92, M=81, S=2) совпадает, и кора рисует неотличимый жёлтый.',
      };
    }
    if (specMode === 'magenta') {
      return {
        hex: '#C0267D',
        title: 'Пурпур (маджента) — цвет без длины волны',
        waveLabel: '440 + 650 нм · вне радуги',
        freqLabel: 'Несуществующая волна',
        lCone: 88,
        mCone: 4,
        sCone: 94,
        explain:
          'В солнечном спектре нет «пурпурного» фотона! Когда срабатывают крайние синие (S) и красные (L) колбочки, а зелёные (M) молчат, мозг сам достраивает цвет, замыкая спектр в кольцо.',
      };
    }
    return {
      hex: baseSpec.hex,
      title: baseSpec.name,
      waveLabel: `${wavelength} нм`,
      freqLabel: `${frequencyThz} ТГц`,
      lCone: baseSpec.lCone,
      mCone: baseSpec.mCone,
      sCone: baseSpec.sCone,
      explain:
        state.maryBet === 'learns_new'
          ? 'Вы поставили на Чалмерса: даже зная точные проценты L, M и S выше, Мэри никогда не могла вывести из них сам свет внутри этого окуляра.'
          : state.maryBet === 'knows_all'
            ? 'Вы поставили на Деннета: если бы Мэри знала всю физику активации L, M и S в своей коре, этот оттенок не стал бы для неё новостью.'
            : 'Подвигайте длину волны или переключитесь на «Пурпур» — вы увидите, что цвет рождается не в фотоне, а в вычислении трёх типов колбочек.',
    };
  })();

  const maryStillLifeSrc = assetUrl('/v6/mary-still-life.jpg');

  return (
    <section
      id="ch-1"
      ref={sectionRef}
      className="relative bg-[#FAF9F5] text-[#141413]"
      aria-label="Глава I — Загадка цвета и Комната Мэри"
    >
      {/* PRE-EXIT BET SPREAD */}
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 py-14 md:py-20">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">АКТ II · ОПТИКА · ГЛАВА I</span>
          <span>ЗАГАДКА ЦВЕТА · стр. 10</span>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-[clamp(32px,4.4vw,56px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Ставка перед дверью:</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                узнает ли Мэри что{'\u2011'}то новое?
              </span>
            </h2>

            <p className="text-[16px] md:text-[17px] leading-[1.65] text-[#30302E]">
              {ruTypo(
                'Представьте учёную, которая всю жизнь провела в безупречно чёрно-белой комнате. Она выучила всю физику света и анатомию глаза — знает даже точные цифры, отличающие белую бумагу ',
              )}
              <span className="font-serif-editorial italic text-[#141413]">«слоновая кость» (Bone)</span> от{' '}
              <span className="font-serif-editorial italic text-[#141413]">«яичной скорлупы» (Eggshell)</span>.
              Сегодня дверь впервые откроется, и перед ней окажется алая роза.
            </p>

            {/* Pre-Exit Bet Cards */}
            <div className="pt-2 space-y-3">
              <div className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#5E5D59]">
                Шаг 1 · Сделайте ставку, прежде чем медленно прокрутить вниз и открыть дверь:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setMaryBet('learns_new')}
                  className={`v6-pill text-left p-5 rounded-2xl border cursor-pointer transition-all ${
                    state.maryBet === 'learns_new'
                      ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] shadow-[0_14px_34px_rgba(20,20,19,0.16)]'
                      : 'bg-[#F4F2EA] hover:bg-[#ECE9DF] text-[#141413] border-[#141413]/12'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 min-h-[18px] font-mono-tech text-[10.5px] uppercase tracking-[0.1em]">
                    <span className={`whitespace-nowrap ${state.maryBet === 'learns_new' ? 'text-[#FC4109]' : 'text-[#5E5D59]'}`}>
                      ЛАГЕРЬ A · ЧАЛМЕРС
                    </span>
                    <span className="whitespace-nowrap shrink-0">
                      {state.maryBet === 'learns_new' ? '● ВЫБРАНО' : '○'}
                    </span>
                  </div>
                  <div className="font-display font-bold text-[17px] mt-2">
                    Да, она узнает новое
                  </div>
                  <p
                    className={`text-[13.5px] leading-[1.52] mt-1.5 ${
                      state.maryBet === 'learns_new' ? 'text-[#FAF9F5]/80' : 'text-[#4F4E4A]'
                    }`}
                  >
                    Формулы не передают само ощущение красного. Внутренний опыт не сводится к сухим цифрам.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMaryBet('knows_all')}
                  className={`v6-pill text-left p-5 rounded-2xl border cursor-pointer transition-all ${
                    state.maryBet === 'knows_all'
                      ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] shadow-[0_14px_34px_rgba(20,20,19,0.16)]'
                      : 'bg-[#F4F2EA] hover:bg-[#ECE9DF] text-[#141413] border-[#141413]/12'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 min-h-[18px] font-mono-tech text-[10.5px] uppercase tracking-[0.1em]">
                    <span className={`whitespace-nowrap ${state.maryBet === 'knows_all' ? 'text-[#FC4109]' : 'text-[#5E5D59]'}`}>
                      ЛАГЕРЬ B · ДЕННЕТ
                    </span>
                    <span className="whitespace-nowrap shrink-0">
                      {state.maryBet === 'knows_all' ? '● ВЫБРАНО' : '○'}
                    </span>
                  </div>
                  <div className="font-display font-bold text-[17px] mt-2">
                    Нет, она уже всё знала
                  </div>
                  <p
                    className={`text-[13.5px] leading-[1.52] mt-1.5 ${
                      state.maryBet === 'knows_all' ? 'text-[#FAF9F5]/80' : 'text-[#4F4E4A]'
                    }`}
                  >
                    Если она правда знала всю работу нейронов, цвет не сможет её удивить — никакой магии нет.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Margin: Reactive New Yorker Pencil Duel */}
          <div className="lg:col-span-5 lg:pt-8">
            <ScholarMarginDuel
              first={{
                scholar: 'chalmers',
                gesture: 'eyebrow',
                quote:
                  state.maryBet === 'knows_all'
                    ? 'Смело! Вы встали на сторону Деннета — но признайтесь честно: неужели учебник по оптике правда заменяет первый взгляд на алый закат? Здесь есть нефизический остаток.'
                    : 'Никакое число формул о длине волны не заменит одного живого взгляда на алый цветок. Это доказывает существование нефизического внутреннего переживания.',
              }}
              struckWord={state.maryBet === 'knows_all' ? 'нефизический' : 'нефизического'}
              second={{
                scholar: 'dennett',
                gesture: 'slash',
                quote:
                  state.maryBet === 'learns_new'
                    ? 'Классическая ловушка воображения! Вы записали ставку в пользу магии — я запомню это и проверю вас в Акте V, когда перед вами окажется ИИ.'
                    : 'Браво! Почти все попадаются на этот трюк, потому что не умеют по-настоящему представить «знать ВСЮ физику мозга». Мэри бы даже не моргнула.',
              }}
            />

            <div className="mt-4 flex items-center justify-between px-2 font-mono-tech text-[11px] text-[#5E5D59]">
              <span>
                {state.maryBet
                  ? '✓ Ставка записана в ваш Паспорт книги'
                  : '↓ Шаг 2 · Медленно прокручивайте вниз, открывая дверь'}
              </span>
              <span className="text-[#FC4109] font-semibold">↓ Открыть дверь</span>
            </div>
          </div>
        </div>
      </div>

      {/* PINNED 340vh SCROLL METAMORPHOSIS (CSS position:sticky — 0 GSAP pin:true!) */}
      <div id="ch-1-runway" ref={runwayRef} className="relative h-[340vh] bg-[#ECEAE4]">
        <div
          ref={stageRootRef}
          data-colored={isColoredPhase ? 'true' : 'false'}
          className="sticky top-0 h-[100svh] w-full overflow-hidden group/mary"
        >
          <div className="absolute inset-0">
            <img
              src={maryStillLifeSrc}
              alt=""
              className="w-full h-full object-cover object-bottom select-none"
              style={{ filter: 'grayscale(1) contrast(1.06) brightness(0.98)' }}
            />
          </div>

          <div
            ref={colorLayerRef}
            className="absolute inset-0 will-change-[mask-image]"
            style={{
              maskImage: 'radial-gradient(circle farthest-corner at 63.5% 57%, black 0%, transparent 0%)',
              WebkitMaskImage: 'radial-gradient(circle farthest-corner at 63.5% 57%, black 0%, transparent 0%)',
            }}
          >
            <img
              src={maryStillLifeSrc}
              alt="Хрустальная призма, алая роза и оптическая линза"
              className="w-full h-full object-cover object-bottom select-none"
              style={{ filter: 'saturate(1.16) contrast(1.03)' }}
            />
          </div>

          <div
            ref={cobaltWashRef}
            className="absolute inset-0 pointer-events-none will-change-[mask-image,opacity]"
            style={{
              opacity: 0,
              maskImage: 'radial-gradient(circle farthest-corner at 63.5% 57%, black 0%, transparent 0%)',
              WebkitMaskImage: 'radial-gradient(circle farthest-corner at 63.5% 57%, black 0%, transparent 0%)',
              background:
                'linear-gradient(180deg, rgba(0, 78, 223, 0.94) 0%, rgba(0, 78, 223, 0.86) 48%, rgba(0, 78, 223, 0.25) 68%, rgba(0, 78, 223, 0) 80%)',
              mixBlendMode: 'multiply',
            }}
          />

          <svg
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMax slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <path
              ref={rayWavePathRef}
              d="M 0 650 Q 25 620 50 650 T 100 650 T 150 650 T 200 650 T 250 650 T 300 650"
              fill="none"
              stroke={isColoredPhase ? '#FAF9F5' : '#141413'}
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.72"
              style={{ strokeDasharray: 500, strokeDashoffset: 500 }}
            />
            <path
              ref={spikePathRef}
              d="M 420 635 L 490 618 L 502 572 L 514 636 L 526 606 L 570 595 L 582 544 L 594 612 L 606 584 L 665 568 L 677 518 L 689 586 L 702 558 L 855 516"
              fill="none"
              stroke={isColoredPhase ? '#FAF9F5' : '#141413'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.78"
              style={{ strokeDasharray: 900, strokeDashoffset: 900 }}
            />
            <g ref={prismSpectrumRef} style={{ opacity: 0 }}>
              <line x1="405" y1="635" x2="885" y2="486" stroke="#FC4109" strokeWidth="3.5" opacity="0.65" />
              <line x1="408" y1="642" x2="890" y2="514" stroke="#F59E0B" strokeWidth="2.6" opacity="0.55" />
              <line x1="412" y1="648" x2="892" y2="544" stroke="#10B981" strokeWidth="2.2" opacity="0.45" />
              <line x1="415" y1="654" x2="892" y2="574" stroke="#60A5FA" strokeWidth="2.2" opacity="0.45" />
            </g>
          </svg>

          <div
            ref={kineticDotRef}
            className="absolute z-20 pointer-events-none will-change-transform flex items-center justify-center"
            style={{
              left: '28.5%',
              top: '70.5%',
              transform: 'translate(-50%, -50%) scale(1)',
              opacity: 0.2,
            }}
          >
            <span
              className="w-7 h-7 rounded-full border transition-all duration-500 flex items-center justify-center"
              style={{
                borderColor: isColoredPhase ? 'rgba(250, 249, 245, 0.78)' : 'rgba(20, 20, 19, 0.45)',
                backgroundColor: isColoredPhase ? 'rgba(252, 65, 9, 0.24)' : 'rgba(250, 249, 245, 0.25)',
                boxShadow: isColoredPhase ? '0 0 36px 8px rgba(252, 65, 9, 0.42)' : 'none',
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
                style={{ backgroundColor: isColoredPhase ? '#FC4109' : '#141413' }}
              />
            </span>
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 z-20"
            style={{
              background: 'linear-gradient(180deg, rgba(20,18,16,0) 0%, rgba(28,24,19,0.44) 100%)',
            }}
          />

          <div className="relative z-30 max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20 pt-20 md:pt-24">
            <div className="max-w-2xl lg:max-w-[740px]">
              <div className="font-mono-tech text-[11px] md:text-[12px] tracking-[0.06em] uppercase transition-colors duration-200 text-[#5E5D59] group-data-[colored=true]/mary:text-[#FAF9F5]/85">
                {beat.kicker}
              </div>

              <h3 className="mt-3 text-[clamp(26px,3.6vw,52px)] leading-[1.09] tracking-[-0.026em] transition-colors duration-200 text-[#141413] group-data-[colored=true]/mary:text-[#FAF9F5]">
                <span className="font-display font-bold block">{beat.headlineMain}</span>
                <span className="font-serif-editorial italic font-normal block mt-1 text-[#3B3A37] group-data-[colored=true]/mary:text-[#FFE4D6]">
                  {beat.headlineAccent}
                </span>
              </h3>

              <p className="mt-3.5 max-w-lg text-[14.5px] md:text-[15.5px] leading-[1.58] transition-colors duration-200 text-[#3B3A37] group-data-[colored=true]/mary:text-[#FAF9F5]/92">
                {beat.note}
              </p>
            </div>
          </div>

          <div className="absolute bottom-5 md:bottom-7 inset-x-0 z-30">
            <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-20 flex flex-wrap items-end justify-between gap-4">
              <div className="inline-flex flex-wrap items-center gap-4 md:gap-6 px-4 py-2.5 rounded-2xl bg-[#FAF9F5]/92 backdrop-blur-md border border-[#141413]/12 text-[#141413] shadow-[0_8px_28px_rgba(20,20,19,0.08)]">
                <div>
                  <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                    Длина волны
                  </div>
                  <div className="font-mono-tech text-[13px] font-semibold">650 нм · 461 ТГц</div>
                </div>
                <div className="h-6 w-[1px] bg-[#141413]/12" />
                <div>
                  <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                    Колбочки сетчатки
                  </div>
                  <div className="font-mono-tech text-[13px] font-semibold">
                    L: {DEFAULT_650.lCone}% · M: {DEFAULT_650.mCone}%
                  </div>
                </div>
                <div className="h-6 w-[1px] bg-[#141413]/12 hidden sm:block" />
                <div className="hidden sm:block min-w-[190px]">
                  <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                    {isColoredPhase ? 'Переживание (Квалиа)' : 'Внутренний опыт'}
                  </div>
                  <span
                    ref={qualiaValueRef}
                    className="font-mono-tech text-[13px] font-semibold text-[#FC4109]"
                  >
                    0% · только числа
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:block w-28 h-[4px] rounded-full bg-[#FAF9F5]/30 ring-1 ring-[#FAF9F5]/16 overflow-hidden">
                  <div
                    ref={progressBarRef}
                    className="h-full w-full origin-left bg-[#FC4109]"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => openDossier('qualia-metamerism')}
                  className="v6-pill h-10 px-4 rounded-full bg-[#FAF9F5]/94 hover:bg-[#FAF9F5] text-[#141413] border border-[#141413]/15 shadow-[0_8px_24px_rgba(20,20,19,0.10)] backdrop-blur-md inline-flex items-center gap-2 text-[13px] font-medium cursor-pointer"
                >
                  <span>Досье: почему цвета нет в свете</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#004EDF]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BUG #3 FIX: Single Darkroom Optical Eyepiece Spectrometer (Zero duplicate drawer slider!) */}
      <div className="bg-[#FAF9F5] border-b border-[#141413]/10">
        <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 py-16 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                ОПЫТ РУКАМИ · ПОЧЕМУ ЦВЕТ ЖИВЁТ НЕ В СВЕТЕ
              </div>
              <h3 className="font-serif-editorial text-[28px] md:text-[32px] leading-[1.14] text-[#141413]">
                {ruTypo('Окуляр спектрометра: число, метамеризм и несуществующий пурпур')}
              </h3>
              <p className="text-[14.5px] leading-[1.64] text-[#454440]">
                {ruTypo(
                  'В сетчатке живут всего три типа датчиков — колбочки L, M и S. Они переводят бесцветную физику волн в три процента. Покрутите ползунок и нажмите «Пурпур» — вы увидите цвет, которого не существует ни в одном луче радуги.',
                )}
              </p>

              <DossierTrigger
                dossier="qualia-metamerism"
                label="Почему Деннет не верит в парадокс Мэри + метамеризм 580 нм"
                meta="Архивное досье II.1 · Уровень 2"
                className="w-full"
              />
            </div>

            <div className="lg:col-span-7">
              <NoesisInstrumentFrame
                code="ПРИБОР II.1 · ОКУЛЯР L / M / S"
                badge="self-test"
                telemetry={eyepiece.waveLabel}
                surface="darkroom"
                footnote="Колбочки S (442 нм) · M (538 нм) · L (595 нм) · Пурпур замыкает спектр в круг"
              >
                {/* Mode selector tabs */}
                <div className="flex flex-wrap gap-2 pb-5 border-b border-[#FAF9F5]/10">
                  {[
                    { id: 'single' as const, label: 'Один луч (420–690 нм)' },
                    { id: 'metamer' as const, label: 'Метамеризм (жёлтый обман)' },
                    { id: 'magenta' as const, label: 'Пурпур (нет в радуге!)' },
                  ].map((tab) => {
                    const active = specMode === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSpecMode(tab.id)}
                        className={`v6-pill px-3.5 py-1.5 rounded-full text-[12px] font-medium border cursor-pointer ${
                          active
                            ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5]'
                            : 'bg-[#191E28] text-[#FAF9F5]/78 border-[#FAF9F5]/14 hover:bg-[#222936]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Big 96px Leica Optical Eyepiece + Live Cone Bars */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-4 flex flex-col items-center justify-center">
                    <div className="relative w-28 h-28 rounded-full border border-[#FAF9F5]/22 p-2 bg-[#090B0E] flex items-center justify-center">
                      <div
                        className="w-full h-full rounded-full transition-colors duration-200 border border-[#FAF9F5]/15"
                        style={{ backgroundColor: eyepiece.hex }}
                      />
                      {/* Optical crosshair lines */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-4 top-1/2 h-[1px] bg-[#FAF9F5]/22"
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-4 left-1/2 w-[1px] bg-[#FAF9F5]/22"
                      />
                    </div>
                    <div className="mt-2.5 text-center font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#FAF9F5]/72">
                      {eyepiece.freqLabel}
                    </div>
                  </div>

                  <div className="sm:col-span-8 space-y-3.5">
                    <div>
                      <div className="font-display font-bold text-[17px] text-[#FAF9F5]">
                        {eyepiece.title}
                      </div>
                      <p className="text-[13px] leading-[1.58] text-[#C5CBD6] mt-1">
                        {ruTypo(eyepiece.explain)}
                      </p>
                    </div>

                    {/* Crisp L / M / S bar meters */}
                    <div className="grid grid-cols-3 gap-2.5 font-mono-tech text-[11px]">
                      {[
                        { label: 'L (длин.)', val: eyepiece.lCone, color: '#FC4109' },
                        { label: 'M (сред.)', val: eyepiece.mCone, color: '#10B981' },
                        { label: 'S (корот.)', val: eyepiece.sCone, color: '#60A5FA' },
                      ].map((cone) => (
                        <div
                          key={cone.label}
                          className="p-2.5 rounded-xl bg-[#181D27] border border-[#FAF9F5]/10"
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#9AA3B2]">
                            <span>{cone.label}</span>
                            <span className="text-[#FAF9F5] font-semibold">{cone.val}%</span>
                          </div>
                          <div className="mt-2 h-1.5 rounded-full bg-[#FAF9F5]/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-200"
                              style={{ width: `${cone.val}%`, backgroundColor: cone.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Wavelength Slider (active in single mode; moving it switches smoothly to single mode) */}
                <div className="mt-6 pt-4 border-t border-[#FAF9F5]/10 space-y-2">
                  <div className="flex items-center justify-between font-mono-tech text-[10.5px] text-[#9AA3B2]">
                    <span>ДЛИНА ВОЛНЫ · 420–690 НМ</span>
                    <span className="text-[#FAF9F5]">
                      {specMode === 'single' ? `${wavelength} нм` : 'Потяните для ручной настройки'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={420}
                    max={690}
                    value={wavelength}
                    onChange={(e) => {
                      setSpecMode('single');
                      setWavelength(Number(e.target.value));
                    }}
                    className="v6-wavelength-slider w-full cursor-pointer"
                    aria-label="Длина волны фотона от 420 до 690 нанометров"
                  />
                </div>
              </NoesisInstrumentFrame>
            </div>
          </div>

          {/* Quiet Poetic Domino Reflection (Single page-turn CTA lives cleanly in ActBottomTurn below!) */}
          <div className="pt-6 border-t border-[#141413]/10">
            <p className="font-serif-editorial italic text-[16.5px] leading-[1.6] text-[#353431] max-w-2xl">
              {ruTypo(
                'Если цвет рождается внутри нас, а не в луче света — как мозг достраивает целый трёхмерный мир и кто держит штурвал нашего «Я»?',
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
