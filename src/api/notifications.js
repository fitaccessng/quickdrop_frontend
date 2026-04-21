import http from "./http";

export const fetchCustomerNotifications = async () => {
  const { data } = await http.get("/notifications/me");
  return data;
};

export const fetchVendorNotifications = async () => {
  const { data } = await http.get("/notifications/vendor/me");
  return data;
};

export const fetchRiderNotifications = async () => {
  const { data } = await http.get("/notifications/rider/me");
  return data;
};

export const fetchAdminNotifications = async () => {
  const { data } = await http.get("/notifications/admin/me");
  return data;
};
