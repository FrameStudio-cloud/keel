import { useState } from "react";
import { FiX } from "react-icons/fi";
import { withShop } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { useFocusTrap } from "../hooks/useFocusTrap";

export default function PlanPostModal({ onClose, onAdded }) {
  const trapRef = useFocusTrap(true);
  const [form, setForm] = useState({
    platform: "Instagram",
    caption: "",
    scheduled_at: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    if (!form.caption || !form.scheduled_at) return;

    setLoading(true);

    const { error } = await supabase.from("posts").insert(withShop({
      platform: form.platform,
      caption: form.caption,
      status: "scheduled",
      scheduled_at: new Date(form.scheduled_at).toISOString(),
    }));

    if (error) {
      console.error(error);
    } else {
      onAdded();
      onClose();
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Plan a post"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">Plan a post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 text-lg"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Platform</label>
            <select
              name="platform"
              value={form.platform}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
            >
              <option>Instagram</option>
              <option>TikTok</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Caption</label>
            <textarea
              name="caption"
              value={form.caption}
              onChange={handleChange}
              placeholder="Write your post caption..."
              rows={4}
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400 resize-none"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-right">
              {form.caption.length} chars
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
              Schedule date & time
            </label>
            <input
              name="scheduled_at"
              value={form.scheduled_at}
              onChange={handleChange}
              type="datetime-local"
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-sm py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Schedule post"}
          </button>
        </div>
      </div>
    </div>
  );
}
