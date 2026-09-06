import api from "./api.js";

// "Reports" here means abuse/suspicious-listing reports (section 13),
// not lost/found item reports — those are itemService.
export const reportService = {
  async createReport({ itemId, reason, description }) {
    const { data } = await api.post("/reports", {
      item_id: itemId, reason, description,
    });
    return data;
  },

  async getReports(params = {}) {
    const { data } = await api.get("/reports", { params });
    return data;
  },

  async updateReport(id, status) {
    const { data } = await api.put(`/reports/${id}`, { status });
    return data;
  },
};