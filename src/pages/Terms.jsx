import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FiArrowLeft } from "react-icons/fi";

function renderTermLine(text, storeName) {
  const replaced = text.replace(/\{store_name\}/g, storeName || "this store");
  if (replaced.startsWith("## ")) {
    return <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">{replaced.slice(3)}</h2>;
  }
  if (replaced.trim() === "") return null;
  return <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{replaced}</p>;
}

export default function Terms() {
  const [storeName, setStoreName] = useState("");
  const [termsText, setTermsText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("store_name, terms_of_service")
        .limit(1)
        .maybeSingle();
      if (data) {
        setStoreName(data.store_name || "");
        setTermsText(data.terms_of_service || "");
      }
      setLoading(false);
    })();
  }, []);

  const lines = termsText.split("\n");
  const sections = [];
  let current = [];
  for (const line of lines) {
    if (line.trim() === "" && current.length > 0) {
      sections.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) sections.push(current);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e]">
      <div
        className="max-w-3xl mx-auto px-4 py-8"
      >
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-6 transition-all"
        >
          <FiArrowLeft size={14} /> Back to {storeName || "store"}
        </a>

        <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Terms of Service
          </h1>

          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded animate-pulse w-3/5" />
              <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
              <div className="h-3 bg-white/5 rounded animate-pulse w-4/5" />
            </div>
          ) : termsText ? (
            <div className="space-y-5">
              {sections.map((group, i) => (
                <section key={i}>
                  {group.map((line, j) => {
                    const rendered = renderTermLine(line, storeName);
                    return rendered ? <div key={j}>{rendered}</div> : null;
                  })}
                </section>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-slate-500">
              Terms of service have not been set up yet. Check back later.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
          {storeName ? `${storeName} · ` : ""}Powered by Keel
        </p>
      </div>
    </div>
  );
}
