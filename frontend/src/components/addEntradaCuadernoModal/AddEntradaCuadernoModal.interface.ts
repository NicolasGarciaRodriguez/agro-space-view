import type {
  EntradaDatosDTO,
  EntradaTipo,
  CuadernoEntradaDTO,
} from "@agrospace/shared/dtos/CuadernoEntrada.dto";

export interface AddEntradaCuadernoModalProps {
  parcelaId: string;
  explotacionId: string;
  entradaToEdit?: CuadernoEntradaDTO;
  onCreated: () => void;
  onClose: () => void;
}

export interface EntradaCuadernoFormProps {
  datos: EntradaDatosDTO;
  onChange: (datos: EntradaDatosDTO) => void;
  disabled: boolean;
}

export const TIPO_CONFIG: Record<EntradaTipo, { label: string; icon: string }> =
  {
    riego: { label: "Riego", icon: "💧" },
    fertilizacion: { label: "Fertilización", icon: "🌱" },
    tratamiento: { label: "Tratamiento", icon: "🧪" },
    cosecha: { label: "Cosecha", icon: "🌾" },
    observacion: { label: "Observación", icon: "📝" },
  };
