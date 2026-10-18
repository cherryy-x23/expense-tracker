import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

const CATS = {
  Food: { icon: "🍜", color: "#ff7a1a" },
  Travel: { icon: "🚆", color: "#2f8cff" },
  Shopping: { icon: "🛍️", color: "#b146e0" },
  Bills: { icon: "💡", color: "#f2b200" },
  Health: { icon: "💊", color: "#ef3f4f" },
  Other: { icon: "📦", color: "#5f7d8a" },
};
const NAMES = Object.keys(CATS);
const catOf = (c) => CATS[c] || CATS.Other;

const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const emptyForm = () => ({ title: "", amount: "", category: "Food", date: todayStr() });
const money = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function validate(f) {
  const e = {};
  if (!f.title.trim()) e.title = "Enter a title";
  if (f.amount === "" || Number(f.amount) <= 0) e.amount = "Amount must be greater than 0";
  if (!f.date) e.date = "Pick a date";
  return e;
}

export default function Dashboard({ user, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0, byCategory: {} });
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const notify = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const [list, sum] = await Promise.all([api.getExpenses(filter), api.getSummary()]);
      setExpenses(list);
      setSummary(sum);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const reset = () => { setForm(emptyForm()); setEditingId(null); setErrors({}); };
  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      const body = { ...form, title: form.title.trim(), amount: Number(form.amount) };
      if (editingId) { await api.updateExpense(editingId, body); notify("success", "Expense updated"); }
      else { await api.createExpense(body); notify("success", "Expense added"); }
      reset();
      await load();
    } catch (e) {
      setErrors(e.fields || {});
      notify("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (x) => {
    setEditingId(x.id);
    setForm({ title: x.title, amount: String(x.amount), category: x.category, date: x.date });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async () => {
    const id = confirm.id;
    setConfirm(null);
    try {
      await api.deleteExpense(id);
      if (editingId === id) reset();
      notify("success", "Expense deleted");
      await load();
    } catch (e) {
      notify("error", e.message);
    }
  };

  const entries = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  const filteredTotal = expenses.reduce((s, x) => s + Number(x.amount), 0);

  return (
    <div className="page">
      <nav className="wrap nav">
        <a className="brand" href="#/">💰 Rupee Ledger</a>
        <div className="nav-links">
          <span className="hello">Hi, {user.name.split(" ")[0]}</span>
          <button className="btn small" onClick={onLogout}>Log out</button>
        </div>
      </nav>

      <section className="wrap summary">
        <div className="card total-card">
          <p className="muted">Total spent</p>
          <h1>{money(summary.total)}</h1>
          <p>{summary.count} {summary.count === 1 ? "expense" : "expenses"} recorded{top && <> · most on {top[0]} ({money(top[1])})</>}</p>
        </div>
        <div className="card split-card">
          <h3>Where it goes</h3>
          {summary.total > 0 ? (
            <>
              <div className="split" role="img" aria-label="Spending split by category">
                {entries.map(([c, v]) => <span key={c} title={`${c}: ${money(v)}`} style={{ flex: v, background: catOf(c).color }} />)}
              </div>
              <ul className="legend">
                {entries.map(([c, v]) => (
                  <li key={c}><i style={{ background: catOf(c).color }} />{c} {Math.round((v / summary.total) * 100)}%</li>
                ))}
              </ul>
            </>
          ) : <p className="muted">Add an expense to see your spending split.</p>}
        </div>
      </section>

      <main className="wrap layout">
        <section className="card panel form-panel">
          <h2>{editingId ? "Edit expense" : "Add an expense"}</h2>
          <form onSubmit={submit} noValidate>
            <label>Title
              <input value={form.title} onChange={change("title")} placeholder="e.g. Lunch at Paradise" maxLength={100} className={errors.title ? "bad" : ""} />
              {errors.title && <small className="err">{errors.title}</small>}
            </label>
            <div className="two">
              <label>Amount (₹)
                <input type="number" inputMode="decimal" step="0.01" min="0" value={form.amount} onChange={change("amount")} placeholder="0.00" className={errors.amount ? "bad" : ""} />
                {errors.amount && <small className="err">{errors.amount}</small>}
              </label>
              <label>Date
                <input type="date" value={form.date} onChange={change("date")} className={errors.date ? "bad" : ""} />
                {errors.date && <small className="err">{errors.date}</small>}
              </label>
            </div>
            <fieldset>
              <legend>Category</legend>
              <div className="chips">
                {NAMES.map((c) => (
                  <button type="button" key={c} className={"chip" + (form.category === c ? " on" : "")} onClick={() => setForm({ ...form, category: c })}>
                    <span>{CATS[c].icon}</span> {c}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="actions">
              <button className="btn primary grow" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Add expense"}</button>
              {editingId && <button type="button" className="btn" onClick={reset}>Cancel</button>}
            </div>
          </form>
        </section>

        <section className="card panel list-panel">
          <div className="list-head">
            <h2>Expenses</h2>
            <p className="muted">{filter === "All" ? "All categories" : filter} · {money(filteredTotal)}</p>
          </div>
          <div className="chips filters" role="tablist" aria-label="Filter by category">
            {["All", ...NAMES].map((c) => (
              <button key={c} role="tab" aria-selected={filter === c} className={"chip" + (filter === c ? " on" : "")} onClick={() => setFilter(c)}>
                {c !== "All" && <span>{CATS[c].icon}</span>} {c}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="empty">Loading expenses…</p>
          ) : expenses.length === 0 ? (
            <div className="empty">
              <strong>{filter === "All" ? "No expenses yet" : `Nothing under ${filter}`}</strong>
              <span>{filter === "All" ? "Add your first expense using the form." : "Pick another category or add an expense here."}</span>
            </div>
          ) : (
            <div className="rows">
              <div className="row head" aria-hidden="true">
                <span>Title</span><span>Category</span><span>Date</span><span className="amt">Amount</span><span />
              </div>
              {expenses.map((x) => (
                <div className="row" key={x.id}>
                  <span className="title">{x.title}</span>
                  <span className="cat"><i style={{ background: catOf(x.category).color }} />{catOf(x.category).icon} {x.category}</span>
                  <span className="date">{fmtDate(x.date)}</span>
                  <span className="amt">{money(x.amount)}</span>
                  <span className="row-actions">
                    <button className="btn small" onClick={() => startEdit(x)} aria-label={`Edit ${x.title}`}>Edit</button>
                    <button className="btn small danger" onClick={() => setConfirm(x)} aria-label={`Delete ${x.title}`}>Delete</button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {confirm && (
        <div className="overlay" onClick={() => setConfirm(null)}>
          <div className="card modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Delete this expense?</h3>
            <p className="muted">"{confirm.title}" for {money(confirm.amount)} will be removed permanently.</p>
            <div className="actions">
              <button className="btn danger solid" onClick={remove}>Delete expense</button>
              <button className="btn" onClick={() => setConfirm(null)}>Keep it</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={"toast " + toast.type} role="status">{toast.text}</div>}
    </div>
  );
}
