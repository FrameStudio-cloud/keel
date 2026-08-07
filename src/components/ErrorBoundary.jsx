import { Component } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import posthog from "../lib/posthog";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, retryKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error("ErrorBoundary caught:", error);
    posthog.captureException(error, {
      error_name: error?.name || "UnknownError",
      page: typeof window !== "undefined" ? window.location.pathname : "n/a",
    });
    if (
      error.name === "ChunkLoadError" ||
      /Loading chunk|Failed to fetch dynamically imported module|dynamic import/.test(error.message)
    ) {
      window.location.reload();
    }
  }

  handleRetry() {
    this.setState({ error: null, retryKey: (k) => k + 1 });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 px-6">
          <FiAlertTriangle className="text-danger mb-4" size={48} />
          <h1 className="text-xl font-semibold text-text-primary mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-text-muted text-center max-w-md mb-6">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.handleRetry()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-strong transition-colors"
          >
            <FiRefreshCw size={16} />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
