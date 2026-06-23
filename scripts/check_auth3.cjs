const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-wI2ugOFt.js', 'utf-8');

// Find _initSupabaseAuthClient as a method (with (){ or =>)
let idx = c.indexOf('_initSupabaseAuthClient');
let count = 0;
const results = [];
while (idx >= 0 && count < 5) {
  const ctx = c.slice(idx, idx + 300);
  results.push(`Found at ${idx}: ${ctx}`);
  count++;
  idx = c.indexOf('_initSupabaseAuthClient', idx + 1);
}
results.forEach(r => console.log(r));
