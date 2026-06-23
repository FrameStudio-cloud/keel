import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";
import { useSettings } from "../../hooks/useSettings";
import Pagination from "../Pagination";

const MSG_PAGE_SIZE = 50;
import { FiCheck, FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiCopy, FiMessageCircle, FiSend, FiCheckCircle } from "react-icons/fi";

const POSITIONS = [
  { value: "right", label: "Bottom Right" },
  { value: "left", label: "Bottom Left" },
];

export default function ChatWidgetTab() {
  const { whatsapp } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [shopId, setShopId] = useState(null);
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

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    (async () => {
      const id = await getShopId();
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

      if (faqErr) { showToast(faqErr.message, "error"); setLoading(false); return; }

      if (faqData) setFaqs(faqData);

      setLoading(false);
    })();
  }, [whatsapp]);

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
  }, [shopId, msgPage, answeredPage, msgTab]);

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
    const maxOrder = faqs.reduce((max, f) => Math.max(max, f.sort_order), -1);
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

  async function copyEmbed() {
    const snippet = `import ChatWidget from "./components/ChatWidget";

// Add this inside your component tree (before closing </>):
<ChatWidget />`;
    try {
      await navigator.clipboard.writeText(snippet);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Press Ctrl+C to copy", "error");
    }
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

  const inputClass = "w-full bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-colors";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-slate-200 dark:border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-800 dark:text-white">Widget Settings</h3>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative w-10 h-5 rounded-full transition-all ${
              config.enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
              config.enabled ? "left-5" : "left-0.5"
            }`} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Welcome Message</label>
            <textarea
              rows={2}
              value={config.welcome_message}
              onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Widget Color</label>
              <input
                type="color"
                value={config.widget_color}
                onChange={(e) => setConfig({ ...config, widget_color: e.target.value })}
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer bg-white dark:bg-[#1a1a2e]"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Position</label>
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
              <label className="block text-xs text-slate-400 dark:text-slate-500 mb-1">WhatsApp</label>
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
          className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-slate-200 dark:border-white/10 p-5">
        <h3 className="text-sm font-medium text-slate-800 dark:text-white mb-4">FAQs</h3>

        {faqs.map((faq, i) => (
          <div
            key={faq.id}
            className="bg-slate-50 dark:bg-[#1a1a2e] rounded-lg border border-slate-200 dark:border-white/10 p-3 mb-2"
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
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingFaq(null)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{faq.question}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => moveFaq(faq.id, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
                    <FiChevronUp size={14} />
                  </button>
                  <button onClick={() => moveFaq(faq.id, 1)} disabled={i === faqs.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
                    <FiChevronDown size={14} />
                  </button>
                  <button onClick={() => setEditingFaq(faq.id)} className="p-1 text-slate-400 hover:text-blue-400">
                    <FiCheck size={14} />
                  </button>
                  <button onClick={() => deleteFaq(faq.id)} className="p-1 text-slate-400 hover:text-red-400">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="bg-slate-50 dark:bg-[#1a1a2e] rounded-lg border border-slate-200 dark:border-white/10 p-3 mt-2">
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
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiPlus size={14} />
              Add FAQ
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-slate-200 dark:border-white/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <FiMessageCircle size={14} className="text-slate-400" />
          <div className="flex gap-1 bg-slate-100 dark:bg-[#1a1a2e] rounded-lg p-0.5">
            <button
              onClick={() => setMsgTab("unanswered")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                msgTab === "unanswered"
                  ? "bg-white dark:bg-[#16213e] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Unanswered ({msgTotal})
            </button>
            <button
              onClick={() => setMsgTab("answered")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                msgTab === "answered"
                  ? "bg-white dark:bg-[#16213e] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
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
                  className="bg-slate-50 dark:bg-[#1a1a2e] rounded-lg border border-slate-200 dark:border-white/10 p-3 mb-2"
                >
                  <p className="text-sm text-slate-900 dark:text-white">{msg.question}</p>
                  {msg.customer_name && (
                    <p className="text-xs text-slate-400 mt-1">— {msg.customer_name}</p>
                  )}
                  <div className="mt-2">
                    <textarea
                      rows={2}
                      value={replies[msg.id] || ""}
                      onChange={(e) => setReplies({ ...replies, [msg.id]: e.target.value })}
                      placeholder="Type your reply..."
                      className="w-full bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-colors resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => sendReply(msg.id)}
                        disabled={!replies[msg.id]?.trim() || sendingReply === msg.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50"
                      >
                        <FiSend size={12} />
                        {sendingReply === msg.id ? "Sending..." : "Send Reply"}
                      </button>
                      <button
                        onClick={() => markAnswered(msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-500 transition-all"
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
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
              No unanswered questions.
            </p>
          )
        ) : (
          answeredMessages.length > 0 ? (
            <>
              {answeredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-slate-50 dark:bg-[#1a1a2e] rounded-lg border border-slate-200 dark:border-white/10 p-3 mb-2"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Q: {msg.question}</p>
                  {msg.answer && (
                    <div className="mt-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-0.5">Your reply:</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{msg.answer}</p>
                    </div>
                  )}
                  {msg.customer_name && (
                    <p className="text-xs text-slate-400 mt-1">— {msg.customer_name}</p>
                  )}
                  {msg.feedback && (
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      msg.feedback === "helpful"
                        ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}>
                      {msg.feedback === "helpful" ? "👍 Helpful" : "👎 Not helpful"}
                    </span>
                  )}
                </div>
              ))}
              <Pagination page={answeredPage} total={answeredTotal} pageSize={MSG_PAGE_SIZE} onPageChange={setAnsweredPage} />
            </>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
              No answered messages yet.
            </p>
          )
        )}
      </div>

      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-slate-200 dark:border-white/10 p-5">
        <h3 className="text-sm font-medium text-slate-800 dark:text-white mb-2">Integration</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
          Import the ChatWidget component into your React website:
        </p>
        <div className="bg-slate-900 dark:bg-black rounded-lg p-3 text-xs text-green-400 font-mono overflow-x-auto">
          import ChatWidget from "./components/ChatWidget";{'\n'}{'\n'}
          {`<ChatWidget />`}
        </div>
        <button
          onClick={copyEmbed}
          className="mt-3 w-full py-2 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-sm font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2"
        >
          <FiCopy size={14} />
          Copy snippet
        </button>
      </div>
    </div>
  );
}