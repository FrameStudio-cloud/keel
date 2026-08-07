import { useState } from "react";
import { Link } from "react-router-dom";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { FiChevronDown, FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import { navGroups } from "../../data/home";

export default function HomeNav() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileNavGroup, setMobileNavGroup] = useState(null);
  const navTrapRef = useFocusTrap(mobileNavOpen);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#16213e]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm">
            <img src="/keel-icon.webp" alt="Keel" className="w-7 h-7" />
            Keel
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            {navGroups.map((group) => (
              <div key={group.label} className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer">
                  {group.label}
                  <FiChevronDown size={10} className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 top-full pt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 translate-y-1 group-hover:translate-y-0 z-50">
                  <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 p-2 min-w-[200px]">
                    {group.items.map((item) => {
                      const content = (
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                          <div>
                            <div className="text-xs font-medium text-slate-900 dark:text-white">{item.label}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</div>
                          </div>
                        </div>
                      );
                      if (item.to) {
                        return <Link key={item.label} to={item.to} className="block">{content}</Link>;
                      }
                      return (
                        <a key={item.label} href={item.href} className="block">{content}</a>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            <Link
              to="/login"
              className="ml-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="sm:hidden p-1 text-slate-600 dark:text-slate-400"
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileNavOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 sm:hidden" ref={navTrapRef}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
          <div className="relative z-10 bg-white dark:bg-[#16213e] h-full w-full flex flex-col px-6 pt-16 pb-8 overflow-y-auto">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-5 right-6 p-1 text-slate-600 dark:text-slate-400"
              aria-label="Close navigation"
            >
              <FiX size={22} />
            </button>
            <div className="mb-10">
              <Link to="/" className="inline-flex items-center gap-2 font-bold text-sm" onClick={() => setMobileNavOpen(false)}>
                <img src="/keel-icon.webp" alt="Keel" className="w-7 h-7" />
                Keel
              </Link>
            </div>
            <div className="flex-1 space-y-2">
              {navGroups.map((group) => (
                <div key={group.label} className="rounded-xl border border-slate-100 dark:border-white/10 overflow-hidden">
                  <button
                    onClick={() => setMobileNavGroup(mobileNavGroup === group.label ? null : group.label)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    aria-expanded={mobileNavGroup === group.label}
                  >
                    {group.label}
                    <FiChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${mobileNavGroup === group.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileNavGroup === group.label && (
                    <div className="border-t border-slate-100 dark:border-white/5">
                      {group.items.map((item) => {
                        const content = (
                          <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</div>
                              <div className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</div>
                            </div>
                            <FiArrowRight size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                          </div>
                        );
                        if (item.to) {
                          return (
                            <Link key={item.label} to={item.to} onClick={() => setMobileNavOpen(false)} className="block">
                              {content}
                            </Link>
                          );
                        }
                        return (
                          <a key={item.label} href={item.href} onClick={() => setMobileNavOpen(false)} className="block">
                            {content}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Link
              to="/login"
              onClick={() => setMobileNavOpen(false)}
              className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl text-center transition-all mt-4"
            >
              Sign In
            </Link>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
              Keel by Framestudio
            </p>
          </div>
        </div>
      )}
    </>
  );
}
