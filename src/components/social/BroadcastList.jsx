import { useState, useEffect } from "react";
import { FiCheck, FiSend, FiClock } from "react-icons/fi";
import { getShopId } from "../../lib/shop";
import { supabase } from "../../lib/supabase";
import Skeleton from "../Skeleton";

export default function BroadcastList() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const shopId = await getShopId();
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("shop_id", shopId)
        .eq("is_broadcast", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled) {
        setBroadcasts(data ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border-subtle dark:border-border-subtle p-3">
            <Skeleton className="h-3 w-32 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (broadcasts.length === 0) {
    return (
      <div className="text-center py-8">
        <FiSend className="mx-auto text-text-faint dark:text-text-body mb-2" size={24} />
        <p className="text-sm text-text-faint">No WhatsApp broadcasts yet.</p>
        <p className="text-xs text-text-faint mt-1">
          Schedule a post with "WhatsApp" platform and toggle broadcast.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {broadcasts.map((b) => {
        const isSent = b.status === "published";
        return (
          <div key={b.id} className="rounded-xl border border-border-subtle dark:border-border-subtle bg-surface-1 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isSent ? "bg-success-muted" : "bg-warning-muted"
                }`}>
                  {isSent ? <FiCheck size={14} className="text-success" />
                    : <FiClock size={14} className="text-warning" />}
                </span>
                <span className="text-xs font-medium text-text-primary">
                  {isSent ? "Sent" : "Scheduled"}
                </span>
              </div>
              <span className="text-[10px] text-text-faint">
                {new Date(b.scheduled_at || b.created_at).toLocaleDateString("en-KE", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{b.caption}</p>
          </div>
        );
      })}
    </div>
  );
}
