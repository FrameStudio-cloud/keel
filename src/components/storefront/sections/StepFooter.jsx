import OptionCard from "../OptionCard";
import { SECTION_OPTIONS } from "../../../data/storefrontBlueprints";

export default function StepFooter({ value, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Pick a footer layout for the bottom of your storefront.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {SECTION_OPTIONS.footer.map((opt) => (
          <OptionCard key={opt.id} option={opt} selected={value} onSelect={onChange} />
        ))}
      </div>
    </div>
  );
}
