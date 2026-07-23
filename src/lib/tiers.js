const FEATURE_TIERS = {
  social_ai:       "pro",
  website:         "pro",
  storefront:      "beta",
  reports_pnl:     "pro",
  finance_mpesa:   "pro",
  marketing_qr:    "pro",
  marketing_links: "pro",
  overview_analytics: "pro",
  settings_export: "pro",
};

const ALLOWED = {
  pro:  ["pro", "beta"],
  beta: ["pro", "beta"],
};

export function isFeatureAccessible(feature, planTier) {
  const tier = FEATURE_TIERS[feature];
  if (!tier) return true;
  return ALLOWED[tier]?.includes(planTier) ?? true;
}

export const FEATURE_PREVIEW = {
  website: [
    { icon: "FiImage",        title: "Banner Management",    desc: "Create and schedule hero, sale, info, and alert banners" },
    { icon: "FiInfo",         title: "Business Info",        desc: "Edit your store name, address, hours, and contact details" },
    { icon: "FiGrid",         title: "Product Gallery",      desc: "Showcase products with images, uploads, and categories" },
    { icon: "FiMessageSquare",title: "Chat Widget",          desc: "Add a WhatsApp chat button with custom greeting message" },
  ],
  social: [
    { icon: "FiCalendar",     title: "Post Scheduling Calendar",    desc: "Plan your content calendar days or weeks ahead" },
    { icon: "FiTrendingUp",   title: "Performance Analytics",       desc: "Track likes, reach, comments and engagement trends" },
    { icon: "FiLayers",       title: "Content Template Library",    desc: "Save and reuse your best-performing post formats" },
  ],
  social_ai: [
    { icon: "FiStar",         title: "AI Caption Generator",        desc: "Write platform-optimised captions in one click" },
    { icon: "FiCpu",          title: "Write My Week",               desc: "Generate a full week of posts from a single prompt" },
    { icon: "FiRefreshCw",    title: "AI Caption Variants",         desc: "Generate multiple caption options for any product" },
    { icon: "FiZap",          title: "Smart Content Suggestions",   desc: "AI-suggested post ideas based on your inventory data" },
  ],
  storefront: [
    { icon: "FiLayout",       title: "Template Picker",         desc: "Choose from classic, fashion, and custom storefront layouts" },
    { icon: "FiGlobe",        title: "Custom Subdomain",        desc: "Get your own subdomain — no domain purchase needed" },
    { icon: "FiUploadCloud",  title: "One-Click Deploy",        desc: "Deploy to Vercel with a single click, zero config" },
    { icon: "FiSliders",      title: "Section Builder",         desc: "Pick which sections appear on your catalogue site" },
  ],
  reports_pnl: [
    { icon: "FiBarChart2",    title: "P&L Bar Charts",    desc: "Visual profit-and-loss charts with week/month toggle" },
    { icon: "FiCalendar",     title: "Period Comparison", desc: "Compare revenue and costs across custom date ranges" },
    { icon: "FiDownload",     title: "CSV Export",        desc: "Export raw profit data as a CSV file for offline analysis" },
    { icon: "FiFileText",     title: "PDF Report",        desc: "Generate a print-ready PDF of your profit and loss report" },
  ],
  finance_mpesa: [
    { icon: "FiUpload",       title: "Statement Upload",       desc: "Upload M-Pesa statements in CSV format, no manual entry" },
    { icon: "FiCheckCircle",  title: "Auto-Match Sales",       desc: "AI matches M-Pesa transactions against logged sales" },
    { icon: "FiClock",        title: "Reconciliation History", desc: "Review past reconciliation runs and flagged mismatches" },
    { icon: "FiShuffle",      title: "Dispute Resolution",     desc: "Flag and resolve unmatched or disputed transactions" },
  ],
  marketing_qr: [
    { icon: "FiSmartphone",   title: "Website QR Code",    desc: "Generate a QR that links customers to your mini-catalogue" },
    { icon: "FiMessageCircle",title: "WhatsApp QR Code",   desc: "Customers scan to open a direct WhatsApp chat with you" },
    { icon: "FiTag",          title: "Product QR Codes",   desc: "Individual QR codes per product for in-store scanning" },
    { icon: "FiDownload",     title: "Batch Download",     desc: "Download all QR codes at once for printing or sharing" },
  ],
  marketing_print: [
    { icon: "FiGrid",         title: "Product Grid Layout",  desc: "Auto-layout your full catalogue for print" },
    { icon: "FiAward",        title: "Badge Support",        desc: "Highlight sale items, new arrivals, and featured products" },
    { icon: "FiDollarSign",   title: "Sale Price Display",   desc: "Show original and sale prices side by side" },
    { icon: "FiFileText",     title: "PDF Generation",       desc: "Export a print-ready PDF, not a web page" },
  ],
  marketing_links: [
    { icon: "FiShare2",       title: "WhatsApp Sharing",  desc: "Share product links directly to WhatsApp with one tap" },
    { icon: "FiLink",         title: "Direct Product URL", desc: "Each product gets a unique, shareable link" },
    { icon: "FiCopy",         title: "Bulk Link Copy",    desc: "Copy all product links at once for broadcast lists" },
    { icon: "FiSend",         title: "Social Share",      desc: "Share product links to Instagram, Facebook, and more" },
  ],
  overview_analytics: [
    { icon: "FiEye",          title: "Page View Tracking",   desc: "See how many visits each page on your site receives" },
    { icon: "FiTrendingUp",   title: "Traffic Sources",      desc: "Know where your visitors come from — direct, social, search" },
    { icon: "FiList",         title: "Most Viewed Pages",    desc: "Identify which pages and products attract the most attention" },
    { icon: "FiShoppingBag",  title: "Top Products",         desc: "Rank products by popularity based on page views" },
  ],
  settings_export: [
    { icon: "FiDownload",     title: "Full JSON Export",  desc: "Download all your business data as a single JSON file" },
    { icon: "FiDatabase",     title: "All Tables",        desc: "Exports products, sales, expenses, and every other table" },
    { icon: "FiZap",          title: "One-Click Backup",  desc: "No selection needed — one click backs everything up" },
    { icon: "FiShield",       title: "Safe & Complete",   desc: "Your data is exported as-is, nothing is transformed or altered" },
  ],
};

export const TIER_COMPARISON = [
  {
    label: "Sales & Inventory Core",
    desc: "Products, sales logging, stock tracking, basic reports",
    free: "included",
    pro:  "included",
  },
  {
    label: "Social Media Suite",
    desc: "AI captions, scheduling, cross-platform posting, analytics",
    free: "included",
    pro:  "included",
  },
  {
    label: "Custom Website & Storefront",
    desc: "Managed banners, business info, gallery, chat widget, mini-catalogue",
    free: null,
    pro:  "included",
  },
  {
    label: "Advanced Analytics & Export",
    desc: "Traffic insights, P&L charts, full data export, QR codes, print catalogues",
    free: "limited",
    pro:  "included",
  },
];

export const FEATURE_META = {
  website: {
    title: "Website Management",
    description: "Manage your Framestudio-built website — banners, business info, gallery, and chat widget.",
  },
  social: {
    title: "Social Media Management",
    description: "Schedule posts, track performance, and build your content library.",
  },
  social_ai: {
    title: "AI Caption Generator",
    description: "Generate AI-powered captions, write your week, and create smart content variants.",
  },
  reports_pnl: {
    title: "Profit & Loss Reports",
    description: "Visual P&L bar charts with week/month toggle and CSV/PDF export.",
  },
  finance_mpesa: {
    title: "M-Pesa Reconciliation",
    description: "Upload M-Pesa statements, auto-match against sales, and track reconciliation history.",
  },
  marketing_qr: {
    title: "QR Code Generator",
    description: "Generate QR codes for your website, WhatsApp, and individual products.",
  },
  marketing_print: {
    title: "Print Catalog",
    description: "Generate a print-ready product catalog with badges and sale prices.",
  },
  marketing_links: {
    title: "Shareable Product Links",
    description: "Create and share direct product links via WhatsApp and other channels.",
  },
  overview_analytics: {
    title: "Website Analytics",
    description: "Track page views, traffic sources, most viewed pages, and top viewed products.",
  },
  settings_export: {
    title: "Data Export",
    description: "Export all your business data as a JSON backup file.",
  },
};
