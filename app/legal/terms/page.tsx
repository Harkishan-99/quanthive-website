"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function TermsPage(): React.ReactElement {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar onAboutClick={() => {}} onTeamClick={() => {}} />
      </div>

      <main className="max-w-3xl mx-auto px-6">
        <section className="min-h-screen pt-36 pb-10">
        <h1 className="text-3xl md:text-5xl font-semibold">Terms & Conditions</h1>
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
            Welcome to <strong>QuantHive Research Technologies Pvt Ltd</strong> (“<strong>QuantHive</strong>”, “<strong>we</strong>”, “<strong>our</strong>”, or
            “<strong>us</strong>”). These Terms & Conditions (“<strong>Terms</strong>”) govern your access to and use of our website
            <span className="mx-1">www.quanthive.in</span>, products, APIs, and services (collectively, the “<strong>Services</strong>”). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, please discontinue use immediately.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">1. Eligibility</h2>
          <p>
            You must be at least 18 years old and legally capable of entering into binding contracts under applicable
            law to use our Services. By using our Services, you represent and warrant that you meet these requirements.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">2. Scope of Services</h2>
          <div className="space-y-2">
            <p>
              QuantHive provides <strong>AI-powered, mathematically driven investment intelligence</strong> solutions,
              including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Explainable AI (XAI) models for investment insights</li>
              <li>Real-time optimization and risk profiling</li>
              <li>Data transparency dashboards</li>
              <li>APIs and related tools for integration</li>
            </ul>
            <p>We reserve the right to modify, enhance, or discontinue any Service at any time.</p>
          </div>

          <h2 className="text-xl md:text-2xl font-medium pt-2">3. Use of Services</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Services only for lawful purposes.</li>
            <li>Provide accurate and updated information when required.</li>
            <li>Do not engage in reverse engineering, tampering, or unauthorized use of our software, models, or APIs.</li>
            <li>Do not misuse our Services for unlawful, fraudulent, or harmful purposes.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-medium pt-2">4. Intellectual Property</h2>
          <p>
            All content, software, algorithms, designs, and materials made available through QuantHive are the
            <strong> exclusive intellectual property of QuantHive Research Technologies Pvt Ltd</strong> or its licensors. You are
            granted a limited, non-exclusive, non-transferable license to use the Services for personal or authorized
            business purposes. No ownership rights are transferred to you.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">5. Data & Privacy</h2>
          <p>
            Your use of the Services is also governed by our <a className="underline" href="/legal/privacy">Privacy Policy</a>,
            which explains how we collect, store, process, and protect your personal data. By using our Services, you
            consent to such processing.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">6. Disclaimers</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Our Services are intended <strong>for informational and educational purposes only</strong> and <strong>do not constitute financial, investment, or legal advice</strong>.</li>
            <li>Investment decisions are inherently risky, and QuantHive does not guarantee accuracy, profitability, or specific outcomes.</li>
            <li>Services are provided on an “<strong>as is</strong>” and “<strong>as available</strong>” basis without warranties of any kind.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-medium pt-2">7. Limitation of Liability</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>QuantHive shall not be liable for indirect, incidental, special, consequential, or punitive damages.</li>
            <li>Our total liability for any claims arising out of or relating to the Services shall not exceed the amount you paid (if any) for using our Services in the 12 months preceding the claim.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-medium pt-2">8. API & Third-Party Tools</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for securing your API keys and usage.</li>
            <li>Misuse, excessive requests, or unauthorized use may lead to suspension or termination.</li>
            <li>We are not responsible for third-party services you access through our platform.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-medium pt-2">9. Termination</h2>
          <p>
            We may suspend or terminate your access to the Services at any time, without prior notice, if you breach
            these Terms or engage in misuse. Upon termination, your right to use the Services immediately ceases.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">10. Confidentiality</h2>
          <p>
            Any non-public information provided by QuantHive, including proprietary algorithms, datasets, or business
            information, must be kept confidential and not disclosed to third parties without prior written consent.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">11. Modifications</h2>
          <p>
            QuantHive reserves the right to update or revise these Terms at any time. Changes will be posted on this
            page, and continued use of the Services constitutes acceptance of the updated Terms.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">12. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes shall
            be subject to the exclusive jurisdiction of the courts in <strong>Chennai, Tamil Nadu</strong>. Disputes may first be
            attempted to be resolved amicably, failing which arbitration under the <strong>Arbitration and Conciliation Act, 1996 (India)</strong> may be initiated.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">13. Contact Us</h2>
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


