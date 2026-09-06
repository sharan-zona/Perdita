import api from "./api.js";
import { CATEGORIES } from "../utils/constants.js";

// Section 6 says categories should live in the database, not be
// hardcoded — but no GET /api/categories endpoint exists yet (it's
// missing from the section 16 API list too). Until it's added, this
// falls back to the static list in constants.js so the UI keeps
// working. Once the endpoint exists, remove the fallback entirely
// rather than leaving two sources of truth.
export const categoryService = {
  async getCategories() {
    try {
      const { data } = await api.get("/categories");
      return data;
    } catch {
      return CATEGORIES;
    }
  },
};