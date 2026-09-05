import { Navigate, useLocation } from "react-router-dom";

// Interim implementation: checks for a JWT directly in localStorage.
// Once Phase 10 builds AuthContext (with real login state, user info,
// and token refresh), swap the check below for `const { token } = useAuth()`
// — the redirect logic and JSX here won't need to change.
function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("perdita_token");

  if (!token) {
    // Preserve where the user was headed so login can send them back.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;