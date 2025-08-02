import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import Lenis from "@studio-freight/lenis";
import styles from "./AboutSlider.module.css";

const slideTitles = [
  "Field Unit",
  "Astral Convergence",
  "Eclipse Core",
  "Luminous",
  "Serenity",
  "Nebula Point",
  "Horizon",
];

// 1. Add prop types
type AboutSliderProps = {
  open: boolean;
  onClose: () => void;
};

const AboutSlider: React.FC<AboutSliderProps> = ({ open, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!open) return; // Only run effect when open

    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

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

      let currentScroll = 0;
      lenis.on("scroll", ({ scroll, limit }: any) => {
        currentScroll = scroll / limit;
        updateTexture(-currentScroll);
        renderer.render(scene, camera);
      });

      let resizeTimeout: NodeJS.Timeout;
      window.addEventListener("resize", () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }, 250);
      });

      updateTexture(0);
      renderer.render(scene, camera);
    }

    loadImages();

    // Cleanup on unmount
    return () => {
      lenis.destroy();
      // Optionally: remove event listeners, dispose Three.js objects, etc.
    };
  }, [open]); // re-run effect when open changes

  // 2. Conditionally render based on open prop
  if (!open) return null;

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <p id="logo" className={styles.logo}>QUANTHIVE</p>
        <div className={styles.navLinks}>
          <a href="#">About</a>
          <a href="#">Careers</a>
          <a href="#">Contact</a>
        </div>
        {/* Close button */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
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
      </nav>
      <div className={styles.sliderWrapper}>
        <canvas ref={canvasRef}></canvas>
        <div className={styles.overlay}></div>
      </div>
      <footer className={styles.footer}>
        <p>© 2024 QuantHive. All rights reserved.</p>
        <p>Made with ❤️ by QuantHive</p>
      </footer>
    </div>
  );
};

export default AboutSlider;