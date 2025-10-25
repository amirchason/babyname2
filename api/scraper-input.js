/**
 * DataPipeline Webhook Input Endpoint
 * Returns list of URLs for DataPipeline to scrape
 *
 * URL: https://soulseedbaby.com/api/scraper-input
 */

export default async function handler(req, res) {
  // 1. Only allow GET (DataPipeline fetches the list)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Set security headers
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  // 3. Optional: Verify API key from DataPipeline
  const apiKey = req.headers['x-api-key'] || req.query.key;
  if (apiKey !== process.env.DATAPIPELINE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 4. Return list of URLs to scrape
  // Example: Celebrity baby name sites for letter K
  const urlsToScrape = [
    'https://nameberry.com/celebrity-baby-names/k',
    'https://nameberry.com/celebrity-baby-names/a',
    'https://nameberry.com/celebrity-baby-names/b',
    // Add more URLs as needed
  ];

  // 5. Return in plain text format (one URL per line)
  // DataPipeline expects text/plain, not JSON
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(urlsToScrape.join('\n'));
}
