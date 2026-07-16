import { useState } from "react";
import { FiChevronLeft, FiPackage } from "react-icons/fi";
import { IoStorefrontOutline } from "react-icons/io5";
import { TEMPLATES } from "../../data/storefrontBlueprints";

const TEMPLATE_NAMES = Object.fromEntries(TEMPLATES.map(t => [t.id, t.name]));

export default function StorefrontDetail({ item, onDeploy, onBack }) {
  const [current, setCurrent] = useState(0);
  const shots = item.screenshots || [];
  const active = shots[current];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors mb-4"
      >
        <FiChevronLeft size={16} />
        Back to Storefronts
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {/* Shop info */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {item.name}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-400 font-medium">
                  {item.shopType}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Preview of a full storefront built with the{" "}
                {TEMPLATE_NAMES[item.templateId] || "Classic"} template
              </p>
            </div>
          </div>
        </div>

        {/* Main content: sidebar + preview */}
        <div className="flex flex-col lg:flex-row gap-4 px-6 pt-5 pb-5">
          {/* Left: thumbnail sidebar */}
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[70vh] order-last lg:order-first">
            {shots.map((shot, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-20 lg:w-32 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  i === current
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/[0.02] flex items-center justify-center">
                  {shot.file ? (
                    <img src={shot.file} alt={shot.label} className="w-full h-full object-cover" />
                  ) : (
                    <IoStorefrontOutline size={14} className="text-gray-400" />
                  )}
                </div>
                <div className="px-1.5 py-1 bg-white dark:bg-[#1a1a2e]">
                  <p className="text-[10px] font-medium text-gray-600 dark:text-slate-300 truncate">
                    {shot.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Right: large preview + caption */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
              {active?.file ? (
                <img
                  src={active.file}
                  alt={active.label}
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center text-center">
                  <div>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-200 dark:bg-white/10 flex items-center justify-center mb-3">
                      <IoStorefrontOutline size={28} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
                      {active?.label || "Screenshot"}
                    </p>
                    <p className="text-xs text-gray-300 dark:text-slate-600 mt-1">
                      Actual screenshot — coming soon
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {active?.label || "Screenshot"}
              </h3>
              {active?.desc && (
                <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                  {active.desc}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-white/5 mx-6" />

        {/* Deploy section */}
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            <span className="font-medium text-gray-700 dark:text-slate-300">
              {shots.length} screenshots
            </span>{" "}
            · Click Deploy to create your own storefront with this template
          </div>
          <button
            onClick={onDeploy}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-[0.97]"
          >
            <FiPackage size={16} />
            Deploy This Storefront
          </button>
        </div>
      </div>
    </div>
  );
}
