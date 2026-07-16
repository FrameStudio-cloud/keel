import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiExternalLink, FiPackage } from "react-icons/fi";
import { IoStorefrontOutline } from "react-icons/io5";

export default function StorefrontDetail({ item, onDeploy, onBack }) {
  const [current, setCurrent] = useState(0);
  const shots = item.screenshots || [];
  const active = shots[current];

  function goNext() {
    setCurrent((prev) => (prev + 1) % shots.length);
  }

  function goPrev() {
    setCurrent((prev) => (prev - 1 + shots.length) % shots.length);
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
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
                {item.templateId === "fashion" ? "Fashion" : "Classic"} template
              </p>
            </div>
          </div>
        </div>

        {/* Large preview */}
        <div className="px-6 pt-5">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 flex items-center justify-center group">
            {/* Placeholder content */}
            <div className="text-center">
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

            {/* Navigation arrows */}
            {shots.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100"
                >
                  <FiChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Caption */}
        <div className="px-6 pt-4 pb-2">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            {active?.label || "Screenshot"}
          </h3>
          {active?.desc && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              {active.desc}
            </p>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="px-6 pb-5">
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {shots.map((shot, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-28 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  i === current
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/[0.02] flex items-center justify-center">
                  <IoStorefrontOutline size={14} className="text-gray-400" />
                </div>
                <div className="px-1.5 py-1 bg-white dark:bg-[#1a1a2e]">
                  <p className="text-[10px] font-medium text-gray-600 dark:text-slate-300 truncate">
                    {shot.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Dot indicators (mobile) */}
          {shots.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3 sm:hidden">
              {shots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current
                      ? "bg-blue-600 w-4"
                      : "bg-gray-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          )}
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
