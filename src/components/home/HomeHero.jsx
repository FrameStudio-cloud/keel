import { Link } from "react-router-dom";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import PictureImg from "../PictureImg";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function HomeHero() {
  const heroRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl
        .fromTo(".hero-icon", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 })
        .fromTo(".hero-headline", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2")
        .fromTo(".hero-subtitle", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
        .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, "-=0.2")
        .fromTo(".hero-shot", { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.2");
    });

    return () => mm.revert();
  }, { scope: heroRef });

  return (
    <section ref={heroRef} className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-16 sm:pt-28 sm:pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div className="lg:col-span-5 text-center lg:text-left">
          <img
            src="/keel-icon.webp"
            alt="Keel"
            className="hero-icon w-16 h-16 mx-auto lg:mx-0 mb-6"
          />
          <h1 className="hero-headline text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Shop Management,{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Simplified
            </span>
          </h1>
          <p className="hero-subtitle mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mx-auto lg:mx-0">
            Track inventory, manage services, log sales, view reports —
            whether you run a shop, salon, laundry, or garage, Keel keeps
            everything in one clean dashboard. No complexity, no clutter.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-4 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <FiCheckCircle size={12} /> 7 days free trial. No credit card.
          </div>
          <div className="hero-cta mt-6 flex flex-col sm:flex-row items-center lg:justify-start gap-4">
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

        {/* Right — real dashboard screenshot */}
        <div className="lg:col-span-7">
          <div className="hero-shot rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#16213e] overflow-hidden">
            <PictureImg
              src="/dashboard-laptop-preview.webp"
              fallback="/dashboard-laptop-preview.png"
              alt="Keel dashboard overview"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
