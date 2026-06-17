import { lazy, Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
});
import Overview from "./pages/Overview";
import TourGuide from "./components/TourGuide";
import SettingsProvider from "./context/SettingsProvider";
import AuthProvider, { AuthContext } from "./context/AuthContext";

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
const Finance = lazy(() => import("./pages/Finance"));
const Reports = lazy(() => import("./pages/Reports"));
const Marketing = lazy(() => import("./pages/Marketing"));
const PublicProduct = lazy(() => import("./pages/PublicProduct"));
const Terms = lazy(() => import("./pages/Terms"));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-[#1a1a2e]">
      <div className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">Loading...</div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { needsSetup } = useContext(AuthContext);
  const location = useLocation();

  if (needsSetup && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <TourGuide />
      <Routes>
        <Route path="/terms" element={<Terms />} />
        <Route path="/p/:id" element={<PublicProduct />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/setup" element={<ProtectedRoute><SetupWizard /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
        <Route path="/bots" element={<ProtectedRoute><Bots /></ProtectedRoute>} />
        <Route path="/website" element={<ProtectedRoute><Website /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/stock-history" element={<ProtectedRoute><StockHistory /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
