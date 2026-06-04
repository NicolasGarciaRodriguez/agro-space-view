"use client";

import type { CuadernoFiltrosProps } from "./CuadernoFiltros.interface";
import styles from "./CuadernoFiltros.module.scss";

const TIPOS = [
  { value: "", label: "Todos los tipos" },
  { value: "riego", label: "💧 Riego" },
  { value: "fertilizacion", label: "🌱 Fertilización" },
  { value: "tratamiento", label: "🧪 Tratamiento" },
  { value: "cosecha", label: "🌾 Cosecha" },
  { value: "observacion", label: "📝 Observación" },
];

export const CuadernoFiltros = ({
  parcelas,
  value,
  onChange,
}: CuadernoFiltrosProps) => {
  return (
    <div className={styles.filtros}>
      <div className={styles.filtros__field}>
        <label className={styles.filtros__label}>Parcela</label>
        <select
          className={styles.filtros__select}
          value={value.parcelaId}
          onChange={(e) => onChange({ ...value, parcelaId: e.target.value })}
        >
          <option value="">Todas las parcelas</option>
          {parcelas.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filtros__field}>
        <label className={styles.filtros__label}>Tipo</label>
        <select
          className={styles.filtros__select}
          value={value.tipo}
          onChange={(e) => onChange({ ...value, tipo: e.target.value })}
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filtros__field}>
        <label className={styles.filtros__label}>Desde</label>
        <input
          type="date"
          className={styles.filtros__input}
          value={value.dateFrom}
          max={value.dateTo || undefined}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
        />
      </div>

      <div className={styles.filtros__field}>
        <label className={styles.filtros__label}>Hasta</label>
        <input
          type="date"
          className={styles.filtros__input}
          value={value.dateTo}
          min={value.dateFrom || undefined}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
        />
      </div>

      {(value.parcelaId || value.tipo || value.dateFrom || value.dateTo) && (
        <button
          className={styles.filtros__clear}
          onClick={() =>
            onChange({ parcelaId: "", tipo: "", dateFrom: "", dateTo: "" })
          }
        >
          ✕ Limpiar
        </button>
      )}
    </div>
  );
};
