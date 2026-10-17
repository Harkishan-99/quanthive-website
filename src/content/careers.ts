// The Careers page's open roles (CareersPage.tsx). The build also lists them as
// job postings for search engines (scripts/seo.ts), so a role added here shows
// up in both.

export type Position = {
  role: string;
  requirement: string;
  mode: string;
  term: string;
  location: string;
  art: string;
  /** For search engines' job listings: the kind of role and a line on the work. */
  employment: "INTERN" | "CONTRACTOR" | "FULL_TIME";
  summary: string;
};

// Each role's tile: an abstract motion blur (288 × 167 WebP, a few KB each).
const ART = "/images/careers-";

export const POSITIONS: Position[] = [
  {
    role: "Software Developer Intern",
    employment: "INTERN",
    summary: "Build features across QuantHive's financial analytics platform and Flash, its AI research analyst, working with the engineering team on production code.",
    art: `${ART}tide.webp`,
    requirement: "Prior Internship Experience Required",
    mode: "Remote / On Site",
    term: "2 Months ( extendable )",
    location: "IITM Research Park, Chennai",
  },
  {
    role: "Research Software Engineer",
    employment: "CONTRACTOR",
    summary: "Turn quantitative finance research into reliable software: market data pipelines, models and backtesting tools for investment research.",
    art: `${ART}slate.webp`,
    requirement: "Prior Work Experience Required",
    mode: "Remote / On Site",
    term: "Contract Based ( Post Interview )",
    location: "IITM Research Park, Chennai",
  },
  {
    role: "Backend Developer Intern",
    employment: "INTERN",
    summary: "Work on the APIs, data pipelines and services behind QuantHive's stock market and financial data products.",
    art: `${ART}ember.webp`,
    requirement: "Prior Internship Experience Required",
    mode: "Remote / On Site",
    term: "2 Months ( extendable )",
    location: "IITM Research Park, Chennai",
  },
  {
    role: "UI/UX Designer Intern",
    employment: "INTERN",
    summary: "Design clear, usable interfaces for financial research and analytics tools used by investors and analysts.",
    art: `${ART}dusk.webp`,
    requirement: "Prior Internship Experience Required",
    mode: "Remote / On Site",
    term: "2 Months ( extendable )",
    location: "IITM Research Park, Chennai",
  },
];
