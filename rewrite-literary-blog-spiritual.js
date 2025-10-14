/**
 * REWRITE LITERARY BABY NAMES BLOG
 * Spiritual, witty, funny guide with 50+ names
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');
const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.firebasestorage.app",
  messagingSenderId: "945851717815",
  appId: "1:945851717815:web:7c4b36d71d3d3e4e2f5b8e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize OpenAI with GPT-4o
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are a spiritual baby name guide with a witty, funny writing style. You're rewriting a blog post about LITERARY baby names from classic books.

CRITICAL REQUIREMENTS:
1. Include EXACTLY 50-60 unique baby names from classic literature
2. Format ALL names as: <strong>Name</strong>
3. Add cute nickname suggestions: "Elizabeth (Lizzy, Beth, Eliza)"
4. Make it SPIRITUAL, WITTY, and FUNNY - like talking to a wise, hilarious friend
5. Mobile-first formatting (short paragraphs, 2-3 sentences max)
6. Spread names EVENLY throughout the article

TONE EXAMPLES:
- "Meet <strong>Atticus</strong> — the name that says 'my child will defend justice and look incredible in courtroom glasses.' Your little Atticus (Atty, Cus) is destined for greatness."
- "<strong>Scout</strong> — because why name your daughter 'Mary' when you can name her after a fearless tomboy who taught us courage comes in overalls? Sweet nicknames: Scoutie, Scoots."

STRUCTURE:
- Opening: Funny, warm intro about literary names (2 paragraphs)
- 5-7 themed sections with 7-10 names each
- Each name: 1-2 witty sentences + spiritual insight + nicknames
- Section examples: "Heroes & Heroines", "Rebels & Romantics", "Wise Souls", "Dark Academia Vibes", "Timeless Classics"
- Closing: Heartfelt, funny conclusion
- Add <!-- BLOG_NAME_LIST_COMPONENT --> at the very end

LITERARY SOURCES TO PULL FROM:
- Jane Austen, Shakespeare, Dickens, Brontë sisters
- To Kill a Mockingbird, Great Gatsby, Harry Potter
- Little Women, Pride & Prejudice, Wuthering Heights
- The Odyssey, Greek classics, Russian literature
- Modern classics (The Fault in Our Stars, etc.)

REMEMBER: Count your names! You MUST have 50-60 names minimum.`;

function countNames(html) {
  const matches = html.match(/<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);
  return matches ? new Set(matches.map(m => m.match(/>([^<]+)</)[1].trim())).size : 0;
}

function extractUniqueNames(html) {
  const names = [];
  const regex = /<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const name = match[1].trim();
    if (!names.includes(name)) {
      names.push(name);
    }
  }

  return names;
}

async function rewriteLiteraryBlog() {
  console.log('📚 Rewriting Literary Baby Names Blog\n');
  console.log('Style: Spiritual, Witty, Funny');
  console.log('Target: 50-60 unique literary names\n');

  const userPrompt = `Create a COMPLETE blog post about literary baby names from classic books.

TITLE: Literary Baby Names from Classic Literature: 50+ Timeless Characters for 2025

REQUIREMENTS:
- 50-60 unique character names from classic literature
- Spiritual, witty, FUNNY tone (make people laugh!)
- Cute nicknames for each name
- Mobile-friendly (short paragraphs, 2-3 sentences)
- Spread names evenly in themed sections
- Add <!-- BLOG_NAME_LIST_COMPONENT --> at the very end

EXAMPLE SECTION:

<h2>🎭 Heroes & Heroines Who Changed Everything</h2>

<p><strong>Atticus</strong> — Named after the lawyer who taught us integrity isn't just a word, it's a lifestyle. Your little Atticus (Atty, Cus, Ticky) will probably read Harper Lee before kindergarten. Get ready for some serious moral superiority at playdates.</p>

<p><strong>Scout</strong> — Jean Louise "Scout" Finch proved girls can be fierce, fearless, and fabulous in overalls. This name says "my daughter will question authority and win arguments." Nicknames: Scoutie, Scoots, Lou.</p>

Write the FULL HTML content with 5-7 themed sections, 50-60 names total. Be WITTY and SPIRITUAL!`;

  try {
    console.log('🤖 Calling GPT-4o (gpt-4o)...\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.9, // Higher creativity
      max_tokens: 4096
    });

    const content = response.choices[0].message.content.trim();
    const namesCount = countNames(content);
    const uniqueNames = extractUniqueNames(content);

    console.log(`✅ Generated content with ${namesCount} unique names\n`);

    if (namesCount < 50) {
      console.log(`⚠️  WARNING: Only ${namesCount} names - regenerating...\n`);
      return await rewriteLiteraryBlog();
    }

    // Calculate stats
    const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.ceil(words / 200);

    console.log('📊 BLOG STATS:');
    console.log(`   Names: ${namesCount}`);
    console.log(`   Words: ${words}`);
    console.log(`   Reading time: ${readingTime} min\n`);

    console.log('📝 UNIQUE NAMES:');
    console.log(`   ${uniqueNames.join(', ')}\n`);

    // Update Firestore
    console.log('💾 Updating Firestore...');

    const q = query(
      collection(db, 'blogs'),
      where('slug', '==', 'literary-baby-names-classic-literature-2025')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error('❌ Blog post not found!');
      process.exit(1);
    }

    const docRef = doc(db, 'blogs', snapshot.docs[0].id);
    await updateDoc(docRef, {
      content: content,
      stats: {
        wordCount: words,
        readingTime: readingTime,
        namesCount: namesCount
      },
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Blog post updated in Firestore!\n');

    // Save to file
    const result = {
      title: 'Literary Baby Names from Classic Literature',
      slug: 'literary-baby-names-classic-literature-2025',
      namesCount: namesCount,
      words: words,
      readingTime: readingTime,
      names: uniqueNames,
      content: content
    };

    fs.writeFileSync('literary-blog-rewrite.json', JSON.stringify(result, null, 2));
    console.log('💾 Saved to: literary-blog-rewrite.json\n');

    console.log('🎉 SUCCESS! Literary blog rewritten with spiritual, witty, funny style!\n');

    return result;

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

rewriteLiteraryBlog()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
