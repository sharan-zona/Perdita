import "./StatusBadge.css";

// Renders the item lifecycle status (not lost/found type — that's
// the existing .badge--lost/--found pill used on cards). This one
// covers the full status enum from sections 4 & 5 of the spec:
// LOST, FOUND, CLAIMED, RETURNED, CLOSED.

const STATUS_CONFIG = {
  LOST: { label: "Lost", className: "status-badge--lost" },
  FOUND: { label: "Found", className: "status-badge--found" },
  CLAIMED: { label: "Claimed", className: "status-badge--claimed" },
  RETURNED: { label: "Returned", className: "status-badge--returned" },
  CLOSED: { label: "Closed", className: "status-badge--closed" },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    // Fail loudly in dev rather than silently rendering nothing —
    // an unrecognized status usually means the backend enum and
    // frontend fell out of sync.
    console.warn(`StatusBadge: unrecognized status "${status}"`);
    return <span className="status-badge status-badge--unknown">{status}</span>;
  }

  return (
    <span className={`status-badge ${config.className}`}>{config.label}</span>
  );
}

export default StatusBadge;