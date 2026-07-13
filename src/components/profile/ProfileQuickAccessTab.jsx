import { useNavigate } from "react-router-dom";
import { FiDollarSign, FiBarChart2, FiGrid, FiSettings, FiLogOut, FiMessageCircle, FiFileText } from "react-icons/fi";

const QUICK_LINKS = [
  { label: "Finance", sub: "Track expenses", icon: FiDollarSign, color: "text-blue-500", path: "/finance" },
  { label: "Reports", sub: "Profit & loss", icon: FiBarChart2, color: "text-green-500", path: "/reports" },
  { label: "Marketing", sub: "Share & promote", icon: FiGrid, color: "text-purple-500", path: "/marketing" },
];

export default function ProfileQuickAccessTab({ onSignOutClick }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">Quick Access</p>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_LINKS.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-left hover:border-blue-300 dark:hover:border-blue-500/50 transition-all group"
            >
              <l.icon size={16} className={`${l.color} mb-2`} />
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{l.label}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{l.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">Actions</p>
        <div className="flex flex-col gap-2">
          <ActionButton icon={FiSettings} label="Edit Settings" onClick={() => navigate("/settings")} />
          <ActionButton icon={FiLogOut} label="Sign Out" onClick={onSignOutClick} variant="danger" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">Links</p>
        <div className="flex flex-col gap-2">
          <ActionButton icon={FiMessageCircle} label="Support" onClick={() => window.open("https://framestudio.co.ke/support", "_blank")} />
          <ActionButton icon={FiFileText} label="Terms of Service" onClick={() => navigate("/terms")} />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, variant }) {
  if (variant === "danger") {
    return (
      <button
        onClick={onClick}
        className="w-full py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
      >
        <Icon size={14} />
        {label}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-semibold hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2"
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
