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
    subtitle: 'Как вспыхивает свет внутри черепа и почему сознание не равно интеллекту',
    durationLabel: '~4 мин',
    nextCliffhanger:
      'В Акте II: выйдем из чёрно-белой комнаты Мэри и своими руками проверим, почему в физическом спектре нет ни капли красного.',
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
    ],
  },
  {
    id: 'act-2',
    roman: 'II',
    code: 'АКТ II · ОПТИКА',
    title: 'Театр, которого нет',
    subtitle: 'Трудная проблема цвета, рождение субъективного переживания и спор Чалмерса с Деннетом',
    durationLabel: '~4 мин',
    prevAnchorNote:
      'В Акте I пиксели кляксы Муни не изменились, но ваш опыт перестроился навсегда. Теперь проверим, откуда вообще берётся субъективное качество цвета.',
    nextCliffhanger:
      'В Акте III: проверим в нуарном баре 1940-х, как мозг галлюцинирует реальность, и разрежем 200 миллионов волокон между полушариями.',
    chapters: [
      {
        id: 'ch-1',
        code: 'ГЛ. I',
        title: 'Комната Мэри и загадка цвета',
        shortTitle: 'Загадка цвета',
        folio: 'стр. 10',
        mechanic: 'Скролл-метаморфоза Ч/Б → Кобальт + спектрометр L/M/S',
        experimentKey: 'ch-1',
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
      'В Акте II мы увидели, что цвет рождается внутри нас, а не в луче света. Но как мозг собирает целый мир — и кто на самом деле держит штурвал нашего «Я»?',
    nextCliffhanger:
      'В Акте IV: заглянем под череп — 25-летнее пари на ящик мадеры, спуск на ×1000 в живую клетку, обрыв наркоза и дежурство в ночной реанимации.',
    chapters: [
      {
        id: 'ch-3',
        code: 'ГЛ. II',
        title: 'Управляемая галлюцинация',
        shortTitle: 'Галлюцинация',
        folio: 'стр. 24',
        mechanic: '35-мм Leica Monochrom POV «Drei Gläser» + ползунок прогноза 0–100%',
        experimentKey: 'ch-3',
      },
      {
        id: 'ch-2',
        code: 'ГЛ. III',
        title: 'Расколотый штурвал',
        shortTitle: 'Расколотый штурвал',
        folio: 'стр. 38',
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
        code: 'ГЛ. IV',
        title: 'Большое пари 1998→2025',
        shortTitle: 'Большое пари',
        folio: 'стр. 54',
        mechanic: 'Оптический диоптр Leica + честная дуэль COGITATE (Nature 2025)',
        experimentKey: 'ch-4',
      },
      {
        id: 'micro-zoom',
        code: 'СРЕЗ',
        title: 'Гистологический микрозум',
        shortTitle: 'Микрозум ×1000',
        folio: 'стр. 66',
        mechanic: '10 см → 6 живых слоёв коры (серебро Гольджи) → 200 мкм нейрон',
      },
      {
        id: 'ch-5',
        code: 'ГЛ. V',
        title: 'Клеточный транзистор и тишина',
        shortTitle: 'Тишина клетки',
        folio: 'стр. 70',
        mechanic: 'Нейрон Ларкума × Проигрыватель Рамса + 2.2с обрыв Пропофола',
        experimentKey: 'ch-5',
      },
      {
        id: 'ch-6',
        code: 'ГЛ. VI',
        title: 'Тихий свет в реанимации',
        shortTitle: 'Реанимация',
        folio: 'стр. 86',
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
        code: 'ГЛ. VII',
        title: 'Граница иных разумов и HAL 9000',
        shortTitle: 'Иные разумы',
        folio: 'стр. 102',
        mechanic: 'Красная закладка NY 2024 + губка Porifera + HAL 9000 + Трибунал ИИ',
        experimentKey: 'ch-7',
      },
      {
        id: 'ch-8',
        code: 'ГЛ. VIII',
        title: 'Синтез, Форзац и Проба № 0',
        shortTitle: 'Форзац',
        folio: 'стр. 118',
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
