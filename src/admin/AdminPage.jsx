import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { Gift, LayoutDashboard, LogOut, RefreshCw, Users, UsersRound } from "lucide-react";
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

const fecha = (ms) => (ms ? new Date(ms).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const fechaHora = (ms) =>
  ms ? new Date(ms).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Nunca";
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

function Usuarios({ data, q }) {
  const filas = data.users
    .filter((u) => `${u.displayName} ${u.email} ${u.username}`.toLowerCase().includes(q))
    .sort((a, b) => (b.lastSignIn ?? 0) - (a.lastSignIn ?? 0));
  return (
    <div className="ad-tabla-wrap">
      <table className="ad-tabla">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Último ingreso</th>
            <th>Alta</th>
            <th>Grupos</th>
            <th>Ítems</th>
            <th>Push</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((u) => (
            <tr key={u.id}>
              <td>
                <b>{u.displayName || "—"}</b>
                {u.username && <small> @{u.username}</small>}
                {u.disabled && <span className="ad-tag ad-tag-mal">deshabilitado</span>}
              </td>
              <td>{u.email}</td>
              <td>{fechaHora(u.lastSignIn)}</td>
              <td>{fecha(u.createdAt)}</td>
              <td>{u.groupCount}</td>
              <td>{u.itemCount}</td>
              <td>{u.hasPush ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filas.length === 0 && <p className="ad-vacio">Sin resultados.</p>}
    </div>
  );
}

function Listas({ data, q }) {
  const [abierto, setAbierto] = useState(null);
  const grupoNombre = useMemo(() => new Map(data.groups.map((g) => [g.id, g.name])), [data.groups]);
  const porDueno = useMemo(() => {
    const m = new Map();
    for (const i of data.items) m.set(i.ownerId, [...(m.get(i.ownerId) ?? []), i]);
    return m;
  }, [data.items]);
  const duenos = data.users
    .filter((u) => porDueno.has(u.id))
    .filter((u) => `${u.displayName} ${u.email}`.toLowerCase().includes(q))
    .sort((a, b) => porDueno.get(b.id).length - porDueno.get(a.id).length);

  return (
    <div className="ad-lista">
      {duenos.map((u) => {
        const items = porDueno.get(u.id);
        const open = abierto === u.id;
        return (
          <div className="ad-card ad-acordeon" key={u.id}>
            <button type="button" onClick={() => setAbierto(open ? null : u.id)} aria-expanded={open}>
              <span>
                <b>{u.displayName || u.email}</b> <small>{u.email}</small>
              </span>
              <span className="ad-tag">{items.length} ítems</span>
            </button>
            {open && (
              <ul>
                {items.map((i) => (
                  <li key={i.id} className={i.isArchived ? "ad-arch" : ""}>
                    <span>
                      {i.link ? (
                        <a href={i.link} target="_blank" rel="noreferrer noopener">
                          {i.name}
                        </a>
                      ) : (
                        i.name
                      )}
                      <small>
                        {" "}
                        · {PRIORIDAD[i.priority] ?? i.priority}
                        {i.isArchived && " · archivado"}
                        {i.groupIds.length > 0
                          ? ` · ${i.groupIds.map((g) => grupoNombre.get(g) ?? "grupo borrado").join(", ")}`
                          : " · solo lista propia"}
                      </small>
                    </span>
                    <span>{plata(i.price, i.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      {duenos.length === 0 && <p className="ad-vacio">Sin resultados.</p>}
    </div>
  );
}

function Grupos({ data, q }) {
  const grupos = data.groups
    .filter((g) => `${g.name} ${g.ownerName}`.toLowerCase().includes(q))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return (
    <div className="ad-cols">
      {grupos.map((g) => (
        <section className="ad-card" key={g.id}>
          <h3>
            {g.emoji} {g.name}
          </h3>
          <p className="ad-meta">
            Dueño: <b>{g.ownerName}</b> · creado {fecha(g.createdAt)} · {g.itemCount} ítems
          </p>
          <p className="ad-meta">
            Código: <code>{g.inviteCode}</code>
          </p>
          <ul className="ad-miembros">
            {g.members.map((m) => (
              <li key={m.id}>
                {m.name}
                {m.id === g.ownerId && <span className="ad-tag">dueño</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {grupos.length === 0 && <p className="ad-vacio">Sin resultados.</p>}
    </div>
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
            <small>{data ? `Actualizado ${fechaHora(data.generatedAt)}` : "Cargando datos"}</small>
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

        <p className="ad-pie">Las reservas se muestran solo como cantidades: nunca quién reservó qué.</p>
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
