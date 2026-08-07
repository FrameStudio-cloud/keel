import { Link } from "react-router-dom";
import { FiArrowRight, FiShield, FiCreditCard, FiMapPin, FiMail, FiPhone } from "react-icons/fi";

const badges = [
  { icon: FiShield, label: "Free to start" },
  { icon: FiCreditCard, label: "No credit card" },
  { icon: FiShield, label: "Secure" },
  { icon: FiMapPin, label: "Built for Kenya" },
];

export default function HomeCta() {
  return (
    <section id="contact" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24 text-center">
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
          {badges.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              <Icon className="text-blue-600 dark:text-blue-400" /> {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-base font-bold mb-1">Have a question or feedback?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          We'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:hello@keel.app"
            className="flex items-center gap-3 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-6 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all w-full sm:w-auto justify-center"
          >
            <FiMail className="text-blue-600 dark:text-blue-400" />
            hello@keel.app
          </a>
          <a
            href="https://wa.me/254799451882"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-6 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all w-full sm:w-auto justify-center"
          >
            <FiPhone className="text-green-600 dark:text-green-400" />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
