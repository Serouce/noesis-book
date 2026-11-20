import { X, Check } from 'lucide-react';
import { BOOK_CHAPTERS, BOOK_PARTS } from '../data/bookMeta';
import { useExplorer } from '../context/ExplorerContext';

interface BookIndexDrawerProps {
  open: boolean;
  onClose: () => void;
  activeChapterId: string;
  onNavigate: (chapterId: string) => void;
}

export function BookIndexDrawer({
  open,
  onClose,
  activeChapterId,
  onNavigate,
}: BookIndexDrawerProps) {
  const { completedChapters } = useExplorer();

  if (!open) return null;

  const threshold = BOOK_CHAPTERS[0];

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Оглавление книги NOESIS"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#141413]/40 backdrop-blur-xs cursor-default"
        aria-label="Закрыть оглавление"
      />

      <aside
        data-lenis-prevent
        className="relative z-10 w-full max-w-lg h-full overflow-y-auto bg-[#FAF9F5] text-[#141413] border-l border-[#141413]/12 shadow-2xl px-6 md:px-10 py-7 flex flex-col justify-between"
      >
        <div>
          {/* Top Book Header */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#141413]/12">
            <div>
              <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                NOESIS · ИНТЕРАКТИВНАЯ МОНОГРАФИЯ · 2026
              </div>
              <h2 className="font-serif-editorial text-2xl md:text-[28px] mt-1.5 leading-tight">
                Оглавление книги
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="v6-pill w-9 h-9 rounded-full bg-[#ECEAE2] hover:bg-[#E2DFD5] flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Table 00 */}
          <div className="mt-5 pb-4 border-b border-[#141413]/10">
            <button
              type="button"
              onClick={() => {
                onNavigate(threshold.id);
                onClose();
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                activeChapterId === threshold.id
                  ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                  : 'bg-[#F3F1E9] hover:bg-[#ECE9DF] border-[#141413]/10 text-[#141413]'
              }`}
            >
              <div>
                <div
                  className={`font-mono-tech text-[10px] uppercase tracking-[0.12em] ${
                    activeChapterId === threshold.id ? 'text-[#FC4109]' : 'text-[#5E5D59]'
                  }`}
                >
                  {threshold.code} · {threshold.folio}
                </div>
                <div className="font-display font-semibold text-[15px] mt-0.5">
                  {threshold.fullTitle}
                </div>
                <div
                  className={`text-[12px] mt-0.5 ${
                    activeChapterId === threshold.id ? 'text-[#FAF9F5]/72' : 'text-[#5E5D59]'
                  }`}
                >
                  {threshold.mechanic}
                </div>
              </div>
              {completedChapters[threshold.id] && (
                <span className="mt-1 w-5 h-5 rounded-full bg-[#FC4109] text-[#FAF9F5] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </button>
          </div>

          {/* 3 Monumental Book Parts */}
          <div className="mt-5 space-y-6">
            {BOOK_PARTS.map((part) => {
              const partChapters = BOOK_CHAPTERS.filter((c) => c.partNum === part.num);
              return (
                <div key={part.num}>
                  <div className="flex items-baseline justify-between mb-2.5">
                    <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
                      {part.label}
                    </span>
                    <span className="font-serif-editorial italic text-[12px] text-[#5E5D59]">
                      {part.subtitle}
                    </span>
                  </div>

                  <div className="divide-y divide-[#141413]/10 border-t border-b border-[#141413]/10">
                    {partChapters.map((ch) => {
                      const isActive = activeChapterId === ch.id;
                      const done = Boolean(completedChapters[ch.id]);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            onNavigate(ch.id);
                            onClose();
                          }}
                          className={`w-full text-left py-3 px-2.5 -mx-2.5 rounded-lg transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                            isActive
                              ? 'bg-[#141413] text-[#FAF9F5]'
                              : 'hover:bg-[#F0EEE6] text-[#141413]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.11em]">
                              <span className={isActive ? 'text-[#FC4109]' : 'text-[#5E5D59]'}>
                                {ch.code}
                              </span>
                              <span className={isActive ? 'text-[#FAF9F5]/45' : 'text-[#141413]/25'}>
                                ·
                              </span>
                              <span className={isActive ? 'text-[#FAF9F5]/70' : 'text-[#5E5D59]'}>
                                {ch.folio}
                              </span>
                            </div>
                            <div className="font-display font-semibold text-[14.5px] mt-0.5 leading-snug">
                              {ch.fullTitle}
                            </div>
                            <div
                              className={`text-[12px] mt-0.5 ${
                                isActive ? 'text-[#FAF9F5]/70' : 'text-[#5E5D59]'
                              }`}
                            >
                              {ch.mechanic}
                            </div>
                          </div>

                          <span
                            className={`mt-1.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              done
                                ? 'bg-[#0D7A5F] border-[#0D7A5F] text-[#FAF9F5]'
                                : isActive
                                  ? 'border-[#FAF9F5]/35'
                                  : 'border-[#141413]/20'
                            }`}
                            title={done ? 'Опыт пройден' : 'Впереди'}
                          >
                            {done && <Check className="w-2.5 h-2.5" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colophon Footnote */}
        <div className="mt-8 pt-4 border-t border-[#141413]/10 flex items-center justify-between font-mono-tech text-[10.5px] text-[#5E5D59]">
          <span>8 ГЛАВ · 9 МЕХАНИЗМОВ</span>
          <span>12–15 МИН ЧТЕНИЯ</span>
        </div>
      </aside>
    </div>
  );
}
