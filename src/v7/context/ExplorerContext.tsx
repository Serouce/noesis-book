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
export type AiVerdict = 'biology' | 'robot' | 'agent' | 'llm' | 'undecided' | null;

export interface IcuPatientTruth {
  id: 'p1' | 'p2' | 'p3';
  truth: IcuVerdict;
}

export const ICU_TRUTH: Record<'p1' | 'p2' | 'p3', IcuVerdict> = {
  p1: 'coma', // PCI* = 0.21 — глубокая кома без интеграции
  p2: 'cmd', // PCI* = 0.44 — скрытое сознание (CMD, 25% в NEJM 2024!)
  p3: 'cmd', // PCI* = 0.37 — минимальный порог, пациент слышит речь!
};

const STORAGE_KEY = 'noesis_v10_state_v2';
const SCHEMA_VERSION = 2;

export interface ExplorerState {
  // Акт I — Иллюзия Муни + Гл. 01 «Что такое сознание?»
  mooneyGuess: MooneyGuess;
  mooneyExposed: boolean;
  mooneySeconds: number | null;
  ch1Explored: boolean;
  // Legacy v9 fields preserved until coordinator removes unused old chapter files
  prologueExplored: boolean;
  cerebellumTested: boolean;
  hepTested: boolean;
  // Акт II — Комната Мэри + Афантазия + Flash-Lag (legacy sperling fields kept for tsc compatibility)
  maryBet: MaryBet;
  aphantasiaScore: number | null;
  sperlingWholeScore: number | null;
  sperlingCuedScore: number | null;
  flashLagCompleted: boolean;
  // Акт II / III — Сдвиг кальки («Три пальца») + Расколотый штурвал
  vellumTriggered: boolean;
  splitBrainCut: boolean;
  splitBrainEverCut: boolean;
  splitBrainCard: SplitBrainCard;
  // Акт III — Большое пари + COGITATE 2025 + Проигрыватель
  wagerUnsealed: boolean;
  cogitateBet: CogitateBet;
  turntableMode: TurntableMode;
  nremExperienced: boolean;
  remExperienced: boolean;
  propofolExperienced: boolean;
  // Акт IV — Реанимация + Красная закладка NY 2024 + Позиция по ИИ
  icuDiagnoses: Partial<Record<'p1' | 'p2' | 'p3', IcuVerdict>>;
  ribbonBoundaryIndex: number;
  ribbonChecked: boolean;
  aiVerdict: AiVerdict;
  tribunalModules: Record<string, boolean>;
  // Навигация и архив v10
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
  isPolemic?: boolean;
}

interface ExplorerContextValue {
  state: ExplorerState;
  setMooneyGuess: (guess: Exclude<MooneyGuess, null>) => void;
  setMooneyResult: (seconds: number) => void;
  setCh1Explored: (v: boolean) => void;
  setPrologueExplored: (v: boolean) => void;
  setCerebellumTested: (v: boolean) => void;
  setHepTested: (v: boolean) => void;
  setMaryBet: (bet: Exclude<MaryBet, null>) => void;
  setAphantasiaScore: (score: number) => void;
  setSperlingResult: (whole: number | null, cued: number | null) => void;
  setFlashLagCompleted: (v: boolean) => void;
  setSplitBrainCut: (cut: boolean) => void;
  setSplitBrainCard: (card: Exclude<SplitBrainCard, null>) => void;
  setVellumTriggered: (v: boolean) => void;
  setWagerUnsealed: (v: boolean) => void;
  setCogitateBet: (bet: Exclude<CogitateBet, null>) => void;
  setTurntableMode: (mode: TurntableMode) => void;
  setIcuDiagnosis: (patientId: 'p1' | 'p2' | 'p3', verdict: IcuVerdict) => void;
  setRibbonBoundaryIndex: (idx: number) => void;
  setRibbonChecked: (v: boolean) => void;
  setAiVerdict: (verdict: Exclude<AiVerdict, null>) => void;
  toggleTribunalModule: (moduleId: string) => void;
  setTribunalModules: (modules: Record<string, boolean>) => void;
  markActVisited: (actId: ActId) => void;
  markDossierRead: (dossierId: string) => void;
  resetAllState: () => void;
  icuStats: { attempted: number; correct: number; total: number };
  activeTribunalCount: number;
  completedCount: number;
  totalExperiments: number;
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
  ch1Explored: false,
  prologueExplored: false,
  cerebellumTested: false,
  hepTested: false,
  maryBet: null,
  aphantasiaScore: null,
  sperlingWholeScore: null,
  sperlingCuedScore: null,
  flashLagCompleted: false,
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
  aiVerdict: null,
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
  for (const k of ['act-1', 'act-2', 'act-3', 'act-4']) {
    if (rawActs[k] === true) visitedActs[k] = true;
  }

  const dossiersRead = Array.isArray(d.dossiersRead)
    ? d.dossiersRead.filter((x): x is string => typeof x === 'string' && x.length < 64).slice(0, 32)
    : [];

  const ribbonIdx =
    typeof d.ribbonBoundaryIndex === 'number' && Number.isFinite(d.ribbonBoundaryIndex)
      ? Math.max(0, Math.min(5, Math.round(d.ribbonBoundaryIndex)))
      : 3;

  const aphScore =
    typeof d.aphantasiaScore === 'number' && Number.isFinite(d.aphantasiaScore)
      ? Math.max(0, Math.min(5, Math.round(d.aphantasiaScore)))
      : null;
  const spWhole =
    typeof d.sperlingWholeScore === 'number' && Number.isFinite(d.sperlingWholeScore)
      ? Math.max(0, Math.min(12, Math.round(d.sperlingWholeScore)))
      : null;
  const spCued =
    typeof d.sperlingCuedScore === 'number' && Number.isFinite(d.sperlingCuedScore)
      ? Math.max(0, Math.min(4, Math.round(d.sperlingCuedScore)))
      : null;

  const validAiVerdict: AiVerdict =
    d.aiVerdict === 'biology' ||
    d.aiVerdict === 'robot' ||
    d.aiVerdict === 'agent' ||
    d.aiVerdict === 'llm' ||
    d.aiVerdict === 'undecided'
      ? d.aiVerdict
      : null;

  return {
    mooneyGuess: validGuess,
    mooneyExposed: d.mooneyExposed === true,
    mooneySeconds:
      typeof d.mooneySeconds === 'number' && Number.isFinite(d.mooneySeconds) && d.mooneySeconds >= 0
        ? Number(d.mooneySeconds.toFixed(1))
        : null,
    ch1Explored: d.ch1Explored === true,
    prologueExplored: d.prologueExplored === true,
    cerebellumTested: d.cerebellumTested === true,
    hepTested: d.hepTested === true,
    maryBet: validMary,
    aphantasiaScore: aphScore,
    sperlingWholeScore: spWhole,
    sperlingCuedScore: spCued,
    flashLagCompleted: d.flashLagCompleted === true,
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
    aiVerdict: validAiVerdict,
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

  const setCh1Explored = useCallback(
    (ch1Explored: boolean) => setState((prev) => ({ ...prev, ch1Explored })),
    [],
  );

  const setPrologueExplored = useCallback(
    (prologueExplored: boolean) => setState((prev) => ({ ...prev, prologueExplored })),
    [],
  );

  const setCerebellumTested = useCallback(
    (cerebellumTested: boolean) => setState((prev) => ({ ...prev, cerebellumTested })),
    [],
  );

  const setHepTested = useCallback(
    (hepTested: boolean) => setState((prev) => ({ ...prev, hepTested })),
    [],
  );

  const setMaryBet = useCallback(
    (maryBet: Exclude<MaryBet, null>) => setState((prev) => ({ ...prev, maryBet })),
    [],
  );

  const setAphantasiaScore = useCallback(
    (score: number) =>
      setState((prev) => ({
        ...prev,
        aphantasiaScore: Math.max(0, Math.min(5, Math.round(score))),
      })),
    [],
  );

  const setSperlingResult = useCallback(
    (whole: number | null, cued: number | null) =>
      setState((prev) => ({
        ...prev,
        sperlingWholeScore: whole !== null ? Math.max(0, Math.min(12, Math.round(whole))) : prev.sperlingWholeScore,
        sperlingCuedScore: cued !== null ? Math.max(0, Math.min(4, Math.round(cued))) : prev.sperlingCuedScore,
      })),
    [],
  );

  const setFlashLagCompleted = useCallback(
    (flashLagCompleted: boolean) => setState((prev) => ({ ...prev, flashLagCompleted })),
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

  const setAiVerdict = useCallback(
    (aiVerdict: Exclude<AiVerdict, null>) => setState((prev) => ({ ...prev, aiVerdict })),
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
      'ch-01': state.ch1Explored,
      'ch-1': state.maryBet !== null || state.aphantasiaScore !== null,
      'ch-aphantasia': state.aphantasiaScore !== null,
      'ch-3': state.vellumTriggered || state.flashLagCompleted,
      'ch-2': state.splitBrainEverCut,
      'ch-4': state.cogitateBet !== null,
      'ch-5': state.remExperienced || state.propofolExperienced || state.nremExperienced,
      'ch-6': icuStats.attempted === 3,
      'ch-7': state.ribbonChecked || state.aiVerdict !== null,
      'ch-8': true,
      // Legacy aliases preserved for un-deleted files before coordinator cleanup
      prologue: state.prologueExplored,
      'ch-cerebellum': state.cerebellumTested,
      'ch-homunculus': state.hepTested,
      'ch-overflow': state.flashLagCompleted,
    }),
    [state, icuStats.attempted, activeTribunalCount],
  );

  const EXPERIMENT_KEYS = useMemo(
    () => [
      'plate-00',
      'ch-01',
      'ch-1',
      'ch-3',
      'ch-2',
      'ch-4',
      'ch-5',
      'ch-6',
      'ch-7',
    ],
    [],
  );

  const totalExperiments = EXPERIMENT_KEYS.length;

  const completedCount = useMemo(
    () => EXPERIMENT_KEYS.filter((k) => completedChapters[k]).length,
    [EXPERIMENT_KEYS, completedChapters],
  );

  // Strict precondition-masked Consistency Engine (4-Act v10 layout)
  const consistency = useMemo<ConsistencyVerdict>(() => {
    if (completedCount < 3) {
      return {
        author: 'seth',
        stampTitle: 'НЕЗАПОЛНЕННЫЙ ПРОТОКОЛ',
        stampSubtitle: `Пройдено ${completedCount} из ${totalExperiments} глав`,
        commentary:
          'Вы прошли меньше трёх ключевых этапов. Чтобы редакция смогла проверить ваши интуиции на противоречие, сделайте ставки в Комнате Мэри (Акт II), в пари COGITATE (Акт III) и в Акте IV.',
        isContradiction: false,
        isIncomplete: true,
      };
    }

    const choseSilicon =
      state.aiVerdict === 'robot' || state.aiVerdict === 'agent' || state.aiVerdict === 'llm';

    if (state.maryBet === 'learns_new' && choseSilicon) {
      return {
        author: 'dennett',
        stampTitle: 'ШПИЛЬКА Д. ДЕННЕТА',
        stampSubtitle: 'Полемическая заметка на полях',
        commentary:
          'Любопытный союз! В Акте II вы решили, что физика не объясняет красный цвет Мэри — а в Акте IV допустили субъективный опыт у кремниевой системы. Сам Чалмерс защищает обе позиции сразу, но мне всё равно кажется, что вы незаметно сдали квалиа вычислительной архитектуре.',
        isContradiction: false,
        isPolemic: true,
      };
    }

    if (state.maryBet === 'knows_all' && state.ribbonChecked && state.ribbonBoundaryIndex >= 4) {
      return {
        author: 'chalmers',
        stampTitle: 'БИОЛОГИЧЕСКИЙ ШОВИНИЗМ',
        stampSubtitle: 'Замечание Д. Чалмерса',
        commentary:
          'Любопытный парадокс: вы отмахнулись от загадки Мэри как от «просто обработки данных», но красной закладкой в Акте IV отсекли пчёл и осьминогов, оставив сознание узкому клубу с человеческой корой.',
        isContradiction: true,
      };
    }

    const missingAnchors: string[] = [];
    if (state.maryBet === null) missingAnchors.push('Комната Мэри (Акт II)');
    if (state.cogitateBet === null) missingAnchors.push('пари COGITATE (Акт III)');
    if (!state.ribbonChecked) missingAnchors.push('красная закладка NY 2024 (Акт IV)');
    if (state.aiVerdict === null) missingAnchors.push('позиция по ИИ (Акт IV)');

    if (missingAnchors.length > 0) {
      return {
        author: 'seth',
        stampTitle: 'ЧАСТИЧНЫЙ ПРОТОКОЛ',
        stampSubtitle: `Не хватает опоры: ${missingAnchors.length} из 4`,
        commentary: `Чтобы честно сверить вашу философию на непротиворечивость, не хватает ставки в разделах: ${missingAnchors.join(', ')}. Сейчас явных противоречий нет, но часть ключевых вопросов осталась без ответа.`,
        isContradiction: false,
        isIncomplete: true,
      };
    }

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

    return {
      author: 'seth',
      stampTitle: 'СТРОГАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ',
      stampSubtitle: 'Редкий штамп редакции NOESIS',
      commentary:
        'Ваши ответы в Комнате Мэри, пари COGITATE и в разборе ИИ не поспорили друг с другом. Остался последний экзамен — переверните хлопковую карточку и проверьте собственный мозг.',
      isContradiction: false,
    };
  }, [
    completedCount,
    totalExperiments,
    state.maryBet,
    state.cogitateBet,
    state.ribbonChecked,
    state.ribbonBoundaryIndex,
    state.aiVerdict,
  ]);

  const value = useMemo<ExplorerContextValue>(
    () => ({
      state,
      setMooneyGuess,
      setMooneyResult,
      setCh1Explored,
      setPrologueExplored,
      setCerebellumTested,
      setHepTested,
      setMaryBet,
      setAphantasiaScore,
      setSperlingResult,
      setFlashLagCompleted,
      setSplitBrainCut,
      setSplitBrainCard,
      setVellumTriggered,
      setWagerUnsealed,
      setCogitateBet,
      setTurntableMode,
      setIcuDiagnosis,
      setRibbonBoundaryIndex,
      setRibbonChecked,
      setAiVerdict,
      toggleTribunalModule,
      setTribunalModules,
      markActVisited,
      markDossierRead,
      resetAllState,
      icuStats,
      activeTribunalCount,
      completedCount,
      totalExperiments,
      consistency,
      completedChapters,
    }),
    [
      state,
      setMooneyGuess,
      setMooneyResult,
      setCh1Explored,
      setPrologueExplored,
      setCerebellumTested,
      setHepTested,
      setMaryBet,
      setAphantasiaScore,
      setSperlingResult,
      setFlashLagCompleted,
      setSplitBrainCut,
      setSplitBrainCard,
      setVellumTriggered,
      setWagerUnsealed,
      setCogitateBet,
      setTurntableMode,
      setIcuDiagnosis,
      setRibbonBoundaryIndex,
      setRibbonChecked,
      setAiVerdict,
      toggleTribunalModule,
      setTribunalModules,
      markActVisited,
      markDossierRead,
      resetAllState,
      icuStats,
      activeTribunalCount,
      completedCount,
      totalExperiments,
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
