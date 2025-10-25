/**
 * DataPipeline Webhook Output Endpoint
 * Receives scraped results from DataPipeline
 *
 * URL: https://soulseedbaby.com/api/scraper-output
 */

import crypto from 'crypto';

export default async function handler(req, res) {
  // 1. Only allow POST (DataPipeline sends results)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Set security headers (prevent indexing)
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  // 3. Rate limiting check (prevent abuse)
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // TODO: Add rate limiting with Upstash Redis if needed

  // 4. Verify webhook signature (if DataPipeline provides one)
  const signature = req.headers['x-webhook-signature'];
  if (signature && process.env.WEBHOOK_SECRET) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature from IP:', clientIp);
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  try {
    // 5. Parse scraped data
    console.log('📥 Received webhook from DataPipeline');
    console.log('   IP:', clientIp);
    console.log('   Timestamp:', new Date().toISOString());

    // DataPipeline sends data in different formats based on settings
    // Check if it's multipart-form-data or raw file
    const scrapedData = req.body;

    // 6. Process based on data type
    if (scrapedData.urls && Array.isArray(scrapedData.urls)) {
      // Multiple URLs scraped
      console.log(`   URLs scraped: ${scrapedData.urls.length}`);

      for (const urlData of scrapedData.urls) {
        await processScrapedUrl(urlData);
      }
    } else if (scrapedData.url) {
      // Single URL scraped
      console.log(`   URL scraped: ${scrapedData.url}`);
      await processScrapedUrl(scrapedData);
    } else {
      // Raw HTML or text content
      console.log('   Raw content received');
      await processRawContent(scrapedData);
    }

    // 7. Acknowledge receipt
    res.status(200).json({
      received: true,
      timestamp: new Date().toISOString(),
      processed: true
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Process scraped URL data
 */
async function processScrapedUrl(urlData) {
  const { url, content, markdown, text } = urlData;

  console.log(`\n📄 Processing: ${url}`);

  // Extract celebrity baby data from scraped content
  if (url.includes('nameberry.com/celebrity-baby-names')) {
    const letter = url.split('/').pop();
    console.log(`   Letter: ${letter}`);

    // Parse Next.js JSON data
    const scriptMatch = content?.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s);
    if (scriptMatch) {
      const jsonData = JSON.parse(scriptMatch[1]);
      const babies = jsonData?.props?.pageProps?.babies;

      if (babies && Array.isArray(babies)) {
        console.log(`   ✅ Found ${babies.length} celebrity babies`);

        // Save to cache file
        const fs = require('fs').promises;
        const cacheDir = './scripts/celebrity-cache';
        const cacheFile = `${cacheDir}/nameberry-${letter}.json`;

        await fs.mkdir(cacheDir, { recursive: true });
        await fs.writeFile(cacheFile, JSON.stringify(babies, null, 2));

        console.log(`   💾 Saved to: ${cacheFile}`);
      }
    }
  }
}

/**
 * Process raw content (when "Send as raw file" is selected)
 */
async function processRawContent(data) {
  console.log('📄 Processing raw content');

  // If DataPipeline sends LLM-ready markdown
  if (data.markdown) {
    console.log('   Format: Markdown');
    // Process markdown content
  } else if (data.text) {
    console.log('   Format: Plain text');
    // Process text content
  } else if (data.html) {
    console.log('   Format: HTML');
    // Process HTML content
  }
}
