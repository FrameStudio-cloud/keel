const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-wI2ugOFt.js', 'utf-8');

// Find _initSupabaseAuthClient
const authInit = c.indexOf('_initSupabaseAuthClient');
if (authInit >= 0) {
  const before = c.slice(Math.max(0, authInit - 200), authInit);
  const after = c.slice(authInit, authInit + 600);
  console.log('Before:', before);
  console.log('After:', after);
}

// Also check where GoTrueClient is instantiated
const gtCtor = c.indexOf('GoTrueClient');
if (gtCtor >= 0) {
  const ctx = c.slice(Math.max(0, gtCtor - 200), gtCtor + 200);
  console.log('\nGoTrueClient context:', ctx);
}
