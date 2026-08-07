import { FiToggleLeft, FiToggleRight } from "react-icons/fi";

const EXTRA_TOGGLES = [
  { key: "announcements", label: "Announcement Bars", desc: "Show dismissible alert bars for sales and announcements" },
  { key: "whatsapp", label: "WhatsApp Float", desc: "Floating WhatsApp button on every page" },
  { key: "about", label: "About Section", desc: "Brief about-your-shop section with description" },
  { key: "backToTop", label: "Back to Top Button", desc: "Scroll-to-top button in the bottom corner" },
];

export default function StepExtras({ value, onChange }) {
  function toggle(key) {
    onChange({ ...value, [key]: !value[key] });
  }

  return (
    <div>
      <p className="text-sm text-text-muted mb-6">
        Toggle additional features and sections on or off.
      </p>
      <div className="space-y-3">
        {EXTRA_TOGGLES.map((item) => {
          const isOn = value[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              className={`w-full text-left rounded-xl border-2 transition-all duration-200 p-4 ${
                isOn
                  ? "border-brand ring-2 ring-brand/20 bg-brand-muted"
                  : "border-border-subtle hover:border-border-strong dark:hover:border-white/20 bg-surface-1"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {item.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {item.desc}
                  </p>
                </div>
                <div className={`flex-shrink-0 transition-colors ${isOn ? "text-brand" : "text-text-faint dark:text-text-body"}`}>
                  {isOn ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
