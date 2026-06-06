"use client";

import type { AlertaProps, AlertaType } from "./Alerta.interface";
import styles from "./Alerta.module.scss";

const TYPE_CONFIG: Record<AlertaType, { icon: string; modifier: string }> = {
  info: { icon: "ℹ", modifier: "info" },
  warning: { icon: "⚠", modifier: "warning" },
  error: { icon: "✕", modifier: "error" },
  success: { icon: "✓", modifier: "success" },
};

export const Alerta = ({
  type,
  title,
  body,
  ctaLabel,
  onCta,
  onClose,
}: AlertaProps) => {
  const config = TYPE_CONFIG[type];

  return (
    <div
      className={[styles.alerta, styles[`alerta--${config.modifier}`]].join(
        " ",
      )}
      role="alert"
    >
      <div className={styles.alerta__left}>
        <span className={styles.alerta__icon}>{config.icon}</span>
        <div className={styles.alerta__content}>
          <p className={styles.alerta__title}>{title}</p>
          {body && <p className={styles.alerta__body}>{body}</p>}
        </div>
      </div>

      <div className={styles.alerta__actions}>
        {ctaLabel && onCta && (
          <button className={styles.alerta__cta} onClick={onCta}>
            {ctaLabel}
          </button>
        )}
        {onClose && (
          <button
            className={styles.alerta__close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
