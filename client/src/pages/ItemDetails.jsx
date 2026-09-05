import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./ItemDetails.css";

function ItemDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [claimOpen, setClaimOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/items/${id}`);
        if (!cancelled) setItem(data);
      } catch {
        if (!cancelled) setError("This item couldn't be loaded. It may have been removed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function handleClaimSubmit(e) {
    e.preventDefault();
    setClaimSubmitting(true);
    try {
      await api.post("/claims", { item_id: item.id, message: claimMessage });
      setClaimResult({ ok: true, message: "Claim submitted. The reporter will review it." });
      setClaimOpen(false);
    } catch (err) {
      setClaimResult({
        ok: false,
        message: err.response?.data?.detail || "Couldn't submit your claim. Please try again.",
      });
    } finally {
      setClaimSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading item…" />;
  if (error) {
    return (
      <div className="item-details__state">
        <p>{error}</p>
        <Link to="/items" className="btn btn--accent">Back to browse</Link>
      </div>
    );
  }
  if (!item) return null;

  const isOwner = user?.id === item.reporter_id;
  const canClaim = isAuthenticated && !isOwner && ["LOST", "FOUND"].includes(item.status);

  return (
    <div className="item-details">
      <Link to="/items" className="item-details__back">← Back to browse</Link>

      <div className="item-details__layout">
        <div className="item-details__image">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} />
          ) : (
            <div className="item-details__image-placeholder">{item.category?.[0] ?? "?"}</div>
          )}
        </div>

        <div className="item-details__info">
          <div className="item-details__badges">
            <span className={`badge badge--${item.type}`}>
              {item.type === "lost" ? "Lost" : "Found"}
            </span>
            <StatusBadge status={item.status} />
          </div>

          <h1>{item.title}</h1>
          <p className="item-details__meta">
            {item.category} · {item.location} · {item.date}
          </p>

          <p className="item-details__description">{item.description}</p>

          {item.additional_details && (
            <p className="item-details__additional">{item.additional_details}</p>
          )}

          {/* Only the reporter's name is shown — not email/phone — per
              section 9's "do not expose unnecessary private information".
              Real contact happens after a claim is approved. */}
          {item.reporterName && (
            <p className="item-details__reporter">Reported by {item.reporterName}</p>
          )}

          <div className="item-details__actions">
            {isOwner && (
              <Link to="/dashboard" className="btn btn--found">Manage this report</Link>
            )}

            {!isOwner && !isAuthenticated && (
              <Link to="/login" state={{ from: { pathname: `/items/${id}` } }} className="btn btn--accent">
                Log in to claim this item
              </Link>
            )}

            {canClaim && (
              <button className="btn btn--accent" onClick={() => setClaimOpen(true)}>
                This is mine — claim it
              </button>
            )}

            <Link to="/reports" state={{ itemId: item.id }} className="item-details__report-link">
              Report this listing
            </Link>
          </div>

          {claimResult && (
            <p className={claimResult.ok ? "item-details__success" : "item-details__error"}>
              {claimResult.message}
            </p>
          )}
        </div>
      </div>

      {claimOpen && (
        <div className="modal-backdrop" onClick={() => setClaimOpen(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleClaimSubmit}
          >
            <h2>Claim this item</h2>
            <p className="modal__sub">
              Describe something that proves it's yours — a unique mark, contents, or where exactly you lost it.
            </p>
            <textarea
              required
              rows={4}
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              placeholder="e.g. It has a small tear in the front pocket and my student ID inside."
            />
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setClaimOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--accent" disabled={claimSubmitting}>
                {claimSubmitting ? "Submitting…" : "Submit claim"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ItemDetails;