"use client";

import { useState } from "react";
import { TipoCultivo } from "@agrospace/shared/enums/TipoCultivo.enum";
import { ManejoCultivo } from "@agrospace/shared/enums/ManejoCultivo.enum";
import { TIPO_CULTIVO_LABELS } from "@agrospace/shared/config/TipoCultivoLabels.config";
import { MANEJO_CULTIVO_LABELS } from "@agrospace/shared/config/ManejoCultivoLabels.config";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import type {
  ParcelaFormProps,
  ParcelaFormValues,
} from "./ParcelaForm.interface";
import styles from "./ParcelaForm.module.scss";

const INITIAL_VALUES: ParcelaFormValues = {
  refCatastral: "",
  nombre: "",
  tipoCultivo: "",
  variedad: "",
  manejo: ManejoCultivo.CONVENCIONAL,
};

export const ParcelaForm = ({
  isLoading,
  error,
  onSubmit,
  submitLabel,
  children,
}: ParcelaFormProps) => {
  const [form, setForm] = useState<ParcelaFormValues>(INITIAL_VALUES);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const canSubmit =
    form.refCatastral.trim().length >= 14 && form.nombre.trim().length > 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        id="refCatastral"
        name="refCatastral"
        type="text"
        label="Referencia catastral"
        placeholder="53006A09100025"
        value={form.refCatastral}
        onChange={handleChange}
        disabled={isLoading}
        maxLength={20}
        hint="Encuéntrala en la Sede Electrónica del Catastro"
        required
      />

      <Input
        id="nombre"
        name="nombre"
        type="text"
        label="Nombre de la parcela"
        placeholder="Sector norte"
        value={form.nombre}
        onChange={handleChange}
        disabled={isLoading}
        required
      />

      <div className={styles.form__field}>
        <label htmlFor="tipoCultivo" className={styles.form__label}>
          Tipo de cultivo (opcional)
        </label>
        <select
          id="tipoCultivo"
          name="tipoCultivo"
          className={styles.form__select}
          value={form.tipoCultivo}
          onChange={handleChange}
          disabled={isLoading}
        >
          <option value="">Selecciona un tipo</option>
          {Object.values(TipoCultivo).map((tipo) => (
            <option key={tipo} value={tipo}>
              {TIPO_CULTIVO_LABELS[tipo]}
            </option>
          ))}
        </select>
      </div>

      <Input
        id="variedad"
        name="variedad"
        type="text"
        label="Variedad (opcional)"
        placeholder="Picual, Tempranillo, Navel..."
        value={form.variedad}
        onChange={handleChange}
        disabled={isLoading}
      />

      <div className={styles.form__field}>
        <label htmlFor="manejo" className={styles.form__label}>
          Manejo del cultivo
        </label>
        <select
          id="manejo"
          name="manejo"
          className={styles.form__select}
          value={form.manejo}
          onChange={handleChange}
          disabled={isLoading}
        >
          {Object.values(ManejoCultivo).map((manejo) => (
            <option key={manejo} value={manejo}>
              {MANEJO_CULTIVO_LABELS[manejo]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className={styles.form__error} role="alert">
          {error}
        </p>
      )}

      <Button type="submit" loading={isLoading} disabled={!canSubmit}>
        {submitLabel}
      </Button>

      {children}
    </form>
  );
};
