import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import "./FlashTestimonials.css";

// Flash's testimonials, under the logo band on the product page's second page: a
// label, the heading and a line of copy, then a ruled box — the companies down the
// left as tabs, the chosen one's quote, its author and one figure on the right.
// The quote changes on a click, and on its own every few seconds until the reader
// takes over (or while they point at it).
//
// PLACEHOLDER CONTENT: the companies, people, quotes and figures below are
// stand-ins from the design reference. Replace them with real, approved
// testimonials before launch.

type Testimonial = {
  company: string;
  mark: ReactNode;
  quote: string;
  name: string;
  role: string;
  figure: string;
  figureLabel: string;
};

// Simple stand-in marks for the stand-in companies.
const MARK = {
  converra: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3a9 9 0 1 0 9 9h-4.5A4.5 4.5 0 1 1 12 7.5Z" />
    </svg>
  ),
  nexora: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7Z M12 7.5 8 9.75v4.5L12 16.5l4-2.25v-4.5Z" fillRule="evenodd" />
    </svg>
  ),
  lumen: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2 14.6 9.4 22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z" />
    </svg>
  ),
  arbor: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M3 21 12 3l9 18h-4.2L12 11.4 7.2 21Z" />
    </svg>
  ),
  syncell: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 7h11l-3-3h3l4.5 4.5L15 13h-3l3-3H4Z M20 17H9l3 3H9l-4.5-4.5L9 11h3l-3 3h11Z" />
    </svg>
  ),
};

const TESTIMONIALS: Testimonial[] = [
  {
    company: "Lumenta",
    mark: MARK.lumen,
    quote:
      "Earnings season used to bury us. Now Flash drafts the read-through for every call within minutes, and our analysts start from the questions that matter.",
    name: "Aisha Verma",
    role: "Director of Equity Research, Lumenta",
    figure: "10X",
    figureLabel: "More calls covered each quarter",
  },
  {
    company: "Arborly",
    mark: MARK.arbor,
    quote:
      "We tested Flash against our own models for a month. It caught the same signals, faster, and explained them in a way the whole desk could follow.",
    name: "Marcus Lee",
    role: "Quant Strategist, Arborly",
    figure: "92%",
    figureLabel: "Of answers used without edits",
  },
  {
    company: "Converra",
    mark: MARK.converra,
    quote:
      "Flash transformed how our analysts work through filings and calls. Research that took a morning is done before the market opens, and every number comes with its source.",
    name: "John Carter",
    role: "Co-Founder & CEO, Converra",
    figure: "7X",
    figureLabel: "Faster than traditional research",
  },
  {
    company: "Nexora",
    mark: MARK.nexora,
    quote:
      "We monitor hundreds of companies with a small team. Flash flags what changed and why it matters, so we spend our time on decisions instead of reading.",
    name: "Priya Raman",
    role: "Head of Research, Nexora",
    figure: "40%",
    figureLabel: "More coverage per analyst",
  },
  {
    company: "Syncell",
    mark: MARK.syncell,
    quote:
      "The cited answers won our compliance team over. Every claim links back to the filing or transcript it came from, which makes the work easy to check.",
    name: "Daniel Osei",
    role: "Portfolio Manager, Syncell",
    figure: "3h",
    figureLabel: "Saved per analyst, every day",
  },
];

const ROTATE_MS = 7000;

/** A run of the title in one of the frame's faces. */
function F({ f, children }: { f: "pp" | "bg" | "pg" | "sg"; children: string }) {
  return <span className={`testimonials__face--${f}`}>{children}</span>;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function FlashTestimonials() {
  const [active, setActive] = useState(0);
  // Rotation stops for good once the reader picks a company, and holds while the
  // pointer or focus is inside the box.
  const [chosen, setChosen] = useState(false);
  const [held, setHeld] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chosen || held) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % TESTIMONIALS.length), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [active, chosen, held]);

  // On phones the tabs scroll sideways: keep the current one in view (without
  // moving the page, which scrollIntoView would).
  useEffect(() => {
    const tabs = boxRef.current?.querySelector<HTMLElement>(".testimonials__tabs");
    const tab = tabs?.children[active] as HTMLElement | undefined;
    if (!tabs || !tab || tabs.scrollWidth <= tabs.clientWidth) return;
    const left = tab.offsetLeft - tabs.offsetLeft;
    if (left < tabs.scrollLeft || left + tab.offsetWidth > tabs.scrollLeft + tabs.clientWidth) {
      tabs.scrollTo({ left: left - (tabs.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [active]);

  const choose = (index: number) => {
    setActive(index);
    setChosen(true);
  };

  // Arrow keys move between the tabs, as a tab list should.
  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + TESTIMONIALS.length) % TESTIMONIALS.length;
    choose(next);
    boxRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  const t = TESTIMONIALS[active]!;

  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      {/* Frame 11:3765's title, letter for letter: the first line sets single
          letters in other faces, as the hero's headline does; the second is Nata
          Sans throughout. (The frame spells "Rsearch".) */}
      <h2 id="testimonials-title" className="testimonials__title">
        <span className="testimonials__title-line">
          <F f="pp">T</F>
          <F f="bg">ru</F>
          <F f="pp">s</F>
          <F f="pg">t</F>
          <F f="pp">ed B</F>
          <F f="sg">y</F>
          <F f="pp"> O</F>
          <F f="bg">ur</F>
          <F f="pp"> Pilo</F>
          <F f="pg">t </F>
          <F f="pp">Pa</F>
          <F f="bg">r</F>
          <F f="pg">t</F>
          <F f="bg">n</F>
          <F f="pp">e</F>
          <F f="bg">r</F>
          <F f="pp">s</F>
        </span>
        <span className="testimonials__title-line testimonials__title-line--sub">
          Rsearch Teams Use Flash To Read The Market Faster
        </span>
      </h2>

      <div
        className="testimonials__box"
        ref={boxRef}
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      >
        <div className="testimonials__tabs" role="tablist" aria-label="Customers" aria-orientation="vertical" onKeyDown={onKeyDown}>
          {TESTIMONIALS.map((item, index) => (
            <button
              key={item.company}
              type="button"
              role="tab"
              id={`testimonial-tab-${index}`}
              aria-selected={index === active}
              aria-controls="testimonial-panel"
              tabIndex={index === active ? 0 : -1}
              className="testimonials__tab"
              onClick={() => choose(index)}
            >
              <span className="testimonials__mark">{item.mark}</span>
              {item.company}
            </button>
          ))}
        </div>

        <div className="testimonials__panel" id="testimonial-panel" role="tabpanel" aria-labelledby={`testimonial-tab-${active}`}>
          {/* Keyed, so each new quote plays its entrance. */}
          <figure className="testimonials__figure" key={active}>
            <svg className="testimonials__quote-mark" viewBox="0 0 32 24" aria-hidden>
              <path d="M0 24V14.4C0 6.4 4.4 1.6 12.4 0l1.4 3.2C9.4 4.6 7.2 7.4 7 11h6v13Zm18 0V14.4C18 6.4 22.4 1.6 30.4 0l1.4 3.2C27.4 4.6 25.2 7.4 25 11h6v13Z" />
            </svg>
            <blockquote className="testimonials__quote">{t.quote}</blockquote>
            <figcaption className="testimonials__foot">
              <span className="testimonials__person">
                <span className="testimonials__avatar" aria-hidden>
                  {initials(t.name)}
                </span>
                <span>
                  <span className="testimonials__name">{t.name}</span>
                  <span className="testimonials__role">{t.role}</span>
                </span>
              </span>
              <span className="testimonials__stat">
                <span className="testimonials__figure-value">{t.figure}</span>
                <span className="testimonials__figure-label">{t.figureLabel}</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
