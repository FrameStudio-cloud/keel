import { createContext, useEffect, useState } from "react";
import { supabase, getPersistedSession, authLogin, authLogout } from "../lib/supabase";
import { clearShopId } from "../lib/shop";

const initialSession = getPersistedSession();

export const AuthContext = createContext({
  user: null,
  session: null,
  needsSetup: false,
  login: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  completeSetup: () => {},
});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(initialSession?.user ?? null);
  const [session, setSession] = useState(initialSession ?? null);
  const [needsSetup, setNeedsSetup] = useState(false);

  async function ensureUserRecords(user) {
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
      ensureUserRecords(user).then((needsSetup) => {
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
    <AuthContext.Provider value={{ user, session, needsSetup, login, signInWithGoogle, logout, completeSetup }}>
      {children}
    </AuthContext.Provider>
  );
}
