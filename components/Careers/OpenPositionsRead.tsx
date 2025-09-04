"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./CareersRead.module.css";

gsap.registerPlugin(ScrollTrigger);

const OpenPositionsRead: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const projectDetailsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';

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

    const animateElements = [
      projectDetailsRef.current,
    ].filter(Boolean);

    animateElements.forEach(el => {
      if (el) observer.observe(el);
    });

    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );

    return () => {
      observer.disconnect();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      document.documentElement.style.scrollBehavior = 'auto';
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
    };
  }, []);

  const router = useRouter();

  const handleNavigateNext = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => router.push("/careers/internships"),
    });
  };

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
            <a href="#" className={styles.navLink}>Careers</a>
          </nav>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.projectType}>Join Our Team</p>
            <h1 ref={heroTitleRef} className={styles.projectTitle}>Open Positions</h1>
          </div>
        </section>

        <section ref={projectDetailsRef} className={styles.projectDetails}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <h3 className={styles.detailLabel}>Location</h3>
              <p className={styles.detailValue}>Chennai, India</p>
            </div>
            <div className={styles.detailItem}>
              <h3 className={styles.detailLabel}>Type</h3>
              <p className={styles.detailValue}>Full-time & Remote</p>
            </div>
            <div className={styles.detailItem}>
              <h3 className={styles.detailLabel}>Experience</h3>
              <p className={styles.detailValue}>0-5+ Years</p>
            </div>
          </div>
        </section>

        <section className={styles.visionContent}>
          <div className={styles.visionContentWrapper}>
            <div className={styles.noOpeningsSection}>
              <h2 className={styles.sectionTitle}>No Open Positions</h2>
              <div className={styles.noOpeningsContent}>
                <p className={styles.noOpeningsText}>
                  We currently don't have any open positions available. However, we're always
                  looking for talented individuals who are passionate about AI, finance, and
                  building the future of investment research.
                </p>
                <p className={styles.noOpeningsText}>
                  If you're interested in joining our team, feel free to send us your resume
                  and we'll keep it on file for future opportunities.
                </p>
                <div className={styles.contactSection}>
                  <h3 className={styles.contactTitle}>Get in Touch</h3>
                  <p className={styles.contactText}>
                    Send your resume to:
                    <a href="mailto:careers@quanthive.in" className={styles.contactEmail}>
                      careers@quanthive.in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className={styles.nextSection}>
        <p className={styles.nextLabel}>Next</p>
        <h2 className={styles.nextTitle}>Internships</h2>
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

export default OpenPositionsRead;
