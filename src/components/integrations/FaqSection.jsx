import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function FaqSection({ faq }) {
  const [open, setOpen] = useState(0);

  return (
    <section>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Questions</h3>
      <div className="mt-4 divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 px-5">
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
                <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.q}</span>
                <FiChevronDown
                  size={16}
                  className={`text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="pb-4 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
