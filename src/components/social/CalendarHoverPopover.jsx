import { FiInstagram, FiMessageCircle, FiSend, FiEdit3, FiCheckCircle } from "react-icons/fi";
import { SiTiktok } from "react-icons/si";
import Badge from "../Badge";

const PLATFORM_CONFIG = {
  Instagram: { icon: FiInstagram, color: "border-l-pink-500", dot: "bg-chart-5" },
  TikTok: { icon: SiTiktok, color: "border-l-gray-900 dark:border-l-gray-100", dot: "bg-gray-900 dark:bg-surface-2" },
  WhatsApp: { icon: FiMessageCircle, color: "border-l-green-500", dot: "bg-green-500" },
};

const POST_TYPE_LABELS = {
  product_showcase: "Product",
  sale: "Sale",
  new_arrival: "New",
  back_in_stock: "Restock",
  behind_scenes: "BTS",
  testimonial: "Testimonial",
  custom: "",
};

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

export default function CalendarHoverPopover({ year, month, day, posts, onEditPost, onMarkPublished, onDayClick }) {
  if (!posts || posts.length === 0) return null;

  const dateStr = new Date(year, month, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-surface-1 rounded-xl border border-border-subtle shadow-xl p-3 w-[260px] sm:min-w-[260px] sm:max-w-[300px]" style={{ maxWidth: "calc(100vw - 16px)" }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-text-body">{dateStr}</h4>
        <span className="text-[10px] text-text-faint bg-surface-2 dark:bg-white/[0.05] px-1.5 py-0.5 rounded-full">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>
      <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto">
        {posts.map((p) => {
          const cfg = PLATFORM_CONFIG[p.platform] || PLATFORM_CONFIG.Instagram;
          const Icon = cfg.icon;
          const typeLabel = POST_TYPE_LABELS[p.post_type];
          const isScheduled = p.status === "scheduled";

          return (
            <div
              key={p.id}
              className={`border-l-[3px] ${cfg.color} pl-2 py-1.5 rounded-sm ${onEditPost ? "cursor-pointer hover:bg-surface-2" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon size={11} className="shrink-0 text-text-muted" />
                  <span className="text-[10px] font-medium text-text-muted">
                    {p.platform}
                  </span>
                  {p.is_broadcast && (
                    <span className="text-[9px] text-success flex items-center gap-0.5">
                      <FiSend size={9} /> Broadcast
                    </span>
                  )}
                  {typeLabel && (
                    <span className="text-[9px] uppercase tracking-wider text-text-faint bg-surface-2 dark:bg-white/[0.05] px-1 rounded">
                      {typeLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isScheduled && onMarkPublished && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onMarkPublished(p); }}
                      className="text-[10px] font-medium text-success bg-success-muted px-2 py-1 rounded-lg hover:bg-success-muted flex items-center gap-1"
                    >
                      <FiCheckCircle size={12} /> Published
                    </button>
                  )}
                  {onEditPost && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditPost(p); }}
                      className="text-[10px] font-medium text-brand bg-brand-muted px-2 py-1 rounded-lg hover:bg-brand-muted flex items-center gap-1"
                    >
                      <FiEdit3 size={12} /> Edit
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-text-body leading-snug mt-0.5 line-clamp-2">
                {p.caption || "No caption"}
              </p>
              {p.scheduled_at && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-text-faint">{formatTime(p.scheduled_at)}</span>
                  <Badge label={isScheduled ? "Scheduled" : "Published"} color={isScheduled ? "blue" : "green"} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={() => onDayClick?.(new Date(year, month, day))}
        className="mt-2 w-full text-left text-xs text-brand hover:underline font-medium py-1.5"
      >
        + Schedule post for this day
      </button>
    </div>
  );
}
