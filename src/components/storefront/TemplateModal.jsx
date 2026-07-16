import { useState, useEffect, useCallback } from "react";
import { FiX, FiCheck, FiLock } from "react-icons/fi";
import { useFocusTrap } from "../../hooks/useFocusTrap";

const templates = [
  {
    id: "classic",
    name: "Classic Storefront",
    description:
      "Hero slideshow, product catalogue grid, announcement bar, and WhatsApp integration. Ideal for most retail shops.",
    colors: ["#7c3aed", "#f59e0b", "#6366f1"],
    gradient: "from-violet-50 to-amber-50 dark:from-violet-500/10 dark:to-amber-500/5",
    screens: [
      { rows: 2, cols: 2, label: "Hero" },
      { rows: 2, cols: 1, label: "Cat" },
      { rows: 1, cols: 3, label: "Items" },
    ],
  },
  {
    id: "clothing",
    name: "Fashion Storefront",
    description:
      "Lookbook hero, category strips, new arrivals carousel, and featured collection banner. Ideal for clothing and apparel shops.",
    colors: ["#000000", "#f59e0b", "#ec4899"],
    gradient: "from-stone-50 to-amber-50 dark:from-stone-500/10 dark:to-amber-500/5",
    screens: [
      { rows: 2, cols: 3, label: "Lookbook" },
      { rows: 1, cols: 3, label: "Cat" },
      { rows: 1, cols: 3, label: "Arrivals" },
    ],
  },
  {
    id: "minimal",
    name: "Minimal Storefront",
    description:
      "Gradient header banner, searchable product grid with clean borderless cards, and a compact footer. No hero slideshow, no clutter.",
    colors: ["#1e293b", "#0ea5e9", "#94a3b8"],
    gradient: "from-slate-50 to-sky-50 dark:from-slate-500/10 dark:to-sky-500/5",
    screens: [
      { rows: 1, cols: 3, label: "Banner" },
      { rows: 2, cols: 2, label: "Grid" },
      { rows: 1, cols: 1, label: "Ft" },
    ],
  },
  {
    id: "bold",
    name: "Bold Storefront",
    description:
      "Dark theme with gradient hero featuring inline search, spec-heavy product cards, and dark footer. Built for electronics and tech.",
    colors: ["#0f172a", "#f59e0b", "#1e293b"],
    gradient: "from-slate-800 to-amber-900/30 dark:from-slate-900 dark:to-amber-900/10",
    screens: [
      { rows: 2, cols: 3, label: "Hero" },
      { rows: 2, cols: 2, label: "Grid" },
      { rows: 1, cols: 1, label: "PDP" },
    ],
  },
];

export default function TemplateModal({ onClose, onSelect, businessCategory }) {
  const trapRef = useFocusTrap(true);
  const [selected, setSelected] = useState(
    ["clothing", "wigs"].includes(businessCategory) ? "clothing" : "classic"
  );

  const handleEscape = useCallback((e) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Choose a template"
        className="bg-white dark:bg-[#16213e] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        {/* Step indicator */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  s <= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-slate-500"
                }`}
              >
                {s < 1 ? <FiCheck size={14} /> : s}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  s <= 1
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-400 dark:text-slate-500"
                }`}
              >
                {s === 1 ? "Template" : s === 2 ? "Configure" : "Deploy"}
              </span>
              {s < 3 && (
                <div
                  className={`flex-1 h-px mx-1 ${
                    s < 1
                      ? "bg-blue-600"
                      : "bg-gray-200 dark:bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Choose a Template
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              Select a layout for your mini-catalogue site.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-5 pb-2 space-y-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                selected === t.id
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Template preview */}
                <div className={`sm:w-48 h-32 bg-gradient-to-br ${t.gradient} p-3 flex-shrink-0 relative`}>
                  <div className="grid grid-cols-3 gap-1 h-full">
                    {t.screens.map((sc, i) => (
                      <div
                        key={i}
                        className={`rounded bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/5 flex items-center justify-center text-[8px] text-gray-400 dark:text-slate-500 font-medium`}
                        style={{
                          gridColumn: `span ${sc.cols}`,
                          gridRow: `span ${sc.rows}`,
                        }}
                      >
                        {sc.label}
                      </div>
                    ))}
                  </div>
                  {/* Selected checkmark */}
                  {selected === t.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                      <FiCheck size={14} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-4 min-w-0">
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {t.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {t.colors.map((c) => (
                      <span
                        key={c}
                        className="w-4 h-4 rounded-full border border-white/30"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <span className="text-[11px] text-gray-400 dark:text-slate-500 ml-1">
                      Customizable colors
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Coming soon */}
          <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 p-4 opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-300 dark:text-slate-600">
                <FiLock size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-400 dark:text-slate-500 text-sm">
                  More Templates Coming Soon
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  Additional layouts are being designed — check back later.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/10">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(selected)}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all active:scale-[0.97] shadow-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
