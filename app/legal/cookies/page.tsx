"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function CookiesPage(): React.ReactElement {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar onAboutClick={() => {}} onTeamClick={() => {}} />
      </div>

      <main className="max-w-3xl mx-auto px-6">
        <section className="min-h-screen pt-36 pb-10">
        <h1 className="text-3xl md:text-5xl font-semibold">Cookies Policy</h1>
        <div className="h-px bg-[#1B1B1B] mt-8 mb-10" />
        <div className="space-y-6 text-gray-300">
          <p><strong>Effective Date:</strong> May 15, 2025</p>
          <p><strong>Company:</strong> QuantHive Research Technologies Pvt Ltd</p>
          <p>
            <strong>Registered Office:</strong> IITM Research Park, 1FA, I Floor, Kanagam Road, Taramani, Chennai,
            Tamil Nadu – 600113, India
          </p>
          <p><strong>Incubation:</strong> IIT Madras Incubation Cell</p>
          <p>
            This Cookies Policy explains how <strong>QuantHive Research Technologies Pvt Ltd</strong> (“<strong>QuantHive</strong>”, “<strong>we</strong>”, “<strong>our</strong>”, or “<strong>us</strong>”) uses cookies and similar technologies when you visit our website
            <a className="underline ml-1" href="https://www.quanthive.in" target="_blank" rel="noopener noreferrer">www.quanthive.in</a>.
            By using our website, you consent to the use of cookies in accordance with this policy.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. They help improve your
            browsing experience by remembering preferences, analyzing site usage, and enabling certain functionality.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">2. How We Use Cookies</h2>
          <div className="space-y-2">
            <p>QuantHive uses cookies for purposes including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for website operation and secure access.</li>
              <li><strong>Performance & Analytics Cookies:</strong> To analyze website traffic, usage patterns, and improve user experience.</li>
              <li><strong>Functional Cookies:</strong> To remember user preferences and settings.</li>
              <li><strong>Third-Party Cookies:</strong> For integrations, analytics, and embedded content from trusted partners.</li>
            </ul>
          </div>

          <h2 className="text-xl md:text-2xl font-medium pt-2">3. Managing Cookies</h2>
          <p>
            You can control or delete cookies through your browser settings. Please note that disabling cookies may
            limit functionality and impact your experience on our website.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">4. Third-Party Services</h2>
          <p>
            Some cookies may be placed by third-party services integrated with our website, such as analytics tools. We
            do not control these cookies, and their use is governed by third-party privacy policies.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">5. Updates to This Policy</h2>
          <p>
            We may update this Cookies Policy from time to time to reflect changes in technology, law, or business
            practices. Any updates will be posted on this page with the revised effective date.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">6. Contact Us</h2>
          <div>
            <p className="font-medium">QuantHive Research Technologies Pvt Ltd</p>
            <p>IITM Research Park, 1FA, I Floor, Kanagam Road</p>
            <p>Taramani, Chennai, Tamil Nadu – 600113</p>
            <p>Email: <a className="underline" href="mailto:contact@quanthive.in">contact@quanthive.in</a></p>
          </div>

          <p className="text-gray-400 text-sm pt-4">Last updated: May 15, 2025</p>
        </div>

        <div className="mt-12">
          <button
            onClick={() => router.push("/")}
            className="text-gray-200 hover:text-gray-400 underline"
          >
            Back
          </button>
        </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


