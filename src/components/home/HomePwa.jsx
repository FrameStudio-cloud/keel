import { FiSmartphone, FiMonitor, FiDownload, FiShield } from "react-icons/fi";

const points = [
  { icon: FiSmartphone, title: "Works on your phone", desc: "Full-featured on Android and iPhone — log sales and check stock from anywhere." },
  { icon: FiMonitor, title: "And on desktop", desc: "Same dashboard in your browser on any laptop or PC. No install required." },
  { icon: FiDownload, title: "Installable app", desc: "Add Keel to your home screen or taskbar for an app-like experience, with offline-ready PWA support." },
];

export default function HomePwa() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24">
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-700 rounded-2xl p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-100 bg-white/10 px-3 py-1 rounded-full mb-4">
              <FiShield className="text-blue-100" /> Runs on any device
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Keel goes where you do
            </h2>
            <p className="text-base text-blue-100 leading-relaxed mb-6">
              No bulky desktop installs and no browser tabs to babysit. Keel is
              a fast web app that feels native — on your phone, tablet, or
              laptop.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-sm transition-all hover:bg-blue-50 shadow-lg shadow-blue-900/20"
            >
              Try it on any device <FiDownload className="hidden sm:block" />
            </a>
          </div>
          <div className="space-y-4">
            {points.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white/10 backdrop-blur rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white mb-1">{title}</h3>
                  <p className="text-sm text-blue-100 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
