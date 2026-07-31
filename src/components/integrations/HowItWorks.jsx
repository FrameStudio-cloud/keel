export default function HowItWorks({ steps }) {
  return (
    <section>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">How it works</h3>
      <ol className="mt-4 space-y-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3.5">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow shadow-blue-600/30">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{step.title}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
