import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import "./Profile.css";

function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
    }
  }, [user]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await api.put("/users/me", form);
      setStatus({ ok: true, message: "Profile updated." });
    } catch (err) {
      setStatus({
        ok: false,
        message: err.response?.data?.detail || "Couldn't save changes. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" required value={form.name} onChange={handleChange} />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />

        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />

        {status && (
          <p className={status.ok ? "profile-form__success" : "profile-form__error"}>
            {status.message}
          </p>
        )}

        <button type="submit" className="btn btn--accent" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default Profile;