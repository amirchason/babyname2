function splitModernOrigin(originStr) {
  if (!originStr || typeof originStr !== 'string' || !originStr.includes('Modern')) {
    return null;
  }

  const tags = ['Modern'];
  let cleanOrigin = String(originStr);

  cleanOrigin = cleanOrigin.replace(/,\s*Modern\s*$/i, '');
  cleanOrigin = cleanOrigin.replace(/^Modern\s*,\s*/i, '');

  if (cleanOrigin.startsWith('Modern ')) {
    cleanOrigin = cleanOrigin.substring(7);
  }

  if (!cleanOrigin || cleanOrigin === 'Modern') {
    return { origin: originStr, tags: [] };
  }

  return { origin: cleanOrigin, tags: tags };
}

// Test on actual patterns
const testCases = ['Spanish,Modern', 'Modern,Spanish', 'Latin,Modern', 'Modern Invented', 'Modern', 'Modern English'];
testCases.forEach(test => {
  const result = splitModernOrigin(test);
  console.log(test + ' => ' + JSON.stringify(result));
});
