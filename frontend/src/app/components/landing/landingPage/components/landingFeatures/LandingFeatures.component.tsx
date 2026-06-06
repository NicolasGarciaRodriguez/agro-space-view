"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./LandingFeatures.module.scss";
import { FEATURES } from "./LandingFeatures.config";

gsap.registerPlugin(ScrollTrigger);

export const LandingFeatures = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            delay: i * 0.1,
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.features}>
      <div className={styles.features__inner}>
        <div className={styles.features__header}>
          <span className={styles.features__label}>Funcionalidades</span>
          <h2 className={styles.features__title}>
            Todo lo que necesitas
            <br />
            <span className={styles.features__title__accent}>
              para monitorear tu explotación
            </span>
          </h2>
        </div>

        <div className={styles.features__grid}>
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className={[styles.card, f.soon ? styles["card--soon"] : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.card__top}>
                <span className={styles.card__icon}>{f.icon}</span>
                <span className={styles.card__label}>{f.label}</span>
                {f.soon && (
                  <span className={styles.card__soon}>Próximamente</span>
                )}
              </div>
              <h3 className={styles.card__title}>{f.title}</h3>
              <p className={styles.card__body}>{f.body}</p>
              <div className={styles.card__stat}>
                <span className={styles.card__stat__value}>{f.stat}</span>
                <span className={styles.card__stat__label}>{f.statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
