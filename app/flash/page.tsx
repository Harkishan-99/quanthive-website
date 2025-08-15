"use client";

import Navbar from "@/components/Navbar";
import React, { useEffect, useRef, useState } from "react";

export default function FlashPage() {
  const leftTooltipRef = useRef<HTMLDivElement>(null!);
  const rightTooltipRef = useRef<HTMLDivElement>(null!);
  const [leftOffset, setLeftOffset] = useState({ x: 0, y: 0 });
  const [rightOffset, setRightOffset] = useState({ x: 0, y: 0 });
  const [leftAnimVars, setLeftAnimVars] = useState<{ duration: number; delay: number }>({ duration: 6, delay: 0 });
  const [rightAnimVars, setRightAnimVars] = useState<{ duration: number; delay: number }>({ duration: 6.5, delay: 0.3 });
  const [leftBase, setLeftBase] = useState({ x: 0, y: 0 });
  const [rightBase, setRightBase] = useState({ x: 0, y: 0 });
  const getNotifiedRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    // Play shimmer once after 1s on page load
    const el = getNotifiedRef.current;
    let addTimer: number | undefined;
    let removeTimer: number | undefined;
    if (el) {
      addTimer = window.setTimeout(() => {
        el.classList.add("auto-shimmer");
      }, 800);
      // remove class after animation finishes (1.1s)
      removeTimer = window.setTimeout(() => {
        el.classList.remove("auto-shimmer");
      }, 800 + 1200);
    }

    // Randomize float animation timings to avoid sync
    setLeftAnimVars({ duration: 5.5 + Math.random() * 2.0, delay: Math.random() * 1.5 });
    setRightAnimVars({ duration: 6.0 + Math.random() * 2.5, delay: Math.random() * 1.2 });

    let animationFrameId = 0;
    let targetLeft = { x: 0, y: 0 };
    let targetRight = { x: 0, y: 0 };

    const thresholdPx = 160;
    const maxOffsetLeft = 26;
    const maxOffsetRight = 22;

    const handleMouseMove = (e: MouseEvent) => {
      const applyFor = (
        ref: React.RefObject<HTMLDivElement>,
        setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        setTarget: (p: { x: number; y: number }) => void,
        maxOffset: number
      ) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < thresholdPx) {
          const scale = 1 - dist / thresholdPx; // closer => bigger
          const tx = (dx / thresholdPx) * maxOffset * scale;
          const ty = (dy / thresholdPx) * maxOffset * scale;
          setTarget({ x: tx, y: ty });
        } else {
          setTarget({ x: 0, y: 0 });
        }
      };

      applyFor(leftTooltipRef, setLeftOffset, (p) => (targetLeft = p), maxOffsetLeft);
      applyFor(rightTooltipRef, setRightOffset, (p) => (targetRight = p), maxOffsetRight);

      if (!animationFrameId) {
        const animate = () => {
          const t = performance.now() / 1000;
          // Smooth continuous base float using sine/cosine with different phases
          setLeftBase({
            x: 6 * Math.sin(t * 0.8),
            y: 8 * Math.cos(t * 0.6),
          });
          setRightBase({
            x: 7 * Math.sin(t * 0.95 + Math.PI / 3),
            y: 6 * Math.cos(t * 0.7 + Math.PI / 5),
          });

          setLeftOffset((prev) => ({
            x: prev.x + (targetLeft.x - prev.x) * 0.12,
            y: prev.y + (targetLeft.y - prev.y) * 0.12,
          }));
          setRightOffset((prev) => ({
            x: prev.x + (targetRight.x - prev.x) * 0.09,
            y: prev.y + (targetRight.y - prev.y) * 0.09,
          }));
          animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (addTimer) window.clearTimeout(addTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
    };
  }, []);
  return (
    <main className="relative min-h-screen w-screen overflow-hidden">
      <img
        src="/assets/Flash%20Hero.png"
        alt="Flash Hero"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      <div className="relative z-10">
        <Navbar onAboutClick={() => {}} onTeamClick={() => {}} />
      </div>
      {/* Floating tooltips near the Flash title */}
      <div
        ref={leftTooltipRef}
        className="absolute z-0"
        style={{
          top: "33%",
          left: "calc(50% - 315px)",
          transform: `translate(${(leftBase.x + leftOffset.x).toFixed(2)}px, ${(leftBase.y + leftOffset.y).toFixed(2)}px)`,
          pointerEvents: "none",
        }}
      >
        <div className="tooltip-enter tooltip-enter-left inline-block">
          <img
            src="/assets/tooltip_left.png"
            alt="100% Transparent"
            className="w-[120px] md:w-[140px] lg:w-[150px] h-auto"
          />
        </div>
      </div>
      <div
        ref={rightTooltipRef}
        className="absolute z-0"
        style={{
          top: "38%",
          left: "calc(50% + 165px)",
          transform: `translate(${(rightBase.x + rightOffset.x).toFixed(2)}px, ${(rightBase.y + rightOffset.y).toFixed(2)}px)`,
          pointerEvents: "none",
        }}
      >
        <div className="tooltip-enter tooltip-enter-right inline-block">
          <img
            src="/assets/tooltip_right.png"
            alt="100x Faster"
            className="w-[120px] md:w-[140px] lg:w-[150px] h-auto"
          />
        </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-[68%] md:top-[66%] lg:top-[64%] z-0">
        <div ref={getNotifiedRef} className="get-notified-btn cursor-pointer">
          <img
            src="/assets/get_notified.svg"
            alt="Get Notified"
            className="w-[104px] md:w-[127px] lg:w-[146px] h-auto"
          />
        </div>
      </div>
      <style jsx>{`
        .get-notified-btn {
          position: relative;
          display: inline-block;
          line-height: 0;
          overflow: hidden;
          border-top-left-radius: 9999px;
          border-bottom-left-radius: 9999px;
          border-top-right-radius: 9999px;
          border-bottom-right-radius: 9999px;
        }
        .get-notified-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 80%);
          transform: translateX(-150%);
          opacity: 0;
          mask-image: url('/assets/get_notified.svg');
          mask-size: 100% 100%;
          mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-image: url('/assets/get_notified.svg');
          -webkit-mask-size: 100% 100%;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
          pointer-events: none;
        }
        .get-notified-btn:hover::after { opacity: 1; animation: shimmer 1.1s linear infinite; }
        .get-notified-btn.auto-shimmer::after { opacity: 1; animation: shimmer 1.1s linear 1; }
        @keyframes shimmer { 0% { transform: translateX(-150%); } 100% { transform: translateX(150%); } }
        /* Floating animation is handled in JS with RAF for smooth, continuous motion */
        .tooltip-enter { 
          animation: tooltipIntro 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity, filter;
        }
        .tooltip-enter-left { animation-delay: 120ms; }
        .tooltip-enter-right { animation-delay: 220ms; }
        @keyframes tooltipIntro {
          0% { opacity: 0; transform: translate3d(0, 12px, 0) scale(0.94); filter: blur(2px); }
          60% { filter: blur(0px); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
      `}</style>
    </main>
  );
}

