export interface BookChapterMeta {
  id: string;
  partNum: 0 | 1 | 2 | 3;
  partLabel: string;
  code: string;
  shortTitle: string;
  fullTitle: string;
  mechanic: string;
  folio: string;
}

export const BOOK_PARTS = [
  { num: 1 as const, label: 'ЧАСТЬ I · ИЗНУТРИ', subtitle: 'Как сознание ощущается субъектом' },
  { num: 2 as const, label: 'ЧАСТЬ II · ПОД ЧЕРЕПОМ', subtitle: 'Биология, химия и клинический порог' },
  { num: 3 as const, label: 'ЧАСТЬ III · ГРАНИЦЫ РАЗУМА', subtitle: 'Животные, ИИ и ваш форзац' },
];

export const BOOK_CHAPTERS: BookChapterMeta[] = [
  {
    id: 'plate-00',
    partNum: 0,
    partLabel: 'ПОРОГ',
    code: 'ТАБЛ. 00',
    shortTitle: 'Проявка',
    fullTitle: 'Не верьте своим глазам',
    mechanic: 'Контактная проявка негатива (Иллюзия Муни)',
    folio: 'стр. 01',
  },
  {
    id: 'prologue',
    partNum: 0,
    partLabel: 'ПРОЛОГ',
    code: 'ПРОЛОГ',
    shortTitle: 'Что это?',
    fullTitle: 'Что такое свет внутри черепа',
    mechanic: 'Определение сознания, 3 ловушки и 3 ставки XXI века',
    folio: 'стр. 04',
  },
  {
    id: 'ch-1',
    partNum: 1,
    partLabel: 'ЧАСТЬ I · ИЗНУТРИ',
    code: 'ГЛ. I',
    shortTitle: 'Загадка цвета',
    fullTitle: 'Комната Мэри и природа квалиа',
    mechanic: 'Скролл-цветоделение Ч/Б → Кобальт + живой спектр',
    folio: 'стр. 10',
  },
  {
    id: 'ch-2',
    partNum: 1,
    partLabel: 'ЧАСТЬ I · ИЗНУТРИ',
    code: 'ГЛ. II',
    shortTitle: 'Расколотый штурвал',
    fullTitle: 'Расщеплённый мозг и иллюзия «Я»',
    mechanic: 'Разрезанный корешок с живыми волокнами (Газзанига)',
    folio: 'стр. 24',
  },
  {
    id: 'ch-3',
    partNum: 1,
    partLabel: 'ЧАСТЬ I · ИЗНУТРИ',
    code: 'ГЛ. III',
    shortTitle: 'Галлюцинация',
    fullTitle: 'Предсказательный мозг и ошибка «Трёх пальцев»',
    mechanic: '35мм нуарный POV + ризограф-калька и живой Приор',
    folio: 'стр. 38',
  },
  {
    id: 'ch-4',
    partNum: 2,
    partLabel: 'ЧАСТЬ II · ПОД ЧЕРЕПОМ',
    code: 'ГЛ. IV',
    shortTitle: 'Большое пари',
    fullTitle: 'Спор 1998→2025 и атлас COGITATE',
    mechanic: 'Отрывная перфорация + оптический диоптр МРТ',
    folio: 'стр. 54',
  },
  {
    id: 'ch-5',
    partNum: 2,
    partLabel: 'ЧАСТЬ II · ПОД ЧЕРЕПОМ',
    code: 'ГЛ. V',
    shortTitle: 'Тишина клетки',
    fullTitle: 'Нейрон Ларкума, сны и 2-секундный обрыв наркоза',
    mechanic: 'Микрозум ×1000 · Тушь Кахаля × Проигрыватель Рамса',
    folio: 'стр. 70',
  },
  {
    id: 'ch-6',
    partNum: 2,
    partLabel: 'ЧАСТЬ II · ПОД ЧЕРЕПОМ',
    code: 'ГЛ. VI',
    shortTitle: 'Реанимация',
    fullTitle: 'Скрытое сознание и порог PCI* = 0.31',
    mechanic: 'Прелюд «Подушка/Колокол/Оркестр» + 3 пациента NEJM',
    folio: 'стр. 86',
  },
  {
    id: 'ch-7',
    partNum: 3,
    partLabel: 'ЧАСТЬ III · ГРАНИЦЫ РАЗУМА',
    code: 'ГЛ. VII',
    shortTitle: 'Иные разумы',
    fullTitle: 'Декларация 2024 и Трибунал ИИ',
    mechanic: 'Красная закладка-ляссе + Монолит HAL 9000',
    folio: 'стр. 102',
  },
  {
    id: 'ch-8',
    partNum: 3,
    partLabel: 'ЧАСТЬ III · ГРАНИЦЫ РАЗУМА',
    code: 'ГЛ. VIII',
    shortTitle: 'Форзац',
    fullTitle: 'Синтез, Паспорт и Контрольная проба №0',
    mechanic: '5 итогов + 3D-переворот хлопковой карточки Bone',
    folio: 'стр. 118',
  },
];
