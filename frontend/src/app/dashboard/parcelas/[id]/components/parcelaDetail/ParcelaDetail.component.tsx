"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import { isHttpError } from "@/lib/http-error";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import { ParcelaInfo } from "./components/parcelaInfo/ParcelaInfo.component";
import { ParcelaCuaderno } from "./components/parcelaCuaderno/ParcelaCuaderno.component";
import { ParcelaAnalisis } from "./components/parcelaAnalisis/ParcelaAnalisis.component";
import {
  PARCELA_TABS,
  DEFAULT_TAB,
  type ParcelaTab,
} from "./ParcelaDetail.config";
import type { ParcelaDetailProps } from "./ParcelaDetail.interface";
import styles from "./ParcelaDetail.module.scss";
import { ParcelaAnalisisMapa } from "./components/parcelaAnalisisMapa/ParcelaAnalisisMapa.component";
import { ParcelaInsight } from "@/components/parcelaInsight/ParcelaInsight.component";

export const ParcelaDetail = ({ id }: ParcelaDetailProps) => {
  const router = useRouter();
  const activeExplotacion = useExplotacionStore((s) => s.activeExplotacion);

  const [parcela, setParcela] = useState<ParcelaDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ParcelaTab>(DEFAULT_TAB);

  useEffect(() => {
    const load = async () => {
      if (!activeExplotacion) return;
      try {
        const data = await ParcelaRepository.getById(activeExplotacion._id, id);
        setParcela(data);
      } catch (err) {
        setError(
          isHttpError(err)
            ? (err.message ?? "No se pudo cargar la parcela.")
            : "No se pudo cargar la parcela.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, activeExplotacion?._id]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <span className={styles.loading__spinner} />
      </div>
    );
  }

  if (error || !parcela) {
    return (
      <div className={styles.error}>
        <p className={styles.error__text}>
          {error ?? "Parcela no encontrada."}
        </p>
        <button
          className={styles.error__back}
          onClick={() => router.push("/dashboard/parcelas")}
        >
          ← Volver a parcelas
        </button>
      </div>
    );
  }

  return (
    <div className={styles.detail}>
      <button
        className={styles.detail__back}
        onClick={() => router.push("/dashboard/parcelas")}
      >
        ← Volver a parcelas
      </button>

      {/* Info siempre visible */}
      <ParcelaInfo parcela={parcela} />

      {/* Diagnóstico IA — siempre visible, no escondido en un tab */}
      <ParcelaInsight parcelaId={parcela._id.toString()} />

      {/* Tabs */}
      <div className={styles.tabs}>
        {PARCELA_TABS.map((tab) => (
          <button
            key={tab.id}
            className={[
              styles.tabs__item,
              activeTab === tab.id ? styles["tabs__item--active"] : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido de la tab activa */}
      <div className={styles.detail__content}>
        {activeTab === "mapa" && <ParcelaAnalisisMapa parcela={parcela} />}
        {activeTab === "analisis" && (
          <ParcelaAnalisis parcelaId={parcela._id} />
        )}
        {activeTab === "cuaderno" && (
          <ParcelaCuaderno
            parcelaId={parcela._id}
            explotacionId={parcela.explotacionId}
          />
        )}
      </div>
    </div>
  );
};
