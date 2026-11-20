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
    id: 'ch-1',
    partNum: 1,
    partLabel: 'ЧАСТЬ I · ИЗНУТРИ',
    code: 'ГЛ. I',
    shortTitle: 'Загадка цвета',
    fullTitle: 'Комната Мэри и природа квалиа',
    mechanic: 'Скролл-цветоделение Ч/Б → Кобальт',
    folio: 'стр. 08',
  },
  {
    id: 'ch-2',
    partNum: 1,
    partLabel: 'ЧАСТЬ I · ИЗНУТРИ',
    code: 'ГЛ. II',
    shortTitle: 'Расколотый штурвал',
    fullTitle: 'Расщеплённый мозг и иллюзия «Я»',
    mechanic: 'Разрезанный корешок книги (Газзанига)',
    folio: 'стр. 22',
  },
  {
    id: 'ch-3',
    partNum: 1,
    partLabel: 'ЧАСТЬ I · ИЗНУТРИ',
    code: 'ГЛ. III',
    shortTitle: 'Галлюцинация',
    fullTitle: 'Предсказательный мозг и ошибка «Трёх пальцев»',
    mechanic: 'Сдвиг ризограф-кальки (#FC4109)',
    folio: 'стр. 36',
  },
  {
    id: 'ch-4',
    partNum: 2,
    partLabel: 'ЧАСТЬ II · ПОД ЧЕРЕПОМ',
    code: 'ГЛ. IV',
    shortTitle: 'Большое пари',
    fullTitle: 'Спор 1998→2025 и атлас COGITATE',
    mechanic: 'Отрывная перфорация + Оптический диоптр МРТ',
    folio: 'стр. 52',
  },
  {
    id: 'ch-5',
    partNum: 2,
    partLabel: 'ЧАСТЬ II · ПОД ЧЕРЕПОМ',
    code: 'ГЛ. V',
    shortTitle: 'Тишина клетки',
    fullTitle: 'Нейрон Ларкума, сны и обрыв наркоза',
    mechanic: 'Тушь Кахаля × Проигрыватель Дитера Рамса',
    folio: 'стр. 68',
  },
  {
    id: 'ch-6',
    partNum: 2,
    partLabel: 'ЧАСТЬ II · ПОД ЧЕРЕПОМ',
    code: 'ГЛ. VI',
    shortTitle: 'Реанимация',
    fullTitle: 'Скрытое сознание и порог PCI* = 0.31',
    mechanic: 'Тёмный клинический журнал (3 пациента)',
    folio: 'стр. 84',
  },
  {
    id: 'ch-7',
    partNum: 3,
    partLabel: 'ЧАСТЬ III · ГРАНИЦЫ РАЗУМА',
    code: 'ГЛ. VII',
    shortTitle: 'Иные разумы',
    fullTitle: 'Декларация 2024 и Трибунал ИИ',
    mechanic: 'Красная закладка-ляссе + Объектив HAL 9000',
    folio: 'стр. 98',
  },
  {
    id: 'ch-8',
    partNum: 3,
    partLabel: 'ЧАСТЬ III · ГРАНИЦЫ РАЗУМА',
    code: 'ГЛ. VIII',
    shortTitle: 'Форзац',
    fullTitle: 'Паспорт исследователя и Контрольная проба №0',
    mechanic: '3D-переворот хлопковой карточки цвета Bone',
    folio: 'стр. 112',
  },
];
