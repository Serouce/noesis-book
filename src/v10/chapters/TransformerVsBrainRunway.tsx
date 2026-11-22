import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TransformerVsBrainCanvas } from '../webgl/TransformerVsBrainCanvas';
import { ruTypo } from '../../v9/utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

const AI_BEATS = [
  {
    kicker: 'БОЛЬШИЕ ЯЗЫКОВЫЕ МОДЕЛИ (LLM) · КАДР 1/3 · ОДНОСТОРОННИЙ ПРОХОД',
    title: 'Трансформер живёт лишь на один выдох',
    body: 'Когда вы пишете чат-боту, сигнал пролетает сквозь десятки слоёв числовых настроек («весов») строго слева направо — и выдаёт следующее слово. Между вашими сообщениями внутри нет потока времени и обратных петель: только застывшая таблица чисел в тишине.',
  },
  {
    kicker: 'ВСКРЫТИЕ ВЕСОВ ANTHROPIC · КАДР 2/3 · СОЗВЕЗДИЯ СМЫСЛОВ',
    title: 'Внутри чисел нашли карту понятий — но не хозяина',
    body: 'С помощью цифрового микроскопа (разреженных автоэнкодеров, SAE), раскладывающего поток чисел на отдельные понятия, и прослеживания маршрутов сигнала (Circuit Tracing) учёные увидели целые созвездия смыслов. Но у этих созвездий нет «директора» — стоит усилить одно, и речь перестраивается целиком.',
  },
  {
    kicker: 'ЖИВОЙ МОЗГ ПРОТИВ КОДА · КАДР 3/3 · ЗАМКНУТАЯ ПЕТЛЯ',
    title: 'Сознание — это вихрь, который сам себя питает',
    body: 'В живой коре нет «конца ответа». Каждое мгновение возвращается назад по миллиардам обратных петель, сверяется с телом и бьющимся сердцем — и не гаснет ни на секунду. Способен ли кремний однажды свернуться в такое же живое замкнутое кольцо (тор)?',
  },
];

/**
 * Full-Bleed 235vh Cinema WebGL Runway #2 (Act IV Visual Rhyme to Leibniz's Mill in Act I!)
 * Morphs 4,200 GPU particles: Transformer Forward-Pass Layers -> Anthropic SAE Concept Constellations -> Living Recurrent Torus!
 */
export function TransformerVsBrainRunway() {
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
        const b = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
        setBeatIdx((prev) => (prev === b ? prev : b));
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }
      },
    });
    return () => trig.kill();
  }, []);

  const beat = AI_BEATS[beatIdx] ?? AI_BEATS[0];

  return (
    <div
      id="transformer-vs-brain-runway"
      ref={runwayRef}
      data-hud-theme="dark"
      className="relative w-full h-[235vh] bg-[#0B0D11] text-[#FAF9F5] border-t border-b border-[#FAF9F5]/10 mt-18"
      aria-label="Кинематографическая сцена: архитектура Трансформера против живой петли мозга"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <TransformerVsBrainCanvas progress={progress} className="absolute inset-0 w-full h-full" />

        {/* Strong protective left + top/bottom optical scrims so typography NEVER touches WebGL particles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(11,13,17,0.97) 0%, rgba(11,13,17,0.90) 37%, rgba(11,13,17,0.22) 54%, rgba(11,13,17,0.0) 68%), linear-gradient(180deg, rgba(11,13,17,0.95) 0%, rgba(11,13,17,0.0) 18%, rgba(11,13,17,0.0) 82%, rgba(11,13,17,0.96) 100%)',
          }}
        />

        <div className="relative z-10 h-full max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 pt-24 pb-12 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.16em] text-[#A8B1C2]">
            <span className="text-[#FC4109] font-semibold">{beat.kicker}</span>
            <span>ТРАНСФОРМЕР ⇄ ПЕТЛЯ · 4 200 ТОЧЕК</span>
          </div>

          <div className="max-w-[490px] space-y-5">
            <h3 className="text-[clamp(28px,4.1vw,52px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block text-[#FAF9F5]">{ruTypo(beat.title)}</span>
            </h3>
            <p className="font-serif-editorial italic text-[17px] md:text-[19.5px] leading-[1.54] text-[#DDE3EE]">
              {ruTypo(beat.body)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-40 h-[3px] rounded-full bg-[#FAF9F5]/18 overflow-hidden">
                <div
                  ref={barRef}
                  className="h-full w-full origin-left bg-[#FC4109]"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#9EA6B6]">
                {beatIdx === 2
                  ? 'К объективу HAL 9000 и спору лабораторий ↓'
                  : 'Листайте вниз · трансформация архитектуры'}
              </span>
            </div>
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#7D8796]">
              ANTHROPIC · GOOGLE DEEPMIND · BUTLIN ET AL. (2024–2026)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
