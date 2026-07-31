import { useEffect, useState } from "react";
import { useSettings } from "./useSettings";
import { INTEGRATIONS } from "../lib/integrations";
import { getShopId } from "../lib/shop";
import { isFeatureAccessible } from "../lib/tiers";

export default function useIntegrationStatuses() {
  const { planTier } = useSettings();
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const shopId = await getShopId();
      const results = await Promise.allSettled(
        INTEGRATIONS.map(async (integration) => {
          const status = await integration.getStatus({ shopId });
          return [integration.slug, status];
        })
      );
      if (cancelled) return;
      const next = {};
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value) {
          next[r.value[0]] = r.value[1];
        }
      });
      setStatuses(next);
    })();
    return () => { cancelled = true; };
  }, []);

  const statusOf = (integration) => {
    if (integration.tier && !isFeatureAccessible(integration.tier, planTier)) {
      return { connected: false, locked: true };
    }
    return statuses[integration.slug] || { connected: false, locked: false };
  };

  return { statuses, statusOf };
}
