import type { ActId } from '../utils/hashRouter';

export interface ActChapterRef {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  folio: string;
  mechanic: string;
  experimentKey?: string;
}

export interface ActMeta {
  id: ActId;
  roman: 'I' | 'II' | 'III' | 'IV' | 'V';
  code: string;
  title: string;
  subtitle: string;
  durationLabel: string;
  prevAnchorNote?: string;
  nextCliffhanger?: string;
  startsDark?: boolean;
  endsDark?: boolean;
  chapters: ActChapterRef[];
}

export const ACTS_META: ActMeta[] = [
  {
    id: 'act-1',
    roman: 'I',
    code: 'АКТ I · ПОРОГ',
    title: 'Живая машина',
    subtitle: 'Порог узнавания, парадокс 69 млрд нейронов, взломанный гомункулус и ритм сердца',
    durationLabel: '~6 мин',
    nextCliffhanger:
      'В Акте II: поймаем цвет, которого нет в физическом спектре, проверим свой внутренний экран за 5 секунд и обманем собственное время на 80 мс.',
    chapters: [
      {
        id: 'plate-00',
        code: 'ТАБЛ. 00',
        title: 'Порог: необратимый щелчок',
        shortTitle: 'Проявка',
        folio: 'стр. 01',
        mechanic: 'Контактная экспозиция Муни · опыт на тебе',
        experimentKey: 'plate-00',
      },
      {
        id: 'prologue',
        code: 'ПРОЛОГ',
        title: 'Что такое свет внутри черепа?',
        shortTitle: 'Определение',
        folio: 'стр. 04',
        mechanic: 'Редуктор понятий Нагеля · 3 путаницы и ставки XXI века',
        experimentKey: 'prologue',
      },
      {
        id: 'ch-cerebellum',
        code: 'ГЛ. I.1',
        title: 'Парадокс 69 миллиардов',
        shortTitle: 'Парадокс 69 млрд',
        folio: 'стр. 08',
        mechanic: 'Модульный мозжечок (69 млрд) vs связная кора (16 млрд)',
        experimentKey: 'ch-cerebellum',
      },
      {
        id: 'ch-homunculus',
        code: 'ГЛ. I.2',
        title: 'Взломанный Гомункулус и Затвор Сердца',
        shortTitle: 'Гомункулус и сердце',
        folio: 'стр. 14',
        mechanic: 'Скролл-разлом Пенфилд → SCAN 2023 + кардиозатвор (×5)',
        experimentKey: 'ch-homunculus',
      },
    ],
  },
  {
    id: 'act-2',
    roman: 'II',
    code: 'АКТ II · ОПТИКА',
    title: 'Театр, которого нет',
    subtitle: 'Трудная проблема цвета, тест афантазии, переполнение Сперлинга, слепозрение и монтаж времени',
    durationLabel: '~8 мин',
    prevAnchorNote:
      'В Акте I мы увидели, что 69 миллиардов нейронов мозжечка обходятся без сознания, а сердце и сеть SCAN управляют самим порогом телесных чувств. Теперь проверим, откуда внутри черепа берётся цвет, образ и время.',
    nextCliffhanger:
      'В Акте III: раз мозг запаздывает на 80 мс, ему приходится постоянно угадывать реальность наперёд — проверим это в баре 1940-х и разрежем связь между полушариями.',
    chapters: [
      {
        id: 'ch-1',
        code: 'ГЛ. II.1',
        title: 'Комната Мэри и загадка цвета',
        shortTitle: 'Загадка цвета',
        folio: 'стр. 22',
        mechanic: 'Скролл-метаморфоза Ч/Б → Кобальт + окуляр смешения лучей и пурпура',
        experimentKey: 'ch-1',
      },
      {
        id: 'ch-aphantasia',
        code: 'ГЛ. II.2',
        title: 'Внутренний проектор: тест яблока',
        shortTitle: 'Афантазия',
        folio: 'стр. 30',
        mechanic: '5-секундная шкала 0–5 + зрачковый рефлекс (eLife 2022)',
        experimentKey: 'ch-aphantasia',
      },
      {
        id: 'ch-overflow',
        code: 'ГЛ. II.3',
        title: 'Переполнение, Слепозрение и Монтаж времени',
        shortTitle: 'Сперлинг · TN · Время',
        folio: 'стр. 36',
        mechanic: 'Вспышка Сперлинга ~110 мс + коридор TN + Flash-Lag 80 мс',
        experimentKey: 'ch-overflow',
      },
    ],
  },
  {
    id: 'act-3',
    roman: 'III',
    code: 'АКТ III · КОНСТРУКТОР «Я»',
    title: 'Догадка и расколотый штурвал',
    subtitle: 'Управляемая галлюцинация «Три пальца» и пресс-секретарь в левом полушарии',
    durationLabel: '~6 мин',
    prevAnchorNote:
      'В Акте II выяснилось, что цвет живёт внутри нас, опыт переполняет память, а чувство «сейчас» запаздывает на 80 мс. Чтобы не врезаться в мир с такой задержкой, мозг вынужден постоянно угадывать реальность наперёд — и сочинять историю нашего «Я».',
    nextCliffhanger:
      'В Акте IV: заглянем под череп — 25-летнее пари на ящик мадеры, спуск на ×1000 в живую клетку, обрыв наркоза и дежурство в ночной реанимации.',
    chapters: [
      {
        id: 'ch-3',
        code: 'ГЛ. III.1',
        title: 'Управляемая галлюцинация',
        shortTitle: 'Галлюцинация',
        folio: 'стр. 48',
        mechanic: '35-мм Leica Monochrom POV «Drei Gläser» + ползунок прогноза 0–100%',
        experimentKey: 'ch-3',
      },
      {
        id: 'ch-2',
        code: 'ГЛ. III.2',
        title: 'Расколотый штурвал',
        shortTitle: 'Расколотый штурвал',
        folio: 'стр. 60',
        mechanic: 'Зрительная хиазма + мозолистое тело + «Левый интерпретатор»',
        experimentKey: 'ch-2',
      },
    ],
  },
  {
    id: 'act-4',
    roman: 'IV',
    code: 'АКТ IV · ВСКРЫТИЕ',
    title: 'Под черепом',
    subtitle: 'COGITATE 2025, 6 слоёв коры, обрыв Пропофола и скрытое сознание в коме',
    durationLabel: '~9 мин',
    endsDark: true,
    prevAnchorNote:
      'В Акте III мы разобрали мозг изнутри первого лица: он предсказывает мир и сочиняет алиби. Пора вскрыть череп и найти физический выключатель в живой ткани.',
    nextCliffhanger:
      'Утренний выдох в Акт V: выходим из тёмной реанимации за пределы человека — животные, морская губка, монолит HAL 9000 и ваш итоговый паспорт.',
    chapters: [
      {
        id: 'ch-4',
        code: 'ГЛ. IV.1',
        title: 'Большое пари 1998→2025',
        shortTitle: 'Большое пари',
        folio: 'стр. 74',
        mechanic: 'Оптический диоптр Leica + честная дуэль COGITATE (Nature 2025)',
        experimentKey: 'ch-4',
      },
      {
        id: 'micro-zoom',
        code: 'СРЕЗ',
        title: 'Гистологический микрозум',
        shortTitle: 'Микрозум ×1000',
        folio: 'стр. 86',
        mechanic: '10 см → 6 живых слоёв коры (серебро Гольджи) → 200 мкм нейрон',
      },
      {
        id: 'ch-5',
        code: 'ГЛ. IV.2',
        title: 'Клеточный транзистор и тишина',
        shortTitle: 'Тишина клетки',
        folio: 'стр. 90',
        mechanic: 'Нейрон Ларкума × Проигрыватель Рамса + 2.2с обрыв Пропофола',
        experimentKey: 'ch-5',
      },
      {
        id: 'ch-6',
        code: 'ГЛ. IV.3',
        title: 'Тихий свет в реанимации',
        shortTitle: 'Реанимация',
        folio: 'стр. 106',
        mechanic: '3 полюса ZIP + 3 пациента NEJM 2024 (скрытый PCI* до вердикта)',
        experimentKey: 'ch-6',
      },
    ],
  },
  {
    id: 'act-5',
    roman: 'V',
    code: 'АКТ V · ГРАНИЦЫ РАЗУМА',
    title: 'Иные разумы и Форзац',
    subtitle: 'Нью-Йоркская декларация 2024, монолит HAL 9000, Трибунал ИИ и ваш экслибрис',
    durationLabel: '~6 мин',
    prevAnchorNote:
      'В Акте IV магнитный щелчок показал скрытый свет у 25% пациентов в коме. Теперь выходим за пределы человеческой коры — к животным и машинам.',
    chapters: [
      {
        id: 'ch-7',
        code: 'ГЛ. V.1',
        title: 'Граница иных разумов и HAL 9000',
        shortTitle: 'Иные разумы',
        folio: 'стр. 122',
        mechanic: 'Красная закладка NY 2024 + губка Porifera + HAL 9000 + Трибунал ИИ',
        experimentKey: 'ch-7',
      },
      {
        id: 'ch-8',
        code: 'ГЛ. V.2',
        title: 'Синтез, Форзац и Проба № 0',
        shortTitle: 'Форзац',
        folio: 'стр. 138',
        mechanic: 'Персистентная карточка Bone + проверка противоречий + Проба № 0',
        experimentKey: 'ch-8',
      },
    ],
  },
];

export function getActMeta(actId: ActId): ActMeta {
  return ACTS_META.find((a) => a.id === actId) ?? ACTS_META[0];
}

export function findActForSection(sectionId: string): ActId {
  for (const act of ACTS_META) {
    if (act.id === sectionId) return act.id;
    if (act.chapters.some((c) => c.id === sectionId)) return act.id;
  }
  return 'act-1';
}
