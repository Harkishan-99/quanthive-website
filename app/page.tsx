"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSlider from "@/components/AboutSlider";
import NewTeamSlider from "@/components/NewTeamSlider";

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
      
      <AboutSlider open={aboutOpen} onClose={() => setAboutOpen(false)} onOpenTeam={() => setTeamOpen(true)} />
      <NewTeamSlider open={teamOpen} onClose={() => setTeamOpen(false)} />
    </>
  );
}