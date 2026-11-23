const { execSync } = require('child_process');
const path = require('path');

const tests = [
  'src/tests/phase1AuthTest.js',
  'src/tests/phase2MasterDataTest.js',
  'src/tests/phase3SalesOrderTest.js',
  'src/tests/phase4ProductionTest.js',
  'src/tests/phase5CostingPaymentTest.js',
  'src/tests/phase6ReportsTest.js',
  'src/tests/phase7HardeningTest.js',
  'src/scripts/runBenchmarkScenario.js',
];

console.log('\n======================================================');
console.log('   RUNNING COMPLETE FULL-STACK TEST & BENCHMARK SUITE  ');
console.log('======================================================\n');

for (const test of tests) {
  const testPath = path.join(__dirname, '../../', test);
  console.log(`\n>> Executing: ${test}...`);
  try {
    execSync(`node "${testPath}"`, { stdio: 'inherit', env: process.env });
    console.log(`✓ Completed: ${test}`);
  } catch (err) {
    console.error(`\n❌ FAILED at: ${test}`);
    process.exit(1);
  }
}

console.log('\n======================================================');
console.log('   ALL 8 TEST SUITES & BENCHMARKS PASSED (100% OK)    ');
console.log('======================================================\n');
