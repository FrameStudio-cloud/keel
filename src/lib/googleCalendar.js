import { supabase } from "./supabase";
import { getShopId } from "./shop";

let cachedStatus = null;

export async function getCalendarStatus() {
  if (cachedStatus !== null) return cachedStatus;
  const shopId = await getShopId();
  if (!shopId) return null;
  const { data } = await supabase
    .from("google_integrations")
    .select("google_email, updated_at")
    .eq("shop_id", shopId)
    .maybeSingle();
  cachedStatus = data || null;
  return cachedStatus;
}

export function clearCalendarCache() {
  cachedStatus = null;
}

export function getConnectUrl() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  const redirectUri = `${new URL(supabaseUrl).origin}/functions/v1/google-calendar`;
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar.events")}&access_type=offline&prompt=consent&state=`;
}

export async function createCalendarEvent({ title, description, startTime, endTime, orderId }) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop");
  const { data, error } = await supabase.functions.invoke("google-calendar", {
    body: {
      action: "create-event",
      shop_id: shopId,
      order_id: orderId,
      title,
      description,
      start_time: startTime,
      end_time: endTime || startTime,
    },
  });
  if (error) throw new Error(error.message);
  if (!data.success) throw new Error(data.error || "Failed to create event");
  return data;
}

export async function updateCalendarEvent({ eventId, title, description, startTime, endTime, orderId }) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop");
  const { data, error } = await supabase.functions.invoke("google-calendar", {
    body: {
      action: "update-event",
      shop_id: shopId,
      order_id: orderId,
      event_id: eventId,
      title,
      description,
      start_time: startTime,
      end_time: endTime || startTime,
    },
  });
  if (error) throw new Error(error.message);
  if (!data.success) throw new Error(data.error || "Failed to update event");
  return data;
}

export async function deleteCalendarEvent(eventId) {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop");
  const { data, error } = await supabase.functions.invoke("google-calendar", {
    body: { action: "delete-event", shop_id: shopId, event_id: eventId },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function disconnectCalendar() {
  const shopId = await getShopId();
  if (!shopId) throw new Error("No shop");
  const { error } = await supabase
    .from("google_integrations")
    .delete()
    .eq("shop_id", shopId);
  if (error) throw new Error(error.message);
  cachedStatus = null;
}
