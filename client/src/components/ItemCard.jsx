import "./StatusBadge.css";

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
    console.warn(`StatusBadge: unrecognized status "${status}"`);
    return <span className="status-badge status-badge--unknown">{status}</span>;
  }

  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}

export default StatusBadge;