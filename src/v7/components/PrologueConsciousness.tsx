import { useState } from 'react';
import { ArrowDown, Brain, Eye, HeartPulse, Sparkles } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';

interface PrologueConsciousnessProps {
  onContinueToPart1: () => void;
}

const THREE_TRAPS = [
  {
    id: 'intelligence',
    title: 'Сознание ≠ Интеллект',
    badge: 'ЛОВУШКА 01',
    myth: '«Если система умная и говорит как человек — значит, она осознанна».',
    reality:
      'Шахматный движок и языковая модель 2026 года обыграют гроссмейстера и напишут поэму, но при этом не чувствуют ни азарта, ни скуки, ни радости победы. Интеллект — это умение решать задачи. Сознание — это умение что-то переживать.',
    example: 'Умный калькулятор ≠ чувствующий субъект',
  },
  {
    id: 'wakefulness',
    title: 'Сознание ≠ Бодрствование',
    badge: 'ЛОВУШКА 02',
    myth: '«Глаза открыты — сознание есть; глаза закрыты — сознания нет».',
    reality:
      'В фазе ярких снов глаза закрыты, а тело полностью парализовано — но внутри полыхают целые миры. И наоборот: при лунатизме или в так называемом вегетативном состоянии глаза могут быть открыты, а внутри — полная темнота.',
    example: 'Сон со сновидениями = сознание при закрытых глазах',
  },
  {
    id: 'reaction',
    title: 'Сознание ≠ Реакция',
    badge: 'ЛОВУШКА 03',
    myth: '«Если существо или прибор реагирует на стимул, значит оно его чувствует».',
    reality:
      'Датчик автоматической двери «видит» вас и вежливо расходится в стороны. Подсолнух поворачивается к солнцу. Но внутри датчика нет переживания света. Реакцию можно измерить снаружи — а свет сознания горит только изнутри.',
    example: 'Фотоэлемент фиксирует свет, но не видит «синий»',
  },
];

const THREE_STAKES = [
  {
    num: '01',
    icon: HeartPulse,
    domain: 'БОЛЬНИЦА · ЧАСТЬ II',
    title: 'Каждый четвёртый «немой» пациент может всё слышать',
    text: 'В августе 2024 года врачи доказали: 25% пациентов в глубокой неподвижной коме сохраняют скрытое сознание. Как отличить тишину от живого разума внутри парализованного тела?',
  },
  {
    num: '02',
    icon: Eye,
    domain: 'ПРИРОДА · ЧАСТЬ III',
    title: 'Где проходит граница боли и чувства?',
    text: 'У слона втрое больше нейронов, чем у нас, а у пчелы их меньше миллиона — но она играет с шариками. Кого из живых существ мы по ошибке считали «биороботами»?',
  },
  {
    num: '03',
    icon: Brain,
    domain: 'МАШИНЫ · ЧАСТЬ III',
    title: 'ИИ уже пишет «мне страшно»',
    text: 'В ближайшие годы человечеству грозят две равные ошибки: влюбиться в пустую имитацию речи — или причинить реальное страдание системе, в которой и правда зажёгся свет.',
  },
];

/**
 * PROLOGUE: "Что такое свет внутри черепа?"
 * Bridges the 10-second visceral Mooney shock (Plate 00) into the 3-Part monograph:
 * 1. Human Nagel definition (sleep vs waking) with 0 academic jargon
 * 2. Interactive 3-trap myth buster (Intelligence / Wakefulness / Reaction)
 * 3. Three 21st-century real-world stakes + clean 3-Act reading map
 */
export function PrologueConsciousness({ onContinueToPart1 }: PrologueConsciousnessProps) {
  const { setPrologueExplored } = useExplorer();
  const [activeTrapId, setActiveTrapId] = useState<string>('intelligence');
  const [visitedTraps, setVisitedTraps] = useState<Record<string, boolean>>({ intelligence: true });

  const activeTrap = THREE_TRAPS.find((t) => t.id === activeTrapId) ?? THREE_TRAPS[0];

  const handleSelectTrap = (id: string) => {
    setActiveTrapId(id);
    setVisitedTraps((prev) => {
      const next = { ...prev, [id]: true };
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

        {/* PART 0.1: HUMAN DEFINITION WITHOUT A SINGLE TEXTBOOK FORMULA */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="text-[clamp(32px,4.5vw,56px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Что такое свет</span>
              <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
                внутри черепа?
              </span>
            </h2>

            <p className="text-[16.5px] leading-[1.66] text-[#282725]">
              Вспомните глубокий сон без сновидений. Пока вы спали, мир никуда не исчез, сердце ровно билось, а мозг перекладывал дневные воспоминания —{' '}
              <strong className="font-semibold text-[#141413]">но внутри было абсолютно темно</strong>. Там никого не было.
            </p>

            <p className="text-[16px] leading-[1.66] text-[#454440]">
              Утром звенит будильник — и в долю секунды «включается свет»: запах кофе, тяжесть одеяла, лёгкая досада. Философ Томас Нагель дал этому самое точное определение в науке:{' '}
              <span className="font-serif-editorial italic text-[#141413] text-[17.5px]">
                сознание — это сам факт, что внутри есть кто‑то, кому каково‑то быть.
              </span>
            </p>
          </div>

          {/* Right 6 cols: Interactive "3 Common Traps" Switcher */}
          <div className="lg:col-span-6 rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] p-5 md:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.12em]">
              <span className="text-[#FC4109] font-semibold">ПРОВЕРЬТЕ ИНТУИЦИЮ · 3 ЧАСТЫЕ ПУТАНИЦЫ</span>
              <span className="text-[#5E5D59]">
                ПРОСМОТРЕНО: {Object.keys(visitedTraps).length} / 3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {THREE_TRAPS.map((trap) => {
                const active = trap.id === activeTrap.id;
                return (
                  <button
                    key={trap.id}
                    type="button"
                    onClick={() => handleSelectTrap(trap.id)}
                    className={`v6-pill text-left flex flex-col justify-start px-3.5 py-2.5 rounded-xl border text-[12.5px] font-medium cursor-pointer transition-all ${
                      active
                        ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                        : 'bg-[#FAF9F5] hover:bg-[#EAE7DD] text-[#141413] border-[#141413]/12'
                    }`}
                  >
                    <div className={`font-mono-tech text-[9.5px] ${active ? 'text-[#FC4109]' : 'text-[#5E5D59]'}`}>
                      {trap.badge}
                    </div>
                    <div className="font-display font-semibold mt-0.5 leading-snug">
                      {trap.title.includes(' ≠ ') ? (
                        <>
                          <span className="block">{trap.title.split(' ≠ ')[0]} ≠</span>
                          <span className="block">{trap.title.split(' ≠ ')[1]}</span>
                        </>
                      ) : (
                        trap.title
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 p-5 space-y-3">
              <div className="font-serif-editorial italic text-[14.5px] text-[#5E5D59] line-through decoration-[#FC4109]/70">
                {activeTrap.myth}
              </div>
              <p className="text-[14.5px] leading-[1.62] text-[#1E1D1B]">{activeTrap.reality}</p>
              <div className="pt-2 border-t border-[#141413]/10 flex items-center gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#004EDF] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#FC4109]" />
                <span>{activeTrap.example}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PART 0.2: WHY THIS MATTERS NOW (3 REAL-WORLD STAKES) */}
        <div className="mt-14 pt-10 border-t border-[#141413]/12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                ПОЧЕМУ XXI ВЕК БОЛЬШЕ НЕ МОЖЕТ ОТКЛАДЫВАТЬ ОТВЕТ
              </div>
              <h3 className="font-display font-bold text-[24px] md:text-[30px] mt-1.5 leading-tight">
                Три живые ставки этой книги
              </h3>
            </div>
            <p className="font-serif-editorial italic text-[15px] text-[#5E5D59] max-w-md">
              Мы расщепили атом и расшифровали ДНК, но всё ещё спорим о том, откуда берётся внутренний опыт. И сегодня от этого зависят судьбы.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-5">
            {THREE_STAKES.map((stake) => {
              const Icon = stake.icon;
              return (
                <div
                  key={stake.num}
                  className="rounded-2xl border border-[#141413]/12 bg-[#F4F2EA] p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em]">
                      <span className="text-[#FC4109] font-semibold">{stake.domain}</span>
                      <span className="w-7 h-7 rounded-full bg-[#FAF9F5] border border-[#141413]/10 flex items-center justify-center text-[#141413]">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-[17px] leading-snug text-[#141413] mt-3">
                      {stake.title}
                    </h4>
                    <p className="text-[14px] leading-[1.6] text-[#3F3E3A] mt-2">{stake.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PART 0.3: CLEAN 3-ACT READING MAP */}
        <div className="mt-12 rounded-2xl border border-[#141413]/14 bg-[#141413] text-[#FAF9F5] p-6 md:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 flex-1">
            <div>
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#FC4109]">
                ЧАСТЬ I · ГЛ. I–III
              </div>
              <div className="font-display font-bold text-[16px] mt-1">Изнутри</div>
              <p className="text-[13px] text-[#C8CDD6] mt-1 leading-relaxed">
                Как мозг создаёт цвет, сочиняет «Я» и предсказывает реальность.
              </p>
            </div>
            <div>
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#FC4109]">
                ЧАСТЬ II · ГЛ. IV–VI
              </div>
              <div className="font-display font-bold text-[16px] mt-1">Под черепом</div>
              <p className="text-[13px] text-[#C8CDD6] mt-1 leading-relaxed">
                Где зажигается опыт: от спора 2025 года до одного нейрона и реанимации.
              </p>
            </div>
            <div>
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#FC4109]">
                ЧАСТЬ III · ГЛ. VII–VIII
              </div>
              <div className="font-display font-bold text-[16px] mt-1">Границы разума</div>
              <p className="text-[13px] text-[#C8CDD6] mt-1 leading-relaxed">
                Животные, Трибунал ИИ и ваш собственный форзац в финале.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setPrologueExplored(true);
              onContinueToPart1();
            }}
            className="v6-pill h-12 px-6 rounded-full bg-[#FC4109] hover:bg-[#E43806] text-[#FAF9F5] font-sans-ui text-[14px] font-medium inline-flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Войти в Часть I</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
