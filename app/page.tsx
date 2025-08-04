"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSlider from "@/components/AboutSlider";
import NewTeamSlider from "@/components/NewTeamSlider";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function Home() {
  const smoothRef = useRef<ScrollSmoother | null>(null);

  // State for AboutSlider open/close
  const [aboutOpen, setAboutOpen] = useState(false);
  // State for NewTeamSlider open/close
  const [teamOpen, setTeamOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      smoothRef.current = ScrollSmoother.create({
        wrapper: "#smooth-scroll-wrapper",
        content: "#smooth-scroll-content",
        smooth: 1,
        effects: true,
      });
    }

    return () => {
      if (smoothRef.current) {
        smoothRef.current.kill();
      }
    };
  }, []);

  return (
    <>
      <div id="smooth-scroll-wrapper">
        <div id="smooth-scroll-content">
          <main className="relative min-h-screen">
            <>
              <div className="absolute top-0 left-0 w-7 h-7 md:w-10 md:h-10 bg-[#111111]" />
              <div className="absolute top-0 right-0 w-7 h-7 md:w-10 md:h-10 bg-[#111111]" />
              <div className="absolute bottom-0 left-0 w-7 h-7 md:w-10 md:h-10 bg-[#111111]" />
              <div className="absolute bottom-0 right-0 w-7 h-7 md:w-10 md:h-10 bg-[#111111]" />
            </>
            <Navbar
              onAboutClick={() => setAboutOpen(true)}
              onTeamClick={() => setTeamOpen(true)}
            />

            <Hero />

            <div className="h-96" /> {/* Placeholder for additional content and also scrollbar needs some space to work properly   */}

            <Footer />
          </main>
        </div>
      </div>
        <AboutSlider open={aboutOpen} onClose={() => setAboutOpen(false)} />
        <NewTeamSlider open={teamOpen} onClose={() => setTeamOpen(false)} />
    </>
  );
}