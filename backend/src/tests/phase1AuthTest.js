require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const { app } = require('../server');
const AuditLog = require('../models/AuditLog');

const PORT = 5098;

async function runPhase1Tests() {
  console.log('\n======================================================');
  console.log('       PHASE 1 AUTHENTICATION & RBAC TEST SUITE        ');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition, title) => {
    total++;
    if (condition) {
      console.log(`  [PASS] Test ${total}: ${title}`);
      passed++;
    } else {
      console.error(`  [FAIL] Test ${total}: ${title}`);
    }
  };

  const server = app.listen(PORT, async () => {
    try {
      // 1. Health check
      const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
      const health = await healthRes.json();
      assert(health.status === 'OK' && health.factoryState === 'Tamil Nadu', 'Backend Health Endpoint returns status OK');

      // 2. Test Login for all 5 roles
      const rolesToTest = [
        { role: 'salesman', email: 'salesman@nitfood.com' },
        { role: 'admin', email: 'admin@nitfood.com' },
        { role: 'production_supervisor', email: 'supervisor@nitfood.com' },
        { role: 'accountant_auditor', email: 'auditor@nitfood.com' },
        { role: 'owner', email: 'owner@nitfood.com' },
      ];

      const tokens = {};

      for (const r of rolesToTest) {
        const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: r.email, password: 'Password@123' }),
        });
        const loginData = await loginRes.json();
        assert(
          loginRes.status === 200 && loginData.success && loginData.user.role === r.role && !!loginData.token,
          `Login successful for role '${r.role}' (${r.email}) with valid JWT`
        );
        tokens[r.role] = loginData.token;
      }

      // 3. Test Invalid password
      const badLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nitfood.com', password: 'WrongPassword@999' }),
      });
      const badLoginData = await badLoginRes.json();
      assert(badLoginRes.status === 401 && !badLoginData.success, 'Rejects invalid password with 401 Unauthorized');

      // 4. Test Protected Profile /api/auth/me
      const meRes = await fetch(`http://localhost:${PORT}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokens.admin}` },
      });
      const meData = await meRes.json();
      assert(
        meRes.status === 200 && meData.success && meData.user.email === 'admin@nitfood.com',
        'Profile endpoint /api/auth/me succeeds with valid Bearer token'
      );

      // 5. Test Access without token
      const noTokenRes = await fetch(`http://localhost:${PORT}/api/auth/me`);
      assert(noTokenRes.status === 401, 'Protected endpoint /api/auth/me rejects requests without token (401)');

      // 6. Test RBAC: Salesman accessing Admin-only endpoint (/api/auth/users)
      const salesmanUsersRes = await fetch(`http://localhost:${PORT}/api/auth/users`, {
        headers: { Authorization: `Bearer ${tokens.salesman}` },
      });
      const salesmanUsersData = await salesmanUsersRes.json();
      assert(
        salesmanUsersRes.status === 403 && !salesmanUsersData.success,
        'RBAC: Salesman blocked from admin endpoint /api/auth/users with 403 Forbidden'
      );

      // 7. Test RBAC: Admin accessing Admin-only endpoint (/api/auth/users)
      const adminUsersRes = await fetch(`http://localhost:${PORT}/api/auth/users`, {
        headers: { Authorization: `Bearer ${tokens.admin}` },
      });
      const adminUsersData = await adminUsersRes.json();
      assert(
        adminUsersRes.status === 200 && adminUsersData.success && adminUsersData.count >= 5,
        'RBAC: Admin granted access to /api/auth/users (returns all registered users)'
      );

      // 8. Test Audit Log creation
      const logs = await AuditLog.find({ action: 'USER_LOGIN' });
      assert(logs.length >= 5, 'AuditLog automatically captures login events with user details and IP');

      console.log(`\nResults: ${passed} / ${total} tests passed.`);
      server.close(() => {
        mongoose.connection.close();
        if (passed === total) {
          console.log('\n>>> PHASE 1 TEST SUITE PASSED COMPLETELY! <<<\n');
          process.exit(0);
        } else {
          process.exit(1);
        }
      });
    } catch (err) {
      console.error('Test execution error:', err);
      server.close(() => {
        mongoose.connection.close();
        process.exit(1);
      });
    }
  });
}

runPhase1Tests();
