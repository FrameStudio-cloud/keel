import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase, authSignUp, authLogin, authResetPassword, authUpdatePassword } from "../lib/supabase";
import { AuthContext } from "../context/AuthContext";
import { FiMail, FiCheckCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const { login, setupSignup, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    return params.get("type") === "recovery" ? "reset_password" : "login";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/", { replace: true });
      } else {
        const authData = await authSignUp(email, password);
        if (!authData?.user?.id) throw new Error("This email is already registered. Try signing in instead.");

        if (authData.session) {
          const loginData = await authLogin(email, password);

          const baseSlug = shopName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          let slug;
          for (let attempt = 0; attempt < 5; attempt++) {
            const suffix = Math.random().toString(36).slice(2, 8);
            slug = `${baseSlug}-${suffix}`;
            const { data: existing } = await supabase.from("shops").select("id").eq("slug", slug).maybeSingle();
            if (!existing) break;
            if (attempt === 4) throw new Error("Unable to create unique shop slug. Please try a different shop name.");
          }

          const { data: shopData, error: shopError } = await supabase
            .from("shops")
            .insert({ name: shopName, slug, business_category: "general" })
            .select("id")
            .single();
          if (shopError) throw shopError;

          await supabase.from("store_settings").insert({
            shop_id: shopData.id,
            store_name: shopName,
            theme: "light",
          });

          await supabase.from("users").insert({
            auth_user_id: loginData.user.id,
            shop_id: shopData.id,
            name: shopName,
            email,
          });

          await setupSignup(loginData);
        } else {
          setMode("check_email");
        }
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const hash = window.location.hash.replace(/^#/, "");
      const params = Object.fromEntries(new URLSearchParams(hash));
      await authUpdatePassword(params.access_token, newPassword);
      setMode("reset_done");
      window.location.hash = "";
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email address first");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authResetPassword(email);
      setMode("check_email");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  const formContent = (
    <>
      {mode === "reset_password" ? (
        <form onSubmit={handleResetPassword} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              placeholder="········"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="········"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      ) : mode === "reset_done" ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            Your password has been updated successfully.
          </p>
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all"
          >
            Sign in with new password
          </button>
        </div>
      ) : mode === "check_email" ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <FiMail className="text-2xl text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            We sent a link to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>.<br />
            Click the link to continue.
          </p>
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className="mt-4 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Shop Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lewis Electronics"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="········"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>

            {mode === "login" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Forgot password?
              </button>
            )}
          </form>

          {mode === "login" && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-[#16213e] px-2 text-slate-400">or</span>
              </div>
            </div>
          )}

          {mode === "login" && (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full py-2.5 bg-white dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <FcGoogle className="text-lg" />
              Continue with Google
            </button>
          )}

          {mode === "login" && (
            <div className="text-center mt-4">
              <button
                onClick={() => { setMode("signup"); setError(""); }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Don't have an account? Create one
              </button>
            </div>
          )}
          {mode === "signup" && (
            <div className="text-center mt-4">
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <Helmet>
        <title>Sign In — Keel</title>
        <meta name="description" content="Sign in to Keel or create a free account. Manage your inventory, sales, and reports from one dashboard." />
        <meta property="og:title" content="Sign In — Keel" />
        <meta property="og:description" content="Sign in to Keel or create a free account. Manage your inventory, sales, and reports from one dashboard." />
        <meta property="og:url" content="https://keel-nu.vercel.app/login" />
      </Helmet>

      <div className="min-h-screen flex bg-slate-100 dark:bg-[#1a1a2e]">
        {/* Left Panel — hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f172a] overflow-hidden items-center justify-center">
          <div className="absolute inset-0">
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />
            <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[120px]" />
          </div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="relative z-10 flex flex-col items-center px-12 max-w-lg">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">K</div>
              <span className="text-white font-bold text-xl tracking-tight">Keel</span>
            </div>

            <div className="w-full mb-8 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
              <img
                src="/Business owner managing online dashboard vector image.png"
                alt="Business owner managing their online dashboard"
                className="w-full object-cover"
              />
            </div>

            <p className="text-white/70 text-sm leading-relaxed text-center max-w-xs">
              Track inventory, manage sales, and grow your business — all from one clean dashboard.
            </p>

            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-white/10 w-full max-w-xs justify-center">
              {["Inventory", "Sales", "Reports"].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                  <span className="text-white/50 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#16213e] px-4 py-12">
          <div className="w-full max-w-sm">

            {/* Mobile brand */}
            <div className="flex flex-col items-center lg:hidden mb-8">
              <img src="/keel icon.png" alt="Keel" className="w-10 h-10 mb-3" />
              <h2 className="text-slate-900 dark:text-white font-bold text-xl">Keel</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your shop from one place</p>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block mb-7">
              <h1 className="text-slate-900 dark:text-white font-bold text-2xl tracking-tight">
                {mode === "check_email" ? "Check your email" : mode === "reset_password" ? "Reset your password" : mode === "reset_done" ? "Password updated" : mode === "signup" ? "Create Your Shop" : "Welcome back"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                {mode === "login"
                  ? "Sign in to manage your shop"
                  : mode === "signup"
                  ? "Set up your shop in seconds"
                  : mode === "check_email"
                  ? "We sent you an email with instructions"
                  : mode === "reset_done"
                  ? "You can now sign in with your new password"
                  : "Enter a new password for your account"}
              </p>
            </div>

            {/* Mobile heading */}
            <div className="text-center lg:hidden mb-6">
              <h2 className="text-slate-900 dark:text-white font-bold text-lg">
                {mode === "check_email" ? "Check your email" : mode === "reset_password" ? "Reset your password" : mode === "reset_done" ? "Password updated" : mode === "signup" ? "Create Your Shop" : "Welcome to Keel"}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                {mode === "login"
                  ? "Sign in to manage your shop"
                  : mode === "signup"
                  ? "Set up your shop in seconds"
                  : mode === "check_email"
                  ? "We sent you an email with instructions"
                  : mode === "reset_done"
                  ? "You can now sign in with your new password"
                  : "Enter a new password for your account"}
              </p>
            </div>

            {formContent}

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
              &copy; 2026 Keel by Framestudio
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
