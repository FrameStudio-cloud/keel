import { useEffect, useRef, useState } from "react";
import { FiRefreshCw, FiX } from "react-icons/fi";

const POLL_INTERVAL = 300_000;

export default function WebUpdateChecker() {
  const [buildTime, setBuildTime] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`);
        const data = await res.json();
        if (buildTime !== null && data.buildTime !== buildTime) {
          setDismissed(false);
        }
        setBuildTime(data.buildTime);
      } catch {
        // version.json not available — ignore
      }
    }

    check();
    intervalRef.current = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (buildTime === null || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="bg-blue-600 text-white rounded-b-xl shadow-2xl px-5 py-3 flex items-center gap-4 text-sm pointer-events-auto animate-[slideDown_0.3s_ease-out] max-w-lg w-full mx-4 mt-0">
        <div className="flex items-center gap-2 min-w-0">
          <FiRefreshCw size={14} className="shrink-0" />
          <span className="font-medium truncate">A new version of Keel is available</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="shrink-0 bg-white text-blue-600 px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all"
        >
          Refresh
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-blue-200 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <FiX size={16} />
        </button>
      </div>
      <style>{`@keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}
