"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/auth/Auth.store";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import { ExplotacionRepository } from "@agrospace/shared/repositories/Explotacion.repository";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { DashboardStats } from "./components/dashboardStats/DashboardStats.component";
import { DashboardInsights } from "./components/dashboardInsights/DashboardInsights.component";
import { DashboardEmpty } from "./components/dashboardEmpty/DashboardEmpty.component";
import { Alerta } from "@/components/alerta/Alerta.component";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import type { ExplotacionStatsDTO } from "@agrospace/shared/dtos/Explotacion.dto";
import styles from "./DashboardMain.module.scss";

const DashboardMap = dynamic(
  () =>
    import("./components/dashboardMap/DashboardMap.component").then(
      (m) => m.DashboardMap,
    ),
  { ssr: false },
);

const NDVI_ALERT_THRESHOLD = 0.3;

export const DashboardMain = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    explotaciones,
    activeExplotacion,
    setExplotaciones,
    setActiveExplotacion,
  } = useExplotacionStore();

  const [parcelas, setParcelas] = useState<ParcelaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ExplotacionStatsDTO | null>(null);
  const [alertaDismissed, setAlertaDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ExplotacionRepository.getAll();
        setExplotaciones(data);

        if (data.length === 0) {
          router.push("/onboarding");
          return;
        }

        if (!activeExplotacion) {
          setActiveExplotacion(data[0]);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!activeExplotacion) return;
    setAlertaDismissed(false);

    const loadData = async () => {
      try {
        const [parcelasData, statsData] = await Promise.all([
          ParcelaRepository.getAll(activeExplotacion._id),
          ExplotacionRepository.getStats(activeExplotacion._id),
        ]);
        setParcelas(parcelasData);
        setStats(statsData);
        console.log("stats:", statsData); 
        console.log("parcelas:", parcelasData);
      } catch {
        setParcelas([]);
      }
    };

    loadData();
  }, [activeExplotacion?._id]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <span className={styles.loading__spinner} />
      </div>
    );
  }

  if (explotaciones.length === 0) {
    return <DashboardEmpty />;
  }

  const superficieTotal = parcelas.reduce((acc, p) => acc + p.superficie, 0);

  const hayAlerta =
    !alertaDismissed &&
    stats?.parcelaPeor != null &&
    stats.parcelaPeor.ndvi < NDVI_ALERT_THRESHOLD;

  const parcelaPeor = hayAlerta
    ? parcelas.find((p) => p.nombre === stats!.parcelaPeor!.nombre)
    : null;

  const ndvi = stats?.parcelaPeor?.ndvi ?? 0;
  const alertaSeverity =
    ndvi < 0.1 ? "Crítico" : ndvi < 0.2 ? "Muy bajo" : "Bajo";
  const alertaType = ndvi < 0.1 ? "error" : "warning";

  return (
    <div className={styles.dashboard}>
      <main className={styles.dashboard__main}>
        {/* Alerta NDVI */}
        {hayAlerta && (
          <Alerta
            type={alertaType}
            title={`Alerta de vegetación — ${alertaSeverity}`}
            body={`${stats!.parcelaPeor!.nombre} tiene un NDVI de ${ndvi.toFixed(3)} — por debajo del umbral mínimo de ${NDVI_ALERT_THRESHOLD}. Puede indicar estrés hídrico o enfermedad.`}
            ctaLabel="Ver parcela →"
            onCta={
              parcelaPeor
                ? () => router.push(`/dashboard/parcelas/${parcelaPeor._id}`)
                : undefined
            }
            onClose={() => setAlertaDismissed(true)}
          />
        )}

        <DashboardStats
          totalParcelas={parcelas.length}
          superficieTotal={superficieTotal}
          stats={stats}
        />

        {parcelas.length > 0 && <DashboardMap parcelas={parcelas} />}

        <DashboardInsights
          explotacion={activeExplotacion}
          parcelas={parcelas}
        />
      </main>
    </div>
  );
};
