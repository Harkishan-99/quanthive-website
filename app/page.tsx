import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import Solutions from "@/components/solutions"
import Careers from "@/components/careers"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import MathBackground from "@/components/math-background"

export default function Home() {
  return (
    <main className="min-h-screen">
      <MathBackground />
      <Navbar />
      <Hero />
      <About />
      <Solutions />
      <Careers />
      <Contact />
      <Footer />
    </main>
  )
}
