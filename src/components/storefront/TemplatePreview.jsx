import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

const slides = [
  {
    label: "Storefront Home",
    render: () => (
      <div className="h-full flex flex-col">
        {/* Status bar inside */}
        <div className="flex items-center justify-between px-3 py-1.5 text-[9px] text-gray-400">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1.5 rounded-sm bg-gray-300" />
            <span className="w-2 h-1.5 rounded-sm bg-gray-300 opacity-50" />
          </div>
        </div>
        {/* Nav bar */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[10px] font-semibold text-gray-700">My Shop</span>
          <div className="w-4 h-4 rounded-full bg-gray-200" />
        </div>
        {/* Hero banner */}
        <div className="mx-3 rounded-lg bg-gradient-to-br from-violet-400 to-amber-300 h-16 flex items-center justify-center">
          <span className="text-white text-[9px] font-medium px-2 text-center leading-tight">
            New Collection
            <br />
            <span className="text-[7px] opacity-80">Spring 2026</span>
          </span>
        </div>
        {/* Section label */}
        <div className="flex items-center justify-between px-3 mt-2">
          <span className="text-[8px] font-semibold text-gray-500 uppercase tracking-wider">
            Featured
          </span>
          <span className="text-[7px] text-blue-500">See all</span>
        </div>
        {/* Product row */}
        <div className="flex gap-1.5 px-3 mt-1.5 flex-1">
          {["Bag", "Shoe", "Watch"].map((name) => (
            <div key={name} className="flex-1 rounded-md bg-gray-100 flex flex-col items-center justify-center p-1">
              <div className="w-full aspect-square rounded bg-gradient-to-br from-gray-200 to-gray-100 mb-0.5" />
              <span className="text-[6px] text-gray-500 truncate w-full text-center">{name}</span>
              <span className="text-[6px] font-medium text-gray-700">KSh —</span>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div className="mt-auto flex items-center justify-around px-3 py-1.5 border-t border-gray-100">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-3 h-3 rounded ${i === 0 ? "bg-gray-800" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Catalogue Grid",
    render: () => (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 text-[9px] text-gray-400">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1.5 rounded-sm bg-gray-300" />
            <span className="w-2 h-1.5 rounded-sm bg-gray-300 opacity-50" />
          </div>
        </div>
        {/* Search bar */}
        <div className="mx-3 h-5 rounded-full bg-gray-100 flex items-center px-2.5 mb-1.5">
          <span className="text-[6px] text-gray-400">Search products...</span>
        </div>
        {/* Grid */}
        <div className="flex-1 grid grid-cols-2 gap-1.5 px-3 pb-3">
          {[
            { name: "Headphones", price: "3,500" },
            { name: "Sneakers", price: "4,200" },
            { name: "Backpack", price: "2,800" },
            { name: "Sunglasses", price: "1,500" },
          ].map((item) => (
            <div key={item.name} className="rounded-lg bg-gray-50 flex flex-col overflow-hidden">
              <div className="flex-1 bg-gradient-to-br from-gray-200 to-gray-100" />
              <div className="px-1.5 py-1">
                <p className="text-[6px] text-gray-600 truncate">{item.name}</p>
                <p className="text-[7px] font-semibold text-gray-800">
                  KSh {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Product Detail",
    render: () => (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 text-[9px] text-gray-400">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1.5 rounded-sm bg-gray-300" />
            <span className="w-2 h-1.5 rounded-sm bg-gray-300 opacity-50" />
          </div>
        </div>
        {/* Back button + heart */}
        <div className="flex items-center justify-between px-3 mb-1">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-[8px] text-gray-500">←</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <FiStar size={8} className="text-gray-400" />
          </div>
        </div>
        {/* Product image */}
        <div className="mx-3 rounded-xl bg-gradient-to-br from-amber-100 to-violet-100 h-28 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center">
            <span className="text-[18px]">🎧</span>
          </div>
        </div>
        {/* Details */}
        <div className="px-3 mt-2 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[8px] font-semibold text-gray-800">Pro Wireless</p>
              <p className="text-[7px] text-gray-400">Noise-cancelling</p>
            </div>
            <p className="text-[9px] font-bold text-gray-800">KSh 8,500</p>
          </div>
          {/* Specs */}
          <div className="flex gap-1 mt-1.5">
            {["Bluetooth", "40hrs", "Black"].map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[6px] text-gray-500">
                {tag}
              </span>
            ))}
          </div>
          {/* Buy button */}
          <div className="mt-auto pt-2">
            <div className="h-7 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <span className="text-[8px] font-semibold text-white">Buy via WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function TemplatePreview() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  function goTo(index) {
    setCurrent(index);
    clearInterval(timerRef.current);
  }

  return (
    <div
      className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-200 dark:border-white/10 p-5 md:p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
            Template Preview
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            See how your storefront will look on mobile devices
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-500"
          >
            <FiChevronLeft size={14} />
          </button>
          <button
            onClick={() => goTo((current + 1) % slides.length)}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-500"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Phone + slide */}
      <div className="flex flex-col items-center gap-3">
        {/* Phone frame */}
        <div className="relative w-[180px] md:w-[200px]">
          {/* Outer phone body */}
          <div className="rounded-[24px] bg-gray-900 dark:bg-gray-800 p-2 shadow-xl">
            {/* Screen */}
            <div className="rounded-[16px] bg-white overflow-hidden" style={{ height: 320 }}>
              {/* Slide content with crossfade */}
              <div className="relative h-full">
                {slides.map((slide, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    {slide.render()}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute -inset-3 -z-10 rounded-full blur-xl bg-blue-500/5 dark:bg-blue-400/5" />
        </div>

        {/* Label + dots */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">
            {slides[current].label}
          </p>
          <div className="flex items-center justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-5 h-2 bg-blue-600"
                    : "w-2 h-2 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
