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
import { PROVISIONER_URL } from "../../lib/constants";
import { buildProvisionerPayload } from "../../data/storefrontBlueprints";

const steps = [
  { key: "shop", label: "Locating your shop" },
  { key: "provision", label: "Creating your storefront" },
  { key: "deploy", label: "Deploying to Vercel" },
  { key: "domain", label: "Setting up domain" },
];

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
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
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

        const shopId = shopIdProp || await getShopId();
        if (!shopId) throw new Error("Could not determine shop ID — try signing out and back in");

        const finalSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);

        if (cancelled) return;
        setStatus((prev) => ({ ...prev, shop: "done", provision: "current" }));

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 180000);

        const payload = buildProvisionerPayload({
          shopId,
          templateId: templateId || "classic",
          subdomain: finalSubdomain,
          sections,
          shopSettings: shopSettings || {},
        })

        const res = await fetch(`${PROVISIONER_URL}/provision`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Server responded with ${res.status}`);
        }

        const data = await res.json();

        if (cancelled) return;

        setStatus({
          shop: "done",
          provision: "done",
          deploy: "done",
          domain: "done",
        });

        setResult(data);
        await new Promise((r) => setTimeout(r, 600));
        setDone(true);
      } catch (err) {
        if (cancelled) return;
        if (err.name === "AbortError") {
          setError("Request timed out — the provisioner may be waking up. Try again.");
        } else {
          setError(err.message);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [subdomain, templateId, shopIdProp, sections, shopSettings]);

  const displayUrl = `https://${result?.domain || `${subdomain}.keel.framestudio.co.ke`}`;

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
                Deployment Failed
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
                  {error.includes("timed out") || error.includes("timeout")
                    ? "Request timed out"
                    : error.includes("fetch") || error.includes("NetworkError") || error.includes("Failed to fetch")
                    ? "Provisioner unreachable"
                    : "Something went wrong"}
                </p>
                <p className="text-sm text-danger mt-1 leading-relaxed">
                  {error}
                </p>
                {(error.includes("timed out") || error.includes("timeout")) && (
                  <p className="text-xs text-danger mt-2">
                    The provisioner may be waking from sleep. Click Retry to try again.
                  </p>
                )}
                {(error.includes("fetch") || error.includes("NetworkError") || error.includes("Failed to fetch")) && (
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
                onClick={() => { setError(null); setStatus({}); started.current = false; setDone(false); }}
                className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-strong transition-all active:scale-[0.97] shadow-sm"
              >
                <FiRefreshCw size={14} />
                Retry
              </button>
              <button
                onClick={onClose}
                className="text-sm text-text-muted hover:text-text-body dark:hover:text-text-body transition-colors"
              >
                Cancel
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
                  onComplete({ url: displayUrl, domain: result?.domain || `${subdomain}.keel.framestudio.co.ke`, subdomain });
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
