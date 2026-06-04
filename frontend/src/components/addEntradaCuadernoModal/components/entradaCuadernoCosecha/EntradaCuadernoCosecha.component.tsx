"use client";

import { Input } from "@/components/input/Input.component";
import type { EntradaCuadernoFormProps } from "../../AddEntradaCuadernoModal.interface";

export const EntradaCuadernoCosecha = ({
  datos,
  onChange,
  disabled,
}: EntradaCuadernoFormProps) => {
  return (
    <>
      <Input
        id="kg"
        type="number"
        label="Kilogramos recolectados"
        placeholder="5000"
        value={datos.kg ?? ""}
        onChange={(e) =>
          onChange({ ...datos, kg: Number(e.target.value) || undefined })
        }
        disabled={disabled}
        min={0}
      />
      <Input
        id="calidad"
        type="text"
        label="Calidad"
        placeholder="Extra, primera, segunda..."
        value={datos.calidad ?? ""}
        onChange={(e) =>
          onChange({ ...datos, calidad: e.target.value || undefined })
        }
        disabled={disabled}
      />
      <Input
        id="destino"
        type="text"
        label="Destino"
        placeholder="Mercado, exportación, industria..."
        value={datos.destino ?? ""}
        onChange={(e) =>
          onChange({ ...datos, destino: e.target.value || undefined })
        }
        disabled={disabled}
      />
    </>
  );
};
