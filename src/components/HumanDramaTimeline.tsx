import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Flame, MapPin, Quote, Users } from 'lucide-react';
import type { Lang } from '../data/content';

export interface HumanDramaTimelineProps {
  lang: Lang;
}

interface MilestoneEvent {
  id: string;
  year: string;
  locationRu: string;
  locationEn: string;
  badgeRu: string;
  badgeEn: string;
  titleRu: string;
  titleEn: string;
  storyRu: string;
  storyEn: string;
  quoteRu: string;
  quoteEn: string;
  quoteAuthorRu: string;
  quoteAuthorEn: string;
  photo: string;
  photoAltRu: string;
  photoAltEn: string;
  photoCaptionRu: string;
  photoCaptionEn: string;
  secondaryPhoto?: string;
  secondaryCaptionRu?: string;
  secondaryCaptionEn?: string;
  accent: string;
}

interface ProtagonistCard {
  id: string;
  nameRu: string;
  nameEn: string;
  roleRu: string;
  roleEn: string;
  campRu: string;
  campEn: string;
  photo: string;
  stanceRu: string;
  stanceEn: string;
  accent: string;
}

const MILESTONES: readonly MilestoneEvent[] = [
  {
    id: 'wager-2023',
    year: '1998 → ИЮНЬ 2023',
    locationRu: 'Бремен (1998) → Конференция ASSC 26, Нью-Йоркский университет (NYU)',
    locationEn: 'Bremen (1998) → ASSC 26 Conference, New York University (NYU)',
    badgeRu: '25-ЛЕТНЕЕ ПАРИ НА ЯЩИК МАДЕРЫ',
    badgeEn: 'THE 25-YEAR MADEIRA WINE WAGER',
    titleRu:
      'Философ побеждает нейробиолога: Кристоф Кох вручает Дэвиду Чалмерсу ящик мадеры 1978 года',
    titleEn:
      'Philosopher defeats neuroscientist: Christof Koch hands David Chalmers a case of 1978 Madeira wine on stage',
    storyRu:
      'В июне 1998 года в баре немецкого Бремена нейробиолог Кристоф Кох поставил ящик коллекционного вина на то, что через 25 лет наука найдёт окончательный «нейронный коррелят сознания». В июне 2023 года на сцене ежегодной конференции ASSC в Нью-Йорке, сразу после оглашения первых результатов проекта COGITATE, Кох публично признал поражение и передал Чалмерсу ящик винтажной португальской мадеры: мозг оказался сложнее любых простых схем.',
    storyEn:
      'In June 1998 in a Bremen bar, neuroscientist Christof Koch bet a case of fine wine that within 25 years science would discover a clear, definitive neural signature of consciousness. In June 2023, on stage at the ASSC conference at NYU following the first COGITATE results, Koch publicly conceded and handed David Chalmers a case of 1978 Madeira wine.',
    quoteRu:
      '«Я проиграл пари Дэвиду, но выиграла наука: сегодня мы проверяем теории сознания в жёстких пререгистрированных дуэлях, а не в кабинетных спорах».',
    quoteEn:
      '“I lost the bet to David, but science won: we are now testing consciousness theories in preregistered adversarial clashes rather than armchair debates.”',
    quoteAuthorRu: 'Кристоф Кох, сцена ASSC 26 в Нью-Йорке (2023)',
    quoteAuthorEn: 'Christof Koch, ASSC 26 Stage in New York (2023)',
    photo: './photos/chalmers.jpg',
    photoAltRu: 'Философ Дэвид Чалмерс на конференции',
    photoAltEn: 'Philosopher David Chalmers speaking at a conference',
    photoCaptionRu: 'Дэвид Чалмерс — автор «Трудной проблемы сознания» и победитель 25-летнего пари',
    photoCaptionEn: 'David Chalmers — author of the "Hard Problem" and winner of the 25-year wager',
    secondaryPhoto: './photos/koch.jpg',
    secondaryCaptionRu: 'Кристоф Кох на конференции Toward a Science of Consciousness',
    secondaryCaptionEn: 'Christof Koch at the Toward a Science of Consciousness conference',
    accent: '#D99B4E',
  },
  {
    id: 'iit-letter-2023',
    year: 'СЕНТЯБРЬ 2023 → АПРЕЛЬ 2025',
    locationRu: 'Открытое письмо 124 учёных → Полемика в Nature Neuroscience',
    locationEn: 'Open Letter of 124 Scientists → Nature Neuroscience Clash',
    badgeRu: 'АКАДЕМИЧЕСКИЙ БУНТ И «ВОЙНА ПАРАДИГМ»',
    badgeEn: 'ACADEMIC REVOLT & CLASH OF PARADIGMS',
    titleRu:
      '«Интегрированная информация — это псевдонаука?»: письмо 124 исследователей раскалывает нейронауку',
    titleEn:
      '“Is Integrated Information Theory pseudoscience?”: 124 researchers spark a civil war in neuroscience',
    storyRu:
      'В сентябре 2023 года 124 известных нейробиолога и философа опубликовали беспрецедентное открытое письмо, объявив теорию IIT Джулио Тонони «псевдонаукой» из-за её панпсихистских следствий (приписывания сознания неактивным логическим сетям и органоидам). В апреле 2025 года журнал Nature Neuroscience опубликовал большой ответный манифест «Сознание или псевдосознание? Столкновение двух парадигм», обнаживший глубокий раскол между вычислительным функционализмом и феноменологией.',
    storyEn:
      'In September 2023, 124 prominent researchers signed a controversial open letter labeling Giulio Tononi’s Integrated Information Theory (IIT) "pseudoscience" over its panpsychist implications. In April 2025, Nature Neuroscience published a landmark debate feature—"Consciousness or pseudo-consciousness? A clash of two paradigms"—crystallizing the philosophical divide.',
    quoteRu:
      '«Когда доминирующая вычислительная парадигма сталкивается с теорией, ставящей субъективный опыт на первое место, возникает соблазн объявить соперника ересью».',
    quoteEn:
      '“When a dominant computational paradigm confronts a consciousness-first ontology, the temptation is to police the boundary with labels rather than experiments.”',
    quoteAuthorRu: 'Полемика в Nature Neuroscience (апрель 2025)',
    quoteAuthorEn: 'Nature Neuroscience Debate (April 2025)',
    photo: './photos/seth.jpg',
    photoAltRu: 'Нейробиолог Анил Сет выступает на научной конференции Congreso Futuro',
    photoAltEn: 'Neuroscientist Anil Seth speaking on stage at Congreso Futuro conference',
    photoCaptionRu: 'Анил Сет на сцене конгресса Congreso Futuro: защита смелых теорий при строгой эмпирической проверке',
    photoCaptionEn: 'Anil Seth on stage at Congreso Futuro advocating rigorous empirical testing of ambitious theories',
    secondaryPhoto: './photos/tononi.jpg',
    secondaryCaptionRu: 'Джулио Тонони — создатель теории интегрированной информации (IIT 4.0)',
    secondaryCaptionEn: 'Giulio Tononi — architect of Integrated Information Theory (IIT 4.0)',
    accent: '#E05A47',
  },
  {
    id: 'nejm-cmd-2024',
    year: 'АВГУСТ 2024',
    locationRu: 'Гарвард / Weill Cornell / 6 клинических центров · New England Journal of Medicine',
    locationEn: 'Harvard / Weill Cornell / 6 Medical Centers · New England Journal of Medicine',
    badgeRu: 'КЛИНИЧЕСКИЙ ПРОРЫВ В РЕАНИМАЦИИ',
    badgeEn: 'CLINICAL ICU BREAKTHROUGH',
    titleRu:
      'Каждый четвёртый пациент «в коме или вегетативном состоянии» слышит врачей: открытие скрытого сознания у 25%',
    titleEn:
      'One in four behaviorally unresponsive ICU patients is covertly conscious (NEJM, August 2024)',
    storyRu:
      'Команда Йелены Бодиен и Николаса Шиффа обследовала 241 пациента с тяжёлым поражением мозга, которые внешне никак не реагировали на команды врачей. Когда пациентов в сканере фМРТ и с шапочкой ЭЭГ просили мысленно представить игру в теннис или сжатие ладони, у 60 человек (25%!) устойчиво активировались моторные зоны коры. Вместе с ТМС-ЭЭГ индексом Массимини (PCI* = 0.31) это перевернуло реаниматологию и медицинскую этику.',
    storyEn:
      'Yelena Bodien, Nicholas Schiff, and colleagues tested 241 clinically unresponsive brain-injury patients across six international centers. Using task-based fMRI and EEG mental imagery commands, they discovered that 25% (60 patients) repeatedly followed verbal instructions internally—a condition known as Cognitive Motor Dissociation (CMD).',
    quoteRu:
      '«Молчание тела больше нельзя путать с отсутствием разума. Мы обязаны искать скрытое сознание инструментально».',
    quoteEn:
      '“Silence of the motor system can no longer be equated with absence of an experiencing mind.”',
    quoteAuthorRu: 'Николас Шифф и Йелена Бодиен (NEJM, август 2024)',
    quoteAuthorEn: 'Nicholas Schiff & Yelena Bodien (NEJM, August 2024)',
    photo: './photos/tms_clinic.jpg',
    photoAltRu: 'Катушка транскраниальной магнитной стимуляции (ТМС)',
    photoAltEn: 'Transcranial magnetic stimulation figure-eight coil',
    photoCaptionRu: 'Катушка ТМС («восьмёрка») для измерения индекса пертурбационной сложности коры (PCI* = 0.31)',
    photoCaptionEn: 'Figure-eight TMS coil used in "Zap & Zip" Perturbational Complexity Index (PCI* = 0.31) diagnostics',
    secondaryPhoto: './photos/fmri_lab.jpg',
    secondaryCaptionRu: 'Клинический томограф фМРТ для выявления когнитивно-моторной диссоциации (CMD)',
    secondaryCaptionEn: 'Clinical fMRI scanner used to detect Cognitive Motor Dissociation (CMD)',
    accent: '#2AB3A6',
  },
  {
    id: 'cogitate-nature-2025',
    year: 'АПРЕЛЬ 2025',
    locationRu: 'Консорциум COGITATE · Публикация в журнале Nature (256 участников)',
    locationEn: 'COGITATE Consortium · Published in Nature (256 Participants)',
    badgeRu: 'ИСТОРИЧЕСКАЯ ДУЭЛЬ В NATURE',
    badgeEn: 'LANDMARK NATURE SHOWDOWN',
    titleRu:
      'Ничья с пробоинами для обоих гигантов: что показала проверка IIT против GNWT на 256 испытуемых',
    titleEn:
      'No clean victor: Nature publishes the 256-participant COGITATE adversarial test of IIT vs. GNWT',
    storyRu:
      'Под руководством нейтрального арбитра Люсии Меллони сторонники Станисласа Деана (GNWT) и Джулио Тонони (IIT) заранее подписали протокол фальсификации. Три независимые когорты (фМРТ, магнитоэнцефалография МЭГ и внутричерепная иЭЭГ) принесли отрезвляющий результат: задняя кора действительно удерживала содержание зрительного опыта лучше префронтальной (в пользу IIT), но предсказанной синхронизации внутри задней коры не нашлось, а у GNWT не сработала вспышка при исчезновении стимула.',
    storyEn:
      'Led by theory-neutral arbiter Lucia Melloni, proponents of Stanislas Dehaene’s GNWT and Giulio Tononi’s IIT agreed in advance on falsification criteria across fMRI, MEG, and intracranial EEG cohorts totaling 256 participants. Neither theory scored a clean knockout—forcing a post-COGITATE rethinking of consciousness neuroscience.',
    quoteRu:
      '«Состязательное сотрудничество не коронует победителя за один день — его триумф в том, что теории больше не могут уклоняться от неудобных фактов».',
    quoteEn:
      '“Adversarial collaboration forces our grandest theories to face empirical reality under rules no one can rewrite after the fact.”',
    quoteAuthorRu: 'Итоги консорциума COGITATE (Nature, апрель 2025)',
    quoteAuthorEn: 'COGITATE Consortium Outcome (Nature, April 2025)',
    photo: './photos/meg_lab.jpg',
    photoAltRu: 'Установка магнитоэнцефалографии (МЭГ) для миллисекундной регистрации активности коры',
    photoAltEn: 'Magnetoencephalography (MEG) neuroscanner helmet in a shielded laboratory',
    photoCaptionRu: 'Магнитоэнцефалография (МЭГ): миллисекундное отслеживание корковых волн в протоколе COGITATE',
    photoCaptionEn: 'Magnetoencephalography (MEG) scanner capturing millisecond cortical dynamics in COGITATE',
    secondaryPhoto: './photos/dehaene.jpg',
    secondaryCaptionRu: 'Станислас Деан — лидер теории глобального нейронного рабочего пространства (GNWT)',
    secondaryCaptionEn: 'Stanislas Dehaene — architect of Global Neuronal Workspace Theory (GNWT)',
    accent: '#5B8DEF',
  },
];

const PROTAGONISTS: readonly ProtagonistCard[] = [
  {
    id: 'chalmers',
    nameRu: 'Дэвид Чалмерс',
    nameEn: 'David Chalmers',
    roleRu: 'Профессор философии и нейронауки, NYU',
    roleEn: 'Professor of Philosophy & Neural Science, NYU',
    campRu: 'Трудная проблема · Мета-проблема',
    campEn: 'The Hard Problem · Meta-Problem',
    photo: './photos/chalmers.jpg',
    stanceRu:
      'Разделил «лёгкие проблемы» нейровычислений и «Трудную проблему» субъективного опыта; выиграл 25-летнее пари у Кристофа Коха и стал соавтором Нью-Йоркской декларации 2024 г. и отчёта об индикаторах ИИ 2025 г.',
    stanceEn:
      'Formulated the Hard Problem of Consciousness (1995), won the 25-year wager against Christof Koch (2023), and co-authored both the 2024 NY Animal Declaration and 2025 AI Consciousness indicators.',
    accent: '#D99B4E',
  },
  {
    id: 'koch',
    nameRu: 'Кристоф Кох',
    nameEn: 'Christof Koch',
    roleRu: 'Главный учёный, Allen Institute for Brain Science',
    roleEn: 'Meritorious Investigator, Allen Institute',
    campRu: 'Нейронные корреляты (NCC) · IIT 4.0',
    campEn: 'Neural Correlates (NCC) · IIT 4.0',
    photo: './photos/koch.jpg',
    stanceRu:
      'Вместе с Фрэнсисом Криком запустил современный поиск нейронных коррелятов сознания. Сторонник локализации опыта в задней «горячей зоне» коры и соавтор теории интегрированной информации (IIT 4.0).',
    stanceEn:
      'Co-founded the empirical search for Neural Correlates of Consciousness (NCC) with Francis Crick; champions the posterior cortical "hot zone" and Integrated Information Theory.',
    accent: '#2AB3A6',
  },
  {
    id: 'dehaene',
    nameRu: 'Станислас Деан',
    nameEn: 'Stanislas Dehaene',
    roleRu: 'Профессор Collège de France, директор NeuroSpin',
    roleEn: 'Professor at Collège de France, Director of NeuroSpin',
    campRu: 'Глобальное рабочее пространство (GNWT)',
    campEn: 'Global Neuronal Workspace (GNWT)',
    photo: './photos/dehaene.jpg',
    stanceRu:
      'Доказывает, что сознание возникает, когда сенсорная информация вызывает лавинообразное «воспламенение» (ignition) в лобно-теменной сети и транслируется по всему мозгу.',
    stanceEn:
      'Demonstrates that conscious access arises when sensory signals trigger a non-linear fronto-parietal "ignition" broadcasting information across the cortex.',
    accent: '#E05A47',
  },
  {
    id: 'tononi',
    nameRu: 'Джулио Тонони',
    nameEn: 'Giulio Tononi',
    roleRu: 'Профессор психиатрии, Университет Висконсина',
    roleEn: 'Professor of Psychiatry, UW–Madison',
    campRu: 'Интегрированная информация (IIT 4.0) · PCI',
    campEn: 'Integrated Information (IIT 4.0) · PCI',
    photo: './photos/tononi.jpg',
    stanceRu:
      'Создал математическую теорию интегрированной информации (Φ) и совместно с Марчелло Массимини разработал клинический индекс сложности коры PCI («Zap & Zip») для пациентов в коме.',
    stanceEn:
      'Created the mathematical formalism of Integrated Information Theory (Φ) and co-developed the clinical Perturbational Complexity Index (PCI) with Marcello Massimini.',
    accent: '#2AB3A6',
  },
  {
    id: 'seth',
    nameRu: 'Анил Сет',
    nameEn: 'Anil Seth',
    roleRu: 'Директор Центра науки о сознании, Сассекс',
    roleEn: 'Director of Consciousness Science, Sussex',
    campRu: 'Контролируемая галлюцинация · Зверь-машина',
    campEn: 'Controlled Hallucination · Beast Machine',
    photo: './photos/seth.jpg',
    stanceRu:
      'Рассматривает восприятие как «контролируемую галлюцинацию» (байесовский прогноз мозга), а само ощущение «Я» укореняет в биологической интероцепции живого тела.',
    stanceEn:
      'Frames conscious perception as a "controlled hallucination" driven by predictive processing, rooting selfhood in living bodily interoception.',
    accent: '#D99B4E',
  },
  {
    id: 'dennett',
    nameRu: 'Дэниел Деннет (1942–2024)',
    nameEn: 'Daniel Dennett (1942–2024)',
    roleRu: 'Философ когнитивистики, Университет Тафтса',
    roleEn: 'Philosopher of Cognitive Science, Tufts University',
    campRu: 'Множественные наброски · Иллюзионизм',
    campEn: 'Multiple Drafts · Illusionism',
    photo: './photos/dennett.jpg',
    stanceRu:
      'Развенчал миф о «картезианском театре» внутри мозга: сознание — это не внутренний кинозал с мистическими квалиа, а распределённый поток конкурирующих когнитивных набросков и «пользовательский интерфейс».',
    stanceEn:
      'Dismantled the myth of the "Cartesian Theater": consciousness is not an inner cinema of private qualia, but distributed competing drafts and a biological user-illusion.',
    accent: '#5B8DEF',
  },
];

export function HumanDramaTimeline({ lang }: HumanDramaTimelineProps) {
  const isRu = lang === 'ru';
  const [activeId, setActiveId] = useState<string>(MILESTONES[0].id);

  const activeMilestone =
    MILESTONES.find((m) => m.id === activeId) ?? MILESTONES[0];

  return (
    <section
      id="human-drama"
      aria-labelledby="drama-heading"
      className="relative z-20 my-20 mx-auto max-w-[1520px] px-4 sm:px-7 lg:px-10"
    >
      <div className="rounded-3xl border border-white/12 bg-[#111110] p-6 text-[#F3F2EE] shadow-2xl sm:p-10">
        {/* Top Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D99B4E]/40 bg-[#D99B4E]/15 px-3 py-1 font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-[#D99B4E] uppercase">
              <Flame className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {isRu
                ? 'ЖИВАЯ ИСТОРИЯ · КОНФЕРЕНЦИИ, ПАРИ И ЛАБОРАТОРИИ'
                : 'HUMAN CHRONICLE · CONFERENCES, WAGERS & LABS'}
            </span>

            <h2
              id="drama-heading"
              className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] leading-[1.15] text-[#F3F2EE] sm:text-3xl"
            >
              {isRu
                ? 'Детектив вокруг сознания: от пари в Бремене до дуэли в Nature'
                : 'The Consciousness Detective Story: From a Bremen Bar Wager to Nature'}
            </h2>
          </div>

          <p className="max-w-[52ch] text-[0.92rem] leading-relaxed text-[#B8B5AD]">
            {isRu
              ? 'За каждой формулой стоят реальные учёные, публичные споры на конгрессах ASSC, миллисекундные сканеры МЭГ и спасённые жизни в нейрореанимации.'
              : 'Behind every equation stand real protagonists, high-stakes conference wagers at ASSC, shielded MEG helmets, and ICU breakthroughs.'}
          </p>
        </div>

        {/* Interactive Milestone Selector Tabs (Full-Width 4-Column Row) */}
        <div
          role="tablist"
          aria-label={isRu ? 'Ключевые события науки о сознании' : 'Landmark events in consciousness science'}
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {MILESTONES.map((m) => {
            const isSelected = m.id === activeMilestone.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveId(m.id)}
                className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[#D99B4E]/70 bg-[#1B1A17] shadow-lg'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[0.63rem]">
                  <span style={{ color: m.accent }} className="font-semibold">
                    {m.year}
                  </span>
                  <Calendar className="h-3 w-3 shrink-0 text-[#8E8B82]" aria-hidden="true" />
                </div>
                <div className="mt-1.5 font-display text-[0.88rem] font-semibold leading-snug text-[#F3F2EE]">
                  {isRu ? m.badgeRu : m.badgeEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Milestone Documentary Feature Card (Full-Width 2-Column Spread) */}
        <motion.div
          key={activeMilestone.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="mt-6 grid grid-cols-1 gap-8 rounded-2xl border border-white/10 bg-[#161614] p-6 sm:p-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
        >
          {/* Left: Story + Verbatim Quote */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[0.66rem] text-[#B8B5AD]">
                <MapPin
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: activeMilestone.accent }}
                  aria-hidden="true"
                />
                <span>
                  {isRu ? activeMilestone.locationRu : activeMilestone.locationEn}
                </span>
              </div>

              <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.025em] leading-[1.2] text-[#F3F2EE] sm:text-2xl">
                {isRu ? activeMilestone.titleRu : activeMilestone.titleEn}
              </h3>

              <p className="mt-4 text-[0.96rem] leading-[1.76] text-[#D6D3CB]">
                {isRu ? activeMilestone.storyRu : activeMilestone.storyEn}
              </p>
            </div>

            <blockquote
              className="mt-6 rounded-xl border-l-2 bg-black/25 p-4"
              style={{ borderColor: activeMilestone.accent }}
            >
              <div className="flex items-start gap-2.5">
                <Quote
                  className="mt-0.5 h-4 w-4 shrink-0 opacity-70"
                  style={{ color: activeMilestone.accent }}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[0.9rem] italic leading-[1.6] text-[#F3F2EE]">
                    {isRu ? activeMilestone.quoteRu : activeMilestone.quoteEn}
                  </p>
                  <footer className="mt-2 font-mono text-[0.65rem] text-[#B8B5AD]">
                    — {isRu ? activeMilestone.quoteAuthorRu : activeMilestone.quoteAuthorEn}
                  </footer>
                </div>
              </div>
            </blockquote>
          </div>

          {/* Right: Spacious Side-by-Side Real Documentary Photographs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <figure className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0C]">
              <div className="relative h-64 w-full overflow-hidden bg-[#1A1A18]">
                <img
                  src={activeMilestone.photo}
                  alt={isRu ? activeMilestone.photoAltRu : activeMilestone.photoAltEn}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
                />
              </div>
              <figcaption className="p-3.5 font-mono text-[0.66rem] leading-[1.48] text-[#B8B5AD]">
                {isRu ? activeMilestone.photoCaptionRu : activeMilestone.photoCaptionEn}
              </figcaption>
            </figure>

            {activeMilestone.secondaryPhoto && (
              <figure className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0C]">
                <div className="relative h-64 w-full overflow-hidden bg-[#1A1A18]">
                  <img
                    src={activeMilestone.secondaryPhoto}
                    alt={
                      isRu
                        ? activeMilestone.secondaryCaptionRu
                        : activeMilestone.secondaryCaptionEn
                    }
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <figcaption className="p-3.5 font-mono text-[0.66rem] leading-[1.48] text-[#B8B5AD]">
                  {isRu
                    ? activeMilestone.secondaryCaptionRu
                    : activeMilestone.secondaryCaptionEn}
                </figcaption>
              </figure>
            )}
          </div>
        </motion.div>

        {/* Protagonist Portrait Gallery (Full-Width 3-Column Grid) */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold tracking-[0.12em] text-[#2AB3A6] uppercase">
              <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {isRu
                  ? 'ГЛАВНЫЕ ДЕЙСТВУЮЩИЕ ЛИЦА И АРХИТЕКТОРЫ ТЕОРИЙ'
                  : 'KEY PROTAGONISTS & ARCHITECTS OF CONSCIOUSNESS SCIENCE'}
              </span>
            </div>
            <span className="font-mono text-[0.63rem] text-[#8E8B82]">
              {isRu ? 'Фото: архив конференций / Wikimedia Commons' : 'Photos: Conference Archives / Wikimedia Commons'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROTAGONISTS.map((p) => (
              <article
                key={p.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#161614] p-4 transition-colors hover:border-white/25"
              >
                <div>
                  <div className="flex items-center gap-3.5">
                    <img
                      src={p.photo}
                      alt={isRu ? p.nameRu : p.nameEn}
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-full border border-white/15 object-cover object-top"
                    />
                    <div className="min-w-0">
                      <h4 className="truncate font-display text-[0.98rem] font-semibold text-[#F3F2EE]">
                        {isRu ? p.nameRu : p.nameEn}
                      </h4>
                      <div className="truncate font-mono text-[0.63rem] text-[#B8B5AD]">
                        {isRu ? p.roleRu : p.roleEn}
                      </div>
                      <span
                        className="mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-[0.58rem] font-semibold"
                        style={{
                          backgroundColor: `${p.accent}20`,
                          color: p.accent,
                        }}
                      >
                        {isRu ? p.campRu : p.campEn}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3.5 text-[0.83rem] leading-[1.6] text-[#D6D3CB]">
                    {isRu ? p.stanceRu : p.stanceEn}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
