export const docs = [
  {
    slug: "getting-started",
    category: "Getting Started",
    title: "Getting started with Keel",
    summary: "Create your account, set up your shop, and make your first sale in minutes.",
    sections: [
      {
        heading: "Create your account",
        paragraphs: [
          "Go to keel.framestudio.co.ke and click Get Started. Sign up with your email, shop name, and a password — no credit card is needed and every new shop gets a 7-day free trial.",
          "Choose your business type (product-based or service-based), pick your category (Clothing, Electronics, Salon, Laundry, etc.), and complete the setup wizard with your store details.",
        ],
      },
      {
        heading: "Add your first products",
        steps: [
          "Go to Inventory from the sidebar.",
          "Click Add Product and fill in the name, price, and stock.",
          "Set a cost price to track profit margins.",
          "Optionally add a barcode for scanner support (electronics/electricals).",
          "For service businesses, add your services instead.",
        ],
      },
      {
        heading: "Log your first sale",
        steps: [
          "Go to Sales from the sidebar.",
          "Click Log Sale and select a product.",
          "Enter the quantity, total amount, and payment method (Cash, M-Pesa, etc.).",
          "Print a receipt for your customer if you have a printer.",
          "View your updated dashboard on the Overview page.",
        ],
      },
    ],
    related: ["understanding-the-dashboard", "logging-sales", "store-settings"],
  },
  {
    slug: "understanding-the-dashboard",
    category: "Getting Started",
    title: "Understanding the dashboard",
    summary: "A tour of what you see on the Overview page and how it stays up to date.",
    sections: [
      {
        heading: "What's on the Overview page",
        paragraphs: [
          "The Overview page is your command centre. It shows today's total sales, the number of products you have, low-stock items that need attention, a 30-day sales chart, and your top-selling products.",
          "A dashboard summary loads all of this in a single request, so the page stays fast even on slow connections.",
        ],
      },
      {
        heading: "How it stays current",
        paragraphs: [
          "Every sale, expense, stock adjustment, or product change you make updates the dashboard automatically. You don't need to refresh — the numbers are recalculated from your live data.",
        ],
      },
    ],
    related: ["getting-started", "low-stock-alerts"],
  },
  {
    slug: "adding-and-managing-products",
    category: "Inventory",
    title: "Adding and managing products",
    summary: "Create, edit, and organise your products in the Inventory page.",
    sections: [
      {
        heading: "Adding a product",
        steps: [
          "Open Inventory from the sidebar.",
          "Click Add Product.",
          "Enter the name, selling price, and stock quantity.",
          "Add a cost price to unlock profit margin reports.",
          "Choose a category so your product is easy to find and filter.",
        ],
      },
      {
        heading: "Editing and deleting",
        paragraphs: [
          "Click any product in the list to edit it, or use the delete action to remove it. Edits apply immediately, and published products update on your website automatically.",
        ],
      },
      {
        heading: "Searching your inventory",
        paragraphs: [
          "Use the search field at the top of the Inventory page to find products by name, category, or barcode. Search works as you type, so results narrow instantly.",
        ],
      },
    ],
    related: ["product-variants-and-attributes", "stock-adjustments", "barcode-scanning"],
  },
  {
    slug: "product-variants-and-attributes",
    category: "Inventory",
    title: "Product variants and attributes",
    summary: "Track colours, sizes, and other attributes so every version of a product has its own stock.",
    sections: [
      {
        heading: "How variants work",
        paragraphs: [
          "Most shops sell the same product in different colours, sizes, or storage capacities. Keel lets you define attributes based on your business category — for example a wig shop gets length, texture, and colour options, while a clothing shop gets size and colour.",
          "Each attribute value is tracked on the product card. Values like a hair colour are chosen from preset pills, and free-text attributes support multiple values.",
        ],
      },
      {
        heading: "Setting attributes on a product",
        steps: [
          "Open Add Product or Edit Product.",
          "Scroll to the Product Attributes section.",
          "Pick a value for each attribute shown for your category.",
          "Save — the badges appear on the product in Inventory.",
        ],
        paragraphs: [
          "Attribute values carry through to your published website so customers can see available options when they browse.",
        ],
      },
    ],
    related: ["adding-and-managing-products", "publishing-to-your-website"],
  },
  {
    slug: "stock-adjustments",
    category: "Inventory",
    title: "Stock adjustments and corrections",
    summary: "Fix stock counts for damaged, lost, or returned goods.",
    sections: [
      {
        heading: "Adjusting stock",
        steps: [
          "Find the product in Inventory.",
          "Choose the Adjust option.",
          "Enter the change (positive to add stock, negative to remove it).",
          "Add a reason so the movement is easy to audit later.",
        ],
        paragraphs: [
          "Every adjustment is recorded in Stock History together with sales and restocks, so you always have a complete trail of movement.",
        ],
      },
    ],
    related: ["low-stock-alerts"],
  },
  {
    slug: "barcode-scanning",
    category: "Inventory",
    title: "Barcode scanning",
    summary: "Use your phone camera to scan barcodes and skip typing forever.",
    sections: [
      {
        heading: "Where it works",
        paragraphs: [
          "Barcode scanning is available for the electronics and electricals categories. Press the scanner button in Inventory, a product form, or while logging a sale, and point your camera at any barcode.",
          "Keel identifies the product automatically and fills in the details or finds the product for a sale. Everything happens on your device — no extra hardware or accounts.",
        ],
      },
      {
        heading: "Setting up barcodes",
        steps: [
          "Open a product in Inventory or the Add Product form.",
          "Enter the barcode number on the product card.",
          "Save — from then on the product is scannable.",
        ],
      },
    ],
    related: ["adding-and-managing-products", "logging-sales"],
  },
  {
    slug: "low-stock-alerts",
    category: "Inventory",
    title: "Low stock and critical stock alerts",
    summary: "Never find out you're out of stock from a customer again.",
    sections: [
      {
        heading: "Setting your threshold",
        steps: [
          "Open Settings from the sidebar.",
          "Go to the Notifications tab.",
          "Set the low stock threshold — for example 10 units for fast sellers, 5 for slow ones.",
          "Save, and the whole app respects that number.",
        ],
      },
      {
        heading: "How alerts appear",
        paragraphs: [
          "Products below your threshold are highlighted in the sidebar and on the Overview page. There's also a hardcoded critical threshold of 2 units which produces an unmistakable alert — restock before you run out.",
        ],
      },
    ],
    related: ["understanding-the-dashboard", "stock-adjustments"],
  },
  {
    slug: "publishing-to-your-website",
    category: "Inventory",
    title: "Publishing products to your website",
    summary: "Publish products to your live catalogue with one tap.",
    sections: [
      {
        heading: "Before you publish",
        paragraphs: [
          "You need a website URL set in Settings Store first. Once it's set, the publish buttons in Inventory unlock.",
        ],
      },
      {
        heading: "Publishing and updating",
        steps: [
          "Open Inventory.",
          "Click the Publish button on a product (or publish everything).",
          "The product appears on your website catalogue.",
          "Any later edits update the website automatically.",
        ],
      },
    ],
    related: ["setting-up-your-website", "product-variants-and-attributes"],
  },
  {
    slug: "logging-sales",
    category: "Sales & Receipts",
    title: "Logging sales and printing receipts",
    summary: "Record a sale in under ten seconds, print a receipt, and keep stock in sync.",
    sections: [
      {
        heading: "Logging a sale",
        steps: [
          "Go to Sales from the sidebar.",
          "Click Log Sale and select the product.",
          "Enter quantity and the total amount.",
          "Choose the payment method (Cash, M-Pesa, etc.).",
          "Save — stock is deducted automatically.",
        ],
      },
      {
        heading: "Receipts",
        paragraphs: [
          "Print or share a detailed receipt from any sale. Receipts include your shop name, the date, the items, and a custom footer message you control in Settings.",
        ],
      },
    ],
    related: ["payment-methods", "barcode-scanning", "receipts"],
  },
  {
    slug: "receipts",
    category: "Sales & Receipts",
    title: "Receipts",
    summary: "Print professional receipts that carry your branding.",
    sections: [
      {
        heading: "Printing a receipt",
        steps: [
          "Open any sale in the Sales page.",
          "Choose View Receipt.",
          "Print the receipt to a paper or Bluetooth printer.",
        ],
      },
      {
        heading: "Customising the footer",
        paragraphs: [
          "Add a custom footer line (thank-you message, return policy, phone number) in Settings → Store. The footer appears on every receipt you print.",
        ],
      },
    ],
    related: ["logging-sales", "store-settings"],
  },
  {
    slug: "payment-methods",
    category: "Sales & Receipts",
    title: "Payment methods",
    summary: "Configure the payment methods your shop actually accepts.",
    sections: [
      {
        heading: "Choosing your methods",
        paragraphs: [
          "Keel supports Cash, M-Pesa, Bank, Card, and Other. In Settings → Preferences you can choose your default payment method so it's preselected when you log a sale.",
        ],
      },
    ],
    related: ["logging-sales", "mpesa-reconciliation"],
  },
  {
    slug: "mpesa-reconciliation",
    category: "Sales & Receipts",
    title: "M-Pesa reconciliation",
    summary: "Match your M-Pesa statement to your recorded sales automatically.",
    sections: [
      {
        heading: "How reconciliation works",
        paragraphs: [
          "Upload your M-Pesa statement CSV on the Finance page and Keel will attempt the matching to today's recorded payments.",
          "This saves you from checking each transaction by hand when you reconcile at the end of the day.",
        ],
      },
    ],
    related: ["payment-methods", "tracking-expenses"],
  },
  {
    slug: "tracking-expenses",
    category: "Finance",
    title: "Tracking expenses",
    summary: "Record every expense so your profit is real, not guesswork.",
    sections: [
      {
        heading: "Adding an expense",
        steps: [
          "Open Finance from the sidebar.",
          "Click Add Expense.",
          "Enter a description, amount, category, and payment method.",
          "Save — it flows straight into your profit and loss.",
        ],
        paragraphs: [
          "Transport, packaging, airtime, and repairs are easy to ignore, but they add up. Recording them means your end-of-month profit is never a surprise.",
        ],
      },
      {
        heading: "Finding an expense",
        paragraphs: [
          "Search your expenses by description, category, or payment method from the Finance page.",
        ],
      },
    ],
    related: ["profit-and-loss", "profit-margins", "daily-revenue"],
  },
  {
    slug: "profit-and-loss",
    category: "Finance",
    title: "Profit and loss (P&L)",
    summary: "See exactly what came in, what went out, and what you kept.",
    sections: [
      {
        heading: "Reading the P&L",
        paragraphs: [
          "The Reports page combines your sales revenue with your expenses into a P&L bar chart. Toggle between week and month view, and filter by any time period to see the full breakdown of money in and money out.",
        ],
      },
      {
        heading: "Exporting",
        paragraphs: [
          "Export your P&L as CSV or PDF for your accountant or records.",
        ],
      },
    ],
    related: ["tracking-expenses", "profit-margins"],
  },
  {
    slug: "profit-margins",
    category: "Finance",
    title: "Profit margins per product",
    summary: "Know which products make you money and which are barely breaking even.",
    sections: [
      {
        heading: "How margins are calculated",
        paragraphs: [
          "Keel compares each product's selling price to its cost price (set in Inventory). The Reports section shows revenue, cost, profit, and margin percentage for every product that has sold.",
          "This turns vague instincts into numbers you can base pricing and purchasing decisions on.",
        ],
      },
    ],
    related: ["profit-and-loss", "adding-and-managing-products"],
  },
  {
    slug: "daily-revenue",
    category: "Finance",
    title: "Daily revenue",
    summary: "See what today brought in at a glance.",
    sections: [
      {
        heading: "Today's numbers",
        paragraphs: [
          "The Finance page shows today's sales total and quantity, broken down by payment method, so you can reconcile at the end of the day in minutes.",
        ],
      },
    ],
    related: ["tracking-expenses", "logging-sales"],
  },
  {
    slug: "qr-codes",
    category: "Marketing",
    title: "QR codes",
    summary: "Generate QR codes for your products, website, or WhatsApp and let customers scan to buy.",
    sections: [
      {
        heading: "What you can generate",
        paragraphs: [
          "QR codes work like instant shortcuts — a customer scanning with their phone camera is taken straight to what matters.",
          "Because they need a destination, website and product codes unlock after your website URL is set. The WhatsApp is always available — point it at your contact number and print it for the counter or delivery packaging.",
        ],
      },
      {
        heading: "Generating a QR code",
        steps: [
          "Open Marketing from the sidebar.",
          "Open the QR tab.",
          "Choose Website, WhatsApp, or a specific Product.",
          "Click Generate, then print or download it.",
        ],
      },
      {
        heading: "Where to use them",
        paragraphs: [
          "Print QR codes for physical displays, product tags, receipts, and delivery packaging so customers can scan and browse whenever they want.",
        ],
      },
    ],
    related: ["promotions-and-badges", "print-catalogue", "setting-up-your-website"],
  },
  {
    slug: "promotions-and-badges",
    category: "Marketing",
    title: "Promotions and badges",
    summary: "Mark products with sale prices and promotional badges.",
    sections: [
      {
        heading: "Adding a promotion",
        steps: [
          "Open Marketing from the sidebar.",
          "Pick the product you want to promote.",
          "Add a sale price or a promotional badge.",
          "It shows on your published website as well.",
        ],
      },
    ],
    related: ["qr-codes", "print-catalogue"],
  },
  {
    slug: "print-catalogue",
    category: "Marketing",
    title: "Print catalogue",
    summary: "Build a printable catalogue for offline distribution.",
    sections: [
      {
        heading: "Printing your catalogue",
        paragraphs: [
          "Generate a printable catalogue of your products from the Marketing page. It's perfect for trade fairs, shop counters, and customers who prefer paper browsing.",
        ],
      },
    ],
    related: ["qr-codes", "publishing-to-your-website"],
  },
  {
    slug: "setting-up-your-website",
    category: "Website",
    title: "Setting up your website",
    summary: "Get your shop online with a live, mobile-friendly website.",
    sections: [
      {
        heading: "What your website includes",
        paragraphs: [
          "Keel generates a live, mobile-friendly website for your shop automatically, with your products in a clean catalogue, your business information, and a WhatsApp chat button so customers can reach you directly.",
        ],
      },
      {
        heading: "How to set it up",
        steps: [
          "Go to Settings → Store.",
          "Enter your website URL and save.",
          "The Website tab unlocks with Banners, Business Info, Gallery, and Chat Widget.",
          "Publish products from Inventory to fill the catalogue.",
          "When you update a product, it changes on your site instantly.",
        ],
      },
    ],
    related: ["website-banners", "website-chat-widget", "publishing-to-your-website"],
  },
  {
    slug: "website-banners",
    category: "Website",
    title: "Website banners",
    summary: "Promote sales, announcements, and info on your website.",
    sections: [
      {
        heading: "Creating a banner",
        steps: [
          "Go to Website → Banners.",
          "Add a banner and pick a type: hero, sale, info, or alert.",
          "Add an image, link, and sort order.",
          "Save — the banner appears on your site.",
        ],
      },
    ],
    related: ["setting-up-your-website", "business-info"],
  },
  {
    slug: "business-info",
    category: "Website",
    title: "Business information",
    summary: "Keep your hours and contact details right on your public site.",
    sections: [
      {
        heading: "Editing your info",
        paragraphs: [
          "Update your store name, phone, address, email, and business hours from Website → Business Info. These appear on your public website for customers who want to reach you.",
        ],
      },
    ],
    related: ["setting-up-your-website", "store-settings"],
  },
  {
    slug: "website-gallery",
    category: "Website",
    title: "Gallery",
    summary: "Add photos of your shop, products, and workspace to build trust.",
    sections: [
      {
        heading: "Adding photos",
        paragraphs: [
          "Upload images of your shop, products, or workspace from Website → Gallery. Photos on a catalogue page make visitors far more likely to ask for more.",
        ],
      },
    ],
    related: ["setting-up-your-website"],
  },
  {
    slug: "website-chat-widget",
    category: "Website",
    title: "WhatsApp chat widget",
    summary: "Turn website visits into WhatsApp conversations.",
    sections: [
      {
        heading: "Enabling the widget",
        paragraphs: [
          "The chat widget adds a WhatsApp button to your website so visitors message you instantly — no separate chat tool needed, just your regular WhatsApp number.",
        ],
      },
      {
        heading: "Configuring it",
        steps: [
          "Open Website → Chat Widget.",
          "Turn the widget on.",
          "Set your welcome message, widget colour, and position.",
          "Save — customers can now start a chat in one tap.",
        ],
      },
    ],
    related: ["setting-up-your-website", "integration-whatsapp-bot"],
  },
  {
    slug: "integration-whatsapp-bot",
    category: "Integrations",
    title: "WhatsApp bot",
    summary: "Automate the questions customers ask you every day.",
    sections: [
      {
        heading: "What the bot can do",
        paragraphs: [
          "Every day the same questions come through WhatsApp — is this in stock, how much is that, are you open? The WhatsApp bot answers automatically, so you reclaim hours every week and never miss a sale because you were slow to reply.",
        ],
      },
      {
        heading: "Going live",
        steps: [
          "Open Integrations from the sidebar.",
          "Choose the WhatsApp Bot and pick your goals for using it.",
          "Enter your business number and verify the code — Keel handles the Meta setup for you.",
          "Flip it live. Customer messages get handled automatically.",
        ],
      },
    ],
    related: ["website-chat-widget", "integration-calendar", "integrate-overview"],
  },
  {
    slug: "integration-calendar",
    category: "Integrations",
    title: "Google Calendar",
    summary: "Sync scheduled orders into your calendar.",
    sections: [
      {
        heading: "Syncing service orders",
        paragraphs: [
          "Connect Google Calendar from the Integrations page. When you schedule an order or appointment for a future date, Keel creates a calendar event automatically — and updates it if the order changes.",
        ],
      },
    ],
    related: ["integration-whatsapp-bot", "service-orders"],
  },
  {
    slug: "integrate-overview",
    category: "Integrations",
    title: "Integrations overview",
    summary: "Everything you can connect to Keel in one place.",
    sections: [
      {
        heading: "What's available",
        paragraphs: [
          "The Integrations page is like an app store for your business tools. Each integration gets its own page with benefits, how it works, setup steps, and frequently asked questions.",
          "Today that includes the WhatsApp Bot and Google Calendar. More are on the way.",
        ],
      },
    ],
    related: ["integration-whatsapp-bot", "integration-calendar"],
  },
  {
    slug: "service-orders",
    category: "Service Businesses",
    title: "Service orders and customers",
    summary: "Run laundry, salon, repair, or any service business without losing track.",
    sections: [
      {
        heading: "Creating an order",
        paragraphs: [
          "For service businesses — laundry, salon, barber, repair — create orders with a customer's details, service items, quantities, and notes. Pricing supports fixed rates, per-unit pricing, and weight-based billing.",
        ],
      },
      {
        heading: "Moving an order through your queue",
        steps: [
          "The live Queue page shows all active orders.",
          "Each order moves through its status: Pending, In Progress, Ready, Completed.",
          "Search orders by customer name and see their full history.",
        ],
      },
      {
        heading: "Managing customers",
        paragraphs: [
          "Each regular gets a profile with their contact info, order history, and total spent, so you can serve returning long-time customers faster.",
        ],
      },
    ],
    related: ["getting-started", "integration-calendar"],
  },
  {
    slug: "store-settings",
    category: "Account & Settings",
    title: "Store settings",
    summary: "Name, currency, theme, contact details, terms, and more.",
    sections: [
      {
        heading: "What you can change",
        paragraphs: [
          "Open Settings to update your store name, currency symbol, theme (light/dark), website URL, WhatsApp number, contact details, receipt footer, and default payment method.",
        ],
      },
      {
        heading: "Changing your business category",
        paragraphs: [
          "Your business category determines which product variants you get. Change it from Settings, and you can switch it at most once every 30 days.",
        ],
      },
    ],
    related: ["getting-started", "payment-methods", "standard-subscription"],
  },
  {
    slug: "standard-subscription",
    category: "Account & Settings",
    title: "Plans, billing & subscription",
    summary: "Free trial, Basic, and Pro plans explained.",
    sections: [
      {
        heading: "The free trial",
        paragraphs: [
          "Every new shop starts with a 7-day free trial of Keel so you can get everything working before you subscribe.",
        ],
      },
      {
        heading: "Basic vs Pro",
        paragraphs: [
          "Basic gives you sales, inventory, service orders, expenses, customer management, stock alerts, and basic reports.",
          "Pro adds your live website and storefront, P&L charts with CSV/PDF export, social scheduling, WhatsApp and Telegram bots, QR codes and print catalogue, M-Pesa reconciliation, website analytics, and data export.",
        ],
      },
      {
        heading: "Renewing",
        steps: [
          "Go to Settings → Billing, or click the tab in the lockout screen when your trial ends.",
          "Choose Basic or Pro and pay securely with Paystack.",
          "Your subscription extends by 30 days for each payment.",
        ],
      },
    ],
    related: ["store-settings", "data-export-and-deletion", "account-security"],
  },
  {
    slug: "data-export-and-deletion",
    category: "Account & Settings",
    title: "Data export & deletion",
    summary: "Take your data with you, or clear it out.",
    sections: [
      {
        heading: "Exporting",
        paragraphs: [
          "Export all your data as JSON from Settings → Data. You can also download individual records.",
        ],
      },
      {
        heading: "Deleting",
        paragraphs: [
          "From the same place you can delete individual records or wipe all shop data. Deleting is immediate, so be sure you want to before you confirm.",
        ],
      },
    ],
    related: ["standard-subscription", "store-settings"],
  },
  {
    slug: "account-security",
    category: "Account & Settings",
    title: "Profile & security",
    summary: "Manage your password, email, and sign-in.",
    sections: [
      {
        heading: "Updating your profile",
        paragraphs: [
          "Manage your profile picture, display name, email, and password from the Profile page.",
        ],
      },
      {
        heading: "If you can't log in",
        steps: [
          "Check your email and password.",
          "Use Forgot Password on the login page.",
          "Check your inbox for the confirmation or reset link.",
        ],
      },
    ],
    related: ["store-settings", "data-export-and-deletion"],
  },
  {
    slug: "troubleshooting",
    category: "Troubleshooting",
    title: "Troubleshooting common issues",
    summary: "Quick fixes for the issues shop owners run into.",
    sections: [
      {
        heading: "Website not showing",
        steps: [
          "Make sure you've set your website URL in Settings → Store.",
          "Publish products from Inventory — unpublishers never show up on your site.",
          "Check you have an internet connection and refresh.",
        ],
      },
      {
        heading: "Data not loading",
        steps: [
          "Refresh the page.",
          "Log out and back in.",
          "Check your connection. If it still fails, contact support.",
        ],
      },
      {
        heading: "A payment didn't go through",
        steps: [
          "Check your internet connection.",
          "For Paystack, try again after a few minutes.",
          "Contact support if it keeps failing.",
        ],
      },
    ],
    related: ["getting-started", "standard-subscription"],
  },
];

export const docCategories = [...new Set(docs.map((d) => d.category))];

export function getDoc(slug) {
  return docs.find((d) => d.slug === slug);
}

export function relatedDocs(doc) {
  if (!doc?.related?.length) return [];
  return doc.related
    .map((slug) => getDoc(slug))
    .filter(Boolean)
    .slice(0, 3);
}