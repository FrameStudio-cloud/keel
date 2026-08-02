export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-surface-3 rounded-xl animate-pulse ${className}`}
    />
  );
}
