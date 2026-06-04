"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import { StepExplotacion } from "./components/stepExplotacion/StepExplotacion.component";
import { StepParcela } from "./components/stepParcela/StepParcela.component";

import type { ExplotacionDTO } from "@agrospace/shared/dtos/Explotacion.dto";
import { ONBOARDING_STEPS, OnboardingStep } from "./OnboardingWizzard.config";
import styles from "./OnboardingWizzard.module.scss";

export const OnboardingWizard = () => {
  const router = useRouter();
  const addExplotacion = useExplotacionStore((s) => s.addExplotacion);
  const setActiveExplotacion = useExplotacionStore(
    (s) => s.setActiveExplotacion,
  );

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [explotacion, setExplotacion] = useState<ExplotacionDTO | null>(null);

  const handleExplotacionCreated = (data: ExplotacionDTO) => {
    addExplotacion(data);
    setActiveExplotacion(data);
    setExplotacion(data);
    setCurrentStep(2);
  };

  const handleParcelaCreated = () => {
    router.push("/dashboard");
  };

  const handleSkipParcela = () => {
    router.push("/dashboard");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.wizard}>
        <header className={styles.wizard__header}>
          <div className={styles.logo}>
            <span className={styles.logo__icon}>🛰</span>
            <span className={styles.logo__text}>AgroSpaceView</span>
          </div>
          <div className={styles.steps}>
            {ONBOARDING_STEPS.map((step) => (
              <div
                key={step.id}
                className={[
                  styles.steps__item,
                  currentStep === step.id ? styles["steps__item--active"] : "",
                  currentStep > step.id ? styles["steps__item--done"] : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={styles.steps__bubble}>
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                <span className={styles.steps__label}>{step.title}</span>
              </div>
            ))}
            <div
              className={styles.steps__line}
              style={
                {
                  "--progress": currentStep === 2 ? "100%" : "0%",
                } as React.CSSProperties
              }
            />
          </div>
        </header>

        <div className={styles.wizard__body}>
          {currentStep === 1 && (
            <StepExplotacion onCreated={handleExplotacionCreated} />
          )}
          {currentStep === 2 && explotacion && (
            <StepParcela
              explotacion={explotacion}
              onCreated={handleParcelaCreated}
              onSkip={handleSkipParcela}
            />
          )}
        </div>
      </div>
    </div>
  );
};
