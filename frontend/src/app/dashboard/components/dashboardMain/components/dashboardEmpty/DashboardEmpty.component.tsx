"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/button/Button.component";
import styles from "./DashboardEmpty.module.scss";

export const DashboardEmpty = () => {
  const router = useRouter();

  return (
    <div className={styles.empty}>
      <div className={styles.empty__card}>
        <span className={styles.empty__icon}>🛰</span>
        <h2 className={styles.empty__title}>Bienvenido a AgroSpaceView</h2>
        <p className={styles.empty__description}>
          Todavía no tienes ninguna explotación configurada. Crea la primera
          para empezar a monitorear tus parcelas desde el satélite.
        </p>
        <Button size="lg" onClick={() => router.push("/onboarding")}>
          Crear mi primera explotación
        </Button>
      </div>
    </div>
  );
};
