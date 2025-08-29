"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function PrivacyPage(): React.ReactElement {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar onAboutClick={() => {}} onTeamClick={() => {}} />
      </div>

      <main className="max-w-3xl mx-auto px-6">
        <section className="min-h-screen pt-36 pb-10">
        <h1 className="text-3xl md:text-5xl font-semibold">Privacy Policy</h1>
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
            At <strong>QuantHive Research Technologies Pvt Ltd</strong> (“<strong>QuantHive</strong>”, “<strong>we</strong>”, “<strong>our</strong>”, or “<strong>us</strong>”),
            we value your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our website
            <a className="underline ml-1" href="https://www.quanthive.in" target="_blank" rel="noopener noreferrer">www.quanthive.in</a>,
            products, APIs, and related services (“<strong>Services</strong>”). By using our Services, you agree to the practices described
            in this Privacy Policy.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Information:</strong> Name, email address, phone number, organization details, and other identifiers you provide voluntarily.</li>
            <li><strong>Usage Data:</strong> Information about your interactions with our website, APIs, and services (e.g., IP address, browser type, pages visited).</li>
            <li><strong>Technical Data:</strong> Device information, cookies, and log data to improve functionality.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-medium pt-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, operate, and improve our Services.</li>
            <li>Personalize user experiences, including risk profiling and AI-driven insights.</li>
            <li>Communicate with you regarding updates, offers, or support.</li>
            <li>Analyze website and API performance.</li>
            <li>Ensure security, prevent fraud, and comply with legal obligations.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-medium pt-2">3. Data Sharing & Disclosure</h2>
          <p>We do not sell your personal data. We may share information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service Providers & Partners</strong> assisting in analytics, hosting, or operations.</li>
            <li><strong>Legal Authorities</strong> when required by law or to protect our rights.</li>
            <li><strong>Business Transfers</strong> if QuantHive is involved in a merger, acquisition, or asset transfer.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-medium pt-2">4. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary to fulfill the purposes outlined in this policy, unless a
            longer retention period is required by law.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">5. Cookies & Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to enhance user experience, analyze usage, and improve our Services.
            See our <a className="underline" href="/legal/cookies">Cookies Policy</a> for details.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to safeguard your personal data. However, no
            method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">7. Your Rights</h2>
          <p>Depending on applicable law, you may have rights to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access, correct, or delete your personal information.</li>
            <li>Object to or restrict processing of your data.</li>
            <li>Withdraw consent at any time (where processing is based on consent).</li>
            <li>Request data portability.</li>
          </ul>
          <p>Requests can be made via the contact information below.</p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">8. Third-Party Links & Services</h2>
          <p>
            Our website and APIs may contain links to third-party websites or services. We are not responsible for the
            privacy practices of these third parties.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">9. International Data Transfers</h2>
          <p>
            If you access our Services from outside India, note that your information may be transferred, stored, and
            processed in India.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">10. Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically to reflect changes in law, technology, or our business
            practices. Updates will be posted on this page with the revised effective date.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">11. Contact Us</h2>
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


