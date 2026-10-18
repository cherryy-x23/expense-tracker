import { useEffect, useState } from "react";

// Tiny hash router: #/  #/login  #/register  #/dashboard
const read = () => window.location.hash.replace(/^#/, "") || "/";
export const go = (path) => { window.location.hash = path; };

export function useRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
