const { execSync } = require('child_process');

try {
  const output = execSync('npx ts-node scripts/generate-complete-course.ts SCROLLMED_101', {
    cwd: __dirname,
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  console.log('SUCCESS:', output);
} catch (error) {
  console.error('ERROR CODE:', error.status);
  console.error('STDOUT:', error.stdout);
  console.error('STDERR:', error.stderr);
  console.error('ERROR:', error.message);
}
