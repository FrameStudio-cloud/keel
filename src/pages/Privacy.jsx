import { Helmet } from "react-helmet-async";
import { FiArrowLeft } from "react-icons/fi";
import privacySections from "../data/privacy.json";

function renderLine(text) {
  if (text.startsWith("## ")) {
    return <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 mt-6 first:mt-0">{text.slice(3)}</h2>;
  }
  if (text.trim() === "") return null;
  return <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{text}</p>;
}

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — Keel</title>
        <meta name="description" content="Privacy Policy for Keel — the shop management dashboard for Kenyan small businesses." />
        <meta property="og:title" content="Privacy Policy — Keel" />
        <meta property="og:description" content="Privacy Policy for Keel — the shop management dashboard for Kenyan small businesses." />
        <meta property="og:url" content="https://keel.framestudio.co.ke/privacy" />
      </Helmet>
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-6 transition-all"
        >
          <FiArrowLeft size={14} /> Back to store
        </a>

        <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Privacy Policy
          </h1>

          <div className="space-y-1">
            {privacySections.map((group, i) => (
              <section key={i}>
                {group.map((line, j) => {
                  const rendered = renderLine(line);
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
