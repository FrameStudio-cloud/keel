const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-wI2ugOFt.js', 'utf-8');

// Find the full _initSupabaseAuthClient method
const idx = 467773;
const methodBody = c.slice(idx, idx + 1000);
console.log(methodBody);
