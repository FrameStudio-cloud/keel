import { useState, useMemo, useRef, useCallback } from "react";
import { FiInstagram, FiMessageCircle, FiSend } from "react-icons/fi";
import { SiTiktok } from "react-icons/si";
import CalendarHoverPopover from "./CalendarHoverPopover";
import Badge from "../Badge";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PLATFORM_STYLES = {
  Instagram: "border-l-pink-500",
  TikTok: "border-l-gray-900 dark:border-l-gray-100",
  WhatsApp: "border-l-green-500",
};
const PLATFORM_ICONS = {
  Instagram: FiInstagram,
  TikTok: SiTiktok,
  WhatsApp: FiMessageCircle,
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

function getWeekRange(year, month, day) {
  const d = new Date(year, month, day);
  const dayOfWeek = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - dayOfWeek);
  const end = new Date(d);
  end.setDate(d.getDate() + (6 - dayOfWeek));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate() });
  }
  return { days, start, end };
}

function clampPosition(rect) {
  const popoverWidth = Math.min(300, window.innerWidth - 16);
  const popoverLeft = rect.right + 8;
  const fitsRight = popoverLeft + popoverWidth < window.innerWidth;
  let left = fitsRight ? rect.right + 8 : rect.left - popoverWidth - 8;
  left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));
  return { top: rect.top + window.scrollY, left };
}

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

export default function CalendarWeekView({ posts, year, month, day, onDayClick, onEditPost, onDeletePost, onMarkPublished }) {
  const { days, start, end } = useMemo(() => getWeekRange(year, month, day || 1), [year, month, day]);

  const weekLabel = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const today = new Date();
  const [hoverKey, setHoverKey] = useState(null);
  const [hoverPos, setHoverPos] = useState({ top: 0, left: 0 });
  const hoverTimer = useRef(null);

  const postsByDay = useMemo(() => {
    const map = {};
    (posts || []).forEach((post) => {
      if (!post.scheduled_at) return;
      const d = new Date(post.scheduled_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(post);
    });
    return map;
  }, [posts]);

  function isToday(d) {
    return d.year === today.getFullYear() && d.month === today.getMonth() && d.day === today.getDate();
  }

  const totalWeekPosts = days.reduce((sum, d) => {
    const key = `${d.year}-${d.month}-${d.day}`;
    return sum + (postsByDay[key]?.length || 0);
  }, 0);

  const handleMouseEnter = useCallback((chipKey, e) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos(clampPosition(rect));
    hoverTimer.current = setTimeout(() => setHoverKey(chipKey), 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHoverKey(null), 300);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          <span className="font-medium text-gray-700 dark:text-gray-200">{totalWeekPosts}</span> posts this week
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{weekLabel}</p>
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden lg:grid grid-cols-7 gap-px bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
        {days.map((d) => {
          const key = `${d.year}-${d.month}-${d.day}`;
          const dayPosts = postsByDay[key] || [];
          const td = isToday(d);

          return (
            <div
              key={key}
              className={`bg-white dark:bg-[#16213e] min-h-[200px] p-1.5 relative ${
                td ? "ring-1 ring-blue-400 dark:ring-blue-500/30" : ""
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <span className={`text-[10px] font-medium ${td ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500"}`}>
                  {DAYS_SHORT[d.day % 7]}
                </span>
              </div>
              <div className="flex items-center justify-center mb-1.5">
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${td ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-200"}`}>
                  {d.day}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {dayPosts.slice(0, 5).map((p) => {
                  const Icon = PLATFORM_ICONS[p.platform] || FiInstagram;
                  const style = PLATFORM_STYLES[p.platform] || "border-l-gray-300";
                  const chipKey = `${key}-${p.id}`;
                  return (
                    <div
                      key={p.id}
                      className={`border-l-[3px] ${style} pl-1.5 py-1 text-[10px] leading-tight cursor-default`}
                      onMouseEnter={(e) => handleMouseEnter(chipKey, e)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex items-center gap-1">
                        <Icon size={9} className="shrink-0 text-gray-400" />
                        <span className="text-gray-500 dark:text-slate-400 truncate">
                          {p.caption?.slice(0, 20) || "No caption"}
                        </span>
                      </div>
                      {hoverKey === chipKey && (
                        <div
                          className="fixed z-30"
                          style={{ top: hoverPos.top, left: hoverPos.left }}
                          onMouseEnter={() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }}
                          onMouseLeave={handleMouseLeave}
                        >
                          <CalendarHoverPopover
                            year={d.year}
                            month={d.month}
                            day={d.day}
                            posts={dayPosts}
                            onEditPost={onEditPost}
                            onDeletePost={onDeletePost}
                            onMarkPublished={onMarkPublished}
                            onDayClick={onDayClick}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {dayPosts.length > 5 && (
                  <span className="text-[9px] text-gray-400 dark:text-slate-500 text-center">
                    +{dayPosts.length - 5} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical day list */}
      <div className="flex flex-col lg:hidden gap-2">
        {days.map((d) => {
          const key = `${d.year}-${d.month}-${d.day}`;
          const dayPosts = postsByDay[key] || [];
          const td = isToday(d);

          return (
            <div
              key={key}
              className={`bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-3 ${
                td ? "ring-1 ring-blue-400 dark:ring-blue-500/30" : ""
              }`}
            >
              <div className={`flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-50 dark:border-white/5 ${td ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}>
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${td ? "bg-blue-600 text-white" : ""}`}>
                  {d.day}
                </span>
                <span className="text-xs font-medium">{DAYS_FULL[d.day % 7]}</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto bg-gray-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                  {dayPosts.length} {dayPosts.length === 1 ? "post" : "posts"}
                </span>
              </div>

              {dayPosts.length === 0 ? (
                <p className="text-xs text-gray-300 dark:text-slate-600 text-center py-3">No posts scheduled</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {dayPosts.map((p) => {
                    const Icon = PLATFORM_ICONS[p.platform] || FiInstagram;
                    const style = PLATFORM_STYLES[p.platform] || "border-l-gray-300";
                    const typeLabel = POST_TYPE_LABELS[p.post_type];
                    const isScheduled = p.status === "scheduled";

                    return (
                      <div key={p.id} className={`border-l-[3px] ${style} pl-2.5 py-2 bg-gray-50 dark:bg-white/[0.02] rounded-r-lg`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Icon size={11} className="shrink-0 text-gray-400" />
                            <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400">{p.platform}</span>
                            {p.is_broadcast && <FiSend size={9} className="text-green-500 shrink-0" />}
                            {typeLabel && (
                              <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-slate-500 bg-gray-200 dark:bg-white/[0.06] px-1 rounded shrink-0">
                                {typeLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isScheduled && onMarkPublished && (
                              <button
                                onClick={() => onMarkPublished(p)}
                                className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20"
                              >
                                Published
                              </button>
                            )}
                            {onEditPost && (
                              <button
                                onClick={() => onEditPost(p)}
                                className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-100 leading-snug mt-1 line-clamp-2">{p.caption || "No caption"}</p>
                        {p.scheduled_at && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 dark:text-slate-500">{formatTime(p.scheduled_at)}</span>
                            <Badge label={isScheduled ? "Scheduled" : "Published"} color={isScheduled ? "blue" : "green"} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => onDayClick?.(new Date(d.year, d.month, d.day))}
                className="mt-2 w-full text-left text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium py-1"
              >
                + Schedule post for this day
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
