import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiClock, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import posts from "../data/blog.json";
import PostCover from "../components/blog/PostCover";
import { formatBlogDate, readingTime, kicker } from "../lib/blog";

export default function BlogPost() {
  const { slug } = useParams();
  const [progress, setProgress] = useState(0);
  const articleRef = useRef(null);

  const post = posts.find((p) => p.slug === slug);
  const postIndex = posts.findIndex((p) => p.slug === slug);

  const related = useMemo(() => {
    if (!post) return [];
    const sameTag = posts.filter(
      (p) => p.slug !== post.slug && (p.tags || []).some((t) => (post.tags || []).includes(t))
    );
    const rest = posts.filter(
      (p) => p.slug !== post.slug && !sameTag.includes(p)
    );
    return [...sameTag, ...rest].slice(0, 3);
  }, [post]);

  useEffect(() => {
    if (!post) return;
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.min(100, Math.max(0, (-rect.top / total) * 100));
      setProgress(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] dark:bg-[#0e1220] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-400">
            The Keel Journal
          </p>
          <h1 className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">Story not found</h1>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-400 hover:underline"
          >
            <FiArrowLeft size={12} />
            Back to the journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | The Keel Journal</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={`${post.title} | The Keel Journal`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Helmet>
      <div className="min-h-screen bg-[#f7f6f2] text-[#1c1917] dark:bg-[#0e1220] dark:text-[#e7e5e4]">
        <div
          className="fixed left-0 top-0 z-50 h-0.5 bg-blue-700 dark:bg-blue-400 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FiArrowLeft size={11} />
              The journal
            </Link>
            <Link to="/" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Keel home
              <FiArrowRight size={11} />
            </Link>
          </div>

          <article ref={articleRef} className="mt-8">
            <header className="border-y border-stone-300 dark:border-white/15 py-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700 dark:text-blue-400">
                {kicker(post.tags)}
              </p>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.06] text-stone-900 dark:text-white sm:text-5xl">
                {post.title}
              </h1>
              <p className="mt-5 font-serif text-lg italic leading-relaxed text-stone-600 dark:text-stone-400 sm:text-xl">
                {post.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-stone-700 dark:text-stone-300">By {post.author}</span>
                <span>{formatBlogDate(post.date)}</span>
                <span className="flex items-center gap-1">
                  <FiClock size={11} />
                  {readingTime(post)} min read
                </span>
              </div>
            </header>

            <div className="mt-8 border-b border-stone-300 dark:border-white/15 pb-10">
              <PostCover post={post} index={postIndex} size="md" className="aspect-[16/9]" />
            </div>

            <div className="mt-10 max-w-2xl mx-auto">
              {post.content.map((block, i) => {
                if (block.type === "heading") {
                  return (
                    <h2
                      key={i}
                      className="mt-12 mb-4 flex items-start gap-3 font-serif text-2xl font-semibold leading-snug text-stone-900 dark:text-white sm:text-3xl"
                    >
                      <span className="mt-2 h-6 w-px shrink-0 bg-blue-700 dark:bg-blue-400" />
                      <span>{block.text}</span>
                    </h2>
                  );
                }
                if (block.type === "paragraph") {
                  const isFirst = i === 0;
                  return (
                    <p
                      key={i}
                      className={`mt-5 font-serif text-[1.0625rem] leading-[1.85] text-stone-700 dark:text-stone-300 sm:text-lg ${
                        isFirst ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-[3.4rem] first-letter:leading-[0.82] first-letter:font-semibold first-letter:text-blue-700 dark:first-letter:text-blue-400" : ""
                      }`}
                    >
                      {block.text}
                    </p>
                  );
                }
                return null;
              })}

              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-stone-300 dark:border-white/15 pt-6">
                <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Filed under:
                </span>
                {(post.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-stone-300 dark:border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600 dark:text-stone-300"
                  >
                    {kicker([tag])}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {related.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center gap-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-900 dark:text-white">
                  More from the journal
                </h2>
                <span className="h-px flex-1 bg-stone-300 dark:bg-white/10" />
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {related.map((p) => (
                  <Link key={p.slug} to={`/blog/${p.slug}`} className="group block">
                    <PostCover
                      post={p}
                      index={posts.findIndex((x) => x.slug === p.slug)}
                      size="sm"
                      className="aspect-[16/11] transition-transform duration-500 group-hover:scale-[1.015]"
                    />
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">
                      {kicker(p.tags)}
                    </p>
                    <h3 className="mt-1 font-serif text-lg font-semibold leading-snug text-stone-900 dark:text-white transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                      {formatBlogDate(p.date)} · {readingTime(p)} min
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-14 border-t-4 border-double border-stone-900 dark:border-white/20 py-6 text-center">
            <p className="font-serif text-lg font-semibold text-stone-900 dark:text-white">
              The Keel Journal
            </p>
            <Link
              to="/blog"
              className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400 underline underline-offset-4 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Browse all stories
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}
