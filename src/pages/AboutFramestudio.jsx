import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiHeart, FiSmartphone, FiMapPin, FiMail, FiTwitter } from "react-icons/fi";

export default function AboutFramestudio() {
  return (
    <>
      <Helmet>
        <title>About — Keel by Framestudio</title>
        <meta name="description" content="Framestudio builds Keel — a simple, mobile-first business dashboard for Kenyan shop owners. Based in Thika, Kenya." />
        <meta property="og:title" content="About — Keel by Framestudio" />
        <meta property="og:description" content="Framestudio builds Keel — a simple, mobile-first business dashboard for Kenyan shop owners. Based in Thika, Kenya." />
        <meta property="og:url" content="https://keel-nu.vercel.app/about" />
      </Helmet>
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e] text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-all">
          <FiArrowLeft size={14} /> Back to home
        </Link>

        <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
              <span className="text-white font-extrabold text-lg">FS</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">Framestudio</h1>
              <p className="text-sm text-slate-500 dark:text-slate-500">Building digital tools for Kenyan businesses</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Framestudio is a small team based in <strong className="text-slate-800 dark:text-slate-200">Thika, Kenya</strong>. We build software that helps small businesses run better — tools that are simple enough to use on a phone, powerful enough to replace spreadsheets and notebooks, and affordable enough that any shop can use them.
            </p>

            <p>
              We built Keel because we saw the same problem everywhere we looked. Shop owners were working hard, putting in long hours, but running their businesses on WhatsApp messages, handwritten receipts, and memory. When we asked why they didn't use existing business software, the answer was always the same: too expensive, too complicated, requires a computer, needs training.
            </p>

            <p>
              So we built something different. Keel works on any phone, requires no training, and is free to start. It handles inventory, sales, reporting, your website, and customer communication in one place. There is no hardware to install, no monthly commitment, no learning curve.
            </p>

            <p>
              We believe that every shop owner deserves the same operational tools that large businesses take for granted. Technology should not be a barrier — it should be the thing that removes barriers.
            </p>

            <p>
              Keel is our first product, but it won't be our last. We're building more tools for Kenyan small businesses, and we're just getting started.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <FiHeart className="text-red-500" /> What we believe
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p><strong className="text-slate-800 dark:text-slate-200">Simplicity is not a compromise.</strong> A tool that is hard to use is a tool that won't be used. Every feature in Keel is designed to work in under ten seconds.</p>
            <p><strong className="text-slate-800 dark:text-slate-200">Your phone is enough.</strong> You should not need a laptop, a printer, or a dedicated device to run your business. Everything Keel does works on the phone in your pocket.</p>
            <p><strong className="text-slate-800 dark:text-slate-200">Small businesses deserve better.</strong> The best tools are built for the businesses that need them most. Kenyan shops are not an afterthought — they are who we build for.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <FiSmartphone className="text-blue-500" /> Get in touch
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="flex items-center gap-3">
              <FiMapPin className="text-slate-400 flex-shrink-0" />
              <span>Thika, Kenya</span>
            </div>
            <div className="flex items-center gap-3">
              <FiMail className="text-slate-400 flex-shrink-0" />
              <a href="mailto:hello@framestudio.co.ke" className="text-blue-600 dark:text-blue-400 hover:underline">hello@framestudio.co.ke</a>
            </div>
            <div className="flex items-center gap-3">
              <FiTwitter className="text-slate-400 flex-shrink-0" />
              <a href="https://framestudio.co.ke" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">framestudio.co.ke</a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <a
              href="https://framestudio.co.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Visit Framestudio <FiArrowLeft size={14} className="rotate-180" />
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-6">Powered by Keel</p>
      </div>
    </div>
    </>
  );
}
