import { useState } from "react";
import { FiX, FiZap, FiSend, FiTrash2, FiPlus } from "react-icons/fi";
import { useQuickReplies, useSaveQuickReplies } from "../../hooks/useWhatsAppInbox";
import { useFocusTrap } from "../../hooks/useFocusTrap";

const inputClass = "w-full bg-surface-2 dark:bg-white/5 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors";

export default function QuickRepliesPanel({ onClose, onSend, sending }) {
  const trapRef = useFocusTrap(true);
  const { data: replies = [] } = useQuickReplies();
  const save = useSaveQuickReplies();

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [body, setBody] = useState("");

  async function handleAdd() {
    if (!label.trim() || !body.trim()) return;
    await save.mutateAsync([
      ...replies,
      { id: `qr-${Date.now()}`, label: label.trim(), body: body.trim() },
    ]);
    setLabel("");
    setBody("");
    setAdding(false);
  }

  async function handleDelete(id) {
    await save.mutateAsync(replies.filter((r) => r.id !== id));
  }

  async function handleSend(text) {
    if (!text.trim() || sending) return;
    await onSend({ body: text });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Quick replies"
        className="bg-surface-1 rounded-2xl border border-border-subtle w-full max-w-sm flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <FiZap size={16} className="text-brand" />
            <h2 className="text-sm font-bold text-text-primary">Quick replies</h2>
          </div>
          <button type="button" onClick={onClose} className="text-text-faint hover:text-text-body" aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0 space-y-1.5">
          {replies.length === 0 && !adding && (
            <p className="text-center text-xs text-text-faint py-6">
              No quick replies yet. Add one for common answers like prices or opening hours.
            </p>
          )}
          {replies.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 border border-border-subtle rounded-xl px-3 py-2.5 group"
            >
              <button
                type="button"
                onClick={() => handleSend(r.body)}
                className="flex-1 text-left min-w-0"
                title={`Send: ${r.body}`}
              >
                <p className="text-sm font-semibold text-text-primary truncate">{r.label}</p>
                <p className="text-xs text-text-muted truncate">{r.body}</p>
              </button>
              <button
                type="button"
                onClick={() => handleSend(r.body)}
                disabled={sending}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-strong disabled:opacity-40"
                aria-label={`Send ${r.label}`}
              >
                <FiSend size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                className="shrink-0 text-text-faint hover:text-danger"
                aria-label={`Delete ${r.label}`}
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}

          {adding && (
            <div className="space-y-2 border border-border-subtle rounded-xl p-3">
              <input
                autoFocus
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (e.g. Opening hours)"
                className={inputClass}
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Reply text"
                rows={2}
                className={`${inputClass} resize-none`}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!label.trim() || !body.trim() || save.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand hover:bg-brand-strong text-white text-xs font-semibold rounded-lg disabled:opacity-40"
                >
                  <FiPlus size={13} /> Save reply
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="px-3 py-2 border border-border-subtle text-text-muted text-xs font-semibold rounded-lg hover:bg-surface-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {!adding && (
          <div className="px-5 py-3.5 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border-strong text-text-muted hover:text-brand hover:border-brand text-sm font-semibold rounded-xl transition-colors"
            >
              <FiPlus size={14} />
              Add a quick reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
