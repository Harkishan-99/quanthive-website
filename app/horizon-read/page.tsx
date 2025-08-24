"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import styles from "@/components/VisionStatement/VisionStatementRead.module.css";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export default function HorizonReadPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const projectDetailsRef = useRef<HTMLElement>(null);
  const mainImageRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
            );
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    [projectDetailsRef.current, mainImageRef.current]
      .filter(Boolean)
      .forEach((el) => observer.observe(el as Element));

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );

    return () => {
      observer.disconnect();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      document.documentElement.style.scrollBehavior = "auto";
      document.documentElement.style.overflowX = "";
      document.body.style.overflowX = "";
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.floatingNavbar}>
        <Navbar onAboutClick={() => {}} onTeamClick={() => {}} />
      </div>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.designerName}>QuantHive</h1>
            <p className={styles.designerTitle}>AI-Native Investment Research Platform</p>
          </div>
          <nav className={styles.nav}>
            <a href="#" className={styles.navLink}>Index</a>
            <a href="#" className={styles.navLink}>About</a>
          </nav>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.projectType}>Future Visions</p>
            <h1 className={styles.projectTitle}>Horizon</h1>
          </div>
        </section>

        <section ref={projectDetailsRef} className={styles.projectDetails}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <h3 className={styles.detailLabel}>Based</h3>
              <p className={styles.detailValue}>IITM Research Park</p>
            </div>
            <div className={styles.detailItem}>
              <h3 className={styles.detailLabel}>Focus</h3>
              <p className={styles.detailValue}>AI, Zero-Trust, Auditability</p>
            </div>
            <div className={styles.detailItem}>
              <h3 className={styles.detailLabel}>Founded</h3>
              <p className={styles.detailValue}>2025</p>
            </div>
          </div>
        </section>

        <section ref={mainImageRef} className={styles.mainImage}>
          <div className={styles.imageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=2012&q=80"
              alt="Horizon"
              loading="eager"
              referrerPolicy="no-referrer"
              className={styles.projectImage}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.src = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2012&q=80";
              }}
            />
          </div>
        </section>

        <section className={styles.visionContent}>
          <div className={styles.visionContentWrapper}>
            <p className={styles.visionText}>
              Where we are going—roadmaps and research directions that define
              the next chapters.
            </p>
          </div>
        </section>
      </main>

      <section className={styles.nextSection}>
        <p className={styles.nextLabel}>Next slide</p>
        <h2 className={styles.nextTitle}>Vision Statement</h2>
        <button
          aria-label="Open next slide"
          className={styles.nextCircleButton}
          onClick={() => {
            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
              onComplete: () => router.push("/about/vision-statement-read"),
            });
          }}
        >
          <ArrowUpRight size={22} />
        </button>
      </section>
    </div>
  );
}

