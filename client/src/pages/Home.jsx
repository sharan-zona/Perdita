import { Link } from "react-router-dom";
import "./Home.css";

// Placeholder content below (recentItems, stats, categories) stands in
// for real API data until Phase 6 (item APIs) and Phase 11 (browsing UI)
// are wired up. Structure and markup won't need to change — only the
// data source will, from this static array to a fetch() call.

const recentItems = [
  { id: 1, title: "Black leather wallet", type: "lost", category: "Wallets", location: "Main Library", date: "Sep 3" },
  { id: 2, title: "Silver house keys", type: "found", category: "Keys", location: "Block C Canteen", date: "Sep 3" },
  { id: 3, title: "Blue hydro flask", type: "lost", category: "Other", location: "Sports Complex", date: "Sep 2" },
  { id: 4, title: "College ID — R. Menon", type: "found", category: "ID Cards", location: "Bus Stop 2", date: "Sep 1" },
];

const categories = [
  "Electronics", "Documents", "ID Cards", "Wallets", "Keys",
  "Bags", "Books", "Clothing", "Accessories", "Jewellery",
];

const steps = [
  { n: 1, title: "Report it", body: "Lost something, or found something that isn't yours? File a report in under a minute." },
  { n: 2, title: "Get matched", body: "Perdita compares category, location and description against every open report automatically." },
  { n: 3, title: "Claim and return", body: "Message the other side, verify ownership, and mark the item returned." },
];

const stats = [
  { value: "1,240+", label: "items reported" },
  { value: "68%", label: "returned to owners" },
  { value: "3.2 days", label: "average time to match" },
  { value: "9", label: "campuses using Perdita" },
];

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__copy">
            <h1>
              Most things lost on campus turn up somewhere. They just never find their way back.
            </h1>
            <p className="hero__sub">
              Perdita connects the person who lost something with the person who found
              it — with search, smart matching, and a claim process that actually works.
            </p>

            <form className="hero__search" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Search — “black wallet”, “keys near library”…"
                aria-label="Search lost and found items"
              />
              <button type="submit">Search</button>
            </form>

            <div className="hero__ctas">
              <Link to="/report/lost" className="btn btn--lost">
                I lost something
              </Link>
              <Link to="/report/found" className="btn btn--found">
                I found something
              </Link>
            </div>
          </div>

          <div className="hero__tag" aria-hidden="true">
            <div className="tag">
              <div className="tag__hole" />
              <span className="tag__label">Lost item report</span>
              <h3 className="tag__title">Black leather wallet</h3>
              <dl className="tag__meta">
                <div>
                  <dt>Category</dt>
                  <dd>Wallets</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>Main Library</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className="tag__status">LOST</dd>
                </div>
              </dl>
              <div className="tag__perforation" />
              <p className="tag__match">92% possible match found</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="section__heading">
            <h2>Recently reported</h2>
            <Link to="/items">Browse all →</Link>
          </div>

          <div className="item-grid">
            {recentItems.map((item) => (
              <article key={item.id} className={`item-card item-card--${item.type}`}>
                <div className="item-card__top">
                  <span className={`badge badge--${item.type}`}>
                    {item.type === "lost" ? "Lost" : "Found"}
                  </span>
                  <span className="item-card__date">{item.date}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="item-card__meta">{item.category} · {item.location}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="section__inner">
          <div className="section__heading">
            <h2>Browse by category</h2>
          </div>
          <div className="category-row">
            {categories.map((c) => (
              <Link key={c} to={`/items?category=${c}`} className="category-chip">
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="section__heading">
            <h2>How Perdita works</h2>
          </div>
          <ol className="steps">
            {steps.map((s) => (
              <li key={s.n} className="step">
                <span className="step__number">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--dark">
        <div className="section__inner stats">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <span className="stat__value">{s.value}</span>
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta__inner">
          <h2>Lost something today?</h2>
          <p>It takes less time to report it than to keep looking.</p>
          <Link to="/report/lost" className="btn btn--accent">
            Report a lost item
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;