import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import SearchBar from "../components/SearchBar.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import ItemCard from "../components/ItemCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./BrowseItems.css";

function BrowseItems() {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    type: "all",
    category: searchParams.get("category") || "",
    location: "",
    date: "",
    status: "",
    sort: "newest",
  });
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        q: query || undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        category: filters.category || undefined,
        location: filters.location || undefined,
        date: filters.date || undefined,
        status: filters.status || undefined,
        sort: filters.sort,
      };
      const { data } = await api.get("/items", { params });
      setItems(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  // Debounce the search query specifically, so we don't re-fetch on
  // every keystroke — filters (dropdowns) can fetch immediately.
  useEffect(() => {
    const timeout = setTimeout(fetchItems, 350);
    return () => clearTimeout(timeout);
  }, [fetchItems]);

  return (
    <div className="browse-page">
      <div className="browse-page__header">
        <h1>Browse items</h1>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={setQuery}
          placeholder="Search by name, description, or location…"
        />
      </div>

      <div className="browse-page__body">
        <aside className="browse-page__filters">
          <FilterPanel filters={filters} onChange={setFilters} />
        </aside>

        <section className="browse-page__results">
          {loading && <LoadingSpinner label="Loading items…" />}

          {!loading && error && (
            <div className="browse-page__state">
              <p>{error}</p>
              <button className="btn btn--accent" onClick={fetchItems}>Try again</button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="browse-page__state">
              <p>No items match your search yet.</p>
              <p className="browse-page__state-sub">
                Try clearing a filter, or check back later — new reports come in daily.
              </p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="browse-page__grid">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default BrowseItems;