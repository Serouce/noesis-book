import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Lock } from 'lucide-react';
import { useExplorer, type CogitateBet } from '../../v7/context/ExplorerContext';
import { NoesisBrainStage3D } from '../webgl/NoesisBrainStage3D';
import { DossierTrigger } from '../../v9/components/NoesisDossierSheet';
import { ruTypo } from '../../v9/utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

const ATLAS_STAGES = [
  {
    id: 1,
    kicker: '3D-ПОЛЁТ · ГЛАВА 05 · КАДР 1/4 · ПАРАДОКС 69 МИЛЛИАРДОВ',
    title: '80% нейронов мозга живут в полной темноте',
    body: 'В небольшом кобальтовом мозжечке у затылка упакованы 69 миллиардов нейронов — вчетверо больше, чем во всей коре полушарий (16 млрд). Но люди, родившиеся без мозжечка (Yu et al., Brain 2014), сохраняют ясное сознание. Дело не в числе клеток, а в глобальных обратных петлях коры.',
    badge: 'МОЗЖЕЧОК (69 МЛРД) VS КОРА (16 МЛРД)',
  },
  {
    id: 2,
    kicker: '3D-ПОЛЁТ · ГЛАВА 05 · КАДР 2/4 · СЕТЬ SCAN (NATURE 2023)',
    title: 'Ум и тело сшиты в двигательной полосе коры M1',
    body: '86 лет учебники рисовали ровную полосу тела Пенфилда вдоль двигательной коры (M1). В 2023 году сверхточный МРТ (Gordon & Dosenbach, Nature) разорвал эту полосу: строго между стопой, кистью и ртом оказались вшиты 3 алых узла сети SCAN — они связывают план действия с дыханием, осанкой и внутренним состоянием тела.',
    badge: '3 УЗЛА SCAN НА M1 · NATURE 2023',
  },
  {
    id: 3,
    kicker: '3D-ПОЛЁТ · ГЛАВА 05 · КАДР 3/4 · БОЛЬШАЯ ДУЭЛЬ (COGITATE 2025)',
    title: 'Затылок (IIT) против Лба (GNWT): спор на 256 добровольцах',
    body: 'В 1998-м Кристоф Кох поспорил с Чалмерсом на ящик вина, что наука найдёт механизм сознания за 25 лет. Главной проверкой стала дуэль COGITATE (12 лабораторий, N = 256): Теория интегрированной информации (IIT, мера целостности Φ, кобальт в затылке) против Теории глобального рабочего пространства (GNWT, лобный «мегафон» внимания, алый).',
    badge: 'COGITATE CONSORTIUM · N = 256',
  },
  {
    id: 4,
    kicker: '3D-ПОЛЁТ · ГЛАВА 05 · КАДР 4/4 · ВЕРДИКТ 2025 + ВЫСШИЙ ТАЛАМУС',
    title: 'Обе макротеории пробиты — в центре просыпается Таламус',
    body: 'В апреле 2025 года (Nature) ни одна теория не взяла чистую победу: у IIT не нашли устойчивой высокочастотной синхронизации (гамма-ритм), у GNWT — вспышки при смене образа. В том же месяце в Science (Fang et al.) показали: глубинная диспетчерская в центре мозга — Высший таламус — опережает лобную кору в медленном тета-ритме (2–8 Гц)!',
    badge: 'ВЫСШИЙ ТАЛАМУС · SCIENCE АПР. 2025',
  },
];

/**
 * ACT III · CHAPTER 05: Full-Screen 320vh Apple-Class 3D Choreography around our 122k-triangle PBR MRI Brain!
 * Seamlessly glides through 4 chapters of modern neuroscience (2014–2025) on ONE continuous 3D camera flight,
 * using true 2-pass Depth Pre-Pass crystal glass (ZERO z-fighting!) and spoiler-free COGITATE bet!
 */
export function Chapter5BrainAtlas3D() {
  const { state, setCogitateBet, setCerebellumTested } = useExplorer();
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const recordedCerebRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [manualFocus, setManualFocus] = useState<number>(0); // 0=auto-scroll, 1..5=override

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
        setProgress((prev) => (Math.abs(prev - p) > 0.005 ? p : prev));
        if (p > 0.05 && !recordedCerebRef.current) {
          recordedCerebRef.current = true;
          setCerebellumTested(true);
        }
        const idx = p < 0.27 ? 0 : p < 0.54 ? 1 : p < 0.78 ? 2 : 3;
        setStageIdx((prev) => {
          if (prev !== idx) {
            // Release any manual quick-camera pill as soon as the reader scrolls into a new stage!
            setManualFocus(0);
            return idx;
          }
          return prev;
        });
        if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      },
    });
    return () => trig.kill();
  }, [setCerebellumTested]);

  const effectiveIdx =
    manualFocus === 1 ? 0 : manualFocus === 2 ? 1 : manualFocus === 3 || manualFocus === 4 ? 2 : manualFocus === 5 ? 3 : stageIdx;
  const activeStage = ATLAS_STAGES[effectiveIdx] ?? ATLAS_STAGES[0];
  const betMade = state.cogitateBet !== null;

  const handleBet = (bet: Exclude<CogitateBet, null>) => {
    setCogitateBet(bet);
    setCerebellumTested(true);
    setManualFocus(5);
  };

  return (
    <section
      id="ch-4"
      className="relative bg-[#0E1117] text-[#FAF9F5] border-b border-[#FAF9F5]/10"
      data-hud-theme="dark"
      aria-label="Глава 05 — 3D-полёт вокруг мозга: 69 миллиардов, SCAN, COGITATE 2025 и Высший Таламус"
    >
      {/* FULL-SCREEN 320vh CONTINUOUS 3D PBR CHOREOGRAPHY */}
      <div ref={runwayRef} className="relative h-[320vh]">
        <div className="sticky top-0 min-h-[100svh] lg:h-[100svh] w-full flex flex-col justify-between px-5 md:px-12 lg:px-20 pt-20 pb-7">
          {/* Top Folio Header */}
          <div className="max-w-[1240px] mx-auto w-full flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#9EA6B6]">
            <span className="text-[#FC4109] font-semibold">
              {effectiveIdx === 3 && !betMade
                ? '3D-ПОЛЁТ · ГЛАВА 05 · КАДР 4/4 · ЗАПЕЧАТАННЫЙ ВЕРДИКТ'
                : activeStage.kicker}
            </span>
            <span>АКТ III · ВСКРЫТИЕ · стр. 72</span>
          </div>

          <div className="max-w-[1240px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-7 items-center my-2">
            {/* Left 5 cols: Editorial Story + Spoiler-free COGITATE Bet */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5]/8 border border-[#FAF9F5]/14 font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#CBD3DF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FC4109]" />
                <span>
                  {effectiveIdx === 3 && !betMade
                    ? 'КОНВЕРТ NATURE & SCIENCE 2025 ЗАКРЫТ'
                    : activeStage.badge}
                </span>
              </div>

              <h2 className="text-[clamp(24px,3.2vw,42px)] leading-[1.06] tracking-[-0.03em] text-[#FAF9F5]">
                <span className="font-display font-bold block">
                  {effectiveIdx === 3 && !betMade
                    ? 'Сделайте ставку — кто победил в дуэли 2025 года?'
                    : ruTypo(activeStage.title)}
                </span>
              </h2>

              <p className="font-serif-editorial italic text-[15.5px] md:text-[17px] leading-[1.54] text-[#D0D7E3]">
                {effectiveIdx === 3 && !betMade
                  ? ruTypo(
                      'Перед тем как вскрыть результаты Nature и Science (апрель 2025), зафиксируйте вашу интуицию: где прячется главный субстрат сознания?',
                    )
                  : ruTypo(activeStage.body)}
              </p>

              {/* Compact 1-click COGITATE Bet right inside Stages 3-4! */}
              {effectiveIdx >= 2 && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'iit', label: 'Затылок (IIT)' },
                        { id: 'gnwt', label: 'Лоб (GNWT)' },
                        { id: 'draw', label: 'Обе ошибутся' },
                      ] as const
                    ).map((opt) => {
                      const chosen = state.cogitateBet === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleBet(opt.id)}
                          className={`v6-pill px-3 py-2.5 rounded-xl border text-[12.5px] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                            chosen
                              ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109]'
                              : 'bg-[#181D27] hover:bg-[#222938] text-[#E2E8F0] border-[#FAF9F5]/14'
                          }`}
                        >
                          {chosen ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3 opacity-60" />}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {betMade && (
                    <div className="text-[11.5px] font-mono-tech text-[#E5C67A]">
                      ● Ставка записана в Паспорт · Вердикт Nature &amp; Science 2025 открыт
                    </div>
                  )}
                </div>
              )}

              {/* Scroll progress & Dossier link */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-32 h-[3px] rounded-full bg-[#FAF9F5]/16 overflow-hidden">
                    <div
                      ref={barRef}
                      className="h-full w-full origin-left bg-[#FC4109]"
                      style={{ transform: 'scaleX(0)' }}
                    />
                  </div>
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#9EA6B6]">
                    {effectiveIdx === 3 && betMade
                      ? 'Кадр 4 / 4 · финал'
                      : `Кадр ${effectiveIdx + 1} / 4 · листайте вниз`}
                  </span>
                </div>
                {betMade ? (
                  <DossierTrigger
                    dossier="cogitate-2025"
                    label="Досье COGITATE + Таламус (2025)"
                    meta="Досье III.2 · Уровень 2"
                    dark
                  />
                ) : effectiveIdx === 1 ? (
                  <DossierTrigger
                    dossier="scan-parkinson-2026"
                    label="Сеть SCAN и Паркинсон (Nature 2023/2026)"
                    meta="Досье III.1б · Уровень 2"
                    dark
                  />
                ) : null}
              </div>
            </div>

            {/* Right 7 cols: Full-Presence 122k-Triangle Anatomical 3D MRI Brain */}
            <div className="lg:col-span-7 space-y-3">
              <div className="rounded-2xl border border-[#FAF9F5]/12 bg-[#090B10] shadow-[0_30px_80px_rgba(0,0,0,0.55)] overflow-hidden">
                <NoesisBrainStage3D
                  mode="atlas"
                  dark
                  progress={effectiveIdx === 3 && !betMade ? 0.68 : progress}
                  focusMode={manualFocus}
                  className="w-full h-[380px] sm:h-[440px] lg:h-[480px]"
                  caption="МРТ-АТЛАС ICBM152 · SUIT · CIT168 · ПЕРЕТАЩИТЕ ДЛЯ ВРАЩЕНИЯ"
                />
              </div>

              {/* Single-row crisp Swiss Quick-Camera Pills (zero orphan wrap!) */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 font-mono-tech text-[9.5px] uppercase">
                {[
                  { id: 0, lbl: 'Авто' },
                  { id: 1, lbl: '1. Мозжечок 69 млрд' },
                  { id: 2, lbl: '2. Сеть SCAN' },
                  { id: 3, lbl: '3. Затылок IIT' },
                  { id: 4, lbl: '4. Лоб GNWT' },
                  ...(betMade ? [{ id: 5, lbl: '5. Таламус' }] : []),
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setManualFocus(b.id)}
                    className={`v6-pill px-2.5 py-1.5 rounded-full border whitespace-nowrap cursor-pointer ${
                      manualFocus === b.id
                        ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5] font-semibold'
                        : 'bg-[#161B24] text-[#B8C1D0] border-[#FAF9F5]/14 hover:bg-[#222938]'
                    }`}
                  >
                    {b.lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-[1240px] mx-auto w-full hidden sm:flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#7D8796]">
            <span>
              {betMade
                ? 'AZEVEDO 2009 · GORDON & DOSENBACH 2023 · COGITATE NATURE 2025 · FANG SCIENCE 2025'
                : 'AZEVEDO 2009 · GORDON & DOSENBACH 2023 · ПРОТОКОЛ COGITATE (N = 256)'}
            </span>
            <span>ДАЛЕЕ: СПУСК ×1000 В ОДНУ КЛЕТКУ ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
