"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import styles from "./LandingHero.module.scss";

export const LandingHero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      badgeRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6 },
    )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9 },
        "-=0.3",
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.5",
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4",
      );

    gsap.to(orbitRef.current, {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: "none",
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.hero__bg}>
        <img
          src="/images/hero-satellite.jpg"
          alt=""
          className={styles.hero__bgImage}
        />
        <div className={styles.hero__bgOverlay} />
      </div>

      <div className={styles.hero__grid} aria-hidden="true" />

      <div ref={orbitRef} className={styles.hero__orbit} aria-hidden="true">
        <div className={styles.hero__satellite}>🛰</div>
      </div>

      <div className={styles.hero__content}>
        <div ref={badgeRef} className={styles.hero__badge}>
          <span className={styles.hero__badge__dot} />
          Tecnología satelital para el campo español
        </div>

        <h1 ref={titleRef} className={styles.hero__title}>
          Tu campo visto
          <br />
          <span className={styles.hero__title__accent}>desde el espacio</span>
        </h1>

        <p ref={subtitleRef} className={styles.hero__subtitle}>
          Monitorea tus parcelas con imágenes Sentinel-2, analiza el NDVI en
          tiempo real y lleva un cuaderno de campo inteligente. Todo desde una
          sola plataforma.
        </p>

        <div ref={ctaRef} className={styles.hero__cta}>
          <Link href="/register" className={styles.hero__cta__primary}>
            Empieza gratis
          </Link>
          <Link href="/login" className={styles.hero__cta__secondary}>
            Iniciar sesión →
          </Link>
        </div>
      </div>

      <div className={styles.hero__scroll}>
        <span className={styles.hero__scroll__line} />
        <span className={styles.hero__scroll__text}>scroll</span>
      </div>
    </section>
  );
};
