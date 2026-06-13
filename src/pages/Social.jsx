import { useEffect, useState } from "react";
import { FiClock, FiHeart, FiEye } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";
import PlanPostModal from "../components/PlanPostModal";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";

const account = {
  username: "@lewisshop",
  followers: 1240,
  following: 380,
  posts: 47,
};

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

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPosts(data);
    }
    setLoading(false);
  }

  const topPost = [...posts]
    .filter((p) => p.reach)
    .sort((a, b) => b.reach - a.reach)[0];

  return (
    <PageLayout title="Social Media">
      {/* Account card */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="col-span-2 bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white font-medium">
            IG
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {account.username}
            </p>
            <div className="flex gap-4 mt-1">
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {account.followers.toLocaleString()} followers
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {account.following} following
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {account.posts} posts
              </span>
            </div>
          </div>
          <Badge label="Connected" color="green" />
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4 flex flex-col justify-between">
          {topPost ? (
            <>
              <p className="text-xs text-gray-400 dark:text-slate-500">Best performing post</p>
              <p className="text-sm text-gray-700 dark:text-gray-100 line-clamp-2 leading-relaxed">
                {topPost.caption}
              </p>
              <div className="flex gap-3">
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  <FiHeart className="inline" /> {topPost.likes}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  <FiEye className="inline" /> {topPost.reach?.toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400 dark:text-slate-500">No published posts yet</p>
          )}
        </div>
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
        <button className="text-xs text-blue-600 dark:text-blue-400 border border-blue-200 px-4 py-1.5 rounded-full hover:bg-blue-50 transition-all">
          Connect
        </button>
      </div>

      {/* Posts */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-gray-800 dark:text-white">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          + Plan post
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-slate-500">Loading posts...</p>
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

      {showModal && (
        <PlanPostModal
          onClose={() => setShowModal(false)}
          onAdded={fetchPosts}
        />
      )}
    </PageLayout>
  );
}
