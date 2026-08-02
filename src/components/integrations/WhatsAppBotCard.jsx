import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";
import { useToast } from "../../context/ToastProvider";
import useIntegrationGoals from "../../hooks/useIntegrationGoals";
import GoalsStep from "./GoalsStep";
import IntegrationStats from "./IntegrationStats";
import {
  FiMessageCircle, FiSmartphone, FiZap, FiTrash2, FiCheckCircle,
  FiLock, FiClock, FiMessageSquare, FiRotateCw, FiCheck, FiSliders,
} from "react-icons/fi";

const inputClass = "w-full bg-surface-1 border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors";

const WIZARD_STEPS = [
  { key: "goal", label: "Goal" },
  { key: "connect", label: "Connect" },
  { key: "verify", label: "Verify" },
  { key: "live", label: "Live" },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      aria-label={checked ? "Turn off WhatsApp bot" : "Turn on WhatsApp bot"}
      className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${checked ? "bg-brand" : "bg-surface-3"}`}
    >
      <span className="absolute top-0.5 w-5 h-5 bg-surface-1 rounded-full shadow transition-all" style={{ left: checked ? "1.375rem" : "0.125rem" }} />
    </button>
  );
}

function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2">
      {WIZARD_STEPS.map((step, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <li key={step.key} className="flex items-center gap-1.5 sm:gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-1.5">
              <span
                aria-label={`Step ${i + 1}: ${step.label}`}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isDone
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-brand text-white shadow shadow-brand/30"
                      : "bg-surface-2 text-text-faint"
                }`}
              >
                {isDone ? <FiCheck size={12} /> : i + 1}
              </span>
              <span className={`hidden sm:inline text-[10px] font-semibold whitespace-nowrap ${isActive ? "text-brand" : isDone ? "text-text-body" : "text-text-faint"}`}>
                {step.label}
              </span>
            </div>
            {i < WIZARD_STEPS.length - 1 && (
              <span className={`h-px flex-1 ${isDone ? "bg-green-400" : "bg-surface-2"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

async function invokeOnboard(action, body) {
  const { data, error } = await supabase.functions.invoke(`whatsapp-onboard/${action}`, { body });
  if (error) {
    let message = error.message || "Something went wrong";
    if (error.context) {
      try {
        const ctx = await error.context.json();
        message = ctx?.error || message;
      } catch { /* keep default */ }
    }
    throw new Error(message);
  }
  return data;
}

function maskNumber(num) {
  const digits = String(num || "").replace(/\D/g, "");
  if (digits.length < 6) return num || "";
  return `+${digits.slice(0, digits.length - 4)} XXX ${digits.slice(-4)}`;
}

export default function WhatsAppBotCard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [shopId, setShopId] = useState(null);

  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [connectedAt, setConnectedAt] = useState(null);
  const [botNumber, setBotNumber] = useState("");
  const [phoneId, setPhoneId] = useState("");
  const [masked, setMasked] = useState("");

  const [phone, setPhone] = useState("");
  const [codeMethod, setCodeMethod] = useState("SMS");
  const [code, setCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [goalsDone, setGoalsDone] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [stats, setStats] = useState(null);

  const { saved: goalsSaved, loading: goalsLoading, saveGoals } = useIntegrationGoals("whatsapp-bot");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await getShopId();
      if (cancelled) return;
      if (!id) { setLoading(false); return; }
      setShopId(id);

      const { data: cfg } = await supabase
        .from("chat_config")
        .select("whatsapp_phone_id, whatsapp_bot_number, whatsapp_bot_enabled, whatsapp_connected_at, whatsapp_status")
        .eq("shop_id", id)
        .maybeSingle();

      if (cancelled) return;
      if (cfg) {
        const isConnected = cfg.whatsapp_status === "connected";
        setConnected(isConnected);
        setEnabled(!!cfg.whatsapp_bot_enabled);
        setConnectedAt(cfg.whatsapp_connected_at || null);
        setBotNumber(cfg.whatsapp_bot_number || "");
        setMasked(maskNumber(cfg.whatsapp_bot_number));
        setPhoneId(cfg.whatsapp_phone_id || "");
        if (cfg.whatsapp_status === "code_sent") {
          const d = String(cfg.whatsapp_bot_number || "").replace(/\D/g, "");
          setPhone(d.startsWith("254") && d.length === 12 ? d.slice(3) : d);
          setCode("");
          setGoalsDone(true);
        }
        if (isConnected) {
          const totalRes = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("shop_id", id);
          const answeredRes = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("shop_id", id)
            .eq("status", "answered");
          if (!cancelled) {
            setStats({
              total: totalRes.count || 0,
              answered: answeredRes.count || 0,
            });
          }
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [showToast]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const normalizePhone = (value) => value.replace(/[^\d+]/g, "");

  async function handleConnect() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) return showToast("Enter a valid WhatsApp number", "error");

    let cc = "254";
    let number = digits;
    if (digits.startsWith("254") && digits.length === 12) {
      number = digits.slice(3);
    } else if (digits.startsWith("0") && digits.length === 10) {
      number = digits.slice(1);
    }

    setBusy(true);
    try {
      const res = await invokeOnboard("provision", {
        cc,
        phone_number: number,
        code_method: codeMethod,
      });
      setPhoneId(res.phone_id);
      setMasked(res.masked || maskNumber(phone));
      setResendCountdown(60);
      setCode("");
      showToast("Verification code sent!");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (resendCountdown > 0) return;
    await handleConnect();
  }

  async function handleVerify() {
    if (!phoneId) return showToast("Start again — no pending connection", "error");
    if (code.replace(/\D/g, "").length !== 6) return showToast("Enter the 6-digit code", "error");
    setBusy(true);
    try {
      await invokeOnboard("verify", { phone_id: phoneId, code });
      setConnected(true);
      setEnabled(true);
      setConnectedAt(new Date().toISOString());
      setBotNumber(phone);
      setMasked(maskNumber(phone));
      showToast("WhatsApp bot is live!");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    try {
      await invokeOnboard("deactivate", {});
      setConnected(false);
      setEnabled(false);
      setConnectedAt(null);
      setBotNumber("");
      setPhoneId("");
      setMasked("");
      setPhone("");
      setCode("");
      setStats(null);
      showToast("Bot disconnected");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle() {
    if (!shopId) return;
    const next = !enabled;
    const { error } = await supabase
      .from("chat_config")
      .update({ whatsapp_bot_enabled: next })
      .eq("shop_id", shopId);
    if (error) return showToast(error.message, "error");
    setEnabled(next);
    showToast(next ? "Bot is now live" : "Bot paused");
  }

  async function handleGoalsContinue() {
    setBusy(true);
    try {
      await saveGoals(selectedGoals);
      setGoalsDone(true);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  const showGoals = !connected && !goalsDone && goalsSaved.length === 0;
  const currentStep = connected ? 3 : phoneId ? 2 : showGoals ? 0 : 1;

  if (loading || (!connected && goalsLoading)) {
    return (
      <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-sm p-6">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-2 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-sm p-6">
      {connected ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-success dark:border-green-500/20 bg-success-muted p-4 flex items-start gap-3">
            <FiCheckCircle size={18} className="text-success mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-success">Bot is live</p>
              <p className="text-xs text-success/80 mt-0.5">
                Messages to <span className="font-mono">{masked || botNumber}</span> are answered automatically.
                {connectedAt ? ` Connected ${new Date(connectedAt).toLocaleDateString()}.` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-text-faint">{enabled ? "Active" : "Paused"}</span>
              <Toggle checked={enabled} onChange={handleToggle} />
            </div>
          </div>

          {stats && (
            <IntegrationStats
              stats={[
                { icon: FiMessageCircle, label: "Conversations handled", value: stats.total.toLocaleString() },
                { icon: FiCheckCircle, label: "Answered automatically", value: stats.answered.toLocaleString() },
              ]}
            />
          )}

          <Link
            to="/website"
            className="flex items-center gap-3 p-3 rounded-xl border border-brand-soft dark:border-blue-500/20 bg-brand-muted hover:border-brand-soft transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-brand text-white flex items-center justify-center shrink-0">
              <FiSliders size={15} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-brand">Next step — personalize your bot</p>
              <p className="text-[11px] text-brand/80 mt-0.5">
                Add FAQs and a greeting message on your chat widget.
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleDisconnect}
              disabled={busy}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger border border-danger rounded-lg hover:bg-danger-muted transition-all disabled:opacity-50"
            >
              <FiTrash2 size={13} />
              {busy ? "Disconnecting..." : "Disconnect number"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <Stepper current={currentStep} />

          {showGoals ? (
            <GoalsStep
              goals={[
                { id: "answer_product_questions", label: "Answer questions about my products" },
                { id: "order_updates", label: "Send order updates to customers" },
                { id: "promotions", label: "Share promotions and announcements" },
                { id: "bookings", label: "Take bookings or service appointments" },
                { id: "hours_info", label: "Share business hours and location" },
              ]}
              selected={selectedGoals}
              onChange={setSelectedGoals}
              onContinue={handleGoalsContinue}
              saving={busy}
              heading="What do you want to use it for?"
            />
          ) : !phoneId ? (
            <>
              <div className="rounded-xl border border-border-subtle bg-surface-2 dark:bg-white/5 p-4 text-xs text-text-muted flex items-start gap-2">
                <FiLock size={14} className="mt-0.5 shrink-0" />
                <span>Connect any WhatsApp number. Your customers will message it and get instant answers about your products, prices and opening hours.</span>
              </div>

              <div>
                <label className="block text-xs text-text-faint mb-1.5">WhatsApp number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 px-3 bg-surface-2 dark:bg-white/5 border border-border-subtle rounded-lg text-sm text-text-muted shrink-0">
                    <FiSmartphone size={14} /> +254
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(normalizePhone(e.target.value))}
                    placeholder="7XX XXX XXX"
                    className={`${inputClass} flex-1 min-w-0`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-faint mb-1.5">How do you want to receive the code?</label>
                <div className="grid grid-cols-2 gap-2">
                  {["SMS", "VOICE"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCodeMethod(m)}
                      className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg text-sm font-semibold transition-all ${
                        codeMethod === m
                          ? "border-brand bg-brand-muted text-brand"
                          : "border-border-subtle text-text-body hover:bg-surface-2 dark:hover:bg-white/5"
                      }`}
                    >
                      {m === "SMS" ? <FiMessageSquare size={14} /> : <FiMessageCircle size={14} />}
                      {m === "SMS" ? "Text message" : "Phone call"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-soft text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50"
              >
                <FiZap size={15} />
                {busy ? "Sending code..." : "Send me a verification code"}
              </button>

              <p className="text-xs text-text-faint leading-relaxed">
                We'll send a 6-digit code to this number to confirm it's yours. This number must not be registered on the WhatsApp app on your phone.
              </p>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-brand-soft dark:border-blue-500/20 bg-brand-muted p-4 text-sm text-brand flex items-start gap-2">
                <FiClock size={15} className="mt-0.5 shrink-0" />
                <span>We sent a 6-digit code to <span className="font-mono font-semibold">{masked || maskNumber(phone)}</span>. Enter it below to activate your bot.</span>
              </div>

              <div>
                <label className="block text-xs text-text-faint mb-1.5">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit code"
                  className={`${inputClass} font-mono text-center tracking-[0.5em] text-lg`}
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-soft text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50"
              >
                <FiCheckCircle size={15} />
                {busy ? "Activating..." : "Verify & activate bot"}
              </button>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || busy}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  <FiRotateCw size={12} />
                  {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : "Resend code"}
                </button>
                <button
                  onClick={() => { setPhoneId(""); setPhone(""); setCode(""); }}
                  className="text-xs text-text-faint hover:text-text-body dark:hover:text-text-body"
                >
                  Use a different number
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
