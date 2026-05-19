import React, { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
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

const pickupIcon = buildDivIcon("bg-emerald-500/90 text-white", "trip_origin");
const dropoffIcon = buildDivIcon("bg-rose-500/90 text-white", "flag");
const riderIcon = buildDivIcon("bg-orange-500/90 text-white", "two_wheeler");

const MapSync = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.setView(center, Math.max(map.getZoom(), 12), { animate: true });
  }, [center, map]);

  return null;
};

const PickerEvents = ({ onMapPick, pickMode, showPicker }) => {
  useMapEvents({
    click(event) {
      if (!showPicker || !onMapPick) return;
      onMapPick({
        type: pickMode,
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
};

export const RealtimeRideMap = ({ ride, onMapPick, pickMode = "pickup", showPicker = false, height = 460 }) => {
  const center = ride?.rider_location
    ? [ride.rider_location.latitude, ride.rider_location.longitude]
    : ride?.pickup
      ? [ride.pickup.latitude, ride.pickup.longitude]
      : [6.5244, 3.3792];

  const fallbackRouteStart = ride?.rider_location ?? ride?.pickup;
  const fallbackRouteEnd = ride?.dropoff ?? ride?.pickup;
  const routePositions = ride?.route_geometry?.length
    ? ride.route_geometry.map((coordinate) => [coordinate[1], coordinate[0]])
    : fallbackRouteStart && fallbackRouteEnd
      ? [
          [fallbackRouteStart.latitude, fallbackRouteStart.longitude],
          [fallbackRouteEnd.latitude, fallbackRouteEnd.longitude],
        ]
      : [];

  const approachPositions = ride?.rider_location &&
    ride?.pickup &&
    (
      Number(ride.rider_location.latitude) !== Number(ride.pickup.latitude) ||
      Number(ride.rider_location.longitude) !== Number(ride.pickup.longitude)
    )
    ? [
        [ride.rider_location.latitude, ride.rider_location.longitude],
        [ride.pickup.latitude, ride.pickup.longitude],
      ]
    : [];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950">
      <MapContainer center={center} zoom={12.5} style={{ width: "100%", height }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapSync center={center} />
        <PickerEvents onMapPick={onMapPick} pickMode={pickMode} showPicker={showPicker} />

        {routePositions.length ? (
          <Polyline positions={routePositions} pathOptions={{ color: "#f97316", weight: 5, opacity: 0.95 }} />
        ) : null}
        {approachPositions.length ? (
          <Polyline positions={approachPositions} pathOptions={{ color: "#22c55e", weight: 4, opacity: 0.85, dashArray: "8 8" }} />
        ) : null}

        {ride?.pickup ? <Marker position={[ride.pickup.latitude, ride.pickup.longitude]} icon={pickupIcon} /> : null}
        {ride?.dropoff ? <Marker position={[ride.dropoff.latitude, ride.dropoff.longitude]} icon={dropoffIcon} /> : null}
        {ride?.rider_location ? (
          <Marker position={[ride.rider_location.latitude, ride.rider_location.longitude]} icon={riderIcon} />
        ) : null}
      </MapContainer>
    </div>
  );
};
