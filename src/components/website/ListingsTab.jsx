import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { getShopId, withShop } from "../../lib/shop";
import { formatPrice } from "../../lib/format";

const EMPTY_FORM = {
  type: "product",
  category: "",
  name: "",
  description: "",
  image: "",
  price: "",
  price_label: "",
  badge: "",
  available: true,
  specs: "",
  includes: "",
};

const mockItems = [
  { id: "mock-1", name: "iPhone 15 Pro Case", category: "Accessories", type: "product", price: 3500, price_label: "KSh 3,500", image: "https://picsum.photos/seed/case2/400/400", available: true, badge: "Best Seller", specs: ["Silicone", "MagSafe compatible"], includes: null, description: "", created_at: new Date().toISOString() },
  { id: "mock-2", name: "Wireless Charger Pad", category: "Accessories", type: "product", price: 2500, price_label: "KSh 2,500", image: "https://picsum.photos/seed/charger/400/400", available: true, badge: null, specs: ["Fast charge", "LED indicator"], includes: null, description: "", created_at: new Date().toISOString() },
  { id: "mock-3", name: "CCTV Installation", category: "Security", type: "service", price: 15000, price_label: "From KSh 15,000", image: "https://picsum.photos/seed/cctv/400/400", available: true, badge: "Popular", specs: null, includes: ["4 cameras", "DVR + 1TB", "Installation"], description: "", created_at: new Date().toISOString() },
  { id: "mock-4", name: "Bluetooth Speaker", category: "Audio", type: "product", price: 4500, price_label: "KSh 4,500", image: "https://picsum.photos/seed/speaker/400/400", available: false, badge: null, specs: ["Waterproof", "12hr battery"], includes: null, description: "", created_at: new Date().toISOString() },
  { id: "mock-5", name: "Web Design", category: "Digital", type: "service", price: 25000, price_label: "KSh 25,000", image: "https://picsum.photos/seed/web/400/400", available: true, badge: null, specs: null, includes: ["5 pages", "Mobile responsive", "Hosting 1yr"], description: "", created_at: new Date().toISOString() },
];

export default function ListingsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from("catalogue")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });
    if (!error && data?.length > 0) {
      setItems(data);
    } else {
      setItems(mockItems);
    }
    setLoading(false);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditItem(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({
      ...item,
      specs: Array.isArray(item.specs) ? item.specs.join("\n") : "",
      includes: Array.isArray(item.includes) ? item.includes.join("\n") : "",
    });
    setEditItem(item);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.category || !form.type) {
      showToast("Name, category and type are required", "error");
      return;
    }
    setSaving(true);

    const payload = {
      ...form,
      price: parseInt(form.price) || 0,
      specs:
        form.type === "product" && form.specs
          ? form.specs.split("\n").map((s) => s.trim()).filter(Boolean)
          : null,
      includes:
        form.type === "service" && form.includes
          ? form.includes.split("\n").map((s) => s.trim()).filter(Boolean)
          : null,
      badge: form.badge || null,
    };

    let error;
    if (editItem) {
      ({ error } = await supabase
        .from("catalogue")
        .update(payload)
        .eq("id", editItem.id)
        .eq("shop_id", await getShopId()));
    } else {
      ({ error } = await supabase.from("catalogue").insert([withShop(payload)]));
    }

    setSaving(false);
    if (error) {
      showToast("Something went wrong", "error");
      return;
    }
    showToast(editItem ? "Item updated!" : "Item added!");
    setShowForm(false);
    fetchItems();
  }

  async function handleDelete(id) {
    setDeletingId(id);
    const { error } = await supabase
      .from("catalogue")
      .delete()
      .eq("id", id)
      .eq("shop_id", await getShopId());
    setDeletingId(null);
    if (error) {
      showToast("Delete failed", "error");
      return;
    }
    showToast("Item deleted");
    fetchItems();
  }

  async function toggleAvailable(item) {
    await supabase
      .from("catalogue")
      .update({ available: !item.available })
      .eq("id", item.id)
      .eq("shop_id", await getShopId());
    fetchItems();
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
        <p className="text-sm text-slate-600 dark:text-slate-400">{items.length} items</p>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all"
        >
          + Add Item
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
          <p className="text-sm">No items found</p>
        </div>
      ) : (
        <>
          <div className="sm:hidden space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                        {item.badge && <span className="text-[10px] text-blue-400">{item.badge}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.category}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        item.type === "service" ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"
                      }`}>{item.type}</span>
                      <button
                        onClick={() => toggleAvailable(item)}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          item.available
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {item.available ? "Available" : "Hidden"}
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-blue-400">{item.price_label || formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-1.5 justify-end">
                      <button onClick={() => openEdit(item)} className="text-xs text-blue-400 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="text-xs text-red-400 hover:underline">
                        {deletingId === item.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1a1a2e]">
                  <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 dark:text-slate-400 uppercase">Item</th>
                  <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 dark:text-slate-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 dark:text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 dark:text-slate-400 uppercase">Price</th>
                  <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-right text-slate-600 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className={`border-b border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors ${i === items.length - 1 ? "border-0" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-white/10 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                          {item.badge && <span className="text-xs text-blue-400">{item.badge}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-slate-900 dark:text-white">{item.category}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === "service" ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm font-bold text-blue-400">{item.price_label || formatPrice(item.price)}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAvailable(item)} className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                        item.available ? "bg-green-500/20 text-green-300 hover:bg-red-500/20 hover:text-red-300" : "bg-red-500/20 text-red-300 hover:bg-green-500/20 hover:text-green-300"
                      }`}>{item.available ? "Available" : "Hidden"}</button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                          {deletingId === item.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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
                  {editItem ? "Edit Item" : "Add New Item"}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="product">Product</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Category *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CCTV"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Product or service name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the product or service..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
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
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                  {form.image && (
                    <img
                      src={form.image}
                      alt="preview"
                      className="object-cover w-full h-24 mt-2 rounded-lg"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Price (KSh)
                    </label>
                    <input
                      type="number"
                      placeholder="25000"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Price Label
                    </label>
                    <input
                      type="text"
                      placeholder="From KSh 25,000"
                      value={form.price_label}
                      onChange={(e) =>
                        setForm({ ...form, price_label: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Badge
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Best Seller"
                      value={form.badge}
                      onChange={(e) =>
                        setForm({ ...form, badge: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      value={form.available}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          available: e.target.value === "true",
                        })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="true">Available</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                </div>

                {form.type === "product" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Specs (one per line)
                    </label>
                    <textarea
                      rows={4}
                      placeholder={
                        "4K Resolution\n30m Night Vision\nIP67 Weatherproof"
                      }
                      value={form.specs}
                      onChange={(e) =>
                      setForm({ ...form, specs: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none font-mono"
                    />
                  </div>
                )}

                {form.type === "service" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      What's Included (one per line)
                    </label>
                    <textarea
                      rows={4}
                      placeholder={
                        "4 cameras supplied & installed\nDVR + 1TB storage\n1 year warranty"
                      }
                      value={form.includes}
                      onChange={(e) => setForm({ ...form, includes: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editItem
                      ? "Save Changes"
                      : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
