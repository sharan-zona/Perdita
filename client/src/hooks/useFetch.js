import { useState, useEffect, useCallback } from "react";

// Generalizes the loading/error/data pattern that's currently
// hand-rolled in BrowseItems, ItemDetails, Dashboard, Claims, Matches,
// and AdminDashboard. `fetcher` should be a stable function (e.g. from
// useCallback) that returns a promise resolving to the data.
//
// Pass `deps` the same way you would to useEffect — the fetch re-runs
// whenever they change.
function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || "Something went wrong. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch };
}

export default useFetch;