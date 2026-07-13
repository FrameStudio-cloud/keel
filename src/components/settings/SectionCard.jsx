export const CARD_CLASS =
  "bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5";

export default function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className={CARD_CLASS}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className="text-gray-400" />
        <h3 className="text-sm font-medium text-gray-800 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}
