import SectionCard from "./SectionCard";
import { FiCreditCard, FiRefreshCw } from "react-icons/fi";

export default function BillingTab({ subscriptionExpiresAt, refreshSettings }) {
  return (
    <SectionCard icon={FiCreditCard} title="Subscription">
      {subscriptionExpiresAt ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-slate-500">Status</span>
            {new Date(subscriptionExpiresAt) > new Date() ? (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full px-2.5 py-0.5">Active</span>
            ) : (
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-full px-2.5 py-0.5">Expired</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-slate-500">Expires</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {new Date(subscriptionExpiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-slate-500">Days remaining</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {Math.max(0, Math.floor((new Date(subscriptionExpiresAt) - new Date()) / 86400000))}
            </span>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-white/10">
            <button
              onClick={() => refreshSettings?.()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25"
            >
              <FiRefreshCw size={14} />
              Check Subscription Status
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-slate-400">No subscription expiry set. Your shop is active.</p>
          <button
            onClick={() => refreshSettings?.()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-all flex items-center gap-2 mx-auto shadow-lg shadow-blue-600/25"
          >
            <FiRefreshCw size={14} />
            Refresh Status
          </button>
        </div>
      )}
    </SectionCard>
  );
}
