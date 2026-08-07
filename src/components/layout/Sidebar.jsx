import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { GoGraph } from "react-icons/go";
import { FaBoxOpen } from "react-icons/fa";
import { FcSalesPerformance } from "react-icons/fc";
import { MdOutlineQueue, MdOutlineReceiptLong } from "react-icons/md";
import { IoExtensionPuzzleOutline, IoGlobeOutline, IoSettingsOutline, IoPersonOutline, IoTimeOutline, IoWalletOutline, IoStatsChartOutline, IoMegaphoneOutline, IoStorefrontOutline, IoPeopleOutline, IoGridOutline, IoChatbubblesOutline, IoHelpCircleOutline } from "react-icons/io5";
import { useSettings } from "../../hooks/useSettings";
import { useLowStockCount } from "../../hooks/useQueries";
import { useWhatsAppUnreadCount } from "../../hooks/useWhatsAppInbox";
import { SERVICE_CATEGORIES } from "../../lib/constants";

export default function Sidebar({ open, onClose }) {
  const { storeName, logoUrl, businessCategory } = useSettings();
  const { data: lowStockCount = 0 } = useLowStockCount();
  const { data: unreadCount = 0 } = useWhatsAppUnreadCount();
  const navRef = useRef(null);

  const isService = SERVICE_CATEGORIES.includes(businessCategory);

  const groups = [
    {
      label: "Services",
      show: isService,
      items: [
        { label: "Orders", icon: <MdOutlineReceiptLong />, path: "/orders" },
        { label: "Customers", icon: <IoPeopleOutline />, path: "/customers" },
        { label: "Services", icon: <IoGridOutline />, path: "/services" },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Overview", icon: <GoGraph />, path: "/" },
        ...(isService ? [] : [{ label: "Inventory", icon: <FaBoxOpen />, path: "/inventory" }]),
        ...(isService ? [] : [{ label: "Sales", icon: <FcSalesPerformance />, path: "/sales" }]),
        { label: "Finance", icon: <IoWalletOutline />, path: "/finance" },
      ],
    },
    {
      label: "Marketing",
      items: [
        ...(isService ? [] : [{ label: "Queue", icon: <MdOutlineQueue />, path: "/queue" }]),
        { label: "Website", icon: <IoGlobeOutline />, path: "/website" },
        ...(isService ? [] : [{ label: "Storefront", icon: <IoStorefrontOutline />, path: "/storefront" }]),
        ...(isService ? [] : [{ label: "Marketing", icon: <IoMegaphoneOutline />, path: "/marketing" }]),
      ],
    },
    {
      label: "Connect",
      items: [
        { label: "Integrations", icon: <IoExtensionPuzzleOutline />, path: "/integrations" },
        { label: "Inbox", icon: <IoChatbubblesOutline />, path: "/inbox", badge: unreadCount },
      ],
    },
    {
      label: "Analytics",
      items: [
        ...(isService ? [] : [{ label: "Stock History", icon: <IoTimeOutline />, path: "/stock-history" }]),
        { label: "Reports", icon: <IoStatsChartOutline />, path: "/reports" },
      ],
    },
  ];

  useEffect(() => {
    const saved = sessionStorage.getItem("sidebarScroll");
    if (saved && navRef.current) {
      navRef.current.scrollTop = parseInt(saved, 10);
    }
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    return () => {
      if (nav) {
        sessionStorage.setItem("sidebarScroll", nav.scrollTop);
      }
    };
  }, []);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`
          w-56 h-screen bg-surface-1 border-r border-border-subtle
          flex flex-col flex-shrink-0 overflow-hidden
          fixed lg:static z-40 inset-y-0 left-0
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
      {/* Logo */}
      <NavLink
        to="/"
        onClick={onClose}
        className="h-14 flex items-center gap-3 px-4 border-b border-border-subtle hover:bg-surface-2 transition-colors"
      >
        <img src="/keel-icon.webp" alt="Keel" className="w-7 h-7 object-contain" />
        <div>
          <p className="text-[15px] font-semibold text-text-primary">Keel</p>
          <p className="text-xs text-text-faint">Shop Manager</p>
        </div>
      </NavLink>

      {/* Nav */}
      <nav ref={navRef} className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {groups.filter(g => g.show !== false && g.items.length > 0).map((group, gi) => (
          <div key={group.label}>
            <p
              data-tour={`group-${group.label}`}
              className={`text-xs font-medium text-text-faint px-2 pb-1 uppercase tracking-wider ${gi === 0 ? "pt-2" : "pt-4"}`}
            >
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                data-tour={`nav-${item.label}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                  ${
                    isActive
                      ? "bg-brand-muted text-brand font-medium"
                      : "text-text-muted hover:bg-surface-2 hover:text-text-primary"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.label === "Inventory" && lowStockCount > 0 && (
                  <span className="bg-danger text-danger-contrast text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {lowStockCount}
                  </span>
                )}
                {item.badge > 0 && (
                  <span className="bg-brand text-brand-contrast text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
        <p className="text-xs font-medium text-text-faint px-2 pt-4 pb-1 uppercase tracking-wider">
          Other
        </p>

        <NavLink
          key="/settings"
          to="/settings"
          onClick={onClose}
          data-tour="nav-Settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
            ${
              isActive
                ? "bg-brand-muted text-brand font-medium"
                : "text-text-muted hover:bg-surface-2 hover:text-text-primary"
            }`
          }
        >
          <IoSettingsOutline />
          <span className="flex-1">Settings</span>
        </NavLink>
        <NavLink
          key="/profile"
          to="/profile"
          onClick={onClose}
          data-tour="nav-Profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
            ${
              isActive
                ? "bg-brand-muted text-brand font-medium"
                : "text-text-muted hover:bg-surface-2 hover:text-text-primary"
            }`
          }
        >
          <IoPersonOutline />
          <span className="flex-1">Profile</span>
        </NavLink>
        <NavLink
          key="/docs"
          to="/docs"
          onClick={onClose}
          data-tour="nav-Docs"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
            ${
              isActive
                ? "bg-brand-muted text-brand font-medium"
                : "text-text-muted hover:bg-surface-2 hover:text-text-primary"
            }`
          }
        >
          <IoHelpCircleOutline />
          <span className="flex-1">Help & Docs</span>
        </NavLink>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-brand-contrast text-xs font-medium shrink-0 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              storeName ? storeName[0].toUpperCase() : "S"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {storeName || "My Store"}
            </p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}

