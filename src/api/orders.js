import http, { resolveApiBaseUrl } from "./http";

const API_BASE_URL = resolveApiBaseUrl();

export const submitOrder = async (payload) => {
  const { data } = await http.post("/orders", payload);
  return data;
};

export const fetchOrderQuote = async (payload) => {
  const { data } = await http.post("/orders/quote", payload);
  return data;
};

export const initializePaystackCheckout = async (payload) => {
  const { data } = await http.post("/orders/paystack/initialize", payload);
  return data;
};

/**
 * Fetch tracking info for either an order or ride based on ID
 * @param {string} id - Order ID or Ride ID (ride IDs start with 'ride_')
 * @returns {Promise<Object>} Tracking data
 */
export const fetchOrderTracking = async (id) => {
  // Check if this is a ride ID (starts with 'ride_') or an order ID
  if (id && id.startsWith('ride_')) {
    const { data } = await http.get(`/rides/${id}`);
    return data;
  } else {
    const { data } = await http.get(`/orders/${id}`);
    return data;
  }
};

export const fetchUserOrders = async () => {
  const { data } = await http.get("/orders/user/history");
  return data;
};

export const buildOrderSocketUrl = ({ token, orderId }) => {
  const baseUrl = new URL(API_BASE_URL, typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");
  const socketOrigin = `${baseUrl.protocol === "https:" ? "wss:" : "ws:"}//${baseUrl.host}`;
  const basePath = baseUrl.pathname.replace(/\/$/, "");
  const url = new URL(`${basePath}/orders/ws`, socketOrigin);
  url.searchParams.set("token", token);
  url.searchParams.set("order_id", orderId);
  return url.toString();
};
