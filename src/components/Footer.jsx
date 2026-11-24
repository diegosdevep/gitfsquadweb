import { Link } from "react-router-dom";
import { site } from "../config";
import { useLang } from "../idiomas";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-marca">
          <div className="brand">
            <img src="/logo.png" alt="" width="32" height="32" />
            GiftSquad
          </div>
          <p>{t.footer.tagline}</p>
        </div>

        <div className="footer-col">
          <h3>{t.footer.producto}</h3>
          <a href="/#como">{t.nav.como}</a>
          <a href="/#features">{t.nav.features}</a>
          <a href="/#descargar">{t.nav.descargar}</a>
        </div>

        <div className="footer-col">
          <h3>{t.footer.legal}</h3>
          <Link to="/privacidad">{t.footer.privacidad}</Link>
          <Link to="/terminos">{t.footer.terminos}</Link>
        </div>

        <div className="footer-col">
          <h3>{t.footer.contacto}</h3>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>

      <div className="wrap footer-base">
        <span>
          © {new Date().getFullYear()} {site.nombre}. {t.footer.derechos}
        </span>
        <span>{t.footer.hecho}</span>
      </div>
    </footer>
  );
}
