import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const CLAVE = "gs-theme";

function leerGuardado() {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function preferenciaDelSistema() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function guardar(tema) {
  try {
    if (tema) localStorage.setItem(CLAVE, tema);
    else localStorage.removeItem(CLAVE);
    return true;
  } catch (error) {
    return false;
  }
}

export default function ThemeToggle() {
  const [tema, setTema] = useState(leerGuardado);
  const [sistema, setSistema] = useState(preferenciaDelSistema);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const alCambiar = (e) => setSistema(e.matches ? "dark" : "light");
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (tema) {
      root.setAttribute("data-theme", tema);
    } else {
      root.removeAttribute("data-theme");
    }
    guardar(tema);
  }, [tema]);

  const activo = tema ?? sistema;
  const proximo = activo === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTema(proximo)}
      aria-label={proximo === "dark" ? "Activar modo oscuro" : "Activar modo claro"}
      title={proximo === "dark" ? "Modo oscuro" : "Modo claro"}
    >
      {activo === "dark" ? <Sun size={17} strokeWidth={2.2} /> : <Moon size={17} strokeWidth={2.2} />}
    </button>
  );
}
