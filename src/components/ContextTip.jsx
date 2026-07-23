import { useState, useEffect, useRef } from "react";
import { FiX, FiArrowRight } from "react-icons/fi";
import { markTipSeen } from "../lib/onboarding";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";

export default function ContextTip({ tipKey, targetSelector, title, children }) {
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [pos, setPos] = useState(null);
  const tipRef = useRef(null);
  const timerRef = useRef(null);
  const rafRef = useRef(null);

  const dismissedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const shopId = await getShopId();
      if (!shopId) { if (mounted) setLoading(false); return; }
      const { data } = await supabase
        .from("shops")
        .select("onboarding_progress")
        .eq("id", shopId)
        .maybeSingle();
      if (!mounted) return;
      if (data?.onboarding_progress?.tips_seen?.[tipKey]) {
        dismissedRef.current = true;
        setDismissed(true);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [tipKey]);

  useEffect(() => {
    if (dismissed || loading) return;
    const targetEl = targetSelector ? document.querySelector(targetSelector) : null;
    if (!targetEl) {
      setPos({ top: 16, left: 16, side: "bottom" });
      return;
    }

    function calc() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const rect = targetEl.getBoundingClientRect();
        const tw = 300;
        const th = tipRef.current?.offsetHeight || 140;
        const gap = 8;
        let top, left, side;

        if (rect.bottom + th + gap < window.innerHeight) {
          top = rect.bottom + gap;
          side = "top";
        } else if (rect.top - th - gap > 0) {
          top = rect.top - th - gap;
          side = "bottom";
        } else {
          top = Math.max(8, Math.min(rect.top + rect.height / 2 - th / 2, window.innerHeight - th - 8));
          side = rect.right + tw + gap < window.innerWidth ? "left" : "right";
        }

        if (side === "top" || side === "bottom") {
          left = Math.max(8, Math.min(rect.left + rect.width / 2 - tw / 2, window.innerWidth - tw - 8));
        } else if (side === "left") {
          left = rect.right + gap;
        } else {
          left = rect.left - tw - gap;
        }

        const targetCenter = rect.left + rect.width / 2;
        const arrowLeft = Math.max(8, Math.min(targetCenter - left - 8, tw - 16));

        setPos({ top: `${top}px`, left: `${left}px`, side, arrowLeft });
      });
    }

    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("scroll", calc, { capture: true, passive: true });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", calc);
      window.removeEventListener("scroll", calc, { capture: true, passive: true });
    };
  }, [tipKey, targetSelector, dismissed, loading]);

  useEffect(() => {
    if (dismissed || loading) return;
    timerRef.current = setTimeout(() => handleDismiss(), 8000);
    return () => clearTimeout(timerRef.current);
  }, [dismissed, loading]);

  async function handleDismiss(e) {
    if (e) e.preventDefault();
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setDismissed(true);
    await markTipSeen(tipKey);
  }

  if (loading) return null;
  if (dismissed) return null;
  if (!pos) return null;

  return (
    <div
      ref={tipRef}
      className="fixed z-40 bg-blue-600 text-white rounded-xl p-4 shadow-xl max-w-xs"
      style={{ top: pos.top, left: pos.left }}
    >
      {pos.side === "top" && (
        <div
          className="absolute top-0 -translate-y-full"
          style={{ left: pos.arrowLeft }}
        >
          <div className="border-8 border-transparent border-b-blue-600" />
        </div>
      )}
      {pos.side === "bottom" && (
        <div
          className="absolute bottom-0 translate-y-full"
          style={{ left: pos.arrowLeft }}
        >
          <div className="border-8 border-transparent border-t-blue-600" />
        </div>
      )}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
        aria-label="Dismiss tip"
      >
        <FiX size={14} />
      </button>
      {title && (
        <p className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">{title}</p>
      )}
      <div className="text-sm leading-relaxed text-white/90">{children}</div>
      <button
        type="button"
        onClick={handleDismiss}
        className="mt-3 flex items-center gap-1 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1.5 transition-all"
      >
        Got it <FiArrowRight size={12} />
      </button>
    </div>
  );
}
