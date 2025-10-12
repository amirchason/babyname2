const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json', 'utf8'));

// Find names with variant/derived patterns in origin field
const variantInOrigin = data.names.filter(n => {
  if (!n.origin) return false;
  const originStr = Array.isArray(n.origin) ? n.origin.join(' ') : n.origin;
  const lower = originStr.toLowerCase();
  return lower.includes('variant of') ||
         lower.includes('derived from') ||
         lower.includes('variation of') ||
         lower.includes('diminutive of') ||
         lower.includes('form of');
});

console.log('Names with variant/derived in origin field:', variantInOrigin.length);

variantInOrigin.slice(0, 20).forEach(n => {
  const originStr = Array.isArray(n.origin) ? JSON.stringify(n.origin) : n.origin;
  console.log(n.name + ': ' + originStr);
});
