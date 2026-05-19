import React, { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const markerShell =
  "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 shadow-[0_10px_30px_rgba(15,23,42,0.35)] backdrop-blur";

const buildDivIcon = (className, iconName) =>
  L.divIcon({
    html: `<div class="${markerShell} ${className}"><span class="material-symbols-outlined">${iconName}</span></div>`,
    className: "bg-transparent border-0",
    iconSize: [44, 44],
    iconAnchor: [22, 36],
  });

const riderIcon = buildDivIcon("bg-orange-500/90 text-white", "two_wheeler");
const destinationIcon = buildDivIcon("bg-emerald-500/90 text-white", "location_on");

const MapSync = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.setView(center, Math.max(map.getZoom(), 13), { animate: true });
  }, [center, map]);

  return null;
};

export const RealtimeDeliveryMap = ({ riderLocation, destination, height = 460 }) => {
  const hasRider = riderLocation?.latitude != null && riderLocation?.longitude != null;
  const hasDestination = destination?.latitude != null && destination?.longitude != null;
  const center = hasRider
    ? [riderLocation.latitude, riderLocation.longitude]
    : hasDestination
      ? [destination.latitude, destination.longitude]
      : [6.5244, 3.3792];

  const linePositions =
    hasRider && hasDestination
      ? [
          [riderLocation.latitude, riderLocation.longitude],
          [destination.latitude, destination.longitude],
        ]
      : [];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950">
      <MapContainer center={center} zoom={13} style={{ width: "100%", height }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapSync center={center} />

        {linePositions.length ? (
          <Polyline positions={linePositions} pathOptions={{ color: "#f97316", weight: 5, opacity: 0.9 }} />
        ) : null}

        {hasDestination ? <Marker position={[destination.latitude, destination.longitude]} icon={destinationIcon} /> : null}
        {hasRider ? <Marker position={[riderLocation.latitude, riderLocation.longitude]} icon={riderIcon} /> : null}
      </MapContainer>
    </div>
  );
};
