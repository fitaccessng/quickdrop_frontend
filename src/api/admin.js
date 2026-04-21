import http from "./http";

export const adminSignup = async (payload) => {
  const { data } = await http.post("/auth/unified-signup", { ...payload, role: "admin" });
  return data;
};

export const adminLogin = async (payload) => {
  const { data } = await http.post("/auth/unified-login", payload);
  return data;
};

export const fetchAdminDashboard = async () => {
  const { data } = await http.get("/admin/dashboard");
  return data;
};

export const fetchAdminVendors = async () => {
  const { data } = await http.get("/admin/vendors");
  return data;
};

export const approveAdminVendor = async ({ vendorId, is_approved }) => {
  const { data } = await http.patch(`/admin/vendors/${vendorId}/approval`, { is_approved });
  return data;
};

export const fetchAdminVendorAnalytics = async (vendorId) => {
  const { data } = await http.get(`/admin/vendors/${vendorId}/analytics`);
  return data;
};

export const fetchAdminOrders = async (params) => {
  const { data } = await http.get("/admin/orders", { params });
  return data;
};

export const assignAdminRider = async ({ orderId, rider_id }) => {
  const { data } = await http.patch(`/admin/orders/${orderId}/assign-rider`, { rider_id });
  return data;
};

export const fetchAdminOrderDetail = async (orderId) => {
  const { data } = await http.get(`/admin/orders/${orderId}`);
  return data;
};

export const fetchAdminUsers = async (params) => {
  const { data } = await http.get("/admin/users", { params });
  return data;
};

export const fetchAdminUserDetail = async (userId) => {
  const { data } = await http.get(`/admin/users/${userId}`);
  return data;
};

export const fetchAdminRiders = async () => {
  const { data } = await http.get("/admin/riders");
  return data;
};

export const fetchAdminProfile = async () => {
  const { data } = await http.get("/admin/profile");
  return data;
};

export const updateAdminProfile = async (payload) => {
  const { data } = await http.put("/admin/profile", payload);
  return data;
};

export const fetchAdminPayoutRequests = async () => {
  const { data } = await http.get("/admin/payout-requests");
  return data;
};

export const fetchAdminServiceCategories = async () => {
  const { data } = await http.get("/admin/service-categories");
  return data;
};

export const createAdminServiceCategory = async (payload) => {
  const { data } = await http.post("/admin/service-categories", payload);
  return data;
};

export const updateAdminServiceCategory = async ({ categoryId, ...payload }) => {
  const { data } = await http.patch(`/admin/service-categories/${categoryId}`, payload);
  return data;
};

export const fetchAdminDeliverySettings = async () => {
  const { data } = await http.get("/admin/delivery-settings");
  return data;
};

export const updateAdminDeliverySettings = async (payload) => {
  const { data } = await http.put("/admin/delivery-settings", payload);
  return data;
};
