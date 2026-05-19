import http from "./http";

export const fetchNotificationFeed = async (params = {}) => {
  const { data } = await http.get("/notifications/feed", { params });
  return data;
};

export const fetchNotificationUnreadCount = async () => {
  const { data } = await http.get("/notifications/unread-count");
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await http.patch(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await http.patch("/notifications/read-all");
  return data;
};

export const clearNotifications = async () => {
  const { data } = await http.delete("/notifications/clear");
  return data;
};

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
