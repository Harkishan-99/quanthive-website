"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import styles from "@/components/VisionStatement/VisionStatementRead.module.css";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export default function GrowthValidationReadPage() {
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
            <p className={styles.projectType}>QuantHive's</p>
            <h1 className={styles.projectTitle}>Growth Validation</h1>
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
          <div className={styles.logoGridWrapper}>
            <h3 className={styles.logoGridTitle}>Trusted by Industry Leaders</h3>
            <div className={styles.logoGrid}>
              
              <div className={styles.logoItem}>
                <img
                  src="/assets/iitm_logo.png"
                  alt="IIT Madras"
                  className={styles.companyLogo}
                />
              </div>
              <div className={styles.logoItem}>
                <img
                  src="/assets/google_logo.png"
                  alt="Google"
                  className={styles.companyLogo}
                />
              </div>
              <div className={styles.logoItem}>
                <img
                  src="/assets/aws_logo.png"
                  alt="Amazon Web Services"
                  className={styles.companyLogo}
                />
              </div>
              <div className={styles.logoItem}>
                <img
                  src="/assets/nvidia_logo.png"
                  alt="NVIDIA"
                  className={styles.companyLogo}
                />
              </div>
              <div className={styles.logoItem}>
                <img
                  src="/assets/nasscom_logo.png"
                  alt="NASSCOM"
                  className={styles.companyLogo}
                />
              </div>

              <div className={styles.logoItem}>
                <img
                  src="/assets/er_logo.png"
                  alt="Exception Raised"
                  className={styles.companyLogo}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.visionContent}>
          <div className={styles.visionContentWrapper}>
            <p className={styles.visionText}>
              Evidence and adoption—signals that validate the trajectory and
              product-market fit for an AI-native research platform.
            </p>
          </div>
        </section>
      </main>

      <section className={styles.nextSection}>
        <p className={styles.nextLabel}>Next slide</p>
        <h2 className={styles.nextTitle}>Current Partners</h2>
        <button
          aria-label="Open next slide"
          className={styles.nextCircleButton}
          onClick={() => {
            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
              onComplete: () => router.push("/about/current-partners-read"),
            });
          }}
        >
          <ArrowUpRight size={22} />
        </button>
      </section>
    </div>
  );
}

