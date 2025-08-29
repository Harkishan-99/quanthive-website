"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./CareersRead.module.css";

gsap.registerPlugin(ScrollTrigger);

const BenefitsPerksRead: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const projectDetailsRef = useRef<HTMLElement>(null);
  const mainImageRef = useRef<HTMLElement>(null);

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
      mainImageRef.current
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
            <p className={styles.projectType}>Why Join Us</p>
            <h1 ref={heroTitleRef} className={styles.projectTitle}>Benefits & Perks</h1>
          </div>
        </section>

        <section ref={projectDetailsRef} className={styles.projectDetails}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <h3 className={styles.detailLabel}>Work Style</h3>
              <p className={styles.detailValue}>Flexible & Remote</p>
            </div>
            <div className={styles.detailItem}>
              <h3 className={styles.detailLabel}>Growth</h3>
              <p className={styles.detailValue}>Continuous Learning</p>
            </div>
            <div className={styles.detailItem}>
              <h3 className={styles.detailLabel}>Culture</h3>
              <p className={styles.detailValue}>Innovation-First</p>
            </div>
          </div>
        </section>

        <section ref={mainImageRef} className={styles.mainImage}>
          <div className={styles.imageWrapper}>
            <img 
              src="/assets/careers-benefits.webp" 
              alt="Benefits and Perks at QuantHive" 
              className={styles.projectImage}
            />
          </div>
        </section>

        <section className={styles.visionContent}>
          <div className={styles.visionContentWrapper}>
            <div className={styles.benefitsList}>
              <h2 className={styles.sectionTitle}>What We Offer</h2>
              
              <div className={styles.benefitsGrid}>
                <div className={styles.benefitCard}>
                  <h3 className={styles.benefitTitle}>🏠 Flexible Work Environment</h3>
                  <p className={styles.benefitDescription}>
                    Work from anywhere with our remote-first culture. We provide the tools and 
                    infrastructure you need to be productive from home, office, or anywhere in between.
                  </p>
                </div>

                <div className={styles.benefitCard}>
                  <h3 className={styles.benefitTitle}>💰 Competitive Compensation</h3>
                  <p className={styles.benefitDescription}>
                    We offer industry-leading salaries, equity options, and performance-based bonuses 
                    to ensure you're rewarded for your contributions to our success.
                  </p>
                </div>

                <div className={styles.benefitCard}>
                  <h3 className={styles.benefitTitle}>📚 Learning & Development</h3>
                  <p className={styles.benefitDescription}>
                    Continuous learning is at our core. Access to courses, conferences, workshops, 
                    and mentorship programs to help you grow both personally and professionally.
                  </p>
                </div>

                <div className={styles.benefitCard}>
                  <h3 className={styles.benefitTitle}>🏥 Health & Wellness</h3>
                  <p className={styles.benefitDescription}>
                    Comprehensive health insurance, mental health support, gym memberships, and 
                    wellness programs to keep you healthy and happy.
                  </p>
                </div>

                <div className={styles.benefitCard}>
                  <h3 className={styles.benefitTitle}>🎯 Cutting-Edge Technology</h3>
                  <p className={styles.benefitDescription}>
                    Work with the latest AI/ML technologies, cloud platforms, and development tools. 
                    We invest in the best equipment and software for our team.
                  </p>
                </div>

                <div className={styles.benefitCard}>
                  <h3 className={styles.benefitTitle}>🌍 Global Impact</h3>
                  <p className={styles.benefitDescription}>
                    Be part of a team that's reshaping the future of finance. Your work will directly 
                    impact how institutional investors make decisions worldwide.
                  </p>
                </div>
              </div>

              <div className={styles.additionalPerks}>
                <h3 className={styles.perksTitle}>Additional Perks</h3>
                <ul className={styles.perksList}>
                  <li>Unlimited paid time off</li>
                  <li>Parental leave and family support</li>
                  <li>Stock options and equity grants</li>
                  <li>Home office setup allowance</li>
                  <li>Team building events and retreats</li>
                  <li>Professional development budget</li>
                  <li>Flexible working hours</li>
                  <li>Pet-friendly office environment</li>
                </ul>
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

export default BenefitsPerksRead;
