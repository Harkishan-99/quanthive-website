import type { ReactNode } from "react";
import { navigate } from "../lib/router";
import "./AboutPage.css";

// The About page (frames 17:3946 and 18:4116, stacked, the frames' empty space
// taken out): a single 812px column — a back arrow out in the margin, "About" set
// a few letters to a face like the hero's headline, a small black motif at the
// column's right; two paragraphs; a rule; a paragraph over three square tiles; a
// rule — and then the Partners row: its heading and two cells divided by tall
// hairlines. The copy and tiles are the frames' placeholders.
export const LOREM_LONG =
  "Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices.";
const LOREM_SHORT = "Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna.";

/** Back to the page the reader was on before this one (App.tsx notes it as it
 *  changes page); opened directly, with nothing before it, to the landing page. */
function goBack() {
  if (document.documentElement.dataset.prevPage) window.history.back();
  else navigate("/");
}

/** The head these pages share (About, Team, Contact): the back arrow out in the
 *  margin, the title, and the small black motif at the column's right. */
export function PageHead({ id, children }: { id: string; children: ReactNode }) {
  return (
    <header className="about-page__head">
      <button type="button" className="about-page__back" onClick={goBack} aria-label="Back">
        <svg viewBox="0 0 35 35" aria-hidden>
          <path d="M29.1667 17.5H5.83333M16.0417 27.7083L5.83333 17.5L16.0417 7.29167" />
        </svg>
      </button>
      <h1 id={id} className="about-page__title">
        {children}
      </h1>
      <span className="about-page__motif" aria-hidden />
    </header>
  );
}

export default function AboutPage() {
  return (
    <main className="about-page" aria-labelledby="about-page-title">
      <article className="about-page__column">
        <PageHead id="about-page-title">
          <span className="about-page__pg">Ab</span>
          <span className="about-page__pp">o</span>
          <span className="about-page__bg">u</span>
          <span className="about-page__pg">t</span>
        </PageHead>

        <div className="about-page__copy">
          <p>{LOREM_LONG}</p>
          <p>{LOREM_LONG}</p>
        </div>

        <hr className="about-page__rule" />

        <div className="about-page__copy">
          <p>{LOREM_SHORT}</p>
        </div>
        <div className="about-page__tiles" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        <hr className="about-page__rule" />

        <section className="about-page__partners" aria-labelledby="about-partners-title">
          <h2 id="about-partners-title" className="about-page__partners-title">
            <span className="about-page__pp">Pa</span>
            <span className="about-page__bg">r</span>
            <span className="about-page__pg">t</span>
            <span className="about-page__bg">n</span>
            <span className="about-page__pp">e</span>
            <span className="about-page__bg">r</span>
            <span className="about-page__pp">s</span>
          </h2>
          <div className="about-page__partner" />
          <div className="about-page__partner" />
        </section>
      </article>
    </main>
  );
}
