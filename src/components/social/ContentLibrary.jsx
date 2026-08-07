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
                  ? "bg-brand-muted border-brand-soft text-brand"
                  : "border-border-subtle text-text-muted hover:bg-surface-2"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-1.5 text-xs font-medium bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-strong transition-all"
        >
          <FiSave size={14} /> New template
        </button>
      </div>

      <div className="relative mb-3">
        <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border-subtle dark:border-border-subtle p-3">
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
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Saved templates
              </h4>
              {filteredTemplates.map((t) => {
                const platformDot =
                  t.platform === "Instagram" ? "bg-chart-5"
                    : t.platform === "TikTok" ? "bg-gray-900 dark:bg-surface-2"
                      : t.platform === "WhatsApp" ? "bg-green-500" : "bg-surface-3";

                return (
                  <div key={t.id} className="rounded-xl border border-border-subtle dark:border-border-subtle bg-surface-1 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {t.platform && <span className={`w-2 h-2 rounded-full ${platformDot}`} />}
                        <span className="text-xs font-medium text-text-primary">{t.name}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(t)}
                        className="flex items-center gap-1 text-xs text-brand hover:underline"
                      >
                        {copiedId === t.id ? <><FiCheck size={12} /> Copied</> : <><FiCopy size={12} /> Use</>}
                      </button>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{t.caption_template}</p>
                  </div>
                );
              })}
            </div>
          )}

          {filteredRecentPosts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Reuse from past posts
              </h4>
              <div className="flex flex-col gap-2">
                {filteredRecentPosts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border-subtle dark:border-border-subtle bg-surface-1 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          p.platform === "Instagram" ? "bg-chart-5"
                            : p.platform === "TikTok" ? "bg-gray-900 dark:bg-surface-2"
                              : p.platform === "WhatsApp" ? "bg-green-500" : "bg-surface-3"
                        }`} />
                        <span className="text-xs text-text-muted">{p.platform}</span>
                        {p.post_type && p.post_type !== "custom" && (
                          <span className="text-[10px] uppercase text-text-faint">{p.post_type.replace(/_/g, " ")}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUseTemplate(p.caption || "")}
                          className="text-xs text-brand hover:underline flex items-center gap-1"
                        >
                          <FiCopy size={11} /> Use
                        </button>
                        <button
                          onClick={() => openSaveFromPost(p)}
                          className="text-xs text-text-faint hover:text-brand"
                        >
                          <FiSave size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed truncate">
                      {p.caption?.slice(0, 120)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 && filteredRecentPosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-text-faint">
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
      <div ref={trapRef} className="bg-surface-1 rounded-2xl border border-border-subtle p-6 w-full max-w-md mx-4" role="dialog" aria-modal="true" aria-label="Save as template">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-text-primary">Save as template</h2>
          <button onClick={onClose} className="text-text-faint hover:text-text-body text-lg" aria-label="Close"><FiX /></button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-text-faint mb-1 block">Template name</label>
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="e.g. Weekend Sale"
              className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="text-xs text-text-faint mb-1 block">Platform</label>
              <select value={form.platform} onChange={(e) => onChange({ ...form, platform: e.target.value })} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand">
                <option>Instagram</option>
                <option>TikTok</option>
                <option>WhatsApp</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-text-faint mb-1 block">Post type</label>
              <select value={form.post_type} onChange={(e) => onChange({ ...form, post_type: e.target.value })} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand">
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
            <label className="text-xs text-text-faint mb-1 block">Caption template</label>
            <textarea
              value={form.caption}
              onChange={(e) => onChange({ ...form, caption: e.target.value })}
              rows={3}
              placeholder="Use {product}, {price}, {stock} as placeholders"
              className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand resize-none"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 border border-border-subtle text-text-muted text-sm py-2 rounded-lg hover:bg-surface-2 transition-all">Cancel</button>
          <button onClick={onSave} disabled={!form.name || !form.caption} className="flex-1 bg-brand text-white text-sm py-2 rounded-lg hover:bg-brand-strong transition-all disabled:opacity-50">Save</button>
        </div>
      </div>
    </div>
  );
}
