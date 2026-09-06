import api from "./api.js";

export const adminService = {
  async getStats() {
    const { data } = await api.get("/admin/stats");
    return data;
  },

  async getUsers() {
    const { data } = await api.get("/admin/users");
    return data;
  },

  async setUserActive(userId, isActive) {
    const { data } = await api.patch(`/admin/users/${userId}`, { is_active: isActive });
    return data;
  },
};