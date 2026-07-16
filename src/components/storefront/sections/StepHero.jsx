import OptionCard from "../OptionCard";
import { SECTION_OPTIONS } from "../../../data/storefrontBlueprints";

export default function StepHero({ value, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Pick the main hero section — this is the first thing visitors see.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {SECTION_OPTIONS.hero.map((opt) => (
          <OptionCard key={opt.id} option={opt} selected={value} onSelect={onChange} />
        ))}
      </div>
    </div>
  );
}
