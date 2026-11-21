import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, EyeOff, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useExplorer } from '../../v7/context/ExplorerContext';
import { NoesisInstrumentFrame } from '../components/NoesisInstrumentFrame';
import { DossierTrigger } from '../components/NoesisDossierSheet';
import { usePsychophysicsClock } from '../hooks/usePsychophysicsClock';
import { useViewportRaf } from '../hooks/useViewportRaf';
import {
  drawSwissGrid,
  releaseCanvasMemory,
  resizeHiDpiCanvas,
} from '../canvas/noesisCanvasKit';
import { ruTypo } from '../utils/ruTypo';

// 20 unmistakable Cyrillic consonants for Sperling (zero ambiguous vowels/signs!)
const CONSONANTS = [
  'Б',
  'В',
  'Г',
  'Д',
  'Ж',
  'З',
  'К',
  'Л',
  'М',
  'Н',
  'П',
  'Р',
  'С',
  'Т',
  'Ф',
  'Х',
  'Ц',
  'Ч',
  'Ш',
  'Щ',
] as const;

// Physical QWERTY -> ЙЦУКЕН mapping so desktop keyboards work seamlessly regardless of layout!
const KEY_TO_CYRILLIC: Record<string, string> = {
  ',': 'Б',
  d: 'В',
  u: 'Г',
  l: 'Д',
  ';': 'Ж',
  p: 'З',
  r: 'К',
  k: 'Л',
  v: 'М',
  y: 'Н',
  g: 'П',
  h: 'Р',
  c: 'С',
  n: 'Т',
  a: 'Ф',
  '[': 'Х',
  w: 'Ц',
  x: 'Ч',
  i: 'Ш',
  o: 'Щ',
  б: 'Б',
  в: 'В',
  г: 'Г',
  д: 'Д',
  ж: 'Ж',
  з: 'З',
  к: 'К',
  л: 'Л',
  м: 'М',
  н: 'Н',
  п: 'П',
  р: 'Р',
  с: 'С',
  т: 'Т',
  ф: 'Ф',
  х: 'Х',
  ц: 'Ц',
  ч: 'Ч',
  ш: 'Ш',
  щ: 'Щ',
};

function generateGrid12(): string[][] {
  const pool = [...CONSONANTS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [pool.slice(0, 4), pool.slice(4, 8), pool.slice(8, 12)];
}

type SperlingPhase = 'idle' | 'fixation' | 'flash' | 'recall' | 'result';
type SperlingMode = 'whole' | 'partial';

type TnPathway = 'conscious' | 'navigation' | 'amygdala';
type FlashLagMode = 'continuous' | 'terminated' | 'reversal';

const TN_OBSTACLES = [
  { x: 78, y: 26, w: 26, h: 30 },
  { x: 132, y: 86, w: 30, h: 28 },
  { x: 192, y: 24, w: 28, h: 34 },
  { x: 248, y: 86, w: 28, h: 30 },
  { x: 306, y: 26, w: 26, h: 32 },
  { x: 356, y: 84, w: 24, h: 30 },
] as const;

// Shared guaranteed collision-free trajectory (>24 px clearance from all 6 boxes!)
const TN_WAYPOINTS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 36, y: 76 },
  { x: 91, y: 96 },
  { x: 147, y: 48 },
  { x: 206, y: 96 },
  { x: 262, y: 48 },
  { x: 319, y: 96 },
  { x: 368, y: 48 },
  { x: 396, y: 68 },
];

const TN_SVG_POINTS = TN_WAYPOINTS.map((p) => `${p.x},${p.y}`).join(' ');

function sampleTnPath(progress: number): { x: number; y: number; headingDeg: number } {
  const segLengths: number[] = [];
  let total = 0;
  for (let i = 0; i < TN_WAYPOINTS.length - 1; i += 1) {
    const dx = TN_WAYPOINTS[i + 1].x - TN_WAYPOINTS[i].x;
    const dy = TN_WAYPOINTS[i + 1].y - TN_WAYPOINTS[i].y;
    const len = Math.hypot(dx, dy);
    segLengths.push(len);
    total += len;
  }
  const target = Math.max(0, Math.min(1, progress)) * total;
  let acc = 0;
  for (let i = 0; i < segLengths.length; i += 1) {
    const len = segLengths[i];
    if (acc + len >= target || i === segLengths.length - 1) {
      const f = len > 0 ? Math.max(0, Math.min(1, (target - acc) / len)) : 0;
      const a = TN_WAYPOINTS[i];
      const b = TN_WAYPOINTS[i + 1];
      return {
        x: a.x + (b.x - a.x) * f,
        y: a.y + (b.y - a.y) * f,
        headingDeg: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
      };
    }
    acc += len;
  }
  const last = TN_WAYPOINTS[TN_WAYPOINTS.length - 1];
  return { x: last.x, y: last.y, headingDeg: 0 };
}

/**
 * ACT II · CHAPTER II.3: "Переполнение, Слепозрение и Монтаж времени"
 * 3 Signature Scientific Labs:
 * 1. Instrument 05 (● ОПЫТ НА ТЕБЕ): VSync-calibrated Sperling Flash (100-116ms, 700ms fixation, 16 Cyrillic tap tiles + QWERTY->ЙЦУКЕН).
 * 2. Instrument 06 (○ РЕКОНСТРУКЦИЯ): Dual-Screen Corridor of Patient TN (V1 blind darkness vs real obstacle-avoiding trajectory + 3 active pathways).
 * 3. Instrument 07 (● ОПЫТ НА ТЕБЕ): 3-Mode Eagleman Flash-Lag (Science 2000) + Freeze-Frame t = 0 ms + Chronostasis (Yarrow 2001).
 */
export function Act2OverflowBlindsightTime() {
  const { state, setSperlingResult, setFlashLagCompleted } = useExplorer();
  const { metrics, calibrate } = usePsychophysicsClock();

  // === INSTRUMENT 05: SPERLING FLASH ===
  const [spMode, setSpMode] = useState<SperlingMode>('whole');
  const [spPhase, setSpPhase] = useState<SperlingPhase>('idle');
  const [spGrid, setSpGrid] = useState<string[][]>(() => [
    ['Б', 'К', 'М', 'Т'],
    ['В', 'Р', 'З', 'П'],
    ['Г', 'С', 'Л', 'Х'],
  ]);
  const [cuedRow, setCuedRow] = useState<number>(1);
  const [pickedLetters, setPickedLetters] = useState<string[]>([]);
  const [lastFlashMs, setLastFlashMs] = useState<number>(108);
  const [droppedFrameWarning, setDroppedFrameWarning] = useState(false);
  const [lastScore, setLastScore] = useState<{
    hits: number;
    misses: number;
    netHits: number;
    max: number;
  } | null>(null);
  const spTimersRef = useRef<number[]>([]);
  const spRafRef = useRef<number | null>(null);
  const trialRunIdRef = useRef<number>(0);

  const clearSpTimers = useCallback(() => {
    trialRunIdRef.current += 1;
    spTimersRef.current.forEach((id) => window.clearTimeout(id));
    spTimersRef.current = [];
    if (spRafRef.current !== null) {
      cancelAnimationFrame(spRafRef.current);
      spRafRef.current = null;
    }
  }, []);

  useEffect(() => clearSpTimers, [clearSpTimers]);

  const startSperlingTrial = async (mode: SperlingMode) => {
    clearSpTimers();
    const runId = trialRunIdRef.current;
    setSpMode(mode);
    setPickedLetters([]);
    setLastScore(null);
    setDroppedFrameWarning(false);

    const grid = generateGrid12();
    const row = Math.floor(Math.random() * 3);
    setSpGrid(grid);
    setCuedRow(row);
    setSpPhase('fixation');

    // Calibrate VSync once silently; quantize directly from fresh cal.frameMs (zero stale closure!)
    const cal = metrics.calibrated ? metrics : await calibrate();
    if (trialRunIdRef.current !== runId) return;

    const frameMs = cal.frameMs || 16.67;
    const quantizedMs = Math.round(Math.max(1, Math.round(108 / frameMs)) * frameMs);
    const targetDuration = cal.calibrated ? Math.max(96, Math.min(125, quantizedMs)) : 108;

    const tFix = window.setTimeout(() => {
      if (trialRunIdRef.current !== runId) return;
      const flashStart = performance.now();
      setSpPhase('flash');

      // Use nested rAF loop anchored to performance.now() so exact display exposure is measured!
      let prevTs = flashStart;
      let hadStutter = false;
      const watchFlash = (now: number) => {
        if (trialRunIdRef.current !== runId) return;
        if (now - prevTs > 46) hadStutter = true;
        prevTs = now;
        if (now - flashStart >= targetDuration) {
          spRafRef.current = null;
          setLastFlashMs(Math.round(now - flashStart));
          setDroppedFrameWarning(hadStutter);
          setSpPhase('recall');
        } else {
          spRafRef.current = requestAnimationFrame(watchFlash);
        }
      };
      spRafRef.current = requestAnimationFrame(watchFlash);
    }, 680);

    spTimersRef.current.push(tFix);
  };

  const maxPick = spMode === 'whole' ? 12 : 4;

  const toggleLetter = useCallback(
    (ch: string) => {
      if (spPhase !== 'recall') return;
      setPickedLetters((prev) => {
        if (prev.includes(ch)) return prev.filter((x) => x !== ch);
        if (prev.length >= maxPick) return prev;
        return [...prev, ch];
      });
    },
    [spPhase, maxPick],
  );

  const submitSperlingRecall = useCallback(() => {
    if (pickedLetters.length === 0) return;
    const targetSet = new Set(spMode === 'whole' ? spGrid.flat() : spGrid[cuedRow]);
    const hits = pickedLetters.filter((l) => targetSet.has(l)).length;
    const misses = pickedLetters.length - hits;
    const netHits = Math.max(0, hits - misses);
    const max = spMode === 'whole' ? 12 : 4;
    setLastScore({ hits, misses, netHits, max });
    setSpPhase('result');
    if (spMode === 'whole') setSperlingResult(netHits, null);
    else setSperlingResult(null, netHits);
  }, [pickedLetters, spMode, spGrid, cuedRow, setSperlingResult]);

  // Seamless desktop keyboard support (QWERTY -> ЙЦУКЕН + Backspace + Enter!)
  useEffect(() => {
    if (spPhase !== 'recall') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const mapped = KEY_TO_CYRILLIC[e.key.toLowerCase()];
      if (mapped) {
        e.preventDefault();
        toggleLetter(mapped);
      } else if (e.key === 'Backspace') {
        setPickedLetters((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter' && pickedLetters.length > 0) {
        e.preventDefault();
        submitSperlingRecall();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spPhase, toggleLetter, pickedLetters.length, submitSperlingRecall]);

  // === INSTRUMENT 06: BLINDSIGHT TN CORRIDOR / PEGNA 2005 ===
  const [tnPathway, setTnPathway] = useState<TnPathway>('navigation');
  const [tnProgress, setTnProgress] = useState<number>(0.18);
  const tnProgressRef = useRef<number>(0.18);
  const [tnWalking, setTnWalking] = useState<boolean>(false);
  const [tnFearStimulus, setTnFearStimulus] = useState<'fear' | 'neutral'>('fear');
  const tnWrapRef = useRef<HTMLDivElement | null>(null);

  const handleSelectTnPathway = (next: TnPathway) => {
    setTnPathway(next);
    if (next !== 'navigation') {
      setTnWalking(false);
    }
  };

  const stepTnWalk = useCallback((_nowMs: number, dtMs: number) => {
    const next = tnProgressRef.current + dtMs * 0.00018;
    if (next >= 1) {
      tnProgressRef.current = 1;
      setTnProgress(1);
      setTnWalking(false);
    } else {
      tnProgressRef.current = next;
      setTnProgress(next);
    }
  }, []);

  useViewportRaf(tnWrapRef, stepTnWalk, { enabled: tnWalking });

  // Single source of truth: exact position & heading on collision-free TN_WAYPOINTS!
  const tnPos = sampleTnPath(tnProgress);

  // === INSTRUMENT 07: FLASH-LAG POSTDICTION (EAGLEMAN, SCIENCE 2000) ===
  const [flMode, setFlMode] = useState<FlashLagMode>('continuous');
  const [flFrozen, setFlFrozen] = useState(false);
  const [flTriedModes, setFlTriedModes] = useState<Record<string, boolean>>({ continuous: true });
  const flWrapRef = useRef<HTMLDivElement | null>(null);
  const flCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const flStateRef = useRef({
    mode: flMode,
    frozen: flFrozen,
    cycleStartMs: 0,
  });
  flStateRef.current.mode = flMode;
  flStateRef.current.frozen = flFrozen;

  const handleSelectFlMode = (next: FlashLagMode) => {
    setFlMode(next);
    setFlFrozen(false);
    flStateRef.current.cycleStartMs = performance.now();
    setFlTriedModes((prev) => {
      const updated = { ...prev, [next]: true };
      if (Object.keys(updated).length >= 2) setFlashLagCompleted(true);
      return updated;
    });
  };

  const drawFlashLag = useCallback((nowMs: number) => {
    const canvas = flCanvasRef.current;
    const box = flWrapRef.current;
    if (!canvas || !box) return;

    const { ctx, width, height } = resizeHiDpiCanvas(canvas, box.clientWidth, box.clientHeight);
    if (!ctx) return;

    const { mode, frozen } = flStateRef.current;
    if (!flStateRef.current.cycleStartMs) flStateRef.current.cycleStartMs = nowMs;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#111419';
    ctx.fillRect(0, 0, width, height);
    drawSwissGrid(ctx, width, height, 28, true);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width * 0.36, height * 0.36, 92);

    // Cycle duration 1.9s; exact geometric flash occurs at t = 0.95s (angle = -PI/2, straight UP 12 o'clock!)
    const cycleSec = 1.9;
    const tInCycle = frozen ? cycleSec * 0.5 : ((nowMs - flStateRef.current.cycleStartMs) / 1000) % cycleSec;
    const dtFlash = tInCycle - cycleSec * 0.5; // -0.95s .. +0.95s; 0.000s = EXACT FLASH INSTANT!

    const omega = (Math.PI * 2) / cycleSec; // Exact 2π rad per cycle -> 100% seamless loop in Mode 1!
    let angle = -Math.PI / 2;
    let showBar = true;
    if (mode === 'continuous') {
      angle = -Math.PI / 2 + dtFlash * omega;
    } else if (mode === 'terminated') {
      // Eagleman & Sejnowski (Science 2000) Flash-Terminated: bar disappears right after the ~48ms flash!
      angle = dtFlash <= 0 ? -Math.PI / 2 + dtFlash * omega : -Math.PI / 2;
      showBar = frozen || dtFlash <= 0.024;
    } else {
      // Flash-Reversal: clockwise sweep up to flash, reverses briefly after flash, then vanishes until next 6 o'clock sweep
      angle = dtFlash <= 0 ? -Math.PI / 2 + dtFlash * omega : -Math.PI / 2 - dtFlash * omega;
      showBar = frozen || dtFlash <= 0.45;
    }

    // Subtle circular orbit track
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 249, 245, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Central fixation cross (+)
    ctx.strokeStyle = 'rgba(250, 249, 245, 0.65)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy);
    ctx.lineTo(cx + 7, cy);
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx, cy + 7);
    ctx.stroke();

    // Moving white optical bar (inner spoke)
    if (showBar) {
      const barX1 = cx + Math.cos(angle) * (radius * 0.36);
      const barY1 = cy + Math.sin(angle) * (radius * 0.36);
      const barX2 = cx + Math.cos(angle) * (radius * 0.92);
      const barY2 = cy + Math.sin(angle) * (radius * 0.92);
      ctx.strokeStyle = '#FAF9F5';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(barX1, barY1);
      ctx.lineTo(barX2, barY2);
      ctx.stroke();
    }

    // Exact ~48ms (~50ms) crimson alignment flash at 12 o'clock (outer extension of the EXACT SAME radius!)
    const flashOn = frozen || Math.abs(dtFlash) <= 0.024;
    if (flashOn) {
      ctx.strokeStyle = '#FC4109';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 1.04);
      ctx.lineTo(cx, cy - radius * 1.32);
      ctx.stroke();
    }

    // When frozen at t = 0 ms, draw razor-sharp 1px vertical Swiss alignment hairline proving Δ = 0.0°!
    if (frozen) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(Math.round(cx) + 0.5, 16);
      ctx.lineTo(Math.round(cx) + 0.5, height - 16);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }, []);

  useViewportRaf(flWrapRef, drawFlashLag, { enabled: true });

  useEffect(() => {
    const c = flCanvasRef.current;
    return () => releaseCanvasMemory(c);
  }, []);

  const sperlingExtrapolated =
    state.sperlingCuedScore !== null ? state.sperlingCuedScore * 3 : null;

  return (
    <section
      id="ch-overflow"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Глава II.3 — Переполнение, Слепозрение и Монтаж времени"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 space-y-20">
        {/* Folio Header */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
            <span className="text-[#FC4109] font-semibold">АКТ II · ГЛАВА II.3 · ТЕАТР, КОТОРОГО НЕТ</span>
            <span>СПЕРЛИНГ · СЛЕПОЗРЕНИЕ · ВРЕМЯ · стр. 36</span>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <h2 className="text-[clamp(32px,4.4vw,56px)] leading-[1.06] tracking-[-0.03em]">
                <span className="font-display font-bold block">Три трещины</span>
                <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                  в иллюзии «прямого эфира».
                </span>
              </h2>
            </div>
            <div className="lg:col-span-5 text-[15.5px] leading-[1.64] text-[#353431]">
              <p>
                {ruTypo(
                  'Нам кажется, что сознание — это честный экран: что на нём есть, то мы и можем назвать; без экрана мы беспомощны; а всё на нём происходит «прямо сейчас». Три коротких опыта ниже разрушают все три иллюзии.',
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            LAB 1 (INSTRUMENT 05): VSYNC SPERLING FLASH (NED BLOCK: P vs A!)
           =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
              01 · ПЕРЕПОЛНЕНИЕ ОПЫТА (ДЖ. СПЕРЛИНГ 1960 · НЕД БЛОК)
            </div>
            <h3 className="font-serif-editorial text-[26px] md:text-[32px] leading-[1.14]">
              {ruTypo('Вы видите больше, чем успевает схватить ваша память')}
            </h3>
            <p className="text-[14.5px] leading-[1.66] text-[#3B3A37]">
              {ruTypo(
                'Философ Нед Блок разделяет два вида сознания: богатое внутреннее полотно переживаний (P-сознание) и узкое горлышко рабочего отчёта, из которого мы можем что-то назвать вслух (A-сознание).',
              )}
            </p>
            <p className="text-[14.5px] leading-[1.66] text-[#4B4A46]">
              {ruTypo(
                'Сначала запустите «Полный отчёт» — сетка из 12 согласных мелькнёт на ~110 мс, и вы назовёте лишь 3–5 букв. Затем запустите «Частичный отчёт»: красная стрелка укажет строку уже ПОСЛЕ исчезновения букв — и вы внезапно прочтёте 3–4 буквы из 4!',
              )}
            </p>

            {(state.sperlingWholeScore !== null || state.sperlingCuedScore !== null) && (
              <div className="p-4 rounded-xl bg-[#F3F1E9] border border-[#141413]/12 font-mono-tech text-[11px] space-y-1.5">
                <div className="text-[#004EDF] font-semibold uppercase tracking-[0.11em]">
                  ВАШ РЕЗУЛЬТАТ СПЕРЛИНГА:
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5E5D59]">Полный отчёт (A-память):</span>
                  <strong className="text-[#141413]">
                    {state.sperlingWholeScore !== null ? `${state.sperlingWholeScore} / 12` : '—'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5E5D59]">По стрелке (P-переполнение):</span>
                  <strong className="text-[#FC4109]">
                    {state.sperlingCuedScore !== null
                      ? `${state.sperlingCuedScore} / 4 (≈ ${sperlingExtrapolated} из 12 были в кадре!)`
                      : '—'}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <NoesisInstrumentFrame
              code="ПРИБОР II.3 · ТАХИСТОСКОП СПЕРЛИНГА"
              badge="self-test"
              telemetry={`ЭКРАН ${metrics.hz} ГЦ · ~${lastFlashMs} МС`}
              surface="darkroom"
              footnote="Работает без звука и без мобильной клавиатуры · клавиши ЙЦУКЕН и QWERTY также активны"
            >
              <div className="space-y-5">
                {/* Mode launch buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => startSperlingTrial('whole')}
                    className={`v6-pill h-9 px-4 rounded-full text-[12.5px] font-medium border cursor-pointer ${
                      spMode === 'whole' && spPhase !== 'idle'
                        ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5]'
                        : 'bg-[#191E28] hover:bg-[#232A38] text-[#FAF9F5] border-[#FAF9F5]/18'
                    }`}
                  >
                    1. Полный отчёт (все 12 букв)
                  </button>
                  <button
                    type="button"
                    onClick={() => startSperlingTrial('partial')}
                    className={`v6-pill h-9 px-4 rounded-full text-[12.5px] font-medium border cursor-pointer ${
                      spMode === 'partial' && spPhase !== 'idle'
                        ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109]'
                        : 'bg-[#FC4109]/16 hover:bg-[#FC4109]/28 text-[#FF9B7D] border-[#FC4109]/40'
                    }`}
                  >
                    2. Частичный отчёт (1 строка по стрелке →)
                  </button>
                </div>

                {/* Darkroom Exposure Viewport (strictly <= 280px visual angle width!) */}
                <div className="relative h-[168px] rounded-xl bg-[#090B0E] border border-[#FAF9F5]/12 flex items-center justify-center overflow-hidden">
                  {spPhase === 'idle' && (
                    <div className="text-center px-6 space-y-1.5">
                      <div className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#9AA3B2]">
                        СМОТРИТЕ В ЦЕНТР КАМЕРЫ
                      </div>
                      <p className="text-[13px] text-[#7D8796]">
                        Нажмите кнопку выше: сначала появится крест фиксации (+), затем на десятую долю секунды вспыхнут 12 букв.
                      </p>
                    </div>
                  )}

                  {spPhase === 'fixation' && (
                    <div className="font-mono-tech text-[32px] font-light text-[#FAF9F5]/85 select-none">
                      +
                    </div>
                  )}

                  {spPhase === 'flash' && (
                    <div className="w-[244px] space-y-2.5 select-none">
                      {spGrid.map((row, rIdx) => (
                        <div
                          key={rIdx}
                          className="h-9 grid grid-cols-4 items-center text-center font-mono-tech text-[26px] font-bold tracking-[0.06em] text-[#FAF9F5]"
                        >
                          {row.map((ch, cIdx) => (
                            <span key={`${ch}-${cIdx}`}>{ch}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {spPhase === 'recall' && (
                    <div className="w-[244px] space-y-2.5">
                      {spMode === 'partial' ? (
                        [0, 1, 2].map((rIdx) => {
                          const isCue = rIdx === cuedRow;
                          return (
                            <div
                              key={rIdx}
                              className={`relative h-9 rounded-lg grid grid-cols-4 items-center text-center font-mono-tech ${
                                isCue
                                  ? 'bg-[#FC4109]/18 border border-[#FC4109] text-[#FAF9F5]'
                                  : 'bg-[#FAF9F5]/[0.03] border border-[#FAF9F5]/8 text-[#64748B]/45'
                              }`}
                            >
                              {isCue && (
                                <span
                                  className="absolute -left-6 text-[#FC4109] text-[15px] font-bold"
                                  aria-hidden="true"
                                >
                                  ▶
                                </span>
                              )}
                              {[0, 1, 2, 3].map((slot) => (
                                <span
                                  key={slot}
                                  className={
                                    isCue
                                      ? pickedLetters[slot]
                                        ? 'text-[20px] font-bold text-[#FAF9F5]'
                                        : 'text-[16px] text-[#FC4109]/70'
                                      : 'text-[12px]'
                                  }
                                >
                                  {isCue ? pickedLetters[slot] || '•' : '·'}
                                </span>
                              ))}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center space-y-2">
                          <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#9AA3B2]">
                            ОТМЕТЬТЕ НИЖЕ ВСЕ БУКВЫ, КОТОРЫЕ УСПЕЛИ УВИДЕТЬ
                          </div>
                          <div className="font-mono-tech text-[19px] tracking-[0.2em] text-[#34D399] min-h-[28px]">
                            {pickedLetters.join(' ') || '—'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {spPhase === 'result' && lastScore && (
                    <div className="w-full px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="w-[210px] grid grid-cols-4 gap-y-1.5 gap-x-3 text-center font-mono-tech text-[18px] font-bold">
                        {spGrid.map((row, rIdx) =>
                          row.map((ch, cIdx) => {
                            const isTargetRow = spMode === 'whole' || rIdx === cuedRow;
                            const hit = pickedLetters.includes(ch) && isTargetRow;
                            return (
                              <span
                                key={`${rIdx}-${cIdx}`}
                                className={
                                  hit
                                    ? 'text-[#34D399]'
                                    : isTargetRow
                                      ? 'text-[#FAF9F5]'
                                      : 'text-[#FAF9F5]/24'
                                }
                              >
                                {ch}
                              </span>
                            );
                          }),
                        )}
                      </div>

                      <div className="text-left space-y-1.5 flex-1">
                        <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FC4109]">
                          {spMode === 'whole' ? 'ПОЛНЫЙ ОТЧЁТ' : `СТРОКА ${cuedRow + 1} ПО СТРЕЛКЕ`}
                        </div>
                        <div className="font-display font-bold text-[19px] text-[#FAF9F5]">
                          Верно: {lastScore.hits} из {lastScore.max}
                          {lastScore.misses > 0 && (
                            <span className="ml-2 font-mono-tech text-[12px] font-semibold text-[#FF8C66]">
                              · Мимо: {lastScore.misses}
                            </span>
                          )}
                        </div>
                        {lastScore.misses > 0 && (
                          <div className="font-mono-tech text-[10.5px] text-[#FACC15]">
                            С поправкой за промахи (верно − мимо): {lastScore.netHits} из {lastScore.max}
                          </div>
                        )}
                        <p className="text-[12.5px] leading-[1.5] text-[#C2C8D4]">
                          {spMode === 'whole'
                            ? 'Обычно память схватывает лишь 3–5 букв без догадок. Запустите «Частичный отчёт» — убедитесь, что вы видели почти всю сетку!'
                            : `Если вы уверенно поймали ${lastScore.netHits} из 4 в случайной строке, в момент вспышки в вашем опыте было доступно ~${lastScore.netHits * 3} букв!`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {droppedFrameWarning && (
                  <div className="font-mono-tech text-[10px] text-[#FACC15]">
                    ! Замечен рывок кадра браузера (&gt; 45 мс) — при желании повторите вспышку для чистой экспозиции.
                  </div>
                )}

                {/* 20 Tactile Cyrillic Consonant Tiles — ALWAYS in DOM (zero Layout Shift during 250ms decay!) */}
                <div
                  aria-hidden={spPhase !== 'recall'}
                  className={`space-y-3 transition-opacity duration-150 ${
                    spPhase === 'recall'
                      ? 'opacity-100'
                      : 'opacity-25 pointer-events-none select-none'
                  }`}
                >
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {CONSONANTS.map((ch) => {
                      const selected = pickedLetters.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          disabled={spPhase !== 'recall'}
                          tabIndex={spPhase === 'recall' ? 0 : -1}
                          onClick={() => toggleLetter(ch)}
                          className={`v6-pill h-10 rounded-lg border font-mono-tech text-[15px] font-bold ${
                            spPhase !== 'recall' ? 'cursor-default' : 'cursor-pointer'
                          } ${
                            selected
                              ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109]'
                              : 'bg-[#181D27] hover:bg-[#232B39] text-[#FAF9F5] border-[#FAF9F5]/14'
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono-tech text-[10.5px] text-[#9AA3B2]">
                      {spPhase === 'recall'
                        ? `ВЫБРАНО: ${pickedLetters.length} / ${maxPick} · ОТМЕЧАЙТЕ БЕЗ УГАДЫВАНИЯ`
                        : 'ПАНЕЛЬ ВВОДА АКТИВИРУЕТСЯ СРАЗУ ПОСЛЕ ВСПЫШКИ'}
                    </span>
                    <button
                      type="button"
                      disabled={spPhase !== 'recall' || pickedLetters.length === 0}
                      tabIndex={spPhase === 'recall' ? 0 : -1}
                      onClick={submitSperlingRecall}
                      className={`v6-pill h-9 px-5 rounded-full font-sans-ui text-[13px] font-semibold ${
                        spPhase !== 'recall' || pickedLetters.length === 0
                          ? 'bg-[#1F2532] text-[#64748B] cursor-not-allowed'
                          : 'bg-[#34D399] hover:bg-[#2BC088] text-[#081A14] cursor-pointer'
                      }`}
                    >
                      Проверить совпадения
                    </button>
                  </div>
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>

        {/* ===================================================================
            LAB 2 (INSTRUMENT 06): SPLIT-VIEW BLINDSIGHT CORRIDOR OF PATIENT TN
           =================================================================== */}
        <div className="pt-12 border-t border-[#141413]/12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
              02 · СЛЕПОЗРЕНИЕ (ПАЦИЕНТ TN · 2005–2008)
            </div>
            <h3 className="font-serif-editorial text-[26px] md:text-[32px] leading-[1.14]">
              {ruTypo('Как обойти стулья в коридоре, видя абсолютную тьму')}
            </h3>
            <p className="text-[14.5px] leading-[1.66] text-[#3B3A37]">
              {ruTypo(
                'После двух инсультов в первичной зрительной коре (V1) пациент TN полностью ослеп — он ходил с тростью и честно говорил: «Передо мной только чёрный экран».',
              )}
            </p>
            <p className="text-[14.5px] leading-[1.66] text-[#4B4A46]">
              {ruTypo(
                'Но когда врачи (de Gelder et al., Current Biology 2008) убрали трость и попросили его пройти по коридору, заставленному коробками и стульями, TN аккуратно обошёл ВСЕ препятствия, не задев ни одного. Глаз и древние подкорковые маршруты продолжали видеть — но без V1 сигнал не попадал в субъективный опыт.',
              )}
            </p>
          </div>

          <div className="lg:col-span-7">
            <NoesisInstrumentFrame
              code="ПРИБОР II.4 · ДВОЙНОЙ ЭКРАН КОРИДОРА ПАЦИЕНТА TN"
              badge="reconstruction"
              telemetry={
                tnPathway === 'conscious'
                  ? 'ОСОЗНАННЫЙ ПУТЬ (V1): РАЗРУШЕН'
                  : tnPathway === 'amygdala'
                    ? 'ПОДКОРКА → МИНДАЛИНА: УГАДЫВАЕТ СТРАХ'
                    : 'V1 РАЗРУШЕНА · ОБХОДНАЯ НАВИГАЦИЯ СОХРАНЕНА'
              }
              surface="vellum"
              footnote="de Gelder et al. (Current Biology, 2008) · Pegna et al. (Nature Neuroscience, 2005)"
            >
              <div className="space-y-4">
                {/* Split View: Left = Inside TN's Dark Screen, Right = Architectural Top-Down Corridor Plan */}
                <div ref={tnWrapRef} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Inside TN's head — dynamically responds to all 3 pathways! */}
                  <div className="sm:col-span-4 rounded-xl bg-[#0B0D11] border border-[#141413]/20 p-4 flex flex-col justify-between min-h-[172px]">
                    <div
                      className={`font-mono-tech text-[9.5px] uppercase tracking-[0.12em] inline-flex items-center gap-1.5 ${
                        tnPathway === 'amygdala' ? 'text-[#FF8C66]' : 'text-[#FC4109]'
                      }`}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>
                        {tnPathway === 'amygdala' ? 'ПОДКОРКОВАЯ ТРЕВОГА' : 'ИЗНУТРИ ГОЛОВЫ TN'}
                      </span>
                    </div>

                    <div className="my-3 text-center space-y-2">
                      {tnPathway === 'amygdala' && (
                        <div className="mx-auto w-9 h-9 rounded-full border border-[#FC4109]/65 bg-[#FC4109]/12 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FC4109] animate-ping" />
                        </div>
                      )}
                      <div className="font-serif-editorial italic text-[14px] text-[#FAF9F5]/72 leading-snug">
                        {tnPathway === 'conscious'
                          ? '«Я уверен, что сейчас врежусь — передо мной сплошная чернота».'
                          : tnPathway === 'amygdala'
                            ? '«Я не вижу лица, но угадываю: оно испугано».'
                            : '«Я не вижу ничего — сплошная темнота».'}
                      </div>
                    </div>

                    <div className="font-mono-tech text-[9px] uppercase tracking-[0.1em] text-[#8E98A8]">
                      {tnPathway === 'conscious'
                        ? 'ОСОЗНАННЫЙ ЭКРАН V1: 0%'
                        : tnPathway === 'amygdala'
                          ? 'ПРАВАЯ МИНДАЛИНА: АКТИВНА'
                          : 'ЗРИТЕЛЬНАЯ КОРА V1: 0%'}
                    </div>
                  </div>

                  {/* Right Panel: Corridor Plan (de Gelder 2008) OR Seated Emotion Circuit (Pegna 2005) */}
                  <div className="sm:col-span-8 rounded-xl bg-[#FAF9F5] border border-[#141413]/14 p-3 flex flex-col justify-between">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59] mb-1">
                      <span>
                        {tnPathway === 'amygdala'
                          ? 'СИДЯЧИЙ ТЕСТ ЭМОЦИЙ · PEGNA ET AL., 2005'
                          : 'ПЛАН КОРИДОРА СВЕРХУ · DE GELDER ET AL., 2008'}
                      </span>
                      <span
                        className={
                          tnPathway === 'conscious'
                            ? 'text-[#FC4109] font-semibold'
                            : tnPathway === 'amygdala'
                              ? 'text-[#004EDF] font-semibold'
                              : 'text-[#0D7A5F] font-semibold'
                        }
                      >
                        {tnPathway === 'conscious'
                          ? 'ОСОЗНАННАЯ КАРТА: 0% (СЛЕПОЕ ПЯТНО)'
                          : tnPathway === 'amygdala'
                            ? 'ТОЧНОСТЬ: ВЫШЕ ШАНСА (50%)'
                            : 'СТОЛКНОВЕНИЙ: 0'}
                      </span>
                    </div>

                    {tnPathway === 'amygdala' ? (
                      <>
                        {/* Seated fMRI / Emotion Guessing Schematic (Pegna et al., Nature Neuroscience 2005) */}
                        <svg viewBox="0 0 420 144" className="w-full h-[126px] block">
                          <rect x="8" y="10" width="404" height="124" rx="8" fill="#F3F1E9" stroke="#141413" strokeOpacity="0.18" />

                          {/* Left: Stimulus Screen */}
                          <rect x="20" y="34" width="84" height="76" rx="6" fill="#141413" />
                          <text x="62" y="54" textAnchor="middle" fill="#9AA3B2" fontSize="8" fontFamily="JetBrains Mono Variable, monospace">
                            СТИМУЛ
                          </text>
                          <text
                            x="62"
                            y="76"
                            textAnchor="middle"
                            fill={tnFearStimulus === 'fear' ? '#FC4109' : '#FAF9F5'}
                            fontSize="10.5"
                            fontWeight="700"
                            fontFamily="JetBrains Mono Variable, monospace"
                          >
                            {tnFearStimulus === 'fear' ? 'ЛИЦО: СТРАХ' : 'НЕЙТРАЛЬНО'}
                          </text>
                          <text x="62" y="94" textAnchor="middle" fill="#8E98A8" fontSize="7.5" fontFamily="JetBrains Mono Variable, monospace">
                            (БЕЗ ТРОСТИ)
                          </text>

                          {/* Top severed cortical route: Retina -> V1 */}
                          <path
                            d="M 104 54 L 166 54 L 222 38"
                            fill="none"
                            stroke="#141413"
                            strokeOpacity="0.28"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                          />
                          <rect x="224" y="22" width="108" height="32" rx="5" fill="#FAF9F5" stroke="#FC4109" strokeOpacity="0.55" strokeDasharray="3 2" />
                          <text x="278" y="36" textAnchor="middle" fill="#FC4109" fontSize="8" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                            КОРА V1 · РАЗРУШЕНА
                          </text>
                          <text x="278" y="48" textAnchor="middle" fill="#5E5D59" fontSize="7.5" fontFamily="JetBrains Mono Variable, monospace">
                            ОСОЗНАННЫЙ ОБРАЗ: 0%
                          </text>

                          {/* Bottom intact subcortical route: Eye -> Superior Colliculus / Pulvinar -> Right Amygdala */}
                          <path
                            d="M 104 88 L 166 88 L 224 102"
                            fill="none"
                            stroke={tnFearStimulus === 'fear' ? '#FC4109' : '#004EDF'}
                            strokeWidth="2.4"
                          />
                          <circle cx="166" cy="88" r="14" fill="#FAF9F5" stroke="#141413" strokeWidth="1.4" />
                          <text x="166" y="86" textAnchor="middle" fill="#141413" fontSize="7" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                            ПОДКОРКА
                          </text>
                          <text x="166" y="95" textAnchor="middle" fill="#5E5D59" fontSize="6.5" fontFamily="JetBrains Mono Variable, monospace">
                            ТАЛАМУС
                          </text>

                          <rect
                            x="224"
                            y="80"
                            width="174"
                            height="42"
                            rx="6"
                            fill={tnFearStimulus === 'fear' ? '#FC4109' : '#004EDF'}
                            fillOpacity="0.1"
                            stroke={tnFearStimulus === 'fear' ? '#FC4109' : '#004EDF'}
                            strokeWidth="1.6"
                          />
                          <text
                            x="311"
                            y="97"
                            textAnchor="middle"
                            fill={tnFearStimulus === 'fear' ? '#C83407' : '#004EDF'}
                            fontSize="8.5"
                            fontWeight="700"
                            fontFamily="JetBrains Mono Variable, monospace"
                          >
                            {tnFearStimulus === 'fear' ? 'ПРАВАЯ МИНДАЛИНА: СИГНАЛ' : 'ПРАВАЯ МИНДАЛИНА: ФОН'}
                          </text>
                          <text x="311" y="111" textAnchor="middle" fill="#282725" fontSize="7.8" fontFamily="JetBrains Mono Variable, monospace">
                            {tnFearStimulus === 'fear'
                              ? 'Ответ TN: угадывает страх'
                              : 'Ответ TN: «не вижу, спокойно»'}
                          </text>
                        </svg>

                        <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setTnFearStimulus('fear')}
                              className={`v6-pill px-3 py-1 rounded-full font-mono-tech text-[10px] uppercase tracking-[0.08em] border cursor-pointer ${
                                tnFearStimulus === 'fear'
                                  ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109]'
                                  : 'bg-[#F3F1E9] text-[#141413] border-[#141413]/14'
                              }`}
                            >
                              Показать: Страх
                            </button>
                            <button
                              type="button"
                              onClick={() => setTnFearStimulus('neutral')}
                              className={`v6-pill px-3 py-1 rounded-full font-mono-tech text-[10px] uppercase tracking-[0.08em] border cursor-pointer ${
                                tnFearStimulus === 'neutral'
                                  ? 'bg-[#004EDF] text-[#FAF9F5] border-[#004EDF]'
                                  : 'bg-[#F3F1E9] text-[#141413] border-[#141413]/14'
                              }`}
                            >
                              Показать: Нейтрал
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectTnPathway('navigation')}
                            className="font-mono-tech text-[10px] uppercase tracking-[0.09em] text-[#5E5D59] hover:text-[#141413] cursor-pointer"
                          >
                            ← К коридору (2008)
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 420 144" className="w-full h-[126px] block">
                          {/* Corridor walls */}
                          <rect x="8" y="14" width="404" height="116" rx="8" fill="#F3F1E9" stroke="#141413" strokeOpacity="0.18" />
                          {/* 6 Architectural Boxes/Chairs */}
                          {TN_OBSTACLES.map((ob, idx) => (
                            <rect
                              key={idx}
                              x={ob.x}
                              y={ob.y}
                              width={ob.w}
                              height={ob.h}
                              rx="3"
                              fill="#141413"
                              fillOpacity={tnPathway === 'conscious' ? 0.05 : 0.15}
                              stroke="#141413"
                              strokeOpacity={tnPathway === 'conscious' ? 0.18 : 0.42}
                              strokeDasharray={tnPathway === 'conscious' ? '3 3' : undefined}
                              strokeWidth="1.2"
                            />
                          ))}

                          {tnPathway === 'conscious' ? (
                            <g>
                              {/* Broken conscious map overlay: NO collision-free trajectory! */}
                              <rect x="8" y="14" width="404" height="116" rx="8" fill="#141413" fillOpacity="0.06" />
                              <line
                                x1="44"
                                y1="76"
                                x2="96"
                                y2="76"
                                stroke="#FC4109"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                              />
                              <text
                                x="106"
                                y="80"
                                fill="#FC4109"
                                fontSize="11"
                                fontWeight="700"
                                fontFamily="JetBrains Mono Variable, monospace"
                              >
                                × КАРТА ПРЕПЯТСТВИЙ НЕ ПОСТРОЕНА (V1 = 0%)
                              </text>
                              <circle cx="36" cy="76" r="7.5" fill="#7A7872" stroke="#FAF9F5" strokeWidth="2" />
                              <text
                                x="36"
                                y="65"
                                textAnchor="middle"
                                fill="#5E5D59"
                                fontSize="9"
                                fontWeight="700"
                                fontFamily="JetBrains Mono Variable, monospace"
                              >
                                TN
                              </text>
                            </g>
                          ) : (
                            <>
                              {/* Exact shared collision-free trajectory */}
                              <polyline
                                points={TN_SVG_POINTS}
                                fill="none"
                                stroke="#0D7A5F"
                                strokeOpacity="0.45"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="5 4"
                              />

                              {/* Live Patient TN marker + directional sensing cone */}
                              <g transform={`translate(${tnPos.x.toFixed(1)}, ${tnPos.y.toFixed(1)})`}>
                                <path
                                  d="M 0 0 L 30 -13 L 30 13 Z"
                                  fill="#0D7A5F"
                                  fillOpacity="0.18"
                                  transform={`rotate(${tnPos.headingDeg.toFixed(1)})`}
                                />
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="7.5"
                                  fill="#0D7A5F"
                                  stroke="#FAF9F5"
                                  strokeWidth="2"
                                />
                                <text
                                  x="0"
                                  y="-11"
                                  textAnchor="middle"
                                  fill="#0D7A5F"
                                  fontSize="9"
                                  fontWeight="700"
                                  fontFamily="JetBrains Mono Variable, monospace"
                                >
                                  TN
                                </text>
                              </g>
                            </>
                          )}
                        </svg>

                        {tnPathway === 'conscious' ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
                            <span className="font-mono-tech text-[10px] uppercase tracking-[0.08em] text-[#C83407]">
                              Осознанный маршрут недоступен без коры V1
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectTnPathway('navigation');
                                tnProgressRef.current = 0;
                                setTnProgress(0);
                                setTnWalking(true);
                              }}
                              className="v6-pill px-3 py-1 rounded-full bg-[#0D7A5F] hover:bg-[#0A644E] text-[#FAF9F5] font-mono-tech text-[10px] uppercase tracking-[0.09em] cursor-pointer"
                            >
                              Включить 2. Обходной путь →
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (tnProgressRef.current >= 0.98) {
                                  tnProgressRef.current = 0;
                                  setTnProgress(0);
                                }
                                setTnWalking((w) => !w);
                              }}
                              className="v6-pill px-3 py-1 rounded-full bg-[#141413] text-[#FAF9F5] font-mono-tech text-[10px] uppercase tracking-[0.09em] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              {tnWalking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[#34D399]" />}
                              <span>{tnWalking ? 'Пауза' : 'Пройти коридор'}</span>
                            </button>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={Math.round(tnProgress * 100)}
                              onChange={(e) => {
                                setTnWalking(false);
                                const v = Number(e.target.value) / 100;
                                tnProgressRef.current = v;
                                setTnProgress(v);
                              }}
                              className="w-full accent-[#0D7A5F] cursor-pointer"
                              aria-label="Положение пациента TN в коридоре"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 3 Anatomical Pathways Switcher (plain Russian on mainstream; detailed anatomy in Dossier II.3) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'conscious' as const,
                      title: '1. Осознанный путь',
                      status: 'РАЗРУШЕН (V1)',
                      desc: 'От глаза в первичную зрительную кору V1. Без него нет субъективной картинки мира.',
                    },
                    {
                      id: 'navigation' as const,
                      title: '2. Обходной путь',
                      status: 'ЦЕЛ (НАВИГАЦИЯ)',
                      desc: 'Древний подкорковый обход напрямую в зону движения — именно он ведёт TN вокруг стульев.',
                    },
                    {
                      id: 'amygdala' as const,
                      title: '3. Канал страха',
                      status: 'ЦЕЛ (МИНДАЛИНА)',
                      desc: 'Сидячий тест: прямой подкорковый путь к центру тревоги — TN угадывал страх выше случайного (Pegna 2005).',
                    },
                  ].map((p) => {
                    const active = tnPathway === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectTnPathway(p.id)}
                        className={`v6-pill text-left p-3 rounded-xl border cursor-pointer ${
                          active
                            ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                            : 'bg-[#FAF9F5] hover:bg-[#ECE9DF] text-[#141413] border-[#141413]/12'
                        }`}
                      >
                        <div className="font-display font-bold text-[12.5px]">{p.title}</div>
                        <div
                          className={`font-mono-tech text-[9px] uppercase tracking-wider mt-0.5 ${
                            p.id === 'conscious'
                              ? 'text-[#FC4109]'
                              : active
                                ? 'text-[#34D399]'
                                : 'text-[#0D7A5F]'
                          }`}
                        >
                          {p.status}
                        </div>
                        <p
                          className={`text-[11.5px] leading-[1.45] mt-1.5 ${
                            active ? 'text-[#FAF9F5]/80' : 'text-[#5E5D59]'
                          }`}
                        >
                          {ruTypo(p.desc)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>

        {/* ===================================================================
            LAB 3 (INSTRUMENT 07): 3-MODE FLASH-LAG POSTDICTION (SCIENCE 2000)
           =================================================================== */}
        <div className="pt-12 border-t border-[#141413]/12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
              03 · МОНТАЖ ВРЕМЕНИ (Д. ИГЛМАН, SCIENCE 2000)
            </div>
            <h3 className="font-serif-editorial text-[26px] md:text-[32px] leading-[1.14]">
              {ruTypo('Ваше «сейчас» монтируется задним числом с задержкой 80 мс')}
            </h3>
            <p className="text-[14.5px] leading-[1.66] text-[#3B3A37]">
              {ruTypo(
                'Смотрите в центр креста (+) справа: когда белая стрелка проходит ровно 12 часов, на одной линии с ней вспыхивает алый штрих. Но ваши глаза клянутся, что стрелка уже обогнала вспышку!',
              )}
            </p>
            <p className="text-[14.5px] leading-[1.66] text-[#4B4A46]">
              {ruTypo(
                'Главный удар — переключите режим на «Разворот после вспышки»: стрелка меняет направление ПОСЛЕ того, как свет уже погас, — но ваш мозг успевает переписать прошлое и сдвинуть её в новую сторону! Этот монтаж задним числом нейробиологи называют ',
              )}
              <strong className="font-semibold text-[#141413]">постдикцией</strong>
              {ruTypo(': обычное сознание ждёт ~80 мс, прежде чем выпустить «настоящий момент» в эфир.')}
            </p>

            {/* Tight 2-sentence Chronostasis box (Yarrow et al., 2001) */}
            <div className="p-4 rounded-xl bg-[#F3F1E9] border border-[#141413]/12 space-y-1.5">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#004EDF] font-semibold inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>ЭФФЕКТ ОСТАНОВЛЕННЫХ ЧАСОВ (ХРОНОСТАЗИС, 2001)</span>
              </div>
              <p className="text-[13px] leading-[1.56] text-[#353431]">
                {ruTypo(
                  'Замечали, что при быстром взгляде на секундную стрелку первая секунда кажется неестественно длинной? Чтобы скрыть смаз от движения глаз, мозг задним числом растягивает картинку часов на время прыжка взгляда (Yarrow et al., Nature 2001).',
                )}
              </p>
            </div>

            <DossierTrigger
              dossier="blindsight-time-2000"
              label="Сперлинг (P vs A), пациент TN и постдикция 80 мс (Eagleman, Science 2000)"
              meta="Архивное досье II.3 · Уровень 2"
              className="w-full"
            />
          </div>

          <div className="lg:col-span-7">
            <NoesisInstrumentFrame
              code="ПРИБОР II.5 · ИЛЛЮЗИЯ FLASH-LAG (ПОСТДИКЦИЯ)"
              badge="self-test"
              telemetry={flFrozen ? 'СТОП-КАДР t = 0 МС' : 'ВСПЫШКА ~50 МС НА 12 ЧАСАХ'}
              surface="darkroom"
              footnote="Eagleman & Sejnowski (Science, 2000) · сравните все 3 режима и проверьте Стоп-кадр!"
            >
              <div className="space-y-4">
                {/* 3 Modes + Freeze-Frame t = 0 ms button */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { id: 'continuous', label: '1. Обычное движение' },
                        { id: 'terminated', label: '2. Стоп на вспышке' },
                        { id: 'reversal', label: '3. Разворот после вспышки' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectFlMode(m.id)}
                        className={`v6-pill px-3 py-1.5 rounded-full text-[11.5px] font-medium border cursor-pointer ${
                          flMode === m.id
                            ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5]'
                            : 'bg-[#191E28] text-[#C8D0DC] border-[#FAF9F5]/14 hover:bg-[#232B3A]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFlFrozen((f) => !f);
                      setFlashLagCompleted(true);
                    }}
                    className={`v6-pill px-3.5 py-1.5 rounded-full text-[11.5px] font-mono-tech uppercase tracking-[0.08em] font-semibold border inline-flex items-center gap-1.5 cursor-pointer ${
                      flFrozen
                        ? 'bg-[#34D399] text-[#081A14] border-[#34D399]'
                        : 'bg-[#FC4109]/18 text-[#FF9B7D] border-[#FC4109]/45 hover:bg-[#FC4109]/30'
                    }`}
                  >
                    {flFrozen ? <RotateCcw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{flFrozen ? 'Запустить снова' : 'Стоп-кадр t = 0 мс'}</span>
                  </button>
                </div>

                {/* Responsive HTML telemetry bar above canvas (never clips on 390px mobile!) */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0B0D11] border border-[#FAF9F5]/10 font-mono-tech text-[10px] uppercase tracking-[0.09em]">
                  {flFrozen ? (
                    <span className="text-[#34D399] font-semibold">
                      СТОП-КАДР t = 0 МС · Δ = 0.0° (ИДЕАЛЬНО НА ОДНОЙ ЛИНИИ)
                    </span>
                  ) : (
                    <span className="text-[#9AA3B2]">
                      СМОТРИТЕ В ЦЕНТРАЛЬНЫЙ КРЕСТ + · ВСПЫШКА ~50 МС НА 12 ЧАСАХ
                    </span>
                  )}
                  <span className="text-[#FAF9F5]/55">
                    {flMode === 'continuous'
                      ? 'СКВОЗНОЙ ЦИКЛ'
                      : flMode === 'terminated'
                        ? 'ИСЧЕЗАЕТ ПОСЛЕ ВСПЫШКИ'
                        : 'ОТКАТ 450 МС ПОСЛЕ ВСПЫШКИ'}
                  </span>
                </div>

                {/* Live 60/120Hz Flash-Lag Darkroom Canvas */}
                <div
                  ref={flWrapRef}
                  className="relative w-full h-[240px] rounded-xl overflow-hidden border border-[#FAF9F5]/12 bg-[#111419]"
                >
                  <canvas ref={flCanvasRef} className="w-full h-full block" />
                </div>

                {/* Mode-specific crisp interpretation */}
                <div className="rounded-xl bg-[#181D27] border border-[#FAF9F5]/10 p-3.5 text-[13px] leading-[1.56] text-[#C8D0DC]">
                  {flFrozen ? (
                    <span className="text-[#34D399]">
                      <strong>Физическая истина:</strong> зелёная линия доказывает, что в момент вспышки белая и красная полосы лежат на одном луче (Δ = 0.0°). Сдвиг целиком создан вашим мозгом!
                    </span>
                  ) : flMode === 'continuous' ? (
                    <span>
                      <strong>Режим 1 (Обычное движение):</strong> белая полоса кажется вырвавшейся вперёд по часовой стрелке относительно алой вспышки.
                    </span>
                  ) : flMode === 'terminated' ? (
                    <span>
                      <strong>Режим 2 (Стоп на вспышке):</strong> полоса исчезает сразу после вспышки — и иллюзия мгновенно пропадает! Значит, мозг НЕ предсказывал её путь заранее.
                    </span>
                  ) : (
                    <span>
                      <strong>Режим 3 (Разворот ПОСЛЕ вспышки):</strong> полоса разворачивается уже после света — и кажется смещённой назад, в новую сторону! Это доказывает монтаж задним числом (~80 мс).
                    </span>
                  )}
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
