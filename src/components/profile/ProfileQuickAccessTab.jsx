import { useNavigate } from "react-router-dom";
import { FiDollarSign, FiBarChart2, FiGrid, FiSettings, FiLogOut, FiMessageCircle, FiFileText } from "react-icons/fi";

const QUICK_LINKS = [
  { label: "Finance", sub: "Track expenses", icon: FiDollarSign, color: "text-brand", path: "/finance" },
  { label: "Reports", sub: "Profit & loss", icon: FiBarChart2, color: "text-success", path: "/reports" },
  { label: "Marketing", sub: "Share & promote", icon: FiGrid, color: "text-chart-4", path: "/marketing" },
];

export default function ProfileQuickAccessTab({ onSignOutClick }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-text-muted dark:text-text-muted uppercase tracking-wider mb-3">Quick Access</p>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_LINKS.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className="bg-surface-1 border border-border-subtle rounded-xl p-4 text-left hover:border-brand-soft transition-all group"
            >
              <l.icon size={16} className={`${l.color} mb-2`} />
              <p className="text-xs font-semibold text-text-primary">{l.label}</p>
              <p className="text-[10px] text-text-faint mt-0.5">{l.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-text-muted dark:text-text-muted uppercase tracking-wider mb-3">Actions</p>
        <div className="flex flex-col gap-2">
          <ActionButton icon={FiSettings} label="Edit Settings" onClick={() => navigate("/settings")} />
          <ActionButton icon={FiLogOut} label="Sign Out" onClick={onSignOutClick} variant="danger" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-text-muted dark:text-text-muted uppercase tracking-wider mb-3">Links</p>
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
        className="w-full py-2.5 bg-danger-muted border border-danger rounded-xl text-sm text-danger font-semibold hover:bg-danger-muted transition-all flex items-center justify-center gap-2"
      >
        <Icon size={14} />
        {label}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 bg-surface-1 border border-border-subtle rounded-xl text-sm text-text-body font-semibold hover:border-brand-soft hover:text-brand transition-all flex items-center justify-center gap-2"
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
