import http from "./http";

export const registerUser = async (payload) => {
  const { data } = await http.post("/auth/register", payload);
  return data;
};

export const unifiedSignup = async (payload) => {
  const { data } = await http.post("/auth/unified-signup", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await http.post("/auth/login", payload);
  return data;
};

export const unifiedLogin = async (payload) => {
  const { data } = await http.post("/auth/unified-login", payload);
  return data;
};

export const forgotUserPassword = async (payload) => {
  const { data } = await http.post("/auth/forgot-password", payload);
  return data;
};

export const resetUserPassword = async (payload) => {
  const { data } = await http.post("/auth/reset-password", payload);
  return data;
};

export const fetchProfile = async () => {
  const { data } = await http.get("/user/me");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await http.patch("/user/me", payload);
  return data;
};

export const createAddress = async (payload) => {
  const { data } = await http.post("/user/addresses", payload);
  return data;
};

export const registerVendor = async (payload) => {
  const { data } = await http.post("/auth/vendor/register", payload);
  return data;
};

export const loginVendor = async (payload) => {
  const { data } = await http.post("/auth/vendor/login", payload);
  return data;
};

export const forgotVendorPassword = async (payload) => {
  const { data } = await http.post("/auth/vendor/forgot-password", payload);
  return data;
};

export const resetVendorPassword = async (payload) => {
  const { data } = await http.post("/auth/vendor/reset-password", payload);
  return data;
};

export const completeVendorOnboarding = async (payload) => {
  const { data } = await http.post("/auth/vendor/onboarding", payload);
  return data;
};

export const loginWithGoogle = async (payload) => {
  const { data } = await http.post("/auth/oauth/google", { token: payload });
  return data;
};

export const loginWithApple = async (payload) => {
  const { data } = await http.post("/auth/oauth/apple", payload);
  return data;
};
