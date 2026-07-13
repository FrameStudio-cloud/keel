import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiCompass, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <>
      <Helmet><title>Page Not Found — Keel</title></Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-[#1a1a2e] px-6">
        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 shadow-sm">
          <FiCompass className="text-slate-300 dark:text-slate-600" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <FiArrowLeft size={16} />
          Go Home
        </Link>
      </div>
    </>
  );
}
