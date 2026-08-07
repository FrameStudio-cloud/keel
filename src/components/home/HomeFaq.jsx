import { useState } from "react";
import { faqs } from "../../data/home";
import { FiChevronDown } from "react-icons/fi";

export default function HomeFaq() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Frequently asked questions
        </h2>
      </div>
      <div className="space-y-2">
        {faqs.map(({ q, a }, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
              aria-controls={`faq-panel-${i}`}
              id={`faq-btn-${i}`}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              {q}
              <FiChevronDown
                className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
              />
            </button>
            {openFaq === i && (
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-btn-${i}`}
                className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-white/10 pt-3"
              >
                {a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
