const styles = {
  green: "bg-success-muted text-success",
  amber: "bg-warning-muted text-warning",
  red: "bg-danger-muted text-danger",
  blue: "bg-brand-muted text-brand",
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
