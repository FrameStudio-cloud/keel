/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { FiX, FiCamera, FiCameraOff, FiRefreshCw } from "react-icons/fi";

export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCam, setSelectedCam] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState(null);
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);

  async function initScanner() {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      const cams = await Html5Qrcode.getCameras();
      if (!mountedRef.current) return;

      if (cams.length === 0) {
        setError("No camera found");
        return;
      }

      setCameras(cams);
      const camId = cams[0].id;
      setSelectedCam(camId);
      startScanning(scanner, camId);
    } catch {
      if (mountedRef.current) {
        setError("Camera access denied or not supported");
      }
    }
  }

  function startScanning(scanner, camId) {
    setScanning(true);
    scanner
      .start(
        camId,
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          if (!mountedRef.current) return;
          scanner.pause();
          setFound(decodedText);
          setScanning(false);
        },
        () => {}
      )
      .catch(() => {
        if (mountedRef.current) {
          setError("Failed to start camera");
          setScanning(false);
        }
      });
  }

  function stopScanner() {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
      } catch {
        /* scanner already stopped */
      }
    }
  }

  function switchCamera(camId) {
    stopScanner();
    setSelectedCam(camId);
    setFound(null);
    setError(null);
    if (scannerRef.current) {
      startScanning(scannerRef.current, camId);
    }
  }

  function confirmCode() {
    onScan(found);
  }

  function rescane() {
    setFound(null);
    setError(null);
    if (scannerRef.current && selectedCam) {
      scannerRef.current.resume();
      setScanning(true);
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    initScanner();
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Scan barcode"
    >
      <div className="bg-white dark:bg-[#16213e] rounded-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">Scan Barcode</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 text-lg"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="p-4">
          <div
            id="barcode-reader"
            className="w-full aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden relative"
          />

          {error && (
            <div className="mt-3 text-xs text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
              <FiCameraOff className="inline mr-1" />
              {error}
              <p className="mt-1 text-gray-500 dark:text-slate-400">
                Please grant camera permission and refresh.
              </p>
            </div>
          )}

          {scanning && !error && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
              <FiCamera className="animate-pulse text-blue-500" />
              Scanning for barcode...
            </div>
          )}

          {found && (
            <div className="mt-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg px-3 py-2">
              <p className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">
                Barcode detected
              </p>
              <p className="text-sm font-mono text-gray-800 dark:text-white break-all">
                {found}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={confirmCode}
                  className="flex-1 bg-green-600 text-white text-xs py-1.5 rounded-lg hover:bg-green-700 transition-all"
                >
                  Use this barcode
                </button>
                <button
                  onClick={rescane}
                  className="flex items-center gap-1 px-3 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-xs py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
                >
                  <FiRefreshCw size={12} />
                  Rescan
                </button>
              </div>
            </div>
          )}

          {cameras.length > 1 && (
            <div className="mt-3">
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Camera
              </label>
              <select
                value={selectedCam || ""}
                onChange={(e) => switchCamera(e.target.value)}
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Camera ${cameras.indexOf(c) + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
