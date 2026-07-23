import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiGlobe, FiArrowRight } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import ContextTip from "../components/ContextTip";
import ProPanel from "../components/ProPanel";
import { useSettings } from "../hooks/useSettings";
import { isFeatureAccessible } from "../lib/tiers";
import BannersTab from "../components/website/BannersTab";
import BusinessTab from "../components/website/BusinessTab";
import GalleryTab from "../components/website/GalleryTab";
import ChatWidgetTab from "../components/website/ChatWidgetTab";

const TABS = [
  { id: "banners", label: "Banners" },
  { id: "business", label: "Business Info" },
  { id: "gallery", label: "Gallery" },
  { id: "chat", label: "Chat Widget" },
];

const MESH = `
  radial-gradient(circle at 20% 30%, rgba(59,130,246,0.08) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%),
  radial-gradient(circle at 50% 80%, rgba(16,185,129,0.06) 0%, transparent 50%)
`;

export default function Website() {
  const { planTier, websiteUrl } = useSettings();
  const hasWebsite = !!websiteUrl;
  const [activeTab, setActiveTab] = useState("banners");

  if (!isFeatureAccessible("website", planTier)) {
    return (
      <PageLayout title="Website">
        <Helmet><title>Website — Keel</title></Helmet>
        <ProPanel feature="website" />
      </PageLayout>
    );
  }

  if (!hasWebsite) {
    return (
      <PageLayout title="Website">
        <Helmet><title>Website — Keel</title></Helmet>
        <div className="relative overflow-hidden bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-8 sm:p-12 text-center" style={{ backgroundImage: MESH }}>
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center ring-4 ring-blue-100/50 dark:ring-blue-500/10">
              <FiGlobe className="text-blue-500" size={30} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
              You haven't set up your website yet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
              Link your mini-catalogue URL in Settings to unlock Banners, Business Info, Gallery, and Chat Widget.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl border border-slate-100 dark:border-white/[0.06] p-4 text-center group hover:border-blue-200/50 dark:hover:border-blue-500/20 transition-all">
                <div className="flex flex-col items-center gap-2.5 mb-2.5">
                  <div className="flex gap-1 w-full">
                    <div className="h-8 w-1/3 rounded-md bg-gradient-to-b from-purple-400 to-purple-500/60" />
                    <div className="h-8 w-1/3 rounded-md bg-gradient-to-b from-emerald-400 to-emerald-500/60" />
                    <div className="h-8 w-1/3 rounded-md bg-gradient-to-b from-blue-400 to-blue-500/60" />
                  </div>
                  <div className="flex gap-1.5 w-full justify-center">
                    <span className="text-[9px] font-medium text-purple-500">Hero</span>
                    <span className="text-[9px] text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[9px] font-medium text-emerald-500">Sale</span>
                    <span className="text-[9px] text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[9px] font-medium text-blue-500">Info</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Banners</p>
              </div>

              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl border border-slate-100 dark:border-white/[0.06] p-4 text-center group hover:border-blue-200/50 dark:hover:border-blue-500/20 transition-all">
                <div className="flex flex-col items-center gap-2 mb-2.5">
                  <div className="w-full bg-slate-100 dark:bg-white/[0.06] rounded-lg px-2.5 py-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded-full bg-blue-400" />
                      <div className="h-2 w-14 rounded-full bg-slate-200 dark:bg-white/10" />
                    </div>
                    <div className="flex gap-0.5 justify-center">
                      {["mon","tue","wed","thu","fri","sat","sun"].map((d,i) => (
                        <div key={d} className={`w-2 h-2 rounded-full ${i < 6 ? "bg-blue-400" : "bg-slate-200 dark:bg-white/10"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Business Info</p>
              </div>

              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl border border-slate-100 dark:border-white/[0.06] p-4 text-center group hover:border-blue-200/50 dark:hover:border-blue-500/20 transition-all">
                <div className="flex flex-col items-center gap-2 mb-2.5">
                  <div className="grid grid-cols-2 gap-1 w-full max-w-[80px]">
                    <div className="aspect-square rounded-md bg-gradient-to-br from-teal-300 to-teal-400" />
                    <div className="aspect-square rounded-md bg-gradient-to-br from-rose-300 to-rose-400" />
                    <div className="aspect-square rounded-md bg-gradient-to-br from-amber-300 to-amber-400" />
                    <div className="aspect-square rounded-md bg-gradient-to-br from-emerald-300 to-emerald-400" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gallery</p>
              </div>

              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl border border-slate-100 dark:border-white/[0.06] p-4 text-center group hover:border-blue-200/50 dark:hover:border-blue-500/20 transition-all">
                <div className="flex flex-col items-center gap-2 mb-2.5 relative">
                  <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl px-2.5 py-1.5 w-full">
                    <div className="h-2 w-16 rounded-full bg-slate-200 dark:bg-white/10 mx-auto mb-1" />
                    <div className="h-2 w-12 rounded-full bg-slate-200 dark:bg-white/10 mx-auto" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 absolute -bottom-1 -right-1">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chat Widget</p>
              </div>
            </div>

            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20"
            >
              Go to Settings
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Website">
      <Helmet><title>Website — Keel</title></Helmet>
      <ContextTip tipKey="website" title="Tip">
        <p>Configure your public website — banners, gallery, chat widget, and business info.</p>
      </ContextTip>
      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-white/10 overflow-x-auto overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px  ${
              activeTab === tab.id
                ? "text-blue-400 border-blue-500"
                : "text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "banners" && <BannersTab />}
      {activeTab === "business" && <BusinessTab />}
      {activeTab === "gallery" && <GalleryTab />}
      {activeTab === "chat" && <ChatWidgetTab />}
    </PageLayout>
  );
}
