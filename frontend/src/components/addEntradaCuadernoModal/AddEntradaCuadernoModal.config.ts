import type {
  EntradaDatosDTO,
  EntradaTipo,
} from "@agrospace/shared/dtos/CuadernoEntrada.dto";

type ValidatorFn = (datos: EntradaDatosDTO) => string | null;

const hasValue = (v: unknown): boolean =>
  v !== undefined &&
  v !== null &&
  v !== "" &&
  (typeof v !== "number" || !isNaN(v));

export const ENTRADA_VALIDATORS: Record<EntradaTipo, ValidatorFn> = {
  riego: (d) => {
    if (!hasValue(d.litrosPorM2)) return "Litros por m² es obligatorio";
    if (!hasValue(d.horas)) return "Las horas de riego son obligatorias";
    if (!hasValue(d.metodo)) return "El método de riego es obligatorio";
    return null;
  },
  fertilizacion: (d) => {
    if (!hasValue(d.producto)) return "El producto es obligatorio";
    if (!hasValue(d.dosis)) return "La dosis es obligatoria";
    if (!hasValue(d.unidad)) return "La unidad es obligatoria";
    return null;
  },
  tratamiento: (d) => {
    if (!hasValue(d.producto)) return "El producto es obligatorio";
    if (!hasValue(d.motivoTratamiento)) return "El motivo es obligatorio";
    if (!hasValue(d.plaga)) return "La plaga o enfermedad es obligatoria";
    return null;
  },
  cosecha: (d) => {
    if (!hasValue(d.kg)) return "Los kilogramos son obligatorios";
    if (!hasValue(d.calidad)) return "La calidad es obligatoria";
    if (!hasValue(d.destino)) return "El destino es obligatorio";
    return null;
  },
  observacion: (d) => {
    if (!hasValue(d.texto)) return "El texto de la observación es obligatorio";
    return null;
  },
};

export const validateEntradas = (
  datosPorTipo: Record<string, EntradaDatosDTO>,
  fecha: string,
): string | null => {
  if (!fecha) return "La fecha es obligatoria";

  const tiposConDatos = Object.entries(datosPorTipo).filter(([, d]) =>
    Object.values(d).some((v) => hasValue(v)),
  ) as [EntradaTipo, EntradaDatosDTO][];

  if (tiposConDatos.length === 0) {
    return "Debes rellenar al menos un tipo de entrada";
  }

  for (const [tipo, datos] of tiposConDatos) {
    const error = ENTRADA_VALIDATORS[tipo](datos);
    if (error)
      return `${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${error}`;
  }

  return null;
};
