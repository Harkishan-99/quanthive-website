// The legal pages' text (LegalPage.tsx): Terms & Conditions, Privacy Policy and
// License. Each is its details (date, company, …), an opening paragraph, then
// numbered sections of paragraphs and lists. In a run of text, [label](/path)
// is a link; paths on this site open without a reload.

export type LegalDoc = "terms" | "privacy" | "license";

export type LegalSection = {
  title: string;
  /** Paragraphs and lists, in order. */
  body: ({ p: string } | { list: string[] })[];
};

export type LegalText = {
  details: [label: string, value: string][];
  intro: string;
  sections: LegalSection[];
  updated: string;
};

const COMPANY = "QuantHive Research Technologies Pvt Ltd";
const OFFICE = "3rd floor, D Block, IITM Research Park, Taramani, Chennai, Tamil Nadu – 600113, India";

/** Every page ends on the same contact section. */
export const CONTACT_LINES = [
  COMPANY,
  "3rd floor, D Block, IITM Research Park",
  "Taramani, Chennai, Tamil Nadu – 600113",
];
export const CONTACT_EMAIL = "contact@quanthive.in";

export const LEGAL: Record<LegalDoc, LegalText> = {
  terms: {
    details: [
      ["Effective date", "May 15, 2025"],
      ["Company", COMPANY],
      ["Registered office", OFFICE],
      ["Incubation", "IIT Madras Incubation Cell"],
    ],
    intro:
      "Welcome to QuantHive Research Technologies Pvt Ltd (“QuantHive”, “we”, “our”, or “us”). These Terms & Conditions (“Terms”) govern your access to and use of our website www.quanthive.in, products, APIs, and services (collectively, the “Services”). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, please discontinue use immediately.",
    sections: [
      {
        title: "Eligibility",
        body: [
          {
            p: "You must be at least 18 years old and legally capable of entering into binding contracts under applicable law to use our Services. By using our Services, you represent and warrant that you meet these requirements.",
          },
        ],
      },
      {
        title: "Scope of Services",
        body: [
          { p: "QuantHive provides AI-powered, mathematically driven investment intelligence solutions, including but not limited to:" },
          {
            list: [
              "Explainable AI (XAI) models for investment insights",
              "Real-time optimization and risk profiling",
              "Data transparency dashboards",
              "APIs and related tools for integration",
            ],
          },
          { p: "We reserve the right to modify, enhance, or discontinue any Service at any time." },
        ],
      },
      {
        title: "Use of Services",
        body: [
          {
            list: [
              "Use the Services only for lawful purposes.",
              "Provide accurate and updated information when required.",
              "Do not engage in reverse engineering, tampering, or unauthorized use of our software, models, or APIs.",
              "Do not misuse our Services for unlawful, fraudulent, or harmful purposes.",
            ],
          },
        ],
      },
      {
        title: "Intellectual Property",
        body: [
          {
            p: "All content, software, algorithms, designs, and materials made available through QuantHive are the exclusive intellectual property of QuantHive Research Technologies Pvt Ltd or its licensors. You are granted a limited, non-exclusive, non-transferable license to use the Services for personal or authorized business purposes. No ownership rights are transferred to you.",
          },
        ],
      },
      {
        title: "Data & Privacy",
        body: [
          {
            p: "Your use of the Services is also governed by our [Privacy Policy](/privacy), which explains how we collect, store, process, and protect your personal data. By using our Services, you consent to such processing.",
          },
        ],
      },
      {
        title: "Disclaimers",
        body: [
          {
            list: [
              "Our Services are intended for informational and educational purposes only and do not constitute financial, investment, or legal advice.",
              "Investment decisions are inherently risky, and QuantHive does not guarantee accuracy, profitability, or specific outcomes.",
              "Services are provided on an “as is” and “as available” basis without warranties of any kind.",
            ],
          },
        ],
      },
      {
        title: "Limitation of Liability",
        body: [
          {
            list: [
              "QuantHive shall not be liable for indirect, incidental, special, consequential, or punitive damages.",
              "Our total liability for any claims arising out of or relating to the Services shall not exceed the amount you paid (if any) for using our Services in the 12 months preceding the claim.",
            ],
          },
        ],
      },
      {
        title: "API & Third-Party Tools",
        body: [
          {
            list: [
              "You are responsible for securing your API keys and usage.",
              "Misuse, excessive requests, or unauthorized use may lead to suspension or termination.",
              "We are not responsible for third-party services you access through our platform.",
            ],
          },
        ],
      },
      {
        title: "Termination",
        body: [
          {
            p: "We may suspend or terminate your access to the Services at any time, without prior notice, if you breach these Terms or engage in misuse. Upon termination, your right to use the Services immediately ceases.",
          },
        ],
      },
      {
        title: "Confidentiality",
        body: [
          {
            p: "Any non-public information provided by QuantHive, including proprietary algorithms, datasets, or business information, must be kept confidential and not disclosed to third parties without prior written consent.",
          },
        ],
      },
      {
        title: "Modifications",
        body: [
          {
            p: "QuantHive reserves the right to update or revise these Terms at any time. Changes will be posted on this page, and continued use of the Services constitutes acceptance of the updated Terms.",
          },
        ],
      },
      {
        title: "Governing Law & Dispute Resolution",
        body: [
          {
            p: "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu. Disputes may first be attempted to be resolved amicably, failing which arbitration under the Arbitration and Conciliation Act, 1996 (India) may be initiated.",
          },
        ],
      },
    ],
    updated: "May 15, 2025",
  },

  privacy: {
    details: [
      ["Effective date", "May 15, 2025"],
      ["Company", COMPANY],
      ["Registered office", OFFICE],
      ["Incubation", "IIT Madras Incubation Cell"],
    ],
    intro:
      "At QuantHive Research Technologies Pvt Ltd (“QuantHive”, “we”, “our”, or “us”), we value your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website [www.quanthive.in](/), products, APIs, and related services (“Services”). By using our Services, you agree to the practices described in this Privacy Policy.",
    sections: [
      {
        title: "Information We Collect",
        body: [
          {
            list: [
              "Personal Information: Name, email address, phone number, organization details, and other identifiers you provide voluntarily.",
              "Usage Data: Information about your interactions with our website, APIs, and services (e.g., IP address, browser type, pages visited).",
              "Technical Data: Device information, cookies, and log data to improve functionality.",
            ],
          },
        ],
      },
      {
        title: "How We Use Your Information",
        body: [
          {
            list: [
              "Provide, operate, and improve our Services.",
              "Personalize user experiences, including risk profiling and AI-driven insights.",
              "Communicate with you regarding updates, offers, or support.",
              "Analyze website and API performance.",
              "Ensure security, prevent fraud, and comply with legal obligations.",
            ],
          },
        ],
      },
      {
        title: "Data Sharing & Disclosure",
        body: [
          { p: "We do not sell your personal data. We may share information with:" },
          {
            list: [
              "Service Providers & Partners assisting in analytics, hosting, or operations.",
              "Legal Authorities when required by law or to protect our rights.",
              "Business Transfers if QuantHive is involved in a merger, acquisition, or asset transfer.",
            ],
          },
        ],
      },
      {
        title: "Data Retention",
        body: [
          {
            p: "We retain personal data only as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.",
          },
        ],
      },
      {
        title: "Cookies & Tracking Technologies",
        body: [
          {
            p: "We use cookies and similar technologies to enhance user experience, analyze usage, and improve our Services. See our Cookies Policy for details.",
          },
        ],
      },
      {
        title: "Data Security",
        body: [
          {
            p: "We implement appropriate technical and organizational measures to safeguard your personal data. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.",
          },
        ],
      },
      {
        title: "Your Rights",
        body: [
          { p: "Depending on applicable law, you may have rights to:" },
          {
            list: [
              "Access, correct, or delete your personal information.",
              "Object to or restrict processing of your data.",
              "Withdraw consent at any time (where processing is based on consent).",
              "Request data portability.",
            ],
          },
          { p: "Requests can be made via the contact information below." },
        ],
      },
      {
        title: "Third-Party Links & Services",
        body: [
          {
            p: "Our website and APIs may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.",
          },
        ],
      },
      {
        title: "International Data Transfers",
        body: [
          {
            p: "If you access our Services from outside India, note that your information may be transferred, stored, and processed in India.",
          },
        ],
      },
      {
        title: "Updates to This Policy",
        body: [
          {
            p: "We may update this Privacy Policy periodically to reflect changes in law, technology, or our business practices. Updates will be posted on this page with the revised effective date.",
          },
        ],
      },
    ],
    updated: "May 15, 2025",
  },

  license: {
    details: [
      ["Effective date", "May 15, 2025"],
      ["Company", COMPANY],
    ],
    intro:
      "This License page describes the terms under which you may use software, APIs, documentation, media assets, and other materials provided by QuantHive.",
    sections: [
      {
        title: "Grant of License",
        body: [
          {
            p: "Subject to these terms, QuantHive grants you a limited, non-exclusive, non-transferable, and revocable license to access and use our publicly exposed website, documentation, and APIs for personal or authorized business purposes.",
          },
        ],
      },
      {
        title: "Usage Rights",
        body: [
          {
            list: [
              "Use APIs in accordance with published rate limits and security guidelines.",
              "Use documentation and media assets for integration and internal enablement.",
              "Cache or store data only as permitted by applicable API or product terms.",
            ],
          },
        ],
      },
      {
        title: "Restrictions",
        body: [
          {
            list: [
              "No reverse engineering, decompilation, or circumvention of technical controls.",
              "No resale, sublicensing, or commercial exploitation without written consent.",
              "No removal or alteration of proprietary notices, licenses, or attributions.",
              "No use in unlawful, harmful, or misleading applications or services.",
            ],
          },
        ],
      },
      {
        title: "Third-Party Licenses",
        body: [
          {
            p: "Our products may include or depend on open-source or third-party components distributed under their respective licenses. Where required, their license texts and notices are provided in product distributions or documentation, and your use of those components is governed by those third-party terms.",
          },
        ],
      },
      {
        title: "Trademarks",
        body: [
          {
            p: "“QuantHive”, related logos, and product names are trademarks of QuantHive Research Technologies Pvt Ltd. You may not use our marks without prior written permission, except for fair use or as otherwise allowed by law.",
          },
        ],
      },
      {
        title: "Ownership",
        body: [
          {
            p: "All rights, title, and interest in and to the Services, software, models, datasets, and documentation remain with QuantHive or its licensors. No implied licenses are granted.",
          },
        ],
      },
      {
        title: "Termination",
        body: [
          {
            p: "We may suspend or terminate your license for violations of these terms or applicable law. Upon termination, you must cease use and destroy copies of any licensed materials within your control.",
          },
        ],
      },
      {
        title: "Changes to This License",
        body: [
          {
            p: "We may update this License from time to time. Updates will be posted on this page with the revised effective date.",
          },
        ],
      },
    ],
    updated: "May 15, 2025",
  },
};
