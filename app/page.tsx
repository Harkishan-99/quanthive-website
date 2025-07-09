/* import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import Solutions from "@/components/solutions"
import Careers from "@/components/careers"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import MathBackground from "@/components/math-background" */

"use client";

import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen pt-10">
      <div className="absolute top-0 left-0 w-10 h-10 bg-[#111111]" />
      <div className="absolute top-0 right-0 w-10 h-10 bg-[#111111]" />
      <div className="absolute bottom-0 left-0 w-10 h-10 bg-[#111111]" />
      <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#111111]" />
      {/* <MathBackground />
      <Navbar />
      <Hero />
      <About />
      <Solutions />
      <Careers />
      <Contact />
      <Footer /> */}
      <Navbar />
      <Hero />
    </main>
  );
}
