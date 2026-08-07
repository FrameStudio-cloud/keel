export default function BenefitCards({ benefits }) {
  return (
    <section>
      <h3 className="text-lg font-bold text-text-primary">Why connect this</h3>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="bg-surface-1 rounded-2xl border border-border-subtle p-5 hover:border-brand-soft transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-muted text-brand flex items-center justify-center">
              <b.icon size={18} />
            </div>
            <p className="mt-3 text-sm font-semibold text-text-primary">{b.title}</p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
