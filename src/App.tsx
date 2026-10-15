import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import AbstractLines from "./components/AbstractLines";
import AnnouncementBar from "./components/AnnouncementBar";
import Capabilities from "./components/Capabilities";
import EdgeMotifs from "./components/EdgeMotifs";
import FlashProductPage from "./components/FlashProductPage";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import About from "./components/About";
import AboutPage from "./components/AboutPage";
import Showcase from "./components/Showcase";
import { jumpPageTo } from "./lib/smoothScroll";
import "./styles/page-transition.css";

type Page = "landing" | "product" | "about";
// Pages by hash: #product is Flash's page, #about-us the About page (#about is
// the landing page's own About section, so it stays on the landing page).
const pageFromHash = (): Page =>
  window.location.hash === "#product" ? "product" : window.location.hash === "#about-us" ? "about" : "landing";

// The old app shell (sidebar, chat, watchlist, clock, palette, both glass themes)
// is still on disk and untouched — only this entry point changed, so
// `git checkout src/App.tsx` brings the whole thing back.
//
// The menu's open state lives here rather than inside Nav because both pages react
// to it: the lockup, caption, the edge motifs and the clock all recess while the
// dropdown is down. Explicit props keep that relationship visible.
//
// Nav renders last so its panel and scrim paint over the page without depending on
// z-index alone.
// /showcase: the About panel's demo alone, full screen, for a display.
const SHOWCASE_ONLY = typeof window !== "undefined" && window.location.pathname === "/showcase";

export default function App() {
  if (SHOWCASE_ONLY) return <Showcase />;
  return <Site />;
}

function Site() {
  const [menuOpen, setMenuOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("menu") === "open";
    }
    return false;
  });
  // Scroll-driven material blend for the edge motifs: Problem writes it every
  // frame, EdgeMotifs reads it every frame. Problem (the clock section) is no
  // longer mounted — the card carousel replaced it — so both refs rest at 0 and
  // the motifs hold their opening material. A ref rather than state because it
  // changes continuously — as state it would re-render the whole tree per frame.
  const toneRef = useRef(0);
  // Same shape, same reason: the ornaments change metal with the second clock, and
  // that is written by Problem every frame too.
  const alloyRef = useRef(0);
  // Only a visit that starts on the landing page plays the hero hand-over, so only
  // then does the nav's wordmark wait for it.
  const [introOnLanding] = useState(
    () => typeof window !== "undefined" && window.location.hash !== "#product",
  );
  const [page, setPage] = useState<Page>(() => (typeof window !== "undefined" ? pageFromHash() : "landing"));
  // Arrived from the other hero by the page change below: the arriving hero waits
  // for the change (--page-t0) and its edge marks morph across rather than enter.
  const [handoff, setHandoff] = useState(false);

  // The page's colours follow it: the nav and announcement bar invert on Flash's
  // dark hero (Nav.css, AnnouncementBar.css), and so does the page ground.
  useEffect(() => {
    document.documentElement.dataset.page = page;
  }, [page]);

  // Changing page is one view transition, not a reload (page-transition.css): the
  // new page rises over the old in a wave from the bottom, turning the ground and
  // its lattice; the old hero's centre then lifts away, and the new one's logo
  // rises into its place. Browsers without view transitions (or with reduced
  // motion) just swap.
  useEffect(() => {
    const go = () => {
      const next = pageFromHash();
      // Moving within the landing page (its #about section, say) isn't a page change.
      if (next === document.documentElement.dataset.page) return;
      // Remember where the reader came from (the About page's back arrow).
      document.documentElement.dataset.prevPage = document.documentElement.dataset.page ?? "";
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const animated = !!document.startViewTransition && !reduce;
      // Hero to hero: the arriving hero's timeline waits for the change.
      const heroToHero = animated && next !== "about" && document.documentElement.dataset.page !== "about";
      const apply = () => {
        if (heroToHero) document.documentElement.dataset.handoff = "";
        else delete document.documentElement.dataset.handoff;
        flushSync(() => {
          setHandoff(heroToHero);
          setPage(next);
        });
        document.documentElement.dataset.page = next;
        jumpPageTo(0);
      };
      if (!animated) apply();
      else document.startViewTransition(apply);
    };
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);

  // Going to another page from the menu: the menu folds away first, then the
  // page changes (the drawer's fold is ~0.4s, Nav.css).
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;
  const goTo = (hash: string) => {
    if (window.location.hash === `#${hash}`) return setMenuOpen(false);
    const wasOpen = menuOpenRef.current;
    setMenuOpen(false);
    if (wasOpen) window.setTimeout(() => (window.location.hash = hash), 420);
    else window.location.hash = hash;
  };
  const openProduct = () => goTo("product");
  const openAbout = () => goTo("about-us");

  return (
    <>
      {/* "Explore now" opens Flash's page. */}
      <AnnouncementBar ctaHref="#product" onCtaClick={openProduct} />
      {page === "product" ? (
        <FlashProductPage recessed={menuOpen} handoff={handoff} />
      ) : page === "about" ? (
        <AboutPage />
      ) : (
        <>
          {/* Fixed to the viewport, so the pages scroll past a single pair rather than
              each carrying its own copy. */}
          <EdgeMotifs recessed={menuOpen} toneRef={toneRef} alloyRef={alloyRef} />
          {/* Also fixed, and painted after the ornaments so it sits over them where the
              two overlap — the order frame 1722:3 puts them in. */}
          <AbstractLines />
          <Hero recessed={menuOpen} handoff={handoff} />
          <Capabilities />
          <About />
        </>
      )}
      <Footer />
      <Nav open={menuOpen} onOpenChange={setMenuOpen} onProductSelect={openProduct} onAboutSelect={openAbout} page={page} intro={introOnLanding && page === "landing"} />
    </>
  );
}
