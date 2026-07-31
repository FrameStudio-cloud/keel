import { Link } from "react-router-dom";
import { FiAward, FiCheckCircle, FiZap } from "react-icons/fi";

function scrollToSetup() {
  document.getElementById("setup")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function IntegrationHero({ integration, status }) {
  const locked = !!status?.locked;
  const connected = !!status?.connected;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${integration.tileClass} p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10`}>
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10" />
      <div className="absolute -right-2 top-16 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute right-28 -bottom-20 w-48 h-48 rounded-full bg-white/10" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0 shadow-inner">
            <integration.icon size={30} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight">{integration.name}</h2>
            <p className="text-sm text-white/85 mt-0.5 max-w-sm">{integration.tagline}</p>
            <span className="inline-flex items-center mt-2.5 text-[11px] font-semibold uppercase tracking-wide bg-white/15 rounded-full px-2.5 py-1">
              {integration.category}
            </span>
          </div>
        </div>

        <div className="sm:ml-auto shrink-0">
          {locked ? (
            <Link
              to="/settings?tab=billing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <FiAward size={15} />
              Upgrade to Pro
            </Link>
          ) : connected ? (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-lg text-sm font-semibold">
              <FiCheckCircle size={15} />
              Connected
            </span>
          ) : (
            <button
              type="button"
              onClick={scrollToSetup}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <FiZap size={15} />
              Set up {integration.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
