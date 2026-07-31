import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiCheckCircle, FiLock, FiZap } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import { INTEGRATIONS } from "../lib/integrations";
import useIntegrationStatuses from "../hooks/useIntegrationStatuses";

function StatusPill({ status }) {
  if (status.locked) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-full px-2.5 py-1">
        <FiLock size={10} />
        Pro
      </span>
    );
  }
  if (status.connected) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full px-2.5 py-1">
        <FiCheckCircle size={11} />
        Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-2.5 py-1">
      Connect
    </span>
  );
}

export default function Integrations() {
  const { statusOf } = useIntegrationStatuses();

  return (
    <PageLayout title="Integrations">
      <Helmet><title>Integrations - Keel</title></Helmet>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Connect your tools</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Pick an integration to connect it — WhatsApp, Google Calendar and more.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INTEGRATIONS.map((integration) => {
            const status = statusOf(integration);
            return (
              <Link
                key={integration.slug}
                to={`/integrations/${integration.slug}`}
                className="group h-full bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 p-5 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${integration.tileClass} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <integration.icon size={20} className="text-white" />
                  </div>
                  <StatusPill status={status} />
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-800 dark:text-white">{integration.name}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500 leading-relaxed">{integration.tagline}</p>
              </Link>
            );
          })}

          <div className="h-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-5 flex flex-col items-center justify-center text-center">
            <FiZap size={22} className="text-gray-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-gray-400 dark:text-slate-500">More coming soon</p>
            <p className="mt-1 text-xs text-gray-300 dark:text-slate-600">New integrations drop here as Framestudio ships them.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
