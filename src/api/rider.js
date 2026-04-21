import http from "./http";

export const fetchRiderProfile = async () => {
  const { data } = await http.get("/rider/me/profile");
  return data;
};

export const updateRiderProfile = async (payload) => {
  const { data } = await http.put("/rider/me/profile", payload);
  return data;
};

export const fetchRiderDashboard = async () => {
  const { data } = await http.get("/rider/dashboard");
  return data;
};

export const fetchRiderAnalytics = async () => {
  const { data } = await http.get("/rider/analytics");
  return data;
};

export const fetchRiderOrderRequests = async () => {
  const { data } = await http.get("/rider/orders/requests");
  return data;
};

export const fetchRiderOrders = async () => {
  const { data } = await http.get("/rider/orders/manage");
  return data;
};

export const acceptRiderOrder = async ({ orderId, ...payload }) => {
  const { data } = await http.post(`/rider/orders/${orderId}/accept`, payload);
  return data;
};

export const updateRiderOrder = async ({ orderId, ...payload }) => {
  const { data } = await http.patch(`/rider/orders/${orderId}`, payload);
  return data;
};

export const updateRiderLocation = async ({ orderId, ...payload }) => {
  const { data } = await http.post(`/rider/orders/${orderId}/location`, payload);
  return data;
};

export const fetchRiderWallet = async () => {
  const { data } = await http.get("/rider/wallet");
  return data;
};

export const createRiderPayoutRequest = async (payload) => {
  const { data } = await http.post("/rider/payout-requests", payload);
  return data;
};

export const fetchRiderTracking = async (orderId) => {
  const { data } = await http.get(`/rider/orders/${orderId}/tracking`);
  return data;
};
