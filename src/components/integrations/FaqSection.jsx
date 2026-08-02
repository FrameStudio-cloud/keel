import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function FaqSection({ faq }) {
  const [open, setOpen] = useState(0);

  return (
    <section>
      <h3 className="text-lg font-bold text-text-primary">Questions</h3>
      <div className="mt-4 divide-y divide-border-subtle dark:divide-white/5 bg-surface-1 rounded-2xl border border-border-subtle px-5">
        {faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 py-4 text-left"
              >
                <span className="text-sm font-semibold text-text-primary">{item.q}</span>
                <FiChevronDown
                  size={16}
                  className={`text-text-faint shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="pb-4 text-xs text-text-muted leading-relaxed">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
