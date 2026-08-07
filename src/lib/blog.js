export function formatBlogDate(date) {
  return new Date(date).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function readingTime(post) {
  const words = post.content.reduce((acc, b) => acc + (b.text ? b.text.split(/\s+/).length : 0), 0);
  return Math.max(1, Math.round(words / 200));
}

export function kicker(tags) {
  if (!tags || !tags.length) return "Journal";
  return tags[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const COVERS = [
  {
    bg: "linear-gradient(135deg, #0f2a5f 0%, #1e3a8a 45%, #3b82f6 100%)",
    ink: "rgba(15,42,95,0.45)",
    accent: "#93c5fd",
  },
  {
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 45%, #10b981 100%)",
    ink: "rgba(6,78,59,0.45)",
    accent: "#6ee7b7",
  },
  {
    bg: "linear-gradient(135deg, #4c1d95 0%, #5b21b6 45%, #8b5cf6 100%)",
    ink: "rgba(76,29,149,0.45)",
    accent: "#c4b5fd",
  },
  {
    bg: "linear-gradient(135deg, #7c2d12 0%, #9a3412 45%, #f97316 100%)",
    ink: "rgba(124,45,18,0.45)",
    accent: "#fdba74",
  },
  {
    bg: "linear-gradient(135deg, #0e7490 0%, #0f766e 45%, #2dd4bf 100%)",
    ink: "rgba(14,116,144,0.45)",
    accent: "#99f6e4",
  },
  {
    bg: "linear-gradient(135deg, #312e81 0%, #3730a3 45%, #818cf8 100%)",
    ink: "rgba(49,46,129,0.45)",
    accent: "#c7d2fe",
  },
];

export function coverStyle(index) {
  return COVERS[index % COVERS.length];
}
