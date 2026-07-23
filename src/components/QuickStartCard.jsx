import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiCircle, FiArrowRight, FiX } from "react-icons/fi";
import { markMilestone, markTipSeen } from "../lib/onboarding";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";

const MILESTONES = [
  { key: "first_product", label: "Add your first product", link: "/inventory", hint: "Go to Inventory" },
  { key: "first_sale", label: "Log your first sale", link: "/sales", hint: "Go to Sales" },
  { key: "first_expense", label: "Record your first expense", link: "/finance", hint: "Go to Finance" },
  { key: "first_publish", label: "Publish to your website", link: "/website", hint: "Go to Website" },
];

const QUERIES = {
  first_product: (shopId) =>
    supabase.from("products").select("id", { count: "exact", head: true }).eq("shop_id", shopId).limit(1),
  first_sale: (shopId) =>
    supabase.from("sales").select("id", { count: "exact", head: true }).eq("shop_id", shopId).limit(1),
  first_expense: (shopId) =>
    supabase.from("expenses").select("id", { count: "exact", head: true }).eq("shop_id", shopId).limit(1),
  first_publish: (shopId) =>
    supabase.from("catalogue").select("id", { count: "exact", head: true }).eq("shop_id", shopId).limit(1),
};

const MIN_VISIBLE_MS = 2500;

export default function QuickStartCard() {
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [milestones, setMilestones] = useState({});
  const [syncing, setSyncing] = useState(true);
  const [tourDone, setTourDone] = useState(false);
  const readyAt = useRef(null);

  useEffect(() => {
    readyAt.current = Date.now();
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
      const progress = data?.onboarding_progress || {};
      setDismissed(progress?.tips_seen?.quickstart_card || false);
      setMilestones(progress?.milestones || {});
      setTourDone(!!progress?.quickstart_dismissed);
      setLoading(false);

      const updates = {};
      for (const m of MILESTONES) {
        if (!mounted) return;
        if (progress?.milestones?.[m.key]) continue;
        const { count } = await QUERIES[m.key](shopId);
        if (count > 0) updates[m.key] = true;
      }

      if (!mounted) return;
      if (Object.keys(updates).length > 0) {
        await markMilestone(Object.keys(updates));
        setMilestones((prev) => ({ ...prev, ...updates }));
      }
      setSyncing(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return null;
  if (dismissed) return null;
  if (!tourDone) return null;

  const allDone = MILESTONES.every((m) => milestones[m.key]);
  if (allDone && !syncing) {
    const elapsed = Date.now() - (readyAt.current || 0);
    if (elapsed > MIN_VISIBLE_MS) return null;
  }

  const doneCount = MILESTONES.filter((m) => milestones[m.key]).length;

  async function handleDismiss() {
    setDismissed(true);
    await markTipSeen("quickstart_card");
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white mb-6 shadow-xl shadow-blue-600/20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-sm">Getting Started</h3>
          <p className="text-blue-200 text-xs mt-0.5">{doneCount} of {MILESTONES.length} done</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">
            {Math.round((doneCount / MILESTONES.length) * 100)}%
          </span>
          <button onClick={handleDismiss} className="text-white/50 hover:text-white transition-colors" aria-label="Dismiss">
            <FiX size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / MILESTONES.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {MILESTONES.map((m) => {
          const done = milestones[m.key];
          return (
            <Link
              key={m.key}
              to={done ? "#" : m.link}
              onClick={done ? (e) => e.preventDefault() : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                done
                  ? "bg-white/10 text-white/60"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {done ? (
                <FiCheckCircle size={16} className="text-green-300 shrink-0" />
              ) : (
                <FiCircle size={16} className="text-white/50 shrink-0" />
              )}
              <span className={`flex-1 ${done ? "line-through" : ""}`}>{m.label}</span>
              {!done && <FiArrowRight size={14} className="text-white/60 shrink-0" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
