import { useEffect, useRef, useState } from "react";
import "./FlashProcess.css";

// Bar heights for the "Decide" card, in % of the chart's height. The fourth bar is
// the one the reader's eye should land on, so it alone is lit and carries the dot.
const BARS = [52, 38, 46, 88, 30, 64] as const;
const ACTIVE_BAR = 3;

function AskVisual() {
  return (
    <div className="flash-process__visual flash-process__visual--ask" aria-hidden>
      <span className="flash-process__badge flash-process__badge--source">
        <img src="/icons/flash-logo.svg" alt="" />
      </span>
      <span className="flash-process__badge flash-process__badge--chip">Q2 FY26</span>

      <div className="flash-process__chips">
        <span>Annual report</span>
        <span>Earnings call</span>
        <span>Peers</span>
      </div>

      <div className="flash-process__prompt">
        <p>Compare HDFC and ICICI margins</p>
        <span className="flash-process__send">
          <img src="/images/figma-product/send-arrow.svg" alt="" />
        </span>
      </div>
    </div>
  );
}

function ResearchVisual() {
  return (
    <div className="flash-process__visual flash-process__visual--research" aria-hidden>
      <div className="flash-process__panel flash-process__panel--metric">
        <header>
          <span>Net Interest Margin</span>
          <small>HDFCBANK</small>
        </header>
        <div className="flash-process__figures">
          <span>3.4%</span>
          <span>3.6%</span>
        </div>
        <footer>Investor Presentation · p.14</footer>
      </div>
    </div>
  );
}

function DecideVisual() {
  return (
    <div className="flash-process__visual flash-process__visual--decide" aria-hidden>
      <div className="flash-process__panel flash-process__panel--chart">
        <header>
          <strong>₹48.2K Cr</strong>
          <span>
            <em>▲ 9.02%</em>
            Net Interest Income
          </span>
        </header>
        <div className="flash-process__bars">
          <i className="flash-process__guide" />
          {BARS.map((height, index) => (
            <b
              key={index}
              data-active={index === ACTIVE_BAR || undefined}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const ALERTS = [
  { title: "HDFCBANK · Q2 results filed", meta: "Just now", move: "▲ 2.1%" },
  { title: "ICICIBANK · NIM beats estimates", meta: "12 min ago", move: "▲ 1.4%" },
  { title: "AXISBANK · Board meeting notice", meta: "1 hr ago", move: "" },
] as const;

function MonitorVisual() {
  return (
    <div className="flash-process__visual flash-process__visual--monitor" aria-hidden>
      <div className="flash-process__alerts">
        {ALERTS.map(({ title, meta, move }) => (
          <div className="flash-process__panel" key={title}>
            <img src="/icons/flash-logo.svg" alt="" />
            <span>
              <strong>{title}</strong>
              <small>{meta}</small>
            </span>
            {move && <em>{move}</em>}
          </div>
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Ask",
    body: "Every answer starts with a question. Ask Flash in plain language — no tickers, filters or formulas required.",
    Visual: AskVisual,
  },
  {
    title: "Research",
    body: "Flash reads the filings, calls and data for you, and cites every number back to the page it came from.",
    Visual: ResearchVisual,
  },
  {
    title: "Decide",
    body: "Get a clear, sourced view in minutes. Charts, comparisons and conclusions you can act on.",
    Visual: DecideVisual,
  },
  {
    title: "Monitor",
    body: "Flash keeps watch after you decide, flagging filings, results and moves on the companies you follow.",
    Visual: MonitorVisual,
  },
] as const;

/** Four-step "how Flash works" section beneath the product hero. */
export default function FlashProcess() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="flash-process"
      data-visible={visible || undefined}
      aria-labelledby="flash-process-title"
    >
      <h2 id="flash-process-title" className="flash-process__title">
        <span>Fast Answers. Sourced Outcomes.</span>
        <span>Designed for Investors</span>
      </h2>

      <ol className="flash-process__cards">
        {STEPS.map(({ title, body, Visual }, index) => (
          <li className="flash-process__card" key={title}>
            <Visual />
            <div className="flash-process__copy">
              <h3>
                {String(index + 1).padStart(2, "0")} — {title}
              </h3>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
