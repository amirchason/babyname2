/**
 * Origin Agent - Detects and assigns origins to all names
 * Uses top 10 most common origins for consistency
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Top 10 Name Origins (covers 95%+ of all names)
export const TOP_10_ORIGINS = [
  'Hebrew',    // Biblical names (David, Sarah, Michael, Elizabeth)
  'Greek',     // Classical names (Alexander, Sophia, Nicholas, Helen)
  'Latin',     // Roman names (Marcus, Victoria, Felix, Julia)
  'Germanic',  // German/English (William, Emma, Robert, Alice)
  'Arabic',    // Islamic names (Muhammad, Fatima, Omar, Aisha)
  'English',   // Anglo-Saxon (Edward, Ashley, Howard, Hazel)
  'French',    // French names (Pierre, Charlotte, Louis, Michelle)
  'Spanish',   // Hispanic names (Carlos, Maria, Diego, Isabel)
  'Celtic',    // Irish/Scottish (Liam, Bridget, Sean, Fiona)
  'Italian'    // Italian names (Giovanni, Isabella, Marco, Lucia)
] as const;

export type NameOrigin = typeof TOP_10_ORIGINS[number];

export interface NameWithOrigin {
  name: string;
  origin: NameOrigin;
  originProcessed?: boolean;
  processingDate?: string;
}

export interface ProcessingStatus {
  totalNames: number;
  processedCount: number;
  currentBatch: number;
  isProcessing: boolean;
  lastProcessedName?: string;
  errors: string[];
}

class OriginAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private processingStatus: ProcessingStatus;
  private batchSize = 100;
  private apiKey: string;
  private progressKey = 'originAgent_progress_v1';

  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    this.processingStatus = {
      totalNames: 0,
      processedCount: 0,
      currentBatch: 0,
      isProcessing: false,
      errors: []
    };

    this.loadProgress();
  }

  /**
   * Pattern-based origin detection (fast, no API calls)
   */
  private detectOriginByPattern(name: string): NameOrigin | null {
    const nameLower = name.toLowerCase();

    // Hebrew patterns
    if (/^(david|sarah|michael|daniel|rachel|samuel|ruth|hannah|jonathan|benjamin|elizabeth|jacob|joseph|mary|martha|miriam|nathaniel|rebecca|solomon|isaac|abraham|noah|adam|eve)$/i.test(name)) {
      return 'Hebrew';
    }

    // Arabic patterns
    if (/^(muhammad|mohammed|ahmed|ali|omar|hassan|hussein|fatima|aisha|khalid|abdullah|ibrahim|yusuf|mustafa|hamza)$/i.test(name) ||
        nameLower.startsWith('abdul') || nameLower.includes('allah')) {
      return 'Arabic';
    }

    // Greek patterns
    if (/^(alexander|sophia|nicholas|helen|george|theodore|peter|andrew|philip|stephen|christina|catherine|athena|diana|demetrius)$/i.test(name) ||
        name.endsWith('os') || name.endsWith('is') || name.endsWith('eus')) {
      return 'Greek';
    }

    // Latin patterns
    if (/^(marcus|julius|claudius|victoria|julia|felix|lucia|gloria|beatrice|caesar|augustus|maximus|valentina|aurora|luna)$/i.test(name) ||
        name.endsWith('us') || name.endsWith('ia') || name.endsWith('ius')) {
      return 'Latin';
    }

    // Spanish patterns
    if (/^(carlos|maria|jose|juan|miguel|antonio|francisco|manuel|pedro|diego|luis|javier|roberto|fernando|isabel|carmen)$/i.test(name) ||
        name.endsWith('ez') || name.endsWith('ito') || name.endsWith('ita')) {
      return 'Spanish';
    }

    // Italian patterns
    if (/^(giovanni|marco|francesco|giuseppe|antonio|roberto|stefano|isabella|lucia|francesca|giulia|chiara|alessandra)$/i.test(name) ||
        name.endsWith('ino') || name.endsWith('ina') || name.endsWith('ella')) {
      return 'Italian';
    }

    // French patterns
    if (/^(pierre|jean|jacques|louis|francois|henri|michel|marie|charlotte|sophie|claire|amelie|camille|julie)$/i.test(name) ||
        name.endsWith('ette') || name.endsWith('elle') || name.endsWith('eux')) {
      return 'French';
    }

    // Celtic patterns
    if (/^(liam|sean|patrick|brian|kevin|ryan|connor|dylan|aidan|bridget|siobhan|fiona|maeve|aisling|niamh)$/i.test(name) ||
        name.startsWith('mac') || name.startsWith('mc') || name.startsWith('o\'')) {
      return 'Celtic';
    }

    // Germanic patterns
    if (/^(william|robert|richard|henry|albert|frederick|wilhelm|otto|emma|alice|matilda|gertrude|hildegard)$/i.test(name) ||
        name.endsWith('bert') || name.endsWith('wald') || name.endsWith('gard')) {
      return 'Germanic';
    }

    return null;
  }

  /**
   * AI-based origin detection using Gemini
   */
  private async detectOriginWithAI(names: string[]): Promise<Map<string, NameOrigin>> {
    const results = new Map<string, NameOrigin>();

    // First try pattern matching for all names
    for (const name of names) {
      const patternOrigin = this.detectOriginByPattern(name);
      if (patternOrigin) {
        results.set(name, patternOrigin);
      }
    }

    // Get names that still need AI processing
    const unprocessedNames = names.filter(name => !results.has(name));

    if (unprocessedNames.length === 0) {
      return results;
    }

    // Process remaining names with AI
    try {
      const prompt = `Classify these names into EXACTLY one of these origins: ${TOP_10_ORIGINS.join(', ')}.

Names to classify:
${unprocessedNames.join(', ')}

Return a JSON array with format: [{"name": "John", "origin": "Hebrew"}, ...]
Only use the 10 origins provided. Choose the most likely origin for each name.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          for (const item of parsed) {
            if (item.name && TOP_10_ORIGINS.includes(item.origin)) {
              results.set(item.name, item.origin as NameOrigin);
            }
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          // Fallback to English for unparseable names
          for (const name of unprocessedNames) {
            if (!results.has(name)) {
              results.set(name, 'English');
            }
          }
        }
      }
    } catch (error) {
      console.error('AI detection error:', error);
      // Fallback to English origin
      for (const name of unprocessedNames) {
        if (!results.has(name)) {
          results.set(name, 'English');
        }
      }
    }

    return results;
  }

  /**
   * Process a batch of names
   */
  async processBatch(names: string[]): Promise<NameWithOrigin[]> {
    const origins = await this.detectOriginWithAI(names);
    const results: NameWithOrigin[] = [];

    for (const name of names) {
      results.push({
        name,
        origin: origins.get(name) || 'English', // Default to English
        originProcessed: true,
        processingDate: new Date().toISOString()
      });
    }

    return results;
  }

  /**
   * Process all names from a chunk file
   */
  async processChunk(chunkPath: string, onProgress?: (status: ProcessingStatus) => void): Promise<void> {
    console.log(`Processing chunk: ${chunkPath}`);

    try {
      // Load chunk data
      const response = await fetch(chunkPath);
      const data = await response.json();
      const allNames = data.names || [];

      this.processingStatus.totalNames = allNames.length;
      this.processingStatus.isProcessing = true;

      // Process in batches
      for (let i = 0; i < allNames.length; i += this.batchSize) {
        if (!this.processingStatus.isProcessing) {
          console.log('Processing stopped by user');
          break;
        }

        const batch = allNames.slice(i, Math.min(i + this.batchSize, allNames.length));
        const nameStrings = batch.map((n: any) => n.name || n);

        try {
          const processedBatch = await this.processBatch(nameStrings);

          // Update original names with origins
          for (let j = 0; j < batch.length; j++) {
            if (typeof batch[j] === 'object') {
              batch[j].origin = processedBatch[j].origin;
              batch[j].originProcessed = true;
            }
          }

          this.processingStatus.processedCount += batch.length;
          this.processingStatus.currentBatch = Math.floor(i / this.batchSize) + 1;
          this.processingStatus.lastProcessedName = nameStrings[nameStrings.length - 1];

          // Save progress
          this.saveProgress();

          // Callback
          if (onProgress) {
            onProgress(this.processingStatus);
          }

          console.log(`Processed ${this.processingStatus.processedCount}/${this.processingStatus.totalNames} names`);

          // Rate limiting delay
          await this.delay(1000);

        } catch (error) {
          console.error('Batch processing error:', error);
          this.processingStatus.errors.push(`Batch ${i}: ${error}`);
        }
      }

      // Save updated chunk
      await this.saveChunk(chunkPath, data);

    } catch (error) {
      console.error('Chunk processing error:', error);
      throw error;
    } finally {
      this.processingStatus.isProcessing = false;
      this.saveProgress();
    }
  }

  /**
   * Save updated chunk data
   */
  private async saveChunk(chunkPath: string, data: any): Promise<void> {
    // In a real implementation, this would save to the server
    // For now, we'll store in localStorage
    const key = `processed_${chunkPath.split('/').pop()}`;
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved processed chunk to localStorage: ${key}`);
  }

  /**
   * Save processing progress
   */
  private saveProgress(): void {
    localStorage.setItem(this.progressKey, JSON.stringify(this.processingStatus));
  }

  /**
   * Load processing progress
   */
  private loadProgress(): void {
    const saved = localStorage.getItem(this.progressKey);
    if (saved) {
      try {
        this.processingStatus = JSON.parse(saved);
        console.log('Loaded processing progress:', this.processingStatus);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }

  /**
   * Get current processing status
   */
  getStatus(): ProcessingStatus {
    return { ...this.processingStatus };
  }

  /**
   * Stop processing
   */
  stop(): void {
    this.processingStatus.isProcessing = false;
    this.saveProgress();
  }

  /**
   * Reset progress
   */
  reset(): void {
    this.processingStatus = {
      totalNames: 0,
      processedCount: 0,
      currentBatch: 0,
      isProcessing: false,
      errors: []
    };
    localStorage.removeItem(this.progressKey);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const originAgent = new OriginAgent();
export default originAgent;