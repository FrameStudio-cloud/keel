import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";


const posts = [
  {
    platform: "Instagram",
    color: "bg-pink-500",
    caption:
      "New iPhone 15 cases just arrived 🔥 Come through Mitho Building shop 14",
    likes: 148,
    comments: 12,
    reach: "1.2K",
    status: "Published",
    statusColor: "green",
  },
  {
    platform: "Instagram",
    color: "bg-pink-500",
    caption:
      "Screen protectors for any phone — fitted on the spot. KSh 150 only 💪",
    likes: null,
    comments: null,
    reach: null,
    status: "Scheduled",
    statusColor: "blue",
  },
];

export default function Social() {
  return (
    <PageLayout title="Social Media">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">Connected accounts</p>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
          + Plan post
        </button>
      </div>

      {/* Connected accounts */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-pink-500 flex items-center justify-center text-white text-sm font-bold">
            IG
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Instagram</p>
            <p className="text-xs text-gray-400">@yourshop · 1,240 followers</p>
          </div>
          <Badge label="Connected" color="green" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
            TT
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">TikTok</p>
            <p className="text-xs text-gray-400">Not connected yet</p>
          </div>
          <button className="text-xs text-blue-600 border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-50 transition-all">
            Connect
          </button>
        </div>
      </div>

      {/* Posts */}
      <p className="text-sm font-medium text-gray-800 mb-3">Recent posts</p>
      <div className="flex flex-col gap-3">
        {posts.map((post, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-5 h-5 rounded-full ${post.color}`} />
              <span className="text-xs font-medium text-gray-500">
                {post.platform}
              </span>
              <div className="ml-auto">
                <Badge label={post.status} color={post.statusColor} />
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">{post.caption}</p>
            {post.likes !== null && (
              <div className="flex gap-4">
                <span className="text-xs text-gray-400">
                  ❤️ {post.likes} likes
                </span>
                <span className="text-xs text-gray-400">
                  💬 {post.comments} comments
                </span>
                <span className="text-xs text-gray-400">
                  👁️ {post.reach} reach
                </span>
              </div>
            )}
            {post.likes === null && (
              <p className="text-xs text-gray-400">
                Scheduled for tomorrow 10:00 AM
              </p>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
