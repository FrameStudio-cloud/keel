import { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../hooks/useSettings";
import { FiLock } from "react-icons/fi";

export default function LockoutScreen() {
  const { logout } = useContext(AuthContext);
  const { subscriptionExpiresAt } = useSettings();

  const expiryDate = subscriptionExpiresAt
    ? new Date(subscriptionExpiresAt).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Helmet><title>Subscription Locked — Keel</title></Helmet>
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-[#1a1a2e] p-4">
      <div className="bg-white dark:bg-[#16213e] rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
          <FiLock className="text-red-500" size={28} />
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Subscription Expired
        </h1>

        {expiryDate && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
            Your subscription expired on <span className="font-medium text-gray-700 dark:text-slate-300">{expiryDate}</span>.
          </p>
        )}

        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Renew your subscription to regain access to your dashboard. If you believe this is an error, please contact support.
        </p>

        <button
          onClick={logout}
          className="w-full px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
    </>
  );
}
