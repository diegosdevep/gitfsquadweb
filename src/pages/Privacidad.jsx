import { Lock } from "lucide-react";
import DocPage from "./DocPage";

export default function Privacidad() {
  return (
    <DocPage
      documento="privacidad"
      icono={<Lock size={14} strokeWidth={2.4} aria-hidden="true" />}
    />
  );
}
