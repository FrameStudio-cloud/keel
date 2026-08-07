import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { CiBellOn, CiSearch, CiMenuBurger } from "react-icons/ci";
import { FiX, FiUser, FiSettings, FiGlobe, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { CRITICAL_STOCK_THRESHOLD } from "../../lib/constants";
import { AuthContext } from "../../context/AuthContext";
import { useSettings } from "../../hooks/useSettings";
import { useLowStockProducts, useUpcomingScheduledPosts } from "../../hooks/useQueries";

export default function Topbar({ title, searchQuery, setSearchQuery, onToggleSidebar }) {
  const { storeName, logoUrl, websiteUrl } = useSettings();
  const { data: lowStock = [] } = useLowStockProducts();
  const { data: upcomingPosts = [] } = useUpcomingScheduledPosts();
  const notificationCount = lowStock.length + upcomingPosts.length;
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
    <header className="h-14 bg-surface-1 border-b border-border-subtle flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 transition-all"
          aria-label="Open menu"
        >
          <CiMenuBurger />
        </button>
        <h1 className="text-sm font-medium text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {setSearchQuery && (
          <>
            <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isSearchOpen ? "w-52 opacity-100" : "w-0 opacity-0"}`}>
              {isSearchOpen && (
                <div className="relative">
                  <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" size={16} />
                  <input
                    type="text"
                    value={searchQuery || ""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, expenses..."
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Escape") { setSearchQuery(""); setIsSearchOpen(false); } }}
                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-2 border border-border-subtle rounded-full focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-text-primary placeholder-text-faint transition-all"
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => { setIsSearchOpen((v) => !v); if (isSearchOpen) setSearchQuery(""); }}
              aria-label={isSearchOpen ? "Close search" : "Open search"}
              aria-expanded={isSearchOpen}
              className="w-8 h-8 rounded-lg border border-border-subtle flex items-center justify-center text-text-muted hover:bg-brand-muted hover:text-brand hover:border-brand-soft transition-all flex-shrink-0"
            >
              {isSearchOpen ? <FiX size={18} /> : <CiSearch />}
            </button>
          </>
        )}

        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifToggle}
            aria-label={notifOpen ? "Close notifications" : `${notificationCount} notification${notificationCount !== 1 ? "s" : ""}`}
            aria-expanded={notifOpen}
            data-tour="notifications"
            className="w-8 h-8 rounded-lg border border-border-subtle flex items-center justify-center text-text-muted hover:bg-brand-muted hover:text-brand hover:border-brand-soft transition-all relative"
          >
            <CiBellOn />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-danger text-danger-contrast text-[10px] font-bold rounded-full px-1 leading-none shadow-md">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-16px)] bg-surface-1 border border-border-subtle rounded-xl shadow-pop z-50 max-h-[32rem] overflow-y-auto">
              {/* Upcoming scheduled posts */}
              {upcomingPosts.length > 0 && (
                <>
                  <div className="px-4 py-3 border-b border-border-subtle">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-text-primary">
                        Upcoming Posts
                      </p>
                      <span className="text-[10px] font-medium text-brand bg-brand-muted px-1.5 py-0.5 rounded-full">
                        {upcomingPosts.length} this week
                      </span>
                    </div>
                  </div>
                  {upcomingPosts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { navigate("/social"); setNotifOpen(false); }}
                      className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-surface-2 transition-colors border-b border-border-subtle last:border-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-brand-soft mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-muted">
                          {new Date(p.scheduled_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {p.platform}
                        </p>
                        <p className="text-sm text-text-primary truncate mt-0.5">
                          {p.caption || "No caption"}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Low stock alerts */}
              <div className={`px-4 py-3 border-b border-border-subtle ${upcomingPosts.length > 0 ? "" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">
                    Low Stock Alerts
                  </p>
                  <span className="text-[10px] font-medium text-danger bg-danger-muted px-1.5 py-0.5 rounded-full">
                    {lowStock.length}
                  </span>
                </div>
              </div>
              {lowStock.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-text-faint">
                  All products are well stocked
                </div>
              ) : (
                lowStock.map((p) => {
                  const critical = p.stock <= CRITICAL_STOCK_THRESHOLD;
                  return (
                    <button
                      key={p.id}
                      onClick={() => { navigate("/inventory"); setNotifOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2 transition-colors border-b border-border-subtle last:border-0"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${critical ? "bg-danger" : "bg-warning"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          Stock: {p.stock}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        critical
                          ? "bg-danger-muted text-danger"
                          : "bg-warning-muted text-warning"
                      }`}>
                        {critical ? "Critical" : "Low"}
                      </span>
                    </button>
                  );
                })
              )}
              {lowStock.length > 0 && (
                <button
                  onClick={() => { navigate("/inventory"); setNotifOpen(false); }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-brand hover:bg-surface-2 rounded-b-xl transition-colors"
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
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-border-subtle hover:bg-surface-2 transition-all"
            aria-label={storeName || "Store"}
            aria-expanded={profileOpen}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-brand-contrast text-xs font-medium shrink-0">
                {storeName ? storeName[0].toUpperCase() : "K"}
              </div>
            )}
            <span className="text-sm font-medium text-text-body hidden sm:inline max-w-[100px] truncate">
              {storeName || "Keel"}
            </span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-1 border border-border-subtle rounded-xl shadow-pop z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border-subtle">
                <p className="text-sm font-semibold text-text-primary truncate">{storeName || "Keel"}</p>
              </div>
              <button
                onClick={() => { navigate("/profile"); setProfileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-text-body hover:bg-surface-2 transition-colors"
              >
                <FiUser className="shrink-0" size={14} />
                Profile
              </button>
              <button
                onClick={() => { navigate("/settings"); setProfileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-text-body hover:bg-surface-2 transition-colors"
              >
                <FiSettings className="shrink-0" size={14} />
                Settings
              </button>
              {websiteUrl && (
                <a
                  href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-text-body hover:bg-surface-2 transition-colors"
                >
                  <FiGlobe className="shrink-0" size={14} />
                  Visit Website
                </a>
              )}
              <button
                onClick={() => { logout(); setProfileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-danger hover:bg-danger-muted transition-colors border-t border-border-subtle"
              >
                <FiLogOut className="shrink-0" size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
