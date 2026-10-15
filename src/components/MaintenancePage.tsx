import { PageHead } from "./AboutPage";
import "./AboutPage.css";
import "./MaintenancePage.css";

// Any address of the site with no page yet (the footer's Careers, Privacy
// Policy, …, or a mistyped link): a short "under maintenance" note on the About
// page's column, with the way home and to the team. Temporary — each page
// replaces it as it's built (add it to src/lib/router.ts).

export default function MaintenancePage() {
  return (
    <main className="about-page maintenance-page" aria-labelledby="maintenance-title">
      <article className="about-page__column">
        <PageHead id="maintenance-title">
          <span className="about-page__pp">Under </span>
          <span className="about-page__bg">m</span>
          <span className="about-page__pp">aintenance</span>
        </PageHead>

        <p className="maintenance-page__note">
          This page is being built and will be up soon. In the meantime, you can head back home or get in touch with
          us.
        </p>

        <p className="maintenance-page__actions">
          <a className="maintenance-page__key maintenance-page__key--solid" href="/">
            Back to home
          </a>
          <a className="maintenance-page__key" href="/contact">
            Contact us
          </a>
        </p>

        <span className="maintenance-page__end" aria-hidden />
      </article>
    </main>
  );
}
