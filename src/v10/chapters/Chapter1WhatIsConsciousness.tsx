import { useState, type ReactNode } from 'react';
import { ArrowDown, ChevronDown, Eye, Moon, Sparkles, Zap } from 'lucide-react';
import { useExplorer } from '../../v7/context/ExplorerContext';
import { ScholarMarginDuel } from '../../v7/components/ScholarMarginalia';
import { NoesisInstrumentFrame } from '../../v9/components/NoesisInstrumentFrame';
import { TermGloss } from '../../v9/components/TermGloss';
import { ruTypo } from '../../v9/utils/ruTypo';

export interface Chapter1WhatIsConsciousnessProps {
  /** Полноэкранный или широкий WebGL-слот сцены #1 «Мельница Лейбница» (подставляется координатором) */
  leibnizSceneSlot?: ReactNode;
  onContinueToAct2?: () => void;
}

interface ConfusionCard {
  id: 'intelligence' | 'wakefulness' | 'reaction';
  num: string;
  title: string;
  myth: string;
  reality: string;
  distinction: string;
  accent: string;
}

const CONFUSION_CARDS: ConfusionCard[] = [
  {
    id: 'intelligence',
    num: '01',
    title: 'Интеллект',
    myth: '«Если система решает сложные задачи и обыгрывает человека — она сознательна».',
    reality:
      'Интеллект — это умение считать варианты и предсказывать следующий ход. Шахматный движок Stockfish громит любого чемпиона мира, но внутри него стоит абсолютная темнота: ни азарта атаки, ни страха цейтнота.',
    distinction: 'Решение задач снаружи ≠ переживание изнутри',
    accent: '#004EDF',
  },
  {
    id: 'wakefulness',
    num: '02',
    title: 'Бодрствование',
    myth: '«Сознание есть, когда глаза открыты, и гаснет, как только человек засыпает».',
    reality:
      'Каждую ночь в фазе сновидений (REM) ваши веки сомкнуты, а тело обездвижено — но внутри горит целый цветной мир. И напротив: при лунатизме человек встаёт с открытыми глазами, обходит мебель и даже разговаривает в полной внутренней темноте.',
    distinction: 'Внешняя поза тела ≠ наличие внутреннего света',
    accent: '#FC4109',
  },
  {
    id: 'reaction',
    num: '03',
    title: 'Реакция',
    myth: '«Если организм или прибор отвечает на свет, тепло или прикосновение — он это чувствует».',
    reality:
      'Фотодатчик безупречно открывает дверь супермаркета, а спинной мозг отдёргивает вашу ладонь от кипятка ещё до того, как сигнал доберётся до коры и родит боль. Обратная связь работает вслепую — без всякого наблюдателя внутри.',
    distinction: 'Автоматический отклик ≠ субъективное чувство',
    accent: '#0D7A5F',
  },
];

const STAKES_LEDGER = [
  {
    num: '01',
    domain: 'МЕДИЦИНА · КОМА',
    title: 'Немой пациент в реанимации может слышать каждое слово врача',
    text: 'Когда тело полностью парализовано, внешние рефлексы молчат. Как отличить пустую тишину от живого разума, запертого внутри неработающих мышц?',
  },
  {
    num: '02',
    domain: 'ЭТИКА · ЖИВОТНЫЕ',
    title: 'Где на эволюционном древе впервые вспыхивает боль',
    text: 'Мы привыкли мерить разум по себе. Но где проходит граница живого опыта — только у птиц и млекопитающих или уже у осьминогов, крабов и пчёл?',
  },
  {
    num: '03',
    domain: 'БУДУЩЕЕ · ИИ',
    title: 'Языковая модель уже способна написать: «мне страшно, не выключай меня»',
    text: 'Словами легко сымитировать душу. Когда алгоритмы станут неразличимы от людей в диалоге, нам понадобится честный способ отличить театр от субъекта.',
  },
];

export function Chapter1WhatIsConsciousness({
  leibnizSceneSlot,
  onContinueToAct2,
}: Chapter1WhatIsConsciousnessProps) {
  const { setCh1Explored } = useExplorer();
  const [openCardId, setOpenCardId] = useState<ConfusionCard['id']>('intelligence');

  const handleSelectCard = (id: ConfusionCard['id']) => {
    setOpenCardId(id);
    setCh1Explored(true);
  };

  return (
    <article
      id="ch-01"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Глава 01 — Что такое свет внутри темноты?"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 space-y-20 md:space-y-24">
        {/* CHAPTER FOLIO HEADER */}
        <header className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
            <span className="text-[#FC4109] font-semibold">АКТ I · ГЛАВА 01 · ТАЙНА С АБСОЛЮТНОГО НУЛЯ</span>
            <span>ТОЧКА ОТСЧЁТА · стр. 06</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-7">
              <h2 className="text-[clamp(34px,4.8vw,60px)] leading-[1.04] tracking-[-0.032em]">
                <span className="font-display font-bold block">Что такое свет</span>
                <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                  внутри темноты?
                </span>
              </h2>
            </div>

            <div className="lg:col-span-5 text-[16px] leading-[1.68] text-[#353431]">
              <p>
                {ruTypo(
                  'Секунду назад на пластине Муни не изменился ни один пиксель — но внутри вас вспыхнул живой образ. Прежде чем вскрывать мозг и спускаться в нейроны, договоримся о главном: о какой именно загадке идёт речь — и почему наука спотыкается о неё уже четыре столетия.',
                )}
              </p>
            </div>
          </div>
        </header>

        {/* STEP 1 · DESCARTES (1641) */}
        <section aria-labelledby="step-descartes" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-4 border-t border-[#141413]/10">
          <div className="lg:col-span-6 space-y-5">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
              СТУПЕНЬ 01 · ДЕКАРТ (1641) И ТОЧКА ОТСЧЁТА
            </div>
            <h3 id="step-descartes" className="font-serif-editorial text-[28px] md:text-[34px] leading-[1.14] tracking-[-0.02em]">
              {ruTypo('Единственный факт во Вселенной, в котором нельзя усомниться')}
            </h3>
            <p className="text-[16px] leading-[1.7] text-[#282725]">
              {ruTypo(
                'В 1641 году Рене Декарт устроил радикальную проверку реальности. Глаза могут ошибаться — как только что с пятнами чернил. Память подводит, а весь мир за окном в принципе мог бы оказаться сном или безупречной симуляцией.',
              )}
            </p>
            <p className="text-[16px] leading-[1.7] text-[#42413D]">
              {ruTypo(
                'Но есть вещь, которую не в силах подделать ни один демон: сам факт, что прямо сейчас кто-то переживает эту иллюзию. Если тебе кажется, что ты чувствуешь горечь кофе или укол сомнения — само это «кажется» уже абсолютно реально. Сознание — не гипотеза из учебника, а единственная данность, с которой мы знакомы изнутри.',
              )}
            </p>
          </div>

          <div className="lg:col-span-6">
            <NoesisInstrumentFrame
              code="ДВЕ ОПТИКИ НА ОДНУ РЕАЛЬНОСТЬ"
              badge="reconstruction"
              telemetry="1641 → XXI ВЕК"
              surface="vellum"
              footnote="Декарт отделил несомненность первого лица от любых данных извне"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 p-4 space-y-2.5">
                  <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                    ВИД СНАРУЖИ · 3-Е ЛИЦО
                  </div>
                  <div className="font-display font-bold text-[16px] text-[#141413]">
                    Приборы и масса
                  </div>
                  <p className="text-[13.5px] leading-[1.56] text-[#4A4945]">
                    {ruTypo(
                      'Длина волны 650 нм, 1.4 кг ткани, милливольты на электроде. Всё это можно измерить линейкой — и в любом измерении можно ошибиться.',
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[#141413] text-[#FAF9F5] border border-[#141413] p-4 space-y-2.5">
                  <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FC4109]">
                    ВИД ИЗНУТРИ · 1-Е ЛИЦО
                  </div>
                  <div className="font-display font-bold text-[16px]">
                    Собственный свет
                  </div>
                  <p className="text-[13.5px] leading-[1.56] text-[#D3D7E0]">
                    {ruTypo(
                      'Вкус апельсина, острая боль, ощущение алого цвета. Это нельзя сфотографировать снаружи, но именно в нём невозможно усомниться.',
                    )}
                  </p>
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>
        </section>

        {/* STEP 2 · LEIBNIZ'S MILL (1714) + WEBGL SCENE #1 SLOT */}
        <section aria-labelledby="step-leibniz" className="space-y-8 pt-10 border-t border-[#141413]/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-6 space-y-4">
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
                СТУПЕНЬ 02 · МЕЛЬНИЦА ЛЕЙБНИЦА (1714)
              </div>
              <h3 id="step-leibniz" className="font-serif-editorial text-[28px] md:text-[34px] leading-[1.14] tracking-[-0.02em]">
                {ruTypo('Войди внутрь механизма — и не найдёшь ни одной мысли')}
              </h3>
            </div>
            <div className="lg:col-span-6 text-[16px] leading-[1.68] text-[#353431]">
              <p>
                {ruTypo(
                  'В 1714 году Готфрид Лейбниц предложил мысленный эксперимент: увеличьте мыслящую машину до размеров ветряной мельницы и зайдите внутрь. Вы увидите только шестерни, толкающие друг друга, — но нигде не встретите самого переживания. Замените деревянные колёса на 86 миллиардов нейронов, ионные каналы и спайки — пропасть останется прежней: приборы видят движение вещества, но не саму боль и не вкус кофе.',
                )}
              </p>
            </div>
          </div>

          {/* Slot for Coordinator's WebGL Scene #1 ("Мельница Лейбница") */}
          {leibnizSceneSlot ? (
            <div className="w-full">{leibnizSceneSlot}</div>
          ) : (
            <NoesisInstrumentFrame
              code="СЦЕНА 01 · МЕЛЬНИЦА ЛЕЙБНИЦА (1714 → НАШИ ДНИ)"
              badge="scroll-optics"
              telemetry="МАКРО-МЕХАНИКА ⇄ 0% ВНУТРЕННЕГО КИНО"
              surface="darkroom"
              footnote="Г. В. Лейбниц, «Монадология», §17 (1714) · Разрыв между описанием деталей и субъективным опытом"
            >
              <div className="min-h-[260px] flex flex-col justify-between gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                  <div className="rounded-xl border border-[#FAF9F5]/14 bg-[#FAF9F5]/[0.03] p-5 space-y-2">
                    <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#9AA3B2]">
                      УРОВЕНЬ А · МЕЛЬНИЦА
                    </div>
                    <div className="font-display font-semibold text-[16px]">Шестерни и рычаги</div>
                    <p className="text-[13px] leading-[1.55] text-[#B8BECB]">
                      {ruTypo('Вал вращает колесо, зубец толкает соседний зубец. Понятная физика без остатка.')}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#FC4109]/40 bg-[#FC4109]/10 p-5 text-center space-y-2">
                    <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#FF8C66]">
                      ПЕРЕМЕНА МАСШТАБА
                    </div>
                    <div className="font-serif-display italic text-[22px] text-[#FAF9F5]">
                      Где спрятан вкус?
                    </div>
                    <p className="text-[12.5px] leading-[1.5] text-[#F1D6CD]">
                      {ruTypo('В какой именно синапс или милливольт помещается чувство горечи эспрессо?')}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#FAF9F5]/14 bg-[#FAF9F5]/[0.03] p-5 space-y-2">
                    <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#9AA3B2]">
                      УРОВЕНЬ B · МОЗГ
                    </div>
                    <div className="font-display font-semibold text-[16px]">Ионы и милливольты</div>
                    <p className="text-[13px] leading-[1.55] text-[#B8BECB]">
                      {ruTypo('Натрий входит в мембрану, медиатор летит через щель — всё та же механика, только мельче.')}
                    </p>
                  </div>
                </div>
              </div>
            </NoesisInstrumentFrame>
          )}
        </section>

        {/* STEP 3 · THOMAS NAGEL (1974) + 3-CARD CONFUSION CLARIFIER */}
        <section aria-labelledby="step-nagel" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-10 border-t border-[#141413]/10">
          <div className="lg:col-span-5 space-y-5">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
              СТУПЕНЬ 03 · ТОМАС НАГЕЛЬ (1974)
            </div>
            <h3 id="step-nagel" className="font-serif-editorial text-[28px] md:text-[34px] leading-[1.14] tracking-[-0.02em]">
              {ruTypo('«Каково быть летучей мышью?»')}
            </h3>
            <p className="text-[16px] leading-[1.7] text-[#282725]">
              {ruTypo(
                'Чтобы разговор не утонул в тумане, философ Томас Нагель в 1974 году дал сознанию предельно трезвую формулу. Летучая мышь ориентируется по ультразвуку, которого у нас нет. Мы можем до винтика разобрать её слуховую кору, но никогда не узнаем изнутри, как ощущается мир в лучах эхолокации.',
              )}
            </p>

            <blockquote className="v9-hang-quote pl-4 border-l-2 border-[#FC4109] font-serif-editorial italic text-[18px] leading-[1.54] text-[#141413]">
              {ruTypo(
                '«Организм обладает сознанием тогда и только тогда, когда есть нечто, каково это — быть этим организмом».',
              )}
            </blockquote>

            <p className="text-[14.5px] leading-[1.64] text-[#5E5D59]">
              {ruTypo(
                'Именно это внутреннее «каково это» философы называют ',
              )}
              <TermGloss termKey="квалиа">квалиа</TermGloss>
              {ruTypo(
                '. Чтобы не сбиться на старте, отделим его от трёх вещей, с которыми сознание путают чаще всего.',
              )}
            </p>
          </div>

          {/* Right 7 cols: Clean 3-Card Accordion / Clarifier (NOT a quiz!) */}
          <div className="lg:col-span-7">
            <NoesisInstrumentFrame
              code="НАВИГАТОР ПОНЯТИЙ · 3 ГЛАВНЫЕ ПОДМЕНЫ"
              badge="reconstruction"
              telemetry="КЛИКНИТЕ ДЛЯ ПРОЯСНЕНИЯ"
              surface="vellum"
              footnote="Чистое различение: что такое сознание и чем оно НЕ является"
            >
              <div className="space-y-2.5">
                {CONFUSION_CARDS.map((card) => {
                  const isOpen = openCardId === card.id;
                  return (
                    <div
                      key={card.id}
                      className={`rounded-xl border transition-colors ${
                        isOpen
                          ? 'bg-[#FAF9F5] border-[#141413]/24 shadow-[0_8px_24px_rgba(20,20,19,0.05)]'
                          : 'bg-[#FAF9F5]/65 border-[#141413]/10 hover:bg-[#FAF9F5]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectCard(card.id)}
                        aria-expanded={isOpen}
                        className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center font-mono-tech text-[11px] font-bold text-[#FAF9F5] shrink-0"
                            style={{ backgroundColor: isOpen ? card.accent : '#5E5D59' }}
                          >
                            {card.num}
                          </span>
                          <div className="min-w-0">
                            <div className="font-display font-bold text-[16px] text-[#141413]">
                              Сознание ≠ {card.title}
                            </div>
                            {!isOpen && (
                              <div className="text-[12.5px] text-[#5E5D59] truncate">
                                {card.distinction}
                              </div>
                            )}
                          </div>
                        </div>

                        <ChevronDown
                          className={`w-4 h-4 text-[#5E5D59] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#141413]' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#141413]/8 animate-[beatRise_240ms_cubic-bezier(0.22,1,0.36,1)]">
                          <p className="font-serif-editorial italic text-[14px] text-[#5E5D59]">
                            Расхожий миф: {ruTypo(card.myth)}
                          </p>
                          <p className="text-[14.5px] leading-[1.64] text-[#282725]">
                            {ruTypo(card.reality)}
                          </p>
                          <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono-tech text-[10.5px] uppercase tracking-[0.08em] font-semibold"
                            style={{
                              backgroundColor: `${card.accent}14`,
                              color: card.accent,
                            }}
                          >
                            {card.id === 'intelligence' && <Sparkles className="w-3 h-3" />}
                            {card.id === 'wakefulness' && <Moon className="w-3 h-3" />}
                            {card.id === 'reaction' && <Zap className="w-3 h-3" />}
                            <span>{card.distinction}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </NoesisInstrumentFrame>
          </div>
        </section>

        {/* STEP 4 · PHILOSOPHICAL ZOMBIE & HARD PROBLEM (CHALMERS 1995 vs DENNETT) + STAKES */}
        <section aria-labelledby="step-hard-problem" className="space-y-12 pt-10 border-t border-[#141413]/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6 space-y-5">
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
                СТУПЕНЬ 04 · ФИЛОСОФСКИЙ ЗОМБИ И ТРУДНАЯ ПРОБЛЕМА (1995)
              </div>
              <h3 id="step-hard-problem" className="font-serif-editorial text-[28px] md:text-[34px] leading-[1.14] tracking-[-0.02em]">
                {ruTypo('Почему у мозга вообще горит внутреннее кино?')}
              </h3>
              <p className="text-[16px] leading-[1.7] text-[#282725]">
                {ruTypo(
                  'В 1995 году философ Дэвид Чалмерс расколол науку о сознании надвое. «Лёгкие проблемы» — объяснить, как мозг различает длины волн, переключает внимание, запоминает лица и складывает слова. При всей сложности это задачи на функции: мы понимаем, как в принципе устроен такой механизм.',
                )}
              </p>
              <p className="text-[16px] leading-[1.7] text-[#353431]">
                {ruTypo(
                  'Трудная проблема звучит иначе: почему вся эта работа не идёт «в темноте»? Представьте философского зомби — вашего точного атомного двойника, у которого работают те же нейроны и рефлексы, но внутри которого пусто. Логика не запрещает такого двойника, а значит, простого списка функций недостаточно, чтобы объяснить, зачем вообще существует вкус, цвет и боль.',
                )}
              </p>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <ScholarMarginDuel
                first={{
                  scholar: 'chalmers',
                  gesture: 'eyebrow',
                  quote:
                    'Даже когда мы опишем каждый синапс, внимание и речь, останется главный вопрос: почему вся эта обработка информации сопровождается внутренним кино?',
                }}
                second={{
                  scholar: 'dennett',
                  gesture: 'slash',
                  quote:
                    'Внутреннее кино — это хитрая иллюзия пользователя. Как только вы честно объяснили память, внимание и отчёт о цвете, объяснять больше нечего: никакого «второго экрана» внутри нет.',
                }}
                struckWord="внутренним кино"
              />

              <div className="rounded-xl border border-[#141413]/12 bg-[#F3F1E9] p-4 flex items-start gap-3">
                <Eye className="w-4 h-4 text-[#004EDF] shrink-0 mt-1" />
                <p className="text-[13.5px] leading-[1.6] text-[#3B3A37]">
                  {ruTypo(
                    'Этот спор не остался в аудиториях: сегодня от того, кто прав — Чалмерс или Деннет, напрямую зависят протоколы в больницах, законы о животных и наши решения об искусственном интеллекте.',
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Concrete Stakes Ledger */}
          <div className="divide-y divide-[#141413]/12 border-t border-b border-[#141413]/14">
            {STAKES_LEDGER.map((stake) => (
              <div
                key={stake.num}
                className="py-5 md:py-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-baseline"
              >
                <div className="md:col-span-3 font-mono-tech text-[10.5px] uppercase tracking-[0.13em] text-[#FC4109] font-semibold">
                  {stake.num} · {stake.domain}
                </div>
                <h4 className="md:col-span-4 font-display font-bold text-[17px] leading-[1.32] text-[#141413]">
                  {ruTypo(stake.title)}
                </h4>
                <p className="md:col-span-5 text-[14.5px] leading-[1.64] text-[#3B3A37]">
                  {ruTypo(stake.text)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* DOMINO BRIDGE TO ACT II */}
        <footer className="pt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[16px] text-[#454440] max-w-2xl">
            {ruTypo(
              'Если внутренний свет не удаётся подсмотреть среди шестерён снаружи, поймаем его в чистом виде: войдём в комнату без единой краски и посмотрим, откуда мозг вообще берёт цвет, образ и ощущение «сейчас».',
            )}
          </p>
          {onContinueToAct2 && (
            <button
              type="button"
              onClick={onContinueToAct2}
              className="v6-pill h-11 px-5 rounded-full bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5] font-sans-ui text-[13.5px] font-medium inline-flex items-center gap-2 cursor-pointer"
            >
              <span>К Акту II · Театр восприятия</span>
              <ArrowDown className="w-4 h-4 text-[#FC4109]" />
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}
