"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import styles from "@/components/VisionStatement/VisionStatementRead.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function OriginStoryReadPage() {
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
      {/* Floating Navbar */}
      <div className={styles.floatingNavbar}>
        <Navbar onAboutClick={() => {}} onTeamClick={() => {}} />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.designerName}>QuantHive</h1>
            <p className={styles.designerTitle}>AI-Native Investment Research Platform</p>
          </div>
          <nav className={styles.nav}>
            <a href="#" className={styles.navLink}>
              Index
            </a>
            <a href="#" className={styles.navLink}>
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.projectType}>QuantHive's</p>
            <h1 className={styles.projectTitle}>Origin Story</h1>
          </div>
        </section>

        {/* Project Details */}
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

        {/* Main Image */}
        <section ref={mainImageRef} className={styles.mainImage}>
          <div className={styles.imageWrapper}>
            <img
              src="https://cdn.mos.cms.futurecdn.net/YxRYisJDPmj5yTaof6wPda.jpg"
              alt="Origin Story"
              className={styles.projectImage}
            />
          </div>
        </section>

        {/* Page Body */}
        <section className={styles.visionContent}>
          <div className={styles.visionContentWrapper}>
            <p className={styles.visionText}>
            QuantHive emerged inside the walls of IIT Madras, blending deep expertise in mathematics, quant-finance, and software engineering; with a goal to solve for global capital market. Driven by a shared frustration with the industry’s reliance on intuition over evidence, the team set out to build the rigorous, intelligent platform they wished existed—one that could finally solve the real financial challenges ignored by conventional tools
            </p>
          </div>
        </section>
      </main>

      {/* Next Slide Section */}
      <section className={styles.nextSection}>
        <p className={styles.nextLabel}>Next slide</p>
        <h2 className={styles.nextTitle}>Timeline & MileStones</h2>
        <button
          aria-label="Open next slide"
          className={styles.nextCircleButton}
          onClick={() => {
            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
              onComplete: () => router.push("/about/timeline-milestones-read"),
            });
          }}
        >
          <ArrowUpRight size={22} />
        </button>
      </section>
    </div>
  );
}

