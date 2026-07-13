import { lazy, Suspense, useContext, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import posthog from "./lib/posthog";
import { SpeedInsights } from '@vercel/speed-insights/react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PostHogPageView() {
  const { pathname } = useLocation();
  useEffect(() => { posthog.capture('$pageview'); }, [pathname]);
  return null;
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
});
import Homepage from "./pages/Homepage";
import TourGuide from "./components/TourGuide";
import UpdateChecker from "./components/UpdateChecker";
import WebUpdateChecker from "./components/WebUpdateChecker";
import SettingsProvider from "./context/SettingsProvider";
import AuthProvider, { AuthContext } from "./context/AuthContext";
import { useSettings } from "./hooks/useSettings";
import LockoutScreen from "./pages/LockoutScreen";

const Overview = lazy(() => import("./pages/Overview"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Sales = lazy(() => import("./pages/Sales"));
const Social = lazy(() => import("./pages/Social"));
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
const UseCases = lazy(() => import("./pages/UseCases"));
const AboutFramestudio = lazy(() => import("./pages/AboutFramestudio"));
const Features = lazy(() => import("./pages/Features"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-[#1a1a2e]">
      <div className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">Loading...</div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const { subscriptionExpiresAt, loading: settingsLoading } = useSettings();

  if (loading || settingsLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  if (subscriptionExpiresAt && new Date(subscriptionExpiresAt) < new Date()) {
    return <LockoutScreen />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Loading />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function HomeOrDashboard() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Loading />;
  if (user) return <Overview />;
  if (window.location.hash && window.location.hash.includes("access_token=")) {
    return <Loading />;
  }
  return <Homepage />;
}

function AppRoutes() {
  const { needsSetup } = useContext(AuthContext);
  const location = useLocation();

  if (needsSetup && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return (
    <ErrorBoundary>
    <Suspense fallback={<Loading />}>
      <TourGuide />
      <Routes>
        <Route path="/terms" element={<Terms />} />
        <Route path="/use-cases" element={<UseCases />} />
        <Route path="/about" element={<AboutFramestudio />} />
        <Route path="/features" element={<Features />} />
        <Route path="/p/:id" element={<PublicProduct />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/setup" element={<ProtectedRoute><SetupWizard /></ProtectedRoute>} />
        <Route path="/" element={<HomeOrDashboard />} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
        <Route path="/website" element={<ProtectedRoute><Website /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/stock-history" element={<ProtectedRoute><StockHistory /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <ScrollToTop />
            <PostHogPageView />
            <UpdateChecker />
            <WebUpdateChecker />
            <AppRoutes />
            <SpeedInsights />
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
