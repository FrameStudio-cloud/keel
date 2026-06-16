import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AuthContext } from "../context/AuthContext";
import { FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const { login, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("This email is already registered. Try signing in instead.");

        const baseSlug = shopName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const suffix = Math.random().toString(36).slice(2, 6);
        const slug = `${baseSlug}-${suffix}`;

        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .insert({ name: shopName, slug, business_category: "general" })
          .select("id")
          .single();
        if (shopError) throw shopError;

        await supabase.from("store_settings").insert({
          shop_id: shopData.id,
          store_name: shopName,
          theme: "dark",
        });

        const { error: userError } = await supabase.from("users").insert({
          auth_user_id: authData.user.id,
          shop_id: shopData.id,
          name: shopName,
          email,
        });
        if (userError) throw userError;

        if (authData.session) {
          await login(email, password);
          navigate("/setup", { replace: true });
        } else {
          setMode("check_email");
        }
      }
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
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMode("check_email");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h2 className="text-slate-900 dark:text-white font-bold text-lg">
            {mode === "check_email" ? "Check your email" : mode === "signup" ? "Create Your Shop" : "Welcome to Keel"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {mode === "login"
              ? "Sign in to manage your shop"
              : mode === "signup"
              ? "Set up your shop in seconds"
              : "We sent you an email with instructions"}
          </p>
        </div>

        {mode === "check_email" ? (
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

            {mode !== "check_email" && (
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

            <div className="text-center mt-4">
              <button
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {mode === "login" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
