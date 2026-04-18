export const SurfaceCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/[0.06] p-5 backdrop-blur-md ${className}`}>{children}</div>
);
