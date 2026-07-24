import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { FiGrid, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import EmptyState from "../components/EmptyState";
import ServiceFormModal from "../components/ServiceFormModal";
import { useToast } from "../context/ToastProvider";
import { useSettings } from "../hooks/useSettings";
import { formatPrice } from "../lib/format";
import { pricingModeLabels } from "../lib/defaultServices";
import { fetchServices, seedDefaultServices, createService, updateService, deleteService } from "../lib/serviceData";
import { useDebounce } from "../hooks/useDebounce";

export default function Services() {
  const { showToast } = useToast();
  const { businessCategory } = useSettings();
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebounce(searchQuery);

  useEffect(() => {
    if (!businessCategory) return;
    (async () => {
      setLoading(true);
      try {
        const data = await seedDefaultServices(businessCategory);
        setServices(data);
      } catch (e) {
        console.error("Failed to load services:", e);
      }
      setLoading(false);
    })();
  }, [businessCategory, refreshKey]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return services;
    const q = debouncedSearch.toLowerCase();
    return services.filter((s) => s.name.toLowerCase().includes(q));
  }, [services, debouncedSearch]);

  async function handleSave(data) {
    try {
      if (editing) {
        await updateService(editing.id, data);
        showToast("Service updated", "success");
      } else {
        await createService(data);
        showToast("Service added", "success");
      }
      setShowModal(false);
      setEditing(null);
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.error("Failed to save service:", e);
      showToast("Error saving service", "error");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteService(id);
      showToast("Service hidden", "warning");
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.error("Failed to delete service:", e);
    }
  }

  return (
    <PageLayout title="Services" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Helmet><title>Services — Keel</title></Helmet>

      <div className="flex justify-center mb-4">
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center justify-center gap-3 bg-blue-600 text-white font-medium text-base px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.97] w-full sm:w-auto"
        >
          <FiPlus size={22} />
          <span>Add service</span>
        </button>
      </div>
      <p className="text-sm text-gray-400 dark:text-slate-500 mb-4 -mt-2">{filtered.length} service{filtered.length !== 1 ? "s" : ""}</p>

      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-50 dark:bg-[#1a1a2e] rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FiGrid}
            title={debouncedSearch ? "No matching services" : "No services yet"}
            description={debouncedSearch ? "Try a different search term." : "Add your first service to start taking orders."}
            actionLabel={debouncedSearch ? undefined : "Add Service"}
            onClick={debouncedSearch ? undefined : () => setShowModal(true)}
          />
        ) : (
          <>
            <div className="sm:hidden space-y-2 p-3">
              {filtered.map((s) => (
                <div key={s.id} className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{s.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{s.category} · {pricingModeLabels[s.pricing_mode]}</p>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex-shrink-0 ml-3">{formatPrice(s.price)}</p>
                  </div>
                  {s.unit_label && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Per {s.unit_label}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { setEditing(s); setShowModal(true); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
                    >
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-red-200 dark:border-red-500/20 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">Service</th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">Category</th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">Pricing</th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{s.description}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-slate-500">{s.category}</td>
                    <td className="px-4 py-3 text-gray-400 dark:text-slate-500">
                      {pricingModeLabels[s.pricing_mode]}
                      {s.unit_label && <span className="text-xs ml-1">({s.unit_label})</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-700 dark:text-blue-400">{formatPrice(s.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditing(s); setShowModal(true); }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
                        >
                          <FiEdit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-red-200 dark:border-red-500/20 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        >
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {showModal && (
        <ServiceFormModal
          service={editing}
          defaultCategory={businessCategory}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </PageLayout>
  );
}
