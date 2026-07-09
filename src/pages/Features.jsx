import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiPackage, FiCamera, FiAlertTriangle, FiShoppingCart, FiBarChart2, FiDollarSign, FiGlobe, FiMessageSquare, FiCalendar, FiMessageCircle, FiLayers, FiSmartphone } from "react-icons/fi";

const features = [
  {
    icon: FiPackage,
    title: "Inventory Management with Variants",
    intro: "Most shops don't sell one version of a product. They sell the same item in different colours, sizes, or storage capacities. Keeping track of each variant on paper or in a spreadsheet is error-prone and time-consuming.",
    body: "Keel lets you define variants for every product. If you run a clothing boutique, you can track each colour and size combination as its own stock-keeping unit. If you sell electronics, you can separate the 64GB model from the 128GB model. Each variant has its own stock count, price, and cost price — so you always know exactly what you have and what it's worth.",
    outcome: "No more guessing. No more counting shelves. One glance at your inventory tells you everything.",
    shops: ["Clothing Boutique", "Electronics Store", "General Store"],
  },
  {
    icon: FiCamera,
    title: "Barcode Scanning",
    intro: "Typing product names, prices, and stock counts one by one is the slowest part of setting up any system. For shops with hundreds of products, it can take days.",
    body: "Keel turns your phone camera into a barcode scanner. Point it at any product barcode and Keel identifies the product and fills in the details automatically. This works especially well for electronics and electricals where most products already have barcodes. You can onboard your entire inventory in an afternoon instead of a week.",
    outcome: "Setup that took days now takes hours. You're up and running before lunch.",
    shops: ["Electronics Store", "Electricals"],
  },
  {
    icon: FiAlertTriangle,
    title: "Low Stock & Critical Stock Alerts",
    intro: "Running out of a popular product is not just a lost sale — it's a lost customer. But checking stock levels manually every day is impractical, especially when you're busy serving customers.",
    body: "Keel monitors every product's stock level automatically. You set your own low-stock threshold in settings — maybe 10 units for fast-moving items, 5 for slow ones. When stock dips below that number, Keel highlights it in the sidebar and on the inventory page. There's also a hardcoded critical threshold of 2 units: when you hit that, you get an unmistakable alert. No more discovering you're out of stock when a customer asks.",
    outcome: "You restock before you run out. Your customers never hear the words 'sorry, we're out.'",
    shops: ["All shop types"],
  },
  {
    icon: FiShoppingCart,
    title: "Sales Logging & Receipts",
    intro: "A sale happens in seconds. But recording it properly — what was sold, at what price, who bought it, how they paid — takes longer than the sale itself. Most shop owners end up with a pile of handwritten notes or loose receipts by the end of the day.",
    body: "Keel lets you log a sale in under ten seconds. Select the product, enter the quantity, choose the payment method (cash, M-Pesa, card, or whatever you've configured), and the sale is recorded. The system auto-calculates change, updates stock instantly, and can print a receipt if you have a Bluetooth printer connected. Every sale becomes a permanent, searchable record.",
    outcome: "Your sales data is clean, complete, and always up to date. End-of-day reconciliation takes minutes, not hours.",
    shops: ["All shop types"],
  },
  {
    icon: FiBarChart2,
    title: "Profit Margin Reports",
    intro: "Most shop owners know their revenue but not their profit. You might sell a lot, but if your margins are thin or your costs are creeping up, you could be busy all month and still lose money.",
    body: "Keel calculates the profit margin for every product by comparing its selling price to its cost price. The reports section shows you which products are your best earners and which ones are barely breaking even. You can view profit grouped by product or across your entire shop, and filter by time period. This turns vague instincts into hard numbers.",
    outcome: "You know exactly what's making you money and what isn't. You can make pricing and purchasing decisions based on data, not guesses.",
    shops: ["All shop types"],
  },
  {
    icon: FiDollarSign,
    title: "Expense Tracking & Profit & Loss",
    intro: "Small daily expenses — transport, packaging, airtime, repairs — are easy to ignore. But they add up. Without tracking them, your profit at the end of the month is always lower than you expected, and you can't explain why.",
    body: "Keel lets you record every expense with a description, amount, category, and payment method. The system automatically combines your sales revenue and your expenses into a profit and loss statement. You can see your net profit for any period — daily, weekly, or monthly — with the full breakdown of what came in and what went out.",
    outcome: "No more surprises at the end of the month. You see your true profit, and you know exactly where every shilling went.",
    shops: ["All shop types"],
  },
  {
    icon: FiGlobe,
    title: "Website & Product Catalogue",
    intro: "In 2026, a shop without an online presence is invisible to a huge number of potential customers. But building a website is expensive, and maintaining it is a skillset most shop owners don't have.",
    body: "Keel generates a live, mobile-friendly website for your shop automatically. Your products appear in a clean catalogue with prices, variants, and images. You can add promotional banners, update your business hours, share your gallery, and embed a WhatsApp chat button — all from the Keel dashboard. When you add or update a product in inventory, it updates on your website instantly. No coding, no designer, no hosting fees.",
    outcome: "Your shop has a professional online presence without hiring anyone or learning anything new.",
    shops: ["All shop types — especially those without an existing website"],
  },
  {
    icon: FiMessageSquare,
    title: "WhatsApp Chat Widget",
    intro: "When customers visit your website, they usually have a question. Is this item available? Can you deliver? How much is shipping? If they can't ask easily, they leave.",
    body: "Keel adds a WhatsApp chat button to your website. Customers tap it and are connected to your WhatsApp number instantly. You don't need a separate chat system or a customer service team — just your regular WhatsApp account. The widget is configured from your dashboard with your own phone number.",
    outcome: "More customer questions turn into sales. The distance between 'I'm interested' and 'I'll take it' becomes one tap.",
    shops: ["All shop types with an active WhatsApp number"],
  },
  {
    icon: FiCalendar,
    title: "Social Media Scheduler",
    intro: "Posting consistently on Instagram and other platforms is one of the best ways to attract customers. But finding time to create and schedule posts while running a shop is nearly impossible.",
    body: "Keel's social tab lets you plan and schedule posts in advance. Write your captions, upload your images, set the date and time, and Keel posts them automatically. You can track engagement — likes, comments, and reach — for each post, so you know what your audience responds to.",
    outcome: "Your social media stays active without demanding your time every day. You build an online presence while focusing on your shop.",
    shops: ["Fashion Boutique", "Beauty Products", "Brand-focused shops"],
  },
  {
    icon: FiMessageCircle,
    title: "WhatsApp & Telegram Bots",
    intro: "Every day, the same questions come through WhatsApp: 'Do you have X in stock?' 'How much is Y?' 'Are you open today?' Answering them one by one eats hours every week.",
    body: "Keel's bot system lets you set up automated replies for common customer questions. The WhatsApp and Telegram bots can check stock levels, share product prices, and provide your business hours — all without you typing a single response. Customers interact with your bot the same way they'd message you, and they get instant answers.",
    outcome: "You reclaim hours every week. Customers get instant answers. And you never miss a sale because you were too slow to reply.",
    shops: ["Any shop with high volume of customer messages"],
  },
  {
    icon: FiLayers,
    title: "Multi-Shop Support",
    intro: "Opening a second location is exciting. But managing two shops — two inventories, two sets of sales, two expense records — can double your workload if you don't have the right system.",
    body: "Keel lets you switch between shops with a single click. Each shop has its own products, sales, expenses, settings, and website. You sign in once and access all your shops from the same dashboard. Everything is separate, but everything is in one place.",
    outcome: "Growing to multiple locations doesn't mean twice the paperwork. You manage all your shops from one seat.",
    shops: ["Shop owners with multiple locations"],
  },
  {
    icon: FiSmartphone,
    title: "Mobile-First Design",
    intro: "Most business software is built for desktop first and phone second. But a shop owner is rarely sitting at a desk — they're on the sales floor, in the stockroom, or on the move.",
    body: "Keel is built mobile-first. Every screen works on a phone, from logging a sale to checking stock to viewing reports. The interface is clean, fast, and usable with one hand. Dark mode is built in for low-light environments.",
    outcome: "Your entire shop management system fits in your pocket. No laptop required.",
    shops: ["All shop types"],
  },
];

function FeaturePageSection({ icon: Icon, title, intro, body, outcome, shops }) {
  return (
    <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Icon className="text-blue-600 dark:text-blue-400 text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base mb-3">{title}</h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{intro}</p>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{body}</p>

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed mb-4">{outcome}</p>

          <div className="flex flex-wrap gap-1.5">
            {shops.map((s) => (
              <span key={s} className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <>
      <Helmet>
        <title>Features — Keel</title>
        <meta name="description" content="Explore all 12 features of Keel — inventory management, barcode scanning, sales logging, profit reports, expense tracking, website builder, WhatsApp bots, and more." />
        <meta property="og:title" content="Features — Keel" />
        <meta property="og:description" content="Explore all 12 features of Keel — inventory, sales, reports, website, and customer communication in one dashboard." />
        <meta property="og:url" content="https://keel-nu.vercel.app/features" />
      </Helmet>
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e] text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-all">
          <FiArrowLeft size={14} /> Back to home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">Everything your shop needs to run smarter</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Keel brings together the tools every small shop actually needs — inventory, sales, reports, a website, and customer communication — in one place that works on your phone. No complexity, no hardware, no monthly fees.
          </p>
        </div>

        <div className="space-y-4">
          {features.map((f) => (
            <FeaturePageSection key={f.title} {...f} />
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
    </>
  );
}
