"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Mail } from "lucide-react"

export default function Careers() {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState({
    loading: false,
    success: false,
    error: null as string | null,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [applicationData, setApplicationData] = useState({
    fullName: "",
    email: "",
    contact: "",
    interestedRole: "",
    linkedinProfile: "",
    whyBestFit: "",
    cvBase64: "",
    cvFileName: "",
    cvFileType: "",
    heardFrom: "",
  })

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

  const openApplicationForm = (role: string = "") => {
    setApplicationData(prev => ({
      ...prev,
      interestedRole: role
    }))
    setShowApplicationForm(true)
  }

  const closeApplicationForm = () => {
    setShowApplicationForm(false)
    // Reset form after a short delay
    setTimeout(() => {
      setApplicationData({
        fullName: "",
        email: "",
        contact: "",
        interestedRole: "",
        linkedinProfile: "",
        whyBestFit: "",
        cvBase64: "",
        cvFileName: "",
        cvFileType: "",
        heardFrom: "",
      })
      setApplicationStatus({
        loading: false,
        success: false,
        error: null,
      })
    }, 300)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setApplicationData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      // Check file type
      if (file.type !== "application/pdf" && 
          file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setApplicationStatus({
          loading: false,
          success: false,
          error: "Please upload only PDF or DOCX files.",
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
      
      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setApplicationStatus({
          loading: false,
          success: false,
          error: "File size should not exceed 2MB.",
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
      
      const reader = new FileReader()
      
      reader.onloadend = () => {
        setApplicationData(prev => ({
          ...prev,
          cvBase64: reader.result as string,
          cvFileName: file.name,
          cvFileType: file.type
        }))
      }
      
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setApplicationStatus({ loading: true, success: false, error: null })
      
      const response = await fetch('/api/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application. Please try again later.')
      }
      
      setApplicationStatus({ loading: false, success: true, error: null })
      
      // Reset form after success
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 100)
      
      // Close form after 5 seconds
      setTimeout(() => {
        closeApplicationForm()
      }, 5000)
    } catch (error) {
      console.error('Error submitting application form:', error)
      setApplicationStatus({ 
        loading: false, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit application. Please try again later.' 
      })
    }
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
                      openApplicationForm(positions[selectedPosition].title);
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

        {/* Application Form Popup */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-medium">Job Application</h3>
                    {applicationData.interestedRole && (
                      <p className="text-gray-500">Position: {applicationData.interestedRole}</p>
                    )}
                  </div>
                  <button 
                    onClick={closeApplicationForm} 
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={applicationData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                        disabled={applicationStatus.loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={applicationData.email}
                        onChange={handleInputChange}
                        required
                        pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}"
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                        disabled={applicationStatus.loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                        Contact (Country code + 10 digits) *
                      </label>
                      <input
                        type="tel"
                        id="contact"
                        name="contact"
                        value={applicationData.contact}
                        onChange={handleInputChange}
                        required
                        placeholder="+911234567890"
                        pattern="\+\d{1,4}\d{10}"
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                        disabled={applicationStatus.loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="interestedRole" className="block text-sm font-medium text-gray-700 mb-1">
                        Interested Role *
                      </label>
                      <select
                        id="interestedRole"
                        name="interestedRole"
                        value={applicationData.interestedRole}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                        disabled={applicationStatus.loading}
                      >
                        <option value="" disabled>Select a role</option>
                        {positions.map((position, index) => (
                          <option key={index} value={position.title}>
                            {position.title}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="linkedinProfile" className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn Profile URL *
                      </label>
                      <input
                        type="url"
                        id="linkedinProfile"
                        name="linkedinProfile"
                        value={applicationData.linkedinProfile}
                        onChange={handleInputChange}
                        required
                        placeholder="https://www.linkedin.com/in/yourprofile/"
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                        disabled={applicationStatus.loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="heardFrom" className="block text-sm font-medium text-gray-700 mb-1">
                        How did you hear about us? *
                      </label>
                      <select
                        id="heardFrom"
                        name="heardFrom"
                        value={applicationData.heardFrom}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                        disabled={applicationStatus.loading}
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Email">Email</option>
                        <option value="Friends">Friends</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="whyBestFit" className="block text-sm font-medium text-gray-700 mb-1">
                      Why are you the best fit for this role? (Max 500 characters) *
                    </label>
                    <textarea
                      id="whyBestFit"
                      name="whyBestFit"
                      value={applicationData.whyBestFit}
                      onChange={handleInputChange}
                      required
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                      disabled={applicationStatus.loading}
                    />
                    <div className="text-xs text-gray-500 text-right mt-1">
                      {applicationData.whyBestFit.length}/500 characters
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-1">
                      Upload CV (PDF or DOCX, max 2MB)
                    </label>
                    <input
                      type="file"
                      id="cv"
                      name="cv"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                      disabled={applicationStatus.loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only PDF or DOCX files under 2MB are accepted
                    </p>
                  </div>
                  
                  {applicationStatus.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {applicationStatus.error}
                    </div>
                  )}
                  
                  {applicationStatus.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                      Thank you for your application! We'll review it and get back to you soon.
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end space-x-4">
                    <button 
                      type="button"
                      onClick={closeApplicationForm}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={applicationStatus.loading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="button-primary flex items-center justify-center" 
                      disabled={applicationStatus.loading}
                    >
                      {applicationStatus.loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : "Submit Application"}
                    </button>
                  </div>
                </form>
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
          <div className="flex justify-center">
            <a 
              href="mailto:careers@quanthive.in" 
              className="flex items-center justify-center gap-2 text-gray-800 hover:text-black transition-colors" 
              aria-label="Contact us via email at careers@quanthive.in"
            >
              <Mail className="h-5 w-5" />
              <span className="font-medium">careers@quanthive.in</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
