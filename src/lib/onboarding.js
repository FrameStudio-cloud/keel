import { supabase } from "./supabase";
import { getShopId } from "./shop";

const DEFAULT_PROGRESS = {
  quickstart_dismissed: false,
  tips_seen: {},
  milestones: {
    first_product: false,
    first_sale: false,
    first_expense: false,
    first_publish: false,
  },
};

export { DEFAULT_PROGRESS };

export async function getOnboardingProgress() {
  const shopId = await getShopId();
  if (!shopId) return DEFAULT_PROGRESS;

  const { data } = await supabase
    .from("shops")
    .select("onboarding_progress")
    .eq("id", shopId)
    .maybeSingle();

  if (!data?.onboarding_progress) return DEFAULT_PROGRESS;

  return {
    ...DEFAULT_PROGRESS,
    ...data.onboarding_progress,
    milestones: {
      ...DEFAULT_PROGRESS.milestones,
      ...(data.onboarding_progress.milestones || {}),
    },
    tips_seen: {
      ...DEFAULT_PROGRESS.tips_seen,
      ...(data.onboarding_progress.tips_seen || {}),
    },
  };
}

export async function setOnboardingProgress(updates) {
  const { error } = await supabase.rpc("merge_onboarding_progress", { p_updates: updates });
  if (error) console.error("setOnboardingProgress error:", error);
}

function asArray(val) {
  return Array.isArray(val) ? val : [val];
}

export async function markTipSeen(tipKey) {
  const updates = { tips_seen: { [tipKey]: true } };
  const { error } = await supabase.rpc("merge_onboarding_progress", { p_updates: updates });
  if (error) console.error("markTipSeen error:", error);
}

export async function markMilestone(keys) {
  const milestones = {};
  asArray(keys).forEach((k) => { milestones[k] = true; });
  const updates = { milestones };
  const { error } = await supabase.rpc("merge_onboarding_progress", { p_updates: updates });
  if (error) console.error("markMilestone error:", error);
}
