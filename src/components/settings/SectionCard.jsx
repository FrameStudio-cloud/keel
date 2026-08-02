export const CARD_CLASS =
  "bg-surface-1 rounded-xl border border-border-subtle p-5";

export default function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className={CARD_CLASS}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className="text-text-faint" />
        <h3 className="text-sm font-medium text-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}
