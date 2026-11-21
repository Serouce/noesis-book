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
  roman: 'I' | 'II' | 'III' | 'IV';
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
    code: 'АКТ I · ТАЙНА С НУЛЯ',
    title: 'Свет внутри темноты',
    subtitle: 'Порог узнавания, точка отсчёта Декарта, Мельница Лейбница, мышь Нагеля и Трудная проблема',
    durationLabel: '~5 мин',
    nextCliffhanger:
      'В Акте II: выйдем из чистого спора о материи в лабораторию восприятия — поймаем цвет, которого нет в физике, заглянем на внутренний экран и увидим, как мозг достраивает реальность и время.',
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
        id: 'ch-01',
        code: 'ГЛ. 01',
        title: 'Что такое свет внутри темноты?',
        shortTitle: 'Тайна с нуля',
        folio: 'стр. 06',
        mechanic: 'Декарт → 3D-Мельница Лейбница → Нагель → Зомби Чалмерса',
        experimentKey: 'ch-01',
      },
    ],
  },
  {
    id: 'act-2',
    roman: 'II',
    code: 'АКТ II · ТЕАТР ВОСПРИЯТИЯ',
    title: 'Мир, которого нет снаружи',
    subtitle: 'Комната Мэри, оптическая призма, афантазия, управляемая галлюцинация и монтаж времени',
    durationLabel: '~7 мин',
    prevAnchorNote:
      'В Акте I мы отделили субъективный опыт от вычислений и рефлексов и увидели разрыв между механикой мозга и «внутренним кино». Теперь проверим, как мозг сам рисует цвет, образы и настоящее время.',
    nextCliffhanger:
      'В Акте III: если образ строится изнутри с задержкой в 80 мс, кто внутри нас держит штурвал? Заглянем под череп — рассечём полушария и спустимся от макрокоры к одному нейрону.',
    chapters: [
      {
        id: 'ch-1',
        code: 'ГЛ. 02',
        title: 'Мир, которого нет снаружи',
        shortTitle: 'Мэри и экран',
        folio: 'стр. 22',
        mechanic: 'Комната Мэри + Оптическая Призма L/M/S + 5-сек тест афантазии',
        experimentKey: 'ch-1',
      },
      {
        id: 'ch-3',
        code: 'ГЛ. 03',
        title: 'Управляемая галлюцинация и время',
        shortTitle: 'Три пальца · Время',
        folio: 'стр. 40',
        mechanic: '35-мм Leica POV «Drei Gläser» + Приор 0–100% + Flash-Lag 80 мс',
        experimentKey: 'ch-3',
      },
    ],
  },
  {
    id: 'act-3',
    roman: 'III',
    code: 'АКТ III · ПОД ЧЕРЕПОМ',
    title: 'Вскрытие субъекта',
    subtitle: 'Туннель Эго и раскол полушарий, Мозжечок 69 млрд → SCAN → COGITATE 2025, лес Кахаля и Пропофол',
    durationLabel: '~9 мин',
    endsDark: true,
    prevAnchorNote:
      'В Акте II выяснилось, что цвета, образы и даже «сейчас» монтируются мозгом изнутри. Пора открыть череп и найти физические узлы, которые удерживают и выключают этот свет.',
    nextCliffhanger:
      'Утренний выдох в Акт IV: выходим из ночной тишины наркоза к реальной реанимации, животным и вопросу о призраке в кремнии.',
    chapters: [
      {
        id: 'ch-2',
        code: 'ГЛ. 04',
        title: 'Туннель Эго и расколотый штурвал',
        shortTitle: 'Расколотый штурвал',
        folio: 'стр. 56',
        mechanic: 'Туннель Эго Метцингера + 3D-рассечение полушарий Газзаниги',
        experimentKey: 'ch-2',
      },
      {
        id: 'ch-4',
        code: 'ГЛ. 05',
        title: 'Вскрытие черепа и пари COGITATE 2025',
        shortTitle: 'COGITATE 2025',
        folio: 'стр. 72',
        mechanic: '3D-полёт: Мозжечок 69 млрд → SCAN → дуэль IIT/GNWT и Таламус',
        experimentKey: 'ch-4',
      },
      {
        id: 'ch-5',
        code: 'ГЛ. 06',
        title: 'Лес Кахаля ×1000 и обрыв Пропофола',
        shortTitle: 'Клетка и наркоз',
        folio: 'стр. 90',
        mechanic: '3D-лес Кахаля → Клетка Ларкума → Проигрыватель Рамса и Пропофол',
        experimentKey: 'ch-5',
      },
    ],
  },
  {
    id: 'act-4',
    roman: 'IV',
    code: 'АКТ IV · ГРАНИЦЫ РАЗУМА',
    title: 'Кома, животные и кремний',
    subtitle: 'Скрытое сознание в реанимации NEJM 2024, Нью-Йоркская декларация 2024, HAL 9000 и Форзац Bone',
    durationLabel: '~7 мин',
    prevAnchorNote:
      'В Акте III мы увидели, как наркоз разрывает интеграцию в 5-м слое коры. Теперь проверим, где ещё во Вселенной горит этот свет — в тихой палате комы, у животных и в кремниевых машинах.',
    chapters: [
      {
        id: 'ch-6',
        code: 'ГЛ. 07',
        title: 'Тихий свет в реанимации и граница жизни',
        shortTitle: 'Кома и животные',
        folio: 'стр. 108',
        mechanic: 'Клиника NEJM 2024 + радар PCI* + красная закладка NY 2024',
        experimentKey: 'ch-6',
      },
      {
        id: 'ch-7',
        code: 'ГЛ. 08',
        title: 'Призрак в кремнии и Форзац Bone',
        shortTitle: 'Кремний и Форзац',
        folio: 'стр. 124',
        mechanic: 'Тьюринг, 3D Выцветающие квалиа, Варела, HAL 9000 и Паспорт Bone',
        experimentKey: 'ch-7',
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
  if (sectionId === 'ch-aphantasia') return 'act-2';
  if (sectionId === 'micro-zoom') return 'act-3';
  if (sectionId === 'ch-7-tribunal' || sectionId === 'ch-8') return 'act-4';
  return 'act-1';
}
