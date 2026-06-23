const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-PZEf65Tb.js', 'utf-8');

// Find MN (createClient) definition
const mnDef = c.indexOf('MN=');
if (mnDef >= 0) {
  console.log('MN definition:');
  console.log(c.slice(mnDef, mnDef + 300));
}

// Find where MN is defined (arrow function or function)
let idx = 0;
while ((idx = c.indexOf('createClient', idx)) >= 0) {
  console.log('\ncreateClient at', idx, ':', c.slice(Math.max(0,idx-20), idx+80));
  idx++;
}

// Find how RN reads the fetch option - look at CN merge
const cnMerge = c.indexOf('CN(r??{}');
if (cnMerge >= 0) {
  console.log('\nCN merge context:', c.slice(Math.max(0,cnMerge-50), cnMerge+100));
}

// Find what sN is (default global options)
const sN_default = c.indexOf('sN');
if (sN_default >= 0) {
  const ctx = c.indexOf('sN=');
  if (ctx >= 0) {
    console.log('\nsN definition:', c.slice(ctx, ctx+200));
  }
}
