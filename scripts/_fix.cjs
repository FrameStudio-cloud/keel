const fs = require("fs");

const files = [
  "src/components/ReceiptModal.jsx",
  "src/components/StockAdjustModal.jsx",
  "src/components/website/BannersTab.jsx",
  "src/components/website/BusinessTab.jsx",
  "src/components/website/ListingsTab.jsx",
  "src/pages/Settings.jsx",
];

// The corruption happened when text-white replacement offset-shifted into
// adjacent text. The patterns show parts of words got consumed.
// Reverse patterns:
const fixes = [
  // text-[var(--text-secondary)] hover:text-white was broken to
  // text-[var(--text-setext-[var(--text-primary)]hover:text-white
  [/text-\[var\(--text-setext-\[var\(--text-primary\)\]/g, "text-[var(--text-secondary)]"],

  // ] rounded- → ]text-[var(--text-primary)]rounded-
  // (text-white in "] text-[var(...)]" was replaced at wrong offset)
  [/\]text-\[var\(--text-primary\)\]/g, "]"],

  // Direct word-fragment corruptions
  /setext-\[var\(--text-primary\)\]/g,
  // These appear in different contexts, handle with a separate pass
];

// More precise: remove any leftover `text-[var(--text-primary)]` that was 
// placed inside existing CSS variable references
for (const f of files) {
  let c = fs.readFileSync(f, "utf8");
  const before = c;

  // Pattern 1: `setext-[var(--text-primary)]` inside `text-secondary)]` → fix to `secondary)]`
  c = c.replace(/setext-\[var\(--text-primary\)\]/g, "secondary)]");

  // Pattern 2: `bordtext-[var(--text-primary)]` → fix to `border)]`
  c = c.replace(/bordtext-\[var\(--text-primary\)\]/g, "border)]");

  // Pattern 3: `patext-[var(--text-primary)]` → fix to `page)]`  
  c = c.replace(/patext-\[var\(--text-primary\)\]/g, "page)]");

  // Pattern 4: `text-[var(--text-setext-[var(--text-primary)]` → fix to `text-[var(--text-secondary)]`
  c = c.replace(/text-\[var\(--text-setext-\[var\(--text-primary\)\]/g, "text-[var(--text-secondary)]");

  // Pattern 5: `text-[var(--text-setext-[var(--text-primary)]` → fix
  c = c.replace(/\[var\(--text-setext-/g, "[var(--text-secondary)]");

  // Pattern 6: stray `]text-[var(--text-primary)]` where `]` appeared mid-word
  c = c.replace(/\](text-\[var\(--text-primary\)\])/g, "]");

  // Pattern 7: Merged text values like rounding-xl fragments
  c = c.replace(/\]text-\[var\(--text-primary\)\]-/g, "]-");

  if (c !== before) {
    fs.writeFileSync(f, c, "utf8");
    console.log("  Fixed " + f);
  } else {
    console.log("  No fix needed for " + f);
  }
}

console.log("Done fixing corruptions");
