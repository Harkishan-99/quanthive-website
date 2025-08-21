import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CTAButton from "./CTAButton";
import AnimatedWord from "./AnimatedWord";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [titleClass, setTitleClass] = useState("text-center mb-14 md:mb-20 select-none");
  const [titleH1Class, setTitleH1Class] = useState("text-4xl md:text-6xl lg:text-7xl font-semibold mb-4 text-white");

  const handleWordChange = (word: string, shouldCenter: boolean) => {
    if (shouldCenter) {
      setTitleClass("text-center mb-14 md:mb-20 select-none w-full");
      setTitleH1Class("text-4xl md:text-6xl lg:text-7xl font-semibold mb-4 text-white text-center");
    } else {
      setTitleClass("text-center mb-14 md:mb-20 select-none");
      setTitleH1Class("text-4xl md:text-6xl lg:text-7xl font-semibold mb-4 text-white text-center");
    }
  };

  useEffect(() => {
    // Preload critical resources
    const preloadVideo = () => {
      if (videoRef.current) {
        videoRef.current.load();
      }
    };

    preloadVideo();
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        style={{ filter: 'hue-rotate(180deg)' }}
        src="/assets/bkg_video_five.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      
      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 -mt-28">
        {/* Title Section */}
        <motion.div
          className={titleClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: "easeOut",
          }}
        >
          <motion.h1
            className={`${titleH1Class} font-light tracking-tight font-clash-display text-premium`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: "easeOut",
            }}
          >
            We make AI{" "}
            <AnimatedWord 
              words={["Accelerated", "Explainable", "Streamlined", "Responsible"]}
              interval={2000}
              className="text-white"
              onWordChange={handleWordChange}
            />
            
          </motion.h1>

          <motion.p
            className="text-white text-lg md:text-xl lg:text-2xl font-light tracking-wide font-inter text-premium"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.5,
              ease: "easeOut",
            }}
          >
            Building The Future Of Global Capital Market
          </motion.p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.6,
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