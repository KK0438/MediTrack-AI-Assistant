import axios from "axios";

export const getActiveBackendUrl = () => {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("meditracker_backend_url");
    if (custom) return custom.trim().replace(/\/+$/, "");
  }

  const isHttpsOrVercel =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vercel.app") || window.location.protocol === "https:");

  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && envUrl.trim()) {
    const cleaned = envUrl.trim().replace(/\/+$/, "");
    // If running on HTTPS (like Vercel), reject insecure http:// endpoints to prevent Mixed Content blocking
    if (!isHttpsOrVercel || cleaned.startsWith("https://")) {
      return cleaned;
    }
  }

  // Fallback for Vercel/HTTPS deployment
  if (isHttpsOrVercel) {
    return "https://jump-poems-level-told.trycloudflare.com";
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
