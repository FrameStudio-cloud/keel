import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";
import AddProductModal from "../components/AddProductModal";
import { supabase } from "../lib/supabase";

function getStatus(stock) {
  if (stock <= 2) return { label: "Critical", color: "red" };
  if (stock <= 6) return { label: "Low stock", color: "amber" };
  return { label: "In stock", color: "green" };
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }

  return (
    <PageLayout title="Inventory">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">{products.length} products</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          + Add product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-sm text-gray-400 p-6">Loading products...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Product
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Price
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Stock
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const status = getStatus(p.stock);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{p.category}</td>
                    <td className="px-4 py-3 text-gray-800">
                      KSh {p.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{p.stock}</td>
                    <td className="px-4 py-3">
                      <Badge label={status.label} color={status.color} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAdded={fetchProducts}
        />
      )}
    </PageLayout>
  );
}
