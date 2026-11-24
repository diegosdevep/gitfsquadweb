import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { ChevronRight, Gift, LayoutDashboard, LogOut, RefreshCw, Users, UsersRound, X } from "lucide-react";
import { auth, firebaseConfigurado, functions, googleProvider } from "../firebase";
import "./admin.css";

const TABS = [
  ["resumen", "Resumen", LayoutDashboard],
  ["usuarios", "Usuarios", Users],
  ["listas", "Listas", Gift],
  ["grupos", "Grupos", UsersRound],
];

const PRIORIDAD = { low: "Me gustaría", medium: "Lo quiero", wantALot: "Lo quiero mucho", high: "¡Lo necesito!" };
const ESTADO_RESERVA = { reserved: "Reservado", purchased: "Comprado", released: "Liberado", delivered: "Entregado" };

const cap = (t) => (t ?? "").replace(/(^|\s)(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
const dos = (n) => String(n).padStart(2, "0");
const fecha = (ms) => {
  if (!ms) return "—";
  const d = new Date(ms);
  return `${dos(d.getDate())}-${dos(d.getMonth() + 1)}-${d.getFullYear()}`;
};
const fechaHora = (ms) => {
  if (!ms) return "Nunca";
  const d = new Date(ms);
  return `${fecha(ms)} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
};
const corto = (t) => {
  const p = t.split(/\s+/);
  return p.length > 4 ? `${p.slice(0, 4).join(" ").replace(/[,|\-–:;.]+$/, "")}…` : t;
};
const plata = (n, moneda) => (n == null ? "—" : `${moneda || ""} ${n.toLocaleString("es-AR")}`.trim());

function Stat({ label, valor, nota }) {
  return (
    <div className="ad-stat">
      <span className="ad-stat-n">{valor}</span>
      <span className="ad-stat-l">{label}</span>
      {nota && <span className="ad-stat-note">{nota}</span>}
    </div>
  );
}

function Barras({ titulo, datos, etiquetas = {} }) {
  const filas = Object.entries(datos || {});
  const max = Math.max(1, ...filas.map(([, v]) => v));
  return (
    <section className="ad-card">
      <h3>{titulo}</h3>
      {filas.length === 0 && <p className="ad-vacio">Sin datos.</p>}
      {filas.map(([k, v]) => (
        <div className="ad-bar" key={k}>
          <span>{etiquetas[k] ?? k}</span>
          <div className="ad-bar-track">
            <div className="ad-bar-fill" style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <b>{v}</b>
        </div>
      ))}
    </section>
  );
}

function Resumen({ data }) {
  const s = data.stats;
  const altas = useMemo(() => {
    const dias = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      dias.push([d, s.signupsLast30d[d] ?? 0]);
    }
    return dias;
  }, [s.signupsLast30d]);
  const maxAlta = Math.max(1, ...altas.map(([, v]) => v));

  return (
    <>
      <div className="ad-grid">
        <Stat label="Usuarios" valor={s.users} />
        <Stat label="Activos 24 h" valor={s.activeLast1d} />
        <Stat label="Activos 7 días" valor={s.activeLast7d} />
        <Stat label="Activos 30 días" valor={s.activeLast30d} />
        <Stat label="Grupos" valor={s.groups} nota={`${s.avgMembersPerGroup} miembros promedio`} />
        <Stat label="Ítems en listas" valor={s.items} nota={`${s.avgItemsPerUser} por usuario`} />
        <Stat label="Ítems sin grupo" valor={s.itemsWithoutGroup} nota="solo en lista propia" />
        <Stat label="Archivados" valor={s.itemsArchived} />
        <Stat label="Reservas" valor={s.reservations} nota="solo cantidad, anónimas" />
        <Stat label="Regalos en historial" valor={s.history} />
        <Stat label="Amigo Invisible" valor={s.secretSantaEvents} nota="eventos" />
      </div>

      <section className="ad-card">
        <h3>Altas por día · últimos 30 días</h3>
        <div className="ad-spark" role="img" aria-label="Altas por día">
          {altas.map(([d, v]) => (
            <div key={d} className="ad-spark-col" title={`${d}: ${v}`}>
              <div style={{ height: `${(v / maxAlta) * 100}%` }} />
            </div>
          ))}
        </div>
      </section>

      <div className="ad-cols">
        <Barras titulo="Ítems por prioridad" datos={s.itemsByPriority} etiquetas={PRIORIDAD} />
        <Barras titulo="Reservas por estado" datos={s.reservationsByStatus} etiquetas={ESTADO_RESERVA} />
        <Barras titulo="Amigo Invisible por estado" datos={s.secretSantaByStatus} />
      </div>
    </>
  );
}

const PROVEEDOR = { "google.com": "Google", "apple.com": "Apple", password: "Email" };
const DIA = 86400000;

const hace = (ms, ahora) => {
  if (!ms) return "Nunca";
  const dias = Math.floor((ahora - ms) / DIA);
  if (dias < 1) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 30) return `Hace ${dias} días`;
  return fecha(ms);
};

const ORDEN_USUARIOS = {
  ingreso: (a, b) => (b.lastSignIn ?? 0) - (a.lastSignIn ?? 0),
  alta: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
  items: (a, b) => b.itemCount - a.itemCount,
  nombre: (a, b) => (a.displayName || a.email).localeCompare(b.displayName || b.email),
};

function DetalleUsuario({ u, data, onClose }) {
  const grupos = data.groups.filter((g) => g.members.some((m) => m.id === u.id)).sort((a, b) => b.itemCount - a.itemCount);
  const nombre = cap(u.displayName) || u.email;
  return (
    <Modal
      titulo={nombre}
      sub={u.username ? `@${u.username}` : u.email}
      icono={<Foto m={{ photoURL: u.photoURL, name: nombre }} grande />}
      onClose={onClose}
    >
      <h4>Cuenta</h4>
      <dl className="ap-ajustes">
        <div>
          <dt>Email</dt>
          <dd>{u.email || "—"}</dd>
        </div>
        <div>
          <dt>Ingresa con</dt>
          <dd>{PROVEEDOR[u.provider] ?? u.provider ?? "—"}</dd>
        </div>
        <div>
          <dt>Último ingreso</dt>
          <dd>{u.lastSignIn ? fechaHora(u.lastSignIn) : "Nunca"}</dd>
        </div>
        <div>
          <dt>Fecha de alta</dt>
          <dd>{fecha(u.createdAt)}</dd>
        </div>
        <div>
          <dt>Notificaciones</dt>
          <dd>{u.hasPush ? "Activadas" : "Sin activar"}</dd>
        </div>
      </dl>
      <h4>Actividad</h4>
      <dl className="ap-ajustes">
        <div>
          <dt>Grupos a los que pertenece</dt>
          <dd>{u.groupCount}</dd>
        </div>
        <div>
          <dt>Ítems en su lista</dt>
          <dd>{u.itemCount}</dd>
        </div>
      </dl>
      <h4>Grupos</h4>
      {grupos.length === 0 ? (
        <p className="ad-vacio">No pertenece a ningún grupo.</p>
      ) : (
        <ul className="ap-miembros">
          {grupos.map((g) => (
            <li key={g.id}>
              <span className="ap-emoji ap-emoji-s">{g.emoji || "🎁"}</span>
              <span className="ap-g-nombre">
                {g.name}
                {g.ownerId !== u.id && <small>de {cap(g.ownerName)}</small>}
              </span>
              <em className="ap-g-der">
                <span>
                  {g.itemCount} {g.itemCount === 1 ? "ítem" : "ítems"}
                </span>
                {g.ownerId === u.id && <i>Dueño</i>}
              </em>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function Usuarios({ data, q }) {
  const ahora = useMemo(() => Date.now(), [data]);
  const [vista, setVista] = useState("todos");
  const [orden, setOrden] = useState("ingreso");
  const [sel, setSel] = useState(null);
  const cerrar = useCallback(() => setSel(null), []);
  const cumple = (u, v) => {
    const activo = u.lastSignIn != null && ahora - u.lastSignIn < 7 * DIA;
    return v === "todos" || (v === "activos" ? activo : !activo);
  };
  const total = (v) => data.users.filter((u) => cumple(u, v)).length;
  const filas = data.users
    .filter((u) => `${u.displayName} ${u.email} ${u.username}`.toLowerCase().includes(q))
    .filter((u) => cumple(u, vista))
    .sort(ORDEN_USUARIOS[orden]);
  const elegido = sel && data.users.find((u) => u.id === sel);

  return (
    <>
      <div className="ap-barra">
        <div className="ap-segmentos" role="tablist">
          {[["todos", "Todos"], ["activos", "Activos (7 días)"], ["inactivos", "Inactivos"]].map(([k, n]) => (
            <button type="button" key={k} className={vista === k ? "on" : ""} onClick={() => setVista(k)}>
              {n}
              <small>{total(k)}</small>
            </button>
          ))}
        </div>
        <select className="ap-select" value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
          <option value="ingreso">Último ingreso</option>
          <option value="alta">Más nuevos</option>
          <option value="items">Más ítems</option>
          <option value="nombre">Nombre</option>
        </select>
      </div>
      <div className="ap-usuarios">
        <div className="ap-u-cab" aria-hidden="true">
          <span />
          <span>Usuario</span>
          <span>Ingresa con</span>
          <span>Último ingreso</span>
          <span>Grupos</span>
          <span>Ítems</span>
          <span />
        </div>
        {filas.map((u) => {
          const nombre = cap(u.displayName) || u.email;
          return (
            <button type="button" className="ap-u" key={u.id} onClick={() => setSel(u.id)}>
              <Foto m={{ photoURL: u.photoURL, name: nombre }} grande />
              <span className="ap-u-quien">
                <b>
                  {nombre}
                  {u.disabled && <span className="ap-u-mal">Deshabilitado</span>}
                </b>
                <small>{u.username ? `@${u.username}` : u.email}</small>
              </span>
              <span className="ap-u-prov">{PROVEEDOR[u.provider] ?? u.provider ?? "—"}</span>
              <span className="ap-u-ing">{hace(u.lastSignIn, ahora)}</span>
              <span className="ap-u-num">{u.groupCount}</span>
              <span className="ap-u-num">{u.itemCount}</span>
              <ChevronRight size={16} className="ap-flecha" />
            </button>
          );
        })}
        {filas.length === 0 && <p className="ad-vacio">Sin resultados.</p>}
      </div>
      {elegido && <DetalleUsuario u={elegido} data={data} onClose={cerrar} />}
    </>
  );
}

function Foto({ m, grande }) {
  const [fallo, setFallo] = useState(false);
  const clase = grande ? " grande" : "";
  if (m.photoURL && !fallo) {
    return <img className={`ap-foto${clase}`} src={m.photoURL} alt="" referrerPolicy="no-referrer" onError={() => setFallo(true)} />;
  }
  return <span className={`ap-avatar${clase}`}>{(m.name || "?").charAt(0).toUpperCase()}</span>;
}

function FilaItem({ i, grupoNombre }) {
  const detalle = [
    PRIORIDAD[i.priority] ?? i.priority,
    ...i.groupIds.map((g) => grupoNombre.get(g) ?? "Grupo borrado"),
    i.isArchived ? "Archivado" : null,
  ].filter(Boolean);
  const nombre = i.link ? (
    <a href={i.link} target="_blank" rel="noreferrer noopener" title={i.name}>
      {corto(i.name)}
    </a>
  ) : (
    <span title={i.name}>{corto(i.name)}</span>
  );
  return (
    <li>
      {i.imageURL ? (
        <img src={i.imageURL} alt="" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <span className="ap-sinfoto">
          <Gift size={20} />
        </span>
      )}
      <div className="ap-texto">
        {nombre}
        <small>{detalle.join(" · ")}</small>
      </div>
      <span className="ap-precio">{plata(i.price, i.currency)}</span>
    </li>
  );
}

function Modal({ titulo, sub, icono, onClose, children }) {
  useEffect(() => {
    const tecla = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onClose]);

  return (
    <div className="ap-fondo" onClick={onClose}>
      <div className="ap-modal" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <header>
          {icono}
          <div>
            <h2>{titulo}</h2>
            <small>{sub}</small>
          </div>
          <button type="button" className="ap-cerrar" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>
        <div className="ap-modal-cuerpo">{children}</div>
      </div>
    </div>
  );
}

function DetalleGrupo({ g, data, onClose }) {
  const grupoNombre = useMemo(() => new Map(data.groups.map((x) => [x.id, x.name])), [data.groups]);
  const items = data.items.filter((i) => i.groupIds.includes(g.id));

  return (
    <Modal titulo={g.name} sub={`Creado por ${cap(g.ownerName)}`} icono={<span className="ap-emoji">{g.emoji || "🎁"}</span>} onClose={onClose}>
          <dl className="ap-datos">
            <div>
              <dt>Creado</dt>
              <dd className="fec">{fecha(g.createdAt)}</dd>
            </div>
            <div>
              <dt>Código</dt>
              <dd className="cod">{g.inviteCode}</dd>
            </div>
            <div>
              <dt>Ítems</dt>
              <dd>{items.length}</dd>
            </div>
            <div>
              <dt>Miembros</dt>
              <dd>{g.members.length}</dd>
            </div>
          </dl>

          <h4>Miembros</h4>
          <ul className="ap-miembros">
            {g.members.map((m) => (
              <li key={m.id}>
                <Foto m={m} />
                <span>{cap(m.name)}</span>
                {m.id === g.ownerId && <em>Dueño</em>}
              </li>
            ))}
          </ul>

          <h4>Ítems</h4>
          {items.length === 0 ? (
            <p className="ad-vacio">Este grupo todavía no tiene ítems.</p>
          ) : (
            <ul className="ap-filas ap-filas-modal">
              {items.map((i) => (
                <FilaItem key={i.id} i={i} grupoNombre={grupoNombre} />
              ))}
            </ul>
          )}
    </Modal>
  );
}

function ResumenListas({ items, listas, grupoNombre, titulo, onTodas }) {
  const prioridad = {};
  const plata_ = {};
  const grupos = new Map();
  for (const i of items) {
    prioridad[i.priority] = (prioridad[i.priority] ?? 0) + 1;
    if (i.price != null) plata_[i.currency || "—"] = (plata_[i.currency || "—"] ?? 0) + i.price;
    for (const g of i.groupIds) grupos.set(g, (grupos.get(g) ?? 0) + 1);
  }
  const maxP = Math.max(1, ...Object.values(prioridad));
  const topGrupos = [...grupos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const orden = ["high", "wantALot", "medium", "low"];

  return (
    <aside className="ap-lateral">
      {titulo && (
        <div className="ap-lat-titulo">
          <b>{titulo}</b>
          <button type="button" onClick={onTodas}>
            Ver todas
          </button>
        </div>
      )}
      <div className="ap-lat-cifras">
        <div>
          <b>{listas}</b>
          <span>{listas === 1 ? "lista" : "listas"}</span>
        </div>
        <div>
          <b>{items.length}</b>
          <span>{items.length === 1 ? "ítem" : "ítems"}</span>
        </div>
      </div>

      <section>
        <h4>Por prioridad</h4>
        {orden
          .filter((p) => prioridad[p])
          .map((p) => (
            <div className="ap-lat-barra" key={p}>
              <span>{PRIORIDAD[p]}</span>
              <div>
                <i style={{ width: `${(prioridad[p] / maxP) * 100}%` }} />
              </div>
              <b>{prioridad[p]}</b>
            </div>
          ))}
      </section>

      {topGrupos.length > 0 && (
        <section>
          <h4>Grupos con más ítems</h4>
          {topGrupos.map(([id, n]) => (
            <div className="ap-lat-fila" key={id}>
              <span>{grupoNombre.get(id) ?? "Grupo borrado"}</span>
              <b>{n}</b>
            </div>
          ))}
        </section>
      )}

      {Object.keys(plata_).length > 0 && (
        <section>
          <h4>Valor total</h4>
          {Object.entries(plata_).map(([m, n]) => (
            <div className="ap-lat-fila" key={m}>
              <span>{m}</span>
              <b>{n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}</b>
            </div>
          ))}
        </section>
      )}
    </aside>
  );
}

function Listas({ data, q }) {
  const [abierto, setAbierto] = useState(null);
  const [vista, setVista] = useState("activos");
  const grupoNombre = useMemo(() => new Map(data.groups.map((g) => [g.id, g.name])), [data.groups]);
  const visible = (i, v) => v === "todos" || (v === "archivados") === i.isArchived;
  const porDueno = useMemo(() => {
    const m = new Map();
    for (const i of data.items) if (visible(i, vista)) m.set(i.ownerId, [...(m.get(i.ownerId) ?? []), i]);
    return m;
  }, [data.items, vista]);
  const total = (v) => data.items.filter((i) => visible(i, v)).length;
  const duenos = data.users
    .filter((u) => porDueno.has(u.id))
    .filter((u) => `${u.displayName} ${u.email}`.toLowerCase().includes(q))
    .sort((a, b) => porDueno.get(b.id).length - porDueno.get(a.id).length);

  const elegida = duenos.find((u) => u.id === abierto);

  return (
    <div className="ad-lista">
      <div className="ap-barra">
        <div className="ap-segmentos" role="tablist">
          {[["activos", "Activos"], ["archivados", "Archivados"], ["todos", "Todos"]].map(([k, n]) => (
            <button type="button" key={k} className={vista === k ? "on" : ""} onClick={() => setVista(k)}>
              {n}
              <small>{total(k)}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="ap-cols">
      <div className="ap-listas">
      {duenos.map((u) => {
        const items = porDueno.get(u.id);
        const open = abierto === u.id;
        const nombre = cap(u.displayName) || u.email;
        return (
          <section className={`ap-grupo ap-lista ${open ? "abierto" : ""}`} key={u.id}>
            <button type="button" className="ap-cabecera" onClick={() => setAbierto(open ? null : u.id)} aria-expanded={open}>
              <Foto m={{ photoURL: u.photoURL, name: nombre }} grande />
              <span className="ap-quien">
                <b>Lista {nombre.split(/[\s@]/)[0]}</b>
                <small>{nombre}</small>
              </span>
              <span className="ap-miniaturas">
                {items
                  .filter((i) => i.imageURL)
                  .slice(0, 4)
                  .map((i) => (
                    <img key={i.id} src={i.imageURL} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  ))}
                {items.length > 4 && <span className="mas">+{items.length - 4}</span>}
              </span>
              <span className="ap-total">
                <Gift size={13} />
                {items.length}
              </span>
              <ChevronRight size={16} className="ap-flecha" />
            </button>
            {open && (
              <ul className="ap-filas ap-filas-modal">
                {items.map((i) => (
                  <FilaItem key={i.id} i={i} grupoNombre={grupoNombre} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
      </div>
      {duenos.length === 0 && <p className="ad-vacio">Sin resultados.</p>}
      <ResumenListas
        items={elegida ? porDueno.get(elegida.id) : duenos.flatMap((u) => porDueno.get(u.id))}
        listas={elegida ? 1 : duenos.length}
        grupoNombre={grupoNombre}
        titulo={elegida ? `Lista ${cap(elegida.displayName || elegida.email).split(/[\s@]/)[0]}` : null}
        onTodas={() => setAbierto(null)}
      />
      </div>
    </div>
  );
}


const ORDEN_GRUPOS = {
  recientes: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
  items: (a, b) => b.itemCount - a.itemCount,
  miembros: (a, b) => b.members.length - a.members.length,
  nombre: (a, b) => a.name.localeCompare(b.name),
};

function Grupos({ data, q }) {
  const [vista, setVista] = useState("conitems");
  const [orden, setOrden] = useState("recientes");
  const [dueno, setDueno] = useState("");
  const [sel, setSel] = useState(null);
  const cerrar = useCallback(() => setSel(null), []);
  const duenos = useMemo(() => [...new Map(data.groups.map((g) => [g.ownerId, g.ownerName])).entries()], [data.groups]);
  const cumple = (g, v) => v === "todos" || (v === "conitems" ? g.itemCount > 0 : g.itemCount === 0);
  const grupos = data.groups
    .filter((g) => `${g.name} ${g.ownerName} ${g.inviteCode}`.toLowerCase().includes(q))
    .filter((g) => cumple(g, vista))
    .filter((g) => !dueno || g.ownerId === dueno)
    .sort((a, b) => Number(b.itemCount > 0) - Number(a.itemCount > 0) || ORDEN_GRUPOS[orden](a, b));
  const total = (v) => data.groups.filter((g) => cumple(g, v)).length;

  return (
    <>
      <div className="ap-barra">
        <div className="ap-segmentos" role="tablist">
          {[["conitems", "Con ítems"], ["vacios", "Vacíos"], ["todos", "Todos"]].map(([k, n]) => (
            <button type="button" key={k} className={vista === k ? "on" : ""} onClick={() => setVista(k)}>
              {n}
              <small>{total(k)}</small>
            </button>
          ))}
        </div>
        <select className="ap-select" value={dueno} onChange={(e) => setDueno(e.target.value)} aria-label="Dueño">
          <option value="">Todos los dueños</option>
          {duenos.map(([id, n]) => (
            <option key={id} value={id}>
              {cap(n)}
            </option>
          ))}
        </select>
        <select className="ap-select" value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
          <option value="recientes">Más recientes</option>
          <option value="items">Más ítems</option>
          <option value="miembros">Más miembros</option>
          <option value="nombre">Nombre</option>
        </select>
      </div>
      <div className="ap-grupos">
        {grupos.map((g) => (
          <article className="ap-gcard" key={g.id} role="button" tabIndex={0} onClick={() => setSel(g.id)} onKeyDown={(e) => e.key === "Enter" && setSel(g.id)}>
            <header>
              <span className="ap-emoji">
                {g.emoji || "🎁"}
              </span>
              <div>
                <h3>{g.name}</h3>
                <small>{cap(g.ownerName)}</small>
              </div>
            </header>
            <div className="ap-cifras">
              <span className={g.itemCount === 0 ? "vacio" : ""}>
                <Gift size={15} />
                <b>{g.itemCount}</b> {g.itemCount === 1 ? "ítem" : "ítems"}
              </span>
              <span>
                <Users size={15} />
                <b>{g.members.length}</b> {g.members.length === 1 ? "miembro" : "miembros"}
              </span>
            </div>
            <footer>
              <div className="ap-pila" title={g.members.map((m) => m.name).join(", ")}>
                {g.members.slice(0, 4).map((m) => (
                  <span key={m.id}>
                    {m.photoURL ? <img src={m.photoURL} alt="" referrerPolicy="no-referrer" /> : (m.name || "?").charAt(0).toUpperCase()}
                  </span>
                ))}
                {g.members.length > 4 && <span className="mas">+{g.members.length - 4}</span>}
              </div>
              <time>{fecha(g.createdAt)}</time>
            </footer>
          </article>
        ))}
        {grupos.length === 0 && <p className="ad-vacio">Sin resultados.</p>}
      </div>
      {sel && data.groups.find((g) => g.id === sel) && (
        <DetalleGrupo g={data.groups.find((g) => g.id === sel)} data={data} onClose={cerrar} />
      )}
    </>
  );
}

function Panel({ user }) {
  const [tab, setTab] = useState("resumen");
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const res = await httpsCallable(functions, "adminOverview")();
      setData(res.data);
    } catch (e) {
      setError(
        e.code === "functions/permission-denied"
          ? "Esta cuenta no tiene permiso para ver el panel."
          : `No se pudieron cargar los datos (${e.code}).`
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const ql = q.trim().toLowerCase();
  const titulo = TABS.find(([id]) => id === tab)[1];

  return (
    <div className="pn">
      <aside className="pn-side">
        <div className="pn-brand">
          <img src="/logo.png" alt="" width="34" height="34" />
          <span>
            GiftSquad
            <small>Admin</small>
          </span>
        </div>

        <nav className="pn-nav" aria-label="Secciones">
          {TABS.map(([id, nombre, Icono]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "on" : ""}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => {
                setTab(id);
                setQ("");
              }}
            >
              <Icono size={18} strokeWidth={2.2} />
              {nombre}
            </button>
          ))}
        </nav>

        <div className="pn-user">
          <span title={user.email}>{user.email}</span>
          <button type="button" onClick={() => signOut(auth)}>
            <LogOut size={16} strokeWidth={2.2} />
            Salir
          </button>
        </div>
      </aside>

      <main className="pn-main">
        <header className="pn-top">
          <div>
            <h1>{titulo}</h1>
          </div>
          <div className="pn-acciones">
            {tab !== "resumen" && (
              <input
                type="search"
                placeholder={`Buscar en ${titulo.toLowerCase()}`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Buscar"
              />
            )}
            <button type="button" className="pn-refrescar" onClick={cargar} disabled={cargando}>
              <RefreshCw size={16} strokeWidth={2.2} className={cargando ? "gira" : ""} />
              Actualizar
            </button>
          </div>
        </header>

        {error && <p className="ad-error">{error}</p>}
        {data && tab === "resumen" && <Resumen data={data} />}
        {data && tab === "usuarios" && <Usuarios data={data} q={ql} />}
        {data && tab === "listas" && <Listas data={data} q={ql} />}
        {data && tab === "grupos" && <Grupos data={data} q={ql} />}

      </main>
    </div>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Admin · GiftSquad";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      return;
    }
    return onAuthStateChanged(auth, setUser);
  }, []);

  const entrar = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") setError(`No se pudo iniciar sesión con Google (${e.code}).`);
    }
  };

  if (user === undefined) return <p className="ad-vacio ad-centro">Cargando</p>;

  if (!user) {
    return (
      <main className="lg">
        <section className="lg-card">
          <img src="/logo.png" alt="GiftSquad" width="64" height="64" />
          <h1>Panel de administración</h1>
          <p className="lg-sub">Ingresá con tu cuenta de Google autorizada.</p>

          {!firebaseConfigurado ? (
            <p className="ad-error">Falta la configuración de Firebase (variables VITE_FIREBASE_*).</p>
          ) : (
            <button type="button" className="lg-google" onClick={entrar}>
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
              </svg>
              Entrar con Google
            </button>
          )}
          {error && <p className="ad-error">{error}</p>}
        </section>

        <a className="lg-volver" href="/">
          ← Volver al sitio
        </a>
      </main>
    );
  }

  return <Panel user={user} />;
}
