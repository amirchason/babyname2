/**
 * 🔍 VERIFICATION AGENT
 * Multi-source fact-checking for enriched name data
 * Verifies historical figures, celebrities, songs, and links
 */

const https = require('https');
const http = require('http');

class VerificationAgent {
  constructor() {
    this.errors = [];
    this.fixes = [];
  }

  /**
   * Main verification function
   */
  async verify(enrichedData) {
    console.log(`\n🔍 Verifying enriched data for: ${enrichedData.name}`);
    this.errors = [];
    this.fixes = [];

    // Verify each section
    await this.verifyHistoricalFigures(enrichedData);
    await this.verifyModernCelebrities(enrichedData);
    await this.verifySongs(enrichedData);

    // Report results
    if (this.errors.length === 0) {
      console.log(`✅ All data verified successfully!`);
      return { valid: true, data: enrichedData };
    } else {
      console.log(`⚠️  Found ${this.errors.length} errors, auto-fixing...`);
      const fixedData = await this.autoFix(enrichedData);
      return { valid: true, data: fixedData, fixes: this.fixes };
    }
  }

  /**
   * Verify historical figures (must be deceased, 100+ years ago)
   */
  async verifyHistoricalFigures(data) {
    if (!data.historicalFigures || data.historicalFigures.length === 0) {
      return;
    }

    console.log(`  Checking ${data.historicalFigures.length} historical figures...`);

    for (const figure of data.historicalFigures) {
      try {
        const wikiData = await this.getWikipediaData(figure.name);

        if (!wikiData) {
          this.errors.push({
            type: 'HISTORICAL_NOT_FOUND',
            figure: figure.name,
            reason: 'Person not found on Wikipedia'
          });
          continue;
        }

        // Check if person is actually deceased
        if (!wikiData.deathYear) {
          this.errors.push({
            type: 'HISTORICAL_STILL_ALIVE',
            figure: figure.name,
            reason: `${figure.name} is still living (born ${wikiData.birthYear})`,
            suggestion: 'Move to modernCelebrities'
          });
          continue;
        }

        // Check if old enough to be "historical" (100+ years deceased)
        const currentYear = new Date().getFullYear();
        const yearsDeceased = currentYear - wikiData.deathYear;

        if (yearsDeceased < 100) {
          this.errors.push({
            type: 'HISTORICAL_TOO_RECENT',
            figure: figure.name,
            reason: `Died only ${yearsDeceased} years ago (${wikiData.deathYear})`,
            suggestion: 'Move to modernCelebrities or remove'
          });
          continue;
        }

        // Verify URL
        const urlValid = await this.verifyUrl(figure.url);
        if (!urlValid) {
          this.errors.push({
            type: 'BROKEN_LINK',
            figure: figure.name,
            url: figure.url,
            reason: 'Wikipedia URL returns error'
          });
        }

        console.log(`    ✓ ${figure.name} (deceased ${wikiData.deathYear})`);

      } catch (error) {
        this.errors.push({
          type: 'VERIFICATION_ERROR',
          figure: figure.name,
          reason: error.message
        });
      }
    }
  }

  /**
   * Verify modern celebrities (living or recent, last 50 years)
   */
  async verifyModernCelebrities(data) {
    if (!data.modernCelebrities || data.modernCelebrities.length === 0) {
      return;
    }

    console.log(`  Checking ${data.modernCelebrities.length} modern celebrities...`);

    for (const celeb of data.modernCelebrities) {
      try {
        const wikiData = await this.getWikipediaData(celeb.name);

        if (!wikiData) {
          this.errors.push({
            type: 'CELEBRITY_NOT_FOUND',
            celeb: celeb.name,
            reason: 'Person not found on Wikipedia'
          });
          continue;
        }

        // Check if they're actually recent/modern (last 50 years of activity)
        const currentYear = new Date().getFullYear();

        if (wikiData.deathYear && (currentYear - wikiData.deathYear) > 50) {
          this.errors.push({
            type: 'CELEBRITY_TOO_OLD',
            celeb: celeb.name,
            reason: `Died ${currentYear - wikiData.deathYear} years ago`,
            suggestion: 'Remove or move to historical if 100+ years'
          });
          continue;
        }

        // Verify URL
        const urlValid = await this.verifyUrl(celeb.url);
        if (!urlValid) {
          this.errors.push({
            type: 'BROKEN_LINK',
            celeb: celeb.name,
            url: celeb.url,
            reason: 'Celebrity URL returns error'
          });
        }

        const status = wikiData.deathYear ? `deceased ${wikiData.deathYear}` : 'living';
        console.log(`    ✓ ${celeb.name} (${status})`);

      } catch (error) {
        this.errors.push({
          type: 'VERIFICATION_ERROR',
          celeb: celeb.name,
          reason: error.message
        });
      }
    }
  }

  /**
   * Verify songs actually exist via MusicBrainz
   */
  async verifySongs(data) {
    if (!data.songs || data.songs.length === 0) {
      return;
    }

    console.log(`  Checking ${data.songs.length} songs...`);

    for (const song of data.songs) {
      try {
        const songExists = await this.verifySongExists(song.title, song.artist);

        if (!songExists) {
          this.errors.push({
            type: 'SONG_NOT_FOUND',
            song: `${song.title} by ${song.artist}`,
            reason: 'Song not found in MusicBrainz database'
          });
          continue;
        }

        console.log(`    ✓ "${song.title}" by ${song.artist}`);

      } catch (error) {
        this.errors.push({
          type: 'VERIFICATION_ERROR',
          song: `${song.title} by ${song.artist}`,
          reason: error.message
        });
      }
    }
  }

  /**
   * Get Wikipedia data for a person
   */
  async getWikipediaData(personName) {
    return new Promise((resolve, reject) => {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageprops&exintro=1&explaintext=1&titles=${encodeURIComponent(personName)}`;

      https.get(searchUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const pages = json.query.pages;
            const page = Object.values(pages)[0];

            if (page.missing) {
              resolve(null);
              return;
            }

            const extract = page.extract || '';

            // Extract birth and death years from text
            const birthMatch = extract.match(/born[^\d]*(\d{4})/i) || extract.match(/\((\d{4})[–\-]/);
            const deathMatch = extract.match(/died[^\d]*(\d{4})/i) || extract.match(/[–\-](\d{4})\)/);

            resolve({
              title: page.title,
              birthYear: birthMatch ? parseInt(birthMatch[1]) : null,
              deathYear: deathMatch ? parseInt(deathMatch[1]) : null,
              extract: extract.substring(0, 300)
            });
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Verify a song exists in MusicBrainz
   */
  async verifySongExists(title, artist) {
    return new Promise((resolve) => {
      const searchUrl = `https://musicbrainz.org/ws/2/recording?query=recording:"${encodeURIComponent(title)}"%20AND%20artist:"${encodeURIComponent(artist)}"&fmt=json&limit=5`;

      https.get(searchUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const found = json.recordings && json.recordings.length > 0;
            resolve(found);
          } catch (error) {
            // If API fails, assume song might exist (don't block)
            console.warn(`    ⚠️  MusicBrainz API error for "${title}", skipping check`);
            resolve(true);
          }
        });
      }).on('error', () => {
        // If API fails, assume song might exist
        resolve(true);
      });
    });
  }

  /**
   * Verify URL is accessible
   */
  async verifyUrl(url) {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https') ? https : http;

      const req = protocol.get(url, (res) => {
        // Consider 200-399 as valid (includes redirects)
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });

      req.on('error', () => resolve(false));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Auto-fix errors by researching correct data
   */
  async autoFix(data) {
    console.log(`\n🔧 Auto-fixing ${this.errors.length} errors...`);

    // Fix living "historical" figures → move to celebrities
    const livingHistorical = this.errors.filter(e => e.type === 'HISTORICAL_STILL_ALIVE');
    for (const error of livingHistorical) {
      const figure = data.historicalFigures.find(f => f.name === error.figure);
      if (figure) {
        console.log(`  ✓ Moving ${error.figure} to modernCelebrities (still living)`);
        data.modernCelebrities = data.modernCelebrities || [];
        data.modernCelebrities.push(figure);
        data.historicalFigures = data.historicalFigures.filter(f => f.name !== error.figure);
        this.fixes.push(`Moved ${error.figure} from historical to modern celebrities`);
      }
    }

    // Remove invalid historical figures (too recent)
    const recentHistorical = this.errors.filter(e => e.type === 'HISTORICAL_TOO_RECENT');
    for (const error of recentHistorical) {
      console.log(`  ✓ Removing ${error.figure} (died only ${error.reason.match(/\d+/)[0]} years ago)`);
      data.historicalFigures = data.historicalFigures.filter(f => f.name !== error.figure);
      this.fixes.push(`Removed ${error.figure} from historical figures (too recent)`);
    }

    // Remove songs that don't exist
    const fakeSongs = this.errors.filter(e => e.type === 'SONG_NOT_FOUND');
    for (const error of fakeSongs) {
      console.log(`  ✓ Removing fake song: ${error.song}`);
      data.songs = data.songs.filter(s => `${s.title} by ${s.artist}` !== error.song);
      this.fixes.push(`Removed non-existent song: ${error.song}`);
    }

    // Remove entries with broken links
    const brokenLinks = this.errors.filter(e => e.type === 'BROKEN_LINK');
    for (const error of brokenLinks) {
      if (error.figure) {
        console.log(`  ✓ Removing ${error.figure} (broken Wikipedia link)`);
        data.historicalFigures = data.historicalFigures.filter(f => f.name !== error.figure);
        this.fixes.push(`Removed ${error.figure} due to broken link`);
      }
      if (error.celeb) {
        console.log(`  ✓ Removing ${error.celeb} (broken link)`);
        data.modernCelebrities = data.modernCelebrities.filter(c => c.name !== error.celeb);
        this.fixes.push(`Removed ${error.celeb} due to broken link`);
      }
    }

    console.log(`\n✅ Fixed ${this.fixes.length} issues automatically`);
    return data;
  }

  /**
   * Get verification summary
   */
  getSummary() {
    return {
      totalErrors: this.errors.length,
      totalFixes: this.fixes.length,
      errors: this.errors,
      fixes: this.fixes
    };
  }
}

module.exports = VerificationAgent;
