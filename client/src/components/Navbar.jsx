import { Link } from "react-router-dom";
import "./Navbar.css";

// Auth-aware nav (showing Login vs Profile/Logout) arrives in Phase 10
// once AuthContext exists. For now it always shows the logged-out state.
function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          Perdita
        </Link>

        <nav className="navbar__links">
          <Link to="/">Home</Link>
          <Link to="/items">Browse</Link>
          <Link to="/report/lost">Report lost</Link>
          <Link to="/report/found">Report found</Link>
        </nav>

        <div className="navbar__actions">
          <Link to="/login" className="navbar__login">
            Log in
          </Link>
          <Link to="/register" className="navbar__signup">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;