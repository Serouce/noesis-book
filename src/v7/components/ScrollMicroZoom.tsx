import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SIGNATURE SCROLL SETPIECE #2 (~200vh): Macro-to-Micro Dive x1000 (Chapter IV -> Chapter V!)
 * Physically bridges the macro-level COGITATE stalemate ("10 см") down through the 6 cortical layers ("2 мм")
 * straight into a single Layer-5 Cajal/Larkum pyramidal neuron ("200 мкм")!
 */
export function ScrollMicroZoom() {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const brainLayerRef = useRef<HTMLDivElement | null>(null);
  const gridLayerRef = useRef<HTMLDivElement | null>(null);
  const neuronLayerRef = useRef<HTMLDivElement | null>(null);
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const scaleLabelRef = useRef<HTMLSpanElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [stageIdx, setStageIdx] = useState(0);

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
        const nextStage = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
        setStageIdx((prev) => (prev === nextStage ? prev : nextStage));

        // 1. Macro brain zooms smoothly from 1.0x -> 3.4x and fades out by p=0.58
        if (brainLayerRef.current) {
          const brainScale = 1 + p * 2.6;
          const brainOpacity = Math.max(0, 1 - Math.max(0, (p - 0.18) / 0.4));
          brainLayerRef.current.style.transform = `scale(${brainScale.toFixed(3)})`;
          brainLayerRef.current.style.opacity = `${brainOpacity.toFixed(3)}`;
        }

        // 2. 6-layer cortical histological grid peaks in the middle (p = 0.28..0.82)
        if (gridLayerRef.current) {
          const fadeIn = Math.min(1, Math.max(0, (p - 0.18) / 0.25));
          const fadeOut = 1 - Math.min(1, Math.max(0, (p - 0.72) / 0.25));
          const gridScale = 0.85 + p * 0.45;
          gridLayerRef.current.style.opacity = `${(fadeIn * fadeOut * 0.92).toFixed(3)}`;
          gridLayerRef.current.style.transform = `scale(${gridScale.toFixed(3)})`;
        }

        // 3. Single Layer-5 Cajal neuron emerges crisply in the final third (p = 0.52..1.0)
        if (neuronLayerRef.current) {
          const nFade = Math.min(1, Math.max(0, (p - 0.48) / 0.32));
          const nScale = 0.72 + nFade * 0.28;
          neuronLayerRef.current.style.opacity = `${nFade.toFixed(3)}`;
          neuronLayerRef.current.style.transform = `scale(${nScale.toFixed(3)})`;
        }

        // 4. Optical Leica reticle tightens from wide circle into precision microscopic crosshair
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
            scaleLabelRef.current.textContent = `МАСШТАБ: ${mm} ММ · 6 СЛОЁВ КОРЫ`;
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
      title: 'Шесть этажей коры головного мозга',
      body: 'Вся человеческая кора — это тонкий шестислойный «пирог» толщиной всего 2–3 миллиметра. В верхний слой приходят прогнозы, в нижние — сигналы от чувств.',
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
        {/* Top optical scale header */}
        <div className="max-w-[1240px] mx-auto w-full flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59] relative z-20">
          <span className="text-[#FC4109] font-semibold">{active.kicker}</span>
          <span ref={scaleLabelRef} className="text-[#141413] font-semibold">
            МАСШТАБ: 10.0 СМ · МАКРО-КОРА
          </span>
        </div>

        {/* Center Optical Dive Stage */}
        <div className="max-w-[1240px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left 5 cols: Editorial step text */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-[clamp(26px,3.4vw,44px)] leading-[1.08] tracking-[-0.028em]">
              <span className="font-display font-bold block text-[#141413]">{active.title}</span>
            </h3>
            <p className="font-serif-editorial italic text-[17px] md:text-[18.5px] leading-[1.58] text-[#353431]">
              {active.body}
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
          <div className="lg:col-span-7 relative aspect-[16/10] w-full max-h-[540px] rounded-2xl border border-[#141413]/14 bg-[#FAF9F5] overflow-hidden shadow-[0_24px_60px_rgba(20,20,19,0.06)]">
            {/* Layer 1: Macro Studio Brain Zooming In */}
            <div
              ref={brainLayerRef}
              className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              style={{ transformOrigin: '56% 42%' }}
            >
              <img
                src="/v7/brain-lateral.jpg"
                alt="Макро-кора мозга при приближении"
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            </div>

            {/* Layer 2: 6-Layer Cortical Histological Grid (2 mm) */}
            <div
              ref={gridLayerRef}
              className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none will-change-[transform,opacity]"
              style={{ opacity: 0 }}
            >
              <svg viewBox="0 0 600 375" className="w-full h-full">
                {[
                  { y: 55, lbl: 'СЛОЙ I · Верхние прогнозы' },
                  { y: 112, lbl: 'СЛОЙ II/III · Корковые связи' },
                  { y: 174, lbl: 'СЛОЙ IV · Вход от таламуса' },
                  { y: 248, lbl: 'СЛОЙ V · ГЛАВНЫЕ ПИРАМИДЫ (ЛАРКУМ)' },
                  { y: 318, lbl: 'СЛОЙ VI · Обратный канал вглубь' },
                ].map((layer, idx) => (
                  <g key={layer.lbl}>
                    <line
                      x1="28"
                      y1={layer.y}
                      x2="572"
                      y2={layer.y}
                      stroke={idx === 3 ? '#FC4109' : '#141413'}
                      strokeOpacity={idx === 3 ? '0.65' : '0.16'}
                      strokeDasharray={idx === 3 ? '6 4' : '3 5'}
                      strokeWidth={idx === 3 ? '1.6' : '1'}
                    />
                    <text
                      x="36"
                      y={layer.y - 8}
                      fill={idx === 3 ? '#FC4109' : '#5E5D59'}
                      fontSize="11"
                      fontWeight={idx === 3 ? '700' : '500'}
                      fontFamily="JetBrains Mono Variable, monospace"
                    >
                      {layer.lbl}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Layer 3: Lush Ramón y Cajal Pyramidal Neuron matching Ch. V (portrait continuity!) */}
            <div
              ref={neuronLayerRef}
              className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none will-change-[transform,opacity]"
              style={{ opacity: 0 }}
            >
              <svg viewBox="0 0 480 340" className="w-full h-full max-w-[490px]">
                {/* Organic Cajal Botanical-Ink Apical Tuft (identical botanical ink hand as Chapter V!) */}
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
                  {/* Soma */}
                  <path
                    d="M 210 226 C 218 244, 226 260, 236 276 C 218 280, 202 280, 184 276 C 194 260, 202 244, 210 226 Z"
                    fill="rgba(252,65,9,0.16)"
                    stroke="#141413"
                    strokeWidth="2.1"
                  />
                  {/* Basal dendrites */}
                  <path d="M 190 274 C 168 284, 150 298, 124 316" strokeWidth="1.8" />
                  <path d="M 230 274 C 252 284, 270 298, 296 316" strokeWidth="1.8" />
                  <path d="M 172 288 C 154 290, 138 286, 120 292" strokeWidth="1.2" opacity="0.82" />
                  <path d="M 248 288 C 266 290, 282 286, 300 292" strokeWidth="1.2" opacity="0.82" />
                  <path d="M 210 279 L 210 330" strokeWidth="1.5" />
                </g>
                {/* Glowing Ca2+ junction + clean leader line placing label 100% OUTSIDE the red reticle! */}
                <circle cx="210" cy="172" r="8" fill="#FC4109" fillOpacity="0.22" stroke="#FC4109" strokeWidth="1.8" />
                <line x1="219" y1="172" x2="308" y2="172" stroke="#FC4109" strokeWidth="1.2" strokeDasharray="3 3" />
                <circle cx="308" cy="172" r="2.5" fill="#FC4109" />
                <rect x="314" y="159" width="154" height="26" rx="6" fill="#FAF9F5" fillOpacity="0.94" stroke="#FC4109" strokeOpacity="0.32" />
                <text x="323" y="176" fill="#FC4109" fontSize="10.5" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                  КАЛЬЦИЕВЫЙ УЗЕЛ Ca²⁺
                </text>
              </svg>
            </div>

            {/* Precision Optical Reticle Overlay */}
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

        {/* Bottom optical coordinate strip */}
        <div className="max-w-[1240px] mx-auto w-full flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#7A7872] relative z-20">
          <span>ПЕРЕХОД: ГЛ. IV (АТЛАС) → ГЛ. V (КЛЕТКА)</span>
          <span>100 ММ → 2 ММ → 0.2 ММ</span>
        </div>
      </div>
    </div>
  );
}
