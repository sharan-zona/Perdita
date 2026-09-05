import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./Matches.css";

// Depends on the rule-based matching service from section 11 exposing
// GET /api/matches — returning { id, score, myItem, matchedItem } pairs.
// Not part of the API list in section 16 yet; needs adding in Phase 8.
function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/matches");
      setMatches(data);
    } catch {
      setError("Couldn't load matches. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner label="Finding matches…" />;

  if (error) {
    return (
      <div className="matches-page__state">
        <p>{error}</p>
        <button className="btn btn--accent" onClick={load}>Try again</button>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <h1>Possible matches</h1>

      {matches.length === 0 ? (
        <div className="matches-page__state">
          <p>No possible matches yet.</p>
          <p className="matches-page__state-sub">
            Perdita checks every new report against your open items automatically —
            check back soon.
          </p>
          <Link to="/dashboard" className="btn btn--accent">Back to dashboard</Link>
        </div>
      ) : (
        <ul className="match-list">
          {matches.map((m) => (
            <li key={m.id} className="match-card">
              <div className="match-card__score">{m.score}%</div>
              <div className="match-card__body">
                <p className="match-card__label">Your report</p>
                <Link to={`/items/${m.myItem.id}`} className="match-card__title">
                  {m.myItem.title}
                </Link>
                <p className="match-card__label match-card__label--found">
                  Possibly {m.matchedItem.type === "found" ? "found" : "lost"} near {m.matchedItem.location}
                </p>
                <Link to={`/items/${m.matchedItem.id}`} className="match-card__title">
                  {m.matchedItem.title}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Matches;