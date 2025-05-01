import { Code, LineChart, Lock, Zap } from "lucide-react"

export default function Solutions() {
  const solutions = [
    {
      icon: <LineChart className="w-8 h-8 mb-4" />,
      title: "Explainable AI (XAI)",
      description:
        "Our proprietary XAI models provide transparent insights into investment decisions, allowing you to understand the 'why' behind every recommendation.",
    },
    {
      icon: <Zap className="w-8 h-8 mb-4" />,
      title: "Real-Time Optimization",
      description:
        "Advanced mathematical algorithms continuously optimize investment strategies based on market conditions, ensuring optimal performance in any environment.",
    },
    {
      icon: <Code className="w-8 h-8 mb-4" />,
      title: "API Integration",
      description:
        "Seamlessly integrate our investment intelligence into your existing platforms with our robust API, enabling custom solutions for your specific needs.",
    },
    {
      icon: <Lock className="w-8 h-8 mb-4" />,
      title: "Personalized Risk Profiling",
      description:
        "Tailored risk assessments to each investor's financial goals and risk appetite using real-time market data and machine learning, enabling smarter, more aligned investment decisions.",
    },
  ]

  return (
    <section id="solutions" className="section bg-white">
      <div className="container">
        <h2 className="section-title">OUR SOLUTIONS</h2>
        <h3 className="section-heading">Innovative Investment Intelligence</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          {solutions.map((solution, index) => (
            <div key={index} className="flex flex-col">
              {solution.icon}
              <h4 className="text-xl font-medium mb-4">{solution.title}</h4>
              <p className="text-gray-700">{solution.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 bg-gray-100 border-l-4 border-black">
          <h4 className="text-xl font-medium mb-4">Our Commitment</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-medium mb-2">Transparency</h5>
              <p className="text-gray-700 text-sm">
                We believe in complete transparency in our models and methodologies, ensuring you understand exactly how
                your investments are managed.
              </p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Security</h5>
              <p className="text-gray-700 text-sm">
                Your data and investments are protected by enterprise-grade security protocols, ensuring the highest
                level of protection for your assets.
              </p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Performance</h5>
              <p className="text-gray-700 text-sm">
                Our algorithms are continuously optimized for performance, delivering consistent results across various
                market conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
