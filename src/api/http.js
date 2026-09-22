import axios from "axios";

import { useAuthStore } from "../store/authStore";

const PRODUCTION_API_BASE_URL = "https://quickdropbackend-production-6ba4.up.railway.app";

export const resolveApiBaseUrl = () => {
  const isNativeBuild = import.meta.env.VITE_NATIVE_APP === "true";
  const configuredBaseUrl = (
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL
  )?.trim();
  const hasWindow = typeof window !== "undefined";
  const hostname = hasWindow ? window.location.hostname : "";
  const origin = hasWindow ? window.location.origin : "";
  const isLocalFrontend = ["localhost", "127.0.0.1"].includes(hostname);

  if (configuredBaseUrl) {
    const normalizedBaseUrl = /^https?:\/\//i.test(configuredBaseUrl)
      ? configuredBaseUrl.replace(/\/$/, "")
      : `https://${configuredBaseUrl}`;
    if (isNativeBuild && !normalizedBaseUrl.startsWith("https://")) {
      throw new Error("Native production builds require an HTTPS API URL.");
    }
    return normalizedBaseUrl;
  }

  if (isNativeBuild) {
    throw new Error("Native production builds require VITE_API_BASE_URL.");
  }

  if (isLocalFrontend) {
    return "http://localhost:8000";
  }

  if (origin) {
    return PRODUCTION_API_BASE_URL;
  }

  return "http://localhost:8000";
};

const http = axios.create({
  baseURL: resolveApiBaseUrl(),
});

http.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token;
  
  // Fallback to localStorage if store hasn't hydrated yet
  if (!token) {
    try {
      const stored = localStorage.getItem("quickdrop-auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle both the nested state structure and direct token
        token = parsed.state?.token || parsed.token;
      }
    } catch (e) {
      console.error("Failed to parse auth from localStorage:", e);
      // localStorage parsing failed, continue without token
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const { token, accountType, clearSession } = useAuthStore.getState();

    if (status === 401 && token && !requestUrl.includes("/auth/")) {
      clearSession();
      localStorage.removeItem("quickdrop-auth");
      if (typeof window !== "undefined") {
        const route = accountType === "vendor" ? "/vendor/login" : accountType === "rider" ? "/rider/login" : accountType === "admin" ? "/admin/login" : "/login";
        window.location.hash = route;
      }
    }

    return Promise.reject(error);
  },
);

export default http;
