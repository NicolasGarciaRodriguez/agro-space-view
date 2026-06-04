"use client";

import styles from "./DashboardStats.module.scss";
import { DashboardStatsProps } from "./DashboardStats.interface";

const formatSuperficie = (m2: number): string => {
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(1)} ha`;
  return `${m2.toLocaleString("es-ES")} m²`;
};

export const DashboardStats = ({
  totalParcelas,
  superficieTotal,
}: DashboardStatsProps) => {
  const stats = [
    {
      icon: "🗺",
      label: "Parcelas",
      value: totalParcelas.toString(),
      hint: "en esta explotación",
    },
    {
      icon: "📐",
      label: "Superficie total",
      value: formatSuperficie(superficieTotal),
      hint: "suma de todas las parcelas",
    },
    {
      icon: "🛰",
      label: "Último análisis",
      value: "—",
      hint: "ningún análisis aún",
    },
    {
      icon: "📅",
      label: "Días sin analizar",
      value: "—",
      hint: "analiza una parcela",
    },
  ];

  return (
    <div className={styles.stats}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.stats__card}>
          <span className={styles.stats__icon}>{stat.icon}</span>
          <div>
            <p className={styles.stats__label}>{stat.label}</p>
            <p className={styles.stats__value}>{stat.value}</p>
            <p className={styles.stats__hint}>{stat.hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
