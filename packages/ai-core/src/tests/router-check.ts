import { classifyIntent } from '../router/intent-classifier.js';
import type { AuthUser, TempleContext } from '../types/index.js';

const testUser: AuthUser = {
  userId: 'test-user-001',
  templeId: 'test-temple-001',
  role: 'trustee_head',
  name: 'Test Trustee',
};

const testTemple: TempleContext = {
  templeId: 'test-temple-001',
  templeName: 'Shree Siddhivinayak Temple',
  deity: 'Lord Ganesha',
  city: 'Mumbai',
  state: 'Maharashtra',
  timezone: 'Asia/Kolkata',
  languages: ['Marathi', 'Hindi', 'English'],
  activeFeatures: ['daily_briefing', 'donor_intelligence', 'content_engine', 'cro_engine'],
  dataHealthScore: 85,
};

interface TestCase {
  input: string;
  expect: {
    engine?: string;
    useCaseId?: string;
    requiresApproval?: boolean;
  };
}

const tests: TestCase[] = [
  {
    input: "Give me today's briefing",
    expect: { engine: 'trustee', useCaseId: 'TA-01' },
  },
  {
    input: 'Who are our lapsed donors?',
    expect: { engine: 'trustee', useCaseId: 'TA-02' },
  },
  {
    input: 'Draft a Navratri WhatsApp blast',
    expect: { engine: 'content', requiresApproval: true },
  },
  {
    input: 'Which devotees will book next?',
    expect: { engine: 'thinking' },
  },
  {
    input: 'Recover abandoned bookings',
    expect: { engine: 'cro', useCaseId: 'CRO-04' },
  },
];

async function main() {
  console.log('Running intent router tests...\n');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await classifyIntent(test.input, testUser, testTemple);
      let testPassed = true;
      const failures: string[] = [];

      if (test.expect.engine && result.engine !== test.expect.engine) {
        testPassed = false;
        failures.push(`engine: expected "${test.expect.engine}", got "${result.engine}"`);
      }

      if (test.expect.useCaseId && result.useCaseId !== test.expect.useCaseId) {
        testPassed = false;
        failures.push(`useCaseId: expected "${test.expect.useCaseId}", got "${result.useCaseId}"`);
      }

      if (test.expect.requiresApproval !== undefined && result.requiresApproval !== test.expect.requiresApproval) {
        testPassed = false;
        failures.push(`requiresApproval: expected ${test.expect.requiresApproval}, got ${result.requiresApproval}`);
      }

      if (testPassed) {
        console.log(`  [PASS] "${test.input}" → engine: ${result.engine}, useCaseId: ${result.useCaseId}, approval: ${result.requiresApproval}`);
        passed++;
      } else {
        console.log(`  [FAIL] "${test.input}" → ${failures.join('; ')}`);
        console.log(`         Full result: ${JSON.stringify(result)}`);
        failed++;
      }
    } catch (error) {
      console.log(`  [ERROR] "${test.input}" → ${error}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed}/${tests.length} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n[PASS] All router tests passed.');
    process.exit(0);
  }
}

main();
