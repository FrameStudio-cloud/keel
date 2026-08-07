import SectionCard from "../settings/SectionCard";
import { FiMail, FiDollarSign, FiCreditCard, FiMonitor, FiClock } from "react-icons/fi";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-2 dark:bg-white/[0.03]">
      <Icon size={14} className="text-text-faint shrink-0" />
      <span className="text-xs text-text-faint">{label}</span>
      <span className="text-sm font-medium text-text-primary ml-auto">{value || "—"}</span>
    </div>
  );
}

export default function ProfileAccountTab({ userEmail, currencySymbol, defaultPayment, theme, subscriptionExpiresAt }) {
  return (
    <>
      <SectionCard icon={FiMail} title="Account">
        <div className="flex flex-col gap-2">
          <InfoRow icon={FiMail} label="Email" value={userEmail} />
          <InfoRow icon={FiDollarSign} label="Currency" value={currencySymbol} />
          <InfoRow icon={FiCreditCard} label="Payment" value={defaultPayment} />
          <InfoRow icon={FiMonitor} label="Theme" value={theme?.charAt(0).toUpperCase() + theme?.slice(1)} />
        </div>
      </SectionCard>

      <SectionCard icon={FiClock} title="Subscription">
        {subscriptionExpiresAt ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-faint">Status</span>
              {new Date(subscriptionExpiresAt) > new Date() ? (
                <span className="text-xs font-semibold text-success bg-success-muted border border-success dark:border-green-500/20 rounded-full px-2.5 py-0.5">Active</span>
              ) : (
                <span className="text-xs font-semibold text-danger bg-danger-muted border border-danger rounded-full px-2.5 py-0.5">Expired</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-faint">Expires</span>
              <span className="text-sm font-medium text-text-primary">
                {new Date(subscriptionExpiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-faint">Days remaining</span>
              <span className="text-sm font-medium text-text-primary">
                {Math.max(0, Math.floor((new Date(subscriptionExpiresAt) - new Date()) / 86400000))}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted text-center py-4">No subscription expiry set. Your shop is active.</p>
        )}
      </SectionCard>
    </>
  );
}
