"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./LandingCTA.module.scss";

gsap.registerPlugin(ScrollTrigger);

export const LandingCTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.cta}>
      <div className={styles.cta__bg}>
        <img
          src="/images/hero-farmer.jpg"
          alt="Agricultor en el campo"
          className={styles.cta__bgImage}
        />
        <div className={styles.cta__bgOverlay} />
      </div>

      <div ref={contentRef} className={styles.cta__content}>
        <span className={styles.cta__label}>🛰 AgroSpaceView</span>
        <h2 className={styles.cta__title}>
          Empieza a monitorear
          <br />
          tus parcelas hoy
        </h2>
        <p className={styles.cta__subtitle}>
          Gratis durante el período de prueba. Sin tarjeta de crédito.
        </p>
        <div className={styles.cta__actions}>
          <Link href="/register" className={styles.cta__primary}>
            Crear cuenta gratis
          </Link>
          <Link href="/login" className={styles.cta__secondary}>
            Ya tengo cuenta
          </Link>
        </div>

        <p className={styles.cta__footer}>
          Datos satelitales de la ESA · Copernicus Data Space
        </p>
      </div>
    </section>
  );
};
