import { useState } from "react";
import { FiChevronDown, FiAlertTriangle } from "react-icons/fi";

export default function FaqSection({ faq }) {
  const [open, setOpen] = useState(() =>
    Math.max(0, faq.findIndex((item) => item.variant === "danger"))
  );

  return (
    <section>
      <h3 className="text-lg font-bold text-text-primary">Questions</h3>
      <div className="mt-4 divide-y divide-border-subtle dark:divide-white/5 bg-surface-1 rounded-2xl border border-border-subtle px-5">
        {faq.map((item, i) => {
          const isOpen = open === i;
          const isDanger = item.variant === "danger";
          return (
            <div key={item.q} className={isDanger ? "-mx-5 px-5 bg-danger-muted border-l-2 border-danger" : ""}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 py-4 text-left"
              >
                <span className={`flex items-center gap-2 text-sm font-semibold ${isDanger ? "text-danger" : "text-text-primary"}`}>
                  {isDanger && <FiAlertTriangle size={15} className="shrink-0" />}
                  {item.q}
                </span>
                <FiChevronDown
                  size={16}
                  className={`shrink-0 transition-transform ${isDanger ? "text-danger" : "text-text-faint"} ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className={`pb-4 text-xs leading-relaxed ${isDanger ? "text-danger/90 font-medium" : "text-text-muted"}`}>{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
