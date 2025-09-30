#!/usr/bin/env node

/**
 * Test script for FIXED validation logic
 * This should accept any non-empty ID format
 */

// NEW validation function (relaxed)
function isValidUserData(data) {
  console.log('\n📋 Testing:', JSON.stringify(data, null, 2));

  // Check 1: Is object
  if (!data || typeof data !== 'object') {
    console.log('❌ Not an object');
    return false;
  }

  // Check 2: Has ID (non-empty string)
  if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
    console.log('❌ ID missing or empty');
    return false;
  }

  // Check 3: Has Email (non-empty string)
  if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
    console.log('❌ Email missing or empty');
    return false;
  }

  // Check 4: Has Name (non-empty string)
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    console.log('❌ Name missing or empty');
    return false;
  }

  // NO FORMAT CHECK - Accept any ID!
  console.log(`✅ PASSED - ID format: ${data.id.length} chars`);
  return true;
}

// Test scenarios (same as before)
const testCases = [
  {
    name: 'Valid Google ID (21 digits)',
    data: {
      id: '123456789012345678901',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    }
  },
  {
    name: 'Short numeric ID (10 digits)',
    data: {
      id: '1234567890',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    }
  },
  {
    name: 'Alphanumeric ID',
    data: {
      id: 'abc123def456789',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    }
  },
  {
    name: 'UUID format ID',
    data: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    }
  },
  {
    name: 'Firebase Auth UID format',
    data: {
      id: 'firebase:123456:user',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    }
  },
  {
    name: 'Short alphanumeric (old format)',
    data: {
      id: 'user123',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    }
  },
  {
    name: 'Numeric with leading zeros (16 digits)',
    data: {
      id: '0123456789012345',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    }
  },
  {
    name: 'Missing ID',
    data: {
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    }
  },
  {
    name: 'Empty string ID',
    data: {
      id: '',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    }
  }
];

console.log('🧪 FIXED VALIDATION TEST SUITE');
console.log('================================\n');
console.log('Testing the RELAXED validation logic\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Test ${index + 1}/${testCases.length}: ${testCase.name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const result = isValidUserData(testCase.data);

  if (result) {
    passed++;
  } else {
    failed++;
  }
});

console.log('\n\n╔════════════════════════════════════════╗');
console.log('║         TEST SUMMARY                   ║');
console.log('╚════════════════════════════════════════╝');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total:  ${testCases.length}`);

console.log('\n\n🎉 RESULT:');
console.log('━━━━━━━━━━━━');
if (passed === 7 && failed === 2) {
  console.log('✅ PERFECT! The fix works as expected.');
  console.log('');
  console.log('The validation now accepts:');
  console.log('  ✅ Google OAuth IDs (numeric, any length)');
  console.log('  ✅ Alphanumeric IDs');
  console.log('  ✅ UUIDs');
  console.log('  ✅ Legacy/old format IDs');
  console.log('  ✅ ANY non-empty string ID');
  console.log('');
  console.log('Only rejects:');
  console.log('  ❌ Missing ID field');
  console.log('  ❌ Empty string ID');
  console.log('');
  console.log('👉 Your old localStorage will now be accepted!');
} else {
  console.log('⚠️ Unexpected results. Review the test output.');
}
console.log('');