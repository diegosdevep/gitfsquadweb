import {
  Bell,
  Bookmark,
  CircleHelp,
  CopyCheck,
  EyeOff,
  Gift,
  HandCoins,
  History,
  Link2,
  ListChecks,
  LockKeyhole,
  Users,
  VenetianMask,
  Wallet,
} from "lucide-react";

const iconos = {
  link: Link2,
  anonimo: EyeOff,
  grupos: Users,
  sorteo: VenetianMask,
  aportes: HandCoins,
  historial: History,
  duplicado: CopyCheck,
  duda: CircleHelp,
  spoiler: EyeOff,
  plata: Wallet,
  lista: ListChecks,
  reserva: LockKeyhole,
  regalo: Gift,
  avisos: Bell,
  ideas: Bookmark,
};

export default function FeatureIcon({ nombre, size = 17 }) {
  const Icono = iconos[nombre] ?? Link2;
  return <Icono size={size} strokeWidth={2.2} aria-hidden="true" />;
}
