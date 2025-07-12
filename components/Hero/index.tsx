import React from "react";
import NewReleaseButton from "./NewReleaseButton";
import CTAButton from "./CTAButton";

const Hero = () => {
  return (
    <section id="hero" className="relative mt-10 flex flex-col items-center justify-center">
      {/* To-do */}
      <div className="mt-16 mb-6">
        <NewReleaseButton />
      </div>

      <div className="text-accent text-center mb-20 select-none">
        <h1 className="text-4xl font-semibold mb-2">Democratizing</h1>
        <h1 className="text-4xl font-semibold mb-2">Wall Street Through</h1>
        <h1 className="text-4xl font-semibold mb-4">
          ExplanableAI
          <span className="relative ml-0.5 leading-none">
            <sup className="absolute top-1 text-sm font-normal">TM</sup>
          </span>
        </h1>

        <p className="text-primary text-lg">
          From Input To Insights, All Within A Minute.
        </p>
      </div>

      {/* To-do */}
      <CTAButton />
    </section>
  );
};

export default Hero;
