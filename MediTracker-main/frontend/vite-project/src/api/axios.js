import axios from "axios";
import { handleMockRequest } from "./mockService";

export const getActiveBackendUrl = () => {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("meditracker_backend_url");
    if (custom && custom.trim()) {
      const cleaned = custom.trim().replace(/\/+$/, "");
      // Don't treat same-origin vercel.app as an external backend to prevent 405/502 loops
      if (!cleaned.includes("vercel.app")) {
        return cleaned;
      }
    }
  }

  // On Vercel, default to in-browser standalone engine
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
  if (!url || !url.trim() || url.includes("vercel.app")) {
    localStorage.removeItem("meditracker_backend_url");
  } else {
    localStorage.setItem("meditracker_backend_url", url.trim().replace(/\/+$/, ""));
  }
};

const API = axios.create();

// Attach dynamic baseURL, token, and automatic in-browser adapter
API.interceptors.request.use(
  async (config) => {
    const backendUrl = getActiveBackendUrl();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

    // If on Vercel without an external tunnel, or in standalone mode, serve in-browser
    if (!backendUrl || (isVercel && (!backendUrl || backendUrl.includes("vercel.app")))) {
      config.adapter = async (cfg) => {
        return await handleMockRequest(cfg);
      };
      return config;
    }

    config.baseURL = `${backendUrl}/api`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback to in-browser mock engine if the external backend is unreachable or returns 404/405/500/502/503/504
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const isNetworkError = !error.response;
    const isServerDead = !status || [404, 405, 500, 502, 503, 504].includes(status);

    if (isNetworkError || isServerDead) {
      console.warn("Backend unavailable (status: " + (status || "Network Error") + "). Using in-browser service.");
      try {
        return await handleMockRequest(error.config);
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
