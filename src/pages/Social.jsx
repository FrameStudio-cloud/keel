import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { FiCalendar, FiList, FiBookmark, FiBarChart2, FiSend } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import ContextTip from "../components/ContextTip";
import ProPanel from "../components/ProPanel";
import { useSettings } from "../hooks/useSettings";
import { isFeatureAccessible } from "../lib/tiers";
import CalendarView from "../components/social/CalendarView";
import PostCard from "../components/social/PostCard";
import PostComposer from "../components/social/PostComposer";
import PostSuggestions from "../components/social/PostSuggestions";
import ContentLibrary from "../components/social/ContentLibrary";
import PerformanceTab from "../components/social/PerformanceTab";
import BroadcastList from "../components/social/BroadcastList";

import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { paginateQuery } from "../lib/paginate";
import { aiWriteWeek } from "../lib/ai";

const PAGE_SIZE = 20;
const TABS = [
  { key: "calendar", label: "Calendar", icon: FiCalendar },
  { key: "timeline", label: "Timeline", icon: FiList },
  { key: "broadcasts", label: "Broadcasts", icon: FiSend },
  { key: "templates", label: "Templates", icon: FiBookmark },
  { key: "performance", label: "Performance", icon: FiBarChart2 },
];

export default function Social() {
  const { planTier } = useSettings();
  const [activeTab, setActiveTab] = useState("calendar");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [presetCaption, setPresetCaption] = useState("");
  const [presetDate, setPresetDate] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saveTemplatePost, setSaveTemplatePost] = useState(null);

  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const shopId = await getShopId();
      const { data, error, total: count } = await paginateQuery({
        table: "posts",
        shopId,
        page: activeTab === "timeline" ? page : 0,
        pageSize: PAGE_SIZE,
        orderBy: "created_at",
        ascending: false,
      });
      if (cancelled) return;
      if (!error) {
        setPosts(data ?? []);
        setTotal(count);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [activeTab, page, refreshKey]);

  function handleAdded() {
    setRefreshKey((k) => k + 1);
    setEditPost(null);
  }

  const handleWriteWeek = useCallback(async () => {
    setAiLoading(true);
    try {
      const shopId = await getShopId();
      const result = await aiWriteWeek(shopId, "Instagram");
      const lines = result.content.split("\n\n").filter(Boolean);
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

      const now = new Date();
      const currentDay = now.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);

      const inserts = lines.slice(0, 7).map((line, i) => {
        const scheduleDate = new Date(monday);
        scheduleDate.setDate(monday.getDate() + i);
        scheduleDate.setHours(10, 0, 0, 0);

        const dayLabel = days[i] || "";
        const caption = line.replace(new RegExp(`^${dayLabel}:?\\s*`, "i"), "").trim() || line;

        return {
          platform: "Instagram",
          caption,
          status: "scheduled",
          scheduled_at: scheduleDate.toISOString(),
          post_type: "custom",
          is_broadcast: false,
          shop_id: shopId,
        };
      });

      const { error } = await supabase.from("posts").insert(inserts);
      if (error) throw error;
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Write week failed:", err);
    }
    setAiLoading(false);
  }, []);

  function handleDayClick(day) {
    const dt = day instanceof Date ? day : new Date();
    setPresetDate(dt.toISOString().slice(0, 16));
    setShowComposer(true);
  }

  function handleEditPost(post) {
    setEditPost(post);
    setShowComposer(true);
  }

  async function handleDeletePost(post) {
    if (!confirm("Delete this post?")) return;
    const shopId = await getShopId();
    await supabase.from("posts").delete().eq("id", post.id).eq("shop_id", shopId);
    setRefreshKey((k) => k + 1);
  }

  async function handleMarkPublished(post) {
    const shopId = await getShopId();
    await supabase.from("posts").update({ status: "published" }).eq("id", post.id).eq("shop_id", shopId);
    setRefreshKey((k) => k + 1);
  }

  function handleUseSuggestion(caption) {
    setPresetCaption(caption);
    setActiveTab("calendar");
    setShowComposer(true);
  }

  function handleUseTemplate(caption) {
    setPresetCaption(caption);
    setActiveTab("calendar");
    setShowComposer(true);
  }

  function handleSaveAsTemplate(post) {
    setSaveTemplatePost(post);
    setActiveTab("templates");
  }

  if (!isFeatureAccessible("social", planTier)) {
    return (
      <PageLayout title="Social (Queue)">
        <Helmet><title>Social — Keel</title></Helmet>
        <ProPanel feature="social" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Queue">
      <Helmet><title>Queue — Keel</title></Helmet>
      <ContextTip tipKey="social" title="Tip">
        <p>Schedule and manage your social media posts across platforms.</p>
      </ContextTip>

      <div className="flex gap-1 mb-4 border-b border-gray-100 dark:border-white/5 pb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                active
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "calendar" && (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <CalendarView
              posts={posts}
              loading={loading}
              onDayClick={handleDayClick}
              onAddPost={() => setShowComposer(true)}
              onWriteWeek={handleWriteWeek}
              aiLoading={aiLoading}
              planTier={planTier}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onMarkPublished={handleMarkPublished}
            />
          </div>
          <div className="lg:w-72 shrink-0 overflow-y-auto max-h-[calc(100vh-200px)]">
            <PostSuggestions onUseSuggestion={handleUseSuggestion} />
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {total} {total === 1 ? "post" : "posts"}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  <div className="flex gap-4 pt-2 border-t border-gray-100 dark:border-white/10">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={FiCalendar}
              title="No posts yet"
              description="Plan and schedule your first social media post."
              actionLabel="Plan Post"
              onClick={() => setShowComposer(true)}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={() => {
                    setEditPost(post);
                    setShowComposer(true);
                  }}
                  onSaveAsTemplate={handleSaveAsTemplate}
                  onMarkPublished={handleMarkPublished}
                />
              ))}
            </div>
          )}
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}

      {activeTab === "broadcasts" && (
        <BroadcastList onRefresh={refreshKey} />
      )}

      {activeTab === "performance" && (
        <PerformanceTab />
      )}

      {activeTab === "templates" && (
        <ContentLibrary onUseTemplate={handleUseTemplate} />
      )}

      {showComposer && (
        <PostComposer
          editPost={editPost}
          initialCaption={presetCaption}
          initialDate={presetDate}
          onClose={() => {
            setShowComposer(false);
            setEditPost(null);
            setPresetCaption("");
            setPresetDate("");
          }}
          onAdded={handleAdded}
        />
      )}
    </PageLayout>
  );
}
