import type { Lang } from './phase1Copy';

export const PHASE2_COPY = {
  act3: {
    glyphs: {
      ru: ['О', 'Б', 'Р', 'А', 'З'],
      en: ['W', 'O', 'R', 'L', 'D'],
    },
    beats: [
      {
        kicker: { ru: '> 01 / 04 · ЗАПЕРТ В ТЕМНОТЕ', en: '> 01 / 04 · LOCKED IN DARKNESS' },
        headlineMain: { ru: 'Мозг заперт в безмолвном черепе.', en: 'The brain is locked in a dark skull.' },
        headlineAccent: { ru: 'Он никогда не касается мира напрямую.', en: 'It never touches reality directly.' },
        note: {
          ru: 'Всё, что доходит внутрь, — лишь поток безликих электрических разрядов. Из них мозг обязан ежесекундно угадывать, что происходит снаружи.',
          en: 'All that arrives inside is a stream of ambiguous electrical pulses. From them, the brain must continuously infer what exists outside.',
        },
      },
      {
        kicker: { ru: '> 02 / 04 · ДВИГАТЕЛЬ ПОД ПОВЕРХНОСТЬЮ', en: '> 02 / 04 · THE ENGINE UNDERNEATH' },
        headlineMain: { ru: 'Сверху вниз летят прогнозы.', en: 'Predictions stream top-down.' },
        headlineAccent: { ru: 'Снизу вверх — лишь ошибки.', en: 'Only errors climb back up.' },
        note: {
          ru: 'Прокрутка вращает скрытый механизм под столешницей: высшие слои коры выдвигают гипотезу (приор), а сенсорный поток поправляет её.',
          en: 'Your scroll turns the hidden engine beneath the tabletop: higher cortical layers project guesses (priors), while sensory signals correct them.',
        },
      },
      {
        kicker: { ru: '> 03 / 04 · ВЗВЕШИВАНИЕ ТОЧНОСТИ', en: '> 03 / 04 · PRECISION WEIGHTING' },
        headlineMain: { ru: 'Нормальное восприятие —', en: 'Normal perception is a' },
        headlineAccent: { ru: 'контролируемая галлюцинация.', en: 'controlled hallucination.' },
        note: {
          ru: 'Анил Сет (2021) и Карл Фристон: то, что мы видим, — это наилучшая догадка мозга, удерживаемая на коротком поводке сенсорной обратной связи.',
          en: 'Anil Seth (2021) & Karl Friston: what we experience is the brain’s best-guess model, reined in moment by moment by sensory reality.',
        },
      },
      {
        kicker: { ru: '> 04 / 04 · БАЛАНС РЕАЛЬНОСТИ', en: '> 04 / 04 · BALANCING REALITY' },
        headlineMain: { ru: 'Перевес приоров рождает мираж.', en: 'Excess priors breed mirage.' },
        headlineAccent: { ru: 'Их распад — сырой хаос.', en: 'Their collapse leaves raw chaos.' },
        note: {
          ru: 'Попробуйте сместить точность приоров вручную внизу — или откройте досье принципа свободной энергии.',
          en: 'Adjust prior precision manually below — or open the Free Energy Principle research dossier.',
        },
      },
    ],
    labels: {
      aboveSurface: { ru: 'ПОВЕРХНОСТЬ · ПЕРЕЖИВАЕМЫЙ ОПЫТ', en: 'SURFACE · CONSCIOUS EXPERIENCE' },
      underSurface: { ru: 'ПОД ПОВЕРХНОСТЬЮ · МЕХАНИЗМ ПРИОРОВ И ОШИБОК (КРУТИТСЯ ОТ СКРОЛЛА)', en: 'UNDERNEATH · PRIORS & PREDICTION-ERROR ENGINE (DRIVEN BY SCROLL)' },
      priorWeight: { ru: 'ВЕС ПРИОРОВ', en: 'PRIOR PRECISION' },
      errorSignal: { ru: 'ОШИБКА ПРОГНОЗА', en: 'PREDICTION ERROR' },
      stateNoise: { ru: 'Сенсорный хаос', en: 'Raw sensory chaos' },
      stateBalanced: { ru: 'Контролируемая галлюцинация', en: 'Controlled hallucination' },
      stateMirage: { ru: 'Диктат ожиданий (Мираж)', en: 'Unchecked prior (Mirage)' },
      manualOverride: { ru: 'Ручной баланс:', en: 'Manual dial:' },
      autoSync: { ru: 'От скролла', en: 'Scroll sync' },
      dossierBtn: { ru: 'Досье: Фристон и Сет', en: 'Dossier: Friston & Seth' },
    },
    dossier: {
      eyebrow: { ru: 'ДОСЬЕ ЗАЛА 03 · ПРЕДИКТИВНАЯ ОБРАБОТКА', en: 'CHAMBER 03 DOSSIER · PREDICTIVE PROCESSING' },
      title: { ru: 'Принцип свободной энергии и «машина вывода»', en: 'The Free Energy Principle & the Inference Engine' },
      intro: {
        ru: 'Мозг не фотографирует мир пассивно — он непрерывно минимизирует расхождение между внутренними генеративными моделями и входящими сигналами тела и органов чувств.',
        en: 'The brain does not passively photograph reality — it continuously minimizes the discrepancy between internal generative models and incoming sensory and bodily signals.',
      },
      points: [
        {
          title: { ru: 'Нисходящие приоры (Top-Down Priors)', en: 'Top-Down Priors' },
          ref: 'Friston (2010), Clark (2013)',
          text: {
            ru: 'Пирамидальные нейроны глубоких слоёв коры отправляют вниз прогнозы о том, какой сигнал должен прийти через долю секунды.',
            en: 'Deep-layer pyramidal neurons continuously send downward predictions forecasting the sensory signals expected moments later.',
          },
        },
        {
          title: { ru: 'Восходящие ошибки (Prediction Errors)', en: 'Bottom-Up Prediction Errors' },
          ref: 'Rao & Ballard (1999)',
          text: {
            ru: 'Наверх поднимается только то, что не совпало с прогнозом. Совпавшие ожидания гасятся — поэтому мы не чувствуем вес собственной одежды.',
            en: 'Only the unexplained mismatch climbs upward. Confirmed predictions are silenced — which is why you stop feeling clothes on your skin.',
          },
        },
        {
          title: { ru: 'Интероцепция и «зверь-машина»', en: 'Interoception & the Beast Machine' },
          ref: 'Seth (2021) · Being You',
          text: {
            ru: 'Наше базовое ощущение «я» рождается из предиктивного контроля внутренних органов — сердцебиения, дыхания и гомеостаза.',
            en: 'Our core feeling of being an embodied self arises from predictive regulation of internal bodily states — heartbeat, breath, and homeostasis.',
          },
        },
      ],
    },
  },

  act4Table: {
    eyebrow: { ru: 'ЗАЛ 04A · ДЛИННЫЙ СТОЛ НАУКИ (1998–2025)', en: 'CHAMBER 04A · THE LONG TABLE OF SCIENCE (1998–2025)' },
    titleMain: { ru: 'Сознание — это живой спор,', en: 'Consciousness is a living debate,' },
    titleAccent: { ru: 'а не законченный учебник.', en: 'not a settled textbook.' },
    scrollHint: { ru: 'Прокрутка ведёт камеру вдоль стола →', en: 'Scroll glides the camera along the table →' },
    stations: [
      {
        year: '1998 → 2023',
        tag: { ru: 'СТАНЦИЯ 01 · ПАРИ НА ЯЩИК МАДЕРЫ', en: 'STATION 01 · THE MADEIRA WINE WAGER' },
        title: { ru: '25 лет ожидания и ящик португальского вина', en: '25 Years Later, a Case of Fine Wine' },
        body: {
          ru: 'В 1998 году в баре Бремена нейробиолог Кристоф Кох поспорил с философом Дэвидом Чалмерсом, что за 25 лет наука найдёт ясный нейронный маркер сознания. В июне 2023 на сцене конференции ASSC в Нью-Йорке Кох вручил Чалмерсу ящик мадеры и признал поражение — а затем они тут же заключили новое пари до 2048 года.',
          en: 'In 1998 in a Bremen bar, neuroscientist Christof Koch bet philosopher David Chalmers a case of fine wine that science would pinpoint a clear neural signature of consciousness within 25 years. On stage at ASSC NYU in June 2023, Koch handed Chalmers a case of Madeira, conceded — and doubled down for 2048.',
        },
        image: '/v6/madeira-wager.jpg',
        portraits: [
          { src: '/photos/chalmers.jpg', name: { ru: 'Д. Чалмерс', en: 'D. Chalmers' } },
          { src: '/photos/koch.jpg', name: { ru: 'К. Кох', en: 'C. Koch' } },
        ],
        metric: { ru: '25 лет · ASSC NYU 2023', en: '25 yrs · ASSC NYU 2023' },
      },
      {
        year: 'СЕНТ 2023',
        tag: { ru: 'СТАНЦИЯ 02 · ОТКРЫТОЕ ПИСЬМО 124 УЧЁНЫХ', en: 'STATION 02 · OPEN LETTER OF 124 SCHOLARS' },
        title: { ru: 'Публичный раскол вокруг теории IIT', en: 'The Public Rift Over IIT' },
        body: {
          ru: '15 сентября 2023 года 124 исследователя подписали открытое письмо, назвав Теорию интегрированной информации (IIT) Джулио Тонони «псевдонаучной» из-за её панпсихистских выводов. В апреле 2025 года в Nature Neuroscience вышел жёсткий ответ сторонников IIT — спор стал самым острым в современной нейронауке.',
          en: 'On September 15, 2023, 124 researchers signed an open letter labeling Giulio Tononi’s Integrated Information Theory (IIT) “pseudoscience” over its panpsychist implications. In April 2025, Nature Neuroscience published a sharp rebuttal — igniting the fiercest debate in modern neuroscience.',
        },
        image: '/photos/meg_lab.jpg',
        portraits: [
          { src: '/photos/tononi.jpg', name: { ru: 'Дж. Тонони', en: 'G. Tononi' } },
          { src: '/photos/dehaene.jpg', name: { ru: 'С. Деан', en: 'S. Dehaene' } },
        ],
        metric: { ru: '124 подписи · Nature Neurosci 2025', en: '124 signers · Nature Neurosci 2025' },
      },
      {
        year: 'АПР 2025',
        tag: { ru: 'СТАНЦИЯ 03 · ВЕРДИКТ COGITATE (NATURE)', en: 'STATION 03 · COGITATE VERDICT (NATURE)' },
        title: { ru: '256 испытуемых в 12 лабораториях мира', en: '256 Participants Across 12 Global Labs' },
        body: {
          ru: 'Вместо споров в статьях авторы IIT и GNWT заранее зафиксировали проверяемые прогнозы и передали их независимым лабораториям (fMRI, MEG, iEEG). Опубликованный в Nature (апрель 2025) результат удивил обе стороны: задняя кора устойчиво кодирует опыт, но ни одна из теорий не вышла безусловным победителем.',
          en: 'Instead of trading papers, IIT and GNWT proponents preregistered conflicting predictions and handed them to independent fMRI, MEG, and iEEG labs. Published in Nature (April 2025), the verdict stunned both camps: posterior cortex robustly tracks content, yet neither theory emerged unscathed.',
        },
        image: '/artworks/v2-03-cogitate-interferometer.jpg',
        portraits: [
          { src: '/photos/seth.jpg', name: { ru: 'А. Сет', en: 'A. Seth' } },
          { src: '/photos/dennett.jpg', name: { ru: 'Д. Деннет', en: 'D. Dennett' } },
        ],
        metric: { ru: '256 участников · Nature 2025', en: '256 subjects · Nature 2025' },
      },
      {
        year: 'АВГ 2024',
        tag: { ru: 'СТАНЦИЯ 04 · ПРОРЫВ В РЕАНИМАЦИИ (NEJM)', en: 'STATION 04 · ICU BREAKTHROUGH (NEJM)' },
        title: { ru: 'Каждый четвёртый пациент в коме слышит нас', en: 'One in Four Unresponsive Patients Is Aware' },
        body: {
          ru: 'В августе 2024 года The New England Journal of Medicine опубликовал крупнейшее международное исследование (Bodien et al.): у 25% (60 из 241) внешне неподвижных пациентов с тяжёлыми травмами мозга выявлена когнитивно-моторная диссоциация — ясное скрытое сознание. Спуститесь ниже, чтобы нанести магнитный ТМС-импульс.',
          en: 'In August 2024, The New England Journal of Medicine published the largest international study (Bodien et al.): 25% (60 of 241) behaviorally unresponsive brain-injured patients exhibited cognitive-motor dissociation — clear covert consciousness. Scroll down to fire a live TMS magnetic pulse.',
        },
        image: '/v6/tms-coil.jpg',
        portraits: [
          { src: '/photos/tms_clinic.jpg', name: { ru: 'ТМС-ЭЭГ клиника', en: 'TMS-EEG Clinic' } },
        ],
        metric: { ru: '60 / 241 (25%) · NEJM 2024', en: '60 / 241 (25%) · NEJM 2024' },
      },
    ],
  },

  act4Pci: {
    eyebrow: { ru: 'ЗАЛ 04B · КЛИНИЧЕСКИЙ ПОРОГ PCI* = 0.31 (ЕДИНСТВЕННАЯ ТЁМНАЯ СЦЕНА)', en: 'CHAMBER 04B · CLINICAL THRESHOLD PCI* = 0.31 (SINGLE DARK INTERLUDE)' },
    titleMain: { ru: 'Удар по тишине:', en: 'A pulse into silence:' },
    titleAccent: { ru: 'как измерить сознание без слов.', en: 'measuring consciousness without words.' },
    subtitle: {
      ru: 'Метод «Zap-and-Zip» Марчелло Массимини: магнитная катушка ТМС наносит короткий импульс в кору, а ЭЭГ записывает сложность ответного эха. Если мозг в сознании — сигнал разбегается сложным, несжимаемым каскадом (PCI* > 0.31). В глубокой коме эхо гаснет мгновенно.',
      en: 'Marcello Massimini’s “Zap-and-Zip” technique: a TMS coil fires a brief magnetic pulse into cortex while EEG measures the algorithmic complexity of the echo. Conscious brains reverberate richly (PCI* > 0.31); deep coma dies out locally.',
    },
    zapBtn: { ru: 'Нанести ТМС-импульс (Zap)', en: 'Fire TMS Magnetic Pulse (Zap)' },
    thresholdLabel: { ru: 'Эмпирический порог сознания Massimini: PCI* = 0.31', en: 'Massimini empirical consciousness cutoff: PCI* = 0.31' },
    aboveThreshold: { ru: 'ВЫШЕ ПОРОГА · СОЗНАТЕЛЬНЫЙ ОПЫТ', en: 'ABOVE THRESHOLD · CONSCIOUS EXPERIENCE' },
    belowThreshold: { ru: 'НИЖЕ ПОРОГА · ОТСУТСТВИЕ ОПЫТА', en: 'BELOW THRESHOLD · UNCONSCIOUS STATE' },
    states: [
      {
        id: 'wake',
        name: { ru: 'Бодрствование', en: 'Wakefulness' },
        pci: 0.52,
        complexity: 0.88,
        decay: 0.58,
        spread: 1.0,
        note: {
          ru: 'Таламокортикальная сеть полностью интегрирована и дифференцирована: локальный импульс порождает богатое, неповторяющееся эхо по всем долям.',
          en: 'Thalamocortical networks are both integrated and differentiated: a single pulse triggers rich, non-repeating reverberations across lobes.',
        },
        citation: 'Casarotto et al., Ann. Neurol. (2016)',
      },
      {
        id: 'cmd',
        name: { ru: 'Скрытое сознание CMD (25%)', en: 'Covert Awareness CMD (25%)' },
        pci: 0.42,
        complexity: 0.74,
        decay: 0.72,
        spread: 0.86,
        note: {
          ru: 'Пациент внешне полностью неподвижен и не реагирует на голос, но кора отвечает сложным каскадом выше порога 0.31 — человек внутри осознаёт происходящее.',
          en: 'Behaviorally motionless and unresponsive at the bedside, yet cortex responds with rich complexity above 0.31 — clear inner awareness.',
        },
        citation: 'Bodien et al., NEJM (Aug 2024): 60 / 241 = 25%',
      },
      {
        id: 'ketamine',
        name: { ru: 'Кетамин (сновидение)', en: 'Ketamine (Dreaming)' },
        pci: 0.44,
        complexity: 0.78,
        decay: 0.68,
        spread: 0.9,
        note: {
          ru: 'Тело отключено от внешнего мира, но субъективные сновидения ярки — и PCI* остаётся высоким, доказывая измерение именно внутреннего опыта, а не поведения.',
          en: 'Disconnected from external senses yet filled with vivid dreams — PCI* stays high, proving it tracks inner experience rather than movement.',
        },
        citation: 'Sarasso et al., Curr. Biol. (2015)',
      },
      {
        id: 'psilocybin',
        name: { ru: 'Псилоцибин (энтропия)', en: 'Psilocybin (High Entropy)' },
        pci: 0.55,
        complexity: 0.96,
        decay: 0.52,
        spread: 1.0,
        note: {
          ru: 'Повышенная кортикальная энтропия и расширенный репертуар функциональных связей поднимают сложность сигнала выше базового бодрствования.',
          en: 'Elevated cortical entropy and expanded functional connectivity push signal complexity above baseline wakefulness.',
        },
        citation: 'Ort et al. (2023) · Elevated PCI ~0.55',
      },
      {
        id: 'nrem',
        name: { ru: 'Глубокий сон (NREM)', en: 'Deep Sleep (NREM)' },
        pci: 0.23,
        complexity: 0.28,
        decay: 1.85,
        spread: 0.38,
        note: {
          ru: 'Нейроны впадают в синхронную медленную волну (бистабильность): импульс вызывает крупный, но однообразный «глухой» ответ, который быстро затухает.',
          en: 'Cortical neurons enter slow-wave bistability: the pulse evokes a large but stereotyped slow wave that collapses rapidly.',
        },
        citation: 'Massimini et al., Science (2005)',
      },
      {
        id: 'coma',
        name: { ru: 'Глубокая кома / Пропофол', en: 'Deep Coma / Propofol' },
        pci: 0.18,
        complexity: 0.14,
        decay: 2.7,
        spread: 0.22,
        note: {
          ru: 'Эффективная связность коры разорвана: магнитный импульс остаётся строго локальным в точке удара и гаснет за десятки миллисекунд.',
          en: 'Effective cortical connectivity breaks down: the magnetic pulse remains strictly local and extinguishes within tens of milliseconds.',
        },
        citation: 'Casarotto et al., Ann. Neurol. (2016)',
      },
    ],
  },
} as const;
