import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiCheckCircle, FiLock, FiZap, FiSearch, FiX, FiArrowRight } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import { INTEGRATIONS, COMING_SOON } from "../lib/integrations";
import useIntegrationStatuses from "../hooks/useIntegrationStatuses";

function StatusPill({ status }) {
  if (status.locked) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-full px-2.5 py-1">
        <FiLock size={10} />
        Pro
      </span>
    );
  }
  if (status.connected) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full px-2.5 py-1">
        <FiCheckCircle size={11} />
        Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-2.5 py-1">
      Connect
    </span>
  );
}

export default function Integrations() {
  const { statusOf } = useIntegrationStatuses();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(INTEGRATIONS.map((i) => i.category).filter(Boolean)))];
  const featured = INTEGRATIONS.find((i) => i.featured) || null;

  const matches = (integration) => {
    const q = query.trim().toLowerCase();
    const inCategory = category === "All" || integration.category === category;
    const inQuery = !q
      || integration.name.toLowerCase().includes(q)
      || integration.tagline.toLowerCase().includes(q)
      || (integration.category || "").toLowerCase().includes(q);
    return inCategory && inQuery;
  };

  const filtered = useMemo(
    () => INTEGRATIONS.filter((i) => !i.featured && matches(i)),
    [query, category] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const showFeatured = featured && matches(featured);
  const connectedCount = INTEGRATIONS.filter((i) => statusOf(i).connected).length;
  const hasProTier = INTEGRATIONS.some((i) => i.tier);
  const filterActive = category !== "All" || query.trim().length > 0;
  const empty = filterActive && !showFeatured && filtered.length === 0;

  return (
    <PageLayout title="Integrations">
      <Helmet><title>Integrations - Keel</title></Helmet>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-10 text-white shadow-xl shadow-blue-900/10">
          <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-20 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute right-40 -bottom-24 w-56 h-56 rounded-full bg-white/10" />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">Your store, connected.</h2>
            <p className="mt-2 text-sm text-white/85 max-w-lg">
              Pick an integration to connect it — WhatsApp, Google Calendar and more. New tools drop here as Framestudio ships them.
            </p>

            <div className="mt-5 max-w-md">
              <div className="flex items-center gap-2 bg-white/95 rounded-full px-4 py-2.5 shadow-lg">
                <FiSearch size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search integrations..."
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-gray-400 hover:text-gray-600">
                    <FiX size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur rounded-full px-3 py-1">
                <FiZap size={12} />
                {INTEGRATIONS.length} integrations
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur rounded-full px-3 py-1">
                <FiCheckCircle size={12} />
                {connectedCount} connected
              </span>
              {hasProTier && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur rounded-full px-3 py-1">
                  Pro included
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                category === c
                  ? "bg-blue-600 text-white shadow shadow-blue-600/30"
                  : "bg-white dark:bg-[#16213e] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {showFeatured && featured && (
          <Link
            to={`/integrations/${featured.slug}`}
            className="group block overflow-hidden rounded-2xl bg-white dark:bg-[#16213e] border border-gray-200 dark:border-white/10 p-6 sm:p-8 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${featured.tileClass} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                <featured.icon size={30} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{featured.name}</h3>
                  <StatusPill status={statusOf(featured)} />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{featured.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {featured.benefits.slice(0, 2).map((b) => (
                    <span
                      key={b.title}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-2.5 py-1"
                    >
                      <b.icon size={12} className="text-blue-500" />
                      {b.title}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {statusOf(featured).connected ? "Manage" : "Set up"}
                  <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {empty && (
          <div className="text-center py-10">
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">No integrations match</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
              {query.trim() ? `Nothing found for "${query.trim()}".` : "Try a different category."}
            </p>
            <button
              type="button"
              onClick={() => { setQuery(""); setCategory("All"); }}
              className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((integration) => {
              const status = statusOf(integration);
              return (
                <Link
                  key={integration.slug}
                  to={`/integrations/${integration.slug}`}
                  className="group h-full bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 p-5 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${integration.tileClass} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <integration.icon size={20} className="text-white" />
                    </div>
                    <StatusPill status={status} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{integration.name}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-2 py-0.5">
                      {integration.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500 leading-relaxed">{integration.tagline}</p>
                </Link>
              );
            })}
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Coming soon</h3>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMING_SOON.map((teaser) => (
              <div key={teaser.name} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16213e] p-5 opacity-70">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${teaser.tileClass} flex items-center justify-center shadow-md`}>
                  <teaser.icon size={20} className="text-white" />
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{teaser.name}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/10 rounded-full px-2 py-0.5">
                    Coming soon
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500 leading-relaxed">{teaser.tagline}</p>
              </div>
            ))}

            <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-5 flex flex-col items-center justify-center text-center min-h-[120px]">
              <FiZap size={22} className="text-gray-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-gray-400 dark:text-slate-500">More coming soon</p>
              <p className="mt-1 text-xs text-gray-300 dark:text-slate-600">New integrations drop here as Framestudio ships them.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
