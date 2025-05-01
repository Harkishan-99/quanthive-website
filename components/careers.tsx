"use client"

import { useState } from "react"

export default function Careers() {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)

  const positions = [
    {
      title: "Data Engineer",
      type: "Full-time",
      location: "Chennai, India / Remote",
      description: "We're looking for a Data Engineer to build and maintain our data infrastructure. You'll be responsible for designing and implementing pipelines to ingest, process, and store financial data at scale, ensuring data quality and accessibility for our quantitative and machine learning teams.",
      requirements: [
        "3+ years of experience in data engineering",
        "Strong programming skills in Python, SQL, and data processing frameworks",
        "Experience with data pipeline tools (Airflow, Luigi, etc.)",
        "Knowledge of cloud infrastructure (AWS, GCP, or Azure)",
        "Familiarity with big data technologies (Spark, Kafka, etc.)",
        "Experience with financial data sources is a plus"
      ],
      benefits: [
        "Competitive salary and equity options",
        "Flexible work hours and remote work options",
        "Professional development budget",
        "Health insurance coverage"
      ]
    },
    {
      title: "Quantitative Developer",
      type: "Full-time",
      location: "Chennai, India / Remote",
      description: "As a Quantitative Developer, you will implement and optimize trading algorithms and financial models in production environments. You'll work at the intersection of finance, mathematics, and software engineering to transform quantitative research into efficient, reliable code.",
      requirements: [
        "Strong programming skills in Python, C++, or Java",
        "Experience implementing and optimizing mathematical models",
        "Knowledge of financial markets, instruments, and trading strategies",
        "Understanding of statistical methods and numerical computing",
        "Background in computer science, mathematics, physics, or related field",
        "Ability to write clean, maintainable, and efficient code"
      ],
      benefits: [
        "Competitive salary and equity options",
        "Flexible work hours and remote work options",
        "Professional development budget",
        "Health insurance coverage"
      ]
    },
    {
      title: "Full Stack Developer",
      type: "Full-time",
      location: "Chennai, India / Remote",
      description: "We're seeking a Full Stack Developer to help build and maintain our web applications and user interfaces. You'll be responsible for developing intuitive and responsive interfaces that present complex financial data in an accessible way.",
      requirements: [
        "3+ years of experience in full-stack development",
        "Proficiency in React, Next.js, and modern JavaScript",
        "Experience with RESTful APIs and backend development",
        "Knowledge of database design and management",
        "Understanding of UI/UX principles"
      ],
      benefits: [
        "Competitive salary and equity options",
        "Flexible work hours and remote work options",
        "Professional development budget",
        "Health insurance coverage"
      ]
    },
  ]

  const openPopup = (index: number) => {
    setSelectedPosition(index)
  }

  const closePopup = () => {
    setSelectedPosition(null)
  }

  return (
    <section id="careers" className="section bg-gray-100">
      <div className="container">
        <h2 className="section-title">CAREERS</h2>
        <h3 className="section-heading">Join Our Team</h3>
        <p className="section-description mb-12">
          We're looking for passionate individuals who are excited about the intersection of AI, finance, and
          mathematical modeling. Join us in our mission to democratize investment strategies and make financial
          intelligence accessible to everyone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {positions.map((position, index) => (
            <div key={index} className="bg-white p-6 border border-gray-200">
              <h4 className="text-xl font-medium mb-2">{position.title}</h4>
              <p className="text-gray-500 mb-1">{position.type}</p>
              <p className="text-gray-500 mb-4">{position.location}</p>
              <button 
                className="text-sm font-medium underline hover:text-gray-600 transition-colors"
                onClick={() => openPopup(index)}
              >
                Learn more
              </button>
            </div>
          ))}
        </div>

        {selectedPosition !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-medium">{positions[selectedPosition].title}</h3>
                    <p className="text-gray-500">{positions[selectedPosition].type} · {positions[selectedPosition].location}</p>
                  </div>
                  <button 
                    onClick={closePopup} 
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">Job Description</h4>
                  <p className="text-gray-700">{positions[selectedPosition].description}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">Requirements</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    {positions[selectedPosition].requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">Benefits</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    {positions[selectedPosition].benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                  <button 
                    onClick={closePopup}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      closePopup();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="button-primary"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-8 border border-gray-200 max-w-2xl mx-auto text-center">
          <h4 className="text-xl font-medium mb-4">Don't see a position that fits?</h4>
          <p className="text-gray-700 mb-6">
            We're always looking for talented individuals to join our team. Send us your resume and tell us how you can
            contribute to our mission.
          </p>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="button-primary"
          >
            Get in Touch
          </button>
        </div>
      </div>
    </section>
  )
}
