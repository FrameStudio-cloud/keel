import { useState, useEffect } from "react";
import { FiCalendar, FiRefreshCw, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { getCalendarStatus, clearCalendarCache, getConnectUrl, disconnectCalendar } from "../../lib/googleCalendar";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";
import useIntegrationGoals from "../../hooks/useIntegrationGoals";
import GoalsStep from "./GoalsStep";

const CALENDAR_GOALS = [
  { id: "appointments", label: "Schedule service appointments" },
  { id: "avoid_double_booking", label: "Avoid double-bookings" },
  { id: "team_visibility", label: "Keep my team on the same calendar" },
  { id: "no_shows", label: "Reduce missed appointments" },
];

export default function GoogleCalendarCard() {
  const [calStatus, setCalStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [eventsSynced, setEventsSynced] = useState(null);
  const [goalsDone, setGoalsDone] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [savingGoals, setSavingGoals] = useState(false);

  const { saved: goalsSaved, loading: goalsLoading, saveGoals } = useIntegrationGoals("google-calendar");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams(location.search);
      if (params.get("calendar") === "connected") {
        clearCalendarCache();
        const url = new URL(window.location);
        url.searchParams.delete("calendar");
        window.history.replaceState({}, "", url);
      }

      const status = await getCalendarStatus();
      if (cancelled) return;
      setCalStatus(status);

      if (status) {
        try {
          const shopId = await getShopId();
          if (cancelled || !shopId) return;
          const { count } = await supabase
            .from("service_orders")
            .select("id", { count: "exact", head: true })
            .eq("shop_id", shopId)
            .not("calendar_event_id", "is", null);
          if (!cancelled) setEventsSynced(count || 0);
        } catch { /* column or table may not exist yet */ }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Calendar? Events already synced will remain in your calendar.")) return;
    setDisconnecting(true);
    try {
      await disconnectCalendar();
      setCalStatus(null);
      setEventsSynced(null);
    } catch (e) {
      console.error(e);
    }
    setDisconnecting(false);
  };

  const handleGoalsContinue = async () => {
    setSavingGoals(true);
    try {
      await saveGoals(selectedGoals);
      setGoalsDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingGoals(false);
    }
  };

  const connectUrl = getConnectUrl();
  const showGoals = !calStatus && !goalsDone && goalsSaved.length === 0;

  return (
    <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-sm p-6">
      {loading || (!calStatus && goalsLoading) ? (
          <div className="flex items-center gap-2 text-xs text-text-faint">
            <FiRefreshCw className="animate-spin" size={12} />
            Loading...
          </div>
        ) : calStatus ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-success-muted border border-success dark:border-green-500/20">
              <FiCheckCircle className="text-success shrink-0" size={16} />
              <div>
                <p className="text-xs font-medium text-success-700 text-success">
                  Connected {calStatus.google_email ? "as " + calStatus.google_email : ""}
                </p>
                {eventsSynced !== null && (
                  <p className="text-xs text-success mt-0.5">
                    {eventsSynced.toLocaleString()} service order{eventsSynced === 1 ? "" : "s"} synced to your calendar
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger font-medium rounded-lg text-xs transition-all disabled:opacity-50"
            >
              {disconnecting ? "Disconnecting..." : "Disconnect Calendar"}
            </button>
          </div>
        ) : connectUrl ? (
          showGoals ? (
            <GoalsStep
              goals={CALENDAR_GOALS}
              selected={selectedGoals}
              onChange={setSelectedGoals}
              onContinue={handleGoalsContinue}
              saving={savingGoals}
              heading="What do you want to use it for?"
            />
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-text-faint mb-4">
                Connect your Google Calendar to auto-schedule service appointments. Each scheduled order creates a calendar event.
              </p>
              <button
                onClick={async () => {
                  const { getShopId } = await import("../../lib/shop");
                  const id = await getShopId();
                  if (id) window.location.href = connectUrl + id;
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-soft text-white font-semibold rounded-lg text-sm transition-all"
              >
                <FiCalendar size={14} />
                Connect Google Calendar
              </button>
            </div>
          )
        ) : (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-warning-muted border border-warning">
            <FiAlertTriangle className="text-accent shrink-0 mt-0.5" size={14} />
            <div>
              <p className="text-xs font-medium text-warning-700 text-accent-300">
                Not configured
              </p>
              <p className="text-xs text-warning mt-0.5">
                Set VITE_GOOGLE_CLIENT_ID in your environment to enable Google Calendar integration.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
