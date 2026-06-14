import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useSettings } from "../hooks/useSettings";
import { AuthContext } from "../context/AuthContext";
import {
  FiMail, FiPhone, FiMapPin, FiGlobe, FiMessageCircle,
  FiDollarSign, FiMonitor, FiCreditCard, FiSettings, FiLogOut,
} from "react-icons/fi";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const settings = useSettings();
  const {
    storeName,
    storePhone,
    storeAddress,
    websiteUrl,
    whatsapp,
    businessCategory,
    currencySymbol,
    defaultPayment,
    theme,
    loading,
  } = settings;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (loading) {
    return (
      <PageLayout title="Store Profile">
        <div className="max-w-2xl mx-auto space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Store Profile">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-blue-400">
              {(storeName || "K")[0]}
            </span>
          </div>
          <h2 className="text-slate-900 dark:text-white font-bold text-xl">
            {storeName}
          </h2>
          <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
            {businessCategory?.charAt(0).toUpperCase() +
              businessCategory?.slice(1) || "General"}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
            Account
          </p>
          {user?.email && (
            <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <FiMail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">Email</span>
              <span className="text-slate-900 dark:text-white text-sm">{user.email}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <FiDollarSign size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">Currency</span>
              <span className="text-slate-900 dark:text-white text-sm font-medium">
                {currencySymbol || "KSh"}
              </span>
            </div>
            <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <FiCreditCard size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">Payment</span>
              <span className="text-slate-900 dark:text-white text-sm">{defaultPayment || "Cash"}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
            <FiMonitor size={14} className="text-slate-400 flex-shrink-0" />
            <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">Theme</span>
            <span className="text-slate-900 dark:text-white text-sm capitalize">{theme || "dark"}</span>
          </div>
        </div>

        {(storePhone || storeAddress || whatsapp || websiteUrl) && (
          <div className="space-y-3 mb-6">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
              Contact
            </p>
            {storePhone && (
              <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                <FiPhone size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">Phone</span>
                <span className="text-slate-900 dark:text-white text-sm">{storePhone}</span>
              </div>
            )}
            {storeAddress && (
              <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                <FiMapPin size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">Address</span>
                <span className="text-slate-900 dark:text-white text-sm text-right max-w-[60%]">
                  {storeAddress}
                </span>
              </div>
            )}
            {whatsapp && (
              <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                <FiMessageCircle size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">WhatsApp</span>
                <span className="text-slate-900 dark:text-white text-sm">{whatsapp}</span>
              </div>
            )}
            {websiteUrl && (
              <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                <FiGlobe size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">Website</span>
                <span className="text-slate-900 dark:text-white text-sm text-right max-w-[60%] truncate">
                  {websiteUrl}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate("/settings")}
            className="w-full py-2.5 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-semibold hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <FiSettings size={14} />
            Edit Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <FiLogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
