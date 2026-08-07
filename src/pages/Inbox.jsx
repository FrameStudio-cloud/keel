import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiMessageCircle, FiSmartphone, FiArrowRight, FiEye, FiX } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import ProPanel from "../components/ProPanel";
import { isFeatureAccessible } from "../lib/tiers";
import { useSettings } from "../hooks/useSettings";
import { useToast } from "../context/ToastProvider";
import ConversationList from "../components/inbox/ConversationList";
import ConversationView from "../components/inbox/ConversationView";
import {
  useWhatsAppConfig,
  useWhatsAppConversations,
  useWhatsAppMessages,
  useSendWhatsAppReply,
  useSetConversationMode,
  useMarkConversationRead,
} from "../hooks/useWhatsAppInbox";

const now = () => Date.now();
const ago = (min) => new Date(now() - min * 60_000).toISOString();

const DEMO_CONVERSATIONS = [
  {
    id: "demo-1",
    customer_phone: "254712345678",
    customer_name: "Amina Wanjiru",
    mode: "auto",
    last_message_at: ago(4),
    last_message_preview: "Great, and does it come in the floral pattern too?",
    unread_count: 2,
  },
  {
    id: "demo-2",
    customer_phone: "254798765432",
    customer_name: "Brian Otieno",
    mode: "human",
    last_message_at: ago(22),
    last_message_preview: "Okay, I'll send the M-Pesa code now",
    unread_count: 0,
  },
  {
    id: "demo-3",
    customer_phone: "254733221100",
    customer_name: null,
    mode: "auto",
    last_message_at: ago(65),
    last_message_preview: "Thanks!",
    unread_count: 1,
  },
];

const DEMO_MESSAGES = {
  "demo-1": [
    { id: "d1-1", direction: "inbound", sender: "customer", body: "Hi! Do you have the red dress in size M?", created_at: ago(9) },
    { id: "d1-2", direction: "outbound", sender: "bot", body: "Yes we do! The red dress in size M is KSh 2,500 • 5 in stock.\n\nWant more details? Just ask!", created_at: ago(8) },
    { id: "d1-3", direction: "inbound", sender: "customer", body: "Great, and does it come in the floral pattern too?", created_at: ago(4) },
  ],
  "demo-2": [
    { id: "d2-1", direction: "inbound", sender: "customer", body: "I'd like to order the Bluetooth speaker", created_at: ago(40) },
    { id: "d2-2", direction: "outbound", sender: "bot", body: "The JBL Go 3 is KSh 3,999 • 8 in stock.\n\nWant more details? Just ask!", created_at: ago(39) },
    { id: "d2-3", direction: "inbound", sender: "customer", body: "Can I talk to a real person please?", created_at: ago(38) },
    { id: "d2-4", direction: "outbound", sender: "bot", body: "A member of our team will reply to you shortly. Thanks for reaching out!", created_at: ago(37) },
    { id: "d2-5", direction: "outbound", sender: "shop", body: "Hi Brian, this is Keel. I've put the speaker aside for you — send the M-Pesa and I'll confirm.", created_at: ago(30) },
    { id: "d2-6", direction: "inbound", sender: "customer", body: "Okay, I'll send the M-Pesa code now", created_at: ago(22) },
  ],
  "demo-3": [
    { id: "d3-1", direction: "inbound", sender: "customer", body: "What time do you close on Saturdays?", created_at: ago(68) },
    { id: "d3-2", direction: "outbound", sender: "bot", body: "Our opening hours:\nMon: 08:00 – 17:00\nTue: 08:00 – 17:00\nWed: 08:00 – 17:00\nThu: 08:00 – 17:00\nFri: 08:00 – 17:00\nSat: 09:00 – 14:00\nSun: Closed", created_at: ago(67) },
    { id: "d3-3", direction: "inbound", sender: "customer", body: "Thanks!", created_at: ago(65) },
  ],
};

function InboxGrid({
  conversations,
  selectedId,
  onSelect,
  selected,
  messages,
  onSend,
  sending,
  onTakeover,
  onResume,
  onBack,
  listLoading,
  onExitDemo,
}) {
  return (
    <div className="h-full flex flex-col md:p-5">
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[320px_1fr] md:max-w-6xl md:mx-auto md:w-full md:rounded-2xl md:border md:border-border-subtle md:bg-surface-1 md:shadow-sm md:overflow-hidden">
        <aside className={`min-h-0 bg-surface-1 md:bg-transparent overflow-y-auto md:border-r md:border-border-subtle md:dark:border-white/5 ${selected ? "hidden md:block" : "block"}`}>
          <div className="px-4 py-3.5 border-b border-border-subtle dark:border-white/5 flex items-center justify-between gap-2 sticky top-0 bg-surface-1 z-10">
            <p className="text-base font-bold text-text-primary tracking-tight">Chats</p>
            <div className="flex items-center gap-2 shrink-0">
              {onExitDemo && (
                <button
                  type="button"
                  onClick={onExitDemo}
                  className="flex items-center gap-1 text-[11px] font-semibold text-text-muted border border-border-subtle rounded-full px-2.5 py-1 hover:bg-surface-2 dark:hover:bg-white/5 transition-colors"
                >
                  <FiX size={11} />
                  Exit preview
                </button>
              )}
              <span className="text-[11px] text-text-faint bg-surface-2 dark:bg-white/5 rounded-full px-2 py-0.5">{conversations?.length || 0}</span>
            </div>
          </div>
          {listLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-surface-2 dark:bg-white/5 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-surface-2 dark:bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-surface-2 dark:bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations || []}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          )}
        </aside>
        <div className={`h-full min-h-0 ${selected ? "block" : "hidden md:block"}`}>
          <ConversationView
            conversation={selected}
            messages={messages}
            onSend={onSend}
            sending={sending}
            onTakeover={onTakeover}
            onResume={onResume}
            onBack={onBack}
          />
        </div>
      </div>
    </div>
  );
}

export default function Inbox() {
  const { showToast } = useToast();
  const { planTier } = useSettings();
  const [selectedId, setSelectedId] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoConvos, setDemoConvos] = useState(DEMO_CONVERSATIONS);
  const [demoMessages, setDemoMessages] = useState(DEMO_MESSAGES);

  const { data: config, isLoading: configLoading } = useWhatsAppConfig();
  const { data: conversations, isLoading: convLoading } = useWhatsAppConversations();

  const connected = config?.whatsapp_status === "connected";
  const demoEnabled = demoMode && !connected;

  const selected = demoEnabled
    ? demoConvos.find((c) => c.id === selectedId) || null
    : conversations?.find((c) => c.id === selectedId) || null;

  const messagesQuery = useWhatsAppMessages(selected?.id);
  const sendMutation = useSendWhatsAppReply();
  const modeMutation = useSetConversationMode();
  const markRead = useMarkConversationRead();

  useEffect(() => {
    if (!demoEnabled && selected?.unread_count > 0 && !markRead.isPending) {
      markRead.mutate(selected.id);
    }
  }, [demoEnabled, selected?.id, selected?.unread_count]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isFeatureAccessible("whatsapp_bot", planTier)) {
    return (
      <PageLayout title="Inbox" flush>
        <ProPanel feature="whatsapp_bot" />
      </PageLayout>
    );
  }

  function handleSelect(id) {
    setSelectedId(id);
    if (demoEnabled) {
      setDemoConvos((prev) => prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)));
    }
  }

  async function handleSend(msg) {
    if (!selected) return;
    const body = typeof msg === "string" ? msg : (msg.body || "");
    const image_url = typeof msg === "string" ? undefined : msg.image_url;
    const caption = typeof msg === "string" ? undefined : msg.caption;
    if (demoEnabled) {
      const preview = image_url ? (caption || "Photo") : body;
      setDemoMessages((prev) => ({
        ...prev,
        [selected.id]: [
          ...(prev[selected.id] || []),
          {
            id: `dm-${Date.now()}`,
            direction: "outbound",
            sender: "shop",
            body: body || caption || "",
            media_url: image_url,
            created_at: new Date().toISOString(),
          },
        ],
      }));
      setDemoConvos((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? { ...c, last_message_preview: preview.slice(0, 80), last_message_at: new Date().toISOString() }
            : c,
        ),
      );
      showToast(image_url ? "Demo mode — connect a real number to actually send" : "Demo mode — connect a real number to actually chat");
      return;
    }
    try {
      await sendMutation.mutateAsync({ customer_phone: selected.customer_phone, body, image_url, caption });
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  function setDemoConversationMode(mode) {
    setDemoConvos((prev) => prev.map((c) => (c.id === selected.id ? { ...c, mode } : c)));
    showToast(
      mode === "human"
        ? "You're now handling this chat (demo)"
        : "The bot will answer this chat again (demo)",
    );
  }

  async function handleTakeover() {
    if (!selected) return;
    if (demoEnabled) {
      setDemoConversationMode("human");
      return;
    }
    try {
      await modeMutation.mutateAsync({ conversation_id: selected.id, mode: "human" });
      showToast("You're now handling this chat");
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  async function handleResume() {
    if (!selected) return;
    if (demoEnabled) {
      setDemoConversationMode("auto");
      return;
    }
    try {
      await modeMutation.mutateAsync({ conversation_id: selected.id, mode: "auto" });
      showToast("The bot will answer this chat again");
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  return (
    <PageLayout title="Inbox" flush>
      <Helmet><title>Inbox - Keel</title></Helmet>

      {configLoading ? (
        <div className="max-w-6xl mx-auto space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-2 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : demoEnabled ? (
        <InboxGrid
          conversations={demoConvos}
          selectedId={selectedId}
          onSelect={handleSelect}
          selected={selected}
          messages={selected ? demoMessages[selected.id] || [] : []}
          onSend={handleSend}
          sending={false}
          onTakeover={handleTakeover}
          onResume={handleResume}
          onBack={() => setSelectedId(null)}
          listLoading={false}
          onExitDemo={() => setDemoMode(false)}
        />
      ) : connected ? (
        <InboxGrid
          conversations={conversations || []}
          selectedId={selectedId}
          onSelect={handleSelect}
          selected={selected}
          messages={messagesQuery.data}
          onSend={handleSend}
          sending={sendMutation.isPending}
          onTakeover={handleTakeover}
          onResume={handleResume}
          onBack={() => setSelectedId(null)}
          listLoading={convLoading}
        />
      ) : (
        <div className="h-full flex items-center justify-center p-5 sm:p-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-strong w-full max-w-2xl p-6 sm:p-10 text-white shadow-xl shadow-brand/10">
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10" />
            <div className="absolute -right-2 top-20 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute right-28 -bottom-20 w-48 h-48 rounded-full bg-white/10" />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-5 shadow-inner">
                <FiSmartphone size={26} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">Connect WhatsApp first</h2>
              <p className="text-sm text-white/85 mt-2 max-w-md leading-relaxed">
                To chat with customers here, connect a WhatsApp number as your business line. It takes about a minute.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/integrations/whatsapp-bot"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-brand-strong font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-px transition-all"
                >
                  <FiMessageCircle size={15} />
                  Connect my WhatsApp number
                  <FiArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setDemoConvos(DEMO_CONVERSATIONS);
                    setDemoMessages(DEMO_MESSAGES);
                    setDemoMode(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/15 backdrop-blur text-white font-semibold text-sm rounded-xl border border-white/20 hover:bg-white/25 transition-all"
                >
                  <FiEye size={15} />
                  Preview the inbox
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
