import { getPersistedSession } from "./supabase";

export function provisionerHeaders() {
  const session = getPersistedSession();
  const token = session?.access_token || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
