"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./LandingScroll.module.scss";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 125;
const FRAME_PATH = (i: number) =>
  `/frames/ezgif-frame-${String(i).padStart(3, "0")}.jpg`;

export const LandingScroll = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const frameObj = useRef({ frame: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    gsap.set(textRef.current, { opacity: 0, y: 30 });
    gsap.set(text2Ref.current, { opacity: 0, y: 30 });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const drawFrame = (index: number) => {
      const img = images[index];
      if (!img || !img.complete) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvas.width / canvas.height;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > canvasAspect) {
        drawH = canvas.height;
        drawW = drawH * imgAspect;
        drawX = (canvas.width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = canvas.width;
        drawH = drawW / imgAspect;
        drawX = 0;
        drawY = (canvas.height - drawH) / 2;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) drawFrame(0);
      };
      images.push(img);
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      pin: stickyRef.current,
      onUpdate: (self) => {
        const frameIndex = Math.min(
          Math.floor(self.progress * (TOTAL_FRAMES - 1)),
          TOTAL_FRAMES - 1,
        );
        if (frameIndex !== frameObj.current.frame) {
          frameObj.current.frame = frameIndex;
          drawFrame(frameIndex);
        }
      },
    });

    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "10% top",
          end: "30% top",
          scrub: true,
        },
      },
    );

    gsap.fromTo(
      textRef.current,
      { opacity: 1, y: 0 },
      {
        opacity: 0,
        y: -20,
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "35% top",
          end: "50% top",
          scrub: true,
        },
      },
    );

    gsap.fromTo(
      text2Ref.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "55% top",
          end: "70% top",
          scrub: true,
        },
      },
    );

    gsap.fromTo(
      text2Ref.current,
      { opacity: 1, y: 0 },
      {
        opacity: 0,
        y: -20,
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "80% top",
          end: "95% top",
          scrub: true,
        },
      },
    );

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(frameObj.current.frame);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      st.kill();
      ScrollTrigger.getAll()
        .filter((t) => t.vars.trigger === sectionRef.current)
        .forEach((t) => t.kill());
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.scroll}>
      <div ref={stickyRef} className={styles.scroll__sticky}>
        <canvas ref={canvasRef} className={styles.scroll__canvas} />
        <div className={styles.scroll__overlay} />
        <div className={styles.scroll__grid} aria-hidden="true" />

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
