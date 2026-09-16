import http from "./http";
import { asArray } from "../lib/utils";

export const fetchVendors = async (params) => {
  const { data } = await http.get("/vendors", { params });
  return asArray(data, "items", "vendors");
};

export const fetchVendor = async (id) => {
  const { data } = await http.get(`/vendors/${id}`);
  return data;
};
