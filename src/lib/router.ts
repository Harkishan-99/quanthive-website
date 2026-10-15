// The site's pages and their addresses:
//
//   /             the QuantHive landing page
//   /flash        Flash's page (old /#flash and /#product links still open it)
//   /#about-us    the About page
//
// Moving between them never reloads: navigate() pushes the address and App.tsx
// changes page (with its transition) on that, on back/forward, and on a change of
// hash.

export type Page = "landing" | "product" | "about";

export const PAGE_URL: Record<Page, string> = {
  landing: "/",
  product: "/flash",
  about: "/#about-us",
};

const NAVIGATE_EVENT = "quanthive:navigate";

/** The page a location (or URL) shows. */
export function pageFrom(location: { pathname: string; hash: string } = window.location): Page {
  if (location.hash === "#about-us") return "about";
  const path = location.pathname.replace(/\/+$/, "");
  if (path === "/flash" || location.hash === "#flash" || location.hash === "#product") return "product";
  return "landing";
}

/** Old hash addresses for Flash's page are shown as /flash (no new history entry). */
export function canonicaliseAddress() {
  const { hash } = window.location;
  if (hash === "#flash" || hash === "#product") window.history.replaceState(null, "", "/flash");
}

/** Goes to a page of the site without reloading. */
export function navigate(url: string) {
  window.history.pushState(null, "", url);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** Calls `onChange` whenever the address changes (navigate, back/forward, hash). */
export function onAddressChange(onChange: () => void) {
  window.addEventListener(NAVIGATE_EVENT, onChange);
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener(NAVIGATE_EVENT, onChange);
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
}
