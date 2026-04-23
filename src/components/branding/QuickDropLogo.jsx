export const QuickDropLogo = ({
  size = 48,
  showWordmark = false,
  label = "QuickDrop",
  className = "",
  badgeClassName = "",
  labelClassName = "",
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 p-1.5 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.75)] ${badgeClassName}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 128 128" className="h-full w-full" role="img" aria-label={label}>
          <rect x="7" y="40" width="46" height="10" rx="5" fill="#0F4BC5" />
          <rect x="7" y="62" width="42" height="10" rx="5" fill="#0F4BC5" opacity="0.98" />
          <rect x="7" y="84" width="44" height="10" rx="5" fill="#0F4BC5" opacity="0.96" />
          <path
            d="M79 12c-21.5 0-39 17.5-39 39 0 13.6 7.2 27.1 18.3 41.2 7.9 10 15.7 17.6 20.7 22.2a1.8 1.8 0 0 0 2.4 0c5-4.6 12.7-12.2 20.7-22.2C113.8 78.1 121 64.6 121 51c0-21.5-17.5-39-39-39Z"
            fill="#FF6A00"
          />
          <circle cx="79" cy="52" r="25" fill="#FFFFFF" />
          <path d="M61 41.5 74.5 48 62.5 55.5 49 49Z" fill="#0F4BC5" />
          <path d="M75.8 48 91.8 40.2 107.8 48.4 92.2 56.2Z" fill="#0F4BC5" />
          <path d="M49 50.8 62.2 57.3V85L49 79.2Z" fill="#1544A7" />
          <path d="M63.8 57.5 75 51.8V79.4l-11.2 5.3Z" fill="#0F4BC5" />
          <path d="M76.6 51.6 92 58.1v13l-4.6 2.2V60.4l-10.8-5.3Z" fill="#FFFFFF" />
        </svg>
      </div>
      {showWordmark ? (
        <span className={`text-lg font-black tracking-tight text-slate-950 sm:text-xl ${labelClassName}`}>
          {label}
        </span>
      ) : null}
    </div>
  );
};
