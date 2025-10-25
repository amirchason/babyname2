/**
 * 🤖 VERIFIED NAME ENRICHMENT
 * Two-pass system: Generate with GPT-4 → Verify → Auto-fix
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const VerificationAgent = require('./verification-agent');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'process.env.OPENAI_API_KEY'
});

const OUTPUT_DIR = 'public/data/enriched';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function enrichNameWithVerification(name) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 ENRICHING: ${name} (with verification)`);
  console.log(`${'='.repeat(60)}`);

  // PASS 1: Generate with GPT-4
  console.log(`\n📝 PASS 1: Generating enriched data with GPT-4...`);
  const initialData = await generateEnrichedData(name);

  if (!initialData) {
    throw new Error('Failed to generate enriched data');
  }

  console.log(`✅ Generated ${initialData.origin.fullHistory.split(' ').length} words of history`);
  console.log(`   ${initialData.nicknames?.length || 0} nicknames`);
  console.log(`   ${initialData.historicalFigures?.length || 0} historical figures`);
  console.log(`   ${initialData.modernCelebrities?.length || 0} modern celebrities`);
  console.log(`   ${initialData.songs?.length || 0} songs`);

  // PASS 2: Verify and Auto-fix
  console.log(`\n🔍 PASS 2: Verifying data with multi-source fact-checking...`);
  const verifier = new VerificationAgent();
  const result = await verifier.verify(initialData);

  const verifiedData = result.data;

  // Log verification summary
  const summary = verifier.getSummary();
  if (summary.totalFixes > 0) {
    console.log(`\n📊 VERIFICATION SUMMARY:`);
    console.log(`   Errors found: ${summary.totalErrors}`);
    console.log(`   Auto-fixed: ${summary.totalFixes}`);
    console.log(`\n   Fixes applied:`);
    summary.fixes.forEach(fix => console.log(`     • ${fix}`));
  }

  // Save verified data
  const filename = path.join(OUTPUT_DIR, `${verifiedData.slug}.json`);
  fs.writeFileSync(filename, JSON.stringify(verifiedData, null, 2));

  console.log(`\n✅ VERIFIED DATA SAVED: ${filename}`);
  console.log(`\n📊 FINAL QUALITY:`);
  console.log(`   ${verifiedData.origin.fullHistory.split(' ').length} words of origin`);
  console.log(`   ${verifiedData.nicknames?.length || 0} nicknames`);
  console.log(`   ${verifiedData.historicalFigures?.length || 0} VERIFIED historical figures`);
  console.log(`   ${verifiedData.modernCelebrities?.length || 0} VERIFIED modern celebrities`);
  console.log(`   ${verifiedData.songs?.length || 0} VERIFIED songs`);

  // Create demo HTML page
  const demoHtml = generateDemoPage(verifiedData);
  fs.writeFileSync('public/emma-real-enriched.html', demoHtml);
  console.log(`\n🎨 Demo page updated: public/emma-real-enriched.html`);

  return verifiedData;
}

async function generateEnrichedData(name) {
  const prompt = `You are a baby name expert and historian. Provide comprehensive, ACCURATE information about the name "${name}" in JSON format.

CRITICAL REQUIREMENTS:
1. Historical figures MUST be deceased people who lived 100+ years ago
2. Historical figures MUST have significantly impacted history (kings, queens, saints, notable historical leaders)
3. Modern celebrities MUST be living people OR people who died in the last 50 years
4. Songs MUST actually exist - verify artist and title are real
5. All Wikipedia/IMDB URLs must be real and working

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "name": "${name}",
  "slug": "${name.toLowerCase()}",
  "origin": {
    "fullHistory": "300-400 word detailed origin story covering etymology, linguistic roots, geographical spread, cultural significance, and historical evolution. Be thorough and accurate."
  },
  "nicknames": ["5-10 common nickname variations"],
  "historicalFigures": [
    {
      "name": "Full name (MUST be deceased 100+ years ago)",
      "famousFor": "What they're historically famous for",
      "url": "https://en.wikipedia.org/wiki/EXACT_PAGE_NAME"
    }
  ],
  "modernCelebrities": [
    {
      "name": "Full name (living or died in last 50 years)",
      "famousFor": "What they're famous for (actors, musicians, recent notable people)",
      "url": "Wikipedia or IMDB URL"
    }
  ],
  "songs": [
    {
      "title": "REAL song title (verify this song actually exists)",
      "artist": "REAL artist name",
      "url": "https://music.youtube.com/search?q=TITLE+ARTIST"
    }
  ],
  "enriched": true,
  "enrichedAt": "${new Date().toISOString()}",
  "enrichedBy": "openai-gpt4-verified",
  "version": "2.0"
}

Be thorough, accurate, and include ONLY real people and songs. If you're unsure about a song's existence, DO NOT include it.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",  // GPT-4o (optimized) - supports JSON mode, more accurate than mini
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,  // Lower for more accuracy
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content.trim();
    const data = JSON.parse(content);

    return data;

  } catch (error) {
    console.error(`❌ Error generating enriched data for ${name}:`, error.message);
    throw error;
  }
}

function generateDemoPage(data) {
  // Generate historical figures HTML
  const historicalHtml = data.historicalFigures && data.historicalFigures.length > 0
    ? `
        <!-- Historical Figure -->
        <div class="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-pink-50 rounded-2xl border border-yellow-200">
            <div class="flex items-start gap-3 mb-2">
                <span class="text-2xl">👑</span>
                <div class="flex-1">
                    <div class="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold mb-2">HISTORICAL</div>
                    <h4 class="font-bold text-xl text-gray-800 mb-1">${data.historicalFigures[0].name}</h4>
                    <p class="text-base text-gray-600">${data.historicalFigures[0].famousFor}</p>
                    <a href="${data.historicalFigures[0].url}" target="_blank" class="inline-block mt-2 text-purple-600 font-semibold text-sm hover:text-purple-800">
                        Learn more →
                    </a>
                </div>
            </div>
        </div>
    ` : '';

  // Generate modern celebrities HTML
  const celebritiesHtml = data.modernCelebrities && data.modernCelebrities.length > 0
    ? data.modernCelebrities.map((celeb, i) => `
        <div class="p-4 bg-gradient-to-r from-${i % 2 === 0 ? 'purple' : 'blue'}-50 to-${i % 2 === 0 ? 'pink' : 'purple'}-50 rounded-2xl border border-${i % 2 === 0 ? 'purple' : 'blue'}-200">
            <div class="flex items-start gap-3">
                <span class="text-2xl">${i === 0 ? '🎭' : i === 1 ? '📺' : '🌟'}</span>
                <div class="flex-1">
                    <h4 class="font-bold text-lg text-gray-800 mb-1">${celeb.name}</h4>
                    <p class="text-sm text-gray-600">${celeb.famousFor}</p>
                    <a href="${celeb.url}" target="_blank" class="inline-block mt-2 text-${i % 2 === 0 ? 'pink' : 'blue'}-600 font-semibold text-sm hover:text-${i % 2 === 0 ? 'pink' : 'blue'}-800">
                        Learn more →
                    </a>
                </div>
            </div>
        </div>
    `).join('\n') : '';

  // Generate songs HTML
  const songsHtml = data.songs && data.songs.length > 0
    ? data.songs.map((song, i) => `
        <div class="p-4 bg-gradient-to-r from-${i % 2 === 0 ? 'purple' : 'pink'}-50 to-${i % 2 === 0 ? 'pink' : 'purple'}-50 rounded-2xl border border-${i % 2 === 0 ? 'purple' : 'pink'}-200">
            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 flex-1">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-${i % 2 === 0 ? 'purple' : 'pink'}-500 to-${i % 2 === 0 ? 'pink' : 'purple'}-500 flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                        </svg>
                    </div>
                    <div>
                        <h4 class="font-bold text-lg text-gray-800">${song.title}</h4>
                        <p class="text-sm text-gray-600">${song.artist}</p>
                    </div>
                </div>
                <a href="${song.url}" target="_blank" class="px-4 py-2 bg-gradient-to-r from-${i % 2 === 0 ? 'purple' : 'pink'}-600 to-${i % 2 === 0 ? 'pink' : 'purple'}-600 text-white rounded-xl font-semibold text-sm hover:from-${i % 2 === 0 ? 'purple' : 'pink'}-700 hover:to-${i % 2 === 0 ? 'pink' : 'purple'}-700 transition-all flex items-center gap-2 flex-shrink-0">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                    Play
                </a>
            </div>
        </div>
    `).join('\n') : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - AI-Enriched Profile | SoulSeed</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'pastel-pink': '#FFE0EC',
                        'pastel-blue': '#E0F2FF',
                        'pastel-mint': '#E0FFF0',
                        'pastel-lavender': '#F0E0FF',
                        'pastel-yellow': '#FFF9E0',
                        'pastel-peach': '#FFE8E0',
                    },
                    fontFamily: {
                        'display': ['Poppins', 'sans-serif'],
                        'body': ['Inter', 'sans-serif'],
                        'serif': ['Poppins', 'serif'],
                    },
                }
            }
        }
    </script>

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        h1, h2, h3 {
            font-family: 'Poppins', serif;
        }
    </style>
</head>
<body class="bg-pink-50 overflow-x-hidden">

    <!-- App Header -->
    <div class="sticky top-0 z-50 bg-gradient-to-br from-pink-500 to-pink-700 shadow-xl">
        <div class="flex items-center justify-between px-3 py-2">
            <a href="/" class="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200 backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
            </a>
            <h1 class="text-xl font-bold text-white">SoulSeed</h1>
            <div class="w-10 h-10"></div>
        </div>
    </div>

    <!-- Name Header -->
    <div class="sticky top-[57px] z-40 bg-gradient-to-br from-pink-500 to-pink-700 shadow-xl">
        <div class="flex items-center justify-between px-3 py-2">
            <a href="/" class="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200 backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </a>
            <div class="flex-1 text-center px-2">
                <h2 class="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white drop-shadow-2xl tracking-wide leading-tight">
                    ${data.name}
                </h2>
                <span class="inline-block mt-0.5 px-3 py-0.5 bg-white/30 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium shadow-lg">
                    ✅ 100% Verified AI Profile
                </span>
            </div>
            <div class="w-10 h-10"></div>
        </div>
    </div>

    <!-- Content -->
    <div class="p-6 pt-8 pb-8">

        <!-- Origin Story -->
        <div class="mb-8 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 shadow-xl">
            <div class="flex items-center gap-3 mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                <h3 class="text-2xl sm:text-3xl font-serif font-bold text-purple-800">Origin & Etymology</h3>
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
            </div>
            <p class="text-lg sm:text-xl text-gray-800 leading-relaxed">
                ${data.origin.fullHistory}
            </p>
        </div>

        <!-- Nicknames -->
        <div class="mb-8 p-8 bg-white rounded-3xl border-2 border-gray-200 shadow-xl">
            <div class="flex items-center gap-3 mb-4">
                <svg class="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                </svg>
                <h3 class="text-2xl sm:text-3xl font-serif font-bold text-gray-800">Nicknames</h3>
            </div>
            <div class="flex flex-wrap gap-2">
                ${data.nicknames.map(nick => `<span class="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full font-semibold text-sm border border-purple-200">${nick}</span>`).join('\n                ')}
            </div>
        </div>

        ${historicalHtml || celebritiesHtml ? `
        <!-- Famous Namesakes -->
        <div class="mb-8 p-8 bg-white rounded-3xl border-2 border-gray-200 shadow-xl">
            <h3 class="text-2xl sm:text-3xl font-serif font-bold mb-6 flex items-center gap-3">
                <svg class="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Famous Namesakes
            </h3>

            ${historicalHtml}

            ${celebritiesHtml ? `<div class="space-y-3">${celebritiesHtml}</div>` : ''}
        </div>
        ` : ''}

        ${songsHtml ? `
        <!-- Songs -->
        <div class="mb-8 p-8 bg-white rounded-3xl border-2 border-gray-200 shadow-xl">
            <h3 class="text-2xl sm:text-3xl font-serif font-bold mb-6 flex items-center gap-3">
                <svg class="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                </svg>
                Songs About ${data.name}
            </h3>

            <div class="space-y-3">
                ${songsHtml}
            </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 text-center">
            <p class="text-sm text-gray-600 mb-4">
                <strong>✅ Verified by Multi-Source Fact-Checking</strong><br>
                GPT-4 + Wikipedia + MusicBrainz + Link Validation<br>
                ${new Date(data.enrichedAt).toLocaleDateString()} • ${data.enrichedBy}
            </p>
            <a href="/" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to SoulSeed
            </a>
        </div>

    </div>

</body>
</html>`;
}

async function main() {
  console.log('🚀 Starting VERIFIED Name Enrichment with GPT-4');
  console.log('===================================================\n');

  const testName = 'Emma';

  try {
    const enrichedData = await enrichNameWithVerification(testName);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ SUCCESS! ${testName} has been enriched and verified!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n📁 Files created:`);
    console.log(`   • public/data/enriched/${enrichedData.slug}.json`);
    console.log(`   • public/emma-real-enriched.html`);
    console.log(`\n🌐 View at:`);
    console.log(`   • Local: http://localhost:3000/emma-real-enriched.html`);
    console.log(`   • Live: https://soulseedbaby.com/emma-real-enriched.html`);

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

main();
