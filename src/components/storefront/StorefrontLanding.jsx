import { useState, useEffect } from "react";
import { FiExternalLink, FiTrash2, FiRefreshCw, FiAlertTriangle, FiX, FiPlus, FiCheck, FiChevronRight, FiClock, FiArrowRight } from "react-icons/fi";
import { IoStorefrontOutline } from "react-icons/io5";
import { TEMPLATES, getTemplateById } from "../../data/storefrontBlueprints";

const TEMPLATE_ORDER = ["classic", "fashion", "minimal", "bold", "modern"];

function recommendedFor(category) {
  if (!category) return "classic";
  const cat = category.toLowerCase();
  if (["clothing", "wigs", "shoes", "bags", "beauty"].includes(cat)) return "fashion";
  if (["electronics", "electricals", "automotive", "sports"].includes(cat)) return "bold";
  if (["stationery", "books", "toys", "groceries", "furniture"].includes(cat)) return "minimal";
  return "classic";
}

function PhoneMockup() {
  return (
    <div className="w-[46%] aspect-[9/19] rounded-lg bg-surface-1 shadow-sm border border-border-subtle overflow-hidden">
      <div className="h-2.5 bg-surface-2 dark:bg-white/5 flex items-center justify-between px-2">
        <div className="w-4 h-1 rounded bg-surface-3 dark:bg-white/20" />
        <div className="w-2 h-1 rounded bg-surface-3 dark:bg-white/20" />
      </div>
      <div className="p-1.5 space-y-1">
        <div className="h-1.5 rounded bg-brand-muted dark:bg-brand/40 w-3/4" />
        <div className="h-1 rounded bg-surface-2 dark:bg-white/10 w-1/2" />
        <div className="grid grid-cols-2 gap-0.5 mt-1">
          <div className="aspect-square rounded bg-surface-2 dark:bg-white/5" />
          <div className="aspect-square rounded bg-surface-2 dark:bg-white/5" />
          <div className="aspect-square rounded bg-surface-2 dark:bg-white/5" />
          <div className="aspect-square rounded bg-surface-2 dark:bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function StorefrontLanding({
  businessCategory,
  deployment,
  stats,
  redeploying,
  redeployMessage,
  deployedAt,
  onSelectStorefront,
  onBuildCustom,
  onDelete,
  onRedeploy,
  onDismissMessage,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  }

  async function handleDelete() {
    setDeleteLoading(true);
    await onDelete();
    setConfirmDelete(false);
    setDeleteLoading(false);
  }

  function handleTemplateClick(t) {
    const full = getTemplateById(t.id);
    onSelectStorefront({
      id: `${t.id}-preview`,
      templateId: t.id,
      name: `${t.name} Storefront`,
      shopType: full.shopTypes?.[0] || "general",
      screenshots: full.screenshots || [],
    });
  }

  const ordered = [...TEMPLATES].sort(
    (a, b) => TEMPLATE_ORDER.indexOf(a.id) - TEMPLATE_ORDER.indexOf(b.id)
  );
  const recommendedId = recommendedFor(businessCategory);

  return (
    <div className="space-y-6 pb-8">
      {/* Deployed banner */}
      {deployment && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <IoStorefrontOutline size={20} className="text-blue-200" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-xs font-medium text-blue-100">
                      <span className="relative flex">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                        <span className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-blue-300 animate-ping opacity-40" />
                      </span>
                      Live
                    </span>
                    <span className="text-xs text-slate-300">deployed successfully</span>
                  </div>
                  <a
                    href={`https://${deployment.domain || deployment.subdomain}.keel.framestudio.co.ke`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 text-sm text-white/80 hover:text-white flex items-center gap-1.5 font-medium"
                  >
                    <FiExternalLink size={14} />
                    {deployment.domain || `${deployment.subdomain}.keel.framestudio.co.ke`}
                  </a>
                  {stats && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                      <span className="text-xs text-slate-300/80">{stats.products} products</span>
                      <span className="text-xs text-slate-300/80">{stats.pageViews} page views</span>
                      {deployedAt && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <FiClock size={11} />
                          Updated {formatTime(deployedAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://${deployment.domain || deployment.subdomain}.keel.framestudio.co.ke`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-900 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <FiExternalLink size={14} />
                  Open Site
                </a>
                <button
                  onClick={() => onRedeploy()}
                  disabled={redeploying}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
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
              <div className={`mt-4 px-3 py-2.5 rounded-lg text-sm flex items-center justify-between gap-2 ${
                redeployMessage.startsWith("Error") || redeployMessage.includes("failed") || redeployMessage.includes("Failed") || redeployMessage.includes("timed out")
                  ? "bg-red-500/20 text-red-100"
                  : redeployMessage === "Catalogue updated!"
                  ? "bg-blue-500/20 text-blue-100"
                  : "bg-white/10 text-white/80"
              }`}>
                <span>{redeployMessage}</span>
                <button
                  onClick={onDismissMessage}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template picker (inline card grid) */}
      <div className="bg-surface-1 rounded-2xl border border-border-subtle overflow-hidden">
        <div className="px-6 pt-6 pb-1">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary">Choose your template</h2>
          <p className="mt-1 text-sm text-text-muted">
            Pick a professionally designed layout for your storefront, or build your own from sections.
          </p>
        </div>

        <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ordered.map((t) => {
            const recommended = t.id === recommendedId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTemplateClick(t)}
                className="group relative text-left rounded-2xl border border-border-subtle hover:border-border-strong dark:hover:border-white/20 transition-all duration-200 hover:shadow-md overflow-hidden bg-surface-1"
              >
                {recommended && (
                  <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand text-brand-contrast text-[10px] font-semibold uppercase tracking-wider shadow-md">
                    <FiCheck size={11} />
                    Recommended
                  </span>
                )}

                {/* Preview */}
                <div className="h-36 bg-gradient-to-br from-surface-2 to-surface-1 dark:from-slate-800/60 dark:to-slate-800/20 flex items-center justify-center">
                  <PhoneMockup />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary">{t.name}</h3>
                  <p className="mt-1 text-sm text-text-muted leading-relaxed line-clamp-2">
                    {getTemplateById(t.id).tagline}
                  </p>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-brand">
                    Use this template
                    <FiArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            );
          })}

          {/* Build Your Own card */}
          <button
            onClick={onBuildCustom}
            className="group relative text-left rounded-2xl border-2 border-dashed border-border-subtle hover:border-brand dark:hover:border-brand/50 transition-colors p-4 bg-surface-1 flex flex-col"
          >
            <div className="h-36 rounded-xl bg-gradient-to-br from-brand-muted/40 to-surface-2 dark:from-brand/10 dark:to-slate-800/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-1 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-border-subtle">
                <FiPlus size={24} className="text-brand" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-text-primary">Build Your Own</h3>
              <p className="mt-1 text-sm text-text-muted leading-relaxed line-clamp-2">
                Pick each section yourself — navbar, hero, catalogue, and footer. Full control.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-brand">
                Get Started
                <FiChevronRight size={14} />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(false)}
        >
          <div role="dialog" aria-modal="true" aria-label="Confirm delete" className="bg-surface-1 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-danger/15 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle size={18} className="text-danger" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text-primary">Delete storefront?</h3>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed">
                    This permanently removes your storefront from Vercel and releases the subdomain. Your shop data is not affected.
                  </p>
                </div>
                <button onClick={() => setConfirmDelete(false)} className="p-1 rounded-lg hover:bg-surface-2 text-text-faint"><FiX size={18} /></button>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-border-subtle">
              <button onClick={() => setConfirmDelete(false)} className="text-sm text-text-muted hover:text-text-body transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="px-5 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-sm">
                {deleteLoading ? "Deleting..." : "Delete Storefront"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
