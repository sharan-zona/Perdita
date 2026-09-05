import axios from "axios";

// baseURL is relative because vite.config.js proxies /api to the
// FastAPI backend in dev. In production this gets served from the
// same origin (or swap this for an env var if frontend/backend are
// deployed separately).
const api = axios.create({
  baseURL: "/api",
});

// Attach the JWT to every request automatically, so components never
// have to remember to do it themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("perdita_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;