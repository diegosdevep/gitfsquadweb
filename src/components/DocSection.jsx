export default function DocSection({ n, titulo, children }) {
  return (
    <section className="doc-sec">
      <div className="doc-sec-head">
        <span className="doc-n">{n}</span>
        <h2>{titulo}</h2>
      </div>
      <div className="doc-sec-body">{children}</div>
    </section>
  );
}
