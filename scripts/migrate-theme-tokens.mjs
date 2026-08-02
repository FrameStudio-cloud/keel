#!/usr/bin/env node
/*
 * Keel theme-token codemod.
 *
 * Migrates hardcoded Tailwind palette classes (gray/slate/blue/red/... with
 * `dark:` bridge variants) to semantic tokens (surface, text, border, brand,
 * success, warning, danger, info, chart). Runs in-place over all dashboard
 * files under src/ except the intentionally-unthemed marketing/blog/public
 * pages.
 *
 * Usage:  node scripts/migrate-theme-tokens.mjs
 *         node scripts/migrate-theme-tokens.mjs --check   (dry-run, report only)
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const CHECK = process.argv.includes("--check");

/* Pages/components that keep their own art direction (marketing, blog, public,
 * auth screens). Dashboard shell + feature pages are migrated. */
const EXCLUDE = [
  "src/pages/Homepage.jsx",
  "src/pages/Blog.jsx",
  "src/pages/BlogPost.jsx",
  "src/pages/Features.jsx",
  "src/pages/UseCases.jsx",
  "src/pages/AboutFramestudio.jsx",
  "src/pages/Terms.jsx",
  "src/pages/Privacy.jsx",
  "src/pages/PublicProduct.jsx",
  "src/pages/Login.jsx",
  "src/components/integrations/WhatsAppMockup.jsx",
  "src/components/home/",
  "src/components/blog/",
  /* Always-light storefront preview mockups (deployed-site art direction).
   * Their interiors must NOT flip dark with the dashboard theme. */
  "src/components/storefront/TemplatePreview.jsx",
  "src/components/storefront/TemplateModal.jsx",
  "src/components/storefront/SectionPicker.jsx",
  "src/components/storefront/StorefrontLanding.jsx",
  "src/components/storefront/OptionCard.jsx",
];

const EXTENSIONS = new Set([".js", ".jsx"]);

/* Ordered replacement table. Order matters: more specific/longer matches first.
 * Every old->new pair is a literal string replacement (class-level, not token
 * collisions), so pairs must appear verbatim in className strings. */
const RULES = [
  // --- Surfaces: card / page / inset (light+dark pair collapse) ---
  ["bg-white dark:bg-[#16213e]", "bg-surface-1"],
  ["bg-white dark:bg-[#1a1a2e]", "bg-surface-1"],
  ["bg-white dark:bg-[#1e293b]", "bg-surface-1"],
  ["bg-white/90 dark:bg-[#16213e]/90", "bg-surface-1/90"],
  ["bg-white/80 dark:bg-[#16213e]/80", "bg-surface-1/80"],
  ["bg-white/80 dark:bg-[#16213e]/90", "bg-surface-1/90"],
  ["bg-white/70 dark:bg-[#16213e]/70", "bg-surface-1/70"],
  ["bg-white/80 dark:bg-[#16213e]/70", "bg-surface-1/70"],
  ["bg-slate-50 dark:bg-[#1a1a2e]", "bg-surface-2"],
  ["bg-gray-50 dark:bg-[#1a1a2e]", "bg-surface-0"],
  ["min-h-screen bg-slate-100 dark:bg-[#1a1a2e]", "min-h-screen bg-surface-0"],
  ["min-h-screen bg-slate-50 dark:bg-[#0f172a]", "min-h-screen bg-surface-0"],
  ["bg-slate-100 dark:bg-[#1a1a2e]", "bg-surface-2"],
  ["bg-gray-100 dark:bg-[#1a1a2e]", "bg-surface-2"],
  ["bg-white dark:bg-white/[0.05]", "bg-surface-1"],
  ["dark:bg-[#16213e]", "bg-surface-1"],
  ["dark:bg-[#1a1a2e]", "bg-surface-2"],
  ["dark:bg-[#1e293b]", "bg-surface-1"],

  // --- Text: primary / body / muted / faint ---
  ["text-slate-900 dark:text-white", "text-text-primary"],
  ["text-gray-800 dark:text-white", "text-text-primary"],
  ["text-gray-700 dark:text-slate-300", "text-text-body"],
  ["text-gray-600 dark:text-slate-400", "text-text-body"],
  ["text-slate-600 dark:text-slate-400", "text-text-body"],
  ["text-gray-500 dark:text-slate-400", "text-text-muted"],
  ["text-slate-500 dark:text-slate-400", "text-text-muted"],
  ["text-gray-400 dark:text-slate-500", "text-text-faint"],
  ["text-slate-400 dark:text-slate-500", "text-text-faint"],
  ["placeholder-gray-400 dark:placeholder-slate-500", "placeholder-text-faint"],
  ["placeholder-slate-400 dark:placeholder-slate-500", "placeholder-text-faint"],
  ["placeholder:text-slate-400 dark:placeholder:text-slate-500", "placeholder:text-text-faint"],

  // --- Borders ---
  ["border-gray-100 dark:border-white/10", "border-border-subtle"],
  ["border-gray-200 dark:border-white/10", "border-border-subtle"],
  ["border-slate-200 dark:border-white/10", "border-border-subtle"],
  ["border-slate-100 dark:border-white/10", "border-border-subtle"],
  ["border-slate-50 dark:border-white/5", "border-border-subtle"],
  ["border-b border-slate-200 dark:border-white/10", "border-b border-border-subtle"],
  ["border-b border-slate-100 dark:border-white/10", "border-b border-border-subtle"],
  ["border-b border-slate-50 dark:border-white/5", "border-b border-border-subtle"],
  ["border-t border-slate-100 dark:border-white/10", "border-t border-border-subtle"],
  ["border-b border-gray-100 dark:border-white/10", "border-b border-border-subtle"],
  ["border-b-white dark:border-b-[#16213e]", "border-b-surface-1"],
  ["border-t-white dark:border-t-[#16213e]", "border-t-surface-1"],
  ["border-b-white dark:border-b-white/0", "border-b-surface-1"],

  // --- Hover / active backgrounds (before catch-alls) ---
  ["hover:bg-gray-50 dark:hover:bg-white/[0.05]", "hover:bg-surface-2"],
  ["hover:bg-slate-50 dark:hover:bg-white/[0.03]", "hover:bg-surface-2"],
  ["hover:bg-slate-50 dark:hover:bg-white/[0.05]", "hover:bg-surface-2"],
  ["hover:bg-gray-50 dark:hover:bg-white/[0.03]", "hover:bg-surface-2"],
  ["hover:bg-black/[0.03] dark:hover:bg-white/[0.05]", "hover:bg-surface-2"],
  ["dark:hover:bg-white/[0.05]", "hover:bg-surface-2"],
  ["dark:hover:bg-white/[0.03]", "hover:bg-surface-2"],
  ["hover:bg-gray-100 dark:hover:bg-white/10", "hover:bg-surface-2"],
  ["hover:bg-slate-100 dark:hover:bg-white/10", "hover:bg-surface-2"],
  ["hover:bg-gray-50", "hover:bg-surface-2"],
  ["hover:bg-slate-50", "hover:bg-surface-2"],
  ["hover:bg-gray-100", "hover:bg-surface-2"],
  ["hover:bg-slate-100", "hover:bg-surface-2"],
  ["active:bg-gray-50 dark:active:bg-white/10", "active:bg-surface-2"],
  ["active:bg-gray-100", "active:bg-surface-2"],

  // --- Brand (blue) ---
  ["bg-blue-600", "bg-brand"],
  ["bg-blue-700", "bg-brand-strong"],
  ["bg-blue-500", "bg-brand-soft"],
  ["bg-blue-100 dark:bg-blue-500/10", "bg-brand-muted"],
  ["bg-blue-50 dark:bg-blue-500/10", "bg-brand-muted"],
  ["text-blue-600 dark:text-blue-400", "text-brand"],
  ["text-blue-500", "text-brand"],
  ["text-blue-400", "text-brand-soft"],
  ["border-blue-500", "border-brand"],
  ["border-blue-200 dark:border-blue-500/30", "border-brand-soft"],
  ["border-blue-300 dark:hover:border-blue-500/40", "border-brand-soft"],
  ["hover:border-blue-200 dark:hover:border-blue-400", "hover:border-brand-soft"],
  ["hover:bg-blue-50 dark:hover:bg-blue-500/10", "hover:bg-brand-muted"],
  ["hover:text-blue-600 dark:hover:text-blue-400", "hover:text-brand"],
  ["text-blue-700 dark:text-blue-300", "text-brand"],
  ["text-blue-700 dark:text-brand-soft", "text-brand"],
  ["text-blue-600 dark:text-blue-400", "text-brand"],
  ["text-blue-600", "text-brand"],
  ["text-blue-600/80 dark:text-blue-300/80", "text-brand/80"],
  ["hover:text-blue-700", "hover:text-brand-strong"],
  ["hover:text-blue-600", "hover:text-brand"],
  ["border-blue-600", "border-brand"],
  ["border-blue-300 dark:border-blue-500/30", "border-brand-soft"],
  ["bg-blue-600/10 dark:bg-blue-500/20", "bg-brand-muted"],
  ["ring-blue-100/50 dark:ring-brand/10", "ring-brand-soft/50 dark:ring-brand/10"],
  ["ring-blue-400 dark:ring-blue-500/30", "ring-brand-soft"],
  ["ring-blue-500/30", "ring-brand/30"],
  ["ring-blue-500/10", "ring-brand/10"],
  ["focus:ring-blue-500", "focus:ring-brand"],
  ["disabled:bg-blue-400", "disabled:bg-brand-soft"],
  ["shadow-blue-900/10", "shadow-brand/10"],
  ["shadow-blue-600/30", "shadow-brand/30"],
  ["shadow-blue-600/25", "shadow-brand/25"],
  ["shadow-blue-500/30", "shadow-brand/30"],
  ["shadow-blue-500/25", "shadow-brand/25"],
  ["focus:border-blue-500", "focus:border-brand"],
  ["focus:ring-blue-400/20", "focus:ring-brand/20"],
  ["focus:ring-blue-500/20", "focus:ring-brand/20"],
  ["ring-blue-500/20", "ring-brand/20"],
  ["shadow-blue-500/5", "shadow-brand/10"],
  ["shadow-blue-600/20", "shadow-brand/25"],
  ["text-blue-700 dark:text-blue-400", "text-brand"],

  // --- Success (green) ---
  ["text-green-600 dark:text-green-400", "text-success"],
  ["text-green-500", "text-success"],
  ["text-green-400", "text-success"],
  ["text-green-700 dark:text-green-400", "text-success"],
  ["text-green-600 dark:text-success", "text-success"],
  ["text-green-600 dark:text-green-400", "text-success"],
  ["text-green-600", "text-success"],
  ["text-green-600/80 dark:text-green-300/80", "text-success/80"],
  ["hover:text-green-600", "hover:text-success"],
  ["bg-green-50 dark:bg-green-500/10", "bg-success-muted"],
  ["bg-green-100 dark:bg-green-500/10", "bg-success-muted"],
  ["hover:bg-green-50 dark:hover:bg-green-500/10", "hover:bg-success-muted"],
  ["border-green-200 dark:border-green-500/30", "border-success"],
  ["text-emerald-600 dark:text-emerald-400", "text-success"],
  ["bg-emerald-50 dark:bg-emerald-500/10", "bg-success-muted"],

  // --- Warning (amber) ---
  ["text-amber-700 dark:text-amber-400", "text-warning"],
  ["text-amber-600 dark:text-amber-400", "text-warning"],
  ["text-amber-500 dark:text-amber-400", "text-accent"],
  ["bg-amber-50 dark:bg-amber-500/10", "bg-warning-muted"],
  ["bg-amber-100 dark:bg-amber-500/10", "bg-warning-muted"],
  ["hover:bg-amber-50 dark:hover:bg-amber-500/10", "hover:bg-warning-muted"],
  ["border-amber-200 dark:border-amber-500/20", "border-warning"],
  ["bg-amber-500", "bg-warning"],
  ["bg-amber-400", "bg-warning"],

  // --- Danger (red) ---
  ["text-red-500 dark:text-red-400", "text-danger"],
  ["text-red-600 dark:text-red-400", "text-danger"],
  ["text-red-600 dark:text-red-500", "text-danger"],
  ["text-red-700 dark:text-red-400", "text-danger"],
  ["text-red-400", "text-danger"],
  ["text-red-500 hover:text-red-600", "text-danger hover:text-danger-700"],
  ["text-red-600", "text-danger"],
  ["hover:text-red-600", "hover:text-danger"],
  ["bg-red-600/10 hover:bg-red-600/20", "bg-danger/10 hover:bg-danger/20"],
  ["bg-red-50 dark:bg-red-500/10", "bg-danger-muted"],
  ["bg-red-100 dark:bg-red-500/10", "bg-danger-muted"],
  ["hover:bg-red-50 dark:hover:bg-red-500/10", "hover:bg-danger-muted"],
  ["hover:text-red-500 dark:hover:text-red-400", "hover:text-danger"],
  ["border-red-200 dark:border-red-500/30", "border-danger"],
  ["bg-red-500", "bg-danger"],
  ["bg-red-600", "bg-danger"],
  ["border-red-400", "border-danger"],

  // --- Chart categoricals (used for data-viz fills/bars/dots) ---
  ["bg-purple-500", "bg-chart-4"],
  ["text-purple-500", "text-chart-4"],
  ["bg-violet-500", "bg-chart-4"],
  ["text-violet-500", "text-chart-4"],
  ["bg-emerald-500", "bg-chart-3"],
  ["text-emerald-500", "text-chart-3"],
  ["bg-pink-500", "bg-chart-5"],
  ["text-pink-500", "text-chart-5"],
  ["bg-cyan-500", "bg-chart-6"],
  ["text-cyan-500", "text-chart-6"],
  ["bg-orange-500", "bg-chart-2"],
  ["text-orange-500", "text-chart-2"],

  // --- Misc cleanups ---
  ["bg-slate-50", "bg-surface-2"],
  ["bg-slate-100", "bg-surface-2"],
  ["bg-gray-50", "bg-surface-2"],
  ["bg-gray-100", "bg-surface-2"],
  ["bg-slate-200 dark:bg-white/10", "bg-surface-2"],
  ["border-white/5", "border-border-subtle"],
  ["border-gray-200", "border-border-subtle"],
  ["border-slate-200", "border-border-subtle"],
  ["border-slate-300 dark:border-white/10", "border-border-strong"],
  ["border-gray-300 dark:border-white/20", "border-border-strong"],
  ["divide-slate-100 dark:divide-white/10", "divide-border-subtle"],
  ["divide-gray-100 dark:divide-white/10", "divide-border-subtle"],
  ["shadow-lg shadow-blue-500/5", "shadow-pop shadow-brand/10"],
  ["bg-white", "bg-surface-1"],

  // --- Neutrals: remaining gray text (light+dark pairs and standalone) ---
  ["text-gray-900 dark:text-white", "text-text-primary"],
  ["text-gray-900 dark:text-gray-100", "text-text-primary"],
  ["text-gray-900 dark:text-gray-200", "text-text-primary"],
  ["text-gray-800 dark:text-white", "text-text-primary"],
  ["text-gray-800 dark:text-gray-100", "text-text-primary"],
  ["text-gray-800 dark:text-gray-200", "text-text-primary"],
  ["text-gray-700 dark:text-gray-200", "text-text-body"],
  ["text-gray-700 dark:text-gray-300", "text-text-body"],
  ["text-gray-600 dark:text-gray-300", "text-text-body"],
  ["text-gray-600 dark:text-gray-400", "text-text-body"],
  ["text-gray-500 dark:text-gray-400", "text-text-muted"],
  ["text-gray-400 dark:text-gray-500", "text-text-faint"],
  ["text-gray-900", "text-text-primary"],
  ["text-gray-800", "text-text-primary"],
  ["text-gray-700", "text-text-body"],
  ["text-gray-600", "text-text-body"],
  ["text-gray-500", "text-text-muted"],
  ["text-gray-400", "text-text-faint"],
  ["text-gray-300 dark:text-gray-500", "text-text-faint"],
  ["text-gray-300", "text-text-faint"],
  ["text-slate-800 dark:text-white", "text-text-primary"],
  ["text-slate-800 dark:text-slate-200", "text-text-primary"],
  ["text-slate-700 dark:text-slate-300", "text-text-body"],
  ["text-slate-600 dark:text-slate-300", "text-text-body"],
  ["text-slate-500 dark:text-slate-400", "text-text-muted"],
  ["text-slate-300 dark:text-slate-600", "text-text-faint"],
  ["text-slate-800", "text-text-primary"],
  ["text-slate-700", "text-text-body"],
  ["text-slate-600", "text-text-body"],
  ["text-slate-500", "text-text-muted"],
  ["text-slate-300", "text-text-faint"],
  ["placeholder:text-gray-400 dark:placeholder:text-slate-500", "placeholder:text-text-faint"],
  ["placeholder:text-gray-300 dark:placeholder:text-slate-600", "placeholder:text-text-faint"],
  ["placeholder:text-slate-400", "placeholder:text-text-faint"],
  ["placeholder:text-gray-300", "placeholder:text-text-faint"],

  // --- Neutrals: remaining gray/slate surfaces & borders ---
  ["bg-gray-50 dark:bg-white/[0.05]", "bg-surface-2"],
  ["bg-gray-100 dark:bg-white/[0.05]", "bg-surface-2"],
  ["bg-gray-200 dark:bg-white/[0.05]", "bg-surface-2"],
  ["bg-gray-50", "bg-surface-2"],
  ["bg-gray-100", "bg-surface-2"],
  ["bg-gray-200", "bg-surface-2"],
  ["bg-gray-300", "bg-surface-3"],
  ["bg-slate-300", "bg-surface-3"],
  ["border-gray-50", "border-border-subtle"],
  ["border-gray-100", "border-border-subtle"],
  ["border-gray-200", "border-border-subtle"],
  ["border-gray-300", "border-border-strong"],
  ["border-slate-100", "border-border-subtle"],
  ["border-slate-300", "border-border-strong"],
  ["divide-gray-100", "divide-border-subtle"],
  ["divide-gray-50", "divide-border-subtle"],
  ["hover:bg-gray-200", "hover:bg-surface-2"],
  ["hover:bg-gray-300", "hover:bg-surface-3"],
  ["hover:border-gray-300", "hover:border-border-strong"],
  ["hover:text-gray-600", "hover:text-text-body"],
  ["hover:text-gray-700", "hover:text-text-body"],
  ["hover:text-gray-800", "hover:text-text-primary"],
  ["hover:text-slate-300", "hover:text-text-body"],
  ["hover:text-slate-600", "hover:text-text-body"],
  ["hover:text-slate-700", "hover:text-text-body"],

  // --- Brand: remaining blue (muted fills, soft borders, strong text) ---
  ["bg-blue-50 dark:bg-blue-500/10", "bg-brand-muted"],
  ["bg-blue-100 dark:bg-blue-500/10", "bg-brand-muted"],
  ["bg-blue-50", "bg-brand-muted"],
  ["bg-blue-100", "bg-brand-muted"],
  ["hover:bg-blue-50", "hover:bg-brand-muted"],
  ["hover:bg-blue-100", "hover:bg-brand-muted"],
  ["text-blue-700", "text-brand"],
  ["text-blue-800", "text-brand-strong"],
  ["hover:text-blue-800", "hover:text-brand-strong"],
  ["text-blue-200 dark:text-blue-100", "text-brand-soft"],
  ["border-blue-200", "border-brand-soft"],
  ["border-blue-300", "border-brand-soft"],
  ["border-blue-400", "border-brand"],
  ["border-blue-50", "border-brand-muted"],
  ["hover:border-blue-200", "hover:border-brand-soft"],
  ["hover:border-blue-300", "hover:border-brand-soft"],
  ["hover:border-blue-400", "hover:border-brand"],
  ["dark:border-blue-400", "border-brand"],
  ["dark:bg-blue-400", "bg-brand-soft"],
  ["dark:hover:text-blue-100", "hover:text-brand-soft"],

  // --- Success: remaining green (fills, borders, dark-mode text) ---
  ["bg-green-50 dark:bg-green-500/10", "bg-success-muted"],
  ["bg-green-100 dark:bg-green-500/10", "bg-success-muted"],
  ["bg-green-50", "bg-success-muted"],
  ["bg-green-100", "bg-success-muted"],
  ["hover:bg-green-50", "hover:bg-success-muted"],
  ["hover:bg-green-100", "hover:bg-success-muted"],
  ["text-green-700 dark:text-success", "text-success"],
  ["text-green-700", "text-success"],
  ["text-green-800", "text-success-700"],
  ["text-green-300 dark:text-green-300", "text-success"],
  ["dark:text-green-300", "text-success"],
  ["border-green-200", "border-success"],
  ["border-green-300", "border-success"],
  ["hover:border-green-300", "hover:border-success"],

  // --- Warning / accent: remaining amber + yellow ---
  ["text-amber-700 dark:text-amber-400", "text-warning"],
  ["text-amber-800", "text-warning-700"],
  ["text-amber-600 dark:text-amber-400", "text-warning"],
  ["text-amber-600", "text-warning"],
  ["text-amber-500 dark:text-amber-400", "text-accent"],
  ["text-amber-500", "text-accent"],
  ["text-amber-400 dark:text-amber-400", "text-accent-300"],
  ["text-amber-400", "text-accent-300"],
  ["text-amber-300 dark:text-amber-300", "text-accent-300"],
  ["dark:text-amber-300", "text-accent-300"],
  ["bg-amber-50 dark:bg-amber-500/10", "bg-warning-muted"],
  ["bg-amber-100 dark:bg-amber-500/10", "bg-warning-muted"],
  ["bg-amber-50", "bg-warning-muted"],
  ["bg-amber-100", "bg-warning-muted"],
  ["border-amber-200", "border-warning"],
  ["border-amber-300", "border-warning"],
  ["bg-yellow-50 dark:bg-yellow-500/10", "bg-warning-muted"],
  ["bg-yellow-100 dark:bg-yellow-500/10", "bg-warning-muted"],
  ["bg-yellow-50", "bg-warning-muted"],
  ["bg-yellow-100", "bg-warning-muted"],
  ["text-yellow-400 dark:text-yellow-400", "text-warning"],
  ["text-yellow-500 dark:text-yellow-500", "text-warning"],
  ["text-yellow-600 dark:text-yellow-500", "text-warning"],
  ["text-yellow-700 dark:text-yellow-400", "text-warning"],
  ["text-yellow-500", "text-warning"],
  ["text-yellow-600", "text-warning"],
  ["text-yellow-700", "text-warning"],
  ["border-yellow-200", "border-warning"],

  // --- Danger: remaining red (fills, borders, dark-mode text) ---
  ["bg-red-50 dark:bg-red-500/10", "bg-danger-muted"],
  ["bg-red-100 dark:bg-red-500/10", "bg-danger-muted"],
  ["bg-red-50", "bg-danger-muted"],
  ["bg-red-100", "bg-danger-muted"],
  ["hover:bg-red-50", "hover:bg-danger-muted"],
  ["hover:bg-red-100", "hover:bg-danger-muted"],
  ["text-red-500 dark:text-red-400", "text-danger"],
  ["text-red-700 dark:text-red-400", "text-danger"],
  ["text-red-700", "text-danger"],
  ["text-red-800", "text-danger-700"],
  ["text-red-300 dark:text-red-300", "text-danger"],
  ["dark:text-red-300", "text-danger"],
  ["border-red-200", "border-danger"],
  ["border-red-300", "border-danger"],
  ["hover:border-red-200", "hover:border-danger"],
  ["hover:border-red-300", "hover:border-danger"],
  ["hover:text-red-500", "hover:text-danger"],
  ["hover:text-red-300", "hover:text-danger"],
  ["dark:hover:text-red-300", "hover:text-danger"],

  // --- Chart categoricals: remaining purple/violet/pink/cyan/orange ---
  ["text-purple-600 dark:text-purple-400", "text-chart-4"],
  ["text-purple-400 dark:text-purple-400", "text-chart-4"],
  ["text-purple-600", "text-chart-4"],
  ["text-purple-400", "text-chart-4"],
  ["bg-purple-50", "bg-chart-4/10"],
  ["bg-purple-100", "bg-chart-4/10"],
  ["hover:bg-purple-100", "hover:bg-chart-4/10"],
  ["border-purple-200", "border-chart-4/40"],
  ["hover:border-purple-200", "hover:border-chart-4/40"],
  ["dark:text-purple-400", "text-chart-4"],
  ["text-cyan-600 dark:text-cyan-400", "text-chart-6"],
  ["text-cyan-600", "text-chart-6"],
  ["text-cyan-400", "text-chart-6"],
  ["bg-cyan-50", "bg-chart-6/10"],
  ["border-cyan-200", "border-chart-6/40"],
  ["dark:text-cyan-400", "text-chart-6"],
  ["text-orange-600 dark:text-orange-400", "text-chart-2"],
  ["text-orange-600", "text-chart-2"],
  ["text-orange-700", "text-chart-2"],
  ["bg-orange-100", "bg-chart-2/10"],
  ["bg-orange-50", "bg-chart-2/10"],
  ["dark:text-orange-400", "text-chart-2"],

  // --- Idempotent cleanup: repair output the old sequential pass corrupted.
  // Generic rules (e.g. text-blue-400) fired inside compounds, leaving e.g.
  // "text-blue-700 dark:text-brand-soft" and doubled hover backgrounds. These
  // strings can also appear as literal source today, so keep them safe.
  ["text-blue-700 dark:text-brand-soft", "text-brand"],
  ["text-green-700 dark:text-success", "text-success"],
  ["hover:text-blue-600 dark:hover:text-brand-soft", "hover:text-brand"],
  ["hover:text-green-600 dark:hover:text-success", "hover:text-success"],
  ["hover:bg-surface-2 hover:bg-surface-2", "hover:bg-surface-2"],
  ["active:bg-surface-2 active:bg-surface-2", "active:bg-surface-2"],

  // --- Second pass: remaining raw palette classes (guardrail-driven) ---
  // Tokens are fully dark-adaptive, so a translucent `dark:` half following a
  // token twin is redundant and collapses to the token alone.

  // Redundant translucent dark: halves of token twins (collapse)
  ["bg-brand-muted dark:bg-blue-500/15", "bg-brand-muted"],
  ["border-brand-soft dark:border-blue-500/30", "border-brand-soft"],
  ["hover:border-brand-soft dark:hover:border-blue-500/30", "hover:border-brand-soft"],
  ["hover:border-brand-soft dark:hover:border-blue-500/50", "hover:border-brand-soft"],
  ["hover:border-danger dark:hover:border-red-500/30", "hover:border-danger"],
  ["hover:text-danger dark:hover:text-danger", "hover:text-danger"],
  ["text-text-body dark:text-slate-400", "text-text-body"],
  ["text-text-body dark:text-gray-100", "text-text-body"],
  ["text-text-body dark:text-slate-200", "text-text-body"],
  ["text-text-primary dark:text-slate-100", "text-text-primary"],
  ["bg-surface-3 dark:bg-slate-600", "bg-surface-3"],
  ["bg-surface-2 text-text-body dark:bg-gray-700 dark:text-text-faint", "bg-surface-2 text-text-body"],
  ["text-text-muted hover:text-text-body dark:hover:text-gray-200", "text-text-muted hover:text-text-body"],
  ["hover:text-slate-900 dark:hover:text-white", "hover:text-text-primary"],
  ["bg-success-muted dark:bg-green-500/20", "bg-success-muted"],
  ["bg-warning-muted dark:bg-yellow-500/20", "bg-warning-muted"],
  ["bg-warning-muted text-amber-700 dark:bg-amber-500/20 dark:text-accent-300", "bg-warning-muted text-accent-300"],
  ["border-warning dark:border-yellow-500/20", "border-warning"],
  ["border-warning dark:border-amber-500/30", "border-warning"],
  ["border-success dark:border-green-500/30", "border-success"],
  ["border-danger dark:border-red-500/30", "border-danger"],
  ["border-danger dark:border-red-500/20", "border-danger"],
  ["text-warning dark:text-yellow-400", "text-warning"],
  ["border-border-strong dark:border-slate-600", "border-border-strong"],
  ["text-red-500 dark:text-red-400/70", "text-danger"],
  ["border-brand bg-blue-50/50 dark:bg-blue-500/10", "border-brand bg-brand-muted"],
  ["bg-gray-50/50 dark:bg-white/[0.03]", "bg-surface-2"],
  ["border-chart-4/40 dark:border-purple-500/20", "border-chart-4/40"],
  ["border-chart-6/40 dark:border-cyan-500/20", "border-chart-6/40"],
  ["bg-chart-4/10 dark:bg-purple-500/10", "bg-chart-4/10"],
  ["bg-chart-4/10 dark:bg-purple-500/5", "bg-chart-4/10"],
  ["bg-chart-6/10 dark:bg-cyan-500/10", "bg-chart-6/10"],
  ["hover:bg-chart-4/10 dark:hover:bg-purple-500/10", "hover:bg-chart-4/10"],
  ["text-emerald-600 font-semibold text-xs bg-success-muted dark:text-emerald-400", "text-success font-semibold text-xs bg-success-muted"],

  // Double-artifact leftovers from the old sequential pass (raw + token twin)
  ["hover:text-blue-900 hover:text-brand-soft", "hover:text-brand-soft"],
  ["text-amber-700 text-accent-300", "text-accent-300"],

  // Standalone chrome → semantic tokens
  ["text-red-500", "text-danger"],
  ["text-slate-400", "text-text-faint"],
  ["text-amber-700", "text-accent-300"],
  ["focus:ring-red-400/20", "focus:ring-danger/20"],
  ["focus:border-blue-500/50", "focus:border-brand/50"],
  ["hover:bg-red-500/10", "hover:bg-danger/10"],
  ["bg-red-500/10 border border-red-500/20", "bg-danger-muted border border-danger"],
  ["hover:bg-red-700", "hover:bg-danger-700"],
  ["placeholder-gray-400", "placeholder-text-faint"],
  ["disabled:bg-red-300 dark:disabled:bg-red-800", "disabled:bg-danger/40"],
  ["shadow-amber-500/20", "shadow-accent-500/20"],
  ["shadow-amber-600/25", "shadow-accent-600/25"],

  // Solid green (success) buttons — text-white becomes the dark-adaptive
  // success-contrast so buttons stay readable in both themes.
  ["bg-green-600 hover:bg-green-500 text-white", "bg-success hover:bg-success-500 text-success-contrast"],
  ["bg-green-600 text-white", "bg-success text-success-contrast"],
  ["hover:bg-green-600 hover:text-white", "hover:bg-success-600 hover:text-success-contrast"],
  ["hover:bg-green-700", "hover:bg-success-700"],
  ["hover:bg-green-500", "hover:bg-success-500"],
  ["hover:bg-green-600", "hover:bg-success-600"],
  ["bg-green-500 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-green-600", "bg-success text-success-contrast text-sm px-5 py-2.5 rounded-xl hover:bg-success-600"],

  // Solid red (danger) buttons — same treatment as success: bg-danger is
  // dark-adaptive (light-red #f87171 in dark), so text must be the dark-adaptive
  // danger-contrast, never text-white. No `danger-strong` token exists — use
  // bg-danger / hover:bg-danger-500.
  ["bg-red-600 hover:bg-red-500 text-white", "bg-danger hover:bg-danger-500 text-danger-contrast"],
  ["bg-red-600 text-white", "bg-danger text-danger-contrast"],
  ["hover:bg-red-500", "hover:bg-danger-500"],
  ["bg-red-600", "bg-danger"],

  // ProPanel tier-card borders → chart categoricals (data-viz identity)
  ["border-purple-100/60 hover:border-chart-4/40", "border-chart-4/30 hover:border-chart-4/40"],
  ["border-blue-100/60 hover:border-brand-soft", "border-chart-1/30 hover:border-brand-soft"],
  ["border-emerald-100/60 hover:border-emerald-200", "border-chart-3/30 hover:border-chart-3/60"],
  ["border-rose-100/60 hover:border-rose-200", "border-chart-5/30 hover:border-chart-5/60"],

  // Non-adjacent dark: halves (dark half not directly after its token twin —
  // e.g. "text-brand dark:bg-blue-500/15 dark:border-blue-500/30"). Tokens are
  // dark-adaptive, so these raw dark halves are redundant; drop them.
  [" dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-300", ""],

  // Dark: overrides stacked on top of dark-adaptive tokens — collapse to the
  // token alone. text-text-body + dark:text-text-faint appears 13x (9 files).
  // The adjacent form collapses above; the non-adjacent remainder (the two
  // unselected-chip lines) is dropped standalone — base is always text-text-body.
  ["text-text-body dark:text-text-faint", "text-text-body"],
  ["dark:text-text-faint ", ""],
  ["text-brand dark:text-brand-soft", "text-brand"],
  ["text-success dark:text-success", "text-success"],
  ["bg-success-muted text-success dark:bg-green-500/20 dark:text-success", "bg-success-muted text-success"],
  ["bg-danger-muted text-danger dark:bg-red-500/20 dark:text-danger", "bg-danger-muted text-danger"],

  // More translucent dark: halves stacked on token twins (banner-swatch
  // allowlist in check-colors.mjs hides these — they are NOT banner art, just
  // redundant dark twins of muted tokens). Collapse to the token alone.
  ["bg-brand-muted dark:bg-blue-500/20", "bg-brand-muted"],
  ["bg-danger-muted dark:bg-red-500/20", "bg-danger-muted"],
  ["hover:bg-brand-muted dark:hover:bg-blue-500/20", "hover:bg-brand-muted"],
  ["hover:bg-danger-muted dark:hover:bg-red-500/20", "hover:bg-danger-muted"],
  ["hover:bg-success-muted dark:hover:bg-green-500/20", "hover:bg-success-muted"],
  ["text-warning bg-warning-muted dark:bg-amber-500/20", "text-warning bg-warning-muted"],
  ["text-danger bg-danger-muted dark:bg-red-500/20", "text-danger bg-danger-muted"],
  ["text-chart-2 bg-chart-2/10 dark:bg-orange-500/20", "text-chart-2 bg-chart-2/10"],
  ["text-brand bg-brand-muted dark:bg-blue-500/20", "text-brand bg-brand-muted"],
  ["bg-chart-2/10 text-chart-2 dark:bg-orange-500/20", "bg-chart-2/10 text-chart-2"],
  ["bg-brand-muted text-brand dark:bg-blue-500/20 dark:text-blue-300", "bg-brand-muted text-brand"],
  ["bg-danger-muted dark:bg-red-500/20 text-danger", "bg-danger-muted text-danger"],
];

/** Marketing/public file exclusions (relative to repo root). */
function isExcluded(file) {
  const rel = relative(ROOT, file).replaceAll("\\", "/");
  return EXCLUDE.some((ex) => rel === ex || rel.startsWith(ex));
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (["node_modules", "dist"].includes(name)) continue;
      out.push(...walk(full));
    } else if (EXTENSIONS.has(name.slice(name.lastIndexOf("."))) && !isExcluded(full)) {
      out.push(full);
    }
  }
  return out;
}

/* Single-pass longest-match replacement. Sorting by length descending and
 * matching via one alternation guarantees the most specific (longest) rule
 * wins at every position — fixing ordering bugs where generic rules like
 * `text-blue-400` would otherwise fire inside compounds like
 * `text-blue-700 dark:text-blue-400`. */
const COMBINED = RULES.map(([old]) =>
  old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
).sort((a, b) => b.length - a.length);
const LOOKUP = new Map(RULES.map(([old, next]) => [old, next]));
/* (?![\\d/]) guards against shade prefix collisions (bg-slate-50 vs
 * bg-slate-500) and opacity modifiers (bg-white vs bg-white/15). */
const REPLACE_RE = new RegExp(`(${COMBINED.join("|")})(?![\\d/])`, "g");

let changed = 0;
const leftovers = [];

for (const file of walk(SRC)) {
  const original = readFileSync(file, "utf8");
  const content = original.replace(REPLACE_RE, (m) => LOOKUP.get(m) ?? m);
  if (content !== original) {
    changed++;
    if (CHECK) {
      console.log(`[migrate] would change: ${relative(ROOT, file)}`);
    } else {
      writeFileSync(file, content);
    }
  }

  /* Detect leftover literal hex / arbitrary dark bg values not covered above. */
  const rel = relative(ROOT, file).replaceAll("\\", "/");
  const hexes = content.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const arbs = content.match(/dark:bg-\[[^\]]+\]/g) || [];
  const darkArbs = content.match(/dark:(?:bg|text|border)-\[[^\]]+\]/g) || [];
  const leftoversHere = [...new Set([...hexes, ...arbs, ...darkArbs])];
  if (leftoversHere.length) {
    leftovers.push({ rel, hexes: [...new Set(hexes)], arbs: [...new Set([...arbs, ...darkArbs])] });
  }
}

console.log(`\nFiles ${CHECK ? "that would be" : ""} modified: ${changed}`);

if (leftovers.length) {
  console.log(`\nFiles with leftover hex/arbitrary colors (review manually): ${leftovers.length}`);
  for (const l of leftovers) {
    const hexStr = l.hexes.length ? `hex[${l.hexes.slice(0, 6).join(", ")}]` : "";
    const arbStr = l.arbs.length ? `arb[${l.arbs.slice(0, 6).join(", ")}]` : "";
    console.log(`  ${l.rel} ${hexStr} ${arbStr}`);
  }
} else {
  console.log("No leftover literal colors in migrated files. ");
}

if (CHECK) {
  console.log("\nDry run only — nothing written. Re-run without --check to apply.");
}
