import { X } from "lucide-react";

export const BottomSheetModal = ({
  title,
  subtitle,
  eyebrow,
  onClose,
  children,
  className = "",
}) => {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,147,0,0.22),transparent_28%),linear-gradient(180deg,#eef2ff_0%,#f8fafc_18%,#fff7ed_100%)] px-3 py-3 sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-5xl items-end sm:min-h-[calc(100vh-3rem)]">
        <section
          className={`relative w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/96 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.75)] backdrop-blur-xl sm:rounded-[2.75rem] ${className}`}
        >
          <div className="absolute inset-x-0 top-0 flex justify-center pt-3">
            <span className="h-1.5 w-14 rounded-full bg-slate-200" />
          </div>

          <header className="border-b border-slate-100 px-5 pb-5 pt-8 sm:px-8 sm:pb-6 sm:pt-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ff9300]">{eyebrow}</p>
                ) : null}
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
                {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{subtitle}</p> : null}
              </div>

              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              ) : null}
            </div>
          </header>

          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 pb-6 pt-5 sm:max-h-[calc(100vh-12rem)] sm:px-8 sm:pb-8 sm:pt-6">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};
