const styles = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-500",
  blue: "bg-blue-50 text-blue-600",
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
