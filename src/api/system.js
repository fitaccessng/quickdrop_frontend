import http from "./http";
import { asArray } from "../lib/utils";

export const fetchServiceCategories = async () => {
  const { data } = await http.get("/service-categories");
  return asArray(data, "items", "categories");
};

export const fetchServiceCategoryOverview = async () => {
  const { data } = await http.get("/service-categories/overview");
  return data;
};

export const fetchDeliverySettings = async () => {
  const { data } = await http.get("/delivery-settings");
  return data;
};
