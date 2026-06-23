const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-DzEKqe-5.js', 'utf-8');

// Find lN (SupabaseAuthClient) class
let idx = 0;
while ((idx = c.indexOf('class extends', idx)) >= 0) {
  const ctx = c.slice(Math.max(0, idx - 30), idx + 60);
  console.log('class extends at', idx, ':', ctx);
  idx++;
}

// Find PN (extends lN)
const pnIdx = c.indexOf('PN=');
if (pnIdx >= 0) {
  console.log('\nPN=:', c.slice(pnIdx, pnIdx + 60));
}

// Find lN
// It might be defined as var lN = class extends GoTrueClient
const lnIdx = c.indexOf('lN=');
if (lnIdx >= 0) {
  console.log('\nlN=:', c.slice(lnIdx, lnIdx + 200));
}
