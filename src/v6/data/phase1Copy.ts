export type Lang = 'ru' | 'en';

export interface ChamberMeta {
  id: string;
  num: string;
  breadcrumb: Record<Lang, string>;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  status: 'live' | 'next';
  phaseLabel: Record<Lang, string>;
}

export const CHAMBERS: ChamberMeta[] = [
  {
    id: 'act-0',
    num: '00',
    breadcrumb: { ru: '## 00 · порог сознания', en: '## 00 · threshold of mind' },
    title: { ru: 'Порог: опыт от первого лица', en: 'Threshold: First-Person Experience' },
    subtitle: {
      ru: 'Тёплая тишина, 4-секундный тест на собственном зрении и главный вопрос',
      en: 'Quiet ivory opening, a 4-second test on your own vision, and the central mystery',
    },
    status: 'live',
    phaseLabel: { ru: 'Фаза 1 · Доступно', en: 'Phase 1 · Live' },
  },
  {
    id: 'act-1',
    num: '01',
    breadcrumb: { ru: '## 01 · комната мэри', en: '## 01 · mary’s room' },
    title: { ru: 'Комната Мэри и вспышка квалиа', en: 'Mary’s Room & the Flash of Qualia' },
    subtitle: {
      ru: 'Скролл-метаморфоза: от чёрно-белой физики 650 нм к рождению живого цвета',
      en: 'Scroll metamorphosis: from monochrome 650 nm physics to the birth of living color',
    },
    status: 'live',
    phaseLabel: { ru: 'Фаза 1 · Доступно', en: 'Phase 1 · Live' },
  },
  {
    id: 'act-2',
    num: '02',
    breadcrumb: { ru: '## 02 · cogitate 2025 · 3d', en: '## 02 · cogitate 2025 · 3d' },
    title: { ru: 'Анатомический пьедестал: IIT vs GNWT', en: 'Anatomical Pedestal: IIT vs GNWT' },
    subtitle: {
      ru: 'Студийный реалистичный 3D-мозг на светлом фоне и вердикт Nature (256 испытуемых)',
      en: 'Studio-lit realistic 3D brain on warm travertine & the Nature 2025 verdict (256 subjects)',
    },
    status: 'live',
    phaseLabel: { ru: '3D-сцена · 60 FPS', en: '3D Stage · 60 FPS' },
  },
  {
    id: 'act-3',
    num: '03',
    breadcrumb: { ru: '## 03 · двигатель под столом', en: '## 03 · engine underneath' },
    title: { ru: 'Предиктивный мозг: механизм под поверхностью', en: 'Predictive Brain: The Engine Underneath' },
    subtitle: {
      ru: 'Разрез столешницы с живым механизмом приоров и ошибок предсказания (Сет и Фристон)',
      en: 'Tabletop cutaway with a scroll-driven mechanism of priors & prediction errors (Seth & Friston)',
    },
    status: 'live',
    phaseLabel: { ru: '2.5D · Скролл', en: '2.5D · Scroll' },
  },
  {
    id: 'act-4',
    num: '04',
    breadcrumb: { ru: '## 04 · стол науки и кома', en: '## 04 · science banquet & coma' },
    title: { ru: 'Длинный стол науки и порог PCI* = 0.31', en: 'The Long Table of Science & PCI* = 0.31' },
    subtitle: {
      ru: 'Пари Чалмерса и Коха (1998–2023), скрытое сознание в коме (NEJM 2024) и ТМС-удар',
      en: 'The Chalmers–Koch wine wager (1998–2023), covert coma awareness (NEJM 2024) & TMS pulse',
    },
    status: 'live',
    phaseLabel: { ru: 'Хроника + ТМС', en: 'Chronicle + TMS' },
  },
  {
    id: 'act-5',
    num: '05',
    breadcrumb: { ru: '## 05 · иные разумы', en: '## 05 · other minds' },
    title: { ru: 'Линейка иных разумов', en: 'Lineup of Other Minds' },
    subtitle: {
      ru: 'Человек · Осьминог · Ворон · Органоид · ИИ 2025 + 5-осевой радар чувственности',
      en: 'Human · Octopus · Corvid · Organoid · AI 2025 + 5-axis sentience radar',
    },
    status: 'live',
    phaseLabel: { ru: 'Зал 05 · Радар', en: 'Chamber 05 · Radar' },
  },
  {
    id: 'act-6',
    num: '06',
    breadcrumb: { ru: '## 06 · архив и компас', en: '## 06 · archive & compass' },
    title: { ru: 'Исследовательский архив и Компас сознания', en: 'Research Archive & Consciousness Compass' },
    subtitle: {
      ru: 'Первоисточники 2023–2026 (Nature, NEJM, TiCS, NYU) и 4 философские дилеммы',
      en: 'Primary sources 2023–2026 (Nature, NEJM, TiCS, NYU) & 4 philosophical dilemmas',
    },
    status: 'live',
    phaseLabel: { ru: 'Архив + Тест', en: 'Archive + Quiz' },
  },
];

export const PHASE1_COPY = {
  hud: {
    indexBtn: { ru: 'Индекс', en: 'Index' },
    closeBtn: { ru: 'Закрыть', en: 'Close' },
    dossierPill: { ru: 'Досье', en: 'Dossier' },
  },
  act0: {
    eyebrow: {
      ru: 'ИНТЕРАКТИВНОЕ ВИЗУАЛЬНОЕ ЭССЕ · РЕДАКЦИЯ 2025–2026',
      en: 'INTERACTIVE VISUAL ESSAY · 2025–2026 EDITION',
    },
    leadBold: {
      ru: 'Сознание — единственное явление во Вселенной, которое мы знаем изнутри.',
      en: 'Consciousness is the only phenomenon in the universe we know from the inside.',
    },
    leadSerif: {
      ru: ' Как полтора килограмма тёмной нервной ткани порождают алый цвет, остроту тоски и тихий факт присутствия «я»?',
      en: ' How do three pounds of dark neural tissue give rise to the vividness of scarlet, the ache of nostalgia, and the quiet fact of being someone?',
    },
    skyCaptionLeft: {
      ru: 'Посмотрите на небо — а затем убедитесь, как ваш мозг редактирует реальность',
      en: 'Look at the sky — then witness your brain editing reality in real time',
    },
    skyPlayCta: {
      ru: 'Испытать на своём зрении · 4 сек',
      en: 'Test on your own vision · 4 sec',
    },
    mibClose: {
      ru: 'Вернуться к небу',
      en: 'Return to sky',
    },
    mibInstruction: {
      ru: 'Неотрывно смотрите в мигающую точку #FC4109 в центре. Через 3–4 секунды неподвижные жёлтые маркеры начнут исчезать прямо на ваших глазах — сетчатка их фиксирует, но сознание стирает.',
      en: 'Stare steadily at the blinking #FC4109 center dot. Within 3–4 seconds the stationary yellow markers will vanish right before your eyes — your retina still sees them, yet consciousness erases them.',
    },
    mibBadge: {
      ru: 'СЛЕПОТА К ДВИЖЕНИЮ (BONNEH ET AL., NATURE 2001)',
      en: 'MOTION-INDUCED BLINDNESS (BONNEH ET AL., NATURE 2001)',
    },
    mibReset: {
      ru: 'Моргнуть и сбросить',
      en: 'Blink & reset',
    },
    scrollPrompt: {
      ru: 'Прокрутите вниз — шагните в монохромную комнату Мэри',
      en: 'Scroll down — step inside Mary’s monochrome room',
    },
    highlights: [
      {
        tag: { ru: 'NATURE · АПРЕЛЬ 2025', en: 'NATURE · APRIL 2025' },
        stat: '256',
        title: { ru: 'Состязательный эксперимент COGITATE', en: 'COGITATE Adversarial Collaboration' },
        desc: {
          ru: 'Крупнейшая в истории очная проверка теорий IIT и GNWT на fMRI, MEG и внутричерепной ЭЭГ.',
          en: 'The largest head-to-head test of IIT vs GNWT across fMRI, MEG, and intracranial EEG.',
        },
      },
      {
        tag: { ru: 'NEJM · АВГУСТ 2024', en: 'NEJM · AUGUST 2024' },
        stat: '25%',
        title: { ru: 'Скрытое сознание в реанимации', en: 'Covert Consciousness in the ICU' },
        desc: {
          ru: 'У 60 из 241 внешне неотзывчивого пациента обнаружено ясное внутреннее осознание команд.',
          en: '60 of 241 behaviorally unresponsive patients showed clear covert cognitive awareness.',
        },
      },
      {
        tag: { ru: 'МАССИМИНИ · ТМС-ЭЭГ', en: 'MASSIMINI · TMS-EEG' },
        stat: '0.31',
        title: { ru: 'Эмпирический порог сложности PCI*', en: 'Empirical Complexity Threshold PCI*' },
        desc: {
          ru: 'Надёжная граница, отделяющая внутренний опыт (включая сны и кетамин) от глубокой комы.',
          en: 'A reliable marker separating inner experience (including dreams & ketamine) from deep coma.',
        },
      },
    ],
  },
  act1: {
    beats: [
      {
        kicker: { ru: '> 01 / 04 · МОНОХРОМНАЯ ЛАБОРАТОРИЯ', en: '> 01 / 04 · MONOCHROME LABORATORY' },
        headlineMain: { ru: 'Мэри знает всю физику красного.', en: 'Mary knows all the physics of red.' },
        headlineAccent: { ru: 'Но никогда его не видела.', en: 'Yet she has never seen it.' },
        note: {
          ru: 'Мысленный эксперимент Фрэнка Джексона (1982): в чёрно-белой комнате доступны все уравнения мира, но нет ни одного цвета.',
          en: 'Frank Jackson’s Knowledge Argument (1982): inside a black-and-white room every physical equation is known, yet not a single hue exists.',
        },
      },
      {
        kicker: { ru: '> 02 / 04 · ОПТИЧЕСКИЙ КАСКАД', en: '> 02 / 04 · OPTICAL CASCADE' },
        headlineMain: { ru: 'Волна 650 нм. Колбочки L: 100%.', en: '650 nm wave. L-cones: 100%.' },
        headlineAccent: { ru: 'Спайки в зрительной коре V4.', en: 'Spikes firing in cortex V4.' },
        note: {
          ru: 'Прокрутка ведёт фотон сквозь хрустальную призму. С точки зрения третьих лиц цепь причинности полностью замкнута.',
          en: 'Your scroll guides a photon through the crystal prism. From a third-person view, the causal chain is completely closed.',
        },
      },
      {
        kicker: { ru: '> 03 / 04 · РАЗРЫВ В ОБЪЯСНЕНИИ', en: '> 03 / 04 · THE EXPLANATORY GAP' },
        headlineMain: { ru: 'Но среди уравнений нет', en: 'Yet nowhere in the equations is' },
        headlineAccent: { ru: 'самой красноты.', en: 'the redness itself.' },
        note: {
          ru: 'Дэвид Чалмерс (1995) назвал это Трудной проблемой сознания: почему обработка информации не протекает «в темноте»?',
          en: 'David Chalmers (1995) named this the Hard Problem of Consciousness: why doesn’t all this information processing happen “in the dark”?',
        },
      },
      {
        kicker: { ru: '> 04 / 04 · ВЫХОД ИЗ КОМНАТЫ (КВАЛИА)', en: '> 04 / 04 · STEPPING OUTSIDE (QUALIA)' },
        headlineMain: { ru: 'Вспышка квалиа —', en: 'The flash of qualia —' },
        headlineAccent: { ru: 'то, что формула не способна пережить.', en: 'the part an equation cannot feel.' },
        note: {
          ru: 'Когда Мэри впервые видит алую розу, она узнаёт нечто подлинно новое — или просто обретает новый способ доступа к старому факту?',
          en: 'When Mary sees a crimson rose for the first time, does she discover a new non-physical fact — or merely gain a new mode of access?',
        },
      },
    ],
    dossierBtn: {
      ru: 'Открыть научное досье и спектр',
      en: 'Open research dossier & spectrum',
    },
    telemetry: {
      wavelength: { ru: 'ДЛИНА ВОЛНЫ', en: 'WAVELENGTH' },
      cones: { ru: 'ОТКЛИК L-КОЛБОЧЕК', en: 'L-CONE RESPONSE' },
      qualia: { ru: 'СУБЪЕКТИВНЫЙ ЦВЕТ', en: 'SUBJECTIVE HUE' },
      monochromeLabel: { ru: 'Монохром', en: 'Monochrome' },
      crimsonLabel: { ru: 'Живой алый', en: 'Living crimson' },
    },
    dossier: {
      eyebrow: { ru: 'ДОСЬЕ ЗАЛА 01 · ФИЛОСОФИЯ СОЗНАНИЯ', en: 'CHAMBER 01 DOSSIER · PHILOSOPHY OF MIND' },
      title: { ru: 'Аргумент знания и пять ответов на Трудную проблему', en: 'The Knowledge Argument & Five Responses' },
      intro: {
        ru: 'Покрутите длину волны ниже: физические параметры меняются непрерывно, но субъективное переживание (квалиа) каждый раз рождает непереводимое качество.',
        en: 'Scrub the wavelength below: physical numbers vary smoothly, yet subjective experience (qualia) presents an irreducible felt quality.',
      },
      wavelengthLabel: { ru: 'Доминирующая длина волны', en: 'Dominant wavelength' },
      schools: [
        {
          name: { ru: 'Физикализм (Апостериорный)', en: 'A Posteriori Physicalism' },
          author: 'Loar (1990), Papineau (2002)',
          stance: {
            ru: 'Мэри не открывает новой сущности — она лишь формирует новое «феноменальное понятие» для уже известного состояния мозга.',
            en: 'Mary discovers no new entity — she simply forms a new “phenomenal concept” referring to an already-known brain state.',
          },
        },
        {
          name: { ru: 'Гипотеза способностей', en: 'The Ability Hypothesis' },
          author: 'Lewis (1988), Nemirow (1990)',
          stance: {
            ru: 'Увидев розу, Мэри получает не новое знание-факт, а практический навык: воображать, узнавать и вспоминать красный цвет.',
            en: 'Seeing the rose grants Mary no new propositional fact, only practical know-how: to imagine, recognize, and remember red.',
          },
        },
        {
          name: { ru: 'Дуализм свойств / Панпсихизм', en: 'Property Dualism / Panpsychism' },
          author: 'Chalmers (1995), Goff (2019)',
          stance: {
            ru: 'Физика описывает лишь внешние отношения материи; квалиа раскрывают её внутреннюю, фундаментальную природу.',
            en: 'Physics describes only extrinsic mathematical relations; qualia reveal the intrinsic, fundamental nature of matter.',
          },
        },
        {
          name: { ru: 'Иллюзионизм', en: 'Illusionism' },
          author: 'Dennett (1991), Frankish (2016)',
          stance: {
            ru: '«Невыразимые квалиа» — удобная интроспективная карикатура, которую мозг строит для быстрого отчёта о собственных состояниях.',
            en: '“Ineffable qualia” are a simplified introspective user-illusion the brain builds to track its own sensory reactions.',
          },
        },
        {
          name: { ru: 'Энактивизм (Воплощённый разум)', en: 'Enactivism (Embodied Mind)' },
          author: 'Varela, Thompson & Rosch (1991), Noë (2004)',
          stance: {
            ru: 'Цвет не «сидит» внутри нейронов и не выводится из таблиц — переживание рождается в живом действии организма со средой.',
            en: 'Color neither sits inside neurons nor reduces to equations — experience is enacted through an organism’s sensorimotor coupling with the world.',
          },
        },
      ],
    },
  },
  outro: {
    eyebrow: { ru: 'ПРОДОЛЖЕНИЕ ПУТЕШЕСТВИЯ · ФАЗЫ 3–5', en: 'CONTINUING THE JOURNEY · PHASES 3–5' },
    title: {
      ru: 'Фазы 1 и 2 уже живут в движении.',
      en: 'Phases 1 and 2 are live in motion.',
    },
    subtitle: {
      ru: 'Комната Мэри (ч/б → цвет), латунный двигатель предсказаний под столешницей, горизонтальный стол науки (1998–2025) и клинический ТМС-импульс (PCI* = 0.31) уже работают на едином тикере. Далее подключаем 3D-мозг в светлой студии и финал.',
      en: 'Mary’s Room (monochrome → color), the brass predictive engine underneath, the horizontal table of science (1998–2025), and the clinical TMS pulse (PCI* = 0.31) are live on one master clock. Next come the studio-lit 3D brain and finale.',
    },
    footerTagline: {
      ru: 'NOESIS · Атлас Сознания — визуальное научное эссе о философии и нейронауке (2025–2026).',
      en: 'NOESIS · Atlas of Consciousness — an interactive visual essay on philosophy & neuroscience (2025–2026).',
    },
    footerNote: {
      ru: 'Собрано на едином тикере Lenis + GSAP · D3-кривые ЭЭГ · 0 неонового Bloom.',
      en: 'Powered by a unified Lenis + GSAP master clock · D3 EEG curves · Zero heavy Bloom.',
    },
  },
} as const;
