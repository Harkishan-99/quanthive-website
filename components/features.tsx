import { ArrowRight } from "lucide-react"

export default function Features() {
  const features = [
    {
      title: "The code and results are 100% yours",
      description:
        "Everything produced, from automation scripts to quality reports, is entirely yours. Every detail is carefully documented to ensure you can maintain and scale the results long-term.",
    },
    {
      title: "Confidentiality is a priority",
      description:
        "Confidentiality is a priority, and trust is essential. Strict measures are in place to protect your confidential information, ensuring your project is handled with the highest level of care and security. Any confidential information, such as a small exploitation of a vulnerability, will be immediately destroyed from the system once a report containing those vulnerabilities is sent",
    },
    {
      title: "Your success is the priority",
      description:
        "Long-term relationships are key. Quality and a focus on exceeding expectations help build lasting collaborations based on consistent and reliable results.",
    },
    {
      title: "Total flexibility",
      description:
        "Our outsourcing company specializes in comprehensive staff augmentation management, adapting to the specific needs of each project. We provide the right talent with the flexibility to scale the team according to the project's requirements and progress. Whether you need short-term or long-term resources, we offer tailored solutions to ensure the success of your project.",
    },
    {
      title: "Complete commitment to your project",
      description:
        "Each project has a dedicated team working exclusively on your objectives. Without distractions or context switching, personalized attention and results that meet the highest expectations are guaranteed.",
    },
    {
      title: "Reducing the gap between traditional testing and security testing",
      description:
        "Traditionally, security testing has often been overlooked. However, in today's landscape, it is essential, as companies of all sizes are vulnerable to cyberattacks. The security testing process must be conducted by an ethical specialist due to the sensitive nature of the methodology and the need to limit access in order to protect critical data.",
    },
  ]

  return (
    <section className="px-4 md:px-8 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="section-title">OUR DIFFERENCE</h2>
        <h3 className="section-heading">What makes us your ideal QA partner</h3>

        <div className="space-y-12">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 pb-12 border-b border-gray-200 last:border-0 max-w-3xl">
              <ArrowRight className="w-6 h-6 mt-1 flex-shrink-0 text-black" />
              <div>
                <h4 className="text-xl title-font font-medium mb-4">{feature.title}</h4>
                <p className="section-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
