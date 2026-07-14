import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  FiPackage,
  FiExternalLink,
  FiTrash2,
  FiRefreshCw,
  FiAlertTriangle,
  FiX,
  FiLock,
  FiAward,
} from "react-icons/fi";
import { IoStorefrontOutline } from "react-icons/io5";
import PageLayout from "../components/layout/PageLayout";
import { useSettings } from "../hooks/useSettings";
import TemplateModal from "../components/storefront/TemplateModal";
import ConfigModal from "../components/storefront/ConfigModal";
import DeployProgressModal from "../components/storefront/DeployProgressModal";
import TemplatePreview from "../components/storefront/TemplatePreview";
import { getShopId } from "../lib/shop";
import { PROVISIONER_URL } from "../lib/constants";

const steps = [
  {
    num: 1,
    icon: <FiPackage size={18} />,
    title: "Choose a Template",
    desc: "Pick a professionally designed layout that matches your brand.",
  },
  {
    num: 2,
    icon: <FiRefreshCw size={18} />,
    title: "One-Click Deploy",
    desc: "We build and deploy to Vercel instantly. No setup needed.",
  },
  {
    num: 3,
    icon: <FiExternalLink size={18} />,
    title: "Your Own Subdomain",
    desc: "Get a custom URL on keel.framestudio.co.ke for your shop.",
  },
];

export default function Storefront() {
  const { planTier, businessCategory } = useSettings();
  const [step, setStep] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(
    ["clothing", "wigs"].includes(businessCategory) ? "clothing" : "classic"
  );
  const [pendingSubdomain, setPendingSubdomain] = useState("");
  const [pendingShopId, setPendingShopId] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [redeploying, setRedeploying] = useState(false);
  const [redeployMessage, setRedeployMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const shopId = await getShopId();
        if (!shopId) { setLoadingExisting(false); return; }
        const res = await fetch(`${PROVISIONER_URL}/status?shop_id=${shopId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.deployed) {
            setDeployment({ url: data.url, subdomain: data.subdomain, templateId: data.template_id });
          }
        }
      } catch {
        // provisioner not reachable — no existing deployment
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, []);

  async function handleDeploy(subdomain, templateId) {
    const sid = await getShopId();
    setSelectedTemplate(templateId || "classic");
    setPendingSubdomain(subdomain);
    setPendingShopId(sid);
    setStep("progress");
  }

  function handleComplete(result) {
    setDeployment(result);
    setStep(null);
  }

  function handleError() {
    setStep(null);
  }

  async function handleDeleteConfirm() {
    const shopId = await getShopId();
    if (!shopId) return;
    setDeleteLoading(true);
    setConfirmDelete(false);
    try {
      await fetch(`${PROVISIONER_URL}/delete/${shopId}`, { method: "DELETE" });
    } catch {
      // best-effort backend cleanup — continue
    }
    setDeployment(null);
    setDeleteLoading(false);
  }

  async function handleRedeploy() {
    const shopId = await getShopId();
    if (!shopId || !deployment) return;
    setRedeploying(true);
    setRedeployMessage("Rebuilding catalogue...");
    try {
      const res = await fetch(`${PROVISIONER_URL}/provision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          subdomain: deployment.subdomain,
          template_id: deployment.templateId || "classic",
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setDeployment((prev) => ({
          ...prev,
          url: result.url.replace("https://", ""),
        }));
        setRedeployMessage("Catalogue updated!");
      } else {
        const err = await res.json();
        setRedeployMessage(err.error || "Update failed");
      }
    } catch {
      setRedeployMessage("Could not reach server");
    }
    setTimeout(() => {
      setRedeploying(false);
      setRedeployMessage("");
    }, 2000);
  }

  const hasDeployment = !!deployment;

  if (!["pro", "beta"].includes(planTier)) {
    return (
      <PageLayout title="Storefront">
        <Helmet>
          <title>Storefront - Keel</title>
        </Helmet>
        <div className="max-w-lg mx-auto pt-12 pb-8">
          <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FiAward size={28} className="text-white" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-gray-800 dark:text-white">
              Storefront is a Pro Feature
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Upgrade your plan to unlock a hosted mini-catalogue site with your own subdomain — no coding required.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-slate-500">
              <FiLock size={12} />
              <span>Your shop data stays intact. No data is lost.</span>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Storefront">
      <Helmet>
        <title>Storefront - Keel</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* ── Hero ── */}
        <div
          className={`relative overflow-hidden rounded-2xl ${
            hasDeployment
              ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white"
              : "bg-white dark:bg-[#16213e] border border-gray-200 dark:border-white/10"
          }`}
        >
          {/* Background pattern */}
          <div
            className={`absolute inset-0 opacity-[0.04] ${
              hasDeployment ? "" : "dark:opacity-[0.08]"
            }`}
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-6 md:p-8">
            {/* Floating device mockup */}
            <div className="order-2 md:order-1 flex-1 min-w-0">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                  hasDeployment
                    ? "bg-white/15 text-emerald-100"
                    : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}
              >
                <IoStorefrontOutline size={14} />
                {hasDeployment ? "Deployed" : "Mini-Catalogue"}
              </div>
              <h1
                className={`text-2xl md:text-3xl font-bold leading-tight ${
                  hasDeployment ? "text-white" : "text-gray-800 dark:text-white"
                }`}
              >
                {hasDeployment
                  ? "Your Storefront is Live"
                  : "Sell Online Instantly"}
              </h1>
              <p
                className={`text-sm mt-2 max-w-md leading-relaxed ${
                  hasDeployment
                    ? "text-emerald-100"
                    : "text-gray-500 dark:text-slate-400"
                }`}
              >
                {hasDeployment
                  ? "Your mini-catalogue site is publicly accessible. Share the link with customers."
                  : "Create a hosted catalogue site for your shop — no coding, no hosting setup."}
              </p>
              {!hasDeployment && (
                <button
                  onClick={() => setStep("template")}
                  disabled={loadingExisting}
                  className="mt-5 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingExisting ? "Checking..." : "Create Your Storefront"}
                </button>
              )}
            </div>

            {/* Device mockup */}
            <div className="order-1 md:order-2 flex-shrink-0">
              <div
                className={`relative w-36 md:w-40 transition-transform duration-500 hover:scale-105 ${
                  hasDeployment ? "opacity-80" : ""
                }`}
              >
                {/* Phone body */}
                <div
                  className={`rounded-[20px] p-2 shadow-xl ${
                    hasDeployment
                      ? "bg-white/20"
                      : "bg-gray-900 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`rounded-[14px] overflow-hidden ${
                      hasDeployment
                        ? "bg-white/10"
                        : "bg-white"
                    }`}
                  >
                    {/* Status bar */}
                    <div
                      className={`flex items-center justify-between px-3 py-1.5 text-[10px] ${
                        hasDeployment
                          ? "text-white/70"
                          : "text-gray-400"
                      }`}
                    >
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-1.5 rounded-sm bg-current" />
                        <span className="w-2 h-1.5 rounded-sm bg-current opacity-60" />
                      </div>
                    </div>
                    {/* Screen content */}
                    <div className="px-3 pb-3 space-y-2">
                      <div
                        className={`h-2 rounded ${
                          hasDeployment
                            ? "bg-white/20"
                            : "bg-gray-200"
                        } w-3/4`}
                      />
                      <div
                        className={`h-1.5 rounded ${
                          hasDeployment
                            ? "bg-white/15"
                            : "bg-gray-100"
                        } w-1/2`}
                      />
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded ${
                              hasDeployment
                                ? "bg-white/15"
                                : "bg-gray-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Glow */}
                <div
                  className={`absolute -inset-4 -z-10 rounded-full blur-2xl ${
                    hasDeployment
                      ? "bg-emerald-500/10"
                      : "bg-blue-500/10"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Template preview ── */}
        {!hasDeployment && <TemplatePreview />}

        {/* ── Workflow steps (not deployed) ── */}
        {!hasDeployment && (
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="group relative bg-white dark:bg-[#16213e] rounded-xl border border-gray-200 dark:border-white/10 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                      {s.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-1/2 w-px h-6 bg-gray-200 dark:bg-white/10" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                        Step {s.num}
                      </span>
                    </div>
                    <h3 className="mt-1 font-medium text-gray-800 dark:text-white text-sm">
                      {s.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Deployed status card ── */}
        {hasDeployment && (
          <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Top section */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-30" />
                    </span>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Live — deployed successfully
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <a
                      href={`https://${deployment.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 font-medium"
                    >
                      <FiExternalLink size={14} />
                      {deployment.url}
                    </a>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">
                      {deployment.subdomain}.keel.framestudio.co.ke
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`https://${deployment.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiExternalLink size={14} />
                    Open Site
                  </a>
                  <button
                    onClick={handleRedeploy}
                    disabled={redeploying}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiRefreshCw size={14} className={redeploying ? "animate-spin" : ""} />
                    {redeploying ? redeployMessage || "Updating..." : "Update"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={deleteLoading}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTrash2 size={14} />
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-white/5" />

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 dark:divide-white/5">
              {[
                { label: "Products", value: "—" },
                { label: "Page Views", value: "—" },
                { label: "Status", value: "Active" },
                { label: "Domain", value: "Verified" },
              ].map((stat) => (
                <div key={stat.label} className="px-4 py-3 text-center">
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-slate-300">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {step === "template" && (
        <TemplateModal
          businessCategory={businessCategory}
          onClose={() => setStep(null)}
          onSelect={(id) => { setSelectedTemplate(id); setStep("config"); }}
        />
      )}
      {step === "config" && (
        <ConfigModal
          onClose={() => setStep(null)}
          onDeploy={(subdomain) => handleDeploy(subdomain, selectedTemplate)}
          templateId={selectedTemplate}
        />
      )}
      {/* ── Delete confirmation ── */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm delete"
            className="bg-white dark:bg-[#16213e] rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    Delete storefront?
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                    This permanently removes your storefront from Vercel and releases the subdomain. Your shop data is not affected.
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 shadow-sm"
              >
                {deleteLoading ? "Deleting..." : "Delete Storefront"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "progress" && (
        <DeployProgressModal
          onClose={handleError}
          subdomain={pendingSubdomain}
          templateId={selectedTemplate}
          onComplete={handleComplete}
          onRetry={() => setStep("config")}
          shopId={pendingShopId}
        />
      )}
    </PageLayout>
  );
}
