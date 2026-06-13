import { useState, useEffect } from "react";
import { FiX, FiArrowUp } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { getShopId, withShop } from "../../lib/shop";

const BANNER_TYPES = [
  { value: "hero", label: "Hero", color: "bg-purple-500/20 text-purple-300" },
  { value: "sale", label: "Sale", color: "bg-green-500/20 text-green-300" },
  { value: "info", label: "Info", color: "bg-blue-500/20 text-blue-300" },
  { value: "alert", label: "Alert", color: "bg-red-500/20 text-red-300" },
];

const EMPTY_FORM = {
  type: "sale",
  title: "",
  subtitle: "",
  message: "",
  image_url: "",
  link_url: "",
  active: true,
  sort_order: 0,
};

export default function BannersTab() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("shop_id", shopId)
      .order("sort_order");
    if (!error) setBanners(data || []);
    setLoading(false);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openAdd() {
    const maxOrder = banners.reduce(
      (max, b) => Math.max(max, b.sort_order || 0),
      0
    );
    setForm({ ...EMPTY_FORM, sort_order: maxOrder + 1 });
    setEditItem(null);
    setShowForm(true);
  }

  function openEdit(banner) {
    setForm({ ...banner });
    setEditItem(banner);
    setShowForm(true);
  }

  async function moveUp(index) {
    if (index === 0) return;
    const shopId = await getShopId();
    const arr = [...banners];
    const temp = arr[index].sort_order;
    arr[index].sort_order = arr[index - 1].sort_order;
    arr[index - 1].sort_order = temp;
    await Promise.all([
      supabase
        .from("banners")
        .update({ sort_order: arr[index].sort_order })
        .eq("id", arr[index].id)
        .eq("shop_id", shopId),
      supabase
        .from("banners")
        .update({ sort_order: arr[index - 1].sort_order })
        .eq("id", arr[index - 1].id)
        .eq("shop_id", shopId),
    ]);
    fetchBanners();
  }

  async function handleSave() {
    if (!form.type) {
      showToast("Type is required", "error");
      return;
    }
    setSaving(true);

    const payload = {
      type: form.type,
      title: form.title || null,
      subtitle: form.subtitle || null,
      message: form.message || null,
      image_url: form.image_url || null,
      link_url: form.link_url || null,
      active: form.active,
      sort_order: parseInt(form.sort_order) || 0,
    };

    let error;
    if (editItem) {
      ({ error } = await supabase
        .from("banners")
        .update(payload)
        .eq("id", editItem.id)
        .eq("shop_id", await getShopId()));
    } else {
      ({ error } = await supabase
        .from("banners")
        .insert([withShop(payload)]));
    }

    setSaving(false);
    if (error) {
      showToast("Something went wrong", "error");
      return;
    }
    showToast(editItem ? "Banner updated!" : "Banner added!");
    setShowForm(false);
    fetchBanners();
  }

  async function handleDelete(id) {
    const shopId = await getShopId();
    await supabase.from("banners").delete().eq("id", id).eq("shop_id", shopId);
    showToast("Banner deleted");
    fetchBanners();
  }

  function getTypeStyle(type) {
    return BANNER_TYPES.find((t) => t.value === type)?.color || "";
  }

  return (
    <div>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{banners.length} banners</p>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all"
        >
          + Add Banner
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-slate-600 dark:text-slate-400">
          <p className="text-sm">No banners yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="flex items-center gap-3 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3"
            >
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-white disabled:opacity-30"
              >
                <FiArrowUp size={14} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTypeStyle(banner.type)}`}
                  >
                    {BANNER_TYPES.find((t) => t.value === banner.type)
                      ?.label || banner.type}
                  </span>
                  {banner.active ? (
                    <span className="text-xs text-green-400">Active</span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-slate-900 dark:text-white font-medium truncate">
                  {banner.title || "(no title)"}
                </p>
                {banner.message && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {banner.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(banner)}
                  className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
                <h2 className="font-bold text-slate-900 dark:text-white">
                  {editItem ? "Edit Banner" : "Add Banner"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"
                  aria-label="Close"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                  >
                    {BANNER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Banner headline"
                    value={form.title || ""}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="Smaller supporting text"
                    value={form.subtitle || ""}
                    onChange={(e) =>
                      setForm({ ...form, subtitle: e.target.value })
                    }
                    className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Announcement bar message"
                    value={form.message || ""}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.image_url || ""}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                    className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.link_url || ""}
                    onChange={(e) =>
                      setForm({ ...form, link_url: e.target.value })
                    }
                    className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) =>
                        setForm({ ...form, sort_order: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      value={form.active}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          active: e.target.value === "true",
                        })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : editItem ? "Save Changes" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
