import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type MaryBet = 'learns_new' | 'knows_all' | null;
export type SplitBrainCard = 'snow' | 'clock' | 'music' | null;
export type CogitateBet = 'iit' | 'gnwt' | 'draw' | null;
export type TurntableMode = 'wake' | 'rem' | 'psilocybin' | 'propofol';
export type IcuVerdict = 'cmd' | 'coma';

export interface IcuPatientTruth {
  id: 'p1' | 'p2' | 'p3';
  truth: IcuVerdict;
}

export const ICU_TRUTH: Record<'p1' | 'p2' | 'p3', IcuVerdict> = {
  p1: 'coma', // PCI* = 0.21 — глубокая кома без интеграции
  p2: 'cmd',  // PCI* = 0.44 — скрытое сознание (CMD, 25% в NEJM 2024!)
  p3: 'cmd',  // PCI* = 0.37 — минимальный порог, пациент слышит речь!
};

export interface ExplorerState {
  // Табл. 00 — Иллюзия Муни
  mooneyExposed: boolean;
  mooneySeconds: number | null;
  // Гл. I — Комната Мэри
  maryBet: MaryBet;
  // Гл. II — Разрезанный корешок
  splitBrainCut: boolean;
  splitBrainCard: SplitBrainCard;
  // Гл. III — Сдвиг кальки («Три пальца»)
  vellumTriggered: boolean;
  // Гл. IV — Большое пари + COGITATE 2025
  wagerUnsealed: boolean;
  cogitateBet: CogitateBet;
  // Гл. V — Нейрон Ларкума × Проигрыватель Рамса
  turntableMode: TurntableMode;
  remExperienced: boolean;
  propofolExperienced: boolean;
  // Гл. VI — Дежурство в реанимации (3 пациента)
  icuDiagnoses: Partial<Record<'p1' | 'p2' | 'p3', IcuVerdict>>;
  // Гл. VII — Красная закладка-ляссе (0..6: число видов СПРАВА от черты или индекс раздела)
  // boundaryIndex = сколько видов СЛЕВА считаются «биороботами» (1 = сразу после Губки Боба!)
  ribbonBoundaryIndex: number;
  ribbonChecked: boolean;
  // Гл. VII — Трибунал ИИ (5 модулей Butlin 2025)
  tribunalModules: Record<string, boolean>;
}

export interface ConsistencyVerdict {
  author: 'dennett' | 'chalmers' | 'seth';
  stampTitle: string;
  stampSubtitle: string;
  commentary: string;
  isContradiction: boolean;
}

interface ExplorerContextValue {
  state: ExplorerState;
  setMooneyResult: (seconds: number) => void;
  setMaryBet: (bet: Exclude<MaryBet, null>) => void;
  setSplitBrainCut: (cut: boolean) => void;
  setSplitBrainCard: (card: Exclude<SplitBrainCard, null>) => void;
  setVellumTriggered: (v: boolean) => void;
  setWagerUnsealed: (v: boolean) => void;
  setCogitateBet: (bet: Exclude<CogitateBet, null>) => void;
  setTurntableMode: (mode: TurntableMode) => void;
  setIcuDiagnosis: (patientId: 'p1' | 'p2' | 'p3', verdict: IcuVerdict) => void;
  setRibbonBoundaryIndex: (idx: number) => void;
  setRibbonChecked: (v: boolean) => void;
  toggleTribunalModule: (moduleId: string) => void;
  icuStats: { attempted: number; correct: number; total: number };
  activeTribunalCount: number;
  consistency: ConsistencyVerdict;
  completedChapters: Record<string, boolean>;
}

const DEFAULT_MODULES: Record<string, boolean> = {
  recurrent: true,
  workspace: true,
  selfModel: false,
  embodiment: false,
  valence: false,
};

const INITIAL_STATE: ExplorerState = {
  mooneyExposed: false,
  mooneySeconds: null,
  maryBet: null,
  splitBrainCut: false,
  splitBrainCard: null,
  vellumTriggered: false,
  wagerUnsealed: false,
  cogitateBet: null,
  turntableMode: 'wake',
  remExperienced: false,
  propofolExperienced: false,
  icuDiagnoses: {},
  ribbonBoundaryIndex: 3, // По умолчанию ставит черту посередине (до осьминога) — читатель двигает сам!
  ribbonChecked: false,
  tribunalModules: DEFAULT_MODULES,
};

const ExplorerContext = createContext<ExplorerContextValue | null>(null);

export function ExplorerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExplorerState>(INITIAL_STATE);

  const setMooneyResult = (seconds: number) =>
    setState((prev) => ({
      ...prev,
      mooneyExposed: true,
      mooneySeconds: prev.mooneySeconds ?? Math.max(0.4, Number(seconds.toFixed(1))),
    }));

  const setMaryBet = (maryBet: Exclude<MaryBet, null>) =>
    setState((prev) => ({ ...prev, maryBet }));

  const setSplitBrainCut = (splitBrainCut: boolean) =>
    setState((prev) => ({ ...prev, splitBrainCut }));

  const setSplitBrainCard = (splitBrainCard: Exclude<SplitBrainCard, null>) =>
    setState((prev) => ({ ...prev, splitBrainCard }));

  const setVellumTriggered = (vellumTriggered: boolean) =>
    setState((prev) => ({ ...prev, vellumTriggered }));

  const setWagerUnsealed = (wagerUnsealed: boolean) =>
    setState((prev) => ({ ...prev, wagerUnsealed }));

  const setCogitateBet = (cogitateBet: Exclude<CogitateBet, null>) =>
    setState((prev) => ({ ...prev, cogitateBet }));

  const setTurntableMode = (turntableMode: TurntableMode) =>
    setState((prev) => ({
      ...prev,
      turntableMode,
      remExperienced: prev.remExperienced || turntableMode === 'rem',
      propofolExperienced: prev.propofolExperienced || turntableMode === 'propofol',
    }));

  const setIcuDiagnosis = (patientId: 'p1' | 'p2' | 'p3', verdict: IcuVerdict) =>
    setState((prev) => ({
      ...prev,
      icuDiagnoses: { ...prev.icuDiagnoses, [patientId]: verdict },
    }));

  const setRibbonBoundaryIndex = (ribbonBoundaryIndex: number) =>
    setState((prev) => ({ ...prev, ribbonBoundaryIndex }));

  const setRibbonChecked = (ribbonChecked: boolean) =>
    setState((prev) => ({ ...prev, ribbonChecked }));

  const toggleTribunalModule = (moduleId: string) =>
    setState((prev) => ({
      ...prev,
      tribunalModules: {
        ...prev.tribunalModules,
        [moduleId]: !prev.tribunalModules[moduleId],
      },
    }));

  const icuStats = useMemo(() => {
    const ids: Array<'p1' | 'p2' | 'p3'> = ['p1', 'p2', 'p3'];
    let attempted = 0;
    let correct = 0;
    for (const id of ids) {
      const v = state.icuDiagnoses[id];
      if (v) {
        attempted += 1;
        if (v === ICU_TRUTH[id]) correct += 1;
      }
    }
    return { attempted, correct, total: 3 };
  }, [state.icuDiagnoses]);

  const activeTribunalCount = useMemo(
    () => Object.values(state.tribunalModules).filter(Boolean).length,
    [state.tribunalModules],
  );

  const consistency = useMemo<ConsistencyVerdict>(() => {
    // 1. Классическое противоречие: в Гл. I поверил в нематериальность квалиа, но в Гл. VII собрал ИИ из 4-5 софт-модулей!
    if (state.maryBet === 'learns_new' && activeTribunalCount >= 4) {
      return {
        author: 'dennett',
        stampTitle: 'ШТАМП ПРОТИВОРЕЧИЯ',
        stampSubtitle: 'Пометка Д. Деннета на полях',
        commentary:
          'Попался! В Главе I вы решили, что физика не объясняет красный цвет Мэри — а в Главе VII щедро признали субъектом кремниевую машину, просто щёлкнув тумблерами архитектуры. Значит, сознание всё-таки вычисление?',
        isContradiction: true,
      };
    }
    // 2. Обратный парадокс: отрицал квалиа Мэри, но строго отказал ИИ даже при 3+ модулях и оставил границу высоко у человека
    if (state.maryBet === 'knows_all' && state.ribbonBoundaryIndex >= 4) {
      return {
        author: 'chalmers',
        stampTitle: 'БИОЛОГИЧЕСКИЙ ШОВИНИЗМ',
        stampSubtitle: 'Замечание Д. Чалмерса',
        commentary:
          'Любопытный парадокс: вы отмахнулись от загадки Мэри как от «просто обработки данных», но красной закладкой отсекли пчёл и осьминогов, оставив сознание узкому клубу с человеческой корой.',
        isContradiction: true,
      };
    }
    // 3. Поставил на чистый IIT/GNWT и проиграл вместе с Кохом и Деаном
    if (state.cogitateBet === 'iit' || state.cogitateBet === 'gnwt') {
      return {
        author: 'seth',
        stampTitle: 'АЗАРТНЫЙ НАТУРАЛИСТ',
        stampSubtitle: 'Пометка А. Сета',
        commentary:
          'Вы смело поставили на одну из великих теорий в COGITATE — и разделили судьбу её авторов в апреле 2025-го. Мозг оказался сложнее обеих школьных схем.',
        isContradiction: false,
      };
    }
    // 4. Строгая последовательность!
    return {
      author: 'seth',
      stampTitle: 'СТРОГАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ',
      stampSubtitle: 'Редкий штамп редакции NOESIS',
      commentary:
        'Ваши интуиции в Комнате Мэри, в реанимации и перед Трибуналом ИИ не поспорили друг с другом. Остался последний экзамен — переверните карточку и проверьте свои синапсы.',
      isContradiction: false,
    };
  }, [state.maryBet, state.cogitateBet, state.ribbonBoundaryIndex, activeTribunalCount]);

  const completedChapters = useMemo<Record<string, boolean>>(
    () => ({
      'plate-00': state.mooneyExposed,
      'ch-1': state.maryBet !== null,
      'ch-2': state.splitBrainCard !== null,
      'ch-3': state.vellumTriggered,
      'ch-4': state.cogitateBet !== null,
      'ch-5': state.remExperienced || state.propofolExperienced,
      'ch-6': icuStats.attempted === 3,
      'ch-7': state.ribbonChecked,
      'ch-8': true,
    }),
    [state, icuStats.attempted],
  );

  const value: ExplorerContextValue = {
    state,
    setMooneyResult,
    setMaryBet,
    setSplitBrainCut,
    setSplitBrainCard,
    setVellumTriggered,
    setWagerUnsealed,
    setCogitateBet,
    setTurntableMode,
    setIcuDiagnosis,
    setRibbonBoundaryIndex,
    setRibbonChecked,
    toggleTribunalModule,
    icuStats,
    activeTribunalCount,
    consistency,
    completedChapters,
  };

  return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>;
}

export function useExplorer() {
  const ctx = useContext(ExplorerContext);
  if (!ctx) throw new Error('useExplorer must be used within ExplorerProvider');
  return ctx;
}
