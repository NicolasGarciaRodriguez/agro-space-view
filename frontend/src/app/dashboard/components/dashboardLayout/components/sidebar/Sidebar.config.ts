import { NavItem } from "./Sidebar.interface";

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: "🏠",
  },
  {
    href: "/dashboard/parcelas",
    label: "Parcelas",
    icon: "🗺",
  },
  {
    href: "/dashboard/cuaderno",
    label: "Cuaderno de campo",
    icon: "📓",
  },
] as const;
