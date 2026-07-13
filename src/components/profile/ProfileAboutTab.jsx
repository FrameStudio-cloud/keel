import { useRef } from "react";
import SectionCard from "../settings/SectionCard";
import { uploadImage } from "../../lib/storage";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";
import { FiPhone, FiMapPin, FiGlobe, FiMessageCircle, FiCamera } from "react-icons/fi";

const GRADIENTS = [
  "from-blue-500 to-purple-600", "from-emerald-500 to-teal-600",
  "from-orange-500 to-pink-600", "from-cyan-500 to-blue-600",
  "from-rose-500 to-red-600", "from-violet-500 to-indigo-600",
];

function hashName(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function ProfileAboutTab({ storeName, businessCategory, logoUrl, memberSince, showToast, refreshSettings, storePhone, storeAddress, whatsapp, websiteUrl }) {
  const fileInputRef = useRef(null);
  const gradient = GRADIENTS[hashName(storeName || "K") % GRADIENTS.length];

  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const shopId = await getShopId();
      if (!shopId) { showToast("Shop not found.", "error"); return; }
      const url = await uploadImage(file, shopId);
      const { error } = await supabase.from("store_settings").upsert({ logo_url: url, shop_id: shopId }, { onConflict: "shop_id" });
      if (error) { showToast(error.message || "Failed to save logo", "error"); return; }
      refreshSettings?.();
      showToast("Logo updated!");
    } catch {
      showToast("Failed to upload logo", "error");
    }
  }

  return (
    <>
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleLogoChange} />

      <SectionCard icon={FiCamera} title="Store Branding">
        <div className="flex items-start gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-xl font-bold text-white">{(storeName || "K")[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <FiCamera size={16} className="text-white" />
            </div>
          </button>
          <div className="min-w-0 pt-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{storeName || "Untitled Store"}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                {businessCategory?.charAt(0).toUpperCase() + businessCategory?.slice(1) || "General"}
              </span>
              {memberSince && (
                <span className="text-[10px] text-gray-400 dark:text-slate-500">
                  Member since {new Date(memberSince).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={FiMessageCircle} title="Contact">
        <div className="flex flex-col gap-2">
          <InfoRow icon={FiPhone} label="Phone" value={storePhone} />
          <InfoRow icon={FiMapPin} label="Address" value={storeAddress} />
          <InfoRow icon={FiMessageCircle} label="WhatsApp" value={whatsapp} />
          <InfoRow icon={FiGlobe} label="Website" value={websiteUrl} link />
        </div>
      </SectionCard>
    </>
  );
}

function InfoRow({ icon: Icon, label, value, link }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
      <Icon size={14} className="text-gray-400 shrink-0" />
      <span className="text-xs text-gray-400 dark:text-slate-500 w-16 shrink-0">{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 truncate hover:underline ml-auto">
          {value.replace(/^https?:\/\//, "")}
        </a>
      ) : (
        <span className="text-sm text-gray-800 dark:text-white truncate ml-auto">{value}</span>
      )}
    </div>
  );
}
