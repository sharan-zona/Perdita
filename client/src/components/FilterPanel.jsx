import "./FilterPanel.css";

// `categories` is injected as a prop rather than fetched here — this
// component should stay presentation-only. The Browse Items page
// (Phase 11) owns fetching /api/categories and lifting filter state.
const DEFAULT_CATEGORIES = [
  "Electronics", "Documents", "ID Cards", "Wallets", "Keys",
  "Bags", "Books", "Clothing", "Accessories", "Jewellery", "Other",
];

const STATUSES = ["LOST", "FOUND", "CLAIMED", "RETURNED", "CLOSED"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "updated", label: "Recently updated" },
];

function FilterPanel({ filters, onChange, categories = DEFAULT_CATEGORIES }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="filter-panel">
      <div className="filter-panel__group" role="radiogroup" aria-label="Item type">
        <span className="filter-panel__label">Type</span>
        <div className="filter-panel__toggle">
          {["all", "lost", "found"].map((t) => (
            <button
              key={t}
              type="button"
              className={filters.type === t ? "is-active" : ""}
              onClick={() => update("type", t)}
            >
              {t === "all" ? "All" : t === "lost" ? "Lost" : "Found"}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-panel__group">
        <label className="filter-panel__label" htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={filters.category || ""}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="filter-panel__group">
        <label className="filter-panel__label" htmlFor="filter-location">Location</label>
        <input
          id="filter-location"
          type="text"
          value={filters.location || ""}
          placeholder="e.g. Library"
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      <div className="filter-panel__group">
        <label className="filter-panel__label" htmlFor="filter-date">Date</label>
        <input
          id="filter-date"
          type="date"
          value={filters.date || ""}
          onChange={(e) => update("date", e.target.value)}
        />
      </div>

      <div className="filter-panel__group">
        <label className="filter-panel__label" htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          value={filters.status || ""}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="filter-panel__group">
        <label className="filter-panel__label" htmlFor="filter-sort">Sort by</label>
        <select
          id="filter-sort"
          value={filters.sort || "newest"}
          onChange={(e) => update("sort", e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="filter-panel__reset"
        onClick={() => onChange({ type: "all", sort: "newest" })}
      >
        Reset filters
      </button>
    </div>
  );
}

export default FilterPanel;