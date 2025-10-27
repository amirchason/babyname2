const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA');

async function generateImage(prompt, outputPath) {
  try {
    console.log(`\n🎨 Generating image: ${prompt}`);

    // Note: As of January 2025, Gemini API doesn't support direct image generation
    // This is a placeholder that will need to be updated when Google adds this feature
    // For now, we'll create descriptive text that can be used with image generation services

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const enhancedPrompt = `Create a detailed visual description for an image that would accompany this blog post scene: ${prompt}.

    Focus on:
    - Emotional atmosphere
    - Lighting and color palette
    - Key visual elements
    - Composition and framing
    - Style (photographic, illustrative, etc.)

    Make it vivid and specific enough that an artist or AI image generator could create it.`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const description = response.text();

    console.log(`\n📝 Image description generated:`);
    console.log(description);
    console.log(`\n💾 This description can be used with:`);
    console.log(`   - DALL-E 3 (OpenAI)`);
    console.log(`   - Midjourney`);
    console.log(`   - Stable Diffusion`);
    console.log(`   - Adobe Firefly`);

    return {
      prompt,
      description,
      suggestedServices: ['DALL-E 3', 'Midjourney', 'Stable Diffusion', 'Adobe Firefly']
    };

  } catch (error) {
    console.error(`\n❌ Error generating image description:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Blog Post Image Description Generator');
  console.log('=========================================\n');
  console.log('Blog Post: The 3 AM Name Crisis - A New Dad\'s Journey');

  // Define the 4 images we want to generate descriptions for
  const imagePrompts = [
    {
      name: 'new-dad-3am-hospital',
      prompt: 'Exhausted new father in hospital room at 3 AM, soft dim lighting, holding sleeping newborn baby wrapped in white blanket, emotional close-up shot showing both tenderness and anxiety on father\'s face, hospital room background slightly blurred, warm color tones, photographic style'
    },
    {
      name: 'baby-name-lists-chaos',
      prompt: 'Bird\'s eye view of coffee table covered in scattered baby name books, printed lists with crossed-out names, laptop showing baby name websites, coffee mug, phone with baby name app, sticky notes everywhere, organized chaos representing months of research, warm afternoon lighting, realistic photography style'
    },
    {
      name: 'midnight-phone-search',
      prompt: 'Close-up of smartphone screen glowing in darkness showing Google search "names that won\'t get my kid beat up", bedside table with dim lamp, nighttime scene, emphasis on the phone screen illuminating anxious father\'s face partially visible, moody lighting, cinematic style'
    },
    {
      name: 'happy-family-resolution',
      prompt: 'New parents in hospital room, golden hour lighting through window, mother holding baby while father sits close looking at them with relief and love, peaceful satisfied atmosphere, baby named and loved, warm emotional family portrait, soft natural lighting, professional photography style'
    }
  ];

  const results = [];

  for (const imageData of imagePrompts) {
    const result = await generateImage(imageData.prompt, imageData.name);
    results.push({
      filename: imageData.name,
      ...result
    });

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save all descriptions to a JSON file
  const outputPath = path.join(__dirname, '..', 'blog-image-descriptions.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ All image descriptions saved to: ${outputPath}`);
  console.log(`\n📋 Summary:`);
  console.log(`   Generated: ${results.length} image descriptions`);
  console.log(`   These can be used with any AI image generation service`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Copy the descriptions from blog-image-descriptions.json`);
  console.log(`   2. Use them with DALL-E 3, Midjourney, or Stable Diffusion`);
  console.log(`   3. Save generated images to public/images/blog/`);
  console.log(`   4. Update the blog post JSON with actual image paths`);
}

main().catch(console.error);
