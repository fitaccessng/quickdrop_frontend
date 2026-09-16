import http from "./http";

export const fetchVendors = async (params) => {
  const { data } = await http.get("/vendors", { params });
  return Array.isArray(data) ? data : data?.items ?? data?.vendors ?? [];
};

export const fetchVendor = async (id) => {
  const { data } = await http.get(`/vendors/${id}`);
  return data;
};
