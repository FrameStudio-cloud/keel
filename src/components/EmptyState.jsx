import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, description, actionLabel, to, onClick }) {
  return (
    <div className="text-center py-16">
      {Icon && (
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-surface-2 dark:bg-white/5 flex items-center justify-center">
          <Icon className="text-text-faint" size={24} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted mb-5 max-w-xs mx-auto leading-relaxed">{description}</p>
      )}
      {(actionLabel && to) && (
        <Link
          to={to}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand hover:bg-brand-soft text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-brand/25"
        >
          {actionLabel}
        </Link>
      )}
      {(actionLabel && onClick) && (
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand hover:bg-brand-soft text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-brand/25"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
