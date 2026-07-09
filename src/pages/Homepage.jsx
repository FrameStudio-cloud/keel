import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useFocusTrap } from "../hooks/useFocusTrap";
import fashionCatalogue from "../assets/catalogue/zurifashion-catalogue-shot.png";
import wixCatalogue from "../assets/catalogue/wix-collection-shot.png";
import electricalsCatalogue from "../assets/catalogue/mini-electricals-shots.png";
import {
  FiPackage, FiTrendingUp,
  FiChevronDown, FiMail, FiPhone, FiInstagram, FiTwitter, FiGithub,
  FiArrowRight, FiMenu, FiX, FiUserPlus, FiShield, FiCreditCard, FiMapPin
} from "react-icons/fi";

const howItWorks = [
  { icon: FiUserPlus, title: "Create Account", desc: "Sign up with your email and shop name. No credit card needed — start for free in under a minute." },
  { icon: FiPackage, title: "Add Products", desc: "Enter products manually, import in bulk, or scan barcodes with your phone camera. Variants, prices, and stock all in one place." },
  { icon: FiTrendingUp, title: "Start Selling", desc: "Log sales, print receipts, and track revenue in real time. Built-in reports show you exactly where your business stands." },
];

const websiteShots = [
  {
    image: fashionCatalogue,
    label: "Fashion Boutique",
    desc: "Showcase your clothing line with a clean, browsable product grid.",
  },
  {
    image: wixCatalogue,
    label: "General Store",
    desc: "Display all your categories — groceries, household, and more.",
  },
  {
    image: electricalsCatalogue,
    label: "Electronics Store",
    desc: "List phones, accessories, and gadgets with variant options.",
  },
];

const testimonials = [
  { name: "Grace Mwangi", shop: "Owner, Electronics Shop, Thika", text: "Keel saved me hours of manual spreadsheet work. I can check stock levels from my phone and the low-stock alerts mean I never run out of popular items." },
  { name: "James Kiprop", shop: "Owner, General Store, Nairobi", text: "The sales tracking is exactly what I needed. Profit reports at a glance, and the receipt printing keeps my records clean." },
  { name: "Faith Wanjiku", shop: "Owner, Clothing Boutique, Mombasa", text: "I was managing everything on paper before Keel. Now I track inventory, log sales, and run my website — all from one place. The barcode scanning let me onboard my whole stock in an afternoon." },
  { name: "Brian Otieno", shop: "Owner, Phone Accessories, Kisumu", text: "Simple, fast, and works on my phone. That's all I needed." },
  { name: "Sarah Nyakio", shop: "Owner, Beauty Products, Nakuru", text: "I love the clean design. The setup wizard walked me through everything in minutes. I had my first sale logged before lunch." },
  { name: "David Kamau", shop: "Owner, Hardware Store, Eldoret", text: "Stock management was a headache — notebooks, lost records. Keel centralised everything. Now the reports show me exactly what's making money and what's not." },
];

const faqs = [
  { q: "What is Keel?", a: "Keel is a shop management dashboard for small businesses. It helps you track inventory, log sales, view reports, manage a website, and handle social media — all from one place." },
  { q: "How much does it cost?", a: "Keel is free to use during our beta period. We'll announce pricing when we launch, but early users will get grandfathered into special rates." },
  { q: "Can I manage multiple shops?", a: "Yes. Each shop gets its own dashboard, inventory, and settings. Sign in once and switch between your shops easily." },
  { q: "Do I get a real website with Keel?", a: "Yes. Keel generates a live website for your shop with a product catalogue, promotional banners, business info page, image gallery, and a WhatsApp chat widget. Add or update products in your dashboard and they appear on your site instantly — no coding needed." },
  { q: "Can customers buy directly from my website?", a: "Your Keel website currently works as a product showcase and catalogue. Customers browse your listings, see prices and variants, and contact you via WhatsApp or the contact info you provide. Direct checkout is coming soon." },
  { q: "Can I use my own domain name?", a: "Yes. You can link a custom domain to your Keel website. Ask us for the DNS details after you've set up your shop." },
  { q: "How do I add products quickly?", a: "Use your phone camera to scan barcodes — Keel auto-fills the product fields. Works for electronics and electricals categories. You can also add products one at a time or enter them manually." },
  { q: "Does Keel help me communicate with customers?", a: "Yes. Your website comes with a WhatsApp chat widget so customers can message you directly. Keel also offers WhatsApp and Telegram bot integrations for automated customer interactions." },
  { q: "Is my data secure?", a: "Absolutely. Your data is stored in Supabase (HIPAA-compliant infrastructure), encrypted in transit and at rest. We never share your data with third parties." },
  { q: "How do I get started?", a: "Click 'Get Started' above, create your account with your email and shop name, and you'll be guided through a quick 5-minute setup wizard." },
];

const socialLinks = [
  { icon: FiInstagram, href: "#", label: "Instagram" },
  { icon: FiTwitter, href: "#", label: "Twitter" },
  { icon: FiGithub, href: "#", label: "GitHub" },
];

export default function Homepage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const navTrapRef = useFocusTrap(mobileNavOpen);
  const marqueeRef = useRef(null);
  const carouselRef = useRef(null);

  const scrollTestimonial = (index) => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.querySelectorAll(".testimonial-card");
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      setCurrentTestimonial(index);
    }
  };

  const handleTestimonialScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.querySelectorAll(".testimonial-card");
    let closest = 0;
    let minDist = Infinity;
    const center = el.scrollLeft + el.offsetWidth / 2;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setCurrentTestimonial(closest);
  };

  useEffect(() => {
    const track = marqueeRef.current;
    if (!track) return;
    let rafId;
    let scrollX = 0;
    const half = track.scrollWidth / 2;

    const animate = () => {
      if (track.dataset.paused === "true") {
        rafId = requestAnimationFrame(animate);
        return;
      }
      scrollX += 1;
      if (scrollX >= half) scrollX = 0;
      track.scrollLeft = scrollX;
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <>
      <Helmet>
        <title>Keel — Business Dashboard for African SMEs</title>
        <meta name="description" content="Track inventory, manage sales, view reports, and grow your business — all from one clean dashboard. Built for Kenyan shop owners." />
        <meta property="og:title" content="Keel — Business Dashboard for African SMEs" />
        <meta property="og:description" content="Track inventory, manage sales, view reports, and grow your business — all from one clean dashboard." />
        <meta property="og:url" content="https://keel-nu.vercel.app/" />
      </Helmet>
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e] text-slate-900 dark:text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#16213e]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm">
            <img src="/keel icon.png" alt="Keel" className="w-7 h-7" />
            Keel
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <a
              href="#features"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#website-integration"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Website
            </a>
            <a
              href="#testimonials"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Contact
            </a>
            <Link
              to="/login"
              className="ml-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="sm:hidden p-1 text-slate-600 dark:text-slate-400"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 sm:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <div
              ref={navTrapRef}
              className="sm:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] px-4 py-3 space-y-2 text-sm shadow-xl"
            >
              <a
                href="#features"
                onClick={() => setMobileNavOpen(false)}
                className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileNavOpen(false)}
                className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                How It Works
              </a>
              <a
                href="#website-integration"
                onClick={() => setMobileNavOpen(false)}
                className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Website
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileNavOpen(false)}
                className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Testimonials
              </a>
              <a
                href="#faq"
                onClick={() => setMobileNavOpen(false)}
                className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                FAQ
              </a>
              <a
                href="#contact"
                onClick={() => setMobileNavOpen(false)}
                className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Contact
              </a>
              <Link
                to="/login"
                onClick={() => setMobileNavOpen(false)}
                className="block text-blue-600 dark:text-blue-400 font-semibold"
              >
                Sign In
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-16 sm:pt-28 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left */}
          <div className="lg:col-span-5 text-center lg:text-left">
            <img
              src="/keel icon.png"
              alt="Keel"
              className="w-16 h-16 mx-auto lg:mx-0 mb-6"
            />
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Shop Management,{" "}
              <span className="text-blue-600 dark:text-blue-400">
                Simplified
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mx-auto lg:mx-0">
              Track inventory, manage sales, view reports, and grow your
              business — all from one clean dashboard. No complexity, no
              clutter.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center lg:justify-start gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                Get Started Free <FiArrowRight />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-medium rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-7 hidden md:block space-y-6">
            <div className="rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden rotate-[2deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-500">
              <img
                src=" /Modern dashboard interface with metrics.png"
                alt="Overview"
                className="w-full h-86 object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden -rotate-[1deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-500">
                <img
                  src="/Modern tech product dashboard mockup.png"
                  alt="Inventory"
                  className="w-full h-60 object-cover"
                />
              </div>
              <div className="rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden rotate-[1deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-500">
                <img
                  src="/Payment summary dashboard widget.png"
                  alt="Finance"
                  className="w-full h-60 object-cover"
                />
              </div>
            </div>
            <div className="rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden -rotate-[1deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-500">
              <img
                src="/Modern analytics dashboard with pastel accents.png"
                alt="Reports"
                className="w-full h-86 object-cover"
              />
            </div>
          </div>
          {/* Mobile fallback */}
          <div className="md:hidden">
            <img
              src="/Modern dashboard interface with metrics.png"
              alt="Dashboard preview"
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24"
      >
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Keep everything in one place
          </h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Everything you need to run your shop.
          </p>
        </div>

        <div className="space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden -rotate-[1deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-500">
              <img
                src="/Modern tech product dashboard mockup.png"
                alt="Inventory"
                className="w-full h-auto object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-3">
                Inventory Management
              </h3>
              <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Never lose track of stock again.
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Track inventory in real time, monitor stock levels, and manage
                products from one dashboard.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden rotate-[1deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-500 lg:order-last">
              <img
                src="/Payment summary dashboard widget.png"
                alt="Financial Tracking"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="lg:order-first">
              <h3 className="text-xl sm:text-2xl font-extrabold mb-3">
                Financial Tracking
              </h3>
              <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Know exactly where every shilling goes.
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Track revenue, expenses, cash, bank and M-Pesa payments from a
                single view.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden -rotate-[1deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-500">
              <img
                src="/Modern analytics dashboard with pastel accents.png"
                alt="Reports"
                className="w-full h-auto object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-3">
                Reports &amp; Insights
              </h3>
              <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Make smarter business decisions.
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                View profit trends, performance reports, and business growth in
                seconds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden rotate-[1deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-500 lg:order-last">
              <img
                src="/Modern dashboard interface with metrics.png"
                alt="Sales"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="lg:order-first">
              <h3 className="text-xl sm:text-2xl font-extrabold mb-3">
                Sales Management
              </h3>
              <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Record every sale instantly.
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate receipts, track transactions, and monitor daily
                performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Flashcard stack */}
      <section
        id="how-it-works"
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold">How it works</h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Three steps to get your shop online and running.
          </p>
        </div>

        <style>{`
          @keyframes cardCycle {
            0%, 20% {
              transform: translateY(var(--peek-y)) scale(var(--peek-scale));
              opacity: 0.6;
              z-index: 1;
              filter: blur(0.5px);
            }
            20%, 25% {
              transform: translateY(0) scale(1);
              opacity: 1;
              z-index: 9;
              filter: blur(0);
            }
            25%, 55% {
              transform: translateY(0) scale(1);
              opacity: 1;
              z-index: 10;
              filter: blur(0);
            }
            55%, 60% {
              transform: translateY(80px) scale(0.92);
              opacity: 0;
              z-index: 11;
              filter: blur(1px);
            }
            60%, 100% {
              transform: translateY(var(--peek-y)) scale(var(--peek-scale));
              opacity: 0.6;
              z-index: 1;
              filter: blur(0.5px);
            }
          }
        `}</style>

        <div className="relative h-[270px] sm:h-[240px]">
          {howItWorks.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="absolute inset-x-0"
              style={{
                animation: `cardCycle 15s ease-in-out ${["-5s", "0s", "-10s"][i]} infinite`,
                "--peek-y": `${12 + i * 8}px`,
                "--peek-scale": `${1 - i * 0.025}`,
              }}
            >
              <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-blue-600 dark:text-blue-400 text-lg" />
                </div>
                <h3 className="font-bold text-sm mb-2">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed sm:max-w-xs mx-auto">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WEBSITE INTEGRATION */}
      <section
        id="website-integration"
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24"
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Your shop, now online — managed from one place
          </h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Keel powers your entire website. Publish products, run banners, set
            business hours, add a WhatsApp chat widget — all from your
            dashboard. No coding, no separate tools.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              Live product catalogue
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              WhatsApp chat widget
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              Custom banners
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              Business info page
            </span>
          </div>
        </div>

        {/* Mobile: infinite marquee loop (JS-powered) */}
        <div className="sm:hidden overflow-hidden pb-2 select-none">
          <div
            ref={marqueeRef}
            className="flex gap-4 overflow-hidden"
            onMouseEnter={() => {
              if (marqueeRef.current)
                marqueeRef.current.dataset.paused = "true";
            }}
            onMouseLeave={() => {
              if (marqueeRef.current)
                marqueeRef.current.dataset.paused = "false";
            }}
          >
            {[...websiteShots, ...websiteShots].map(
              ({ image, label, desc }, i) => (
                <div
                  key={`${label}-${i}`}
                  className="w-[80vw] flex-shrink-0 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden"
                >
                  <img src={image} alt={label} className="w-full" />
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-0.5">{label}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="hidden sm:grid sm:grid-cols-3 gap-4">
          {websiteShots.map(({ image, label, desc }) => (
            <div
              key={label}
              className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden"
            >
              <img src={image} alt={label} className="w-full" />
              <div className="p-4">
                <h3 className="font-bold text-sm mb-0.5">{label}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            People just like you are already using Keel
          </h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Real shop owners, real results.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              onScroll={handleTestimonialScroll}
            >
              {testimonials.map(({ name, shop, text }) => {
                const initials = name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2);
                return (
                  <div
                    key={name}
                    className="testimonial-card snap-start shrink-0 w-[85vw] sm:w-[360px] bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-5"
                  >
                    <svg
                      className="w-6 h-6 text-blue-200 dark:text-blue-800 mb-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {text}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {initials}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {shop}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTestimonial(i)}
                className={`h-2 rounded-full transition-all ${
                  currentTestimonial === i
                    ? "w-6 bg-blue-600"
                    : "w-2 bg-slate-300 dark:bg-slate-600"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24"
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-2">
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                aria-controls={`faq-panel-${i}`}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                {q}
                <FiChevronDown
                  className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              {openFaq === i && (
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-white/10 pt-3"
                >
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24"
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Get in touch</h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:hello@keel.app"
            className="flex items-center gap-3 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-6 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all w-full sm:w-auto justify-center"
          >
            <FiMail className="text-blue-600 dark:text-blue-400" />
            hello@keel.app
          </a>
          <a
            href="https://wa.me/254700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-6 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all w-full sm:w-auto justify-center"
          >
            <FiPhone className="text-green-600 dark:text-green-400" />
            WhatsApp
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24 text-center">
        <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Ready to streamline your shop?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Join other Kenyan shop owners using Keel to manage smarter, not
            harder.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            Get Started Free <FiArrowRight />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              <FiShield className="text-blue-600 dark:text-blue-400" /> Free to
              start
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              <FiCreditCard className="text-blue-600 dark:text-blue-400" /> No
              credit card
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              <FiShield className="text-blue-600 dark:text-blue-400" /> Secure
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              <FiMapPin className="text-blue-600 dark:text-blue-400" /> Built
              for Kenya
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <img src="/keel icon.png" alt="Keel" className="w-5 h-5" />
              &copy; {new Date().getFullYear()} Keel. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <Link
                to="/features"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Features
              </Link>
              <span>&middot;</span>
              <Link
                to="/use-cases"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Use Cases
              </Link>
              <span>&middot;</span>
              <Link
                to="/about"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                About
              </Link>
              <span>&middot;</span>
              <a
                href="https://framestudio.co.ke"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Made by Framestudio
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
