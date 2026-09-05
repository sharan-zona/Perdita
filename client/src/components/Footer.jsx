import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">Perdita</span>
          <p>Find what was lost. Return what was found.</p>
        </div>

        <div className="footer__col">
          <h3>Platform</h3>
          <Link to="/items">Browse items</Link>
          <Link to="/report/lost">Report lost</Link>
          <Link to="/report/found">Report found</Link>
        </div>

        <div className="footer__col">
          <h3>Account</h3>
          <Link to="/login">Log in</Link>
          <Link to="/register">Sign up</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        <div className="footer__col">
          <h3>Support</h3>
          <Link to="/reports">Report an issue</Link>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} Perdita</span>
      </div>
    </footer>
  );
}

export default Footer;