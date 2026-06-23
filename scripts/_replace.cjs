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

const files = walk("src");
const replacements = [
  [/bg-\[#1a1a2e\]/g, "bg-[var(--bg-page)]"],
  [/bg-\[#16213e\]/g, "bg-[var(--bg-card)]"],
  [/border-white\/10/g, "border-[var(--border)]"],
  [/hover:bg-white\/5/g, "hover:bg-[var(--hover)]"],
  [/hover:bg-white\/10/g, "hover:bg-[var(--hover)]"],
  [/text-slate-600(?![\w/-])/g, "text-[var(--text-muted)]"],
  [/text-slate-500(?![\w/-])/g, "text-[var(--text-muted)]"],
  [/text-slate-400(?![\w/-])/g, "text-[var(--text-secondary)]"],
  [/text-slate-300(?![\w/-])/g, "text-[var(--text-primary)]"],
  [/placeholder-slate-600(?![\w/-])/g, "placeholder-[var(--text-muted)]"],
];
let count = 0;
for (const f of files) {
  let c = fs.readFileSync(f, "utf8");
  const before = c;
  for (const [re, replacement] of replacements) {
    c = c.replace(re, replacement);
  }
  if (c !== before) {
    fs.writeFileSync(f, c, "utf8");
    count++;
    console.log("  " + path.relative("", f));
  }
}
console.log("Updated " + count + " files");
