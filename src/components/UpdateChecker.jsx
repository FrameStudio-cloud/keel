import { useEffect, useState } from "react";

export default function UpdateChecker() {
  const [update, setUpdate] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const result = await check();
        if (result?.available) {
          setUpdate({ ...result, install: async () => {
            setStatus("downloading");
            await result.downloadAndInstall();
            setStatus("installed");
          } });
        }
      } catch {
        // not in Tauri — ignore
      }
    })();
  }, []);

  async function relaunch() {
    try {
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    } catch {
      // fallback
    }
  }

  if (!update) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white rounded-xl shadow-xl px-5 py-4 max-w-sm text-sm">
      <p className="font-semibold mb-1">Update available</p>
      <p className="text-blue-100 text-xs mb-3">
        Keel {update.version} — {update.date ? new Date(update.date).toLocaleDateString() : "latest release"}
      </p>
      {status === "downloading" ? (
        <p className="text-blue-100 text-xs">Downloading...</p>
      ) : status === "installed" ? (
        <button
          onClick={relaunch}
          className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-all"
        >
          Restart Keel
        </button>
      ) : (
        <button
          onClick={() => update.install()}
          className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-all"
        >
          Download & Install
        </button>
      )}
    </div>
  );
}
