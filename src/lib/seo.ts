import { OG_IMAGE, SITE, SITE_NAME, type PageSeo } from "../content/seo";

// Keeps the document's head in step with the page shown (App.tsx, ArticlePage):
// the title, the description, the canonical address, the link-preview tags and
// the page's own structured data. The build writes the same head into each
// page's HTML file (scripts/seo.ts); this keeps it right as the app moves
// between pages without a reload.

function meta(attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.append(tag);
  }
  tag.content = content;
}

export function applySeo(seo: PageSeo) {
  // A page not for listing (under maintenance) stands for whatever address it's at.
  const url = `${SITE}${seo.noindex ? window.location.pathname : seo.path}`;
  document.title = seo.title;
  meta("name", "description", seo.description);
  meta("name", "robots", seo.noindex ? "noindex, follow" : "index, follow");
  meta("property", "og:title", seo.title);
  meta("property", "og:description", seo.description);
  meta("property", "og:url", url);
  meta("property", "og:type", seo.type ?? "website");
  meta("property", "og:site_name", SITE_NAME);
  meta("property", "og:image", seo.image ?? OG_IMAGE);
  meta("name", "twitter:card", "summary_large_image");
  meta("name", "twitter:title", seo.title);
  meta("name", "twitter:description", seo.description);
  meta("name", "twitter:image", seo.image ?? OG_IMAGE);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = url;

  let data = document.getElementById("page-jsonld");
  if (!seo.jsonLd?.length) data?.remove();
  else {
    if (!data) {
      data = document.createElement("script");
      data.id = "page-jsonld";
      data.setAttribute("type", "application/ld+json");
      document.head.append(data);
    }
    data.textContent = JSON.stringify(seo.jsonLd);
  }
}
