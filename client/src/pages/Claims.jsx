import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./Claims.css";

// Claims received on items *I* reported — where I act as approver.
// (Claims *I've* submitted on others' items are shown on Dashboard.)
function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/claims", { params: { role: "owner" } });
      setClaims(data);
    } catch {
      setError("Couldn't load claims. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDecision(claimId, status) {
    setActioningId(claimId);
    try {
      await api.put(`/claims/${claimId}`, { status });
      await load();
    } finally {
      setActioningId(null);
    }
  }

  if (loading) return <LoadingSpinner label="Loading claims…" />;

  if (error) {
    return (
      <div className="claims-page__state">
        <p>{error}</p>
        <button className="btn btn--accent" onClick={load}>Try again</button>
      </div>
    );
  }

  return (
    <div className="claims-page">
      <h1>Claims on your items</h1>

      {claims.length === 0 ? (
        <div className="claims-page__state">
          <p>No one has claimed any of your reported items yet.</p>
          <Link to="/dashboard" className="btn btn--accent">Back to dashboard</Link>
        </div>
      ) : (
        <ul className="claims-list">
          {claims.map((claim) => (
            <li key={claim.id} className="claim-row">
              <div>
                <Link to={`/items/${claim.item_id}`} className="claim-row__item">
                  {claim.itemTitle}
                </Link>
                <p className="claim-row__message">"{claim.message}"</p>
                <p className="claim-row__meta">
                  From {claim.claimantName} · {new Date(claim.created_at).toLocaleDateString()}
                </p>
              </div>

              {claim.status === "PENDING" ? (
                <div className="claim-row__actions">
                  <button
                    className="btn btn--found"
                    disabled={actioningId === claim.id}
                    onClick={() => handleDecision(claim.id, "APPROVED")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn--lost"
                    disabled={actioningId === claim.id}
                    onClick={() => handleDecision(claim.id, "REJECTED")}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span className={`claim-status claim-status--${claim.status.toLowerCase()}`}>
                  {claim.status}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Claims;