import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { CATEGORIES } from "../utils/constants.js";
import "./ReportForm.css";

const MAX_IMAGE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ReportForm({ type, title, subtitle, dateLabel, locationLabel }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", category: "", location: "",
    date: "", time: "", additional_details: "",
  });
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) {
      setImage(null);
      setImageError(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Please upload a JPEG, PNG, or WebP image.");
      setImage(null);
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_IMAGE_MB}MB.`);
      setImage(null);
      return;
    }
    setImageError(null);
    setImage(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = new FormData();
    payload.append("type", type);
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (image) payload.append("image", image);

    try {
      const { data } = await api.post("/items", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/items/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="report-page">
      <form className="report-form" onSubmit={handleSubmit}>
        <h1>{title}</h1>
        <p className="report-form__sub">{subtitle}</p>

        {error && <div className="report-form__error" role="alert">{error}</div>}

        <label htmlFor="title">Item title</label>
        <input
          id="title" name="title" required
          placeholder="e.g. Black leather wallet"
          value={form.title} onChange={handleChange}
        />

        <label htmlFor="category">Category</label>
        <select id="category" name="category" required value={form.category} onChange={handleChange}>
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label htmlFor="location">{locationLabel}</label>
        <input
          id="location" name="location" required
          placeholder="e.g. Main Library, 2nd floor"
          value={form.location} onChange={handleChange}
        />

        <div className="report-form__row">
          <div>
            <label htmlFor="date">{dateLabel}</label>
            <input id="date" name="date" type="date" required value={form.date} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="time">Time (optional)</label>
            <input id="time" name="time" type="time" value={form.time} onChange={handleChange} />
          </div>
        </div>

        <label htmlFor="description">Description</label>
        <textarea
          id="description" name="description" required rows={4}
          placeholder="Color, brand, distinguishing features…"
          value={form.description} onChange={handleChange}
        />

        <label htmlFor="additional_details">Additional details (optional)</label>
        <textarea
          id="additional_details" name="additional_details" rows={3}
          value={form.additional_details} onChange={handleChange}
        />

        <label htmlFor="image">Photo (optional)</label>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
        {imageError && <p className="report-form__field-error">{imageError}</p>}

        <button type="submit" className="btn btn--accent" disabled={submitting}>
          {submitting ? "Submitting…" : `Submit ${type === "lost" ? "lost" : "found"} report`}
        </button>
      </form>
    </div>
  );
}

export default ReportForm;