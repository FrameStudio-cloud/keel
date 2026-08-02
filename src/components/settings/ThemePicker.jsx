import { THEMES, getTheme } from "../../lib/themes";
import { FiCheck, FiMoon, FiSun } from "react-icons/fi";

function ModeIcon({ mode }) {
  return mode === "dark" ? <FiMoon size={12} /> : <FiSun size={12} />;
}

export default function ThemePicker({ value, onSelect }) {
  const current = getTheme(value);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-faint">
          Pick a theme — changes apply instantly and are saved with your settings.
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted capitalize">
          <ModeIcon mode={current.mode} />
          {current.mode}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEMES.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              aria-pressed={active}
              className={`text-left rounded-xl border transition-all p-3 ${
                active
                  ? "border-brand bg-brand-muted ring-2 ring-brand/20"
                  : "border-border-subtle bg-surface-1 hover:border-border-strong"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  {t.name}
                </span>
                {active && <FiCheck size={14} className="text-brand" />}
              </div>
              <div className="flex gap-1.5">
                {t.swatches.map((c, i) => (
                  <span
                    key={i}
                    className="w-5 h-5 rounded-md border border-black/10"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-text-muted">{t.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
