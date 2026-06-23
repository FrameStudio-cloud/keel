const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-wI2ugOFt.js', 'utf-8');

// Find _initSupabaseAuthClient method body
// It should be inside the RN class
const rnClass = c.indexOf('RN=class');
if (rnClass >= 0) {
  const rnBody = c.slice(rnClass, rnClass + 4000);
  // Find _initSupabaseAuthClient inside RN class
  const methodStart = rnBody.indexOf('_initSupabaseAuthClient');
  if (methodStart >= 0) {
    const methodBody = rnBody.slice(methodStart, methodStart + 600);
    console.log('Method definition:');
    console.log(methodBody);
  }
}
