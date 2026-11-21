import type { ReactNode } from 'react';
import { ruTypo } from '../utils/ruTypo';

export type InstrumentSurface = 'vellum' | 'darkroom' | 'plate';
export type InstrumentBadgeKind = 'self-test' | 'reconstruction' | 'scroll-optics' | 'none';

interface NoesisInstrumentFrameProps {
  /** Monospace instrument index e.g. "ПРИБОР I.2 · СПЕКТРОМЕТР" */
  code: string;
  /** Optional short telemetry string on the right of the top 36px rail */
  telemetry?: string;
  /** Honest scientific distinction: live psychophysics on user vs data reconstruction */
  badge?: InstrumentBadgeKind;
  /** Surface theme: 'vellum' (warm paper), 'darkroom' (#111419 clinical/optic), 'plate' (crisp white plate) */
  surface?: InstrumentSurface;
  /** Optional bottom citation/colophon line inside the chassis */
  footnote?: string;
  /** Optional right-aligned footnote item (e.g. Dossier trigger or metric) */
  footnoteRight?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function LabHonestyBadge({
  badge,
  dark = false,
}: {
  badge: InstrumentBadgeKind;
  dark?: boolean;
}) {
  if (badge === 'none') return null;
  if (badge === 'self-test') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono-tech text-[9.5px] uppercase tracking-[0.11em] font-semibold border whitespace-nowrap shrink-0 ${
          dark
            ? 'bg-[#FC4109]/16 text-[#FF8C66] border-[#FC4109]/35'
            : 'bg-[#FC4109]/10 text-[#C83407] border-[#FC4109]/28'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#FC4109]" aria-hidden="true" />
        ОПЫТ НА ТЕБЕ
      </span>
    );
  }
  if (badge === 'reconstruction') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono-tech text-[9.5px] uppercase tracking-[0.11em] font-medium border whitespace-nowrap shrink-0 ${
          dark
            ? 'bg-[#FAF9F5]/6 text-[#9AA3B2] border-[#FAF9F5]/16'
            : 'bg-[#FAF9F5] text-[#5E5D59] border-[#141413]/14'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full border ${
            dark ? 'border-[#9AA3B2]' : 'border-[#5E5D59]'
          }`}
          aria-hidden="true"
        />
        ЛАБОРАТОРНАЯ РЕКОНСТРУКЦИЯ
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono-tech text-[9.5px] uppercase tracking-[0.11em] font-medium border whitespace-nowrap shrink-0 ${
        dark
          ? 'bg-[#004EDF]/18 text-[#93B8FF] border-[#004EDF]/35'
          : 'bg-[#004EDF]/8 text-[#004EDF] border-[#004EDF]/22'
      }`}
    >
      ОПТИЧЕСКИЙ РАЗВОРОТ
    </span>
  );
}

export function NoesisInstrumentFrame({
  code,
  telemetry,
  badge = 'none',
  surface = 'vellum',
  footnote,
  footnoteRight,
  className = '',
  bodyClassName = '',
  children,
}: NoesisInstrumentFrameProps) {
  const isDark = surface === 'darkroom';

  const shellCls =
    surface === 'darkroom'
      ? 'bg-[#111419] text-[#FAF9F5] border border-[#FAF9F5]/14 shadow-[0_18px_48px_rgba(0,0,0,0.28)]'
      : surface === 'plate'
        ? 'bg-[#FAF9F5] text-[#141413] border border-[#141413]/14 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_12px_32px_rgba(20,20,19,0.05)]'
        : 'v9-paper-plate bg-[#F3F1E9] text-[#141413] border border-[#141413]/12';

  const railBorderCls = isDark ? 'border-[#FAF9F5]/10' : 'border-[#141413]/10';
  const markColor = isDark ? 'text-[#FAF9F5]/26' : 'text-[#141413]/24';
  const codeColor = isDark ? 'text-[#FAF9F5]/72' : 'text-[#5E5D59]';

  return (
    <div className={`relative rounded-2xl overflow-hidden ${shellCls} ${className}`}>
      {/* Leica/Swiss 7x7px corner registration crosses */}
      <span
        aria-hidden="true"
        className={`pointer-events-none select-none absolute top-1.5 left-2 font-mono-tech text-[9px] leading-none ${markColor}`}
      >
        +
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none select-none absolute top-1.5 right-2 font-mono-tech text-[9px] leading-none ${markColor}`}
      >
        +
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none select-none absolute bottom-1.5 left-2 font-mono-tech text-[9px] leading-none ${markColor}`}
      >
        +
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none select-none absolute bottom-1.5 right-2 font-mono-tech text-[9px] leading-none ${markColor}`}
      >
        +
      </span>

      {/* Top 36px Swiss telemetry rail */}
      <div
        className={`min-h-[38px] px-5 sm:px-6 py-2 border-b ${railBorderCls} flex flex-wrap items-center justify-between gap-2`}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`font-mono-tech text-[10px] uppercase tracking-[0.14em] whitespace-nowrap ${codeColor}`}>
            {code}
          </span>
          <LabHonestyBadge badge={badge} dark={isDark} />
        </div>
        {telemetry && (
          <span
            className={`font-mono-tech text-[10px] uppercase tracking-[0.1em] whitespace-nowrap ${
              isDark ? 'text-[#FAF9F5]/62' : 'text-[#5E5D59]'
            }`}
          >
            {telemetry}
          </span>
        )}
      </div>

      {/* Main instrument viewport */}
      <div className={`p-5 sm:p-6 md:p-7 ${bodyClassName}`}>{children}</div>

      {/* Optional colophon / calibration strip */}
      {(footnote || footnoteRight) && (
        <div
          className={`px-5 sm:px-6 py-2.5 border-t ${railBorderCls} flex flex-wrap items-center justify-between gap-2 text-[11px] ${
            isDark ? 'text-[#FAF9F5]/56 bg-[#0C0F14]/50' : 'text-[#5E5D59] bg-[#FAF9F5]/45'
          }`}
        >
          <span className="font-mono-tech tracking-[0.04em]">
            {footnote ? ruTypo(footnote) : ''}
          </span>
          {footnoteRight && <div className="flex items-center gap-2">{footnoteRight}</div>}
        </div>
      )}
    </div>
  );
}
