import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Play, RotateCcw, Sparkles } from 'lucide-react';
import type { Lang } from '../data/content';
import { syncCanvasHiDpi, usePrefersReducedMotion } from './labs/labUtils';

export interface PerceptualExperimentProps {
  lang: Lang;
}

export function PerceptualExperiment({ lang }: PerceptualExperimentProps) {
  const isRu = lang === 'ru';
  const reducedMotion = usePrefersReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [revealV1Truth, setRevealV1Truth] = useState<boolean>(false);
  const [fixationSeconds, setFixationSeconds] = useState<number>(0);
  const [holdingFixation, setHoldingFixation] = useState<boolean>(false);

  // Track 4-second fixation timer when user holds button or clicks "Start 4s Fixation Test"
  useEffect(() => {
    if (!holdingFixation) return;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      if (elapsed >= 5.5) {
        setFixationSeconds(5.5);
        setHoldingFixation(false);
      } else {
        setFixationSeconds(elapsed);
      }
    }, 60);
    return () => window.clearInterval(timer);
  }, [holdingFixation]);

  const liveRef = useRef({
    isRunning,
    revealV1Truth,
    holdingFixation,
    fixationSeconds,
    reducedMotion,
    isRu,
  });
  liveRef.current = {
    isRunning,
    revealV1Truth,
    holdingFixation,
    fixationSeconds,
    reducedMotion,
    isRu,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let rafId = 0;
    let angle = 0;
    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const {
        isRunning: run,
        revealV1Truth: v1Mode,
        holdingFixation: fixing,
        fixationSeconds: fixSec,
        reducedMotion: rm,
        isRu: ru,
      } = liveRef.current;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = container.getBoundingClientRect();
      const { w, h, dpr } = syncCanvasHiDpi(canvas, rect.width, rect.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cx = w / 2;
      const cy = h / 2;
      const minDim = Math.min(w, h);
      const fieldR = minDim * 0.41;

      if (run && !rm) {
        angle += dt * 1.35;
      }

      // Pitch dark neuro-optical background
      ctx.fillStyle = '#090908';
      ctx.fillRect(0, 0, w, h);

      // Subtle radial depth vignette
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, fieldR * 1.25);
      bgGrad.addColorStop(0, 'rgba(42, 179, 166, 0.05)');
      bgGrad.addColorStop(0.7, 'rgba(13, 13, 12, 0.02)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 1. Rotating Blue/Teal Cross Mask (Motion-Induced Blindness global motion surface)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const gridStep = Math.max(22, minDim * 0.078);
      const crossArm = gridStep * 0.24;
      ctx.strokeStyle = v1Mode
        ? 'rgba(42, 179, 166, 0.22)'
        : 'rgba(59, 130, 246, 0.62)';
      ctx.lineWidth = 1.65;

      for (let gx = -fieldR; gx <= fieldR; gx += gridStep) {
        for (let gy = -fieldR; gy <= fieldR; gy += gridStep) {
          const dist = Math.hypot(gx, gy);
          if (dist > fieldR || dist < 18) continue;
          ctx.beginPath();
          ctx.moveTo(gx - crossArm, gy);
          ctx.lineTo(gx + crossArm, gy);
          ctx.moveTo(gx, gy - crossArm);
          ctx.lineTo(gx, gy + crossArm);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 2. Three High-Salience Yellow-Amber Target Dots (forming an equilateral triangle around center)
      // Genuine Motion-Induced Blindness (Bonneh et al., Nature 2001) causes stationary high-contrast yellow
      // targets surrounded by a dark protection zone to vanish when fixating the center of a rotating grid.
      // During the guided 4-second fixation test, we also illustrate the perceptual suppression dip around 2.8–4.8s
      // unless "V1 Retinal Truth" is toggled on!
      const targetDist = fieldR * 0.54;
      const targetAngles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

      targetAngles.forEach((ta, idx) => {
        const tx = cx + Math.cos(ta) * targetDist;
        const ty = cy + Math.sin(ta) * targetDist;

        // Dark protection halo around target (critical for genuine MIB illusion!)
        ctx.beginPath();
        ctx.arc(tx, ty, 17, 0, Math.PI * 2);
        ctx.fillStyle = '#090908';
        ctx.fill();

        // Compute simulated/guided perceptual suppression factor during the 4s test
        let alpha = 1.0;
        if (fixing && !v1Mode && fixSec > 1.8) {
          const phase = (fixSec - 1.8) * 1.7 + idx * 0.45;
          const wave = Math.max(0, Math.sin(phase));
          alpha = Math.max(0.06, 1 - wave * 0.92);
        }

        // Outer glow
        const dotGrad = ctx.createRadialGradient(tx, ty, 1, tx, ty, 13);
        dotGrad.addColorStop(0, `rgba(251, 191, 36, ${alpha})`);
        dotGrad.addColorStop(0.45, `rgba(245, 158, 11, ${alpha * 0.65})`);
        dotGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = dotGrad;
        ctx.beginPath();
        ctx.arc(tx, ty, 13, 0, Math.PI * 2);
        ctx.fill();

        // Crisp core dot
        ctx.beginPath();
        ctx.arc(tx, ty, 5.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 243, 199, ${alpha})`;
        ctx.fill();

        // In V1 Retinal Truth mode, draw surgical targeting brackets proving photons never stopped
        if (v1Mode) {
          ctx.strokeStyle = '#2AB3A6';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(tx - 12, ty - 12, 24, 24);
          ctx.font = '500 9.5px "JetBrains Mono", monospace';
          ctx.fillStyle = '#2AB3A6';
          ctx.textAlign = 'center';
          ctx.fillText(
            ru ? `V1: 100% ФОТОНОВ` : `V1: 100% PHOTONS`,
            tx,
            ty + 25
          );
        }
      });

      // 3. Central Red Fixation Crosshair (User looks strictly here!)
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.006);
      ctx.beginPath();
      ctx.arc(cx, cy, 12 + pulse * 3, 0, Math.PI * 2);
      ctx.strokeStyle = fixing
        ? 'rgba(224, 90, 71, 0.85)'
        : 'rgba(224, 90, 71, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#E05A47';
      ctx.fill();

      // Fixation progress arc during 4-second guided test
      if (fixing) {
        const prog = Math.min(1, fixSec / 4.2);
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          20,
          -Math.PI / 2,
          -Math.PI / 2 + prog * Math.PI * 2
        );
        ctx.strokeStyle = '#F3F2EE';
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // Top & Bottom HUD Telemetry
      ctx.font = w < 440 ? '500 8.5px "JetBrains Mono", monospace' : '500 9.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8E8B82';
      ctx.fillText(
        ru
          ? 'СЛЕПОТА, ВЫЗВАННАЯ ДВИЖЕНИЕМ (BONNEH ET AL., NATURE 2001)'
          : 'MOTION-INDUCED BLINDNESS (BONNEH ET AL., NATURE 2001)',
        14,
        22
      );

      ctx.textAlign = 'left';
      ctx.fillStyle = v1Mode ? '#2AB3A6' : '#E05A47';
      ctx.fillText(
        v1Mode
          ? ru
            ? 'РЕЖИМ V1: ФИЗИЧЕСКИЙ СИГНАЛ НА СЕТЧАТКЕ (ТОЧКИ НЕ ИСЧЕЗАЮТ)'
            : 'V1 MODE: PHYSICAL RETINAL INPUT (DOTS NEVER VANISH)'
          : fixing
            ? ru
              ? `СМОТРИТЕ ТОЛЬКО НА КРАСНУЮ ТОЧКУ В ЦЕНТРЕ · ${fixSec.toFixed(1)} c`
              : `KEEP EYES LOCKED ON RED CENTER · ${fixSec.toFixed(1)} s`
            : ru
              ? 'СМОТРИТЕ В КРАСНЫЙ ЦЕНТР 4 СЕКУНДЫ — ЖЁЛТЫЕ ТОЧКИ ИСЧЕЗНУТ'
              : 'STARE AT RED CENTER FOR 4 SECONDS — YELLOW DOTS WILL VANISH',
        14,
        h - 14
      );

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <section
      id="perceptual-experiment"
      aria-labelledby="mib-title"
      className="relative my-16 mx-auto max-w-[1520px] px-4 sm:my-20 sm:px-7 lg:px-10"
    >
      <div className="overflow-hidden rounded-3xl border border-white/12 bg-[#10100F] p-6 text-[#F3F2EE] shadow-2xl sm:p-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12">
          {/* Left: Invitation, Controls & Live Neurobiological Explanation */}
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E05A47]/40 bg-[#E05A47]/15 px-3 py-1 font-mono text-[0.65rem] font-semibold tracking-[0.11em] text-[#E05A47] uppercase">
                <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
                {isRu
                  ? 'ЖИВОЙ ЭКСПЕРИМЕНТ НА ВАШЕМ ЗРЕНИИ · 4 СЕКУНДЫ'
                  : 'LIVE EXPERIMENT ON YOUR OWN VISION · 4 SECONDS'}
              </span>
            </div>

            <h2
              id="mib-title"
              className="font-display text-2xl font-semibold tracking-[-0.03em] leading-[1.14] text-[#F3F2EE] sm:text-3xl"
            >
              {isRu
                ? 'Посмотрите, как ваш мозг стирает реальность прямо сейчас'
                : 'Watch your own brain erase physical reality right now'}
            </h2>

            <p className="mt-4 text-[0.98rem] leading-[1.72] text-[#B8B5AD]">
              {isRu
                ? 'Прежде чем спорить о теориях сознания, убедитесь на собственном опыте: видеть глазами и осознавать — не одно и то же. Нажмите кнопку запуска и неотрывно смотрите только на центральную красную точку в течение 4 секунд.'
                : 'Before debating theories of consciousness, experience the gap yourself: retinal registration and conscious awareness are two different things. Press start and lock your gaze strictly on the central red dot for 4 seconds.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setRevealV1Truth(false);
                  setFixationSeconds(0);
                  setHoldingFixation(true);
                }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#E05A47] px-5 py-2.5 font-mono text-[0.73rem] font-semibold tracking-[0.06em] text-[#F3F2EE] uppercase transition-transform hover:-translate-y-0.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                <span>
                  {holdingFixation
                    ? isRu
                      ? `Смотрите в центр... (${fixationSeconds.toFixed(1)} с)`
                      : `Stare at center... (${fixationSeconds.toFixed(1)} s)`
                    : isRu
                      ? 'Запустить 4-секундный тест'
                      : 'Start 4-Second Fixation Test'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHoldingFixation(false);
                  setRevealV1Truth((v) => !v);
                }}
                aria-pressed={revealV1Truth}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 font-mono text-[0.71rem] font-medium transition-colors ${
                  revealV1Truth
                    ? 'border-[#2AB3A6] bg-[#2AB3A6]/20 text-[#2AB3A6]'
                    : 'border-white/15 bg-white/[0.04] text-[#D6D3CB] hover:border-white/30'
                }`}
              >
                {revealV1Truth ? (
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {revealV1Truth
                    ? isRu
                      ? 'Показан физический сигнал V1'
                      : 'Showing V1 Retinal Signal'
                    : isRu
                      ? 'Раскрыть обман: что видит кора V1?'
                      : 'Reveal Truth: What does V1 see?'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsRunning((r) => !r)}
                aria-label={isRu ? 'Пауза/Пуск вращения' : 'Pause/Resume rotation'}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-[#B8B5AD] hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <motion.div
              layout
              className="mt-6 rounded-2xl border border-white/10 bg-[#161614] p-4"
            >
              <div className="font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-[#2AB3A6] uppercase">
                {revealV1Truth
                  ? isRu
                    ? 'ФАКТ НЕЙРОБИОЛОГИИ: ФОТОНЫ НИКУДА НЕ ИСЧЕЗАЛИ'
                    : 'NEUROBIOLOGICAL FACT: THE PHOTONS NEVER DISAPPEARED'
                  : isRu
                    ? 'ЧТО ПРОИСХОДИТ В ВАШЕМ МОЗГЕ ПРЯМО СЕЙЧАС?'
                    : 'WHAT IS HAPPENING INSIDE YOUR BRAIN RIGHT NOW?'}
              </div>
              <p className="mt-1.5 text-[0.86rem] leading-[1.64] text-[#D6D3CB]">
                {revealV1Truth
                  ? isRu
                    ? 'Функциональная МРТ и электрофизиология показывают: когда жёлтые точки «исчезают» для вас, нейроны вашей первичной зрительной коры (V1) продолжают активно реагировать на них! Но глобальное рабочее пространство и механизмы внимания отсекают неподвижный сигнал как «ошибку предсказуемого фона».'
                    : 'fMRI and single-unit recordings prove that even when the yellow dots vanish from your experience, neurons in your primary visual cortex (V1) keep firing strongly! Yet higher-level workspace and predictive mechanisms suppress them from conscious access.'
                  : isRu
                    ? 'Три ярких жёлтых круга неподвижны, но вращающаяся синяя решётка заставляет зрительную систему перераспределить веса предсказаний. Спустя 2–4 секунды фиксации точки начинают мигать и полностью стираются из вашего сознательного опыта — до первой микросаккады глаз.'
                    : 'The three bright yellow dots remain physically constant, yet the rotating blue lattice forces your visual system to update its perceptual hypotheses. After 2–4 seconds of steady fixation, the targets literally vanish from your conscious world until your eyes make a micro-saccade.'}
              </p>
            </motion.div>
          </div>

          {/* Right: Spacious 750x420 High-Contrast Interactive Optical Canvas */}
          <div
            ref={containerRef}
            className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-white/15 bg-[#090908] sm:h-[420px]"
          >
            <canvas
              ref={canvasRef}
              className="block h-full w-full cursor-crosshair"
              onClick={() => {
                setRevealV1Truth(false);
                setFixationSeconds(0);
                setHoldingFixation(true);
              }}
              aria-label={
                isRu
                  ? 'Интерактивный оптический стимул: слепота, вызванная движением'
                  : 'Interactive optical stimulus: motion-induced blindness'
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
