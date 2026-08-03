import { useState, useEffect, useRef, useMemo } from "react";
import {
  FiSend, FiUser, FiCpu, FiUserCheck, FiRotateCcw, FiClock, FiMessageCircle, FiArrowLeft,
  FiPackage, FiFileText, FiZap, FiShoppingBag, FiX,
} from "react-icons/fi";
import { formatPhone, timeLabel } from "../../lib/whatsappInbox";
import { suggestAction } from "../../lib/inboxSmart";
import { useShopProducts } from "../../hooks/useWhatsAppInbox";
import ProductPickerModal from "./ProductPickerModal";
import SendReceiptModal from "./SendReceiptModal";
import LogOrderModal from "./LogOrderModal";
import QuickRepliesPanel from "./QuickRepliesPanel";

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-semibold text-text-muted border border-border-subtle rounded-full px-2.5 py-1.5 hover:text-brand hover:bg-surface-2 dark:hover:bg-white/5 transition-colors"
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

export default function ConversationView({
  conversation,
  messages,
  onSend,
  sending,
  onTakeover,
  onResume,
  onBack,
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);
  const { data: products } = useShopProducts();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [logOrderOpen, setLogOrderOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  const [prevConvId, setPrevConvId] = useState(conversation?.id);
  if (prevConvId !== conversation?.id) {
    setPrevConvId(conversation?.id);
    setDraft("");
    setPickerOpen(false);
    setPickerSearch("");
    setReceiptOpen(false);
    setLogOrderOpen(false);
    setQuickOpen(false);
    setSuggestionDismissed(false);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, conversation?.id]);

  const suggestion = useMemo(() => {
    const lastInbound = [...(messages || [])].reverse().find((m) => m.direction === "inbound");
    if (!lastInbound) return null;
    return suggestAction(lastInbound.body, products || []);
  }, [messages, products]);

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-surface-2 dark:bg-white/5 flex items-center justify-center mb-3">
          <FiMessageCircle size={24} className="text-text-faint" />
        </div>
        <p className="text-sm font-semibold text-text-muted">Select a chat</p>
        <p className="text-xs text-text-faint mt-1">Pick a chat on the left to start replying.</p>
      </div>
    );
  }

  const name = conversation.customer_name || formatPhone(conversation.customer_phone);
  const isHuman = conversation.mode === "human";

  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setDraft("");
    await onSend(body);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* header */}
      <div className="px-5 py-3 border-b border-border-subtle dark:border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="md:hidden shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:bg-surface-2 dark:hover:bg-white/5 transition-colors"
            aria-label="Back to chats"
          >
            <FiArrowLeft size={16} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-strong text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{name}</p>
            {isHuman ? (
              <p className="text-[11px] text-text-muted truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                You're chatting
              </p>
            ) : (
              <p className="text-[11px] text-text-faint truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-soft shrink-0" />
                Bot is answering
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isHuman ? (
            <button
              type="button"
              onClick={onResume}
              disabled={sending}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand border border-brand-soft dark:border-blue-500/20 rounded-lg px-3 py-1.5 hover:bg-brand-muted transition-colors disabled:opacity-50"
            >
              <FiRotateCcw size={12} />
              Let the bot handle it
            </button>
          ) : (
            <button
              type="button"
              onClick={onTakeover}
              disabled={sending}
              className="flex items-center gap-1.5 text-xs font-semibold text-warning border border-warning rounded-lg px-3 py-1.5 hover:bg-warning-muted transition-colors disabled:opacity-50"
            >
              <FiUserCheck size={12} />
              Take over chat
            </button>
          )}
        </div>
      </div>

      {/* thread */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-surface-0 dark:bg-transparent bg-[radial-gradient(60%_40%_at_50%_0%,color-mix(in_oklab,var(--color-brand)_6%,transparent),transparent_100%)]">
        <div className="flex flex-col gap-3 min-h-full justify-end">
          {!messages || messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-text-faint">No messages in this chat yet.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isInbound = m.direction === "inbound";
              const sender = m.sender || (isInbound ? "customer" : "shop");
              return (
                <div key={m.id} className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    isInbound
                      ? "bg-surface-1 border border-border-subtle text-text-primary rounded-tl-md"
                      : sender === "bot"
                        ? "bg-brand-muted border border-brand-soft dark:border-blue-500/20 text-text-primary rounded-tr-md"
                        : "bg-brand text-white rounded-tr-md"
                  }`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {sender === "bot" ? (
                        <>
                          <FiCpu size={11} className="text-brand" />
                          <span className="text-[10px] font-semibold text-brand uppercase tracking-wide">Bot</span>
                        </>
                      ) : sender === "shop" ? (
                        <>
                          <FiUserCheck size={11} className="text-white/70" />
                          <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">You</span>
                        </>
                      ) : (
                        <>
                          <FiUser size={11} className="text-text-faint" />
                          <span className="text-[10px] font-semibold text-text-faint uppercase tracking-wide">Customer</span>
                        </>
                      )}
                    </div>
                    {m.media_url && (
                      <img
                        src={m.media_url}
                        alt={m.body || "Photo"}
                        loading="lazy"
                        className="w-56 max-w-full rounded-lg object-cover mb-1.5"
                      />
                    )}
                    {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                    <p className={`text-[10px] mt-1 ${isInbound ? "text-text-faint" : "text-white/60"}`}>{timeLabel(m.created_at)}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* smart suggestion */}
      {suggestion && !suggestionDismissed && (
        <div className="px-3 pb-1.5">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-soft bg-brand-muted px-3 py-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <FiZap size={13} className="text-brand shrink-0" />
              <span className="text-xs text-text-body truncate">
                {suggestion.kind === "product"
                  ? `Send "${suggestion.label}"?`
                  : "Looks like an order request"}
              </span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPickerSearch(suggestion.product?.name || "");
                  setPickerOpen(true);
                }}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Send product
              </button>
              {suggestion.kind === "order" && (
                <button
                  type="button"
                  onClick={() => setLogOrderOpen(true)}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Log order
                </button>
              )}
              <button
                type="button"
                onClick={() => setSuggestionDismissed(true)}
                className="text-text-faint hover:text-text-muted"
                aria-label="Dismiss suggestion"
              >
                <FiX size={13} />
              </button>
            </span>
          </div>
        </div>
      )}

      {/* reply box */}
      <div className="border-t border-border-subtle dark:border-white/5 p-3 bg-surface-1 md:bg-transparent">
        {isHuman ? (
          <>
            <div className="px-1 pb-1.5 flex flex-wrap items-center gap-1.5">
              <ActionButton icon={FiPackage} label="Products" onClick={() => { setPickerSearch(""); setPickerOpen(true); }} />
              <ActionButton icon={FiFileText} label="Receipt" onClick={() => setReceiptOpen(true)} />
              <ActionButton icon={FiZap} label="Quick replies" onClick={() => setQuickOpen(true)} />
              <ActionButton icon={FiShoppingBag} label="Log order" onClick={() => setLogOrderOpen(true)} />
            </div>
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Type a message..."
                className="flex-1 resize-none bg-surface-1 border border-border-subtle rounded-full px-4 py-2.5 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors max-h-32"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !draft.trim()}
                className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-brand text-white hover:bg-brand-strong transition-all disabled:opacity-40 shadow-sm"
                aria-label="Send message"
              >
                <FiSend size={15} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs text-text-faint bg-surface-2 dark:bg-white/5 rounded-xl px-3.5 py-3">
            <FiClock size={13} />
            <span>
              The bot is answering this chat automatically.{" "}
              <button type="button" onClick={onTakeover} className="text-brand font-semibold hover:underline">
                Take over
              </button>{" "}
              to reply personally.
            </span>
          </div>
        )}
      </div>

      {/* modals */}
      {pickerOpen && (
        <ProductPickerModal
          onClose={() => setPickerOpen(false)}
          onSend={onSend}
          initialSearch={pickerSearch}
          sending={sending}
        />
      )}
      {receiptOpen && <SendReceiptModal onClose={() => setReceiptOpen(false)} onSend={onSend} sending={sending} />}
      {logOrderOpen && (
        <LogOrderModal conversation={conversation} onClose={() => setLogOrderOpen(false)} onSend={onSend} />
      )}
      {quickOpen && <QuickRepliesPanel onClose={() => setQuickOpen(false)} onSend={onSend} sending={sending} />}
    </div>
  );
}
