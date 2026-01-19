"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// PERFORMANCE: Dynamic imports for heavy Three.js components
// These are only loaded when the user opens the About/Team modal
const AboutSlider = dynamic(() => import("@/components/AboutSlider"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

const NewTeamSlider = dynamic(() => import("@/components/NewTeamSlider"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

export default function Home() {
  // State for AboutSlider open/close
  const [aboutOpen, setAboutOpen] = useState(false);
  // State for NewTeamSlider open/close
  const [teamOpen, setTeamOpen] = useState(false);

  return (
    <>
      <main className="relative">
        {/* Corner boxes removed */}
        <Navbar
          onAboutClick={() => setAboutOpen(true)}
          onTeamClick={() => setTeamOpen(true)}
        />

        {/* Hero wrapper to ensure proper containment */}
        <div className="relative w-full h-screen">
          <Hero />
        </div>

        <Footer />
      </main>
      
      {/* PERFORMANCE: Only render sliders when opened to defer Three.js loading */}
      {aboutOpen && (
        <AboutSlider open={aboutOpen} onClose={() => setAboutOpen(false)} onOpenTeam={() => setTeamOpen(true)} />
      )}
      {teamOpen && (
        <NewTeamSlider open={teamOpen} onClose={() => setTeamOpen(false)} />
      )}
    </>
  );
}