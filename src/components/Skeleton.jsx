export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-white/5 rounded-xl animate-pulse ${className}`}
    />
  );
}
