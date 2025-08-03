import React from "react";
import { motion } from "framer-motion";
import NewReleaseButton from "./NewReleaseButton";
import CTAButton from "./CTAButton";

const Hero = () => {
  return (
    <motion.section
      id="hero"
      className="hero-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1,
        staggerChildren: 0.3,
        delayChildren: 0.5,
      }}
    >
      {/* Background Video */}
      <video
        className="hero-bg-video"
        src="/assets/bkg_video_three.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Mobile-shifted Content */}
      <div className="hero-content-mobile-shift">
        {/* New Release Button */}
        <motion.div
          className="mt-12 md:mt-16 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: "easeOut",
          }}
        >
          <NewReleaseButton />
        </motion.div>

        {/* Title Section */}
        <motion.div
          className="text-accent text-center mb-14 md:mb-20 select-none"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
            ease: "easeOut",
          }}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-semibold mb-1 md:mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: "easeOut",
            }}
          >
            Democratizing
          </motion.h1>
          <motion.h1
            className="text-3xl md:text-4xl font-semibold mb-1 md:mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.6,
              ease: "easeOut",
            }}
          >
            Wall Street Through
          </motion.h1>
          <motion.h1
            className="text-3xl md:text-4xl font-semibold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.8,
              ease: "easeOut",
            }}
          >
            ExplanableAI
            <span className="relative ml-0.5 leading-none">
              <sup className="absolute top-1 text-xs md:text-sm font-normal">
                TM
              </sup>
            </span>
          </motion.h1>

          <motion.p
            className="text-primary md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 1,
              ease: "easeOut",
            }}
          >
            From Input To Insights, All Within A Minute.
          </motion.p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 1.1,
            ease: "easeOut",
          }}
        >
          <CTAButton />
        </motion.div>
      </div>

      {/* Inline CSS for video background and mobile shift */}
      <style jsx>{`
        .hero-section {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .hero-bg-video {
          position: fixed;
          top: 0;
          left: 0;
          min-width: 100vw;
          min-height: 100vh;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          z-index: -1;
          pointer-events: none;
        }
        .hero-content-mobile-shift {
          width: 100%;
        }
        @media (max-width: 640px) {
          .hero-content-mobile-shift {
            margin-top: 4.5rem; /* Adjust this value as needed for more/less shift */
          }
        }
      `}</style>
    </motion.section>
  );
};

export default Hero;