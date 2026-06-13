import { useState, useEffect, useRef, useCallback } from "react";
import { CiBellOn, CiSearch, CiMenuBurger } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";
import { CRITICAL_STOCK_THRESHOLD } from "../../lib/constants";

export default function Topbar({ title, searchQuery, setSearchQuery, onToggleSidebar }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lowStock, setLowStock] = useState([]);
  const [storeName, setStoreName] = useState("");
  const notifRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      if (!shopId) return;
      const { data } = await supabase
        .from("store_settings")
        .select("store_name")
        .eq("shop_id", shopId)
        .maybeSingle();
      if (data?.store_name) setStoreName(data.store_name);
    })();
  }, []);

  async function fetchLowStock() {
    const shopId = await getShopId();
    if (!shopId) return;

    const { data: settings } = await supabase
      .from("store_settings")
      .select("low_stock_threshold")
      .eq("shop_id", shopId)
      .maybeSingle();

    const threshold = settings?.low_stock_threshold ?? 6;

    const { data } = await supabase
      .from("products")
      .select("id, name, stock")
      .eq("shop_id", shopId)
      .lte("stock", threshold)
      .order("stock", { ascending: true });

    setLowStock(data || []);
  }

  useEffect(() => {
    const timer = setTimeout(fetchLowStock, 0);
    const interval = setInterval(fetchLowStock, 30000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setNotifOpen(false);
    }
    if (notifOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [notifOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [notifOpen]);

  const handleNotifToggle = useCallback(() => setNotifOpen((v) => !v), []);

  return (
    <header className="h-14 bg-white dark:bg-[#16213e] border-b border-gray-100 dark:border-white/10 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
          aria-label="Open menu"
        >
          <CiMenuBurger />
        </button>
        <h1 className="text-sm font-medium text-gray-800 dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {isSearchOpen && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            autoFocus
            className="text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-blue-400 dark:focus:border-blue-300 bg-slate-100 dark:bg-[#1a1a2e] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
        )}

        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label={isSearchOpen ? "Close search" : "Open search"}
          aria-expanded={isSearchOpen}
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-400 transition-all"
        >
          <CiSearch />
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifToggle}
            aria-label={notifOpen ? "Close notifications" : `${lowStock.length} low stock alerts`}
            aria-expanded={notifOpen}
            data-tour="notifications"
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-400 transition-all relative"
          >
            <CiBellOn />
            {lowStock.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none shadow-md">
                {lowStock.length > 9 ? "9+" : lowStock.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Low Stock Alerts
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lowStock.length} product{lowStock.length !== 1 ? "s" : ""} below threshold
                </p>
              </div>
              {lowStock.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                  All products are well stocked
                </div>
              ) : (
                lowStock.map((p) => {
                  const critical = p.stock <= CRITICAL_STOCK_THRESHOLD;
                  return (
                    <button
                      key={p.id}
                      onClick={() => { navigate(`/inventory`); setNotifOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors border-b border-slate-50 dark:border-white/5 last:border-0"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${critical ? "bg-red-500" : "bg-amber-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Stock: {p.stock}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        critical
                          ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }`}>
                        {critical ? "Critical" : "Low"}
                      </span>
                    </button>
                  );
                })
              )}
              {lowStock.length > 0 && (
                <button
                  onClick={() => { navigate(`/inventory`); setNotifOpen(false); }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-b-xl transition-colors"
                >
                  View all in Inventory
                </button>
              )}
            </div>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium cursor-pointer" aria-label={storeName || "Store"}>
          {storeName ? storeName[0].toUpperCase() : "S"}
        </div>
      </div>
    </header>
  );
}
