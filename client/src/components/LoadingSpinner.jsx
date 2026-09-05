import "./LoadingSpinner.css";

// Used on every API-dependent page per section 26 of the spec.
// `label` is visible text (e.g. "Loading reports…"); it's required
// rather than optional so no page ships a spinner with no context.
function LoadingSpinner({ label = "Loading…" }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="loading-spinner__ring" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;