import { useEffect, useRef } from "react";
import "./SolutionOverview.css";

const ASSET = {
  titleStrike: "/images/figma-solution/title-strike.svg",
  titleRule: "/images/figma-solution/title-rule.svg",
  titleFrame: "/images/figma-solution/title-frame.svg",
  arrow: "/images/figma-solution/arrow-down-right.svg",
} as const;

function ProductCard() {
  return (
    <article className="solution-overview__product-card">
      <div className="solution-overview__product-preview" aria-hidden />
      <div className="solution-overview__product-copy">
        <h3>Institutional Intelligence</h3>
        <p>Institutional Intelligence</p>
      </div>
      <button className="solution-overview__product-cta" type="button" aria-label="View Institutional Intelligence">
        <span>View Product</span>
        <span className="solution-overview__product-arrow" aria-hidden>
          <img src={ASSET.arrow} alt="" />
        </span>
      </button>
    </article>
  );
}

/**
 * Figma frame 1920:4749 — the product overview placed immediately after the
 * problem sequence. The desktop board intentionally uses the frame's original
 * coordinates; the compact layout below 900px becomes a readable product grid.
 */
export default function SolutionOverview() {
  const sectionRef = useRef<HTMLElement>(null);

  // React mounts after the browser's initial fragment lookup. Re-run the lookup
  // once the section exists so a direct #solution-overview link lands correctly.
  useEffect(() => {
    if (window.location.hash === "#solution-overview") {
      window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView());
    }
  }, []);

  // The line reveal and the frame exit are separate phases. Lines draw as the title
  // enters, finishing when the incoming composition settles. The fixed frame stays
  // put while the canvas is pinned, then follows the canvas as it scrolls out.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const cardsProgress = Math.max(0, Math.min(1, -rect.top / viewportHeight));
      const heading = section.querySelector<HTMLElement>(".solution-overview__heading");
      const canvas = section.querySelector<HTMLElement>(".solution-overview__canvas");
      const headingTop = heading?.getBoundingClientRect().top ?? viewportHeight;
      const settledHeadingTop = headingTop - (1 - cardsProgress) * viewportHeight * 0.55;
      const lineProgress = Math.max(
        0,
        Math.min(1, (viewportHeight - headingTop) / Math.max(1, viewportHeight - settledHeadingTop)),
      );
      const canvasTop = canvas?.getBoundingClientRect().top ?? 0;

      section.style.setProperty("--cards-in", cardsProgress.toFixed(4));
      document.documentElement.style.setProperty("--feat-through", lineProgress.toFixed(4));
      document.documentElement.style.setProperty(
        "--solution-design-y",
        `${Math.min(0, canvasTop).toFixed(2)}px`,
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--feat-through");
      document.documentElement.style.removeProperty("--solution-design-y");
    };
  }, []);

  return (
    <section
      id="solution-overview"
      className="solution-overview"
      ref={sectionRef}
      aria-labelledby="solution-overview-title"
    >
      <div className="solution-overview__canvas">
        <div className="solution-overview__content">
          <div className="solution-overview__heading">
            <img className="solution-overview__title-frame" src={ASSET.titleFrame} alt="" aria-hidden />
            <img className="solution-overview__title-rule" src={ASSET.titleRule} alt="" aria-hidden />
            <h2 id="solution-overview-title">The Solution</h2>
            <img className="solution-overview__title-strike" src={ASSET.titleStrike} alt="" aria-hidden />
          </div>

          <div className="solution-overview__board">
            <ProductCard />
            <div className="solution-overview__card solution-overview__card--top-left">
              <p>Investment Research.<br />Under Minutes.</p>
            </div>
            <div className="solution-overview__card solution-overview__card--top-right" aria-hidden />
            <div className="solution-overview__card solution-overview__card--bottom-left">
              <p>Investment Research</p>
            </div>
            <div className="solution-overview__card solution-overview__card--bottom-right" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
