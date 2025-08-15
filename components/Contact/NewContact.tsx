"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./NewContact.module.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";


gsap.registerPlugin(ScrollTrigger);

export default function NewContact() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null as string | null,
  });
  const [mapAnimationStarted, setMapAnimationStarted] = useState(false);
  const outlineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fillCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const mapCardRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const outroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const outroSectionRef = useRef<HTMLElement | null>(null);
  const lenisRef = useRef<any>(null);
  const lenisRafRef = useRef<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setStatus({ loading: true, success: false, error: null });
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message. Please try again later.');
      }
      
      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: "", email: "", phone: "", message: "" });
      
      // Show success message for 5 seconds then reset
      setTimeout(() => {
        setStatus({ loading: false, success: false, error: null });
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus({ 
        loading: false, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send message. Please try again later.' 
      });
    }
  };

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

  // Intersection Observer for map animation trigger
  useEffect(() => {
    const mapCard = mapCardRef.current;
    if (!mapCard) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !mapAnimationStarted) {
            setMapAnimationStarted(true);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the card is visible
        rootMargin: "0px"
      }
    );

    observer.observe(mapCard);

    return () => {
      observer.disconnect();
    };
  }, [mapAnimationStarted]);

  // Prevent horizontal scroll on body
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    
    return () => {
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
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
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollText}>Scroll Down</div>
          <div className={styles.scrollArrow}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>
      <section ref={stickyRef} className={`${styles.section} ${styles.sticky}`}>
        <div className={styles.bgImg}>
          <img src="/assets/bg.jpg" alt="" />
        </div>
        <canvas ref={outlineCanvasRef} className={`${styles.canvas} ${styles.outlineLayer}`} />
        <div ref={cardsRef} className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.contactForm}>
              <h2 className={styles.formTitle}>Get in Touch</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  disabled={status.loading}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  disabled={status.loading}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  disabled={status.loading}
                />
                <textarea
                  name="message"
                  placeholder="Your Message *"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`${styles.input} ${styles.textarea}`}
                  rows={4}
                  required
                  disabled={status.loading}
                />
                
                {status.error && (
                  <div className={styles.errorMessage}>
                    {status.error}
                  </div>
                )}
                
                {status.success && (
                  <div className={styles.successMessage}>
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={status.loading}
                  className={styles.submitButton}
                >
                  {status.loading ? (
                    <span className={styles.loadingText}>
                      <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : "Send Message"}
                </button>
              </form>
            </div>
          </div>
          <div ref={mapCardRef} className={styles.card}>
            <div className={`${styles.mapContainer} ${mapAnimationStarted ? styles.animationActive : ''}`}>
              <div className={styles.mapZoomContainer}>
                <svg className={styles.mapSvg} viewBox="0 0 652 562" xmlns="http://www.w3.org/2000/svg">
                  {/* Complete SVG from your design with all elements preserved */}
                  <rect className={styles.rpMapPath1} x="264" y="228" width="22" height="8" rx="1.2" fill="#363636"/>
                  <rect className={styles.rpMapPath1} x="284" y="247" width="22" height="8" rx="1.2" fill="#363636"/>
                  <rect className={styles.rpMapPath1} x="300" y="227" width="22" height="8" rx="1.2" fill="#363636"/>
                  
                  {/* Text labels */}
                  <path d="M539.991 119V105.909H549.119V108.479H543.155V111.163H548.652V113.739H543.155V116.43H549.119V119H539.991ZM554.226 113.401V119H551.1V109.182H554.072V110.984H554.181C554.398 110.384 554.769 109.913 555.293 109.572C555.817 109.227 556.442 109.054 557.166 109.054C557.857 109.054 558.455 109.21 558.962 109.521C559.474 109.827 559.87 110.258 560.151 110.812C560.437 111.362 560.577 112.005 560.573 112.742V119H557.447V113.356C557.452 112.81 557.313 112.384 557.032 112.077C556.755 111.771 556.369 111.617 555.875 111.617C555.547 111.617 555.257 111.69 555.006 111.835C554.759 111.975 554.567 112.178 554.43 112.442C554.298 112.706 554.23 113.026 554.226 113.401ZM568.05 109.182V111.483H561.856V109.182H568.05ZM563.154 106.83H566.28V115.913C566.28 116.104 566.309 116.26 566.369 116.379C566.433 116.494 566.525 116.577 566.644 116.629C566.763 116.675 566.906 116.699 567.072 116.699C567.192 116.699 567.317 116.688 567.449 116.667C567.586 116.641 567.688 116.62 567.756 116.603L568.229 118.859C568.08 118.902 567.869 118.955 567.596 119.019C567.328 119.083 567.006 119.124 566.631 119.141C565.898 119.175 565.27 119.089 564.746 118.885C564.226 118.676 563.827 118.352 563.55 117.913C563.278 117.474 563.145 116.923 563.154 116.258V106.83ZM569.645 119V109.182H572.681V110.972H572.784C572.963 110.324 573.254 109.842 573.659 109.527C574.064 109.207 574.535 109.048 575.072 109.048C575.217 109.048 575.366 109.058 575.519 109.08C575.673 109.097 575.816 109.124 575.948 109.163V111.879C575.798 111.828 575.602 111.788 575.36 111.758C575.121 111.728 574.908 111.713 574.72 111.713C574.35 111.713 574.015 111.796 573.717 111.962C573.423 112.124 573.191 112.352 573.02 112.646C572.854 112.936 572.771 113.277 572.771 113.669V119H569.645ZM579.431 122.682C579.056 122.682 578.703 122.652 578.37 122.592C578.038 122.537 577.752 122.462 577.514 122.369L578.204 120.099C578.511 120.202 578.788 120.261 579.035 120.278C579.286 120.295 579.502 120.255 579.681 120.157C579.864 120.063 580.004 119.895 580.102 119.652L580.224 119.358L576.734 109.182H580.007L581.816 116.188H581.918L583.752 109.182H587.044L583.343 119.94C583.164 120.477 582.911 120.95 582.583 121.359C582.259 121.772 581.839 122.096 581.323 122.33C580.812 122.565 580.181 122.682 579.431 122.682ZM593.283 105.295L589.064 120.969H586.399L590.617 105.295H593.283ZM594.448 119V105.909H603.576V108.479H597.612V111.163H603.109V113.739H597.612V116.43H603.576V119H594.448ZM608.216 109.182L609.833 112.416L611.508 109.182H614.659L611.917 114.091L614.762 119H611.636L609.833 115.74L608.076 119H604.905L607.756 114.091L605.046 109.182H608.216ZM616.086 119V109.182H619.212V119H616.086ZM617.653 108.038C617.214 108.038 616.836 107.893 616.521 107.603C616.206 107.309 616.048 106.955 616.048 106.542C616.048 106.133 616.206 105.783 616.521 105.494C616.836 105.2 617.214 105.053 617.653 105.053C618.096 105.053 618.473 105.2 618.784 105.494C619.099 105.783 619.257 106.133 619.257 106.542C619.257 106.955 619.099 107.309 618.784 107.603C618.473 107.893 618.096 108.038 617.653 108.038ZM626.744 109.182V111.483H620.55V109.182H626.744ZM621.847 106.83H624.973V115.913C624.973 116.104 625.003 116.26 625.062 116.379C625.126 116.494 625.218 116.577 625.337 116.629C625.457 116.675 625.599 116.699 625.766 116.699C625.885 116.699 626.011 116.688 626.143 116.667C626.279 116.641 626.381 116.62 626.45 116.603L626.923 118.859C626.773 118.902 626.563 118.955 626.29 119.019C626.021 119.083 625.7 119.124 625.325 119.141C624.592 119.175 623.963 119.089 623.439 118.885C622.919 118.676 622.521 118.352 622.244 117.913C621.971 117.474 621.839 116.923 621.847 116.258V106.83Z" fill="#4F4F4F"/>
                  <path d="M539.991 86.9091H543.909L547.233 95.0142H547.386L550.71 86.9091H554.629V100H551.548V91.9588H551.439L548.294 99.9169H546.325L543.18 91.9141H543.072V100H539.991V86.9091ZM559.37 100.166C558.743 100.166 558.187 100.062 557.702 99.853C557.22 99.6399 556.839 99.3203 556.557 98.8942C556.28 98.4638 556.142 97.9247 556.142 97.277C556.142 96.7315 556.238 96.2713 556.43 95.8963C556.621 95.5213 556.885 95.2166 557.222 94.9822C557.559 94.7479 557.947 94.571 558.385 94.4517C558.824 94.3281 559.293 94.245 559.792 94.2024C560.35 94.1513 560.8 94.098 561.14 94.0426C561.481 93.983 561.729 93.8999 561.882 93.7933C562.04 93.6825 562.118 93.527 562.118 93.3267V93.2947C562.118 92.9666 562.006 92.7131 561.78 92.5341C561.554 92.3551 561.249 92.2656 560.866 92.2656C560.452 92.2656 560.12 92.3551 559.868 92.5341C559.617 92.7131 559.457 92.9602 559.389 93.2756L556.506 93.1733C556.591 92.5767 556.811 92.044 557.165 91.5753C557.523 91.1023 558.013 90.7315 558.635 90.4631C559.261 90.1903 560.013 90.054 560.891 90.054C561.518 90.054 562.095 90.1286 562.623 90.2777C563.152 90.4226 563.612 90.6357 564.004 90.9169C564.396 91.1939 564.699 91.5348 564.912 91.9396C565.129 92.3445 565.238 92.8068 565.238 93.3267V100H562.297V98.6321H562.221C562.046 98.9645 561.822 99.2457 561.55 99.4759C561.281 99.706 560.964 99.8786 560.597 99.9936C560.235 100.109 559.826 100.166 559.37 100.166ZM560.335 98.1207C560.672 98.1207 560.974 98.0526 561.243 97.9162C561.515 97.7798 561.733 97.5923 561.895 97.3537C562.057 97.1108 562.138 96.8295 562.138 96.5099V95.5767C562.048 95.6236 561.939 95.6662 561.812 95.7045C561.688 95.7429 561.552 95.7791 561.403 95.8132C561.253 95.8473 561.1 95.8771 560.942 95.9027C560.785 95.9283 560.633 95.9517 560.488 95.973C560.194 96.0199 559.943 96.0923 559.734 96.1903C559.53 96.2884 559.372 96.4162 559.261 96.5739C559.155 96.7273 559.101 96.9105 559.101 97.1236C559.101 97.4474 559.216 97.6946 559.447 97.8651C559.681 98.0355 559.977 98.1207 560.335 98.1207ZM567.149 100V90.1818H570.275V100H567.149ZM568.715 89.0376C568.276 89.0376 567.899 88.8928 567.584 88.603C567.268 88.3089 567.111 87.9553 567.111 87.5419C567.111 87.1328 567.268 86.7834 567.584 86.4936C567.899 86.1996 568.276 86.0526 568.715 86.0526C569.158 86.0526 569.535 86.1996 569.846 86.4936C570.162 86.7834 570.319 87.1328 570.319 87.5419C570.319 87.9553 570.162 88.3089 569.846 88.603C569.535 88.8928 569.158 89.0376 568.715 89.0376ZM575.39 94.4006V100H572.264V90.1818H575.237V91.9844H575.345C575.563 91.3835 575.933 90.9126 576.457 90.5717C576.982 90.2266 577.606 90.054 578.33 90.054C579.021 90.054 579.619 90.2095 580.126 90.5206C580.638 90.8274 581.034 91.2578 581.315 91.8118C581.601 92.3615 581.741 93.005 581.737 93.7422V100H578.612V94.3558C578.616 93.8104 578.477 93.3842 578.196 93.0774C577.919 92.7706 577.533 92.6172 577.039 92.6172C576.711 92.6172 576.421 92.6896 576.17 92.8345C575.923 92.9751 575.731 93.1776 575.594 93.4418C575.462 93.706 575.394 94.0256 575.39 94.4006Z" fill="#4F4F4F"/>
                  <path d="M551.327 7.49794L551.462 4.93191L562.511 5.51479L562.376 8.08083L558.412 7.87172L557.858 18.3784L554.743 18.2141L555.297 7.70739L551.327 7.49794ZM566.51 19.0205C565.48 18.9661 564.606 18.7088 563.888 18.2485C563.174 17.7841 562.637 17.1626 562.277 16.384C561.922 15.6014 561.77 14.708 561.823 13.7037C561.876 12.6952 562.121 11.8226 562.557 11.086C562.997 10.3454 563.596 9.78384 564.355 9.40139C565.117 9.0149 566.014 8.84882 567.044 8.90315C568.073 8.95748 568.945 9.21683 569.659 9.68121C570.377 10.1416 570.914 10.763 571.27 11.5456C571.63 12.3242 571.783 13.2178 571.73 14.2263C571.677 15.2306 571.43 16.103 570.99 16.8437C570.554 17.5803 569.955 18.1418 569.192 18.5283C568.434 18.9107 567.54 19.0748 566.51 19.0205ZM566.653 16.6661C567.028 16.6859 567.351 16.5877 567.623 16.3716C567.894 16.1555 568.109 15.8468 568.267 15.4454C568.429 15.0443 568.524 14.5757 568.552 14.0395C568.581 13.4948 568.536 13.0145 568.417 12.5985C568.302 12.1828 568.121 11.8532 567.874 11.6097C567.626 11.3662 567.315 11.2346 566.941 11.2149C566.554 11.1944 566.22 11.2921 565.94 11.5077C565.664 11.7236 565.445 12.0321 565.283 12.4332C565.125 12.8345 565.032 13.3075 565.003 13.8522C564.975 13.8884 565.018 14.8644 565.133 15.2801C565.251 15.696 565.437 16.0258 565.689 16.2695C565.944 16.5135 566.266 16.6457 566.653 16.6661ZM577.623 6.31201L581.536 6.51843L584.429 14.7874L584.582 14.7955L588.328 6.87672L592.241 7.08313L591.551 20.1559L588.475 19.9936L588.898 11.9635L588.79 11.9578L585.23 19.7392L583.264 19.6355L580.545 11.4781L580.436 11.4723L580.011 19.5471L576.934 19.3847L577.623 6.31201Z" fill="#4F4F4F"/>
                  
                  {/* Main boundary path - with animation */}
                  <path className={styles.rpMapPath1} d="M528.5 141L536.5 143.5L563.5 463.5L547.5 483.5H465L383 518.5L107.5 524V494M109.5 468L125 360.5L129 316L141 253L171.5 201V143.5L203.5 123L401.5 129L486.5 133.5" stroke="black" strokeWidth="2" fill="none"/>
                  
                  {/* Blue path - route to D-Block with animation and shimmer */}
                  <defs>
                    <linearGradient id="bluePathGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
                      <stop offset="0%" stopColor="#618DE5" />
                      <stop offset="50%" stopColor="#8BB5FF" />
                      <stop offset="100%" stopColor="#618DE5" />
                    </linearGradient>
                  </defs>
                  
                  <path className={styles.bluePath} d="M511.5 151L491 149.942M491 149.942L356.5 143L352.5 209L350 280.5C343.575 302.076 346.569 345.98 341.5 363C338.097 374.427 327 379 327 395M491 149.942L499.5 129.5" stroke="url(#bluePathGradient)" strokeWidth="3" strokeDasharray="10 10" fill="none"/>
                  
                  {/* Bright colored roads inside research park - with animations */}
                  <path className={styles.greyPath1} d="M66 535.5L78 491.5L121 481L123 470L137 373.5L144 353V298.5L155 252L184.5 208.5V189V149L211.5 136.5H256L336 139H349.5M516 150.5L520.5 130" stroke="#777777" strokeWidth="2" strokeDasharray="8 8" fill="none"/>
                  <path className={styles.greyPath2} d="M45 560.5L67 479.5L133 468" stroke="#343434" strokeWidth="3" fill="none"/>
                  <path className={styles.greyPath3} d="M119 486L121.5 508.5H197H288L294.5 382H326.5" stroke="#777777" strokeWidth="2" strokeDasharray="8 8" fill="none"/>
                  
                  {/* Internal paths - dark grey - reduced stroke width */}
                  <path d="M364.5 355L368.5 241" stroke="#212121" strokeWidth="2" fill="none"/>
                  <path d="M332 316L369 317" stroke="#212121" strokeWidth="2" fill="none"/>
                  <path d="M277 411L314 412" stroke="#212121" strokeWidth="2" fill="none"/>
                  
                  {/* Buildings - only fills, NO black strokes */}
                  <path d="M321.5 350V360.5L187.5 354H176.5V344C164.88 315.957 164.92 300.582 179.5 274V264H187.5V268.5L321.5 272.5V276V286C337.988 314.821 332.241 327.5 321.5 350Z" fill="#434343"/>
                  <path d="M533.5 254L530 363.5V371.5L472 369L476 239H441.5V246H422H400.5V239H364.5V236.5L347 235V222H343L347 156.5L482.5 163.5V189.5V198.5L500.5 200.5V219H517V254H533.5Z" fill="#434343"/>
                  

                  
                  {/* Grey building under D & C letters */}
                  <path d="M334.5 482.5H301L304 396.5L348.5 399H374.5V423L411.5 425.5V388.5H433V396.5L480 399V392.5L536 396.5V449H427.5V464H403.5L391.5 476H374.5V484.5H358.5L358 489.5H334.5V482.5Z" fill="#434343"/>
                  
                  {/* D Building - Our Office */}
                  <path className={styles.rpMapPath5} d="M349.5 370V397H377.5V420.5L408 423.5V386.5H436V393.5L476.5 397V389.5H482V359L487.5 243.5L471 241V254L467.5 359L353.5 355V370H349.5Z" fill="#2E2E2E"/>
                  
                  {/* Building labels */}
                  <path d="M338.335 452H328.926V426.545H338.323C340.916 426.545 343.149 427.055 345.022 428.074C346.903 429.085 348.353 430.543 349.372 432.449C350.391 434.347 350.901 436.617 350.901 439.26C350.901 441.912 350.391 444.19 349.372 446.096C348.361 448.002 346.915 449.464 345.034 450.484C343.154 451.495 340.92 452 338.335 452ZM335.079 446.755H338.099C339.524 446.755 340.73 446.515 341.716 446.034C342.71 445.545 343.46 444.754 343.966 443.66C344.479 442.558 344.736 441.092 344.736 439.26C344.736 437.429 344.479 435.971 343.966 434.885C343.452 433.792 342.694 433.004 341.691 432.524C340.697 432.035 339.47 431.79 338.012 431.79H335.079V446.755Z" fill="#737373"/>
                  <path d="M479.032 420.768H472.817C472.735 420.13 472.565 419.554 472.308 419.04C472.051 418.526 471.711 418.087 471.289 417.723C470.866 417.358 470.365 417.08 469.785 416.89C469.213 416.691 468.579 416.592 467.883 416.592C466.649 416.592 465.584 416.894 464.689 417.499C463.802 418.104 463.119 418.978 462.638 420.121C462.166 421.265 461.93 422.649 461.93 424.273C461.93 425.963 462.17 427.38 462.651 428.523C463.139 429.659 463.823 430.516 464.701 431.096C465.588 431.668 466.636 431.954 467.846 431.954C468.525 431.954 469.143 431.867 469.698 431.693C470.261 431.519 470.754 431.266 471.177 430.935C471.608 430.595 471.96 430.185 472.233 429.704C472.515 429.215 472.71 428.664 472.817 428.051L479.032 428.088C478.924 429.215 478.597 430.326 478.05 431.419C477.511 432.513 476.77 433.512 475.825 434.415C474.881 435.31 473.729 436.022 472.37 436.553C471.019 437.083 469.47 437.348 467.722 437.348C465.418 437.348 463.355 436.843 461.532 435.832C459.717 434.812 458.284 433.329 457.232 431.382C456.179 429.435 455.653 427.065 455.653 424.273C455.653 421.472 456.188 419.098 457.256 417.151C458.325 415.204 459.771 413.725 461.594 412.714C463.417 411.703 465.46 411.197 467.722 411.197C469.263 411.197 470.688 411.413 471.997 411.844C473.306 412.266 474.458 412.888 475.452 413.708C476.447 414.52 477.255 415.519 477.876 416.703C478.498 417.888 478.883 419.243 479.032 420.768Z" fill="#737373"/>
                  <path d="M497.926 324V298.545H508.541C510.447 298.545 512.042 298.815 513.326 299.353C514.619 299.892 515.588 300.646 516.234 301.615C516.889 302.585 517.216 303.708 517.216 304.984C517.216 305.953 517.013 306.819 516.607 307.581C516.201 308.335 515.642 308.961 514.929 309.458C514.217 309.955 513.392 310.303 512.456 310.502V310.751C513.483 310.8 514.432 311.078 515.302 311.583C516.181 312.089 516.885 312.793 517.415 313.696C517.945 314.591 518.211 315.652 518.211 316.878C518.211 318.245 517.863 319.468 517.167 320.545C516.471 321.614 515.464 322.459 514.146 323.08C512.829 323.693 511.23 324 509.349 324H497.926ZM504.079 319.041H507.882C509.216 319.041 510.198 318.788 510.828 318.283C511.466 317.777 511.785 317.073 511.785 316.17C511.785 315.515 511.632 314.952 511.325 314.479C511.018 313.999 510.583 313.63 510.02 313.373C509.456 313.108 508.781 312.975 507.994 312.975H504.079V319.041ZM504.079 309.011H507.484C508.156 309.011 508.752 308.899 509.274 308.675C509.796 308.451 510.202 308.128 510.492 307.706C510.79 307.283 510.94 306.773 510.94 306.177C510.94 305.323 510.637 304.652 510.032 304.163C509.427 303.674 508.611 303.43 507.584 303.43H504.079V309.011Z" fill="#737373"/>
                  <path d="M407.433 214H400.82L409.409 188.545H417.599L426.188 214H419.576L413.597 194.959H413.398L407.433 214ZM406.55 203.982H420.371V208.656H406.55V203.982Z" fill="#737373"/>
                  <path d="M239.926 325V299.545H257.675V304.542H246.079V309.762H256.768V314.771H246.079V320.004H257.675V325H239.926Z" fill="#737373"/>
                  
                  {/* Green areas */}
                  <path className={styles.rpMapPath6} d="M372.5 344L376 252L465 254.5L461 352.5L372.5 349.5V344Z" fill="#3A5C1F"/>
                  <path className={styles.rpMapPath7} d="M300.5 175.5L208 171.5V172.5L206.5 212L268 213L273 208H302L303 197H326V216.5L335 218.5L339.5 164L313 159.5L300.5 175.5Z" fill="#278096"/>
                  
                  {/* Main boundary */}
                  <path className={styles.rpMapPath1} d="M528.5 141L536.5 143.5L563.5 463.5L547.5 483.5H465L383 518.5L107.5 524V494M109.5 468L125 360.5L129 316L141 253L171.5 201V143.5L203.5 123L401.5 129L486.5 133.5" stroke="black" strokeWidth="8" fill="none"/>
                  
                  {/* All the green ellipses (trees) */}
                  <ellipse cx="313" cy="211" rx="4" ry="3" fill="#3A5C1F"/>
                  <ellipse cx="302" cy="222" rx="4" ry="3" fill="#3A5C1F"/>
                  <ellipse cx="323" cy="235" rx="4" ry="3" fill="#3A5C1F"/>
                  <ellipse cx="324" cy="257" rx="4" ry="3" fill="#3A5C1F"/>
                  <ellipse cx="335.441" cy="260.992" rx="2.5" ry="2" transform="rotate(-90.969 335.441 260.992)" fill="#3A5C1F"/>
                  <ellipse cx="295" cy="219" rx="4" ry="3" fill="#3A5C1F"/>
                  <ellipse cx="317" cy="254" rx="4" ry="3" fill="#3A5C1F"/>
                  <ellipse cx="333.526" cy="266.025" rx="2.5" ry="2" transform="rotate(-90.969 333.526 266.025)" fill="#3A5C1F"/>
                  <ellipse cx="290" cy="221.5" rx="2" ry="1.5" fill="#3A5C1F"/>
                  <ellipse cx="278" cy="228.5" rx="3" ry="1.5" fill="#3A5C1F"/>
                  <ellipse cx="312" cy="256.5" rx="2" ry="1.5" fill="#3A5C1F"/>
                  <ellipse cx="334.576" cy="269.008" rx="1.5" ry="1" transform="rotate(-90.969 334.576 269.008)" fill="#3A5C1F"/>
                  <ellipse cx="300" cy="235" rx="4" ry="3" fill="#3A5C1F"/>
                  <ellipse cx="303.5" cy="253" rx="2.5" ry="2" fill="#3A5C1F"/>
                  <ellipse cx="260.5" cy="230" rx="2.5" ry="2" fill="#3A5C1F"/>
                  <ellipse cx="236" cy="226" rx="4" ry="3" fill="#3A5C1F"/>
                  <ellipse cx="226" cy="227" rx="4" ry="3" fill="#3A5C1F"/>
                  <ellipse cx="227.5" cy="230" rx="2.5" ry="2" fill="#3A5C1F"/>
                  <ellipse cx="227.5" cy="219.5" rx="3.5" ry="2.5" fill="#3A5C1F"/>
                  <ellipse cx="207.5" cy="214.5" rx="3.5" ry="2.5" fill="#3A5C1F"/>
                  <ellipse cx="214.5" cy="210" rx="5.5" ry="4" fill="#3A5C1F"/>
                  <ellipse cx="207.5" cy="206" rx="5.5" ry="4" fill="#3A5C1F"/>
                  
                  {/* Additional trees and landscaping elements - continuing with all your ellipses */}
                  {/* (I'll include all the remaining ellipses for completeness) */}
                  <ellipse cx="207.951" cy="174.948" rx="4" ry="3" transform="rotate(44.8918 207.951 174.948)" fill="#3A5C1F"/>
                  <ellipse cx="240.951" cy="173.948" rx="4" ry="3" transform="rotate(44.8918 240.951 173.948)" fill="#3A5C1F"/>
                  <ellipse cx="230.323" cy="175.319" rx="6.72428" ry="5.04321" transform="rotate(44.8918 230.323 175.319)" fill="#3A5C1F"/>
                  <ellipse cx="229.105" cy="158.619" rx="4" ry="3" transform="rotate(-142.281 229.105 158.619)" fill="#3A5C1F"/>
                  <ellipse cx="233.999" cy="161.234" rx="4" ry="3" transform="rotate(37.7186 233.999 161.234)" fill="#3A5C1F"/>
                  <ellipse cx="214.951" cy="174.948" rx="4" ry="3" transform="rotate(10.3369 214.951 174.948)" fill="#3A5C1F"/>
                  <ellipse cx="247.951" cy="173.948" rx="4" ry="3" transform="rotate(10.3369 247.951 173.948)" fill="#3A5C1F"/>
                  <ellipse cx="335.951" cy="155.948" rx="4" ry="3" transform="rotate(10.3369 335.951 155.948)" fill="#3A5C1F"/>
                  
                  {/* All remaining elements preserved with exact colors */}
                  <ellipse cx="392.8" cy="267.4" rx="2.8" ry="2" fill="#578036"/>
                  <ellipse cx="388.4" cy="265" rx="2.4" ry="2" fill="#578036"/>
                  <ellipse cx="392.4" cy="269.8" rx="1.6" ry="1.2" fill="#334822"/>
                  <ellipse cx="389.6" cy="267.8" rx="3.6" ry="2.4" fill="#334822"/>
                  
                  {/* Roads and paths */}
                  <path d="M501 133L517.5 30L651 38" stroke="#414141" strokeWidth="10" fill="none"/>
                  <path d="M518 133L532.5 47.5L647 56" stroke="#414141" strokeWidth="10" fill="none"/>
                  
                  {/* Missing grey building */}
                  <path d="M130.5 495L139.5 375L148 377.5L284 382L279 499L130.5 495Z" fill="#434343"/>
                  
                  {/* Parking building (the circle around P) */}
                  <path d="M208 451C217.389 451 225 443.389 225 434C225 424.611 217.389 417 208 417C198.611 417 191 424.611 191 434C191 443.389 198.611 451 208 451Z" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  
                  {/* P symbol inside parking */}
                  <path d="M203.875 441.209V425.792H210.042C211.268 425.792 212.445 426.279 213.312 427.147C214.179 428.014 214.667 429.19 214.667 430.417C214.667 431.644 214.179 432.82 213.312 433.687C212.445 434.555 211.268 435.042 210.042 435.042H203.875" stroke="black" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  
                  {/* Additional rectangles */}
                  <rect x="197" y="230" width="22" height="8" rx="1.2" fill="#363636"/>
                  <rect x="216" y="247" width="22" height="8" rx="1.2" fill="#363636"/>
                  <rect x="184" y="247" width="22" height="8" rx="1.2" fill="#363636"/>
                  <rect x="231" y="230" width="22" height="8" rx="1.2" fill="#363636"/>
                  <rect x="251" y="247" width="22" height="8" rx="1.2" fill="#363636"/>
                  
                  {/* Direction labels */}
                  <text x="520" y="20" fill="#4F4F4F" fontSize="12" fontWeight="500">To Main Rd</text>
                  <text x="530" y="80" fill="#4F4F4F" fontSize="10">Main</text>
                  <text x="530" y="95" fill="#4F4F4F" fontSize="10">Entry/Exit</text>
                  

                </svg>
              </div>
            </div>
            <div className={styles.cardTitle}>
              <h1>Office Location</h1>
              <p>D3, IITM Research Park, Chennai 600013</p>
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

