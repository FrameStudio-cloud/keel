import { FiUserPlus, FiPackage, FiTrendingUp } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa6";
import { FiInstagram, FiGithub } from "react-icons/fi";

export const navGroups = [
  {
    label: "Product",
    items: [
      { to: "/features", label: "Features", desc: "Everything Keel can do" },
      { href: "#how-it-works", label: "How It Works", desc: "See how it works in 3 steps" },
      { to: "/use-cases", label: "Use Cases", desc: "Real-world business situations" },
      { href: "#website-integration", label: "Website", desc: "Your shop's online presence" },
    ],
  },
  {
    label: "Resources",
    items: [
      { to: "/help", label: "Help Center", desc: "Guides, docs & troubleshooting" },
      { to: "/blog", label: "Blog", desc: "Tips, updates & business advice" },
      { href: "#faq", label: "FAQ", desc: "Frequently asked questions" },
    ],
  },
  {
    label: "Company",
    items: [
      { to: "/about", label: "About", desc: "Who we are & why we built Keel" },
      { href: "#contact", label: "Contact", desc: "Get in touch with us" },
    ],
  },
];

export const howItWorks = [
  { icon: FiUserPlus, title: "Create Account", desc: "Sign up with your email and shop name. No credit card needed — start with a 7-day free trial in under a minute." },
  { icon: FiPackage, title: "Set Up Your Business", desc: "Choose your category — product or service — and add your products or services with prices and variants. Works for shops, salons, laundries, garages, and more." },
  { icon: FiTrendingUp, title: "Start Selling", desc: "Log sales, create service orders, print receipts, and track revenue in real time. Built-in reports show you exactly where your business stands." },
];

export const testimonials = [
  { name: "Grace Mwangi", shop: "Owner, Electronics Shop, Thika", text: "Keel saved me hours of manual spreadsheet work. I can check stock levels from my phone and the low-stock alerts mean I never run out of popular items." },
  { name: "James Kiprop", shop: "Owner, General Store, Nairobi", text: "The sales tracking is exactly what I needed. Profit reports at a glance, and the receipt printing keeps my records clean." },
  { name: "Faith Wanjiku", shop: "Owner, Clothing Boutique, Mombasa", text: "I was managing everything on paper before Keel. Now I track inventory, log sales, and run my website — all from one place. The barcode scanning let me onboard my whole stock in an afternoon." },
  { name: "Brian Otieno", shop: "Owner, Phone Accessories, Kisumu", text: "Simple, fast, and works on my phone. That's all I needed." },
  { name: "Sarah Nyakio", shop: "Owner, Beauty Products, Nakuru", text: "I love the clean design. The setup wizard walked me through everything in minutes. I had my first sale logged before lunch." },
  { name: "David Kamau", shop: "Owner, Hardware Store, Eldoret", text: "Stock management was a headache — notebooks, lost records. Keel centralised everything. Now the reports show me exactly what's making money and what's not." },
];

export const faqs = [
  { q: "What is Keel?", a: "Keel is a shop management dashboard for small businesses. It helps you track inventory, log sales, view reports, manage a website, and handle social media — all from one place." },
  { q: "How much does it cost?", a: "Keel has two plans. Basic is KSh 500 per month and includes sales, inventory, service orders, expenses, customer management, stock alerts, and basic reports. Pro is KSh 1,000 per month and adds a live website, storefront, P&L charts, social media scheduler, WhatsApp bots, M-Pesa reconciliation, and more. No long-term contracts — cancel anytime." },
  { q: "Can I manage multiple shops?", a: "Yes. Each shop gets its own dashboard, inventory, and settings. Sign in once and switch between your shops easily." },
  { q: "Does Keel work for service businesses like salons, laundries, or repair shops?", a: "Yes. Keel has a dedicated service mode for 9 categories: laundry, salon & barber, automotive, photography, cleaning, and more. You get order management with status tracking (pending → in progress → ready → completed), a customer queue, weight-based billing, customer profiles with order history, and service-specific pricing (fixed, per-unit, or weight-based). Everything a product shop gets — expenses, reports, receipts — is also available for service businesses." },
  { q: "Do I get a real website with Keel?", a: "Yes. Keel generates a live website for your shop with a product catalogue, promotional banners, business info page, image gallery, and a WhatsApp chat widget. Add or update products in your dashboard and they appear on your site instantly — no coding needed." },
  { q: "Can customers buy directly from my website?", a: "Your Keel website currently works as a product showcase and catalogue. Customers browse your listings, see prices and variants, and contact you via WhatsApp or the contact info you provide. Direct checkout is coming soon." },
  { q: "Can I use my own domain name?", a: "Yes. You can link a custom domain to your Keel website. Ask us for the DNS details after you've set up your shop." },
  { q: "How do I add products quickly?", a: "Use your phone camera to scan barcodes — Keel auto-fills the product fields. Works for electronics and electricals categories. You can also add products one at a time or enter them manually." },
  { q: "Does Keel help me communicate with customers?", a: "Yes. Your website comes with a WhatsApp chat widget so customers can message you directly. Keel also offers WhatsApp and Telegram bot integrations for automated customer interactions." },
  { q: "Is my data secure?", a: "Absolutely. Your data is stored in Supabase (HIPAA-compliant infrastructure), encrypted in transit and at rest. We never share your data with third parties." },
  { q: "How do I get started?", a: "Click 'Get Started' above, create your account with your email and shop name, and you'll be guided through a quick 5-minute setup wizard." },
];

export const socialLinks = [
  { icon: FiInstagram, href: "https://www.instagram.com/frame.studio12?igsh=ZWdieTk4ZGI4cjll", label: "Instagram" },
  { icon: FaTiktok, href: "https://vm.tiktok.com/ZS9MrQG9sjXfK-jv0Wd/", label: "TikTok" },
  { icon: FiGithub, href: "https://github.com/FrameStudio-cloud", label: "GitHub" },
];
