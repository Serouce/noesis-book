import { useCallback, useEffect, useRef, useState } from 'react';
import { Zap, RotateCcw } from 'lucide-react';
import { useExplorer } from '../../v7/context/ExplorerContext';
import { NoesisInstrumentFrame } from '../components/NoesisInstrumentFrame';
import { useViewportRaf } from '../hooks/useViewportRaf';
import {
  drawOpticalSpikeDot,
  drawSwissGrid,
  releaseCanvasMemory,
  resizeHiDpiCanvas,
} from '../canvas/noesisCanvasKit';
import { ruTypo } from '../utils/ruTypo';

interface PulseParticle {
  t: number; // 0..1+
  lane: number;
}

interface CorticalEdge {
  from: number;
  to: number;
}

// 14 cortical rich-club hubs with dense recurrent loops (right canvas)
const CORTEX_NODES: Array<{ x: number; y: number }> = [
  { x: 0.16, y: 0.25 },
  { x: 0.36, y: 0.18 },
  { x: 0.58, y: 0.22 },
  { x: 0.82, y: 0.24 },
  { x: 0.22, y: 0.52 },
  { x: 0.46, y: 0.44 },
  { x: 0.68, y: 0.48 },
  { x: 0.86, y: 0.56 },
  { x: 0.18, y: 0.78 },
  { x: 0.40, y: 0.74 },
  { x: 0.62, y: 0.78 },
  { x: 0.80, y: 0.82 },
];

const CORTEX_EDGES: CorticalEdge[] = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 0, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 6 },
  { from: 6, to: 7 },
  { from: 4, to: 8 },
  { from: 8, to: 9 },
  { from: 9, to: 10 },
  { from: 10, to: 11 },
  // Recurrent feedback & long-range cross-cortical loops!
  { from: 1, to: 5 },
  { from: 5, to: 2 },
  { from: 2, to: 6 },
  { from: 6, to: 3 },
  { from: 5, to: 9 },
  { from: 9, to: 6 },
  { from: 6, to: 10 },
  { from: 10, to: 7 },
  { from: 7, to: 2 },
  { from: 11, to: 5 },
  { from: 9, to: 0 },
];

/**
 * ACT I · CHAPTER 01: "Парадокс 69 миллиардов"
 * - Opens with Leibniz's Mill (1714) -> Cerebellum (69B) vs Cortex (16B) paradox (Azevedo 2009; Yu et al., Brain 2014).
 * - Local analog physics (-70 -> +30 mV, zero von Neumann bus cliché, zero premature 6 cortical layers!).
 * - Instrument 01: Side-by-side live Canvas 2D impulse comparator (feed-forward modular lanes vs recurrent cortical web).
 */
export function Act1CerebellumParadox() {
  const { state, setCerebellumTested } = useExplorer();
  const [pulseCount, setPulseCount] = useState(0);
  const [phaseReadout, setPhaseReadout] = useState<'idle' | 'active' | 'settled'>('idle');

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pulseStartRef = useRef<number | null>(null);
  const lanesRef = useRef<PulseParticle[]>([]);

  const fireImpulse = () => {
    pulseStartRef.current = performance.now();
    lanesRef.current = Array.from({ length: 7 }, (_, i) => ({ t: 0, lane: i }));
    setPulseCount((c) => c + 1);
    setPhaseReadout('active');
    setCerebellumTested(true);
  };

  const resetSim = () => {
    pulseStartRef.current = null;
    lanesRef.current = [];
    setPhaseReadout('idle');
  };

  const drawFrame = useCallback((nowMs: number) => {
    const canvas = canvasRef.current;
    const box = stageRef.current;
    if (!canvas || !box) return;

    const { ctx, width, height } = resizeHiDpiCanvas(canvas, box.clientWidth, box.clientHeight);
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FAF9F5';
    ctx.fillRect(0, 0, width, height);
    drawSwissGrid(ctx, width, height, 28, false);

    const isNarrow = width < 560;
    const halfW = isNarrow ? width : width / 2;
    const panelH = isNarrow ? height / 2 : height;

    const elapsed = pulseStartRef.current !== null ? (nowMs - pulseStartRef.current) / 1000 : -1;

    // Divider line
    ctx.save();
    ctx.strokeStyle = 'rgba(20, 20, 19, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isNarrow) {
      const my = Math.round(panelH) + 0.5;
      ctx.moveTo(0, my);
      ctx.lineTo(width, my);
    } else {
      const mx = Math.round(halfW) + 0.5;
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx, height);
    }
    ctx.stroke();
    ctx.restore();

    // === PANEL A: CEREBELLUM (69B — Parallel Feed-Forward Lanes, 0 Cross-Talk!) ===
    const cPadX = 28;
    const cTop = 44;
    const cBot = panelH - 26;
    const laneCount = 7;

    ctx.save();
    ctx.font = '600 10px "JetBrains Mono Variable", monospace';
    ctx.fillStyle = '#5E5D59';
    ctx.fillText('МОЗЖЕЧОК · 69 МЛРД НЕЙРОНОВ (80%)', 16, 22);
    ctx.fillStyle = elapsed >= 0 && elapsed < 0.7 ? '#004EDF' : '#7A7872';
    ctx.fillText(
      elapsed >= 0 && elapsed < 0.65
        ? 'ПРЯМОЙ ПРОГОН · 0 ПЕРЕКРЁСТНЫХ СВЯЗЕЙ'
        : elapsed >= 0.65
          ? 'СИГНАЛ ВЫШЕЛ ЗА 40 МС · ТИШИНА'
          : 'ПАРАЛЛЕЛЬНЫЕ МОДУЛИ (КОНВЕЙЕР)',
      16,
      36,
    );

    for (let i = 0; i < laneCount; i += 1) {
      const lx = cPadX + (i / (laneCount - 1)) * (halfW - cPadX * 2);
      // Isolated parallel vertical rail
      ctx.strokeStyle = 'rgba(20, 20, 19, 0.18)';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(lx, cTop);
      ctx.lineTo(lx, cBot);
      ctx.stroke();

      // 4 isolated module nodes along each lane
      for (let r = 0; r < 4; r += 1) {
        const ny = cTop + (r / 3) * (cBot - cTop);
        ctx.fillStyle = '#FAF9F5';
        ctx.strokeStyle = 'rgba(20, 20, 19, 0.42)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(lx, ny, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Fast unidirectional impulse (completes in 0.58s and dies cleanly!)
      if (elapsed >= 0 && elapsed <= 0.62) {
        const frac = Math.min(1, elapsed / 0.56);
        const py = cTop + frac * (cBot - cTop);
        drawOpticalSpikeDot(ctx, lx, py, 3.2, '#004EDF');
      }
    }
    ctx.restore();

    // === PANEL B: CEREBRAL CORTEX (16B — Dense Recurrent Reverberating Web!) ===
    const ox = isNarrow ? 0 : halfW;
    const oy = isNarrow ? panelH : 0;

    ctx.save();
    ctx.translate(ox, oy);
    ctx.font = '600 10px "JetBrains Mono Variable", monospace';
    ctx.fillStyle = '#141413';
    ctx.fillText('КОРА ПОЛУШАРИЙ · 16 МЛРД НЕЙРОНОВ (19%)', 16, 22);
    ctx.fillStyle = elapsed >= 0 && elapsed < 3.6 ? '#FC4109' : '#5E5D59';
    ctx.fillText(
      elapsed >= 0 && elapsed < 3.6
        ? 'ОБРАТНЫЕ ПЕТЛИ · ГЛОБАЛЬНОЕ ЭХО ПО СЕТИ'
        : 'ОБРАТНЫЕ ПЕТЛИ · СВЯЗНАЯ ПАУТИНА',
      16,
      36,
    );

    const mapNode = (idx: number) => ({
      x: 16 + CORTEX_NODES[idx].x * (halfW - 32),
      y: 44 + CORTEX_NODES[idx].y * (panelH - 64),
    });

    // Draw cortical edges
    for (let eIdx = 0; eIdx < CORTEX_EDGES.length; eIdx += 1) {
      const e = CORTEX_EDGES[eIdx];
      const a = mapNode(e.from);
      const b = mapNode(e.to);
      const isEchoActive = elapsed >= 0 && elapsed < 3.8;
      ctx.strokeStyle = isEchoActive
        ? 'rgba(252, 65, 9, 0.28)'
        : 'rgba(20, 20, 19, 0.16)';
      ctx.lineWidth = isEchoActive ? 1.35 : 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Reverberating multi-hop spikes racing back and forth for 3.6 seconds!
      if (elapsed >= 0 && elapsed < 3.6) {
        const delay = (eIdx % 5) * 0.11;
        if (elapsed > delay) {
          const cycle = ((elapsed - delay) * 1.15) % 1;
          const reverse = Math.floor((elapsed - delay) * 1.15) % 2 === 1;
          const f = reverse ? 1 - cycle : cycle;
          const px = a.x + (b.x - a.x) * f;
          const py = a.y + (b.y - a.y) * f;
          const fade = Math.max(0.15, 1 - elapsed / 3.8);
          ctx.save();
          ctx.globalAlpha = fade;
          drawOpticalSpikeDot(ctx, px, py, 2.6, eIdx % 3 === 0 ? '#004EDF' : '#FC4109');
          ctx.restore();
        }
      }
    }

    // Draw cortical nodes
    for (let nIdx = 0; nIdx < CORTEX_NODES.length; nIdx += 1) {
      const p = mapNode(nIdx);
      const lit = elapsed >= 0 && elapsed < 3.6 && Math.sin(elapsed * 7 + nIdx) > 0;
      ctx.fillStyle = lit ? '#FC4109' : '#FAF9F5';
      ctx.strokeStyle = lit ? '#FC4109' : '#141413';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, lit ? 4.4 : 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();

    if (elapsed > 3.7 && phaseReadout === 'active') {
      setPhaseReadout('settled');
    }
  }, [phaseReadout]);

  useViewportRaf(stageRef, drawFrame, { enabled: true });

  useEffect(() => {
    const c = canvasRef.current;
    return () => releaseCanvasMemory(c);
  }, []);

  return (
    <section
      id="ch-cerebellum"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Глава I.1 — Парадокс 69 миллиардов нейронов"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">АКТ I · ЖИВАЯ МАШИНА · ГЛАВА I.1</span>
          <span>ПАРАДОКС 69 МИЛЛИАРДОВ · стр. 08</span>
        </div>

        {/* Opening Editorial Prose + Leibniz's Mill */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="text-[clamp(32px,4.4vw,54px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">80% ваших нейронов</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                живут в полной темноте.
              </span>
            </h2>

            <p className="text-[16px] leading-[1.68] text-[#282725]">
              {ruTypo(
                'Ещё в 1714 году Готфрид Лейбниц предложил увеличить мозг до размеров мельницы и войти внутрь: вы увидите лишь шестерни, толкающие друг друга, — но нигде не найдёте самой мысли. Внутри черепа вместо шестерён трудятся ',
              )}
              <strong className="font-semibold text-[#141413]">86 миллиардов нейронов</strong>
              {ruTypo(
                ', перебрасывающихся крошечными электрическими разрядами (от −70 до +30 милливольт, мВ) в живой локальной ткани, где память и вычисление слиты в одном синапсе — живом стыке двух клеток.',
              )}
            </p>

            <p className="text-[15.5px] leading-[1.68] text-[#454440]">
              {ruTypo(
                'Кажется очевидным: чем больше нейронов — тем ярче сознание. Но нейробиология ломает эту интуицию на первом же шаге. Ровно ',
              )}
              <strong className="font-semibold text-[#141413]">69 миллиардов нейронов (80% всего мозга!)</strong>
              {ruTypo(
                ' упакованы в небольшой мозжечок у затылка — а в коре больших полушарий их всего 16 миллиардов. В 2014 году китайские врачи описали 24-летнюю пациентку, родившуюся вообще без мозжечка (Yu et al., Brain 2014): она страдала от нарушений равновесия и нечёткости речи, ',
              )}
              <strong className="font-semibold text-[#141413]">
                но её внутренний мир и ясность сознания оказались полностью сохранны.
              </strong>
            </p>

            {/* Key Architectural Takeaway Strip */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-[#F3F1E9] border border-[#141413]/12">
                <div className="font-serif-display text-[28px] leading-none text-[#004EDF]">69 млрд</div>
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59] mt-2">
                  МОЗЖЕЧОК · ПАРАЛЛЕЛЬНЫЕ МОДУЛИ
                </div>
                <p className="text-[12.5px] leading-[1.52] text-[#3F3E3A] mt-1.5">
                  Независимые каналы оттачивают точность движений, но почти не разговаривают друг с другом.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F3F1E9] border border-[#FC4109]/30">
                <div className="font-serif-display text-[28px] leading-none text-[#FC4109]">16 млрд</div>
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59] mt-2">
                  КОРА · ОБРАТНЫЕ ПЕТЛИ
                </div>
                <p className="text-[12.5px] leading-[1.52] text-[#3F3E3A] mt-1.5">
                  В четыре раза меньше клеток — но сигнал бесконечно возвращается назад, связывая весь опыт воедино.
                </p>
              </div>
            </div>
          </div>

          {/* Right 6 cols: Instrument 01 — Live Canvas Architecture Comparator */}
          <div className="lg:col-span-6">
            <NoesisInstrumentFrame
              code="ПРИБОР I.1 · АРХИТЕКТУРА ПРОТИВ КОЛИЧЕСТВА"
              badge="reconstruction"
              telemetry={
                pulseCount > 0
                  ? `ИМПУЛЬСОВ ПОДАНО: ${pulseCount}`
                  : 'СРАВНИТЕ ОТКЛИК ДВУХ СЕТЕЙ'
              }
              surface="vellum"
              footnote="Azevedo et al. (2009) · Yu et al. (Brain, 2014) · дело не в числе клеток, а в схеме связей"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={fireImpulse}
                    className="v6-pill h-10 px-5 rounded-full bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5] font-sans-ui text-[13.5px] font-medium inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#FC4109] fill-current" />
                    <span>{pulseCount > 0 ? 'Подать импульс ещё раз' : 'Подать импульс в обе сети'}</span>
                  </button>

                  {pulseCount > 0 && (
                    <button
                      type="button"
                      onClick={resetSim}
                      className="font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#5E5D59] hover:text-[#141413] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Сброс</span>
                    </button>
                  )}
                </div>

                {/* Live Canvas 2D Split Comparator */}
                <div
                  ref={stageRef}
                  className="relative w-full h-[320px] sm:h-[290px] rounded-xl overflow-hidden border border-[#141413]/15 bg-[#FAF9F5]"
                >
                  <canvas ref={canvasRef} className="w-full h-full block" />
                </div>

                {/* Crisp Verdict Readout */}
                <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 p-4 text-[13.5px] leading-[1.6] text-[#2F2E2B]">
                  {state.cerebellumTested ? (
                    <p>
                      <strong className="text-[#141413]">Видите разницу?</strong>{' '}
                      {ruTypo(
                        'В мозжечке импульс пролетает по изолированным рельсам за доли секунды и гаснет — каждая дорожка «не знает», что творится в соседней. В коре один и тот же стимул запускает многократный диалог обратных петель. Именно эта архитектура связей отличает слепой автомат от носителя опыта.',
                      )}
                    </p>
                  ) : (
                    <p className="text-[#5E5D59]">
                      {ruTypo(
                        'Нажмите кнопку выше, чтобы отправить один и тот же электрический импульс одновременно в модульный мозжечок (слева) и в кору с обратными петлями (справа).',
                      )}
                    </p>
                  )}
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>

        {/* Domino transition bridge to Ch. I.2 */}
        <div className="mt-12 pt-6 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[16px] text-[#3B3A37] max-w-[680px]">
            {ruTypo(
              'Если опыт рождается в связной коре, а не в «числе клеток», то как именно эта кора вшита в живое тело — в мышцы, волю и биение собственного сердца?',
            )}
          </p>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#FC4109]">
            ДАЛЕЕ · ГЛАВА I.2 ↓
          </span>
        </div>
      </div>
    </section>
  );
}
