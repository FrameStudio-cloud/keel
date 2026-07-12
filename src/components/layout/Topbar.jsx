import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { CiBellOn, CiSearch, CiMenuBurger } from "react-icons/ci";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { CRITICAL_STOCK_THRESHOLD } from "../../lib/constants";
import { AuthContext } from "../../context/AuthContext";
import { useSettings } from "../../hooks/useSettings";
import { useLowStockProducts } from "../../hooks/useQueries";

export default function Topbar({ title, searchQuery, setSearchQuery, onToggleSidebar }) {
  const { storeName } = useSettings();
  const { data: lowStock = [] } = useLowStockProducts();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const { logout } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

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
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (notifOpen || profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [notifOpen, profileOpen]);

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

      <div className="flex items-center gap-1">
        {setSearchQuery && (
          <>
            <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isSearchOpen ? "w-52 opacity-100" : "w-0 opacity-0"}`}>
              {isSearchOpen && (
                <div className="relative">
                  <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" size={16} />
                  <input
                    type="text"
                    value={searchQuery || ""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, expenses..."
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Escape") { setSearchQuery(""); setIsSearchOpen(false); } }}
                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-full focus:outline-none focus:border-blue-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => { setIsSearchOpen((v) => !v); if (isSearchOpen) setSearchQuery(""); }}
              aria-label={isSearchOpen ? "Close search" : "Open search"}
              aria-expanded={isSearchOpen}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-400 transition-all flex-shrink-0"
            >
              {isSearchOpen ? <FiX size={18} /> : <CiSearch />}
            </button>
          </>
        )}

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

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:bg-blue-500 transition-colors"
            aria-label={storeName || "Store"}
            aria-expanded={profileOpen}
          >
            {storeName ? storeName[0].toUpperCase() : "S"}
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{storeName}</p>
              </div>
              <button
                onClick={() => { navigate("/profile"); setProfileOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => { logout(); setProfileOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-slate-100 dark:border-white/10"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
