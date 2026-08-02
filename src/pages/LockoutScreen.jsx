import { useContext, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../hooks/useSettings";
import RenewModal from "../components/RenewModal";
import { FiLock, FiRefreshCw, FiStar } from "react-icons/fi";

export default function LockoutScreen() {
  const { logout } = useContext(AuthContext);
  const { subscriptionExpiresAt, lockedAt, refreshSettings } = useSettings();
  const [checking, setChecking] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [renewPlan, setRenewPlan] = useState("basic");

  const lockedByAdmin = !!lockedAt;

  const expiryDate = subscriptionExpiresAt
    ? new Date(subscriptionExpiresAt).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const lockedDate = lockedAt
    ? new Date(lockedAt).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const handleCheckStatus = async () => {
    setChecking(true);
    await refreshSettings();
    setChecking(false);
  };

  return (
    <>
      <Helmet><title>{lockedByAdmin ? "Account Locked — Keel" : "Subscription Locked — Keel"}</title></Helmet>
    <div className="flex items-center justify-center min-h-screen bg-surface-0 p-4">
      <div className="bg-surface-1 rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-muted flex items-center justify-center">
          <FiLock className="text-danger" size={28} aria-hidden="true" />
        </div>

        <h1 className="text-xl font-bold text-text-primary mb-2">
          {lockedByAdmin ? "Account Locked" : "Subscription Expired"}
        </h1>

        {lockedByAdmin ? (
          <p className="text-sm text-text-muted mb-6">
            {lockedDate
              ? `Your account was locked on ${lockedDate}.`
              : "Your account has been locked."}
            {" "}Contact support to regain access.
          </p>
        ) : (
          <>
            {expiryDate && (
              <p className="text-sm text-text-muted mb-2">
                Your subscription expired on <span className="font-medium text-text-body">{expiryDate}</span>.
              </p>
            )}

            <p className="text-sm text-text-muted mb-6">
              Renew your subscription to regain access to your dashboard.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => { setRenewPlan("basic"); setShowRenew(true); }}
                className="w-full px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-soft text-white text-sm font-semibold transition-all shadow-lg shadow-brand/25"
              >
                Renew — KSh 500 / 30 days
              </button>
              <button
                onClick={() => { setRenewPlan("pro"); setShowRenew(true); }}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-600/25"
              >
                <FiStar size={14} />
                Renew with Pro — KSh 1,000 / 30 days
              </button>
            </div>

            <div className="mt-4">
              <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-2 dark:bg-white/10 hover:bg-surface-2 dark:hover:bg-white/20 disabled:opacity-50 text-text-body text-sm font-medium transition-all flex items-center justify-center gap-2 mb-3"
                aria-label="Check subscription status"
              >
                <FiRefreshCw className={`${checking ? "animate-spin" : ""}`} />
                {checking ? "Checking..." : "Check Subscription Status"}
              </button>
            </div>
          </>
        )}

        <div className={lockedByAdmin ? "" : "mt-2"}>
          <button
            onClick={logout}
            className="w-full px-4 py-2.5 rounded-lg bg-danger hover:bg-danger-500 text-danger-contrast text-sm font-medium transition-all"
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>

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
