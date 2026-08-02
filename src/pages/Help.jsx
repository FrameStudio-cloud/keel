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
      <div className="min-h-screen bg-surface-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-brand mb-6 transition-colors"
          >
            <FiExternalLink size={12} />
            Back to Home
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
            Help Center
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mb-6">
            Guides, documentation, and troubleshooting for Keel.
          </p>

          <div className="relative mb-8">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" size={15} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search help articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-1 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-3">
            {filtered.map((section) => {
              const Icon = iconMap[section.icon] || FiHelpCircle;
              const isOpen = openSection === section.id;
              return (
                <div key={section.id} className="rounded-xl border border-border-subtle bg-surface-1 overflow-hidden">
                  <button
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-2 dark:hover:bg-white/5 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="text-brand shrink-0" size={16} />
                      <span className="text-sm font-semibold text-text-primary">{section.title}</span>
                      <span className="text-[10px] text-text-faint">({section.items.length})</span>
                    </div>
                    <FiChevronDown
                      size={14}
                      className={`text-text-faint transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border-subtle dark:border-border-subtle">
                      {section.items.map((item) => {
                        const itemOpen = openItem === item.title;
                        return (
                          <div key={item.title}>
                            <button
                              onClick={() => setOpenItem(itemOpen ? null : item.title)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-2 dark:hover:bg-white/5 transition-colors"
                            >
                              <span className="text-xs font-medium text-text-body">{item.title}</span>
                              <FiChevronDown
                                size={12}
                                className={`text-text-faint transition-transform shrink-0 ${itemOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                            {itemOpen && (
                              <div className="px-4 pb-4 space-y-2">
                                <p className="text-xs text-text-body leading-relaxed">{item.description}</p>
                                {item.steps && (
                                  <ol className="list-decimal list-inside space-y-1">
                                    {item.steps.map((step, i) => (
                                      <li key={i} className="text-xs text-text-body leading-relaxed">{step}</li>
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
            <p className="text-center text-xs text-text-faint py-8">
              No articles found for "{query}"
            </p>
          )}

          <div className="mt-8 p-4 rounded-xl border border-border-subtle bg-surface-1 text-center">
            <p className="text-xs text-text-muted">
              Still need help?{" "}
              <a
                href="https://wa.me/254768325728"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
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
