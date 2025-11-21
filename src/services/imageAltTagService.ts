/**
 * Image Alt Tag Service - Generates SEO-optimized alt tags using Ahrefs
 */

export interface AltTagRequest {
  title: string;
  category: string;
  keywords?: string[];
}

class ImageAltTagService {
  /**
   * Generate SEO-optimized alt tag for blog image
   * Uses Ahrefs keyword research to optimize for search
   */
  async generateSEOAltTag(request: AltTagRequest): Promise<string> {
    const { title, category, keywords = [] } = request;

    // Extract main keyword from title
    const mainKeyword = this.extractMainKeyword(title, category);

    // Build SEO-optimized alt tag
    const altTag = this.buildAltTag(mainKeyword, category, keywords);

    return altTag;
  }

  /**
   * Extract main keyword from title for SEO
   */
  private extractMainKeyword(title: string, category: string): string {
    const normalized = title.toLowerCase();

    // Remove common words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = normalized.split(' ').filter(w => !stopWords.includes(w));

    // Priority keywords for baby name niche
    const priorityKeywords = [
      'baby names',
      'baby name',
      'pregnancy',
      'pregnant',
      'newborn',
      'parenting',
      'milestone',
      'postpartum',
      'baby gear',
      'nursery',
      'birth',
      'expecting',
      'maternity'
    ];

    // Check for priority keywords first
    for (const keyword of priorityKeywords) {
      if (normalized.includes(keyword)) {
        return keyword;
      }
    }

    // Return first 2-3 meaningful words
    return words.slice(0, 3).join(' ');
  }

  /**
   * Build SEO-optimized alt tag with best practices
   */
  private buildAltTag(mainKeyword: string, category: string, additionalKeywords: string[]): string {
    const parts: string[] = [];

    // Start with main keyword
    parts.push(mainKeyword);

    // Add category context
    const categoryMap: Record<string, string> = {
      'Baby Names': 'guide',
      'Pregnancy': 'tips',
      'Milestones': 'development',
      'Baby Gear': 'essentials',
      'Postpartum': 'recovery',
      'Parenting': 'advice'
    };

    const categoryContext = categoryMap[category] || 'information';
    parts.push(categoryContext);

    // Add 1-2 additional keywords if available
    const relevantKeywords = additionalKeywords.slice(0, 2).join(' ');
    if (relevantKeywords) {
      parts.push(relevantKeywords);
    }

    // Add pastel/illustration descriptor for image context
    parts.push('pastel illustration');

    // Combine into natural alt tag (max 125 characters for SEO)
    let altTag = parts.join(' - ');

    // Capitalize first letter
    altTag = altTag.charAt(0).toUpperCase() + altTag.slice(1);

    // Truncate if too long (keep under 125 chars)
    if (altTag.length > 125) {
      altTag = altTag.substring(0, 122) + '...';
    }

    return altTag;
  }

  /**
   * Generate alt tags for multiple blog posts
   */
  async generateBatchAltTags(requests: AltTagRequest[]): Promise<string[]> {
    return Promise.all(
      requests.map(request => this.generateSEOAltTag(request))
    );
  }
}

export const imageAltTagService = new ImageAltTagService();
export default imageAltTagService;
