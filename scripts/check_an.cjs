const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-wI2ugOFt.js', 'utf-8');

// Find AN function definition
let idx = 0;
let found = 0;
while ((idx = c.indexOf('AN=', idx)) >= 0 && found < 5) {
  const ctx = c.slice(idx, idx + 300);
  console.log('AN= at', idx, ':', ctx);
  idx++;
  found++;
}

// Also search for it as function AN
const fnAN = c.indexOf('function AN(');
if (fnAN >= 0) {
  console.log('\nfunction AN at', fnAN, ':', c.slice(fnAN, fnAN + 200));
}
