import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, description, actionLabel, to, onClick }) {
  return (
    <div className="text-center py-16">
      {Icon && (
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
          <Icon className="text-slate-400" size={24} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto leading-relaxed">{description}</p>
      )}
      {(actionLabel && to) && (
        <Link
          to={to}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20"
        >
          {actionLabel}
        </Link>
      )}
      {(actionLabel && onClick) && (
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
