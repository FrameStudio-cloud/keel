import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import { getIntegration } from "../lib/integrations";

export default function IntegrationDetail() {
  const { slug } = useParams();
  const integration = getIntegration(slug);

  if (!integration) return <Navigate to="/integrations" replace />;

  const Detail = integration.component;

  return (
    <PageLayout title={integration.name}>
      <Helmet><title>{integration.name} - Keel</title></Helmet>
      <div className="max-w-3xl mx-auto space-y-5">
        <Link
          to="/integrations"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <FiArrowLeft size={15} />
          Connect your tools
        </Link>

        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${integration.tileClass} flex items-center justify-center shadow-lg`}>
            <integration.icon size={26} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{integration.name}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{integration.tagline}</p>
          </div>
        </div>

        <Detail />
      </div>
    </PageLayout>
  );
}
