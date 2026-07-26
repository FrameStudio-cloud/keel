import { useState, useMemo, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FiSearch, FiChevronDown, FiPackage, FiTrendingUp,
  FiDollarSign, FiBarChart2, FiMonitor, FiShare2,
  FiInstagram, FiClipboard, FiSettings, FiHelpCircle,
  FiZap, FiExternalLink
} from "react-icons/fi";
import helpData from "../data/help.json";

const iconMap = {
  FiZap, FiPackage, FiTrendingUp, FiDollarSign,
  FiBarChart2, FiMonitor, FiShare2, FiInstagram,
  FiClipboard, FiSettings, FiHelpCircle,
};

export default function Help() {
  const [query, setQuery] = useState("");
  const [openSection, setOpenSection] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return helpData;
    const q = query.toLowerCase();
    return helpData
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <>
      <Helmet>
        <title>Help Center | Keel</title>
        <meta name="description" content="Keel help center — guides, documentation, and troubleshooting for shop owners." />
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
            Help Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            Guides, documentation, and troubleshooting for Keel.
          </p>

          <div className="relative mb-8">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search help articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-3">
            {filtered.map((section) => {
              const Icon = iconMap[section.icon] || FiHelpCircle;
              const isOpen = openSection === section.id;
              return (
                <div key={section.id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] overflow-hidden">
                  <button
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="text-blue-500 shrink-0" size={16} />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{section.title}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">({section.items.length})</span>
                    </div>
                    <FiChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 dark:border-white/5">
                      {section.items.map((item) => {
                        const itemOpen = openItem === item.title;
                        return (
                          <div key={item.title}>
                            <button
                              onClick={() => setOpenItem(itemOpen ? null : item.title)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.title}</span>
                              <FiChevronDown
                                size={12}
                                className={`text-slate-400 transition-transform shrink-0 ${itemOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                            {itemOpen && (
                              <div className="px-4 pb-4 space-y-2">
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                                {item.steps && (
                                  <ol className="list-decimal list-inside space-y-1">
                                    {item.steps.map((step, i) => (
                                      <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step}</li>
                                    ))}
                                  </ol>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-8">
              No articles found for "{query}"
            </p>
          )}

          <div className="mt-8 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Still need help?{" "}
              <a
                href="https://wa.me/254768325728"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Contact us on WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
