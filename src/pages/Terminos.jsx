import { FileText } from "lucide-react";
import DocPage from "./DocPage";

export default function Terminos() {
  return (
    <DocPage
      documento="terminos"
      icono={<FileText size={14} strokeWidth={2.4} aria-hidden="true" />}
    />
  );
}
