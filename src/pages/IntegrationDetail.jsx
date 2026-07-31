import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiAward } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import { getIntegration } from "../lib/integrations";
import useIntegrationStatuses from "../hooks/useIntegrationStatuses";
import IntegrationHero from "../components/integrations/IntegrationHero";
import BenefitCards from "../components/integrations/BenefitCards";
import HowItWorks from "../components/integrations/HowItWorks";
import FaqSection from "../components/integrations/FaqSection";

export default function IntegrationDetail() {
  const { slug } = useParams();
  const integration = getIntegration(slug);
  const { statusOf } = useIntegrationStatuses();

  if (!integration) return <Navigate to="/integrations" replace />;

  const status = statusOf(integration);
  const Detail = integration.component;
  const { benefits, steps, faq } = integration;

  return (
    <PageLayout title={integration.name}>
      <Helmet><title>{integration.name} - Keel</title></Helmet>
      <div className="max-w-4xl mx-auto space-y-10">
        <Link
          to="/integrations"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <FiArrowLeft size={15} />
          Connect your tools
        </Link>

        <IntegrationHero integration={integration} status={status} />

        {benefits?.length > 0 && <BenefitCards benefits={benefits} />}

        {integration.preview ? (
          <section className="grid lg:grid-cols-2 gap-8 items-center">
            <integration.preview />
            {steps?.length > 0 && <HowItWorks steps={steps} />}
          </section>
        ) : (
          steps?.length > 0 && <HowItWorks steps={steps} />
        )}

        <section id="setup" className="scroll-mt-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {status.connected ? `Manage ${integration.name}` : `Set up ${integration.name}`}
          </h3>
          <div className="mt-4">
            {status.locked ? (
              <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-dashed border-amber-200 dark:border-amber-500/20 p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <FiAward size={22} className="text-white" />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-white">
                  {integration.name} is a Pro feature
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 max-w-[280px] mx-auto">
                  Unlock auto-replies on WhatsApp, calendar sync, and more with the Pro plan.
                </p>
                <Link
                  to="/settings?tab=billing"
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
                >
                  Upgrade to Pro
                </Link>
              </div>
            ) : (
              <Detail />
            )}
          </div>
        </section>

        {faq?.length > 0 && <FaqSection faq={faq} />}
      </div>
    </PageLayout>
  );
}
