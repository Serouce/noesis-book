import { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { NoesisInstrumentFrame } from '../../v9/components/NoesisInstrumentFrame';
import { ACTS_META } from '../../v9/data/actsMeta';
import { ruTypo } from '../../v9/utils/ruTypo';

interface PrologueConsciousnessProps {
  onContinueToPart1: () => void;
}

interface IntuitionCase {
  id: 'intelligence' | 'wakefulness' | 'reaction';
  code: string;
  label: string;
  claim: string;
  yesLabel: string;
  noLabel: string;
  answer: 'yes' | 'no';
  verdictTitle: string;
  reality: string;
  distinction: string;
}

const INTUITION_CASES: IntuitionCase[] = [
  {
    id: 'intelligence',
    code: 'ПРОБА 01',
    label: 'Интеллект',
    claim: '«Нейросеть обыгрывает чемпиона мира по го и утешает в переписке — значит, она чувствует азарт и сочувствие».',
    yesLabel: 'Да, это доказывает сознание',
    noLabel: 'Нет, здесь подмена понятий',
    answer: 'no',
    verdictTitle: 'Сознание ≠ Интеллект',
    reality:
      'Интеллект — это умение решать задачи и прогнозировать следующий ход. Сознание — это умение что-то переживать. Движок Stockfish сильнее любого гроссмейстера, но внутри него нет ни капли радости победы или страха цейтнота.',
    distinction: 'Решение задач снаружи ≠ переживание изнутри',
  },
  {
    id: 'wakefulness',
    code: 'ПРОБА 02',
    label: 'Бодрствование',
    claim: '«Человек лежит с закрытыми глазами и полностью обездвижен, но внутри него прямо сейчас может полыхать яркий осознанный мир».',
    yesLabel: 'Да, такое вполне возможно',
    noLabel: 'Нет, без бодрствования сознания нет',
    answer: 'yes',
    verdictTitle: 'Сознание ≠ Бодрствование',
    reality:
      'Именно так! Каждую ночь в фазе ярких снов (REM) глаза закрыты, а тело парализовано — но внутри разворачиваются целые миры. И наоборот: при лунатизме или в вегетативном состоянии глаза открыты, а внутри может быть полная темнота.',
    distinction: 'Внешняя поза тела ≠ наличие внутреннего света',
  },
  {
    id: 'reaction',
    code: 'ПРОБА 03',
    label: 'Реакция',
    claim: '«Датчик автоматической двери замечает вас, а подсолнух тянется к солнцу — значит, они ощущают свет».',
    yesLabel: 'Да, раз реагируют — значит чувствуют',
    noLabel: 'Нет, реакция ещё не переживание',
    answer: 'no',
    verdictTitle: 'Сознание ≠ Реакция на стимул',
    reality:
      'Фотодиод исправно реагирует на фотоны и открывает створки, но внутри него нет переживания синего или яркого. Реакцию легко измерить приборами снаружи, а свет сознания горит только изнутри субъекта.',
    distinction: 'Информационный отклик ≠ субъективное ощущение',
  },
];

const EDITORIAL_STAKES = [
  {
    num: '01',
    metric: '? / 241',
    metricCaption: 'пациентов в коме · NEJM 2024',
    domain: 'КЛИНИКА · АКТ IV',
    title: 'Немой пациент в палате может слышать каждое слово врача',
    text: 'В августе 2024 года врачи подтвердили: часть внешне полностью неподвижных пациентов в коме осознанно выполняет мысленные команды на фМРТ и ЭЭГ. Как отличить тишину от запертого разума?',
  },
  {
    num: '02',
    metric: '10⁶–10¹¹',
    metricCaption: 'масштабы нервных систем',
    domain: 'БИОЛОГИЯ · АКТ V',
    title: 'Число нейронов больше не объясняет, кто способен чувствовать боль',
    text: 'В 2024 году учёные подписали Нью-Йоркскую декларацию, перечеркнув старое деление на «людей» и «биороботов». Где проходит граница живого опыта — и совпадёт ли с ней ваша собственная черта?',
  },
  {
    num: '03',
    metric: '73%*',
    metricCaption: 'с persona-промптом · тест 2025',
    domain: 'КРЕМНИЙ · АКТ V',
    title: 'Языковые модели уже пишут «мне страшно, не выключай меня»',
    text: 'В 2025 году модель с ролевым persona-промптом убедила 73% судей, что перед ними человек — без такой маски эффект вдвое слабее. Главный спор: где кончается блестящая имитация речи и начинается живой субъект?',
  },
];

/**
 * PROLOGUE (Bug #2 Fix):
 * - Replaces passive 3-tab myth list with a genuine Guess-Check Concept Reducer (user commits before verdict!).
 * - Replaces the 3-column AI-slop card shelf with an asymmetric Swiss newspaper data ledger (hairlines + tabular-nums).
 * - Displays the crisp 5-Act Atlas Map.
 */
export function PrologueConsciousness({ onContinueToPart1: _onContinueToPart1 }: PrologueConsciousnessProps) {
  const { setPrologueExplored } = useExplorer();
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<IntuitionCase['id'], 'yes' | 'no'>>>({});

  const current = INTUITION_CASES[activeIdx] ?? INTUITION_CASES[0];
  const userChoice = answers[current.id];
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (choice: 'yes' | 'no') => {
    setAnswers((prev) => {
      const next = { ...prev, [current.id]: choice };
      if (Object.keys(next).length >= 2) {
        setPrologueExplored(true);
      }
      return next;
    });
  };

  return (
    <section
      id="prologue"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Пролог — Что такое сознание и зачем это важно"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ПРОЛОГ · ЧТО ТОЛЬКО ЧТО ПРОИЗОШЛО?</span>
          <span>ОПРЕДЕЛЕНИЕ И СТАВКИ · стр. 04</span>
        </div>

        {/* PART 0.1: NAGEL DEFINITION + ACTIVE INTUITION REDUCER */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-[clamp(32px,4.4vw,54px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Что такое свет</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                внутри черепа?
              </span>
            </h2>

            <p className="text-[16px] leading-[1.68] text-[#282725]">
              {ruTypo(
                'Вспомните глубокий сон без сновидений. Пока вы спали, мир никуда не исчез, сердце ровно билось, а мозг перекладывал дневные воспоминания — ',
              )}
              <strong className="font-semibold text-[#141413]">
                но внутри было абсолютно темно
              </strong>
              . Там никого не было.
            </p>

            <p className="text-[15.5px] leading-[1.68] text-[#454440]">
              {ruTypo(
                'Утром звенит будильник — и за долю секунды «включается свет»: запах кофе, тяжесть одеяла, лёгкая досада. Философ Томас Нагель дал этому самое точное определение в науке:',
              )}
            </p>

            <blockquote className="v9-hang-quote pl-4 border-l-2 border-[#FC4109] font-serif-editorial italic text-[18px] leading-[1.52] text-[#141413]">
              {ruTypo(
                '«Сознание — это сам факт, что внутри существа есть кто‑то, кому каково‑то быть этим существом».',
              )}
            </blockquote>
          </div>

          {/* Right 7 cols: Active Guess-Check Concept Reducer (Noisefree Swiss Instrument!) */}
          <div className="lg:col-span-7">
            <NoesisInstrumentFrame
              code="РЕДУКТОР ПОНЯТИЙ · 3 ПРОБЫ НА ИНТУИЦИЮ"
              badge="reconstruction"
              telemetry={`ПРОВЕРЕНО: ${answeredCount} / 3`}
              surface="vellum"
              footnote="Сначала зафиксируйте интуицию — потом сверьтесь с разбором"
            >
              {/* Crisp numbered selector strip */}
              <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#141413]/10">
                {INTUITION_CASES.map((item, idx) => {
                  const isCurrent = idx === activeIdx;
                  const isDone = Boolean(answers[item.id]);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={`v6-pill px-3.5 py-2 rounded-full border font-mono-tech text-[11px] uppercase tracking-[0.08em] inline-flex items-center gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                          : 'bg-[#FAF9F5] hover:bg-[#ECE9DF] text-[#141413] border-[#141413]/14'
                      }`}
                    >
                      <span>0{idx + 1}</span>
                      <span>{item.label}</span>
                      {isDone && (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#0D7A5F] text-[#FAF9F5] inline-flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Claim Card */}
              <div className="mt-5 space-y-5">
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#5E5D59]">
                  {current.code} · УТВЕРЖДЕНИЕ ДЛЯ ПРОВЕРКИ
                </div>

                <p className="font-serif-editorial text-[19px] sm:text-[21px] leading-[1.45] text-[#141413]">
                  {ruTypo(current.claim)}
                </p>

                {/* Commit before reveal — STRICTLY NEUTRAL equal buttons (zero visual answer spoiler!) */}
                {!userChoice ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAnswer('yes')}
                      className="v6-pill px-4 py-3.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE7DC] border border-[#141413]/18 hover:border-[#141413]/45 text-left cursor-pointer"
                    >
                      <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                        ВЕРСИЯ A
                      </div>
                      <div className="font-display font-semibold text-[15px] text-[#141413] mt-0.5">
                        {current.yesLabel}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAnswer('no')}
                      className="v6-pill px-4 py-3.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE7DC] border border-[#141413]/18 hover:border-[#141413]/45 text-left cursor-pointer"
                    >
                      <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#5E5D59]">
                        ВЕРСИЯ B
                      </div>
                      <div className="font-display font-semibold text-[15px] text-[#141413] mt-0.5">
                        {current.noLabel}
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/14 p-5 space-y-3 animate-[beatRise_260ms_cubic-bezier(0.22,1,0.36,1)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono-tech text-[10px] uppercase tracking-[0.11em] font-semibold ${
                          userChoice === current.answer
                            ? 'bg-[#0D7A5F]/12 text-[#0D7A5F]'
                            : 'bg-[#FC4109]/12 text-[#C83407]'
                        }`}
                      >
                        {userChoice === current.answer ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>ТОЧНО В ЦЕЛЬ</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" />
                            <span>КЛАССИЧЕСКАЯ ЛОВУШКА</span>
                          </>
                        )}
                      </span>

                      <span className="font-mono-tech text-[10.5px] font-semibold text-[#141413]">
                        {current.verdictTitle}
                      </span>
                    </div>

                    <p className="text-[14.5px] leading-[1.64] text-[#282725]">
                      {ruTypo(current.reality)}
                    </p>

                    <div className="pt-2.5 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-3">
                      <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.09em] text-[#004EDF] font-semibold">
                        {current.distinction}
                      </span>

                      {activeIdx < INTUITION_CASES.length - 1 && (
                        <button
                          type="button"
                          onClick={() => setActiveIdx((i) => Math.min(INTUITION_CASES.length - 1, i + 1))}
                          className="font-mono-tech text-[10.5px] uppercase tracking-[0.11em] text-[#141413] hover:text-[#FC4109] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Следующая проба</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>

        {/* PART 0.2: ASYMMETRIC SWISS EDITORIAL LEDGER (Zero AI-slop 3-card icon shelves!) */}
        <div className="mt-16 pt-10 border-t border-[#141413]/14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7">
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                ПОЧЕМУ XXI ВЕК БОЛЬШЕ НЕ МОЖЕТ ОТКЛАДЫВАТЬ ОТВЕТ
              </div>
              <h3 className="font-serif-editorial text-[28px] md:text-[36px] mt-1.5 leading-[1.12] tracking-[-0.02em]">
                {ruTypo('Три живые ставки этой книги')}
              </h3>
            </div>
            <p className="lg:col-span-5 font-serif-editorial italic text-[15px] leading-[1.6] text-[#5E5D59]">
              {ruTypo(
                'Мы расщепили атом и расшифровали геном, но до сих пор спорим, откуда берётся субъективный опыт. Сегодня от этого зависят решения в больницах, лабораториях и дата-центрах.',
              )}
            </p>
          </div>

          <div className="mt-8 divide-y divide-[#141413]/12 border-t border-b border-[#141413]/14">
            {EDITORIAL_STAKES.map((stake) => (
              <div
                key={stake.num}
                className="py-6 md:py-7 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline"
              >
                <div className="md:col-span-3 flex md:flex-col items-baseline justify-between gap-2">
                  <span className="font-serif-display text-[32px] md:text-[40px] leading-none text-[#141413] font-normal tracking-[-0.03em]">
                    {stake.metric}
                  </span>
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59] md:mt-1.5">
                    {stake.metricCaption}
                  </span>
                </div>

                <div className="md:col-span-4">
                  <div className="font-mono-tech text-[10px] uppercase tracking-[0.13em] text-[#FC4109] font-semibold">
                    {stake.num} · {stake.domain}
                  </div>
                  <h4 className="font-display font-bold text-[18px] leading-[1.3] text-[#141413] mt-1.5">
                    {ruTypo(stake.title)}
                  </h4>
                </div>

                <p className="md:col-span-5 text-[14.5px] leading-[1.66] text-[#3B3A37]">
                  {ruTypo(stake.text)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* PART 0.3: CLEAN 5-ACT ATLAS ROUTE (Single exit lives cleanly in ActBottomTurn below!) */}
        <div className="mt-12 rounded-2xl border border-[#141413]/14 bg-[#141413] text-[#FAF9F5] p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#FAF9F5]/12 pb-4">
            <div>
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-[#FC4109]">
                МАРШРУТ АТЛАСА · 5 АКТОВ · КАЖДЫЙ ВЫТЕКАЕТ ИЗ ПАРАДОКСА ПРЕДЫДУЩЕГО
              </div>
              <div className="font-serif-editorial text-[22px] mt-1">
                От первого взгляда — к границам разума
              </div>
            </div>
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FAF9F5]/55">
              ~25–30 МИН ЧТЕНИЯ · ПРОГРЕСС СОХРАНЯЕТСЯ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ACTS_META.map((act) => (
              <div
                key={act.id}
                className={`p-3.5 rounded-xl border ${
                  act.id === 'act-1'
                    ? 'bg-[#FAF9F5]/8 border-[#FC4109]/55'
                    : 'bg-[#FAF9F5]/[0.03] border-[#FAF9F5]/10'
                }`}
              >
                <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em]">
                  <span className="text-[#FC4109] font-semibold">АКТ {act.roman}</span>
                  <span className="text-[#FAF9F5]/55">{act.durationLabel}</span>
                </div>
                <div className="font-display font-semibold text-[14.5px] mt-1.5 text-[#FAF9F5]">
                  {act.title}
                </div>
                <p className="text-[12px] text-[#C2C7D0] mt-1 leading-[1.5]">
                  {ruTypo(act.subtitle)}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#FAF9F5]/12 flex flex-wrap items-center justify-between gap-3">
            <p className="font-serif-editorial italic text-[15px] text-[#FAF9F5]/82">
              {ruTypo(
                'Начнём с самого вещества внутри черепа: если опыт рождает мозг, почему 80% его нейронов живут в полной темноте?',
              )}
            </p>
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#FC4109]">
              ДАЛЕЕ · ГЛАВА I.1 ↓
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
