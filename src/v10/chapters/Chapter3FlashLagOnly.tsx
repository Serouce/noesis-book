import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, Pause, RotateCcw } from 'lucide-react';
import { useExplorer } from '../../v7/context/ExplorerContext';
import { NoesisInstrumentFrame } from '../../v9/components/NoesisInstrumentFrame';
import { DossierTrigger } from '../../v9/components/NoesisDossierSheet';
import { useViewportRaf } from '../../v9/hooks/useViewportRaf';
import {
  drawSwissGrid,
  releaseCanvasMemory,
  resizeHiDpiCanvas,
} from '../../v9/canvas/noesisCanvasKit';
import { ruTypo } from '../../v9/utils/ruTypo';

type FlashLagMode = 'continuous' | 'terminated' | 'reversal';

/**
 * ACT II · PART 3.2: Pure Optical Illusion of Time — Eagleman Flash-Lag (Science 2000) & Chronostasis (Nature 2001)
 * Zero tedious clickers: pure live optical proof right in the reader's eyes that "now" is post-edited with an ~80 ms delay!
 */
export function Chapter3FlashLagOnly() {
  const { setFlashLagCompleted } = useExplorer();
  const [flMode, setFlMode] = useState<FlashLagMode>('continuous');
  const [flFrozen, setFlFrozen] = useState(false);
  const [flTried, setFlTried] = useState<Record<string, boolean>>({ continuous: true });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ mode: flMode, frozen: flFrozen, cycleStartMs: 0 });
  stateRef.current.mode = flMode;
  stateRef.current.frozen = flFrozen;

  const handleSelectMode = (next: FlashLagMode) => {
    setFlMode(next);
    setFlFrozen(false);
    stateRef.current.cycleStartMs = performance.now();
    setFlTried((prev) => {
      const updated = { ...prev, [next]: true };
      if (Object.keys(updated).length >= 2) setFlashLagCompleted(true);
      return updated;
    });
  };

  const drawFrame = useCallback((nowMs: number) => {
    const canvas = canvasRef.current;
    const box = wrapRef.current;
    if (!canvas || !box) return;

    const { ctx, width, height } = resizeHiDpiCanvas(canvas, box.clientWidth, box.clientHeight);
    if (!ctx) return;

    const { mode, frozen } = stateRef.current;
    if (!stateRef.current.cycleStartMs) stateRef.current.cycleStartMs = nowMs;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0D1016';
    ctx.fillRect(0, 0, width, height);
    drawSwissGrid(ctx, width, height, 28, true);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width * 0.36, height * 0.36, 94);

    const cycleSec = 1.9;
    const tInCycle = frozen ? cycleSec * 0.5 : ((nowMs - stateRef.current.cycleStartMs) / 1000) % cycleSec;
    const dtFlash = tInCycle - cycleSec * 0.5;
    const omega = (Math.PI * 2) / cycleSec;

    let angle = -Math.PI / 2;
    let showBar = true;

    if (mode === 'continuous') {
      angle = -Math.PI / 2 + dtFlash * omega;
    } else if (mode === 'terminated') {
      // Eagleman & Sejnowski (Science, 2000) Flash-Terminated: bar vanishes right after flash!
      angle = -Math.PI / 2 + dtFlash * omega;
      if (!frozen && dtFlash > 0.025) showBar = false;
    } else {
      angle = dtFlash <= 0 ? -Math.PI / 2 + dtFlash * omega : -Math.PI / 2 - dtFlash * omega;
      if (!frozen && dtFlash > 0.46) showBar = false;
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(250, 249, 245, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Central fixation cross (+)
    ctx.strokeStyle = 'rgba(250, 249, 245, 0.72)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy);
    ctx.lineTo(cx + 7, cy);
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx, cy + 7);
    ctx.stroke();

    if (showBar) {
      const x1 = cx + Math.cos(angle) * (radius * 0.34);
      const y1 = cy + Math.sin(angle) * (radius * 0.34);
      const x2 = cx + Math.cos(angle) * (radius * 0.92);
      const y2 = cy + Math.sin(angle) * (radius * 0.92);
      ctx.strokeStyle = '#FAF9F5';
      ctx.lineWidth = 4.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Exact ~50ms crimson alignment flash at 12 o'clock
    if (frozen || Math.abs(dtFlash) <= 0.024) {
      ctx.strokeStyle = '#FC4109';
      ctx.lineWidth = 5.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 1.04);
      ctx.lineTo(cx, cy - radius * 1.33);
      ctx.stroke();
    }

    if (frozen) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(Math.round(cx) + 0.5, 14);
      ctx.lineTo(Math.round(cx) + 0.5, height - 14);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }, []);

  useViewportRaf(wrapRef, drawFrame, { enabled: true });

  useEffect(() => {
    const c = canvasRef.current;
    return () => releaseCanvasMemory(c);
  }, []);

  return (
    <section
      id="ch-time"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Иллюзия времени Flash-Lag — монтаж настоящего с задержкой 80 мс"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ГЛАВА 03 · МОНТАЖ ВРЕМЕНИ · 80 МИЛЛИСЕКУНД</span>
          <span>ИЛЛЮЗИЯ FLASH-LAG (SCIENCE, 2000) · стр. 44</span>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-[clamp(28px,3.8vw,46px)] leading-[1.08] tracking-[-0.028em]">
              <span className="font-display font-bold block">Ваше «сейчас»</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                выходит в эфир с задержкой 80 мс.
              </span>
            </h3>

            <p className="text-[15px] leading-[1.68] text-[#2F2E2B]">
              {ruTypo(
                'Смотрите в центр креста (+) на приборе: ровно в тот миг, когда белая стрелка проходит 12 часов, строго на одной линии с ней вспыхивает алый штрих. Но ваши глаза клянутся, что стрелка уже обогнала вспышку!',
              )}
            </p>
            <p className="text-[14.5px] leading-[1.66] text-[#4B4A46]">
              {ruTypo(
                'Главный удар — переключите режим на «Разворот после вспышки»: стрелка меняет направление ПОСЛЕ того, как свет уже погас, — но мозг успевает задним числом переписать прошлое и сдвинуть её в новую сторону! Этот приём называется ',
              )}
              <strong className="font-semibold text-[#141413]">постдикцией</strong>.
            </p>

            <div className="p-4 rounded-xl bg-[#F3F1E9] border border-[#141413]/12 space-y-1.5">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#004EDF] font-semibold inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>ЭФФЕКТ ОСТАНОВЛЕННЫХ ЧАСОВ (YARROW, NATURE 2001)</span>
              </div>
              <p className="text-[13px] leading-[1.56] text-[#353431]">
                {ruTypo(
                  'Замечали, что при быстром взгляде на секундную стрелку первая секунда кажется неестественно длинной? Чтобы скрыть смаз от скачка глаз, мозг задним числом растягивает картинку часов на время движения взгляда.',
                )}
              </p>
            </div>

            <DossierTrigger
              dossier="blindsight-time-2000"
              label="Постдикция 80 мс (Eagleman, Science 2000) и границы визуального «прямого эфира»"
              meta="Архивное досье II.3 · Уровень 2"
              className="w-full"
            />
          </div>

          <div className="lg:col-span-7">
            <NoesisInstrumentFrame
              code="ПРИБОР II.3 · ОПТИЧЕСКИЙ ОПЫТ FLASH-LAG"
              badge="self-test"
              telemetry={flFrozen ? 'СТОП-КАДР t = 0 МС · Δ = 0.0°' : 'ОКНО ПОСТДИКЦИИ ~80 МС'}
              surface="darkroom"
              footnote="Eagleman & Sejnowski (Science, 2000) · сравните 3 режима и проверьте в Стоп-кадре"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'continuous', label: '1. Обычное движение' },
                      { id: 'terminated', label: '2. Исчезновение на вспышке' },
                      { id: 'reversal', label: '3. Разворот после вспышки' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMode(m.id)}
                      className={`v6-pill px-3 py-1.5 rounded-full text-[11.5px] font-medium border text-left sm:text-center cursor-pointer ${
                        flMode === m.id
                          ? 'bg-[#FAF9F5] text-[#141413] border-[#FAF9F5]'
                          : 'bg-[#191E28] text-[#C8D0DC] border-[#FAF9F5]/14 hover:bg-[#232B3A]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setFlFrozen((f) => !f);
                      setFlashLagCompleted(true);
                    }}
                    className={`v6-pill px-3 py-1.5 rounded-full text-[11px] font-mono-tech uppercase tracking-[0.07em] font-semibold border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      flFrozen
                        ? 'bg-[#34D399] text-[#081A14] border-[#34D399]'
                        : 'bg-[#FC4109]/18 text-[#FFB89E] border-[#FC4109]/45 hover:bg-[#FC4109]/30'
                    }`}
                  >
                    {flFrozen ? <RotateCcw className="w-3.5 h-3.5" /> : <Pause className="w-3 h-3" />}
                    <span>{flFrozen ? 'Запустить снова' : 'Стоп-кадр t = 0 мс'}</span>
                  </button>
                </div>

                {/* Crisp HTML Status Banner (never clipped on mobile!) */}
                <div
                  className={`font-mono-tech text-[10.5px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-lg border ${
                    flFrozen
                      ? 'bg-[#34D399]/10 border-[#34D399]/35 text-[#34D399]'
                      : 'bg-[#161B24] border-[#FAF9F5]/10 text-[#9AA3B2]'
                  }`}
                >
                  {flFrozen
                    ? 'СТОП-КАДР t = 0 МС · Δ = 0.0° · БЕЛАЯ И АЛАЯ ПОЛОСЫ ИДЕАЛЬНО НА ОДНОМ ЛУЧЕ'
                    : 'СМОТРИТЕ В ЦЕНТРАЛЬНЫЙ КРЕСТ + · ВСПЫШКА ~50 МС НА 12 ЧАСАХ'}
                </div>

                <div
                  ref={wrapRef}
                  className="relative w-full h-[256px] rounded-xl overflow-hidden border border-[#FAF9F5]/12 bg-[#0D1016]"
                >
                  <canvas ref={canvasRef} className="w-full h-full block" />
                </div>

                <div className="rounded-xl bg-[#181D27] border border-[#FAF9F5]/10 p-3.5 text-[13px] leading-[1.56] text-[#C8D0DC]">
                  {flFrozen ? (
                    <span className="text-[#34D399]">
                      <strong>Физическая истина:</strong> зелёная линия доказывает, что в момент вспышки белая и алая полосы лежат на одном луче (Δ = 0.0°). Сдвиг целиком создан вашим мозгом!
                    </span>
                  ) : flMode === 'continuous' ? (
                    <span>
                      <strong>Режим 1:</strong> белая стрелка кажется вырвавшейся вперёд по часовой стрелке относительно вспышки.
                    </span>
                  ) : flMode === 'terminated' ? (
                    <span>
                      <strong>Режим 2 (Flash-Terminated):</strong> стрелка исчезает сразу после вспышки — и иллюзия пропадает! Мозг НЕ предсказывал её путь заранее.
                    </span>
                  ) : (
                    <span>
                      <strong>Режим 3 (Разворот ПОСЛЕ вспышки):</strong> стрелка разворачивается уже после света — и кажется смещённой назад! Будущие 80 мс переписали ваше «сейчас».
                    </span>
                  )}
                </div>

                {Object.keys(flTried).length >= 2 && (
                  <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#34D399]">
                    ✓ Вы сравнили режимы постдикции — результат учтён в Паспорте книги
                  </div>
                )}
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
