import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { setOnboardingProgress } from "../lib/onboarding";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";

const RETRY_MS = 200;
const MAX_RETRIES = 10;

const steps = [
  {
    title: "Welcome to Keel",
    text: "Your shop is set up. Here's a quick look at where you'll spend most of your time.",
    target: null,
  },
  {
    title: "Inventory",
    text: "Add your products here — stock, prices, categories, and barcodes. This is where everything starts.",
    target: '[data-tour="nav-Inventory"]',
  },
  {
    title: "Sales",
    text: "Log sales when customers buy. Receipts, revenue tracking, and payment methods all in one place.",
    target: '[data-tour="nav-Sales"]',
  },
];

export default function TourGuide() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, side: "bottom", arrowLeft: 0 });
  const trapRef = useFocusTrap(true);
  const tooltipRef = useRef(null);
  const rafRef = useRef(null);

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
      if (data?.onboarding_progress?.quickstart_dismissed) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!visible || loading) return;
    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, { capture: true, passive: true });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, { capture: true, passive: true });
    };
  }, [step, visible, loading]);

  const dismiss = useCallback(async () => {
    await setOnboardingProgress({ quickstart_dismissed: true });
    setVisible(false);
  }, []);

  if (loading) return null;

  function reposition(retriesLeft = MAX_RETRIES) {
    const current = steps[step];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!current.target) {
        setPos({ top: "50%", left: "50%", side: "center", arrowLeft: 0 });
        return;
      }
      const targetEl = document.querySelector(current.target);
      if (!targetEl) {
        if (retriesLeft > 0) {
          setTimeout(() => reposition(retriesLeft - 1), RETRY_MS);
        }
        return;
      }
      const rect = targetEl.getBoundingClientRect();
      const tw = 320;
      const th = tooltipRef.current?.offsetHeight || 200;
      const gap = 12;
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

  async function next() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await dismiss();
    }
  }

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      ref={trapRef}
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Quick start guide"
    >
      <div className="fixed inset-0 bg-black/40" onClick={reposition} />

      {pos.side === "center" ? (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div
            ref={tooltipRef}
            className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-2xl pointer-events-auto"
          >
            <TourContent current={current} step={step} steps={steps} isLast={isLast} onNext={next} onSkip={dismiss} />
          </div>
        </div>
      ) : (
        <div
          ref={tooltipRef}
          className="absolute bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-2xl pointer-events-auto"
          style={{ top: pos.top, left: pos.left }}
        >
          {pos.side === "top" && (
            <div className="absolute top-0 -translate-y-full" style={{ left: pos.arrowLeft }}>
              <div className="border-8 border-transparent border-b-white dark:border-b-[#16213e]" />
            </div>
          )}
          {pos.side === "bottom" && (
            <div className="absolute bottom-0 translate-y-full" style={{ left: pos.arrowLeft }}>
              <div className="border-8 border-transparent border-t-white dark:border-t-[#16213e]" />
            </div>
          )}
          <TourContent current={current} step={step} steps={steps} isLast={isLast} onNext={next} onSkip={dismiss} />
        </div>
      )}
    </div>
  );
}

function TourContent({ current, step, steps, isLast, onNext, onSkip }) {
  return (
    <>
      <div className="flex items-center gap-1 mb-4">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-blue-600" : "bg-slate-200 dark:bg-white/10"}`} />
        ))}
      </div>
      <h2 className="text-slate-900 dark:text-white font-bold text-base mb-1.5">{current.title}</h2>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{current.text}</p>
      <div className="flex gap-2">
        <button onClick={onSkip} className="flex-1 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm py-2 rounded-xl hover:text-slate-900 dark:text-white transition-colors">
          Skip
        </button>
        <button onClick={onNext} className="flex-1 bg-blue-600 text-white font-bold text-sm py-2 rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-1.5">
          {isLast ? (
            <><FiCheck size={14} /> Got it</>
          ) : (
            <><FiArrowRight size={14} /> Next</>
          )}
        </button>
      </div>
    </>
  );
}
