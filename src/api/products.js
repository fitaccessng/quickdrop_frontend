import http from "./http";

export const fetchProducts = async (params) => {
  const { data } = await http.get("/products", { params });
  return data;
};
