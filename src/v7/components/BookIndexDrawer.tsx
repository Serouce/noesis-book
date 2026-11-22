import { useEffect, useState } from 'react';
import { X, Check, RotateCcw, BookMarked } from 'lucide-react';
import { ACTS_META } from '../../v9/data/actsMeta';
import type { ActId } from '../../v9/utils/hashRouter';
import { useExplorer } from '../context/ExplorerContext';

interface BookIndexDrawerProps {
  open: boolean;
  onClose: () => void;
  activeAct: ActId;
  activeChapterId: string;
  onNavigate: (actId: ActId, chapterId?: string) => void;
}

export function BookIndexDrawer({
  open,
  onClose,
  activeAct,
  activeChapterId,
  onNavigate,
}: BookIndexDrawerProps) {
  const { completedChapters, completedCount, totalExperiments, state, resetAllState } = useExplorer();
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmReset(false);
      return;
    }
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Оглавление атласа NOESIS"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#141413]/40 backdrop-blur-[2px] cursor-default"
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
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.13em] text-[#FC4109]">
                NOESIS · ИЗДАНИЕ 2026
              </div>
              <h2 className="font-serif-editorial text-2xl md:text-[28px] mt-1.5 leading-tight">
                Четыре акта книги
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono-tech text-[10.5px] text-[#5E5D59]">
                <span>ОПЫТОВ ПРОЙДЕНО: {completedCount} / {totalExperiments}</span>
                <span className="text-[#141413]/25">·</span>
                <span className="inline-flex items-center gap-1 text-[#004EDF]">
                  <BookMarked className="w-3 h-3" />
                  ДОСЬЕ: {state.dossiersRead.length}
                </span>
              </div>
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

          {/* 5 Acts Accordion-Free Atlas Map */}
          <div className="mt-5 space-y-6">
            {ACTS_META.map((act) => {
              const isActCurrent = act.id === activeAct;
              return (
                <div key={act.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(act.id);
                      onClose();
                    }}
                    className="w-full text-left flex items-baseline justify-between gap-2 mb-2 group cursor-pointer"
                  >
                    <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold group-hover:underline">
                      {act.code}
                    </span>
                    <span className="font-mono-tech text-[10px] text-[#5E5D59]">
                      {isActCurrent ? '● СЕЙЧАС ЗДЕСЬ · ' : ''}
                      {act.durationLabel}
                    </span>
                  </button>

                  <div className="divide-y divide-[#141413]/10 border-t border-b border-[#141413]/10">
                    {act.chapters.map((ch) => {
                      const isActive = isActCurrent && activeChapterId === ch.id;
                      const done = ch.experimentKey ? Boolean(completedChapters[ch.experimentKey]) : false;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            onNavigate(act.id, ch.id);
                            onClose();
                          }}
                          className={`w-full text-left py-3 px-3 rounded-lg transition-colors cursor-pointer flex items-start justify-between gap-3 ${
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
                              {ch.title}
                            </div>
                            <div
                              className={`text-[12px] mt-0.5 ${
                                isActive ? 'text-[#FAF9F5]/72' : 'text-[#5E5D59]'
                              }`}
                            >
                              {ch.mechanic}
                            </div>
                          </div>

                          {ch.experimentKey && (
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
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colophon Footnote + Safe Two-Step Protocol Reset */}
        <div className="mt-8 pt-4 border-t border-[#141413]/12 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59]">
            ПРОГРЕСС СОХРАНЯЕТСЯ В БРАУЗЕРЕ
          </div>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="v6-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F1E9] hover:bg-[#E7E3D7] border border-[#141413]/14 font-mono-tech text-[10px] uppercase tracking-[0.09em] text-[#5E5D59] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить протокол</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetAllState();
                  setConfirmReset(false);
                }}
                className="v6-pill px-3 py-1.5 rounded-full bg-[#C92A2A] text-[#FAF9F5] font-mono-tech text-[10px] uppercase tracking-[0.09em] cursor-pointer"
              >
                Да, очистить
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="v6-pill px-2.5 py-1.5 rounded-full bg-[#ECEAE2] text-[#141413] font-mono-tech text-[10px] uppercase cursor-pointer"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
