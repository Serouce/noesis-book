import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OrganicCajalForest3D } from '../webgl/OrganicCajalForest3D';
import { ruTypo } from '../../v9/utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

/**
 * Full-Screen 220vh Darkroom Leica Confocal Microscopy Flight into the Organic Cajal/Golgi Branching Cortical Forest (×1000)
 */
export function Chapter6CajalRunway3D() {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<HTMLSpanElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const el = runwayRef.current;
    if (!el) return;
    const trig = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      onUpdate: (self) => {
        const p = self.progress;
        setProgress((prev) => (Math.abs(prev - p) > 0.004 ? p : prev));
        const st = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
        setStageIdx((prev) => (prev === st ? prev : st));
        if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        if (scaleRef.current) {
          if (p < 0.34) scaleRef.current.textContent = 'МАСШТАБ: 10 СМ → 3 ММ · ВХОД В КОРУ';
          else if (p < 0.68) scaleRef.current.textContent = 'МАСШТАБ: 2 ММ · ЛЕС КАХАЛЯ · 6 СЛОЁВ';
          else scaleRef.current.textContent = 'МАСШТАБ: 200 МКМ · НЕЙРОН ЛАРКУМА · Ca²⁺';
        }
      },
    });
    return () => trig.kill();
  }, []);

  const stages = [
    {
      kicker: '3D-ПОГРУЖЕНИЕ ×1000 · ШАГ 1/3',
      title: 'С высоты полушарий выключатель не виден',
      body: 'Крупные теории COGITATE спорили о целых долях мозга — но обе получили пробоины. Погружаемся в живую толщину серого вещества.',
    },
    {
      kicker: '3D-ПОГРУЖЕНИЕ ×1000 · ШАГ 2/3',
      title: 'Ветвящийся лес из шести этажей коры',
      body: 'Вся человеческая кора — кружевной шестислойный лес толщиной 2–3 миллиметра. По тончайшим ветвям дендритов навстречу друг другу бегут тысячи световых импульсов.',
    },
    {
      kicker: '3D-ПОГРУЖЕНИЕ ×1000 · ШАГ 3/3',
      title: 'Одна-единственная клетка насквозь',
      body: 'В 5-м слое стоит главный герой следующей сцены — пирамидальный нейрон Ларкума. Кобальтовая крона сверху ловит прогнозы, корни снизу — сырой мир, а алый кальциевый узел Ca²⁺ сшивает их в опыт.',
    },
  ];

  const active = stages[stageIdx] ?? stages[0];

  return (
    <div
      id="micro-zoom"
      ref={runwayRef}
      data-hud-theme="dark"
      className="relative h-[220vh] bg-[#0B0D11] text-[#FAF9F5] border-b border-[#FAF9F5]/10"
      aria-label="Органический 3D-полёт ×1000 в лес нейронов Кахаля"
    >
      <div className="sticky top-0 min-h-[100svh] lg:h-[100svh] w-full overflow-hidden flex flex-col justify-between px-5 md:px-12 lg:px-20 pt-24 pb-10">
        <div className="max-w-[1240px] mx-auto w-full flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#9EA6B6] relative z-20">
          <span className="text-[#FC4109] font-semibold">{active.kicker}</span>
          <span ref={scaleRef}>МАСШТАБ: 10 СМ → 3 ММ · ВХОД В КОРУ</span>
        </div>

        <div className="max-w-[1240px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-4">
          <div className="lg:col-span-5 space-y-5 relative z-20">
            <h2 className="text-[clamp(26px,3.6vw,46px)] leading-[1.08] tracking-[-0.03em]">
              <span className="font-display font-bold block text-[#FAF9F5]">{ruTypo(active.title)}</span>
            </h2>
            <p className="font-serif-editorial italic text-[17px] md:text-[18.5px] leading-[1.58] text-[#D4DCE8]">
              {ruTypo(active.body)}
            </p>

            <div className="flex flex-wrap gap-2 font-mono-tech text-[10px] uppercase tracking-[0.1em]">
              <span className="px-3 py-1 rounded-full bg-[#12264B] text-[#B8D4FF] border border-[#60A5FA]/50 font-medium">
                ● Слой I · Крона прогнозов
              </span>
              <span className="px-3 py-1 rounded-full bg-[#3A1710] text-[#FFB89E] border border-[#FC4109]/55 font-medium">
                ● Узел Ca²⁺ · Выключатель наркоза
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-36 h-[3px] rounded-full bg-[#FAF9F5]/16 overflow-hidden">
                <div
                  ref={barRef}
                  className="h-full w-full origin-left bg-[#FC4109]"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#9EA6B6]">
                Листайте вниз · 3D-лес Кахаля ×1000
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 relative aspect-[16/11] w-full max-h-[520px] rounded-2xl border border-[#FAF9F5]/14 bg-[#07090D] overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.65)]">
            <OrganicCajalForest3D progress={progress} className="w-full h-full" />

            {/* Anatomically accurate horizontal optical leader pointing directly to the glowing Ca²⁺ nexus at mid-trunk! */}
            <div
              className="pointer-events-none absolute top-[43%] right-4 flex items-center gap-0 transition-opacity duration-300"
              style={{ opacity: progress > 0.52 ? 1 : 0 }}
            >
              <span className="w-14 h-[1px] bg-gradient-to-r from-[#FC4109] to-[#FC4109]/40 hidden sm:block" />
              <div className="px-3 py-1.5 rounded-full bg-[#0B0D11]/92 border border-[#FC4109]/55 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#FFB89E] font-semibold shadow-sm whitespace-nowrap">
                ● УЗЕЛ Ca²⁺ · LARKUM (CELL 2020)
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto w-full hidden sm:flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#7D8796]">
          <span>С. РАМОН-И-КАХАЛЬ (1906) · М. ЛАРКУМ (CELL, 2020) · КОНФОКАЛЬНАЯ 3D-МИКРОСКОПИЯ</span>
          <span>ДАЛЕЕ: ПРОИГРЫВАТЕЛЬ РАМСА И ОБРЫВ ПРОПОФОЛА ↓</span>
        </div>
      </div>
    </div>
  );
}
