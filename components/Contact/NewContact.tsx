"use client";

import { useEffect, useRef } from "react";
import styles from "./NewContact.module.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";

gsap.registerPlugin(ScrollTrigger);

export default function NewContact() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const outlineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fillCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const outroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const outroSectionRef = useRef<HTMLElement | null>(null);
  const lenisRef = useRef<any>(null);
  const lenisRafRef = useRef<number | null>(null);

  useEffect(() => {
    const cleanupFns: Array<() => void> = [];
    // Initialize Lenis smooth scroll (client-only)
    let destroyLenis: (() => void) | null = null;
    (async () => {
      try {
        const mod = await import("lenis");
        const Lenis = mod.default || (mod as any);
        const lenis = new Lenis({
          duration: 1.1,
          smoothWheel: true,
          // @ts-ignore newer Lenis versions support touch smoothing by default
          smoothTouch: true,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
        } as any);
        lenisRef.current = lenis;
        // keep ScrollTrigger in sync
        lenis.on("scroll", ScrollTrigger.update);

        // Let ScrollTrigger use Lenis for all measurements/scrolling
        ScrollTrigger.scrollerProxy(document.body, {
          scrollTop(value?: number) {
            if (arguments.length) {
              lenis.scrollTo(value as number, { immediate: true });
            }
            // @ts-ignore access private value for current scroll
            return lenis.scroll || window.scrollY || window.pageYOffset;
          },
          getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
          },
          pinType: document.body.style.transform ? "transform" : "fixed",
        });
        const raf = (time: number) => {
          lenis.raf(time);
          lenisRafRef.current = requestAnimationFrame(raf);
        };
        lenisRafRef.current = requestAnimationFrame(raf);
        destroyLenis = () => {
          if (lenisRafRef.current) cancelAnimationFrame(lenisRafRef.current);
          lenis.destroy();
          ScrollTrigger.scrollerProxy(document.body, undefined as any);
        };
      } catch (e) {
        // Lenis optional – silently ignore if not available
      }
    })();
    // Prepare title once; return a paused timeline we can restart
    const prepareTitle = (el: HTMLElement | null) => {
      if (!el) return null;
      const anyEl = el as any;
      if (anyEl.__tl) return anyEl.__tl as gsap.core.Timeline;
      const original = el.textContent || "";
      el.innerHTML = "";
      const frag = document.createDocumentFragment();
      const words = original.split(/(\s+)/);
      words.forEach((w) => {
        const wordWrap = document.createElement("span");
        wordWrap.style.display = w.trim() ? "inline-block" : "inline";
        wordWrap.style.whiteSpace = w === " " ? "pre" : "normal";
        if (w === " ") {
          wordWrap.textContent = " ";
        } else {
          for (let i = 0; i < w.length; i++) {
            const ch = document.createElement("span");
            ch.textContent = w[i];
            ch.className = "char";
            ch.style.display = "inline-block";
            ch.style.willChange = "transform, opacity, filter";
            wordWrap.appendChild(ch);
          }
        }
        frag.appendChild(wordWrap);
      });
      el.appendChild(frag);

      const chars = Array.from(el.querySelectorAll<HTMLSpanElement>(".char"));
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        chars,
        {
          yPercent: 120,
          opacity: 0,
          rotationX: -90,
          skewY: 8,
          scale: 0.92,
          filter: "blur(8px)",
          transformOrigin: "50% 100%",
        },
        {
          yPercent: 0,
          opacity: 1,
          rotationX: 0,
          skewY: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "expo.out",
          stagger: { each: 0.018, from: "center" },
        }
      ).to(
        chars,
        {
          duration: 0.4,
          ease: "power3.out",
          scale: 1,
          yPercent: 0,
          stagger: { each: 0.01, from: "edges" },
        },
        "-=0.25"
      );
      anyEl.__tl = tl;
      return tl;
    };

    // Animate hero immediately on mount
    const heroTl = prepareTitle(heroTitleRef.current);
    heroTl?.restart(true, false);
    // Animate outro when it enters viewport
    if (outroTitleRef.current) {
      const outroTl = prepareTitle(outroTitleRef.current);
      let outroTrigger: ScrollTrigger | null = null;

      const setupOutroTrigger = () => {
        // re-create trigger responsively
        if (outroTrigger) {
          outroTrigger.kill();
          outroTrigger = null;
        }
        const isMobile = window.innerWidth <= 900;
        const triggerEl = isMobile
          ? (outroTitleRef.current as HTMLElement)
          : (outroSectionRef.current as HTMLElement) || (outroTitleRef.current as HTMLElement);
        outroTrigger = ScrollTrigger.create({
          trigger: triggerEl,
          start: "top 80%",
          onEnter: () => outroTl?.restart(true, false),
          onLeaveBack: () => outroTl?.pause(0),
        });
      };

      setupOutroTrigger();
      window.addEventListener("resize", setupOutroTrigger);
      // ensure cleanup
      ScrollTrigger.addEventListener("refreshInit", setupOutroTrigger);

      // include in overall cleanup
      cleanupFns.push(() => {
        if (outroTrigger) outroTrigger.kill();
        window.removeEventListener("resize", setupOutroTrigger);
        ScrollTrigger.removeEventListener("refreshInit", setupOutroTrigger);
      });
    }

    const container = containerRef.current;
    const outlineCanvas = outlineCanvasRef.current!;
    const fillCanvas = fillCanvasRef.current!;
    const cards = cardsRef.current!;
    const sticky = stickyRef.current!;

    if (!container || !outlineCanvas || !fillCanvas || !cards || !sticky) return;

    const outlineCtx = outlineCanvas.getContext("2d")!;
    const fillCtx = fillCanvas.getContext("2d")!;

    const triangleSize = 150;
    const lineWidth = 1;
    const SCALE_THRESHOLD = 0.01;
    const triangleStates = new Map<string, { order: number; scale: number; row: number; col: number }>();
    let animationFrameId: number | null = null;
    let canvasXPosition = 0;

    const setCanvasSize = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setCanvasSize(outlineCanvas, outlineCtx);
    setCanvasSize(fillCanvas, fillCtx);

    const drawTriangle = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      fillScale = 0,
      flipped = false
    ) => {
      const halfSize = triangleSize / 2;

      if (fillScale < SCALE_THRESHOLD) {
        ctx.beginPath();
        if (!flipped) {
          ctx.moveTo(x, y - halfSize);
          ctx.lineTo(x + halfSize, y + halfSize);
          ctx.lineTo(x - halfSize, y + halfSize);
        } else {
          ctx.moveTo(x, y + halfSize);
          ctx.lineTo(x + halfSize, y - halfSize);
          ctx.lineTo(x - halfSize, y - halfSize);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.075)";
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      if (fillScale >= SCALE_THRESHOLD) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(fillScale, fillScale);
        ctx.translate(-x, -y);
        ctx.beginPath();
        if (!flipped) {
          ctx.moveTo(x, y - halfSize);
          ctx.lineTo(x + halfSize, y + halfSize);
          ctx.lineTo(x - halfSize, y + halfSize);
        } else {
          ctx.moveTo(x, y + halfSize);
          ctx.lineTo(x + halfSize, y - halfSize);
          ctx.lineTo(x - halfSize, y - halfSize);
        }
        ctx.closePath();
        ctx.fillStyle = "#0038a8";
        ctx.strokeStyle = "#0038a8";
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }
    };

    const drawGrid = (scrollProgress = 0) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      outlineCtx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);
      fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);

      const animationProgress = scrollProgress <= 0.65 ? 0 : (scrollProgress - 0.65) / 0.35;

      let needsUpdate = false;
      const animationSpeed = 0.15;

      triangleStates.forEach((state) => {
        if (state.scale < 1) {
          const x = state.col * (triangleSize * 0.5) + triangleSize / 2 + canvasXPosition;
          const y = state.row * triangleSize + triangleSize / 2;
          const flipped = (state.row + state.col) % 2 !== 0;
          drawTriangle(outlineCtx, x, y, 0, flipped);
        }
      });

      triangleStates.forEach((state) => {
        const shouldBeVisible = state.order <= animationProgress;
        const targetScale = shouldBeVisible ? 1 : 0;
        const newScale = state.scale + (targetScale - state.scale) * animationSpeed;
        if (Math.abs(newScale - state.scale) > 0.001) {
          state.scale = newScale;
          needsUpdate = true;
        }
        if (state.scale >= SCALE_THRESHOLD) {
          const x = state.col * (triangleSize * 0.5) + triangleSize / 2 + canvasXPosition;
          const y = state.row * triangleSize + triangleSize / 2;
          const flipped = (state.row + state.col) % 2 !== 0;
          drawTriangle(fillCtx, x, y, state.scale, flipped);
        }
      });

      if (needsUpdate) {
        animationFrameId = requestAnimationFrame(() => drawGrid(scrollProgress));
      }
    };

    const initializeTriangles = () => {
      const cols = Math.ceil(window.innerWidth / (triangleSize * 0.5));
      const rows = Math.ceil(window.innerHeight / (triangleSize * 0.5));
      const totalTriangles = rows * cols;
      const positions: { row: number; col: number; key: string }[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          positions.push({ row: r, col: c, key: `${r}-${c}` });
        }
      }
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
      }
      positions.forEach((pos, index) => {
        triangleStates.set(pos.key, {
          order: index / totalTriangles,
          scale: 0,
          row: pos.row,
          col: pos.col,
        });
      });
    };

    initializeTriangles();
    drawGrid();

    const handleResize = () => {
      setCanvasSize(outlineCanvas, outlineCtx);
      setCanvasSize(fillCanvas, fillCtx);
      triangleStates.clear();
      initializeTriangles();
      drawGrid();
    };
    window.addEventListener("resize", handleResize);

    const stickyHeight = window.innerHeight * 5;
    const st = ScrollTrigger.create({
      trigger: sticky,
      start: "top top",
      end: `+=${stickyHeight}px`,
      pin: true,
      onUpdate: (self) => {
        canvasXPosition = -self.progress * 200;
        drawGrid(self.progress);
        const progress = Math.min(self.progress / 0.654, 1);
        gsap.set(cards, { x: -progress * window.innerWidth * 2 });
      },
    });

    return () => {
      st.kill();
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (destroyLenis) destroyLenis();
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Navbar at top */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", zIndex: 10 }}>
        <Navbar onAboutClick={() => {}} onTeamClick={() => {}} />
      </div>
      <section className={`${styles.section} ${styles.hero}`}>
        <h1 ref={heroTitleRef} className={styles.heading}>Contact</h1>
      </section>
      <section ref={stickyRef} className={`${styles.section} ${styles.sticky}`}>
        <div className={styles.bgImg}>
          <img src="/assets/bg.jpg" alt="" />
        </div>
        <canvas ref={outlineCanvasRef} className={`${styles.canvas} ${styles.outlineLayer}`} />
        <div ref={cardsRef} className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardImg}><img src="/assets/card-1.jpg" alt="" /></div>
            <div className={styles.cardTitle}>
              <h1>Vision Viel.</h1>
              <p>PROD6745</p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardImg}><img src="/assets/card-2.jpg" alt="" /></div>
            <div className={styles.cardTitle}>
              <h1>Crimton Echo.</h1>
              <p>PROD6565</p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardImg}><img src="/assets/card-3.jpg" alt="" /></div>
            <div className={styles.cardTitle}>
              <h1>Arche Meth.</h1>
              <p>PROD3245</p>
            </div>
          </div>
        </div>
        <canvas ref={fillCanvasRef} className={`${styles.canvas} ${styles.fillLayer}`} />
      </section>
      <section ref={outroSectionRef} className={`${styles.section} ${styles.outro}`}>
        <h1 ref={outroTitleRef} className={styles.heading}>Your message, our move.</h1>
      </section>
    </div>
  );
}

