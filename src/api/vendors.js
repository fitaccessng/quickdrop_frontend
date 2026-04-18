import http from "./http";

export const fetchVendors = async (params) => {
  const { data } = await http.get("/vendors", { params });
  return data;
};

export const fetchVendor = async (id) => {
  const { data } = await http.get(`/vendors/${id}`);
  return data;
};
