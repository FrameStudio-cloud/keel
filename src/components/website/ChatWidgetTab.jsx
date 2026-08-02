import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";
import { useSettings } from "../../hooks/useSettings";
import { FiCheck, FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiMessageCircle, FiSend, FiCheckCircle, FiPhone, FiAlertCircle } from "react-icons/fi";
import { useToast } from "../../context/ToastProvider";
import Pagination from "../Pagination";

const MSG_PAGE_SIZE = 50;

const POSITIONS = [
  { value: "right", label: "Bottom Right" },
  { value: "left", label: "Bottom Left" },
];

export default function ChatWidgetTab() {
  const { whatsapp } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState(null);
  const { showToast } = useToast();

  const [config, setConfig] = useState({
    enabled: true,
    welcome_message: "Hi! How can we help you today?",
    widget_color: "#3B82F6",
    position: "right",
    whatsapp_number: "",
  });
  const [faqs, setFaqs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgPage, setMsgPage] = useState(0);
  const [msgTotal, setMsgTotal] = useState(0);
  const [msgTab, setMsgTab] = useState("unanswered");
  const [replies, setReplies] = useState({});
  const [answeredMessages, setAnsweredMessages] = useState([]);
  const [answeredPage, setAnsweredPage] = useState(0);
  const [answeredTotal, setAnsweredTotal] = useState(0);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [editingFaq, setEditingFaq] = useState(null);
  const [sendingReply, setSendingReply] = useState(null);
  const [callbacks, setCallbacks] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await getShopId();
      if (cancelled) return;
      if (!id) { setLoading(false); return; }
      setShopId(id);

      const { data: cfg, error: cfgErr } = await supabase
        .from("chat_config")
        .select("*")
        .eq("shop_id", id)
        .maybeSingle();

      if (cfgErr) { showToast(cfgErr.message, "error"); setLoading(false); return; }

      if (cfg) {
        setConfig({
          enabled: cfg.enabled ?? true,
          welcome_message: cfg.welcome_message || "Hi! How can we help you today?",
          widget_color: cfg.widget_color || "#3B82F6",
          position: cfg.position || "right",
          whatsapp_number: cfg.whatsapp_number || "",
        });
      } else if (whatsapp) {
        setConfig((prev) => ({ ...prev, whatsapp_number: whatsapp }));
      }

      const { data: faqData, error: faqErr } = await supabase
        .from("chat_faqs")
        .select("*")
        .eq("shop_id", id)
        .order("sort_order", { ascending: true })
        .limit(200);

      if (cancelled) return;
      if (faqErr) { showToast(faqErr.message, "error"); setLoading(false); return; }

      if (faqData) setFaqs(faqData);

      const [cbRes, saRes] = await Promise.all([
        supabase.from("chat_callbacks").select("*").eq("shop_id", id).order("created_at", { ascending: false }).limit(100),
        supabase.from("chat_stock_alerts").select("*").eq("shop_id", id).order("created_at", { ascending: false }).limit(100),
      ])
      if (!cancelled) {
        if (cbRes.data) setCallbacks(cbRes.data)
        if (saRes.data) setStockAlerts(saRes.data)
      }

      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [whatsapp, showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!shopId) return;
      const page = msgTab === "unanswered" ? msgPage : answeredPage;
      const { data: msgData, count, error: msgErr } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact" })
        .eq("shop_id", shopId)
        .eq("status", msgTab)
        .range(page * MSG_PAGE_SIZE, (page + 1) * MSG_PAGE_SIZE - 1)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (msgErr) { showToast(msgErr.message, "error"); return; }
      if (msgData) {
        if (msgTab === "unanswered") {
          setMessages(msgData);
          setMsgTotal(count ?? 0);
        } else {
          setAnsweredMessages(msgData);
          setAnsweredTotal(count ?? 0);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [shopId, msgPage, answeredPage, msgTab, showToast]);

  async function saveConfig() {
    if (!shopId) return;
    setSaving(true);
    const { error } = await supabase.from("chat_config").upsert({
      shop_id: shopId,
      enabled: config.enabled,
      welcome_message: config.welcome_message,
      widget_color: config.widget_color,
      position: config.position,
      whatsapp_number: config.whatsapp_number,
    }, { onConflict: "shop_id" });
    setSaving(false);
    if (error) return showToast(error.message, "error");
    showToast("Chat widget settings saved!");
  }

  async function addFaq() {
    if (!shopId || !newFaq.question.trim() || !newFaq.answer.trim()) return;
    const maxOrder = faqs.reduce((max, f) => Math.max(max, f.sort_order ?? -1), -1);
    const { data, error } = await supabase
      .from("chat_faqs")
      .insert({
        shop_id: shopId,
        question: newFaq.question.trim(),
        answer: newFaq.answer.trim(),
        sort_order: maxOrder + 1,
      })
      .select()
      .single();
    if (error) return showToast(error.message, "error");
    setFaqs([...faqs, data]);
    setNewFaq({ question: "", answer: "" });
    showToast("FAQ added!");
  }

  async function deleteFaq(id) {
    const { error } = await supabase.from("chat_faqs").delete().eq("id", id).eq("shop_id", shopId);
    if (error) return showToast(error.message, "error");
    setFaqs(faqs.filter((f) => f.id !== id));
    showToast("FAQ deleted");
  }

  async function moveFaq(id, direction) {
    const idx = faqs.findIndex((f) => f.id === id);
    if (idx === -1) return;
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= faqs.length) return;
    const prev = [...faqs];
    const updated = [...faqs];
    const temp = updated[idx].sort_order;
    updated[idx] = { ...updated[idx], sort_order: updated[swapIdx].sort_order };
    updated[swapIdx] = { ...updated[swapIdx], sort_order: temp };
    setFaqs(updated);
    const { error } = await supabase.from("chat_faqs").upsert([
      { id: updated[idx].id, shop_id: shopId, sort_order: updated[idx].sort_order },
      { id: updated[swapIdx].id, shop_id: shopId, sort_order: updated[swapIdx].sort_order },
    ]);
    if (error) { setFaqs(prev); showToast(error.message, "error"); }
  }

  async function markAnswered(id) {
    const { error } = await supabase
      .from("chat_messages")
      .update({ status: "answered" })
      .eq("id", id)
      .eq("shop_id", shopId);
    if (error) return showToast(error.message, "error");
    setMessages(messages.filter((m) => m.id !== id));
    setMsgTotal((prev) => Math.max(0, prev - 1));
    showToast("Marked as answered!");
  }

  async function sendReply(id) {
    const answer = (replies[id] || "").trim();
    if (!answer) return;
    setSendingReply(id);
    const { error } = await supabase
      .from("chat_messages")
      .update({ status: "answered", answer })
      .eq("id", id)
      .eq("shop_id", shopId);
    setSendingReply(null);
    if (error) return showToast(error.message, "error");
    setReplies((prev) => { const r = { ...prev }; delete r[id]; return r; });
    setMessages(messages.filter((m) => m.id !== id));
    setMsgTotal((prev) => Math.max(0, prev - 1));
    showToast("Reply sent!");
  }

  async function markCallbackCalled(id) {
    const { error } = await supabase.from("chat_callbacks").update({ status: "called" }).eq("id", id).eq("shop_id", shopId);
    if (error) return showToast(error.message, "error");
    setCallbacks(callbacks.map(c => c.id === id ? { ...c, status: "called" } : c));
    showToast("Marked as called!");
  }

  async function toggleRestocked(id, current) {
    const next = current === "restocked" ? "pending" : "restocked";
    const { error } = await supabase.from("chat_stock_alerts").update({ status: next }).eq("id", id).eq("shop_id", shopId);
    if (error) return showToast(error.message, "error");
    setStockAlerts(stockAlerts.map(s => s.id === id ? { ...s, status: next } : s));
    showToast(next === "restocked" ? "Marked as restocked!" : "Marked as pending");
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const inputClass = "w-full bg-surface-1 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {callbacks.length > 0 && (
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiPhone size={14} className="text-text-faint" />
            <h3 className="text-sm font-medium text-text-primary">Callback Requests</h3>
            <span className="text-[10px] bg-warning-muted text-warning font-semibold px-2 py-0.5 rounded-full ml-auto">{callbacks.filter(c => c.status === "pending").length} pending</span>
          </div>
          <div className="space-y-2">
            {callbacks.slice(0, 20).map(cb => (
              <div key={cb.id} className="bg-surface-2 rounded-lg border border-border-subtle p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{cb.name}</p>
                    <p className="text-xs text-brand">{cb.phone}</p>
                    {cb.question && <p className="text-xs text-text-muted mt-1 line-clamp-2">{cb.question}</p>}
                    <p className="text-[10px] text-text-faint mt-1">{new Date(cb.created_at).toLocaleDateString()}</p>
                  </div>
                  {cb.status === "pending" && (
                    <button
                      onClick={() => markCallbackCalled(cb.id)}
                      className="shrink-0 px-3 py-1.5 bg-success hover:bg-success-500 text-success-contrast text-[10px] font-semibold rounded-lg transition-all"
                    >
                      Mark Called
                    </button>
                  )}
                  {cb.status !== "pending" && (
                    <span className="shrink-0 text-[10px] text-text-faint font-medium uppercase">{cb.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stockAlerts.length > 0 && (
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertCircle size={14} className="text-text-faint" />
            <h3 className="text-sm font-medium text-text-primary">Stock Alerts</h3>
            <span className="text-[10px] bg-warning-muted text-warning font-semibold px-2 py-0.5 rounded-full ml-auto">{stockAlerts.filter(s => s.status === "pending").length} pending</span>
          </div>
          <div className="space-y-2">
            {stockAlerts.slice(0, 20).map(sa => (
              <div key={sa.id} className="bg-surface-2 rounded-lg border border-border-subtle p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{sa.product_name}</p>
                    {sa.customer_note && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{sa.customer_note}</p>}
                    <p className="text-[10px] text-text-faint mt-1">{new Date(sa.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => toggleRestocked(sa.id, sa.status)}
                    className={`shrink-0 px-3 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${
                      sa.status === "restocked"
                        ? "bg-success-muted text-success"
                        : "bg-surface-2 text-text-body hover:bg-success-600 hover:text-success-contrast"
                    }`}
                  >
                    {sa.status === "restocked" ? "Restocked" : "Mark Restocked"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface-1 rounded-xl border border-border-subtle p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-primary">Widget Settings</h3>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative w-10 h-5 rounded-full transition-all ${
              config.enabled ? "bg-brand" : "bg-surface-3"
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-surface-1 rounded-full shadow transition-all ${
              config.enabled ? "left-5" : "left-0.5"
            }`} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-faint mb-1">Welcome Message</label>
            <textarea
              rows={2}
              value={config.welcome_message}
              onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text-faint mb-1">Widget Color</label>
              <input
                type="color"
                value={config.widget_color}
                onChange={(e) => setConfig({ ...config, widget_color: e.target.value })}
                className="w-full h-9 rounded-lg border border-border-subtle cursor-pointer bg-surface-1"
              />
            </div>
            <div>
              <label className="block text-xs text-text-faint mb-1">Position</label>
              <select
                value={config.position}
                onChange={(e) => setConfig({ ...config, position: e.target.value })}
                className={inputClass}
              >
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-faint mb-1">WhatsApp</label>
              <input
                type="text"
                value={config.whatsapp_number}
                onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                placeholder="2547..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          className="mt-4 w-full py-2 bg-brand hover:bg-brand-soft text-white font-bold text-sm rounded-lg transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="bg-surface-1 rounded-xl border border-border-subtle p-5 shadow-sm">
        <h3 className="text-sm font-medium text-text-primary mb-4">FAQs</h3>

        {faqs.map((faq, i) => (
          <div
            key={faq.id}
            className="bg-surface-2 rounded-lg border border-border-subtle p-3 mb-2"
          >
            {editingFaq === faq.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[i] = { ...updated[i], question: e.target.value };
                    setFaqs(updated);
                  }}
                  className={inputClass}
                  placeholder="Question"
                />
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[i] = { ...updated[i], answer: e.target.value };
                    setFaqs(updated);
                  }}
                  className={`${inputClass} resize-none`}
                  placeholder="Answer"
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("chat_faqs")
                        .update({ question: faq.question, answer: faq.answer })
                        .eq("id", faq.id)
                        .eq("shop_id", shopId);
                      if (error) return showToast(error.message, "error");
                      setEditingFaq(null);
                      showToast("FAQ updated!");
                    }}
                    className="px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-soft"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingFaq(null)}
                    className="px-3 py-1.5 bg-surface-2 text-text-body text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{faq.question}</p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => moveFaq(faq.id, -1)} disabled={i === 0} className="p-1 text-text-faint hover:text-white disabled:opacity-30">
                    <FiChevronUp size={14} />
                  </button>
                  <button onClick={() => moveFaq(faq.id, 1)} disabled={i === faqs.length - 1} className="p-1 text-text-faint hover:text-white disabled:opacity-30">
                    <FiChevronDown size={14} />
                  </button>
                  <button onClick={() => setEditingFaq(faq.id)} className="p-1 text-text-faint hover:text-brand-soft">
                    <FiCheck size={14} />
                  </button>
                  <button onClick={() => deleteFaq(faq.id)} className="p-1 text-text-faint hover:text-danger">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="bg-surface-2 rounded-lg border border-border-subtle p-3 mt-2">
          <div className="space-y-2">
            <input
              type="text"
              value={newFaq.question}
              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              placeholder="Question"
              className={inputClass}
            />
            <textarea
              rows={2}
              value={newFaq.answer}
              onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
              placeholder="Answer"
              className={`${inputClass} resize-none`}
            />
            <button
              onClick={addFaq}
              disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
              className="w-full py-2 bg-brand hover:bg-brand-soft text-white font-bold text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiPlus size={14} />
              Add FAQ
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-1 rounded-xl border border-border-subtle p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <FiMessageCircle size={14} className="text-text-faint" />
          <div className="flex gap-1 bg-surface-2 rounded-lg p-0.5">
            <button
              onClick={() => setMsgTab("unanswered")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                msgTab === "unanswered"
                  ? "bg-surface-1 text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-body dark:hover:text-text-body"
              }`}
            >
              Unanswered ({msgTotal})
            </button>
            <button
              onClick={() => setMsgTab("answered")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                msgTab === "answered"
                  ? "bg-surface-1 text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-body dark:hover:text-text-body"
              }`}
            >
              Answered ({answeredTotal})
            </button>
          </div>
        </div>

        {msgTab === "unanswered" ? (
          messages.length > 0 ? (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-surface-2 rounded-lg border border-border-subtle p-3 mb-2"
                >
                  <p className="text-sm text-text-primary">{msg.question}</p>
                  {msg.customer_name && (
                    <p className="text-xs text-text-faint mt-1">— {msg.customer_name}</p>
                  )}
                  <div className="mt-2">
                    <textarea
                      rows={2}
                      value={replies[msg.id] || ""}
                      onChange={(e) => setReplies({ ...replies, [msg.id]: e.target.value })}
                      placeholder="Type your reply..."
                      className="w-full bg-surface-1 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => sendReply(msg.id)}
                        disabled={!replies[msg.id]?.trim() || sendingReply === msg.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-soft transition-all disabled:opacity-50"
                      >
                        <FiSend size={12} />
                        {sendingReply === msg.id ? "Sending..." : "Send Reply"}
                      </button>
                      <button
                        onClick={() => markAnswered(msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-success text-success-contrast text-xs font-semibold rounded-lg hover:bg-success-500 transition-all"
                      >
                        <FiCheckCircle size={12} />
                        Mark Answered
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <Pagination page={msgPage} total={msgTotal} pageSize={MSG_PAGE_SIZE} onPageChange={setMsgPage} />
            </>
          ) : (
            <p className="text-xs text-text-faint text-center py-6">
              No unanswered questions.
            </p>
          )
        ) : (
          answeredMessages.length > 0 ? (
            <>
              {answeredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-surface-2 rounded-lg border border-border-subtle p-3 mb-2"
                >
                  <p className="text-sm font-medium text-text-primary">Q: {msg.question}</p>
                  {msg.answer && (
                    <div className="mt-1.5 bg-brand-muted border border-brand-soft dark:border-blue-500/20 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-semibold text-brand mb-0.5">Your reply:</p>
                      <p className="text-xs text-text-body">{msg.answer}</p>
                    </div>
                  )}
                  {msg.customer_name && (
                    <p className="text-xs text-text-faint mt-1">— {msg.customer_name}</p>
                  )}
                  {msg.feedback && (
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      msg.feedback === "helpful"
                        ? "bg-success-muted text-success"
                        : "bg-danger-muted text-danger"
                    }`}>
                      {msg.feedback === "helpful" ? "👍 Helpful" : "👎 Not helpful"}
                    </span>
                  )}
                </div>
              ))}
              <Pagination page={answeredPage} total={answeredTotal} pageSize={MSG_PAGE_SIZE} onPageChange={setAnsweredPage} />
            </>
          ) : (
            <p className="text-xs text-text-faint text-center py-6">
              No answered messages yet.
            </p>
          )
        )}
      </div>

    </div>
  );
}
