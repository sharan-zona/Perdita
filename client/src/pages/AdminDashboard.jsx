import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./AdminDashboard.css";

// Assumes `user.role === "admin"` — this field does NOT exist in the
// Phase 1 User model spec (section 3 lists id/name/email/password_hash/
// phone/created_at/updated_at/is_active only). Add `role` or `is_admin`
// to the backend User model before this check means anything, and gate
// the underlying /api/admin/* routes server-side regardless — a client
// check alone does not stop someone from calling the API directly.
function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || user?.role !== "admin") return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, usersRes, reportsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/reports"),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setReports(reportsRes.data);
      } catch {
        setError("Couldn't load admin data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authLoading, user]);

  async function handleDisableUser(userId) {
    if (!window.confirm("Disable this user's account?")) return;
    await api.patch(`/admin/users/${userId}`, { is_active: false });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u)));
  }

  async function handleResolveReport(reportId, status) {
    await api.put(`/reports/${reportId}`, { status });
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
  }

  if (authLoading) return <LoadingSpinner label="Checking permissions…" />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (loading) return <LoadingSpinner label="Loading admin dashboard…" />;

  if (error) {
    return (
      <div className="admin-page__state">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Admin dashboard</h1>

      <div className="admin-stats">
        <div className="admin-stat"><span>{stats.totalUsers}</span><label>Total users</label></div>
        <div className="admin-stat"><span>{stats.totalLostItems}</span><label>Lost items</label></div>
        <div className="admin-stat"><span>{stats.totalFoundItems}</span><label>Found items</label></div>
        <div className="admin-stat"><span>{stats.totalClaims}</span><label>Total claims</label></div>
        <div className="admin-stat"><span>{stats.pendingReports}</span><label>Pending reports</label></div>
        <div className="admin-stat"><span>{stats.returnedItems}</span><label>Returned items</label></div>
      </div>

      <section className="admin-section">
        <h2>Suspicious activity reports</h2>
        {reports.length === 0 ? (
          <p className="admin-section__empty">No reports to review.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Item</th><th>Reason</th><th>Reported by</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.itemTitle}</td>
                  <td>{r.reason}</td>
                  <td>{r.reportedByName}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.status === "PENDING" && (
                      <div className="admin-table__actions">
                        <button onClick={() => handleResolveReport(r.id, "RESOLVED")}>Resolve</button>
                        <button onClick={() => handleResolveReport(r.id, "DISMISSED")}>Dismiss</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-section">
        <h2>Users</h2>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.is_active ? "Active" : "Disabled"}</td>
                <td>
                  {u.is_active && (
                    <button onClick={() => handleDisableUser(u.id)}>Disable</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AdminDashboard;