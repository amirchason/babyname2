/**
 * Gemini Image Service - Generates pastel-themed images for blog posts
 * Uses Google Gemini API (Nano Banana Pro Gemini 3)
 */

export interface ImageGenerationRequest {
  title: string;
  category: string;
  excerpt?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

class GeminiImageService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_IMAGE_API_KEY || '';
  }

  /**
   * Generate a pastel-themed image for a blog post
   */
  async generateBlogImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    if (!this.isConfigured()) {
      console.warn('Gemini Image API key not configured');
      return this.getFallbackImage(request);
    }

    try {
      const prompt = this.createPastelPrompt(request);

      // Note: The actual API endpoint and method will depend on the Gemini image generation API
      // This is a placeholder structure that can be updated when we have the full API documentation

      console.log('Generated prompt for image:', prompt);

      // For now, return a fallback until we implement the actual API call
      return this.getFallbackImage(request);

      // TODO: Implement actual Gemini API call
      // const response = await fetch(`${this.baseUrl}/generateImage`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.apiKey}`
      //   },
      //   body: JSON.stringify({ prompt })
      // });
      //
      // const data = await response.json();
      // return {
      //   imageUrl: data.imageUrl,
      //   prompt: prompt,
      //   timestamp: Date.now()
      // };

    } catch (error) {
      console.error('Error generating image:', error);
      return this.getFallbackImage(request);
    }
  }

  /**
   * Create a pastel-themed prompt based on blog content
   */
  private createPastelPrompt(request: ImageGenerationRequest): string {
    const { title, category, excerpt } = request;
    const normalized = category.toLowerCase();

    // Category-specific pastel themes
    let themeDescription = '';
    if (normalized.includes('name')) {
      themeDescription = 'soft purple, pink, and lavender tones with baby name elements, gentle typography';
    } else if (normalized.includes('pregnan')) {
      themeDescription = 'pastel pink, rose, and peach tones with pregnancy symbols, maternal warmth';
    } else if (normalized.includes('milestone')) {
      themeDescription = 'soft blue, cyan, and sky tones with achievement symbols, growth elements';
    } else if (normalized.includes('gear')) {
      themeDescription = 'gentle green, mint, and sage tones with baby product icons, cozy items';
    } else if (normalized.includes('postpartum')) {
      themeDescription = 'light violet, lavender, and lilac tones with recovery symbols, nurturing elements';
    } else {
      themeDescription = 'soft indigo, periwinkle, and powder blue tones with general baby themes';
    }

    const basePrompt = `
Create a beautiful, soft pastel illustration for a baby/parenting blog post.

Title: "${title}"
Category: ${category}

Style Requirements:
- PASTEL COLOR PALETTE ONLY (light 300-400 shades, NO vibrant colors)
- ${themeDescription}
- Soft gradients and gentle transitions
- Minimalist, clean design
- Baby-friendly aesthetic
- Watercolor or soft digital art style
- No harsh lines or bright colors
- Dreamy, whimsical atmosphere
- Focus on comfort and warmth
- Age-appropriate (suitable for all audiences)
- Professional yet playful

Composition:
- Centered or balanced layout
- Generous white/negative space
- Subtle decorative elements (flowers, stars, clouds)
- No text or typography in the image
- 16:9 aspect ratio (landscape)
- High resolution, web-optimized
    `.trim();

    return basePrompt;
  }

  /**
   * Get fallback image based on category
   * Returns a data URL or placeholder image URL
   */
  private getFallbackImage(request: ImageGenerationRequest): ImageGenerationResult {
    const { category } = request;
    const normalized = category.toLowerCase();

    // For now, return a placeholder structure
    // In production, this could return category-specific placeholder images
    // or generate simple SVG gradients

    const gradientColors = this.getCategoryGradientColors(normalized);
    const svgDataUrl = this.createGradientSVG(gradientColors);

    return {
      imageUrl: svgDataUrl,
      prompt: this.createPastelPrompt(request),
      timestamp: Date.now()
    };
  }

  /**
   * Get pastel gradient colors for category
   */
  private getCategoryGradientColors(category: string): { from: string; via: string; to: string } {
    if (category.includes('name')) return { from: '#D8B4FE', via: '#F0ABFC', to: '#C084FC' };
    if (category.includes('pregnan')) return { from: '#FBCFE8', via: '#FDA4AF', to: '#F9A8D4' };
    if (category.includes('milestone')) return { from: '#93C5FD', via: '#67E8F9', to: '#7DD3FC' };
    if (category.includes('gear')) return { from: '#86EFAC', via: '#6EE7B7', to: '#34D399' };
    if (category.includes('postpartum')) return { from: '#DDD6FE', via: '#C4B5FD', to: '#A78BFA' };
    return { from: '#A5B4FC', via: '#93C5FD', to: '#818CF8' };
  }

  /**
   * Create a simple SVG gradient as fallback
   */
  private createGradientSVG(colors: { from: string; via: string; to: string }): string {
    const svg = `
<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.from};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.via};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.to};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#grad)" />

  <!-- Decorative sparkles -->
  <circle cx="200" cy="150" r="3" fill="white" opacity="0.6" />
  <circle cx="600" cy="100" r="2" fill="white" opacity="0.5" />
  <circle cx="400" cy="300" r="4" fill="white" opacity="0.7" />
  <circle cx="150" cy="350" r="2" fill="white" opacity="0.4" />
  <circle cx="650" cy="250" r="3" fill="white" opacity="0.6" />
  <circle cx="300" cy="200" r="2" fill="white" opacity="0.5" />
</svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Batch generate images for multiple blog posts
   */
  async generateBatchImages(requests: ImageGenerationRequest[]): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];

    for (const request of requests) {
      const result = await this.generateBlogImage(request);
      results.push(result);

      // Add delay to prevent rate limiting
      await this.delay(1000);
    }

    return results;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate API key
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}

// Export singleton instance
export const geminiImageService = new GeminiImageService();
export default geminiImageService;
