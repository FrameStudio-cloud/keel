import { Link } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiFileText, FiTrendingDown, FiAlertCircle, FiWifiOff, FiCopy, FiMessageCircle, FiCoffee } from "react-icons/fi";

const cases = [
  {
    icon: FiSearch,
    title: "You can never remember what you have in stock",
    problem: "You bought 20 units of a product last month. Your shelf shows 6. Your notebook says 13. The supplier receipt says 18. You spend fifteen minutes counting and reconciling before you can tell a customer if the item is available. This happens several times a day.",
    cost: "Every stock check costs you time. More importantly, it costs you credibility when you tell a customer 'yes' only to find out later that the item is actually out of stock.",
    solution: "Keel tracks every product in real time. Each sale reduces stock automatically. Each new delivery increases it. You open your phone, search the product name, and see the exact number instantly. No counting, no guessing, no conflicting records.",
    who: "Every shop that carries more than a handful of products.",
  },
  {
    icon: FiFileText,
    title: "Your sales records are on random pieces of paper",
    problem: "At the end of the day, you have a stack of receipts, notebook scribbles, and maybe some M-Pesa messages. Reconciling them takes an hour. At the end of the month, you have a pile of paper and no clear picture of what happened — which products sold, how much revenue you actually collected, or which payment methods customers used.",
    cost: "You lose visibility into your own business. You can't identify trends, you can't reconcile discrepancies, and when tax time comes, you have nothing organised.",
    solution: "Every sale in Keel is recorded permanently — product name, quantity, price, payment method, timestamp. You can search your entire sales history in seconds. End-of-day reconciliation takes five minutes. End-of-month reporting takes two clicks.",
    who: "Any shop still using paper receipts or notebook records.",
  },
  {
    icon: FiTrendingDown,
    title: "You don't know if you're actually making money",
    problem: "The month felt busy. Customers were coming in, products were moving, and you were working hard. But when you look at your bank balance, the money isn't there. You can't figure out why — was it the transport costs? The stock that sat unsold? The discounts you gave?",
    cost: "Without profit visibility, you're flying blind. You might be busy all month and still lose money without realising it. You can't make informed decisions about pricing, purchasing, or promotions.",
    solution: "Keel calculates profit margin per product by comparing your selling price to cost price. It tracks all expenses and combines them with revenue into a clear profit and loss statement. You see exactly which products earn their keep and which ones are dragging you down.",
    who: "Shop owners who want to run a business, not just keep busy.",
  },
  {
    icon: FiAlertCircle,
    title: "You run out of popular items without warning",
    problem: "A customer walks in looking for your best-selling product. You go to the shelf and it's empty. You check your records and realise you've been out of stock for three days. You lost not just this sale, but potentially a regular customer who will now try your competitor.",
    cost: "Stockouts cost you direct revenue and long-term customer loyalty. In a small shop, losing one regular customer is a noticeable hit.",
    solution: "Keel monitors stock levels continuously. When a product dips below your low-stock threshold, it appears highlighted in your sidebar so you see it the moment you open the dashboard. When stock hits the critical level of 2 units, you get an unmistakable alert. You order replenishment before you run out, not after.",
    who: "Any shop with best-selling products that customers specifically come looking for.",
  },
  {
    icon: FiWifiOff,
    title: "You have great products but no online presence",
    problem: "Your shop carries good products at fair prices, but if someone searches for what you sell, nothing comes up. No website, no catalogue, no way for potential customers to find you unless they walk past your door.",
    cost: "You're invisible to the growing number of customers who discover shops online. In 2026, a shop without a web presence is leaving money on the table — especially younger customers who search before they buy.",
    solution: "Keel generates a live website for your shop with zero effort. Your products appear in a clean, mobile-friendly catalogue with prices, images, and variants. You can add banners, business hours, and a gallery. When you update inventory, your website updates automatically. No coding, no designer, no monthly hosting bill.",
    who: "Shops without an existing website, or those paying too much for one they can't maintain.",
  },
  {
    icon: FiCopy,
    title: "You have multiple shops and managing them is double the work",
    problem: "Opening a second location should feel like progress. Instead, it feels like starting over. You now have two inventories to track, two sets of sales to reconcile, two expense records to maintain. You spend your time moving between notebooks, spreadsheets, and WhatsApp messages, trying to keep both shops straight.",
    cost: "Growth becomes a burden instead of an opportunity. The administrative overhead eats into the benefits of expansion.",
    solution: "Keel supports multiple shops under one account. Each shop has its own products, sales, expenses, settings, and website. You switch between them with one click. Everything stays separate, but everything is accessible from the same dashboard.",
    who: "Shop owners with two or more locations.",
  },
  {
    icon: FiMessageCircle,
    title: "You answer the same customer questions every day",
    problem: "Every day, the same WhatsApp messages arrive: 'Do you have X?' 'How much is Y?' 'Are you open today?' 'Can you deliver?' Answering each one takes a minute, but when you get fifty such messages a day, that's nearly an hour — every day — spent on repeat answers.",
    cost: "Hours per week lost to repetitive messaging. Delayed responses mean lost sales — customers who message you and don't hear back quickly will move on to someone else.",
    solution: "Keel's WhatsApp and Telegram bots handle the most common questions automatically. Customers ask about stock, prices, and business hours, and the bot gives them instant answers using your live data. You only step in for the conversations that actually need your personal attention.",
    who: "Any shop that receives frequent customer inquiries via messaging apps.",
  },
  {
    icon: FiCoffee,
    title: "Small expenses keep eating into your profits silently",
    problem: "Transport to the supplier — Ksh 200. Packaging materials — Ksh 150. Airtime — Ksh 100. A quick repair on the shelf — Ksh 500. Individually, these amounts are small. But at the end of the month, they add up to thousands of shillings that you never accounted for, and your profit is significantly lower than you expected.",
    cost: "You're leaking money in small amounts that are hard to track manually. Over time, these leaks significantly reduce your profitability.",
    solution: "Keel lets you log every expense in seconds — amount, category, description, payment method. The system tracks all expenses alongside your revenue and shows you your true profit. You see exactly where your money is going and can identify patterns: maybe transport costs are too high, or you're spending more on packaging than you realised.",
    who: "Any shop owner who wants to know where their money actually goes.",
  },
];

function UseCaseCard({ icon: Icon, title, problem, cost, solution, who }) {
  return (
    <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <Icon className="text-amber-600 dark:text-amber-400 text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base mb-3">{title}</h2>

          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1.5">The Situation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{problem}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-500 dark:text-red-400 mb-1.5">The Cost</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{cost}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1.5">How Keel Helps</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{solution}</p>
          </div>

          <div>
            <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">{who}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UseCases() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e] text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-all">
          <FiArrowLeft size={14} /> Back to home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">Built for the real challenges of running a shop</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            These are the situations we hear about every day from shop owners across Kenya. If any of them sound familiar, Keel was built for you.
          </p>
        </div>

        <div className="space-y-4">
          {cases.map((c) => (
            <UseCaseCard key={c.title} {...c} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20">
            Get Started Free
          </Link>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-6">Powered by Keel</p>
      </div>
    </div>
  );
}
