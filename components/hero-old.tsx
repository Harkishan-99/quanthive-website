"use client"

import { useEffect, useRef } from "react"

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: { x: number; y: number; size: number; speed: number }[] = []
    const particleCount = 50

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
      })
    }

    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      particles.forEach((particle) => {
        if (!ctx || !canvas) return;
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Move particles upward
        particle.y -= particle.speed

        // Reset particles that go off screen
        if (particle.y < 0) {
          particle.y = canvas.height
          particle.x = Math.random() * canvas.width
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <section id="home" className="relative min-h-screen flex items-center px-4 md:px-8 pt-32 pb-20">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }} />
      <div className="max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-medium leading-tight mb-8">
            Democratizing Investment Strategies through XAI
          </h1>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl">
            QuantHive leverages AI and mathematical modeling for making investment strategies transparent and accessible for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="button-primary"
            >
              Get in Touch
            </button>
            <button
              onClick={() => document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" })}
              className="button-secondary"
            >
              Explore Solutions
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
