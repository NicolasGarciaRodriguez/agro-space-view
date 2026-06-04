"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={id} className={styles.field__label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={[
            styles.field__input,
            error ? styles["field__input--error"] : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {error && (
          <p className={styles.field__error} role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className={styles.field__hint}>{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
