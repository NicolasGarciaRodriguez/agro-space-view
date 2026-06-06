export type ParcelaTab = "ndvi" | "analisis" | "cuaderno";

export interface TabConfig {
  id: ParcelaTab;
  label: string;
  icon: string;
}

export const PARCELA_TABS: TabConfig[] = [
  { id: "ndvi", label: "Análisis NDVI", icon: "🛰" },
  { id: "analisis", label: "Historial", icon: "📊" },
  { id: "cuaderno", label: "Cuaderno de campo", icon: "📓" },
];

export const DEFAULT_TAB: ParcelaTab = "ndvi";
