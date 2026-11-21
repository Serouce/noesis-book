import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { assetUrl } from '../../v9/utils/assetUrl';
import { ruTypo } from '../../v9/utils/ruTypo';
import { useViewportRaf } from '../../v9/hooks/useViewportRaf';
import {
  drawOpticalSpikeDot,
  releaseCanvasMemory,
  resizeHiDpiCanvas,
} from '../../v9/canvas/noesisCanvasKit';

gsap.registerPlugin(ScrollTrigger);

interface GolgiCell {
  xNorm: number;
  yNorm: number;
  layer: number; // 0..4
  size: number;
  dendriteLen: number;
  lean: number;
  phase: number;
}

// Deterministic seeded Golgi/Cajal 6-layer cortical population (~240 cells, zero Math.random jitter!)
const GOLGI_CELLS: GolgiCell[] = (() => {
  const cells: GolgiCell[] = [];
  let seed = 42019;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const layerBands = [
    { layer: 0, count: 22, yMin: 0.08, yMax: 0.17, sizeMin: 1.5, sizeMax: 2.3, dLen: 0.04 },
    { layer: 1, count: 64, yMin: 0.21, yMax: 0.36, sizeMin: 2.2, sizeMax: 3.4, dLen: 0.12 },
    { layer: 2, count: 52, yMin: 0.41, yMax: 0.54, sizeMin: 1.9, sizeMax: 2.9, dLen: 0.06 },
    { layer: 3, count: 58, yMin: 0.60, yMax: 0.76, sizeMin: 3.6, sizeMax: 5.4, dLen: 0.44 }, // Layer V giant pyramids!
    { layer: 4, count: 44, yMin: 0.81, yMax: 0.93, sizeMin: 2.3, sizeMax: 3.5, dLen: 0.15 },
  ];

  for (const band of layerBands) {
    for (let i = 0; i < band.count; i += 1) {
      cells.push({
        xNorm: 0.06 + rnd() * 0.88,
        yNorm: band.yMin + rnd() * (band.yMax - band.yMin),
        layer: band.layer,
        size: band.sizeMin + rnd() * (band.sizeMax - band.sizeMin),
        dendriteLen: band.dLen * (0.75 + rnd() * 0.5),
        lean: (rnd() - 0.5) * 0.025,
        phase: rnd() * Math.PI * 2,
      });
    }
  }
  return cells;
})();

/**
 * SIGNATURE SCROLL SETPIECE #2 (~210vh): Living Histological MicroZoom ×1000 (Bug #7 Fix!)
 * Replaces the empty middle 2 mm dashed lines with a living procedural Canvas 2D Golgi/Cajal
 * 6-layer cortical tissue slice (~240 neurons + rising sensory #004EDF & descending predictive #FC4109 spikes)
 * driven strictly by useViewportRaf (0% background CPU!).
 */
export function ScrollMicroZoom() {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const chamberRef = useRef<HTMLDivElement | null>(null);
  const brainLayerRef = useRef<HTMLDivElement | null>(null);
  const gridLayerRef = useRef<HTMLDivElement | null>(null);
  const histologyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const neuronLayerRef = useRef<HTMLDivElement | null>(null);
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const scaleLabelRef = useRef<HTMLSpanElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const scrollProgressRef = useRef(0);

  const [stageIdx, setStageIdx] = useState(0);

  // Living Canvas 2D Golgi / Cajal 6-layer cortical slice (only draws when middle stage is visible!)
  const drawHistology = useCallback((nowMs: number) => {
    const p = scrollProgressRef.current;
    if (p < 0.12 || p > 0.94) return;
    const canvas = histologyCanvasRef.current;
    const box = chamberRef.current;
    if (!canvas || !box) return;

    const { ctx, width, height } = resizeHiDpiCanvas(canvas, box.clientWidth, box.clientHeight);
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const t = nowMs * 0.001;

    // 1. Subtle histological horizontal layer dividers (6-layer architecture)
    const bands = [
      { y: 0.19, highlight: false },
      { y: 0.39, highlight: false },
      { y: 0.57, highlight: false },
      { y: 0.78, highlight: true },
    ];
    bands.forEach((b) => {
      const py = Math.round(b.y * height) + 0.5;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(b.highlight ? [6, 4] : [3, 6]);
      ctx.strokeStyle = b.highlight ? 'rgba(252, 65, 9, 0.45)' : 'rgba(20, 20, 19, 0.12)';
      ctx.lineWidth = b.highlight ? 1.4 : 1;
      ctx.moveTo(20, py);
      ctx.lineTo(width - 20, py);
      ctx.stroke();
      ctx.restore();
    });

    // 2. Render ~240 Golgi/Cajal silver-chromate ink cells + apical dendrites
    for (let i = 0; i < GOLGI_CELLS.length; i += 1) {
      const c = GOLGI_CELLS[i];
      const cx = c.xNorm * width;
      const cy = c.yNorm * height;
      const isLayer5 = c.layer === 3;

      ctx.save();
      // Apical trunk ascending toward Layer I
      const topY = Math.max(12, cy - c.dendriteLen * height);
      const topX = cx + c.lean * width;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + c.lean * width * 0.45, (cy + topY) * 0.5, topX, topY);
      ctx.strokeStyle = isLayer5 ? 'rgba(20, 20, 19, 0.46)' : 'rgba(20, 20, 19, 0.18)';
      ctx.lineWidth = isLayer5 ? 1.25 : 0.75;
      ctx.stroke();

      // Tiny apical tuft fork on Layer V pyramids
      if (isLayer5) {
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.lineTo(topX - 6, topY - 8);
        ctx.moveTo(topX, topY);
        ctx.lineTo(topX + 6, topY - 8);
        ctx.strokeStyle = 'rgba(20, 20, 19, 0.34)';
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }

      // Pyramidal soma triangle
      ctx.beginPath();
      ctx.moveTo(cx, cy - c.size * 1.15);
      ctx.lineTo(cx + c.size * 0.9, cy + c.size * 0.85);
      ctx.lineTo(cx - c.size * 0.9, cy + c.size * 0.85);
      ctx.closePath();
      ctx.fillStyle = isLayer5 ? 'rgba(20, 20, 19, 0.72)' : 'rgba(20, 20, 19, 0.32)';
      ctx.fill();

      // Living spikes: descending predictive signals (#FC4109) & ascending sensory signals (#004EDF)
      if (isLayer5 && i % 4 === 0) {
        const pulse = (t * 0.42 + c.phase) % 1;
        const isTopDown = i % 8 === 0;
        const frac = isTopDown ? pulse : 1 - pulse;
        const sx = cx + (topX - cx) * (1 - frac);
        const sy = topY + (cy - topY) * frac;
        drawOpticalSpikeDot(ctx, sx, sy, 2.2, isTopDown ? '#FC4109' : '#004EDF');
      }
      ctx.restore();
    }
  }, []);

  useViewportRaf(runwayRef, drawHistology, { enabled: true });

  useEffect(() => {
    const canvas = histologyCanvasRef.current;
    return () => releaseCanvasMemory(canvas);
  }, []);

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;

    const trigger = ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.45,
      onUpdate: (self) => {
        const p = self.progress;
        scrollProgressRef.current = p;
        const nextStage = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
        setStageIdx((prev) => (prev === nextStage ? prev : nextStage));

        if (brainLayerRef.current) {
          const brainScale = 1 + p * 2.6;
          const brainOpacity = Math.max(0, 1 - Math.max(0, (p - 0.18) / 0.38));
          brainLayerRef.current.style.transform = `scale(${brainScale.toFixed(3)})`;
          brainLayerRef.current.style.opacity = `${brainOpacity.toFixed(3)}`;
        }

        if (gridLayerRef.current) {
          const fadeIn = Math.min(1, Math.max(0, (p - 0.16) / 0.24));
          // Fade out cleanly before Step 3/3 (p = 0.60..0.76) so layer labels never clip against the zoomed frame edge!
          const fadeOut = 1 - Math.min(1, Math.max(0, (p - 0.58) / 0.18));
          const gridScale = 0.92 + p * 0.22;
          gridLayerRef.current.style.opacity = `${(fadeIn * fadeOut * 0.96).toFixed(3)}`;
          gridLayerRef.current.style.transform = `scale(${gridScale.toFixed(3)})`;
        }

        if (neuronLayerRef.current) {
          const nFade = Math.min(1, Math.max(0, (p - 0.5) / 0.3));
          const nScale = 0.74 + nFade * 0.26;
          neuronLayerRef.current.style.opacity = `${nFade.toFixed(3)}`;
          neuronLayerRef.current.style.transform = `scale(${nScale.toFixed(3)})`;
        }

        if (reticleRef.current) {
          const rScale = 1.25 - p * 0.45;
          reticleRef.current.style.transform = `translate(-50%, -50%) scale(${rScale.toFixed(3)})`;
        }

        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }

        if (scaleLabelRef.current) {
          if (p < 0.34) {
            const cm = (10 - (p / 0.34) * 8).toFixed(1);
            scaleLabelRef.current.textContent = `МАСШТАБ: ${cm} СМ · МАКРО-КОРА`;
          } else if (p < 0.68) {
            const mm = (2.2 - ((p - 0.34) / 0.34) * 1.8).toFixed(1);
            scaleLabelRef.current.textContent = `МАСШТАБ: ${mm} ММ · 6 ЖИВЫХ СЛОЁВ КОРЫ`;
          } else {
            const um = Math.round(400 - ((p - 0.68) / 0.32) * 200);
            scaleLabelRef.current.textContent = `МАСШТАБ: ${um} МКМ · СЛОЙ V (×1000)`;
          }
        }
      },
    });

    return () => trigger.kill();
  }, []);

  const stages = [
    {
      kicker: 'МИКРОЗУМ ×1000 · ШАГ 1/3 · 10 СМ',
      title: 'С высоты полушарий выключатель не виден',
      body: 'Крупные теории COGITATE спорили о целых долях мозга — но промахнулись. Опускаем объектив глубже, прямо в толщину серого вещества.',
    },
    {
      kicker: 'МИКРОЗУМ ×1000 · ШАГ 2/3 · 2 ММ',
      title: 'Шесть живых этажей коры головного мозга',
      body: 'Вся человеческая кора — тонкий шестислойный лес толщиной 2–3 миллиметра. Сверху вниз бегут алые прогнозы, снизу вверх — синие импульсы от органов чувств.',
    },
    {
      kicker: 'МИКРОЗУМ ×1000 · ШАГ 3/3 · 200 МКМ',
      title: 'Одна-единственная клетка насквозь',
      body: 'Именно здесь, в 5-м слое, стоит главный герой следующей главы — пирамидальный нейрон, сшивающий мир и прогноз в одну вспышку.',
    },
  ];

  const active = stages[stageIdx] ?? stages[0];

  return (
    <div
      id="micro-zoom"
      ref={runwayRef}
      className="relative h-[210vh] bg-[#F4F2EA] border-b border-[#141413]/10"
      aria-label="Микрозум ×1000 от целого мозга к нейрону пятого слоя"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between px-5 md:px-12 lg:px-20 py-20 md:py-24">
        <div className="max-w-[1240px] mx-auto w-full flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59] relative z-20">
          <span className="text-[#FC4109] font-semibold">{active.kicker}</span>
          <span ref={scaleLabelRef} className="text-[#141413] font-semibold">
            МАСШТАБ: 10.0 СМ · МАКРО-КОРА
          </span>
        </div>

        <div className="max-w-[1240px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-[clamp(26px,3.4vw,44px)] leading-[1.08] tracking-[-0.028em]">
              <span className="font-display font-bold block text-[#141413]">{ruTypo(active.title)}</span>
            </h3>
            <p className="font-serif-editorial italic text-[17px] md:text-[18.5px] leading-[1.58] text-[#353431]">
              {ruTypo(active.body)}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <div className="w-36 h-[3px] rounded-full bg-[#141413]/14 overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full w-full origin-left bg-[#FC4109]"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
              <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#5E5D59]">
                Листайте вниз · фокус ×1000
              </span>
            </div>
          </div>

          {/* Right 7 cols: Optical Crossfade Chamber */}
          <div
            ref={chamberRef}
            className="lg:col-span-7 relative aspect-[16/10] w-full max-h-[540px] rounded-2xl border border-[#141413]/14 bg-[#FAF9F5] overflow-hidden shadow-[0_24px_60px_rgba(20,20,19,0.06)]"
          >
            {/* Layer 1: Macro Studio Brain Zooming In */}
            <div
              ref={brainLayerRef}
              className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              style={{ transformOrigin: '56% 42%' }}
            >
              <img
                src={assetUrl('/v7/brain-lateral.jpg')}
                alt="Макро-кора мозга при приближении"
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            </div>

            {/* Layer 2 (Bug #7 Fix!): Living Procedural Canvas 2D Golgi/Cajal 6-Layer Cortical Forest + Crisp Labels */}
            <div
              ref={gridLayerRef}
              className="absolute inset-0 pointer-events-none will-change-[transform,opacity]"
              style={{ opacity: 0 }}
            >
              <canvas
                ref={histologyCanvasRef}
                className="absolute inset-0 w-full h-full block"
              />
              <div className="absolute inset-0 px-4 py-3 flex flex-col justify-between font-mono-tech text-[9.5px] sm:text-[10px] uppercase tracking-[0.1em]">
                <span className="self-start px-2 py-0.5 rounded bg-[#FAF9F5]/88 text-[#5E5D59]">
                  СЛОЙ I · ВЕРХНИЕ ПРОГНОЗЫ (●)
                </span>
                <span className="self-start px-2 py-0.5 rounded bg-[#FAF9F5]/88 text-[#5E5D59]">
                  СЛОЙ II/III · КОРКОВЫЕ СВЯЗИ
                </span>
                <span className="self-start px-2 py-0.5 rounded bg-[#FAF9F5]/88 text-[#004EDF] font-semibold">
                  СЛОЙ IV · ВХОД ОТ ТАЛАМУСА (●)
                </span>
                <span className="self-start px-2 py-0.5 rounded bg-[#FAF9F5]/92 text-[#FC4109] font-bold border border-[#FC4109]/30">
                  СЛОЙ V · ГИГАНТСКИЕ ПИРАМИДЫ ЛАРКУМА
                </span>
                <span className="self-start px-2 py-0.5 rounded bg-[#FAF9F5]/88 text-[#5E5D59]">
                  СЛОЙ VI · ОБРАТНЫЙ КАНАЛ ВГЛУБЬ
                </span>
              </div>
            </div>

            {/* Layer 3: Single Ramón y Cajal Pyramidal Neuron */}
            <div
              ref={neuronLayerRef}
              className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none will-change-[transform,opacity]"
              style={{ opacity: 0 }}
            >
              <svg viewBox="0 0 480 340" className="w-full h-full max-w-[490px]">
                <g stroke="#141413" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M 210 108 C 209 92, 208 82, 192 64 C 178 50, 162 39, 138 24" strokeWidth="2.1" />
                  <path d="M 210 108 C 212 91, 216 78, 234 60 C 252 44, 272 34, 298 22" strokeWidth="2.1" />
                  <path d="M 210 96 C 209 72, 212 48, 210 18" strokeWidth="1.75" />
                  <path d="M 188 60 C 170 58, 150 62, 132 54" strokeWidth="1.35" />
                  <path d="M 170 45 C 168 32, 172 24, 166 14" strokeWidth="1.15" />
                  <path d="M 154 34 C 144 36, 135 42, 126 40" strokeWidth="0.95" opacity="0.85" />
                  <path d="M 234 60 C 252 58, 270 64, 292 56" strokeWidth="1.35" />
                  <path d="M 258 42 C 262 30, 260 21, 268 13" strokeWidth="1.15" />
                  <path d="M 211 52 C 198 42, 191 30, 190 17" strokeWidth="1.1" />
                  <path d="M 211 48 C 225 38, 232 28, 237 16" strokeWidth="1.1" />
                  <path d="M 278 30 C 292 32, 304 36, 314 34" strokeWidth="0.95" opacity="0.85" />
                  <path d="M 210 136 C 192 130, 176 132, 160 123" strokeWidth="1.15" opacity="0.72" />
                  <path d="M 210 152 C 230 146, 248 148, 268 139" strokeWidth="1.15" opacity="0.72" />
                  <path d="M 210 204 C 190 200, 174 206, 158 199" strokeWidth="1.05" opacity="0.65" />
                  <path d="M 210 210 C 230 207, 246 212, 264 205" strokeWidth="1.05" opacity="0.65" />
                  <path d="M 210 106 C 208 148, 212 190, 210 232" strokeWidth="3.2" />
                  <path
                    d="M 210 226 C 218 244, 226 260, 236 276 C 218 280, 202 280, 184 276 C 194 260, 202 244, 210 226 Z"
                    fill="rgba(252,65,9,0.16)"
                    stroke="#141413"
                    strokeWidth="2.1"
                  />
                  <path d="M 190 274 C 168 284, 150 298, 124 316" strokeWidth="1.8" />
                  <path d="M 230 274 C 252 284, 270 298, 296 316" strokeWidth="1.8" />
                  <path d="M 172 288 C 154 290, 138 286, 120 292" strokeWidth="1.2" opacity="0.82" />
                  <path d="M 248 288 C 266 290, 282 286, 300 292" strokeWidth="1.2" opacity="0.82" />
                  <path d="M 210 279 L 210 330" strokeWidth="1.5" />
                </g>
                <circle cx="210" cy="172" r="8" fill="#FC4109" fillOpacity="0.22" stroke="#FC4109" strokeWidth="1.8" />
                <line x1="219" y1="172" x2="308" y2="172" stroke="#FC4109" strokeWidth="1.2" strokeDasharray="3 3" />
                <circle cx="308" cy="172" r="2.5" fill="#FC4109" />
                <rect x="314" y="159" width="154" height="26" rx="6" fill="#FAF9F5" fillOpacity="0.94" stroke="#FC4109" strokeOpacity="0.32" />
                <text x="323" y="176" fill="#FC4109" fontSize="10.5" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                  КАЛЬЦИЕВЫЙ УЗЕЛ Ca²⁺
                </text>
              </svg>
            </div>

            {/* Precision Optical Reticle */}
            <div
              ref={reticleRef}
              className="pointer-events-none absolute left-1/2 top-1/2 w-36 h-36 rounded-full border border-[#FC4109]/55 flex items-center justify-center will-change-transform"
              style={{ transform: 'translate(-50%, -50%) scale(1.25)' }}
            >
              <span className="absolute -top-2 w-[1.5px] h-3 bg-[#FC4109]" />
              <span className="absolute -bottom-2 w-[1.5px] h-3 bg-[#FC4109]" />
              <span className="absolute -left-2 h-[1.5px] w-3 bg-[#FC4109]" />
              <span className="absolute -right-2 h-[1.5px] w-3 bg-[#FC4109]" />
            </div>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto w-full flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#7A7872] relative z-20">
          <span>ПЕРЕХОД: ГЛ. IV.1 (АТЛАС) → ГЛ. IV.2 (КЛЕТКА)</span>
          <span>100 ММ → 2 ММ (СЕРЕБРО ГОЛЬДЖИ) → 0.2 ММ</span>
        </div>
      </div>
    </div>
  );
}
