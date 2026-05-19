import http from "./http";

export const fetchProducts = async (params) => {
  const { data } = await http.get("/products", { params });
  return data;
};

export const fetchProduct = async (productId) => {
  const { data } = await http.get(`/products/${productId}`);
  return data;
};

export const fetchProductReviews = async (productId) => {
  const { data } = await http.get(`/products/${productId}/reviews`);
  return data;
};

export const createProductReview = async ({ productId, ...payload }) => {
  const { data } = await http.post(`/products/${productId}/reviews`, payload);
  return data;
};

export const updateProductReview = async ({ productId, reviewId, ...payload }) => {
  const { data } = await http.patch(`/products/${productId}/reviews/${reviewId}`, payload);
  return data;
};
