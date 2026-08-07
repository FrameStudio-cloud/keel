import { useState, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FiSearch, FiClock, FiArrowRight, FiExternalLink } from "react-icons/fi";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PostCover from "../components/blog/PostCover";
import { formatBlogDate, readingTime, kicker } from "../lib/blog";
import { useFramestudioBlogs } from "../lib/framestudioBlog";

gsap.registerPlugin(ScrollTrigger);

const SPAN_PATTERN = [7, 5, 4, 4, 4, 6, 6];

function spanFor(index) {
  return SPAN_PATTERN[index % SPAN_PATTERN.length];
}

function coverAspect(span) {
  if (span >= 6) return "aspect-[16/10]";
  if (span === 5) return "aspect-[4/3]";
  return "aspect-[16/11]";
}

export default function Blog() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const pageRef = useRef(null);
  const { posts, loading } = useFramestudioBlogs();

  const categories = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return ["all", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesTag = activeTag === "all" || (p.tags || []).includes(activeTag);
      if (!matchesTag) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, activeTag, posts]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const issueDate = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] dark:bg-[#0e1220] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-400">
            The Keel Journal
          </p>
          <h1 className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">Loading the journal…</h1>
        </div>
      </div>
    );
  }

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ".jl-featured",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: ".jl-featured", start: "top 90%" } }
      );
      gsap.utils.toArray(".jl-cell").forEach((cell, i) => {
        gsap.fromTo(
          cell,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: (i % 4) * 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: cell, start: "top 92%" },
          }
        );
      });
    });
    return () => mm.revert();
  }, { scope: pageRef });

  return (
    <>
      <Helmet>
        <title>Blog | Keel</title>
        <meta name="description" content="The Keel Journal — product updates, business tips, and guides for small business owners in Kenya." />
      </Helmet>
      <div className="min-h-screen bg-[#f7f6f2] text-[#1c1917] dark:bg-[#0e1220] dark:text-[#e7e5e4]">
        <div ref={pageRef} className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
            <Link to="/" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <FiExternalLink size={11} />
              Keel home
            </Link>
            <span className="hidden sm:block">Business · How-to · Product</span>
            <Link to="/integrations" className="hidden sm:inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Integrations
              <FiArrowRight size={11} />
            </Link>
          </div>

          <header className="mt-6 border-y-4 border-double border-stone-900 dark:border-white/20 py-5 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-blue-700 dark:text-blue-400 font-semibold">
              Keel · Nairobi, Kenya
            </p>
            <h1 className="mt-2 font-serif text-4xl sm:text-6xl font-semibold leading-none tracking-tight text-stone-900 dark:text-white">
              The Keel Journal
            </h1>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
              For the small businesses that run Kenya
            </p>
          </header>

          <div className="mt-4 flex flex-col gap-3 border-b border-stone-300 dark:border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-stone-500 dark:text-stone-400">
              {issueDate} — <span className="font-medium text-stone-700 dark:text-stone-200">Issue {String(posts.length).padStart(2, "0")}</span>
            </p>
            <div className="relative sm:w-56">
              <FiSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
              <input
                type="text"
                placeholder="Search the journal..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-b border-stone-300 dark:border-white/20 bg-transparent py-1 pl-6 pr-2 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Sections">
            {categories.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  activeTag === tag
                    ? "text-blue-700 dark:text-blue-400 font-semibold underline underline-offset-8"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                {tag === "all" ? "All stories" : kicker([tag])}
              </button>
            ))}
          </nav>

          {featured ? (
            <div className="mt-10">
              <div className="jl-featured grid gap-6 lg:grid-cols-12 lg:items-stretch">
                <Link
                  to={`/blog/${featured.slug}`}
                  className="group block lg:col-span-7"
                >
                  <PostCover
                    post={featured}
                    index={posts.findIndex((p) => p.slug === featured.slug)}
                    size="lg"
                    className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.015]"
                  />
                </Link>
                <div className="flex flex-col justify-center lg:col-span-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-400">
                    Cover story
                  </p>
                  <Link to={`/blog/${featured.slug}`} className="group mt-3 block">
                    <h2 className="font-serif text-3xl font-semibold leading-[1.08] text-stone-900 dark:text-white sm:text-4xl transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {featured.title}
                    </h2>
                  </Link>
                  <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {featured.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">{featured.author}</span>
                    <span>{formatBlogDate(featured.date)}</span>
                    <span className="flex items-center gap-1">
                      <FiClock size={11} />
                      {readingTime(featured)} min read
                    </span>
                  </div>
                  <Link
                    to={`/blog/${featured.slug}`}
                    className="mt-6 inline-flex w-fit items-center gap-2 border-b border-stone-900 dark:border-white pb-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-stone-900 dark:text-white transition-colors hover:border-blue-700 hover:text-blue-700 dark:hover:border-blue-400 dark:hover:text-blue-400"
                  >
                    Read the story
                    <FiArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-16 border-t border-stone-300 dark:border-white/10 py-16 text-center">
              <p className="text-[12px] uppercase tracking-[0.2em] text-stone-400">
                No stories found{query ? ` for “${query}”` : ""}
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveTag("all");
                }}
                className="mt-3 text-[12px] font-semibold text-blue-700 dark:text-blue-400 underline underline-offset-4"
              >
                Clear search & sections
              </button>
            </div>
          )}

          {rest.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center gap-3 border-t border-stone-300 dark:border-white/10 pt-4">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-900 dark:text-white">
                  This week in the journal
                </h2>
                <span className="h-px flex-1 bg-stone-300 dark:bg-white/10" />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-12">
                {rest.map((post, i) => {
                  const span = spanFor(i);
                  const col = span === 4 ? "lg:col-span-4" : span === 5 ? "lg:col-span-5" : span === 6 ? "lg:col-span-6" : "lg:col-span-7";
                  return (
                    <article key={post.slug} className={`jl-cell group ${i % 2 === 1 ? "sm:translate-y-6" : ""} ${col}`}>
                      <Link to={`/blog/${post.slug}`} className="block">
                        <PostCover
                          post={post}
                          index={posts.findIndex((p) => p.slug === post.slug)}
                          size={span >= 6 ? "md" : "sm"}
                          className={`${coverAspect(span)} transition-transform duration-500 group-hover:scale-[1.015]`}
                        />
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">
                          {kicker(post.tags)}
                        </p>
                        <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-stone-900 dark:text-white transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300 sm:text-2xl">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                          {post.excerpt}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                          <span>{formatBlogDate(post.date)}</span>
                          <span className="flex items-center gap-1">
                            <FiClock size={11} />
                            {readingTime(post)} min
                          </span>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <footer className="mt-16 border-t-4 border-double border-stone-900 dark:border-white/20 py-6 text-center">
            <p className="font-serif text-lg font-semibold text-stone-900 dark:text-white">
              The Keel Journal
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Written by the Keel Team · Published from Nairobi
            </p>
            <Link
              to="/"
              className="mt-3 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400 underline underline-offset-4 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Back to Keel home
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}
