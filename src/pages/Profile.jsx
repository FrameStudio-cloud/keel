import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
import Skeleton from "../components/Skeleton";
import { useSettings } from "../hooks/useSettings";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastProvider";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import {
  FiUser, FiCreditCard, FiGrid
} from "react-icons/fi";
import TabButton from "../components/settings/TabButton";
import ProfileAboutTab from "../components/profile/ProfileAboutTab";
import ProfileAccountTab from "../components/profile/ProfileAccountTab";
import ProfileQuickAccessTab from "../components/profile/ProfileQuickAccessTab";
import SignOutModal from "../components/profile/SignOutModal";

const TABS = [
  { id: "about", label: "About", subtitle: "Branding & contact info", icon: FiUser },
  { id: "account", label: "Account", subtitle: "Details & subscription", icon: FiCreditCard },
  { id: "quick", label: "Quick Access", subtitle: "Navigation & actions", icon: FiGrid },
];

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const settings = useSettings();
  const [activeTab, setActiveTab] = useState("about");
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [memberSince, setMemberSince] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (settings.loading) return;
    getShopId().then((shopId) => {
      if (!shopId) return;
      supabase.from("shops").select("created_at").eq("id", shopId).single()
        .then(({ data }) => { if (data?.created_at) setMemberSince(data.created_at); });
    });
  }, [settings.loading]);

  function handleSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  if (settings.loading) {
    return (
      <PageLayout title="Store Profile">
        <div className="flex gap-6">
          <div className="hidden lg:flex flex-col w-[220px] space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)}
          </div>
          <div className="flex-1 space-y-6">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </PageLayout>
    );
  }

  const {
    storeName, storePhone, storeAddress, websiteUrl, whatsapp,
    businessCategory, currencySymbol, defaultPayment, theme, logoUrl,
    subscriptionExpiresAt,
  } = settings;

  return (
    <PageLayout title="Store Profile">
      <Helmet><title>Store Profile — Keel</title></Helmet>
      <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="lg:hidden overflow-x-auto pb-3 -mx-4 px-4 mb-4">
        <div className="flex gap-1.5 min-w-max">
          {TABS.map((t) => <TabButton key={t.id} tab={t} isActive={activeTab === t.id} onSelect={setActiveTab} isMobile />)}
        </div>
      </div>

      <div className="flex gap-8 items-start">
        <aside className="hidden lg:flex flex-col w-[220px] shrink-0 sticky top-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
          <nav className="space-y-0.5">
            {TABS.map((t) => <TabButton key={t.id} tab={t} isActive={activeTab === t.id} onSelect={setActiveTab} />)}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <div key={activeTab} className="space-y-6 animate-[fadeSlideIn_0.2s_ease-out]">
            {activeTab === "about" && (
              <ProfileAboutTab
                storeName={storeName} businessCategory={businessCategory}
                logoUrl={logoUrl} memberSince={memberSince}
                refreshSettings={settings.refreshSettings}
                storePhone={storePhone} storeAddress={storeAddress}
                whatsapp={whatsapp} websiteUrl={websiteUrl}
              />
            )}
            {activeTab === "account" && (
              <ProfileAccountTab
                userEmail={user?.email} currencySymbol={currencySymbol}
                defaultPayment={defaultPayment} theme={theme}
                subscriptionExpiresAt={subscriptionExpiresAt}
              />
            )}
            {activeTab === "quick" && (
              <ProfileQuickAccessTab onSignOutClick={() => setShowSignOutModal(true)} />
            )}
          </div>
        </div>
      </div>

      {showSignOutModal && (
        <SignOutModal onClose={() => setShowSignOutModal(false)} onConfirm={handleSignOut} />
      )}
    </PageLayout>
  );
}
