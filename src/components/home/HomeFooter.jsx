import { Link } from "react-router-dom";
import { socialLinks } from "../../data/home";
import {
  FiLayers, FiBriefcase, FiInfo, FiHelpCircle, FiShield, FiExternalLink,
} from "react-icons/fi";

const footerLinks = [
  { to: "/features", label: "Features", icon: FiLayers },
  { to: "/use-cases", label: "Use Cases", icon: FiBriefcase },
  { to: "/about", label: "About", icon: FiInfo },
  { to: "/help", label: "Help", icon: FiHelpCircle },
  { to: "/privacy", label: "Privacy", icon: FiShield },
  { to: "/blog", label: "Blog", icon: FiExternalLink },
];

export default function HomeFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
            <img src="/keel-icon.webp" alt="Keel" className="w-5 h-5" />
            &copy; {new Date().getFullYear()} Keel. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-500">
            {footerLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Icon size={12} />
                {label}
              </Link>
            ))}
            <a
              href="https://framestudio.co.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FiExternalLink size={12} />
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
  );
}
