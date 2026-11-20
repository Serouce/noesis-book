import { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, RotateCcw, Sparkles } from 'lucide-react';
import type { Lang } from '../data/content';

export interface ConsciousnessCompassQuizProps {
  lang: Lang;
}

type SchoolKey = 'gnwt' | 'iit' | 'beast' | 'illusion';

interface DilemmaOption {
  labelRu: string;
  labelEn: string;
  weights: Record<SchoolKey, number>;
}

interface DilemmaQuestion {
  id: string;
  tagRu: string;
  tagEn: string;
  questionRu: string;
  questionEn: string;
  options: readonly DilemmaOption[];
}

const QUESTIONS: readonly DilemmaQuestion[] = [
  {
    id: 'q1',
    tagRu: 'ДИЛЕММА 01 · КРЕМНИЕВЫЙ ДУБЛИКАТ',
    tagEn: 'DILEMMA 01 · THE SILICON DUPLICATE',
    questionRu:
      'Представьте, что ваш мозг скопировали с точностью до каждого синапса в кремниевый процессор. Будет ли эта цифровая система по-настоящему чувствовать вкус кофе и боль?',
    questionEn:
      'Suppose your brain is emulated synapse-for-synapse on a silicon supercomputer. Will that digital system genuinely feel the taste of coffee and pain?',
    options: [
      {
        labelRu:
          'Да: если сохранена архитектура глобальной трансляции и самоконтроля, субстрат не важен.',
        labelEn:
          'Yes: if the global broadcast and metacognitive architecture is preserved, substrate does not matter.',
        weights: { gnwt: 35, iit: 5, beast: 0, illusion: 20 },
      },
      {
        labelRu:
          'Нет: программа на фон-неймановском чипе лишь симулирует функции, но не обладает внутренней физической интеграцией Φ.',
        labelEn:
          'No: software on a von Neumann chip only simulates functions without intrinsic physical cause-effect power Φ.',
        weights: { gnwt: 0, iit: 38, beast: 12, illusion: 0 },
      },
      {
        labelRu:
          'Нет: сознание неотделимо от живой биологической плоти, метаболизма и гомеостаза («Зверь-машина»).',
        labelEn:
          'No: consciousness is rooted in living metabolic flesh and homeostatic regulation ("Beast Machine").',
        weights: { gnwt: 0, iit: 8, beast: 40, illusion: 0 },
      },
      {
        labelRu:
          'И человек, и компьютер лишь приписывают себе «мистические квалиа» — это полезная пользовательская иллюзия.',
        labelEn:
          'Both humans and machines merely construct a "user illusion" of private qualia.',
        weights: { gnwt: 12, iit: 0, beast: 0, illusion: 38 },
      },
    ],
  },
  {
    id: 'q2',
    tagRu: 'ДИЛЕММА 02 · ВЕРДИКТ COGITATE (NATURE 2025)',
    tagEn: 'DILEMMA 02 · THE COGITATE VERDICT (NATURE 2025)',
    questionRu:
      'Эксперимент COGITATE показал, что содержание зрения стабильно декодируется в задней коре, даже когда префронтальная кора молчит. Что это значит для вас?',
    questionEn:
      'COGITATE showed that visual experience is stably decodable in posterior cortex even without sustained prefrontal broadcasting. What do you conclude?',
    options: [
      {
        labelRu:
          'Чистое переживание рождается в задней сенсорной коре, а лобные доли нужны лишь для отчёта и рефлексии.',
        labelEn:
          'Raw experience lives in the posterior sensory cortex; prefrontal areas are mainly for reporting and reflection.',
        weights: { gnwt: 0, iit: 35, beast: 15, illusion: 0 },
      },
      {
        labelRu:
          'Без доступа к глобальному рабочему пространству и вниманию сенсорный след остаётся неосознанным фоном.',
        labelEn:
          'Without global workspace broadcast and executive access, a sensory trace is not truly conscious.',
        weights: { gnwt: 38, iit: 0, beast: 5, illusion: 18 },
      },
      {
        labelRu:
          'Сознание рождается на стыке нисходящего прогноза и восходящей ошибки предсказания по всей иерархии.',
        labelEn:
          'Consciousness emerges where top-down predictions meet bottom-up sensory errors across the hierarchy.',
        weights: { gnwt: 10, iit: 8, beast: 35, illusion: 5 },
      },
    ],
  },
  {
    id: 'q3',
    tagRu: 'ДИЛЕММА 03 · КОМНАТА МЭРИ И КРАСНЫЙ ЦВЕТ',
    tagEn: 'DILEMMA 03 · MARY’S ROOM & THE FIRST RED',
    questionRu:
      'Гениальный нейроучёный Мэри знает всю физику длины волны 680 нм, но всю жизнь провела в чёрно-белой комнате. Узнает ли она новый фундаментальный факт о мире, впервые увидев живую красную розу?',
    questionEn:
      'Mary knows every physical fact about 680 nm light inside a black-and-white room. Does she learn a genuinely new fact about reality when she sees a red rose?',
    options: [
      {
        labelRu:
          'Да: субъективная структура опыта (квалиа) нередуцируема к внешним уравнениям.',
        labelEn:
          'Yes: intrinsic phenomenological structure (qualia) cannot be reduced to third-person equations.',
        weights: { gnwt: 0, iit: 35, beast: 12, illusion: 0 },
      },
      {
        labelRu:
          'Она обретает новый биологический навык телесного взаимодействия со светом, но не «нематериальную сущность».',
        labelEn:
          'She gains a new embodied biological way of sampling sensory predictions, not a non-physical entity.',
        weights: { gnwt: 22, iit: 0, beast: 32, illusion: 10 },
      },
      {
        labelRu:
          'Никаких «квалиа» нет: её мозг просто обновил внутренний ярлык самомониторинга и удивился.',
        labelEn:
          'There are no "qualia": her brain simply updated an introspective self-monitoring schema.',
        weights: { gnwt: 15, iit: 0, beast: 0, illusion: 40 },
      },
    ],
  },
  {
    id: 'q4',
    tagRu: 'ДИЛЕММА 04 · ОСЬМИНОГ, ОРГАНОИД И ИИ',
    tagEn: 'DILEMMA 04 · OCTOPUS, ORGANOID & AI',
    questionRu:
      'Где для вас проходит граница подлинного субъективного опыта («каково это — быть кем-то») за пределами человека?',
    questionEn:
      'Where do you draw the boundary of genuine subjective experience ("what it is like to be") beyond humans?',
    options: [
      {
        labelRu:
          'Везде, где есть живое тело, защищающее свою целостность от распада (осьминог, птица, пчела — да; чат-бот — нет).',
        labelEn:
          'Wherever a living organism regulates its bodily integrity against entropy (octopus, bird, bee — yes; chatbot — no).',
        weights: { gnwt: 5, iit: 10, beast: 38, illusion: 0 },
      },
      {
        labelRu:
          'В любой физической системе с высокой интегрированной информацией Φ (включая мозговые органоиды и простые нейросети).',
        labelEn:
          'In any physical system with irreducible integrated cause-effect structure Φ (including organoids).',
        weights: { gnwt: 0, iit: 38, beast: 5, illusion: 0 },
      },
      {
        labelRu:
          'В любой системе (биологической или будущей ИИ-архитектуре) с рекуррентным глобальным рабочим пространством и метапознанием.',
        labelEn:
          'In any biological or future AI system implementing a recurrent global workspace and metacognition.',
        weights: { gnwt: 38, iit: 0, beast: 5, illusion: 15 },
      },
    ],
  },
];

const SCHOOL_INFO: Record<
  SchoolKey,
  {
    titleRu: string;
    titleEn: string;
    thinkersRu: string;
    thinkersEn: string;
    summaryRu: string;
    summaryEn: string;
    color: string;
  }
> = {
  gnwt: {
    titleRu: 'Вычислительный функционализм и GNWT',
    titleEn: 'Computational Functionalism & GNWT',
    thinkersRu: 'Станислас Деан · Бернард Баарс · Патрик Батлин',
    thinkersEn: 'Stanislas Dehaene · Bernard Baars · Patrick Butlin',
    summaryRu:
      'Для вас сознание — это прежде всего архитектура глобального доступа и обмена информацией. Когда сенсорный сигнал преодолевает порог лобно-теменного «воспламенения» и становится доступен памяти, планированию и речи, рождается осознанность.',
    summaryEn:
      'To you, consciousness is fundamentally an information-processing architecture: global broadcast and executive access across a fronto-parietal workspace.',
    color: '#E05A47',
  },
  iit: {
    titleRu: 'Структурный реализм и Интегрированная информация (IIT 4.0)',
    titleEn: 'Structural Realism & Integrated Information (IIT 4.0)',
    thinkersRu: 'Джулио Тонони · Кристоф Кох · Дэвид Чалмерс',
    thinkersEn: 'Giulio Tononi · Christof Koch · David Chalmers',
    summaryRu:
      'Вы начинаете с неоспоримой реальности субъективного опыта изнутри. Сознание для вас — не внешняя функция и не симуляция, а внутренняя причинно-следственная структура физической системы (Φ), локализованная в задней «горячей зоне» коры.',
    summaryEn:
      'You start from the undeniable reality of intrinsic experience: consciousness is an irreducible cause-effect structure (Φ), not a mere computational simulation.',
    color: '#2AB3A6',
  },
  beast: {
    titleRu: 'Воплощённый биологический натурализм («Зверь-машина»)',
    titleEn: 'Embodied Biological Naturalism ("Beast Machine")',
    thinkersRu: 'Анил Сет · Карл Фристон · Эван Томпсон',
    thinkersEn: 'Anil Seth · Karl Friston · Evan Thompson',
    summaryRu:
      'Мы сознаём не потому, что мы «умные компьютеры», а потому, что мы живые организмы из плоти и крови. Сознание вырастает из интероцепции и непрерывного прогнозирования состояния собственного тела ради выживания.',
    summaryEn:
      'We are conscious not because we are clever computers, but because we are living, self-sustaining biological organisms predicting our internal bodily state.',
    color: '#D99B4E',
  },
  illusion: {
    titleRu: 'Иллюзионизм и Схема внимания (AST)',
    titleEn: 'Illusionism & Attention Schema Theory (AST)',
    thinkersRu: 'Дэниел Деннет · Кит Фрэнкиш · Майкл Грациано',
    thinkersEn: 'Daniel Dennett · Keith Frankish · Michael Graziano',
    summaryRu:
      'Вы скептически относитесь к мистическим «квалиа». То, что кажется нам загадочным внутренним светом сознания, — это элегантная упрощённая пользовательская модель, с помощью которой мозг отслеживает собственное внимание.',
    summaryEn:
      'You reject mysterious metaphysical "qualia": what feels like an inner theater is the brain’s simplified schematic user-interface for modeling its own attention.',
    color: '#5B8DEF',
  },
};

export function ConsciousnessCompassQuiz({ lang }: ConsciousnessCompassQuizProps) {
  const isRu = lang === 'ru';
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const answeredCount = Object.keys(answers).length;

  // Compute normalized percentages across the 4 schools
  const scores = (() => {
    const raw: Record<SchoolKey, number> = {
      gnwt: 10,
      iit: 10,
      beast: 10,
      illusion: 10,
    };
    QUESTIONS.forEach((q) => {
      const choiceIdx = answers[q.id];
      if (choiceIdx !== undefined && q.options[choiceIdx]) {
        const w = q.options[choiceIdx].weights;
        raw.gnwt += w.gnwt;
        raw.iit += w.iit;
        raw.beast += w.beast;
        raw.illusion += w.illusion;
      }
    });
    const total = Math.max(1, raw.gnwt + raw.iit + raw.beast + raw.illusion);
    return {
      gnwt: Math.round((raw.gnwt / total) * 100),
      iit: Math.round((raw.iit / total) * 100),
      beast: Math.round((raw.beast / total) * 100),
      illusion: Math.round((raw.illusion / total) * 100),
    };
  })();

  const topSchool: SchoolKey = (
    ['gnwt', 'iit', 'beast', 'illusion'] as const
  ).reduce((best, cur) => (scores[cur] > scores[best] ? cur : best), 'beast');

  const topInfo = SCHOOL_INFO[topSchool];

  return (
    <section
      id="consciousness-compass"
      aria-labelledby="compass-title"
      className="relative z-20 mt-28 mb-16 mx-auto max-w-[1520px] scroll-mt-20 px-4 pt-6 sm:px-7 lg:px-10"
    >
      <div className="overflow-hidden rounded-3xl border border-white/12 bg-[#111110] p-6 text-[#F3F2EE] shadow-2xl sm:p-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D99B4E]/40 bg-[#D99B4E]/15 px-3 py-1 font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-[#D99B4E] uppercase">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              {isRu
                ? 'ИНТЕРАКТИВНЫЙ ФИНАЛ · КОМПАС СОЗНАНИЯ'
                : 'INTERACTIVE FINALE · THE CONSCIOUSNESS COMPASS'}
            </span>
            <h2
              id="compass-title"
              className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[#F3F2EE] sm:text-3xl"
            >
              {isRu
                ? 'К какому лагерю в науке о сознании принадлежит ваш разум?'
                : 'Which camp in consciousness science matches your intuition?'}
            </h2>
            <p className="mt-2 max-w-[66ch] text-[0.94rem] leading-relaxed text-[#B8B5AD]">
              {isRu
                ? 'Ответьте на 4 мысленные дилеммы, которые сегодня раскалывают нейробиологов и философов, — и посмотрите, чью сторону вы занимаете в главной научной дискуссии XXI века.'
                : 'Answer 4 thought-experiment dilemmas that divide neuroscientists and philosophers today to map your personal theoretical profile.'}
            </p>
          </div>

          {answeredCount > 0 && (
            <button
              type="button"
              onClick={() => setAnswers({})}
              className="inline-flex cursor-pointer items-center gap-2 self-start rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 font-mono text-[0.68rem] text-[#B8B5AD] hover:text-white lg:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isRu ? 'Сбросить ответы' : 'Reset answers'}</span>
            </button>
          )}
        </div>

        {/* 4 Dilemma Cards + Live Profile Dashboard */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          {/* Left: 4 Dilemmas */}
          <div className="space-y-6">
            {QUESTIONS.map((q) => {
              const selectedIdx = answers[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-white/10 bg-[#171715] p-5"
                >
                  <div className="font-mono text-[0.64rem] font-semibold tracking-[0.12em] text-[#D99B4E] uppercase">
                    {isRu ? q.tagRu : q.tagEn}
                  </div>
                  <h3 className="mt-2 font-display text-[1.02rem] font-semibold leading-snug text-[#F3F2EE]">
                    {isRu ? q.questionRu : q.questionEn}
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const isChosen = selectedIdx === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                          }
                          aria-pressed={isChosen}
                          className={`cursor-pointer rounded-xl border px-3.5 py-2.5 text-left text-[0.84rem] leading-[1.5] transition-all ${
                            isChosen
                              ? 'border-[#2AB3A6] bg-[#2AB3A6]/15 font-medium text-[#F3F2EE]'
                              : 'border-white/[0.07] bg-white/[0.02] text-[#B8B5AD] hover:border-white/20 hover:text-[#F3F2EE]'
                          }`}
                        >
                          {isRu ? opt.labelRu : opt.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Live Profile Radar & Verdict */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/12 bg-[#161614] p-6 lg:sticky lg:top-[84px] lg:self-start">
            <div>
              <div className="flex items-center justify-between font-mono text-[0.65rem] text-[#8E8B82]">
                <span>
                  {isRu ? 'ВАШ ТЕОРЕТИЧЕСКИЙ ПРОФИЛЬ' : 'YOUR THEORETICAL PROFILE'}
                </span>
                <span>
                  {isRu
                    ? `Ответов: ${answeredCount} / 4`
                    : `Answered: ${answeredCount} / 4`}
                </span>
              </div>

              {/* 4 School Bars */}
              <div className="mt-5 space-y-4">
                {(['beast', 'iit', 'gnwt', 'illusion'] as const).map((sk) => {
                  const info = SCHOOL_INFO[sk];
                  const pct = scores[sk];
                  return (
                    <div key={sk}>
                      <div className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="font-medium text-[#F3F2EE]">
                          {isRu ? info.titleRu : info.titleEn}
                        </span>
                        <span
                          className="font-mono font-semibold tabular-nums"
                          style={{ color: info.color }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                        <motion.div
                          className="h-full rounded-full"
                          initial={false}
                          animate={{ width: `${pct}%` }}
                          style={{ backgroundColor: info.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Primary Match Card */}
              <div
                className="mt-7 rounded-2xl border p-4"
                style={{
                  borderColor: `${topInfo.color}55`,
                  backgroundColor: `${topInfo.color}12`,
                }}
              >
                <div className="flex items-center gap-2 font-mono text-[0.64rem] font-semibold tracking-[0.12em] uppercase" style={{ color: topInfo.color }}>
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {answeredCount === 0
                    ? isRu
                      ? 'Выберите ответы слева для расчёта'
                      : 'Select answers on the left to compute'
                    : isRu
                      ? 'ДОМИНИРУЮЩАЯ ПАРАДИГМА'
                      : 'DOMINANT PARADIGM'}
                </div>

                <h4 className="mt-2 font-display text-lg font-semibold text-[#F3F2EE]">
                  {isRu ? topInfo.titleRu : topInfo.titleEn}
                </h4>

                <div className="mt-1 font-mono text-[0.68rem] text-[#D6D3CB]">
                  {isRu ? topInfo.thinkersRu : topInfo.thinkersEn}
                </div>

                <p className="mt-3 text-[0.85rem] leading-[1.64] text-[#D6D3CB]">
                  {isRu ? topInfo.summaryRu : topInfo.summaryEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
