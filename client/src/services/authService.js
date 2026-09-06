import api from "./api.js";

export const authService = {
  async register({ name, email, password, phone }) {
    const { data } = await api.post("/auth/register", { name, email, password, phone });
    return data;
  },

  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    return data; // { access_token, user }
  },

  async getCurrentUser() {
    const { data } = await api.get("/auth/me");
    return data;
  },
};