interface BookInterludeProps {
  id: string;
  partCode: string;
  title: string;
  statement: string;
  footnote: string;
  fromDark?: boolean;
}

/**
 * Quiet full-screen Swiss book half-title spread (Шмуцтитул).
 * 80% calm breathing air, ZERO buttons — releases cognitive tension between major Parts.
 */
export function BookInterlude({
  id,
  partCode,
  title,
  statement,
  footnote,
  fromDark = false,
}: BookInterludeProps) {
  return (
    <section
      id={id}
      className="relative min-h-[78svh] flex flex-col justify-between px-5 md:px-12 lg:px-20 py-24 md:py-32"
      style={{
        background: fromDark
          ? 'linear-gradient(180deg, #111419 0%, #2C3038 14%, #E8E5DC 44%, #FAF9F5 74%)'
          : '#FAF9F5',
      }}
      aria-label={`${partCode} — ${title}`}
    >
      <div className="max-w-[1160px] mx-auto w-full flex-1 flex flex-col justify-center">
        <div className={fromDark ? 'pt-20 md:pt-28' : ''}>
          <div className="flex items-center gap-3 font-mono-tech text-[11px] uppercase tracking-[0.18em] text-[#FC4109]">
            <span className="w-8 h-[1px] bg-[#FC4109]" />
            <span>{partCode}</span>
          </div>

          <h2 className="mt-5 font-display font-bold text-[clamp(34px,5.2vw,68px)] leading-[1.04] tracking-[-0.032em] text-[#141413]">
            {title}
          </h2>

          <p className="mt-8 max-w-2xl font-serif-editorial italic text-[clamp(20px,2.3vw,30px)] leading-[1.45] text-[#2F2E2B]">
            {statement}
          </p>

          <div className="mt-12 pt-5 border-t border-[#141413]/12 flex items-center justify-between font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#5E5D59]">
            <span>{footnote}</span>
            <span>↓ Листайте дальше</span>
          </div>
        </div>
      </div>
    </section>
  );
}
