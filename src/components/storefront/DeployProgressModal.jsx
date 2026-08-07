import { useState, useEffect, useRef } from "react";
import {
  FiCheckCircle,
  FiLoader,
  FiExternalLink,
  FiCopy,
  FiGlobe,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { getShopId } from "../../lib/shop";
import { startDeploy, pollDeploy } from "../../lib/deployClient";
import { buildProvisionerPayload } from "../../data/storefrontBlueprints";

const steps = [
  { key: "shop", label: "Locating your shop" },
  { key: "provision", label: "Creating your storefront", event: "render" },
  { key: "deploy", label: "Deploying to Vercel", event: "deploy" },
  { key: "domain", label: "Setting up domain", event: "domain" },
];

const RUNNING_STATUS = { render: ["rendering"], deploy: ["deploying"], domain: ["domain"] };

function deriveStepStatus(job, step) {
  if (step.key === "shop") return "done";
  if (!job) return "queued";

  const events = job.events || [];
  const latest = events.filter((e) => e.event === step.event);
  if (latest.some((e) => e.status === "done")) return "done";
  if (latest.some((e) => e.status === "current")) return "current";
  if (RUNNING_STATUS[step.event]?.includes(job.status)) return "current";
  if (step.event === "render" && job.status === "queued") return "current";
  return "queued";
}

function deriveStatuses(job) {
  const next = {};
  for (const step of steps) next[step.key] = deriveStepStatus(job, step);
  return next;
}

export default function DeployProgressModal({
  onClose,
  subdomain,
  templateId,
  onComplete,
  shopId: shopIdProp,
  sections,
  shopSettings,
}) {
  const trapRef = useFocusTrap(true);
  const [status, setStatus] = useState({});
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape" && error) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, done, error]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    (async () => {
      try {
        setStatus({ shop: "current" });

        const shopId = shopIdProp || (await getShopId());
        if (!shopId) throw new Error("Could not determine shop ID — try signing out and back in");

        if (cancelled) return;
        setStatus({ shop: "done" });

        const finalSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
        const payload = buildProvisionerPayload({
          shopId,
          templateId: templateId || "classic",
          subdomain: finalSubdomain,
          sections,
          shopSettings: shopSettings || {},
        });

        let jobId = null;
        try {
          const startedDeploy = await startDeploy(payload);
          jobId = startedDeploy.job_id;
        } catch (err) {
          // 409 with a job_id means a deploy for this shop is already in flight — resume it.
          if (err.resume && err.data?.job_id) {
            jobId = err.data.job_id;
          } else {
            throw err;
          }
        }
        if (!jobId) throw new Error("Provisioner did not return a job — try again");

        if (cancelled) return;
        setStatus((prev) => ({ ...prev, provision: "current" }));

        const { result: deployResult } = await pollDeploy({
          shopId,
          onUpdate: (job) => setStatus(deriveStatuses(job)),
        });

        if (cancelled) return;

        setResult(deployResult);
        setStatus({ shop: "done", provision: "done", deploy: "done", domain: "done" });
        await new Promise((r) => setTimeout(r, 600));
        setDone(true);
      } catch (err) {
        if (cancelled) return;
        setTimedOut(Boolean(err.timedOut));
        setError(err.message || "Deployment failed");
      }
    })();

    return () => { cancelled = true; };
  }, [attempt, subdomain, templateId, shopIdProp, sections, shopSettings]);

  const resultDomain = result?.domain || `${subdomain}.keel.framestudio.co.ke`;
  const displayUrl = result?.url || `https://${resultDomain}`;

  function handleRetry() {
    setError(null);
    setTimedOut(false);
    setStatus({});
    setDone(false);
    setResult(null);
    started.current = false;
    setAttempt((a) => a + 1);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  function getIcon(key) {
    const s = status[key];
    if (s === "current") {
      return (
        <div className="w-8 h-8 rounded-full bg-brand-muted flex items-center justify-center">
          <FiLoader size={16} className="animate-spin text-brand" />
        </div>
      );
    }
    if (s === "done") {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
          <FiCheckCircle size={16} className="text-white" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-surface-2 dark:bg-white/5 flex items-center justify-center">
        <span className="w-3 h-3 rounded-full border-2 border-border-strong" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={done ? "Deployment complete" : "Deploying storefront"}
        className="bg-surface-1 rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        {/* Step indicator */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  s < 3 || done
                    ? "bg-brand text-white"
                    : "bg-surface-2 dark:bg-white/10 text-text-faint"
                }`}
              >
                {s < 3 ? <FiCheckCircle size={14} /> : done ? <FiCheckCircle size={14} /> : 3}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  s < 3 || done
                    ? "text-brand font-medium"
                    : "text-text-faint"
                }`}
              >
                {s === 1 ? "Template" : s === 2 ? "Configure" : "Deploy"}
              </span>
              {s < 3 && (
                <div
                  className={`flex-1 h-px mx-1 ${
                    s < 3
                      ? "bg-brand"
                      : "bg-surface-2 dark:bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-3">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            {error ? (
              <>
                <FiAlertTriangle className="text-danger" size={22} />
                {timedOut ? "Still Building" : "Deployment Failed"}
              </>
            ) : done ? (
              <>
                <FiCheckCircle className="text-success" size={22} />
                Deployment Complete
              </>
            ) : (
              "Deploying Storefront"
            )}
          </h2>
          {!done && !error && (
            <p className="text-sm text-text-muted mt-1">
              Building and deploying — this usually takes 1-2 minutes
            </p>
          )}
          {timedOut && (
            <p className="text-sm text-text-muted mt-1">
              Your storefront keeps building in the background. Refresh the page in a minute to see it.
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="px-5 pb-3 space-y-1">
          {steps.map((s) => (
            <div key={s.key} className="flex items-center gap-3 py-2">
              {getIcon(s.key)}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    status[s.key] === "done"
                      ? "text-text-primary font-medium"
                      : status[s.key] === "current"
                      ? "text-brand font-medium"
                      : "text-text-faint"
                  }`}
                >
                  {s.label}
                </p>
              </div>
              {status[s.key] === "done" && (
                <span className="text-xs text-success font-medium">
                  Done
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="mx-5 mb-3 p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/5 rounded-xl border border-danger">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-danger-muted flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle size={18} className="text-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-danger-700 text-danger">
                  {timedOut
                    ? "Taking longer than expected"
                    : error.includes("fetch") || error.includes("NetworkError") || error.includes("Failed to fetch")
                    ? "Provisioner unreachable"
                    : "Something went wrong"}
                </p>
                <p className="text-sm text-danger mt-1 leading-relaxed">
                  {error}
                </p>
                {!timedOut && (error.includes("fetch") || error.includes("NetworkError") || error.includes("Failed to fetch")) && (
                  <p className="text-xs text-danger mt-2">
                    Make sure the provisioner service is running. If this persists, check Railway dashboard.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success state */}
        {done && !error && (
          <div className="mx-5 mb-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/5 rounded-xl border border-success dark:border-green-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <FiGlobe size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-success-700 text-success">
                  Your storefront is live
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand hover:underline font-mono flex items-center gap-1"
                  >
                    {displayUrl}
                    <FiExternalLink size={13} />
                  </a>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-surface-1 dark:bg-white/10 border border-border-subtle dark:border-white/20 hover:bg-surface-2 dark:hover:bg-white/20 transition-colors text-text-body"
                  >
                    {copied ? "Copied!" : <FiCopy size={12} />}
                    {!copied && "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border-subtle">
          {error ? (
            <>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-strong transition-all active:scale-[0.97] shadow-sm"
              >
                <FiRefreshCw size={14} />
                Retry
              </button>
              <button
                onClick={onClose}
                className="text-sm text-text-muted hover:text-text-body dark:hover:text-text-body transition-colors"
              >
                {timedOut ? "Close" : "Cancel"}
              </button>
            </>
          ) : done ? (
            <>
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand border border-brand-soft rounded-lg hover:bg-brand-muted transition-colors"
              >
                <FiExternalLink size={14} />
                View Storefront
              </a>
              <button
                onClick={() => {
                  onComplete({
                    url: displayUrl,
                    domain: resultDomain,
                    subdomain,
                  });
                  onClose();
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-strong transition-all active:scale-[0.97] shadow-sm"
              >
                Done
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="text-sm text-text-muted hover:text-text-body dark:hover:text-text-body transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
