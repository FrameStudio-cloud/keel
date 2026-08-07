import { useState, useEffect, useRef, useCallback } from "react";
import { FiX, FiCheckCircle, FiGlobe, FiShield, FiMessageCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { supabase } from "../../lib/supabase";

export default function ConfigModal({ onClose, onDeploy, templateId }) {
  const trapRef = useFocusTrap(true);
  const [subdomain, setSubdomain] = useState("");
  const [focused, setFocused] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const checkId = useRef(null);

  const sanitized = subdomain
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40);

  const tooShort = sanitized.length > 0 && sanitized.length < 3;

  useEffect(() => {
    if (checkId.current) clearTimeout(checkId.current);
    checkId.current = setTimeout(() => {
      if (sanitized.length < 3) {
        setAvailability(null);
        setChecking(false);
        return;
      }
      setChecking(true);
      setAvailability(null);
      (async () => {
        const { data } = await supabase
          .from("storefront_deployments")
          .select("id")
          .eq("subdomain", sanitized)
          .maybeSingle();
        setAvailability(!data);
        setChecking(false);
      })();
    }, sanitized.length < 3 ? 0 : 500);
    return () => {
      if (checkId.current) clearTimeout(checkId.current);
    };
  }, [sanitized]);

  function getBorderClass() {
    if (focused) return "border-brand ring-2 ring-brand/10";
    if (checking) return "border-warning";
    if (availability === true) return "border-success";
    if (availability === false) return "border-danger";
    if (tooShort) return "border-border-strong";
    return "border-border-subtle";
  }

  function renderBadge() {
    if (!subdomain) return null;
    if (sanitized.length < 3) {
      return (
        <span className="text-xs text-text-faint font-medium whitespace-nowrap">
          3+ chars
        </span>
      );
    }
    if (checking) {
      return (
        <span className="flex items-center gap-1 text-xs text-warning font-medium whitespace-nowrap">
          <FiLoader size={12} className="animate-spin" />
          Checking
        </span>
      );
    }
    if (availability === true) {
      return (
        <span className="flex items-center gap-1 text-xs text-success font-medium whitespace-nowrap">
          <FiCheckCircle size={13} />
          Available
        </span>
      );
    }
    if (availability === false) {
      return (
        <span className="flex items-center gap-1 text-xs text-danger font-medium whitespace-nowrap">
          <FiAlertCircle size={13} />
          Unavailable
        </span>
      );
    }
    return null;
  }

  const canDeploy = sanitized.length >= 3 && availability === true;

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleSubmit(e) {
    e.preventDefault();
    if (canDeploy) onDeploy(sanitized, templateId);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        ref={trapRef}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label="Configure storefront"
        className="bg-surface-1 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        {/* Step indicator */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  s <= 2
                    ? "bg-brand text-white"
                    : "bg-surface-2 dark:bg-white/10 text-text-faint"
                }`}
              >
                {s < 2 ? <FiCheckCircle size={14} /> : s}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  s <= 2
                    ? "text-brand font-medium"
                    : "text-text-faint"
                }`}
              >
                {s === 1 ? "Template" : s === 2 ? "Configure" : "Deploy"}
              </span>
              {s < 3 && (
                <div
                  className={`flex-1 h-px mx-1 ${
                    s < 2
                      ? "bg-brand"
                      : "bg-surface-2 dark:bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Configure Your Storefront
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              Choose your subdomain and review what we set up.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-2 text-text-faint transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-5 pb-2 space-y-5">
          {/* Subdomain input */}
          <div>
            <label className="block text-sm font-medium text-text-body mb-1.5">
              Your subdomain
            </label>
            <div
              className={`flex items-center border-2 rounded-xl transition-all duration-200 overflow-hidden ${getBorderClass()}`}
            >
              <div className="flex-1 flex items-center">
                <span className="pl-3 text-sm text-text-faint select-none">
                  /
                </span>
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="your-store"
                  className="flex-1 px-2 py-3 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-faint"
                />
              </div>
              {subdomain && (
                <div className="pr-3">
                  {renderBadge()}
                </div>
              )}
            </div>

            {/* Feedback row */}
            {subdomain && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <div className="flex items-center gap-1.5">
                  <FiGlobe size={14} className="text-text-faint" />
                  <span className="text-text-muted">
                    {sanitized || "your-store"}.keel.framestudio.co.ke
                  </span>
                </div>
                {availability === false && (
                  <span className="text-xs text-danger">
                    This subdomain is already taken
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Summary card */}
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.03] dark:to-transparent rounded-xl border border-border-subtle p-4 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-brand text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              What gets created
            </h3>
            <div className="grid gap-2.5">
              {[
                {
                  icon: <FiGlobe size={15} />,
                  label: "Custom domain",
                  desc: "Your subdomain on keel.framestudio.co.ke",
                },
                {
                  icon: <FiShield size={15} />,
                  label: "Hosted catalogue",
                  desc: "Deployed and managed on Vercel",
                },
                {
                  icon: <FiMessageCircle size={15} />,
                  label: "WhatsApp integration",
                  desc: "Customers message you directly",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-muted flex items-center justify-center text-brand flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-body">
                      {item.label}
                    </p>
                    <p className="text-xs text-text-faint">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-text-muted hover:text-text-body dark:hover:text-text-body transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canDeploy}
            className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-strong transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm"
          >
            Deploy Storefront
          </button>
        </div>
      </form>
    </div>
  );
}
