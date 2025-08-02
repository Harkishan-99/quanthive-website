import Link from "next/link";
import React from "react";

const CTAButton = () => {
  return (
    <div className="flex justify-center items-center w-full mt-8">
      <Link
        id="cta-button"
        href="#"
        className="flex items-center justify-center rounded-full bg-cta_btn_gradient p-0.5 md:p-[3px] hover:scale-110 select-none transition-all duration-300 focus:scale-90"
        style={{ width: "auto" }}
      >
        <div className="relative rounded-full bg-background px-6 py-1.5 md:px-5 md:py-2 text-accent md:text-lg overflow-hidden">
          Jump In
          <div className="absolute -bottom-1 right-1/2 translate-x-1/2 bg-accent h-2 rounded-[50%] w-[50%] blur-[8px]" />
        </div>
      </Link>
    </div>
  );
};

export default CTAButton;