"use client";

import styles from "./DashboardStats.module.scss";
import type { DashboardStatsProps } from "./DashboardStats.interface";

const formatSuperficie = (m2: number): string => {
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(1)} ha`;
  return `${m2.toLocaleString("es-ES")} m²`;
};

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getNdviColor = (ndvi: number): string => {
  if (ndvi >= 0.6) return "oklch(0.65 0.15 150)";
  if (ndvi >= 0.3) return "oklch(0.75 0.15 90)";
  return "oklch(0.65 0.18 25)";
};

export const DashboardStats = ({
  totalParcelas,
  superficieTotal,
  stats,
}: DashboardStatsProps) => {
  const cards = [
    {
      icon: "🗺",
      label: "Parcelas",
      value: totalParcelas.toString(),
      hint: `${stats?.parcelasAnalizadas ?? 0} analizadas`,
    },
    {
      icon: "📐",
      label: "Superficie total",
      value: formatSuperficie(superficieTotal),
      hint: "suma de todas las parcelas",
    },
    {
      icon: "🛰",
      label: "NDVI medio",
      value: stats?.ndviMedio != null ? stats.ndviMedio.toFixed(3) : "—",
      hint:
        stats?.ndviMedio != null
          ? stats.ndviMedio >= 0.6
            ? "Vegetación sana"
            : stats.ndviMedio >= 0.3
              ? "Vegetación moderada"
              : "Estrés detectado"
          : "Sin análisis aún",
      color:
        stats?.ndviMedio != null ? getNdviColor(stats.ndviMedio) : undefined,
    },
    {
      icon: "📅",
      label: "Último análisis",
      value: stats?.ultimoAnalisis ? formatDate(stats.ultimoAnalisis) : "—",
      hint:
        stats?.diasSinAnalizar != null
          ? `hace ${stats.diasSinAnalizar} días`
          : "ningún análisis aún",
    },
    {
      icon: "🌿",
      label: "Mejor parcela",
      value: stats?.parcelaMejor?.nombre ?? "—",
      hint: stats?.parcelaMejor
        ? `NDVI ${stats.parcelaMejor.ndvi.toFixed(3)}`
        : "sin datos",
      color: stats?.parcelaMejor
        ? getNdviColor(stats.parcelaMejor.ndvi)
        : undefined,
    },
    {
      icon: "⚠",
      label: "Peor parcela",
      value: stats?.parcelaPeor?.nombre ?? "—",
      hint: stats?.parcelaPeor
        ? `NDVI ${stats.parcelaPeor.ndvi.toFixed(3)}`
        : "sin datos",
      color: stats?.parcelaPeor
        ? getNdviColor(stats.parcelaPeor.ndvi)
        : undefined,
    },
  ];

  return (
    <div className={styles.stats}>
      {cards.map((stat) => (
        <div key={stat.label} className={styles.stats__card}>
          <span className={styles.stats__icon}>{stat.icon}</span>
          <div>
            <p className={styles.stats__label}>{stat.label}</p>
            <p
              className={styles.stats__value}
              style={stat.color ? { color: stat.color } : undefined}
            >
              {stat.value}
            </p>
            <p className={styles.stats__hint}>{stat.hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
