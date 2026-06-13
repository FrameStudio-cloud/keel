import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview";
import SettingsProvider from "./context/SettingsProvider";

const Inventory = lazy(() => import("./pages/Inventory"));
const Sales = lazy(() => import("./pages/Sales"));
const Social = lazy(() => import("./pages/Social"));
const Bots = lazy(() => import("./pages/Bots"));
const Website = lazy(() => import("./pages/Website"));
const Settings = lazy(() => import("./pages/Settings"));
const SetupWizard = lazy(() => import("./pages/SetupWizard"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const StockHistory = lazy(() => import("./pages/StockHistory"));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-[#1a1a2e]">
      <div className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">Loading...</div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/social" element={<Social />} />
            <Route path="/bots" element={<Bots />} />
            <Route path="/website" element={<Website />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/setup" element={<SetupWizard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/stock-history" element={<StockHistory />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SettingsProvider>
  );
}
