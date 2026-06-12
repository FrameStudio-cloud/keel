import { useState } from "react";

const STORAGE_KEY = "keel_tour_done";

const steps = [
  {
    title: "Welcome to Keel",
    text: "Your shop management dashboard. Manage inventory, sales, and more.",
  },
  {
    title: "Inventory",
    text: "Add products, track stock levels, and publish to your website.",
  },
  {
    title: "Sales",
    text: "Log sales via Cash, M-Pesa, or IntaSend. Stock is deducted automatically.",
  },
  {
    title: "Settings",
    text: "Customize your store name, currency, theme, and payment methods.",
  },
];

export default function TourGuide() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(STORAGE_KEY)
  );

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  function next() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="flex items-center gap-1 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-blue-600" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <h2
          className="text-[var(--text-primary)] font-bold text-lg mb-2"
          style={{ fontFamily: "var(--font-display, inherit)" }}
        >
          {current.title}
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-6">{current.text}</p>
        <div className="flex gap-2">
          <button
            onClick={dismiss}
            className="flex-1 border border-[var(--border)] text-[var(--text-secondary)] text-sm py-2 rtext-[var(--text-primary)]hover:text-[var(--text-primary)] transition-colors"
          >
            Skip
          </button>
          <button
            onClick={next}
            className="flex-1 bg-blue-600 text-white font-bold text-sm py-2 rounded-xl hover:bg-blue-500 transition-all"
          >
            {step < steps.length - 1 ? "Next" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
