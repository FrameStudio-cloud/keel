import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiSearch, FiBookOpen, FiArrowRight, FiX, FiZap, FiPackage,
  FiTrendingUp, FiDollarSign, FiShare2, FiMonitor, FiLink,
  FiBriefcase, FiSettings, FiHelpCircle,
} from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import { docs, docCategories } from "../data/docs";

const CATEGORY_ICONS = {
  "Getting Started": FiZap,
  Inventory: FiPackage,
  "Sales & Receipts": FiTrendingUp,
  Finance: FiDollarSign,
  Marketing: FiShare2,
  Website: FiMonitor,
  Integrations: FiLink,
  "Service Businesses": FiBriefcase,
  "Account & Settings": FiSettings,
  Troubleshooting: FiHelpCircle,
};

function countByCategory(category) {
  return docs.filter((d) => d.category === category).length;
}

export default function Docs() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      const matchesCat = activeCat === "all" || d.category === activeCat;
      if (!matchesCat) return false;
      if (!q) return true;
      const inSection = d.sections.some(
        (s) =>
          s.heading.toLowerCase().includes(q) ||
          (s.paragraphs || []).some((p) => p.toLowerCase().includes(q)) ||
          (s.steps || []).some((s2) => s2.toLowerCase().includes(q))
      );
      return (
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        inSection
      );
    });
  }, [query, activeCat]);

  const grouped = useMemo(() => {
    if (activeCat !== "all") {
      return [[activeCat, filtered]];
    }
    return docCategories
      .map((cat) => [cat, filtered.filter((d) => d.category === cat)])
      .filter(([, items]) => items.length > 0);
  }, [activeCat, filtered]);

  const hasActiveFilters = query.trim() !== "" || activeCat !== "all";

  return (
    <>
      <Helmet>
        <title>Help & Docs | Keel</title>
        <meta name="description" content="Searchable guides and documentation for every feature in Keel." />
      </Helmet>
      <PageLayout title="Help & Docs">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Help & Docs</h1>
              <p className="mt-1 text-xs sm:text-sm text-text-muted">
                Guides for every feature — search, read, and get back to running your shop.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-faint">
              <FiBookOpen size={13} /> {docs.length} articles
            </span>
          </div>

          {/* Filter toolbar */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface-1">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" size={16} />
              <input
                type="text"
                placeholder="Search docs, e.g. QR codes, barcode, M-Pesa, website..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 text-sm text-text-primary placeholder:text-text-faint bg-transparent focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-text-faint hover:bg-surface-2 hover:text-text-primary transition-colors"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 border-t border-border-subtle px-4 py-3">
              {["all", ...docCategories].map((cat) => {
                const Icon = cat === "all" ? FiBookOpen : CATEGORY_ICONS[cat] || FiBookOpen;
                const isActive = activeCat === cat;
                const count = cat === "all" ? docs.length : countByCategory(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-brand text-brand-contrast shadow-sm shadow-brand/20"
                        : "text-text-muted hover:bg-surface-2 hover:text-text-primary"
                    }`}
                  >
                    <Icon size={13} />
                    {cat === "all" ? "All topics" : cat}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                        isActive ? "bg-white/20 text-brand-contrast" : "bg-surface-2 text-text-faint"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveCat("all");
                  }}
                  className="ml-auto inline-flex items-center gap-1 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-muted hover:border-danger/40 hover:text-danger transition-colors"
                >
                  <FiX size={12} />
                  Clear filters
                </button>
              )}
            </div>
          </section>

          {/* Results meta */}
          <p className="mt-5 text-[11px] uppercase tracking-widest text-text-faint">
            {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
            {activeCat !== "all" ? ` in ${activeCat}` : ""}
            {query.trim() ? ` matching "${query.trim()}"` : ""}
          </p>

          {filtered.length === 0 ? (
            <div className="mt-6 py-16 rounded-2xl border border-dashed border-border-subtle bg-surface-1 text-center">
              <FiBookOpen className="mx-auto text-text-faint" size={28} />
              <p className="mt-4 text-sm text-text-muted">
                {query
                  ? `No docs found for "${query}"${activeCat !== "all" ? ` in ${activeCat}` : ""}.`
                  : `No docs found in ${activeCat === "all" ? "this topic" : activeCat}.`}
              </p>
              <p className="mt-1 text-xs text-text-faint">
                Try a different search term or browse all topics.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveCat("all");
                }}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-contrast hover:bg-brand/90 transition-colors"
              >
                <FiX size={12} />
                Clear search & filters
              </button>
            </div>
          ) : (
            grouped.map(([cat, items]) => {
              const CatIcon = CATEGORY_ICONS[cat] || FiBookOpen;
              return (
                <section key={cat} className="mt-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-muted text-brand">
                      <CatIcon size={13} />
                    </span>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-text-faint">{cat}</h2>
                    <span className="text-[11px] text-text-faint">({items.length})</span>
                    <span className="h-px flex-1 bg-border-subtle" />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((d) => (
                      <Link
                        key={d.slug}
                        to={`/docs/${d.slug}`}
                        className="group flex flex-col rounded-xl border border-border-subtle bg-surface-1 p-4 transition-all hover:border-brand/40 hover:shadow-md hover:shadow-brand/5"
                      >
                        <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors">
                          {d.title}
                        </h3>
                        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-text-muted">{d.summary}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-brand">
                          Read guide
                          <FiArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })
          )}

          <div className="mt-10 p-4 rounded-xl border border-border-subtle bg-surface-1 text-center">
            <p className="text-xs text-text-muted">
              Can't find what you need?{" "}
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
      </PageLayout>
    </>
  );
}