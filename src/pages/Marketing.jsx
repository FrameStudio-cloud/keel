import { useState, useEffect, useRef, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ContextTip from "../components/ContextTip";
import EmptyState from "../components/EmptyState";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/format";
import ProGate from "../components/ProGate";
import { useSettings } from "../hooks/useSettings";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../context/ToastProvider";
import QRCode from "qrcode";
import {
  FiLink, FiCopy, FiShare2, FiSmartphone, FiFileText, FiGrid, FiStar, FiDownload, FiCheck,
  FiExternalLink, FiPackage, FiTag, FiPercent, FiClock, FiTrendingUp, FiCalendar,
  FiChevronDown, FiX, FiSave, FiImage,
} from "react-icons/fi";
import Switch from "react-switch";

const BADGE_OPTIONS = [
  { value: "", label: "None" },
  { value: "New", label: "New" },
  { value: "Best Seller", label: "Best Seller" },
  { value: "Sale", label: "Sale" },
  { value: "Hot", label: "Hot" },
];

const BADGE_COLORS = {
  "": "bg-surface-2 text-text-body",
  "New": "bg-success-muted text-success",
  "Best Seller": "bg-warning-muted text-accent-300",
  "Sale": "bg-danger-muted text-danger",
  "Hot": "bg-chart-2/10 text-chart-2 text-chart-2",
};

export default function Marketing() {
  const { whatsapp, websiteUrl } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrType, setQrType] = useState("website");
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [bulkSelection, setBulkSelection] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const [customBadgeInput, setCustomBadgeInput] = useState("");
  const [customBadgeProduct, setCustomBadgeProduct] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [catalogueMap, setCatalogueMap] = useState({});
  const qrCanvasRef = useRef(null);
  const { showToast } = useToast();

  const publishedIds = useMemo(() => new Set(Object.keys(catalogueMap)), [catalogueMap]);
  const selectedProduct = products.find((c) => c.id === selectedId);
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    const q = debouncedSearch.toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }, [products, debouncedSearch]);

  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .order("name")
        .limit(100);
      if (data) setProducts(data);

      const { data: catalogue } = await supabase
        .from("catalogue")
        .select("id, product_id")
        .eq("shop_id", shopId);
      if (catalogue) {
        const map = {};
        catalogue.forEach((c) => { if (c.product_id) map[c.product_id] = c; });
        setCatalogueMap(map);
      }

      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const onSale = products.filter((p) => p.sale_price != null).length;
    const newArrivals = products.filter((p) => p.new_arrival).length;
    const activeBadges = products.filter((p) => p.badge && p.badge !== "").length;
    const expiring = products.filter((p) => {
      const d = p.badge_ends_at || p.sale_ends_at;
      return d && new Date(d) <= oneWeekFromNow && new Date(d) >= now;
    }).length;
    return { onSale, newArrivals, activeBadges, expiring };
  }, [products]);

  const calendarEvents = useMemo(() => {
    const now = new Date();
    const events = [];
    products.forEach((p) => {
      if (p.badge && p.badge !== "" && p.badge_ends_at) {
        const d = new Date(p.badge_ends_at);
        if (d >= now) events.push({ date: d, product: p.name, label: `"${p.badge}" badge expires` });
      }
      if (p.sale_price != null && p.sale_ends_at) {
        const d = new Date(p.sale_ends_at);
        if (d >= now) events.push({ date: d, product: p.name, label: `Sale ends (${formatPrice(p.sale_price)})` });
      }
    });
    events.sort((a, b) => a.date - b.date);
    return events;
  }, [products]);

  function generateLink() {
    if (!selectedProduct || !websiteUrl) return;
    setGeneratedLink(`${websiteUrl}/p/${selectedProduct.id}`);
    setCopied(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      showToast("Link copied!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  }

  function shareWhatsApp() {
    if (!selectedProduct || !whatsapp) return;
    const text = encodeURIComponent(`Hi! I'd like to order ${selectedProduct.name} — ${generatedLink}`);
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  }

  function testWhatsApp() {
    if (!whatsapp) { showToast("Set your WhatsApp number in Settings first", "error"); return; }
    const text = encodeURIComponent("Hi! I'd like to know more about your products.");
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  }

  function htmlEscape(str) {
    if (typeof str !== "string") return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function printCatalog() {
    const printWin = window.open("", "_blank");
    if (!printWin) { showToast("Please allow popups for this feature", "error"); return; }
    printWin.document.write(`
      <html><head><title>Catalog</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .sub { color: #64748b; font-size: 14px; margin-bottom: 32px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        .price { font-weight: 600; }
        .sale { color: #d97706; font-weight: 600; }
        .orig { text-decoration: line-through; color: #94a3b8; font-weight: 400; margin-right: 6px; }
        .badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-right: 4px; }
        .badge-new { background: #dcfce7; color: #15803d; }
        .badge-sale { background: #fee2e2; color: #dc2626; }
        .badge-best { background: #fef3c7; color: #b45309; }
        .badge-hot { background: #ffedd5; color: #ea580c; }
        .badge-other { background: #dbeafe; color: #2563eb; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <h1>Product Catalog</h1>
      <p class="sub">${filteredProducts.length} product(s)</p>
      <table><thead><tr><th>Product</th><th>Category</th><th>Badge</th><th>Price</th></tr></thead><tbody>
      ${filteredProducts.map((p) => {
        const badgeHtml = p.badge
          ? `<span class="badge badge-${p.badge === "New" ? "new" : p.badge === "Sale" ? "sale" : p.badge === "Best Seller" ? "best" : p.badge === "Hot" ? "hot" : "other"}">${htmlEscape(p.badge)}</span>`
          : "";
        const priceHtml = p.sale_price != null
          ? `<span class="orig">${formatPrice(p.price)}</span><span class="sale">${formatPrice(p.sale_price)}</span>`
          : `<span class="price">${formatPrice(p.price)}</span>`;
        return `<tr><td>${htmlEscape(p.name)}</td><td>${htmlEscape(p.category)}</td><td>${badgeHtml}</td><td>${priceHtml}</td></tr>`;
      }).join("")}
      </tbody></table>
      <p style="margin-top: 32px; font-size: 11px; color: #94a3b8;">Generated by Keel — ${new Date().toLocaleDateString()}</p>
      </body></html>
    `);
    printWin.document.close();
    printWin.onload = () => { printWin.print(); };
  }

  useEffect(() => {
    (async () => {
      if (!websiteUrl && qrType !== "whatsapp") { setQrUrl(""); return; }
      const raw = whatsapp?.replace(/[^0-9]/g, "");
      let text = "";
      if (qrType === "website") {
        text = websiteUrl;
      } else if (qrType === "whatsapp") {
        text = raw ? `https://wa.me/${raw}` : "";
      } else if (qrType === "product" && selectedProduct) {
        text = `${websiteUrl}/p/${selectedProduct.id}`;
      }
      setQrUrl(text);
      if (qrCanvasRef.current && text) {
        try {
          await QRCode.toCanvas(qrCanvasRef.current, text, { width: 180, margin: 2, color: { dark: "#1e293b", light: "#ffffff" } });
        } catch { /* ignore */ }
      }
    })();
  }, [qrType, websiteUrl, whatsapp, selectedProduct]);

  function downloadQR() {
    if (!qrCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `keel-qr-${qrType}.png`;
    link.href = qrCanvasRef.current.toDataURL("image/png");
    link.click();
  }

  async function updateProduct(id, updates) {
    const shopId = await getShopId();
    setSavingId(id);
    await supabase.from("products").update(updates).eq("id", id).eq("shop_id", shopId);
    setProducts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

    const catItem = catalogueMap[id];
    if (catItem) {
      const catUpdates = {};
      if ("badge" in updates) catUpdates.badge = updates.badge;
      if ("badge_ends_at" in updates) catUpdates.badge_ends_at = updates.badge_ends_at;
      if ("sale_price" in updates) catUpdates.sale_price = updates.sale_price;
      if ("sale_ends_at" in updates) catUpdates.sale_ends_at = updates.sale_ends_at;
      if ("new_arrival" in updates) catUpdates.new_arrival = updates.new_arrival;
      if (Object.keys(catUpdates).length > 0) {
        await supabase.from("catalogue").update(catUpdates).eq("id", catItem.id).eq("shop_id", shopId);
      }
    }

    setSavingId(null);
  }

  async function toggleNewArrival(item, value) {
    await updateProduct(item.id, { new_arrival: value });
    showToast(value ? "Marked as new arrival" : "Removed new arrival tag", "success");
  }

  async function handleBadgeChange(item, value) {
    if (value === "__custom__") {
      setCustomBadgeProduct(item.id);
      setCustomBadgeInput(item.badge || "");
      return;
    }
    await updateProduct(item.id, { badge: value, badge_ends_at: value ? item.badge_ends_at : null });
    showToast(value ? `Badge set to "${value}"` : "Badge removed", "success");
  }

  async function saveCustomBadge(itemId) {
    const val = customBadgeInput.trim();
    await updateProduct(itemId, { badge: val, badge_ends_at: null });
    setCustomBadgeProduct(null);
    setCustomBadgeInput("");
    showToast(val ? `Badge set to "${val}"` : "Badge removed", "success");
  }

  function toggleBulk(id) {
    setBulkSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (bulkSelection.size === filteredProducts.length) {
      setBulkSelection(new Set());
    } else {
      setBulkSelection(new Set(filteredProducts.map((p) => p.id)));
    }
  }

  async function bulkSetBadge(badge) {
    const shopId = await getShopId();
    const ids = [...bulkSelection];
    await supabase.from("products").update({ badge }).in("id", ids).eq("shop_id", shopId);
    setProducts((prev) => prev.map((c) => ids.includes(c.id) ? { ...c, badge } : c));
    const catIds = ids.map((id) => catalogueMap[id]?.id).filter(Boolean);
    if (catIds.length > 0) {
      await supabase.from("catalogue").update({ badge }).in("id", catIds).eq("shop_id", shopId);
    }
    setBulkSelection(new Set());
    showToast(`Badge "${badge || "None"}" applied to ${ids.length} product(s)`, "success");
  }

  async function bulkSetNewArrival(value) {
    const shopId = await getShopId();
    const ids = [...bulkSelection];
    await supabase.from("products").update({ new_arrival: value }).in("id", ids).eq("shop_id", shopId);
    setProducts((prev) => prev.map((c) => ids.includes(c.id) ? { ...c, new_arrival: value } : c));
    const catIds = ids.map((id) => catalogueMap[id]?.id).filter(Boolean);
    if (catIds.length > 0) {
      await supabase.from("catalogue").update({ new_arrival: value }).in("id", catIds).eq("shop_id", shopId);
    }
    setBulkSelection(new Set());
    showToast(`New arrival ${value ? "enabled" : "disabled"} for ${ids.length} product(s)`, "success");
  }

  async function bulkClearSale() {
    const shopId = await getShopId();
    const ids = [...bulkSelection];
    await supabase.from("products").update({ sale_price: null, sale_ends_at: null }).in("id", ids).eq("shop_id", shopId);
    setProducts((prev) => prev.map((c) => ids.includes(c.id) ? { ...c, sale_price: null, sale_ends_at: null } : c));
    const catIds = ids.map((id) => catalogueMap[id]?.id).filter(Boolean);
    if (catIds.length > 0) {
      await supabase.from("catalogue").update({ sale_price: null, sale_ends_at: null }).in("id", catIds).eq("shop_id", shopId);
    }
    setBulkSelection(new Set());
    showToast(`Sale cleared for ${ids.length} product(s)`, "success");
  }

  const whatsappNumber = whatsapp || "";
  const [bulkBadgeOpen, setBulkBadgeOpen] = useState(false);

  if (loading) {
    return (
      <>
      <PageLayout title="Marketing" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}</div>
      </PageLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Marketing — Keel</title>
        <meta name="description" content="Promotions, product links, QR codes, and marketing tools for your shop." />
        <meta property="og:title" content="Marketing — Keel" />
        <meta property="og:description" content="Promotions, product links, QR codes, and marketing tools." />
        <meta property="og:url" content="https://keel.framestudio.co.ke/marketing" />
      </Helmet>
    <PageLayout title="Marketing" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <ContextTip tipKey="marketing" title="Tip">
        <p>Use marketing tools to generate QR codes, add sale prices, and share product links.</p>
      </ContextTip>
      <p className="text-xs text-text-faint mb-5">Manage promotions, badges, sale prices, share links, QR codes, and more.</p>
      {products.length === 0 ? (
        <EmptyState
          icon={FiPackage}
          title="No products yet"
          description="Add products in Inventory to access marketing tools."
          actionLabel="Go to Inventory"
          to="/inventory"
        />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-text-faint">No products match your search.</p>
        </div>
      ) : (
      <>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
            <div className="flex items-center gap-2 mb-1">
              <FiPercent size={14} className="text-danger" />
              <span className="text-[10px] font-semibold uppercase text-text-faint tracking-wide">On Sale</span>
            </div>
            <p className="text-xl font-bold text-text-primary">{stats.onSale}</p>
          </div>
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
            <div className="flex items-center gap-2 mb-1">
              <FiStar size={14} className="text-success" />
              <span className="text-[10px] font-semibold uppercase text-text-faint tracking-wide">New Arrivals</span>
            </div>
            <p className="text-xl font-bold text-text-primary">{stats.newArrivals}</p>
          </div>
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
            <div className="flex items-center gap-2 mb-1">
              <FiTag size={14} className="text-accent" />
              <span className="text-[10px] font-semibold uppercase text-text-faint tracking-wide">Active Badges</span>
            </div>
            <p className="text-xl font-bold text-text-primary">{stats.activeBadges}</p>
          </div>
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
            <div className="flex items-center gap-2 mb-1">
              <FiClock size={14} className="text-chart-2" />
              <span className="text-[10px] font-semibold uppercase text-text-faint tracking-wide">Expiring Soon</span>
            </div>
            <p className="text-xl font-bold text-text-primary">{stats.expiring}</p>
          </div>
        </div>

        {/* Promotions Manager */}
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiTrendingUp size={14} className="text-text-faint" />
              <h3 className="text-sm font-medium text-text-primary">Promotions Manager</h3>
            </div>
            {calendarEvents.length > 0 && (
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-1.5 text-xs text-brand hover:underline"
              >
                <FiCalendar size={14} /> {showCalendar ? "Hide" : "View"} Calendar
              </button>
            )}
          </div>

          {/* Bulk Action Bar */}
          {bulkSelection.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-brand-muted rounded-xl border border-brand-soft dark:border-blue-500/20">
              <span className="text-xs font-medium text-brand mr-2">{bulkSelection.size} selected</span>
              <div className="relative">
                <button
                  onClick={() => setBulkBadgeOpen(!bulkBadgeOpen)}
                  className="text-xs bg-surface-1 border border-border-subtle px-3 py-1.5 rounded-lg text-text-body hover:border-brand-soft flex items-center gap-1"
                >
                  <FiTag size={12} /> Set Badge <FiChevronDown size={12} />
                </button>
                {bulkBadgeOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-surface-1 border border-border-subtle rounded-xl shadow-xl z-20 py-1 min-w-[140px]">
                    <button onClick={() => { bulkSetBadge(""); setBulkBadgeOpen(false); }} className="block w-full text-left px-4 py-2 text-xs text-text-body hover:bg-surface-2 dark:hover:bg-white/5">None</button>
                    <button onClick={() => { bulkSetBadge("New"); setBulkBadgeOpen(false); }} className="block w-full text-left px-4 py-2 text-xs text-success hover:bg-surface-2 dark:hover:bg-white/5">New</button>
                    <button onClick={() => { bulkSetBadge("Best Seller"); setBulkBadgeOpen(false); }} className="block w-full text-left px-4 py-2 text-xs text-warning hover:bg-surface-2 dark:hover:bg-white/5">Best Seller</button>
                    <button onClick={() => { bulkSetBadge("Sale"); setBulkBadgeOpen(false); }} className="block w-full text-left px-4 py-2 text-xs text-danger hover:bg-surface-2 dark:hover:bg-white/5">Sale</button>
                    <button onClick={() => { bulkSetBadge("Hot"); setBulkBadgeOpen(false); }} className="block w-full text-left px-4 py-2 text-xs text-chart-2 hover:bg-surface-2 dark:hover:bg-white/5">Hot</button>
                  </div>
                )}
              </div>
              <button onClick={() => bulkSetNewArrival(true)} className="text-xs bg-surface-1 border border-border-subtle px-3 py-1.5 rounded-lg text-text-body hover:border-success">Mark New</button>
              <button onClick={() => bulkSetNewArrival(false)} className="text-xs bg-surface-1 border border-border-subtle px-3 py-1.5 rounded-lg text-text-body hover:border-border-strong">Unmark New</button>
              <button onClick={bulkClearSale} className="text-xs bg-surface-1 border border-border-subtle px-3 py-1.5 rounded-lg text-text-body hover:border-danger">Clear Sale</button>
              <button onClick={() => setBulkSelection(new Set())} className="text-xs text-text-faint hover:text-text-body dark:hover:text-text-body ml-auto">
                <FiX size={14} />
              </button>
            </div>
          )}

          {/* Promo Calendar */}
          {showCalendar && calendarEvents.length > 0 && (
            <div className="mb-4 p-4 bg-surface-0 rounded-xl border border-border-subtle">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Upcoming Expirations</h4>
              <div className="space-y-2">
                {calendarEvents.slice(0, 10).map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="text-text-faint font-mono min-w-[80px]">
                      {ev.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                    <span className="text-text-body">{ev.label}</span>
                    <span className="text-text-faint ml-auto truncate">{ev.product}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile cards */}
          <div className="md:hidden mb-3 flex items-center gap-3 px-1">
            <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={bulkSelection.size === filteredProducts.length && filteredProducts.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-border-strong text-brand focus:ring-brand"
              />
              Select all
            </label>
            <span className="text-xs text-text-faint">{filteredProducts.length} product(s)</span>
          </div>
          <div className="md:hidden space-y-3">
            {filteredProducts.map((item) => {
              const isSaving = savingId === item.id;
              return (
                <div key={item.id} className="bg-surface-0 rounded-xl p-4 border border-border-subtle">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={bulkSelection.has(item.id)}
                      onChange={() => toggleBulk(item.id)}
                      className="mt-1 rounded border-border-strong text-brand focus:ring-brand shrink-0"
                    />
                    <div className="w-10 h-10 rounded-lg bg-surface-2 dark:bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FiImage size={16} className="text-text-faint" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                      <p className="text-xs text-text-muted capitalize">{item.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {item.sale_price != null ? (
                        <div>
                          <p className="text-xs text-text-faint line-through">{formatPrice(item.price)}</p>
                          <p className="text-sm font-semibold text-accent-strong">{formatPrice(item.sale_price)}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-text-primary">{formatPrice(item.price)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-text-muted dark:text-text-muted mb-1 uppercase tracking-wide">Badge</label>
                      {customBadgeProduct === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={customBadgeInput}
                            onChange={(e) => setCustomBadgeInput(e.target.value)}
                            placeholder="Badge text"
                            maxLength={20}
                            className="flex-1 border border-border-subtle rounded-lg px-2 py-1.5 text-xs bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") saveCustomBadge(item.id); if (e.key === "Escape") setCustomBadgeProduct(null); }}
                          />
                          <button onClick={() => saveCustomBadge(item.id)} className="text-brand p-1"><FiSave size={14} /></button>
                          <button onClick={() => setCustomBadgeProduct(null)} className="text-text-faint p-1"><FiX size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={item.badge || ""}
                            onChange={(e) => handleBadgeChange(item, e.target.value)}
                            disabled={isSaving}
                            className="flex-1 border border-border-subtle rounded-lg px-2 py-1.5 text-xs bg-surface-1 text-text-primary focus:outline-none focus:border-brand disabled:opacity-50"
                          >
                            {BADGE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                            <option value="__custom__">Custom...</option>
                          </select>
                          {item.badge && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${BADGE_COLORS[item.badge] || "bg-brand-muted text-brand"}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      <label className="block text-[10px] text-text-muted dark:text-text-muted mb-1 uppercase tracking-wide text-center">New</label>
                      <Switch
                        onChange={() => toggleNewArrival(item, !item.new_arrival)}
                        checked={item.new_arrival}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        width={36}
                        height={18}
                        handleDiameter={14}
                        offColor="#9ca3af"
                        onColor="#2563eb"
                        offHandleColor="#ffffff"
                        onHandleColor="#ffffff"
                        aria-label={`Toggle new arrival for ${item.name}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-subtle">
                    <div className="flex-1">
                      <label className="block text-[10px] text-text-muted dark:text-text-muted mb-1 uppercase tracking-wide">Sale Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="—"
                        value={item.sale_price ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : parseFloat(e.target.value);
                          updateProduct(item.id, { sale_price: val, badge: val != null ? "Sale" : item.badge });
                        }}
                        className="w-full border border-border-subtle rounded-lg px-2 py-1.5 text-xs bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-text-muted dark:text-text-muted mb-1 uppercase tracking-wide">Ends</label>
                      <input
                        type="date"
                        value={item.sale_ends_at ? item.sale_ends_at.split("T")[0] : ""}
                        onChange={(e) => {
                          const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                          updateProduct(item.id, { sale_ends_at: val });
                        }}
                        className="w-full border border-border-subtle rounded-lg px-2 py-1.5 text-xs bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-0">
                  <th className="px-2 py-2 w-8">
                    <input
                      type="checkbox"
                      checked={bulkSelection.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border-strong text-brand focus:ring-brand"
                    />
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold text-left text-text-muted uppercase">Product</th>
                  <th className="px-3 py-2 text-xs font-semibold text-left text-text-muted uppercase hidden sm:table-cell">Category</th>
                  <th className="px-3 py-2 text-xs font-semibold text-left text-text-muted uppercase">Price</th>
                  <th className="px-3 py-2 text-xs font-semibold text-left text-text-muted uppercase min-w-[120px]">Badge</th>
                  <th className="px-3 py-2 text-xs font-semibold text-center text-text-muted uppercase">New</th>
                  <th className="px-3 py-2 text-xs font-semibold text-left text-text-muted uppercase min-w-[140px] hidden md:table-cell">Sale Price</th>
                  <th className="px-3 py-2 text-xs font-semibold text-left text-text-muted uppercase min-w-[110px] hidden lg:table-cell">Sale Ends</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item, i) => {
                  const isSaving = savingId === item.id;
                  return (
                    <tr key={item.id} className={`border-b border-border-subtle hover:bg-surface-2 transition-colors ${i === filteredProducts.length - 1 ? "border-0" : ""}`}>
                      <td className="px-2 py-2.5">
                        <input
                          type="checkbox"
                          checked={bulkSelection.has(item.id)}
                          onChange={() => toggleBulk(item.id)}
                          className="rounded border-border-strong text-brand focus:ring-brand"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-surface-2 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-cover rounded-md" />
                            ) : (
                              <FiImage size={12} className="text-text-faint" />
                            )}
                          </div>
                          <span className="font-medium text-text-primary truncate max-w-[140px] sm:max-w-none">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-text-muted text-xs capitalize hidden sm:table-cell">{item.category}</td>
                      <td className="px-3 py-2.5">
                        {item.sale_price != null ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-text-faint line-through">{formatPrice(item.price)}</span>
                            <span className="text-xs font-semibold text-accent-strong">{formatPrice(item.sale_price)}</span>
                          </div>
                        ) : (
                          <span className="text-text-primary">{formatPrice(item.price)}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {customBadgeProduct === item.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={customBadgeInput}
                              onChange={(e) => setCustomBadgeInput(e.target.value)}
                              placeholder="Badge text"
                              maxLength={20}
                              className="w-20 border border-border-subtle rounded px-1.5 py-1 text-[11px] bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === "Enter") saveCustomBadge(item.id); if (e.key === "Escape") setCustomBadgeProduct(null); }}
                            />
                            <button onClick={() => saveCustomBadge(item.id)} className="text-brand hover:text-brand-strong">
                              <FiSave size={12} />
                            </button>
                            <button onClick={() => setCustomBadgeProduct(null)} className="text-text-faint hover:text-text-body">
                              <FiX size={12} />
                            </button>
                          </div>
                        ) : (
                          <select
                            value={item.badge || ""}
                            onChange={(e) => handleBadgeChange(item, e.target.value)}
                            disabled={isSaving}
                            className="text-[11px] border border-border-subtle rounded px-1.5 py-1 bg-surface-1 text-text-primary focus:outline-none focus:border-brand disabled:opacity-50 max-w-[90px]"
                          >
                            {BADGE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                            <option value="__custom__">Custom...</option>
                          </select>
                        )}
                        {item.badge && item.badge !== "" && customBadgeProduct !== item.id && (
                          <span className={`inline-block ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${BADGE_COLORS[item.badge] || "bg-brand-muted text-brand"}`}>
                            {item.badge}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Switch
                          onChange={() => toggleNewArrival(item, !item.new_arrival)}
                          checked={item.new_arrival}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          width={36}
                          height={18}
                          handleDiameter={14}
                          offColor="#9ca3af"
                          onColor="#2563eb"
                          offHandleColor="#ffffff"
                          onHandleColor="#ffffff"
                          className="align-middle"
                          aria-label={`Toggle new arrival for ${item.name}`}
                        />
                      </td>
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="—"
                          value={item.sale_price ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? null : parseFloat(e.target.value);
                            updateProduct(item.id, { sale_price: val, badge: val != null ? "Sale" : item.badge });
                          }}
                          className="w-full max-w-[100px] border border-border-subtle rounded px-2 py-1 text-xs bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                        />
                      </td>
                      <td className="px-3 py-2.5 hidden lg:table-cell">
                        <input
                          type="date"
                          value={item.sale_ends_at ? item.sale_ends_at.split("T")[0] : ""}
                          onChange={(e) => {
                            const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                            updateProduct(item.id, { sale_ends_at: val });
                          }}
                          className="w-full max-w-[120px] border border-border-subtle rounded px-2 py-1 text-xs bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Share & QR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ProGate feature="marketing_links">
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiLink size={14} className="text-text-faint" />
              <h3 className="text-sm font-medium text-text-primary">Shareable Product Links</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              {!websiteUrl ? (
                <p className="text-xs text-text-faint italic py-2">Set your website URL in <Link to="/settings" className="font-semibold underline hover:no-underline">Settings</Link> to generate shareable links.</p>
              ) : products.filter((c) => publishedIds.has(c.id)).length === 0 ? (
                <p className="text-xs text-text-faint italic py-2">Publish products from Inventory to generate shareable links.</p>
              ) : (
              <select
                value={publishedIds.has(selectedId) ? selectedId : ""}
                onChange={(e) => { setSelectedId(e.target.value); setGeneratedLink(""); }}
                className="flex-1 border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
              >
                <option value="">Select a product...</option>
                {products.filter((c) => publishedIds.has(c.id)).map((c) => (<option key={c.id} value={c.id}>{c.name} — {formatPrice(c.price)}</option>))}
              </select>
              )}
              <button
                onClick={generateLink}
                disabled={!selectedId || !publishedIds.has(selectedId)}
                className="w-full sm:w-auto bg-brand text-white text-xs px-4 py-2 rounded-lg hover:bg-brand-strong transition-all disabled:opacity-50"
              >
                Generate
              </button>
            </div>
            {generatedLink && (
              <div className="bg-surface-0 rounded-lg p-3 border border-border-subtle">
                <p className="text-xs text-text-muted mb-1">Shareable URL</p>
                <p className="text-sm font-mono text-text-primary break-all mb-3">{generatedLink}</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={copyLink} className="flex items-center gap-1.5 text-xs bg-surface-1 border border-border-subtle px-3 py-1.5 rounded-lg text-text-body hover:text-brand transition-all">
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />} {copied ? "Copied" : "Copy Link"}
                  </button>
                  <button onClick={shareWhatsApp} disabled={!whatsapp} className="flex items-center gap-1.5 text-xs bg-surface-1 border border-border-subtle px-3 py-1.5 rounded-lg text-text-body hover:text-success transition-all disabled:opacity-50">
                    <FiShare2 size={14} /> Share on WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
          </ProGate>

          <ProGate feature="marketing_qr">
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiGrid size={14} className="text-text-faint" />
              <h3 className="text-sm font-medium text-text-primary">QR Code</h3>
            </div>
            <div className="flex gap-2 mb-4">
              {[
                { key: "website", label: "Website", disabled: !websiteUrl },
                { key: "whatsapp", label: "WhatsApp" },
                { key: "product", label: "Product", disabled: !selectedProduct || !publishedIds.has(selectedProduct.id) || !websiteUrl },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setQrType(tab.key)}
                  disabled={tab.disabled}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    qrType === tab.key
                      ? "bg-brand text-white border-brand"
                      : "bg-surface-1 text-text-muted border-border-subtle disabled:opacity-40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-faint mb-3 truncate">Scan to open: {qrUrl || "—"}</p>
            <div className="flex items-center gap-4">
              <div className="bg-surface-1 rounded-xl p-2 border border-border-subtle shrink-0">
                <canvas ref={qrCanvasRef} width={180} height={180} className="block" />
              </div>
              <button onClick={downloadQR} className="flex items-center gap-1.5 text-xs bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-strong transition-all">
                <FiDownload size={14} /> Download PNG
              </button>
            </div>
          </div>
          </ProGate>
        </div>

        {/* WhatsApp + Print Catalog row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiSmartphone size={14} className="text-text-faint" />
              <h3 className="text-sm font-medium text-text-primary">WhatsApp Order Button</h3>
            </div>
            <p className="text-xs text-text-faint mb-2">
              Number: <span className="font-mono text-text-body">{whatsappNumber || "Not set"}</span>
              <Link to="/settings" className="text-brand ml-2 hover:underline">Edit</Link>
            </p>
            <div className="bg-surface-0 rounded-lg p-4 border border-border-subtle mb-3">
              <p className="text-xs text-text-faint mb-2">Preview</p>
              {whatsappNumber ? (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-success text-success-contrast text-sm px-5 py-2.5 rounded-xl hover:bg-success-600 transition-all font-medium"
                >
                  <FiSmartphone size={16} /> Order Now via WhatsApp
                </a>
              ) : (
                <p className="text-xs text-text-faint italic">Set your WhatsApp number in Settings.</p>
              )}
            </div>
            <button onClick={testWhatsApp} className="flex items-center gap-1.5 text-xs text-brand hover:underline">
              <FiExternalLink size={14} /> Test link
            </button>
          </div>

          <ProGate feature="marketing_print">
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiFileText size={14} className="text-text-faint" />
              <h3 className="text-sm font-medium text-text-primary">Print Catalog</h3>
            </div>
            <p className="text-xs text-text-faint mb-3">
              {filteredProducts.length} product(s){products.length === 100 ? " (showing first 100)" : ""}. Includes badges and sale prices.
            </p>
            <button
              onClick={printCatalog}
              disabled={filteredProducts.length === 0}
              className="flex items-center gap-2 bg-brand text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-strong transition-all disabled:opacity-50"
            >
              <FiFileText size={16} /> Generate & Print
            </button>
          </div>
          </ProGate>
        </div>

      </>
      )}
    </PageLayout>
    </>
  );
}
