import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { Activity, ChevronRight, Gift, LayoutDashboard, LogOut, RefreshCw, ShieldAlert, ShieldCheck, Shuffle, Users, UsersRound, X } from "lucide-react";
import { auth, firebaseConfigurado, functions, googleProvider } from "../firebase";
import "./admin.css";

const TABS = [
  ["resumen", "Resumen", LayoutDashboard],
  ["usuarios", "Usuarios", Users],
  ["listas", "Listas", Gift],
  ["grupos", "Grupos", UsersRound],
  ["sorteos", "Amigo Invisible", Shuffle],
  ["admins", "Admins", ShieldCheck],
];

const PRIORIDAD = { low: "Me gustaría", medium: "Lo quiero", wantALot: "Lo quiero mucho", high: "¡Lo necesito!" };
const ESTADO_SORTEO = { draft: "Esperando sorteo", drawn: "Sorteado", completed: "Finalizado", cancelled: "Cancelado" };
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

function IconoGrupo({ emoji, size = 22 }) {
  return emoji ? emoji : <Gift size={size} strokeWidth={2} />;
}

const COLORES = ["#26262d", "#ff6a1a", "#2952e3", "#00c896", "#b9b9c2"];
const diaCorto = (d) => `${d.slice(8, 10)}-${d.slice(5, 7)}`;
const pct = (n, t) => (t ? Math.round((n / t) * 100) : 0);

function Panel2({ titulo, sub, children, className = "" }) {
  return (
    <section className={`rs-panel ${className}`}>
      <header>
        <h3>{titulo}</h3>
        {sub && <small>{sub}</small>}
      </header>
      {children}
    </section>
  );
}

function Kpi({ etiqueta, valor, nota, icono: Icono }) {
  return (
    <div className="rs-kpi">
      <span className="rs-kpi-ico">
        <Icono size={18} strokeWidth={2.2} />
      </span>
      <span className="rs-kpi-et">{etiqueta}</span>
      <b className="rs-kpi-val">{valor}</b>
      <small>{nota}</small>
    </div>
  );
}

function AreaAltas({ serie }) {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = 340;
  const pl = 30;
  const pr = 10;
  const pt = 14;
  const pb = 28;
  const n = serie.length;
  const tope = Math.max(2, ...serie.map(([, v]) => v));
  const paso = (W - pl - pr) / (n - 1);
  const x = (i) => pl + i * paso;
  const y = (v) => H - pb - (v / tope) * (H - pt - pb);
  const linea = serie.map(([, v], i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${linea} L${x(n - 1)},${H - pb} L${x(0)},${H - pb} Z`;
  const guias = [0, Math.round(tope / 2), tope];
  const ticks = [0, 7, 14, 21, 29];
  const mover = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(n - 1, Math.round((px - pl) / paso))));
  };

  return (
    <div className="rs-area">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Altas por día" onMouseMove={mover} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="rs-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6a1a" stopOpacity=".28" />
            <stop offset="100%" stopColor="#ff6a1a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {guias.map((g) => (
          <g key={g}>
            <line x1={pl} x2={W - pr} y1={y(g)} y2={y(g)} className="rs-guia" />
            <text x={pl - 8} y={y(g) + 4} textAnchor="end" className="rs-eje">
              {g}
            </text>
          </g>
        ))}
        {ticks.map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="rs-eje">
            {diaCorto(serie[i][0])}
          </text>
        ))}
        <path d={area} fill="url(#rs-grad)" />
        <path d={linea} className="rs-linea" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pt} y2={H - pb} className="rs-cursor" />
            <circle cx={x(hover)} cy={y(serie[hover][1])} r="5" className="rs-punto" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="rs-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>{serie[hover][1]}</b> {serie[hover][1] === 1 ? "alta" : "altas"}
          <small>{diaCorto(serie[hover][0])}</small>
        </div>
      )}
    </div>
  );
}

function Dona({ partes, centro, etiqueta }) {
  const total = partes.reduce((t, p) => t + p.valor, 0);
  const r = 54;
  const c = 2 * Math.PI * r;
  let acum = 0;
  return (
    <div className="rs-dona">
      <div className="rs-dona-graf">
        <svg viewBox="0 0 140 140" role="img" aria-label={etiqueta}>
          <circle cx="70" cy="70" r={r} className="rs-anillo" />
          {total > 0 &&
            partes.map((p) => {
              const largo = (p.valor / total) * c;
              const el = (
                <circle
                  key={p.label}
                  cx="70"
                  cy="70"
                  r={r}
                  className="rs-seg"
                  stroke={p.color}
                  strokeDasharray={`${Math.max(0, largo - 2)} ${c}`}
                  strokeDashoffset={-acum}
                />
              );
              acum += largo;
              return el;
            })}
        </svg>
        <div className="rs-dona-centro">
          <b>{centro}</b>
          <small>{etiqueta}</small>
        </div>
      </div>
      <ul className="rs-leyenda">
        {partes.map((p) => (
          <li key={p.label}>
            <i style={{ background: p.color }} />
            <span>{p.label}</span>
            <b>{p.valor}</b>
            <small>{pct(p.valor, total)}%</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarrasH({ filas, vacio = "Sin datos" }) {
  const max = Math.max(1, ...filas.map((f) => f.valor));
  if (filas.length === 0) return <p className="pl-vacio">{vacio}</p>;
  return (
    <div className="rs-barras">
      {filas.map((f) => (
        <div key={f.label} className="rs-barra">
          <span>{f.label}</span>
          <div>
            <i style={{ width: `${(f.valor / max) * 100}%`, background: f.color ?? "#26262d" }} />
          </div>
          <b>{f.valor}</b>
        </div>
      ))}
    </div>
  );
}

function Ranking({ filas, vacio = "Sin datos" }) {
  if (filas.length === 0) return <p className="pl-vacio">{vacio}</p>;
  return (
    <ol className="rs-ranking">
      {filas.map((f, i) => (
        <li key={f.id}>
          <span className="rs-pos">{i + 1}</span>
          {f.foto ?? (
            <span className="ap-emoji ap-emoji-s">
              <IconoGrupo emoji={f.emoji} size={16} />
            </span>
          )}
          <span className="rs-rank-n">
            {f.nombre}
            {f.sub && <small>{f.sub}</small>}
          </span>
          <b>{f.valor}</b>
        </li>
      ))}
    </ol>
  );
}

function Resumen({ data }) {
  const s = data.stats;
  const d = useMemo(() => {
    const ahora = data.generatedAt;
    const serie = [];
    for (let i = 29; i >= 0; i--) {
      const dia = new Date(ahora - i * DIA).toISOString().slice(0, 10);
      serie.push([dia, s.signupsLast30d[dia] ?? 0]);
    }
    const nuevos30 = serie.reduce((t, [, v]) => t + v, 0);
    const nuevos7 = serie.slice(-7).reduce((t, [, v]) => t + v, 0);
    const act = { s7: 0, s30: 0, mas: 0, nunca: 0 };
    const prov = {};
    for (const u of data.users) {
      if (u.lastSignIn == null) act.nunca++;
      else if (ahora - u.lastSignIn < 7 * DIA) act.s7++;
      else if (ahora - u.lastSignIn < 30 * DIA) act.s30++;
      else act.mas++;
      const p = PROVEEDOR[u.provider] ?? "Otro";
      prov[p] = (prov[p] ?? 0) + 1;
    }
    const vigentes = data.items.filter((i) => !i.isArchived);
    const enGrupos = vigentes.filter((i) => i.groupIds.length > 0).length;
    const porDueno = new Map();
    for (const i of vigentes) porDueno.set(i.ownerId, (porDueno.get(i.ownerId) ?? 0) + 1);
    const topUsuarios = [...porDueno.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, n]) => {
        const u = data.users.find((x) => x.id === id);
        const nombre = cap(u?.displayName) || u?.email || "Usuario";
        return { id, nombre, valor: n, foto: <Foto m={{ photoURL: u?.photoURL, name: nombre }} /> };
      });
    const topGrupos = [...data.groups]
      .sort((a, b) => b.itemCount - a.itemCount)
      .filter((g) => g.itemCount > 0)
      .slice(0, 5)
      .map((g) => ({ id: g.id, nombre: g.name, sub: cap(g.ownerName), valor: g.itemCount, emoji: g.emoji }));
    const prioridad = ["high", "wantALot", "medium", "low"]
      .filter((p) => s.itemsByPriority[p])
      .map((p, i) => ({ label: PRIORIDAD[p], valor: s.itemsByPriority[p], color: COLORES[i === 0 ? 1 : i === 1 ? 2 : i === 2 ? 3 : 4] }));
    return { serie, nuevos30, nuevos7, act, prov, vigentes: vigentes.length, enGrupos, topUsuarios, topGrupos, prioridad };
  }, [data, s]);

  const activos7 = d.act.s7;
  const reservas = Object.entries(s.reservationsByStatus).map(([k, v]) => ({ label: ESTADO_RESERVA[k] ?? k, valor: v, color: "#26262d" }));
  const sorteos = data.secretSanta ?? [];
  const contar = (estado) => sorteos.filter((e) => e.status === estado).length;
  const personas = new Set(sorteos.flatMap((e) => e.participants.map((p) => p.id))).size;
  const totalParticipaciones = sorteos.reduce((t, e) => t + e.participants.length, 0);
  const promedioParticipantes = sorteos.length ? Number((totalParticipaciones / sorteos.length).toFixed(1)) : 0;
  const mayor = Math.max(0, ...sorteos.map((e) => e.participants.length));
  const topSorteos = [...sorteos]
    .sort((a, b) => b.participants.length - a.participants.length)
    .slice(0, 5)
    .map((e) => ({ label: e.name, valor: e.participants.length }));

  return (
    <div className="rs">
      <div className="rs-kpis">
        <Kpi etiqueta="Usuarios" valor={s.users} nota={`${d.nuevos30} nuevos en 30 días`} icono={Users} />
        <Kpi etiqueta="Activos 7 días" valor={activos7} nota={`${pct(activos7, s.users)}% del total`} icono={Activity} />
        <Kpi etiqueta="Grupos" valor={s.groups} nota={`${s.avgMembersPerGroup} miembros por grupo`} icono={UsersRound} />
        <Kpi etiqueta="Ítems vigentes" valor={d.vigentes} nota={`${s.itemsArchived} archivados`} icono={Gift} />
      </div>

      <div className="rs-fila rs-fila-2-1">
        <Panel2 titulo="Altas de usuarios" sub={`${d.nuevos7} en los últimos 7 días · ${d.nuevos30} en 30 días`}>
          <AreaAltas serie={d.serie} />
        </Panel2>
        <Panel2 titulo="Actividad de usuarios" sub="Según último ingreso">
          <Dona
            centro={`${pct(activos7, s.users)}%`}
            etiqueta="activos 7 días"
            partes={[
              { label: "Últimos 7 días", valor: d.act.s7, color: COLORES[1] },
              { label: "8 a 30 días", valor: d.act.s30, color: COLORES[2] },
              { label: "Más de 30 días", valor: d.act.mas, color: COLORES[0] },
              { label: "Nunca ingresó", valor: d.act.nunca, color: COLORES[4] },
            ]}
          />
          <div className="rs-sep">
            <h4>Cómo ingresan</h4>
            <BarrasH filas={Object.entries(d.prov).map(([label, valor], i) => ({ label, valor, color: COLORES[i % COLORES.length] }))} />
          </div>
        </Panel2>
      </div>

      <div className="rs-fila rs-fila-2">
        <Panel2 titulo="Estado de los ítems" sub="Vigentes y archivados">
          <Dona
            centro={d.vigentes + s.itemsArchived}
            etiqueta="ítems"
            partes={[
              { label: "En grupos", valor: d.enGrupos, color: COLORES[1] },
              { label: "Solo lista propia", valor: d.vigentes - d.enGrupos, color: COLORES[2] },
              { label: "Archivados", valor: s.itemsArchived, color: COLORES[4] },
            ]}
          />
        </Panel2>
        <Panel2 titulo="Ítems por prioridad" sub="Qué tan deseados son">
          <BarrasH filas={d.prioridad} />
        </Panel2>
      </div>

      <div className="rs-fila rs-fila-2">
        <Panel2 titulo="Usuarios con más ítems" sub="Solo ítems vigentes">
          <Ranking filas={d.topUsuarios} />
        </Panel2>
        <Panel2 titulo="Grupos con más ítems">
          <Ranking filas={d.topGrupos} vacio="Ningún grupo tiene ítems" />
        </Panel2>
      </div>

      <div className="rs-fila rs-fila-2">
        <Panel2 titulo="Amigo Invisible" sub="Eventos según el estado del sorteo">
          <Dona
            centro={sorteos.length}
            etiqueta={sorteos.length === 1 ? "evento" : "eventos"}
            partes={[
              { label: ESTADO_SORTEO.drawn, valor: contar("drawn"), color: COLORES[1] },
              { label: ESTADO_SORTEO.completed, valor: contar("completed"), color: COLORES[3] },
              { label: ESTADO_SORTEO.draft, valor: contar("draft"), color: COLORES[2] },
              { label: ESTADO_SORTEO.cancelled, valor: contar("cancelled"), color: COLORES[4] },
            ]}
          />
        </Panel2>
        <Panel2 titulo="Participación en sorteos" sub="Cuánta gente juega">
          <div className="rs-mini rs-mini-3">
            <div>
              <b>{personas}</b>
              <span>Personas distintas</span>
            </div>
            <div>
              <b>{promedioParticipantes}</b>
              <span>Promedio por evento</span>
            </div>
            <div>
              <b>{mayor}</b>
              <span>Evento más grande</span>
            </div>
          </div>
          <div className="rs-sub">
            <h4>Eventos con más participantes</h4>
            <BarrasH filas={topSorteos} vacio="Todavía no hay eventos" />
          </div>
        </Panel2>
      </div>

      <Panel2 titulo="Otras métricas" sub="Reservas solo como cantidades">
        <div className="rs-mini rs-mini-3">
          <div>
            <b>{s.activeLast1d}</b>
            <span>Activos en 24 h</span>
          </div>
          <div>
            <b>{s.reservations}</b>
            <span>Reservas</span>
          </div>
          <div>
            <b>{s.history}</b>
            <span>Regalos en historial</span>
          </div>
        </div>
        {reservas.length > 0 && (
          <div className="rs-sub">
            <h4>Reservas por estado</h4>
            <BarrasH filas={reservas} />
          </div>
        )}
      </Panel2>
    </div>
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

const llamar = async (nombre, datos) => {
  try {
    const res = await httpsCallable(functions, nombre)(datos);
    return res.data;
  } catch (e) {
    const generico = e.code === "functions/internal" || e.code === "functions/unavailable" || !e.message;
    throw new Error(generico ? "No se pudo completar la acción. Probá de nuevo." : e.message);
  }
};

function Confirmar({ titulo, texto, boton, peligro, escribir, trabajando, error, onConfirmar, onCancelar }) {
  const [valor, setValor] = useState("");
  const listo = !escribir || valor.trim().toLowerCase() === escribir.toLowerCase();
  return (
    <Modal titulo={titulo} sub="Esta acción queda registrada" icono={<span className="ap-emoji">{peligro ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}</span>} onClose={trabajando ? () => {} : onCancelar}>
      <p className="ap-conf-texto">{texto}</p>
      {escribir && (
        <label className="ap-conf-campo">
          <span>
            Para confirmar, escribí <b>{escribir}</b>
          </span>
          <input value={valor} onChange={(e) => setValor(e.target.value)} autoFocus autoComplete="off" />
        </label>
      )}
      {error && <p className="ap-conf-error">{error}</p>}
      <div className="ap-conf-botones">
        <button type="button" className="ap-boton" onClick={onCancelar} disabled={trabajando}>
          Cancelar
        </button>
        <button type="button" className={`ap-boton ${peligro ? "ap-boton-peligro" : "ap-boton-oscuro"}`} onClick={onConfirmar} disabled={!listo || trabajando}>
          {trabajando ? "Procesando…" : boton}
        </button>
      </div>
    </Modal>
  );
}

function Accion({ titulo, texto, boton, onClick, peligro, deshabilitado, motivo }) {
  return (
    <div className="ap-accion">
      <div>
        <b>{titulo}</b>
        <small>{deshabilitado && motivo ? motivo : texto}</small>
      </div>
      <button type="button" className={`ap-boton ${peligro ? "ap-boton-peligro-suave" : ""}`} onClick={onClick} disabled={deshabilitado}>
        {boton}
      </button>
    </div>
  );
}

function DetalleUsuario({ u, data, me = {}, onCambio, onClose }) {
  const [conf, setConf] = useState(null);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState("");
  const grupos = data.groups.filter((g) => g.members.some((m) => m.id === u.id)).sort((a, b) => b.itemCount - a.itemCount);
  const nombre = cap(u.displayName) || u.email;
  const esYo = u.id === me.uid;
  const motivo = "Es admin: primero quitale el rol en la pestaña Admins.";

  const acciones = {
    pausar: {
      titulo: `Pausar la cuenta de ${nombre}`,
      texto: "No va a poder entrar a GiftSquad hasta que la reactives, y se le cierra la sesión actual. Sus datos no se tocan.",
      boton: "Pausar cuenta",
      correr: () => llamar("adminSetUserDisabled", { uid: u.id, disabled: true }),
    },
    reactivar: {
      titulo: `Reactivar la cuenta de ${nombre}`,
      texto: "Va a poder volver a entrar a GiftSquad.",
      boton: "Reactivar cuenta",
      correr: () => llamar("adminSetUserDisabled", { uid: u.id, disabled: false }),
    },
    admin: {
      titulo: `Dar acceso de admin a ${nombre}`,
      texto: "Va a poder ver todo el panel y pausar, eliminar y crear admins. Tiene que haber entrado con un email verificado.",
      boton: "Hacer admin",
      correr: () => llamar("adminAddAdmin", { email: u.email }),
    },
    eliminar: {
      titulo: `Eliminar a ${nombre}`,
      texto: "Se borra su cuenta y todo lo suyo: ítems, reservas, grupos que creó y sorteos que organizó. Los grupos con más gente pasan a los demás miembros. No se puede deshacer.",
      boton: "Eliminar para siempre",
      peligro: true,
      escribir: "ELIMINAR",
      correr: () => llamar("adminDeleteUser", { uid: u.id }),
    },
  };

  const ejecutar = async () => {
    setTrabajando(true);
    setError("");
    try {
      await acciones[conf].correr();
      await onCambio();
      setConf(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setTrabajando(false);
    }
  };

  if (conf) {
    const a = acciones[conf];
    return (
      <Confirmar
        titulo={a.titulo}
        texto={a.texto}
        boton={a.boton}
        peligro={a.peligro}
        escribir={a.escribir}
        trabajando={trabajando}
        error={error}
        onConfirmar={ejecutar}
        onCancelar={() => {
          setConf(null);
          setError("");
        }}
      />
    );
  }

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
        <div>
          <dt>Estado</dt>
          <dd>{u.disabled ? "Pausada" : "Activa"}</dd>
        </div>
        <div>
          <dt>Rol</dt>
          <dd>{u.isAdmin ? "Admin" : "Usuario"}</dd>
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
      <h4>Administrar</h4>
      <div className="ap-acciones-lista">
        {u.disabled && !esYo && (
          <Accion titulo="Cuenta pausada" texto="No puede entrar a GiftSquad." boton="Reactivar" onClick={() => setConf("reactivar")} />
        )}
        {!u.disabled && !esYo && (
          <Accion titulo="Pausar cuenta" texto="Le impide entrar sin borrar nada." boton="Pausar" onClick={() => setConf("pausar")} deshabilitado={u.isAdmin} motivo={motivo} />
        )}
        {!u.isAdmin && (
          <Accion titulo="Dar acceso de admin" texto="Podrá usar este panel." boton="Hacer admin" onClick={() => setConf("admin")} deshabilitado={!u.email || u.disabled} motivo={u.disabled ? "Está pausada." : "No tiene email."} />
        )}
        {!esYo && (
          <Accion titulo="Eliminar usuario" texto="Borra su cuenta y todos sus datos." boton="Eliminar" peligro onClick={() => setConf("eliminar")} deshabilitado={u.isAdmin} motivo={motivo} />
        )}
        {esYo && (
          <div className="ap-accion">
            <div>
              <b>Es tu cuenta</b>
              <small>No podés pausarla ni eliminarla desde el panel.</small>
            </div>
          </div>
        )}
      </div>
      <h4>Grupos</h4>
      {grupos.length === 0 ? (
        <p className="pl-vacio">No pertenece a ningún grupo.</p>
      ) : (
        <ul className="ap-miembros">
          {grupos.map((g) => (
            <li key={g.id}>
              <span className="ap-emoji ap-emoji-s">
                <IconoGrupo emoji={g.emoji} size={16} />
              </span>
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

function Usuarios({ data, q, me, onCambio }) {
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
                  {u.isAdmin && <span className="ap-u-admin">Admin</span>}
                  {u.disabled && <span className="ap-u-mal">Pausada</span>}
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
        {filas.length === 0 && <p className="pl-vacio">Sin resultados.</p>}
      </div>
      {elegido && <DetalleUsuario u={elegido} data={data} me={me} onCambio={onCambio} onClose={cerrar} />}
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
    <div
      className="ap-fondo"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="ap-modal" role="dialog" aria-modal="true" aria-label={titulo}>
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
    <Modal titulo={g.name} sub={`Creado por ${cap(g.ownerName)}`} icono={
        <span className="ap-emoji">
          <IconoGrupo emoji={g.emoji} />
        </span>
      } onClose={onClose}>
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
            <p className="pl-vacio">Este grupo todavía no tiene ítems.</p>
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
    <div className="pl-lista">
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
      {duenos.length === 0 && <p className="pl-vacio">Sin resultados.</p>}
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
                <IconoGrupo emoji={g.emoji} />
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
        {grupos.length === 0 && <p className="pl-vacio">Sin resultados.</p>}
      </div>
      {sel && data.groups.find((g) => g.id === sel) && (
        <DetalleGrupo g={data.groups.find((g) => g.id === sel)} data={data} onClose={cerrar} />
      )}
    </>
  );
}

function Admins({ data, me: yo, onCambio }) {
  const admins = data.admins ?? [];
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [trabajando, setTrabajando] = useState(false);
  const [quitar, setQuitar] = useState(null);
  const [errorQuitar, setErrorQuitar] = useState("");
  const unico = admins.length <= 1;

  const agregar = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setTrabajando(true);
    setMsg(null);
    try {
      await llamar("adminAddAdmin", { email });
      await onCambio();
      setMsg({ ok: true, texto: `${email.trim().toLowerCase()} ahora es admin.` });
      setEmail("");
    } catch (err) {
      setMsg({ ok: false, texto: err.message });
    } finally {
      setTrabajando(false);
    }
  };

  const confirmarQuitar = async () => {
    setTrabajando(true);
    setErrorQuitar("");
    try {
      await llamar("adminRemoveAdmin", { email: quitar.email });
      await onCambio();
      setQuitar(null);
    } catch (err) {
      setErrorQuitar(err.message);
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <div className="ap-admins">
      <form className="ap-nuevo" onSubmit={agregar}>
        <div>
          <b>Agregar un admin</b>
          <small>La persona tiene que haber entrado a GiftSquad antes, con un email verificado.</small>
        </div>
        <div className="ap-nuevo-campo">
          <input type="email" placeholder="email@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email del nuevo admin" />
          <button type="submit" className="ap-boton ap-boton-oscuro" disabled={trabajando || !email.trim()}>
            Agregar
          </button>
        </div>
        {msg && <p className={msg.ok ? "ap-nuevo-ok" : "ap-conf-error"}>{msg.texto}</p>}
      </form>

      <ul className="ap-admins-lista">
        {admins.map((a) => {
          const nombre = cap(a.name) || a.email;
          const soyYo = a.email === yo.email;
          return (
            <li key={a.email}>
              <Foto m={{ photoURL: a.photoURL, name: nombre }} grande />
              <span className="ap-u-quien">
                <b>
                  {nombre}
                  {soyYo && <span className="ap-u-admin">Vos</span>}
                </b>
                <small>
                  {a.email}
                  {a.addedBy && a.addedBy !== "semilla" ? ` · agregado por ${a.addedBy}` : ""}
                  {a.addedAt ? ` el ${fecha(a.addedAt)}` : ""}
                </small>
              </span>
              <button
                type="button"
                className="ap-boton ap-boton-peligro-suave"
                disabled={soyYo || unico}
                title={soyYo ? "No podés quitarte el rol a vos mismo" : unico ? "Tiene que haber al menos un admin" : undefined}
                onClick={() => setQuitar(a)}
              >
                Quitar acceso
              </button>
            </li>
          );
        })}
      </ul>
      <p className="ap-admins-nota">Siempre tiene que haber al menos un admin. No podés quitarte el acceso a vos mismo: lo tiene que hacer otro admin.</p>

      {quitar && (
        <Confirmar
          titulo={`Quitar acceso a ${cap(quitar.name) || quitar.email}`}
          texto="Deja de poder usar este panel. Su cuenta de GiftSquad sigue funcionando igual."
          boton="Quitar acceso"
          peligro
          trabajando={trabajando}
          error={errorQuitar}
          onConfirmar={confirmarQuitar}
          onCancelar={() => {
            setQuitar(null);
            setErrorQuitar("");
          }}
        />
      )}
    </div>
  );
}

function DetalleSorteo({ e, onClose }) {
  const sorteado = e.status === "drawn" || e.status === "completed";
  return (
    <Modal
      titulo={e.name}
      sub={`Organiza ${cap(e.organizerName)}`}
      icono={
        <span className="ap-emoji">
          <Shuffle size={22} />
        </span>
      }
      onClose={onClose}
    >
      <h4>Evento</h4>
      <dl className="ap-ajustes">
        <div>
          <dt>Estado</dt>
          <dd>{ESTADO_SORTEO[e.status] ?? e.status}</dd>
        </div>
        <div>
          <dt>Creado</dt>
          <dd>{fecha(e.createdAt)}</dd>
        </div>
        {sorteado && (
          <div>
            <dt>Sorteado</dt>
            <dd>{fecha(e.drawnAt)}</dd>
          </div>
        )}
        <div>
          <dt>Fecha del intercambio</dt>
          <dd>{fecha(e.exchangeDate)}</dd>
        </div>
        <div>
          <dt>Presupuesto</dt>
          <dd>{e.budget != null ? plata(e.budget, e.currency) : "—"}</dd>
        </div>
      </dl>
      {e.exclusions && (
        <>
          <h4>Exclusiones · {e.exclusions.length}</h4>
          {e.exclusions.length === 0 ? (
            <p className="pl-vacio">Este evento no tiene exclusiones.</p>
          ) : (
            <ul className="ap-exclusiones">
              {e.exclusions.map((r, i) => (
                <li key={i}>
                  <b>{cap(r.from)}</b>
                  <span>no le regala a</span>
                  <b>{cap(r.to)}</b>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <h4>Participantes · {e.participants.length}</h4>
      <ul className="ap-miembros">
        {e.participants.map((p) => (
          <li key={p.id}>
            <Foto m={p} />
            <span>{cap(p.name)}</span>
            {p.id === e.organizerId && <em>Organiza</em>}
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function Sorteos({ data, q }) {
  const [vista, setVista] = useState("todos");
  const [sel, setSel] = useState(null);
  const cerrar = useCallback(() => setSel(null), []);
  const todos = data.secretSanta ?? [];
  const cumple = (e, v) => v === "todos" || (v === "sorteados" ? e.status === "drawn" || e.status === "completed" : e.status === "draft" || e.status === "cancelled");
  const total = (v) => todos.filter((e) => cumple(e, v)).length;
  const filas = todos
    .filter((e) => `${e.name} ${e.organizerName}`.toLowerCase().includes(q))
    .filter((e) => cumple(e, vista));
  const elegido = sel && todos.find((e) => e.id === sel);

  return (
    <>
      <div className="ap-barra">
        <div className="ap-segmentos" role="tablist">
          {[["todos", "Todos"], ["sorteados", "Sorteados"], ["pendientes", "Sin sortear"]].map(([k, n]) => (
            <button type="button" key={k} className={vista === k ? "on" : ""} onClick={() => setVista(k)}>
              {n}
              <small>{total(k)}</small>
            </button>
          ))}
        </div>
      </div>
      <section className="rs-panel rs-sorteos">
        {filas.length === 0 ? (
          <p className="pl-vacio">Sin resultados.</p>
        ) : (
          <ul className="rs-eventos">
            {filas.map((e) => (
              <li key={e.id}>
                <button type="button" className="rs-ev-fila" onClick={() => setSel(e.id)}>
                  <span className="rs-ev-n">
                    {e.name}
                    <small>
                      Organiza {cap(e.organizerName)}
                      {e.drawnAt ? ` · sorteado el ${fecha(e.drawnAt)}` : ` · creado el ${fecha(e.createdAt)}`}
                    </small>
                  </span>
                  <span className={`rs-estado rs-estado-${e.status}`}>{ESTADO_SORTEO[e.status] ?? e.status}</span>
                  <span className="ap-pila">
                    {e.participants.slice(0, 4).map((p) => (
                      <span key={p.id}>
                        {p.photoURL ? <img src={p.photoURL} alt="" referrerPolicy="no-referrer" /> : (p.name || "?").charAt(0).toUpperCase()}
                      </span>
                    ))}
                    {e.participants.length > 4 && <span className="mas">+{e.participants.length - 4}</span>}
                  </span>
                  <b className="rs-ev-c">
                    {e.participants.length} {e.participants.length === 1 ? "participante" : "participantes"}
                  </b>
                  <ChevronRight size={16} className="ap-flecha" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {elegido && <DetalleSorteo e={elegido} onClose={cerrar} />}
    </>
  );
}

function Panel({ user }) {
  const [tab, setTab] = useState("resumen");
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [denegado, setDenegado] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const res = await httpsCallable(functions, "adminOverview")();
      setData(res.data);
    } catch (e) {
      if (e.code === "functions/permission-denied") {
        setDenegado(true);
        signOut(auth).finally(() => window.location.replace("/"));
        return;
      }
      setError(`No se pudieron cargar los datos (${e.code}).`);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const yo = { uid: user.uid, email: (user.email ?? "").toLowerCase() };
  const ql = q.trim().toLowerCase();
  const titulo = TABS.find(([id]) => id === tab)[1];

  if (denegado || (!data && !error)) return <p className="pl-vacio pl-centro">{denegado ? "" : "Cargando"}</p>;

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
          <button type="button" onClick={() => signOut(auth).finally(() => window.location.replace("/"))}>
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
            {tab !== "resumen" && tab !== "admins" && (
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

        {error && <p className="pl-error">{error}</p>}
        {data && tab === "resumen" && <Resumen data={data} />}
        {data && tab === "usuarios" && <Usuarios data={data} q={ql} me={yo} onCambio={cargar} />}
        {data && tab === "listas" && <Listas data={data} q={ql} />}
        {data && tab === "grupos" && <Grupos data={data} q={ql} />}
        {data && tab === "sorteos" && <Sorteos data={data} q={ql} />}
        {data && tab === "admins" && <Admins data={data} me={yo} onCambio={cargar} />}

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

  if (user === undefined) return <p className="pl-vacio pl-centro">Cargando</p>;

  if (!user) {
    return (
      <main className="lg">
        <section className="lg-card">
          <img src="/logo.png" alt="GiftSquad" width="64" height="64" />
          <h1>Panel de administración</h1>
          <p className="lg-sub">Ingresá con tu cuenta de Google autorizada.</p>

          {!firebaseConfigurado ? (
            <p className="pl-error">Falta la configuración de Firebase (variables VITE_FIREBASE_*).</p>
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
          {error && <p className="pl-error">{error}</p>}
        </section>

        <a className="lg-volver" href="/">
          ← Volver al sitio
        </a>
      </main>
    );
  }

  return <Panel user={user} />;
}
