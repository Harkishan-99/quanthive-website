"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Simple Dialog component
function EmailDialog({ open, onClose, onSubmit, loading, error }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  loading: boolean;
  error: string;
}) {
  const [email, setEmail] = useState("");
  useEffect(() => { if (!open) setEmail(""); }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ background: '#18181b', borderRadius: 14, padding: 32, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.32)', color: '#fff', border: '1px solid #232329' }}
          >
            <h2 style={{ fontWeight: 700, fontSize: 21, marginBottom: 16, color: '#fff' }}>Get Notified</h2>
            <p style={{ fontSize: 15, marginBottom: 18, color: '#cbd5e1' }}>Enter your email to get notified about Flash.</p>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: 11, fontSize: 15, borderRadius: 7, border: '1px solid #333', marginBottom: 13, background: '#232329', color: '#fff', outline: 'none' }}
              disabled={loading}
            />
            {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 2 }}>
              <button onClick={onClose} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: '#232329', color: '#cbd5e1', fontWeight: 500, transition: 'background 0.2s' }} disabled={loading}>Cancel</button>
              <button onClick={() => onSubmit(email)} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: '#fff', color: '#18181b', fontWeight: 600, transition: 'background 0.2s' }} disabled={loading || !email}>Notify Me</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function FlashPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");
  // Email submit handler
  async function handleDialogSubmit(email: string) {
    setDialogLoading(true);
    setDialogError("");
    // Basic email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setDialogError("Please enter a valid email address.");
      setDialogLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/notify-flash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error("Failed to send notification");
      setDialogOpen(false);
      setTimeout(() => alert("Thank you! You'll be notified."), 100);
    } catch (e) {
      setDialogError("Failed to send. Please try again later.");
    } finally {
      setDialogLoading(false);
    }
  }
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

  useEffect(() => {
    // Check if device is mobile and update state
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
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
    // Only animate if screen width is greater than 768px (not mobile)
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
      window.removeEventListener('resize', checkMobile);
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
                 {/* Floating tooltips near the Flash title */}
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
                 <div className={`absolute left-1/2 -translate-x-1/2 z-0 ${isMobile ? 'top-[55%]' : 'top-[68%] md:top-[66%] lg:top-[64%]'}`}>
           <div ref={getNotifiedRef} className="get-notified-btn cursor-pointer" onClick={() => setDialogOpen(true)}>
             <img
               src="/assets/get_notified.svg"
               alt="Get Notified"
               className={isMobile ? "w-[120px] h-auto" : "w-[104px] md:w-[127px] lg:w-[146px] h-auto"}
             />
           </div>
  <EmailDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleDialogSubmit} loading={dialogLoading} error={dialogError} />
         </div>
      </main>
      
      {/* Footer */}
      <Footer />
      
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
    </div>
  );
}

