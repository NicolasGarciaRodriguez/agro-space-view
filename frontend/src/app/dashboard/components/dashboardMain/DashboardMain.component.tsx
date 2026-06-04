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
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import styles from "./DashboardMain.module.scss";
const DashboardMap = dynamic(
  () =>
    import("./components/dashboardMap/DashboardMap.component").then(
      (m) => m.DashboardMap,
    ),
  { ssr: false },
);

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

    const loadParcelas = async () => {
      try {
        const data = await ParcelaRepository.getAll(activeExplotacion._id);
        setParcelas(data);
      } catch {
        setParcelas([]);
      }
    };

    loadParcelas();
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

  return (
    <div className={styles.dashboard}>
      <main className={styles.dashboard__main}>
        <DashboardStats
          totalParcelas={parcelas.length}
          superficieTotal={superficieTotal}
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
