import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiCompass, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <>
      <Helmet><title>Page Not Found — Keel</title></Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 px-6">
        <div className="w-20 h-20 rounded-2xl bg-surface-1 border border-border-subtle flex items-center justify-center mb-6 shadow-sm">
          <FiCompass className="text-text-faint" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
        <p className="text-sm text-text-muted text-center max-w-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-strong transition-colors"
        >
          <FiArrowLeft size={16} />
          Go Home
        </Link>
      </div>
    </>
  );
}
