import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import ContextTip from "../components/ContextTip";
import ProGate from "../components/ProGate";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/format";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, FiUpload, FiCheck, FiX, FiSearch } from "react-icons/fi";
import { useDebounce } from "../hooks/useDebounce";
import { useSettings } from "../hooks/useSettings";
import useThemeColors from "../hooks/useThemeColors";
import { SERVICE_CATEGORIES } from "../lib/constants";
import { parseCSV, matchTransactions } from "../engine/mpesa-reconciliation";
import { fetchServiceRevenue } from "../lib/serviceData";

const PAYMENT_TOKEN = {
  Cash: "chart3",
  "M-Pesa": "chart1",
  Bank: "chart2",
  Card: "chart4",
  "Bank Transfer": "chart2",
};
const EXPENSE_CATEGORIES = ["Supplies", "Utilities", "Transport", "Marketing", "Maintenance", "Salary", "General"];

export default function Finance() {
  const { businessCategory } = useSettings();
  const theme = useThemeColors();
  const paymentColor = (method) => theme[PAYMENT_TOKEN[method]] || theme.chart6;
  const isService = SERVICE_CATEGORIES.includes(businessCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [summary, setSummary] = useState({ revenue: 0, transactions: 0, expenses: 0 });
  const [paymentData, setPaymentData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", category: "General", payment_method: "Cash", expense_date: new Date().toISOString().slice(0, 10) });
  const [editingExpense, setEditingExpense] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRecon, setShowRecon] = useState(false);
  const [reconStep, setReconStep] = useState("upload");
  const [reconMode, setReconMode] = useState("csv");
  const [csvText, setCsvText] = useState("");
  const [parsedTx, setParsedTx] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [manualForm, setManualForm] = useState({ receiptNo: "", amount: "", date: "", sender: "" });
  const [manualTxs, setManualTxs] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      if (!shopId) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const expensesRes = await supabase
        .from("expenses")
        .select("*")
        .eq("shop_id", shopId)
        .eq("expense_date", today.toISOString().slice(0, 10))
        .order("created_at", { ascending: false })
        .limit(500);

      const expenseTotal = expensesRes.data?.reduce((sum, e) => sum + e.amount, 0) || 0;

      if (isService) {
        const result = await fetchServiceRevenue();
        setSummary({ revenue: result.revenue, transactions: result.transactions, expenses: expenseTotal });
        setPaymentData(result.paymentData);
        setExpenses(expensesRes.data || []);
      } else {
        const salesRes = await supabase
          .from("sales")
          .select("amount, method")
          .eq("shop_id", shopId)
          .gte("created_at", today.toISOString())
          .lte("created_at", todayEnd.toISOString())
          .limit(500);

        const sales = salesRes.data || [];
        const revenue = sales.reduce((sum, s) => sum + s.amount, 0);
        setSummary({ revenue, transactions: sales.length, expenses: expenseTotal });

        const methodMap = {};
        sales.forEach((s) => {
          methodMap[s.method] = (methodMap[s.method] || 0) + s.amount;
        });
        setPaymentData(
          Object.entries(methodMap).map(([method, amount]) => ({
            name: method,
            value: amount,
          }))
        );

        setExpenses(expensesRes.data || []);
      }
      setLoading(false);
    })();
  }, [refreshKey, isService]);

  async function handleAddExpense() {
    if (!expenseForm.description || !expenseForm.amount) return;
    const shopId = await getShopId();
    const payload = {
      description: expenseForm.description,
      amount: parseInt(expenseForm.amount),
      category: expenseForm.category,
      payment_method: expenseForm.payment_method,
      expense_date: expenseForm.expense_date,
      shop_id: shopId,
    };
    const { error } = await supabase.from("expenses").insert(payload);
    if (!error) {
      setExpenseForm({ description: "", amount: "", category: "General", payment_method: "Cash", expense_date: new Date().toISOString().slice(0, 10) });
      setShowForm(false);
      setRefreshKey((k) => k + 1);
    }
  }

  async function handleUpdateExpense() {
    if (!editingExpense) return;
    const shopId = await getShopId();
    const { error } = await supabase
      .from("expenses")
      .update({
        description: expenseForm.description,
        amount: parseInt(expenseForm.amount),
        category: expenseForm.category,
        payment_method: expenseForm.payment_method,
        expense_date: expenseForm.expense_date,
      })
      .eq("id", editingExpense.id)
      .eq("shop_id", shopId);
    if (!error) {
      setEditingExpense(null);
      setExpenseForm({ description: "", amount: "", category: "General", payment_method: "Cash", expense_date: new Date().toISOString().slice(0, 10) });
      setShowForm(false);
      setRefreshKey((k) => k + 1);
    }
  }

  async function handleDeleteExpense(id) {
    const shopId = await getShopId();
    await supabase.from("expenses").delete().eq("id", id).eq("shop_id", shopId);
    setRefreshKey((k) => k + 1);
  }

  async function fetchMpesaSales() {
    const shopId = await getShopId();
    if (!shopId) return;
    const { data } = await supabase.from("sales").select("id, amount, method, mpesa_code, created_at").eq("shop_id", shopId).eq("method", "M-Pesa").order("created_at", { ascending: false }).limit(2000);
    setAllSales(data || []);
    return data || [];
  }

  function handleCsvChange(text) {
    setCsvText(text);
    if (!text.trim()) { setParsedTx([]); setMatchResult(null); setReconStep("upload"); return; }
    const result = parseCSV(text);
    if (result.transactions.length === 0) return;
    setParsedTx(result.transactions);
    setReconStep("preview");
  }

  function handleAddManual() {
    if (!manualForm.receiptNo || !manualForm.amount) return;
    const tx = {
      receiptNo: manualForm.receiptNo.trim(),
      amount: parseFloat(manualForm.amount),
      completionTime: manualForm.date || null,
      sender: manualForm.sender.trim(),
      transactionType: "Manual",
      balance: null,
    };
    setManualTxs(prev => [...prev, tx]);
    setManualForm({ receiptNo: "", amount: "", date: "", sender: "" });
  }

  function handleRemoveManual(i) {
    setManualTxs(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleRunMatch() {
    const txs = reconMode === "csv" ? parsedTx : manualTxs;
    if (txs.length === 0) return;
    const sales = allSales.length > 0 ? allSales : await fetchMpesaSales();
    const result = matchTransactions(sales, txs);
    setMatchResult(result);
    setReconStep("results");
  }

  async function handleSaveMatches() {
    if (!matchResult || matchResult.matched.length === 0) return;
    setSaving(true);
    const shopId = await getShopId();
    if (!shopId) { setSaving(false); return; }

    const inserts = matchResult.matched.map(m => ({
      shop_id: shopId,
      receipt_no: m.transaction.receiptNo,
      completion_time: m.transaction.completionTime,
      sender: m.transaction.sender,
      amount: m.transaction.amount,
      balance: m.transaction.balance,
      transaction_type: m.transaction.transactionType,
      matched_sale_id: m.sale.id,
      matched_at: new Date().toISOString(),
    }));

    const unmatchedTxs = matchResult.unmatchedMpesa.map(tx => ({
      shop_id: shopId,
      receipt_no: tx.receiptNo,
      completion_time: tx.completionTime,
      sender: tx.sender,
      amount: tx.amount,
      balance: tx.balance,
      transaction_type: tx.transactionType,
    }));

    const allInserts = [...inserts, ...unmatchedTxs];
    if (allInserts.length === 0) { setSaving(false); return; }

    const { error } = await supabase.from("mpesa_transactions").insert(allInserts);
    if (error) { console.error("Save error:", error); setSaving(false); return; }

    for (const m of matchResult.matched) {
      if (m.sale.mpesa_code) continue;
      await supabase.from("sales").update({ mpesa_code: m.transaction.receiptNo }).eq("id", m.sale.id);
    }

    setSaved(true);
    setSaving(false);
    setRefreshKey(k => k + 1);
  }

  function resetRecon() {
    setShowRecon(false);
    setCsvText("");
    setParsedTx([]);
    setMatchResult(null);
    setReconStep("upload");
    setSaved(false);
    setManualTxs([]);
    setManualForm({ receiptNo: "", amount: "", date: "", sender: "" });
  }

  async function fetchHistory() {
    setHistoryLoading(true);
    const shopId = await getShopId();
    if (!shopId) { setHistoryLoading(false); return; }
    const { data } = await supabase
      .from("mpesa_transactions")
      .select("id, receipt_no, amount, completion_time, sender, matched_sale_id, matched_at, created_at")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(500);
    setHistoryData(data || []);
    setHistoryLoading(false);
  }

  function closeHistory() {
    setShowHistory(false);
    setHistoryData([]);
  }

  function startEdit(expense) {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      payment_method: expense.payment_method,
      expense_date: expense.expense_date,
    });
    setShowForm(true);
  }

  const net = summary.revenue - summary.expenses;
  const filteredExpenses = useMemo(() => {
    if (!debouncedSearch) return expenses;
    const q = debouncedSearch.toLowerCase();
    return expenses.filter((e) =>
      e.description?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q) ||
      e.payment_method?.toLowerCase().includes(q)
    );
  }, [expenses, debouncedSearch]);

  if (loading) {
    return (
      <PageLayout title="Finance" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Finance" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Helmet><title>Finance — Keel</title></Helmet>
      <ContextTip tipKey="finance" targetSelector="[data-onboarding='log-expense']" title="Tip">
        <p>Track your spending. Tap <strong>Log Expense</strong> to record an expense by category.</p>
      </ContextTip>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Revenue today" value={formatPrice(summary.revenue)} change={`${summary.transactions} transaction(s)`} up={summary.revenue > 0} />
        <StatCard label="Expenses today" value={formatPrice(summary.expenses)} change={summary.expenses > 0 ? "Logged today" : "None"} up={summary.expenses === 0} />
        <StatCard label="Net today" value={formatPrice(net)} change={net >= 0 ? "Positive" : "Negative"} up={net >= 0} />
        <StatCard label="Transactions" value={summary.transactions} change="Today" up={summary.transactions > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-text-primary">Payment Breakdown</p>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchHistory(); }} className="flex items-center gap-1.5 text-xs font-medium text-text-muted border border-border-subtle px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-all">
                {showHistory ? <FiX size={14} /> : null}
                Past Reconciliations
              </button>
              <ProGate feature="finance_mpesa">
                {!isService && (
                  <button onClick={() => { if (!showRecon) { setShowRecon(true); fetchMpesaSales(); } else setShowRecon(!showRecon); }} className="flex items-center gap-1.5 text-xs font-medium text-brand bg-brand-muted px-3 py-1.5 rounded-lg hover:bg-brand-muted transition-all">
                    {showRecon ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    Reconcile M-Pesa
                  </button>
                )}
              </ProGate>
            </div>
          </div>
          {paymentData.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-8">No sales today</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {paymentData.map((entry, i) => (
                        <Cell key={i} fill={paymentColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatPrice(v)}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: `1px solid ${theme.borderSubtle}`,
                        background: theme.surface1,
                        color: theme.textPrimary,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {paymentData.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: paymentColor(p.name) }} />
                      <span className="text-text-body">{p.name}</span>
                    </div>
                    <span className="font-medium text-text-primary">{formatPrice(p.value)}</span>
                  </div>
                ))}
                <div className="border-t border-border-subtle pt-2 flex items-center justify-between text-sm font-semibold">
                  <span className="text-text-primary">Total</span>
                  <span className="text-text-primary">{formatPrice(summary.revenue)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <ContextTip tipKey="finance-overview" title="Finance">
          Track today&apos;s revenue, see payment breakdowns, and log expenses. Use M-Pesa reconciliation to match payments to sales automatically.
        </ContextTip>
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
          <p className="text-sm font-medium text-text-primary mb-4">Today's Expenses</p>
          {!showForm ? (
            <button
              data-onboarding="log-expense"
              onClick={() => { setEditingExpense(null); setExpenseForm({ description: "", amount: "", category: "General", payment_method: "Cash", expense_date: new Date().toISOString().slice(0, 10) }); setShowForm(true); }}
              className="flex items-center gap-2 text-xs text-brand hover:underline"
            >
              <FiPlus /> Log expense
            </button>
          ) : (
            <div className="space-y-2 mb-4">
              <input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="Description"
                className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Amount"
                  type="number"
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                />
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                >
                  {EXPENSE_CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={expenseForm.payment_method}
                  onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                >
                  <option>Cash</option>
                  <option>M-Pesa</option>
                  <option>Bank</option>
                </select>
                <input
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                  type="date"
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                  className="flex-1 bg-brand text-white text-xs py-2 rounded-lg hover:bg-brand-strong transition-all"
                >
                  {editingExpense ? "Update" : "Add expense"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingExpense(null); }}
                  className="flex-1 border border-border-subtle text-text-muted text-xs py-2 rounded-lg hover:bg-surface-2 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {expenses.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-4">No expenses logged today</p>
          ) : filteredExpenses.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-4">No matching expenses</p>
          ) : (
            <div className="space-y-1.5 mt-2">
              {filteredExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border-subtle dark:border-border-subtle last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary truncate">{e.description}</p>
                    <p className="text-xs text-text-faint">{e.category} · {e.payment_method}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-medium text-danger text-sm">{formatPrice(e.amount)}</span>
                    <button onClick={() => startEdit(e)} className="px-2.5 py-1.5 text-xs font-medium bg-surface-1 border border-border-subtle text-text-muted rounded-lg hover:bg-brand-muted hover:text-brand hover:border-brand-soft transition-all"><FiEdit2 size={13} className="mr-1 inline" /> Edit</button>
                    <button onClick={() => handleDeleteExpense(e.id)} className="px-2.5 py-1.5 text-xs font-medium bg-surface-1 border border-border-subtle text-text-muted rounded-lg hover:bg-danger-muted hover:text-danger hover:border-danger transition-all"><FiTrash2 size={13} className="mr-1 inline" /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showHistory && (
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-4 mb-6 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-primary">Past Reconciliations</h3>
            <button onClick={closeHistory} className="text-text-faint hover:text-text-body"><FiX size={16} /></button>
          </div>
          {historyLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-surface-2 dark:bg-white/5 rounded-lg animate-pulse" />)}</div>
          ) : historyData.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-6">No past reconciliations yet. Upload a CSV or enter transactions manually to start.</p>
          ) : (
            <div className="border border-border-subtle rounded-lg overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-2 dark:bg-white/[0.03]">
                    <th className="text-left px-3 py-2 font-medium text-text-muted">Receipt No.</th>
                    <th className="text-right px-3 py-2 font-medium text-text-muted">Amount</th>
                    <th className="text-left px-3 py-2 font-medium text-text-muted">Date</th>
                    <th className="text-left px-3 py-2 font-medium text-text-muted">Sender</th>
                    <th className="text-left px-3 py-2 font-medium text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((tx) => (
                    <tr key={tx.id} className="border-b border-border-subtle dark:border-border-subtle">
                      <td className="px-3 py-2 text-text-primary font-mono">{tx.receipt_no}</td>
                      <td className="px-3 py-2 text-right text-text-primary font-medium">{formatPrice(tx.amount)}</td>
                      <td className="px-3 py-2 text-text-faint">{tx.completion_time ? new Date(tx.completion_time).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td className="px-3 py-2 text-text-faint">{tx.sender || "—"}</td>
                      <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${tx.matched_sale_id ? "bg-success-muted text-success" : "bg-warning-muted text-warning"}`}>{tx.matched_sale_id ? <><FiCheck size={11} /> Matched</> : <><FiX size={11} /> Unmatched</>}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ProGate feature="finance_mpesa">
      {!isService && showRecon && (
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-4 mb-6 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-primary">M-Pesa Reconciliation</h3>
            <div className="flex items-center gap-2">
              {reconStep === "upload" && (
                <div className="flex bg-surface-2 dark:bg-white/[0.06] rounded-lg p-0.5 text-xs">
                  <button onClick={() => { setReconMode("csv"); setCsvText(""); setParsedTx([]); setManualTxs([]); }} className={`px-3 py-1.5 rounded-md transition-all ${reconMode === "csv" ? "bg-surface-1 text-text-primary shadow-sm" : "text-text-muted hover:text-text-body"}`}>Upload CSV</button>
                  <button onClick={() => { setReconMode("manual"); setCsvText(""); setParsedTx([]); setManualTxs([]); }} className={`px-3 py-1.5 rounded-md transition-all ${reconMode === "manual" ? "bg-surface-1 text-text-primary shadow-sm" : "text-text-muted hover:text-text-body"}`}>Manual Entry</button>
                </div>
              )}
              <button onClick={resetRecon} className="text-text-faint hover:text-text-body" aria-label="Close reconciliation"><FiX size={16} /></button>
            </div>
          </div>

          {reconStep === "upload" && reconMode === "csv" && (
            <div>
              <p className="text-xs text-text-faint mb-3">Download your M-Pesa statement from the Safaricom app (M-Pesa &gt; Statement &gt; Download as CSV), then paste it below or upload the file.</p>
              <textarea value={csvText} onChange={(e) => handleCsvChange(e.target.value)} placeholder="Paste CSV content here..." rows={6} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand font-mono" />
              <label className="flex items-center gap-2 text-xs text-brand cursor-pointer mt-2 hover:underline">
                <FiUpload size={14} /> Upload CSV file
                <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => handleCsvChange(r.result); r.readAsText(f); } }} />
              </label>
              {csvText.trim() && parsedTx.length === 0 && (
                <p className="text-xs text-danger mt-2">Could not find any valid transactions. Check that your CSV has receipt numbers and amounts.</p>
              )}
            </div>
          )}

          {reconStep === "upload" && reconMode === "manual" && (
            <div>
              <p className="text-xs text-text-faint mb-3">Enter one or more M-Pesa transactions manually to match against your sales.</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <input value={manualForm.receiptNo} onChange={(e) => setManualForm(f => ({ ...f, receiptNo: e.target.value }))} placeholder="Receipt No *" className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand font-mono" />
                <input value={manualForm.amount} onChange={(e) => setManualForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount *" type="number" step="0.01" className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand" />
                <input value={manualForm.date} onChange={(e) => setManualForm(f => ({ ...f, date: e.target.value }))} placeholder="Date (optional)" type="datetime-local" className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand" />
                <input value={manualForm.sender} onChange={(e) => setManualForm(f => ({ ...f, sender: e.target.value }))} placeholder="Sender (optional)" className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand" />
              </div>
              <button onClick={handleAddManual} disabled={!manualForm.receiptNo || !manualForm.amount} className="flex items-center gap-1.5 text-xs text-brand bg-brand-muted px-3 py-1.5 rounded-lg hover:bg-brand-muted transition-all disabled:opacity-50">
                <FiPlus size={13} /> Add transaction
              </button>

              {manualTxs.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-text-faint">{manualTxs.length} transaction(s) added</p>
                    <button onClick={handleRunMatch} className="text-xs text-white bg-brand px-3 py-1.5 rounded-lg hover:bg-brand-strong transition-all">Match against sales</button>
                  </div>
                  <div className="border border-border-subtle rounded-lg overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle bg-surface-2 dark:bg-white/[0.03]">
                          <th className="text-left px-3 py-2 font-medium text-text-muted">Receipt</th>
                          <th className="text-right px-3 py-2 font-medium text-text-muted">Amount</th>
                          <th className="text-left px-3 py-2 font-medium text-text-muted">Sender</th>
                          <th className="text-left px-3 py-2 font-medium text-text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manualTxs.map((tx, i) => (
                          <tr key={i} className="border-b border-border-subtle dark:border-border-subtle">
                            <td className="px-3 py-2 text-text-primary font-mono">{tx.receiptNo}</td>
                            <td className="px-3 py-2 text-right text-text-primary font-medium">{formatPrice(tx.amount)}</td>
                            <td className="px-3 py-2 text-text-faint">{tx.sender || "—"}</td>
                            <td className="px-3 py-2"><button onClick={() => handleRemoveManual(i)} className="text-danger hover:text-danger-700 text-xs"><FiX size={13} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {reconStep === "preview" && parsedTx.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-text-faint">{parsedTx.length} transactions found</p>
                <div className="flex gap-2">
                  <button onClick={() => setReconStep("upload")} className="text-xs text-text-muted border border-border-subtle px-3 py-1.5 rounded-lg hover:bg-surface-2">Back</button>
                  <button onClick={handleRunMatch} className="text-xs text-white bg-brand px-3 py-1.5 rounded-lg hover:bg-brand-strong transition-all">Match against sales</button>
                </div>
              </div>
              <div className="border border-border-subtle rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-2 dark:bg-white/[0.03]">
                      <th className="text-left px-3 py-2 font-medium text-text-muted">Receipt</th>
                      <th className="text-left px-3 py-2 font-medium text-text-muted">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-text-muted">Sender</th>
                      <th className="text-right px-3 py-2 font-medium text-text-muted">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTx.slice(0, 50).map((tx, i) => (
                      <tr key={i} className="border-b border-border-subtle dark:border-border-subtle">
                        <td className="px-3 py-2 text-text-primary font-mono">{tx.receiptNo}</td>
                        <td className="px-3 py-2 text-text-faint">{tx.completionTime ? new Date(tx.completionTime).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td className="px-3 py-2 text-text-body">{tx.sender || "—"}</td>
                        <td className="px-3 py-2 text-right text-text-primary font-medium">{formatPrice(tx.amount)}</td>
                      </tr>
                    ))}
                    {parsedTx.length > 50 && <tr><td colSpan={4} className="px-3 py-2 text-center text-text-faint text-xs">+{parsedTx.length - 50} more</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reconStep === "results" && matchResult && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-success-muted border border-success dark:border-green-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-success">{matchResult.matched.length}</p>
                  <p className="text-xs text-success">Matched</p>
                  <p className="text-xs text-success">{formatPrice(matchResult.matched.reduce((s, m) => s + Number(m.transaction.amount), 0))}</p>
                </div>
                <div className="bg-warning-muted border border-warning rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-warning">{matchResult.unmatchedMpesa.length}</p>
                  <p className="text-xs text-warning">Unmatched M-Pesa</p>
                  <p className="text-xs text-warning">{formatPrice(matchResult.unmatchedMpesa.reduce((s, t) => s + Number(t.amount), 0))}</p>
                </div>
                <div className="bg-danger-muted border border-danger rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-danger">{matchResult.unmatchedSales.length}</p>
                  <p className="text-xs text-danger">Unmatched Sales</p>
                  <p className="text-xs text-danger">{formatPrice(matchResult.unmatchedSales.reduce((s, t) => s + Number(t.amount), 0))}</p>
                </div>
              </div>

              <div className="border border-border-subtle rounded-lg overflow-x-auto mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-2 dark:bg-white/[0.03]">
                      <th className="text-left px-3 py-2 font-medium text-text-muted">Receipt</th>
                      <th className="text-right px-3 py-2 font-medium text-text-muted">Amount</th>
                      <th className="text-left px-3 py-2 font-medium text-text-muted">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchResult.matched.map((m, i) => (
                      <tr key={i} className="border-b border-border-subtle dark:border-border-subtle">
                        <td className="px-3 py-2 text-text-primary font-mono">{m.transaction.receiptNo}</td>
                        <td className="px-3 py-2 text-right text-text-primary font-medium">{formatPrice(m.transaction.amount)}</td>
                        <td className="px-3 py-2 text-text-faint">{m.transaction.completionTime ? new Date(m.transaction.completionTime).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${m.confidence === "exact" ? "bg-success-muted text-success" : "bg-warning-muted text-warning"}`}>{m.confidence === "exact" ? <><FiCheck size={11} /> Exact</> : <><FiSearch size={11} /> Suggested</>}</span></td>
                      </tr>
                    ))}
                    {matchResult.unmatchedMpesa.map((tx, i) => (
                      <tr key={`u-${i}`} className="border-b border-border-subtle dark:border-border-subtle">
                        <td className="px-3 py-2 text-text-primary font-mono">{tx.receiptNo}</td>
                        <td className="px-3 py-2 text-right text-text-primary font-medium">{formatPrice(tx.amount)}</td>
                        <td className="px-3 py-2 text-text-faint">{tx.completionTime ? new Date(tx.completionTime).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td className="px-3 py-2"><span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-warning-muted text-warning"><FiX size={11} /> No match</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {saved ? (
                <div className="bg-success-muted border border-success dark:border-green-500/20 rounded-lg px-4 py-3 text-xs text-success flex items-center justify-between">
                  <span><FiCheck size={14} className="inline mr-1" /> Saved successfully. {matchResult.matched.length} transactions matched.</span>
                  <button onClick={resetRecon} className="text-success underline">Close</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveMatches} disabled={saving || matchResult.matched.length === 0} className="flex-1 bg-brand text-white text-xs py-2 rounded-lg hover:bg-brand-strong transition-all disabled:opacity-50">
                    {saving ? "Saving..." : `Save ${matchResult.matched.length} match(es)`}
                  </button>
                  <button onClick={resetRecon} className="flex-1 border border-border-subtle text-text-muted text-xs py-2 rounded-lg hover:bg-surface-2">Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </ProGate>

    </PageLayout>
  );
}
