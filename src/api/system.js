import http from "./http";

export const fetchServiceCategories = async () => {
  const { data } = await http.get("/service-categories");
  return data;
};

export const fetchDeliverySettings = async () => {
  const { data } = await http.get("/delivery-settings");
  return data;
};
