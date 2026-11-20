import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Eye, RotateCw, Share2 } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { ScholarPortraitSvg } from './ScholarMarginalia';

interface Chapter8BoneEndpaperProps {
  onFooterInView: (inView: boolean) => void;
  onScrollTop: () => void;
}

const FIVE_TAKEAWAYS = [
  {
    num: '01',
    ref: 'Гл. I & III',
    title: 'Сознание — не фотография, а управляемая галлюцинация',
    text: 'В природе нет красок, есть только волны. Мозг непрерывно строит прогноз реальности и правит его лишь тогда, когда мир бьёт по ожиданиям ошибкой.',
  },
  {
    num: '02',
    ref: 'Гл. II',
    title: 'Внутри головы нет единого «директора»',
    text: 'Говорящее левое полушарие — блестящий пресс-секретарь, который мгновенно сочиняет правдоподобное алиби для действий, причин которых сам не знает.',
  },
  {
    num: '03',
    ref: 'Гл. IV & V',
    title: 'Выключатель прячется в связности и клеточных мостиках',
    text: 'Спор 2025 года пробил обе макротеории. На клеточном уровне свет сознания зависит от того, сшивает ли пирамидальный нейрон прогнозы с миром.',
  },
  {
    num: '04',
    ref: 'Гл. VI',
    title: 'Сознание можно услышать даже в полной тишине',
    text: 'Каждый четвёртый пациент в «вегетативной» коме сохраняет скрытый разум — и радар сложности эха PCI* (порог 0.31) помогает его услышать.',
  },
  {
    num: '05',
    ref: 'Гл. VII',
    title: 'Разум шире человеческой коры — но речь ИИ ещё не чувство',
    text: 'Осьминоги, крабы и пчёлы официально вошли в круг вероятных носителей опыта. А машине недостаточно красиво говорить «мне страшно» — важна её архитектура и уязвимость.',
  },
];

const BIBLIOGRAPHY = [
  {
    year: '2025',
    journal: 'Nature, Vol. 642',
    title: 'Adversarial testing of global neuronal workspace and integrated information theories',
    authors: 'Cogitate Consortium (Ferrante, Melloni, Pitts, Mudrik и др., 12 лабораторий, N = 256)',
    note: 'Первая в истории масштабная состязательная проверка IIT и GNWT: обе теории получили эмпирические пробоины.',
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
    year: '2025',
    journal: 'Trends in Cognitive Sciences',
    title: 'Identifying Indicators of Consciousness in AI Systems',
    authors: 'Butlin, Long, Bayne, Bengio, Birch, Chalmers и др.',
    note: 'Систематический набор архитектурных индикаторов, отделяющий имитацию речи от субъектности.',
  },
  {
    year: '2020',
    journal: 'Cell, Vol. 180',
    title: 'General Anesthesia Decouples Cortical Pyramidal Neurons',
    authors: 'M. Suzuki & M. E. Larkum',
    note: 'Наркоз разрывает кальциевую связку в стволе пирамидальных нейронов 5-го слоя между прогнозами и сенсорным входом.',
  },
  {
    year: '2024',
    journal: 'Nature / Annals of Neurology',
    title: 'Psilocybin Desynchronizes the Human Brain & PCI* = 0.31 Calibration',
    authors: 'Siegel et al. (Nature, 2024); Casarotto, Massimini et al. (N = 150)',
    note: 'Механизм перестройки привычных сетей мозга под псилоцибином через рецепторы 5-HT2A и клинический порог сложности PCI* = 0.31.',
  },
];

/**
 * CHAPTER VIII: "Синтез, Форзац и Эхо первой секунды"
 * Upgraded v8:
 * 1. NEW Synthesis Spread ("5 вещей, которые теперь нельзя развидеть" + honest 2048 open wager coda!)
 * 2. Honest Explorer Passport (if < 3 experiments done -> "НЕЗАПОЛНЕННЫЙ ПРОТОКОЛ")
 * 3. Honest Back Face Control Probe #0: if reader skipped Plate 00, offers inline "Проявить снимок прямо здесь"!
 */
export function Chapter8BoneEndpaper({ onFooterInView, onScrollTop }: Chapter8BoneEndpaperProps) {
  const { state, setMooneyResult, icuStats, activeTribunalCount, consistency } = useExplorer();
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inlineReveal, setInlineReveal] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);

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
    const blindText = state.mooneySeconds ? `${state.mooneySeconds.toFixed(1)} сек` : 'несколько секунд';
    const text = `Я прошёл интерактивную книгу о сознании NOESIS: ${blindText} не узнавал первый оттиск, верно поставил ${icuStats.correct}/3 диагнозов в реанимации и получил штамп «${consistency.stampTitle}». Проверь свой мозг без спойлеров!`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    }
  };

  const handleInlineMooneyReveal = () => {
    setInlineReveal(true);
    if (!state.mooneyExposed) {
      setMooneyResult(1.2);
    }
    window.setTimeout(() => setInlineReveal(false), 1200);
  };

  const marySummary =
    state.maryBet === 'learns_new'
      ? 'Узнает новое (Квалиа)'
      : state.maryBet === 'knows_all'
        ? 'Ничего нового (Физикализм)'
        : 'Без ставки';

  const cogitateSummary =
    state.cogitateBet === 'iit'
      ? 'Ставка на IIT (Затылок)'
      : state.cogitateBet === 'gnwt'
        ? 'Ставка на GNWT (Лоб)'
        : state.cogitateBet === 'draw'
          ? 'Угадал: обе пробиты'
          : 'Без ставки';

  return (
    <section id="ch-8" className="relative bg-[#FAF9F5] text-[#141413]" aria-label="Глава VIII — Синтез, Форзац и Контрольная проба №0">
      {/* PART 8.1: SYNTHESIS SPREAD — "5 ВЕЩЕЙ, КОТОРЫЕ ТЕПЕРЬ НЕЛЬЗЯ РАЗВИДЕТЬ" */}
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 pt-24 pb-16 md:pt-28 md:pb-20 border-b border-[#141413]/10">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ЧАСТЬ III · ГЛАВА VIII · СИНТЕЗ И ФОРЗАЦ</span>
          <span>ИТОГИ КНИГИ · стр. 118</span>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,56px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Пять вещей, которые</span>
              <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
                теперь нельзя развидеть.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15px] leading-[1.62] text-[#454440]">
            <p>
              Трудная проблема сознания всё ещё открыта — новое пари Коха и Чалмерса тикает до 2048 года. Но за последние пять лет наука собрала пять твёрдых фактов, навсегда меняющих взгляд на себя.
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
                  {item.title}
                </h3>
                <p className="text-[13px] leading-[1.56] text-[#454440] mt-2">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PART 8.2: ENDPAPER SPREAD — 3D-FLIPPABLE COTTON "BONE" EX-LIBRIS CARD */}
      <div className="max-w-[1160px] mx-auto px-5 md:px-12 lg:px-20 py-16 md:py-24 border-b border-[#141413]/10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
            ЭКСЛИБРИС · КОНТРОЛЬНАЯ ПРОБА № 0
          </div>
          <h3 className="text-[clamp(28px,4vw,46px)] leading-[1.08] tracking-[-0.03em]">
            <span className="font-display font-bold">Ваш паспорт исследователя</span>
            <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
              и эхо первой секунды.
            </span>
          </h3>
          <p className="text-[15px] leading-[1.6] text-[#4A4945]">
            В задний карман этой книги вложена плотная хлопковая карточка оттенка{' '}
            <span className="font-serif-editorial italic text-[#141413]">Bone</span>. Изучите свой итог — а затем обязательно переверните её на оборот.
          </p>
        </div>

        {/* 3D PERSPECTIVE FLIPPABLE HEAVYWEIGHT COTTON BONE CARD */}
        <div className="mt-10 max-w-3xl mx-auto [perspective:1600px]">
          <div
            className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* FRONT FACE: HEAVYWEIGHT COTTON "BONE" EXPLORER PASSPORT */}
            <div
              className="rounded-[24px] bg-[#EFECE2] border border-[#141413]/18 p-6 md:p-10 shadow-[0_28px_72px_rgba(20,20,19,0.10)] [backface-visibility:hidden]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.55) 0%, rgba(239,236,226,0) 60%)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/14 font-mono-tech text-[10px] uppercase tracking-[0.16em] text-[#5E5D59]">
                <span>EX LIBRIS · NOESIS · ИЗДАНИЕ 2026</span>
                <span>БУМАГА: BONE · 420 Г/М² · РЕЛЬЕФНАЯ ПЕЧАТЬ</span>
              </div>

              {/* 6-Cell Empirical Journey Summary */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-[#FAF9F5]/80 border border-[#141413]/10">
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Табл. 00 · Слепота
                  </div>
                  <div className="font-display font-bold text-[19px] mt-1 text-[#141413]">
                    {state.mooneySeconds ? `${state.mooneySeconds.toFixed(1)} сек` : 'Не пройдено'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F5]/80 border border-[#141413]/10">
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Гл. I · Комната Мэри
                  </div>
                  <div className="font-display font-semibold text-[14.5px] mt-1.5 text-[#141413] leading-snug">
                    {marySummary}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F5]/80 border border-[#141413]/10">
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Гл. IV · COGITATE 2025
                  </div>
                  <div className="font-display font-semibold text-[14.5px] mt-1.5 text-[#141413] leading-snug">
                    {cogitateSummary}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F5]/80 border border-[#141413]/10">
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Гл. VI · Реанимация
                  </div>
                  <div className="font-display font-bold text-[19px] mt-1 text-[#0D7A5F]">
                    {icuStats.correct} / {icuStats.total} верных
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F5]/80 border border-[#141413]/10">
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Гл. VII · Ляссе (виды)
                  </div>
                  <div className="font-display font-semibold text-[14.5px] mt-1.5 text-[#141413]">
                    {state.ribbonBoundaryIndex === 1
                      ? 'Совпало с NY 2024'
                      : state.ribbonBoundaryIndex === 0
                        ? 'Все 6 (даже губка!)'
                        : `Отсекли ${state.ribbonBoundaryIndex} из 6`}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F5]/80 border border-[#141413]/10">
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59]">
                    Гл. VII · Трибунал ИИ
                  </div>
                  <div className="font-display font-bold text-[19px] mt-1 text-[#141413]">
                    {activeTribunalCount} / 5 модулей
                  </div>
                </div>
              </div>

              {/* Editorial Consistency Stamp (Honest if incomplete!) */}
              <div className="mt-6 rounded-xl bg-[#FAF9F5] border border-[#141413]/14 p-5 flex items-start gap-4">
                <ScholarPortraitSvg
                  id={consistency.author}
                  size={54}
                  gesture={consistency.isContradiction ? 'slash' : 'eyebrow'}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded border font-mono-tech text-[10.5px] uppercase tracking-[0.14em] font-bold ${
                        consistency.isIncomplete
                          ? 'border-[#5E5D59] text-[#5E5D59] bg-[#EAE7DD]'
                          : consistency.isContradiction
                            ? 'border-[#FC4109] text-[#FC4109] bg-[#FC4109]/8'
                            : 'border-[#0D7A5F] text-[#0D7A5F] bg-[#0D7A5F]/8'
                      }`}
                    >
                      {consistency.stampTitle}
                    </span>
                    <span className="font-mono-tech text-[10px] text-[#5E5D59]">
                      {consistency.stampSubtitle}
                    </span>
                  </div>
                  <p className="font-serif-editorial italic text-[14.5px] leading-[1.58] text-[#282725] mt-2.5">
                    «{consistency.commentary}»
                  </p>
                </div>
              </div>

              {/* Flip CTA */}
              <div className="mt-6 pt-5 border-t border-[#141413]/12 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  className="v6-pill h-12 px-6 rounded-full bg-[#FC4109] hover:bg-[#E43806] text-[#FAF9F5] font-sans-ui text-[14px] font-medium inline-flex items-center gap-2.5 shadow-[0_12px_30px_rgba(252,65,9,0.28)] cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Перевернуть карточку · Контрольная проба №0</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareSpoilerFree}
                  className="v6-pill h-11 px-4 rounded-full bg-[#FAF9F5] hover:bg-[#E4E0D4] text-[#141413] border border-[#141413]/16 font-sans-ui text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-[#0D7A5F]" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Скопировано без спойлера!' : 'Поделиться без спойлера'}</span>
                </button>
              </div>
            </div>

            {/* BACK FACE: "КОНТРОЛЬНАЯ ПРОБА №0" — Honest even if reader skipped Plate 00! */}
            <div className="absolute inset-0 rounded-[24px] bg-[#141413] text-[#FAF9F5] border border-[#141413] p-6 md:p-10 shadow-[0_28px_72px_rgba(20,20,19,0.20)] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#FAF9F5]/14 font-mono-tech text-[10px] uppercase tracking-[0.16em] text-[#9EA4B0]">
                <span className="text-[#FC4109] font-semibold">ОБОРОТ · КОНТРОЛЬНАЯ ПРОБА № 0</span>
                <span>0% ИЗМЕНЁННЫХ ПИКСЕЛЕЙ</span>
              </div>

              <div className="my-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5">
                  <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-xl overflow-hidden border border-[#FAF9F5]/20 bg-[#141413]">
                    <img
                      src="/v7/mooney-blob.png"
                      alt="Та самая неизменённая клякса Муни с первой секунды книги"
                      className="w-full h-full object-cover select-none"
                    />
                    <img
                      src="/v7/mooney-key.jpg"
                      alt="Проявленный снимок"
                      className="absolute inset-0 w-full h-full object-cover select-none"
                      style={{
                        opacity: inlineReveal ? 1 : 0,
                        transition: inlineReveal ? 'opacity 200ms ease' : 'opacity 1400ms ease',
                      }}
                    />
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#FC4109]">
                    ЭХО ПЕРВОЙ СЕКУНДЫ
                  </div>
                  <h3 className="font-display font-bold text-[24px] md:text-[28px] leading-tight">
                    {state.mooneyExposed
                      ? 'Попробуйте прямо сейчас снова увидеть просто шум.'
                      : 'Вы пропустили первый оттиск — проявите его прямо здесь!'}
                  </h3>
                  <p className="font-serif-editorial italic text-[16px] leading-[1.6] text-[#DCE0E8]">
                    {state.mooneyExposed
                      ? `В начале этой книги вы смотрели на этот снимок ${state.mooneySeconds?.toFixed(1) ?? 'несколько'} сек и видели только хаос чёрно-белых пятен. Сейчас на экране — тот же самый файл, пиксель в пиксель. Но ваш мозг больше никогда не вернётся в прежнее состояние: он навсегда записал этот приор.`
                      : 'Посмотрите на пятна слева — пока это просто чёрно-белый хаос. Нажмите кнопку ниже на секунду, и ваш мозг за долю секунды навсегда перестроит восприятие этого кадра.'}
                  </p>
                  {!state.mooneyExposed && (
                    <button
                      type="button"
                      onClick={handleInlineMooneyReveal}
                      className="v6-pill h-10 px-4 rounded-full bg-[#FC4109] hover:bg-[#E43806] text-[#FAF9F5] font-sans-ui text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Проявить снимок прямо здесь</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#FAF9F5]/14 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  className="v6-pill h-10 px-5 rounded-full bg-[#FAF9F5] hover:bg-[#E6E3D8] text-[#141413] font-sans-ui text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Вернуться к Паспорту</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareSpoilerFree}
                  className="v6-pill h-10 px-5 rounded-full bg-[#FC4109] hover:bg-[#E43806] text-[#FAF9F5] font-sans-ui text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Ссылка и итог скопированы!' : 'Отправить другу без спойлера'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BIBLIOGRAPHY & SCIENTIFIC SOURCES (2020–2026) */}
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
            Никакой эзотерики и устаревших мифов — каждая цифра в NOESIS опирается на рецензируемые публикации.
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
                {paper.note}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* OBSIDIAN BOOK COLOPHON FOOTER */}
      <footer id="book-colophon-footer" ref={footerRef} className="bg-[#141413] text-[#FAF9F5] py-16 md:py-20">
        <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2.5 font-display font-bold text-[15px] tracking-[0.1em]">
              <span>NOESIS</span>
              <span className="w-2 h-2 rounded-full bg-[#FC4109]" />
            </div>
            <p className="font-serif-editorial italic text-[17px] leading-[1.55] text-[#D0D3DC]">
              Интерактивная книга о сознании: от одного пятна света на сетчатке до границ живого и синтетического разума.
            </p>
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#8E939E] pt-1">
              КОЛОФОН · ПРОЛОГ · 3 ЧАСТИ · 8 ГЛАВ · 11 КНИЖНЫХ МЕХАНИЗМОВ · 2026
            </div>
          </div>

          <button
            type="button"
            onClick={onScrollTop}
            className="v6-pill h-11 px-5 rounded-full bg-[#FAF9F5] hover:bg-[#E6E3D8] text-[#141413] font-sans-ui text-[13.5px] font-medium inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Вернуться к Таблице 00</span>
          </button>
        </div>
      </footer>
    </section>
  );
}
