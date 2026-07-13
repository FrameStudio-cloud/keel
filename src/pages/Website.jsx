import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiGlobe, FiArrowRight } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import { useSettings } from "../hooks/useSettings";
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

const FEATURES = [
  { label: "Banners", desc: "Hero, sale & info banners" },
  { label: "Business Info", desc: "Store description & hours" },
  { label: "Gallery", desc: "Product image showcase" },
  { label: "Chat Widget", desc: "WhatsApp & live chat" },
];

export default function Website() {
  const { websiteUrl } = useSettings();
  const hasWebsite = !!websiteUrl;
  const [activeTab, setActiveTab] = useState("banners");

  if (!hasWebsite) {
    return (
      <PageLayout title="Website">
        <Helmet><title>Website — Keel</title></Helmet>
        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <FiGlobe className="text-slate-400" size={28} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            You haven't set up your website yet
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
            Link your mini-catalogue URL in Settings to unlock Banners, Business Info, Gallery, and Chat Widget.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-8">
            {FEATURES.map((f) => (
              <div key={f.label} className="bg-slate-50 dark:bg-white/[0.04] rounded-xl px-3 py-3 text-center">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{f.label}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          <Link
            to="/settings"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20"
          >
            Go to Settings
            <FiArrowRight size={16} />
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Website">
      <Helmet><title>Website — Keel</title></Helmet>
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
