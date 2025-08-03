// ... existing imports ...
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./AboutSlider.module.css";
import Navbar from "./Navbar";

const slideTitles = [
  "Field Unit",
  "Astral Convergence",
  "Eclipse Core",
  "Luminous",
  "Serenity",
  "Nebula Point",
  "Horizon",
];

type AboutSliderProps = {
  open: boolean;
  onClose: () => void;
};

const AboutSlider: React.FC<AboutSliderProps> = ({ open, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sliderWrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollOffset = useRef(0); // This replaces Lenis scroll
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const animationFrame = useRef<number | null>(null);

  // Store Three.js objects to avoid re-creating on every render
  const threeObjects = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    updateTexture?: (offset: number) => void;
    render?: () => void;
  }>({});

  useEffect(() => {
    if (!open) return;

    const images: HTMLImageElement[] = [];
    let loadedImageCount = 0;

    function loadImages() {
      for (let i = 1; i <= 7; i++) {
        const img = new window.Image();
        img.onload = function () {
          images.push(img);
          loadedImageCount++;
          if (loadedImageCount === 7) {
            initializeScene();
          }
        };
        img.onerror = function () {
          loadedImageCount++;
          if (loadedImageCount === 7) {
            initializeScene();
          }
        };
        img.src = `./assets/img${i}.jpg`; // Adjust path as needed
      }
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

      const parentWidth = 20;
      const parentHeight = 75;
      const curvature = 35;
      const segmentsX = 200;
      const segmentsY = 200;

      const parentGeometry = new THREE.PlaneGeometry(
        parentWidth,
        parentHeight,
        segmentsX,
        segmentsY
      );

      const positions = parentGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const y = positions[i + 1];
        const distanceFromCenter = Math.abs(y / (parentHeight / 2));
        positions[i + 2] = Math.pow(distanceFromCenter, 2) * curvature;
      }
      parentGeometry.computeVertexNormals();

      const totalSlides = 7;
      const slideHeight = 15;
      const gap = 0.5;
      const cycleHeight = totalSlides * (slideHeight + gap);

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
      parentMesh.rotation.x = THREE.MathUtils.degToRad(-20);
      parentMesh.rotation.y = THREE.MathUtils.degToRad(20);
      scene.add(parentMesh);

      const distance = 17.5;
      const heightOffset = 5;
      const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
      const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(20));

      camera.position.set(offsetX, heightOffset, offsetZ);
      camera.lookAt(0, -2, 0);
      camera.rotation.z = THREE.MathUtils.degToRad(-5);

      function updateTexture(offset = 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

        const fontSize = 180;
        ctx.font = `500 ${fontSize}px Dahlia, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const extraSlides = 2;

        for (let i = -extraSlides; i < totalSlides + extraSlides; i++) {
          let slideY = -i * (slideHeight + gap);
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
            height: (slideHeight / cycleHeight) * textureCanvas.height,
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

            ctx.fillStyle = "white";
            ctx.fillText(
              slideTitles[slideIndex],
              textureCanvas.width / 2,
              wrappedY + slideRect.height / 2
            );
          }
        }
        texture.needsUpdate = true;
      }

      function render() {
        updateTexture(scrollOffset.current);
        renderer.render(scene, camera);
      }

      // Store for later use
      threeObjects.current = { renderer, scene, camera, updateTexture, render };

      // Initial render
      render();

      // Handle resize
      let resizeTimeout: NodeJS.Timeout;
      window.addEventListener("resize", () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
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

  // --- Custom Scroll Logic ---
  useEffect(() => {
    if (!open) return;
    const wrapper = sliderWrapperRef.current;
    if (!wrapper) return;

    // Mouse wheel scroll
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Adjust scroll speed as needed
      scrollOffset.current += e.deltaY * 0.001;
      // Keep scrollOffset in [0, 1) for infinite loop
      if (scrollOffset.current < 0) scrollOffset.current += 1;
      if (scrollOffset.current >= 1) scrollOffset.current -= 1;
      if (threeObjects.current.render) threeObjects.current.render();
    };

    // Drag scroll
    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastY.current = e.clientY;
      wrapper.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientY - lastY.current;
      lastY.current = e.clientY;
      scrollOffset.current += delta * 0.003; // Adjust drag sensitivity
      if (scrollOffset.current < 0) scrollOffset.current += 1;
      if (scrollOffset.current >= 1) scrollOffset.current -= 1;
      if (threeObjects.current.render) threeObjects.current.render();
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      wrapper.releasePointerCapture(e.pointerId);
    };

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    wrapper.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerup", onPointerUp);

    // Touch support (optional)
    let lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) lastTouchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const delta = e.touches[0].clientY - lastTouchY;
        lastTouchY = e.touches[0].clientY;
        scrollOffset.current += delta * 0.003;
        if (scrollOffset.current < 0) scrollOffset.current += 1;
        if (scrollOffset.current >= 1) scrollOffset.current -= 1;
        if (threeObjects.current.render) threeObjects.current.render();
      }
    };
    wrapper.addEventListener("touchstart", onTouchStart);
    wrapper.addEventListener("touchmove", onTouchMove);

    return () => {
      wrapper.removeEventListener("wheel", onWheel);
      wrapper.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerup", onPointerUp);
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchmove", onTouchMove);
    };
  }, [open]);

  // Handler stubs for Navbar
  const handleAboutClick = () => {};
  const handleTeamClick = () => {};

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
      </div>
    </div>
  );
};

export default AboutSlider;