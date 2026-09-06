import api from "./api.js";

export const claimService = {
  async createClaim({ itemId, message, proof }) {
    const { data } = await api.post("/claims", { item_id: itemId, message, proof });
    return data;
  },

  // role: "mine" (claims I submitted) | "owner" (claims on my items)
  async getClaims(params = {}) {
    const { data } = await api.get("/claims", { params });
    return data;
  },

  async updateClaim(id, status) {
    const { data } = await api.put(`/claims/${id}`, { status });
    return data;
  },
};