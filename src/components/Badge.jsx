const styles = {
  green: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  red: "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400",
  blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export default function Badge({ label, color = "green" }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[color]}`}
    >
      {label}
    </span>
  );
}
