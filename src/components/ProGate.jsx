import { FiLock, FiAward } from "react-icons/fi";
import { useSettings } from "../hooks/useSettings";
import { isFeatureAccessible, FEATURE_META } from "../lib/tiers";

export default function ProGate({ feature, compact, children }) {
  const { planTier } = useSettings();
  if (isFeatureAccessible(feature, planTier)) return children;

  const meta = FEATURE_META[feature];

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs text-text-faint dark:text-text-body cursor-not-allowed select-none"
        title={meta ? `${meta.title} — ${meta.description}` : "Pro feature"}
      >
        <FiLock size={10} />
        Pro
      </span>
    );
  }

  return (
    <div className="bg-surface-1 rounded-xl border border-border-subtle p-6 text-center">
      <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
        <FiAward size={18} className="text-white" />
      </div>
      <p className="mt-3 text-sm font-semibold text-text-primary">
        {meta?.title || "Pro Feature"}
      </p>
      <p className="mt-1 text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
        {meta?.description || "Upgrade your plan to unlock this feature."}
      </p>
    </div>
  );
}
