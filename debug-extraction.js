// Simulate the extraction function
const extractFeaturedNames = (html) => {
  const names = [];
  const strongMatches = html.matchAll(/<strong>([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);

  for (const match of strongMatches) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }

  return names;
};

// Test with various HTML patterns
const testCases = [
  '<strong>Scout</strong>',
  '<strong>1. Scout</strong>',
  '<p><strong>Scout</strong> - meaning</p>',
  '<h3>1. Scout</h3>',
  '<h3><strong>Scout</strong></h3>',
  '**Scout**',
  '<b>Scout</b>',
  '<em>Scout</em>'
];

console.log('Testing extraction patterns:\n');
testCases.forEach(test => {
  const result = extractFeaturedNames(test);
  console.log(`Input: ${test}`);
  console.log(`Result: ${result.length > 0 ? result : 'NO MATCH'}\n`);
});
