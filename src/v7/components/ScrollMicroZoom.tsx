import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NoesisMicroZoom3D } from '../../v9/three/NoesisMicroZoom3D';
import { ruTypo } from '../../v9/utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

/**
 * SIGNATURE SCROLL SETPIECE #2 (~210vh): 3D Optical Golgi MicroZoom ×1000 (NOESIS v9.2)
 * - Uses Three.js InstancedMesh (1,200 3D pyramidal neurons + apical shafts across 6 true cortical layers in 2 draw calls!)
 * - Camera flies smoothly along scroll progress from 10 cm macro column -> 2 mm 6-layer forest -> 200 µm Layer V hero neuron & Ca²⁺ nexus!
 * - Zero GSAP pin:true (pure CSS position:sticky), zero background CPU offscreen.
 */
export function ScrollMicroZoom() {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const scaleLabelRef = useRef<HTMLSpanElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;

    const trigger = ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      onUpdate: (self) => {
        const p = self.progress;
        setProgress((prev) => (Math.abs(prev - p) > 0.004 ? p : prev));
        const nextStage = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
        setStageIdx((prev) => (prev === nextStage ? prev : nextStage));

        if (reticleRef.current) {
          const rScale = 1.22 - p * 0.44;
          reticleRef.current.style.transform = `translate(-50%, -50%) scale(${rScale.toFixed(3)})`;
        }

        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }

        if (scaleLabelRef.current) {
          if (p < 0.34) {
            const cm = (10 - (p / 0.34) * 8).toFixed(1);
            scaleLabelRef.current.textContent = `МАСШТАБ: ${cm} СМ · 3D-КОЛОНКА КОРЫ`;
          } else if (p < 0.68) {
            const mm = (2.2 - ((p - 0.34) / 0.34) * 1.8).toFixed(1);
            scaleLabelRef.current.textContent = `МАСШТАБ: ${mm} ММ · 6 СЛОЁВ · 1 200 КЛЕТОК`;
          } else {
            const um = Math.round(400 - ((p - 0.68) / 0.32) * 200);
            scaleLabelRef.current.textContent = `МАСШТАБ: ${um} МКМ · СЛОЙ V · УЗЕЛ Ca²⁺`;
          }
        }
      },
    });

    return () => trigger.kill();
  }, []);

  const stages = [
    {
      kicker: '3D-МИКРОЗУМ ×1000 · ШАГ 1/3 · 10 СМ',
      title: 'С высоты полушарий выключатель не виден',
      body: 'Крупные теории COGITATE спорили о целых долях мозга — но обе получили пробоины. Погружаем 3D-объектив прямо в толщину серого вещества.',
    },
    {
      kicker: '3D-МИКРОЗУМ ×1000 · ШАГ 2/3 · 2 ММ',
      title: 'Шесть живых этажей коры головного мозга',
      body: 'Вся человеческая кора — тонкий шестислойный лес толщиной 2–3 миллиметра. Вы пролетаете сквозь 1 200 пирамидальных клеток, выстроенных по вертикали.',
    },
    {
      kicker: '3D-МИКРОЗУМ ×1000 · ШАГ 3/3 · 200 МКМ',
      title: 'Одна-единственная клетка насквозь',
      body: 'В 5-м слое стоит главный герой следующей главы — пирамидальный нейрон Ларкума. Сверху по нему бегут кобальтовые прогнозы, снизу — алый сигнал мира, встречаясь в кальциевом узле Ca²⁺.',
    },
  ];

  const active = stages[stageIdx] ?? stages[0];

  return (
    <div
      id="micro-zoom"
      ref={runwayRef}
      className="relative h-[210vh] bg-[#F4F2EA] border-b border-[#141413]/10"
      aria-label="3D-Микрозум ×1000 от кортикальной колонки к пирамидальному нейрону пятого слоя"
    >
      <div className="sticky top-0 min-h-[100svh] lg:h-[100svh] w-full overflow-hidden flex flex-col justify-between px-5 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="max-w-[1240px] mx-auto w-full flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59] relative z-20">
          <span className="text-[#FC4109] font-semibold">{active.kicker}</span>
          <span ref={scaleLabelRef}>МАСШТАБ: 10.0 СМ · 3D-КОЛОНКА КОРЫ</span>
        </div>

        <div className="max-w-[1240px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-4">
          {/* Left 5 cols: Editorial Story */}
          <div className="lg:col-span-5 space-y-4 relative z-20">
            <h2 className="text-[clamp(26px,3.6vw,44px)] leading-[1.08] tracking-[-0.028em]">
              <span className="font-display font-bold block text-[#141413]">{ruTypo(active.title)}</span>
            </h2>
            <p className="font-serif-editorial italic text-[17px] md:text-[18.5px] leading-[1.58] text-[#353431]">
              {ruTypo(active.body)}
            </p>

            {/* Clean HTML Legend for 3D signals */}
            <div className="flex flex-wrap gap-2 pt-1 font-mono-tech text-[10px] uppercase tracking-[0.1em]">
              <span className="px-2.5 py-1 rounded-full bg-[#004EDF]/10 text-[#004EDF] border border-[#004EDF]/25">
                ● Слой I · Прогнозы сверху
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#FC4109]/10 text-[#FC4109] border border-[#FC4109]/25">
                ● Узел Ca²⁺ · Переключатель наркоза
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <div className="w-36 h-[3px] rounded-full bg-[#141413]/14 overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full w-full origin-left bg-[#FC4109]"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
              <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#5E5D59]">
                Листайте вниз · 3D-полёт ×1000
              </span>
            </div>
          </div>

          {/* Right 7 cols: Live 3D WebGL InstancedMesh Golgi Cortical Forest */}
          <div className="lg:col-span-7 relative aspect-[16/11] w-full max-h-[500px] rounded-2xl border border-[#141413]/14 bg-[#FAF9F5] overflow-hidden shadow-[0_24px_60px_rgba(20,20,19,0.08)]">
            <NoesisMicroZoom3D progress={progress} className="w-full h-full" />

            {/* Subtle Depth Strata Labels (HTML >= 10px, fade smoothly by stage) */}
            <div
              className="pointer-events-none absolute top-4 left-4 space-y-1 font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59] transition-opacity duration-300"
              style={{ opacity: progress > 0.25 && progress < 0.78 ? 0.9 : 0 }}
            >
              <div className="px-2 py-0.5 rounded bg-[#FAF9F5]/88 border border-[#141413]/10">
                СЛОЙ I · Апикальный пучок (прогнозы)
              </div>
              <div className="px-2 py-0.5 rounded bg-[#FAF9F5]/88 border border-[#141413]/10">
                СЛОИ II–IV · Сенсорный вход мира
              </div>
              <div className="px-2 py-0.5 rounded bg-[#FC4109]/10 text-[#FC4109] border border-[#FC4109]/30 font-semibold">
                СЛОЙ V · Гигантские пирамиды Ларкума
              </div>
            </div>

            {/* Hero Ca2+ Callout Badge on Stage 3 */}
            <div
              className="pointer-events-none absolute top-5 right-5 px-3 py-1.5 rounded-lg bg-[#FAF9F5]/95 border border-[#FC4109]/40 font-mono-tech text-[10.5px] uppercase tracking-[0.11em] text-[#FC4109] font-bold shadow-sm transition-opacity duration-300"
              style={{ opacity: progress > 0.66 ? 1 : 0 }}
            >
              ● КАЛЬЦИЕВЫЙ УЗЕЛ Ca²⁺ (СЛОЙ V)
            </div>

            {/* Precision Optical Reticle */}
            <div
              ref={reticleRef}
              className="pointer-events-none absolute left-1/2 top-1/2 w-32 h-32 rounded-full border border-[#FC4109]/45 flex items-center justify-center will-change-transform"
              style={{ transform: 'translate(-50%, -50%) scale(1.22)' }}
            >
              <span className="absolute -top-2 w-[1.5px] h-3 bg-[#FC4109]" />
              <span className="absolute -bottom-2 w-[1.5px] h-3 bg-[#FC4109]" />
              <span className="absolute -left-2 h-[1.5px] w-3 bg-[#FC4109]" />
              <span className="absolute -right-2 h-[1.5px] w-3 bg-[#FC4109]" />
            </div>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto w-full hidden sm:flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#7A7872] relative z-20">
          <span>ПЕРЕХОД: ГЛ. IV.1 (АТЛАС) → ГЛ. IV.2 (КЛЕТКА)</span>
          <span>1 200 3D-НЕЙРОНОВ · INSTANCEDMESH · СЕРЕБРО ГОЛЬДЖИ</span>
        </div>
      </div>
    </div>
  );
}
