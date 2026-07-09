import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/format";
import { seedDemoData } from "../lib/seedData";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { FiEdit2, FiTrash2, FiPlus, FiDatabase } from "react-icons/fi";

const PAYMENT_COLORS = { Cash: "#10b981", "M-Pesa": "#3b82f6", Bank: "#f59e0b" };
const EXPENSE_CATEGORIES = ["Supplies", "Utilities", "Transport", "Marketing", "Maintenance", "Salary", "General"];

export default function Finance() {
  const [summary, setSummary] = useState({ revenue: 0, transactions: 0, expenses: 0 });
  const [paymentData, setPaymentData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", category: "General", payment_method: "Cash", expense_date: new Date().toISOString().slice(0, 10) });
  const [editingExpense, setEditingExpense] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

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

  async function handleSeed() {
    if (!window.confirm("This will delete ALL existing sales and expenses for today and replace them with demo data. Continue?")) return;
    setSeeding(true);
    setSeedMsg("");
    const result = await seedDemoData();
    setSeedMsg(result.ok ? "Demo data loaded!" : result.error);
    setSeeding(false);
    if (result.ok) setRefreshKey((k) => k + 1);
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

  if (loading) {
    return (
      <PageLayout title="Finance">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Finance">
      <Helmet><title>Finance — Keel</title></Helmet>
      {summary.revenue === 0 && summary.expenses === 0 && !loading && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl flex items-center justify-between">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            No data yet. Load demo products, sales, and expenses to preview the page.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <FiDatabase size={14} />
            {seeding ? "Loading..." : "Load demo data"}
          </button>
        </div>
      )}
      {seedMsg && (
        <div className={`mb-4 p-3 border rounded-xl text-xs ${
          seedMsg.includes("already exist")
            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300"
            : seedMsg.includes("Demo")
              ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300"
        }`}>
          {seedMsg}
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Revenue today" value={formatPrice(summary.revenue)} change={`${summary.transactions} transaction(s)`} up={summary.revenue > 0} />
        <StatCard label="Expenses today" value={formatPrice(summary.expenses)} change={summary.expenses > 0 ? "Logged today" : "None"} up={summary.expenses === 0} />
        <StatCard label="Net today" value={formatPrice(net)} change={net >= 0 ? "Positive" : "Negative"} up={net >= 0} />
        <StatCard label="Transactions" value={summary.transactions} change="Today" up={summary.transactions > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
          <p className="text-sm font-medium text-gray-800 dark:text-white mb-4">Payment Breakdown</p>
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
          ) : (
            <div className="space-y-1.5 mt-2">
              {expenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 dark:border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 dark:text-white truncate">{e.description}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{e.category} · {e.payment_method}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-medium text-red-500 dark:text-red-400 text-sm">{formatPrice(e.amount)}</span>
                    <button onClick={() => startEdit(e)} className="text-gray-400 hover:text-blue-500"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDeleteExpense(e.id)} className="text-gray-400 hover:text-red-500"><FiTrash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
