import { FiMessageCircle, FiUser } from "react-icons/fi";
import { formatPhone, timeLabel } from "../../lib/whatsappInbox";

export default function ConversationList({ conversations, selectedId, onSelect }) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-14 h-14 rounded-full bg-brand-muted border border-brand-soft dark:border-blue-500/20 flex items-center justify-center mb-3">
          <FiMessageCircle size={22} className="text-brand" />
        </div>
        <p className="text-sm font-semibold text-text-primary">No chats yet</p>
        <p className="text-xs text-text-muted mt-1 max-w-[220px] leading-relaxed">
          When customers message your WhatsApp number, their chats appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((c) => {
        const active = c.id === selectedId;
        const name = c.customer_name || formatPhone(c.customer_phone);
        const unread = c.unread_count || 0;
        const preview = c.last_message_preview || "No messages yet";
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border-subtle dark:border-white/5 border-l-[3px] transition-colors ${
              active
                ? "bg-brand-muted dark:bg-white/[0.04] border-l-brand"
                : "border-l-transparent hover:bg-surface-2 dark:hover:bg-white/[0.03]"
            }`}
          >
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br from-brand to-brand-strong text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${active ? "ring-2 ring-brand-soft" : ""}`}>
              {name.charAt(0).toUpperCase() || <FiUser size={15} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm truncate font-semibold ${active ? "text-brand" : "text-text-primary"}`}>{name}</p>
                <span className="text-[11px] text-text-faint shrink-0">{timeLabel(c.last_message_at)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className={`text-[13px] truncate ${unread > 0 ? "text-text-body font-medium" : "text-text-muted"}`}>
                  {c.mode === "human" && <span className="text-warning font-semibold">You: </span>}
                  {preview}
                </p>
                {unread > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
