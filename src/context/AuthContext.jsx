import { createContext, useEffect, useRef, useState } from "react";
import { supabase, getPersistedSession, saveSession, authLogin, authLogout, parseHashParams, fetchUserData, STORAGE_KEY_EXPORTED } from "../lib/supabase";
import { clearShopId } from "../lib/shop";
import posthog from "../lib/posthog";

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  needsSetup: false,
  login: async () => {},
  setupSignup: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  completeSetup: () => {},
});

export default function AuthProvider({ children }) {
  const ensuringRef = useRef(false);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const hashData = parseHashParams();

      if (hashData?.type === "recovery") {
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
          } catch (err) {
            console.error("Recovery token exchange failed", err);
          }
        }
        if (!cancelled) setLoading(false);
        return;
      }

      if (hashData?.access_token) {
        try {
          window.history.replaceState(null, "", window.location.pathname);

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("OAuth exchange timed out")), 15000)
          );
          const userData = await Promise.race([fetchUserData(hashData.access_token), timeoutPromise]);

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

    if (existingUser) {
      const { data: shop } = await supabase
        .from("shops")
        .select("setup_completed_at")
        .eq("id", existingUser.shop_id)
        .maybeSingle();
      return !!shop?.setup_completed_at;
    }

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
      const { data: shop } = await supabase
        .from("shops")
        .select("setup_completed_at")
        .eq("id", existingByEmail.shop_id)
        .maybeSingle();
      return !!shop?.setup_completed_at;
    }

    const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "My Shop";
    const baseSlug = displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    let slug;
    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.random().toString(36).slice(2, 8);
      slug = `${baseSlug}-${suffix}`;
      const { data: existing } = await supabase.from("shops").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
    }

    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .insert({ name: displayName, slug, business_category: "general", setup_completed_at: null, subscription_expires_at: new Date(Date.now() + 30 * 86400000).toISOString() })
      .select("id")
      .single();

    if (shopError || !shopData) return true;

    const results = await Promise.allSettled([
      supabase.from("store_settings").insert({
        shop_id: shopData.id,
        store_name: displayName,
        theme: "light",
      }),
      supabase.from("chat_config").upsert({
        shop_id: shopData.id,
        enabled: true,
        welcome_message: "Hi! How can we help you today?",
        widget_color: "#3B82F6",
        position: "right",
        whatsapp_number: "",
      }, { onConflict: "shop_id" }),
      supabase.from("users").insert({
        auth_user_id: user.id,
        shop_id: shopData.id,
        name: displayName,
        email: user.email,
      }),
    ]);

    const failed = results.find(r => r.status === "rejected");
    if (failed) {
      await supabase.from("shops").delete().eq("id", shopData.id);
      return true;
    }

    const payload = { email: user.email, store_name: displayName, shop_id: shopData.id };
    supabase.functions.invoke("subscribe-contact", {
      body: { ...payload, unsubscribed: false },
    }).catch(() => {});
    supabase.functions.invoke("send-welcome-email", {
      body: payload,
    }).catch(() => {});

    return false;
  }

  useEffect(() => {
      if (user) {
        posthog.identify(user.id, {
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
        });
        if (!ensuringRef.current) {
          ensuringRef.current = true;
          ensureUserRecordsInner(user).then((needsSetup) => {
            if (!needsSetup) setNeedsSetup(true);
            ensuringRef.current = false;
          }).catch(() => { ensuringRef.current = false; });
        }
      }
  }, [user]);

  async function login(email, password) {
    const data = await authLogin(email, password);
    setSession(data);
    setUser(data.user);
  }

  async function setupSignup(sessionData) {
    saveSession(sessionData);
    setSession(sessionData);
    setUser(sessionData.user);
    setNeedsSetup(true);
  }

  async function signInWithGoogle() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectTo = `${window.location.origin}/login`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  }

  async function logout() {
    try {
      const token = getPersistedSession()?.access_token;
      await authLogout(token);
    } catch {
      /* session cleared locally even if server request fails */
    }
    posthog.reset();
    setSession(null);
    setUser(null);
    clearShopId();
  }

  function completeSetup() {
    setNeedsSetup(false);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, needsSetup, login, setupSignup, signInWithGoogle, logout, completeSetup }}>
      {children}
    </AuthContext.Provider>
  );
}
