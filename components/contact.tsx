"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Linkedin, MapPin } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null as string | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setStatus({ loading: true, success: false, error: null })
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message. Please try again later.')
      }
      
      setStatus({ loading: false, success: true, error: null })
      setFormData({ name: "", email: "", message: "" })
      
      // Show success message for 5 seconds then reset
      setTimeout(() => {
        setStatus({ loading: false, success: false, error: null })
      }, 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setStatus({ 
        loading: false, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send message. Please try again later.' 
      })
    }
  }

  return (
    <section id="contact" className="section bg-white">
      <div className="container">
        <h2 className="section-title">CONTACT US</h2>
        <h3 className="section-heading">Get in Touch</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  disabled={status.loading}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  disabled={status.loading}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  disabled={status.loading}
                />
              </div>
              
              {status.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {status.error}
                </div>
              )}
              
              {status.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
              
              <button 
                type="submit" 
                className="button-primary flex items-center justify-center" 
                disabled={status.loading}
              >
                {status.loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : "Send Message"}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-medium mb-4">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:mail@quanthive.in" className="text-gray-700 hover:text-black">
                      mail@quanthive.in
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Linkedin className="w-5 h-5 mt-1" />
                  <div>
                    <p className="font-medium">LinkedIn</p>
                    <a
                      href="https://www.linkedin.com/company/quanthive/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-black"
                    >
                      linkedin.com/company/quanthive
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 mt-1" />
                  <div>
                    <p className="font-medium">Office</p>
                    <p className="text-gray-700">Chennai, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full aspect-video relative border border-gray-200 overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=IITM+Research+Park&output=embed"
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                allowFullScreen
                title="Google Maps IITM Research Park"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
