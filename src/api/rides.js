import http, { resolveApiBaseUrl } from "./http";

const API_BASE_URL = resolveApiBaseUrl();

export const quoteRide = async (payload) => {
  const { data } = await http.post("/rides/quote", payload);
  return data;
};

export const requestRide = async (payload) => {
  const { data } = await http.post("/rides", payload);
  return data;
};

export const fetchRideStatus = async (rideId) => {
  const { data } = await http.get(`/rides/${rideId}`);
  return data;
};

export const fetchCurrentRide = async () => {
  const { data } = await http.get("/rides/active/current");
  return data;
};

export const fetchUserRides = async () => {
  const { data } = await http.get("/rides/user/history");
  return data;
};

export const fetchRiderRideQueue = async () => {
  const { data } = await http.get("/rides/rider/queue");
  return data;
};

export const fetchRiderRideHistory = async () => {
  const { data } = await http.get("/rides/rider/history");
  return data;
};

export const respondToRideOffer = async ({ rideId, action }) => {
  const { data } = await http.post(`/rides/${rideId}/rider-response`, { action });
  return data;
};

export const updateRideStatus = async ({ rideId, status, tracking_note }) => {
  const { data } = await http.post(`/rides/${rideId}/status`, { status, tracking_note });
  return data;
};

export const updateRideLocation = async ({ rideId, latitude, longitude, heading, speed }) => {
  const { data } = await http.post(`/rides/${rideId}/location`, {
    latitude,
    longitude,
    heading,
    speed,
  });
  return data;
};

export const fetchAdminLiveRides = async () => {
  const { data } = await http.get("/rides/admin/live");
  return data;
};

export const assignRideManually = async ({ rideId, rider_id }) => {
  const { data } = await http.post(`/rides/admin/${rideId}/assign`, { rider_id });
  return data;
};

export const buildRideSocketUrl = ({ token, rideId }) => {
  const baseUrl = new URL(API_BASE_URL, typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");
  const socketOrigin = `${baseUrl.protocol === "https:" ? "wss:" : "ws:"}//${baseUrl.host}`;
  const basePath = baseUrl.pathname.replace(/\/$/, "");
  const url = new URL(`${basePath}/rides/ws`, socketOrigin);
  url.searchParams.set("token", token);
  if (rideId) {
    url.searchParams.set("ride_id", rideId);
  }
  return url.toString();
};
