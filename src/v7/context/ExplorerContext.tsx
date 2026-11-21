import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ActId } from '../../v9/utils/hashRouter';

export type MaryBet = 'learns_new' | 'knows_all' | null;
export type SplitBrainCard = 'snow' | 'clock' | 'music' | null;
export type CogitateBet = 'iit' | 'gnwt' | 'draw' | null;
export type TurntableMode = 'wake' | 'nrem' | 'rem' | 'psilocybin' | 'propofol';
export type IcuVerdict = 'cmd' | 'coma';
export type MooneyGuess = 'blobs' | 'face_or_animal' | 'object' | null;

export interface IcuPatientTruth {
  id: 'p1' | 'p2' | 'p3';
  truth: IcuVerdict;
}

export const ICU_TRUTH: Record<'p1' | 'p2' | 'p3', IcuVerdict> = {
  p1: 'coma', // PCI* = 0.21 — глубокая кома без интеграции
  p2: 'cmd', // PCI* = 0.44 — скрытое сознание (CMD, 25% в NEJM 2024!)
  p3: 'cmd', // PCI* = 0.37 — минимальный порог, пациент слышит речь!
};

const STORAGE_KEY = 'noesis_v9_state_v1';
const SCHEMA_VERSION = 1;

export interface ExplorerState {
  // Табл. 00 — Иллюзия Муни + Пролог
  mooneyGuess: MooneyGuess;
  mooneyExposed: boolean;
  mooneySeconds: number | null;
  prologueExplored: boolean;
  // Гл. I — Комната Мэри
  maryBet: MaryBet;
  // Гл. II — Сдвиг кальки («Три пальца»)
  vellumTriggered: boolean;
  // Гл. III — Разрезанный корешок
  splitBrainCut: boolean;
  splitBrainEverCut: boolean;
  splitBrainCard: SplitBrainCard;
  // Гл. IV — Большое пари + COGITATE 2025
  wagerUnsealed: boolean;
  cogitateBet: CogitateBet;
  // Гл. V — Нейрон Ларкума × Проигрыватель Рамса
  turntableMode: TurntableMode;
  nremExperienced: boolean;
  remExperienced: boolean;
  propofolExperienced: boolean;
  // Гл. VI — Дежурство в реанимации (3 пациента)
  icuDiagnoses: Partial<Record<'p1' | 'p2' | 'p3', IcuVerdict>>;
  // Гл. VII — Красная закладка-ляссе (0..5)
  ribbonBoundaryIndex: number;
  ribbonChecked: boolean;
  // Гл. VII — Трибунал ИИ (5 модулей Butlin 2025)
  tribunalModules: Record<string, boolean>;
  // Навигация и архив v9
  visitedActs: Record<string, boolean>;
  dossiersRead: string[];
}

export interface ConsistencyVerdict {
  author: 'dennett' | 'chalmers' | 'seth';
  stampTitle: string;
  stampSubtitle: string;
  commentary: string;
  isContradiction: boolean;
  isIncomplete?: boolean;
}

interface ExplorerContextValue {
  state: ExplorerState;
  setMooneyGuess: (guess: Exclude<MooneyGuess, null>) => void;
  setMooneyResult: (seconds: number) => void;
  setPrologueExplored: (v: boolean) => void;
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
  setTribunalModules: (modules: Record<string, boolean>) => void;
  markActVisited: (actId: ActId) => void;
  markDossierRead: (dossierId: string) => void;
  resetAllState: () => void;
  icuStats: { attempted: number; correct: number; total: number };
  activeTribunalCount: number;
  completedCount: number;
  consistency: ConsistencyVerdict;
  completedChapters: Record<string, boolean>;
}

const DEFAULT_MODULES: Record<string, boolean> = {
  recurrent: false,
  workspace: false,
  selfModel: false,
  embodiment: false,
  valence: false,
};

const INITIAL_STATE: ExplorerState = {
  mooneyGuess: null,
  mooneyExposed: false,
  mooneySeconds: null,
  prologueExplored: false,
  maryBet: null,
  vellumTriggered: false,
  splitBrainCut: false,
  splitBrainEverCut: false,
  splitBrainCard: 'snow',
  wagerUnsealed: false,
  cogitateBet: null,
  turntableMode: 'wake',
  nremExperienced: false,
  remExperienced: false,
  propofolExperienced: false,
  icuDiagnoses: {},
  ribbonBoundaryIndex: 3,
  ribbonChecked: false,
  tribunalModules: { ...DEFAULT_MODULES },
  visitedActs: { 'act-1': true },
  dossiersRead: [],
};

function sanitizePersistedState(raw: unknown): ExplorerState {
  if (!raw || typeof raw !== 'object') return INITIAL_STATE;
  const obj = raw as Record<string, unknown>;
  if (obj.schemaVersion !== SCHEMA_VERSION || !obj.data || typeof obj.data !== 'object') {
    return INITIAL_STATE;
  }
  const d = obj.data as Record<string, unknown>;

  const validMary = d.maryBet === 'learns_new' || d.maryBet === 'knows_all' ? d.maryBet : null;
  const validGuess =
    d.mooneyGuess === 'blobs' || d.mooneyGuess === 'face_or_animal' || d.mooneyGuess === 'object'
      ? d.mooneyGuess
      : null;
  const validCard =
    d.splitBrainCard === 'snow' || d.splitBrainCard === 'clock' || d.splitBrainCard === 'music'
      ? d.splitBrainCard
      : 'snow';
  const validCogitate =
    d.cogitateBet === 'iit' || d.cogitateBet === 'gnwt' || d.cogitateBet === 'draw'
      ? d.cogitateBet
      : null;
  const validMode: TurntableMode =
    d.turntableMode === 'wake' ||
    d.turntableMode === 'nrem' ||
    d.turntableMode === 'rem' ||
    d.turntableMode === 'psilocybin' ||
    d.turntableMode === 'propofol'
      ? d.turntableMode
      : 'wake';

  const icuRaw = (d.icuDiagnoses && typeof d.icuDiagnoses === 'object'
    ? d.icuDiagnoses
    : {}) as Record<string, unknown>;
  const icuDiagnoses: Partial<Record<'p1' | 'p2' | 'p3', IcuVerdict>> = {};
  for (const k of ['p1', 'p2', 'p3'] as const) {
    if (icuRaw[k] === 'cmd' || icuRaw[k] === 'coma') {
      icuDiagnoses[k] = icuRaw[k];
    }
  }

  const rawMod = (d.tribunalModules && typeof d.tribunalModules === 'object'
    ? d.tribunalModules
    : {}) as Record<string, unknown>;
  const tribunalModules: Record<string, boolean> = { ...DEFAULT_MODULES };
  for (const k of Object.keys(DEFAULT_MODULES)) {
    if (typeof rawMod[k] === 'boolean') tribunalModules[k] = rawMod[k];
  }

  const rawActs = (d.visitedActs && typeof d.visitedActs === 'object'
    ? d.visitedActs
    : {}) as Record<string, unknown>;
  const visitedActs: Record<string, boolean> = { 'act-1': true };
  for (const k of ['act-1', 'act-2', 'act-3', 'act-4', 'act-5']) {
    if (rawActs[k] === true) visitedActs[k] = true;
  }

  const dossiersRead = Array.isArray(d.dossiersRead)
    ? d.dossiersRead.filter((x): x is string => typeof x === 'string' && x.length < 64).slice(0, 32)
    : [];

  const ribbonIdx =
    typeof d.ribbonBoundaryIndex === 'number' && Number.isFinite(d.ribbonBoundaryIndex)
      ? Math.max(0, Math.min(5, Math.round(d.ribbonBoundaryIndex)))
      : 3;

  return {
    mooneyGuess: validGuess,
    mooneyExposed: d.mooneyExposed === true,
    mooneySeconds:
      typeof d.mooneySeconds === 'number' && Number.isFinite(d.mooneySeconds) && d.mooneySeconds >= 0
        ? Number(d.mooneySeconds.toFixed(1))
        : null,
    prologueExplored: d.prologueExplored === true,
    maryBet: validMary,
    vellumTriggered: d.vellumTriggered === true,
    splitBrainCut: d.splitBrainCut === true,
    splitBrainEverCut: d.splitBrainEverCut === true || d.splitBrainCut === true,
    splitBrainCard: validCard,
    wagerUnsealed: d.wagerUnsealed === true || validCogitate !== null,
    cogitateBet: validCogitate,
    turntableMode: validMode,
    nremExperienced: d.nremExperienced === true,
    remExperienced: d.remExperienced === true,
    propofolExperienced: d.propofolExperienced === true,
    icuDiagnoses,
    ribbonBoundaryIndex: ribbonIdx,
    ribbonChecked: d.ribbonChecked === true,
    tribunalModules,
    visitedActs,
    dossiersRead,
  };
}

function loadInitialState(): ExplorerState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return sanitizePersistedState(JSON.parse(raw));
  } catch {
    return INITIAL_STATE;
  }
}

function writePersistedState(state: ExplorerState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, data: state }),
    );
  } catch {
    // Ignore Safari Private Mode / QuotaExceeded gracefully
  }
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null);

export function ExplorerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExplorerState>(loadInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Debounced localStorage write (300ms) + immediate flush on pagehide
  useEffect(() => {
    const timer = window.setTimeout(() => {
      writePersistedState(state);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const flush = () => writePersistedState(stateRef.current);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (!e.newValue) {
        setState(INITIAL_STATE);
        return;
      }
      try {
        setState(sanitizePersistedState(JSON.parse(e.newValue)));
      } catch {
        // Ignore malformed external payload
      }
    };
    window.addEventListener('pagehide', flush);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setMooneyGuess = useCallback(
    (mooneyGuess: Exclude<MooneyGuess, null>) =>
      setState((prev) => ({ ...prev, mooneyGuess })),
    [],
  );

  const setMooneyResult = useCallback(
    (seconds: number) =>
      setState((prev) => ({
        ...prev,
        mooneyExposed: true,
        mooneySeconds: prev.mooneySeconds ?? Math.max(0.4, Number(seconds.toFixed(1))),
      })),
    [],
  );

  const setPrologueExplored = useCallback(
    (prologueExplored: boolean) => setState((prev) => ({ ...prev, prologueExplored })),
    [],
  );

  const setMaryBet = useCallback(
    (maryBet: Exclude<MaryBet, null>) => setState((prev) => ({ ...prev, maryBet })),
    [],
  );

  const setSplitBrainCut = useCallback(
    (splitBrainCut: boolean) =>
      setState((prev) => ({
        ...prev,
        splitBrainCut,
        splitBrainEverCut: prev.splitBrainEverCut || splitBrainCut,
      })),
    [],
  );

  const setSplitBrainCard = useCallback(
    (splitBrainCard: Exclude<SplitBrainCard, null>) =>
      setState((prev) => ({ ...prev, splitBrainCard })),
    [],
  );

  const setVellumTriggered = useCallback(
    (vellumTriggered: boolean) => setState((prev) => ({ ...prev, vellumTriggered })),
    [],
  );

  const setWagerUnsealed = useCallback(
    (wagerUnsealed: boolean) => setState((prev) => ({ ...prev, wagerUnsealed })),
    [],
  );

  const setCogitateBet = useCallback(
    (cogitateBet: Exclude<CogitateBet, null>) =>
      setState((prev) => ({
        ...prev,
        cogitateBet,
        wagerUnsealed: true, // Synchronize perforation seal with bet reveal (closes double-spoiler bug #6!)
      })),
    [],
  );

  const setTurntableMode = useCallback(
    (turntableMode: TurntableMode) =>
      setState((prev) => ({
        ...prev,
        turntableMode,
        nremExperienced: prev.nremExperienced || turntableMode === 'nrem',
        remExperienced: prev.remExperienced || turntableMode === 'rem',
        propofolExperienced: prev.propofolExperienced || turntableMode === 'propofol',
      })),
    [],
  );

  const setIcuDiagnosis = useCallback(
    (patientId: 'p1' | 'p2' | 'p3', verdict: IcuVerdict) =>
      setState((prev) => ({
        ...prev,
        icuDiagnoses: { ...prev.icuDiagnoses, [patientId]: verdict },
      })),
    [],
  );

  const setRibbonBoundaryIndex = useCallback(
    (ribbonBoundaryIndex: number) =>
      setState((prev) => ({
        ...prev,
        ribbonBoundaryIndex: Math.max(0, Math.min(5, ribbonBoundaryIndex)),
      })),
    [],
  );

  const setRibbonChecked = useCallback(
    (ribbonChecked: boolean) => setState((prev) => ({ ...prev, ribbonChecked })),
    [],
  );

  const toggleTribunalModule = useCallback(
    (moduleId: string) =>
      setState((prev) => ({
        ...prev,
        tribunalModules: {
          ...prev.tribunalModules,
          [moduleId]: !prev.tribunalModules[moduleId],
        },
      })),
    [],
  );

  const setTribunalModules = useCallback(
    (tribunalModules: Record<string, boolean>) =>
      setState((prev) => ({ ...prev, tribunalModules })),
    [],
  );

  const markActVisited = useCallback(
    (actId: ActId) =>
      setState((prev) => {
        if (prev.visitedActs[actId]) return prev;
        return {
          ...prev,
          visitedActs: { ...prev.visitedActs, [actId]: true },
        };
      }),
    [],
  );

  const markDossierRead = useCallback(
    (dossierId: string) =>
      setState((prev) => {
        if (prev.dossiersRead.includes(dossierId)) return prev;
        return {
          ...prev,
          dossiersRead: [...prev.dossiersRead, dossierId],
        };
      }),
    [],
  );

  const resetAllState = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage clear errors
    }
    setState({ ...INITIAL_STATE, tribunalModules: { ...DEFAULT_MODULES }, visitedActs: { 'act-1': true } });
  }, []);

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

  const completedChapters = useMemo<Record<string, boolean>>(
    () => ({
      'plate-00': state.mooneyExposed,
      prologue: state.prologueExplored,
      'ch-1': state.maryBet !== null,
      'ch-3': state.vellumTriggered,
      'ch-2': state.splitBrainEverCut,
      'ch-4': state.cogitateBet !== null,
      'ch-5': state.remExperienced || state.propofolExperienced || state.nremExperienced,
      'ch-6': icuStats.attempted === 3,
      'ch-7': state.ribbonChecked,
      'ch-8': true,
    }),
    [state, icuStats.attempted],
  );

  const completedCount = useMemo(() => {
    const experimentKeys = ['plate-00', 'ch-1', 'ch-3', 'ch-2', 'ch-4', 'ch-5', 'ch-6', 'ch-7'];
    return experimentKeys.filter((k) => completedChapters[k]).length;
  }, [completedChapters]);

  // Strict precondition-masked Consistency Engine (Bug #11 fix: NEVER falsely praises skipped key bets!)
  const consistency = useMemo<ConsistencyVerdict>(() => {
    // 0. If fewer than 3 core experiments completed -> clearly incomplete
    if (completedCount < 3) {
      return {
        author: 'seth',
        stampTitle: 'НЕЗАПОЛНЕННЫЙ ПРОТОКОЛ',
        stampSubtitle: `Пройдено ${completedCount} из 8 опытов`,
        commentary:
          'Вы прошли меньше трёх ключевых экспериментов. Чтобы редакция смогла проверить ваши интуиции на противоречие, сделайте ставки в Комнате Мэри, COGITATE и в Акте V.',
        isContradiction: false,
        isIncomplete: true,
      };
    }

    // 1. Classic philosophical contradiction (requires Mary's Room bet!)
    if (state.maryBet === 'learns_new' && activeTribunalCount >= 4) {
      return {
        author: 'dennett',
        stampTitle: 'ШТАМП ПРОТИВОРЕЧИЯ',
        stampSubtitle: 'Пометка Д. Деннета на полях',
        commentary:
          'Попался! В Акте II вы решили, что физика не объясняет красный цвет Мэри — а в Акте V щедро признали субъектом кремниевую машину, просто щёлкнув тумблерами архитектуры. Значит, сознание всё-таки вычисление?',
        isContradiction: true,
      };
    }

    // 2. Reverse paradox (requires Mary's Room bet + ribbon checked!)
    if (state.maryBet === 'knows_all' && state.ribbonChecked && state.ribbonBoundaryIndex >= 4) {
      return {
        author: 'chalmers',
        stampTitle: 'БИОЛОГИЧЕСКИЙ ШОВИНИЗМ',
        stampSubtitle: 'Замечание Д. Чалмерса',
        commentary:
          'Любопытный парадокс: вы отмахнулись от загадки Мэри как от «просто обработки данных», но красной закладкой отсекли пчёл и осьминогов, оставив сознание узкому клубу с человеческой корой.',
        isContradiction: true,
      };
    }

    // 3. Precondition check before praising consistency: did reader actually answer Mary + COGITATE + Act V?
    const missingAnchors: string[] = [];
    if (state.maryBet === null) missingAnchors.push('Комната Мэри (Акт II)');
    if (state.cogitateBet === null) missingAnchors.push('пари COGITATE (Акт IV)');
    if (!state.ribbonChecked) missingAnchors.push('красная закладка NY 2024 (Акт V)');

    if (missingAnchors.length > 0) {
      return {
        author: 'seth',
        stampTitle: 'ЧАСТИЧНЫЙ ПРОТОКОЛ',
        stampSubtitle: `Не хватает опоры: ${missingAnchors.length} из 3`,
        commentary: `Чтобы честно сверить вашу философию на непротиворечивость, не хватает ставки в разделах: ${missingAnchors.join(', ')}. Сейчас явных противоречий нет, но часть ключевых вопросов осталась без ответа.`,
        isContradiction: false,
        isIncomplete: true,
      };
    }

    // 4. Bold bet on a single pure theory in COGITATE
    if (state.cogitateBet === 'iit' || state.cogitateBet === 'gnwt') {
      return {
        author: 'seth',
        stampTitle: 'АЗАРТНЫЙ НАТУРАЛИСТ',
        stampSubtitle: 'Пометка А. Сета',
        commentary:
          'Вы ответили на все ключевые ставки без логических разрывов, но в COGITATE смело поставили на одну теорию — и разделили судьбу её авторов в апреле 2025-го. Мозг оказался сложнее обеих схем.',
        isContradiction: false,
      };
    }

    // 5. Earned strict consistency! (All 3 philosophical anchors answered without contradiction!)
    return {
      author: 'seth',
      stampTitle: 'СТРОГАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ',
      stampSubtitle: 'Редкий штамп редакции NOESIS',
      commentary:
        'Ваши ответы в Комнате Мэри, пари COGITATE и перед Трибуналом ИИ не поспорили друг с другом. Остался последний экзамен — переверните хлопковую карточку и проверьте собственный мозг.',
      isContradiction: false,
    };
  }, [
    completedCount,
    state.maryBet,
    state.cogitateBet,
    state.ribbonChecked,
    state.ribbonBoundaryIndex,
    activeTribunalCount,
  ]);

  const value = useMemo<ExplorerContextValue>(
    () => ({
      state,
      setMooneyGuess,
      setMooneyResult,
      setPrologueExplored,
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
      setTribunalModules,
      markActVisited,
      markDossierRead,
      resetAllState,
      icuStats,
      activeTribunalCount,
      completedCount,
      consistency,
      completedChapters,
    }),
    [
      state,
      setMooneyGuess,
      setMooneyResult,
      setPrologueExplored,
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
      setTribunalModules,
      markActVisited,
      markDossierRead,
      resetAllState,
      icuStats,
      activeTribunalCount,
      completedCount,
      consistency,
      completedChapters,
    ],
  );

  return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>;
}

export function useExplorer() {
  const ctx = useContext(ExplorerContext);
  if (!ctx) throw new Error('useExplorer must be used within ExplorerProvider');
  return ctx;
}
