export default function HowItWorks({ steps }) {
  return (
    <section>
      <h3 className="text-lg font-bold text-text-primary">How it works</h3>
      <ol className="mt-4 space-y-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3.5">
            <span className="w-8 h-8 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center shrink-0 shadow shadow-brand/30">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">{step.title}</p>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
