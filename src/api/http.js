import axios from "axios";

import { useAuthStore } from "../store/authStore";

export const resolveApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const hasWindow = typeof window !== "undefined";
  const hostname = hasWindow ? window.location.hostname : "";
  const origin = hasWindow ? window.location.origin : "";
  const isLocalFrontend = ["localhost", "127.0.0.1"].includes(hostname);

  if (isLocalFrontend) {
    return "http://localhost:8000";
  }

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (origin) {
    return origin;
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
  } else {
    // Debug: log when no token is found
    const stored = localStorage.getItem("quickdrop-auth");
    if (stored) {
      console.warn("Token not found in auth store or localStorage. Stored data:", stored);
    }
  }
  return config;
});

export default http;
