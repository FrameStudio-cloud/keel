import { useState } from "react";
import { FiCheck, FiChevronLeft, FiChevronRight, FiExternalLink, FiPackage, FiLayout, FiGrid, FiImage, FiMail, FiSliders } from "react-icons/fi";
import StepNavbar from "./sections/StepNavbar";
import StepHero from "./sections/StepHero";
import StepCatalogue from "./sections/StepCatalogue";
import StepFooter from "./sections/StepFooter";
import StepExtras from "./sections/StepExtras";
import { STEPS_CONFIG, SECTION_OPTIONS, getDefaultBlueprint } from "../../data/storefrontBlueprints";

const STEP_ICONS = [FiLayout, FiImage, FiGrid, FiMail, FiSliders];

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-0 sm:gap-1">
      {steps.map((step, i) => {
        const isDone = i < current;
        const isActive = i === current;
        const Icon = STEP_ICONS[i] || FiPackage;
        return (
          <div key={step.key} className="flex items-center gap-0 sm:gap-1 flex-1 sm:flex-none">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-1 sm:px-2 py-1 rounded-lg transition-colors ${
              isActive ? "bg-blue-50 dark:bg-blue-500/10" : ""
            }`}>
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                isDone
                  ? "bg-blue-600 text-white"
                  : isActive
                  ? "bg-blue-600 text-white ring-2 ring-blue-500/30"
                  : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-slate-500"
              }`}>
                {isDone ? <FiCheck size={13} /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : isDone
                  ? "text-gray-600 dark:text-slate-300"
                  : "text-gray-400 dark:text-slate-500"
              }`}>
                {step.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden sm:block w-6 md:w-8 h-px mx-1 ${
                isDone ? "bg-blue-600" : "bg-gray-200 dark:bg-white/10"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SectionPicker({ templateType, onDeploy, onBack }) {
  const [step, setStep] = useState(0);
  const [blueprint, setBlueprint] = useState(() => getDefaultBlueprint(templateType));

  function updateSection(key, value) {
    setBlueprint((prev) => ({ ...prev, [key]: value }));
  }

  function nextStep() {
    if (step < STEPS_CONFIG.length) {
      setStep((s) => s + 1);
    }
  }

  function prevStep() {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      onBack();
    }
  }

  function handleDeploy() {
    onDeploy(blueprint);
  }

  const currentStep = STEPS_CONFIG[step];
  const canProceed = step >= STEPS_CONFIG.length;

  // Check if current step has a selection (skip for extras step which uses toggles)
  const hasSelection = step >= STEPS_CONFIG.length - 1 || !!blueprint[currentStep?.key];

  function renderStep() {
    switch (step) {
      case 0:
        return <StepNavbar value={blueprint.navbar} onChange={(v) => updateSection("navbar", v)} />;
      case 1:
        return <StepHero value={blueprint.hero} onChange={(v) => updateSection("hero", v)} />;
      case 2:
        return <StepCatalogue value={blueprint.catalogue} onChange={(v) => updateSection("catalogue", v)} />;
      case 3:
        return <StepFooter value={blueprint.footer} onChange={(v) => updateSection("footer", v)} />;
      case 4:
        return <StepExtras value={blueprint.extras} onChange={(v) => updateSection("extras", v)} />;
      case 5:
        return <DeployReview blueprint={blueprint} />;
      default:
        return null;
    }
  }

  return (
    <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={prevStep}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
        >
          <FiChevronLeft size={16} />
          Back
        </button>
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
          {step < STEPS_CONFIG.length
            ? `Section ${step + 1} of ${STEPS_CONFIG.length + 1}: ${currentStep.title}`
            : "Review & Deploy"}
        </h2>
        <div className="w-16" />
      </div>

      {/* Step indicator */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 overflow-x-auto">
        <StepIndicator steps={[...STEPS_CONFIG, { key: "review", title: "Review" }]} current={step} />
      </div>

      {/* Step content */}
      <div className="p-5 min-h-[300px]">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/10">
        <button
          onClick={prevStep}
          className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
        >
          {step === 0 ? "Cancel" : "Previous"}
        </button>

        {step < STEPS_CONFIG.length ? (
          <button
            onClick={nextStep}
            disabled={!hasSelection}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {step === STEPS_CONFIG.length - 1 ? "Review" : "Continue"}
            <FiChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleDeploy}
            className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.97]"
          >
            <FiPackage size={16} />
            Deploy Storefront
          </button>
        )}
      </div>
    </div>
  );
}

function DeployReview({ blueprint }) {
  const OPTION_LABELS = {};
  for (const [group, options] of Object.entries(SECTION_OPTIONS)) {
    for (const opt of options) {
      OPTION_LABELS[opt.id] = opt.name;
    }
  }

  const sections = [
    { label: "Navbar", value: OPTION_LABELS[blueprint.navbar] || "Not selected" },
    { label: "Hero", value: OPTION_LABELS[blueprint.hero] || "Not selected" },
    { label: "Catalogue", value: OPTION_LABELS[blueprint.catalogue] || "Not selected" },
    { label: "Footer", value: OPTION_LABELS[blueprint.footer] || "Not selected" },
  ];

  const extrasOn = Object.entries(blueprint.extras || {})
    .filter(([, v]) => v)
    .map(([key]) => {
      const labels = { announcements: "Announcement Bars", whatsapp: "WhatsApp Float", about: "About Section", backToTop: "Back to Top" };
      return labels[key] || key;
    });

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-slate-400">
        Review your selections before deploying.
      </p>

      {/* Section summary */}
      <div className="divide-y divide-gray-100 dark:divide-white/10 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
        {sections.map((s) => (
          <div key={s.label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-gray-800 dark:text-white">{s.label}</span>
            <span className="text-sm text-gray-500 dark:text-slate-400">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Extras */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Extra Features</h3>
        {extrasOn.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {extrasOn.map((name) => (
              <span key={name} className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-medium">
                {name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-slate-500">None selected</p>
        )}
      </div>

      {/* Note */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
        <FiExternalLink size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
          Your storefront will be deployed to Vercel with a subdomain on keel.framestudio.co.ke. You'll need to set up a subdomain before deploying.
        </p>
      </div>
    </div>
  );
}
