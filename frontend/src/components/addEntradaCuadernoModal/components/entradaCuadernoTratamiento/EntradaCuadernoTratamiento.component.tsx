"use client";

import { Input } from "@/components/input/Input.component";
import type { EntradaCuadernoFormProps } from "../../AddEntradaCuadernoModal.interface";

export const EntradaCuadernoTratamiento = ({
  datos,
  onChange,
  disabled,
}: EntradaCuadernoFormProps) => {
  return (
    <>
      <Input
        id="producto"
        type="text"
        label="Producto"
        placeholder="Cobre oxicloruro 50%"
        value={datos.producto ?? ""}
        onChange={(e) =>
          onChange({ ...datos, producto: e.target.value || undefined })
        }
        disabled={disabled}
      />
      <Input
        id="motivoTratamiento"
        type="text"
        label="Motivo"
        placeholder="Preventivo, curativo..."
        value={datos.motivoTratamiento ?? ""}
        onChange={(e) =>
          onChange({ ...datos, motivoTratamiento: e.target.value || undefined })
        }
        disabled={disabled}
      />
      <Input
        id="plaga"
        type="text"
        label="Plaga / Enfermedad"
        placeholder="Mildiu, pulgón..."
        value={datos.plaga ?? ""}
        onChange={(e) =>
          onChange({ ...datos, plaga: e.target.value || undefined })
        }
        disabled={disabled}
      />
    </>
  );
};
