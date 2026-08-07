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
    bg: "bg-success-muted",
    border: "border-success/40",
    iconColor: "text-success",
  },
  error: {
    icon: FiAlertCircle,
    bg: "bg-danger-muted",
    border: "border-danger/40",
    iconColor: "text-danger",
  },
  warning: {
    icon: FiAlertTriangle,
    bg: "bg-accent-muted",
    border: "border-accent/40",
    iconColor: "text-accent-strong",
  },
  info: {
    icon: FiInfo,
    bg: "bg-brand-muted",
    border: "border-brand/40",
    iconColor: "text-brand",
  },
  pending: {
    icon: FiClock,
    bg: "bg-surface-2",
    border: "border-border-strong",
    iconColor: "text-text-muted",
  },
};

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex flex-col gap-2 px-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-0 sm:pt-0 sm:left-auto sm:top-4 sm:right-4 sm:items-end sm:max-w-sm"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const v = VARIANTS[t.type] || VARIANTS.info;
        const Icon = v.icon;
        const isPending = t.type === "pending";
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-[fadeSlideIn_0.2s_ease-out] ${v.bg} ${v.border}`}
          >
            <Icon
              size={16}
              className={`shrink-0 mt-0.5 ${v.iconColor} ${
                isPending ? "animate-spin" : ""
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary">{t.message}</p>
              {t.subtitle && (
                <p className="text-xs text-text-muted mt-0.5">{t.subtitle}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss?.(t.id)}
              className="shrink-0 text-text-faint hover:text-text-muted transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
