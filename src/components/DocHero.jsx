export default function DocHero({
  icono,
  etiqueta,
  titulo,
  actualizado,
  etiquetaFecha,
  children,
}) {
  return (
    <header className="doc-hero">
      <div className="wrap doc-inner">
        <p className="pill">
          {icono}
          {etiqueta}
        </p>
        <h1>{titulo}</h1>
        <p className="doc-fecha">
          {etiquetaFecha}: {actualizado}
        </p>
        <p className="doc-intro">{children}</p>
      </div>
    </header>
  );
}
