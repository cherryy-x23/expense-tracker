import { useEffect, useState } from "react";
import * as api from "./api";
import { go, useRoute } from "./router";
import Stickers from "./Stickers";
import Landing from "./Landing";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";

export default function App() {
  const route = useRoute();
  const [user, setUser] = useState(() => api.session.get()?.user || null);

  // any 401 from the API => session expired, back to login
  useEffect(() => {
    api.setUnauthorizedHandler(() => { api.session.clear(); setUser(null); go("/login"); });
    if (api.session.get()) api.me().catch(() => {});
  }, []);

  // route guards
  let page = ["/", "/login", "/register", "/dashboard"].includes(route) ? route : "/";
  if (page === "/dashboard" && !user) page = "/login";
  if ((page === "/login" || page === "/register") && user) page = "/dashboard";
  useEffect(() => { if (page !== route) go(page); }, [page, route]);

  const onAuth = (sess) => { api.session.set(sess); setUser(sess.user); go("/dashboard"); };
  const onLogout = async () => {
    await api.logout().catch(() => {});
    api.session.clear();
    setUser(null);
    go("/");
  };

  return (
    <>
      <Stickers />
      {page === "/" && <Landing user={user} />}
      {(page === "/login" || page === "/register") && <AuthPage key={page} mode={page.slice(1)} onAuth={onAuth} />}
      {page === "/dashboard" && user && <Dashboard user={user} onLogout={onLogout} />}
    </>
  );
}
