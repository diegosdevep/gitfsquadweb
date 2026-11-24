import DocHero from "../components/DocHero";
import DocSection from "../components/DocSection";
import RichText from "../components/RichText";
import { site } from "../config";
import { useLang } from "../idiomas";

function Bloque({ bloque, valores }) {
  if (bloque.tipo === "lista") {
    return (
      <ul className="doc-lista">
        {bloque.items.map((item) => (
          <li key={item}>
            <RichText texto={item} valores={valores} />
          </li>
        ))}
      </ul>
    );
  }

  if (bloque.tipo === "tabla") {
    return (
      <table className="doc-tabla">
        <tbody>
          {bloque.filas.map((fila) => (
            <tr key={fila.clave}>
              <th scope="row">{fila.clave}</th>
              <td>{fila.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (bloque.tipo === "nota") {
    return (
      <div className="nota">
        <RichText texto={bloque.texto} valores={valores} />
      </div>
    );
  }

  return (
    <p>
      <RichText texto={bloque.texto} valores={valores} />
    </p>
  );
}

function fechaLegible(iso, lang) {
  const fecha = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(fecha);
}

export default function DocPage({ documento, icono }) {
  const { t, legal, lang } = useLang();
  const doc = legal[documento];
  const valores = { autor: site.autor, email: site.email };

  return (
    <main className="doc">
      <DocHero
        icono={icono}
        etiqueta={doc.etiqueta}
        titulo={doc.titulo}
        actualizado={fechaLegible(site.actualizado, lang)}
        etiquetaFecha={t.doc.actualizado}
      >
        <RichText texto={doc.intro} valores={valores} />
      </DocHero>

      <div className="wrap doc-inner">
        {doc.secciones.map((seccion, i) => (
          <DocSection key={seccion.titulo} n={i + 1} titulo={seccion.titulo}>
            {seccion.bloques.map((bloque, j) => (
              <Bloque key={j} bloque={bloque} valores={valores} />
            ))}
          </DocSection>
        ))}
      </div>
    </main>
  );
}
