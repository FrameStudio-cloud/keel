import { useState } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
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

export default function Website() {
  const [activeTab, setActiveTab] = useState("banners");

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
