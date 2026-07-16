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
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
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
                  ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-500/10"
                  : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-[#16213e]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    {item.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
                <div className={`flex-shrink-0 transition-colors ${isOn ? "text-blue-600" : "text-gray-300 dark:text-slate-600"}`}>
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
