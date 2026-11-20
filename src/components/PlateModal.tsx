import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import {
  PLATE_ASSETS,
  type ChapterData,
  type UiLabels,
} from '../data/content';

export interface PlateModalProps {
  chapter: ChapterData | null;
  ui: UiLabels;
  onClose: () => void;
  reducedMotion: boolean;
}

export function PlateModal({
  chapter,
  ui,
  onClose,
  reducedMotion,
}: PlateModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const chapterId = chapter?.id ?? null;

  // Focus management + restoration + Tab focus trap + Escape dismiss
  // Keyed strictly on chapterId so EN <-> RU language switches while open never reset focus
  useEffect(() => {
    if (!chapterId) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    // Focus immediately (visibility is immediately visible) + rAF verification
    closeBtnRef.current?.focus();
    const rafId = window.requestAnimationFrame(() => {
      if (closeBtnRef.current && document.activeElement !== closeBtnRef.current) {
        closeBtnRef.current.focus();
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const container = modalRef.current;
        if (!container) return;
        const focusables = container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (focusables.length === 1) {
          e.preventDefault();
          first.focus();
          return;
        }

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            !container.contains(document.activeElement)
          ) {
            e.preventDefault();
            last.focus();
          }
        } else if (
          document.activeElement === last ||
          !container.contains(document.activeElement)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', handleKeyDown);
      if (
        lastFocusedRef.current &&
        typeof lastFocusedRef.current.focus === 'function'
      ) {
        lastFocusedRef.current.focus();
        lastFocusedRef.current = null;
      }
    };
  }, [chapterId]);

  return (
    <AnimatePresence>
      {chapter && (
        <motion.div
          ref={modalRef}
          id="plate-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-plate-title"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.28 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030407]/90 p-4 backdrop-blur-2xl sm:p-8"
          style={{ visibility: 'visible' }}
        >
          <button
            ref={closeBtnRef}
            id="plate-modal-close"
            type="button"
            onClick={onClose}
            aria-label={ui.closeModal}
            className="glass-pill fixed top-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center text-[#F7F8FA] transition-transform duration-300 hover:scale-105 hover:border-[var(--accent-a)]/70 sm:top-7 sm:right-7"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.97 }}
            transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[92svh] w-full max-w-[960px] flex-col items-center gap-5"
          >
            <div className="relative flex max-h-[72svh] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#05070D]/80 p-2 sm:p-4">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  background:
                    'radial-gradient(circle at 50% 45%, var(--accent-glow), transparent 68%)',
                }}
              />
              <img
                id="modal-plate-img"
                src={PLATE_ASSETS[chapter.id]}
                alt={`${chapter.plate.code} — ${chapter.plate.title}`}
                className="artwork-blend relative z-10 max-h-[68svh] w-auto max-w-full object-contain mix-blend-screen"
              />
            </div>

            <div className="flex max-w-[68ch] flex-col items-center gap-2 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="glass-pill px-3 py-1 font-mono text-[0.68rem] tracking-[0.14em] text-[var(--accent-a)] uppercase">
                  {chapter.plate.code}
                </span>
                <span className="font-mono text-[0.68rem] tracking-[0.08em] text-slate-400">
                  {chapter.plate.telemetryLabel}: {chapter.plate.telemetryValue}
                </span>
              </div>

              <h3
                id="modal-plate-title"
                className="font-display text-xl font-medium tracking-[-0.02em] text-[#F7F8FA] sm:text-2xl"
              >
                {chapter.plate.title}
              </h3>

              <p className="text-[0.9rem] leading-relaxed text-slate-300/90">
                {chapter.plate.caption}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
