import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { useAnnouncements } from "../hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { FiX, FiExternalLink, FiInfo, FiAlertTriangle, FiAlertOctagon, FiTag, FiTool, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const variantConfig = {
  info: { gradient: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", icon: FiInfo },
  warning: { gradient: "linear-gradient(135deg, #92400e 0%, #d97706 100%)", icon: FiAlertTriangle },
  alert: { gradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)", icon: FiAlertOctagon },
  sale: { gradient: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)", icon: FiTag },
  maintenance: { gradient: "linear-gradient(135deg, #1e293b 0%, #475569 100%)", icon: FiTool },
};

export default function AnnouncementBanner() {
  const { data: announcements = [] } = useAnnouncements();
  const queryClient = useQueryClient();
  const [dismissingId, setDismissingId] = useState(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  const visible = announcements.slice(0, 5);

  useEffect(() => {
    if (!visible.length) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % visible.length);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [visible.length]);

  if (!visible.length) return null;

  function goTo(idx) {
    setCurrent(idx);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % visible.length);
    }, 6000);
  }

  function prev() {
    goTo((current - 1 + visible.length) % visible.length);
  }

  function next() {
    goTo((current + 1) % visible.length);
  }

  async function handleDismiss(id) {
    setDismissingId(id);
    const shopId = await getShopId();
    if (shopId) {
      await supabase.from("announcement_dismissals").insert({
        announcement_id: id,
        shop_id: shopId,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["announcements"] });
  }

  const a = visible[current];
  const variant = variantConfig[a.variant] || variantConfig.info;
  const Icon = variant.icon;

  return (
    <div
      className="relative h-40 sm:h-52 rounded-2xl overflow-hidden mb-6 bg-cover bg-center group"
      style={{
        backgroundImage: a.bg_image_url ? `url(${a.bg_image_url})` : variant.gradient,
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
        aria-label="Previous announcement"
      >
        <FiChevronLeft size={16} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
        aria-label="Next announcement"
      >
        <FiChevronRight size={16} />
      </button>

      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <Icon className="text-white" size={15} />
          </div>
          <h2 className="text-white font-bold text-lg sm:text-xl">
            {a.title}
          </h2>
        </div>
        {a.message && (
          <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed line-clamp-2 pl-10">
            {a.message}
          </p>
        )}
        {a.link_url && (
          <a
            href={a.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 ml-10 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-lg w-fit transition-all"
          >
            {a.link_text || "Learn More"} <FiExternalLink size={12} />
          </a>
        )}
      </div>

      <button
        onClick={() => handleDismiss(a.id)}
        disabled={dismissingId === a.id}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all disabled:opacity-40 z-10"
        aria-label="Dismiss announcement"
      >
        <FiX size={14} />
      </button>

      {visible.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {visible.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
              aria-label={`Go to announcement ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
