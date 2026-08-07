import { PROVISIONER_URL } from "./constants";
import { provisionerHeaders } from "./provisioner";

export async function startDeploy(payload) {
  const res = await fetch(`${PROVISIONER_URL}/provision`, {
    method: "POST",
    headers: provisionerHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Server responded with ${res.status}`);
    err.status = res.status;
    err.resume = res.status === 409 && Boolean(data.job_id);
    err.data = data;
    throw err;
  }
  return data;
}

export async function fetchDeployStatus(shopId) {
  const res = await fetch(
    `${PROVISIONER_URL}/status?shop_id=${encodeURIComponent(shopId)}`,
    { headers: provisionerHeaders() }
  );
  if (!res.ok) return null;
  return res.json();
}

const POLL_INTERVAL_MS = 2500;
const TIMEOUT_MS = 12 * 60 * 1000;

// Polls the async deploy job until it reaches a terminal state. Calls onUpdate
// with the latest job (status + events) whenever it changes.
export async function pollDeploy({ shopId, onUpdate }) {
  const start = Date.now();
  let lastStatus = null;

  while (Date.now() - start < TIMEOUT_MS) {
    const data = await fetchDeployStatus(shopId);
    const job = data?.job || null;

    if (job && job.status !== lastStatus) {
      lastStatus = job.status;
      onUpdate?.(job);
    }

    if (job?.status === "deployed") return { result: data, job };
    if (job?.status === "failed") {
      const err = new Error(job.error || "Deployment failed");
      err.job = job;
      throw err;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  const err = new Error(
    "Deployment is still running in the background. Your storefront will keep building — refresh the page in a minute to see it."
  );
  err.timedOut = true;
  throw err;
}
