import { FiCheck } from "react-icons/fi";

export default function GoalsStep({ goals, selected, onChange, onContinue, saving, heading }) {
  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id];
    onChange(next);
  };

  return (
    <div>
      <p className="text-sm font-semibold text-text-primary">{heading}</p>
      <div className="mt-3 space-y-2">
        {goals.map((goal) => {
          const checked = selected.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggle(goal.id)}
              aria-pressed={checked}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                checked
                  ? "border-brand bg-brand-muted text-brand"
                  : "border-border-subtle text-text-body hover:border-brand-soft"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                  checked
                    ? "bg-brand border-brand text-white"
                    : "border-border-strong"
                }`}
              >
                {checked && <FiCheck size={12} />}
              </span>
              {goal.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onContinue}
        disabled={saving || selected.length === 0}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-soft text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50"
      >
        {saving ? "Saving..." : "Continue"}
      </button>
      {selected.length === 0 && (
        <p className="mt-2 text-center text-[11px] text-text-faint">
          Pick at least one to continue — it helps us improve.
        </p>
      )}
    </div>
  );
}
