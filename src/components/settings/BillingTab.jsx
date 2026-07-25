import { useState } from "react";
import SectionCard from "./SectionCard";
import RenewModal from "../RenewModal";
import { FiCreditCard, FiRefreshCw, FiAlertTriangle, FiStar } from "react-icons/fi";

export default function BillingTab({ subscriptionExpiresAt, refreshSettings }) {
  const [showRenew, setShowRenew] = useState(false);
  const [renewPlan, setRenewPlan] = useState("basic");
  const [checking, setChecking] = useState(false);

  const now = new Date();
  const expiry = subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null;
  const isExpired = expiry && expiry < now;
  const daysRemaining = expiry
    ? Math.max(0, Math.floor((expiry - now) / 86400000))
    : null;
  const expiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining < 7;

  const handleCheckStatus = async () => {
    setChecking(true);
    await refreshSettings?.();
    setChecking(false);
  };

  return (
    <>
      <SectionCard icon={FiCreditCard} title="Subscription">
        {subscriptionExpiresAt ? (
          <div className="space-y-3">
            {expiringSoon && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <FiAlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    Expiring soon
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}. Renew to keep your shop active.
                  </p>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <FiAlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="text-xs font-medium text-red-800 dark:text-red-300">
                    Subscription expired
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    Your subscription expired. Renew to regain access to your dashboard.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-slate-500">Status</span>
              {isExpired ? (
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-full px-2.5 py-0.5">Expired</span>
              ) : (
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full px-2.5 py-0.5">Active</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-slate-500">Expires</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {expiry.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-slate-500">Days remaining</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {daysRemaining}
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => { setRenewPlan("basic"); setShowRenew(true); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-blue-600/25"
              >
                Renew — KSh 500 / 30 days
              </button>
              <button
                onClick={() => { setRenewPlan("pro"); setShowRenew(true); }}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25"
              >
                <FiStar size={14} />
                Upgrade to Pro — KSh 1,000 / 30 days
              </button>
              <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiRefreshCw className={`${checking ? "animate-spin" : ""}`} size={14} />
                {checking ? "Checking..." : "Check Subscription Status"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-slate-400">No subscription expiry set. Your shop is active.</p>
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-blue-600/25"
            >
              <FiRefreshCw className={`${checking ? "animate-spin" : ""}`} size={14} />
              {checking ? "Checking..." : "Refresh Status"}
            </button>
          </div>
        )}
      </SectionCard>

      {showRenew && (
        <RenewModal
          onClose={() => setShowRenew(false)}
          subscriptionExpiresAt={subscriptionExpiresAt}
          onRenewed={handleCheckStatus}
          defaultPlan={renewPlan}
        />
      )}
    </>
  );
}
