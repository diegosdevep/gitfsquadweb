import { LayoutDashboard, UserRound } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import LangToggle from "./LangToggle";
import ThemeToggle from "./ThemeToggle";
import { useLang } from "../idiomas";

function haySesion() {
  try {
    return Object.keys(localStorage).some((k) => k.startsWith("firebase:authUser:"));
  } catch {
    return false;
  }
}

export default function Nav() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const sesion = haySesion();
  const enHome = pathname === "/";
  const ancla = (id) => (enHome ? `#${id}` : `/#${id}`);

  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <Link className="brand" to="/">
          <img src="/logo.png" alt="" width="32" height="32" />
          GiftSquad
        </Link>

        <div className="nav-links">
          <a href={ancla("como")}>{t.nav.como}</a>
          <a href={ancla("features")}>{t.nav.features}</a>
          <NavLink to="/privacidad">{t.nav.privacidad}</NavLink>
          <NavLink to="/terminos">{t.nav.terminos}</NavLink>
          <LangToggle />
          <ThemeToggle />
          <a className="nav-cta btn btn-main" href={ancla("descargar")}>
            {t.nav.descargar}
          </a>
          <Link
            className="theme-toggle"
            to="/admin"
            aria-label={sesion ? t.nav.panel : t.nav.ingresar}
            title={sesion ? t.nav.panel : t.nav.ingresar}
          >
            {sesion ? <LayoutDashboard size={17} strokeWidth={2.2} /> : <UserRound size={17} strokeWidth={2.2} />}
          </Link>
        </div>
      </div>
    </nav>
  );
}
