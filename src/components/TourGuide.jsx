import { useState, useEffect, useRef, useContext } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { AuthContext } from "../context/AuthContext";
import { FiBox, FiShoppingBag, FiMonitor, FiZap } from "react-icons/fi";

const SETUP_KEY = "keel_setup_done";

const CATEGORIES = [
  { id: "general", label: "General", icon: <FiBox /> },
  { id: "clothing", label: "Clothing", icon: <FiShoppingBag /> },
  { id: "electronics", label: "Electronics", icon: <FiMonitor /> },
  { id: "electricals", label: "Electricals", icon: <FiZap /> },
];

function DefaultForm({ form, setForm }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Store Name</label>
        <input type="text" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50" placeholder="My Shop" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Phone</label>
          <input type="text" value={form.storePhone} onChange={(e) => setForm({ ...form, storePhone: e.target.value })} className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50" placeholder="+254 700 000 000" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Address</label>
          <input type="text" value={form.storeAddress} onChange={(e) => setForm({ ...form, storeAddress: e.target.value })} className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50" />
        </div>
      </div>
    </div>
  );
}

const firstRunSteps = [
  {
    title: "Welcome to Keel",
    text: "Let's get your shop set up. Your sidebar is organised into Operations, Marketing, and Analytics groups to help you navigate faster. You can skip or change anything later.",
    target: null,
  },
  {
    title: "What do you sell?",
    text: "This controls what extra fields appear when adding products (color, size, storage).",
    target: null,
    render: ({ form, setForm }) => (
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setForm({ ...form, businessCategory: cat.id })}
            className={`p-3 rounded-xl text-left transition-all ${
              form.businessCategory === cat.id
                ? "bg-blue-500/10 border border-blue-500"
                : "bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10"
            }`}
          >
            <span className="text-lg text-slate-600 dark:text-slate-400">{cat.icon}</span>
            <p className="text-slate-900 dark:text-white font-semibold text-xs mt-1.5">{cat.label}</p>
          </button>
        ))}
      </div>
    ),
  },
  {
    title: "Tell us about your store",
    text: "Your customers will see this on your website and receipts.",
    target: null,
    render: ({ form, setForm }) => <DefaultForm form={form} setForm={setForm} />,
  },
  {
    title: "Choose your currency",
    text: "All prices will use this symbol.",
    target: null,
    render: ({ form, setForm }) => (
      <div className="grid grid-cols-3 gap-2">
        {[
          { symbol: "KSh", label: "Kenyan Shilling" },
          { symbol: "TSh", label: "Tanzanian Shilling" },
          { symbol: "USh", label: "Ugandan Shilling" },
          { symbol: "$", label: "US Dollar" },
          { symbol: "KES", label: "KES" },
          { symbol: "UGX", label: "UGX" },
        ].map((opt) => (
          <button
            key={opt.symbol}
            onClick={() => setForm({ ...form, currencySymbol: opt.symbol })}
            className={`p-2 rounded-xl text-center transition-all ${
              form.currencySymbol === opt.symbol
                ? "bg-blue-500/10 border border-blue-500"
                : "bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10"
            }`}
          >
            <p className="text-slate-900 dark:text-white font-bold">{opt.symbol}</p>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">{opt.label}</p>
          </button>
        ))}
      </div>
    ),
  },
  {
    title: "Default payment method",
    text: "Pre-selected when logging a sale.",
    target: null,
    render: ({ form, setForm }) => (
      <div className="flex flex-col gap-1.5">
        {["Cash", "M-Pesa", "Bank"].map((method) => (
          <button
            key={method}
            onClick={() => setForm({ ...form, defaultPayment: method })}
            className={`w-full p-2.5 rounded-xl text-left transition-all ${
              form.defaultPayment === method
                ? "bg-blue-500/10 border border-blue-500"
                : "bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10"
            }`}
          >
            <span className="text-slate-900 dark:text-white font-semibold text-sm">{method}</span>
          </button>
        ))}
      </div>
    ),
  },
  {
    title: "Low stock threshold",
    text: "Products below this number will trigger alerts.",
    target: null,
    render: ({ form, setForm }) => (
      <input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50" />
    ),
  },
  {
    title: "Operations",
    text: "Your core daily tasks live here — Overview, Inventory, Sales, and Finance. Add products, log sales, and track revenue all in one place.",
    target: '[data-tour="group-Operations"]',
  },
  {
    title: "Marketing",
    text: "Reach your customers. Manage Social Media, Bots, Website listings, and generate shareable links, QR codes, and WhatsApp buttons.",
    target: '[data-tour="group-Marketing"]',
  },
  {
    title: "Analytics",
    text: "Monitor trends. Review stock movements and view profit margins per product with weekly & monthly P&L reports.",
    target: '[data-tour="group-Analytics"]',
  },
  {
    title: "Stay Notified",
    text: "Get low stock alerts here. The badge shows how many products need attention.",
    target: '[data-tour="notifications"]',
  },
];

const returnSteps = [
  {
    title: "Welcome back to Keel",
    text: "Quick refresher. Your sidebar is organised into Operations, Marketing, and Analytics groups.",
    target: null,
  },
  {
    title: "Operations",
    text: "Daily tasks — Overview, Inventory, Sales, and Finance.",
    target: '[data-tour="group-Operations"]',
  },
  {
    title: "Marketing",
    text: "Customer outreach — Social Media, Bots, Website, and Marketing tools.",
    target: '[data-tour="group-Marketing"]',
  },
  {
    title: "Analytics",
    text: "Data & insights — Stock History and Reports with exports.",
    target: '[data-tour="group-Analytics"]',
  },
  {
    title: "Settings",
    text: "Customise your store name, currency, theme, payment methods, and business hours.",
    target: '[data-tour="nav-Settings"]',
  },
];

export default function TourGuide() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, side: "bottom" });
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [form, setForm] = useState({
    businessCategory: "general",
    storeName: "",
    storePhone: "",
    storeAddress: "",
    currencySymbol: "KSh",
    defaultPayment: "Cash",
    lowStockThreshold: 6,
  });
  const trapRef = useFocusTrap(true);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      const done = localStorage.getItem(SETUP_KEY);
      if (done) {
        setVisible(false);
        return;
      }

      const shopId = await getShopId();
      const { data } = await supabase
        .from("store_settings")
        .select("id")
        .eq("shop_id", shopId)
        .maybeSingle();

      const needsSetup = !data;
      setIsFirstRun(needsSetup);
      setVisible(true);
    })();
  }, [authLoading, user]);

  useEffect(() => {
    if (!visible) return;
    reposition();
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, visible]);

  function reposition() {
    const steps = isFirstRun ? firstRunSteps : returnSteps;
    const current = steps[step];

    requestAnimationFrame(() => {
      if (!current.target) {
        setPos({ top: "50%", left: "50%", side: "center" });
        return;
      }

      const targetEl = document.querySelector(current.target);
      if (!targetEl) {
        setPos({ top: "50%", left: "50%", side: "center" });
        return;
      }

      const rect = targetEl.getBoundingClientRect();
      const tw = 320;
      const th = tooltipRef.current?.offsetHeight || 260;
      const gap = 12;

      let top, left, side;

      if (rect.bottom + th + gap < window.innerHeight) {
        top = rect.bottom + gap;
        side = "top";
      } else if (rect.top - th - gap > 0) {
        top = rect.top - th - gap;
        side = "bottom";
      } else {
        top = Math.max(8, Math.min(rect.top + rect.height / 2 - th / 2, window.innerHeight - th - 8));
        side = rect.right + tw + gap < window.innerWidth ? "left" : "right";
      }

      if (side === "top" || side === "bottom") {
        left = Math.max(8, Math.min(rect.left + rect.width / 2 - tw / 2, window.innerWidth - tw - 8));
      } else if (side === "left") {
        left = rect.right + gap;
      } else {
        left = rect.left - tw - gap;
      }

      setPos({ top: `${top}px`, left: `${left}px`, side });
    });
  }

  function repositionNow() {
    reposition();
  }

  async function dismiss() {
    localStorage.setItem(SETUP_KEY, "true");
    setVisible(false);
  }

  async function next() {
    const steps = isFirstRun ? firstRunSteps : returnSteps;

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await saveSetup();
      dismiss();
      navigate("/");
    }
  }

  async function saveSetup() {
    if (!isFirstRun) return;
    const shopId = await getShopId();
    if (!shopId) return;

    await supabase.from("shops").update({ business_category: form.businessCategory }).eq("id", shopId);

    await supabase.from("store_settings").upsert({
      store_name: form.storeName,
      store_phone: form.storePhone,
      store_address: form.storeAddress,
      currency_symbol: form.currencySymbol,
      default_payment: form.defaultPayment,
      low_stock_threshold: form.lowStockThreshold,
      theme: "light",
      shop_id: shopId,
    }, { onConflict: "shop_id" });
  }

  if (!visible) return null;

  const steps = isFirstRun ? firstRunSteps : returnSteps;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isSaveStep = isLast && isFirstRun;

  const arrowClass = pos.side === "top"
    ? "before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full before:border-8 before:border-transparent before:border-b-white dark:before:border-b-[#16213e]"
    : pos.side === "bottom"
    ? "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:translate-y-full after:border-8 after:border-transparent after:border-t-white dark:after:border-t-[#16213e]"
    : "";

  return (
    <div
      ref={trapRef}
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="App tour guide"
    >
      <div className="fixed inset-0 bg-black/40" onClick={repositionNow} />

      {pos.side === "center" ? (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div
            ref={tooltipRef}
            className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-2xl pointer-events-auto"
          >
            <TourContent
              current={current}
              step={step}
              steps={steps}
              form={form}
              setForm={setForm}
              isLast={isLast}
              isSaveStep={isSaveStep}
              onNext={next}
              onSkip={dismiss}
            />
          </div>
        </div>
      ) : (
        <div
          ref={tooltipRef}
          className={`absolute bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-2xl pointer-events-auto ${arrowClass}`}
          style={{ top: pos.top, left: pos.left }}
        >
          <TourContent
            current={current}
            step={step}
            steps={steps}
            form={form}
            setForm={setForm}
            isLast={isLast}
            isSaveStep={isSaveStep}
            onNext={next}
            onSkip={dismiss}
          />
        </div>
      )}
    </div>
  );
}

function TourContent({ current, step, steps, form, setForm, isLast, isSaveStep, onNext, onSkip }) {
  return (
    <>
      <div className="flex items-center gap-1 mb-4">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-blue-600" : "bg-slate-200 dark:bg-white/10"}`} />
        ))}
      </div>
      <h2 className="text-slate-900 dark:text-white font-bold text-base mb-1.5">{current.title}</h2>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{current.text}</p>
      {current.render && <div className="mb-4">{current.render({ form, setForm })}</div>}
      <div className="flex gap-2">
        <button onClick={onSkip} className="flex-1 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm py-2 rounded-xl hover:text-slate-900 dark:text-white transition-colors">
          Skip
        </button>
        <button onClick={onNext} className="flex-1 bg-blue-600 text-white font-bold text-sm py-2 rounded-xl hover:bg-blue-500 transition-all">
          {isSaveStep ? "Finish Setup" : isLast ? "Done" : "Next"}
        </button>
      </div>
    </>
  );
}
