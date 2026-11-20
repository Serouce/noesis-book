import { useEffect } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { CHAMBERS, PHASE1_COPY, type Lang } from '../data/phase1Copy';

interface IndexDrawerProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  activeChamberIdx: number;
  onNavigate: (chamberId: string) => void;
}

export function IndexDrawer({
  open,
  onClose,
  lang,
  activeChamberIdx,
  onNavigate,
}: IndexDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="NOESIS Chamber Index"
    >
      {/* Dimmed frosted backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#141413]/40 backdrop-blur-sm cursor-default"
        aria-label="Close overlay"
      />

      {/* Clean Anthropic Warm Ivory Drawer Panel */}
      <div
        data-lenis-prevent
        className="relative z-10 w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-[24px] bg-[#FAF9F5] text-[#141413] border border-[#141413]/12 shadow-[0_32px_90px_rgba(20,20,19,0.22)] p-6 md:p-10 animate-[fadeScaleIn_220ms_cubic-bezier(0.22,1,0.36,1)]"
      >
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#141413]/10">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[#5E5D59]">
              <span className="w-2 h-2 rounded-full bg-[#FC4109]" />
              <span>NOESIS · {lang === 'ru' ? 'КАРТА ЗАЛОВ' : 'CHAMBER INDEX'}</span>
            </div>
            <h2 className="font-serif-editorial text-2xl md:text-3xl mt-2 text-[#141413]">
              {lang === 'ru' ? 'Шесть масштабов сознания' : 'Six Scales of Consciousness'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="v6-pill h-9 px-3.5 rounded-full bg-[#E8E6DC] hover:bg-[#DFDCD0] text-[#141413] inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <span>{PHASE1_COPY.hud.closeBtn[lang]}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <ol className="divide-y divide-[#141413]/10 mt-2">
          {CHAMBERS.map((chamber, idx) => {
            const isLive = chamber.status === 'live';
            const isCurrent = idx === activeChamberIdx;
            return (
              <li key={chamber.id}>
                <button
                  type="button"
                  disabled={!isLive}
                  onClick={() => {
                    onNavigate(chamber.id);
                    onClose();
                  }}
                  className={`w-full text-left py-4 md:py-5 flex items-start md:items-center justify-between gap-4 transition-colors ${
                    isLive
                      ? 'cursor-pointer hover:bg-[#F0EEE6]/70 -mx-3 px-3 rounded-xl'
                      : 'opacity-55 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-4 md:gap-5">
                    <span
                      className={`font-mono-tech text-xs mt-1 px-2 py-0.5 rounded-full ${
                        isCurrent
                          ? 'bg-[#FC4109] text-[#FAF9F5]'
                          : 'bg-[#E8E6DC] text-[#30302E]'
                      }`}
                    >
                      {chamber.num}
                    </span>
                    <div>
                      <div className="font-display font-semibold text-base md:text-lg text-[#141413]">
                        {chamber.title[lang]}
                      </div>
                      <p className="text-sm text-[#5E5D59] mt-0.5 leading-relaxed">
                        {chamber.subtitle[lang]}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`font-mono-tech text-[11px] px-2.5 py-1 rounded-full border ${
                        isLive
                          ? 'border-[#0D7A5F]/25 bg-[#0D7A5F]/8 text-[#0D7A5F]'
                          : 'border-[#141413]/12 bg-[#F0EEE6] text-[#5E5D59]'
                      }`}
                    >
                      {chamber.phaseLabel[lang]}
                    </span>
                    {isLive && <ArrowUpRight className="w-4 h-4 text-[#5E5D59]" />}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
