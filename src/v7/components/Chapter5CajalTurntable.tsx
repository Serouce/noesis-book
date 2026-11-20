import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Volume2, VolumeX } from 'lucide-react';
import { useExplorer, type TurntableMode } from '../context/ExplorerContext';

interface Chapter5CajalTurntableProps {
  onNextChapter: () => void;
}

interface ModeSpec {
  id: TurntableMode;
  label: string;
  shortExplain: string;
  badge: string;
  complexityLabel: string;
  needleDown: boolean;
  shaftIntact: boolean;
  headline: string;
  description: string;
  cinemaWhisper?: string;
  accent: string;
}

const MODES: ModeSpec[] = [
  {
    id: 'wake',
    label: 'Бодрствование',
    shortExplain: 'Обычный ясный день · оба канала открыты',
    badge: 'БАЛАНС',
    complexityLabel: 'ВЫСОКАЯ СЛОЖНОСТЬ',
    needleDown: true,
    shaftIntact: true,
    headline: 'Обе антенны замкнуты в одну живую вспышку',
    description:
      'Нижние ветви (дендриты) клетки принимают сырой сигнал мира, верхние — внутренние прогнозы мозга из Главы III. Когда оба потока встречаются в стволе, клетка запускает сложную живую волну — и вы осознаёте мир.',
    accent: '#004EDF',
  },
  {
    id: 'rem',
    label: 'REM-сон / Кетамин',
    shortExplain: 'Яркие сны или диссоциатив · тело отрезано от мира',
    badge: 'CLUB SILENCIO',
    complexityLabel: 'ВЫСОКАЯ СЛОЖНОСТЬ',
    needleDown: false,
    shaftIntact: true,
    headline: 'Игла поднята с диска — но музыка продолжает играть',
    description:
      'В фазе быстрых снов (REM) или под кетамином вход от органов чувств отрезан: игла физически отрывается от пластинки. Но верхняя петля коры сама раскачивает нейрон, поэтому внутри неподвижного тела полыхают ярчайшие сны.',
    cinemaWhisper: '«No hay banda» — оркестра нет, внешнего входа нет, а мелодия опыта звучит.',
    accent: '#0D7A5F',
  },
  {
    id: 'psilocybin',
    label: 'Псилоцибин',
    shortExplain: 'Психоделик · бьёт по рецепторам 5-HT2A на верхушке клетки',
    badge: 'ГИПЕРСВЯЗНОСТЬ',
    complexityLabel: 'СВЕРХВЫСОКАЯ СЛОЖНОСТЬ',
    needleDown: true,
    shaftIntact: true,
    headline: 'Верхние фильтры ослабевают — мозг сбрасывает привычные шаблоны',
    description:
      'Молекула псилоцибина связывается с рецепторами 5-HT2A прямо на верхней «антенне» этого нейрона. Привычные прогнозы (приоры из Главы III) слабеют, и отдалённые зоны коры начинают перекликаться напрямую — волна становится ещё богаче (Ort et al., 2023; Siegel et al., Nature 2024).',
    accent: '#C84319',
  },
  {
    id: 'propofol',
    label: 'Пропофол (Наркоз)',
    shortExplain: 'Главный препарат общего хирургического наркоза',
    badge: 'ОБРЫВ КАНАЛА',
    complexityLabel: 'ТИШИНА · НЕТ СВЯЗНОСТИ',
    needleDown: false,
    shaftIntact: false,
    headline: 'Ствол нейрона рвётся пополам — и плёнка обрывается посреди такта',
    description:
      'Пропофол не «усыпляет» органы чувств — сигналы по-прежнему приходят в кору. Но препарат через тормозные ГАМК-рецепторы электрически перерезает середину ствола пирамидальной клетки (Suzuki & Larkum, Cell 2020): мир не «темнеет» — он мгновенно прекращается.',
    cinemaWhisper: 'Считайте вслух: 10… 9… 8… — и резкий обрыв в тишину прямо посреди ноты.',
    accent: '#FC4109',
  },
];

/**
 * CHAPTER V: "Клеточный транзистор и тишина"
 * Upgraded v8:
 * 1. ZERO premature PCI* = 0.31 jargon (saved for Chapter VI reveal!)
 * 2. Plain-Russian 1-line substance passports + explicit Needle=World / Music=Experience bridge
 * 3. Direct click-to-audio engagement (clicking any mode activates Web Audio with prominent Mute toggle!)
 * 4. USER'S SIGNATURE IDEA: 2.2-second Sopranos Propofol Infusion ("10… 9… 8…" + live chord playing while GABA-A wave races down trunk -> 0.25s visible trunk rupture flash -> ABRUPT mid-note audio cut -> 1.55s Cut-to-Black!)
 * 5. Distinct Psilocybin cross-cortical hyperconnectivity arcs on the Cajal neuron!
 * 6. Smooth "Lights-Out" gradient bridge flowing directly into Dark Chapter VI!
 */
export function Chapter5CajalTurntable({ onNextChapter }: Chapter5CajalTurntableProps) {
  const { state, setTurntableMode } = useExplorer();
  const [soundEnabled, setSoundEnabled] = useState(false);
  // Propofol 2.2s delayed infusion choreography: idle -> infusing (0..2.0s) -> snapping (2.0..2.25s) -> blackout -> settled
  const [infusionStage, setInfusionStage] = useState<'idle' | 'infusing' | 'snapping' | 'settled'>('idle');
  const [infusionCountdown, setInfusionCountdown] = useState<string>('10');
  const [infusionProgress, setInfusionProgress] = useState(0);
  const [cutBlackPhase, setCutBlackPhase] = useState<'none' | 'pure' | 'pulse'>('none');
  const [phaseTick, setPhaseTick] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null);
  const timersRef = useRef<number[]>([]);
  const infusionRafRef = useRef<number>(0);

  const mode = MODES.find((m) => m.id === state.turntableMode) ?? MODES[0];

  // Visual state during Propofol 2.2s infusion: trunk stays INTACT & music PLAYS until t=2.0s, then SNAPS!
  const isPropofolInfusing = mode.id === 'propofol' && infusionStage === 'infusing';
  const isPropofolSnapping = mode.id === 'propofol' && infusionStage === 'snapping';
  const effectiveShaftIntact = mode.id === 'propofol' ? isPropofolInfusing : mode.shaftIntact;
  const effectiveNeedleDown = mode.id === 'propofol' ? isPropofolInfusing : mode.needleDown;
  const effectivePlatterSpinning = mode.id !== 'propofol' || isPropofolInfusing;

  const clearScheduledPropofol = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (infusionRafRef.current) {
      cancelAnimationFrame(infusionRafRef.current);
      infusionRafRef.current = 0;
    }
  };

  // Smooth oscilloscope & neural spark loop
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      setPhaseTick(t * 0.0022);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Clean up audio & timers on unmount
  useEffect(() => {
    return () => {
      clearScheduledPropofol();
      if (oscNodesRef.current) {
        oscNodesRef.current.oscs.forEach((o) => {
          try {
            o.stop();
          } catch {
            // ignore
          }
        });
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  // Pure Web Audio API chord engine:
  // Plays live harmonic chord on Wake / REM / Psilocybin AND during the 2.2s Propofol infusion countdown — then cuts DEAD mid-note (5ms anti-click) at rupture!
  useEffect(() => {
    const hardCutAudio = () => {
      if (oscNodesRef.current) {
        const { oscs, gain } = oscNodesRef.current;
        const now = audioCtxRef.current?.currentTime ?? 0;
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0.0001, now + 0.006); // Razor-sharp 6ms Sopranos mid-beat cut!
        } catch {
          // ignore
        }
        oscs.forEach((o) => {
          try {
            o.stop(now + 0.012);
          } catch {
            // ignore
          }
        });
        oscNodesRef.current = null;
      }
    };

    const softStopAudio = () => {
      if (oscNodesRef.current) {
        const { oscs, gain } = oscNodesRef.current;
        const now = audioCtxRef.current?.currentTime ?? 0;
        try {
          gain.gain.setTargetAtTime(0.0001, now, 0.035);
        } catch {
          // ignore
        }
        oscs.forEach((o) => {
          try {
            o.stop(now + 0.09);
          } catch {
            // ignore
          }
        });
        oscNodesRef.current = null;
      }
    };

    // Silence after Propofol snaps!
    if (!soundEnabled || (mode.id === 'propofol' && !isPropofolInfusing)) {
      if (mode.id === 'propofol') {
        hardCutAudio();
      } else {
        softStopAudio();
      }
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => undefined);
    }
    softStopAudio();

    const gain = ctx.createGain();
    gain.gain.value = 0.032;
    gain.connect(ctx.destination);

    // Rich recognizable harmonic profiles per state (Propofol infusion starts on warm live waking chord before sudden cutoff!)
    const freqs =
      mode.id === 'wake' || isPropofolInfusing
        ? [220, 277.18, 329.63] // Warm A-major live chord
        : mode.id === 'rem'
          ? [246.94, 369.99, 493.88] // Dreamy open fifth shimmer even with tonearm lifted!
          : [220, 277.18, 329.63, 415.3, 493.88]; // Rich hyper-connected psilocybin maj9 chord

    const oscs = freqs.map((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = mode.id === 'rem' ? 'sine' : idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start();
      return osc;
    });

    oscNodesRef.current = { oscs, gain };
    return softStopAudio;
  }, [soundEnabled, mode.id, isPropofolInfusing]);

  const handleSelectMode = (nextMode: TurntableMode) => {
    clearScheduledPropofol();
    setCutBlackPhase('none');
    setInfusionProgress(0);

    // Strictly opt-in audio per GEMINI.md guardrail #3 (silent by default until user clicks "♪ Включить звук")
    setTurntableMode(nextMode);

    if (nextMode === 'propofol') {
      // USER'S SIGNATURE IDEA: 2.0s live sound & GABA-A countdown ("10... 9... 8...") -> 0.25s visible rupture flash -> abrupt Sopranos Cut-to-Black!
      setInfusionStage('infusing');
      setInfusionCountdown('10');

      const startMs = performance.now();
      const infusionMs = 2000;
      const animateInfusion = (now: number) => {
        const elapsed = now - startMs;
        const pct = Math.max(0, Math.min(1, elapsed / infusionMs));
        setInfusionProgress(pct);
        if (pct < 0.34) setInfusionCountdown('10');
        else if (pct < 0.68) setInfusionCountdown('9');
        else setInfusionCountdown('8…');

        if (pct < 1) {
          infusionRafRef.current = requestAnimationFrame(animateInfusion);
        }
      };
      infusionRafRef.current = requestAnimationFrame(animateInfusion);

      // t = 2.00s: Visible crimson rupture flash snaps the Cajal shaft & cuts sound DEAD mid-note!
      const tSnap = window.setTimeout(() => {
        setInfusionStage('snapping');
      }, 2000);

      // t = 2.26s: Hard Sopranos Cut-to-Black (1.55s total, telemetry pulse at 0.55s so user knows it's deliberate art!)
      const tBlack = window.setTimeout(() => {
        setCutBlackPhase('pure');
      }, 2260);
      const tPulse = window.setTimeout(() => {
        setCutBlackPhase('pulse');
      }, 2810);
      const tEnd = window.setTimeout(() => {
        setCutBlackPhase('none');
        setInfusionStage('settled');
      }, 3820);

      timersRef.current.push(tSnap, tBlack, tPulse, tEnd);
    } else {
      setInfusionStage('idle');
    }
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  // Generate live SVG oscilloscope waveform path
  const wavePath = (() => {
    const pts: string[] = [];
    const w = 320;
    const mid = 34;
    for (let i = 0; i <= 80; i += 1) {
      const x = (i / 80) * w;
      let y = mid;
      if (mode.id === 'propofol' && !isPropofolInfusing) {
        y = mid + Math.sin(i * 0.14 + phaseTick * 0.8) * 3.2; // Flat stereotyped slow wave
      } else if (mode.id === 'wake' || isPropofolInfusing) {
        y =
          mid +
          Math.sin(i * 0.35 + phaseTick * 3.2) * 14 +
          Math.cos(i * 0.78 - phaseTick * 2.1) * 7;
      } else if (mode.id === 'rem') {
        y =
          mid +
          Math.sin(i * 0.42 + phaseTick * 3.8) * 16 +
          Math.sin(i * 1.05 + phaseTick * 1.9) * 8;
      } else {
        // Psilocybin hyper-coherent multi-harmonic interference
        y =
          mid +
          Math.sin(i * 0.5 + phaseTick * 4.4) * 15 +
          Math.cos(i * 1.25 - phaseTick * 3.5) * 10 +
          Math.sin(i * 2.1 + phaseTick * 2.2) * 5;
      }
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  const tonearmRotation = effectiveNeedleDown ? 17 : -9;
  const activeAccent = isPropofolInfusing ? '#004EDF' : mode.accent;

  return (
    <section
      id="ch-5"
      className="relative bg-[#FAF9F5] text-[#141413] pt-24 pb-0 md:pt-28"
      aria-label="Глава V — Клеточный транзистор и тишина"
    >
      {/* FULL-SCREEN HARD CUT-TO-BLACK (SOPRANOS PROPOFOL EFFECT + 0.55s ANTI-CRASH TELEMETRY PULSE!) */}
      {cutBlackPhase !== 'none' && (
        <div
          className="fixed inset-0 z-[100] bg-[#060709] flex items-end justify-end p-8 pointer-events-auto"
          aria-live="assertive"
        >
          {cutBlackPhase === 'pulse' && (
            <div className="flex items-center gap-2.5 font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[#FC4109] animate-[fadeScaleIn_200ms_ease]">
              <span className="w-2 h-2 rounded-full bg-[#FC4109] animate-ping" />
              <span>СТВОЛ РАЗОРВАН · НЕТ ИНТЕГРАЦИИ · ВНУТРИ ТЕМНО</span>
            </div>
          )}
        </div>
      )}

      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ЧАСТЬ II · ПОД ЧЕРЕПОМ · ГЛАВА V</span>
          <span>КЛЕТОЧНЫЙ ТРАНЗИСТОР · ×1000 · стр. 70</span>
        </div>

        {/* Opening Editorial Prose */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Выключатель сознания</span>
              <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
                внутри одной-единственной клетки.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              Нейробиолог Мэтью Ларкум открыл поразительный клеточный переключатель: у{' '}
              <strong className="font-semibold text-[#141413]">пирамидального нейрона 5-го слоя</strong> две антенны. Нижняя слушает сырой мир, а верхняя — те самые{' '}
              <em>внутренние прогнозы из Главы III</em>. Пока ствол между ними цел — сознание горит.
            </p>
          </div>
        </div>

        {/* EXPLICIT 1-LINE KEY CONNECTING LEFT (NEURON) & RIGHT (TURNTABLE) + UNAMBIGUOUS OPT-IN AUDIO BUTTON */}
        <div className="mt-8 rounded-xl bg-[#F3F1E9] border border-[#141413]/12 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-[13.5px] text-[#2F2E2B] flex-1 min-w-0">
            <strong className="text-[#141413]">Как читать прибор:</strong>{' '}
            <span>
              <strong className="text-[#004EDF]">игла на диске</strong> = нижняя антенна (вход внешнего мира), а{' '}
              <strong className="text-[#FC4109]">мелодия и волна</strong> = само внутреннее переживание. Чтобы услышать обрыв наркоза ушами, включите синтезатор справа (по умолчанию без звука).
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleSound}
            className={`v6-pill h-9 px-4 rounded-full border font-mono-tech text-[10.5px] uppercase tracking-[0.08em] inline-flex items-center gap-2 shrink-0 cursor-pointer ${
              soundEnabled
                ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                : 'bg-[#FAF9F5] hover:bg-[#FC4109]/10 text-[#141413] border-[#FC4109]/55 shadow-[0_2px_10px_rgba(252,65,9,0.14)]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#34D399]" /> : <VolumeX className="w-3.5 h-3.5 text-[#FC4109]" />}
            <span>{soundEnabled ? 'Звук включён' : 'Включить звук'}</span>
          </button>
        </div>

        {/* 4 CLEAR MODE CARDS WITH HUMAN-READABLE 1-LINE PASSPORTS (ZERO premature PCI* numbers!) */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {MODES.map((m) => {
            const active = m.id === mode.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMode(m.id)}
                className={`v6-pill text-left px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  active
                    ? m.id === 'propofol'
                      ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109] shadow-[0_10px_28px_rgba(252,65,9,0.28)]'
                      : 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                    : 'bg-[#F3F1E9] hover:bg-[#E9E6DC] text-[#141413] border-[#141413]/14'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-[14px]">{m.label}</span>
                  <span
                    className={`font-mono-tech text-[9.5px] uppercase tracking-wider ${
                      active ? 'opacity-90' : 'text-[#5E5D59]'
                    }`}
                  >
                    {m.badge}
                  </span>
                </div>
                <div
                  className={`text-[12px] leading-snug mt-1 ${
                    active ? 'text-[#FAF9F5]/82' : 'text-[#5E5D59]'
                  }`}
                >
                  {m.shortExplain}
                </div>
              </button>
            );
          })}
        </div>

        {/* LIVE PROPOFOL 2.2s INFUSION COUNTDOWN BANNER ("10... 9... 8...") */}
        {(isPropofolInfusing || isPropofolSnapping) && (
          <div className="mt-4 rounded-xl bg-[#141413] text-[#FAF9F5] border border-[#FC4109]/50 px-5 py-3 flex flex-wrap items-center justify-between gap-4 animate-[fadeScaleIn_180ms_ease]">
            <div className="flex items-center gap-3 font-mono-tech text-[11.5px] uppercase tracking-[0.12em]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FC4109] animate-ping" />
              <span>
                {isPropofolSnapping
                  ? 'РАЗРЫВ Ca²⁺-КАНАЛА — ОБРЫВ ПРЯМО ПОСРЕДИ НОТЫ!'
                  : `ВВЕДЕНИЕ ПРОПОФОЛА · СЧИТАЙТЕ В ОБРАТНОМ ПОРЯДКЕ: ${infusionCountdown}`}
              </span>
            </div>
            <div className="w-40 h-1.5 rounded-full bg-[#FAF9F5]/18 overflow-hidden">
              <div
                className="h-full bg-[#FC4109]"
                style={{ width: `${Math.round(infusionProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* UNIFIED 2-FOCUS SWISS INSTRUMENT SPREAD: LEFT = CAJAL NEURON · RIGHT = DIETER RAMS TURNTABLE */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT PAGE (6 cols): Santiago Ramon y Cajal Vector-Ink Layer-5 Pyramidal Neuron */}
          <div className="lg:col-span-6 rounded-2xl border border-[#141413]/14 bg-[#F5F3EC] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#5E5D59]">
              <span>РИС. V.1 · ПИРАМИДАЛЬНЫЙ НЕЙРОН (СЛОЙ V)</span>
              <span className={effectiveShaftIntact ? 'text-[#0D7A5F] font-semibold' : 'text-[#FC4109] font-semibold'}>
                {isPropofolInfusing
                  ? '● АНЕСТЕТИК ИДЁТ К СТВОЛУ…'
                  : effectiveShaftIntact
                    ? '● СТВОЛ СВЯЗАН'
                    : '✕ СТВОЛ РАЗОРВАН'}
              </span>
            </div>

            <div className="my-4 relative">
              <svg viewBox="0 0 420 350" className="w-full h-[300px] md:h-[325px] block">
                {/* Cortical layer hairlines (Layers I - V) */}
                <line x1="12" y1="96" x2="408" y2="96" stroke="rgba(20,20,19,0.10)" strokeDasharray="3 4" />
                <line x1="12" y1="226" x2="408" y2="226" stroke="rgba(20,20,19,0.10)" strokeDasharray="3 4" />

                <text x="14" y="34" fill="#5E5D59" fontSize="11" fontFamily="JetBrains Mono Variable, monospace">
                  СЛОЙ I · ВЕРХНЯЯ АНТЕННА
                </text>
                <text x="14" y="52" fill="#004EDF" fontSize="11.5" fontWeight="600" fontFamily="JetBrains Mono Variable, monospace">
                  ПРОГНОЗЫ МОЗГА (ГЛ. III)
                </text>

                <text x="14" y="286" fill="#5E5D59" fontSize="11" fontFamily="JetBrains Mono Variable, monospace">
                  СЛОЙ V · НИЖНЯЯ АНТЕННА
                </text>
                <text
                  x="14"
                  y="304"
                  fill={effectiveNeedleDown ? '#141413' : '#7C7A73'}
                  fontSize="11.5"
                  fontWeight="600"
                  fontFamily="JetBrains Mono Variable, monospace"
                >
                  {effectiveNeedleDown ? 'СЫРОЙ СИГНАЛ МИРА (ВКЛ)' : 'ВНЕШНИЙ МИР ОТКЛЮЧЁН'}
                </text>

                {/* Psilocybin 5-HT2A Cross-Cortical Hyperconnectivity Arcs (visually distinct from Wake!) */}
                {mode.id === 'psilocybin' && (
                  <g fill="none" stroke="#C84319" strokeDasharray="4 4" opacity="0.62">
                    <path d="M 212 24 C 248 2, 336 2, 372 22" strokeWidth="1.4" />
                    <path d="M 206 54 C 244 82, 326 82, 366 56" strokeWidth="1.3" />
                    <path d="M 234 123 C 266 104, 310 104, 342 139" strokeWidth="1.15" />
                    <circle cx="284" cy="52" r={34 + Math.sin(phaseTick * 4) * 6} strokeWidth="1.2" opacity="0.45" />
                  </g>
                )}

                {/* Expressive Cajal Botanical-Ink Apical Tuft */}
                <g
                  stroke={!effectiveShaftIntact ? '#8E8B83' : '#141413'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                >
                  <path d="M 284 108 C 283 92, 282 82, 266 64 C 252 50, 236 39, 212 24" strokeWidth="2.1" />
                  <path d="M 284 108 C 286 91, 290 78, 308 60 C 326 44, 346 34, 372 22" strokeWidth="2.1" />
                  <path d="M 284 96 C 283 72, 286 48, 284 18" strokeWidth="1.75" />
                  <path d="M 262 60 C 244 58, 224 62, 206 54" strokeWidth="1.35" />
                  <path d="M 244 45 C 242 32, 246 24, 240 14" strokeWidth="1.15" />
                  <path d="M 228 34 C 218 36, 209 42, 200 40" strokeWidth="0.95" opacity="0.85" />
                  <path d="M 308 60 C 326 58, 344 64, 366 56" strokeWidth="1.35" />
                  <path d="M 332 42 C 336 30, 334 21, 342 13" strokeWidth="1.15" />
                  <path d="M 285 52 C 272 42, 265 30, 264 17" strokeWidth="1.1" />
                  <path d="M 285 48 C 299 38, 306 28, 311 16" strokeWidth="1.1" />
                  <path d="M 352 30 C 366 32, 378 36, 388 34" strokeWidth="0.95" opacity="0.85" />
                  <path d="M 284 136 C 266 130, 250 132, 234 123" strokeWidth="1.15" opacity="0.72" />
                  <path d="M 284 152 C 304 146, 322 148, 342 139" strokeWidth="1.15" opacity="0.72" />
                  <path d="M 284 204 C 264 200, 248 206, 232 199" strokeWidth="1.05" opacity="0.65" />
                  <path d="M 284 210 C 304 207, 320 212, 338 205" strokeWidth="1.05" opacity="0.65" />
                  {[
                    [236, 39], [250, 52], [220, 59], [268, 33], [302, 33], [326, 46], [348, 59], [358, 28],
                  ].map(([sx, sy]) => (
                    <circle
                      key={`${sx}-${sy}`}
                      cx={sx}
                      cy={sy}
                      r={mode.id === 'psilocybin' ? '2.4' : '1.4'}
                      fill={mode.id === 'psilocybin' ? '#C84319' : !effectiveShaftIntact ? '#8E8B83' : '#141413'}
                      stroke="none"
                      opacity="0.82"
                    />
                  ))}
                </g>

                {/* Central Apical Coupling Shaft */}
                {effectiveShaftIntact ? (
                  <g>
                    <path
                      d="M 284 106 C 282 146, 286 188, 284 232"
                      fill="none"
                      stroke="#141413"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    {/* Live action-potential sparks racing along intact Ca2+ trunk */}
                    {[0, 0.34, 0.68].map((offset) => {
                      const t = (phaseTick * 0.45 + offset) % 1;
                      const cy = 110 + t * 118;
                      return (
                        <circle
                          key={offset}
                          cx="284"
                          cy={cy}
                          r={mode.id === 'psilocybin' ? 5.2 : 4}
                          fill={activeAccent}
                          opacity={0.92}
                        />
                      );
                    })}
                    {/* Incoming crimson GABA-A Propofol ring sliding down to the Ca2+ junction during the 2.0s countdown! */}
                    {isPropofolInfusing && (
                      <g>
                        <circle
                          cx={224 + infusionProgress * 60}
                          cy={173}
                          r="8"
                          fill="#FC4109"
                          fillOpacity="0.28"
                          stroke="#FC4109"
                          strokeWidth="2"
                        />
                        <text
                          x="198"
                          y="176"
                          textAnchor="end"
                          fill="#FC4109"
                          fontSize="10"
                          fontWeight="700"
                          fontFamily="JetBrains Mono Variable, monospace"
                        >
                          ТОРМОЗ ГАМК-А →
                        </text>
                      </g>
                    )}
                  </g>
                ) : (
                  /* BROKEN COUPLING SHAFT UNDER PROPOFOL ANESTHESIA! */
                  <g>
                    <path d="M 284 106 C 283 122, 284 136, 284 150" fill="none" stroke="#8E8B83" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M 284 196 C 285 210, 284 222, 284 232" fill="none" stroke="#8E8B83" strokeWidth="2.8" strokeLinecap="round" />
                    {isPropofolSnapping && (
                      <circle cx="284" cy="173" r="24" fill="#FC4109" fillOpacity="0.32" />
                    )}
                    <path d="M 264 164 L 304 182 M 304 164 L 264 182" stroke="#FC4109" strokeWidth="2.6" strokeLinecap="round" />
                    <text
                      x="314"
                      y="178"
                      fill="#FC4109"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="JetBrains Mono Variable, monospace"
                    >
                      Ca²⁺ РАЗРЫВ
                    </text>
                  </g>
                )}

                {/* Organic Cajal Pyramidal Soma */}
                <path
                  d="M 284 224 C 291 242, 299 258, 309 274 C 292 278, 276 278, 259 274 C 269 258, 277 242, 284 224 Z"
                  fill={effectiveShaftIntact ? activeAccent : '#8E8B83'}
                  fillOpacity="0.18"
                  stroke="#141413"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                <circle cx="284" cy="259" r="5.5" fill="none" stroke="#141413" strokeWidth="1" opacity="0.45" />

                {/* Basal Dendrites & Axon */}
                <g stroke={effectiveNeedleDown ? '#141413' : '#9E9B93'} strokeLinecap="round" fill="none">
                  <path d="M 264 273 C 246 282, 232 292, 206 312" strokeWidth="1.8" />
                  <path d="M 244 285 C 228 286, 214 290, 200 286" strokeWidth="1.2" />
                  <path d="M 234 293 C 232 308, 238 318, 234 330" strokeWidth="1.2" />
                  <path d="M 304 273 C 322 282, 338 292, 366 314" strokeWidth="1.8" />
                  <path d="M 326 285 C 344 286, 358 290, 376 286" strokeWidth="1.2" />
                  <path d="M 336 294 C 338 308, 332 318, 336 330" strokeWidth="1.2" />
                  <path
                    d="M 284 277 C 283 298, 286 316, 284 336"
                    strokeWidth="1.6"
                    strokeDasharray={effectiveNeedleDown ? undefined : '4 4'}
                  />
                </g>

                {effectiveShaftIntact && (
                  <circle
                    cx="284"
                    cy="50"
                    r={22 + Math.sin(phaseTick * 3) * 4}
                    fill="none"
                    stroke={activeAccent}
                    strokeWidth="1.4"
                    opacity="0.42"
                  />
                )}
              </svg>
            </div>

            <div className="pt-3 border-t border-[#141413]/10 flex items-center justify-between font-mono-tech text-[10.5px] text-[#5E5D59]">
              <span>Suzuki & Larkum · Cell (2020)</span>
              <span>Стиль туши: С. Рамон-и-Кахаль</span>
            </div>
          </div>

          {/* RIGHT PAGE (6 cols): Minimalist Dieter Rams (Braun) Laboratory Turntable-Oscilloscope */}
          <div className="lg:col-span-6 rounded-2xl border border-[#141413]/14 bg-[#EFECE3] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#5E5D59]">
              <span>ПРИБОР V.2 · ОСЦИЛЛОГРАФ DIETER RAMS</span>
              <span className="font-semibold" style={{ color: activeAccent }}>
                {isPropofolInfusing ? 'ИНФУЗИЯ · 10… 9… 8…' : mode.complexityLabel}
              </span>
            </div>

            {/* Dieter Rams Turntable Platter + Articulated Graphite Tonearm */}
            <div className="my-4 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              <div className="sm:col-span-6 flex items-center justify-center">
                <svg viewBox="0 0 240 220" className="w-56 h-52 block overflow-visible">
                  <rect x="10" y="10" width="220" height="200" rx="16" fill="#FAF9F5" stroke="#141413" strokeWidth="1.2" strokeOpacity="0.16" />

                  <g
                    style={{
                      transformOrigin: '102px 98px',
                      transform: effectivePlatterSpinning ? `rotate(${(phaseTick * 36) % 360}deg)` : 'rotate(0deg)',
                    }}
                  >
                    <circle cx="102" cy="98" r="66" fill="#1C1C1B" />
                    <circle cx="102" cy="98" r="55" fill="none" stroke="rgba(250,249,245,0.12)" strokeWidth="1" />
                    <circle cx="102" cy="98" r="43" fill="none" stroke="rgba(250,249,245,0.14)" strokeWidth="1" />
                    <circle cx="102" cy="98" r="31" fill="none" stroke="rgba(250,249,245,0.12)" strokeWidth="1" />
                    <line x1="102" y1="36" x2="102" y2="50" stroke="#FC4109" strokeWidth="2.2" strokeLinecap="round" />
                    <circle cx="102" cy="98" r="19" fill={activeAccent} />
                    <circle cx="102" cy="98" r="3.6" fill="#FAF9F5" />
                  </g>

                  <g
                    style={{
                      transformOrigin: '198px 42px',
                      transform: `rotate(${tonearmRotation}deg)`,
                      transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <circle cx="198" cy="42" r="12.5" fill="#E6E3D8" stroke="#1C1C1B" strokeWidth="1.6" />
                    <circle cx="198" cy="42" r="4.2" fill="#1C1C1B" />
                    <path d="M 198 42 L 194 130 L 175 152" fill="none" stroke="#1C1C1B" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="166" y="147" width="14" height="8" rx="2" transform="rotate(-32 173 151)" fill="#FC4109" />
                  </g>

                  <circle cx="208" cy="191" r="4.2" fill={effectiveNeedleDown ? '#0D7A5F' : '#FC4109'} />
                  <text x="196" y="195" textAnchor="end" fill="#4A4945" fontSize="10.5" fontWeight="500" fontFamily="JetBrains Mono Variable, monospace">
                    {effectiveNeedleDown ? 'ИГЛА НА ДИСКЕ' : 'ИГЛА ПОДНЯТА'}
                  </text>
                </svg>
              </div>

              <div className="sm:col-span-6 space-y-3">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-tech text-[10px] uppercase tracking-[0.12em] font-semibold text-[#FAF9F5]"
                  style={{ backgroundColor: activeAccent }}
                >
                  <span>{isPropofolInfusing ? `НАРКОЗ · ${infusionCountdown}` : mode.badge}</span>
                </div>

                <h3 className="font-display font-bold text-[19px] leading-snug text-[#141413]">
                  {mode.headline}
                </h3>

                <p className="text-[13.5px] leading-[1.58] text-[#3B3A37]">{mode.description}</p>

                {mode.cinemaWhisper && (
                  <p className="font-serif-editorial italic text-[13.5px] leading-[1.5] text-[#141413] pl-3 border-l-2 border-[#FC4109]">
                    {mode.cinemaWhisper}
                  </p>
                )}
              </div>
            </div>

            {/* Live Oscilloscope Strip — plain Russian, zero premature PCI* numbers! */}
            <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 px-4 py-3">
              <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59] mb-1">
                <span>СИГНАЛ КОРЫ · СЛОЖНОСТЬ ВОЛНЫ</span>
                <span style={{ color: activeAccent }} className="font-semibold">
                  {effectiveShaftIntact ? 'СОЗНАНИЕ ГОРИТ (БОГАТАЯ ВОЛНА)' : 'ТИШИНА · ВОЛНА СХЛОПНУЛАСЬ'}
                </span>
              </div>
              <svg viewBox="0 0 320 68" className="w-full h-14 block">
                <line x1="0" y1="34" x2="320" y2="34" stroke="rgba(20,20,19,0.08)" strokeDasharray="3 3" />
                <path
                  d={wavePath}
                  fill="none"
                  stroke={activeAccent}
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* SMOOTH "LIGHTS-OUT" ATMOSPHERIC TRANSITION BRIDGE (#FAF9F5 -> #111419) INTO DARK CHAPTER VI! */}
      <div
        className="mt-16 pt-14 pb-16 px-5 md:px-12 lg:px-20"
        style={{
          background: 'linear-gradient(180deg, #FAF9F5 0%, #DFDDD5 28%, #282C34 72%, #111419 100%)',
        }}
      >
        <div className="max-w-[1240px] mx-auto pt-8 flex flex-wrap items-center justify-between gap-6">
          <p className="font-serif-editorial italic text-[17.5px] leading-[1.55] text-[#E3E7EF] max-w-2xl">
            Вы только что видели, как сознание может ярко гореть внутри парализованного тела (как в REM-сне с поднятой иглой). Как врачу в реанимации услышать этот тихий свет у пациента в коме?
          </p>
          <button
            type="button"
            onClick={onNextChapter}
            className="v6-pill h-11 px-5 rounded-full bg-[#FAF9F5] hover:bg-[#EAE7DD] text-[#141413] font-mono-tech text-[11px] uppercase tracking-[0.12em] font-semibold inline-flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Войти в реанимацию · Глава VI</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#0D7A5F]" />
          </button>
        </div>
      </div>
    </section>
  );
}
