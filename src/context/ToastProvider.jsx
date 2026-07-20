import { createContext, useContext, useState, useCallback, useRef } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {} };
  }
  return ctx;
}

const DURATIONS = {
  success: 4000,
  error: 8000,
  warning: 6000,
  info: 5000,
  pending: null,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback((message, type = "success", subtitle) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, subtitle }]);
    const duration = DURATIONS[type];
    if (duration) {
      timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}
