import axios from "axios";

export const getActiveBackendUrl = () => {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("meditracker_backend_url");
    if (custom) return custom.trim().replace(/\/+$/, "");
  }

  // On Vercel, requests to /api are proxied same-origin via vercel.json rewrites, bypassing all CORS/mixed-content restrictions
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

// Attach dynamic baseURL and token automatically
API.interceptors.request.use(
  (req) => {
    const backendUrl = getActiveBackendUrl();
    req.baseURL = backendUrl ? `${backendUrl}/api` : "/api";

    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
