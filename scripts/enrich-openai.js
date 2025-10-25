/**
 * 🤖 OPENAI NAME ENRICHMENT AGENT
 * Quick test version using OpenAI GPT-4 (already working in your project)
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'process.env.OPENAI_API_KEY'
});

const OUTPUT_DIR = 'public/data/enriched';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function enrichName(name) {
  console.log(`\n🔍 Enriching: ${name}`);

  const prompt = `You are a baby name expert. Provide comprehensive information about the name "${name}" in JSON format.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "name": "${name}",
  "slug": "${name.toLowerCase()}",
  "origin": {
    "fullHistory": "300-400 word detailed origin story covering etymology, linguistic roots, geographical spread, cultural significance, and historical evolution"
  },
  "nicknames": ["5-10 common nickname variations"],
  "historicalFigures": [
    {
      "name": "Full name",
      "famousFor": "What they're famous for",
      "url": "Wikipedia URL"
    }
  ],
  "modernCelebrities": [
    {
      "name": "Full name",
      "famousFor": "What they're famous for (last 10 years, western culture, top famous only)",
      "url": "IMDB or Wikipedia URL"
    }
  ],
  "songs": [
    {
      "title": "Song title",
      "artist": "Artist name",
      "url": "https://music.youtube.com/search?q=SONG+ARTIST"
    }
  ],
  "enriched": true,
  "enrichedAt": "${new Date().toISOString()}",
  "enrichedBy": "openai-gpt4",
  "version": "1.0"
}

Be thorough and accurate. Include real people and songs. Return ONLY the JSON, nothing else.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content.trim();
    console.log('Raw response length:', content.length);

    const data = JSON.parse(content);

    // Save to file
    const filename = path.join(OUTPUT_DIR, `${data.slug}.json`);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));

    console.log(`✅ Enriched and saved: ${filename}`);
    console.log(`📊 Quality: ${data.nicknames?.length || 0} nicknames, ${data.historicalFigures?.length || 0} historical figures, ${data.modernCelebrities?.length || 0} celebrities, ${data.songs?.length || 0} songs`);

    return data;

  } catch (error) {
    console.error(`❌ Error enriching ${name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting OpenAI Name Enrichment');
  console.log('===================================\n');

  // Test with Emma
  const testName = 'Emma';

  try {
    const enrichedData = await enrichName(testName);

    console.log('\n✅ SUCCESS! Enriched data created:');
    console.log(`📁 File: public/data/enriched/${enrichedData.slug}.json`);
    console.log('\n📊 Summary:');
    console.log(`   Name: ${enrichedData.name}`);
    console.log(`   Origin words: ${enrichedData.origin?.fullHistory?.split(' ').length || 0}`);
    console.log(`   Nicknames: ${enrichedData.nicknames?.length || 0}`);
    console.log(`   Historical figures: ${enrichedData.historicalFigures?.length || 0}`);
    console.log(`   Modern celebrities: ${enrichedData.modernCelebrities?.length || 0}`);
    console.log(`   Songs: ${enrichedData.songs?.length || 0}`);

    // Create demo HTML page
    const demoHtml = generateDemoPage(enrichedData);
    fs.writeFileSync('public/emma-real-enriched.html', demoHtml);
    console.log('\n🎨 Demo page created: public/emma-real-enriched.html');
    console.log('   View at: http://localhost:3000/emma-real-enriched.html');
    console.log('   Or deploy and view at: https://soulseedbaby.com/emma-real-enriched.html');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

function generateDemoPage(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - REAL Enriched Data | SoulSeed</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
        .gradient-bg { background: linear-gradient(135deg, #D8B2F2 0%, #FFB3D9 50%, #B3D9FF 100%); }
        .card { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.95); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.6s ease-out; }
    </style>
</head>
<body class="gradient-bg min-h-screen py-8 px-4">

    <header class="max-w-4xl mx-auto mb-8 text-center fade-in">
        <div class="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-semibold">REAL AI-Enriched Data from OpenAI GPT-4</span>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">${data.name}</h1>
        <p class="text-white/90 text-lg">Real enriched profile generated ${new Date(data.enrichedAt).toLocaleString()}</p>
    </header>

    <div class="max-w-4xl mx-auto space-y-6">

        <!-- Origin Story -->
        <div class="card rounded-2xl shadow-2xl p-6 md:p-8 fade-in">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">📜 Origin & Etymology</h2>
            <div class="prose prose-purple max-w-none">
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${data.origin.fullHistory}</p>
            </div>
        </div>

        <!-- Nicknames -->
        <div class="card rounded-2xl shadow-2xl p-6 md:p-8 fade-in">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">💕 Nicknames & Variations</h2>
            <div class="flex flex-wrap gap-2">
                ${data.nicknames.map(nick => `<span class="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">${nick}</span>`).join('')}
            </div>
        </div>

        <!-- Historical Figures -->
        <div class="card rounded-2xl shadow-2xl p-6 md:p-8 fade-in">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">👑 Historical Figures</h2>
            <div class="space-y-4">
                ${data.historicalFigures.map((fig, i) => `
                <div class="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <h3 class="font-bold text-lg text-gray-800 mb-2">${fig.name}</h3>
                    <p class="text-gray-700 mb-3">${fig.famousFor}</p>
                    <a href="${fig.url}" target="_blank" class="text-purple-600 hover:text-purple-700 font-medium text-sm">Learn more →</a>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- Modern Celebrities -->
        <div class="card rounded-2xl shadow-2xl p-6 md:p-8 fade-in">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">⭐ Modern Celebrities</h2>
            <div class="grid md:grid-cols-2 gap-4">
                ${data.modernCelebrities.map(celeb => `
                <div class="p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                    <h3 class="font-bold text-gray-800 mb-2">${celeb.name}</h3>
                    <p class="text-gray-700 text-sm mb-3">${celeb.famousFor}</p>
                    <a href="${celeb.url}" target="_blank" class="text-blue-600 hover:text-blue-700 font-medium text-sm">View Profile →</a>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- Songs -->
        <div class="card rounded-2xl shadow-2xl p-6 md:p-8 fade-in">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">🎵 Songs About ${data.name}</h2>
            <div class="space-y-3">
                ${data.songs.map(song => `
                <div class="p-4 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-gray-800">${song.title}</h3>
                        <p class="text-gray-600 text-sm">${song.artist}</p>
                    </div>
                    <a href="${song.url}" target="_blank" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm">
                        Play ▶
                    </a>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- Metadata -->
        <div class="card rounded-2xl shadow-2xl p-6 text-center fade-in">
            <div class="text-sm text-gray-600 space-y-2">
                <p><strong>Enriched by:</strong> ${data.enrichedBy}</p>
                <p><strong>Generated:</strong> ${new Date(data.enrichedAt).toLocaleString()}</p>
                <p><strong>Version:</strong> ${data.version}</p>
                <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="font-semibold">100% Real AI-Generated Data</span>
                </div>
            </div>
        </div>

    </div>

</body>
</html>`;
}

main();
