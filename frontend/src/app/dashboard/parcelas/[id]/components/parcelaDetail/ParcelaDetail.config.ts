export type ParcelaTab = "mapa" | "analisis" | "cuaderno";

export interface TabConfig {
  id: ParcelaTab;
  label: string;
  icon: string;
}

export const PARCELA_TABS: TabConfig[] = [
  { id: "mapa", label: "Mapa satelital", icon: "🛰" },
  { id: "analisis", label: "Historial", icon: "📊" },
  { id: "cuaderno", label: "Cuaderno de campo", icon: "📓" },
];

export const DEFAULT_TAB: ParcelaTab = "mapa";
