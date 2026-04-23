import quickdropLogo from "../../styles/quickdrop.jpeg";

export const QuickDropLogo = ({
  size = 40,
  showWordmark = false,
  label = "QuickDrop",
  className = "",
  labelClassName = "",
  imageClassName = "",
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={quickdropLogo}
        alt={label}
        className={`w-auto rounded-lg object-contain transition-transform hover:scale-105 ${imageClassName}`}
        style={{ height: size }}
      />
      {showWordmark ? (
        <span className={`text-lg font-black tracking-tight text-slate-950 sm:text-xl ${labelClassName}`}>
          {label}
        </span>
      ) : null}
    </div>
  );
};
