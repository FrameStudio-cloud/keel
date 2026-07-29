import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
import ProPanel from "../components/ProPanel";
import { useSettings } from "../hooks/useSettings";
import StorefrontLanding from "../components/storefront/StorefrontLanding";
import StorefrontDetail from "../components/storefront/StorefrontDetail";
import SectionPicker from "../components/storefront/SectionPicker";
import ConfigModal from "../components/storefront/ConfigModal";
import DeployProgressModal from "../components/storefront/DeployProgressModal";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { PROVISIONER_URL } from "../lib/constants";
import { blueprintToSectionIds, getDefaultBlueprint, getTemplateById, buildProvisionerPayload } from "../data/storefrontBlueprints";

export default function Storefront() {
  const { planTier, businessCategory, storeName, description, logoUrl, primaryColor, secondaryColor, accentColor } = useSettings();
  const [view, setView] = useState("landing"); // landing | detail | build | config | progress
  const [templateType, setTemplateType] = useState(
    ["clothing", "wigs"].includes(businessCategory) ? "fashion" : "classic"
  );
  const [selectedItem, setSelectedItem] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [pendingSubdomain, setPendingSubdomain] = useState("");
  const [pendingSections, setPendingSections] = useState(null);
  const [pendingShopId, setPendingShopId] = useState(null);

  const [redeploying, setRedeploying] = useState(false);
  const [redeployMessage, setRedeployMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [deployedAt, setDeployedAt] = useState(null);

  const shopSettings = { storeName, description, logoUrl, primaryColor, secondaryColor, accentColor }

  async function refreshStats() {
    try {
      const shopId = await getShopId();
      if (!shopId) return;
      const { count: productCount } = await supabase
        .from("catalogue")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId);
      const { count: pageViewCount } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId);
      setStats({ products: productCount ?? 0, pageViews: pageViewCount ?? 0 });
    } catch {
      // stats unavailable
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const shopId = await getShopId();
        if (!shopId) return;
        const res = await fetch(`${PROVISIONER_URL}/status?shop_id=${shopId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.deployed) {
            setDeployment({ url: data.url, domain: data.domain, subdomain: data.subdomain, templateId: data.template_id, updatedAt: data.updated_at });
            setDeployedAt(data.updated_at || data.created_at || null);
            await refreshStats();
          }
        }
      } catch {
        // provisioner not reachable
      }
    })();
  }, []);

  // Clicked a gallery card → show storefront detail page with screenshots
  function handleSelectStorefront(item) {
    setSelectedItem(item);
    setTemplateType(item.templateId || "classic");
    setView("detail");
  }

  // Clicked "Deploy This Storefront" on the detail page
  function handleDeployFromDetail() {
    setPendingSections(null);
    setView("config");
  }

  // Clicked "Build Yours" → open section picker wizard
  function handleBuildCustom() {
    setTemplateType("custom");
    const defaults = getDefaultBlueprint("custom");
    setPendingSections(blueprintToSectionIds(defaults));
    setView("build");
  }

  // SectionPicker finished → convert blueprint to section IDs, go to config
  function handleBlueprintReady(blueprint) {
    const sectionIds = blueprintToSectionIds(blueprint)
    setPendingSections(sectionIds)
    setView("config")
  }

  async function handleDeploy(subdomain, sections) {
    const sid = await getShopId();
    setPendingSubdomain(subdomain);
    setPendingSections(sections || null);
    setPendingShopId(sid);
    setView("progress");
  }

  function handleComplete(result) {
    setDeployment({ ...result, templateId: templateType });
    setDeployedAt(new Date().toISOString());
    setView("landing");
    refreshStats();
  }

  function handleError() {
    setView("landing");
  }

  async function handleDelete() {
    const shopId = await getShopId();
    if (!shopId) return;
    try {
      await fetch(`${PROVISIONER_URL}/delete/${shopId}`, { method: "DELETE" });
    } catch {
      // best-effort
    }
    setDeployment(null);
  }

  async function handleRedeploy() {
    const shopId = await getShopId();
    if (!shopId || !deployment) return;
    setRedeploying(true);
    setRedeployMessage("Rebuilding catalogue...");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const payload = buildProvisionerPayload({
        shopId,
        templateId: deployment.templateId || "classic",
        subdomain: deployment.subdomain,
        shopSettings,
      })
      const res = await fetch(`${PROVISIONER_URL}/provision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const result = await res.json();
        setDeployment((prev) => ({
          ...prev,
          domain: result.domain,
        }));
        setDeployedAt(new Date().toISOString());
        setRedeployMessage("Catalogue updated!");
        refreshStats();
      } else {
        try { const err = await res.json(); setRedeployMessage(err.error || `Update failed (${res.status})`); }
        catch { setRedeployMessage(`Update failed (${res.status})`); }
      }
    } catch (err) {
      setRedeployMessage(err?.name === "AbortError" ? "Request timed out — the provisioner may be waking up. Try again." : `Error: ${err?.message || "Unknown"}`);
    }
    setRedeploying(false);
  }

  function handleDismissMessage() {
    setRedeployMessage("");
  }

  if (!["pro", "beta"].includes(planTier)) {
    return (
      <PageLayout title="Storefront">
        <Helmet><title>Storefront - Keel</title></Helmet>
        <ProPanel feature="storefront" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Storefront">
      <Helmet><title>Storefront - Keel</title></Helmet>
      <div className="max-w-5xl mx-auto">
        {view === "landing" && (
          <StorefrontLanding
            deployment={deployment}
            stats={stats}
            redeploying={redeploying}
            redeployMessage={redeployMessage}
            deployedAt={deployedAt}
            onSelectStorefront={handleSelectStorefront}
            onBuildCustom={handleBuildCustom}
            onDelete={handleDelete}
            onRedeploy={handleRedeploy}
            onDismissMessage={handleDismissMessage}
          />
        )}

        {view === "detail" && selectedItem && (
          <StorefrontDetail
            item={selectedItem}
            onDeploy={handleDeployFromDetail}
            onBack={() => setView("landing")}
          />
        )}

        {view === "build" && (
          <SectionPicker
            templateType="custom"
            onDeploy={handleBlueprintReady}
            onBack={() => setView("landing")}
          />
        )}

        {view === "config" && (
          <ConfigModal
            onClose={() => setView("landing")}
            onDeploy={(subdomain) => handleDeploy(subdomain, pendingSections)}
            templateId={templateType}
          />
        )}

        {view === "progress" && (
          <DeployProgressModal
            onClose={handleError}
            subdomain={pendingSubdomain}
            templateId={templateType}
            onComplete={handleComplete}
            onRetry={() => setView("config")}
            shopId={pendingShopId}
            sections={pendingSections}
            shopSettings={shopSettings}
          />
        )}
      </div>
    </PageLayout>
  );
}
