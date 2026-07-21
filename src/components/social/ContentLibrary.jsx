import { useState, useEffect } from "react";
import { FiCopy, FiCheck, FiSearch, FiSave, FiX } from "react-icons/fi";
import { getShopId, withShop } from "../../lib/shop";
import { supabase } from "../../lib/supabase";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import Skeleton from "../Skeleton";

const PLATFORM_FILTERS = ["All", "Instagram", "TikTok", "WhatsApp"];

export default function ContentLibrary({ onUseTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: "", caption: "", platform: "Instagram", post_type: "custom" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const shopId = await getShopId();
      const [tmplRes, postsRes] = await Promise.all([
        supabase.from("content_templates").select("*").eq("shop_id", shopId).order("name"),
        supabase.from("posts").select("id, caption, platform, post_type").eq("shop_id", shopId).order("created_at", { ascending: false }).limit(20),
      ]);
      if (!cancelled) {
        setTemplates(tmplRes.data ?? []);
        setRecentPosts(postsRes.data ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredTemplates = templates.filter((t) => {
    if (platformFilter !== "All" && t.platform !== platformFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
        !t.caption_template?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredRecentPosts = recentPosts.filter((p) => {
    if (platformFilter !== "All" && p.platform !== platformFilter) return false;
    if (search && !p.caption?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleCopy(t) {
    setCopiedId(t.id);
    onUseTemplate(t.caption_template || "");
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleSaveTemplate() {
    if (!saveForm.name || !saveForm.caption) return;
    const shopId = await getShopId();
    await supabase.from("content_templates").insert(withShop({
      name: saveForm.name,
      caption_template: saveForm.caption,
      platform: saveForm.platform,
      post_type: saveForm.post_type,
    }));
    const { data } = await supabase.from("content_templates").select("*").eq("shop_id", shopId).order("name");
    if (data) setTemplates(data);
    setShowSaveModal(false);
    setSaveForm({ name: "", caption: "", platform: "Instagram", post_type: "custom" });
  }

  function openSaveFromPost(post) {
    setSaveForm({
      name: `From: ${post.caption?.slice(0, 40)}...`,
      caption: post.caption || "",
      platform: post.platform || "Instagram",
      post_type: post.post_type || "custom",
    });
    setShowSaveModal(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {PLATFORM_FILTERS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                platformFilter === p
                  ? "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400"
                  : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all"
        >
          <FiSave size={14} /> New template
        </button>
      </div>

      <div className="relative mb-3">
        <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 dark:border-white/5 p-3">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {templates.length > 0 && (
            <div className="flex flex-col gap-2 mb-6">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Saved templates
              </h4>
              {filteredTemplates.map((t) => {
                const platformDot =
                  t.platform === "Instagram" ? "bg-pink-500"
                    : t.platform === "TikTok" ? "bg-gray-900 dark:bg-gray-100"
                      : t.platform === "WhatsApp" ? "bg-green-500" : "bg-gray-300";

                return (
                  <div key={t.id} className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#16213e] p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {t.platform && <span className={`w-2 h-2 rounded-full ${platformDot}`} />}
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-100">{t.name}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(t)}
                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {copiedId === t.id ? <><FiCheck size={12} /> Copied</> : <><FiCopy size={12} /> Use</>}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{t.caption_template}</p>
                  </div>
                );
              })}
            </div>
          )}

          {filteredRecentPosts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Reuse from past posts
              </h4>
              <div className="flex flex-col gap-2">
                {filteredRecentPosts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#16213e] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          p.platform === "Instagram" ? "bg-pink-500"
                            : p.platform === "TikTok" ? "bg-gray-900 dark:bg-gray-100"
                              : p.platform === "WhatsApp" ? "bg-green-500" : "bg-gray-300"
                        }`} />
                        <span className="text-xs text-gray-500 dark:text-slate-400">{p.platform}</span>
                        {p.post_type && p.post_type !== "custom" && (
                          <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500">{p.post_type.replace(/_/g, " ")}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUseTemplate(p.caption || "")}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <FiCopy size={11} /> Use
                        </button>
                        <button
                          onClick={() => openSaveFromPost(p)}
                          className="text-xs text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <FiSave size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed truncate">
                      {p.caption?.slice(0, 120)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 && filteredRecentPosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 dark:text-slate-500">
                {(platformFilter !== "All" || search)
                  ? "No templates match your filter."
                  : "No templates yet. Save your first one!"}
              </p>
            </div>
          )}
        </>
      )}

      {showSaveModal && (
        <SaveTemplateModal
          form={saveForm}
          onChange={setSaveForm}
          onSave={handleSaveTemplate}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}

function SaveTemplateModal({ form, onChange, onSave, onClose }) {
  const trapRef = useFocusTrap(true);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div ref={trapRef} className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-md mx-4" role="dialog" aria-modal="true" aria-label="Save as template">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">Save as template</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 text-lg" aria-label="Close"><FiX /></button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Template name</label>
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="e.g. Weekend Sale"
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Platform</label>
              <select value={form.platform} onChange={(e) => onChange({ ...form, platform: e.target.value })} className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400">
                <option>Instagram</option>
                <option>TikTok</option>
                <option>WhatsApp</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Post type</label>
              <select value={form.post_type} onChange={(e) => onChange({ ...form, post_type: e.target.value })} className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400">
                <option value="product_showcase">Product Showcase</option>
                <option value="sale">Sale Announcement</option>
                <option value="new_arrival">New Arrival</option>
                <option value="back_in_stock">Back in Stock</option>
                <option value="behind_scenes">Behind the Scenes</option>
                <option value="testimonial">Customer Story</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Caption template</label>
            <textarea
              value={form.caption}
              onChange={(e) => onChange({ ...form, caption: e.target.value })}
              rows={3}
              placeholder="Use {product}, {price}, {stock} as placeholders"
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-sm py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all">Cancel</button>
          <button onClick={onSave} disabled={!form.name || !form.caption} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50">Save</button>
        </div>
      </div>
    </div>
  );
}
