"use client";

import { Input } from "@/components/input/Input.component";
import type { EntradaCuadernoFormProps } from "../../AddEntradaCuadernoModal.interface";

export const EntradaCuadernoRiego = ({
  datos,
  onChange,
  disabled,
}: EntradaCuadernoFormProps) => {
  return (
    <>
      <Input
        id="litrosPorM2"
        type="number"
        label="Litros por m²"
        placeholder="30"
        value={datos.litrosPorM2 ?? ""}
        onChange={(e) =>
          onChange({
            ...datos,
            litrosPorM2: Number(e.target.value) || undefined,
          })
        }
        disabled={disabled}
        min={0}
      />
      <Input
        id="horas"
        type="number"
        label="Horas de riego"
        placeholder="2"
        value={datos.horas ?? ""}
        onChange={(e) =>
          onChange({ ...datos, horas: Number(e.target.value) || undefined })
        }
        disabled={disabled}
        min={0}
        step={0.5}
      />
      <div>
        <label
          htmlFor="metodo"
          style={{
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "oklch(0.75 0.04 150)",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            display: "block",
            marginBottom: "6px",
          }}
        >
          Método
        </label>
        <select
          id="metodo"
          value={datos.metodo ?? ""}
          onChange={(e) =>
            onChange({ ...datos, metodo: e.target.value || undefined })
          }
          disabled={disabled}
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            fontSize: "0.9375rem",
            fontFamily: "inherit",
            color: "oklch(0.92 0 0)",
            background: "oklch(0.16 0.01 200 / 0.8)",
            border: "1px solid oklch(1 0 0 / 0.1)",
            borderRadius: "var(--radius-md)",
            outline: "none",
          }}
        >
          <option value="">Selecciona método</option>
          <option value="goteo">Goteo</option>
          <option value="aspersion">Aspersión</option>
          <option value="inundacion">Inundación</option>
          <option value="otro">Otro</option>
        </select>
      </div>
    </>
  );
};
