import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";
import LogSaleModal from "../components/LogSaleModal";
import { supabase } from "../lib/supabase";

export default function Sales() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
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
        <p className="text-sm text-gray-400">{filteredSales.length} transactions</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          + Log sale
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-sm text-gray-400 p-6">Loading sales...</p>
        ) : sales.length === 0 ? (
          <p className="text-sm text-gray-400 p-6">
            No sales yet. Log your first one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Item
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Qty
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Method
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Amount
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {s.product_name}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {formatDate(s.created_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{s.quantity}</td>
                  <td className="px-4 py-3 text-gray-400">{s.method}</td>
                  <td className="px-4 py-3 font-medium text-blue-700">
                    KSh {s.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label="Paid" color="green" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <LogSaleModal
          onClose={() => setShowModal(false)}
          onAdded={fetchSales}
        />
      )}
    </PageLayout>
  );
}
