import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FiSearch, FiClock, FiTag, FiArrowRight, FiExternalLink } from "react-icons/fi";
import posts from "../data/blog.json";

export default function Blog() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <>
      <Helmet>
        <title>Blog | Keel</title>
        <meta name="description" content="Keel blog — product updates, business tips, and guides for small business owners in Kenya." />
      </Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
          >
            <FiExternalLink size={12} />
            Back to Home
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Blog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            Product updates, tips, and guides for small business owners.
          </p>

          <div className="relative mb-8">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-4">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] hover:border-blue-200 dark:hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <FiClock size={10} />
                        {new Date(post.date).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      {post.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400">
                          <FiTag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <FiArrowRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 shrink-0 mt-1 transition-colors" size={14} />
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-8">
              No posts found for "{query}"
            </p>
          )}
        </div>
      </div>
    </>
  );
}
