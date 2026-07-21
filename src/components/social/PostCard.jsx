import { useState } from "react";
import { FiClock, FiShare2, FiExternalLink, FiSave, FiEdit3, FiCheckCircle } from "react-icons/fi";
import Badge from "../Badge";
import { useSettings } from "../../hooks/useSettings";
import { supabase } from "../../lib/supabase";
import { getShopId, withShop } from "../../lib/shop";

const PLATFORM_STYLES = {
  Instagram: "border-l-pink-500",
  TikTok: "border-l-gray-900 dark:border-l-gray-100",
  WhatsApp: "border-l-green-500",
};

const POST_TYPE_LABELS = {
  product_showcase: "Product",
  sale: "Sale",
  new_arrival: "New",
  back_in_stock: "Restock",
  behind_scenes: "BTS",
  testimonial: "Testimonial",
  custom: "",
};

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostCard({ post, onEdit, onSaveAsTemplate, onMarkPublished }) {
  const { whatsapp } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState(false);
  const [engagement, setEngagement] = useState({
    likes: post.likes || 0,
    comments: post.comments || 0,
    reach: post.reach || 0,
  });

  const isScheduled = post.status === "scheduled";
  const isBroadcast = post.is_broadcast;
  const platformColor = PLATFORM_STYLES[post.platform] || "border-l-gray-300";
  const typeLabel = POST_TYPE_LABELS[post.post_type];

  async function saveEngagement() {
    const shopId = await getShopId();
    await supabase.from("posts").update(withShop({
      likes: engagement.likes,
      comments: engagement.comments,
      reach: engagement.reach,
    })).eq("id", post.id);
    setEditingEngagement(false);
  }

  function handleWhatsAppShare(asStatus = false) {
    const num = whatsapp?.replace(/[^0-9]/g, "");
    if (!num) return;
    const text = encodeURIComponent(
      `${post.caption}\n\n${asStatus ? "📱 WhatsApp Status Update" : ""}`
    );
    window.open(`https://wa.me/${num}?text=${text}`, "_blank");
  }

  const captionLong = (post.caption?.length || 0) > 120;
  const displayCaption = expanded || !captionLong
    ? post.caption
    : post.caption?.slice(0, 120) + "...";

  return (
    <div className={`bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 border-l-4 ${platformColor} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
            {post.platform}
            {isBroadcast && <span className="ml-1.5 text-green-500 dark:text-green-400">· Broadcast</span>}
          </span>
          {typeLabel && (
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded">
              {typeLabel}
            </span>
          )}
        </div>
        <Badge label={isScheduled ? "Scheduled" : "Published"} color={isScheduled ? "blue" : "green"} />
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed cursor-pointer" onClick={() => setExpanded((e) => !e)}>
        {displayCaption || "No caption"}
        {captionLong && <span className="text-blue-500 dark:text-blue-400 text-xs ml-1">{expanded ? "less" : "more"}</span>}
      </p>

      {post.product_id && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
          <FiExternalLink size={11} />
          <span>Linked to product</span>
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-white/10">
        {isScheduled ? (
          <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
            <FiClock /> {formatDate(post.scheduled_at)}
          </span>
        ) : (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-400 dark:text-slate-500">
            {editingEngagement ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  type="number"
                  value={engagement.likes}
                  onChange={(e) => setEngagement({ ...engagement, likes: Number(e.target.value) })}
                  className="w-12 px-1 py-0.5 text-xs border border-gray-200 dark:border-white/10 rounded bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white"
                  placeholder="Likes"
                />
                <input
                  type="number"
                  value={engagement.comments}
                  onChange={(e) => setEngagement({ ...engagement, comments: Number(e.target.value) })}
                  className="w-12 px-1 py-0.5 text-xs border border-gray-200 dark:border-white/10 rounded bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white"
                  placeholder="Comments"
                />
                <input
                  type="number"
                  value={engagement.reach}
                  onChange={(e) => setEngagement({ ...engagement, reach: Number(e.target.value) })}
                  className="w-16 px-1 py-0.5 text-xs border border-gray-200 dark:border-white/10 rounded bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white"
                  placeholder="Reach"
                />
                <button onClick={saveEngagement} className="text-green-600 dark:text-green-400 hover:underline text-xs">Save</button>
                <button onClick={() => setEditingEngagement(false)} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
              </div>
            ) : (
              <>
                <span>{post.likes || 0} likes</span>
                <span>{post.comments || 0} comments</span>
                <span>{(post.reach || 0).toLocaleString()} reach</span>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onEdit(post)}
            className="text-xs text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
          >
            Edit
          </button>
          {isScheduled && onMarkPublished && (
            <button
              onClick={() => onMarkPublished(post)}
              className="text-xs text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all flex items-center gap-1"
            >
              <FiCheckCircle size={11} /> Mark published
            </button>
          )}
          {!isScheduled && (
            <button
              onClick={() => setEditingEngagement((e) => !e)}
              className="text-xs text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all flex items-center gap-1"
            >
              <FiEdit3 size={11} /> Stats
            </button>
          )}
          {post.platform === "WhatsApp" && whatsapp && (
            <div className="relative">
              <button
                onClick={() => setShareOpen((v) => !v)}
                className="text-xs text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all flex items-center gap-1"
              >
                <FiShare2 size={11} /> Share
              </button>
              {shareOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#16213e] border border-gray-100 dark:border-white/10 rounded-xl shadow-lg p-1 min-w-[160px] z-10">
                  <button onClick={() => { handleWhatsAppShare(false); setShareOpen(false); }} className="w-full text-left text-xs text-gray-600 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                    Share as message
                  </button>
                  <button onClick={() => { handleWhatsAppShare(true); setShareOpen(false); }} className="w-full text-left text-xs text-gray-600 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                    Post as status update
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => onSaveAsTemplate?.(post)}
            className="text-xs text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
            title="Save as template"
          >
            <FiSave size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
