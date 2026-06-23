const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-wI2ugOFt.js', 'utf-8');

// Find CN deep merge function
let cnDef = c.indexOf('CN(');
if (cnDef >= 0) {
  // Look backwards for function definition
  const before = c.slice(Math.max(0, cnDef - 300), cnDef);
  console.log('Before CN(:', before);
}

// Search for CN function definition
const cnFn = c.indexOf('function CN(');
if (cnFn >= 0) {
  console.log('\nfunction CN at', cnFn, ':', c.slice(cnFn, cnFn + 200));
}

const cnArrow = c.indexOf('CN=');
if (cnArrow >= 0) {
  console.log('\nCN= at', cnArrow, ':', c.slice(cnArrow, cnArrow + 300));
}

// Also check what sN looks like after the fix
// Search for where global is accessed in the fetch context
const globalRef = c.indexOf('d.global');
if (globalRef >= 0) {
  console.log('\nd.global reference:', c.slice(Math.max(0,globalRef-30), globalRef+80));
}
