import axios from "axios";

import { useAuthStore } from "../store/authStore";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
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
