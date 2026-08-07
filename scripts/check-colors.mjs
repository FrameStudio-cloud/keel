#!/usr/bin/env node
/*
 * Keel `check:colors` guardrail.
 *
 * Fails if raw Tailwind palette classes (gray/slate/blue/red/green/... with
 * shade numbers) appear in dashboard files that were migrated to semantic
 * theme tokens (surface/text/border/brand/success/warning/danger/info/chart).
 *
 * Intentional art is allowlisted explicitly below (gradients, social platform
 * colors, banner swatches, glassy preview surfaces, toast variant borders,
 * setup-wizard blobs, always-light storefront mockups). Anything else is a
 * violation — commit-time regression protection for the token migration.
 *
 * Usage:  node scripts/check-colors.mjs        (exit 0 = clean, 1 = violations)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

/* Same file set the codemod excludes (public/marketing/blog + storefront art). */
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
  "src/components/storefront/TemplatePreview.jsx",
  "src/components/storefront/TemplateModal.jsx",
  "src/components/storefront/SectionPicker.jsx",
  "src/components/storefront/StorefrontLanding.jsx",
  "src/components/storefront/OptionCard.jsx",
];

const EXTENSIONS = new Set([".js", ".jsx"]);

/* Intentional-art palette classes. BAD matches a bare class token (e.g.
 * "text-red-500", "dark:bg-blue-500/15"), so each allowlist pattern must
 * match that bare token directly — no trailing `(?:\s|")` context. */
const ALLOWED = [
  /(?:from|via|to)-(?:white|gray|slate|blue|red|green|amber|yellow|orange|purple|violet|pink|cyan|teal|emerald|indigo|rose|fuchsia|lime)-[0-9]+(?:\/[0-9]+)?/, // gradients
  /border-l-(?:pink|gray|blue|green)-[0-9]+(?:\/70)?/, // social platform rail colors (incl. WhatsApp)
  /dark:border-l-gray-100(?:\/70)?/,
  /border-l-gray-300/,
  /bg-(?:purple|green|red|amber|orange|blue|indigo|teal|cyan|pink)-500\/20/, // banner type swatches
  /text-(?:purple|green|red|amber|orange|blue|indigo|teal|cyan|pink)-300/, // swatch text
  /bg-(?:blue|purple|indigo)-500\/(?:10|15|20)/, // setup-wizard blobs
  /bg-gray-900/, // TikTok chip / camera overlay / media thumbnails
  /bg-white\/80/, // glassy preview card
  /dark:bg-white\/\[0\.04\]/, // glassy preview card (dark)
  /border-white\/\[0\.06\]/, // glassy preview card border
  /dark:bg-white\/5/, // pill-on-surface translucent
  /border-white\/10/, // glassy borders
  /hover:border-blue-200\/50/, // glassy preview hover
  /dark:hover:border-blue-200\/50/,
  /text-blue-200/, // tooltip text on brand surface / update-bar link
  /border-b-blue-600/, // tooltip arrow
  /border-t-blue-600/, // tooltip arrow
  /bg-green-500/, // WhatsApp brand / platform art
  /bg-green-400/, // stepper done line / legend dots
  /text-green-300/, // check icon on brand surface
  /bg-blue-400/, // status dots / preview dots
  /bg-purple-600/, // calendar action button
  /hover:bg-purple-700/, // calendar action button hover
  /border-(?:green|red|amber|blue)-500\/20/, // toast variant borders
  /border-2 border-gray-100/, // storefront preview card
  /bg-gray-50/, // storefront preview surface
  /dark:border-gray-800/, // storefront preview dark border
  /dark:bg-gray-900/, // storefront preview dark surface
];

/* Raw palette classes that should NEVER appear (any color, any shade). */
const BAD =
  /(?:focus:|hover:|active:|disabled:|dark:hover:|dark:focus:|dark:|placeholder:|placeholder-)?(?:bg|text|border|border-t|border-b|border-l|border-r|divide|ring|shadow|placeholder|from|to|via)-(?:gray|slate|blue|red|green|amber|yellow|orange|purple|violet|pink|cyan|teal|emerald|indigo|rose|fuchsia|lime)-[0-9]+(?:\/[0-9]+)?/g;

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

const violations = [];

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).replaceAll("\\", "/");
  const content = readFileSync(file, "utf8");
  /* Skip <style> blocks (print catalog CSS, etc.). */
  const stripped = content.replace(/<style>[\s\S]*?<\/style>/g, "");

  for (const [i, raw] of stripped.split(/\r?\n/).entries()) {
    BAD.lastIndex = 0;
    let m;
    while ((m = BAD.exec(raw)) !== null) {
      const full = m[0];
      if (ALLOWED.some((r) => r.test(full))) continue;
      violations.push(`${rel}:${i + 1}: ${full}`);
    }
  }
}

if (violations.length) {
  console.log(`check:colors FAILED — ${violations.length} raw palette class(es) in migrated files:\n`);
  for (const v of [...new Set(violations)]) console.log("  " + v);
  console.log("\nFix by mapping to semantic tokens (see scripts/migrate-theme-tokens.mjs)");
  console.log("or, if intentional art, add it to the ALLOWED list in scripts/check-colors.mjs.");
  process.exit(1);
}

console.log("check:colors OK — no raw palette classes in migrated files.");
