import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import ItemCard from "../components/ItemCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./Dashboard.css";

const TABS = [
  { key: "lost", label: "My lost reports" },
  { key: "found", label: "My found reports" },
  { key: "claims", label: "My claims" },
  { key: "matches", label: "Possible matches" },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState("lost");
  const [data, setData] = useState({ lost: [], found: [], claims: [], matches: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lostRes, foundRes, claimsRes, matchesRes] = await Promise.all([
        api.get("/items", { params: { mine: true, type: "lost" } }),
        api.get("/items", { params: { mine: true, type: "found" } }),
        api.get("/claims", { params: { mine: true } }),
        api.get("/matches"), // Phase 8 endpoint — see note in intro
      ]);
      setData({
        lost: lostRes.data, found: foundRes.data,
        claims: claimsRes.data, matches: matchesRes.data,
      });
    } catch {
      setError("Couldn't load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(itemId) {
    if (!window.confirm("Delete this report? This can't be undone.")) return;
    await api.delete(`/items/${itemId}`);
    load();
  }

  async function handleStatusChange(itemId, status) {
    await api.put(`/items/${itemId}`, { status });
    load();
  }

  if (loading) return <LoadingSpinner label="Loading your dashboard…" />;

  if (error) {
    return (
      <div className="dashboard__state">
        <p>{error}</p>
        <button className="btn btn--accent" onClick={load}>Try again</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="dashboard__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? "is-active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({data[tab.key].length})
          </button>
        ))}
      </div>

      {(activeTab === "lost" || activeTab === "found") && (
        <>
          {data[activeTab].length === 0 ? (
            <div className="dashboard__empty">
              <p>You haven't reported anything here yet.</p>
              <Link to={`/report/${activeTab}`} className="btn btn--accent">
                Report a {activeTab} item
              </Link>
            </div>
          ) : (
            <div className="dashboard__grid">
              {data[activeTab].map((item) => (
                <div key={item.id} className="dashboard__item">
                  <ItemCard item={item} />
                  <div className="dashboard__item-actions">
                    <Link to={`/items/${item.id}`}>View</Link>
                    {item.status !== "RETURNED" && item.status !== "CLOSED" && (
                      <button onClick={() => handleStatusChange(item.id, "RETURNED")}>
                        Mark returned
                      </button>
                    )}
                    {item.status !== "CLOSED" && (
                      <button onClick={() => handleStatusChange(item.id, "CLOSED")}>
                        Close
                      </button>
                    )}
                    <button className="dashboard__delete" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "claims" && (
        <>
          {data.claims.length === 0 ? (
            <div className="dashboard__empty">
              <p>You don't have any pending claims.</p>
              <Link to="/items" className="btn btn--accent">Browse items</Link>
            </div>
          ) : (
            <ul className="dashboard__claims-list">
              {data.claims.map((claim) => (
                <li key={claim.id}>
                  <Link to={`/items/${claim.item_id}`}>{claim.itemTitle}</Link>
                  <span className={`claim-status claim-status--${claim.status.toLowerCase()}`}>
                    {claim.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/claims" className="dashboard__manage-link">Manage claims on your items →</Link>
        </>
      )}

      {activeTab === "matches" && (
        <>
          {data.matches.length === 0 ? (
            <div className="dashboard__empty">
              <p>No possible matches yet. We'll notify you here when something looks like a fit.</p>
            </div>
          ) : (
            <Link to="/matches" className="btn btn--accent">
              View {data.matches.length} possible match{data.matches.length !== 1 ? "es" : ""}
            </Link>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;