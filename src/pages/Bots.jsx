import PageLayout from "../components/layout/PageLayout";

const bots = [
  {
    name: "WhatsApp Bot",
    description:
      "Automate customer enquiries, send order updates, and notify low stock alerts via WhatsApp.",
    icon: "💬",
    status: "coming-soon",
    color: "bg-green-500/10 border-green-500/20",
    textColor: "text-green-400",
  },
  {
    name: "Telegram Bot",
    description:
      "Get daily sales reports, stock alerts, and manage your shop from Telegram.",
    icon: "✈️",
    status: "coming-soon",
    color: "bg-blue-500/10 border-blue-500/20",
    textColor: "text-blue-400",
  },
];

export default function Bots() {
  return (
    <PageLayout title="Bots">
      <div className="max-w-2xl space-y-4">
        {bots.map((bot) => (
          <div
            key={bot.name}
            className={`${bot.color} border rounded-2xl p-6`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{bot.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="text-[var(--text-primary)] font-bold text-lg"
                    style={{ fontFamily: "var(--font-display, inherit)" }}
                  >
                    {bot.name}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bot.textColor} bg-white/5`}
                  >
                    Coming Soon
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm">{bot.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
