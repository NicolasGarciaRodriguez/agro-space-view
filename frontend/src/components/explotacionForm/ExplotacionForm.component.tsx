"use client";

import { useState } from "react";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import type {
  ExplotacionFormProps,
  ExplotacionFormValues,
} from "./ExplotacionForm.interface";
import styles from "./ExplotacionForm.module.scss";

const INITIAL_VALUES: ExplotacionFormValues = {
  nombre: "",
  provincia: "",
  municipio: "",
  descripcion: "",
};

export const ExplotacionForm = ({
  isLoading,
  error,
  onSubmit,
  submitLabel,
  children,
}: ExplotacionFormProps) => {
  const [form, setForm] = useState<ExplotacionFormValues>(INITIAL_VALUES);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const canSubmit =
    form.nombre.trim().length > 0 &&
    form.provincia.trim().length > 0 &&
    form.municipio.trim().length > 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        id="nombre"
        name="nombre"
        type="text"
        label="Nombre de la explotación"
        placeholder="Finca Los Naranjos"
        value={form.nombre}
        onChange={handleChange}
        disabled={isLoading}
        required
      />

      <div className={styles.form__row}>
        <Input
          id="provincia"
          name="provincia"
          type="text"
          label="Provincia"
          placeholder="Sevilla"
          value={form.provincia}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <Input
          id="municipio"
          name="municipio"
          type="text"
          label="Municipio"
          placeholder="Alcalá de Guadaíra"
          value={form.municipio}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </div>

      <Input
        id="descripcion"
        name="descripcion"
        type="text"
        label="Descripción (opcional)"
        placeholder="Explotación de naranjos y limoneros"
        value={form.descripcion}
        onChange={handleChange}
        disabled={isLoading}
      />

      {error && (
        <p className={styles.form__error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.form__submitArea}>
        <Button type="submit" loading={isLoading} disabled={!canSubmit}>
          {submitLabel}
        </Button>
        {children}
      </div>
    </form>
  );
};