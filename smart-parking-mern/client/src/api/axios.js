import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// attach token automatically, but never override an Authorization header
// that a caller has already set explicitly (e.g. the Admin panel passes
// its own admin token per-request)
api.interceptors.request.use((config) => {
  if (config.headers?.Authorization) return config;
  const token = localStorage.getItem("spb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;