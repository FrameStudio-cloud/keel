#!/usr/bin/env node
/**
 * Scans the Keel codebase and generates a UI inventory manifest
 * (routes + modals) consumed by the Figma inventory plugin.
 *
 * Usage:  node scripts/figma-ui-inventory.mjs
 * Output: figma-plugin/data.js  (bundled into the plugin)
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const OUT = join(ROOT, "figma-plugin", "code.js");
const SRC = join(ROOT, "figma-plugin", "plugin.js");
const DATA_REF = join(ROOT, "figma-plugin", "data.js");

const appJsx = readFileSync(join(ROOT, "src", "App.jsx"), "utf8");

// ---- 1. Component -> file map from lazy() imports ----
const lazyMap = {};
for (const m of appJsx.matchAll(/const (\w+) = lazy\(\(\) => import\("\.\/pages\/([\w/]+)"\)\);/g)) {
  lazyMap[m[1]] = `src/pages/${m[2]}.jsx`;
}

// ---- 2. Routes ----
const routes = [];
for (const m of appJsx.matchAll(/<Route\s+path="([^"]+)"\s+element=\{([^}]*)\}/g)) {
  const path = m[1];
  const expr = m[2];
  const tags = [...expr.matchAll(/<(\w+)[\s/>]/g)].map((t) => t[1]);
  // The real page is the innermost wrapper child that has a lazy() import; fall back to the last tag.
  const comp = tags.findLast((t) => lazyMap[t]) || tags[tags.length - 1];
  routes.push({
    path,
    component: comp,
    file: lazyMap[comp] || null,
    guard: expr.includes("ProtectedRoute")
      ? "protected"
      : expr.includes("PublicRoute")
      ? "public"
      : "open",
    modals: [],
  });
}

// ---- 3. Modals ----
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".jsx")) out.push(full);
  }
  return out;
}

const allFiles = walk(join(ROOT, "src"));
const modalFiles = allFiles.filter((f) => {
  try {
    return readFileSync(f, "utf8").includes('role="dialog"');
  } catch {
    return false;
  }
});

const modals = modalFiles.map((f) => {
  const rel = f.replace(ROOT, "").replace(/\\/g, "/").replace(/^\/+/, "");
  const name = rel.split("/").pop().replace(".jsx", "");
  const src = readFileSync(f, "utf8");
  return {
    name,
    file: rel,
    description: (src.match(/aria-label="([^"]{3,90})"/) || [])[1] || null,
  };
});

// ---- 4. Map modals to the routes/pages that use them ----
for (const modal of modals) {
  for (const route of routes) {
    if (!route.file) continue;
    const pageFile = join(ROOT, route.file);
    if (!existsSync(pageFile)) continue;
    const pageSrc = readFileSync(pageFile, "utf8");
    if (pageSrc.includes(modal.name) || pageSrc.includes(modal.name.replace(/Modal$/, ""))) {
      route.modals.push(modal.name);
    }
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  app: "Keel",
  version: readJson(join(ROOT, "package.json")).version,
  routes: routes.filter((r) => r.component !== "Navigate"),
  modals,
};

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

writeFileSync(
  OUT,
  readFileSync(SRC, "utf8").replace("/*__DATA__*/ null", JSON.stringify(manifest, null, 2)) + "\n"
);

console.log(`Wrote ${OUT}`);
console.log(`  routes: ${manifest.routes.length}`);
console.log(`  modals: ${manifest.modals.length}`);
