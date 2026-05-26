import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function PlanPostModal({ onClose, onAdded }) {
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

    const { error } = await supabase.from("posts").insert({
      platform: form.platform,
      caption: form.caption,
      status: "scheduled",
      scheduled_at: new Date(form.scheduled_at).toISOString(),
    });

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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-800">Plan a post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Platform</label>
            <select
              name="platform"
              value={form.platform}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              <option>Instagram</option>
              <option>TikTok</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Caption</label>
            <textarea
              name="caption"
              value={form.caption}
              onChange={handleChange}
              placeholder="Write your post caption..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
            <p className="text-xs text-gray-300 mt-1 text-right">
              {form.caption.length} chars
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Schedule date & time
            </label>
            <input
              name="scheduled_at"
              value={form.scheduled_at}
              onChange={handleChange}
              type="datetime-local"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-500 text-sm py-2 rounded-lg hover:bg-gray-50 transition-all"
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
