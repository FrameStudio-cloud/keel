import { NavLink } from "react-router-dom";
import { GoGraph } from "react-icons/go";
import { FaBoxOpen } from "react-icons/fa";
import { FcSalesPerformance } from "react-icons/fc";
import { MdOutlinePhoneIphone } from "react-icons/md";
import { BsBuildingsFill } from "react-icons/bs";

const navItems = [
  { label: "Overview", icon: <GoGraph />, path: "/" },
  { label: "Inventory", icon: <FaBoxOpen />, path: "/inventory", badge: 3 },
  { label: "Sales", icon: <FcSalesPerformance />, path: "/sales" },
  { label: "Social Media", icon: <MdOutlinePhoneIphone />, path: "/social" },
];

const comingSoon = [
  { label: "WhatsApp Bot", icon: "🤖" },
  { label: "My Website", icon: "🌐" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-100">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
          <BsBuildingsFill />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">MithoDash</p>
          <p className="text-xs text-gray-400">Shop Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        <p className="text-xs font-medium text-gray-400 px-2 pt-2 pb-1 uppercase tracking-wider">
          Main
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
              ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <span>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        <p className="text-xs font-medium text-gray-400 px-2 pt-4 pb-1 uppercase tracking-wider">
          Connect
        </p>

        {comingSoon.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 cursor-not-allowed"
          >
            <span>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
            SH
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              Shop Owner
            </p>
            <p className="text-xs text-gray-400">Phone Accessories</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

