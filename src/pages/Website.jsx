import { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import ListingsTab from "../components/website/ListingsTab";
import BannersTab from "../components/website/BannersTab";
import BusinessTab from "../components/website/BusinessTab";
import GalleryTab from "../components/website/GalleryTab";

const TABS = [
  { id: "listings", label: "Listings" },
  { id: "banners", label: "Banners" },
  { id: "business", label: "Business Info" },
  { id: "gallery", label: "Gallery" },
];

export default function Website() {
  const [activeTab, setActiveTab] = useState("listings");

  return (
    <PageLayout title="Website">
      <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "text-blue-400 border-blue-500"
                : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "listings" && <ListingsTab />}
      {activeTab === "banners" && <BannersTab />}
      {activeTab === "business" && <BusinessTab />}
      {activeTab === "gallery" && <GalleryTab />}
    </PageLayout>
  );
}
