"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./LandingScroll.module.scss";

gsap.registerPlugin(ScrollTrigger);

export const LandingScroll = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          pin: stickyRef.current,
        },
      });

      // Fase 1 (0-40%): zoom in desde espacio
      tl.fromTo(
        imageRef.current,
        { scale: 1, filter: "brightness(0.4) saturate(0.5)" },
        {
          scale: 2.5,
          filter: "brightness(0.7) saturate(1.2)",
          ease: "none",
          duration: 4,
        },
      )

        // Fade out overlay oscuro
        .fromTo(
          overlayRef.current,
          { opacity: 1 },
          { opacity: 0.3, ease: "none", duration: 2 },
          0,
        )

        // Texto 1 entra
        .fromTo(
          textRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" },
          1,
        )

        // Texto 1 sale
        .to(
          textRef.current,
          { opacity: 0, y: -20, duration: 1, ease: "power2.in" },
          3,
        )

        // Fase 2 (40-70%): zoom más cercano
        .to(imageRef.current, {
          scale: 5,
          filter: "brightness(0.9) saturate(1.5)",
          ease: "none",
          duration: 3,
        })

        // Texto 2 entra
        .fromTo(
          text2Ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" },
          5,
        )

        // Fase 3 (70-100%): fade a negro suave
        .to(overlayRef.current, { opacity: 0.85, duration: 2, ease: "none" }, 7)

        .to(
          text2Ref.current,
          { opacity: 0, duration: 1, ease: "power2.in" },
          8,
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.scroll}>
      <div ref={stickyRef} className={styles.scroll__sticky}>
        {/* Imagen que hace zoom */}
        <img
          ref={imageRef}
          src="/images/hero-fields.jpg"
          alt="Vista aérea de campos agrícolas"
          className={styles.scroll__image}
        />

        {/* Overlay oscuro */}
        <div ref={overlayRef} className={styles.scroll__overlay} />

        {/* Grid decorativo */}
        <div className={styles.scroll__grid} aria-hidden="true" />

        {/* Texto 1 */}
        <div ref={textRef} className={styles.scroll__text}>
          <span className={styles.scroll__text__label}>
            Sentinel-2 · 10m resolución
          </span>
          <h2 className={styles.scroll__text__title}>
            Cada parcela,
            <br />
            bajo control
          </h2>
          <p className={styles.scroll__text__body}>
            Imágenes satelitales actualizadas cada 5 días para cualquier punto
            de España.
          </p>
        </div>

        {/* Texto 2 */}
        <div ref={text2Ref} className={styles.scroll__text}>
          <span className={styles.scroll__text__label}>
            NDVI · Índice de vegetación
          </span>
          <h2 className={styles.scroll__text__title}>
            Detecta el estrés
            <br />
            antes de verlo
          </h2>
          <p className={styles.scroll__text__body}>
            El análisis NDVI revela problemas hídricos y de vegetación semanas
            antes de que sean visibles a simple vista.
          </p>
        </div>
      </div>
    </section>
  );
};
