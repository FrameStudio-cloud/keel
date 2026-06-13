export default function Login() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h2 className="text-slate-900 dark:text-white font-bold text-lg">
            Welcome to Keel
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Sign in to manage your shop
          </p>
        </div>

        <form className="space-y-3">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="········"
              className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all">
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          Authentication coming soon
        </p>
      </div>
    </div>
  );
}
