import type { ReactNode } from 'react';

export type ScholarId = 'chalmers' | 'dennett' | 'koch' | 'seth' | 'dehaene';

export interface ScholarProfile {
  id: ScholarId;
  name: string;
  role: string;
  accent: string;
}

export const SCHOLARS: Record<ScholarId, ScholarProfile> = {
  chalmers: {
    id: 'chalmers',
    name: 'Дэвид Чалмерс',
    role: 'Философ сознания · NYU',
    accent: '#004EDF',
  },
  dennett: {
    id: 'dennett',
    name: 'Дэниел Деннет',
    role: 'Философ (1942–2024) · Tufts',
    accent: '#FC4109',
  },
  koch: {
    id: 'koch',
    name: 'Кристоф Кох',
    role: 'Нейробиолог · Allen Institute',
    accent: '#C84319',
  },
  seth: {
    id: 'seth',
    name: 'Анил Сет',
    role: 'Когнитивный нейробиолог · Sussex',
    accent: '#0D7A5F',
  },
  dehaene: {
    id: 'dehaene',
    name: 'Станислас Деан',
    role: 'Когнитивный нейробиолог · Collège de France',
    accent: '#1D4ED8',
  },
};

/**
 * Hand-drawn New Yorker-style monochrome editorial ink SVG portraits.
 * ZERO mouse-chasing eyeballs! Only subtle, witty thematic micro-animations:
 * - Chalmers: raised skeptical eyebrow (+ optional clinking wine glass)
 * - Dennett: animated red pencil slash
 * - Koch / Seth / Dehaene: crisp ink engraving presence
 */
export function ScholarPortraitSvg({
  id,
  size = 54,
  gesture = 'idle',
  dark = false,
}: {
  id: ScholarId;
  size?: number;
  gesture?: 'idle' | 'eyebrow' | 'slash' | 'clink' | 'nod';
  dark?: boolean;
}) {
  const ink = dark ? '#FAF9F5' : '#141413';
  const paper = dark ? '#181C23' : '#FAF9F5';
  const muted = dark ? 'rgba(250,249,245,0.45)' : 'rgba(20,20,19,0.35)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className="shrink-0 select-none overflow-visible"
      aria-hidden="true"
    >
      {/* Editorial ink medallion frame */}
      <circle cx="32" cy="32" r="29" fill={paper} stroke={ink} strokeWidth="1.25" />
      <circle cx="32" cy="32" r="26" stroke={muted} strokeWidth="0.65" strokeDasharray="2 2.5" />

      {id === 'chalmers' && (
        <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
          {/* Long shoulder-length hair silhouette (iconic Chalmers!) */}
          <path
            d="M 16 49 C 14 35, 16 17, 32 14 C 48 17, 50 35, 48 49"
            strokeWidth="1.7"
            fill={paper}
          />
          <path d="M 19 46 C 18 35, 19 21, 25 18 M 45 46 C 46 35, 45 21, 39 18" strokeWidth="1.05" opacity="0.7" />
          {/* Face contour */}
          <path d="M 23 26 C 23 39, 27 45, 32 45 C 37 45, 41 39, 41 26" strokeWidth="1.45" fill={paper} />
          {/* Round glasses */}
          <circle cx="27.5" cy="31" r="3.6" strokeWidth="1.3" />
          <circle cx="36.5" cy="31" r="3.6" strokeWidth="1.3" />
          <line x1="31.1" y1="31" x2="32.9" y2="31" strokeWidth="1.2" />
          {/* Pupils (calm, fixed) */}
          <circle cx="27.5" cy="31.2" r="0.9" fill={ink} stroke="none" />
          <circle cx="36.5" cy="31.2" r="0.9" fill={ink} stroke="none" />
          {/* Skeptical eyebrow micro-animation */}
          <path
            d="M 24.5 25.5 Q 27.5 24 30.2 25.4"
            strokeWidth="1.3"
            className={gesture === 'eyebrow' ? 'v7-brow-raise' : ''}
          />
          <path d="M 33.8 25.8 Q 36.5 25.2 39.2 26" strokeWidth="1.3" />
          {/* Nose + wry smile */}
          <path d="M 32 32.5 L 31.3 36.2 L 32.8 36.6" strokeWidth="1.15" />
          <path d="M 28.5 39.8 Q 32.5 41.2 35.8 39.2" strokeWidth="1.25" />
          {/* Optional clinking Madeira glass */}
          {gesture === 'clink' && (
            <g className="v7-glass-clink" stroke="#FC4109" strokeWidth="1.35">
              <path d="M 48 39 L 55 39 L 53.6 46 Q 51.5 48 49.4 46 Z" fill="rgba(252,65,9,0.16)" />
              <line x1="51.5" y1="47.5" x2="51.5" y2="54" />
              <line x1="48.5" y1="54" x2="54.5" y2="54" />
            </g>
          )}
        </g>
      )}

      {id === 'dennett' && (
        <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
          {/* Iconic full philosopher beard & broad forehead */}
          <path d="M 20 26 C 20 17, 25 14, 32 14 C 39 14, 44 17, 44 26" strokeWidth="1.5" />
          {/* Full Santa-style ink beard */}
          <path
            d="M 19 31 C 18 44, 24 52, 32 53 C 40 52, 46 44, 45 31 C 42 34, 38 35.5, 32 35.5 C 26 35.5, 22 34, 19 31 Z"
            strokeWidth="1.55"
            fill={paper}
          />
          {/* Beard hatching lines */}
          <path d="M 24 41 L 25 47 M 29 42 L 29.5 49 M 34.5 42 L 34 49 M 39.5 41 L 38.5 47" strokeWidth="0.9" opacity="0.6" />
          {/* Rectangular spectacles */}
          <rect x="23" y="25.5" width="7.2" height="4.8" rx="1.2" strokeWidth="1.3" />
          <rect x="33.8" y="25.5" width="7.2" height="4.8" rx="1.2" strokeWidth="1.3" />
          <line x1="30.2" y1="27.8" x2="33.8" y2="27.8" strokeWidth="1.2" />
          <circle cx="26.6" cy="27.9" r="0.9" fill={ink} stroke="none" />
          <circle cx="37.4" cy="27.9" r="0.9" fill={ink} stroke="none" />
          {/* Mustache & witty grin */}
          <path d="M 26 35.5 Q 32 33 38 35.5" strokeWidth="1.4" />
          <path d="M 29 38.5 Q 32 39.8 35 38.5" strokeWidth="1.15" />
          {/* Animated red editorial pencil slash */}
          {gesture === 'slash' && (
            <path
              d="M 46 15 L 57 26 M 57 15 L 46 26"
              stroke="#FC4109"
              strokeWidth="2.1"
              className="v7-red-slash"
            />
          )}
        </g>
      )}

      {id === 'koch' && (
        <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
          {/* Characteristic spiky upright hair */}
          <path d="M 21 24 L 22 16 L 26 19 L 29 13 L 33 18 L 37 14 L 40 19 L 43 17 L 43 24" strokeWidth="1.5" />
          {/* Angular face */}
          <path d="M 22 24 C 22 37, 26 44, 32 45 C 38 44, 42 37, 42 24" strokeWidth="1.5" fill={paper} />
          {/* Slim angular glasses */}
          <path d="M 23.5 29 L 30.5 29 L 30 33 L 24 33 Z" strokeWidth="1.3" />
          <path d="M 33.5 29 L 40.5 29 L 40 33 L 34 33 Z" strokeWidth="1.3" />
          <line x1="30.5" y1="30.5" x2="33.5" y2="30.5" strokeWidth="1.2" />
          <circle cx="27" cy="31" r="0.85" fill={ink} stroke="none" />
          <circle cx="37" cy="31" r="0.85" fill={ink} stroke="none" />
          <path d="M 32 32.5 L 32.5 36.5" strokeWidth="1.15" />
          <path d="M 28.5 39.8 L 35.5 39.8" strokeWidth="1.25" />
          {gesture === 'clink' && (
            <circle cx="51" cy="18" r="5" stroke="#FC4109" strokeWidth="1.4" fill="rgba(252,65,9,0.14)" />
          )}
        </g>
      )}

      {id === 'seth' && (
        <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
          {/* Clean modern hairline */}
          <path d="M 21 27 C 21 17, 26 14, 32 14 C 38 14, 43 17, 43 27" strokeWidth="1.55" />
          <path d="M 22 23 Q 32 19 42 23" strokeWidth="1.15" opacity="0.65" />
          {/* Face */}
          <path d="M 22 26 C 22 38, 26 45, 32 46 C 38 45, 42 38, 42 26" strokeWidth="1.45" fill={paper} />
          {/* Calm attentive eyes & brows */}
          <path d="M 24.5 28.5 Q 27.2 27.6 29.8 28.5" strokeWidth="1.2" />
          <path d="M 34.2 28.5 Q 36.8 27.6 39.5 28.5" strokeWidth="1.2" />
          <circle cx="27.2" cy="31.5" r="1.1" fill={ink} stroke="none" />
          <circle cx="36.8" cy="31.5" r="1.1" fill={ink} stroke="none" />
          <path d="M 32 32 L 31.4 36.5 L 32.8 36.8" strokeWidth="1.15" />
          <path d="M 28 40 Q 32 42 36 40" strokeWidth="1.25" />
          {/* Subtle wave annotation on side */}
          <path d="M 46 31 Q 49 27 52 31 T 58 31" stroke="#0D7A5F" strokeWidth="1.35" />
        </g>
      )}

      {id === 'dehaene' && (
        <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
          {/* Neat parted hair */}
          <path d="M 21 26 C 20 17, 26 14, 33 14 C 39 14, 44 18, 43 26" strokeWidth="1.5" />
          <path d="M 23 21 Q 31 18 41 21" strokeWidth="1.15" />
          {/* Oval scholarly face */}
          <path d="M 22 25 C 22 37, 26 44.5, 32 45.5 C 38 44.5, 42 37, 42 25" strokeWidth="1.45" fill={paper} />
          {/* Subtle half-rim glasses */}
          <path d="M 24 29.5 L 30.2 29.5 M 33.8 29.5 L 40 29.5 M 30.2 30.5 L 33.8 30.5" strokeWidth="1.3" />
          <circle cx="27.1" cy="31.8" r="1.05" fill={ink} stroke="none" />
          <circle cx="36.9" cy="31.8" r="1.05" fill={ink} stroke="none" />
          <path d="M 32 32 L 32 36.8 L 33 37" strokeWidth="1.15" />
          <path d="M 28.5 40.2 Q 32 41.3 35.5 40.2" strokeWidth="1.25" />
        </g>
      )}
    </svg>
  );
}

/**
 * Editorial New Yorker-style single pencil margin note.
 */
export function ScholarMarginNote({
  scholar,
  quote,
  tag,
  gesture = 'idle',
  dark = false,
  className = '',
  children,
}: {
  scholar: ScholarId;
  quote: string;
  tag?: string;
  gesture?: 'idle' | 'eyebrow' | 'slash' | 'clink' | 'nod';
  dark?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const profile = SCHOLARS[scholar];

  return (
    <aside
      className={`rounded-2xl border p-4 md:p-5 transition-colors ${
        dark
          ? 'bg-[#181C23]/92 border-[#FAF9F5]/14 text-[#FAF9F5]'
          : 'bg-[#F5F3EB] border-[#141413]/12 text-[#141413]'
      } ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <ScholarPortraitSvg id={scholar} size={52} gesture={gesture} dark={dark} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-display font-semibold text-[13.5px] leading-tight">
              {profile.name}
            </span>
            {tag && (
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#FC4109]">
                {tag}
              </span>
            )}
          </div>
          <div
            className={`font-mono-tech text-[10px] mt-0.5 ${
              dark ? 'text-[#FAF9F5]/55' : 'text-[#5E5D59]'
            }`}
          >
            {profile.role}
          </div>
          <blockquote
            className={`font-serif-editorial italic text-[14px] md:text-[14.5px] leading-[1.55] mt-2.5 ${
              dark ? 'text-[#E6EAF2]' : 'text-[#282725]'
            }`}
          >
            «{quote}»
          </blockquote>
          {children}
        </div>
      </div>
    </aside>
  );
}

/**
 * Two-line pencil duel in the margin (e.g., Chalmers vs Dennett, with animated red strike-through!).
 */
export function ScholarMarginDuel({
  first,
  second,
  struckWord,
  dark = false,
}: {
  first: { scholar: ScholarId; quote: string; gesture?: 'idle' | 'eyebrow' | 'clink' };
  second: { scholar: ScholarId; quote: string; gesture?: 'idle' | 'slash' | 'eyebrow' };
  struckWord?: string;
  dark?: boolean;
}) {
  const renderFirstQuote = () => {
    if (!struckWord || !first.quote.includes(struckWord)) {
      return <>«{first.quote}»</>;
    }
    const [before, after] = first.quote.split(struckWord);
    return (
      <>
        «{before}
        <span className="relative inline-block px-0.5">
          <span>{struckWord}</span>
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 h-[2px] bg-[#FC4109] -rotate-2 origin-left v7-strike-line"
          />
        </span>
        {after}»
      </>
    );
  };

  return (
    <div
      className={`rounded-2xl border p-4 md:p-5 space-y-4 ${
        dark
          ? 'bg-[#141413]/78 border-[#FAF9F5]/16 text-[#FAF9F5] backdrop-blur-md'
          : 'bg-[#F5F3EB] border-[#141413]/12 text-[#141413]'
      }`}
    >
      <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.13em]">
        <span className="text-[#FC4109]">СПОР НА ПОЛЯХ КНИГИ</span>
        <span className={dark ? 'text-[#FAF9F5]/55' : 'text-[#5E5D59]'}>
          {SCHOLARS[first.scholar].name.split(' ')[1]} × {SCHOLARS[second.scholar].name.split(' ')[1]}
        </span>
      </div>

      {/* First thinker */}
      <div className="flex items-start gap-3">
        <ScholarPortraitSvg id={first.scholar} size={46} gesture={first.gesture ?? 'eyebrow'} dark={dark} />
        <div className="min-w-0 flex-1">
          <div className="font-display font-semibold text-[13px]">
            {SCHOLARS[first.scholar].name}
          </div>
          <p
            className={`font-serif-editorial italic text-[13.5px] leading-[1.52] mt-1 ${
              dark ? 'text-[#FAF9F5]/88' : 'text-[#2C2B29]'
            }`}
          >
            {renderFirstQuote()}
          </p>
        </div>
      </div>

      <div className={`h-[1px] ${dark ? 'bg-[#FAF9F5]/12' : 'bg-[#141413]/10'}`} />

      {/* Second thinker rebutting */}
      <div className="flex items-start gap-3">
        <ScholarPortraitSvg id={second.scholar} size={46} gesture={second.gesture ?? 'slash'} dark={dark} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-[13px]">
              {SCHOLARS[second.scholar].name}
            </span>
            <span className="font-mono-tech text-[9.5px] uppercase tracking-[0.1em] text-[#FC4109]">
              ответ
            </span>
          </div>
          <p
            className={`font-serif-editorial italic text-[13.5px] leading-[1.52] mt-1 ${
              dark ? 'text-[#FFE4D6]' : 'text-[#141413]'
            }`}
          >
            «{second.quote}»
          </p>
        </div>
      </div>
    </div>
  );
}
