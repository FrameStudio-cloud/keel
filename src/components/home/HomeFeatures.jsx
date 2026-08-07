import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PictureImg from "../PictureImg";
import { FiBarChart2, FiTool, FiShoppingBag } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const zigzag = [
  {
    image: "/Modern tech product dashboard mockup.png",
    fallback: "/Modern tech product dashboard mockup.png",
    alt: "Keel inventory dashboard",
    title: "Inventory Management",
    tagline: "Never lose track of stock again.",
    desc: "Track inventory in real time, monitor stock levels, and manage products from one dashboard.",
  },
  {
    image: "/Payment summary dashboard widget.png",
    fallback: "/Payment summary dashboard widget.png",
    alt: "Keel payment summary dashboard",
    title: "Financial Tracking",
    tagline: "Know exactly where every shilling goes.",
    desc: "Track revenue, expenses, cash, bank and M-Pesa payments from a single view.",
    reverse: true,
  },
];

const grid = [
  {
    icon: FiBarChart2,
    title: "Reports & Insights",
    desc: "View profit trends, performance reports, and business growth in seconds.",
    image: "/Modern analytics dashboard with pastel accents.png",
    fallback: "/Modern analytics dashboard with pastel accents.png",
    alt: "Keel reports dashboard",
  },
  {
    icon: FiTool,
    title: "Service Order Management",
    desc: "Create customer orders, track status from pending to completed, manage a queue, and store customer profiles. Supports per-item pricing, weight-based billing, and notes.",
  },
  {
    icon: FiShoppingBag,
    title: "Sales Management",
    desc: "Generate receipts, track transactions, and monitor daily performance.",
    image: "/Modern dashboard interface with metrics.png",
    fallback: "/Modern dashboard interface with metrics.png",
    alt: "Keel sales dashboard",
  },
];

export default function HomeFeatures() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray(".feature-row").forEach((row) => {
        gsap.fromTo(row,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
            scrollTrigger: {
              trigger: row,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      });

      gsap.utils.toArray(".feature-card").forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            }
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section id="features" ref={sectionRef} className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24">
      <div className="text-center mb-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Keep everything in one place
        </h2>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Everything you need to run your shop.
        </p>
      </div>

      {/* Two alternating showcase rows */}
      <div className="space-y-16 sm:space-y-24">
        {zigzag.map((f) => (
          <div
            key={f.title}
            className="feature-row grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
          >
            <div className={f.reverse ? "lg:order-last" : ""}>
              <div className="rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden">
                <PictureImg
                  src={f.image}
                  fallback={f.fallback}
                  alt={f.alt}
                  className="w-full h-auto max-h-[560px] object-cover object-top"
                  loading="lazy"
                />
              </div>
            </div>
            <div className={f.reverse ? "lg:order-first" : ""}>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-3">{f.title}</h3>
              <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {f.tagline}
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Three-card grid — breaks the alternation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 sm:mt-24">
        {grid.map((f) => (
          <div
            key={f.title}
            className="feature-card bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
              <f.icon className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <h3 className="font-bold text-base mb-2">{f.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
              {f.desc}
            </p>
            {f.image && (
              <div className="mt-5 rounded-xl border border-slate-100 dark:border-white/10 overflow-hidden">
                <PictureImg
                  src={f.image}
                  fallback={f.fallback}
                  alt={f.alt}
                  className="w-full h-40 object-cover object-top"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
