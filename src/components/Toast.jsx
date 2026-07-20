import {
  FiCheck,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiClock,
  FiX,
} from "react-icons/fi";

const VARIANTS = {
  success: {
    icon: FiCheck,
    border: "border-green-500/20",
    iconColor: "text-green-400",
  },
  error: {
    icon: FiAlertCircle,
    border: "border-red-500/20",
    iconColor: "text-red-400",
  },
  warning: {
    icon: FiAlertTriangle,
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  info: {
    icon: FiInfo,
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  pending: {
    icon: FiClock,
    border: "border-zinc-700",
    iconColor: "text-zinc-500",
  },
};

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const v = VARIANTS[t.type] || VARIANTS.info;
        const Icon = v.icon;
        const isPending = t.type === "pending";
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-zinc-900 dark:bg-black shadow-lg ${v.border} animate-[fadeSlideIn_0.2s_ease-out]`}
          >
            <Icon
              size={16}
              className={`shrink-0 mt-0.5 ${v.iconColor} ${
                isPending ? "animate-spin" : ""
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-100">{t.message}</p>
              {t.subtitle && (
                <p className="text-xs text-zinc-500 mt-0.5">{t.subtitle}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss?.(t.id)}
              className="shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
