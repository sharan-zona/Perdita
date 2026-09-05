import { useState } from "react";
import "./SearchBar.css";

// Controlled if `value`/`onChange` are passed (e.g. live-filtering on
// the Browse page); otherwise manages its own state and only reports
// out via onSearch, which is enough for the homepage hero search.
function SearchBar({ value, onChange, onSearch, placeholder = "Search items…" }) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  function handleChange(e) {
    const next = e.target.value;
    if (isControlled) {
      onChange?.(next);
    } else {
      setInternalValue(next);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSearch?.(currentValue.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search lost and found items"
      />
      <button type="submit">Search</button>
    </form>
  );
}

export default SearchBar;