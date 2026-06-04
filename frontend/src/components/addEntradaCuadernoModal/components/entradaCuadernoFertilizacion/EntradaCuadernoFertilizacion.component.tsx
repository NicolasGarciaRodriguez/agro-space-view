"use client";

import { Input } from "@/components/input/Input.component";
import type { EntradaCuadernoFormProps } from "../../AddEntradaCuadernoModal.interface";

export const EntradaCuadernoFertilizacion = ({
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
        placeholder="Nitrato amónico 33.5%"
        value={datos.producto ?? ""}
        onChange={(e) =>
          onChange({ ...datos, producto: e.target.value || undefined })
        }
        disabled={disabled}
      />
      <Input
        id="dosis"
        type="number"
        label="Dosis"
        placeholder="150"
        value={datos.dosis ?? ""}
        onChange={(e) =>
          onChange({ ...datos, dosis: Number(e.target.value) || undefined })
        }
        disabled={disabled}
        min={0}
      />
      <Input
        id="unidad"
        type="text"
        label="Unidad"
        placeholder="kg/ha, l/ha..."
        value={datos.unidad ?? ""}
        onChange={(e) =>
          onChange({ ...datos, unidad: e.target.value || undefined })
        }
        disabled={disabled}
      />
    </>
  );
};
