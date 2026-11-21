import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, Fingerprint } from 'lucide-react';
import { useExplorer } from '../../v7/context/ExplorerContext';
import { NoesisInstrumentFrame } from '../components/NoesisInstrumentFrame';
import { DossierTrigger } from '../components/NoesisDossierSheet';
import { useViewportRaf } from '../hooks/useViewportRaf';
import {
  drawOpticalSpikeDot,
  drawSwissGrid,
  releaseCanvasMemory,
  resizeHiDpiCanvas,
} from '../canvas/noesisCanvasKit';
import { assetUrl } from '../utils/assetUrl';
import { ruTypo } from '../utils/ruTypo';

gsap.registerPlugin(ScrollTrigger);

type CardiacPhase = 'systole' | 'diastole';

interface HepTrial {
  phase: CardiacPhase;
  detected: boolean;
  seq: number;
}

/**
 * ACT I · CHAPTER 02: "Взломанный Гомункулус и Затвор Сердца"
 * 1. Scroll Setpiece #1 (205vh, pure CSS position:sticky):
 *    Sculptural studio coronal M1 slice (/v9/brain-coronal-m1.jpg) + 1937 Penfield radial arc ->
 *    physically fractures into 3 crimson SCAN inter-effector nodes (Gordon & Dosenbach, Nature 2023)!
 * 2. Instrument 02 (Cardiac Gate HEP, Al & Villringer PNAS 2020):
 *    Honest x5 slowed ECG waveform + manual phase probe (Systole raises threshold / lowers sensitivity vs Diastole opens gate!).
 * 3. Level-2 Dossier ("scan-parkinson-2026") cleanly holds the Feb 2026 Parkinson's/TMS study (no premature TMS leak!).
 */
export function Act1HomunculusAndHeart() {
  const { setHepTested } = useExplorer();

  // Scroll Setpiece #1 refs (Coronal M1 Penfield 1937 -> SCAN 2023)
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const penfieldGroupRef = useRef<SVGGElement | null>(null);
  const scanGroupRef = useRef<SVGGElement | null>(null);
  const [scanPhase, setScanPhase] = useState<'penfield' | 'fracturing' | 'scan'>('penfield');

  // Instrument 02 (Cardiac Gate HEP x5 Slow-Motion)
  const [selectedPhase, setSelectedPhase] = useState<CardiacPhase>('systole');
  const [trials, setTrials] = useState<HepTrial[]>([]);
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
      scrub: 0.45,
      onUpdate: (self) => {
        const p = self.progress;
        const nextPhase = p < 0.36 ? 'penfield' : p < 0.66 ? 'fracturing' : 'scan';
        setScanPhase((prev) => (prev === nextPhase ? prev : nextPhase));

        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }

        // Smooth optical crossfade: Penfield 1937 solid cobalt ribbon softens as 3 SCAN crimson nodes fracture it!
        const scanT = Math.max(0, Math.min(1, (p - 0.32) / 0.42));
        if (penfieldGroupRef.current) {
          penfieldGroupRef.current.style.opacity = `${(1 - scanT * 0.72).toFixed(3)}`;
        }
        if (scanGroupRef.current) {
          scanGroupRef.current.style.opacity = `${scanT.toFixed(3)}`;
        }
      },
    });

    return () => trigger.kill();
  }, []);

  // Deterministic realistic PNAS 2020 detection probability sequence (Systole ~38% vs Diastole ~76% — never purely random confusing noise!)
  const systoleCount = trials.filter((t) => t.phase === 'systole').length;
  const diastoleCount = trials.filter((t) => t.phase === 'diastole').length;

  const fireTactileProbe = () => {
    const patternSystole = [false, false, true, false, false, true, false, false];
    const patternDiastole = [true, true, false, true, true, true, false, true];
    const detected =
      selectedPhase === 'systole'
        ? patternSystole[systoleCount % patternSystole.length]
        : patternDiastole[diastoleCount % patternDiastole.length];

    // Anchor marker to the exact nearest visible Systole (+0.33) or Diastole (+0.74) band on the scrolling ECG!
    const nowMs = performance.now();
    const phaseOffsetNow = (nowMs * 0.001) / 4.2;
    const centerU = phaseOffsetNow + 1.65 * 0.56;
    const bandOffset = selectedPhase === 'systole' ? 0.33 : 0.74;
    const targetBeat = Math.round(centerU - bandOffset);
    const probeU = targetBeat + bandOffset;

    lastProbeRef.current = { phase: selectedPhase, detected, atMs: nowMs, u: probeU };
    setTrials((prev) => [...prev.slice(-15), { phase: selectedPhase, detected, seq: prev.length + 1 }]);
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

      // Slowed x5 cardiac cycle (1 beat = 4.2 seconds visual playback)
      const beatPeriod = 4.2;
      const phaseOffset = (nowMs * 0.001) / beatPeriod;

      const ecgSample = (u: number): number => {
        const f = ((u % 1) + 1) % 1;
        // P-wave (0.10) + crisp QRS spike (0.20) + T-wave (0.40) + flat Diastole (0.52..0.98)
        let v = 0;
        v += 0.14 * Math.exp(-Math.pow((f - 0.11) / 0.025, 2));
        v -= 0.16 * Math.exp(-Math.pow((f - 0.185) / 0.009, 2));
        v += 0.95 * Math.exp(-Math.pow((f - 0.205) / 0.011, 2));
        v -= 0.28 * Math.exp(-Math.pow((f - 0.228) / 0.011, 2));
        v += 0.24 * Math.exp(-Math.pow((f - 0.40) / 0.042, 2));
        return v;
      };

      // Highlight selected window band on the scrolling timeline
      const cyclesAcross = 1.65;
      const midY = height * 0.62;
      const ampY = height * 0.42;

      for (let c = -1; c <= 2; c += 1) {
        const beatStartU = Math.floor(phaseOffset) + c - phaseOffset;
        const sysX1 = (beatStartU + 0.18) / cyclesAcross * width;
        const sysX2 = (beatStartU + 0.48) / cyclesAcross * width;
        const diaX1 = (beatStartU + 0.52) / cyclesAcross * width;
        const diaX2 = (beatStartU + 0.96) / cyclesAcross * width;

        // Systole zone tint
        ctx.fillStyle =
          selectedPhase === 'systole' ? 'rgba(252, 65, 9, 0.18)' : 'rgba(252, 65, 9, 0.05)';
        ctx.fillRect(sysX1, 0, Math.max(0, sysX2 - sysX1), height);

        // Diastole zone tint
        ctx.fillStyle =
          selectedPhase === 'diastole' ? 'rgba(52, 211, 153, 0.14)' : 'rgba(52, 211, 153, 0.03)';
        ctx.fillRect(diaX1, 0, Math.max(0, diaX2 - diaX1), height);
      }

      // Draw ECG trace
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

      // Recent tactile probe flash marker — locked to the EXACT scrolling Systole/Diastole band & ECG trace!
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

  const systoleStats = {
    total: trials.filter((t) => t.phase === 'systole').length,
    hits: trials.filter((t) => t.phase === 'systole' && t.detected).length,
  };
  const diastoleStats = {
    total: trials.filter((t) => t.phase === 'diastole').length,
    hits: trials.filter((t) => t.phase === 'diastole' && t.detected).length,
  };

  const scanStages = {
    penfield: {
      kicker: 'СКРОЛЛ-СЕТПИС #1 · 1937 · КАРТА ПЕНФИЛДА',
      title: 'Восемьдесят шесть лет учебники рисовали ровную полосу тела',
      body: 'В 1937 году нейрохирург Уайлдер Пенфилд начертил знаменитый кортикальный гомункулус: вдоль моторной коры (M1) от макушки к виску якобы тянется непрерывная карта — стопа, туловище, гигантская кисть руки и лицо.',
    },
    fracturing: {
      kicker: 'СКРОЛЛ-СЕТПИС #1 · 2023 · ПРОВЕРКА СВЕРХТОЧНЫМ СКАНЕРОМ',
      title: 'Но в 2023 году непрерывная карта треснула в трёх местах',
      body: 'Когда Эван Гордон и Нико Дозенбах (Nature, 2023) просканировали мозг каждого человека часами в сверхвысоком разрешении, ровная лента Пенфилда распалась.',
    },
    scan: {
      kicker: 'СКРОЛЛ-СЕТПИС #1 · СЕТЬ SCAN (NATURE 2023)',
      title: 'Три вставки разума, связывающие мышцы, план и внутренние органы',
      body: 'Между зонами стопы, кисти и рта оказались вшиты три узла сети SCAN (сомато-когнитивного действия). Она соединяет кору не с отдельным пальцем, а с дыханием, пульсом, осанкой и волей — поэтому ум неразрывно вплетён в тело.',
    },
  };

  const activeCopy = scanStages[scanPhase];

  return (
    <section
      id="ch-homunculus"
      className="relative bg-[#FAF9F5] text-[#141413] border-b border-[#141413]/10"
      aria-label="Глава I.2 — Взломанный Гомункулус и Затвор Сердца"
    >
      {/* SCROLL SETPIECE #1 (205vh, CSS position:sticky — 0 GSAP pin:true!): PENFIELD 1937 -> SCAN 2023 */}
      <div ref={runwayRef} className="relative h-[205vh] bg-[#FAF9F5] border-b border-[#141413]/10">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between px-5 md:px-12 lg:px-20 py-20 md:py-24">
          <div className="max-w-[1240px] mx-auto w-full flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
            <span className="text-[#FC4109] font-semibold">АКТ I · ГЛАВА I.2 · {activeCopy.kicker}</span>
            <span>ПОПЕРЕЧНЫЙ СРЕЗ КОРЫ M1 · стр. 14</span>
          </div>

          <div className="max-w-[1240px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 5 cols: Editorial Story */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-[clamp(26px,3.4vw,44px)] leading-[1.08] tracking-[-0.028em]">
                <span className="font-display font-bold block text-[#141413]">
                  {ruTypo(activeCopy.title)}
                </span>
              </h2>
              <p className="font-serif-editorial italic text-[17px] md:text-[18px] leading-[1.58] text-[#353431]">
                {ruTypo(activeCopy.body)}
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
                  {scanPhase === 'scan'
                    ? 'Карта 1937 года переписана · SCAN 2023'
                    : 'Листайте вниз · разлом карты'}
                </span>
              </div>
            </div>

            {/* Right 7 cols: Museum Studio Coronal M1 Plate + Swiss Precision Penfield/SCAN Vector Overlay */}
            <div className="lg:col-span-7 relative aspect-[16/10] w-full max-h-[540px] rounded-2xl border border-[#141413]/12 bg-[#FAF9F5] overflow-hidden shadow-[0_20px_54px_rgba(20,20,19,0.06)]">
              <img
                src={assetUrl('/v9/brain-coronal-m1.jpg')}
                alt="Скульптурный корональный срез первичной моторной коры M1 человека"
                className="w-full h-full object-cover select-none"
                draggable={false}
              />

              {/* Swiss Vector Engraving Overlay calibrated cleanly to the outer cortical arch */}
              <svg
                viewBox="0 0 1600 1000"
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
              >
                {/* LAYER 1: 1937 PENFIELD CONTINUOUS COBALT RIBBON (right hemisphere rim) */}
                <g ref={penfieldGroupRef} style={{ opacity: 1 }}>
                  <path
                    d="M 818 148 C 960 156, 1085 215, 1168 315 C 1226 385, 1254 468, 1252 548"
                    fill="none"
                    stroke="#004EDF"
                    strokeWidth="9"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                  {/* Radial engraving ticks & Penfield 1937 somatic labels */}
                  {[
                    { x: 868, y: 156, tx: 888, ty: 94, lbl: 'СТОПА · НОГА' },
                    { x: 1036, y: 204, tx: 1126, ty: 146, lbl: 'КОРПУС' },
                    { x: 1166, y: 314, tx: 1296, ty: 266, lbl: 'КИСТЬ (×5 ПЛОЩАДЬ)' },
                    { x: 1246, y: 470, tx: 1356, ty: 448, lbl: 'ЛИЦО · ЯЗЫК' },
                  ].map((pt) => (
                    <g key={pt.lbl}>
                      <line
                        x1={pt.x}
                        y1={pt.y}
                        x2={pt.tx}
                        y2={pt.ty}
                        stroke="#004EDF"
                        strokeWidth="1.6"
                        strokeDasharray="4 4"
                      />
                      <circle cx={pt.x} cy={pt.y} r="6" fill="#004EDF" />
                      <text
                        x={pt.tx + 8}
                        y={pt.ty + 5}
                        fill="#004EDF"
                        fontSize="21"
                        fontWeight="700"
                        fontFamily="JetBrains Mono Variable, monospace"
                      >
                        {pt.lbl}
                      </text>
                    </g>
                  ))}

                  <rect x="44" y="44" width="380" height="52" rx="10" fill="#FAF9F5" fillOpacity="0.94" stroke="#004EDF" strokeOpacity="0.35" strokeWidth="1.6" />
                  <text x="64" y="77" fill="#004EDF" fontSize="21" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                    1937 · СПЛОШНОЙ ГОМУНКУЛУС
                  </text>
                </g>

                {/* LAYER 2: 2023 SCAN INTER-EFFECTOR FRACTURE NODES (3 crimson nodes + cross-hemisphere action filaments!) */}
                <g ref={scanGroupRef} style={{ opacity: 0 }}>
                  {/* Cross-hemisphere SCAN integration arcs bridging both hemispheres & deep brainstem/viscera */}
                  <path
                    d="M 656 178 Q 800 320, 944 178"
                    fill="none"
                    stroke="#FC4109"
                    strokeWidth="2.4"
                    strokeDasharray="7 5"
                    opacity="0.72"
                  />
                  <path
                    d="M 480 286 Q 800 412, 1120 286"
                    fill="none"
                    stroke="#FC4109"
                    strokeWidth="2.4"
                    strokeDasharray="7 5"
                    opacity="0.72"
                  />
                  <path
                    d="M 392 478 Q 800 546, 1208 478"
                    fill="none"
                    stroke="#FC4109"
                    strokeWidth="2.4"
                    strokeDasharray="7 5"
                    opacity="0.72"
                  />

                  {/* 3 Paired Crimson SCAN Nodes fracturing Foot / Hand / Mouth! */}
                  {[
                    { lx: 656, rx: 944, y: 178, tag: 'SCAN 1 · ПЛАН И ОСАНКА', tx: 96, ty: 174 },
                    { lx: 480, rx: 1120, y: 286, tag: 'SCAN 2 · ЦЕЛОСТНОЕ ДЕЙСТВИЕ', tx: 46, ty: 334 },
                    { lx: 392, rx: 1208, y: 478, tag: 'SCAN 3 · ДЫХАНИЕ И ПУЛЬС', tx: 46, ty: 522 },
                  ].map((node) => (
                    <g key={node.tag}>
                      {/* Left & Right bilateral SCAN hubs */}
                      <circle cx={node.lx} cy={node.y} r="17" fill="#FC4109" fillOpacity="0.22" stroke="#FC4109" strokeWidth="2.5" />
                      <circle cx={node.lx} cy={node.y} r="6.5" fill="#FC4109" />
                      <circle cx={node.rx} cy={node.y} r="17" fill="#FC4109" fillOpacity="0.22" stroke="#FC4109" strokeWidth="2.5" />
                      <circle cx={node.rx} cy={node.y} r="6.5" fill="#FC4109" />

                      {/* Crisp left-margin callout pill (zero collision with brain or right Penfield labels!) */}
                      <line x1={node.lx - 18} y1={node.y} x2={node.tx + 286} y2={node.ty - 14} stroke="#FC4109" strokeWidth="1.8" />
                      <rect x={node.tx} y={node.ty - 38} width="330" height="44" rx="8" fill="#141413" fillOpacity="0.92" />
                      <text
                        x={node.tx + 14}
                        y={node.ty - 10}
                        fill="#FAF9F5"
                        fontSize="18.5"
                        fontWeight="700"
                        fontFamily="JetBrains Mono Variable, monospace"
                      >
                        {node.tag}
                      </text>
                    </g>
                  ))}

                  <rect x="44" y="886" width="510" height="54" rx="10" fill="#FC4109" />
                  <text x="66" y="921" fill="#FAF9F5" fontSize="21" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
                    2023 · 3 ВСТАВКИ SCAN РАЗРЫВАЮТ КАРТУ
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div className="max-w-[1240px] mx-auto w-full flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#7A7872]">
            <span>GORDON &amp; DOSENBACH · NATURE 2023</span>
            <span>ТЕЛО И СОЗНАНИЕ СШИТЫ В ОДНОЙ КОРЕ</span>
          </div>
        </div>
      </div>

      {/* PART 2.2: INSTRUMENT 02 — CARDIAC GATE HEP (AL & VILLRINGER, PNAS 2020) */}
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
                ' — слабые прикосновения буквально не доходят до вашего сознания (Al & Villringer, PNAS 2020).',
              )}
            </p>
            <p className="text-[14.5px] leading-[1.66] text-[#4F4E4A]">
              {ruTypo(
                'В паузе между ударами (диастоле) затвор снова открывается — и тот же самый слабый сигнал прорывается в опыт. Проверьте модель в замедлении ×5 справа.',
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
              footnote="Модель данных Al & Villringer (PNAS, 2020): систола снижает чувствительность к слабым стимулам"
            >
              <div className="space-y-4">
                {/* Phase selector + tactile probe trigger */}
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
                    <span>Подать слабый стимул</span>
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

                {/* Live Trial Counter comparing Systole vs Diastole */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-tech text-[11px]">
                  <div className="p-3.5 rounded-xl bg-[#181D27] border border-[#FC4109]/30">
                    <div className="flex items-center justify-between text-[10px] text-[#FF9B7D]">
                      <span>В СИСТОЛУ (УДАР)</span>
                      <span>ЭТАЛОН PNAS: ~38%</span>
                    </div>
                    <div className="text-[18px] font-bold text-[#FAF9F5] mt-1">
                      {systoleStats.total > 0
                        ? `${systoleStats.hits} из ${systoleStats.total} ощутили`
                        : 'Подайте пробу в систолу'}
                    </div>
                    <div className="text-[11px] font-sans-ui text-[#9AA3B2] mt-1">
                      Порог повышен — барорецепторы глушат слабый сигнал.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#181D27] border border-[#34D399]/30">
                    <div className="flex items-center justify-between text-[10px] text-[#34D399]">
                      <span>В ДИАСТОЛУ (ПАУЗА)</span>
                      <span>ЭТАЛОН PNAS: ~76%</span>
                    </div>
                    <div className="text-[18px] font-bold text-[#FAF9F5] mt-1">
                      {diastoleStats.total > 0
                        ? `${diastoleStats.hits} из ${diastoleStats.total} ощутили`
                        : 'Подайте пробу в диастолу'}
                    </div>
                    <div className="text-[11px] font-sans-ui text-[#9AA3B2] mt-1">
                      Затвор открыт — тот же стимул проходит в сознание.
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
