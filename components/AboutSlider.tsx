import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import styles from "./AboutSlider.module.css";
import Navbar from "./Navbar";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Each image corresponds to its respective text overlay context
const slideData = [
  {
    imageIndex: 1, // img1.jpg
    title: "Vision Statement",
    description: "QuantHive",
    subtitle: "Vision Statement",
    context: "Vision Statement" // Explicit context mapping
  },
  {
    imageIndex: 2, // img2.jpg
    title: "Origin Story", 
    description: "QuantHive",
    subtitle: "Origin Story",
    context: "Origin Story"
  },
  {
    imageIndex: 3, // img3.jpg
    title: "Timeline & MileStones",
    description: "QuantHive", 
    subtitle: "Timeline & MileStones",
    context: "Timeline & MileStones"
  },
  {
    imageIndex: 4, // img4.jpg
    title: "Growth Validation",
    description: "QuantHive",
    subtitle: "Growth Validation",
    context: "Growth Validation"
  },
  {
    imageIndex: 5, // img5.jpg
    title: "Current Partners",
    description: "QuantHive",
    subtitle: "Current Partners",
    context: "Current Partners"
  },
  {
    imageIndex: 6, // img6.jpg
    title: "Nebula Point",
    description: "QuantHive",
    subtitle: "Cosmic Journey",
    context: "Nebula Point"
  },
  {
    imageIndex: 7, // img7.jpg
    title: "Horizon",
    description: "QuantHive",
    subtitle: "Future Visions",
    context: "Horizon"
  },
];

const slideTitles = slideData.map(slide => slide.title);

type AboutSliderProps = {
  open: boolean;
  onClose: () => void;
  onOpenTeam: () => void;
};

const AboutSlider: React.FC<AboutSliderProps> = ({ open, onClose, onOpenTeam }) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sliderWrapperRef = useRef<HTMLDivElement | null>(null);
  const textOverlaysRef = useRef<HTMLDivElement | null>(null);
  const scrollOffset = useRef(0); // This replaces Lenis scroll
  const targetScrollOffset = useRef(0);
  const scrollVelocity = useRef(0);
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const currentSlideIndex = useRef(0);
  const smoothScrollTween = useRef<gsap.core.Tween | null>(null);

  // Store Three.js objects to avoid re-creating on every render
  const threeObjects = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    updateTexture?: (offset: number) => void;
    render?: () => void;
  }>({});

  const handleAboutClick = () => {};
  const handleTeamClick = () => {
    onOpenTeam();
  };

  // Function to update text overlays and trigger animations
  // This ensures that when a specific card reaches the vertical center,
  // only its corresponding text overlay appears with the correct context/title
  const updateTextOverlays = (offset: number) => {
    const totalSlides = slideData.length;
    const slideHeight = 15;
    const gap = 0.5;
    const cycleHeight = totalSlides * (slideHeight + gap);
    
    // Use the same logic as the texture rendering to find the center slide
    // Find which slide is closest to the center of the viewport
    let centerSlideIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < totalSlides; i++) {
      // Calculate slide position using the same formula as texture rendering
      let slideY = -i * (slideHeight + gap);
      slideY += offset * cycleHeight;
      
      // The center of the viewport is at y = 0
      // Find the slide closest to center
      const distance = Math.abs(slideY);
      if (distance < minDistance) {
        minDistance = distance;
        centerSlideIndex = i;
      }
    }
    
    if (centerSlideIndex !== currentSlideIndex.current) {
      currentSlideIndex.current = centerSlideIndex;
      
      // Animate text elements
      const textElements = textOverlaysRef.current?.querySelectorAll('.slide-text');
      if (textElements) {
        textElements.forEach((element, index) => {
          if (index === centerSlideIndex) {
            // Show current slide text
            (element as HTMLElement).style.display = 'block';
            // Reset transforms but maintain centering positioning
            // Ensure proper positioning for both mobile and desktop
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
              gsap.set(element, { 
                x: 0, 
                y: 0, 
                scale: 1,
                rotation: 0,
                left: '50%',
                top: '50%',
                transform: 'translate3d(-50%, -50%, 0)'
              });
            } else {
              gsap.set(element, { 
                x: 0, 
                y: 0, 
                scale: 1,
                rotation: 0,
                left: '50%',
                top: '50%',
                transform: 'translate3d(-50%, -50%, 0)'
              });
            }
            gsap.fromTo(
              element,
              { opacity: 0, scale: 0.98 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: 'power2.out',
                transformOrigin: 'center center'
              }
            );
          } else {
            // Hide other slide texts
            gsap.to(element, {
              opacity: 0,
              scale: 0.98,
              duration: 0.3,
              ease: 'power2.in',
              onComplete: () => {
                (element as HTMLElement).style.display = 'none';
                // Reset transforms after hiding but maintain centering
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                  gsap.set(element, { 
                    x: 0, 
                    y: 0, 
                    scale: 1,
                    rotation: 0,
                    left: '50%',
                    top: '50%',
                    transform: 'translate3d(-50%, -50%, 0)'
                  });
                } else {
                  gsap.set(element, { 
                    x: 0, 
                    y: 0, 
                    scale: 1,
                    rotation: 0,
                    left: '50%',
                    top: '50%',
                    transform: 'translate3d(-50%, -50%, 0)'
                  });
                }
              }
            });
          }
        });
      }
    }
  };

  useEffect(() => {
    if (!open) return;

    const images: HTMLImageElement[] = [];
    let loadedImageCount = 0;

    function loadImages() {
      // Load images based on slideData imageIndex mapping
      slideData.forEach((slide, index) => {
        const img = new window.Image();
        img.src = `./assets/img${slide.imageIndex}.webp`;
        
        img.onload = function () {
          images[index] = img; // Store image at the correct index position
          loadedImageCount++;
          if (loadedImageCount === slideData.length) {
            initializeScene();
          }
        };
        img.onerror = function () {
          console.warn(`Failed to load image: img${slide.imageIndex}.webp`);
          loadedImageCount++;
          if (loadedImageCount === slideData.length) {
            initializeScene();
          }
        };
      });
    }

    function initializeScene() {
      if (!canvasRef.current) return;
      
      // Function to get responsive dimensions
      const getResponsiveDimensions = () => {
        const isMobile = window.innerWidth <= 768;
        return {
          parentWidth: isMobile ? 8 : 20, // Smaller width on mobile
          parentHeight: isMobile ? 30 : 75, // Much smaller height on mobile
          curvature: isMobile ? 15 : 35, // Less curvature on mobile
          slideHeight: isMobile ? 6 : 15, // Smaller slide height on mobile
          gap: isMobile ? 0.2 : 0.5, // Smaller gap on mobile
          isMobile,
          // Mobile-specific optimizations
          segmentsX: isMobile ? 30 : 200, // Further reduce geometry complexity on mobile
          segmentsY: isMobile ? 30 : 200,
          textureWidth: isMobile ? 512 : 2048, // Much lower texture resolution on mobile
          textureHeight: isMobile ? 2048 : 8192 // Much lower texture height on mobile
        };
      };

      let dimensions = getResponsiveDimensions();
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: !dimensions.isMobile, // Disable antialiasing on mobile for performance
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      // Reduce pixel ratio on mobile for better performance
      renderer.setPixelRatio(dimensions.isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000);

      // Function to create geometry with current dimensions
      const createGeometry = () => {
        const geometry = new THREE.PlaneGeometry(
          dimensions.parentWidth,
          dimensions.parentHeight,
          dimensions.segmentsX,
          dimensions.segmentsY
        );

        const positions = geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          const y = positions[i + 1];
          const distanceFromCenter = Math.abs(y / (dimensions.parentHeight / 2));
          positions[i + 2] = Math.pow(distanceFromCenter, 2) * dimensions.curvature;
        }
        geometry.computeVertexNormals();
        return geometry;
      };

      const parentGeometry = createGeometry();

      const totalSlides = 7;
      let cycleHeight = totalSlides * (dimensions.slideHeight + dimensions.gap);

      const textureCanvas = document.createElement("canvas");
      const ctx = textureCanvas.getContext("2d", {
        alpha: false,
        willReadFrequently: false,
      }) as CanvasRenderingContext2D;

      textureCanvas.width = dimensions.textureWidth;
      textureCanvas.height = dimensions.textureHeight;

      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

      const parentMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });

      const parentMesh = new THREE.Mesh(parentGeometry, parentMaterial);
      parentMesh.position.set(0, 0, 0);
      
      // Check if mobile screen
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // Mobile: Optimized for smaller dimensions
        parentMesh.rotation.x = THREE.MathUtils.degToRad(-8);
        parentMesh.rotation.y = THREE.MathUtils.degToRad(5);
        
        const distance = 12; // Closer camera for smaller content
        const heightOffset = 1.5;
        const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(5));
        const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(5));
        
        camera.position.set(offsetX, heightOffset, offsetZ);
        camera.lookAt(0, -0.5, 0);
        camera.rotation.z = THREE.MathUtils.degToRad(-1);
      } else {
        // Desktop: Original perspective view
        parentMesh.rotation.x = THREE.MathUtils.degToRad(-20);
        parentMesh.rotation.y = THREE.MathUtils.degToRad(20);
        
        const distance = 17.5;
        const heightOffset = 5;
        const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
        const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(20));
        
        camera.position.set(offsetX, heightOffset, offsetZ);
        camera.lookAt(0, -2, 0);
        camera.rotation.z = THREE.MathUtils.degToRad(-5);
      }
      
      scene.add(parentMesh);

      function updateTexture(offset = 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

        // Optimize for mobile by reducing font size and extra slides
        const fontSize = dimensions.isMobile ? 90 : 180;
        ctx.font = `500 ${fontSize}px Dahlia, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Reduce extra slides on mobile for better performance
        const extraSlides = dimensions.isMobile ? 0 : 2; // No extra slides on mobile for maximum performance

        for (let i = -extraSlides; i < totalSlides + extraSlides; i++) {
          let slideY = -i * (dimensions.slideHeight + dimensions.gap);
          slideY += offset * cycleHeight;

          const textureY = (slideY / cycleHeight) * textureCanvas.height;
          let wrappedY = textureY % textureCanvas.height;
          if (wrappedY < 0) wrappedY += textureCanvas.height;

          let slideIndex = ((-i % totalSlides) + totalSlides) % totalSlides;
          let slideNumber = slideIndex + 1;

          const slideRect = {
            x: textureCanvas.width * (dimensions.isMobile ? 0.1 : 0.05), // More padding on mobile
            y: wrappedY,
            width: textureCanvas.width * (dimensions.isMobile ? 0.8 : 0.9), // Smaller width on mobile
            height: (dimensions.slideHeight / cycleHeight) * textureCanvas.height,
          };

          const img = images[slideNumber - 1];
          if (img) {
            const imgAspect = img.width / img.height;
            const rectAspect = slideRect.width / slideRect.height;

            let drawWidth, drawHeight, drawX, drawY;

            if (imgAspect > rectAspect) {
              drawHeight = slideRect.height;
              drawWidth = drawHeight * imgAspect;
              drawX = slideRect.x + (slideRect.width - drawWidth) / 2;
              drawY = slideRect.y;
            } else {
              drawWidth = slideRect.width;
              drawHeight = drawWidth / imgAspect;
              drawX = slideRect.x;
              drawY = slideRect.y + (slideRect.height - drawHeight) / 2;
            }

            ctx.save();
            ctx.beginPath();
            // @ts-ignore: roundRect is not in all TS DOM types
            ctx.roundRect(
              slideRect.x,
              slideRect.y,
              slideRect.width,
              slideRect.height
            );
            ctx.clip();
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();

            // Remove text from canvas - now handled by HTML overlay
          }
        }
        texture.needsUpdate = true;
      }

      // Throttle rendering on mobile for better performance
      let lastRenderTime = 0;
      const renderThrottle = dimensions.isMobile ? 50 : 16; // 20fps on mobile, 60fps on desktop
      
      function render() {
        const now = Date.now();
        if (now - lastRenderTime < renderThrottle) return;
        lastRenderTime = now;
        
        // Use modulo to wrap scroll offset for infinite scrolling
        const wrappedOffset = ((scrollOffset.current % 1) + 1) % 1;
        updateTexture(wrappedOffset);
        updateTextOverlays(wrappedOffset);
        renderer.render(scene, camera);
      }

      // Store for later use
      threeObjects.current = { renderer, scene, camera, updateTexture, render };

      // Initial render
      render();
      
      // Initialize first slide text immediately
      currentSlideIndex.current = -1; // Reset to force update
      updateTextOverlays(0);

      // Handle resize
      let resizeTimeout: NodeJS.Timeout;
      window.addEventListener("resize", () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          
          // Check if dimensions need to be updated
          const newDimensions = getResponsiveDimensions();
          const dimensionsChanged = 
            newDimensions.parentWidth !== dimensions.parentWidth ||
            newDimensions.parentHeight !== dimensions.parentHeight ||
            newDimensions.slideHeight !== dimensions.slideHeight;
            
          if (dimensionsChanged) {
            // Update dimensions
            dimensions = newDimensions;
            cycleHeight = totalSlides * (dimensions.slideHeight + dimensions.gap);
            
            // Recreate geometry with new dimensions
            const newGeometry = createGeometry();
            parentMesh.geometry.dispose(); // Clean up old geometry
            parentMesh.geometry = newGeometry;
            
            // Update texture with new dimensions
            const wrappedOffset = ((scrollOffset.current % 1) + 1) % 1;
            updateTexture(wrappedOffset);
          }
          
          // Update positioning based on screen size
          if (dimensions.isMobile) {
            // Mobile: Optimized for smaller dimensions
            parentMesh.rotation.x = THREE.MathUtils.degToRad(-8);
            parentMesh.rotation.y = THREE.MathUtils.degToRad(5);
            
            const distance = 12; // Closer camera for smaller content
            const heightOffset = 1.5;
            const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(5));
            const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(5));
            
            camera.position.set(offsetX, heightOffset, offsetZ);
            camera.lookAt(0, -0.5, 0);
            camera.rotation.z = THREE.MathUtils.degToRad(-1);
          } else {
            // Desktop: Original perspective view
            parentMesh.rotation.x = THREE.MathUtils.degToRad(-20);
            parentMesh.rotation.y = THREE.MathUtils.degToRad(20);
            
            const distance = 17.5;
            const heightOffset = 5;
            const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
            const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(20));
            
            camera.position.set(offsetX, heightOffset, offsetZ);
            camera.lookAt(0, -2, 0);
            camera.rotation.z = THREE.MathUtils.degToRad(-5);
          }
          
          render();
        }, 250);
      });
    }

    loadImages();

    // Cleanup on unmount
    return () => {
      if (threeObjects.current.renderer) {
        threeObjects.current.renderer.dispose();
      }
      // Optionally: remove event listeners, dispose Three.js objects, etc.
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [open]);

  // Smooth scroll animation function
  const animateToTarget = () => {
    if (Math.abs(targetScrollOffset.current - scrollOffset.current) > 0.001) {
      scrollOffset.current += (targetScrollOffset.current - scrollOffset.current) * 0.1;
      
      // Handle infinite loop wrapping
      if (scrollOffset.current < 0) scrollOffset.current += 1;
      if (scrollOffset.current >= 1) scrollOffset.current -= 1;
      
      if (threeObjects.current.render) threeObjects.current.render();
      requestAnimationFrame(animateToTarget);
    }
  };

  // --- Custom Scroll Logic ---
  useEffect(() => {
    if (!open) return;
    const wrapper = sliderWrapperRef.current;
    if (!wrapper) return;

    // Mouse wheel scroll with smooth animation
    const onWheel = (e: WheelEvent) => {
      // Don't prevent default to allow natural scrolling on all devices
      
      // Cancel any existing smooth scroll tween
      if (smoothScrollTween.current) {
        smoothScrollTween.current.kill();
      }
      
      // Update target scroll position (allow values beyond [0,1] for smooth infinite scrolling)
      const isMobile = window.innerWidth <= 768;
      const scrollSensitivity = isMobile ? 0.0005 : 0.001; // Lower sensitivity on mobile for better control
      targetScrollOffset.current += e.deltaY * scrollSensitivity;
      
      // Use GSAP for smooth scrolling
      smoothScrollTween.current = gsap.to(scrollOffset, {
        current: targetScrollOffset.current,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (threeObjects.current.render) threeObjects.current.render();
        },
        onComplete: () => {
          // Only wrap after animation completes to avoid jumps
          while (scrollOffset.current < 0) scrollOffset.current += 1;
          while (scrollOffset.current >= 1) scrollOffset.current -= 1;
          while (targetScrollOffset.current < 0) targetScrollOffset.current += 1;
          while (targetScrollOffset.current >= 1) targetScrollOffset.current -= 1;
        }
      });
    };

    // Drag scroll
    const onPointerDown = (e: PointerEvent) => {
      // Don't start dragging if clicking on a button or its children
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('svg') || target.closest('path')) {
        return;
      }
      
      isDragging.current = true;
      lastY.current = e.clientY;
      
      // Cancel smooth scroll animation when dragging starts
      if (smoothScrollTween.current) {
        smoothScrollTween.current.kill();
      }
      
      // Don't set pointer capture to allow natural touch scrolling
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientY - lastY.current;
      lastY.current = e.clientY;
      
      // Direct scroll during drag for immediate feedback (allow values beyond [0,1])
      const isMobile = window.innerWidth <= 768;
      const dragSensitivity = isMobile ? 0.001 : 0.003; // Lower sensitivity on mobile for better control
      scrollOffset.current += delta * dragSensitivity;
      targetScrollOffset.current = scrollOffset.current; // Keep target in sync
      
      if (threeObjects.current.render) threeObjects.current.render();
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      
      // Wrap scroll values after dragging ends
      while (scrollOffset.current < 0) scrollOffset.current += 1;
      while (scrollOffset.current >= 1) scrollOffset.current -= 1;
      while (targetScrollOffset.current < 0) targetScrollOffset.current += 1;
      while (targetScrollOffset.current >= 1) targetScrollOffset.current -= 1;
    };

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    wrapper.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerup", onPointerUp);

    // Touch support with smooth scrolling
    let lastTouchY = 0;
    let isTouching = false;
    
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouching = true;
        lastTouchY = e.touches[0].clientY;
        
        // Cancel smooth scroll animation when touch starts
        if (smoothScrollTween.current) {
          smoothScrollTween.current.kill();
        }
        
        // Don't prevent default on mobile to allow natural scrolling
      }
    };
    
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isTouching) {
        const delta = e.touches[0].clientY - lastTouchY;
        lastTouchY = e.touches[0].clientY;
        
        // Direct scroll during touch for immediate feedback (allow values beyond [0,1])
        const isMobile = window.innerWidth <= 768;
        const touchSensitivity = isMobile ? 0.001 : 0.003; // Lower sensitivity on mobile for better control
        scrollOffset.current += delta * touchSensitivity;
        targetScrollOffset.current = scrollOffset.current; // Keep target in sync
        
        if (threeObjects.current.render) threeObjects.current.render();
        
        // Don't prevent default to allow natural mobile scrolling
      }
    };
    
    const onTouchEnd = () => {
      isTouching = false;
      // Wrap scroll values after touching ends
      while (scrollOffset.current < 0) scrollOffset.current += 1;
      while (scrollOffset.current >= 1) scrollOffset.current -= 1;
      while (targetScrollOffset.current < 0) targetScrollOffset.current += 1;
      while (targetScrollOffset.current >= 1) targetScrollOffset.current -= 1;
    };
    
    wrapper.addEventListener("touchstart", onTouchStart);
    wrapper.addEventListener("touchmove", onTouchMove);
    wrapper.addEventListener("touchend", onTouchEnd);
    
    // Prevent scroll interference when touching text overlay area
    const textOverlays = textOverlaysRef.current;
    if (textOverlays) {
      textOverlays.addEventListener("touchstart", (e) => {
        // Only prevent if touching a button
        const target = e.target as HTMLElement;
        if (target.closest('button')) {
          e.preventDefault();
          e.stopPropagation();
          // Disable dragging when touching buttons
          isDragging.current = false;
        }
      });
      
      textOverlays.addEventListener("touchmove", (e) => {
        // Prevent scroll when touching buttons
        const target = e.target as HTMLElement;
        if (target.closest('button')) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }

    // Handle window resize and orientation changes for all screen sizes
    const handleResize = () => {
      const textElements = textOverlaysRef.current?.querySelectorAll('.slide-text');
      
      if (textElements) {
        textElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          // Force proper positioning on resize for all screen sizes
          htmlElement.style.left = '50%';
          htmlElement.style.top = '50%';
          htmlElement.style.transform = 'translate3d(-50%, -50%, 0)';
          htmlElement.style.position = 'fixed';
          htmlElement.style.textAlign = 'center';
          htmlElement.style.display = 'flex';
          htmlElement.style.flexDirection = 'column';
          htmlElement.style.alignItems = 'center';
          htmlElement.style.justifyContent = 'center';
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial positioning check
    handleResize();

    return () => {
      wrapper.removeEventListener("wheel", onWheel);
      wrapper.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerup", onPointerUp);
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchmove", onTouchMove);
      wrapper.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      
      // Cleanup smooth scroll animation
      if (smoothScrollTween.current) {
        smoothScrollTween.current.kill();
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.container}>
      {/* Shared Navbar at the top */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", zIndex: 10 }}>
        <Navbar onAboutClick={handleAboutClick} onTeamClick={handleTeamClick} />
      </div>
      {/* Close button, fixed in top-right */}
      <button
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Close"
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
      >
        ×
      </button>
      <div className={styles.sliderWrapper} ref={sliderWrapperRef}>
        <canvas ref={canvasRef}></canvas>
        <div className={styles.overlay}></div>
        
        {/* Gradient Overlays for fade effect */}
        <div className={styles.gradientTop}></div>
        <div className={styles.gradientBottom}></div>
        
        {/* Text Overlays - Each corresponds to its specific image context */}
        <div className={styles.textOverlays} ref={textOverlaysRef}>
          {slideData.map((slide, index) => (
            <div
              key={index}
              className={`slide-text ${styles.slideText}`}
              data-slide-index={index}
              data-image-index={slide.imageIndex}
              data-context={slide.context}
            >
              <div className={styles.textContent}>
                <p className={styles.description}>{slide.description}</p>
                <h1 className={styles.title}>{slide.subtitle}</h1>
                
                {/* Circle Arrow Button */}
                <button 
                  className={styles.circleButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    
                    // Use the current visible slide index instead of the map index
                    const currentVisibleIndex = currentSlideIndex.current;
                    const currentSlide = slideData[currentVisibleIndex];
                    console.log('Button clicked for slide:', currentSlide.title, 'Visible Index:', currentVisibleIndex, 'Map Index:', index);
                    
                    // Route based on slide context for more reliable routing
                    const routeMap: { [key: string]: string } = {
                      'Vision Statement': '/about/vision-statement-read',
                      'Origin Story': '/about/origin-story-read',
                      'Timeline & MileStones': '/about/timeline-milestones-read',
                      'Growth Validation': '/about/growth-validation-read',
                      'Current Partners': '/about/current-partners-read',
                      'Nebula Point': '/about/nebula-point-read',
                      'Horizon': '/about/horizon-read'
                    };
                    
                    // Try multiple approaches to find the correct route
                    let targetRoute = routeMap[currentSlide.title] || 
                                    routeMap[currentSlide.context] || 
                                    routeMap[currentSlide.subtitle];
                    
                    // Fallback to index-based routing if title-based fails
                    if (!targetRoute) {
                      const indexRouteMap = [
                        '/about/vision-statement-read',
                        '/about/origin-story-read',
                        '/about/timeline-milestones-read',
                        '/about/growth-validation-read',
                        '/about/current-partners-read',
                        '/about/nebula-point-read',
                        '/about/horizon-read'
                      ];
                      targetRoute = indexRouteMap[currentVisibleIndex];
                    }
                    
                    console.log('Routing to:', targetRoute, 'for slide:', currentSlide.title);
                    
                    if (targetRoute) {
                      // Prevent any scroll interference
                      const isMobile = window.innerWidth <= 768;
                      if (isMobile) {
                        // Immediately disable scroll events on mobile
                        isDragging.current = false;
                        if (smoothScrollTween.current) {
                          smoothScrollTween.current.kill();
                        }
                        
                        // Add a longer delay on mobile to prevent scroll conflicts
                        setTimeout(() => {
                          router.push(targetRoute);
                        }, 100);
                      } else {
                        router.push(targetRoute);
                      }
                    } else {
                      console.error('No route found for slide:', currentSlide.title);
                    }
                  }}
                  onTouchStart={(e) => {
                    // Prevent scroll interference when touching button
                    e.stopPropagation();
                  }}
                  onTouchMove={(e) => {
                    // Prevent scroll interference when touching button
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e) => {
                    // Prevent scroll interference when touching button
                    e.stopPropagation();
                    
                    // Ensure click works on mobile by triggering the same logic
                    const currentVisibleIndex = currentSlideIndex.current;
                    const currentSlide = slideData[currentVisibleIndex];
                    
                    const routeMap: { [key: string]: string } = {
                      'Vision Statement': '/about/vision-statement-read',
                      'Origin Story': '/about/origin-story-read',
                      'Timeline & MileStones': '/about/timeline-milestones-read',
                      'Growth Validation': '/about/growth-validation-read',
                      'Current Partners': '/about/current-partners-read',
                      'Nebula Point': '/about/nebula-point-read',
                      'Horizon': '/about/horizon-read'
                    };
                    
                    let targetRoute = routeMap[currentSlide.title] || 
                                    routeMap[currentSlide.context] || 
                                    routeMap[currentSlide.subtitle];
                    
                    if (!targetRoute) {
                      const indexRouteMap = [
                        '/about/vision-statement-read',
                        '/about/origin-story-read',
                        '/about/timeline-milestones-read',
                        '/about/growth-validation-read',
                        '/about/current-partners-read',
                        '/about/nebula-point-read',
                        '/about/horizon-read'
                      ];
                      targetRoute = indexRouteMap[currentVisibleIndex];
                    }
                    
                    if (targetRoute) {
                      // Immediately disable scroll events on mobile
                      isDragging.current = false;
                      if (smoothScrollTween.current) {
                        smoothScrollTween.current.kill();
                      }
                      
                      // Navigate immediately on mobile touch
                      router.push(targetRoute);
                    }
                  }}
                  style={{
                    cursor: index <= 6 ? 'pointer' : 'default',
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    const button = e.currentTarget;
                    const svg = button.querySelector('svg');
                    
                    gsap.to(button, {
                      background: 'rgba(255, 255, 255, 1)',
                      borderColor: 'rgba(255, 255, 255, 1)',
                      backdropFilter: 'none',
                      scale: 1.1,
                      duration: 0.4,
                      ease: 'power2.out'
                    });
                    
                    if (svg) {
                      gsap.to(svg, {
                        color: '#000',
                        x: 2,
                        y: -2,
                        duration: 0.4,
                        ease: 'power2.out'
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    const button = e.currentTarget;
                    const svg = button.querySelector('svg');
                    
                    gsap.to(button, {
                      background: 'rgba(0, 0, 0, 1)',
                      borderColor: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'none',
                      scale: 1,
                      duration: 0.4,
                      ease: 'power2.out'
                    });
                    
                    if (svg) {
                      gsap.to(svg, {
                        color: '#fff',
                        x: 0,
                        y: 0,
                        duration: 0.4,
                        ease: 'power2.out'
                      });
                    }
                  }}
                >
                  <ArrowUpRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutSlider;