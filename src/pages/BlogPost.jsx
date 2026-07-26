import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiClock, FiTag, FiArrowLeft } from "react-icons/fi";
import posts from "../data/blog.json";

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Post not found</h1>
          <Link to="/blog" className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
            <FiArrowLeft size={12} />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Keel Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={`${post.title} | Keel Blog`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
        <article className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
          >
            <FiArrowLeft size={12} />
            All posts
          </Link>

          <header className="mb-8">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <FiClock size={12} />
                {new Date(post.date).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              <span>{post.author}</span>
              {post.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <FiTag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-4">
            {post.content.map((block, i) => {
              switch (block.type) {
                case "heading":
                  return (
                    <h2 key={i} className="text-base font-bold text-slate-900 dark:text-white mt-6 mb-2">
                      {block.text}
                    </h2>
                  );
                case "paragraph":
                  return (
                    <p key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {block.text}
                    </p>
                  );
                default:
                  return null;
              }
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FiArrowLeft size={12} />
              Back to all posts
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
