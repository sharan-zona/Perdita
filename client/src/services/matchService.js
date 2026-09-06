import api from "./api.js";

// Depends on GET /api/matches, which is not yet in the section 16 API
// list — needs adding when the matching service (Phase 8) is built.
export const matchService = {
  async getMatches() {
    const { data } = await api.get("/matches");
    return data;
  },
};