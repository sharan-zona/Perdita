import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api.js";

const AuthContext = createContext(undefined);
const TOKEN_KEY = "perdita_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true); // true while we verify any existing session
  const [error, setError] = useState(null);

  // Don't trust a stored token blindly — validate it against
  // GET /api/auth/me on load and whenever it changes.
  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) setUser(data);
      } catch {
        // Expired or invalid token — clear it rather than leaving
        // the app in a half-authenticated state.
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(data.user ?? null);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.detail || "Login failed. Check your email and password.";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(
    async ({ name, email, password, phone }) => {
      setError(null);
      try {
        await api.post("/auth/register", { name, email, password, phone });
        // POST /api/auth/register doesn't return a token per the API
        // design in section 16, so we chain a login call.
        return login(email, password);
      } catch (err) {
        const message =
          err.response?.data?.detail || "Registration failed. Please try again.";
        setError(message);
        return { success: false, error: message };
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}