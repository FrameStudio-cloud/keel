import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";
import Skeleton from "../components/Skeleton";
import PlanPostModal from "../components/PlanPostModal";
import Pagination from "../components/Pagination";
import { getShopId } from "../lib/shop";
import { paginateQuery } from "../lib/paginate";

const PAGE_SIZE = 20;



function PostCard({ post }) {
  const isScheduled = post.status === "scheduled";

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full ${post.platform === "Instagram" ? "bg-pink-500" : "bg-gray-900"}`}
          />
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
            {post.platform}
          </span>
        </div>
        <Badge
          label={isScheduled ? "Scheduled" : "Published"}
          color={isScheduled ? "blue" : "green"}
        />
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-100 mb-3 leading-relaxed">
        {post.caption}
      </p>

      {!isScheduled ? (
        <div className="flex gap-4 pt-2 border-t border-gray-100 dark:border-white/10">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 dark:text-slate-500">Likes</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {post.likes || 0}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 dark:text-slate-500">Comments</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {post.comments || 0}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 dark:text-slate-500">Reach</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {(post.reach || 0).toLocaleString()}
            </span>
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t border-gray-100 dark:border-white/10">
          <span className="text-xs text-gray-400 dark:text-slate-500">
            <FiClock className="inline" /> Scheduled for {formatDate(post.scheduled_at)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Social() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
        page,
        pageSize: PAGE_SIZE,
        orderBy: "created_at",
        ascending: false,
      });
      if (cancelled) return;
      if (error) {
        console.error(error);
      } else {
        setPosts(data ?? []);
        setTotal(count);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [page]);

  return (
    <PageLayout title="Social Media">
      {/* Instagram connect */}
      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4 flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center text-white text-sm font-bold">
          IG
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-white">Instagram</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Connect your Instagram to track post performance
          </p>
        </div>
          <span className="text-xs text-blue-600 dark:text-blue-400 border border-blue-200 px-4 py-1.5 rounded-full">
            Connect
          </span>
      </div>

      {/* TikTok connect */}
      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4 flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
          TT
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-white">TikTok</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Connect your TikTok to track video performance
          </p>
        </div>
          <span className="text-xs text-blue-600 dark:text-blue-400 border border-blue-200 px-4 py-1.5 rounded-full">
            Connect
          </span>
      </div>

      {/* Posts */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-gray-800 dark:text-white">
          {total} {total === 1 ? "post" : "posts"}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          + Plan post
        </button>
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
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500">
          No posts yet. Plan your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {showModal && (
        <PlanPostModal
          onClose={() => setShowModal(false)}
          onAdded={() => setPage(0)}
        />
      )}
    </PageLayout>
  );
}
