import api from "./api.js";

export const userService = {
  async getProfile() {
    const { data } = await api.get("/users/me");
    return data;
  },

  async updateProfile({ name, email, phone }) {
    const { data } = await api.put("/users/me", { name, email, phone });
    return data;
  },
};