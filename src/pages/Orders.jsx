import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { FiShoppingBag, FiPlus, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useDebounce } from "../hooks/useDebounce";
import { MdOutlineReceiptLong } from "react-icons/md";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import NewOrderModal from "../components/NewOrderModal";
import EditOrderModal from "../components/EditOrderModal";
import ReceiptModal from "../components/ReceiptModal";
import { useToast } from "../context/ToastProvider";
import { formatPrice } from "../lib/format";
import { fetchOrders, createOrder, updateOrderStatus, updateOrder, fetchOrderCounts } from "../lib/serviceData";

const statusBadgeColors = {
  pending: "amber",
  in_progress: "blue",
  ready: "green",
  completed: "green",
  cancelled: "red",
};

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const tabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Orders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, in_progress: 0, ready: 0, completed: 0, cancelled: 0 });
  const [activeTab, setActiveTab] = useState("all");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebounce(searchQuery);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await fetchOrders({ status: activeTab === "all" ? undefined : activeTab, pageSize: 200, search: debouncedSearch });
        setOrders(result.data);
        const c = await fetchOrderCounts();
        setCounts(c);
      } catch (e) {
        console.error("Failed to fetch orders:", e);
      }
      setLoading(false);
    })();
  }, [activeTab, debouncedSearch, refreshKey]);

  const countsDisplay = {
    all: counts.all,
    pending: counts.pending,
    in_progress: counts.in_progress,
    ready: counts.ready,
    completed: counts.completed,
    cancelled: counts.cancelled,
  };

  return (
    <PageLayout title="Orders" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Helmet><title>Orders — Keel</title></Helmet>

      <div className="flex justify-center mb-5">
        <button
          onClick={() => setShowNewOrder(true)}
          className="flex items-center justify-center gap-3 bg-blue-600 text-white font-medium text-base px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.97] w-full sm:w-auto"
        >
          <FiPlus size={22} />
          <span>New order</span>
        </button>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-[#16213e] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
            }`}
          >
            {tab.label}
            <span className={`text-xs ${activeTab === tab.key ? "text-white/70" : "text-gray-400 dark:text-slate-500"}`}>({countsDisplay[tab.key]})</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        {loading ? (
          <div className="space-y-1 p-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-50 dark:bg-[#1a1a2e] rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={FiShoppingBag}
            title="No orders here"
            description={activeTab === "all" ? "Create your first order to get started." : `No orders with status "${statusLabels[activeTab]}".`}
            actionLabel={activeTab === "all" ? "New Order" : undefined}
            onClick={activeTab === "all" ? () => setShowNewOrder(true) : undefined}
          />
        ) : (
          <div className="space-y-1 p-3">
            {orders.map((order) => {
              const expanded = expandedOrder === order.id;
              return (
                <div key={order.id} className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl">
                  <div
                    onClick={() => setExpandedOrder(expanded ? null : order.id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <MdOutlineReceiptLong className="text-blue-600 dark:text-blue-400" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{order.customer.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{order.id} · {order.customer.phone} · {formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right text-xs shrink-0">
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{formatPrice(order.total)}</p>
                      <p className="text-gray-400">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                    </div>
                    <Badge label={statusLabels[order.status]} color={statusBadgeColors[order.status]} />
                    <span className="text-gray-300 dark:text-slate-600">
                      {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </span>
                  </div>

                  {expanded && (
                    <div className="px-4 pb-3 pt-0 border-t border-gray-100 dark:border-white/5">
                      <div className="mt-2 space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-[#16213e]">
                            <div className="min-w-0 flex-1">
                              <p className="text-gray-700 dark:text-slate-300 font-medium">
                                {item.service_name} <span className="text-gray-400 font-normal">×{item.quantity}</span>
                              </p>
                              {item.weight_kg && <p className="text-gray-400 dark:text-slate-500">{item.weight_kg} kg</p>}
                              {item.notes && <p className="text-gray-400 dark:text-slate-500 italic">"{item.notes}"</p>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          <span>Total: {formatPrice(order.total)}</span>
                          {order.notes && <span className="ml-3 italic">"{order.notes}"</span>}
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-1.5 w-full sm:w-auto">
                          <button onClick={() => setEditingOrder(order)} className="px-3 py-2 sm:py-1.5 text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all">Edit</button>
                          {(order.status === "completed" || order.status === "ready") && (
                            <button onClick={() => setReceiptOrder(order)} className="px-3 py-2 sm:py-1.5 text-xs font-medium border border-gray-200 dark:border-white/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all">Receipt</button>
                          )}
                          {order.status === "pending" && (
                            <button onClick={async () => { await updateOrderStatus(order.id, "in_progress"); showToast("Order started", "success"); setRefreshKey(k => k + 1); }} className="px-3 py-2 sm:py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all col-span-full sm:col-auto">Start</button>
                          )}
                          {order.status === "in_progress" && (
                            <button onClick={async () => { await updateOrderStatus(order.id, "ready"); showToast("Order ready for pickup", "success"); setRefreshKey(k => k + 1); }} className="px-3 py-2 sm:py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all col-span-full sm:col-auto">Mark Ready</button>
                          )}
                          {order.status === "ready" && (
                            <button onClick={async () => { await updateOrderStatus(order.id, "completed"); showToast("Order completed", "success"); setRefreshKey(k => k + 1); }} className="px-3 py-2 sm:py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all col-span-full sm:col-auto">Complete</button>
                          )}
                          {(order.status === "pending" || order.status === "in_progress") && (
                            <button onClick={async () => { await updateOrderStatus(order.id, "cancelled"); showToast("Order cancelled", "warning"); setRefreshKey(k => k + 1); }} className="px-3 py-2 sm:py-1.5 text-xs font-medium border border-red-200 dark:border-red-500/20 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">Cancel</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNewOrder && (
        <NewOrderModal
          onSave={async (data) => { await createOrder(data); setShowNewOrder(false); showToast("Order created", "success"); setRefreshKey(k => k + 1); }}
          onClose={() => setShowNewOrder(false)}
        />
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onSave={async (id, data) => { await updateOrder(id, data); showToast("Order updated", "success"); setRefreshKey(k => k + 1); }}
          onClose={() => setEditingOrder(null)}
        />
      )}

      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </PageLayout>
  );
}
