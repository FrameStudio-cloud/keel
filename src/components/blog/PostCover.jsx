import { FiArrowRight } from "react-icons/fi";
import { kicker, coverStyle } from "../../lib/blog";

export default function PostCover({ post, index, size = "md", className = "" }) {
  const palette = coverStyle(index);
  const num = String(index + 1).padStart(2, "0");

  const titleSize =
    size === "lg"
      ? "text-3xl sm:text-5xl"
      : size === "sm"
        ? "text-xl sm:text-2xl"
        : "text-2xl sm:text-3xl";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: palette.bg }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 85% 10%, transparent 40%, ${palette.ink} 100%)` }}
      />
      <div
        className="absolute inset-y-0 left-0 w-px"
        style={{ background: palette.accent }}
      />
      <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span
            className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: palette.accent }}
          >
            {kicker(post.tags)}
          </span>
          <span className="font-serif text-3xl sm:text-4xl font-medium leading-none text-white/30">
            {num}
          </span>
        </div>
        <div className="pt-10">
          <h3
            className={`font-serif font-medium leading-[1.08] text-white ${titleSize} line-clamp-3`}
          >
            {post.title}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/70">
            Read the story
            <FiArrowRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}
