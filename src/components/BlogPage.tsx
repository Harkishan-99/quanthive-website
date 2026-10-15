import { useState, type FormEvent } from "react";
import { ARTICLES, type Article } from "../content/articles";
import { PageHead } from "./AboutPage";
import { articleHref } from "./ArticlePage";
import "./AboutPage.css";
import "./BlogPage.css";

// The Blog page (frame 36:4358), on the About page's column: its head, then the
// featured post — a dark panel, its tag, title, excerpt, author and date on the
// left and its image on the right — a newsletter line with an email field, a
// rule, the latest posts three across, and the small grey motif to close.
//
// The posts come from src/content/articles.ts (newest first): the newest is the
// featured post, and every article also appears in the grid. Until there are
// three, the grid's remaining places show quiet "coming soon" tiles.

type Post = { tag?: string; title: string; excerpt?: string; author?: string; date?: string; image?: string; href?: string };

const toPost = (article: Article): Post => ({
  tag: article.category,
  title: article.title,
  excerpt: article.subtitle,
  author: article.author,
  date: article.date,
  image: article.image,
  href: articleHref(article),
});

const FEATURED: Post = ARTICLES[0] ? toPost(ARTICLES[0]) : { title: "Coming soon" };

const POSTS: (Post | null)[] = [
  ...ARTICLES.map(toPost),
  ...Array.from({ length: Math.max(0, 3 - ARTICLES.length) }, () => null),
];

/** A post's picture until it has one: the lattice, faintly, round the motif. */
function PostArt({ dark = false }: { dark?: boolean }) {
  return <span className={`blog-page__post-art${dark ? " blog-page__post-art--dark" : ""}`} aria-hidden />;
}

/** A post's title, as a link once the post has a page. */
function Title({ post, className }: { post: Post; className: string }) {
  return post.href ? (
    <a className={className} href={post.href}>
      {post.title}
    </a>
  ) : (
    <span className={className}>{post.title}</span>
  );
}

function Newsletter() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setState("sending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Something went wrong — please try again.");
      form.reset();
      setState("done");
      setMessage("You're subscribed. See you next week.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <section className="blog-page__newsletter" aria-labelledby="newsletter-title">
      <p id="newsletter-title" className="blog-page__newsletter-title">
        Subscribe to our newsletter for weekly insights
      </p>
      <form className="blog-page__subscribe" onSubmit={subscribe}>
        <div className="blog-page__field">
          <input type="email" name="email" placeholder="Your email" aria-label="Your email" autoComplete="email" maxLength={200} required />
          {/* Hidden from people; bots fill it in (api/newsletter.ts drops those). */}
          <input className="blog-page__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
          <button type="submit" aria-label="Subscribe" disabled={state === "sending"}>
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
        <p className="blog-page__subscribe-status" role="status" data-state={state}>
          {state === "done" || state === "error" ? message : ""}
        </p>
      </form>
    </section>
  );
}

export default function BlogPage() {
  return (
    <main className="about-page blog-page" aria-labelledby="blog-page-title">
      <article className="about-page__column">
        <PageHead id="blog-page-title">
          <span className="about-page__pp">Blo</span>
          <span className="blog-page__hg">g</span>
        </PageHead>

        <article className="blog-page__featured">
          <div className="blog-page__featured-text">
            {FEATURED.tag && <p className="blog-page__tag">{FEATURED.tag}</p>}
            <h2 className="blog-page__featured-title">
              <Title post={FEATURED} className="blog-page__featured-link" />
            </h2>
            {FEATURED.excerpt && <p className="blog-page__excerpt">{FEATURED.excerpt}</p>}
            <p className="blog-page__byline">
              <span>{FEATURED.author}</span>
              <time>{FEATURED.date}</time>
            </p>
          </div>
          <div className="blog-page__featured-image">
            {FEATURED.image ? <img src={FEATURED.image} alt="" /> : FEATURED.href && <PostArt dark />}
          </div>
        </article>

        <Newsletter />

        <hr className="about-page__rule blog-page__rule" />

        <ul className="blog-page__posts">
          {POSTS.map((post, index) =>
            post ? (
              <li key={index} className="blog-page__post">
                {post.href ? (
                  <a className="blog-page__post-image" href={post.href} tabIndex={-1} aria-hidden>
                    {post.image ? <img src={post.image} alt="" /> : <PostArt />}
                  </a>
                ) : (
                  <div className="blog-page__post-image">{post.image && <img src={post.image} alt="" />}</div>
                )}
                {post.tag && <p className="blog-page__post-tag">{post.tag}</p>}
                <h3 className="blog-page__post-title">
                  <Title post={post} className="blog-page__post-link" />
                </h3>
                {post.date && <p className="blog-page__post-date">{post.date}</p>}
              </li>
            ) : (
              <li key={index} className="blog-page__post blog-page__post--soon" aria-hidden>
                <div className="blog-page__post-image" />
                <p className="blog-page__post-title">Coming soon</p>
              </li>
            ),
          )}
        </ul>

        <span className="blog-page__end" aria-hidden />
      </article>
    </main>
  );
}
