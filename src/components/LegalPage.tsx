import type { MouseEvent, ReactNode } from "react";
import { CONTACT_EMAIL, CONTACT_LINES, LEGAL, type LegalDoc } from "../content/legal";
import { navigate } from "../lib/router";
import { PageHead } from "./AboutPage";
import "./AboutPage.css";
import "./LegalPage.css";

// The legal pages — Terms & Conditions, Privacy Policy, License (frames 54:815,
// 54:744, 54:673) — on the About page's column: the head, the opening paragraph
// at the lead's size, the document's details as small labelled lines, a rule,
// then its numbered sections, the contact, the date it was last updated, and
// the closing rules with the motif. The text lives in src/content/legal.ts.

/** Each title, a few letters set in other faces, as the frames have it. */
const TITLE: Record<LegalDoc, ReactNode> = {
  terms: (
    <>
      <span className="about-page__pp">Te</span>
      <span className="about-page__bg">rm</span>
      <span className="about-page__pp">s &amp; Co</span>
      <span className="about-page__bg">n</span>
      <span className="about-page__pp">d</span>
      <span className="legal-page__sg">i</span>
      <span className="about-page__pg">t</span>
      <span className="legal-page__sg">i</span>
      <span className="about-page__pp">o</span>
      <span className="about-page__bg">n</span>
      <span className="about-page__pp">s</span>
    </>
  ),
  privacy: (
    <>
      <span className="about-page__pp">P</span>
      <span className="about-page__bg">r</span>
      <span className="legal-page__fg">iv</span>
      <span className="about-page__pp">ac</span>
      <span className="about-page__pg">y</span>
    </>
  ),
  license: (
    <>
      <span className="about-page__pp">L</span>
      <span className="legal-page__fg">i</span>
      <span className="about-page__pp">ce</span>
      <span className="about-page__bg">n</span>
      <span className="about-page__pp">se</span>
    </>
  ),
};

const CONTACT_TITLE: Record<LegalDoc, string> = { terms: "Contact Us", privacy: "Contact Us", license: "Contact" };

/** A run of text with [label](/path) links; links on this site open in place. */
function Text({ children }: { children: string }) {
  const parts = children.split(/\[([^\]]+)\]\(([^)]+)\)/);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 3 === 0) return part;
        if (i % 3 === 2) return null;
        const href = parts[i + 1]!;
        const local = href.startsWith("/");
        const open = (event: MouseEvent<HTMLAnchorElement>) => {
          if (!local || event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          navigate(href);
        };
        return (
          <a key={i} href={href} onClick={open} {...(local ? {} : { target: "_blank", rel: "noreferrer" })}>
            {part}
          </a>
        );
      })}
    </>
  );
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const text = LEGAL[doc];
  const titleId = `legal-${doc}-title`;
  return (
    <main className="about-page legal-page" aria-labelledby={titleId}>
      <article className="about-page__column">
        <PageHead id={titleId}>{TITLE[doc]}</PageHead>

        <div className="about-page__copy">
          <p>
            <Text>{text.intro}</Text>
          </p>
        </div>

        <dl className="legal-page__details">
          {text.details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <hr className="about-page__rule" />

        <div className="legal-page__body">
          {text.sections.map((section, n) => (
            <section key={section.title} className="legal-page__section">
              <h2>
                <span className="legal-page__num">{n + 1}.</span> {section.title}
              </h2>
              {section.body.map((block, i) =>
                "p" in block ? (
                  <p key={i}>
                    <Text>{block.p}</Text>
                  </p>
                ) : (
                  <ul key={i}>
                    {block.list.map((item) => (
                      <li key={item}>
                        <Text>{item}</Text>
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}

          <section className="legal-page__section">
            <h2>
              <span className="legal-page__num">{text.sections.length + 1}.</span> {CONTACT_TITLE[doc]}
            </h2>
            <address className="legal-page__contact">
              {CONTACT_LINES.map((line) => (
                <span key={line}>{line}</span>
              ))}
              <span>
                Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </span>
            </address>
          </section>

          <p className="legal-page__updated">Last updated: {text.updated}</p>
        </div>

        <div className="legal-page__end" aria-hidden>
          <span />
          <span className="legal-page__end-motif" />
          <span />
        </div>
      </article>
    </main>
  );
}
