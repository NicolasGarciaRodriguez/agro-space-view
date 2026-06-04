"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import { isHttpError } from "@/lib/http-error";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import styles from "./ParcelaDetail.module.scss";
import { ParcelaDetailProps } from "./ParcelaDetail.interface";
import { ParcelaInfo } from "./components/parcelaInfo/ParcelaInfo.component";
import { ParcelaNdvi } from "./components/parcelaNdvi/ParcelaNdvi.component";
import { ParcelaCuaderno } from "./components/parcelaCuaderno/ParcelaCuaderno.component";

export const ParcelaDetail = ({ id }: ParcelaDetailProps) => {
  const router = useRouter();
  const activeExplotacion = useExplotacionStore((s) => s.activeExplotacion);

  const [parcela, setParcela] = useState<ParcelaDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      <ParcelaInfo parcela={parcela} />
      <ParcelaNdvi parcela={parcela} />
      <ParcelaCuaderno
        parcelaId={parcela._id}
        explotacionId={parcela.explotacionId}
      />
    </div>
  );
};
