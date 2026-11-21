import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import type { ActId } from '../utils/hashRouter';
import { getActMeta } from '../data/actsMeta';
import { getNextAct, getPrevAct } from '../utils/hashRouter';
import { ruTypo } from '../utils/ruTypo';

interface ActTopAnchorProps {
  actId: ActId;
  visitedActs: Record<string, boolean>;
  onSwitchAct: (act: ActId) => void;
}

/**
 * Editorial Act Opening Masthead & Domino Anchor:
 * Gives direct cold-link visitors clean orientation without forcing them back to Act I.
 */
export function ActTopAnchor({ actId, visitedActs, onSwitchAct }: ActTopAnchorProps) {
  const meta = getActMeta(actId);
  const prevAct = getPrevAct(actId);
  if (!prevAct || !meta.prevAnchorNote) return null;

  const prevMeta = getActMeta(prevAct);
  const isColdJump = !visitedActs[prevAct];

  return (
    <section
      aria-label={`Начало акта: ${meta.title}`}
      className="pt-24 pb-8 md:pt-28 md:pb-10 px-6 md:px-10 bg-[#FAF9F5] text-[#141413] border-b border-[#141413]/8"
    >
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.16em] text-[#FC4109] font-semibold">
              {meta.code}
            </span>
            <span className="text-[#141413]/25">·</span>
            <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#5E5D59]">
              {meta.durationLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSwitchAct(prevAct)}
            className="v6-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F1E9] hover:bg-[#E9E6DC] border border-[#141413]/12 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#30302E] cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>
              Акт {prevMeta.roman} · {prevMeta.title}
            </span>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-serif-editorial font-serif-display text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[1.04] tracking-[-0.024em] text-[#141413] [text-wrap:balance]">
              {ruTypo(meta.title)}
            </h1>
            <p className="mt-2.5 text-[15.5px] leading-[1.6] text-[#5E5D59] max-w-[58ch] [text-wrap:pretty]">
              {ruTypo(meta.subtitle)}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div
              className={`p-4 rounded-xl border ${
                isColdJump
                  ? 'bg-[#F3F1E9] border-[#004EDF]/30 border-l-[3px] border-l-[#004EDF]'
                  : 'bg-[#F3F1E9]/70 border-[#141413]/10'
              }`}
            >
              <div className="flex items-center gap-1.5 font-mono-tech text-[9.5px] uppercase tracking-[0.13em] text-[#004EDF] font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>
                  {isColdJump ? `ВЫ ОТКРЫЛИ АКТ ${meta.roman} НАПРЯМУЮ` : `МОСТИК ИЗ АКТА ${prevMeta.roman}`}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-[1.58] text-[#30302E] [text-wrap:pretty]">
                {ruTypo(meta.prevAnchorNote)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ActBottomTurnProps {
  actId: ActId;
  onSwitchAct: (act: ActId) => void;
  /** True when turning out of dark ICU (Act IV) back to morning paper (Act V) */
  fromDark?: boolean;
}

/**
 * Tactile Page-Turn Plate at the bottom of Acts I–IV.
 * Gives the reader a crisp physical rhythm and previews the next Act's cliffhanger.
 */
export function ActBottomTurn({ actId, onSwitchAct, fromDark = false }: ActBottomTurnProps) {
  const nextAct = getNextAct(actId);
  const currentMeta = getActMeta(actId);
  if (!nextAct) return null;

  const nextMeta = getActMeta(nextAct);

  return (
    <section
      data-hud-theme={fromDark ? 'dark' : undefined}
      className={`relative px-6 md:px-10 py-16 md:py-24 border-t ${
        fromDark
          ? 'bg-gradient-to-b from-[#0E1117] via-[#12161E] to-[#171B24] text-[#FAF9F5] border-[#FAF9F5]/10'
          : 'bg-[#F3F1E9] text-[#141413] border-[#141413]/10'
      }`}
    >
      <div className="max-w-[920px] mx-auto">
        <div
          className={`p-7 sm:p-10 rounded-2xl border ${
            fromDark
              ? 'bg-[#161B24] border-[#FAF9F5]/16'
              : 'v9-paper-plate bg-[#FAF9F5] border-[#141413]/12'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10px] uppercase tracking-[0.15em]">
            <span className="text-[#FC4109] font-semibold">
              КОНЕЦ АКТА {currentMeta.roman} · СЛЕДУЮЩИЙ РАЗВОРОТ
            </span>
            <span className={fromDark ? 'text-[#FAF9F5]/60' : 'text-[#5E5D59]'}>
              {nextMeta.code} · {nextMeta.durationLabel}
            </span>
          </div>

          <h2 className="mt-4 font-serif-editorial text-[clamp(1.75rem,3.4vw,2.65rem)] leading-[1.1] tracking-[-0.02em] [text-wrap:balance]">
            Акт {nextMeta.roman}. {ruTypo(nextMeta.title)}
          </h2>

          {currentMeta.nextCliffhanger && (
            <p
              className={`mt-3 text-[15.5px] leading-[1.68] max-w-[60ch] [text-wrap:pretty] ${
                fromDark ? 'text-[#FAF9F5]/78' : 'text-[#30302E]'
              }`}
            >
              {ruTypo(currentMeta.nextCliffhanger)}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onSwitchAct(nextAct)}
              className={`v6-pill group inline-flex items-center gap-3 px-6 py-3.5 rounded-full text-[14px] font-medium cursor-pointer ${
                fromDark
                  ? 'bg-[#FAF9F5] text-[#141413] hover:bg-[#ECEAE2]'
                  : 'bg-[#141413] text-[#FAF9F5] hover:bg-[#2A2A28]'
              }`}
            >
              <span>Перевернуть в Акт {nextMeta.roman}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
            </button>

            <span
              className={`font-mono-tech text-[10.5px] uppercase tracking-[0.1em] ${
                fromDark ? 'text-[#FAF9F5]/52' : 'text-[#5E5D59]'
              }`}
            >
              {nextMeta.chapters.map((c) => c.code).join(' · ')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
