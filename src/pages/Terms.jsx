import { Helmet } from "react-helmet-async";
import { FiArrowLeft } from "react-icons/fi";
import defaultTerms from "../data/terms.json";

function renderTermLine(text) {
  const replaced = text.replace(/\{store_name\}/g, "this store");
  if (replaced.startsWith("## ")) {
    return <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">{replaced.slice(3)}</h2>;
  }
  if (replaced.trim() === "") return null;
  return <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{replaced}</p>;
}

export default function Terms() {
  const sections = defaultTerms.sections;

  return (
    <>
      <Helmet>
        <title>Terms of Service — Keel</title>
        <meta name="description" content="Terms of Service for Keel — the shop management dashboard for Kenyan small businesses." />
        <meta property="og:title" content="Terms of Service — Keel" />
        <meta property="og:description" content="Terms of Service for Keel — the shop management dashboard for Kenyan small businesses." />
        <meta property="og:url" content="https://keel-nu.vercel.app/terms" />
      </Helmet>
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e]">
      <div
        className="max-w-3xl mx-auto px-4 py-8"
      >
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-6 transition-all"
        >
          <FiArrowLeft size={14} /> Back to store
        </a>

        <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Terms of Service
          </h1>

          <div className="space-y-5">
            {sections.map((group, i) => (
              <section key={i}>
                {group.map((line, j) => {
                  const rendered = renderTermLine(line);
                  return rendered ? <div key={j}>{rendered}</div> : null;
                })}
              </section>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">Powered by Keel</p>
      </div>
    </div>
    </>
  );
}
