import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Eye, FileText, RotateCcw, Sparkles } from 'lucide-react';
import type {
  ChapterCh1,
  Lang,
  LocalizedContent,
  MarySpec,
  PhilosophyId,
} from '../../data/content';
import {
  SPATIAL_SPRING,
  getSliderFillStyle,
  handleRovingTabKeyDown,
  usePrefersReducedMotion,
} from './labUtils';

export interface MaryRoomLabProps {
  lab: ChapterCh1['lab'];
  ui: LocalizedContent['ui'];
  lang: Lang;
}

interface SpectralData {
  rgb: [number, number, number];
  hex: string;
  rgbCss: string;
  freqThz: string;
  energyEv: string;
  sCone: number;
  mCone: number;
  lCone: number;
  colorNameEn: string;
  colorNameRu: string;
  colorGenitiveRu: string;
  bandEn: string;
  bandRu: string;
}

const CANONICAL_NM = 680;
const MIN_NM = 380;
const MAX_NM = 740;

/**
 * Physically grounded CIE-inspired spectral wavelength (380–740 nm) -> sRGB + photoreceptors.
 */
function computeSpectrum(nm: number): SpectralData {
  let r = 0;
  let g = 0;
  let b = 0;

  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (nm >= 440 && nm < 490) {
    r = 0;
    g = (nm - 440) / (490 - 440);
    b = 1;
  } else if (nm >= 490 && nm < 510) {
    r = 0;
    g = 1;
    b = -(nm - 510) / (510 - 490);
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (nm >= 580 && nm < 645) {
    r = 1;
    g = -(nm - 645) / (645 - 580);
    b = 0;
  } else if (nm >= 645 && nm <= 740) {
    r = 1;
    g = 0;
    b = 0;
  }

  // Intensity falloff near UV/IR visual boundaries
  let factor = 1.0;
  if (nm >= 380 && nm < 420) {
    factor = 0.42 + (0.58 * (nm - 380)) / (420 - 380);
  } else if (nm > 690 && nm <= 740) {
    factor = 0.45 + (0.55 * (740 - nm)) / (740 - 690);
  }

  const gamma = 0.82;
  const toByte = (c: number) =>
    c <= 0 ? 0 : Math.min(255, Math.round(255 * Math.pow(c * factor, gamma)));

  const R = toByte(r);
  const G = toByte(g);
  const B = toByte(b);
  const hex = `#${R.toString(16).padStart(2, '0')}${G
    .toString(16)
    .padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;

  // True photon physics: f = c / lambda (THz), E = h*c / lambda (eV)
  const freqThz = (299792.458 / nm).toFixed(1);
  const energyEv = (1239.84193 / nm).toFixed(2);

  // Stockman-Sharpe-inspired relative human S / M / L cone spectral sensitivities
  const sRaw = Math.exp(-0.5 * Math.pow((nm - 426) / 27, 2));
  const mRaw = Math.exp(-0.5 * Math.pow((nm - 534) / 43, 2));
  const lRaw =
    0.96 * Math.exp(-0.5 * Math.pow((nm - 568) / 53, 2)) +
    0.13 * Math.exp(-0.5 * Math.pow((nm - 424) / 24, 2));

  // Normalize so dominant cone reads strongly even in deep red (680–740 nm)
  const peak = Math.max(0.18, sRaw, mRaw, lRaw);
  const sCone = Math.round(Math.min(100, (sRaw / peak) * 96));
  const mCone = Math.round(Math.min(100, (mRaw / peak) * 96));
  const lCone = Math.round(Math.min(100, (lRaw / peak) * 96));

  let colorNameEn = 'Crimson Red';
  let colorNameRu = 'Алый красный';
  let colorEncounterRu = 'с алым красным';
  let bandEn = 'long-wave';
  let bandRu = 'длинноволновое';

  if (nm < 435) {
    colorNameEn = 'Deep Violet';
    colorNameRu = 'Глубокий фиолетовый';
    colorEncounterRu = 'с глубоким фиолетовым';
    bandEn = 'short-wave';
    bandRu = 'коротковолновое';
  } else if (nm < 480) {
    colorNameEn = 'Cobalt Blue';
    colorNameRu = 'Кобальтовый синий';
    colorEncounterRu = 'с кобальтовым синим';
    bandEn = 'short-wave';
    bandRu = 'коротковолновое';
  } else if (nm < 508) {
    colorNameEn = 'Spectral Cyan';
    colorNameRu = 'Спектральный голубой';
    colorEncounterRu = 'со спектральным голубым';
    bandEn = 'short-mid wave';
    bandRu = 'коротко-средневолновое';
  } else if (nm < 560) {
    colorNameEn = 'Emerald Green';
    colorNameRu = 'Изумрудный зелёный';
    colorEncounterRu = 'с изумрудным зелёным';
    bandEn = 'mid-wave';
    bandRu = 'средневолновое';
  } else if (nm < 590) {
    colorNameEn = 'Solar Yellow';
    colorNameRu = 'Солнечный жёлтый';
    colorEncounterRu = 'с солнечным жёлтым';
    bandEn = 'mid-long wave';
    bandRu = 'средне-длинноволновое';
  } else if (nm < 628) {
    colorNameEn = 'Amber Orange';
    colorNameRu = 'Янтарный оранжевый';
    colorEncounterRu = 'с янтарным оранжевым';
    bandEn = 'long-wave';
    bandRu = 'длинноволновое';
  }

  return {
    rgb: [R, G, B],
    hex,
    rgbCss: `rgb(${R}, ${G}, ${B})`,
    freqThz,
    energyEv,
    sCone,
    mCone,
    lCone,
    colorNameEn,
    colorNameRu,
    colorGenitiveRu: colorEncounterRu,
    bandEn,
    bandRu,
  };
}

/**
 * Generates an SVG sine-wave path whose spatial wavelength scales physically with `nm`.
 */
function buildWavePath(nm: number): string {
  const xStart = 280;
  const xEnd = 428;
  const yMid = 112;
  // Shorter wavelength (380 nm) -> denser cycles; longer (740 nm) -> wider cycles
  const periodPx = 11 + ((nm - MIN_NM) / (MAX_NM - MIN_NM)) * 19;
  const amp = 8.5;
  const pts: string[] = [];
  for (let x = xStart; x <= xEnd; x += 3) {
    const t = (x - xStart) / (xEnd - xStart);
    const env = Math.sin(t * Math.PI);
    const y = yMid + Math.sin(((x - xStart) / periodPx) * Math.PI * 2) * amp * env;
    pts.push(`${x === xStart ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

export function MaryRoomLab({ lab, ui, lang }: MaryRoomLabProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [wavelength, setWavelength] = useState(CANONICAL_NM);
  const [dossierOpen, setDossierOpen] = useState(true);
  const [activePhilId, setActivePhilId] = useState<PhilosophyId>(
    lab.philosophies[0]?.id ?? 'physicalism'
  );
  const reducedMotion = usePrefersReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const spectrum = useMemo(() => computeSpectrum(wavelength), [wavelength]);
  const wavePath = useMemo(() => buildWavePath(wavelength), [wavelength]);

  const activePhilIndex = Math.max(
    0,
    lab.philosophies.findIndex((p) => p.id === activePhilId)
  );
  const activePhil = lab.philosophies[activePhilIndex] ?? lab.philosophies[0];

  const isCanonical = wavelength === CANONICAL_NM;

  // Dynamic chamber header label: preserves canonical modeColor at 680 nm, adapts otherwise
  const chamberStatusLabel = useMemo(() => {
    if (!unlocked) return lab.modeMono;
    if (isCanonical) return lab.modeColor;
    return lang === 'ru'
      ? `Снаружи: встреча ${spectrum.colorGenitiveRu}`
      : `Outside: First Encounter with ${spectrum.colorNameEn}`;
  }, [unlocked, isCanonical, lab.modeMono, lab.modeColor, lang, spectrum]);

  // Dynamic physical specs: preserves canonical 680 nm monoSpecs defaults verbatim
  const displaySpecs: MarySpec[] = useMemo(() => {
    if (isCanonical) return lab.monoSpecs;

    const { freqThz, energyEv, sCone, mCone, lCone, bandEn, bandRu, colorNameEn, colorNameRu } =
      spectrum;
    const isShortWave = wavelength < 490;
    const opponentEn = isShortWave
      ? 'S−(L+M) blue-yellow opponent channel'
      : wavelength < 565
        ? 'M−L green-red opponent channel'
        : 'L−M red-green opponent channel';
    const opponentRu = isShortWave
      ? 'оппонентный канал S−(L+M)'
      : wavelength < 565
        ? 'оппонентный канал M−L'
        : 'оппонентный канал L−M';

    return [
      {
        k: lab.monoSpecs[0]?.k ?? (lang === 'ru' ? 'Спектр фотонов' : 'Photon Spectrum'),
        v:
          lang === 'ru'
            ? `${wavelength} нм · ${bandRu} (${freqThz} ТГц, ${energyEv} эВ)`
            : `${wavelength} nm · ${bandEn} (${freqThz} THz, ${energyEv} eV)`,
      },
      {
        k: lab.monoSpecs[1]?.k ?? (lang === 'ru' ? 'Ретинальный код' : 'Retinal Encoding'),
        v:
          lang === 'ru'
            ? `S ${sCone}% · M ${mCone}% · L ${lCone}% · ${opponentRu}`
            : `S ${sCone}% · M ${mCone}% · L ${lCone}% · ${opponentEn}`,
      },
      {
        k: lab.monoSpecs[2]?.k ?? (lang === 'ru' ? 'Корковый каскад' : 'Cortical Cascade'),
        v:
          lang === 'ru'
            ? isShortWave
              ? 'Кониоцеллюлярное ЛКТ → V1-блобы → константность V4'
              : 'Парвоцеллюлярное ЛКТ → V1-блобы → константность V4'
            : isShortWave
              ? 'Koniocellular LGN → V1 blobs → V4 color constancy'
              : 'Parvocellular LGN → V1 blobs → V4 color constancy',
      },
      {
        k: lab.monoSpecs[3]?.k ?? (lang === 'ru' ? 'Семантика и отклик' : 'Motor / Semantic Link'),
        v:
          lang === 'ru'
            ? `Лексема «${colorNameRu.toLowerCase()}» + корковая категоризация`
            : `Lexical label “${colorNameEn.toLowerCase()}” + cortical categorization`,
      },
    ];
  }, [isCanonical, lab.monoSpecs, lang, spectrum, wavelength]);

  const nmUnit = lang === 'ru' ? 'нм' : 'nm';
  const thzUnit = lang === 'ru' ? 'ТГц' : 'THz';
  const evUnit = lang === 'ru' ? 'эВ' : 'eV';

  const coneMetrics = [
    {
      id: 'S',
      label: lang === 'ru' ? 'S-колбочки (~426 нм)' : 'S-Cone (~426 nm)',
      shortLabel: 'S',
      value: spectrum.sCone,
      color: '#5B8DEF',
    },
    {
      id: 'M',
      label: lang === 'ru' ? 'M-колбочки (~534 нм)' : 'M-Cone (~534 nm)',
      shortLabel: 'M',
      value: spectrum.mCone,
      color: '#2AB3A6',
    },
    {
      id: 'L',
      label: lang === 'ru' ? 'L-колбочки (~568 нм)' : 'L-Cone (~568 nm)',
      shortLabel: 'L',
      value: spectrum.lCone,
      color: '#E05A47',
    },
  ];

  const perspectiveBadge = unlocked
    ? lang === 'ru'
      ? 'ОПЫТ ОТ 1-ГО ЛИЦА · КВАЛИА'
      : '1ST-PERSON EXPERIENCE · QUALIA'
    : lang === 'ru'
      ? 'ФИЗИКА ОТ 3-ГО ЛИЦА · МОНОХРОМ'
      : '3RD-PERSON PHYSICS · MONOCHROME';

  const philHeader =
    lang === 'ru'
      ? 'Пять философских вердиктов'
      : 'Five Philosophical Verdicts';

  return (
    <section
      className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-7"
      aria-label={lab.title}
    >
      {/* Subtle spatial ambient optical glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full blur-3xl transition-all duration-700"
        style={{
          background: unlocked
            ? `radial-gradient(circle, ${spectrum.hex}33 0%, transparent 70%)`
            : 'radial-gradient(circle, rgba(184,181,173,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Lab Header */}
      <div className="relative flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[var(--accent-a)] uppercase">
            <span
              className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
              style={{
                backgroundColor: unlocked ? spectrum.hex : '#B8B5AD',
                boxShadow: unlocked ? `0 0 10px ${spectrum.hex}` : 'none',
              }}
            />
            {lab.badge}
          </span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-[#B8B5AD] uppercase">
            {perspectiveBadge}
          </span>
        </div>

        <h3 className="font-[var(--font-display)] text-lg font-medium tracking-[-0.025em] text-[#F3F2EE] sm:text-2xl">
          {lab.title}
        </h3>
        <p className="max-w-3xl text-sm leading-relaxed text-[#B8B5AD]">
          {lab.instruction}
        </p>
      </div>

      <hr className="hairline my-5" />

      {/* Optical Qualia Chamber */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#10100F]/90">
        {/* Top optical HUD bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3.5 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full transition-all duration-500"
              style={{
                backgroundColor: unlocked ? spectrum.hex : '#B8B5AD',
                boxShadow: unlocked ? `0 0 12px ${spectrum.hex}` : 'none',
              }}
            />
            <span className="truncate text-xs font-medium text-[#F3F2EE]">
              {chamberStatusLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#B8B5AD]">
            <span className="text-[#F3F2EE]">
              λ {wavelength} {nmUnit}
            </span>
            <span className="text-white/20">·</span>
            <span>
              {spectrum.freqThz} {thzUnit}
            </span>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="hidden sm:inline">
              {spectrum.energyEv} {evUnit}
            </span>
          </div>
        </div>

        {/* Luminous SVG Optical Chamber with smooth monochrome <-> chromatic transition */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            filter: unlocked ? 'grayscale(0%) saturate(1.08)' : 'grayscale(100%) contrast(1.06)',
            transition: reducedMotion
              ? 'none'
              : 'filter 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <svg
            id="mary-svg"
            role="img"
            aria-label={ui.ariaMarySvg}
            viewBox="0 0 600 220"
            className="block h-auto w-full select-none"
          >
            <defs>
              {/* Chamber spatial glow */}
              <radialGradient id="mary-orb-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={spectrum.hex} stopOpacity="0.62" />
                <stop offset="42%" stopColor={spectrum.hex} stopOpacity="0.22" />
                <stop offset="100%" stopColor={spectrum.hex} stopOpacity="0" />
              </radialGradient>

              <radialGradient id="mary-orb-core" cx="35%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="30%" stopColor={spectrum.hex} stopOpacity="0.98" />
                <stop offset="82%" stopColor={spectrum.hex} stopOpacity="0.82" />
                <stop offset="100%" stopColor="#10100F" stopOpacity="0.95" />
              </radialGradient>

              <linearGradient id="mary-prism-glass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.24" />
                <stop offset="48%" stopColor="#B8B5AD" stopOpacity="0.06" />
                <stop offset="100%" stopColor={spectrum.hex} stopOpacity="0.18" />
              </linearGradient>

              <linearGradient id="mary-incident-beam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F3F2EE" stopOpacity="0.08" />
                <stop offset="70%" stopColor="#F3F2EE" stopOpacity="0.68" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="mary-refracted-beam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
                <stop offset="28%" stopColor={spectrum.hex} stopOpacity="0.86" />
                <stop offset="100%" stopColor={spectrum.hex} stopOpacity="0.18" />
              </linearGradient>

              <linearGradient id="mary-fan-spectrum" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.28" />
                <stop offset="25%" stopColor="#2AB3A6" stopOpacity="0.24" />
                <stop offset="50%" stopColor="#7E9C76" stopOpacity="0.24" />
                <stop offset="75%" stopColor="#D99B4E" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#E05A47" stopOpacity="0.30" />
              </linearGradient>

              <filter id="mary-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle optical bench grid */}
            <g stroke="rgba(255,255,255,0.045)" strokeWidth="0.75">
              <line x1="0" y1="112" x2="600" y2="112" strokeDasharray="3 5" />
              <line x1="196" y1="14" x2="196" y2="206" strokeDasharray="2 6" />
              <line x1="468" y1="14" x2="468" y2="206" strokeDasharray="2 6" />
              <circle cx="468" cy="112" r="76" fill="none" strokeDasharray="2 5" />
              <circle cx="468" cy="112" r="54" fill="none" />
            </g>

            {/* Incident collimated white light beam */}
            <line
              x1="18"
              y1="126"
              x2="168"
              y2="106"
              stroke="url(#mary-incident-beam)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1="18"
              y1="126"
              x2="168"
              y2="106"
              stroke="#FFFFFF"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />

            {/* Internal refraction path inside glass prism */}
            <polygon
              points="166,104 228,101 235,123 169,109"
              fill={spectrum.hex}
              fillOpacity={unlocked ? 0.28 : 0.14}
            />

            {/* Full chromatic dispersion fan */}
            <polygon
              points="228,101 446,44 446,180 235,123"
              fill="url(#mary-fan-spectrum)"
              opacity={unlocked ? 0.52 : 0.14}
            />

            {/* Focused selected-wavelength refracted beam */}
            <polygon
              points="229,105 452,82 452,142 234,119"
              fill="url(#mary-refracted-beam)"
              opacity={unlocked ? 0.56 : 0.28}
            />

            {/* Live harmonic photon wave between prism and orb */}
            <path
              d={wavePath}
              fill="none"
              stroke={spectrum.hex}
              strokeWidth="1.8"
              strokeOpacity={unlocked ? 0.92 : 0.65}
              filter="url(#mary-soft-glow)"
            />

            {/* Faceted Optical Glass Prism */}
            <g>
              <polygon
                points="196,42 132,166 260,166"
                fill="url(#mary-prism-glass)"
                stroke="rgba(255,255,255,0.42)"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              {/* Specular internal facet lines */}
              <line
                x1="196"
                y1="42"
                x2="188"
                y2="166"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="0.9"
              />
              <line
                x1="196"
                y1="42"
                x2="212"
                y2="166"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="0.8"
              />
              <circle cx="196" cy="42" r="2.2" fill="#FFFFFF" fillOpacity="0.85" />
            </g>

            {/* Chromatic Photon Orb (Qualia Target) */}
            <g>
              {/* Multi-layer luminous bloom */}
              <circle
                cx="468"
                cy="112"
                r={unlocked ? 82 : 56}
                fill="url(#mary-orb-halo)"
                style={{
                  transition: reducedMotion
                    ? 'none'
                    : 'r 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
              {/* Resonance ring */}
              <circle
                cx="468"
                cy="112"
                r="46"
                fill="none"
                stroke={spectrum.hex}
                strokeOpacity={unlocked ? 0.48 : 0.25}
                strokeWidth="1"
              />
              {/* Core sphere */}
              <circle
                cx="468"
                cy="112"
                r="34"
                fill="url(#mary-orb-core)"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="1"
              />
              {/* Specular crescent highlight */}
              <ellipse
                cx="457"
                cy="99"
                rx="11"
                ry="6"
                transform="rotate(-28 457 99)"
                fill="#FFFFFF"
                fillOpacity="0.46"
              />
            </g>

            {/* Clean minimal SVG telemetry marks */}
            <text
              x="22"
              y="198"
              fill="rgba(184,181,173,0.76)"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9.5"
              letterSpacing="1.2"
            >
              {lang === 'ru' ? 'ПРИЗМА · ДИСПЕРСИЯ' : 'PRISM · DISPERSION'}
            </text>
            <text
              x="578"
              y="198"
              textAnchor="end"
              fill={unlocked ? spectrum.hex : 'rgba(184,181,173,0.82)'}
              fontFamily="JetBrains Mono, monospace"
              fontSize="9.5"
              letterSpacing="1"
            >
              {unlocked
                ? (lang === 'ru' ? spectrum.colorNameRu : spectrum.colorNameEn).toUpperCase()
                : `λ = ${wavelength} ${nmUnit.toUpperCase()}`}
            </text>
          </svg>
        </div>
      </div>

      {/* Primary Action + Wavelength Control Strip */}
      <div className="mt-5 flex flex-col gap-5">
        {/* Prominent Glowing Exit / Reset Room CTA */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <motion.button
            type="button"
            onClick={() => setUnlocked((prev) => !prev)}
            whileTap={reducedMotion ? undefined : { scale: 0.975 }}
            whileHover={reducedMotion ? undefined : { scale: 1.01 }}
            transition={SPATIAL_SPRING}
            className="group relative inline-flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full px-5 py-3 text-sm font-medium text-[#F3F2EE] transition-all sm:w-auto"
            style={{
              background: unlocked
                ? 'linear-gradient(135deg, rgba(243,242,238,0.09), rgba(20,20,18,0.82))'
                : `linear-gradient(135deg, ${spectrum.hex}3D, rgba(42,179,166,0.22))`,
              border: unlocked
                ? '1px solid rgba(243,242,238,0.16)'
                : `1px solid ${spectrum.hex}88`,
              boxShadow: unlocked
                ? '0 8px 28px -12px rgba(0,0,0,0.75)'
                : `0 0 32px -8px ${spectrum.hex}75, inset 0 1px 0 rgba(255,255,255,0.28)`,
            }}
          >
            {unlocked ? (
              <RotateCcw className="h-4 w-4 text-[#B8B5AD] transition-transform duration-300 group-hover:-rotate-45" strokeWidth={1.75} />
            ) : (
              <Sparkles className="h-4 w-4 text-[#F3F2EE]" strokeWidth={1.75} />
            )}
            <span>{unlocked ? lab.resetBtn : lab.exitRoomBtn}</span>
          </motion.button>

          {/* Compact photon energy/frequency pill */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#B8B5AD]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
              <Eye className="h-3.5 w-3.5 text-[var(--accent-a)]" strokeWidth={1.65} />
              <span>
                {spectrum.freqThz} {thzUnit}
              </span>
            </span>
            <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
              {spectrum.energyEv} {evUnit}
            </span>
            {!isCanonical && (
              <button
                type="button"
                onClick={() => setWavelength(CANONICAL_NM)}
                className="cursor-pointer rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 text-[10px] tracking-wider text-[#F3F2EE] uppercase transition-colors hover:border-white/25 hover:bg-white/[0.08]"
              >
                680 {nmUnit}
              </button>
            )}
          </div>
        </div>

        {/* Live 380–740 nm Optical Slider + S/M/L Cone Photoreceptor Bars */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="mary-wavelength-slider"
                className="text-xs font-medium text-[#D6D3CB]"
              >
                {lab.wavelengthLabel}
              </label>
              <span className="font-mono text-xs font-medium text-[#F3F2EE]">
                {wavelength} {nmUnit}
              </span>
            </div>

            <input
              id="mary-wavelength-slider"
              type="range"
              min={MIN_NM}
              max={MAX_NM}
              step={1}
              value={wavelength}
              onChange={(e) => setWavelength(Number(e.target.value))}
              className="optical-slider"
              style={getSliderFillStyle(wavelength, MIN_NM, MAX_NM)}
              aria-valuemin={MIN_NM}
              aria-valuemax={MAX_NM}
              aria-valuenow={wavelength}
              aria-valuetext={`${wavelength} ${nmUnit}`}
            />

            {/* Subtle full visible-spectrum reference hairline */}
            <div className="mt-1 flex flex-col gap-1">
              <div
                className="h-1 w-full rounded-full transition-all duration-700"
                style={{
                  background:
                    'linear-gradient(90deg, #5B8DEF 0%, #2AB3A6 34%, #7E9C76 52%, #D99B4E 72%, #E05A47 92%, #B83E2E 100%)',
                  filter: unlocked ? 'grayscale(0%) opacity(0.85)' : 'grayscale(100%) opacity(0.32)',
                }}
              />
              <div className="flex justify-between font-mono text-[10px] text-[#8E8B82]">
                <span>380 {nmUnit}</span>
                <span>550 {nmUnit}</span>
                <span>740 {nmUnit}</span>
              </div>
            </div>
          </div>

          {/* Real-time S / M / L Cone Photoreceptor Response */}
          <div className="flex flex-col gap-2 lg:col-span-5">
            <span className="font-mono text-[10px] tracking-[0.12em] text-[#B8B5AD] uppercase">
              {lang === 'ru'
                ? 'Отклик фоторецепторов (S / M / L)'
                : 'Photoreceptor Activation (S / M / L)'}
            </span>
            <div className="flex flex-col gap-2">
              {coneMetrics.map((cone) => (
                <div key={cone.id} className="flex items-center gap-2.5">
                  <span
                    className="w-4 font-mono text-[11px] font-semibold"
                    style={{ color: unlocked ? cone.color : '#D6D3CB' }}
                    title={cone.label}
                  >
                    {cone.shortLabel}
                  </span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div
                      className="h-full rounded-full"
                      initial={false}
                      animate={{ width: `${cone.value}%` }}
                      transition={reducedMotion ? { duration: 0 } : SPATIAL_SPRING}
                      style={{
                        backgroundColor: unlocked ? cone.color : '#B8B5AD',
                        boxShadow: unlocked ? `0 0 10px ${cone.color}88` : 'none',
                      }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] text-[#B8B5AD]">
                    {cone.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className="hairline my-5" />

      {/* Physical Dossier (Collapsible hairline readout) */}
      <div>
        <button
          type="button"
          onClick={() => setDossierOpen((v) => !v)}
          aria-expanded={dossierOpen}
          className="flex w-full cursor-pointer items-center justify-between gap-3 py-1 text-left transition-colors hover:text-[#F3F2EE]"
        >
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-[#D6D3CB] uppercase">
            <FileText className="h-3.5 w-3.5 text-[var(--accent-a)]" strokeWidth={1.65} />
            {lab.inspectBtn}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#B8B5AD] transition-transform duration-300 ${
              dossierOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={1.75}
          />
        </button>

        <AnimatePresence initial={false}>
          {dossierOpen && (
            <motion.div
              key="mary-dossier"
              initial={reducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-white/[0.06] pt-3 sm:grid-cols-2">
                {displaySpecs.map((spec, idx) => (
                  <div key={`mary-spec-${idx}`} className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] tracking-[0.12em] text-[#8E8B82] uppercase">
                      {spec.k}
                    </dt>
                    <dd className="text-xs leading-relaxed text-[#F3F2EE]">
                      {spec.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <hr className="hairline my-5" />

      {/* 5-School Philosophical Verdict Explorer */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] tracking-[0.14em] text-[#B8B5AD] uppercase">
            {philHeader}
          </span>
          <span className="font-mono text-[10px] text-[#8E8B82]">
            {activePhilIndex + 1} / {lab.philosophies.length}
          </span>
        </div>

        {/* Roving Tablist with spring layoutId pill */}
        <div
          role="tablist"
          aria-label={ui.ariaPhilTabs}
          className="flex flex-wrap gap-1.5"
        >
          {lab.philosophies.map((phil, index) => {
            const isSelected = phil.id === activePhil.id;
            return (
              <button
                key={phil.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`mary-phil-tab-${phil.id}`}
                aria-selected={isSelected}
                aria-controls={`mary-phil-panel-${phil.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActivePhilId(phil.id)}
                onKeyDown={(e) =>
                  handleRovingTabKeyDown(
                    e,
                    lab.philosophies,
                    index,
                    (item) => setActivePhilId(item.id),
                    (nextIdx) => tabRefs.current[nextIdx]?.focus()
                  )
                }
                className={`relative cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'text-[#F3F2EE]'
                    : 'text-[#B8B5AD] hover:text-[#F3F2EE]'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="mary-phil-active-pill"
                    transition={reducedMotion ? { duration: 0 } : SPATIAL_SPRING}
                    className="pointer-events-none absolute inset-0 rounded-full border border-white/20 bg-white/[0.09]"
                    style={{
                      boxShadow: unlocked
                        ? `0 0 22px -6px ${spectrum.hex}88`
                        : '0 0 20px -8px var(--accent-glow)',
                    }}
                  />
                )}
                <span className="relative z-10">{phil.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Philosophy Verdict Readout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhil.id}
            role="tabpanel"
            id={`mary-phil-panel-${activePhil.id}`}
            aria-labelledby={`mary-phil-tab-${activePhil.id}`}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 border-l border-[var(--accent-a)]/50 pl-4"
          >
            <div className="font-mono text-[11px] tracking-[0.06em] text-[var(--accent-a)]">
              {activePhil.verdict}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-[#D6D3CB]">
              {activePhil.explanation}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
