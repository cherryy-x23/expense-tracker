import { useState } from "react";
import * as api from "./api";

export default function AuthPage({ mode, onAuth }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (isRegister && !form.name.trim()) e.name = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (isRegister ? form.password.length < 6 : !form.password) e.password = isRegister ? "Use at least 6 characters" : "Enter your password";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    setMessage("");
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      const body = isRegister ? form : { email: form.email, password: form.password };
      const sess = isRegister ? await api.register(body) : await api.login(body);
      onAuth(sess);
    } catch (e) {
      setErrors(e.fields || {});
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page auth-page">
      <a className="brand back" href="#/">💰 Rupee Ledger</a>
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
        <p className="muted">{isRegister ? "Your expenses are saved to your account." : "Log in to open your dashboard."}</p>

        {message && <div className="alert" role="alert">{message}</div>}

        {isRegister && (
          <label>Name
            <input value={form.name} onChange={change("name")} autoComplete="name" className={errors.name ? "bad" : ""} />
            {errors.name && <small className="err">{errors.name}</small>}
          </label>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={change("email")} autoComplete="email" className={errors.email ? "bad" : ""} />
          {errors.email && <small className="err">{errors.email}</small>}
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={change("password")} autoComplete={isRegister ? "new-password" : "current-password"} className={errors.password ? "bad" : ""} />
          {errors.password && <small className="err">{errors.password}</small>}
        </label>

        <button className="btn primary full" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}</button>
        <p className="switch">
          {isRegister ? <>Already registered? <a href="#/login">Log in</a></> : <>New here? <a href="#/register">Create an account</a></>}
        </p>
      </form>
    </div>
  );
}
