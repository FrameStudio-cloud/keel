import PageLayout from "../components/layout/PageLayout";
import { useSettings } from "../hooks/useSettings";

export default function Profile() {
  const {
    storeName,
    storePhone,
    storeAddress,
    websiteUrl,
    whatsapp,
    businessCategory,
  } = useSettings();

  return (
    <PageLayout title="Store Profile">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-blue-400">
              {(storeName || "K")[0]}
            </span>
          </div>
          <h2
            className="text-[var(--text-primary)] font-bold text-xl"
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            {storeName || "Keel Shop"}
          </h2>
          <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
            {businessCategory?.charAt(0).toUpperCase() +
              businessCategory?.slice(1) || "General"}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {storePhone && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-sm">Phone</span>
              <text-[var(--text-primary)]Name="text-[var(--text-primary)] text-sm">{storePhone}</span>
            </div>
          )}
          {storeAddress && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-sm">Address</span>text-[var(--text-primary)]     <span className="text-[var(--text-primary)] text-sm text-right max-w-[60%]">
                {storeAddress}
              </span>
            </div>
          )}
          {whatsapp && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-sm"text-[var(--text-primary)]/span>
              <span className="text-[var(--text-primary)] text-sm">{whatsapp}</span>
            </div>
          )}
          {websiteUrl && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-[var(--text-sectext-[var(--text-primary)]ext-sm">Website</span>
              <span className="text-[var(--text-primary)] text-sm text-right max-w-[60%] truncate">
                {websiteUrl}
              </span>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
