import { useState } from "react";
import { FiExternalLink, FiTrash2, FiRefreshCw, FiAlertTriangle, FiX, FiPlus, FiCheck, FiChevronRight } from "react-icons/fi";
import { IoStorefrontOutline } from "react-icons/io5";
import StorefrontCard from "./StorefrontCard";
import { TEMPLATES, TEMPLATE_DETAILS, GALLERY_ITEMS } from "../../data/storefrontBlueprints";

export default function StorefrontLanding({
  deployment,
  stats,
  redeploying,
  redeployMessage,
  onSelectStorefront,
  onBuildCustom,
  onDelete,
  onRedeploy,
}) {
  const [activeTab, setActiveTab] = useState("classic");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isCustom = activeTab === "custom";
  const detail = isCustom ? null : TEMPLATE_DETAILS[activeTab];
  const gallery = isCustom ? [] : (GALLERY_ITEMS[activeTab] || []);

  async function handleDelete() {
    setDeleteLoading(true);
    await onDelete();
    setConfirmDelete(false);
    setDeleteLoading(false);
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Deployed banner */}
      {deployment && (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative z-10 p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <IoStorefrontOutline size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="relative flex">
                      <span className="w-2 h-2 rounded-full bg-green-300" />
                      <span className="absolute inset-0 w-2 h-2 rounded-full bg-green-300 animate-ping opacity-50" />
                    </span>
                    <span className="text-sm font-medium text-emerald-100">Live</span>
                  </div>
                  <a
                    href={`https://${deployment.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-white/80 hover:text-white flex items-center gap-1.5 font-medium"
                  >
                    <FiExternalLink size={14} />
                    {deployment.url}
                  </a>
                  {stats && (
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-emerald-100/70">{stats.products} products</span>
                      <span className="text-xs text-emerald-100/70">{stats.pageViews} page views</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onRedeploy()}
                  disabled={redeploying}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-white/15 hover:bg-white/25 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw size={14} className={redeploying ? "animate-spin" : ""} />
                  {redeploying ? "Updating..." : "Update"}
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-white/10 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
            {redeployMessage && (
              <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${
                redeployMessage.startsWith("Error") || redeployMessage.includes("failed")
                  ? "bg-red-500/20 text-red-100"
                  : redeployMessage === "Catalogue updated!"
                  ? "bg-emerald-500/20 text-emerald-100"
                  : "bg-white/10 text-white/80"
              }`}>
                {redeployMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-white/10">
          {TEMPLATES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3.5 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              }`}
            >
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {isCustom ? (
          /* ── Custom tab: Build Yours ── */
          <div className="p-6">
            <button
              onClick={onBuildCustom}
              className="w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors p-12 text-center group"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiPlus size={28} className="text-blue-500" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">
                Build Your Own Storefront
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Pick each section yourself — navbar, hero layout, catalogue style, and footer type. Full control.
              </p>
              <span className="inline-flex items-center gap-1 mt-6 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
                <FiChevronRight size={16} />
              </span>
            </button>
          </div>
        ) : (
          /* ── Classic / Fashion tab: template detail + gallery ── */
          <div>
            {/* Template hero */}
            <div className="px-6 pt-6 pb-4">
              <div className="max-w-3xl">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {detail.tagline}
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                  {detail.description}
                </p>
              </div>

              {/* Screenshot placeholders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {detail.screenshots.map((ss) => (
                  <div
                    key={ss.label}
                    className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center mb-2">
                      <IoStorefrontOutline size={18} className="text-gray-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-400 dark:text-slate-500">
                      {ss.label}
                    </span>
                    <span className="text-[10px] text-gray-300 dark:text-slate-600 mt-0.5">
                      Screenshot
                    </span>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="mt-6 grid sm:grid-cols-2 gap-2">
                {detail.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <FiCheck size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {h}
                  </div>
                ))}
              </div>

            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-white/5 mx-6" />

            {/* Real storefronts grid */}
            <div className="px-6 pt-5 pb-6">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                Real Storefronts Using {TEMPLATES.find(t => t.id === activeTab)?.name || activeTab}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                Click any to deploy your own storefront with this template
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {gallery.map((item) => (
                  <StorefrontCard
                    key={item.id}
                    item={item}
                    onClick={() => onSelectStorefront(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(false)}
        >
          <div role="dialog" aria-modal="true" aria-label="Confirm delete" className="bg-white dark:bg-[#16213e] rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">Delete storefront?</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                    This permanently removes your storefront from Vercel and releases the subdomain. Your shop data is not affected.
                  </p>
                </div>
                <button onClick={() => setConfirmDelete(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"><FiX size={18} /></button>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/10">
              <button onClick={() => setConfirmDelete(false)} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 shadow-sm">
                {deleteLoading ? "Deleting..." : "Delete Storefront"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
