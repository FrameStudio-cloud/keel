const fs = require("fs");
const path = require("path");

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p).forEach((f) => files.push(f));
    else if (entry.isFile() && /\.(jsx|js)$/.test(entry.name)) files.push(p);
  }
  return files;
}

const allReplacements = [
  // Structural colors (old + new)
  [/bg-\[#0f172a\]/g, "bg-[var(--bg-page)]"],
  [/bg-\[#1a1a2e\]/g, "bg-[var(--bg-page)]"],
  [/bg-\[#1e293b\]/g, "bg-[var(--bg-card)]"],
  [/bg-\[#16213e\]/g, "bg-[var(--bg-card)]"],
  [/border-white\/10/g, "border-[var(--border)]"],
  [/hover:bg-white\/5/g, "hover:bg-[var(--hover)]"],
  [/hover:bg-white\/10/g, "hover:bg-[var(--hover)]"],

  // Text colors (non-white)
  [/text-slate-600(?![\w\/-])/g, "text-[var(--text-muted)]"],
  [/text-slate-500(?![\w\/-])/g, "text-[var(--text-muted)]"],
  [/text-slate-400(?![\w\/-])/g, "text-[var(--text-secondary)]"],
  [/text-slate-300(?![\w\/-])/g, "text-[var(--text-primary)]"],
  [/placeholder-slate-600(?![\w\/-])/g, "placeholder-[var(--text-muted)]"],
];

function hasColorBg(line) {
  return /(bg|via|to|from)-(blue|red|green|emerald)-\d/.test(line);
}

let totalFiles = 0;

for (const f of walk("src")) {
  let c = fs.readFileSync(f, "utf8");
  const original = c;

  // Step 1: Apply structural replacements
  for (const [re, replacement] of allReplacements) {
    c = c.replace(re, replacement);
  }

  // Step 2: Handle text-white → var, but skip lines with color backgrounds
  // Process RIGHT-TO-LEFT to avoid index shifting
  const lines = c.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (hasColorBg(line)) continue;

    // Replace all text-white in this line (processing right to left)
    let newLine = line;
    let idx;
    while ((idx = newLine.lastIndexOf("text-white")) !== -1) {
      // Check context: if preceded by a color-bg ref within last 100 chars
      const before = newLine.slice(Math.max(0, idx - 100), idx);
      if (hasColorBg(before)) {
        // Keep as text-white, break (no more to the left)
        break;
      }
      newLine =
        newLine.slice(0, idx) +
        "text-[var(--text-primary)]" +
        newLine.slice(idx + "text-white".length);
    }
    lines[i] = newLine;
  }
  c = lines.join("\n");

  if (c !== original) {
    fs.writeFileSync(f, c, "utf8");
    totalFiles++;
    console.log("  " + path.relative("", f));
  }
}

console.log("Updated " + totalFiles + " files");
