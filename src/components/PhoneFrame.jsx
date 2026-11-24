import { useState } from "react";
import { ImageOff } from "lucide-react";
import { useLang } from "../idiomas";

export default function PhoneFrame({ src, alt, pie, indice = 0 }) {
  const [falta, setFalta] = useState(false);
  const { t } = useLang();

  return (
    <div className="phone" style={{ "--i": indice }}>
      {falta ? (
        <div className="phone-empty">
          <ImageOff size={20} strokeWidth={2} aria-hidden="true" />
          <span>{pie}</span>
          <small>
            {t.doc.faltaCaptura}
            <br />
            {src}
          </small>
        </div>
      ) : (
        <img src={src} alt={alt} onError={() => setFalta(true)} loading="lazy" />
      )}
    </div>
  );
}
