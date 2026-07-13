"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./LandingPricing.module.scss";
import { PRICING_PLANS, PRICING_NOTE } from "./LandingPricing.config";

gsap.registerPlugin(ScrollTrigger);

export const LandingPricing = () => {
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
    <section ref={sectionRef} className={styles.pricing}>
      <div className={styles.pricing__inner}>
        <div className={styles.pricing__header}>
          <span className={styles.pricing__label}>Precios</span>
          <h2 className={styles.pricing__title}>
            Un plan para cada
            <br />
            <span className={styles.pricing__title__accent}>
              tamaño de explotación
            </span>
          </h2>
        </div>

        <div className={styles.pricing__grid}>
          {PRICING_PLANS.map((plan, i) => (
            <div
              key={plan.id}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className={[
                styles.plan,
                plan.highlighted ? styles["plan--highlighted"] : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {plan.highlighted && (
                <span className={styles.plan__badge}>Más popular</span>
              )}

              <div className={styles.plan__header}>
                <h3 className={styles.plan__name}>{plan.name}</h3>
                <p className={styles.plan__description}>{plan.description}</p>
              </div>

              <div className={styles.plan__price}>
                <span className={styles.plan__price__value}>
                  {plan.price}
                </span>
                <span className={styles.plan__price__period}>
                  {plan.period}
                </span>
              </div>

              <ul className={styles.plan__features}>
                {plan.features.map((feature) => (
                  <li key={feature} className={styles.plan__feature}>
                    <span className={styles.plan__feature__check}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={[
                  styles.plan__cta,
                  plan.highlighted ? styles["plan__cta--highlighted"] : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className={styles.pricing__note}>{PRICING_NOTE}</p>
      </div>
    </section>
  );
};