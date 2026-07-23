import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiPlus, FiCalendar, FiCpu, FiLock, FiInstagram, FiMessageCircle } from "react-icons/fi";
import { SiTiktok } from "react-icons/si";
import { isFeatureAccessible } from "../../lib/tiers";
import CalendarHoverPopover from "./CalendarHoverPopover";
import CalendarWeekView from "./CalendarWeekView";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PLATFORM_STYLES = {
  Instagram: "border-l-pink-500/70",
  TikTok: "border-l-gray-900/70 dark:border-l-gray-100/70",
  WhatsApp: "border-l-green-500/70",
};
const PLATFORM_ICONS = {
  Instagram: FiInstagram,
  TikTok: SiTiktok,
  WhatsApp: FiMessageCircle,
};
const POST_TYPE_LABELS = {
  product_showcase: "P",
  sale: "S",
  new_arrival: "N",
  back_in_stock: "R",
  behind_scenes: "B",
  testimonial: "T",
  custom: "",
};

function getMonthGrid(year, month) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return { cells, daysInMonth };
}

function computeStats(postsByDay) {
  let total = 0;
  let thisWeek = 0;
  const dayCount = {};
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  Object.entries(postsByDay).forEach(([, dayPosts]) => {
    dayPosts.forEach((p) => {
      if (!p.scheduled_at) return;
      total++;
      const d = new Date(p.scheduled_at);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      if (d >= startOfWeek) thisWeek++;
    });
  });

  const busiest = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  return { total, thisWeek, busiest };
}

export default function CalendarView({
  posts, loading, onDayClick, onAddPost, onWriteWeek, aiLoading, planTier,
  onEditPost, onDeletePost, onMarkPublished,
}) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState("month");
  const [hoverDay, setHoverDay] = useState(null);
  const [hoverPos, setHoverPos] = useState({ top: 0, left: 0 });
  const hoverTimer = useRef(null);
  const popoverRef = useRef(null);

  function jumpToToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  const { cells } = useMemo(() => getMonthGrid(year, month), [year, month]);

  const postsByDay = useMemo(() => {
    const map = {};
    (posts || []).forEach((post) => {
      if (!post.scheduled_at) return;
      const d = new Date(post.scheduled_at);
      if (view === "month") {
        if (d.getMonth() !== month || d.getFullYear() !== year) return;
      }
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(post);
    });
    return map;
  }, [posts, month, year, view]);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const stats = useMemo(() => computeStats(postsByDay), [postsByDay]);

  function clampPosition(rect) {
    const popoverWidth = Math.min(300, window.innerWidth - 16);
    const popoverLeft = rect.right + 8;
    const fitsRight = popoverLeft + popoverWidth < window.innerWidth;
    let left = fitsRight ? rect.right + 8 : rect.left - popoverWidth - 8;
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));
    return { top: rect.top + window.scrollY, left };
  }

  const handleMouseEnter = useCallback((day, e) => {
    const key = `${year}-${month}-${day}`;
    if (!postsByDay[key]?.length) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos(clampPosition(rect));
    hoverTimer.current = setTimeout(() => setHoverDay(day), 200);
  }, [year, month, postsByDay]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHoverDay(null), 300);
  }, []);

  // Click toggle for touch devices
  const handleCellClick = useCallback((day, e) => {
    const key = `${year}-${month}-${day}`;
    if (!postsByDay[key]?.length) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (hoverDay === day) { setHoverDay(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos(clampPosition(rect));
    setHoverDay(day);
  }, [year, month, postsByDay, hoverDay]);

  // Click-away dismiss for popover (touch/mobile)
  useEffect(() => {
    if (!hoverDay) return;
    function handleClickAway(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        // Check if click is on a calendar cell
        const cell = e.target.closest("[data-cal-cell]");
        if (!cell) setHoverDay(null);
      }
    }
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [hoverDay]);

  const getDayPosts = useCallback((day) => {
    const key = `${year}-${month}-${day}`;
    return postsByDay[key] || [];
  }, [year, month, postsByDay]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 lg:mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05] text-gray-500 dark:text-slate-400"
            aria-label="Previous month"
          >
            <FiChevronLeft size={18} />
          </button>
          <h3 className="text-sm font-medium text-gray-800 dark:text-white sm:min-w-[160px] text-center">
            {monthName}
          </h3>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05] text-gray-500 dark:text-slate-400"
            aria-label="Next month"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-white/[0.05] rounded-lg p-0.5">
            <button
              onClick={() => setView("month")}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                view === "month"
                  ? "bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                view === "week"
                  ? "bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700"
              }`}
            >
              Week
            </button>
          </div>
          <button
            onClick={jumpToToday}
            className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
          >
            <FiCalendar size={14} /> Today
          </button>
          <div className="hidden lg:flex items-center gap-2">
            {isFeatureAccessible("social_ai", planTier) ? (
              <button
                onClick={() => onWriteWeek?.()}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs font-medium bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                <FiCpu size={14} /> {aiLoading ? "Writing..." : "Write My Week"}
              </button>
            ) : (
              <span
                className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-300 dark:text-slate-600 px-3 py-1.5 rounded-lg cursor-not-allowed select-none"
                title="AI Caption Generator — Pro feature"
              >
                <FiLock size={11} />
                Write My Week
              </span>
            )}
            <button
              onClick={() => onAddPost()}
              className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all"
            >
              <FiPlus size={14} /> Plan post
            </button>
          </div>
        </div>
      </div>
      <div className="flex lg:hidden items-center gap-2 mb-3">
        {isFeatureAccessible("social_ai", planTier) ? (
          <button
            onClick={() => onWriteWeek?.()}
            disabled={aiLoading}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            <FiCpu size={14} /> {aiLoading ? "Writing..." : "Write My Week"}
          </button>
        ) : (
          <span
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-300 dark:text-slate-600 px-3 py-2 rounded-lg cursor-not-allowed select-none"
            title="AI Caption Generator — Pro feature"
          >
            <FiLock size={12} />
            Write My Week
          </span>
        )}
        <button
          onClick={() => onAddPost()}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          <FiPlus size={14} /> Plan post
        </button>
      </div>

      {stats.total > 0 && (
        <div className="flex items-center gap-3 mb-3 text-[11px] text-gray-500 dark:text-slate-400">
          <span><span className="font-medium text-gray-700 dark:text-gray-200">{stats.total}</span> posts this month</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
          <span><span className="font-medium text-gray-700 dark:text-gray-200">{stats.thisWeek}</span> this week</span>
          {stats.busiest && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
              <span>Busiest: <span className="font-medium text-gray-700 dark:text-gray-200">{stats.busiest}</span></span>
            </>
          )}
        </div>
      )}

      {view === "week" ? (
        <CalendarWeekView
          posts={posts}
          year={year}
          month={month}
          day={today.getDate()}
          onDayClick={onDayClick}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
          onMarkPublished={onMarkPublished}
        />
      ) : loading ? (
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="min-w-[672px] grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="h-8 flex items-center justify-center">
              <div className="h-3 w-6 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
            </div>
          ))}
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-[100px] p-1">
              <div className="w-full h-full bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse" />
            </div>
          ))}
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="min-w-[672px]">
              <div className="grid grid-cols-7 gap-px mb-px">
                {DAYS.map((d) => (
                  <div key={d} className="h-7 flex items-center justify-center text-[11px] font-medium text-gray-400 dark:text-slate-500">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5">
                {weeks.map((week, wi) =>
                  week.map((day, di) => {
                    if (day === null) return <div key={`e-${wi}-${di}`} />;
                    const dayPosts = getDayPosts(day);
                    const isToday =
                      day === today.getDate() &&
                      month === today.getMonth() &&
                      year === today.getFullYear();
                    const visiblePosts = dayPosts.slice(0, 3);
                    const overflow = dayPosts.length - 3;

                    return (
                      <div
                        key={day}
                        className="relative"
                        data-cal-cell="true"
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => handleCellClick(day, e)}
                      >
                    <div
                      className={`h-[100px] overflow-hidden bg-white dark:bg-[#16213e] p-1.5 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                        isToday ? "ring-1 ring-blue-400 dark:ring-blue-500/30" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-semibold leading-none ${
                            isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {day}
                        </span>
                        {dayPosts.length > 0 && (
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded-full leading-none">
                            {dayPosts.length}
                          </span>
                        )}
                      </div>
                      {dayPosts.length > 0 && (
                        <div className="flex flex-col gap-px overflow-hidden [mask-image:linear-gradient(black_85%,transparent)]">
                          {visiblePosts.map((p) => {
                            const Icon = PLATFORM_ICONS[p.platform] || FiInstagram;
                            const style = PLATFORM_STYLES[p.platform] || "border-l-gray-300";
                            const typeLabel = POST_TYPE_LABELS[p.post_type];
                            return (
                              <div
                                key={p.id}
                                className={`border-l-[3px] ${style} pl-1 flex items-center gap-1 min-h-0`}
                              >
                                <Icon size={9} className="shrink-0 text-gray-400 dark:text-slate-500" />
                                {typeLabel && (
                                  <span className="text-[8px] uppercase font-semibold text-gray-400 dark:text-slate-500 shrink-0">
                                    {typeLabel}
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-600 dark:text-slate-300 truncate leading-tight">
                                  {p.caption || ""}
                                </span>
                                <span
                                  className={`w-1 h-1 shrink-0 rounded-full ${
                                    p.status === "scheduled" ? "bg-blue-400" : "bg-green-400"
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {overflow > 0 && (
                        <div className="absolute bottom-1 right-1.5 text-[10px] font-medium text-gray-400 dark:text-slate-500 bg-white/80 dark:bg-[#16213e]/80 px-1 rounded leading-none">
                          +{overflow}
                        </div>
                      )}
                    </div>
                    {hoverDay === day && dayPosts.length > 0 && (
                      <div
                        ref={popoverRef}
                        className="fixed z-30"
                        style={{ top: hoverPos.top, left: hoverPos.left }}
                        onMouseEnter={() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }}
                        onMouseLeave={handleMouseLeave}
                      >
                        <CalendarHoverPopover
                          year={year}
                          month={month}
                          day={day}
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
              })
            )}
          </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
