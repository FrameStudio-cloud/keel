const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-wI2ugOFt.js', 'utf-8');

// Get full CN function
const cnStart = c.indexOf('function CN(');
if (cnStart >= 0) {
  // Find the closing of the function - look for the next function or end
  const fnBody = c.slice(cnStart, cnStart + 1500);
  console.log('Full CN:');
  console.log(fnBody);
}
