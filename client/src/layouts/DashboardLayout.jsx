import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./DashboardLayout.css";

function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dash-layout">
      <aside className="dash-layout__sidebar">
        <NavLink to="/" className="dash-layout__brand">Perdita</NavLink>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/claims">Claims</NavLink>
          <NavLink to="/matches">Matches</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <button className="dash-layout__logout" onClick={logout}>Log out</button>
      </aside>

      <main className="dash-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;