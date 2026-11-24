import { Fragment } from "react";

export default function RichText({ texto, valores = {} }) {
  const resuelto = texto.replace(/\{(\w+)\}/g, (coincidencia, clave) =>
    clave in valores ? valores[clave] : coincidencia
  );

  return resuelto.split("**").map((parte, i) =>
    i % 2 === 1 ? <strong key={i}>{parte}</strong> : <Fragment key={i}>{parte}</Fragment>
  );
}
