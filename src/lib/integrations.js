import {
  FiMessageCircle, FiCalendar, FiZap, FiSend, FiSmartphone,
  FiRepeat, FiCheckCircle, FiUsers,
} from "react-icons/fi";
import { FaTelegram, FaFacebookMessenger, FaTiktok } from "react-icons/fa";
import { supabase } from "./supabase";
import { getShopId } from "./shop";
import { getCalendarStatus } from "./googleCalendar";
import WhatsAppBotCard from "../components/integrations/WhatsAppBotCard";
import GoogleCalendarCard from "../components/integrations/GoogleCalendarCard";
import WhatsAppMockup from "../components/integrations/WhatsAppMockup";

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
    category: "Communication",
    icon: FiMessageCircle,
    tileClass: "from-green-500 to-emerald-600",
    tier: "whatsapp_bot",
    featured: true,
    component: WhatsAppBotCard,
    preview: WhatsAppMockup,
    getStatus: whatsappStatus,
    benefits: [
      { icon: FiMessageCircle, title: "Instant Auto-Replies", desc: "Answer customers on WhatsApp 24/7 without lifting a finger" },
      { icon: FiZap,           title: "Live Inventory Answers", desc: "Share real prices and stock straight from your catalogue" },
      { icon: FiSend,          title: "Trilingual Replies", desc: "Understands English, Swahili and Sheng — automatically" },
      { icon: FiSmartphone,    title: "Runs on Your Number", desc: "No extra app — the bot lives on your existing WhatsApp number" },
    ],
    steps: [
      { title: "Get a number that isn't on WhatsApp", desc: "Any number that's never been registered on the WhatsApp app works — a spare SIM is easiest. Meta won't accept a number already linked to WhatsApp." },
      { title: "Add your WhatsApp number", desc: "We'll send a 6-digit code by SMS or voice call to confirm it's yours." },
      { title: "Enter the code", desc: "Verify it and your bot goes live in seconds — no setup after that." },
      { title: "Customers message you", desc: "They get instant answers about your products, prices, delivery and hours." },
    ],
    faq: [
      { q: "Will my number still work in the WhatsApp app?", variant: "danger", a: "No — and that's the one thing to know before you start. Once your number is connected to Keel, it's registered for use with your shop only: you won't be able to open it in the WhatsApp app on your phone again. Use a number you don't need for personal WhatsApp, or get a cheap SIM for your shop." },
      { q: "Do I need a separate number?", a: "It's the safest way. Any number that's never been used on WhatsApp works — a cheap prepaid SIM is perfect. To your customers it looks and behaves like any normal WhatsApp number." },
      { q: "What can the bot answer?", a: "Product names, prices, stock, opening hours, location, delivery info, and any FAQs you've added to your chat widget. It reads straight from your inventory, so answers are always live." },
      { q: "Are there limits from Meta?", a: "Replying to customers who message you is always unlimited — no daily cap. The only limit is on broadcasts where you reach out to customers first: you start at 250 unique customers per day, and Meta raises that automatically as your business gets verified and your messages get good responses." },
      { q: "Does it cost anything extra?", a: "The bot is included with your Pro plan. Meta may charge per message after your free monthly allowance runs out — you'll see those charges from Meta directly." },
      { q: "Can I pause or disconnect it?", a: "Yes. Use the toggle to pause the bot, or Disconnect to remove the number entirely. Pausing keeps your number connected but stops auto-replies." },
    ],
    goals: [
      { id: "answer_product_questions", label: "Answer questions about my products" },
      { id: "order_updates", label: "Send order updates to customers" },
      { id: "promotions", label: "Share promotions and announcements" },
      { id: "bookings", label: "Take bookings or service appointments" },
      { id: "hours_info", label: "Share business hours and location" },
    ],
  },
  {
    slug: "google-calendar",
    name: "Google Calendar",
    tagline: "Sync service orders to your Google Calendar",
    category: "Productivity",
    icon: FiCalendar,
    tileClass: "from-blue-500 to-indigo-600",
    tier: null,
    component: GoogleCalendarCard,
    getStatus: googleCalendarStatus,
    benefits: [
      { icon: FiCalendar,    title: "Auto-Schedule Appointments", desc: "Each service order you schedule creates a calendar event automatically" },
      { icon: FiRepeat,      title: "Always In Sync", desc: "Schedule a job and it shows up in Google Calendar instantly — no retyping" },
      { icon: FiCheckCircle, title: "No Double-Booking", desc: "See your booked slots at a glance so you never overbook a day" },
      { icon: FiUsers,       title: "Team-Friendly", desc: "Everyone who shares your calendar sees the day's service jobs" },
    ],
    steps: [
      { title: "Connect your Google account", desc: "We only request access to calendar events — never your mail or contacts." },
      { title: "Schedule a service order", desc: "Turn on 'Sync to Google Calendar' on the order form and pick a date and time." },
      { title: "It lands in your calendar", desc: "The event appears instantly, and edits to the order stay in sync." },
    ],
    faq: [
      { q: "What permissions do you need?", a: "Only calendar.events — the narrowest scope Google offers. We never read your mail, contacts, or other calendar details." },
      { q: "Which orders get synced?", a: "Service orders with the 'Sync to Google Calendar' toggle enabled. Regular sales don't create events." },
      { q: "Can I disconnect?", a: "Yes, from this page. Events already synced stay on your calendar — we only remove the connection." },
      { q: "Who can see the events?", a: "Only people you've shared your calendar with. Events are created on your own Google Calendar." },
    ],
    goals: [
      { id: "appointments", label: "Schedule service appointments" },
      { id: "avoid_double_booking", label: "Avoid double-bookings" },
      { id: "team_visibility", label: "Keep my team on the same calendar" },
      { id: "no_shows", label: "Reduce missed appointments" },
    ],
  },
];

export function getIntegration(slug) {
  return INTEGRATIONS.find((i) => i.slug === slug) || null;
}

export const COMING_SOON = [
  {
    name: "Telegram Bot",
    tagline: "Answer customers on Telegram with the same smart bot",
    category: "Communication",
    icon: FaTelegram,
    tileClass: "from-sky-500 to-blue-600",
  },
  {
    name: "Facebook Messenger",
    tagline: "Auto-reply to messages from your Facebook page",
    category: "Communication",
    icon: FaFacebookMessenger,
    tileClass: "from-indigo-500 to-blue-600",
  },
  {
    name: "TikTok Shop",
    tagline: "Bring your catalogue to TikTok and sell in video",
    category: "Commerce",
    icon: FaTiktok,
    tileClass: "from-slate-800 to-black",
  },
];

export async function getIntegrationStatus(integration) {
  const shopId = await getShopId();
  try {
    const status = await integration.getStatus({ shopId });
    return { connected: !!status?.connected, locked: false };
  } catch {
    return { connected: false, locked: false };
  }
}
