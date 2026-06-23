const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-wI2ugOFt.js', 'utf-8');

// Find EN function
const enDef = c.indexOf('EN=');
if (enDef >= 0) {
  console.log('EN= at', enDef, ':', c.slice(enDef, enDef + 200));
}
