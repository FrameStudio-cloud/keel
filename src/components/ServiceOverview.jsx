import { useState, useEffect } from "react";
import { FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import StatCard from "./StatCard";
import { formatPrice } from "../lib/format";
import { fetchOrders, fetchOrderCounts } from "../lib/serviceData";

export default function ServiceOverview() {
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, in_progress: 0, ready: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await fetchOrders({ pageSize: 100 });
        setOrders(result.data);
        const c = await fetchOrderCounts();
        setCounts(c);
      } catch (e) {
        console.error("Failed to fetch orders:", e);
      }
      setLoading(false);
    })();
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "in_progress");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Orders today", value: todayOrders.length, icon: FiShoppingBag, change: `${todayOrders.filter((o) => o.status === "pending").length} pending`, up: todayOrders.length > 0 },
    { label: "Active orders", value: activeOrders.length, icon: FiClock, change: `${activeOrders.filter((o) => o.status === "in_progress").length} in progress`, up: activeOrders.length > 0 },
    { label: "Completed", value: counts.completed, icon: FiCheckCircle, change: `${counts.ready} ready for pickup`, up: counts.completed > 0 },
    { label: "Total revenue", value: formatPrice(revenue), icon: FiDollarSign, change: `${counts.completed} completed orders`, up: revenue > 0 },
    { label: "Cancelled", value: counts.cancelled, icon: FiXCircle, change: "Cancelled orders", up: false },
  ];

  if (loading) {
    return (
      <>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3">Orders Overview</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-32 bg-white/5 rounded-xl animate-pulse mb-6" />
      </>
    );
  }

  return (
    <>
      <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3">Orders Overview</p>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} change={s.change} up={s.up} />
        ))}
      </div>

      <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3">Recent Activity</p>
      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400 dark:text-slate-500">No orders yet</div>
        ) : (
          <div className="space-y-1 p-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a2e] rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <FiShoppingBag className="text-blue-600 dark:text-blue-400" size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{order.customer.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{order.items.length} item{(order.items.length > 1 ? "s" : "")} · {order.id}</p>
                </div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatPrice(order.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
