import { useEffect } from 'react';
import { BookMarked, X, ArrowUpRight } from 'lucide-react';
import { useDossier, type DossierEntry } from './DossierContext';
import { ruTypo } from '../utils/ruTypo';

interface NoesisDossierSheetProps {
  onOpenStateChange?: (open: boolean) => void;
}

export function NoesisDossierSheet({ onOpenStateChange }: NoesisDossierSheetProps) {
  const { activeDossier, closeDossier } = useDossier();
  const isOpen = Boolean(activeDossier);

  useEffect(() => {
    onOpenStateChange?.(isOpen);
  }, [isOpen, onOpenStateChange]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDossier();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, closeDossier]);

  if (!activeDossier) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Архивное досье: ${activeDossier.title}`}
    >
      <button
        type="button"
        onClick={closeDossier}
        aria-label="Закрыть досье"
        className="absolute inset-0 bg-[#141413]/42 backdrop-blur-[2px] cursor-default"
      />

      <aside
        data-lenis-prevent
        className="relative z-10 w-full max-w-[560px] h-full overflow-y-auto bg-[#FAF9F5] text-[#141413] border-l-2 border-[#004EDF] shadow-[0_24px_64px_rgba(20,20,19,0.28)] px-6 sm:px-9 py-7 flex flex-col justify-between"
        style={{ animation: 'beatRise 240ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        <div>
          {/* Top Cobalt Archival Rail */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#141413]/12">
            <div>
              <div className="inline-flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#004EDF] font-semibold">
                <BookMarked className="w-3.5 h-3.5" />
                <span>{activeDossier.catalogCode}</span>
              </div>
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59] mt-1">
                {activeDossier.tag} · УРОВЕНЬ 2 (АРХИВНАЯ СПРАВКА)
              </div>
            </div>
            <button
              type="button"
              onClick={closeDossier}
              className="v6-pill w-9 h-9 rounded-full bg-[#ECEAE2] hover:bg-[#E2DFD5] flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Закрыть досье"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Editorial Title & Lead */}
          <h2 className="font-serif-editorial text-[24px] sm:text-[28px] leading-[1.18] tracking-[-0.018em] text-[#141413] mt-5 [text-wrap:balance]">
            {ruTypo(activeDossier.title)}
          </h2>
          <p className="mt-3.5 text-[15px] leading-[1.68] text-[#30302E] [text-wrap:pretty]">
            {ruTypo(activeDossier.lead)}
          </p>

          {/* Structured Sections */}
          <div className="mt-6 space-y-5">
            {activeDossier.sections.map((sec, i) => (
              <section
                key={sec.heading}
                className="p-4 sm:p-5 rounded-xl bg-[#F3F1E9] border border-[#141413]/10"
              >
                <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.13em] text-[#004EDF] font-semibold">
                  0{i + 1} · РАЗБОР
                </div>
                <h3 className="font-display font-semibold text-[15px] text-[#141413] mt-1 leading-snug">
                  {ruTypo(sec.heading)}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.66] text-[#30302E] [text-wrap:pretty]">
                  {ruTypo(sec.body)}
                </p>
              </section>
            ))}
          </div>

          {/* Peer-Reviewed Citations */}
          <div className="mt-7 pt-5 border-t border-[#141413]/12">
            <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#5E5D59] mb-3">
              ПЕРВОИСТОЧНИКИ И ЛИТЕРАТУРА
            </div>
            <ul className="space-y-3">
              {activeDossier.references.map((ref) => (
                <li
                  key={ref.citation}
                  className="pl-3 border-l-2 border-[#004EDF]/45 text-[12.5px] leading-[1.55]"
                >
                  <div className="font-medium text-[#141413]">
                    {ref.citation}{' '}
                    <span className="font-mono-tech text-[11px] text-[#004EDF]">({ref.year})</span>
                  </div>
                  <div className="text-[#5E5D59] mt-0.5">{ruTypo(ref.note)}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Return Bar */}
        <div className="mt-8 pt-4 border-t border-[#141413]/12 flex items-center justify-between gap-3">
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59]">
            ESC — ВЕРНУТЬСЯ К ЧТЕНИЮ
          </span>
          <button
            type="button"
            onClick={closeDossier}
            className="v6-pill px-4 py-2 rounded-full bg-[#141413] text-[#FAF9F5] hover:bg-[#2A2A28] text-[12.5px] font-medium cursor-pointer"
          >
            Вернуться к главе
          </button>
        </div>
      </aside>
    </div>
  );
}

interface DossierTriggerProps {
  dossier: string | DossierEntry;
  label: string;
  meta?: string;
  dark?: boolean;
  className?: string;
}

/**
 * Bibliographic Margin Tab with a 2px Klein Cobalt (#004EDF) archival spine.
 * Clearly distinguishes optional Level-2 Dossiers from mandatory Level-1 (#FC4109) Mainstream actions!
 */
export function DossierTrigger({
  dossier,
  label,
  meta = 'Архив · Уровень 2',
  dark = false,
  className = '',
}: DossierTriggerProps) {
  const { openDossier } = useDossier();

  return (
    <button
      type="button"
      onClick={() => openDossier(dossier)}
      className={`v6-pill group inline-flex items-center justify-between gap-3 text-left pl-3.5 pr-3 py-2.5 rounded-r-xl border border-l-[3px] border-l-[#004EDF] cursor-pointer ${
        dark
          ? 'bg-[#171C26] hover:bg-[#1E2532] border-[#FAF9F5]/14 text-[#FAF9F5]'
          : 'bg-[#F3F1E9] hover:bg-[#EAE7DC] border-[#141413]/12 text-[#141413]'
      } ${className}`}
    >
      <div className="min-w-0">
        <div
          className={`font-mono-tech text-[9.5px] uppercase tracking-[0.13em] ${
            dark ? 'text-[#89B0FF]' : 'text-[#004EDF]'
          } font-semibold`}
        >
          {meta}
        </div>
        <div className="text-[13px] font-medium leading-snug mt-0.5 truncate sm:whitespace-normal">
          {ruTypo(label)}
        </div>
      </div>
      <ArrowUpRight
        className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
          dark ? 'text-[#89B0FF]' : 'text-[#004EDF]'
        }`}
      />
    </button>
  );
}
