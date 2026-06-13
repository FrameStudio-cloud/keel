import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";
import LogSaleModal from "../components/LogSaleModal";
import ReceiptModal from "../components/ReceiptModal";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";

export default function Sales() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setSales(data);
    }
    setLoading(false);
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

      
  }
const filteredSales = sales.filter(
  (s) =>
    s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.method.toLowerCase().includes(searchQuery.toLowerCase()),
);
  return (
    <PageLayout title="Sales" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400 dark:text-slate-500">{filteredSales.length} transactions</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          + Log sale
        </button>
      </div>

      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        {loading ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 p-6">Loading sales...</p>
        ) : sales.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 p-6">
            No sales yet. Log your first one.
          </p>
        ) : (
          <>
            <div className="sm:hidden space-y-2 p-3">
              {filteredSales.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setReceiptSale(s)}
                  className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl px-4 py-3 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{s.product_name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{formatDate(s.created_at)}</p>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex-shrink-0 ml-3">
                      KSh {s.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Qty: {s.quantity}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">· {s.method}</span>
                    <Badge label="Paid" color="green" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setReceiptSale(s); }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-auto"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Item
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Qty
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Method
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">
                    Amount
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
                {filteredSales.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setReceiptSale(s)}
                    className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                      {s.product_name}
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-slate-500">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-slate-500">{s.quantity}</td>
                    <td className="px-4 py-3 text-gray-400 dark:text-slate-500">{s.method}</td>
                    <td className="px-4 py-3 font-medium text-blue-700 dark:text-blue-400">
                      KSh {s.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label="Paid" color="green" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setReceiptSale(s); }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {showModal && (
        <LogSaleModal
          onClose={() => setShowModal(false)}
          onAdded={fetchSales}
        />
      )}

      {receiptSale && (
        <ReceiptModal
          sale={receiptSale}
          onClose={() => setReceiptSale(null)}
        />
      )}
    </PageLayout>
  );
}
