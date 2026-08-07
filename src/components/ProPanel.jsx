import { Link } from "react-router-dom";
import {
  FiLock, FiStar, FiCalendar, FiTrendingUp, FiLayers,
  FiImage, FiInfo, FiGrid, FiMessageSquare,
  FiLayout, FiGlobe, FiUploadCloud, FiSliders,
  FiBarChart2, FiDownload, FiFileText, FiDollarSign,
  FiCheckCircle, FiClock, FiShuffle, FiUpload,
  FiSmartphone, FiMessageCircle, FiTag, FiAward,
  FiShare2, FiLink, FiCopy, FiSend, FiEye,
  FiShoppingBag, FiDatabase, FiZap, FiShield,
} from "react-icons/fi";
import { FEATURE_META, FEATURE_PREVIEW, TIER_COMPARISON } from "../lib/tiers";

const ICON_MAP = {
  FiStar, FiCalendar, FiTrendingUp, FiLayers,
  FiImage, FiInfo, FiGrid, FiMessageSquare,
  FiLayout, FiGlobe, FiUploadCloud, FiSliders,
  FiBarChart2, FiDownload, FiFileText, FiDollarSign,
  FiCheckCircle, FiClock, FiShuffle, FiUpload,
  FiSmartphone, FiMessageCircle, FiTag, FiAward,
  FiShare2, FiLink, FiCopy, FiSend, FiEye,
  FiShoppingBag, FiDatabase, FiZap, FiShield,
};

const CARD_GRADIENTS = [
  { bg: "from-purple-50 to-purple-50/40", icon: "from-purple-500 to-purple-600", border: "border-chart-4/30 hover:border-chart-4/40" },
  { bg: "from-blue-50 to-blue-50/40",     icon: "from-blue-500 to-blue-600",     border: "border-chart-1/30 hover:border-brand-soft" },
  { bg: "from-emerald-50 to-emerald-50/40", icon: "from-emerald-500 to-emerald-600", border: "border-chart-3/30 hover:border-chart-3/60" },
  { bg: "from-rose-50 to-rose-50/40",     icon: "from-rose-500 to-rose-600",     border: "border-chart-5/30 hover:border-chart-5/60" },
];

function FreeProBadge({ value }) {
  if (value === "included") {
    return (
      <span className="text-success font-semibold text-xs bg-success-muted px-2 py-0.5 rounded-full">
        Included
      </span>
    );
  }
  if (value === "limited") {
    return (
      <span className="text-xs text-text-faint font-medium bg-surface-2 dark:bg-white/5 px-2 py-0.5 rounded-full">
        Limited
      </span>
    );
  }
  return <span className="text-text-faint font-medium">—</span>;
}

export default function ProPanel({ feature, title, description }) {
  const meta = FEATURE_META[feature];
  const t = title || meta?.title || "Pro Feature";
  const d = description || meta?.description || "Upgrade your plan to unlock this feature.";
  const previews = FEATURE_PREVIEW[feature] || [];

  return (
    <div className="max-w-4xl mx-auto pt-12 pb-8 px-4">
      <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] dark:shadow-none overflow-hidden">
        <div className="lg:grid lg:grid-cols-12 lg:divide-x lg:divide-border-subtle dark:lg:divide-white/5">

          {/* -- left: header + feature cards -- */}
          <div className="lg:col-span-6 p-8 sm:p-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-[18px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
                <FiAward size={24} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-text-primary">
                  {t} is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500">Pro Feature</span>
                </h2>
                <p className="mt-0.5 text-sm text-text-muted leading-relaxed">{d}</p>
              </div>
            </div>

            {previews.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-3">
                {previews.map((item, i) => {
                  const Icon = ICON_MAP[item.icon];
                  const g = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                  return (
                    <div
                      key={item.title}
                      className={`bg-gradient-to-br ${g.bg} dark:bg-white/[0.04] rounded-xl p-3.5 text-left border ${g.border} dark:border-white/[0.06] dark:hover:border-white/20 transition-all cursor-default`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g.icon} flex items-center justify-center shadow-sm mb-2.5`}>
                        {Icon && <Icon size={15} className="text-white" />}
                      </div>
                      <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                      <p className="text-[11px] text-text-faint leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* -- right: comparison table + CTA -- */}
          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="border border-border-subtle rounded-xl overflow-hidden text-left">
                <div className="grid grid-cols-12 text-[11px] font-semibold uppercase tracking-[0.08em] border-b border-border-subtle bg-surface-2">
                  <div className="col-span-6 px-4 py-2.5 text-text-faint">Tier Overview</div>
                  <div className="col-span-3 px-3 py-2.5 text-text-faint text-center">Free</div>
                  <div className="col-span-3 px-3 py-2.5 text-warning text-center">Pro</div>
                </div>
                <div className="divide-y divide-border-subtle dark:divide-white/5">
                  {TIER_COMPARISON.map((row) => (
                    <div key={row.label} className="grid grid-cols-12 text-sm">
                      <div className="col-span-6 px-4 py-2.5">
                        <span className="text-text-body font-medium">{row.label}</span>
                        <span className="block text-[11px] text-text-faint leading-tight">{row.desc}</span>
                      </div>
                      <div className="col-span-3 px-3 py-2.5 text-center self-center"><FreeProBadge value={row.free} /></div>
                      <div className="col-span-3 px-3 py-2.5 text-center self-center"><FreeProBadge value={row.pro} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/settings?tab=billing"
                className="w-full inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-accent-500/20 active:scale-[0.98]"
              >
                Upgrade to Pro &nbsp;&rarr;
              </Link>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-text-faint">
                <FiLock size={11} />
                <span>Your data stays intact when you upgrade</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
