#!/usr/bin/env node

/**
 * Test script to validate different user data scenarios
 * This simulates the validation logic from AuthContext
 */

// Validation function from AuthContext.tsx (line 80-82)
function isValidUserData(data) {
  console.log('\n📋 Testing:', JSON.stringify(data, null, 2));

  const results = {
    isObject: false,
    hasId: false,
    hasEmail: false,
    hasName: false,
    idIsString: false,
    idNotEmpty: false,
    emailIsString: false,
    emailNotEmpty: false,
    nameIsString: false,
    nameNotEmpty: false,
    idIsNumeric: false,
    idIsLongEnough: false,
    overall: false
  };

  // Check 1: Is object
  if (!data || typeof data !== 'object') {
    console.log('❌ Not an object');
    return results;
  }
  results.isObject = true;

  // Check 2: Has ID
  results.hasId = !!data.id;
  results.idIsString = typeof data.id === 'string';
  results.idNotEmpty = data.id && data.id.trim() !== '';

  if (!results.hasId || !results.idIsString || !results.idNotEmpty) {
    console.log('❌ ID missing or invalid');
    console.log('  - hasId:', results.hasId);
    console.log('  - idIsString:', results.idIsString);
    console.log('  - idNotEmpty:', results.idNotEmpty);
    return results;
  }

  // Check 3: Has Email
  results.hasEmail = !!data.email;
  results.emailIsString = typeof data.email === 'string';
  results.emailNotEmpty = data.email && data.email.trim() !== '';

  if (!results.hasEmail || !results.emailIsString || !results.emailNotEmpty) {
    console.log('❌ Email missing or invalid');
    return results;
  }

  // Check 4: Has Name
  results.hasName = !!data.name;
  results.nameIsString = typeof data.name === 'string';
  results.nameNotEmpty = data.name && data.name.trim() !== '';

  if (!results.hasName || !results.nameIsString || !results.nameNotEmpty) {
    console.log('❌ Name missing or invalid');
    return results;
  }

  // Check 5: Google ID format - THE CRITICAL CHECK
  const idPattern = /^\d{15,}$/;
  results.idIsNumeric = /^\d+$/.test(data.id);
  results.idIsLongEnough = data.id.length >= 15;
  const passesStrictCheck = idPattern.test(data.id);

  if (!passesStrictCheck) {
    console.log('❌ FAILED - ID format validation');
    console.log('  - ID value:', data.id);
    console.log('  - ID length:', data.id.length);
    console.log('  - Is numeric:', results.idIsNumeric);
    console.log('  - Is long enough (15+):', results.idIsLongEnough);
    console.log('  - Pattern /^\\d{15,}$/:', passesStrictCheck);
    return results;
  }

  results.overall = true;
  console.log('✅ PASSED - All validation checks');
  return results;
}

// Test scenarios
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

console.log('🧪 VALIDATION TEST SUITE');
console.log('========================\n');
console.log('Testing the isValidUserData logic from AuthContext.tsx\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Test ${index + 1}/${testCases.length}: ${testCase.name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const result = isValidUserData(testCase.data);

  if (result.overall) {
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

console.log('\n\n🎯 ANALYSIS:');
console.log('━━━━━━━━━━━━');
console.log('The current validation requires:');
console.log('  1. ID must be a string');
console.log('  2. ID must be non-empty');
console.log('  3. ID must be ONLY digits (0-9)');
console.log('  4. ID must be at least 15 characters long');
console.log('');
console.log('This is VERY STRICT and will reject:');
console.log('  ❌ Alphanumeric IDs (like Firebase UIDs)');
console.log('  ❌ UUIDs with dashes');
console.log('  ❌ Short numeric IDs (< 15 digits)');
console.log('  ❌ Any ID with letters, symbols, or spaces');
console.log('');
console.log('💡 RECOMMENDATION:');
console.log('If you\'re seeing "Session expired" errors, your old');
console.log('localStorage likely has a non-numeric or short ID.');
console.log('');
console.log('FIX OPTIONS:');
console.log('  A) Relax to accept any non-empty string ID');
console.log('  B) Accept alphanumeric IDs (letters + numbers)');
console.log('  C) Just check ID exists (most permissive)');
console.log('');