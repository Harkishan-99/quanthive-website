"use client"

import { useEffect, useRef } from "react"

export default function LatexEquations() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Financial equations to display
    const equations = [
      {
        name: "Black-Scholes",
        equation: "∂V/∂t + ½σ²S²∂²V/∂S² + rS∂V/∂S - rV = 0",
        x: 50,
        y: 50,
      },
      {
        name: "Geometric Brownian Motion",
        equation: "dSt = μStdt + σStdWt",
        x: 50,
        y: 120,
      },
      {
        name: "Random Walk",
        equation: "St+1 = St + εt",
        x: 50,
        y: 190,
      },
      {
        name: "Bellman Equation",
        equation: "V(s) = maxa{R(s,a) + γ∑s'P(s'|s,a)V(s')}",
        x: 50,
        y: 260,
      },
    ]

    // Draw equations
    ctx.font = "16px serif"
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"

    equations.forEach((eq) => {
      ctx.font = "bold 16px serif"
      ctx.fillText(eq.name + ":", eq.x, eq.y)
      ctx.font = "16px serif"
      ctx.fillText(eq.equation, eq.x, eq.y + 25)
    })

    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      // Redraw equations
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = "16px serif"
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"

      equations.forEach((eq) => {
        ctx.font = "bold 16px serif"
        ctx.fillText(eq.name + ":", eq.x, eq.y)
        ctx.font = "16px serif"
        ctx.fillText(eq.equation, eq.x, eq.y + 25)
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="mt-16 p-8 bg-gray-50 border border-gray-200">
      <h3 className="text-xl font-medium mb-6">Mathematical Foundation</h3>
      <p className="text-gray-700 mb-6">
        Our algorithms are built on established mathematical models and innovative approaches to financial modeling:
      </p>
      <canvas ref={canvasRef} className="w-full h-[300px]" />
    </div>
  )
}
