import api from "./api.js";

export const itemService = {
  // params: { q, type, category, location, date, status, sort, mine }
  async getItems(params = {}) {
    const { data } = await api.get("/items", { params });
    return data;
  },

  async getItem(id) {
    const { data } = await api.get(`/items/${id}`);
    return data;
  },

  // formData must include: type, title, description, category, location,
  // date, time, additional_details, and optionally image (multipart).
  async createItem(formData) {
    const { data } = await api.post("/items", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async updateItem(id, updates) {
    const { data } = await api.put(`/items/${id}`, updates);
    return data;
  },

  async deleteItem(id) {
    await api.delete(`/items/${id}`);
  },
};