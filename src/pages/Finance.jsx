import { useState, useEffect, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/format";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, FiUpload, FiCheck, FiX, FiSearch } from "react-icons/fi";
import { useDebounce } from "../hooks/useDebounce";
import { parseCSV, matchTransactions } from "../engine/mpesa-reconciliation";

const PAYMENT_COLORS = { Cash: "#10b981", "M-Pesa": "#3b82f6", Bank: "#f59e0b" };
const EXPENSE_CATEGORIES = ["Supplies", "Utilities", "Transport", "Marketing", "Maintenance", "Salary", "General"];

export default function Finance() {
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
  const [csvText, setCsvText] = useState("");
  const [parsedTx, setParsedTx] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      if (!shopId) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [salesRes, expensesRes] = await Promise.all([
        supabase
          .from("sales")
          .select("amount, method")
          .eq("shop_id", shopId)
          .gte("created_at", today.toISOString())
          .lte("created_at", todayEnd.toISOString())
          .limit(500),
        supabase
          .from("expenses")
          .select("*")
          .eq("shop_id", shopId)
          .eq("expense_date", today.toISOString().slice(0, 10))
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      const sales = salesRes.data || [];
      const revenue = sales.reduce((sum, s) => sum + s.amount, 0);
      const expenseTotal = expensesRes.data?.reduce((sum, e) => sum + e.amount, 0) || 0;
      setSummary({ revenue, transactions: sales.length, expenses: expenseTotal });

      const methodMap = {};
      sales.forEach((s) => {
        methodMap[s.method] = (methodMap[s.method] || 0) + s.amount;
      });
      setPaymentData(
        Object.entries(methodMap).map(([method, amount]) => ({
          name: method,
          value: amount,
          color: PAYMENT_COLORS[method] || "#6b7280",
        }))
      );

      setExpenses(expensesRes.data || []);
      setLoading(false);
    })();
  }, [refreshKey]);

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

  async function handleRunMatch() {
    if (parsedTx.length === 0) return;
    const sales = allSales.length > 0 ? allSales : await fetchMpesaSales();
    const result = matchTransactions(sales, parsedTx);
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Revenue today" value={formatPrice(summary.revenue)} change={`${summary.transactions} transaction(s)`} up={summary.revenue > 0} />
        <StatCard label="Expenses today" value={formatPrice(summary.expenses)} change={summary.expenses > 0 ? "Logged today" : "None"} up={summary.expenses === 0} />
        <StatCard label="Net today" value={formatPrice(net)} change={net >= 0 ? "Positive" : "Negative"} up={net >= 0} />
        <StatCard label="Transactions" value={summary.transactions} change="Today" up={summary.transactions > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-800 dark:text-white">Payment Breakdown</p>
            <button onClick={() => { if (!showRecon) { setShowRecon(true); fetchMpesaSales(); } else setShowRecon(!showRecon); }} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
              {showRecon ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              Reconcile M-Pesa
            </button>
          </div>
          {paymentData.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-8">No sales today</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {paymentData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatPrice(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {paymentData.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-gray-600 dark:text-slate-400">{p.name}</span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">{formatPrice(p.value)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 dark:border-white/10 pt-2 flex items-center justify-between text-sm font-semibold">
                  <span className="text-gray-800 dark:text-white">Total</span>
                  <span className="text-gray-800 dark:text-white">{formatPrice(summary.revenue)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
          <p className="text-sm font-medium text-gray-800 dark:text-white mb-4">Today's Expenses</p>
          {!showForm ? (
            <button
              onClick={() => { setEditingExpense(null); setExpenseForm({ description: "", amount: "", category: "General", payment_method: "Cash", expense_date: new Date().toISOString().slice(0, 10) }); setShowForm(true); }}
              className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FiPlus /> Log expense
            </button>
          ) : (
            <div className="space-y-2 mb-4">
              <input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="Description"
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Amount"
                  type="number"
                  className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                />
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                >
                  {EXPENSE_CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={expenseForm.payment_method}
                  onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                >
                  <option>Cash</option>
                  <option>M-Pesa</option>
                  <option>Bank</option>
                </select>
                <input
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                  type="date"
                  className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                  className="flex-1 bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700 transition-all"
                >
                  {editingExpense ? "Update" : "Add expense"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingExpense(null); }}
                  className="flex-1 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-xs py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {expenses.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-4">No expenses logged today</p>
          ) : filteredExpenses.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-4">No matching expenses</p>
          ) : (
            <div className="space-y-1.5 mt-2">
              {filteredExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 dark:border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 dark:text-white truncate">{e.description}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{e.category} · {e.payment_method}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-medium text-red-500 dark:text-red-400 text-sm">{formatPrice(e.amount)}</span>
                    <button onClick={() => startEdit(e)} className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all"><FiEdit2 size={13} className="mr-1 inline" /> Edit</button>
                    <button onClick={() => handleDeleteExpense(e.id)} className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-all"><FiTrash2 size={13} className="mr-1 inline" /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showRecon && (
        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4 mb-6 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">M-Pesa Reconciliation</h3>
            <button onClick={resetRecon} className="text-gray-400 dark:text-slate-500 hover:text-gray-600" aria-label="Close reconciliation"><FiX size={16} /></button>
          </div>

          {reconStep === "upload" && (
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">Download your M-Pesa statement from the Safaricom app (M-Pesa &gt; Statement &gt; Download as CSV), then paste it below or upload the file.</p>
              <textarea value={csvText} onChange={(e) => handleCsvChange(e.target.value)} placeholder="Paste CSV content here..." rows={6} className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400 font-mono" />
              <label className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 cursor-pointer mt-2 hover:underline">
                <FiUpload size={14} /> Upload CSV file
                <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => handleCsvChange(r.result); r.readAsText(f); } }} />
              </label>
              {csvText.trim() && parsedTx.length === 0 && (
                <p className="text-xs text-red-500 mt-2">Could not find any valid transactions. Check that your CSV has receipt numbers and amounts.</p>
              )}
            </div>
          )}

          {reconStep === "preview" && parsedTx.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 dark:text-slate-500">{parsedTx.length} transactions found</p>
                <div className="flex gap-2">
                  <button onClick={() => setReconStep("upload")} className="text-xs text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05]">Back</button>
                  <button onClick={handleRunMatch} className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all">Match against sales</button>
                </div>
              </div>
              <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]">
                      <th className="text-left px-3 py-2 font-medium text-gray-500 dark:text-slate-400">Receipt</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500 dark:text-slate-400">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500 dark:text-slate-400">Sender</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-500 dark:text-slate-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTx.slice(0, 50).map((tx, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-white/5">
                        <td className="px-3 py-2 text-gray-800 dark:text-white font-mono">{tx.receiptNo}</td>
                        <td className="px-3 py-2 text-gray-400 dark:text-slate-500">{tx.completionTime ? new Date(tx.completionTime).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-slate-400">{tx.sender || "—"}</td>
                        <td className="px-3 py-2 text-right text-gray-800 dark:text-white font-medium">{formatPrice(tx.amount)}</td>
                      </tr>
                    ))}
                    {parsedTx.length > 50 && <tr><td colSpan={4} className="px-3 py-2 text-center text-gray-400 text-xs">+{parsedTx.length - 50} more</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reconStep === "results" && matchResult && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{matchResult.matched.length}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Matched</p>
                  <p className="text-xs text-green-500 dark:text-green-400">{formatPrice(matchResult.matched.reduce((s, m) => s + Number(m.transaction.amount), 0))}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{matchResult.unmatchedMpesa.length}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">Unmatched M-Pesa</p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-400">{formatPrice(matchResult.unmatchedMpesa.reduce((s, t) => s + Number(t.amount), 0))}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{matchResult.unmatchedSales.length}</p>
                  <p className="text-xs text-red-600 dark:text-red-500">Unmatched Sales</p>
                  <p className="text-xs text-red-500 dark:text-red-400">{formatPrice(matchResult.unmatchedSales.reduce((s, t) => s + Number(t.amount), 0))}</p>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-x-auto mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]">
                      <th className="text-left px-3 py-2 font-medium text-gray-500 dark:text-slate-400">Receipt</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-500 dark:text-slate-400">Amount</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500 dark:text-slate-400">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500 dark:text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchResult.matched.map((m, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-white/5">
                        <td className="px-3 py-2 text-gray-800 dark:text-white font-mono">{m.transaction.receiptNo}</td>
                        <td className="px-3 py-2 text-right text-gray-800 dark:text-white font-medium">{formatPrice(m.transaction.amount)}</td>
                        <td className="px-3 py-2 text-gray-400 dark:text-slate-500">{m.transaction.completionTime ? new Date(m.transaction.completionTime).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${m.confidence === "exact" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"}`}>{m.confidence === "exact" ? <><FiCheck size={11} /> Exact</> : <><FiSearch size={11} /> Suggested</>}</span></td>
                      </tr>
                    ))}
                    {matchResult.unmatchedMpesa.map((tx, i) => (
                      <tr key={`u-${i}`} className="border-b border-gray-50 dark:border-white/5">
                        <td className="px-3 py-2 text-gray-800 dark:text-white font-mono">{tx.receiptNo}</td>
                        <td className="px-3 py-2 text-right text-gray-800 dark:text-white font-medium">{formatPrice(tx.amount)}</td>
                        <td className="px-3 py-2 text-gray-400 dark:text-slate-500">{tx.completionTime ? new Date(tx.completionTime).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td className="px-3 py-2"><span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"><FiX size={11} /> No match</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {saved ? (
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg px-4 py-3 text-xs text-green-700 dark:text-green-400 flex items-center justify-between">
                  <span><FiCheck size={14} className="inline mr-1" /> Saved successfully. {matchResult.matched.length} transactions matched.</span>
                  <button onClick={resetRecon} className="text-green-600 dark:text-green-400 underline">Close</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveMatches} disabled={saving || matchResult.matched.length === 0} className="flex-1 bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50">
                    {saving ? "Saving..." : `Save ${matchResult.matched.length} match(es)`}
                  </button>
                  <button onClick={resetRecon} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-xs py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05]">Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </PageLayout>
  );
}
