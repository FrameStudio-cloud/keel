export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-white/5 rounded-xl animate-pulse ${className}`}
    />
  );
}
