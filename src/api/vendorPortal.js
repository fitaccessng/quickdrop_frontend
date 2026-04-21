import http from "./http";

export const fetchVendorProfile = async () => {
  const { data } = await http.get("/vendors/me/profile");
  return data;
};

export const updateVendorProfile = async (payload) => {
  const { data } = await http.put("/vendors/me/profile", payload);
  return data;
};

export const fetchVendorPayouts = async () => {
  const { data } = await http.get("/vendors/me/payouts");
  return data;
};

export const createVendorPayoutRequest = async (payload) => {
  const { data } = await http.post("/vendors/me/payout-requests", payload);
  return data;
};

export const fetchVendorAnalytics = async () => {
  const { data } = await http.get("/vendors/me/analytics");
  return data;
};

export const fetchVendorOrders = async () => {
  const { data } = await http.get("/orders/vendor/history");
  return data;
};

export const updateVendorOrder = async ({ orderId, ...payload }) => {
  const { data } = await http.patch(`/orders/vendor/${orderId}`, payload);
  return data;
};

export const createVendorProduct = async (payload) => {
  const { data } = await http.post("/products", payload);
  return data;
};

export const updateVendorProduct = async ({ productId, ...payload }) => {
  const { data } = await http.patch(`/products/${productId}`, payload);
  return data;
};
