"use client"

import { useEffect, useState, useRef } from "react"
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'

type MathElement = {
  equation: string
  x: number
  y: number
  speed: number
  opacity: number
  id: string
}

export default function MathBackground() {
  const [mathElements, setMathElements] = useState<MathElement[]>([])
  const requestRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number>(0)

  useEffect(() => {
    // Financial and mathematical equations to display
    const equations = [
      // Black-Scholes equation
      "\\frac{\\partial V}{\\partial t} + \\frac{1}{2}\\sigma^2S^2\\frac{\\partial^2 V}{\\partial S^2} + rS\\frac{\\partial V}{\\partial S} - rV = 0",

      // Geometric Brownian Motion
      "dS_t = \\mu S_t dt + \\sigma S_t dW_t",

      // Random Walk
      "S_{t+1} = S_t + \\epsilon_t",

      // Bellman Equation
      "V(s) = \\max_a\\{R(s,a) + \\gamma \\sum_{s'} P(s'|s,a)V(s')\\}",

      // Option Pricing Formula
      "C(S,t) = N(d_1)S - N(d_2)Ke^{-r(T-t)}",

      // CAPM
      "E[R_i] = R_f + \\beta_i(E[R_m] - R_f)",

      // Sharpe Ratio
      "S_a = \\frac{E[R_a-R_b]}{\\sigma_a}",

      // Volatility
      "\\sigma = \\sqrt{\\frac{1}{N}\\sum_{i=1}^N (r_i - \\bar{r})^2}",

      // Basic mathematical symbols
      "\\sum_{i=1}^{n} x_i",
      "\\int_{a}^{b} f(x) dx",
      "\\nabla f",
      "\\infty"
    ]

    // Generate initial elements
    const generateElements = () => {
      const elements: MathElement[] = []
      // Create 15 math elements
      for (let i = 0; i < 15; i++) {
        elements.push({
          equation: equations[i % equations.length],
          x: Math.random() * 90 + 5, // Keep away from edges
          y: Math.random() * 90 + 5, // Keep away from edges
          speed: 0.02 + Math.random() * 0.03, // Slow gentle falling speed
          opacity: 0.08,  // Fixed opacity for all elements
          id: `math-${i}`
        })
      }
      return elements
    }

    setMathElements(generateElements())

    // Animation function for falling effect
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        
        // Update positions based on speed
        setMathElements(prevElements => {
          return prevElements.map(element => {
            // Move element down
            let newY = element.y + element.speed * (deltaTime / 16);
            
            // Reset to top if it goes off screen
            if (newY > 100) {
              newY = -5;
              return {
                ...element,
                y: newY,
                x: Math.random() * 90 + 5
              };
            }
            
            return {
              ...element,
              y: newY
            };
          });
        });
      }
      
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    // Cleanup animation frame on unmount
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {mathElements.map((element) => (
        <div
          key={element.id}
          className="absolute transition-transform duration-1000 ease-linear"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            opacity: element.opacity,
          }}
        >
          <InlineMath math={element.equation} />
        </div>
      ))}
    </div>
  )
}
