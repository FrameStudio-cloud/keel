import { NavLink } from "react-router-dom";
import { GoGraph } from "react-icons/go";
import { FaBoxOpen } from "react-icons/fa";
import { FcSalesPerformance } from "react-icons/fc";
import { MdOutlinePhoneIphone } from "react-icons/md";
import { IoGlobeOutline, IoRocketOutline, IoSettingsOutline, IoPersonOutline, IoTimeOutline, IoWalletOutline, IoStatsChartOutline, IoMegaphoneOutline } from "react-icons/io5";
import { BsBuildingsFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";

const groups = [
  {
    label: "Operations",
    items: [
      { label: "Overview", icon: <GoGraph />, path: "/" },
      { label: "Inventory", icon: <FaBoxOpen />, path: "/inventory" },
      { label: "Sales", icon: <FcSalesPerformance />, path: "/sales" },
      { label: "Finance", icon: <IoWalletOutline />, path: "/finance" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Social Media", icon: <MdOutlinePhoneIphone />, path: "/social" },
      { label: "Bots", icon: <IoRocketOutline />, path: "/bots" },
      { label: "Website", icon: <IoGlobeOutline />, path: "/website" },
      { label: "Marketing", icon: <IoMegaphoneOutline />, path: "/marketing" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Stock History", icon: <IoTimeOutline />, path: "/stock-history" },
      { label: "Reports", icon: <IoStatsChartOutline />, path: "/reports" },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [storeName, setStoreName] = useState("");

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

  useEffect(() => {
    async function fetchLowStock() {
      const shopId = await getShopId();

      const { data: settings } = await supabase
        .from("store_settings")
        .select("low_stock_threshold")
        .eq("shop_id", shopId)
        .maybeSingle();

      const threshold = settings?.low_stock_threshold ?? 6;

      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId)
        .lte("stock", threshold);

      setLowStockCount(count);
    }
    fetchLowStock();
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
          w-56 h-screen bg-white dark:bg-[#16213e] border-r border-gray-100 dark:border-white/10
          flex flex-col flex-shrink-0
          fixed lg:static z-40 inset-y-0 left-0
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-100 dark:border-white/10">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
          <BsBuildingsFill />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-white">Keel</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">Shop Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {groups.map((group, gi) => (
          <div key={group.label}>
            <p
              data-tour={`group-${group.label}`}
              className={`text-xs font-medium text-gray-400 dark:text-slate-500 px-2 pb-1 uppercase tracking-wider ${gi === 0 ? "pt-2" : "pt-4"}`}
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
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-800 dark:hover:text-white"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.label === "Inventory" && lowStockCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {lowStockCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
        <p className="text-xs font-medium text-gray-400 dark:text-slate-500 px-2 pt-4 pb-1 uppercase tracking-wider">
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
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-800 dark:hover:text-white"
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
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-800 dark:hover:text-white"
            }`
          }
        >
          <IoPersonOutline />
          <span className="flex-1">Profile</span>
        </NavLink>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
            {storeName ? storeName[0].toUpperCase() : "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
              {storeName || "My Store"}
            </p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}

