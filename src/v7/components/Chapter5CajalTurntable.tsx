import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Volume2, VolumeX } from 'lucide-react';
import { useExplorer, type TurntableMode } from '../context/ExplorerContext';

interface Chapter5CajalTurntableProps {
  onNextChapter: () => void;
}

interface ModeSpec {
  id: TurntableMode;
  label: string;
  badge: string;
  pci: number;
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
    badge: 'БАЛАНС',
    pci: 0.56,
    needleDown: true,
    shaftIntact: true,
    headline: 'Обе антенны замкнуты в одну вспышку',
    description:
      'Нижние дендриты принимают сырой сигнал мира, верхние — прогнозы мозга из Главы III. Когда они встречаются в стволе пирамидального нейрона Ларкума, клетка даёт пачку импульсов, а проигрыватель рисует сложную живую волну.',
    accent: '#004EDF',
  },
  {
    id: 'rem',
    label: 'REM-сон / Кетамин',
    badge: 'CLUB SILENCIO',
    pci: 0.51,
    needleDown: false,
    shaftIntact: true,
    headline: 'Игла поднята — но симфония продолжает играть',
    description:
      'Вход от внешнего мира отрезан, графитовая игла физически отрывается от пластинки. Но верхняя петля коры сама запускает клетку: PCI* остаётся высоким, и внутри неподвижного тела разворачиваются ярчайшие сны.',
    cinemaWhisper: '«No hay banda» — оркестра нет, внешнего сигнала нет, но музыка всё равно звучит.',
    accent: '#0D7A5F',
  },
  {
    id: 'psilocybin',
    label: 'Псилоцибин',
    badge: 'ГИПЕРСВЯЗНОСТЬ',
    pci: 0.64,
    needleDown: true,
    shaftIntact: true,
    headline: 'Верхние фильтры ослабевают — мир течёт напрямую',
    description:
      'Агонисты 5-HT2A-рецепторов ослабляют жёсткий диктат привычных приоров. Новые зоны коры начинают перекликаться между собой — индекс сложности поднимается выше обычного бодрствования (Ort et al., 2023).',
    accent: '#C84319',
  },
  {
    id: 'propofol',
    label: 'Пропофол (Наркоз)',
    badge: 'ОБРЫВ КАНАЛА',
    pci: 0.18,
    needleDown: false,
    shaftIntact: false,
    headline: 'Ствол нейрона рвётся пополам — и плёнка обрывается',
    description:
      'Анестетик отключает кальциевую связку в середине ствола пирамидального нейрона (Suzuki & Larkum, Cell 2020). Верхняя и нижняя антенны перестают слышать друг друга: субъективный мир не «темнеет» — он мгновенно прекращается.',
    cinemaWhisper: 'Без плавного затухания — мгновенный обрыв прямо посреди такта.',
    accent: '#FC4109',
  },
];

/**
 * CHAPTER V: "Клеточный транзистор и тишина"
 * ORIGINAL BOOK MECHANIC #6: Cajal Vector-Ink Layer-5 Neuron (closing the loop to Ch III!)
 * paired with a minimalist Dieter Rams (Braun) Turntable-Oscilloscope:
 * - REM / Ketamine: tonearm physically lifts OFF the platter while the PCI* symphony still plays!
 * - Propofol: Larkum coupling shaft snaps + ruthless 1.2s Cut-to-Black with Guardrail #2 (0.6s pulse)
 * - Guardrail #3: Opt-in Web Audio synth (muted by default, 0 external files!)
 */
export function Chapter5CajalTurntable({ onNextChapter }: Chapter5CajalTurntableProps) {
  const { state, setTurntableMode } = useExplorer();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [cutBlackPhase, setCutBlackPhase] = useState<'none' | 'pure' | 'pulse'>('none');
  const [phaseTick, setPhaseTick] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null);
  const cutTimersRef = useRef<number[]>([]);

  const mode = MODES.find((m) => m.id === state.turntableMode) ?? MODES[0];

  // Smooth oscilloscope & neural spark animation loop
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      setPhaseTick(t * 0.0022);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Clean up audio & cut-to-black timers on unmount
  useEffect(() => {
    return () => {
      cutTimersRef.current.forEach((id) => window.clearTimeout(id));
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

  // Opt-in pure Web Audio API harmonic tone (strictly muted unless user clicks "Включить звук")
  useEffect(() => {
    const stopAudio = () => {
      if (oscNodesRef.current) {
        const { oscs, gain } = oscNodesRef.current;
        try {
          gain.gain.setTargetAtTime(0.0001, audioCtxRef.current?.currentTime ?? 0, 0.03);
        } catch {
          // ignore
        }
        oscs.forEach((o) => {
          try {
            o.stop((audioCtxRef.current?.currentTime ?? 0) + 0.08);
          } catch {
            // ignore
          }
        });
        oscNodesRef.current = null;
      }
    };

    if (!soundEnabled || mode.id === 'propofol') {
      // On Propofol -> abrupt dead cut (zero fade!)
      if (oscNodesRef.current && mode.id === 'propofol') {
        oscNodesRef.current.oscs.forEach((o) => {
          try {
            o.stop();
          } catch {
            // ignore
          }
        });
        oscNodesRef.current = null;
      } else {
        stopAudio();
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
    stopAudio();

    const gain = ctx.createGain();
    gain.gain.value = 0.028;
    gain.connect(ctx.destination);

    const freqs =
      mode.id === 'wake'
        ? [220, 329.63]
        : mode.id === 'rem'
          ? [246.94, 369.99, 493.88] // Dreamy open fifth shimmer even with tonearm lifted!
          : [220, 277.18, 329.63, 440]; // Hyper-coherent psilocybin chord

    const oscs = freqs.map((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = mode.id === 'rem' ? 'sine' : idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start();
      return osc;
    });

    oscNodesRef.current = { oscs, gain };
    return stopAudio;
  }, [soundEnabled, mode.id]);

  const handleSelectMode = (nextMode: TurntableMode) => {
    cutTimersRef.current.forEach((id) => window.clearTimeout(id));
    cutTimersRef.current = [];
    setTurntableMode(nextMode);

    if (nextMode === 'propofol') {
      // GUARDRAIL #2: Hard Sopranos Cut-to-Black for 1.25s with calm telemetry pulse at 0.55s so user knows it's art, NOT a crash!
      setCutBlackPhase('pure');
      const t1 = window.setTimeout(() => setCutBlackPhase('pulse'), 550);
      const t2 = window.setTimeout(() => setCutBlackPhase('none'), 1450);
      cutTimersRef.current.push(t1, t2);
    } else {
      setCutBlackPhase('none');
    }
  };

  // Generate live SVG oscilloscope waveform path for the Braun turntable readout
  const wavePath = (() => {
    const pts: string[] = [];
    const w = 320;
    const mid = 34;
    for (let i = 0; i <= 80; i += 1) {
      const x = (i / 80) * w;
      let y = mid;
      if (mode.id === 'propofol') {
        y = mid + Math.sin(i * 0.14 + phaseTick * 0.8) * 3.5; // Flat stereotyped slow wave
      } else if (mode.id === 'wake') {
        y =
          mid +
          Math.sin(i * 0.35 + phaseTick * 3.2) * 14 +
          Math.cos(i * 0.78 - phaseTick * 2.1) * 7;
      } else if (mode.id === 'rem') {
        // Vivid dream symphony despite lifted needle!
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

  // Tonearm angle: resting ON vinyl (+16deg) vs physically LIFTED OFF vinyl (-8deg)
  const tonearmRotation = mode.needleDown ? 17 : -9;
  const platterSpinning = mode.id !== 'propofol';

  return (
    <section
      id="ch-5"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28"
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
              <span>PCI* 0.18 · NO INTEGRATION · КАНАЛ ЛАРКУМА ПРЕРВАН</span>
            </div>
          )}
        </div>
      )}

      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ЧАСТЬ II · ПОД ЧЕРЕПОМ · ГЛАВА V</span>
          <span>КЛЕТОЧНЫЙ ТРАНЗИСТОР · ×1000 · стр. 68</span>
        </div>

        {/* Opening Editorial Prose (Closing the Golden Loop back to Chapter III!) */}
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
              Нейробиолог Мэтью Ларкум открыл потрясающий клеточный механизм: у{' '}
              <strong className="font-semibold text-[#141413]">пирамидального нейрона 5-го слоя</strong> две антенны. Нижняя слушает сырой мир, а верхняя — те самые{' '}
              <em>внутренние прогнозы из Главы III</em>. Пока ствол между ними цел — сознание горит.
            </p>
          </div>
        </div>

        {/* 4 CLEAN MOLECULAR DIMMER PILLS + OPT-IN AUDIO BUTTON */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {MODES.map((m) => {
              const active = m.id === mode.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMode(m.id)}
                  className={`v6-pill h-11 px-4 md:px-5 rounded-full border text-[13.5px] font-medium inline-flex items-center gap-2.5 cursor-pointer ${
                    active
                      ? m.id === 'propofol'
                        ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109] shadow-[0_10px_28px_rgba(252,65,9,0.28)]'
                        : 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                      : 'bg-[#F3F1E9] hover:bg-[#E9E6DC] text-[#141413] border-[#141413]/14'
                  }`}
                >
                  <span>{m.label}</span>
                  <span
                    className={`font-mono-tech text-[11px] ${
                      active ? 'opacity-85' : 'text-[#5E5D59]'
                    }`}
                  >
                    {m.pci.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Guardrail #3: Strictly Opt-In Web Audio Synth */}
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className={`v6-pill h-10 px-4 rounded-full border font-mono-tech text-[11px] uppercase tracking-[0.08em] inline-flex items-center gap-2 cursor-pointer ${
              soundEnabled
                ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                : 'bg-[#FAF9F5] hover:bg-[#F0EEE6] text-[#5E5D59] border-[#141413]/15'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#FC4109]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Звук включён' : '♪ Включить звук'}</span>
          </button>
        </div>

        {/* UNIFIED 2-FOCUS SWISS INSTRUMENT SPREAD: LEFT = CAJAL NEURON · RIGHT = DIETER RAMS TURNTABLE */}
        <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT PAGE (6 cols): Santiago Ramon y Cajal Vector-Ink Layer-5 Pyramidal Neuron */}
          <div className="lg:col-span-6 rounded-2xl border border-[#141413]/14 bg-[#F5F3EC] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#5E5D59]">
              <span>РИС. V.1 · ПИРАМИДАЛЬНЫЙ НЕЙРОН (СЛОЙ V)</span>
              <span className={mode.shaftIntact ? 'text-[#0D7A5F] font-semibold' : 'text-[#FC4109] font-semibold'}>
                {mode.shaftIntact ? '● СТВОЛ СВЯЗАН' : '✕ СТВОЛ РАЗОРВАН'}
              </span>
            </div>

            <div className="my-4 relative">
              <svg viewBox="0 0 420 350" className="w-full h-[300px] md:h-[320px] block">
                {/* Cortical layer hairlines (Layers I - V) */}
                <line x1="16" y1="88" x2="404" y2="88" stroke="rgba(20,20,19,0.09)" strokeDasharray="3 4" />
                <line x1="16" y1="226" x2="404" y2="226" stroke="rgba(20,20,19,0.09)" strokeDasharray="3 4" />

                <text x="18" y="34" fill="#5E5D59" fontSize="10" fontFamily="JetBrains Mono Variable, monospace">
                  СЛОЙ I · ВЕРХНЯЯ АНТЕННА
                </text>
                <text x="18" y="49" fill="#004EDF" fontSize="10.5" fontWeight="600" fontFamily="JetBrains Mono Variable, monospace">
                  ПРОГНОЗЫ МОЗГА (ИЗ ГЛ. III)
                </text>

                <text x="18" y="294" fill="#5E5D59" fontSize="10" fontFamily="JetBrains Mono Variable, monospace">
                  СЛОЙ V · НИЖНЯЯ АНТЕННА
                </text>
                <text
                  x="18"
                  y="309"
                  fill={mode.needleDown ? '#141413' : '#9E9B93'}
                  fontSize="10.5"
                  fontWeight="600"
                  fontFamily="JetBrains Mono Variable, monospace"
                >
                  {mode.needleDown ? 'СЫРОЙ СИГНАЛ МИРА (ВКЛ)' : 'ВНЕШНИЙ МИР ОТКЛЮЧЁН'}
                </text>

                {/* Apical Tuft (Cajal crisp ink branches) */}
                <g
                  stroke={mode.id === 'propofol' ? '#8E8B83' : '#141413'}
                  strokeLinecap="round"
                  fill="none"
                >
                  <path d="M 225 110 L 225 76 L 172 34 M 225 76 L 278 34 M 225 76 L 225 26" strokeWidth="2.1" />
                  <path d="M 196 53 L 160 56 M 254 53 L 292 58 M 204 42 L 208 20 M 248 42 L 244 20" strokeWidth="1.35" />
                  <path d="M 172 34 L 146 24 M 278 34 L 306 24" strokeWidth="1.1" />
                </g>

                {/* Central Apical Coupling Shaft (SNAPS IN HALF ON PROPOFOL!) */}
                {mode.shaftIntact ? (
                  <g>
                    <line x1="225" y1="108" x2="225" y2="236" stroke="#141413" strokeWidth="3.2" strokeLinecap="round" />
                    {/* Live action-potential sparks racing along intact Ca2+ trunk */}
                    {[0, 0.34, 0.68].map((offset) => {
                      const t = (phaseTick * 0.45 + offset) % 1;
                      const cy = 112 + t * 120;
                      return (
                        <circle
                          key={offset}
                          cx="225"
                          cy={cy}
                          r={mode.id === 'psilocybin' ? 5.2 : 4}
                          fill={mode.accent}
                          opacity={0.92}
                        />
                      );
                    })}
                  </g>
                ) : (
                  /* BROKEN COUPLING SHAFT UNDER PROPOFOL ANESTHESIA! */
                  <g>
                    <line x1="225" y1="108" x2="225" y2="152" stroke="#8E8B83" strokeWidth="2.8" strokeLinecap="round" />
                    <line x1="225" y1="196" x2="225" y2="236" stroke="#8E8B83" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M 204 166 L 246 182 M 246 166 L 204 182" stroke="#FC4109" strokeWidth="2.4" strokeLinecap="round" />
                    <text
                      x="258"
                      y="178"
                      fill="#FC4109"
                      fontSize="10.5"
                      fontWeight="600"
                      fontFamily="JetBrains Mono Variable, monospace"
                    >
                      Ca²⁺ РАЗРЫВ
                    </text>
                  </g>
                )}

                {/* Pyramidal Soma (Cell Body) */}
                <path
                  d="M 225 232 L 246 270 L 204 270 Z"
                  fill={mode.shaftIntact ? mode.accent : '#8E8B83'}
                  fillOpacity="0.18"
                  stroke="#141413"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />

                {/* Basal Dendrites (Bottom Sensory Input) */}
                <g
                  stroke={mode.needleDown ? '#141413' : '#B5B2A8'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                >
                  <path d="M 208 268 L 166 292 L 146 312 M 166 292 L 178 320" />
                  <path d="M 242 268 L 284 292 L 304 312 M 284 292 L 270 320" />
                  <path d="M 225 270 L 225 326" strokeDasharray={mode.needleDown ? undefined : '4 4'} />
                </g>

                {/* Top-down prediction glow rings in REM & Psilocybin */}
                {mode.shaftIntact && (
                  <circle
                    cx="225"
                    cy="52"
                    r={18 + Math.sin(phaseTick * 3) * 4}
                    fill="none"
                    stroke={mode.accent}
                    strokeWidth="1.5"
                    opacity="0.45"
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
              <span className="font-semibold text-[#141413]">PCI* = {mode.pci.toFixed(2)}</span>
            </div>

            {/* Dieter Rams Turntable Platter + Articulated Graphite Tonearm */}
            <div className="my-4 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              <div className="sm:col-span-6 flex items-center justify-center">
                <svg viewBox="0 0 240 220" className="w-56 h-52 block overflow-visible">
                  {/* Minimalist matte plinth frame */}
                  <rect x="10" y="10" width="220" height="200" rx="16" fill="#FAF9F5" stroke="#141413" strokeWidth="1.2" strokeOpacity="0.16" />

                  {/* Vinyl Platter (spins smoothly unless Propofol stops everything!) */}
                  <g
                    style={{
                      transformOrigin: '104px 110px',
                      transform: platterSpinning ? `rotate(${(phaseTick * 36) % 360}deg)` : 'rotate(0deg)',
                    }}
                  >
                    <circle cx="104" cy="110" r="76" fill="#1C1C1B" />
                    <circle cx="104" cy="110" r="64" fill="none" stroke="rgba(250,249,245,0.12)" strokeWidth="1" />
                    <circle cx="104" cy="110" r="50" fill="none" stroke="rgba(250,249,245,0.14)" strokeWidth="1" />
                    <circle cx="104" cy="110" r="36" fill="none" stroke="rgba(250,249,245,0.12)" strokeWidth="1" />
                    {/* Subtle index notch so rotation is physically visible */}
                    <line x1="104" y1="38" x2="104" y2="54" stroke="#FC4109" strokeWidth="2.2" strokeLinecap="round" />
                    {/* Label center */}
                    <circle cx="104" cy="110" r="22" fill={mode.accent} />
                    <circle cx="104" cy="110" r="4" fill="#FAF9F5" />
                  </g>

                  {/* Articulated Graphite Tonearm (physically LIFTS OFF platter in REM / Club Silencio!) */}
                  <g
                    style={{
                      transformOrigin: '198px 46px',
                      transform: `rotate(${tonearmRotation}deg)`,
                      transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <circle cx="198" cy="46" r="13" fill="#E6E3D8" stroke="#1C1C1B" strokeWidth="1.6" />
                    <circle cx="198" cy="46" r="4.5" fill="#1C1C1B" />
                    <path d="M 198 46 L 194 140 L 176 164" fill="none" stroke="#1C1C1B" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="167" y="159" width="14" height="8" rx="2" transform="rotate(-32 174 163)" fill="#FC4109" />
                  </g>

                  {/* Tonearm status micro-lamp */}
                  <circle cx="198" cy="186" r="4" fill={mode.needleDown ? '#0D7A5F' : '#FC4109'} />
                  <text x="186" y="189" textAnchor="end" fill="#5E5D59" fontSize="8.5" fontFamily="JetBrains Mono Variable, monospace">
                    {mode.needleDown ? 'ИГЛА НА ДИСКЕ' : 'ИГЛА ПОДНЯТА'}
                  </text>
                </svg>
              </div>

              {/* Right Side Readout inside Braun Panel */}
              <div className="sm:col-span-6 space-y-3">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-tech text-[10px] uppercase tracking-[0.12em] font-semibold text-[#FAF9F5]"
                  style={{ backgroundColor: mode.accent }}
                >
                  <span>{mode.badge}</span>
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

            {/* Live Oscilloscope Strip at bottom of Braun instrument */}
            <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 px-4 py-3">
              <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59] mb-1">
                <span>СИГНАЛ КОРЫ · СЛОЖНОСТЬ ВОЛНЫ</span>
                <span style={{ color: mode.accent }} className="font-semibold">
                  {mode.pci >= 0.31 ? 'ВЫШЕ ПОРОГА СОЗНАНИЯ (0.31)' : 'НИЖЕ ПОРОГА · ТИШИНА'}
                </span>
              </div>
              <svg viewBox="0 0 320 68" className="w-full h-14 block">
                <line x1="0" y1="34" x2="320" y2="34" stroke="rgba(20,20,19,0.08)" strokeDasharray="3 3" />
                <path
                  d={wavePath}
                  fill="none"
                  stroke={mode.accent}
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Dramatic Domino Bridge directly into DARK CHAPTER VI (ICU!) */}
        <div className="mt-14 pt-6 border-t border-[#141413]/12 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[17px] text-[#2D2C2A] max-w-2xl">
            Если сознание может ярко гореть внутри неподвижного тела (как в REM-сне с поднятой иглой) или мгновенно рваться — как врачу в реанимации узнать, жив ли разум у пациента в коме?
          </p>
          <button
            type="button"
            onClick={onNextChapter}
            className="v6-pill h-11 px-5 rounded-full bg-[#111419] text-[#FAF9F5] font-mono-tech text-[11px] uppercase tracking-[0.12em] inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Войти в реанимацию · Глава VI</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#34D399]" />
          </button>
        </div>
      </div>
    </section>
  );
}
