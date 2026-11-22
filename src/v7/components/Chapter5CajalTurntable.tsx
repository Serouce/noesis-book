import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useExplorer, type TurntableMode } from '../context/ExplorerContext';
import { DossierTrigger } from '../../v9/components/NoesisDossierSheet';
import { LabHonestyBadge } from '../../v9/components/NoesisInstrumentFrame';
import { useViewportRaf } from '../../v9/hooks/useViewportRaf';
import { ruTypo } from '../../v9/utils/ruTypo';

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
    shortExplain: 'Ясный день · оба канала открыты',
    badge: 'БАЛАНС',
    complexityLabel: 'ВЫСОКАЯ СЛОЖНОСТЬ',
    needleDown: true,
    shaftIntact: true,
    headline: 'Обе антенны замкнуты в одну живую вспышку',
    description:
      'Нижние ветви клетки принимают сырой сигнал мира, верхние — внутренние прогнозы мозга из Акта II. Когда оба потока встречаются в стволе, клетка запускает сложную живую волну — и вы осознаёте мир.',
    accent: '#004EDF',
  },
  {
    id: 'nrem',
    label: 'Глубокий сон (NREM)',
    shortExplain: 'Медленные дельта-волны · без снов',
    badge: 'ДЕЛЬТА · 1 ГЦ',
    complexityLabel: 'ХОРОМ В УНИСОН',
    needleDown: false,
    shaftIntact: true,
    headline: 'Мозг не выключен — он бьёт как медленный колокол',
    description:
      'В глубоком сне без сновидений (NREM) нейроны живы и активны, но начинают вспыхивать и замолкать хором, в один монотонный ритм (0.5–2 Гц). Сложный диалог распадается в однообразный гул — внутри темно.',
    accent: '#5E5D59',
  },
  {
    id: 'rem',
    label: 'REM-сон / Кетамин',
    shortExplain: 'Диссоциативный сон · тело отрезано',
    badge: 'CLUB SILENCIO',
    complexityLabel: 'ВЫСОКАЯ СЛОЖНОСТЬ',
    needleDown: false,
    shaftIntact: true,
    headline: 'Игла поднята с диска — но музыка продолжает играть',
    description:
      'В фазе быстрых снов (REM) или под субанестетической дозой кетамина (диссоциативный анестетик) вход от органов чувств отрезан: игла отрывается от пластинки. Но верхняя петля коры сама раскачивает нейрон — внутри неподвижного тела полыхают ярчайшие сны.',
    cinemaWhisper: '«No hay banda» — оркестра нет, внешнего входа нет, а мелодия опыта звучит.',
    accent: '#0D7A5F',
  },
  {
    id: 'psilocybin',
    label: 'Псилоцибин',
    shortExplain: 'Психоделик · рецепторы 5-HT2A',
    badge: 'ГИПЕРСВЯЗНОСТЬ',
    complexityLabel: 'СВЕРХВЫСОКАЯ СЛОЖНОСТЬ',
    needleDown: true,
    shaftIntact: true,
    headline: 'Верхние фильтры ослабевают — мозг сбрасывает шаблоны',
    description:
      'Молекула псилоцибина (классический психоделик) связывается с серотониновыми рецепторами 5-HT2A на верхней антенне этого нейрона. Привычные прогнозы (приоры) слабеют, и далёкие зоны коры начинают перекликаться напрямую (Ort et al., 2023; Siegel et al., Nature 2024).',
    accent: '#C84319',
  },
  {
    id: 'propofol',
    label: 'Пропофол (Наркоз)',
    shortExplain: 'Общий хирургический наркоз',
    badge: 'ОБРЫВ КАНАЛА',
    complexityLabel: 'ТИШИНА · НЕТ СВЯЗНОСТИ',
    needleDown: false,
    shaftIntact: false,
    headline: 'Ствол нейрона рвётся пополам — плёнка обрывается посреди такта',
    description:
      'Пропофол не «усыпляет» органы чувств — сигналы всё ещё приходят в кору. Но через главные тормозные каналы (ГАМК-А) он обрывает связку между антеннами клетки (по модели дендритной развязки Suzuki & Larkum, Cell 2020): мир не «темнеет» — он мгновенно прекращается.',
    cinemaWhisper: 'Считайте вслух: 10… 9… 8… — и резкий обрыв в тишину прямо посреди ноты.',
    accent: '#FC4109',
  },
];

/**
 * ACT IV · CHAPTER V: "Клеточный транзистор и тишина" (Bug #8 Fixes!):
 * 1. ZERO background React re-renders! Removed `setPhaseTick` rAF loop completely —
 *    all platter/spark/oscilloscope animation runs inside `useViewportRaf` mutating SVG refs directly (0% offscreen CPU!).
 * 2. Added 5th crucial state: Deep Sleep (NREM) — bridges the gap between Wake, REM, and Propofol!
 * 3. Muted-First Propofol drama works at 100% impact even with sound muted + crisp 6ms Web Audio cut when opt-in audio is ON.
 * 4. Level-2 Archival Dossier trigger ("larkum-dendrites").
 */
export function Chapter5CajalTurntable({ onNextChapter: _onNextChapter }: Chapter5CajalTurntableProps) {
  const { state, setTurntableMode } = useExplorer();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [infusionStage, setInfusionStage] = useState<'idle' | 'infusing' | 'snapping' | 'settled'>('idle');
  const [infusionCountdown, setInfusionCountdown] = useState<string>('10');
  const [infusionProgress, setInfusionProgress] = useState(0);
  const [cutBlackPhase, setCutBlackPhase] = useState<'none' | 'pure' | 'pulse'>('none');

  const stageSectionRef = useRef<HTMLElement | null>(null);
  const platterRef = useRef<SVGGElement | null>(null);
  const wavePathRef = useRef<SVGPathElement | null>(null);
  const tuftPulseRef = useRef<SVGCircleElement | null>(null);
  const psiloHaloRef = useRef<SVGCircleElement | null>(null);
  const sparkRefs = useRef<Array<SVGCircleElement | null>>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null);
  const timersRef = useRef<number[]>([]);
  const infusionRafRef = useRef<number>(0);

  const mode = MODES.find((m) => m.id === state.turntableMode) ?? MODES[0];

  const isPropofolInfusing = mode.id === 'propofol' && infusionStage === 'infusing';
  const isPropofolSnapping = mode.id === 'propofol' && infusionStage === 'snapping';
  const effectiveShaftIntact = mode.id === 'propofol' ? isPropofolInfusing : mode.shaftIntact;
  const effectiveNeedleDown = mode.id === 'propofol' ? isPropofolInfusing : mode.needleDown;
  const effectivePlatterSpinning = mode.id !== 'propofol' || isPropofolInfusing;

  const animStateRef = useRef({
    modeId: mode.id,
    isPropofolInfusing,
    effectiveShaftIntact,
    effectivePlatterSpinning,
  });
  animStateRef.current = {
    modeId: mode.id,
    isPropofolInfusing,
    effectiveShaftIntact,
    effectivePlatterSpinning,
  };

  // Zero-Re-Render Sleeping Animation Loop (ONLY active while Chapter V is in viewport!)
  const tickInstrument = useCallback((nowMs: number) => {
    const { modeId, isPropofolInfusing: infusing, effectivePlatterSpinning: spinning } =
      animStateRef.current;
    const phase = nowMs * 0.0022;

    // 1. Platter rotation (slows dramatically in NREM delta, freezes on Propofol)
    if (platterRef.current) {
      if (!spinning) {
        platterRef.current.style.transform = 'rotate(0deg)';
      } else {
        const speed = modeId === 'nrem' ? 10 : modeId === 'psilocybin' ? 46 : 36;
        platterRef.current.style.transform = `rotate(${((phase * speed) % 360).toFixed(1)}deg)`;
      }
    }

    // 2. Action-potential sparks along Cajal apical trunk
    const sparkSpeed = modeId === 'nrem' ? 0.16 : modeId === 'psilocybin' ? 0.65 : 0.45;
    sparkRefs.current.forEach((dot, idx) => {
      if (!dot) return;
      const offset = idx * 0.34;
      const cy = 110 + ((phase * sparkSpeed + offset) % 1) * 118;
      dot.setAttribute('cy', cy.toFixed(1));
    });

    // 3. Apical tuft pulse & psilocybin halo
    if (tuftPulseRef.current) {
      const r = 22 + Math.sin(phase * (modeId === 'nrem' ? 1.2 : 3)) * 4;
      tuftPulseRef.current.setAttribute('r', r.toFixed(1));
    }
    if (psiloHaloRef.current) {
      const r = 34 + Math.sin(phase * 4) * 6;
      psiloHaloRef.current.setAttribute('r', r.toFixed(1));
    }

    // 4. Live SVG Oscilloscope waveform (80 points, 0 React re-renders!)
    if (wavePathRef.current) {
      const pts: string[] = [];
      const w = 320;
      const mid = 34;
      for (let i = 0; i <= 80; i += 1) {
        const x = (i / 80) * w;
        let y = mid;
        if (modeId === 'propofol' && !infusing) {
          y = mid + Math.sin(i * 0.14 + phase * 0.7) * 2.6;
        } else if (modeId === 'nrem') {
          // Huge slow stereotyped delta wave (~1 Hz unison bell!)
          y = mid + Math.sin(i * 0.16 + phase * 1.1) * 20;
        } else if (modeId === 'wake' || infusing) {
          y =
            mid +
            Math.sin(i * 0.35 + phase * 3.2) * 14 +
            Math.cos(i * 0.78 - phase * 2.1) * 7;
        } else if (modeId === 'rem') {
          y =
            mid +
            Math.sin(i * 0.42 + phase * 3.8) * 16 +
            Math.sin(i * 1.05 + phase * 1.9) * 8;
        } else {
          // Psilocybin hyper-coherent multi-harmonic interference
          y =
            mid +
            Math.sin(i * 0.5 + phase * 4.4) * 15 +
            Math.cos(i * 1.25 - phase * 3.5) * 10 +
            Math.sin(i * 2.1 + phase * 2.2) * 5;
        }
        pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      wavePathRef.current.setAttribute('d', pts.join(' '));
    }
  }, []);

  useViewportRaf(stageSectionRef, tickInstrument, { enabled: true });

  const clearScheduledPropofol = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (infusionRafRef.current) {
      cancelAnimationFrame(infusionRafRef.current);
      infusionRafRef.current = 0;
    }
  };

  // Clean up audio & timers on unmount (including Act switch!)
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
        oscNodesRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => undefined);
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Pure Web Audio API chord engine (strictly opt-in, 6ms anti-click Sopranos cutoff!)
  useEffect(() => {
    const hardCutAudio = () => {
      if (oscNodesRef.current) {
        const { oscs, gain } = oscNodesRef.current;
        const now = audioCtxRef.current?.currentTime ?? 0;
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0.0001, now + 0.006);
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

    if (!soundEnabled || (mode.id === 'propofol' && !isPropofolInfusing)) {
      if (mode.id === 'propofol') hardCutAudio();
      else softStopAudio();
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    gain.gain.value = mode.id === 'nrem' ? 0.025 : 0.032;
    gain.connect(ctx.destination);

    const freqs =
      mode.id === 'wake' || isPropofolInfusing
        ? [220, 277.18, 329.63]
        : mode.id === 'nrem'
          ? [110, 110.6] // Deep slow unison hum
          : mode.id === 'rem'
            ? [246.94, 369.99, 493.88]
            : [220, 277.18, 329.63, 415.3, 493.88];

    const oscs = freqs.map((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = mode.id === 'rem' || mode.id === 'nrem' ? 'sine' : idx % 2 === 0 ? 'sine' : 'triangle';
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
    setTurntableMode(nextMode);

    if (nextMode === 'propofol') {
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

      const tSnap = window.setTimeout(() => {
        setInfusionStage('snapping');
      }, 2000);

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

  const tonearmRotation = effectiveNeedleDown ? 17 : -9;
  const activeAccent = isPropofolInfusing ? '#004EDF' : mode.accent;

  return (
    <section
      id="ch-5"
      ref={stageSectionRef}
      className="relative bg-[#FAF9F5] text-[#141413] pt-24 pb-0 md:pt-28"
      aria-label="Глава 06 — Клеточный транзистор и тишина"
    >
      {/* FULL-SCREEN HARD CUT-TO-BLACK (Muted-First dramatic choreography!) */}
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
          <span className="text-[#FC4109] font-semibold">АКТ III · ПОД ЧЕРЕПОМ · ГЛАВА 06</span>
          <span>КЛЕТОЧНЫЙ ТРАНЗИСТОР · ×1000 · стр. 90</span>
        </div>

        {/* Opening Editorial Prose */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Выключатель сознания</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                внутри одной-единственной клетки.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              {ruTypo(
                'Нейробиолог Мэтью Ларкум открыл поразительный клеточный переключатель: у ',
              )}
              <strong className="font-semibold text-[#141413]">пирамидального нейрона 5-го слоя</strong> две антенны. Нижняя слушает сырой мир, а верхняя — те самые{' '}
              <em>внутренние прогнозы из Акта II</em>. Пока ствол между ними цел — сознание горит.
            </p>
          </div>
        </div>

        {/* Explicit 1-Line Key + Strictly Opt-In Audio Button */}
        <div className="mt-8 rounded-xl bg-[#F3F1E9] border border-[#141413]/12 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-[13.5px] text-[#2F2E2B] flex-1 min-w-0 flex flex-wrap items-center gap-2">
            <LabHonestyBadge badge="reconstruction" />
            <span>
              <strong className="text-[#141413]">Как читать прибор:</strong>{' '}
              <strong className="text-[#004EDF]">игла на диске</strong> = нижняя антенна (вход мира), а{' '}
              <strong className="text-[#FC4109]">волна на осциллографе</strong> = внутренний опыт. Всё наглядно работает и без звука; при желании включите синтезатор.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`v6-pill h-9 px-4 rounded-full border font-mono-tech text-[10.5px] uppercase tracking-[0.08em] inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
              soundEnabled
                ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                : 'bg-[#FAF9F5] hover:bg-[#FC4109]/10 text-[#141413] border-[#FC4109]/55 shadow-[0_2px_10px_rgba(252,65,9,0.14)]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#34D399]" /> : <VolumeX className="w-3.5 h-3.5 text-[#FC4109]" />}
            <span>{soundEnabled ? 'Звук включён' : 'Включить звук'}</span>
          </button>
        </div>

        {/* 5 CLEAR MODE CARDS (Sleek 2x2 + full-width Propofol finale on phones!) */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
          {MODES.map((m) => {
            const active = m.id === mode.id;
            const isPropofol = m.id === 'propofol';
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMode(m.id)}
                className={`v6-pill text-left px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl border cursor-pointer transition-all ${
                  isPropofol ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  active
                    ? isPropofol
                      ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109] shadow-[0_10px_28px_rgba(252,65,9,0.28)]'
                      : 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                    : 'bg-[#F3F1E9] hover:bg-[#E9E6DC] text-[#141413] border-[#141413]/14'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-display font-bold text-[13.5px] leading-tight">{m.label}</span>
                </div>
                <div
                  className={`font-mono-tech text-[9px] uppercase tracking-wider mt-1 ${
                    active ? 'opacity-90' : 'text-[#FC4109]'
                  }`}
                >
                  {m.badge}
                </div>
                <div
                  className={`text-[11.5px] leading-snug mt-1 ${
                    active ? 'text-[#FAF9F5]/82' : 'text-[#5E5D59]'
                  }`}
                >
                  {m.shortExplain}
                </div>
              </button>
            );
          })}
        </div>

        {/* LIVE PROPOFOL 2.2s INFUSION COUNTDOWN BANNER (Muted-First Drama!) */}
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

        {/* UNIFIED 2-FOCUS SWISS INSTRUMENT SPREAD */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT PAGE: Cajal Pyramidal Neuron */}
          <div className="lg:col-span-6 rounded-2xl border border-[#141413]/14 bg-[#F5F3EC] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59]">
              <span className="whitespace-nowrap">РИС. III.1 · НЕЙРОН СЛОЯ V</span>
              <span
                className={`whitespace-nowrap ${
                  effectiveShaftIntact ? 'text-[#0D7A5F] font-semibold' : 'text-[#FC4109] font-semibold'
                }`}
              >
                {isPropofolInfusing
                  ? '● АНЕСТЕТИК ИДЁТ…'
                  : mode.id === 'nrem'
                    ? '● УНИСОН 1 ГЦ'
                    : effectiveShaftIntact
                      ? '● СТВОЛ СВЯЗАН'
                      : '✕ РАЗРЫВ СТВОЛА'}
              </span>
            </div>

            <div className="my-4 relative">
              <svg viewBox="0 0 420 350" className="w-full h-[300px] md:h-[325px] block">
                <line x1="12" y1="96" x2="408" y2="96" stroke="rgba(20,20,19,0.10)" strokeDasharray="3 4" />
                <line x1="12" y1="226" x2="408" y2="226" stroke="rgba(20,20,19,0.10)" strokeDasharray="3 4" />

                <text x="14" y="34" fill="#5E5D59" fontSize="11" fontFamily="JetBrains Mono Variable, monospace">
                  СЛОЙ I · ВЕРХНЯЯ АНТЕННА
                </text>
                <text x="14" y="52" fill="#004EDF" fontSize="11.5" fontWeight="600" fontFamily="JetBrains Mono Variable, monospace">
                  ПРОГНОЗЫ МОЗГА (АКТ II)
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

                {mode.id === 'psilocybin' && (
                  <g fill="none" stroke="#C84319" strokeDasharray="4 4" opacity="0.62">
                    <path d="M 212 24 C 248 2, 336 2, 372 22" strokeWidth="1.4" />
                    <path d="M 206 54 C 244 82, 326 82, 366 56" strokeWidth="1.3" />
                    <path d="M 234 123 C 266 104, 310 104, 342 139" strokeWidth="1.15" />
                    <circle ref={psiloHaloRef} cx="284" cy="52" r="34" strokeWidth="1.2" opacity="0.45" />
                  </g>
                )}

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

                {effectiveShaftIntact ? (
                  <g>
                    <path
                      d="M 284 106 C 282 146, 286 188, 284 232"
                      fill="none"
                      stroke="#141413"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    {[0, 1, 2].map((idx) => (
                      <circle
                        key={idx}
                        ref={(el) => {
                          sparkRefs.current[idx] = el;
                        }}
                        cx="284"
                        cy={115 + idx * 40}
                        r={mode.id === 'psilocybin' ? 5.2 : 4}
                        fill={activeAccent}
                        opacity={0.92}
                      />
                    ))}
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

                <path
                  d="M 284 224 C 291 242, 299 258, 309 274 C 292 278, 276 278, 259 274 C 269 258, 277 242, 284 224 Z"
                  fill={effectiveShaftIntact ? activeAccent : '#8E8B83'}
                  fillOpacity="0.18"
                  stroke="#141413"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                <circle cx="284" cy="259" r="5.5" fill="none" stroke="#141413" strokeWidth="1" opacity="0.45" />

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
                    ref={tuftPulseRef}
                    cx="284"
                    cy="50"
                    r="22"
                    fill="none"
                    stroke={activeAccent}
                    strokeWidth="1.4"
                    opacity="0.42"
                  />
                )}
              </svg>
            </div>

            <div className="pt-3 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10.5px] text-[#5E5D59]">
              <span>Suzuki &amp; Larkum · Cell (2020)</span>
              <span>Стиль туши: С. Рамон-и-Кахаль</span>
            </div>
          </div>

          {/* RIGHT PAGE: Dieter Rams Laboratory Turntable-Oscilloscope */}
          <div className="lg:col-span-6 rounded-2xl border border-[#141413]/14 bg-[#EFECE3] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59]">
              <span className="whitespace-nowrap">ПРИБОР III.2 · DIETER RAMS</span>
              <span className="font-semibold whitespace-nowrap" style={{ color: activeAccent }}>
                {isPropofolInfusing ? 'ИНФУЗИЯ · 10… 9… 8…' : mode.complexityLabel}
              </span>
            </div>

            <div className="my-4 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              <div className="sm:col-span-6 flex items-center justify-center">
                <svg viewBox="0 0 240 220" className="w-56 h-52 block overflow-visible">
                  <rect x="10" y="10" width="220" height="200" rx="16" fill="#FAF9F5" stroke="#141413" strokeWidth="1.2" strokeOpacity="0.16" />

                  <g
                    ref={platterRef}
                    style={{
                      transformOrigin: '102px 98px',
                      transform: 'rotate(0deg)',
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
                  {ruTypo(mode.headline)}
                </h3>

                <p className="text-[13.5px] leading-[1.58] text-[#3B3A37]">{ruTypo(mode.description)}</p>

                {mode.cinemaWhisper && (
                  <p className="font-serif-editorial italic text-[13.5px] leading-[1.5] text-[#141413] pl-3 border-l-2 border-[#FC4109]">
                    {ruTypo(mode.cinemaWhisper)}
                  </p>
                )}
              </div>
            </div>

            {/* Live Oscilloscope Strip (Zero React Re-Renders!) */}
            <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 px-4 py-3">
              <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59] mb-1">
                <span>СИГНАЛ КОРЫ · СЛОЖНОСТЬ ВОЛНЫ</span>
                <span style={{ color: activeAccent }} className="font-semibold">
                  {mode.id === 'nrem'
                    ? 'МЕДЛЕННЫЙ КОЛОКОЛ (БЕЗ СНОВ)'
                    : effectiveShaftIntact
                      ? 'СОЗНАНИЕ ГОРИТ (БОГАТАЯ ВОЛНА)'
                      : 'ТИШИНА · ВОЛНА СХЛОПНУЛАСЬ'}
                </span>
              </div>
              <svg viewBox="0 0 320 68" className="w-full h-14 block">
                <line x1="0" y1="34" x2="320" y2="34" stroke="rgba(20,20,19,0.08)" strokeDasharray="3 3" />
                <path
                  ref={wavePathRef}
                  d="M 0 34 L 320 34"
                  fill="none"
                  stroke={activeAccent}
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Archival Dossier Trigger below spread */}
        <div className="mt-6 flex justify-end">
          <DossierTrigger
            dossier="larkum-dendrites"
            label="Как общие анестетики обрывают кальциевый спайк (Suzuki & Larkum, Cell 2020)"
            meta="Архивное досье III.3 · Уровень 2"
          />
        </div>
      </div>

      {/* SMOOTH "LIGHTS-OUT" ATMOSPHERIC DECOMPRESSION INTO DARK ACT IV BRIDGE (single CTA lives in ActBottomTurn below!) */}
      <div
        aria-hidden="true"
        className="mt-12 h-28 w-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #FAF9F5 0%, #DCD9CF 30%, #242830 74%, #0E1117 100%)',
        }}
      />
    </section>
  );
}
