import { createContext, useEffect, useState } from "react";
import { supabase, getPersistedSession, saveSession, authLogin, authLogout, parseHashParams, fetchUserData, STORAGE_KEY_EXPORTED } from "../lib/supabase";
import { clearShopId } from "../lib/shop";

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  needsSetup: false,
  login: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  completeSetup: () => {},
});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const hashData = parseHashParams();

      if (hashData?.type === "recovery") {
        setLoading(false);
        return;
      }

      if (hashData?.access_token) {
        try {
          window.history.replaceState(null, "", window.location.pathname);

          const userData = await fetchUserData(hashData.access_token);

          const fullSession = {
            access_token: hashData.access_token,
            refresh_token: hashData.refresh_token,
            expires_in: hashData.expires_in,
            user: userData,
          };

          saveSession(fullSession);

          if (!cancelled) {
            setUser(userData);
            setSession(fullSession);
          }

          await ensureUserRecordsInner(userData);
        } catch (err) {
          console.error("OAuth token exchange failed", err);
        }
      } else {
        const persisted = getPersistedSession();
        if (persisted && !cancelled) {
          setUser(persisted.user);
          setSession(persisted);
        }
      }

      if (!cancelled) setLoading(false);
    }

    initAuth();

    function handleStorageChange(e) {
      if (e.key === STORAGE_KEY_EXPORTED && !e.newValue) {
        setUser(null);
        setSession(null);
      }
    }
    window.addEventListener("storage", handleStorageChange);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  async function ensureUserRecordsInner(user) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, shop_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (existingUser) return true;

    const { data: existingByEmail } = await supabase
      .from("users")
      .select("id, shop_id")
      .eq("email", user.email)
      .maybeSingle();

    if (existingByEmail) {
      await supabase
        .from("users")
        .update({ auth_user_id: user.id })
        .eq("id", existingByEmail.id);
      return true;
    }

    const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "My Shop";
    const baseSlug = displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const suffix = Math.random().toString(36).slice(2, 6);
    const slug = `${baseSlug}-${suffix}`;

    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .insert({ name: displayName, slug, business_category: "general" })
      .select("id")
      .single();

    if (shopError || !shopData) return true;

    await supabase.from("store_settings").insert({
      shop_id: shopData.id,
      store_name: displayName,
      theme: "light",
    });

    await supabase.from("users").insert({
      auth_user_id: user.id,
      shop_id: shopData.id,
      name: displayName,
      email: user.email,
    });

    return false;
  }

  useEffect(() => {
    if (user) {
      ensureUserRecordsInner(user).then((needsSetup) => {
        if (!needsSetup) setNeedsSetup(true);
      }).catch(() => {});
    }
  }, [user]);

  async function login(email, password) {
    const data = await authLogin(email, password);
    setSession(data);
    setUser(data.user);
  }

  async function signInWithGoogle() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectTo = `${window.location.origin}/login`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  }

  async function logout() {
    const token = getPersistedSession()?.access_token;
    await authLogout(token);
    setSession(null);
    setUser(null);
    clearShopId();
  }

  function completeSetup() {
    setNeedsSetup(false);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, needsSetup, login, signInWithGoogle, logout, completeSetup }}>
      {children}
    </AuthContext.Provider>
  );
}
