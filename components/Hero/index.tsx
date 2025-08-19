import React from "react";
import { motion } from "framer-motion";
import NewReleaseButton from "./NewReleaseButton";
import CTAButton from "./CTAButton";

const Hero = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        style={{ filter: 'hue-rotate(180deg)' }}
        src="/assets/bkg_video_five.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 -mt-28">
        {/* New Release Button */}
        <motion.div
          className="mb-6"
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
          className="text-center mb-14 md:mb-20 select-none"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
            ease: "easeOut",
          }}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-semibold mb-1 md:mb-2 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: "easeOut",
            }}
          >
            In Finance
          </motion.h1>
          <motion.h1
            className="text-3xl md:text-4xl font-semibold mb-1 md:mb-2 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.6,
              ease: "easeOut",
            }}
          >
            Speed isn't everything.
          </motion.h1>
          <motion.h1
            className="text-3xl md:text-4xl font-semibold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.8,
              ease: "easeOut",
            }}
          >
            It's the Only Thing.
            <span className="relative ml-0.5 leading-none">
              <sup className="absolute top-1 text-xs md:text-sm font-normal">
                {/* TM */}
              </sup>
            </span>
          </motion.h1>

          <motion.p
            className="text-gray-300 md:text-lg"
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
    </div>
  );
};

export default Hero;