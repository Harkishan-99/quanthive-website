"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./VisionStatementRead.module.css";

gsap.registerPlugin(ScrollTrigger);

interface VisionStatementReadProps {
  onAboutClick?: () => void;
  onTeamClick?: () => void;
}

const VisionStatementRead: React.FC<VisionStatementReadProps> = ({ 
  onAboutClick = () => {}, 
  onTeamClick = () => {} 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const projectDetailsRef = useRef<HTMLElement>(null);
  const mainImageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Enable native smooth scrolling and prevent overflow
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';

    // Fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.fromTo(entry.target, 
            { 
              opacity: 0, 
              y: 20 
            },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.8, 
              ease: "power2.out" 
            }
          );
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = [
      projectDetailsRef.current,
      mainImageRef.current
    ].filter(Boolean);

    animateElements.forEach(el => {
      if (el) observer.observe(el);
    });

    // Removed parallax effect - all elements now scroll at the same speed

    // Initial page load animation
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );

    return () => {
      observer.disconnect();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      // Reset scroll behavior and overflow
      document.documentElement.style.scrollBehavior = 'auto';
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
    };
  }, []);

  const router = useRouter();

  const handleNavigateNext = () => {
    // simple gsap fade transition then navigate
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => router.push("/origin-story-read"),
    });
  };

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Floating Navbar */}
      <div className={styles.floatingNavbar}>
        <Navbar onAboutClick={onAboutClick} onTeamClick={onTeamClick} />
      </div>
      
      {/* Header */}
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

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.projectType}>QuantHive's</p>
            <h1 ref={heroTitleRef} className={styles.projectTitle}>Vision Statement</h1>
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
              src="/assets/img4.jpg" 
              alt="Kolmården Wildlife Park" 
              className={styles.projectImage}
            />
          </div>
        </section>

        {/* Vision Statement Content */}
        <section className={styles.visionContent}>
          <div className={styles.visionContentWrapper}>
            <p className={styles.visionText}>
            Empowering the financial institution across the globe
            to make smarter, faster, and more confident decisions
            and shaping the future of finance
            with intelligent, adaptive technology.
            </p>
          </div>
        </section>

      </main>
      {/* Next Slide Section */}
      <section className={styles.nextSection}>
        <p className={styles.nextLabel}>Next slide</p>
        <h2 className={styles.nextTitle}>Origin Story</h2>
        <button
          aria-label="Open next slide"
          className={styles.nextCircleButton}
          onClick={handleNavigateNext}
        >
          <ArrowUpRight size={22} />
        </button>
      </section>
    </div>
  );
};

export default VisionStatementRead;