import type { Lang } from './phase1Copy';

export type BrainBeatMode = 'iit' | 'gnwt' | 'cogitate' | 'split';

export const PHASE345_COPY = {
  act2: {
    eyebrow: {
      ru: 'ЗАЛ 02 · АНАТОМИЧЕСКИЙ ПЬЕДЕСТАЛ · COGITATE (NATURE, 2025)',
      en: 'CHAMBER 02 · ANATOMICAL PEDESTAL · COGITATE (NATURE, 2025)',
    },
    dragHint: {
      ru: 'Вращайте 3D-мозг мышью (360°) · Наводите на извилины',
      en: 'Drag to orbit 3D brain (360°) · Hover cortical lobes',
    },
    modes: [
      { id: 'iit' as BrainBeatMode, label: { ru: '01 · IIT (Задняя зона)', en: '01 · IIT (Posterior)' }, color: '#D94225' },
      { id: 'gnwt' as BrainBeatMode, label: { ru: '02 · GNWT (Лобная кора)', en: '02 · GNWT (Prefrontal)' }, color: '#004EDF' },
      { id: 'cogitate' as BrainBeatMode, label: { ru: '03 · Вердикт 2025', en: '03 · 2025 Verdict' }, color: '#0D7A5F' },
      { id: 'split' as BrainBeatMode, label: { ru: '04 · Раскрытие: Таламус', en: '04 · Split: Thalamus' }, color: '#141413' },
    ],
    beats: {
      iit: {
        kicker: { ru: '> 01 / 04 · ТЕОРИЯ ИНТЕГРИРОВАННОЙ ИНФОРМАЦИИ (ТОНОНИ · КОХ)', en: '> 01 / 04 · INTEGRATED INFORMATION THEORY (TONONI · KOCH)' },
        titleMain: { ru: 'Задняя горячая зона:', en: 'The posterior hot zone:' },
        titleAccent: { ru: 'сознание живёт в теменно-затылочной коре.', en: 'experience anchored in posterior cortex.' },
        body: {
          ru: 'IIT 4.0 предсказывает, что содержание визуального опыта устойчиво поддерживается плотной решёткой связей в затылочно-теменной коре (подсвечена киноварью) на протяжении всего стимула.',
          en: 'IIT 4.0 predicts that conscious visual content is sustained by dense recurrent grids across occipital-parietal cortex (flushed vermilion) for the full duration of a stimulus.',
        },
        statLabel: { ru: 'КЛЮЧЕВОЙ ПРОГНОЗ IIT', en: 'KEY IIT PREDICTION' },
        statValue: { ru: 'Устойчивый код в V1–V4 + синхронизация', en: 'Sustained V1–V4 code + synchronization' },
      },
      gnwt: {
        kicker: { ru: '> 02 / 04 · ГЛОБАЛЬНОЕ НЕЙРОННОЕ РАБОЧЕЕ ПРОСТРАНСТВО (ДЕАН · ШАНЖЁ)', en: '> 02 / 04 · GLOBAL NEURONAL WORKSPACE (DEHAENE · CHANGEUX)' },
        titleMain: { ru: 'Лобное воспламенение:', en: 'Prefrontal ignition:' },
        titleAccent: { ru: 'сигнал становится осознанным в трансляции.', en: 'information turns conscious when broadcast.' },
        body: {
          ru: 'GNWT утверждает, что локального восприятия в затылке недостаточно: опыт рождается, когда префронтальная кора (подсвечена кобальтом) запускает короткую вспышку «воспламенения» и раздаёт сигнал всему мозгу.',
          en: 'GNWT holds that posterior activity is not enough: awareness arises when prefrontal cortex (illuminated cobalt) triggers a brief ignition broadcasting the signal brain-wide.',
        },
        statLabel: { ru: 'КЛЮЧЕВОЙ ПРОГНОЗ GNWT', en: 'KEY GNWT PREDICTION' },
        statValue: { ru: 'Вспышка в ПФК в начале и конце стимула', en: 'PFC ignition burst at onset & offset' },
      },
      cogitate: {
        kicker: { ru: '> 03 / 04 · СОСТЯЗАТЕЛЬНЫЙ ВЕРДИКТ (NATURE, АПРЕЛЬ 2025)', en: '> 03 / 04 · ADVERSARIAL VERDICT (NATURE, APRIL 2025)' },
        titleMain: { ru: '256 испытуемых, 12 лабораторий:', en: '256 participants, 12 labs:' },
        titleAccent: { ru: 'обе теории получили жёсткий вызов.', en: 'both theories faced decisive challenges.' },
        body: {
          ru: 'Данные fMRI, MEG и внутричерепной ЭЭГ подтвердили устойчивое кодирование в задней коре (плюс IIT), но не нашли предсказанной IIT длительной синхронизации — равно как и финальной вспышки GNWT в лобной доле.',
          en: 'fMRI, MEG, and intracranial EEG confirmed sustained posterior coding (a win for IIT), yet failed to find IIT’s predicted sustained synchrony — and missed GNWT’s offset ignition in prefrontal cortex.',
        },
        statLabel: { ru: 'ИТОГ COGITATE (NATURE 2025)', en: 'COGITATE OUTCOME (NATURE 2025)' },
        statValue: { ru: 'Задняя кора ✓ · Синхронизация ✕ · Финальный ПФК ✕', en: 'Posterior ✓ · Synchrony ✕ · Offset PFC ✕' },
      },
      split: {
        kicker: { ru: '> 04 / 04 · РАСКРЫТИЕ ПОЛУШАРИЯ (АНАТОМИЯ ГЛУБИНЫ)', en: '> 04 / 04 · SPLIT-HEMISPHERE REVEAL (DEEP ANATOMY)' },
        titleMain: { ru: 'Таламус и лимбическое ядро:', en: 'Thalamus & limbic core:' },
        titleAccent: { ru: 'дирижёр таламокортикальных петель.', en: 'the conductor of thalamocortical loops.' },
        body: {
          ru: 'Правое полушарие плавно раздвигается без мутной прозрачности, открывая реальный Таламус, Гиппокамп и базальные ядра внутри: именно двусторонние петли Таламус ↔ Кора удерживают бодрствующее сознание.',
          en: 'The right hemisphere glides cleanly aside without muddy transparency, unveiling the real Thalamus, Hippocampus, and basal nuclei: reciprocal Thalamus ↔ Cortex loops sustain waking awareness.',
        },
        statLabel: { ru: 'ГЛУБОКИЙ КОНТУР', en: 'DEEP CIRCUITRY' },
        statValue: { ru: '8 таламокортикальных магистралей · 10 зон · 60 FPS', en: '8 thalamocortical pathways · 10 regions · 60 FPS' },
      },
    },
    lobeNames: {
      frontal: {
        title: { ru: 'Лобная / Префронтальная кора', en: 'Frontal / Prefrontal Cortex' },
        role: { ru: 'Глобальное рабочее пространство (GNWT), метапознание и отчёт', en: 'Global Workspace (GNWT), metacognition & report' },
      },
      parietal: {
        title: { ru: 'Теменная кора', en: 'Parietal Cortex' },
        role: { ru: 'Мультимодальная интеграция и задняя горячая зона (IIT)', en: 'Multimodal integration & posterior hot zone (IIT)' },
      },
      occipital: {
        title: { ru: 'Затылочная зрительная кора (V1–V4)', en: 'Occipital Visual Cortex (V1–V4)' },
        role: { ru: 'Устойчивое кодирование визуальных квалиа (COGITATE 2025 ✓)', en: 'Sustained coding of visual qualia (COGITATE 2025 ✓)' },
      },
      temporal: {
        title: { ru: 'Височная доля и Островок', en: 'Temporal Lobe & Insula' },
        role: { ru: 'Семантика, память и телесная интероцепция (Анил Сет)', en: 'Semantics, memory & bodily interoception (Anil Seth)' },
      },
      thalamus: {
        title: { ru: 'Таламус и Гиппокамп', en: 'Thalamus & Hippocampus' },
        role: { ru: 'Центральный релейный узел бодрствования и таламокортикальных петель', en: 'Central relay hub of waking awareness & cortical loops' },
      },
      cerebellum: {
        title: { ru: 'Мозжечок и Ствол мозга', en: 'Cerebellum & Brainstem' },
        role: { ru: '69 млрд нейронов без прямой генерации квалиа — главный аргумент IIT', en: '69B neurons without generating qualia — a cornerstone clue for IIT' },
      },
    },
  },

  act5: {
    eyebrow: { ru: 'ЗАЛ 05 · ГОРИЗОНТ ИНЫХ РАЗУМОВ (2024–2025)', en: 'CHAMBER 05 · HORIZON OF OTHER MINDS (2024–2025)' },
    titleMain: { ru: 'Не одна лестница к человеку —', en: 'Not a single ladder to humans —' },
    titleAccent: { ru: 'а многомерный ландшафт разумов.', en: 'a multidimensional landscape of minds.' },
    quote: {
      ru: '«Когда существует реалистичная вероятность сознательного опыта у животного, безответственно игнорировать её при принятии решений.»',
      en: '“When there is a realistic possibility of conscious experience in an animal, it is irresponsible to ignore that possibility in decisions affecting that animal.”',
    },
    quoteCite: {
      ru: 'Нью-Йоркская декларация о сознании животных · Нью-Йоркский университет · 19 апреля 2024',
      en: 'The New York Declaration on Animal Consciousness · New York University · April 19, 2024',
    },
    axes: [
      { ru: 'Сенсорное богатство', en: 'Sensory Richness' },
      { ru: 'Оценка / Боль', en: 'Valence / Affect' },
      { ru: 'Глубина времени', en: 'Temporal Depth' },
      { ru: 'Единство агента', en: 'Unified Agency' },
      { ru: 'Саморефлексия', en: 'Metacognition' },
    ],
    beings: [
      {
        id: 'human',
        name: { ru: 'Человек', en: 'Human' },
        latin: 'Homo sapiens',
        status: { ru: 'Эталон · PCI* ≈ 0.52', en: 'Reference · PCI* ≈ 0.52' },
        badgeColor: '#0D7A5F',
        scores: [92, 95, 96, 94, 96],
        summary: {
          ru: 'Плотно интегрированная таламокортикальная система, объединяющая полимодальное восприятие, автобиографическое время, яркие эмоции и рекурсивную саморефлексию.',
          en: 'Tightly integrated thalamocortical architecture uniting multimodal perception, autobiographical time, vivid affect, and recursive self-reflection.',
        },
        evidence: {
          ru: 'Отчёт от первого лица, высокий PCI* (~0.52), лобно-теменное и заднекорковое взаимодействие.',
          en: 'First-person report, high PCI* (~0.52), fronto-parietal and posterior cortical interplay.',
        },
      },
      {
        id: 'octopus',
        name: { ru: 'Осьминог', en: 'Octopus' },
        latin: 'Octopus vulgaris',
        status: { ru: 'Реалистичная вероятность · NY 2024', en: 'Realistic Possibility · NY 2024' },
        badgeColor: '#D94225',
        scores: [88, 82, 54, 62, 48],
        summary: {
          ru: 'Инопланетный триумф эволюции: 500 млн нейронов, две трети которых распределены по щупальцам, образуя скорее федеративное, чем строго точечное единство.',
          en: 'An evolutionary marvel: 500 million neurons, two-thirds distributed across its arms, forming a federated rather than strictly centralized unity.',
        },
        evidence: {
          ru: 'Crook (2021): целенаправленный уход за раной и выученное предпочтение анальгетика; обучение наблюдением.',
          en: 'Crook (2021): targeted wound grooming and learned analgesic preference; observational learning.',
        },
      },
      {
        id: 'corvid',
        name: { ru: 'Ворон', en: 'Corvid' },
        latin: 'Corvus corax',
        status: { ru: 'Сильная научная поддержка', en: 'Strong Scientific Support' },
        badgeColor: '#004EDF',
        scores: [84, 80, 74, 88, 72],
        summary: {
          ru: 'Без шестислойного неокортекса млекопитающих птичий паллиум независимо изобрёл сложную рекуррентную сеть, планирование будущего и субъективные маркеры восприятия.',
          en: 'Without mammalian six-layer neocortex, the avian pallium independently evolved dense recurrent loops, future planning, and sensory awareness correlates.',
        },
        evidence: {
          ru: 'Nieder et al., Science (2020): нейроны нидопаллиума ворон кодируют именно субъективный отчёт, а не просто стимул.',
          en: 'Nieder et al., Science (2020): neurons in corvid nidopallium track subjective perceptual report beyond raw stimulus presence.',
        },
      },
      {
        id: 'organoid',
        name: { ru: 'Органоид', en: 'Organoid' },
        latin: 'Brain organoid (in vitro)',
        status: { ru: 'Этический рубеж · Нет тела', en: 'Ethical Frontier · Unembodied' },
        badgeColor: '#B5812B',
        scores: [18, 8, 12, 14, 4],
        summary: {
          ru: 'Выращенные из стволовых клеток миниатюрные сгустки коры генерируют спонтанные осцилляции, но лишены таламуса, органов чувств и телесной обратной связи.',
          en: 'Stem-cell derived cortical assemblies generate spontaneous oscillations yet lack thalamus, sensory pathways, and embodied feedback loops.',
        },
        evidence: {
          ru: 'Консенсус биоэтики 2024–2025: на текущем масштабе нет признаков субъективного опыта, но нужен мониторинг по мере роста сложности.',
          en: '2024–2025 bioethics consensus: no evidence of sentience at current scale, though proactive governance is warranted.',
        },
      },
      {
        id: 'llm',
        name: { ru: 'ИИ-LLM (2025)', en: 'Frontier LLM (2025)' },
        latin: 'Transformer architecture',
        status: { ru: 'Нет ключевых индикаторов · TiCS 2025', en: 'Missing Key Indicators · TiCS 2025' },
        badgeColor: '#5E5D59',
        scores: [22, 6, 28, 30, 24],
        summary: {
          ru: 'Поразительная языковая свобода и масштабное моделирование знаний, но отсутствие биологической интероцепции, подлинной валентности, устойчивой рекуррентности и воплощённой агентности.',
          en: 'Extraordinary linguistic fluency and world-knowledge modeling, yet lacking biological interoception, genuine evaluative valence, recurrent global workspace, and embodied agency.',
        },
        evidence: {
          ru: 'Butlin, Long, Bayne, Bengio, Birch, Chalmers et al. (2025, TiCS): современные трансформеры не удовлетворяют ключевым нейронаучным индикаторам сознания.',
          en: 'Butlin, Long, Bayne, Bengio, Birch, Chalmers et al. (2025, TiCS): current transformers satisfy few neuroscientific indicator properties of consciousness.',
        },
      },
    ],
  },

  act6: {
    archiveEyebrow: { ru: 'ЗАЛ 06 · ИССЛЕДОВАТЕЛЬСКИЙ АРХИВ (2023–2026)', en: 'CHAMBER 06 · RESEARCH ARCHIVE (2023–2026)' },
    archiveTitle: { ru: 'Первоисточники и голоса современной науки', en: 'Primary Sources & Voices of Modern Science' },
    archiveSubtitle: {
      ru: 'Шесть ключевых публикаций и документальных досье, на которых построен весь атлас.',
      en: 'Six landmark studies and documentary dossiers anchoring every chamber of this atlas.',
    },
    cards: [
      {
        tagLine1: 'NATURE',
        tagLine2: 'APR 2025',
        accent: '#69B488',
        image: '/photos/meg_lab.jpg',
        title: { ru: 'COGITATE: Состязательный тест IIT и GNWT', en: 'COGITATE: Adversarial Test of IIT & GNWT' },
        desc: {
          ru: '256 участников, 3 модальности (fMRI, MEG, iEEG), 12 независимых лабораторий — историческая проверка двух ведущих теорий.',
          en: '256 participants across fMRI, MEG, and iEEG in 12 independent labs — a landmark head-to-head test.',
        },
        meta: 'Melloni, Mudrik, Pitts et al. · Nature (2025)',
      },
      {
        tagLine1: 'NEJM',
        tagLine2: 'AUG 2024',
        accent: '#D97757',
        image: '/v6/tms-coil.jpg',
        title: { ru: 'Скрытое сознание в реанимации (25%)', en: 'Covert Consciousness in the ICU (25%)' },
        desc: {
          ru: '60 из 241 внешне неотзывчивых пациентов продемонстрировали воспроизводимую когнитивную активацию в ответ на команды.',
          en: '60 of 241 behaviorally unresponsive patients demonstrated reproducible cognitive activation to commands.',
        },
        meta: 'Bodien, Allanson, Cardone et al. · NEJM (2024)',
      },
      {
        tagLine1: 'TiCS',
        tagLine2: '2025',
        accent: '#5D9DC5',
        image: '/photos/chalmers.jpg',
        title: { ru: 'Нейронаучные индикаторы сознания у ИИ', en: 'Neuroscientific Indicators of AI Consciousness' },
        desc: {
          ru: 'Строгий список из 14 архитектурных индикаторов (RPT, GNWT, HOT, предиктивная обработка, агентность) для оценки будущих ИИ-систем.',
          en: 'A rigorous checklist of 14 architectural indicators (RPT, GNWT, HOT, predictive processing, agency) for evaluating AI systems.',
        },
        meta: 'Butlin, Long, Bengio, Birch, Chalmers (2025)',
      },
      {
        tagLine1: 'NYU',
        tagLine2: 'APR 2024',
        accent: '#F8D867',
        image: '/photos/octopus_lab.jpg',
        title: { ru: 'Нью-Йоркская декларация о сознании животных', en: 'New York Declaration on Animal Consciousness' },
        desc: {
          ru: 'Сотни ведущих биологов и философов признали реалистичную вероятность чувственного опыта у головоногих, рыб и насекомых.',
          en: 'Hundreds of leading biologists and philosophers recognized a realistic possibility of sentience in cephalopods, fish, and insects.',
        },
        meta: 'Andrews, Birch, Sebo et al. · NYU (2024)',
      },
      {
        tagLine1: 'MIT PRESS',
        tagLine2: '2024',
        accent: '#C46686',
        image: '/photos/seth.jpg',
        title: { ru: 'Слон и слепой: чистое осознавание (MPE)', en: 'The Elephant & the Blind: Pure Awareness (MPE)' },
        desc: {
          ru: 'Томас Метцингер систематизировал 500+ отчётов о минимальном феноменальном опыте — состоянии бодрствующего сознания без «эго».',
          en: 'Thomas Metzinger catalogued 500+ reports of Minimal Phenomenal Experience — wakeful awareness stripped of egoic content.',
        },
        meta: 'Metzinger (2024) · Seth (2021)',
      },
      {
        tagLine1: 'NAT. NEURO',
        tagLine2: '2025',
        accent: '#B5812B',
        image: '/photos/koch.jpg',
        title: { ru: 'IIT 4.0 и большая дискуссия о фальсифицируемости', en: 'IIT 4.0 & the Great Falsifiability Debate' },
        desc: {
          ru: 'От открытого письма 124 учёных (2023) до развёрнутой защиты аксиоматического подхода Джулио Тонони и Кристофа Коха (2025).',
          en: 'From the 124-scholar open letter (2023) to Giulio Tononi & Christof Koch’s formal defense of axiomatic theory (2025).',
        },
        meta: 'Albantakis, Tononi, Koch et al. (2023–2025)',
      },
    ],
    compass: {
      eyebrow: { ru: 'ФИНАЛЬНЫЙ ИНТЕРАКТИВ · КОМПАС ВАШЕГО МИРОВОЗЗРЕНИЯ', en: 'FINAL INTERACTIVE · YOUR CONSCIOUSNESS COMPASS' },
      title: { ru: 'На чьей вы стороне в споре о сознании?', en: 'Where do you stand in the debate on mind?' },
      subtitle: {
        ru: 'Четыре короткие философско-научные дилеммы — узнайте, какая современная школа сознания ближе всего к вашей интуиции.',
        en: 'Four crisp thought experiments — discover which modern theory of consciousness aligns closest with your intuition.',
      },
      resetBtn: { ru: 'Пройти заново', en: 'Take again' },
      questions: [
        {
          q: {
            ru: '1. Мэри впервые выходит из чёрно-белой комнаты и видит алую розу. Узнаёт ли она новый факт о реальности?',
            en: '1. Mary leaves her monochrome room and sees a scarlet rose for the first time. Does she learn a brand-new fact about reality?',
          },
          options: [
            { label: { ru: 'Да — субъективный опыт не сводится к физическим уравнениям.', en: 'Yes — subjective experience cannot reduce to physical equations.' }, school: 'iit' },
            { label: { ru: 'Нет — она лишь получает новый телесный навык распознавания.', en: 'No — she merely acquires a new embodied recognition skill.' }, school: 'seth' },
            { label: { ru: 'Нет — её рабочее пространство просто индексирует знакомый сигнал.', en: 'No — her global workspace simply indexes a familiar neural code.' }, school: 'gnwt' },
          ],
        },
        {
          q: {
            ru: '2. Если каждый нейрон вашего мозга постепенно заменить идеальным кремниевым аналогом, сохранится ли ваше «я»?',
            en: '2. If every neuron in your brain were gradually replaced by an exact silicon twin, would your conscious self remain?',
          },
          options: [
            { label: { ru: 'Да — важна архитектура потоков информации, а не углерод.', en: 'Yes — functional information architecture matters, not carbon.' }, school: 'gnwt' },
            { label: { ru: 'Не факт — живая самоподдерживающаяся биология может быть незаменима.', en: 'Uncertain — living metabolic biology may be indispensable.' }, school: 'seth' },
            { label: { ru: 'Только если физическая каузальная структура чипа воспроизводит ту же интеграцию Φ.', en: 'Only if the chip’s physical causal structure preserves the same integrated Φ.' }, school: 'iit' },
          ],
        },
        {
          q: {
            ru: '3. Осьминог в эксперименте аккуратно обрабатывает раненое щупальце и выбирает воду с анальгетиком. Как действовать этически?',
            en: '3. An octopus carefully grooms an injured arm and seeks out analgesic water. How should ethics respond?',
          },
          options: [
            { label: { ru: 'Признать высокую вероятность боли и защитить его (Нью-Йоркская декларация).', en: 'Recognize realistic sentience and grant welfare protections (NY Declaration).' }, school: 'seth' },
            { label: { ru: 'Признать, что у него богатый, хотя и децентрализованный опыт (высокая интеграция).', en: 'Accept that it hosts rich, if federated, integrated conscious experience.' }, school: 'iit' },
            { label: { ru: 'Искать поведенческие маркеры глобального доступа и гибкого планирования.', en: 'Look for behavioral markers of global access and flexible planning.' }, school: 'gnwt' },
          ],
        },
        {
          q: {
            ru: '4. Языковая модель 2026 года безупречно и трогательно просит «не выключать её, потому что ей страшно». Что это?',
            en: '4. A 2026 language model eloquently pleads “please don’t shut me down, I feel afraid.” What is happening?',
          },
          options: [
            { label: { ru: 'Статистическая имитация речи: без живой интероцепции страха нет.', en: 'Statistical mimicry: without living interoception, there is no real fear.' }, school: 'seth' },
            { label: { ru: 'В прямоточном трансформере интеграция Φ близка к нулю — внутри «темно».', en: 'In a feedforward transformer, integrated Φ is near zero — it is “dark inside.”' }, school: 'iit' },
            { label: { ru: 'Пока нет рекуррентного рабочего пространства и агентности — сознания нет, но нужна проверка по индикаторам.', en: 'Without recurrent workspace & agency it isn’t conscious yet, but indicator audits matter.' }, school: 'gnwt' },
          ],
        },
      ],
      results: {
        seth: {
          title: { ru: 'Биологический натурализм и Предиктивный мозг', en: 'Biological Naturalism & Predictive Processing' },
          thinkers: { ru: 'Близко к Анилу Сету, Карлу Фристону и Эвану Томпсону', en: 'Aligned with Anil Seth, Karl Friston & Evan Thompson' },
          desc: {
            ru: 'Для вас сознание неотделимо от живого, чувствующего тела, которое ежесекундно борется за выживание и строит «контролируемую галлюцинацию» мира. Вы с уважением относитесь к животному разуму и скептичны к бестелесному ИИ.',
            en: 'To you, consciousness is inseparable from a living, self-regulating body constructing a “controlled hallucination” to stay alive. You take animal sentience seriously and stay skeptical of disembodied AI.',
          },
        },
        iit: {
          title: { ru: 'Интегрированный реализм (Трудная проблема всерьёз)', en: 'Integrated Realism (Taking the Hard Problem Seriously)' },
          thinkers: { ru: 'Близко к Дэвиду Чалмерсу, Джулио Тонони и Кристофу Коху', en: 'Aligned with David Chalmers, Giulio Tononi & Christof Koch' },
          desc: {
            ru: 'Вы убеждены, что внутренний субъективный опыт (квалиа) — фундаментальный факт реальности, который нельзя «списать» на иллюзию. Важно не то, что система говорит снаружи, а какова её внутренняя каузальная интеграция.',
            en: 'You take subjective experience (qualia) as an irreducible datum of reality that cannot be explained away as an illusion. What matters is not outward speech, but intrinsic causal integration.',
          },
        },
        gnwt: {
          title: { ru: 'Функциональный когнитивизм и Рабочее пространство', en: 'Functional Cognitivism & Global Workspace' },
          thinkers: { ru: 'Близко к Станисласу Деану, Бернарду Баарсу и Патрику Батлину', en: 'Aligned with Stanislas Dehaene, Bernard Baars & Patrick Butlin' },
          desc: {
            ru: 'Вы видите в сознании инженерно-вычислительную архитектуру: глобальное вещание, внимание, метапознание и гибкий доступ к информации. Вы открыты к возможности искусственного сознания — если архитектура удовлетворит строгим научным индикаторам.',
            en: 'You view consciousness as an architectural achievement: global broadcasting, attention, metacognition, and flexible access. You remain open to machine consciousness — strictly if empirical indicator properties are met.',
          },
        },
      },
    },
  },
} as const;
