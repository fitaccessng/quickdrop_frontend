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
        token = parsed.state?.token;
      }
    } catch (e) {
      // localStorage parsing failed, continue without token
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
