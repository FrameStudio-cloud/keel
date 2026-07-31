const basicFeatures = [
  "Sales & inventory management",
  "Service order management",
  "Expense tracking",
  "Customer management",
  "Stock alerts & barcode scanning",
  "Basic reports",
  "Mobile-first dashboard",
];

const proFeatures = [
  "Everything in Basic",
  "Live website & storefront",
  "P&L charts & CSV/PDF export",
  "Social media scheduler",
  "WhatsApp & Telegram bots",
  "M-Pesa reconciliation",
  "QR codes & print catalogue",
  "Website analytics",
  "Data export",
];

function Check() {
  return <span className="mt-0.5 flex-shrink-0">✓</span>;
}

export default function HomePricing() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Simple, transparent pricing
        </h2>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Pick the plan that fits your business. No hidden fees, no surprises.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col relative">
          <span className="absolute top-3 right-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">7-day trial</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1">Basic</p>
          <p className="text-3xl font-extrabold mb-1">KSh 500</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">per month</p>
          <ul className="space-y-3 text-sm flex-1">
            {basicFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 dark:text-blue-400"><Check /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-blue-600 dark:bg-blue-700 border border-blue-500 rounded-2xl p-6 sm:p-8 flex flex-col relative">
          <span className="absolute top-0 right-6 -translate-y-1/2 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow-md">Popular</span>
          <span className="absolute top-10 right-6 bg-emerald-300/20 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">7-day trial</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1">Pro</p>
          <p className="text-3xl font-extrabold text-white mb-1">KSh 1,000</p>
          <p className="text-sm text-blue-200 mb-6">per month</p>
          <ul className="space-y-3 text-sm flex-1">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-white">
                <span className="text-blue-200"><Check /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
