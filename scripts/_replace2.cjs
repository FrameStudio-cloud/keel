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

const BLUE_PATTERN =
  /(bg-blue-|bg-red-|bg-green-|bg-emerald-|via-blue-|to-blue-|from-blue-).*?text-white/g;
const THEME_PATTERN = /text-white/g;

let count = 0;
let blueCount = 0;

for (const f of files) {
  let c = fs.readFileSync(f, "utf8");
  let result = "";
  let lastIndex = 0;

  // Find all text-white matches and their context
  const matches = [...c.matchAll(THEME_PATTERN)];
  if (matches.length === 0) continue;

  // Check each text-white: if preceded within 80 chars by a blue/red/green bg, keep it
  const safe = [];
  for (const m of matches) {
    const idx = m.index;
    const before = c.slice(Math.max(0, idx - 100), idx);
    const lineStart = c.lastIndexOf("\n", idx);
    const lineEnd = c.indexOf("\n", idx);
    const line = c.slice(lineStart + 1, lineEnd > 0 ? lineEnd : undefined);

    if (
      /bg-(blue|red|green|emerald)-\d/.test(before) ||
      /(via|to|from)-(blue|red|green|emerald)-\d/.test(before)
    ) {
      blueCount++;
      safe.push(idx);
    }
  }

  // Do replacement skipping safe matches
  let modified = c;
  let replaced = false;
  for (const m of matches) {
    if (safe.includes(m.index)) continue;
    // check if this is on a line with colored bg
    const lineStart2 = c.lastIndexOf("\n", m.index);
    const lineEnd2 = c.indexOf("\n", m.index);
    const line2 = c.slice(lineStart2 + 1, lineEnd2 > 0 ? lineEnd2 : undefined);
    if (/(bg|via|to|from)-(blue|red|green|emerald)-\d/.test(line2)) {
      blueCount++;
      continue;
    }
    // Also skip text-white after hover:bg-blue-
    const before200 = c.slice(Math.max(0, m.index - 200), m.index);
    if (/(hover:bg-(blue|red|green|emerald)-\d)/.test(before200)) {
      blueCount++;
      continue;
    }

    modified =
      modified.slice(0, m.index) +
      "text-[var(--text-primary)]" +
      modified.slice(m.index + "text-white".length);
    replaced = true;
    count++;
  }

  if (replaced) {
    fs.writeFileSync(f, modified, "utf8");
    console.log("  " + path.relative("", f));
  }
}

console.log(`Replaced ${count} text-white → variable (kept ${blueCount} on color backgrounds)`);
