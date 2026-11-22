import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LeibnizMillCanvas } from '../webgl/LeibnizMillCanvas';
import { ruTypo } from '../../v9/utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

const MILL_BEATS = [
  {
    kicker: '1714 · МЕЛЬНИЦА ЛЕЙБНИЦА · КАДР 1/3',
    title: 'Снаружи — только слепая материя',
    body: 'Атомы, молекулы, милливольты. Во Вселенной физики есть масса, заряд и частота — но нет ни одного грамма боли, ни одного атома синего цвета.',
  },
  {
    kicker: '1714 · МЕЛЬНИЦА ЛЕЙБНИЦА · КАДР 2/3',
    title: 'Войдите внутрь гигантского мозга',
    body: 'Готфрид Лейбниц предложил увеличить мозг до размеров мельницы и прогуляться среди механизмов: вы увидите лишь шестерни, толкающие друг друга — и нигде не встретите саму мысль.',
  },
  {
    kicker: '1974 → 2026 · ТОЧКА СБОРКИ · КАДР 3/3',
    title: 'Но внутри черепа горит свет',
    body: 'Каким образом полтора килограмма мокрой электрохимии в полной темноте рождают кино, музыку, страх и ощущение «быть собой»? Это и есть главная нерешённая тайна науки.',
  },
];

/**
 * Full-Bleed Cinema WebGL Runway #1 ("Leibniz's Mill", 230vh)
 * 4,200 starlight GPU particles + 4 architectural cog-rings morph on scroll:
 * Chaotic Atoms -> Counter-Rotating Mill Gears -> Luminous Inner Light Sphere.
 */
export function LeibnizMillRunway() {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [beatIdx, setBeatIdx] = useState(0);

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
        const b = p < 0.34 ? 0 : p < 0.7 ? 1 : 2;
        setBeatIdx((prev) => (prev === b ? prev : b));
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }
      },
    });
    return () => trig.kill();
  }, []);

  const beat = MILL_BEATS[beatIdx] ?? MILL_BEATS[0];

  return (
    <div
      id="leibniz-mill-runway"
      ref={runwayRef}
      data-hud-theme="dark"
      className="relative w-full h-[230vh] bg-[#0B0D11] text-[#FAF9F5] border-t border-b border-[#FAF9F5]/10"
      aria-label="Кинематографическая WebGL-сцена: Мельница Лейбница"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* True edge-to-edge 4,200-particle WebGL Universe */}
        <LeibnizMillCanvas progress={progress} className="absolute inset-0 w-full h-full" />

        {/* Desktop: left protective scrim; Mobile portrait: clean bottom-up scrim so sculpture shines above & text is crisp below! */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(11,13,17,0.88) 0%, rgba(11,13,17,0.48) 44%, rgba(11,13,17,0.04) 76%), linear-gradient(180deg, rgba(11,13,17,0.95) 0%, rgba(11,13,17,0.0) 20%, rgba(11,13,17,0.0) 80%, rgba(11,13,17,0.96) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,13,17,0.97) 0%, rgba(11,13,17,0.82) 12%, rgba(11,13,17,0.0) 22%, rgba(11,13,17,0.0) 48%, rgba(11,13,17,0.88) 64%, rgba(11,13,17,0.98) 100%)',
          }}
        />

        {/* Editorial Overlay Typography */}
        <div className="relative z-10 h-full max-w-[1240px] mx-auto px-4 sm:px-5 md:px-12 lg:px-20 pt-16 pb-6 sm:pt-20 lg:pt-24 lg:pb-12 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#A8B1C2]">
            <span className="text-[#FC4109] font-semibold">{beat.kicker}</span>
            <span className="hidden sm:inline">МОРФИНГ МАТЕРИИ · 4 200 ТОЧЕК</span>
          </div>

          <div className="max-w-xl space-y-3 lg:space-y-5 mt-auto mb-5 lg:my-auto">
            <h3 className="text-[26px] sm:text-[34px] lg:text-[clamp(34px,4.6vw,60px)] leading-[1.06] lg:leading-[1.04] tracking-[-0.03em]">
              <span className="font-display font-bold block text-[#FAF9F5]">{ruTypo(beat.title)}</span>
            </h3>
            <p className="font-serif-editorial italic text-[15px] sm:text-[18px] lg:text-[21px] leading-[1.5] lg:leading-[1.54] text-[#DDE3EE]">
              {ruTypo(beat.body)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-28 sm:w-40 h-[3px] rounded-full bg-[#FAF9F5]/18 overflow-hidden">
                <div
                  ref={barRef}
                  className="h-full w-full origin-left bg-[#FC4109]"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
              <span className="font-mono-tech text-[9.5px] sm:text-[10px] uppercase tracking-[0.12em] text-[#9EA6B6]">
                {beatIdx === 2 ? 'Свет зажёгся · далее ↓' : 'Листайте вниз'}
              </span>
            </div>
            <span className="hidden sm:inline font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#7D8796]">
              Г. Лейбниц · «Монадология», §17 (1714)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
