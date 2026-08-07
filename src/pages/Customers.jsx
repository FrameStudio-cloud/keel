import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { FiUsers, FiEdit2, FiTrash2, FiPhone, FiChevronDown, FiChevronUp } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import EmptyState from "../components/EmptyState";
import CustomerFormModal from "../components/CustomerFormModal";
import ContextTip from "../components/ContextTip";
import { useToast } from "../context/ToastProvider";
import { formatPrice } from "../lib/format";
import { fetchCustomers, updateCustomer, deleteCustomer } from "../lib/serviceData";
import { useDebounce } from "../hooks/useDebounce";

export default function Customers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebounce(searchQuery);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCustomers(debouncedSearch);
        setCustomers(data);
      } catch (e) {
        console.error("Failed to fetch customers:", e);
      }
      setLoading(false);
    })();
  }, [debouncedSearch, refreshKey]);

  const filtered = useMemo(() => {
    return customers;
  }, [customers]);

  async function handleSave(data) {
    if (editing) {
      await updateCustomer(editing.id, data);
      setEditing(null);
      showToast("Customer updated", "success");
      setRefreshKey(k => k + 1);
    }
  }

  async function handleDelete(id) {
    await deleteCustomer(id);
    showToast("Customer deleted", "warning");
    setRefreshKey(k => k + 1);
  }

  return (
    <PageLayout title="Customers" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Helmet><title>Customers — Keel</title></Helmet>

      <p className="text-sm text-text-faint mb-4">{customers.length} customers — auto-saved from orders</p>

      <ContextTip tipKey="customers" title="Customers">
        Customers are automatically saved when you create an order. Come here to view order history, edit details, or delete customer records.
      </ContextTip>

      <div className="bg-surface-1 rounded-xl border border-border-subtle overflow-hidden">
        {loading ? (
          <div className="space-y-1 p-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-surface-2 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title="No customers yet"
            description="Customers are automatically saved when you create an order."
          />
        ) : (
          <div className="space-y-1 p-3">
            {filtered.map((c) => {
              const expanded = expandedId === c.id;
              return (
                <div key={c.id} className="bg-surface-2 rounded-xl">
                  <div
                    onClick={() => setExpandedId(expanded ? null : c.id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <div className="w-9 h-9 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                      <FiUsers className="text-chart-4" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary text-sm font-medium truncate">{c.name}</p>
                      <div className="flex items-center gap-2 text-xs text-text-faint">
                        <FiPhone size={10} />
                        <span>{c.phone}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs shrink-0">
                      <p className="text-text-muted">{c.total_orders} orders</p>
                      <p className="text-brand font-medium">{formatPrice(c.total_spent)}</p>
                    </div>
                    <span className="text-text-faint dark:text-text-body">
                      {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </span>
                  </div>

                  {expanded && (
                    <div className="px-4 pb-3 pt-0 border-t border-border-subtle dark:border-border-subtle">
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-surface-1 rounded-lg px-3 py-2">
                          <p className="text-text-faint">Phone</p>
                          <p className="text-text-body font-medium">{c.phone}</p>
                        </div>
                        <div className="bg-surface-1 rounded-lg px-3 py-2">
                          <p className="text-text-faint">Email</p>
                          <p className="text-text-body font-medium">{c.email || "—"}</p>
                        </div>
                        <div className="bg-surface-1 rounded-lg px-3 py-2">
                          <p className="text-text-faint">Total orders</p>
                          <p className="text-text-body font-medium">{c.total_orders}</p>
                        </div>
                        <div className="bg-surface-1 rounded-lg px-3 py-2">
                          <p className="text-text-faint">Total spent</p>
                          <p className="text-brand font-medium">{formatPrice(c.total_spent)}</p>
                        </div>
                      </div>
                      {c.notes && (
                        <div className="mt-2 bg-warning-muted rounded-lg px-3 py-2 text-xs text-accent-300">
                          <span className="font-medium">Note:</span> {c.notes}
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditing(c); }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border-subtle text-text-muted rounded-lg hover:bg-surface-2 transition-all"
                        >
                          <FiEdit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-danger text-danger rounded-lg hover:bg-danger-muted transition-all"
                        >
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <CustomerFormModal
          customer={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </PageLayout>
  );
}
