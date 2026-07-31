import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";

export default function useIntegrationGoals(integrationSlug) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await getShopId();
      if (cancelled) return;
      if (!id) { setLoading(false); return; }
      setShopId(id);
      const { data } = await supabase
        .from("integration_goals")
        .select("goals")
        .eq("shop_id", id)
        .eq("integration_slug", integrationSlug)
        .maybeSingle();
      if (cancelled) return;
      setSaved(Array.isArray(data?.goals) ? data.goals : []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [integrationSlug]);

  const saveGoals = useCallback(async (ids) => {
    if (!shopId) return;
    const { error } = await supabase
      .from("integration_goals")
      .upsert(
        {
          shop_id: shopId,
          integration_slug: integrationSlug,
          goals: ids,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "shop_id,integration_slug" }
      );
    if (error) throw error;
    setSaved(ids);
  }, [shopId, integrationSlug]);

  return { saved, loading, saveGoals };
}
