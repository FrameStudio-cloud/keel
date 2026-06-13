import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import StockAdjustModal from "../components/StockAdjustModal";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { useSettings } from "../hooks/useSettings";
import { CRITICAL_STOCK_THRESHOLD } from "../lib/constants";

export default function Inventory() {
  const { lowStockThreshold } = useSettings();
  const threshold = lowStockThreshold || 6;

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

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <PageLayout
      title="Inventory"
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400 dark:text-slate-500">
          {filteredProducts.length} products
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
          <p className="text-sm text-gray-400 dark:text-slate-500 p-6">Loading products...</p>
        ) : (
          <>
            <div className="sm:hidden space-y-2 p-3">
              {filteredProducts.map((p) => {
                const status = getStatus(p.stock);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-slate-50 dark:bg-[#1a1a2e] rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{p.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{p.category}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge label={status.label} color={status.color} />
                        <span className="text-xs text-slate-600 dark:text-slate-400">Stock: {p.stock}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                        KSh {p.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 justify-end">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setAdjustProduct(p)}
                          className="text-xs text-slate-600 dark:text-slate-400 hover:underline"
                        >
                          Stock
                        </button>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const status = getStatus(p.stock);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{p.name}</td>
                      <td className="px-4 py-3 text-gray-400 dark:text-slate-500">{p.category}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-white">
                        KSh {p.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-white">{p.stock}</td>
                      <td className="px-4 py-3">
                        <Badge label={status.label} color={status.color} />
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
          </>
        )}
      </div>

      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAdded={fetchProducts}
        />
      )}

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdated={fetchProducts}
        />
      )}

      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onAdjusted={fetchProducts}
        />
      )}
    </PageLayout>
  );
}
