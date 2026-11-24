import { createContext, useContext, useEffect, useState } from "react";
import es from "./es";
import en from "./en";
import * as legalEs from "./legal-es";
import * as legalEn from "./legal-en";

const CLAVE = "gs-lang";

const idiomas = {
  es: { ui: es, legal: legalEs },
  en: { ui: en, legal: legalEn },
};

const LangContext = createContext(null);

function leerGuardado() {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === "es" || v === "en" ? v : null;
  } catch {
    return null;
  }
}

function guardar(lang) {
  try {
    localStorage.setItem(CLAVE, lang);
    return true;
  } catch (error) {
    return false;
  }
}

function idiomaDelNavegador() {
  const nav = navigator.language || "es";
  return nav.toLowerCase().startsWith("en") ? "en" : "es";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => leerGuardado() ?? idiomaDelNavegador());

  useEffect(() => {
    document.documentElement.lang = lang;
    guardar(lang);
  }, [lang]);

  const valor = {
    lang,
    setLang: setLangState,
    t: idiomas[lang].ui,
    legal: idiomas[lang].legal,
  };

  return <LangContext.Provider value={valor}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang debe usarse dentro de LanguageProvider");
  return ctx;
}
