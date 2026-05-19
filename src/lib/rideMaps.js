const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const formatMoney = (amount, currency = "ZAR") =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export const formatEta = (seconds) => {
  if (!seconds) return "ETA pending";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
};

export const buildGoogleNavigationLink = ({ latitude, longitude, address }) => {
  if (latitude == null || longitude == null) return "#";
  const destination = address ? encodeURIComponent(address) : `${latitude},${longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};

export const hasMapboxToken = () => Boolean(MAPBOX_TOKEN);

export const getMapboxToken = () => MAPBOX_TOKEN;

export const buildLineGeometry = (ride) => {
  if (!ride) return null;
  const routeGeometry = ride.route_geometry?.length
    ? ride.route_geometry
    : [
        [ride.pickup.longitude, ride.pickup.latitude],
        [ride.dropoff.longitude, ride.dropoff.latitude],
      ];

  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: routeGeometry,
    },
  };
};

export const buildRiderApproachGeometry = (ride) => {
  if (!ride?.rider_location) return null;
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [ride.rider_location.longitude, ride.rider_location.latitude],
        [ride.pickup.longitude, ride.pickup.latitude],
      ],
    },
  };
};
