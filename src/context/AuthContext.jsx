import { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { clearShopId } from "../lib/shop";

function getPersistedSession() {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({
  user: null,
  session: null,
  needsSetup: false,
  login: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  completeSetup: () => {},
});

const initialSession = getPersistedSession();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(initialSession?.user ?? null);
  const [session, setSession] = useState(initialSession ?? null);
  const [needsSetup, setNeedsSetup] = useState(false);

  async function ensureUserRecords(user) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (existingUser) return true;

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
      theme: "dark",
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
      ensureUserRecords(user).then((needsSetup) => {
        if (!needsSetup) setNeedsSetup(true);
      }).catch(() => {});
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        if (session.user) setUser(session.user);
      }
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (event === "SIGNED_IN" && session?.user) {
          if (!(await ensureUserRecords(session.user))) {
            setNeedsSetup(true);
          }
        }

        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
    clearShopId();
  }

  function completeSetup() {
    setNeedsSetup(false);
  }

  return (
    <AuthContext.Provider value={{ user, session, needsSetup, login, signInWithGoogle, logout, completeSetup }}>
      {children}
    </AuthContext.Provider>
  );
}
