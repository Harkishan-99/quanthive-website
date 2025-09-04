"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isMobile, setIsMobile] = useState(false);

  const [showForm, setShowForm] = useState(false); // ✅ form popup toggle
  const [formData, setFormData] = useState({
    name: "",
    organisation: "",
    email: "",
    phone: "",
  });

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch('/api/send-waitlist-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage(result.message);
        setFormData({ name: "", organisation: "", email: "", phone: "" });
        setTimeout(() => {
          setShowForm(false);
          setSubmitMessage("");
        }, 2000);
      } else {
        setSubmitMessage(result.error || 'Failed to submit. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const el = getNotifiedRef.current;
    let addTimer: number | undefined;
    let removeTimer: number | undefined;
    if (el) {
      addTimer = window.setTimeout(() => {
        el.classList.add("auto-shimmer");
      }, 800);
      removeTimer = window.setTimeout(() => {
        el.classList.remove("auto-shimmer");
      }, 800 + 1200);
    }

    if (window.innerWidth > 768) {
      setLeftAnimVars({ duration: 5.5 + Math.random() * 2.0, delay: Math.random() * 1.5 });
      setRightAnimVars({ duration: 6.0 + Math.random() * 2.5, delay: Math.random() * 1.2 });
    }

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
          const scale = 1 - dist / thresholdPx;
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
      window.removeEventListener("resize", checkMobile);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (addTimer) window.clearTimeout(addTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <main className="relative h-screen w-full overflow-hidden">
        <img
          src={isMobile ? "/assets/Flash mobile.webp" : "/assets/Flash Hero.webp"}
          alt={isMobile ? "Flash Mobile" : "Flash Hero"}
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        <div className="relative z-10">
          <Navbar onAboutClick={() => {}} onTeamClick={() => {}} />
        </div>

        {/* Floating tooltips */}
        <div
          ref={leftTooltipRef}
          className="absolute z-0"
          style={{
            top: isMobile ? "37%" : "33%",
            left: isMobile ? "-0%" : "calc(50% - 315px)",
            transform: `translate(${(leftBase.x + leftOffset.x).toFixed(2)}px, ${(leftBase.y + leftOffset.y).toFixed(2)}px)`,
            pointerEvents: "none",
          }}
        >
          <div className="tooltip-enter tooltip-enter-left inline-block">
            <img
              src="/assets/tooltip_left.png"
              alt="100% Transparent"
              className={isMobile ? "w-[120px] h-auto" : "w-[120px] md:w-[140px] lg:w-[150px] h-auto"}
            />
          </div>
        </div>
        <div
          ref={rightTooltipRef}
          className="absolute z-0"
          style={{
            top: isMobile ? "38%" : "38%",
            left: isMobile ? "calc(100% - 122px)" : "calc(50% + 165px)",
            transform: `translate(${(rightBase.x + rightOffset.x).toFixed(2)}px, ${(rightBase.y + rightOffset.y).toFixed(2)}px)`,
            pointerEvents: "none",
          }}
        >
          <div className="tooltip-enter tooltip-enter-right inline-block">
            <img
              src="/assets/tooltip_right.png"
              alt="100x Faster"
              className={isMobile ? "w-[120px] h-auto" : "w-[120px] md:w-[140px] lg:w-[150px] h-auto"}
            />
          </div>
        </div>

        {/* Get Notified Btn */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-0 ${isMobile ? "top-[55%]" : "top-[68%] md:top-[66%] lg:top-[64%]"}`}
        >
          <div ref={getNotifiedRef} className="get-notified-btn cursor-pointer" onClick={() => setShowForm(true)}>
            <img
              src="/assets/get_notified.svg"
              alt="Get Notified"
              className={isMobile ? "w-[120px] h-auto" : "w-[104px] md:w-[127px] lg:w-[146px] h-auto"}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Overlay Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-zinc-900 text-white p-6 md:p-8 rounded-2xl shadow-xl w-[90%] max-w-md"
            >
                             <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center">Join Waitlist</h2>
               {submitMessage && (
                 <div className={`text-center p-3 rounded-lg mb-4 ${
                   submitMessage.includes('successfully') 
                     ? 'bg-green-900/50 text-green-300 border border-green-700' 
                     : 'bg-red-900/50 text-red-300 border border-red-700'
                 }`}>
                   {submitMessage}
                 </div>
               )}
               <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="text"
                  name="organisation"
                  placeholder="Your Organisation"
                  value={formData.organisation}
                  onChange={handleChange}
                  className="w-full rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                                 <button
                   type="submit"
                   disabled={isSubmitting}
                   className={`w-full transition-all duration-200 px-4 py-2 rounded-lg font-medium transform ${
                     isSubmitting 
                       ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                       : 'bg-white text-black hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg'
                   }`}
                 >
                   {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                 </button>
                                 <button
                   type="button"
                   onClick={() => setShowForm(false)}
                   disabled={isSubmitting}
                   className={`w-full mt-2 text-sm transition ${
                     isSubmitting 
                       ? 'text-zinc-600 cursor-not-allowed' 
                       : 'text-zinc-400 hover:text-white'
                   }`}
                 >
                   Cancel
                 </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .get-notified-btn {
          position: relative;
          display: inline-block;
          line-height: 0;
          overflow: hidden;
          border-radius: 9999px;
        }
        .get-notified-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0) 80%);
          transform: translateX(-150%);
          opacity: 0;
          mask-image: url("/assets/get_notified.svg");
          mask-size: 100% 100%;
          mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-image: url("/assets/get_notified.svg");
          -webkit-mask-size: 100% 100%;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
          pointer-events: none;
        }
        .get-notified-btn:hover::after {
          opacity: 1;
          animation: shimmer 1.1s linear infinite;
        }
        .get-notified-btn.auto-shimmer::after {
          opacity: 1;
          animation: shimmer 1.1s linear 1;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(150%);
          }
        }
        .tooltip-enter {
          animation: tooltipIntro 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity, filter;
        }
        .tooltip-enter-left {
          animation-delay: 120ms;
        }
        .tooltip-enter-right {
          animation-delay: 220ms;
        }
        @keyframes tooltipIntro {
          0% {
            opacity: 0;
            transform: translate3d(0, 12px, 0) scale(0.94);
            filter: blur(2px);
          }
          60% {
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
