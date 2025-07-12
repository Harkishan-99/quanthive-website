/* import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import Solutions from "@/components/solutions"
import Careers from "@/components/careers"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import MathBackground from "@/components/math-background" */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function Home() {
  const smoothRef = useRef<ScrollSmoother | null>(null);

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
            {/* --------- Old Code ---------- */}
            {/* <MathBackground />
            <Navbar />
            <Hero />
            <About />
            <Solutions />
            <Careers />
            <Contact />
            <Footer /> */}

            <>
              <div className="absolute top-0 left-0 w-10 h-10 bg-[#111111]" />
              <div className="absolute top-0 right-0 w-10 h-10 bg-[#111111]" />
              <div className="absolute bottom-0 left-0 w-10 h-10 bg-[#111111]" />
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#111111]" />
            </>

            <Navbar />
            {/* -------------- New Code ------------ */}
            {/* Boxes */}
            <Hero />

            {/* Add content to enable scrolling */}
            <section className="py-20 px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-accent text-center mb-12">
                  Experience the Power of ExplanableAI™
                </h2>
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                  <div className="p-6 bg-gray-900/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-accent mb-4">
                      Advanced Analytics
                    </h3>
                    <p className="text-primary">
                      Leverage cutting-edge quantitative analysis tools to make
                      informed trading decisions with real-time market insights
                      and predictive modeling.
                    </p>
                  </div>
                  <div className="p-6 bg-gray-900/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-accent mb-4">
                      AI-Driven Insights
                    </h3>
                    <p className="text-primary">
                      Our proprietary ExplanableAI™ technology provides
                      transparent reasoning behind every recommendation, giving
                      you confidence in your investments.
                    </p>
                  </div>
                </div>

                <div className="text-center mb-16">
                  <h3 className="text-2xl font-bold text-accent mb-6">
                    Why Choose Quant Hive?
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <h4 className="font-semibold text-accent mb-2">
                        Data-Driven
                      </h4>
                      <p className="text-primary text-sm">
                        Every decision backed by comprehensive market data
                        analysis
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🚀</span>
                      </div>
                      <h4 className="font-semibold text-accent mb-2">
                        Fast Results
                      </h4>
                      <p className="text-primary text-sm">
                        From input to insights in under a minute
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔍</span>
                      </div>
                      <h4 className="font-semibold text-accent mb-2">
                        Transparent
                      </h4>
                      <p className="text-primary text-sm">
                        Complete visibility into AI reasoning and
                        recommendations
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-8 text-center mb-20">
                  <h3 className="text-2xl font-bold text-accent mb-4">
                    Ready to Get Started?
                  </h3>
                  <p className="text-primary mb-6">
                    Join thousands of traders who trust Quant Hive for their
                    quantitative analysis needs.
                  </p>
                  <button className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
                    Start Your Journey
                  </button>
                </div>

                {/* Extra content to ensure we have enough scroll height */}
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-accent mb-4">
                      Scroll down to see the footer animation!
                    </h3>
                    <p className="text-primary">
                      The footer will slide up when you reach the bottom of the
                      page.
                    </p>
                  </div>

                  <div className="h-96 flex items-center justify-center bg-gray-900/30 rounded-lg">
                    <p className="text-primary text-lg">
                      Keep scrolling to test the footer behavior...
                    </p>
                  </div>

                  <div className="h-96 flex items-center justify-center bg-gray-900/30 rounded-lg">
                    <p className="text-primary text-lg">
                      Almost there! The footer should appear soon.
                    </p>
                  </div>

                  <div className="h-96 flex items-center justify-center bg-gray-900/30 rounded-lg">
                    <p className="text-primary text-lg">
                      This is the bottom section - footer should be visible now!
                    </p>
                  </div>

                  <div className="h-64 flex items-center justify-center">
                    <p className="text-accent text-lg font-semibold">
                      🎉 You've reached the bottom! 🎉
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
