export default function BenefitCards({ benefits }) {
  return (
    <section>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Why connect this</h3>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 p-5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <b.icon size={18} />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-white">{b.title}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
