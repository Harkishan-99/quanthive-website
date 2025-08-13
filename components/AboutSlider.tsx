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
            // Completely reset all transforms to ensure exact positioning
            gsap.set(element, { 
              x: 0, 
              y: 0, 
              scale: 1,
              rotation: 0,
              clearProps: 'transform' 
            });
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
                // Completely reset all transforms after hiding
                gsap.set(element, { 
                  x: 0, 
                  y: 0, 
                  scale: 1,
                  rotation: 0,
                  clearProps: 'transform' 
                });
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
        img.onload = function () {
          images[index] = img; // Store image at the correct index position
          loadedImageCount++;
          if (loadedImageCount === slideData.length) {
            initializeScene();
          }
        };
        img.onerror = function () {
          console.warn(`Failed to load image: img${slide.imageIndex}.jpg`);
          loadedImageCount++;
          if (loadedImageCount === slideData.length) {
            initializeScene();
          }
        };
        img.src = `./assets/img${slide.imageIndex}.jpg`; // Use explicit imageIndex from slideData
      });
    }

    function initializeScene() {
      if (!canvasRef.current) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        powerPreference: "high-performance",
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000);

      // Function to get responsive dimensions
      const getResponsiveDimensions = () => {
        const isMobile = window.innerWidth <= 768;
        return {
          parentWidth: isMobile ? 12 : 20,
          parentHeight: isMobile ? 45 : 75,
          curvature: isMobile ? 25 : 35,
          slideHeight: isMobile ? 9 : 15,
          gap: isMobile ? 0.3 : 0.5,
          isMobile
        };
      };

      let dimensions = getResponsiveDimensions();
      const segmentsX = 200;
      const segmentsY = 200;

      // Function to create geometry with current dimensions
      const createGeometry = () => {
        const geometry = new THREE.PlaneGeometry(
          dimensions.parentWidth,
          dimensions.parentHeight,
          segmentsX,
          segmentsY
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

      textureCanvas.width = 2048;
      textureCanvas.height = 8192;

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
        // Mobile: Less perspective, more straightened view
        parentMesh.rotation.x = THREE.MathUtils.degToRad(-10);
        parentMesh.rotation.y = THREE.MathUtils.degToRad(8);
        
        const distance = 15;
        const heightOffset = 2;
        const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(8));
        const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(8));
        
        camera.position.set(offsetX, heightOffset, offsetZ);
        camera.lookAt(0, -1, 0);
        camera.rotation.z = THREE.MathUtils.degToRad(-2);
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

        const fontSize = 180;
        ctx.font = `500 ${fontSize}px Dahlia, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const extraSlides = 2;

        for (let i = -extraSlides; i < totalSlides + extraSlides; i++) {
          let slideY = -i * (dimensions.slideHeight + dimensions.gap);
          slideY += offset * cycleHeight;

          const textureY = (slideY / cycleHeight) * textureCanvas.height;
          let wrappedY = textureY % textureCanvas.height;
          if (wrappedY < 0) wrappedY += textureCanvas.height;

          let slideIndex = ((-i % totalSlides) + totalSlides) % totalSlides;
          let slideNumber = slideIndex + 1;

          const slideRect = {
            x: textureCanvas.width * 0.05,
            y: wrappedY,
            width: textureCanvas.width * 0.9,
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

      function render() {
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
            // Mobile: Less perspective, more straightened view
            parentMesh.rotation.x = THREE.MathUtils.degToRad(-10);
            parentMesh.rotation.y = THREE.MathUtils.degToRad(8);
            
            const distance = 15;
            const heightOffset = 2;
            const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(8));
            const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(8));
            
            camera.position.set(offsetX, heightOffset, offsetZ);
            camera.lookAt(0, -1, 0);
            camera.rotation.z = THREE.MathUtils.degToRad(-2);
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
      e.preventDefault();
      
      // Cancel any existing smooth scroll tween
      if (smoothScrollTween.current) {
        smoothScrollTween.current.kill();
      }
      
      // Update target scroll position (allow values beyond [0,1] for smooth infinite scrolling)
      targetScrollOffset.current += e.deltaY * 0.001;
      
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
      // Don't start dragging if clicking on a button
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        return;
      }
      
      isDragging.current = true;
      lastY.current = e.clientY;
      
      // Cancel smooth scroll animation when dragging starts
      if (smoothScrollTween.current) {
        smoothScrollTween.current.kill();
      }
      
      wrapper.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientY - lastY.current;
      lastY.current = e.clientY;
      
      // Direct scroll during drag for immediate feedback (allow values beyond [0,1])
      scrollOffset.current += delta * 0.003;
      targetScrollOffset.current = scrollOffset.current; // Keep target in sync
      
      if (threeObjects.current.render) threeObjects.current.render();
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      wrapper.releasePointerCapture(e.pointerId);
      
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
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastTouchY = e.touches[0].clientY;
        
        // Cancel smooth scroll animation when touch starts
        if (smoothScrollTween.current) {
          smoothScrollTween.current.kill();
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const delta = e.touches[0].clientY - lastTouchY;
        lastTouchY = e.touches[0].clientY;
        
        // Direct scroll during touch for immediate feedback (allow values beyond [0,1])
        scrollOffset.current += delta * 0.003;
        targetScrollOffset.current = scrollOffset.current; // Keep target in sync
        
        if (threeObjects.current.render) threeObjects.current.render();
      }
    };
    const onTouchEnd = () => {
      // Wrap scroll values after touching ends
      while (scrollOffset.current < 0) scrollOffset.current += 1;
      while (scrollOffset.current >= 1) scrollOffset.current -= 1;
      while (targetScrollOffset.current < 0) targetScrollOffset.current += 1;
      while (targetScrollOffset.current >= 1) targetScrollOffset.current -= 1;
    };
    
    wrapper.addEventListener("touchstart", onTouchStart);
    wrapper.addEventListener("touchmove", onTouchMove);
    wrapper.addEventListener("touchend", onTouchEnd);

    return () => {
      wrapper.removeEventListener("wheel", onWheel);
      wrapper.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerup", onPointerUp);
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchmove", onTouchMove);
      wrapper.removeEventListener("touchend", onTouchEnd);
      
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
                    e.preventDefault();
                    e.stopPropagation();
                    // Route per slide index
                    if (index === 0) {
                      router.push('/about/vision-statement-read');
                    } else if (index === 1) {
                      router.push('/about/origin-story-read');
                    } else if (index === 2) {
                      router.push('/about/timeline-milestones-read');
                    } else if (index === 3) {
                      router.push('/about/growth-validation-read');
                    } else if (index === 4) {
                      router.push('/about/current-partners-read');
                    } else if (index === 5) {
                      router.push('/about/nebula-point-read');
                    } else if (index === 6) {
                      router.push('/about/horizon-read');
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