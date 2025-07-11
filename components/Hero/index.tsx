import React from "react";

const Hero = () => {
  return (
    <section className="relative mt-10 flex flex-col items-center justify-center">
      {/* To-do */}
      <div className="mt-16 mb-6">
        <div className="">New Release Btn</div>
      </div>

      <div className="text-accent text-center mb-20">
        <h1 className="text-4xl font-semibold mb-2">Democratizing</h1>
        <h1 className="text-4xl font-semibold mb-2">Wall Street Through</h1>
        <h1 className="text-4xl font-semibold mb-4">
          ExplanableAI<sup className="text-sm font-normal"> TM</sup>
        </h1>

        <p className="text-primary text-lg">
          From Input To Insights, All Within A Minute.
        </p>
      </div>

      {/* To-do */}
      <div>CTA Btn</div>
    </section>
  );
};

export default Hero;
