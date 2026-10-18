const ROOT = import.meta.env.VITE_API_URL || "";
const KEY = "ledger_session";
const BASE = "/api/expenses";

export const session = {
  get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } },
  set(s) { localStorage.setItem(KEY, JSON.stringify(s)); },
  clear() { localStorage.removeItem(KEY); },
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(path, options = {}) {
  const s = session.get();
  let res;
  try {
    res = await fetch(`${ROOT}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(s?.token ? { Authorization: `Bearer ${s.token}` } : {}) },
    });
  } catch {
    throw new Error("Can't reach the server. Start the Spring Boot backend.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && s?.token && !path.startsWith("/api/auth/login")) onUnauthorized();
    const err = new Error(data?.message || "Something went wrong. Try again.");
    err.fields = data?.errors || {};
    throw err;
  }
  return data;
}

const send = (method, body) => ({ method, body: JSON.stringify(body) });

// auth
export const register = (body) => request("/api/auth/register", send("POST", body));
export const login = (body) => request("/api/auth/login", send("POST", body));
export const me = () => request("/api/auth/me");
export const logout = () => request("/api/auth/logout", { method: "POST" });

// expenses (always for the logged-in user)
export const getExpenses = (category) =>
  request(category && category !== "All" ? `${BASE}?category=${encodeURIComponent(category)}` : BASE);
export const getSummary = () => request(`${BASE}/summary`);
export const createExpense = (body) => request(BASE, send("POST", body));
export const updateExpense = (id, body) => request(`${BASE}/${id}`, send("PUT", body));
export const deleteExpense = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
