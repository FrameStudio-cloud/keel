import { useState, useEffect } from "react";
import { FiCalendar, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import { getCalendarStatus, clearCalendarCache, getConnectUrl, disconnectCalendar } from "../../lib/googleCalendar";

export default function GoogleCalendarCard() {
  const [calStatus, setCalStatus] = useState(null);
  const [calLoading, setCalLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const loadCalStatus = async () => {
    setCalLoading(true);
    const status = await getCalendarStatus();
    setCalStatus(status);
    setCalLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("calendar") === "connected") {
      clearCalendarCache();
      const url = new URL(window.location);
      url.searchParams.delete("calendar");
      window.history.replaceState({}, "", url);
    }
    loadCalStatus();
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Calendar? Events already synced will remain in your calendar.")) return;
    setDisconnecting(true);
    try {
      await disconnectCalendar();
      setCalStatus(null);
    } catch (e) {
      console.error(e);
    }
    setDisconnecting(false);
  };

  const connectUrl = getConnectUrl();

  return (
    <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
      {calLoading ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FiRefreshCw className="animate-spin" size={12} />
            Loading...
          </div>
        ) : calStatus ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
              <FiCalendar className="text-green-500 shrink-0" size={16} />
              <div>
                <p className="text-xs font-medium text-green-800 dark:text-green-300">
                  Connected
                </p>
                {calStatus.google_email && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {calStatus.google_email}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-medium rounded-lg text-xs transition-all disabled:opacity-50"
            >
              {disconnecting ? "Disconnecting..." : "Disconnect Calendar"}
            </button>
          </div>
        ) : connectUrl ? (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
              Connect your Google Calendar to auto-schedule service appointments. Each scheduled order creates a calendar event.
            </p>
            <button
              onClick={async () => {
                const { getShopId } = await import("../../lib/shop");
                const id = await getShopId();
                if (id) window.location.href = connectUrl + id;
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-all"
            >
              <FiCalendar size={14} />
              Connect Google Calendar
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <FiAlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                Not configured
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Set VITE_GOOGLE_CLIENT_ID in your environment to enable Google Calendar integration.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
