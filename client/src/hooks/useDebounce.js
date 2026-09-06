import { useState, useEffect } from "react";

// Delays updating the returned value until `value` has stopped
// changing for `delayMs`. Replaces the manual setTimeout/clearTimeout
// currently written inline in BrowseItems.jsx for the search query.
function useDebounce(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

export default useDebounce;