// Test if hasBabyNameContent function works correctly
const testContent = `
<h1>Literary Baby Names from Classic Literature 2025</h1>
<p>Here are some great baby names from literature.</p>
<strong>Scout</strong>
<strong>Atticus</strong>
<strong>Holden</strong>
`;

const hasBabyNameContent = (content) => {
  if (!content) return false;
  const lowerContent = content.toLowerCase();
  const indicators = [
    'baby name',
    'baby names',
    'name for baby',
    'name meaning',
    'name origin',
    'popular names',
    'unique names',
    'girl names',
    'boy names',
    'gender-neutral names',
    'unisex names',
    'biblical names',
    'modern names',
    'traditional names',
    'vintage names',
    'trendy names'
  ];
  return indicators.some(indicator => lowerContent.includes(indicator));
};

console.log('Test content has baby name indicators:', hasBabyNameContent(testContent));
console.log('Indicators found:', testContent.toLowerCase().includes('baby name'));
