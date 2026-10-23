import axios from "axios";
import { handleMockRequest } from "./mockService";

export const getActiveBackendUrl = () => {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("meditracker_backend_url");
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, "");
    }
  }

  // On Vercel, if no custom backend URL is configured, use fast in-browser mock engine
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return "";
  }

  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  return "";
};

export const setCustomBackendUrl = (url) => {
  if (typeof window === "undefined") return;
  if (!url || !url.trim()) {
    localStorage.removeItem("meditracker_backend_url");
  } else {
    localStorage.setItem("meditracker_backend_url", url.trim().replace(/\/+$/, ""));
  }
};

const API = axios.create();

// Attach dynamic baseURL, token, and automatic mock adapter when on Vercel without custom backend
API.interceptors.request.use(
  async (config) => {
    const backendUrl = getActiveBackendUrl();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If on Vercel with no custom backend, or in standalone mode, handle directly in-browser
    const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");
    if (isVercel && !backendUrl) {
      config.adapter = async (cfg) => {
        return await handleMockRequest(cfg);
      };
      return config;
    }

    config.baseURL = backendUrl ? `${backendUrl}/api` : "/api";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fallback to in-browser mock engine if the backend is unreachable (502 Bad Gateway, 503, Network Error)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isNetworkError = !error.response;
    const isServerError = [502, 503, 504].includes(error.response?.status);

    if (isNetworkError || isServerError) {
      try {
        console.warn("Backend unavailable or returned error. Falling back to in-browser demo service.", error.message);
        return await handleMockRequest(error.config);
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
