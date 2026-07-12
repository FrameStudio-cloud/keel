import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { FiImage, FiGlobe, FiPackage } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import StockAdjustModal from "../components/StockAdjustModal";
import Pagination from "../components/Pagination";
import { getShopId, withShop } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { paginateQuery } from "../lib/paginate";
import { useDebounce } from "../hooks/useDebounce";
import { useSettings } from "../hooks/useSettings";
import { formatPrice } from "../lib/format";
import { CRITICAL_STOCK_THRESHOLD } from "../lib/constants";

const PAGE_SIZE = 50;

export default function Inventory() {
  const queryClient = useQueryClient();
  const { lowStockThreshold, businessCategory } = useSettings();
  const threshold = lowStockThreshold ?? 6;
  const showBarcode = businessCategory === "electricals" || businessCategory === "electronics";

  function getStatus(stock) {
    if (stock <= CRITICAL_STOCK_THRESHOLD) return { label: "Critical", color: "red" };
    if (stock <= threshold) return { label: "Low stock", color: "amber" };
    return { label: "In stock", color: "green" };
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [publishedMap, setPublishedMap] = useState({});
  const [attributeMap, setAttributeMap] = useState({});
  const [publishingId, setPublishingId] = useState(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const shopId = await getShopId();
      const { data, error, total: count } = await paginateQuery({
        table: "products",
        shopId,
        page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch,
        searchColumns: ["name", "category", "barcode"],
        orderBy: "created_at",
        ascending: false,
      });
      if (cancelled) return;
      if (error) {
        console.error(error);
      } else {
        setProducts(data ?? []);
        setTotal(count);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [page, debouncedSearch, refreshKey]);

  useEffect(() => {
    fetchCatalogue();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const ids = products.map((p) => p.id);
    (async () => {
      const { data } = await supabase
        .from("product_attribute_values")
        .select("product_id, value, attribute:attribute_id(name)")
        .in("product_id", ids);
      if (data) {
        const map = {};
        data.forEach((v) => {
          if (!map[v.product_id]) map[v.product_id] = [];
          map[v.product_id].push(v);
        });
        setAttributeMap(map);
      }
    })();
  }, [products]);

  async function fetchCatalogue() {
    const shopId = await getShopId();
    const { data } = await supabase
      .from("catalogue")
      .select("id, name, product_id")
      .eq("shop_id", shopId);
    if (data) {
      const map = {};
      data.forEach((item) => { if (item.product_id) map[item.product_id] = item; });
      setPublishedMap(map);
    }
  }

  async function handlePublish(product) {
    setPublishingId(product.id);

    const { data: attrVals } = await supabase
      .from("product_attribute_values")
      .select("attribute_id, value, attribute:attribute_id(name)")
      .eq("product_id", product.id);

    let variants = null;
    if (attrVals && attrVals.length > 0) {
      variants = {};
      attrVals.forEach((v) => {
        const name = v.attribute?.name || v.attribute;
        variants[name] = v.value;
      });
    }

    const { data: newItem } = await supabase
      .from("catalogue")
      .insert(withShop({
        name: product.name,
        category: product.category,
        type: "product",
        price: product.price,
        image: product.image || null,
        available: true,
        new_arrival: product.new_arrival || false,
        badge: product.badge || "",
        badge_ends_at: product.badge_ends_at || null,
        sale_price: product.sale_price || null,
        sale_ends_at: product.sale_ends_at || null,
        product_id: product.id,
        variants,
      }))
      .select("id");

    if (newItem && newItem.length > 0 && attrVals && attrVals.length > 0) {
      const catalogueId = newItem[0].id;
      const entries = attrVals.map((v) => ({
        catalogue_id: catalogueId,
        attribute_id: v.attribute_id,
        value: v.value,
      }));
      await supabase.from("catalogue_attribute_values").insert(
        entries.map((e) => withShop(e))
      );
    }

    setPublishingId(null);
    fetchCatalogue();
  }

  async function handleUnpublish(product) {
    const shopId = await getShopId();
    const item = publishedMap[product.id];
    setPublishingId(product.id);
    if (!item) { setPublishingId(null); return; }
    await supabase.from("catalogue").delete().eq("id", item.id).eq("shop_id", shopId);
    setPublishingId(null);
    fetchCatalogue();
  }

  return (
    <PageLayout
      title="Inventory"
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <Helmet><title>Inventory — Keel</title></Helmet>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400 dark:text-slate-500">
          {total} products
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          + Add product
        </button>
      </div>

      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-[#1a1a2e] rounded-xl">
                <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-1/4" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <Skeleton className="h-5 w-16" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-7 w-12 rounded-lg" />
                    <Skeleton className="h-7 w-12 rounded-lg" />
                    <Skeleton className="h-7 w-16 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={FiPackage}
            title="Your inventory is empty"
            description="Add your first product to start tracking stock, prices, and variants."
            actionLabel="Add Product"
            onClick={() => setShowModal(true)}
          />
        ) : (
          <>
            <div className="sm:hidden space-y-2 p-3">
              {products.map((p) => {
                const status = getStatus(p.stock);
                return (
                  <div
                    key={p.id}
                    className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl px-4 py-3"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                          <FiImage size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-900 dark:text-white text-sm font-semibold">{p.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{p.category}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <Badge label={status.label} color={status.color} />
                          <span className="text-xs text-slate-600 dark:text-slate-400">Stock: {p.stock}</span>
                          {p.new_arrival && <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-1.5 py-0.5 rounded">New</span>}
                          {p.badge && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              p.badge === "New" ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20" :
                              p.badge === "Best Seller" ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20" :
                              p.badge === "Sale" ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20" :
                              p.badge === "Hot" ? "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20" :
                              "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20"
                            }`}>{p.badge}</span>
                          )}
                          {showBarcode && p.barcode && (
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{p.barcode}</span>
                          )}
                        </div>
                        {attributeMap[p.id]?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {attributeMap[p.id].map((av, i) => (
                              <span key={i} className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded whitespace-nowrap">
                                {av.attribute?.name}: {av.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 pt-3">
                      <div>
                        {p.sale_price != null ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400 dark:text-slate-500 line-through">{formatPrice(p.price)}</span>
                            <span className="text-red-600 dark:text-red-400 text-base font-bold">{formatPrice(p.sale_price)}</span>
                          </div>
                        ) : (
                          <p className="text-blue-600 dark:text-blue-400 text-base font-bold">{formatPrice(p.price)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#16213e] border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setAdjustProduct(p)}
                          className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#16213e] border border-gray-200 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
                        >
                          Stock
                        </button>
                        {publishedMap[p.id] ? (
                          <button
                            onClick={() => handleUnpublish(p)}
                            disabled={publishingId === p.id}
                            className="px-3 py-1.5 text-xs font-medium bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition-all disabled:opacity-50"
                          >
                            {publishingId === p.id ? "..." : "Published"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(p)}
                            disabled={publishingId === p.id}
                            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#16213e] border border-gray-200 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all disabled:opacity-50"
                          >
                            {publishingId === p.id ? "..." : "Publish"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Category
                  </th>
                  {showBarcode && (
                    <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                      Barcode
                    </th>
                  )}
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Image
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Price
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Stock
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Website
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const status = getStatus(p.stock);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                        {p.name}
                        {p.new_arrival && <span className="ml-2 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-1.5 py-0.5 rounded align-middle">New</span>}
                        {attributeMap[p.id]?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {attributeMap[p.id].map((av, i) => (
                              <span key={i} className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded whitespace-nowrap">
                                {av.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-slate-500">{p.category}</td>
                      {showBarcode && (
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">
                          {p.barcode || "—"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                            <FiImage size={14} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-white">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-white">{p.stock}</td>
                      <td className="px-4 py-3">
                        <Badge label={status.label} color={status.color} />
                      </td>
                      <td className="px-4 py-3">
                        {publishedMap[p.id] ? (
                          <button
                            onClick={() => handleUnpublish(p)}
                            disabled={publishingId === p.id}
                            className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            <FiGlobe size={12} />
                            {publishingId === p.id ? "..." : "Unpublish"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(p)}
                            disabled={publishingId === p.id}
                            className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                          >
                            {publishingId === p.id ? "..." : "Publish"}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setAdjustProduct(p)}
                            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline"
                          >
                            Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </div>

      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAdded={() => { setPage(0); setRefreshKey(k => k + 1); queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] }); queryClient.invalidateQueries({ queryKey: ["lowStockCount"] }); queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] }); }}
        />
      )}

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdated={() => { setRefreshKey(k => k + 1); queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] }); queryClient.invalidateQueries({ queryKey: ["lowStockCount"] }); queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] }); }}
        />
      )}

      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onAdjusted={() => { setRefreshKey(k => k + 1); queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] }); queryClient.invalidateQueries({ queryKey: ["lowStockCount"] }); queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] }); }}
        />
      )}
    </PageLayout>
  );
}
