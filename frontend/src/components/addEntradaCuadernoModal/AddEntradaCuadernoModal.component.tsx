"use client";

import { useEffect, useState } from "react";
import { CuadernoEntradaRepository } from "@agrospace/shared/repositories/CuadernoEntrada.repository";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import { EntradaCuadernoRiego } from "./components/entradaCuadernoRiego/EntradaCuadernoRiego.component";
import { EntradaCuadernoFertilizacion } from "./components/entradaCuadernoFertilizacion/EntradaCuadernoFertilizacion.component";
import { EntradaCuadernoTratamiento } from "./components/entradaCuadernoTratamiento/EntradaCuadernoTratamiento.component";
import { EntradaCuadernoCosecha } from "./components/entradaCuadernoCosecha/EntradaCuadernoCosecha.component";
import { EntradaCuadernoObservacion } from "./components/entradaCuadernoObservacion/EntradaCuadernoObservacion.component";
import {
  TIPO_CONFIG,
  type AddEntradaCuadernoModalProps,
} from "./AddEntradaCuadernoModal.interface";
import { validateEntradas } from "./AddEntradaCuadernoModal.config";
import type { EntradaDatosDTO } from "@agrospace/shared/dtos/CuadernoEntrada.dto";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import styles from "./AddEntradaCuadernoModal.module.scss";
import { EntradaTipo } from "@agrospace/shared/enums/EntradaTipo.enum";

const TIPOS = Object.entries(TIPO_CONFIG) as [
  EntradaTipo,
  { label: string; icon: string },
][];

export const AddEntradaCuadernoModal = ({
  parcelaId: parcelaIdFija,
  explotacionId,
  entradaToEdit,
  onCreated,
  onClose,
}: AddEntradaCuadernoModalProps) => {
  const isEditing = !!entradaToEdit;
  const today = new Date().toISOString().split("T")[0];

  // Si viene una parcelaId fija (contexto ya conocido) o estamos
  // editando (la entrada ya tiene su parcela), no hace falta selector.
  const requiereSelectorParcela = !parcelaIdFija && !isEditing;

  const [parcelas, setParcelas] = useState<ParcelaDTO[]>([]);
  const [parcelaIdSeleccionada, setParcelaIdSeleccionada] = useState(
    parcelaIdFija ?? entradaToEdit?.parcelaId ?? "",
  );
  const [isLoadingParcelas, setIsLoadingParcelas] = useState(
    requiereSelectorParcela,
  );

  const [tipo, setTipo] = useState<EntradaTipo>(
    entradaToEdit?.tipo ?? EntradaTipo.RIEGO,
  );
  const [fecha, setFecha] = useState(
    entradaToEdit
      ? new Date(entradaToEdit.fecha).toISOString().split("T")[0]
      : today,
  );
  const [datosPorTipo, setDatosPorTipo] = useState<
    Record<string, EntradaDatosDTO>
  >(entradaToEdit ? { [entradaToEdit.tipo]: entradaToEdit.datos } : {});
  const [notas, setNotas] = useState(entradaToEdit?.notas ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const datos = datosPorTipo[tipo] ?? {};

  useEffect(() => {
    if (!requiereSelectorParcela) return;
    setIsLoadingParcelas(true);
    ParcelaRepository.getAll(explotacionId)
      .then((data) => {
        setParcelas(data);
        if (data.length === 1) setParcelaIdSeleccionada(data[0]._id);
      })
      .catch(() => setParcelas([]))
      .finally(() => setIsLoadingParcelas(false));
  }, [requiereSelectorParcela, explotacionId]);

  const handleTipoChange = (newTipo: EntradaTipo) => {
    if (isEditing) return;
    setTipo(newTipo);
  };

  const handleDatosChange = (newDatos: EntradaDatosDTO) => {
    setDatosPorTipo((prev) => ({ ...prev, [tipo]: newDatos }));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (requiereSelectorParcela && !parcelaIdSeleccionada) {
      setError("Selecciona una parcela para esta entrada.");
      return;
    }

    if (isEditing) {
      const validationError = validateEntradas(
        { [tipo]: datosPorTipo[tipo] ?? {} },
        fecha,
      );
      if (validationError) {
        setError(validationError);
        return;
      }
    } else {
      const validationError = validateEntradas(datosPorTipo, fecha);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isEditing && entradaToEdit) {
        await CuadernoEntradaRepository.update(entradaToEdit._id, {
          fecha,
          datos: datosPorTipo[tipo] ?? {},
          notas: notas.trim() || undefined,
        });
        onCreated();
      } else {
        const tiposConDatos = Object.entries(datosPorTipo).filter(([, d]) =>
          Object.values(d).some(
            (v) => v !== undefined && v !== "" && v !== null,
          ),
        ) as [EntradaTipo, EntradaDatosDTO][];

        const entradasACrear =
          tiposConDatos.length > 0
            ? tiposConDatos
            : [[tipo, datos] as [EntradaTipo, EntradaDatosDTO]];

        await Promise.all(
          entradasACrear.map(([t, d]) =>
            CuadernoEntradaRepository.create({
              parcelaId: parcelaIdSeleccionada,
              explotacionId,
              fecha,
              tipo: t,
              datos: d,
              notas: notas.trim() || undefined,
            }),
          ),
        );
        onCreated();
      }
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al guardar la entrada.")
          : "Error al guardar la entrada.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderDatosForm = () => {
    const props = { datos, onChange: handleDatosChange, disabled: isLoading };
    switch (tipo) {
      case "riego":
        return <EntradaCuadernoRiego {...props} />;
      case "fertilizacion":
        return <EntradaCuadernoFertilizacion {...props} />;
      case "tratamiento":
        return <EntradaCuadernoTratamiento {...props} />;
      case "cosecha":
        return <EntradaCuadernoCosecha {...props} />;
      case "observacion":
        return <EntradaCuadernoObservacion {...props} />;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-cuaderno-title"
      >
        <header className={styles.modal__header}>
          <h2 id="modal-cuaderno-title" className={styles.modal__title}>
            {isEditing ? "Editar entrada" : "Nueva entrada"}
          </h2>
          <button
            className={styles.modal__close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <form className={styles.modal__form} onSubmit={handleSubmit} noValidate>
          {requiereSelectorParcela && (
            <div className={styles.parcelaSelector}>
              <label
                className={styles.parcelaSelector__label}
                htmlFor="parcela"
              >
                Parcela
              </label>
              <select
                id="parcela"
                className={styles.parcelaSelector__select}
                value={parcelaIdSeleccionada}
                onChange={(e) => setParcelaIdSeleccionada(e.target.value)}
                disabled={isLoading || isLoadingParcelas}
                required
              >
                {isLoadingParcelas ? (
                  <option value="">Cargando parcelas…</option>
                ) : (
                  <>
                    <option value="" disabled>
                      Selecciona una parcela
                    </option>
                    {parcelas.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.nombre}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          )}

          <div className={styles.tipos}>
            {TIPOS.map(([key, config]) => (
              <button
                key={key}
                type="button"
                className={[
                  styles.tipos__item,
                  tipo === key ? styles["tipos__item--active"] : "",
                  isEditing && tipo !== key
                    ? styles["tipos__item--disabled"]
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleTipoChange(key)}
                disabled={isLoading || (isEditing && tipo !== key)}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            ))}
          </div>

          <Input
            id="fecha"
            type="date"
            label="Fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            disabled={isLoading}
            max={today}
            required
          />

          {renderDatosForm()}

          <div className={styles.notas}>
            <label className={styles.notas__label} htmlFor="notas">
              Notas (opcional)
            </label>
            <textarea
              id="notas"
              className={styles.notas__textarea}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className={styles.modal__error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.modal__actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditing ? "Guardar cambios" : "Guardar entrada"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};