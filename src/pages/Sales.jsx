import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { FiShoppingCart } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import Badge from "../components/Badge";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import LogSaleModal from "../components/LogSaleModal";
import ReceiptModal from "../components/ReceiptModal";
import QueueStatus from "../components/QueueStatus";
import ContextTip from "../components/ContextTip";
import Pagination from "../components/Pagination";
import { getShopId } from "../lib/shop";
import { paginateQuery } from "../lib/paginate";
import { useDebounce } from "../hooks/useDebounce";
import { formatPrice } from "../lib/format";

const PAGE_SIZE = 50;

export default function Sales() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const shopId = await getShopId();
      const { data, error, total: count } = await paginateQuery({
        table: "sales",
        shopId,
        page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch,
        searchColumns: ["product_name", "method"],
        orderBy: "created_at",
        ascending: false,
      });
      if (cancelled) return;
      if (error) {
        console.error(error);
      } else {
        setSales(data ?? []);
        setTotal(count);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [page, debouncedSearch, refreshKey]);

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

      
  }
  return (
    <PageLayout title="Sales" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Helmet><title>Sales — Keel</title></Helmet>
      <ContextTip tipKey="sales" targetSelector="[data-onboarding='log-sale']" title="Tip">
        <p>When a customer buys, tap <strong>Log Sale</strong> — receipt and revenue tracked automatically.</p>
      </ContextTip>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-text-faint">{total} transactions</p>
        <div className="flex items-center gap-2">
          <QueueStatus />
          <button
            data-onboarding="log-sale"
            onClick={() => setShowModal(true)}
            className="bg-brand text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-strong transition-all"
          >
            + Log sale
          </button>
        </div>
      </div>

      <div className="bg-surface-1 rounded-xl border border-border-subtle overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-2 rounded-xl px-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-5 w-20 flex-shrink-0 ml-3" />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={FiShoppingCart}
            title="No sales yet"
            description="Log your first sale to start tracking revenue and transactions."
            actionLabel="Log Sale"
            onClick={() => setShowModal(true)}
          />
        ) : (
          <>
            <div className="sm:hidden space-y-2 p-3">
              {sales.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setReceiptSale(s)}
                  className="bg-surface-2 rounded-xl px-4 py-3 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary text-sm font-medium truncate">{s.product_name}</p>
                      <p className="text-text-muted text-xs">{formatDate(s.created_at)}</p>
                    </div>
                    <p className="text-brand text-sm font-semibold flex-shrink-0 ml-3">
                      {formatPrice(s.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-text-muted">Qty: {s.quantity}</span>
                    <span className="text-xs text-text-muted">· {s.method}</span>
                    <Badge label="Paid" color="green" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setReceiptSale(s); }}
                      className="px-3 py-1.5 text-xs font-medium bg-surface-1 border border-brand-soft text-brand rounded-lg hover:bg-brand-muted transition-all ml-auto"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left text-xs font-medium text-text-faint px-4 py-3">
                    Item
                  </th>
                  <th className="text-left text-xs font-medium text-text-faint px-4 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-text-faint px-4 py-3">
                    Qty
                  </th>
                  <th className="text-left text-xs font-medium text-text-faint px-4 py-3">
                    Method
                  </th>
                  <th className="text-left text-xs font-medium text-text-faint px-4 py-3">
                    Amount
                  </th>
                  <th className="text-left text-xs font-medium text-text-faint px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-text-faint px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setReceiptSale(s)}
                    className="border-b border-border-subtle dark:border-border-subtle hover:bg-surface-2 transition-all cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {s.product_name}
                    </td>
                    <td className="px-4 py-3 text-text-faint">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-4 py-3 text-text-faint">{s.quantity}</td>
                    <td className="px-4 py-3 text-text-faint">{s.method}</td>
                    <td className="px-4 py-3 font-medium text-brand">
                      {formatPrice(s.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label="Paid" color="green" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setReceiptSale(s); }}
                        className="px-3 py-1.5 text-xs font-medium bg-surface-1 border border-brand-soft text-brand rounded-lg hover:bg-brand-muted transition-all"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </div>

      {showModal && (
        <LogSaleModal
          onClose={() => setShowModal(false)}
          onAdded={() => { setPage(0); setRefreshKey(k => k + 1); queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] }); }}
        />
      )}

      {receiptSale && (
        <ReceiptModal
          order={receiptSale}
          onClose={() => setReceiptSale(null)}
        />
      )}
    </PageLayout>
  );
}
