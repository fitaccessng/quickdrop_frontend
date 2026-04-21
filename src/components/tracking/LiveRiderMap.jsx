import React from "react";

const buildMapUrl = (latitude, longitude) => {
  if (latitude == null || longitude == null) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  const delta = 0.01;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
};

export const LiveRiderMap = ({
  latitude,
  longitude,
  title = "Live rider map",
  subtitle = "Tracking the rider in real time",
  riderName,
  status,
  heightClassName = "h-[420px]",
}) => {
  const mapUrl = buildMapUrl(latitude, longitude);

  return (
    <section className={`overflow-hidden rounded-[2rem] bg-slate-900 text-white ${heightClassName}`}>
      <div className="relative h-full">
        {mapUrl ? (
          <iframe
            title={title}
            src={mapUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,147,0,0.28),_transparent_35%),linear-gradient(135deg,_#121826,_#1f2937)]">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-white/60">map</span>
              <p className="mt-4 text-sm font-medium text-slate-300">Waiting for rider location…</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-slate-950/80 to-transparent p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">{subtitle}</p>
          <h2 className="mt-2 font-headline text-3xl font-extrabold">{title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {riderName ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                {riderName}
              </span>
            ) : null}
            {status ? (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-200">
                {String(status).replaceAll("_", " ")}
              </span>
            ) : null}
            {latitude != null && longitude != null ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-200">
                {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
