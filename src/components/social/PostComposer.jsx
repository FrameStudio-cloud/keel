import { useState, useEffect } from "react";
import { FiX, FiZap, FiCpu } from "react-icons/fi";
import { getShopId, withShop } from "../../lib/shop";
import { supabase } from "../../lib/supabase";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useSettings } from "../../hooks/useSettings";
import { aiGenerateVariants } from "../../lib/ai";

const PLATFORMS = ["Instagram", "TikTok", "WhatsApp"];
const POST_TYPES = [
  { value: "product_showcase", label: "Product Showcase" },
  { value: "sale", label: "Sale Announcement" },
  { value: "new_arrival", label: "New Arrival" },
  { value: "back_in_stock", label: "Back in Stock" },
  { value: "behind_scenes", label: "Behind the Scenes" },
  { value: "testimonial", label: "Customer Story" },
  { value: "custom", label: "Custom" },
];

export default function PostComposer({ onClose, onAdded, editPost, initialCaption, initialDate }) {
  const trapRef = useFocusTrap(true);
  const { businessCategory } = useSettings();
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiVariants, setAiVariants] = useState([]);
  const [form, setForm] = useState({
    platform: editPost?.platform || "Instagram",
    caption: editPost?.caption || initialCaption || "",
    scheduled_at: editPost?.scheduled_at
      ? new Date(editPost.scheduled_at).toISOString().slice(0, 16)
      : initialDate || "",
    post_type: editPost?.post_type || "custom",
    product_id: editPost?.product_id || "",
    is_broadcast: editPost?.is_broadcast || false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, price, stock, category")
        .eq("shop_id", shopId)
        .order("name");
      if (prods) setProducts(prods);

      const { data: tmpls } = await supabase
        .from("content_templates")
        .select("*")
        .eq("shop_id", shopId);
      if (tmpls) setTemplates(tmpls);
    })();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function fillCaptionFromProduct() {
    if (!form.product_id) return;
    const p = products.find((x) => x.id === form.product_id);
    if (!p) return;

    const template = selectTemplate();
    const caption = template
      .replace(/\{product\}/g, p.name)
      .replace(/\{price\}/g, `KSh ${(p.price || 0).toLocaleString()}`)
      .replace(/\{stock\}/g, p.stock ?? "0")
      .replace(/\{category\}/g, businessCategory || "shop")
      .replace(/\{shop\}/g, "");
    setForm((prev) => ({ ...prev, caption }));
  }

  async function handleAiGenerate() {
    if (!form.product_id) return;
    setAiLoading(true);
    setAiVariants([]);
    try {
      const shopId = await getShopId();
      const result = await aiGenerateVariants(shopId, form.product_id, form.platform);
      const variants = result.content
        .split("---")
        .map((s) => s.trim())
        .filter(Boolean);
      setAiVariants(variants.length > 0 ? variants : [result.content]);
    } catch {
      setAiVariants(["Could not generate AI variants right now. Try again later."]);
    }
    setAiLoading(false);
  }

  function selectTemplate() {
    const platform = form.platform;
    const postType = form.post_type;
    const match = templates.find(
      (t) => t.platform === platform && t.post_type === postType
    );
    return match?.caption_template || "";
  }

  function getSuggestedHashtags() {
    const product = products.find((x) => x.id === form.product_id);
    const base = ["keel", "smallbusiness", "kenya"];
    if (businessCategory) base.push(businessCategory);
    if (product?.category) base.push(product.category.replace(/\s+/g, ""));
    base.push(form.platform.toLowerCase());
    return [...new Set(base)].map((t) => `#${t}`);
  }

  function insertHashtags() {
    const tags = getSuggestedHashtags().join(" ");
    setForm((prev) => ({
      ...prev,
      caption: prev.caption + (prev.caption ? "\n\n" : "") + tags,
    }));
  }

  async function handleSubmit() {
    if (!form.caption) return;
    setLoading(true);

    const payload = {
      platform: form.platform,
      caption: form.caption,
      status: editPost?.status || "scheduled",
      scheduled_at: form.scheduled_at
        ? new Date(form.scheduled_at).toISOString()
        : null,
      post_type: form.post_type || "custom",
      product_id: form.product_id || null,
      is_broadcast: form.is_broadcast || false,
    };

    if (editPost) {
      await supabase
        .from("posts")
        .update(withShop(payload))
        .eq("id", editPost.id);
    } else {
      await supabase.from("posts").insert(withShop(payload));
    }

    onAdded();
    onClose();
    setLoading(false);
  }

  const product = products.find((x) => x.id === form.product_id);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-lg mx-4"
        role="dialog"
        aria-modal="true"
        aria-label={editPost ? "Edit post" : "Plan a post"}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">
            {editPost ? "Edit post" : "Plan a post"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 text-lg"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                name="platform"
                onClick={() =>
                  setForm((prev) => ({ ...prev, platform: p }))
                }
                className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-all ${
                  form.platform === p
                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400"
                    : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Link to product
              </label>
              <select
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              >
                <option value="">None</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — KSh {(p.price || 0).toLocaleString()} ({p.stock ?? 0})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Post type
              </label>
              <select
                name="post_type"
                value={form.post_type}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              >
                {POST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400 dark:text-slate-500">
                Caption
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={fillCaptionFromProduct}
                  disabled={!form.product_id}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1"
                >
                  <FiZap size={12} /> Suggest
                </button>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={!form.product_id || aiLoading}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1"
                >
                  <FiCpu size={12} /> {aiLoading ? "Generating..." : "AI Generate"}
                </button>
                <button
                  type="button"
                  onClick={insertHashtags}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Hashtags
                </button>
              </div>
            </div>
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

          {form.platform === "WhatsApp" && (
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="is_broadcast"
                checked={form.is_broadcast}
                onChange={handleChange}
                className="rounded border-gray-300 dark:border-white/20"
              />
              Send as WhatsApp broadcast
            </label>
          )}
        </div>

        {aiVariants.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">AI Variants</p>
            {aiVariants.map((v, i) => (
              <button
                key={i}
                onClick={() => setForm((prev) => ({ ...prev, caption: v }))}
                className="w-full text-left p-2 rounded-lg border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/5 text-xs text-gray-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-500/10 transition-all"
              >
                <span className="text-[10px] font-mono text-purple-400 mr-1">V{i + 1}:</span> {v}
              </button>
            ))}
          </div>
        )}

        {product && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 text-xs text-gray-500 dark:text-slate-400">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {product.name}
            </span>{" "}
            — KSh {(product.price || 0).toLocaleString()} · {product.stock ?? 0} in stock
            {product.category && <span> · {product.category}</span>}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-sm py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.caption}
            className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : editPost ? "Update" : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
