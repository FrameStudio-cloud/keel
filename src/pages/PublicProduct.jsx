import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/format";
import Skeleton from "../components/Skeleton";
import { FiSmartphone, FiShare2, FiCheck, FiArrowLeft } from "react-icons/fi";

export default function PublicProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      let { data: item } = await supabase
        .from("catalogue")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!item) { setNotFound(true); setLoading(false); return; }

      setProduct(item);

      const { data: store } = await supabase
        .from("store_settings")
        .select("store_name, currency_symbol, whatsapp")
        .eq("shop_id", item.shop_id)
        .maybeSingle();

      if (store) setSettings(store);

      setLoading(false);
    })();
  }, [id]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  function shareWhatsApp() {
    if (!settings.whatsapp) return;
    const phone = settings.whatsapp.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hi! I'd like to order ${product.name} — ${formatPrice(product.price)}\n${window.location.href}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e]">
        <div className="max-w-lg mx-auto px-4 py-8">
          <Skeleton className="h-4 w-24 mb-6" />
          <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-20 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg font-medium text-gray-800 dark:text-white">Product not found</p>
        <p className="text-sm text-gray-400">This product may have been removed or is unavailable.</p>
      </div>
    );
  }

  const specs = Array.isArray(product.specs) ? product.specs : [];
  const includes = Array.isArray(product.includes) ? product.includes : [];

  return (
    <>
      <Helmet><title>{product ? `${product.name} — ${settings.store_name || "Keel"}` : "Product — Keel"}</title></Helmet>
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-6 transition-all"
        >
          <FiArrowLeft size={14} /> Back to store
        </a>

        <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
          {product.image && (
            <div className="aspect-square bg-gray-50 dark:bg-[#1a1a2e]">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {product.new_arrival && (
                    <span className="inline-block bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-md">
                      New Arrival
                    </span>
                  )}
                  {(() => {
                    const badgeColors = {
                      "New": "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
                      "Best Seller": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                      "Sale": "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
                      "Hot": "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
                    };
                    if (!product.badge) return null;
                    return (
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${badgeColors[product.badge] || "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"}`}>
                        {product.badge}
                      </span>
                    );
                  })()}
                </div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h1>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 capitalize">{product.category} · {product.type}</p>
              </div>
            </div>

            <div className="mt-3">
              {product.sale_price != null ? (
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatPrice(product.sale_price)}
                  </p>
                  <p className="text-base text-gray-400 dark:text-slate-500 line-through">
                    {formatPrice(product.price)}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(product.price)}
                </p>
              )}
              {product.price_label && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{product.price_label}</p>
              )}
              {product.sale_ends_at && (
                <p className="text-[11px] text-orange-500 dark:text-orange-400 mt-1">
                  Sale ends {new Date(product.sale_ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
              {product.badge && product.badge_ends_at && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
                  "{product.badge}" badge expires {new Date(product.badge_ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-4">{product.description}</p>
            )}

            {specs.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">Specifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {specs.map((s, i) => (
                    <span key={i} className="bg-gray-100 dark:bg-[#1a1a2e] text-gray-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-white/10">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {includes.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">What's Included</p>
                <ul className="space-y-1">
                  {includes.map((inc, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                      <FiCheck size={14} className="text-green-500 flex-shrink-0" /> {inc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!product.available && (
              <div className="mt-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-400">
                Currently unavailable
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={shareWhatsApp}
                disabled={!settings.whatsapp}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white text-sm py-2.5 rounded-xl hover:bg-green-600 transition-all font-medium disabled:opacity-50"
              >
                <FiSmartphone size={16} /> Order Now
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-4 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
              >
                <FiShare2 size={16} />
                {copied ? "Copied!" : "Share"}
              </button>
            </div>
          </div>
        </div>

        {settings.store_name && (
          <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
            {settings.store_name} · Powered by Keel
          </p>
        )}
      </div>
    </div>
    </>
  );
}
