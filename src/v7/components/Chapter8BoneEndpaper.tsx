import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Eye, RotateCcw, RotateCw, Share2 } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { ScholarPortraitSvg } from './ScholarMarginalia';
import { LabHonestyBadge } from '../../v9/components/NoesisInstrumentFrame';
import { assetUrl } from '../../v9/utils/assetUrl';
import { ruTypo } from '../../v9/utils/ruTypo';
import type { ActId } from '../../v9/utils/hashRouter';

interface Chapter8BoneEndpaperProps {
  onFooterInView: (inView: boolean) => void;
  onScrollTop: () => void;
  onSwitchAct?: (act: ActId, section?: string) => void;
}

const FIVE_TAKEAWAYS = [
  {
    num: '01',
    ref: 'Акт I · Гл. 01',
    title: 'Внутренний свет нельзя свести к шестерням и рефлексам',
    text: 'Декарт показал несомненность собственного опыта, Лейбниц — разрыв между деталями и чувством, Нагель — формулу «каково это», а Чалмерс — Трудную проблему.',
  },
  {
    num: '02',
    ref: 'Акт II · Гл. 02–03',
    title: 'Сознание — не прямой эфир, а управляемая галлюцинация',
    text: 'Цвет рождается в зрительной коре, внутренний экран у всех разный, а чтобы компенсировать задержку сигнала, мозг предсказывает мир и монтирует время (~80 мс).',
  },
  {
    num: '03',
    ref: 'Акт III · Гл. 04–06',
    title: 'Выключатель прячется в связности и клеточных мостиках',
    text: '69 млрд клеток мозжечка молчат, спор COGITATE 2025 пробил обе макротеории, а на уровне 5-го слоя коры пропофол разрывает кальциевый ствол пирамидального нейрона.',
  },
  {
    num: '04',
    ref: 'Акт IV · Гл. 07',
    title: 'Сознание горит там, где мы привыкли видеть тишину',
    text: 'Каждый четвёртый пациент в «вегетативной» коме сохраняет скрытый разум (NEJM 2024, порог PCI* 0.31), а Нью-Йоркская декларация 2024 признала вероятность опыта у осьминогов, крабов и пчёл.',
  },
  {
    num: '05',
    ref: 'Акт IV · Гл. 08',
    title: 'Блестящая речь машины — ещё не субъект внутри',
    text: 'Текст диалога можно сымитировать (73% с ролевой маской в тесте Тьюринга 2025) — а рождается ли подлинное чувство из одной лишь сложной архитектуры с петлями или требует живой биологической уязвимости, остаётся главным научным спором XXI века.',
  },
];

const BIBLIOGRAPHY = [
  {
    year: '1974 / 95',
    journal: 'Phil. Review / JCS',
    title: 'What Is It Like to Be a Bat? & Facing Up to the Problem of Consciousness',
    authors: 'T. Nagel (1974); D. J. Chalmers (1995)',
    note: 'Базовое определение субъективного опыта и разграничение «лёгких» (функциональных) и Трудной проблемы сознания.',
  },
  {
    year: '2025',
    journal: 'Nature, Vol. 642',
    title: 'Adversarial testing of global neuronal workspace and integrated information theories',
    authors: 'Cogitate Consortium (Ferrante, Melloni, Pitts, Mudrik и др., 12 лабораторий, N = 256)',
    note: 'Первая в истории масштабная состязательная проверка IIT и GNWT: обе теории получили эмпирические пробоины.',
  },
  {
    year: '2023/26',
    journal: 'Nature (2023 & Feb 2026)',
    title: 'A somato-cognitive action network alternates with effector regions in motor cortex (SCAN)',
    authors: 'E. M. Gordon, N. U. F. Dosenbach и др. (Nature 2023; Parkinson’s N = 863, Nature 2026)',
    note: 'Обновлённая карта моторной коры: три вставки сети SCAN связывают действие с планом, осанкой и внутренними органами.',
  },
  {
    year: '2000/22',
    journal: 'Science (2000) / eLife (2022)',
    title: 'Motion Integration and Postdiction in Visual Awareness & The pupillary light response in aphantasia',
    authors: 'D. M. Eagleman & T. J. Sejnowski (Science 2000); L. Kay, J. Pearson и др. (eLife 2022)',
    note: 'Окно постдикции ~80 мс при монтаже настоящего момента и зрачковый рефлекс как объективный маркер внутреннего экрана.',
  },
  {
    year: '2024',
    journal: 'New England Journal of Medicine',
    title: 'Cognitive Motor Dissociation in Disorders of Consciousness',
    authors: 'Bodien, Allanson, Cardone, Claassen, Schiff и др. (август 2024, N = 241)',
    note: 'У 25% внешне не реагирующих пациентов в коме (60 из 241) выявлено сохранное скрытое сознание.',
  },
  {
    year: '2024',
    journal: 'New York University · 19 апреля 2024',
    title: 'The New York Declaration on Animal Consciousness',
    authors: 'Andrews, Birch, Sebo и 40+ ведущих нейробиологов и философов',
    note: 'Зафиксирована реалистичная вероятность субъективного опыта у головоногих, крабов, пчёл, рыб и рептилий.',
  },
  {
    year: '2024–25',
    journal: 'Anthropic Research Reports',
    title: 'Scaling Monosemanticity, Circuit Tracing & Emergent Introspective Awareness in LLMs',
    authors: 'Anthropic Interpretability Team; K. Fish (Model Welfare, 2024–2025)',
    note: 'Механистическое вскрытие весов (SAE / Golden Gate Claude), трассировка цепей, слабый самомониторинг (~20%) и программа «Благополучие моделей».',
  },
  {
    year: '2024–26',
    journal: 'Google DeepMind / Research',
    title: 'Simulacra as Conscious Exotica & AI Consciousness: Tractable Questions',
    authors: 'M. Shanahan (Google DeepMind, 2024/2026); B. Agüera y Arcas (Google Fellow, 2025)',
    note: 'Анализ LLM как симулякров ролей, феномена «воспринимаемого сознания» и роли отношений заботы в споре о правах машин.',
  },
  {
    year: '2025',
    journal: 'arXiv / UCSD (март 2025)',
    title: 'Large Language Models Pass the Turing Test',
    authors: 'C. R. Jones & B. K. Bergen (UC San Diego, N = 500)',
    note: 'Языковая модель с ролевой маской была принята за человека в 73% диалогов против 36% у базовой версии.',
  },
  {
    year: '2025',
    journal: 'Trends in Cognitive Sciences',
    title: 'Identifying Indicators of Consciousness in AI Systems',
    authors: 'Butlin, Long, Bayne, Bengio, Birch, Chalmers и др. (20 авторов)',
    note: 'Систематический набор качественных архитектурных индикаторов, отделяющий имитацию речи от субъектности.',
  },
  {
    year: '2021–25',
    journal: 'JAI / Faber / BBS',
    title: 'Artificial Suffering (Moratorium 2050) & Biological Naturalism (Being You)',
    authors: 'T. Metzinger (2021); A. K. Seth (2021–2025)',
    note: 'Аргумент о глобальном моратории на синтетическую субъектность до 2050 года и биологический натурализм против отождествления кода с живым опытом.',
  },
  {
    year: '2009 / 14',
    journal: 'J. Comp. Neurol. / Brain',
    title: 'Equal numbers of neuronal and nonneuronal cells & Complete cerebellar agenesis',
    authors: 'F. A. C. Azevedo, S. Herculano-Houzel и др. (2009); F. Yu и др. (Brain 2014)',
    note: '69 млрд нейронов в мозжечке против 16 млрд в коре — и сохранное сознание при полном отсутствии мозжечка.',
  },
  {
    year: '2025',
    journal: 'Science, Vol. 388',
    title: 'Human high-order thalamic nuclei gate conscious perception',
    authors: 'Z. Fang, M. Zhang и др. (апрель 2025)',
    note: 'Глубинные ядра Высшего таламуса опережают префронтальную кору в тета-диапазоне 2–8 Гц при рождении осознанного образа.',
  },
  {
    year: '2020',
    journal: 'Cell, Vol. 180',
    title: 'General Anesthesia Decouples Cortical Pyramidal Neurons',
    authors: 'M. Suzuki & M. E. Larkum',
    note: 'Наркоз разрывает кальциевую связку в стволе пирамидальных нейронов 5-го слоя между прогнозами и сенсорным входом.',
  },
];

/**
 * ACT V · CHAPTER VIII: "Синтез, Форзац и Эхо первой секунды" (Bug #11 Fixes!):
 * 1. Persistent localStorage state survives F5 and Act switching cleanly!
 * 2. Honest precondition-masked consistency stamp + clickable missing Passport cells jump straight to their Act!
 * 3. Honest spoiler-free Share button: includes actual live base URL, uses safe textarea fallback, NEVER lies in catch!
 * 4. Safe two-step "Сбросить протокол" button in the colophon + assetUrl() for Mooney probe!
 */
export function Chapter8BoneEndpaper({
  onFooterInView,
  onScrollTop,
  onSwitchAct,
}: Chapter8BoneEndpaperProps) {
  const {
    state,
    setMooneyResult,
    resetAllState,
    icuStats,
    consistency,
  } = useExplorer();

  const [flipped, setFlipped] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [inlineReveal, setInlineReveal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);
  const shareTimerRef = useRef<number | null>(null);
  const inlineRevealTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current !== null) window.clearTimeout(shareTimerRef.current);
      if (inlineRevealTimerRef.current !== null) window.clearTimeout(inlineRevealTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => onFooterInView(entry.isIntersecting),
      { rootMargin: '-8% 0px -78% 0px', threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onFooterInView]);

  const handleShareSpoilerFree = async () => {
    const cleanBaseUrl = typeof window !== 'undefined' ? `${window.location.href.split('#')[0]}#/act-1` : '';
    const intro = state.mooneyExposed
      ? `Я прошёл интерактивную книгу о сознании NOESIS:`
      : `Я проверил свою картину сознания в книге NOESIS:`;
    const text = `${intro} верно поставил ${icuStats.correct}/3 диагнозов в реанимации и получил штамп «${consistency.stampTitle}». Проверьте свой мозг без спойлеров: ${cleanBaseUrl}`;

    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }

    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }

    setShareStatus(ok ? 'copied' : 'error');
    if (shareTimerRef.current !== null) window.clearTimeout(shareTimerRef.current);
    shareTimerRef.current = window.setTimeout(() => {
      shareTimerRef.current = null;
      setShareStatus('idle');
    }, 2800);
  };

  const handleInlineMooneyReveal = () => {
    setInlineReveal(true);
    if (!state.mooneyExposed) {
      setMooneyResult(1.2);
    }
    if (inlineRevealTimerRef.current !== null) window.clearTimeout(inlineRevealTimerRef.current);
    inlineRevealTimerRef.current = window.setTimeout(() => {
      inlineRevealTimerRef.current = null;
      setInlineReveal(false);
    }, 1200);
  };

  const marySummary =
    state.maryBet === 'learns_new'
      ? 'Узнает новое (Квалиа)'
      : state.maryBet === 'knows_all'
        ? 'Ничего нового (Физикализм)'
        : 'Без ставки →';

  const cogitateSummary =
    state.cogitateBet === 'iit'
      ? 'Ставка на IIT (Затылок)'
      : state.cogitateBet === 'gnwt'
        ? 'Ставка на GNWT (Лоб)'
        : state.cogitateBet === 'draw'
          ? 'Угадали: обе пробиты'
          : 'Без ставки →';

  const jumpCell = (act: ActId, sec?: string) => {
    if (onSwitchAct) onSwitchAct(act, sec);
  };

  return (
    <section
      id="ch-8"
      className="relative bg-[#FAF9F5] text-[#141413]"
      aria-label="Глава 08 — Синтез, Форзац и Контрольная проба № 00"
    >
      {/* PART 8.1: SYNTHESIS SPREAD */}
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 pt-24 pb-16 md:pt-28 md:pb-20 border-b border-[#141413]/10">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">АКТ IV · ГЛАВА 08 · СИНТЕЗ И ФОРЗАЦ</span>
          <span>ИТОГИ КНИГИ · стр. 138</span>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,56px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Пять вещей, которые</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                теперь нельзя развидеть.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15px] leading-[1.62] text-[#454440]">
            <p>
              {ruTypo(
                'Трудная проблема сознания всё ещё открыта — новое пари Коха и Чалмерса тикает до 2048 года. Но за последние пять лет наука собрала пять твёрдых фактов, навсегда меняющих взгляд на себя.',
              )}
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {FIVE_TAKEAWAYS.map((item) => (
            <div
              key={item.num}
              className="rounded-2xl border border-[#141413]/12 bg-[#F4F2EA] p-5 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em]">
                  <span className="text-[#FC4109] font-semibold">{item.num}</span>
                  <span className="text-[#5E5D59]">{item.ref}</span>
                </div>
                <h3 className="font-display font-bold text-[15.5px] leading-snug text-[#141413] mt-2.5">
                  {ruTypo(item.title)}
                </h3>
                <p className="text-[13px] leading-[1.56] text-[#454440] mt-2">{ruTypo(item.text)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PART 8.2: 3D-FLIPPABLE COTTON "BONE" EX-LIBRIS CARD */}
      <div className="max-w-[1160px] mx-auto px-5 md:px-12 lg:px-20 py-16 md:py-24 border-b border-[#141413]/10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
            ЭКСЛИБРИС · КОНТРОЛЬНАЯ ПРОБА № 00
          </div>
          <h3 className="text-[clamp(28px,4vw,46px)] leading-[1.08] tracking-[-0.03em]">
            <span className="font-display font-bold">Ваш паспорт исследователя</span>
            <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
              и эхо первой секунды.
            </span>
          </h3>
          <p className="text-[15px] leading-[1.6] text-[#4A4945]">
            В задний карман этой книги вложена плотная хлопковая карточка оттенка{' '}
            <span className="font-serif-editorial italic text-[#141413]">Bone</span>. Все ваши ставки сохраняются автоматически — изучите свой итог, а затем переверните карточку на оборот.
          </p>
        </div>

        <div className="mt-10 max-w-3xl mx-auto [perspective:1600px]">
          <div
            className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* FRONT FACE: BONE EXPLORER PASSPORT */}
            <div
              aria-hidden={flipped}
              inert={flipped}
              className={`rounded-[24px] bg-[#EFECE2] border border-[#141413]/18 p-5 sm:p-6 md:p-10 shadow-[0_28px_72px_rgba(20,20,19,0.10)] [backface-visibility:hidden] ${
                flipped ? 'pointer-events-none' : ''
              }`}
              style={{
                backgroundImage:
                  'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.55) 0%, rgba(239,236,226,0) 60%)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/14 font-mono-tech text-[10px] uppercase tracking-[0.16em] text-[#5E5D59]">
                <span>EX LIBRIS · NOESIS · ИЗДАНИЕ 2026</span>
                <span>БУМАГА: BONE · 420 Г/М² · РЕЛЬЕФНАЯ ПЕЧАТЬ</span>
              </div>

              {/* 8 Interactive Summary Cells (2x4 Swiss Specimen Grid — clicking jumps straight to that Act!) */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <button
                  type="button"
                  onClick={() => jumpCell('act-1', 'plate-00')}
                  className="text-left p-3.5 rounded-xl bg-[#FAF9F5]/85 hover:bg-[#FAF9F5] border border-[#141413]/10 hover:border-[#141413]/28 transition-colors cursor-pointer"
                >
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Акт I · Кот Муни
                  </div>
                  <div className="font-display font-bold text-[17px] mt-1 text-[#141413]">
                    {state.mooneyExposed ? 'Проявлен ✓' : 'Пройти →'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => jumpCell('act-1', 'ch-01')}
                  className="text-left p-3.5 rounded-xl bg-[#FAF9F5]/85 hover:bg-[#FAF9F5] border border-[#141413]/10 hover:border-[#141413]/28 transition-colors cursor-pointer"
                >
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Акт I · Гл. 01 с нуля
                  </div>
                  <div className="font-display font-semibold text-[14.5px] mt-1.5 text-[#141413]">
                    {state.ch1Explored ? 'Разобрано ✓' : 'Открыть →'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => jumpCell('act-2', 'ch-1')}
                  className="text-left p-3.5 rounded-xl bg-[#FAF9F5]/85 hover:bg-[#FAF9F5] border border-[#141413]/10 hover:border-[#141413]/28 transition-colors cursor-pointer"
                >
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Акт II · Комната Мэри
                  </div>
                  <div className="font-display font-semibold text-[14.5px] mt-1.5 text-[#141413] leading-snug">
                    {marySummary}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => jumpCell('act-2', 'ch-aphantasia')}
                  className="text-left p-3.5 rounded-xl bg-[#FAF9F5]/85 hover:bg-[#FAF9F5] border border-[#141413]/10 hover:border-[#141413]/28 transition-colors cursor-pointer"
                >
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Акт II · Экран (Афантазия)
                  </div>
                  <div className="font-display font-bold text-[19px] mt-1 text-[#004EDF]">
                    {state.aphantasiaScore !== null ? `${state.aphantasiaScore} / 5` : '5-сек тест →'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => jumpCell('act-3', 'ch-4')}
                  className="text-left p-3.5 rounded-xl bg-[#FAF9F5]/85 hover:bg-[#FAF9F5] border border-[#141413]/10 hover:border-[#141413]/28 transition-colors cursor-pointer"
                >
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Акт III · COGITATE 2025
                  </div>
                  <div className="font-display font-semibold text-[14.5px] mt-1.5 text-[#141413] leading-snug">
                    {cogitateSummary}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => jumpCell('act-4', 'ch-6')}
                  className="text-left p-3.5 rounded-xl bg-[#FAF9F5]/85 hover:bg-[#FAF9F5] border border-[#141413]/10 hover:border-[#141413]/28 transition-colors cursor-pointer"
                >
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Акт IV · Реанимация
                  </div>
                  <div
                    className={`font-display font-bold text-[19px] mt-1 ${
                      icuStats.correct > 0 ? 'text-[#0D7A5F]' : 'text-[#5E5D59]'
                    }`}
                  >
                    {icuStats.correct} / {icuStats.total} верных
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => jumpCell('act-4', 'ch-7')}
                  className="text-left p-3.5 rounded-xl bg-[#FAF9F5]/85 hover:bg-[#FAF9F5] border border-[#141413]/10 hover:border-[#141413]/28 transition-colors cursor-pointer"
                >
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Акт IV · Ляссе NY 2024
                  </div>
                  <div className="font-display font-semibold text-[14.5px] mt-1.5 text-[#141413]">
                    {!state.ribbonChecked
                      ? 'Сверить →'
                      : state.ribbonBoundaryIndex === 1
                        ? 'Совпало с NY 2024'
                        : state.ribbonBoundaryIndex === 0
                          ? 'Все 6 (даже губка!)'
                          : `Отсекли ${state.ribbonBoundaryIndex} из 6`}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => jumpCell('act-4', 'ch-7-tribunal')}
                  className="text-left p-3.5 rounded-xl bg-[#FAF9F5]/85 hover:bg-[#FAF9F5] border border-[#141413]/10 hover:border-[#141413]/28 transition-colors cursor-pointer"
                >
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Акт IV · Позиция по ИИ
                  </div>
                  <div className="font-display font-semibold text-[14.5px] mt-1.5 text-[#141413]">
                    {state.aiVerdict === 'biology'
                      ? 'Только биология'
                      : state.aiVerdict === 'robot'
                        ? 'Воплощённый робот'
                        : state.aiVerdict === 'agent'
                          ? 'Автономный агент'
                          : state.aiVerdict === 'llm'
                            ? 'Уже у LLM'
                            : state.aiVerdict === 'undecided'
                              ? 'Пока не решить'
                              : 'Сделать ставку →'}
                  </div>
                </button>
              </div>

              {/* Precondition-Masked Honest Editorial Consistency Stamp (full-width commentary on mobile!) */}
              <div className="mt-5 sm:mt-6 rounded-xl bg-[#FAF9F5] border border-[#141413]/14 p-4 sm:p-5 space-y-3 sm:space-y-0 sm:flex sm:items-start sm:gap-4">
                <div className="flex items-center gap-3.5 sm:block shrink-0">
                  <ScholarPortraitSvg
                    id={consistency.author}
                    size={52}
                    gesture={consistency.isContradiction ? 'slash' : 'eyebrow'}
                  />
                  <div className="sm:hidden min-w-0 flex-1 space-y-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded border font-mono-tech text-[10px] uppercase tracking-[0.12em] font-bold ${
                        consistency.isIncomplete
                          ? 'border-[#5E5D59] text-[#5E5D59] bg-[#EAE7DD]'
                          : consistency.isContradiction
                            ? 'border-[#FC4109] text-[#FC4109] bg-[#FC4109]/8'
                            : consistency.isPolemic
                              ? 'border-[#004EDF] text-[#004EDF] bg-[#004EDF]/8'
                              : 'border-[#0D7A5F] text-[#0D7A5F] bg-[#0D7A5F]/8'
                      }`}
                    >
                      {consistency.stampTitle}
                    </span>
                    <div className="font-mono-tech text-[10px] text-[#5E5D59]">
                      {consistency.stampSubtitle}
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="hidden sm:flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded border font-mono-tech text-[10.5px] uppercase tracking-[0.14em] font-bold ${
                        consistency.isIncomplete
                          ? 'border-[#5E5D59] text-[#5E5D59] bg-[#EAE7DD]'
                          : consistency.isContradiction
                            ? 'border-[#FC4109] text-[#FC4109] bg-[#FC4109]/8'
                            : consistency.isPolemic
                              ? 'border-[#004EDF] text-[#004EDF] bg-[#004EDF]/8'
                              : 'border-[#0D7A5F] text-[#0D7A5F] bg-[#0D7A5F]/8'
                      }`}
                    >
                      {consistency.stampTitle}
                    </span>
                    <span className="font-mono-tech text-[10px] text-[#5E5D59]">
                      {consistency.stampSubtitle}
                    </span>
                  </div>
                  <p className="font-serif-editorial italic text-[14.5px] leading-[1.58] text-[#282725] sm:mt-2.5">
                    «{ruTypo(consistency.commentary)}»
                  </p>
                </div>
              </div>

              {/* Flip & Honest Share CTA */}
              <div className="mt-5 sm:mt-6 pt-5 border-t border-[#141413]/12 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  className="v6-pill min-h-[48px] px-5 sm:px-6 py-2.5 rounded-full bg-[#FC4109] hover:bg-[#E43806] text-[#FAF9F5] font-sans-ui text-[13.5px] sm:text-[14px] font-medium inline-flex items-center justify-center gap-2.5 shadow-[0_12px_30px_rgba(252,65,9,0.28)] cursor-pointer"
                >
                  <RotateCw className="w-4 h-4 shrink-0" />
                  <span>Перевернуть карточку · Контрольная проба № 00</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareSpoilerFree}
                  className="v6-pill h-11 px-4 rounded-full bg-[#FAF9F5] hover:bg-[#E4E0D4] text-[#141413] border border-[#141413]/16 font-sans-ui text-[13px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {shareStatus === 'copied' ? (
                    <Check className="w-4 h-4 text-[#0D7A5F]" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  <span>
                    {shareStatus === 'copied'
                      ? 'Ссылка и итог скопированы!'
                      : shareStatus === 'error'
                        ? 'Буфер недоступен'
                        : 'Поделиться ссылкой'}
                  </span>
                </button>
              </div>
            </div>

            {/* BACK FACE: CONTROL PROBE #00 */}
            <div
              aria-hidden={!flipped}
              inert={!flipped}
              className={`absolute inset-0 rounded-[24px] bg-[#141413] text-[#FAF9F5] border border-[#141413] p-5 sm:p-6 md:p-10 shadow-[0_28px_72px_rgba(20,20,19,0.20)] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between ${
                !flipped ? 'pointer-events-none' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#FAF9F5]/14 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#9EA4B0]">
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span className="text-[#FC4109] font-semibold">ОБОРОТ · КОНТРОЛЬНАЯ ПРОБА № 00</span>
                  <LabHonestyBadge badge="self-test" dark />
                </span>
                <span>0% ИЗМЕНЁННЫХ ПИКСЕЛЕЙ</span>
              </div>

              <div className="my-4 sm:my-5 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
                <div className="md:col-span-5">
                  <div className="relative aspect-square w-full max-w-[220px] sm:max-w-[240px] mx-auto rounded-xl overflow-hidden border border-[#FAF9F5]/20 bg-[#141413]">
                    <img
                      src={assetUrl('/v7/mooney-blob.png')}
                      alt="Та самая неизменённая клякса Муни с первой секунды книги"
                      className="w-full h-full object-cover select-none"
                    />
                    <img
                      src={assetUrl('/v7/mooney-key.jpg')}
                      alt="Проявленный снимок"
                      className="absolute inset-0 w-full h-full object-cover select-none"
                      style={{
                        opacity: inlineReveal ? 1 : 0,
                        transition: inlineReveal ? 'opacity 200ms ease' : 'opacity 1400ms ease',
                      }}
                    />
                  </div>
                </div>

                <div className="md:col-span-7 space-y-3 sm:space-y-4">
                  <div className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#FC4109]">
                    ЭХО ПЕРВОЙ СЕКУНДЫ
                  </div>
                  <h3 className="font-display font-bold text-[22px] sm:text-[24px] md:text-[28px] leading-tight">
                    {state.mooneyExposed
                      ? 'Попробуйте прямо сейчас снова увидеть просто шум.'
                      : 'Вы пропустили первый оттиск — проявите его прямо здесь!'}
                  </h3>
                  <p className="font-serif-editorial italic text-[15px] sm:text-[16px] leading-[1.6] text-[#DCE0E8]">
                    {ruTypo(
                      state.mooneyExposed
                        ? 'В начале этой книги вы смотрели на этот снимок и видели только хаос чёрно-белых пятен. Сейчас на экране — тот же самый файл, пиксель в пиксель. Но ваш мозг больше никогда не вернётся в прежнее состояние: он навсегда записал этот приор.'
                        : 'Посмотрите на эти пятна — пока это просто чёрно-белый хаос. Нажмите кнопку ниже на секунду, и ваш мозг за долю секунды навсегда перестроит восприятие этого кадра.',
                    )}
                  </p>
                  {!state.mooneyExposed && (
                    <button
                      type="button"
                      onClick={handleInlineMooneyReveal}
                      className="v6-pill h-10 px-4 rounded-full bg-[#FC4109] hover:bg-[#E43806] text-[#FAF9F5] font-sans-ui text-[13px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Проявить снимок прямо здесь</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#FAF9F5]/14 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  className="v6-pill h-11 sm:h-10 px-5 rounded-full bg-[#FAF9F5] hover:bg-[#E6E3D8] text-[#141413] font-sans-ui text-[13px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Вернуться к Паспорту</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareSpoilerFree}
                  className="v6-pill h-11 sm:h-10 px-5 rounded-full bg-[#FC4109] hover:bg-[#E43806] text-[#FAF9F5] font-sans-ui text-[13px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {shareStatus === 'copied' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>
                    {shareStatus === 'copied'
                      ? 'Ссылка и итог скопированы!'
                      : shareStatus === 'error'
                        ? 'Буфер недоступен'
                        : 'Отправить другу без спойлера'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BIBLIOGRAPHY */}
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 py-20 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#141413]/12">
          <div>
            <div className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#FC4109]">
              БИБЛИОГРАФИЯ · ПЕРВОИСТОЧНИКИ 2020–2026
            </div>
            <h3 className="font-display font-bold text-[28px] md:text-[36px] mt-2 leading-tight">
              На чём основана эта книга
            </h3>
          </div>
          <p className="font-serif-editorial italic text-[15px] text-[#5E5D59] max-w-md">
            Никакой эзотерики и устаревших мифов — каждая цифра в NOESIS опирается на рецензируемые журналы (Nature, Science, NEJM, Cell, TiCS) и открытые исследовательские доклады ведущих лабораторий.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BIBLIOGRAPHY.map((paper) => (
            <article
              key={paper.title}
              className="rounded-2xl border border-[#141413]/12 bg-[#F4F2EA] p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between font-mono-tech text-[10.5px] uppercase tracking-[0.11em]">
                  <span className="text-[#FC4109] font-semibold">{paper.year}</span>
                  <span className="text-[#5E5D59]">{paper.journal}</span>
                </div>
                <h4 className="font-display font-bold text-[15.5px] leading-snug text-[#141413] mt-2.5">
                  {paper.title}
                </h4>
                <div className="font-mono-tech text-[11px] text-[#5E5D59] mt-1.5">{paper.authors}</div>
              </div>
              <p className="text-[13.5px] leading-[1.58] text-[#3B3A37] pt-3 border-t border-[#141413]/10">
                {ruTypo(paper.note)}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* OBSIDIAN BOOK COLOPHON FOOTER */}
      <footer
        id="book-colophon-footer"
        ref={footerRef}
        data-hud-theme="dark"
        className="bg-[#141413] text-[#FAF9F5] py-16 md:py-20"
      >
        <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2.5 font-display font-bold text-[15px] tracking-[0.1em]">
              <span>NOESIS</span>
              <span className="w-2 h-2 rounded-full bg-[#FC4109]" />
            </div>
            <p className="font-serif-editorial italic text-[17px] leading-[1.55] text-[#D0D3DC]">
              {ruTypo(
                'Интерактивный атлас сознания: от одного пятна света на сетчатке до границ живого и синтетического разума.',
              )}
            </p>
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#8E939E] pt-1">
              КОЛОФОН · 4 АКТА · 8 ГЛАВ · SHOWREEL EDITION · ПРОТОКОЛ СОХРАНЯЕТСЯ ЛОКАЛЬНО · 2026
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="v6-pill h-11 px-4 rounded-full bg-[#FAF9F5]/8 hover:bg-[#FAF9F5]/16 text-[#C8CDD6] border border-[#FAF9F5]/16 font-mono-tech text-[11px] uppercase tracking-[0.1em] inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить протокол</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetAllState();
                    setConfirmReset(false);
                  }}
                  className="v6-pill h-11 px-4 rounded-full bg-[#C92A2A] text-[#FAF9F5] font-mono-tech text-[11px] uppercase tracking-[0.1em] cursor-pointer"
                >
                  Очистить всё
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="v6-pill h-11 px-3.5 rounded-full bg-[#FAF9F5]/12 text-[#FAF9F5] font-mono-tech text-[11px] uppercase cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => (onSwitchAct ? onSwitchAct('act-1', 'plate-00') : onScrollTop())}
              className="v6-pill h-11 px-5 rounded-full bg-[#FAF9F5] hover:bg-[#E6E3D8] text-[#141413] font-sans-ui text-[13.5px] font-medium inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Вернуться к Акту I</span>
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
