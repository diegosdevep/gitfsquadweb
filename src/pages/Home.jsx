import {
  Apple,
  Check,
  ChevronRight,
  Gift,
  Headphones,
  Lock,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import FeatureIcon from "../components/FeatureIcon";
import PhoneFrame from "../components/PhoneFrame";
import QrDescarga from "../components/QrDescarga";
import { site } from "../config";
import { useLang } from "../idiomas";

export default function Home() {
  const { t } = useLang();
  const [tituloInicio, tituloResaltado, tituloFin] = t.hero.titulo;

  return (
    <>
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="pill">
              <Gift size={14} strokeWidth={2.4} aria-hidden="true" />
              {t.hero.pill}
            </p>

            <h1>
              {tituloInicio}
              <span className="hl">{tituloResaltado}</span>
              {tituloFin}
            </h1>

            <p className="lede">{t.hero.lede}</p>

            <div className="hero-actions">
              <a className="btn btn-main" href="#descargar">
                <Apple size={18} strokeWidth={2.2} aria-hidden="true" />
                {t.hero.ctaPrimario}
              </a>
              <a className="btn btn-ghost" href="#como">
                {t.hero.ctaSecundario}
                <ChevronRight size={17} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>

            <ul className="beneficios">
              {t.hero.beneficios.map((b) => (
                <li key={b}>
                  <Check size={15} strokeWidth={3} aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="shots">
            {t.capturas.map((c, i) => (
              <PhoneFrame key={c.src} src={c.src} alt={c.alt} pie={c.pie} indice={i} />
            ))}
          </div>
        </div>
      </header>

      <section className="band band-alt" id="problema">
        <div className="wrap problema-grid">
          <div>
            <h2 className="titular">{t.problema.titulo}</h2>
            {t.problema.parrafos.map((p) => (
              <p className="parrafo" key={p}>
                {p}
              </p>
            ))}
            <ul className="checklist">
              {t.problema.situaciones.map((s) => (
                <li key={s}>
                  <span className="check-dot">
                    <Check size={13} strokeWidth={3.2} aria-hidden="true" />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="mini-cards">
            {t.problema.cards.map((c) => (
              <div className="mini-card" key={c.titulo}>
                <span className={`ico ico-${c.tono}`}>
                  <FeatureIcon nombre={c.icono} size={18} />
                </span>
                <h3>{c.titulo}</h3>
                <p>{c.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="como">
        <div className="wrap">
          <div className="head head-centrado">
            <p className="pill">
              <ScanLine size={14} strokeWidth={2.4} aria-hidden="true" />
              {t.como.pill}
            </p>
            <h2>{t.como.titulo}</h2>
          </div>

          <ol className="timeline">
            {t.como.pasos.map((p, i) => (
              <li className="paso" key={p.titulo}>
                <span className={`paso-ico ico-${p.tono}`}>
                  <FeatureIcon nombre={p.icono} size={18} />
                </span>
                <div className="paso-cuerpo">
                  <p className={`paso-tag tag-${p.tono}`}>
                    {t.como.etiquetaPaso} {i + 1}
                  </p>
                  <h3>{p.titulo}</h3>
                  <p className="paso-texto">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band-alt" id="anonimato">
        <div className="wrap">
          <div className="head">
            <p className="pill">
              <ShieldCheck size={14} strokeWidth={2.4} aria-hidden="true" />
              {t.anonimato.pill}
            </p>
            <h2>{t.anonimato.titulo}</h2>
            <p>{t.anonimato.texto}</p>
          </div>

          <div className="views">
            <div className="view">
              <p className="view-tag">
                <span className="dot" aria-hidden="true" />
                {t.anonimato.vistaRegala}
              </p>
              <div className="item">
                <div className="thumb">
                  <Headphones size={21} strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <p className="item-name">{t.anonimato.item}</p>
                  <p className="item-meta">{t.anonimato.metaRegala}</p>
                </div>
                <p className="item-price">89,99 €</p>
              </div>
              <p className="status">
                <Lock size={14} strokeWidth={2.4} aria-hidden="true" />
                {t.anonimato.reservadoPor} <span className="who">Sofía</span>
              </p>
            </div>

            <div className="view">
              <p className="view-tag">
                <span className="dot dot-warm" aria-hidden="true" />
                {t.anonimato.vistaFestejado}
              </p>
              <div className="item">
                <div className="thumb">
                  <Headphones size={21} strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <p className="item-name">{t.anonimato.item}</p>
                  <p className="item-meta">{t.anonimato.metaFestejado}</p>
                </div>
                <p className="item-price">89,99 €</p>
              </div>
              <p className="status">
                <Lock size={14} strokeWidth={2.4} aria-hidden="true" />
                {t.anonimato.reservadoPor}{" "}
                <span className="redacted" aria-label={t.anonimato.oculto}>
                  Sofía
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="features">
        <div className="wrap">
          <div className="head">
            <p className="pill">
              <Gift size={14} strokeWidth={2.4} aria-hidden="true" />
              {t.features.pill}
            </p>
            <h2>{t.features.titulo}</h2>
          </div>
          <div className="feats">
            {t.features.items.map((f) => (
              <div className="feat" key={f.titulo}>
                <h3>
                  <span className={`ico ico-${f.tono}`}>
                    <FeatureIcon nombre={f.icono} />
                  </span>
                  {f.titulo}
                </h3>
                <p>{f.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="descargar">
        <div className="wrap">
          <div className="download">
            <div>
              <h2>{t.descarga.titulo}</h2>
              <p>{t.descarga.texto}</p>
            </div>

            <div className="download-qr">
              <QrDescarga size={124} />
              <div className="stores">
                <a className="store" href={site.appStoreUrl} target="_blank" rel="noopener noreferrer">
                  <Apple size={24} strokeWidth={2} aria-hidden="true" />
                  <span>
                    <span className="store-k">{t.descarga.appStoreKicker}</span>
                    <br />
                    <span className="store-v">{t.descarga.appStore}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
