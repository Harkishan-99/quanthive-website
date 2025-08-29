"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function LicensePage(): React.ReactElement {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar onAboutClick={() => {}} onTeamClick={() => {}} />
      </div>

      <main className="max-w-3xl mx-auto px-6">
        <section className="min-h-screen pt-36 pb-10">
        <h1 className="text-3xl md:text-5xl font-semibold">License</h1>
        <div className="h-px bg-[#1B1B1B] mt-8 mb-10" />

        <div className="space-y-6 text-gray-300">
          <p><strong>Effective Date:</strong> May 15, 2025</p>
          <p><strong>Company:</strong> QuantHive Research Technologies Pvt Ltd</p>
          <p>
            This License page describes the terms under which you may use software, APIs,
            documentation, media assets, and other materials provided by <strong>QuantHive</strong>.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">1. Grant of License</h2>
          <p>
            Subject to these terms, QuantHive grants you a limited, non-exclusive,
            non-transferable, and revocable license to access and use our publicly exposed
            website, documentation, and APIs for personal or authorized business purposes.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">2. Usage Rights</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use APIs in accordance with published rate limits and security guidelines.</li>
            <li>Use documentation and media assets for integration and internal enablement.</li>
            <li>Cache or store data only as permitted by applicable API or product terms.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-medium pt-2">3. Restrictions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>No reverse engineering, decompilation, or circumvention of technical controls.</li>
            <li>No resale, sublicensing, or commercial exploitation without written consent.</li>
            <li>No removal or alteration of proprietary notices, licenses, or attributions.</li>
            <li>No use in unlawful, harmful, or misleading applications or services.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-medium pt-2">4. Third‑Party Licenses</h2>
          <p>
            Our products may include or depend on open‑source or third‑party components
            distributed under their respective licenses. Where required, their license texts
            and notices are provided in product distributions or documentation, and your use
            of those components is governed by those third‑party terms.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">5. Trademarks</h2>
          <p>
            “QuantHive”, related logos, and product names are trademarks of QuantHive
            Research Technologies Pvt Ltd. You may not use our marks without prior written
            permission, except for fair use or as otherwise allowed by law.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">6. Ownership</h2>
          <p>
            All rights, title, and interest in and to the Services, software, models,
            datasets, and documentation remain with QuantHive or its licensors. No implied
            licenses are granted.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">7. Termination</h2>
          <p>
            We may suspend or terminate your license for violations of these terms or
            applicable law. Upon termination, you must cease use and destroy copies of any
            licensed materials within your control.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">8. Changes to This License</h2>
          <p>
            We may update this License from time to time. Updates will be posted on this
            page with the revised effective date.
          </p>

          <h2 className="text-xl md:text-2xl font-medium pt-2">9. Contact</h2>
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


