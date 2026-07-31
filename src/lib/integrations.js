import { FiMessageCircle, FiCalendar } from "react-icons/fi";
import { supabase } from "./supabase";
import { getShopId } from "./shop";
import { getCalendarStatus } from "./googleCalendar";
import WhatsAppBotCard from "../components/integrations/WhatsAppBotCard";
import GoogleCalendarCard from "../components/integrations/GoogleCalendarCard";

async function whatsappStatus({ shopId }) {
  if (!shopId) return { connected: false };
  const { data } = await supabase
    .from("chat_config")
    .select("whatsapp_status")
    .eq("shop_id", shopId)
    .maybeSingle();
  return { connected: data?.whatsapp_status === "connected" };
}

async function googleCalendarStatus() {
  const status = await getCalendarStatus();
  return { connected: !!status };
}

export const INTEGRATIONS = [
  {
    slug: "whatsapp-bot",
    name: "WhatsApp Bot",
    tagline: "Auto-replies to customers on your WhatsApp number",
    icon: FiMessageCircle,
    tileClass: "from-green-500 to-emerald-600",
    tier: "whatsapp_bot",
    component: WhatsAppBotCard,
    getStatus: whatsappStatus,
  },
  {
    slug: "google-calendar",
    name: "Google Calendar",
    tagline: "Sync service orders to your Google Calendar",
    icon: FiCalendar,
    tileClass: "from-blue-500 to-indigo-600",
    tier: null,
    component: GoogleCalendarCard,
    getStatus: googleCalendarStatus,
  },
];

export function getIntegration(slug) {
  return INTEGRATIONS.find((i) => i.slug === slug) || null;
}

export async function getIntegrationStatus(integration) {
  const shopId = await getShopId();
  try {
    const status = await integration.getStatus({ shopId });
    return { connected: !!status?.connected, locked: false };
  } catch {
    return { connected: false, locked: false };
  }
}
