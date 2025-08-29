import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NewTeamSlider.module.css";
import Navbar from "./Navbar";

// Updated team data with current images
const sliderData = [
    { title: "Harkishan", img: "/assets/team-page/harkishan_.webp", url: "https://www.linkedin.com/in/harkishan/" },
    { title: "Dr Neelesh U", img: "/assets/team-page/neelesh_.webp", url: "https://www.linkedin.com/in/neelesh-upadhye-3b031956" },
    { title: "Mayank J", img: "/assets/team-page/mayank_.webp", url: "https://www.linkedin.com/in/mayank-js" },
    { title: "Yuvraj", img: "/assets/team-page/yuvraj_.webp", url: "https://www.linkedin.com/in/yuvishere" },
    { title: "Vivek", img: "/assets/team-page/vivek_.webp", url: "https://www.linkedin.com/in/vivek-vibhuti" },
    { title: "Chirag", img: "/assets/team-page/chirag_.webp", url: "https://www.linkedin.com/in/chirag-jalade" },
  ];

const COPIES = 6;

type NewTeamSliderProps = {
  open: boolean;
  onClose: () => void;
};

const NewTeamSlider: React.FC<NewTeamSliderProps> = ({ open, onClose }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [slideWidth, setSlideWidth] = useState(390);

  // Handler stubs for Navbar
  const handleAboutClick = () => {};
  const handleTeamClick = () => {};

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1000);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set slide width based on device
  useEffect(() => {
    setSlideWidth(isMobile ? 215 : 390);
  }, [isMobile]);

  // Infinite slider logic
  useEffect(() => {
    if (!open) return; // Only run effect when open

    const track = trackRef.current;
    if (!track) return;

    let currentX = -(sliderData.length * slideWidth * 2);
    let targetX = currentX;
    let isDragging = false;
    let startX = 0;
    let lastX = 0;
    let lastMouseX = 0;
    let dragDistance = 0;
    let hasActuallyDragged = false;
    let velocity = 0;
    let lastCurrentX = 0;
    let lastScrollTime = Date.now();

    const sequenceWidth = slideWidth * sliderData.length;
    const totalSlides = sliderData.length * COPIES;

    // Animate
    function animate() {
      if (!track) return;
      currentX += (targetX - currentX) * 0.05;

      // Infinite loop logic
      if (currentX > -sequenceWidth * 1) {
        currentX -= sequenceWidth;
        targetX -= sequenceWidth;
      } else if (currentX < -sequenceWidth * 4) {
        currentX += sequenceWidth;
        targetX += sequenceWidth;
      }
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;

      // Parallax
      const viewportCenter = window.innerWidth / 2;
      Array.from(track.children).forEach((slide) => {
        const img = (slide as HTMLElement).querySelector("img");
        if (!img) return;
        const slideRect = (slide as HTMLElement).getBoundingClientRect();
        if (slideRect.right < -500 || slideRect.left > window.innerWidth + 500) return;
        const slideCenter = slideRect.left + slideRect.width / 2;
        const distanceFromCenter = slideCenter - viewportCenter;
        const parallaxOffset = distanceFromCenter * -0.25;
        
        // Apply different scaling for team member images
        const imgAlt = (img as HTMLImageElement).alt;
        let scale = 2.25; // default scale
        let verticalOffset = 0; // default vertical offset
        
        if (imgAlt === "Vivek") {
          scale = 1.7; // Slightly more zoom in for Vivek
        } else if (imgAlt === "Mayank J") {
          scale = 1.8; // Keep zoom the same
          verticalOffset = 105; // Bring Mayank slightly more down
        } else if (imgAlt === "Harkishan" || imgAlt === "Yuvraj") {
          scale = 1.8; // Slightly more zoom out for Harkishan
        } else if (imgAlt === "Dr Neelesh U") {
          scale = 1.8; // Reduced scale for Neelesh to fix zoom issue
          verticalOffset = 200; // Move Neelesh's image down by 20px
        } else if (imgAlt === "Chirag") {
          scale = 2; // Slightly more zoom in for Chirag
          verticalOffset = 30; // Keep slight vertical offset for Chirag
        }
        (img as HTMLElement).style.transform = `translateX(${parallaxOffset}px) translateY(${verticalOffset}px) scale(${scale})`;
      });

      // Moving state for overlay
      velocity = Math.abs(currentX - lastCurrentX);
      lastCurrentX = currentX;
      const isSlowEnough = velocity < 0.1;
      const hasBeenStillLongEnough = Date.now() - lastScrollTime > 200;
      const isMoving = hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough;
      document.documentElement.style.setProperty("--slider-moving", isMoving ? "1" : "0");

      requestAnimationFrame(animate);
    }

    animate();

    // Mouse/touch/scroll events
    function handleWheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      lastScrollTime = Date.now();
      const scrollDelta = e.deltaY * 1.75;
      targetX -= Math.max(Math.min(scrollDelta, 150), -150);
    }

    function handleTouchStart(e: TouchEvent) {
      isDragging = true;
      startX = e.touches[0].clientX;
      lastX = targetX;
      dragDistance = 0;
      hasActuallyDragged = false;
      lastScrollTime = Date.now();
    }
    function handleTouchMove(e: TouchEvent) {
      if (!isDragging) return;
      const deltaX = (e.touches[0].clientX - startX) * 1.5;
      targetX = lastX + deltaX;
      dragDistance = Math.abs(deltaX);
      if (dragDistance > 5) hasActuallyDragged = true;
      lastScrollTime = Date.now();
    }
    function handleTouchEnd() {
      isDragging = false;
      setTimeout(() => { hasActuallyDragged = false; }, 100);
    }
    function handleMouseDown(e: MouseEvent) {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      lastMouseX = e.clientX;
      lastX = targetX;
      dragDistance = 0;
      hasActuallyDragged = false;
      lastScrollTime = Date.now();
    }
    function handleMouseMove(e: MouseEvent) {
      if (!isDragging) return;
      e.preventDefault();
      const deltaX = (e.clientX - lastMouseX) * 2;
      targetX += deltaX;
      lastMouseX = e.clientX;
      dragDistance += Math.abs(deltaX);
      if (dragDistance > 5) hasActuallyDragged = true;
      lastScrollTime = Date.now();
    }
    function handleMouseUp() {
      isDragging = false;
      setTimeout(() => { hasActuallyDragged = false; }, 100);
    }

    // Click to open URL
    Array.from(track.children).forEach((slide, i) => {
      slide.addEventListener("click", (e: any) => {
        e.preventDefault();
        if (dragDistance < 10 && !hasActuallyDragged) {
          window.open(sliderData[i % sliderData.length].url, "_blank");
        }
      });
    });

    // Event listeners
    track.parentElement?.addEventListener("wheel", handleWheel, { passive: false });
    track.parentElement?.addEventListener("touchstart", handleTouchStart);
    track.parentElement?.addEventListener("touchmove", handleTouchMove);
    track.parentElement?.addEventListener("touchend", handleTouchEnd);
    track.parentElement?.addEventListener("mousedown", handleMouseDown);
    track.parentElement?.addEventListener("mouseleave", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Cleanup
    return () => {
      track.parentElement?.removeEventListener("wheel", handleWheel);
      track.parentElement?.removeEventListener("touchstart", handleTouchStart);
      track.parentElement?.removeEventListener("touchmove", handleTouchMove);
      track.parentElement?.removeEventListener("touchend", handleTouchEnd);
      track.parentElement?.removeEventListener("mousedown", handleMouseDown);
      track.parentElement?.removeEventListener("mouseleave", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [slideWidth, open]);

  // Render slides
  const slides = [];
  for (let i = 0; i < sliderData.length * COPIES; i++) {
    const dataIndex = i % sliderData.length;
    const data = sliderData[dataIndex];
    slides.push(
      <div className={styles.slide} key={i}>
        <div className={styles["slide-image"]}>
          <img
            src={data.img}
            alt={data.title}
            draggable={false}
            style={{ transform: "scale(2.25)" }}
          />
        </div>
        <div className={styles["slide-overlay"]}>
          <p className={styles["project-title"]}>{data.title}</p>
          <div className={styles["project-arrow"]}>
            <svg viewBox="0 0 24 24">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className={styles.overlayWrapper}
          style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            zIndex: 1000,
            background: "rgba(15,15,15,0.98)",
            overflow: "auto"
          }}
        >
          {/* Shared Navbar at the top */}
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", zIndex: 10 }}>
            <Navbar onAboutClick={handleAboutClick} onTeamClick={handleTeamClick} />
          </div>
          {/* Close button, fixed in top-right */}
          <button
            onClick={onClose}
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              fontSize: 32,
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              zIndex: 1001,
            }}
            aria-label="Close"
          >
            ×
          </button>
          <div className={styles.container}>
            <div className={styles.slider}>
              <div className={styles["slide-track"]} ref={trackRef}>
                {slides}
              </div>
            </div>
            
            {/* Footer Links and Copyright */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "20px 24px",
              background: "rgba(15,15,15,0.95)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10
            }}>
              {/* Left side - Contact Links */}
              <div>
                <h4 style={{ color: "#9CA3AF", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Contact</h4>
                <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
                  <a href="#" style={{ color: "#E5E7EB", fontSize: "15px", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#D1D5DB"} onMouseLeave={(e) => e.currentTarget.style.color = "#E5E7EB"}>Mail</a>
                  <a href="#" style={{ color: "#E5E7EB", fontSize: "15px", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#D1D5DB"} onMouseLeave={(e) => e.currentTarget.style.color = "#E5E7EB"}>Location</a>
                  <a href="#" style={{ color: "#E5E7EB", fontSize: "15px", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#D1D5DB"} onMouseLeave={(e) => e.currentTarget.style.color = "#E5E7EB"}>Phone</a>
                </div>
              </div>
              
              {/* Right side - Copyright */}
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0 }}>&copy; 2025 QuantHive</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewTeamSlider;