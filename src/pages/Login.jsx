export default function Login() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-[var(--text-primary)] font-bold text-lg">K</span>
          </div>
          <h2
            className="text-[var(--text-primary)] font-bold text-lg"
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            Welcome to Keel
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Sign in to manage your shop
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3text-[var(--text-primary)]xt-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              className="w-full bg-[var(--bg-page)] border border-[var(--border)]text-[var(--text-primary)]l px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all">
            Sign In
          </button>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
          Authentication coming soon
        </p>
      </div>
    </div>
  );
}
