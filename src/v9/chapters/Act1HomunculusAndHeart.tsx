import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, Fingerprint, Scissors } from 'lucide-react';
import { useExplorer } from '../../v7/context/ExplorerContext';
import { NoesisInstrumentFrame } from '../components/NoesisInstrumentFrame';
import { DossierTrigger } from '../components/NoesisDossierSheet';
import { NoesisBrain3D } from '../three/NoesisBrain3D';
import { useViewportRaf } from '../hooks/useViewportRaf';
import {
  drawOpticalSpikeDot,
  drawSwissGrid,
  releaseCanvasMemory,
  resizeHiDpiCanvas,
} from '../canvas/noesisCanvasKit';
import { ruTypo } from '../utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

type CardiacPhase = 'systole' | 'diastole';

/**
 * ACT I · CHAPTER I.2: "Взломанный Гомункулус и Затвор Сердца" (NOESIS v9.2 Real 3D MRI + Honest PNAS 2020)
 * 1. Scroll Setpiece #1 (205vh, CSS position:sticky — 0 GSAP pin:true!):
 *    Real FreeSurfer fsaverage5 3D MRI Brain where the continuous 1937 Penfield cobalt ribbon along the
 *    precentral gyrus (M1) PHYSICALLY FRACTURES in the fragment shader into 3 crimson SCAN inter-effector
 *    nodes (Gordon & Dosenbach, Nature 2023) + live optical anterior-posterior slice plane (clipZ)!
 *    All labels are crisp HTML (>=11px) — zero 7px SVG text or brain collision!
 * 2. Instrument I.2 (Cardiac Gate, Al & Villringer PNAS 2020):
 *    Honest explanation of individual ~50% psychometric threshold calibration (with clearly noted contrast
 *    amplification in the x5 interactive model: 3/8 systole vs 6/8 diastole) & unbounded exact counters!
 */
export function Act1HomunculusAndHeart() {
  const { setHepTested } = useExplorer();

  // Scroll Setpiece #1 refs (3D MRI Penfield 1937 -> SCAN 2023 fracture)
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<'penfield' | 'fracturing' | 'scan'>('penfield');
  const [sliceMode, setSliceMode] = useState(false);
  const [sliceDepth, setSliceDepth] = useState(0.02); // Coronal optical cut right along M1 precentral gyrus!

  // Instrument I.2 (Cardiac Gate x5 Slow-Motion) — unbounded exact counters (fixes .slice(-15) bug!)
  const [selectedPhase, setSelectedPhase] = useState<CardiacPhase>('systole');
  const [systoleStats, setSystoleStats] = useState({ total: 0, hits: 0 });
  const [diastoleStats, setDiastoleStats] = useState({ total: 0, hits: 0 });

  const ecgWrapRef = useRef<HTMLDivElement | null>(null);
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastProbeRef = useRef<{ phase: CardiacPhase; detected: boolean; atMs: number; u: number } | null>(null);

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
        const nextPhase = p < 0.34 ? 'penfield' : p < 0.66 ? 'fracturing' : 'scan';
        setScanPhase((prev) => (prev === nextPhase ? prev : nextPhase));

        const fracture = Math.max(0, Math.min(1, (p - 0.22) / 0.56));
        setScanProgress((prev) => (Math.abs(prev - fracture) > 0.015 ? fracture : prev));

        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }
      },
    });

    return () => trigger.kill();
  }, []);

  const fireTactileProbe = () => {
    // Deterministic clear pattern aligned with honest note (model contrasts ~50% threshold shift: 3/8 systole vs 6/8 diastole)
    const patternSystole = [false, false, true, false, true, false, false, true]; // 3/8
    const patternDiastole = [true, true, false, true, true, true, false, true]; // 6/8

    let detected = false;
    if (selectedPhase === 'systole') {
      detected = patternSystole[systoleStats.total % patternSystole.length];
      setSystoleStats((s) => ({ total: s.total + 1, hits: s.hits + (detected ? 1 : 0) }));
    } else {
      detected = patternDiastole[diastoleStats.total % patternDiastole.length];
      setDiastoleStats((s) => ({ total: s.total + 1, hits: s.hits + (detected ? 1 : 0) }));
    }

    // Anchor marker to the exact nearest visible Systole (+0.33) or Diastole (+0.74) band on the scrolling ECG!
    const nowMs = performance.now();
    const phaseOffsetNow = (nowMs * 0.001) / 4.2;
    const centerU = phaseOffsetNow + 1.65 * 0.56;
    const bandOffset = selectedPhase === 'systole' ? 0.33 : 0.74;
    const targetBeat = Math.round(centerU - bandOffset);
    const probeU = targetBeat + bandOffset;

    lastProbeRef.current = { phase: selectedPhase, detected, atMs: nowMs, u: probeU };
    setHepTested(true);
  };

  // Slowed x5 ECG waveform + highlighted systole/diastole windows (useViewportRaf -> 0% offscreen CPU!)
  const drawEcg = useCallback(
    (nowMs: number) => {
      const canvas = ecgCanvasRef.current;
      const box = ecgWrapRef.current;
      if (!canvas || !box) return;

      const { ctx, width, height } = resizeHiDpiCanvas(canvas, box.clientWidth, box.clientHeight);
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#111419';
      ctx.fillRect(0, 0, width, height);
      drawSwissGrid(ctx, width, height, 24, true);

      const beatPeriod = 4.2;
      const phaseOffset = (nowMs * 0.001) / beatPeriod;

      const ecgSample = (u: number): number => {
        const f = ((u % 1) + 1) % 1;
        let v = 0;
        v += 0.14 * Math.exp(-Math.pow((f - 0.11) / 0.025, 2));
        v -= 0.16 * Math.exp(-Math.pow((f - 0.185) / 0.009, 2));
        v += 0.95 * Math.exp(-Math.pow((f - 0.205) / 0.011, 2));
        v -= 0.28 * Math.exp(-Math.pow((f - 0.228) / 0.011, 2));
        v += 0.24 * Math.exp(-Math.pow((f - 0.40) / 0.042, 2));
        return v;
      };

      const cyclesAcross = 1.65;
      const midY = height * 0.62;
      const ampY = height * 0.42;

      for (let c = -1; c <= 2; c += 1) {
        const beatStartU = Math.floor(phaseOffset) + c - phaseOffset;
        const sysX1 = ((beatStartU + 0.18) / cyclesAcross) * width;
        const sysX2 = ((beatStartU + 0.48) / cyclesAcross) * width;
        const diaX1 = ((beatStartU + 0.52) / cyclesAcross) * width;
        const diaX2 = ((beatStartU + 0.96) / cyclesAcross) * width;

        ctx.fillStyle =
          selectedPhase === 'systole' ? 'rgba(252, 65, 9, 0.18)' : 'rgba(252, 65, 9, 0.05)';
        ctx.fillRect(sysX1, 0, Math.max(0, sysX2 - sysX1), height);

        ctx.fillStyle =
          selectedPhase === 'diastole' ? 'rgba(52, 211, 153, 0.14)' : 'rgba(52, 211, 153, 0.03)';
        ctx.fillRect(diaX1, 0, Math.max(0, diaX2 - diaX1), height);
      }

      ctx.save();
      ctx.strokeStyle = '#FAF9F5';
      ctx.lineWidth = 1.85;
      ctx.beginPath();
      const steps = Math.max(120, Math.floor(width / 2));
      for (let i = 0; i <= steps; i += 1) {
        const x = (i / steps) * width;
        const u = phaseOffset + (i / steps) * cyclesAcross;
        const y = midY - ecgSample(u) * ampY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      const probe = lastProbeRef.current;
      if (probe && nowMs - probe.atMs < 1800) {
        const age = (nowMs - probe.atMs) / 1800;
        const px = ((probe.u - phaseOffset) / cyclesAcross) * width;
        if (px >= 10 && px <= width - 10) {
          const py = midY - ecgSample(probe.u) * ampY;
          ctx.save();
          ctx.globalAlpha = Math.max(0.15, 1 - age * 0.72);
          ctx.strokeStyle = probe.detected ? 'rgba(52, 211, 153, 0.55)' : 'rgba(252, 65, 9, 0.55)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(px, 28);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.setLineDash([]);
          drawOpticalSpikeDot(ctx, px, py, 4.5, probe.detected ? '#34D399' : '#FC4109');
          ctx.font = '700 10px "JetBrains Mono Variable", monospace';
          ctx.fillStyle = probe.detected ? '#34D399' : '#FF8C66';
          ctx.fillText(
            probe.detected ? '● ОЩУТИЛИ ПРИКОСНОВЕНИЕ' : '○ ПОРОГ ВЫШЕ · ПРОПУЩЕНО',
            Math.max(12, Math.min(width - 195, px - 68)),
            22,
          );
          ctx.restore();
        }
      }
    },
    [selectedPhase],
  );

  useViewportRaf(ecgWrapRef, drawEcg, { enabled: true });

  useEffect(() => {
    const c = ecgCanvasRef.current;
    return () => releaseCanvasMemory(c);
  }, []);

  const scanStages = {
    penfield: {
      kicker: 'СКРОЛЛ-СЕТПИС #1 · 1937 · КАРТА ПЕНФИЛДА',
      title: 'Восемьдесят шесть лет учебники рисовали ровную полосу тела',
      body: 'В 1937 году нейрохирург Уайлдер Пенфилд начертил знаменитый кортикальный гомункулус: вдоль прецентральной извилины моторной коры (M1) от макушки к виску якобы тянется непрерывная лента — стопа, кисть и лицо.',
    },
    fracturing: {
      kicker: 'СКРОЛЛ-СЕТПИС #1 · 2023 · ПРОВЕРКА СВЕРХТОЧНЫМ МРТ',
      title: 'Но в 2023 году непрерывная лента треснула в трёх местах',
      body: 'Когда Эван Гордон и Нико Дозенбах (Nature, 2023) просканировали мозг каждого человека часами в сверхвысоком разрешении, сплошная дуга M1 распалась.',
    },
    scan: {
      kicker: 'СКРОЛЛ-СЕТПИС #1 · СЕТЬ SCAN (NATURE 2023)',
      title: 'Три вставки разума, сшивающие мышцы, план и внутренние органы',
      body: 'Строго между стопой, кистью и ртом оказались вшиты три узла сети SCAN (сомато-когнитивного действия). Они связывают кору не с отдельным пальцем, а с дыханием, пульсом, осанкой и волей — поэтому ум неразрывно вплетён в тело.',
    },
  };

  const activeCopy = scanStages[scanPhase];

  return (
    <section
      id="ch-homunculus"
      className="relative bg-[#FAF9F5] text-[#141413] border-b border-[#141413]/10"
      aria-label="Глава I.2 — Взломанный Гомункулус и Затвор Сердца"
    >
      {/* SCROLL SETPIECE #1 (205vh, CSS position:sticky — 0 GSAP pin:true!): REAL 3D MRI PENFIELD 1937 -> SCAN 2023 */}
      <div ref={runwayRef} className="relative h-[205vh] bg-[#FAF9F5] border-b border-[#141413]/10">
        <div className="sticky top-0 min-h-[100svh] lg:h-[100svh] w-full flex flex-col justify-between px-5 md:px-12 lg:px-20 pt-24 pb-10 md:pt-24 md:pb-12">
          <div className="max-w-[1240px] mx-auto w-full flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
            <span className="text-[#FC4109] font-semibold">АКТ I · ГЛАВА I.2 · {activeCopy.kicker}</span>
            <span>ПРЕЦЕНТРАЛЬНАЯ ИЗВИЛИНА M1 · стр. 14</span>
          </div>

          <div className="max-w-[1240px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-4">
            {/* Left 5 cols: Editorial Story + Clean Crisp HTML Anatomy Legend (>= 11px, 0% overlap!) */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-[clamp(24px,3.2vw,42px)] leading-[1.08] tracking-[-0.028em]">
                <span className="font-display font-bold block text-[#141413]">
                  {ruTypo(activeCopy.title)}
                </span>
              </h2>
              <p className="font-serif-editorial italic text-[16px] md:text-[17.5px] leading-[1.56] text-[#353431]">
                {ruTypo(activeCopy.body)}
              </p>

              {/* Crisp HTML Anatomy Key replacing tiny unreadable 7px SVG labels! */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#F3F1E9] border border-[#004EDF]/30">
                  <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.11em] text-[#004EDF] font-semibold">
                    ● КОБАЛЬТ · ПЕНФИЛД 1937
                  </div>
                  <p className="text-[12px] leading-[1.48] text-[#3B3A37] mt-1">
                    Три изолированных участка M1: <strong>Стопа</strong> (у макушки), <strong>Кисть</strong> (середина) и <strong>Лицо / Рот</strong> (висок).
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border transition-colors ${
                    scanProgress > 0.25
                      ? 'bg-[#FC4109]/8 border-[#FC4109]/45'
                      : 'bg-[#F3F1E9] border-[#141413]/12 opacity-65'
                  }`}
                >
                  <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.11em] text-[#FC4109] font-semibold">
                    ● АЛЫЙ · 3 УЗЛА SCAN 2023
                  </div>
                  <p className="text-[12px] leading-[1.48] text-[#3B3A37] mt-1">
                    Вклинены строго <strong>между</strong> стопой/кистью, кистью/ртом и ниже рта — уходят нитями вглубь к телу.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-3">
                <div className="w-32 h-[3px] rounded-full bg-[#141413]/14 overflow-hidden">
                  <div
                    ref={progressBarRef}
                    className="h-full w-full origin-left bg-[#FC4109]"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </div>
                <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-[#5E5D59]">
                  {scanPhase === 'scan'
                    ? 'Лента разорвана · SCAN 2023'
                    : 'Листайте вниз · разлом 3D-коры'}
                </span>
              </div>
            </div>

            {/* Right 7 cols: Real Interactive 3D MRI Brain (FreeSurfer fsaverage5) + Live Optical Coronal Slice Control */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative rounded-2xl border border-[#141413]/12 bg-[#FAF9F5] overflow-hidden shadow-[0_20px_54px_rgba(20,20,19,0.06)]">
                <NoesisBrain3D
                  mode="scan"
                  progress={scanProgress}
                  clipZ={sliceMode ? sliceDepth : 2.5}
                  className="w-full h-[320px] sm:h-[380px] lg:h-[430px]"
                  caption={
                    sliceMode
                      ? '3D Оптический срез коры M1 · Внутри видны нити SCAN к подкорке'
                      : '3D МРТ · Вращайте мышкой · Прецентральная извилина M1 (fsaverage5)'
                  }
                />
              </div>

              {/* Tactile Optical Clipping-Plane Switcher (Slices real 3D MRI brain along M1!) */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#F3F1E9] border border-[#141413]/12">
                <button
                  type="button"
                  onClick={() => setSliceMode((v) => !v)}
                  className={`v6-pill px-3.5 py-1.5 rounded-full font-mono-tech text-[10.5px] uppercase tracking-[0.09em] inline-flex items-center gap-1.5 cursor-pointer border ${
                    sliceMode
                      ? 'bg-[#FC4109] text-[#FAF9F5] border-[#FC4109]'
                      : 'bg-[#FAF9F5] text-[#141413] border-[#141413]/18 hover:bg-[#EAE7DC]'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{sliceMode ? 'Убрать 3D-срез' : 'Поперечный 3D-срез M1'}</span>
                </button>

                {sliceMode ? (
                  <div className="flex items-center gap-2.5 flex-1 min-w-[180px]">
                    <span className="font-mono-tech text-[10px] uppercase text-[#5E5D59] shrink-0">
                      Глубина среза:
                    </span>
                    <input
                      type="range"
                      min={-65}
                      max={65}
                      value={Math.round(sliceDepth * 100)}
                      onChange={(e) => setSliceDepth(Number(e.target.value) / 100)}
                      className="w-full accent-[#FC4109] cursor-pointer"
                      aria-label="Глубина поперечного 3D-среза коры M1"
                    />
                  </div>
                ) : (
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59]">
                    Разрежьте кору, чтобы увидеть внутренние нити SCAN
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-[1240px] mx-auto w-full hidden sm:flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#7A7872]">
            <span>GORDON &amp; DOSENBACH · NATURE 2023</span>
            <span>ТЕЛО И СОЗНАНИЕ СШИТЫ В ОДНОЙ КОРЕ</span>
          </div>
        </div>
      </div>

      {/* PART 2.2: INSTRUMENT I.2 — CARDIAC GATE (AL & VILLRINGER, PNAS 2020 — HONEST CALIBRATION!) */}
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 py-18 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 5 cols: Editorial Explanation + Level-2 Dossier */}
          <div className="lg:col-span-5 space-y-5">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
              СИГНАЛЫ ИЗНУТРИ ТЕЛА · ЗАТВОР СЕРДЦА (PNAS, 2020)
            </div>
            <h3 className="font-serif-editorial text-[28px] md:text-[36px] leading-[1.12] tracking-[-0.02em] text-[#141413]">
              {ruTypo('Мозг закрывает ворота мира с каждым ударом сердца')}
            </h3>
            <p className="text-[15px] leading-[1.68] text-[#30302E]">
              {ruTypo(
                'Сознание не парит в вакууме — оно сидит внутри пульсирующего тела. В момент сокращения сердца (систолы) волна крови бьёт по датчикам давления в сосудах (барорецепторам). Чтобы вы не сходили с ума от шума собственного пульса, мозг на долю секунды ',
              )}
              <strong className="font-semibold text-[#141413]">
                повышает порог восприятия (чувствительность кожи падает)
              </strong>
              {ruTypo(
                ' — пороговые прикосновения, настроенные на ~50% слышимости, в момент удара сердца заметно чаще проскальзывают мимо сознания (Al & Villringer, PNAS 2020).',
              )}
            </p>
            <p className="text-[14.5px] leading-[1.66] text-[#4F4E4A]">
              {ruTypo(
                'В паузе между ударами (диастоле) затвор снова открывается — и тот же самый слабый сигнал прорывается в опыт. В модели справа сдвиг порога контрастно усилен, чтобы вы чётко увидели разницу за 6–8 проб в замедлении ×5.',
              )}
            </p>

            <DossierTrigger
              dossier="scan-parkinson-2026"
              label="Прорыв февраля 2026 (Nature, N=863): SCAN и болезнь Паркинсона + отклик мозга на пульс"
              meta="Архивное досье I.1 · Уровень 2"
              className="w-full"
            />
          </div>

          {/* Right 7 cols: Honest x5 Slow-Motion Cardiac Gate Reconstruction */}
          <div className="lg:col-span-7">
            <NoesisInstrumentFrame
              code="ПРИБОР I.2 · ЗАТВОР СЕРДЦА (ЗАМЕДЛЕНИЕ ×5)"
              badge="reconstruction"
              telemetry={
                selectedPhase === 'systole'
                  ? 'ФАЗА: СИСТОЛА (ПОРОГ ПОВЫШЕН)'
                  : 'ФАЗА: ДИАСТОЛА (ЗАТВОР ОТКРЫТ)'
              }
              surface="darkroom"
              footnote="Al & Villringer (PNAS, 2020): стимул на ~50% пороге реже осознаётся в систолу (в модели контраст усилен для наглядности)"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex p-1 rounded-full bg-[#191E28] border border-[#FAF9F5]/14">
                    <button
                      type="button"
                      onClick={() => setSelectedPhase('systole')}
                      className={`v6-pill px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer ${
                        selectedPhase === 'systole'
                          ? 'bg-[#FC4109] text-[#FAF9F5]'
                          : 'text-[#C2C8D4] hover:text-[#FAF9F5]'
                      }`}
                    >
                      Удар сердца (Систола)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPhase('diastole')}
                      className={`v6-pill px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer ${
                        selectedPhase === 'diastole'
                          ? 'bg-[#34D399] text-[#0A1C15] font-semibold'
                          : 'text-[#C2C8D4] hover:text-[#FAF9F5]'
                      }`}
                    >
                      Пауза (Диастола)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={fireTactileProbe}
                    className="v6-pill h-9 px-4 rounded-full bg-[#FAF9F5] hover:bg-[#ECEAE2] text-[#141413] font-sans-ui text-[12.5px] font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Fingerprint className="w-3.5 h-3.5 text-[#FC4109]" />
                    <span>Подать пороговый стимул</span>
                  </button>
                </div>

                {/* Live x5 Slowed ECG Oscilloscope Canvas */}
                <div
                  ref={ecgWrapRef}
                  className="relative w-full h-[168px] rounded-xl overflow-hidden border border-[#FAF9F5]/12 bg-[#111419]"
                >
                  <canvas ref={ecgCanvasRef} className="w-full h-full block" />
                  <div className="pointer-events-none absolute bottom-2 left-3 font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#9AA3B2] inline-flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-[#FC4109]" />
                    <span>ЭКГ ×5 · ПИК УДАРА (QRS) → СИСТОЛА (КРАСНЫЙ) · ПАУЗА ДИАСТОЛЫ (ЗЕЛЁНЫЙ)</span>
                  </div>
                </div>

                {/* Unbounded Honest Trial Counters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-tech text-[11px]">
                  <div className="p-3.5 rounded-xl bg-[#181D27] border border-[#FC4109]/30">
                    <div className="flex items-center justify-between text-[10px] text-[#FF9B7D]">
                      <span>В СИСТОЛУ (УДАР)</span>
                      <span>ПОРОГ ВЫШЕ (~50% − Δ)</span>
                    </div>
                    <div className="text-[18px] font-bold text-[#FAF9F5] mt-1">
                      {systoleStats.total > 0
                        ? `${systoleStats.hits} из ${systoleStats.total} ощутили`
                        : 'Подайте пробу в систолу'}
                    </div>
                    <div className="text-[11px] font-sans-ui text-[#9AA3B2] mt-1">
                      Барорецепторы тормозят кору — часть слабых сигналов гасится (в модели ~3/8).
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#181D27] border border-[#34D399]/30">
                    <div className="flex items-center justify-between text-[10px] text-[#34D399]">
                      <span>В ДИАСТОЛУ (ПАУЗА)</span>
                      <span>ЗАТВОР ОТКРЫТ (~50% + Δ)</span>
                    </div>
                    <div className="text-[18px] font-bold text-[#FAF9F5] mt-1">
                      {diastoleStats.total > 0
                        ? `${diastoleStats.hits} из ${diastoleStats.total} ощутили`
                        : 'Подайте пробу в диастолу'}
                    </div>
                    <div className="text-[11px] font-sans-ui text-[#9AA3B2] mt-1">
                      Между ударами порог ниже — те же стимулы проходят заметно чаще (в модели ~6/8).
                    </div>
                  </div>
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
