/**
 * Mock Gemini API Service
 * Generates realistic improvement suggestions and captions based on image analysis
 */

// Different suggestion sets based on image characteristics
const suggestionSets = {
  portrait: {
    improvements: [
      '✨ Enhance the portrait lighting by using natural backlighting to create a rim light effect',
      '📸 Adjust the white balance to bring out warmer skin tones',
      '🎯 Frame the subject using the rule of thirds for better composition',
      '💡 Reduce highlights using spot metering to prevent blown-out skin areas',
      '🎨 Add subtle vignetting to draw focus to the subject\'s face',
    ],
    captions: [
      'Captured in a moment of genuine emotion | Canon 5D Mark IV | f/1.8 | Natural light',
      'Portrait perfection in natural light ✨ | Nikon Z6 | 85mm lens',
      'The light, the moment, the soul 📸 #portraitphotography #naturallighting',
      'Beauty in simplicity | Shot at golden hour | Professional portrait series',
      'Every face tells a story | Cinematic portrait | Natural light preferred',
    ],
    hashtags: '#portraitphotography #naturallighting #canonphotography #cinematic #portraiture #faceportraits #lightingiseverything',
  },
  landscape: {
    improvements: [
      '🏔️ Use a wider aperture (f/2.8-f/4) to create depth between foreground and background',
      '⛅ Shoot during golden hour (sunrise/sunset) for warmer, more dramatic lighting',
      '🎨 Increase saturation slightly to make colors more vibrant without looking oversaturated',
      '📐 Use a tripod and enable grid lines for better composition and horizon alignment',
      '🌄 Add a strong foreground element to create depth and lead the viewer\'s eye',
    ],
    captions: [
      'Nature\'s masterpiece | Captured at golden hour | Landscape photography at its finest',
      'Breathtaking vista just waiting to be explored | 4K landscape | Drone photography',
      'Where the mountains meet the sky ⛰️ #landscapephotography #naturephotography',
      'Epic landscape moment | Professional composition | Shot at f/2.8 | Long exposure',
      'Mountain serenity | Sunset landscape | Nature\'s canvas',
    ],
    hashtags: '#landscapephotography #mountainphotography #goldenhoure #naturephotography #dronephotography #landscapephotographer #naturelovers',
  },
  food: {
    improvements: [
      '🍽️ Adjust the angle to 45 degrees for more appetizing presentation',
      '💡 Use diffused natural light from the side to highlight food texture',
      '📸 Add complementary props (utensils, ingredients) to tell a story',
      '🎨 Reduce exposure slightly to enhance color depth and richness',
      '✨ Clean up the plate edges and background for a more professional look',
    ],
    captions: [
      'Flavor meets visual art 🍽️ | Food photography masterclass | Styled to perfection',
      'Every bite matters | Food blogger approved | Deliciously presented | #foodporn',
      'Culinary excellence captured | Chef\'s special | Farm to table perfection',
      'Taste the beauty through the lens 📸 | Professional food styling | Michelin worthy',
      'Made with love, captured with passion | Gourmet presentation | Recipe coming soon',
    ],
    hashtags: '#foodphotography #foodblogger #instafood #foodstyling #culinaryarts #foodporn #recipeideas #cheflife',
  },
  product: {
    improvements: [
      '💎 Use a white or light background to make the product stand out',
      '🔆 Apply three-point lighting for professional product showcase',
      '🎯 Shoot from multiple angles to show product details and texture',
      '✨ Adjust contrast to enhance product features and edges',
      '📦 Include scale reference or lifestyle shot to show product size',
    ],
    captions: [
      'Premium product | Professional photography | Available now 🛍️ | Shop the link',
      'Stunning design meets functionality | Product spotlight | Limited edition release',
      'Crafted with precision | Quality that speaks for itself | Now in stock #shopping',
      'Elegance in every detail | Professional product showcase | Perfectly captured',
      'Innovation at its finest | Next-generation design | Check out our collection',
    ],
    hashtags: '#productphotography #ecommerce #shopnow #productlaunch #newrelease #productdesign #quality #luxurybrand',
  },
  nature: {
    improvements: [
      '🌿 Enhance green saturation to bring out foliage vibrancy',
      '💧 Use polarizing filter to reduce reflections and enhance colors',
      '🐦 Focus on interesting textures (leaves, bark, flowers) for detail shots',
      '🌅 Shoot in overcast conditions for soft, diffused light on nature subjects',
      '📍 Include context to show the subject\'s natural habitat',
    ],
    captions: [
      'Nature\'s intricate details 🌿 | Macro photography | Captured with wonder',
      'In the heart of the wild | Nature documentary style | Pure beauty',
      'Every leaf tells a story | Botanical photography | Natural ecosystems',
      'Petals of perfection | Flower photography | Nature at its finest | #botanical',
      'Wild and free | Nature conservation | Captured responsibly',
    ],
    hashtags: '#naturephotography #macrophotography #botanicalphotography #wildlifephotography #ecosystems #conservation #naturelovers #outdoorphotography',
  },
  selfie: {
    improvements: [
      '📱 Use the front-facing camera and find the most flattering angle (slightly above eye level)',
      '☀️ Position yourself in soft, diffused light (avoid harsh shadows)',
      '🎨 Clean your phone lens and use a grid for better composition',
      '✨ Apply light retouching to enhance skin tone without looking artificial',
      '🌟 Add genuine expression and emotion for authenticity',
    ],
    captions: [
      'Feeling myself today ✨ | Confidence is key | Self-love Sunday',
      'Just being me 📸 | Authentic vibes | Good hair, good day',
      'Living my best life | Self-care Sunday | Happiness looks good on me #selflove',
      'Embracing the moment | Genuine smile | Inner beauty shining through',
      'Real, raw, and unfiltered | Confidence check | Mental health matters',
    ],
    hashtags: '#selfie #selflove #authenticity #confidenceiskey #mentalhealth #goodvibes #positivenergy #beyourself',
  },
  travel: {
    improvements: [
      '🌍 Include iconic landmarks or recognizable locations in the frame',
      '📍 Add human elements (people, activities) to show scale and context',
      '🎨 Enhance colors to capture the vibrancy of the destination',
      '🌄 Use interesting foreground and background elements for depth',
      '🕐 Capture during unique times (golden hour, blue hour, busy markets)',
    ],
    captions: [
      'Wanderlust mode: ON 🌍 | Exploring the world | Travel blogger diaries',
      'Adventure awaits at every corner | Bucket list destination | Pure wanderlust',
      'Traveling with intention | Cultural exploration | Local experiences | #travelgram',
      'The world is my playground | Travel photography | #globetrotter #wanderer',
      'Finding magic in every destination | Travel memories | Journey over destination',
    ],
    hashtags: '#travel #wanderlust #travelgram #adventuretime #bucketlist #explormore #traveldiaries #passportready',
  },
};

/**
 * Analyze image and determine its category based on various heuristics
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {string} - Image category (portrait, landscape, food, product, nature, selfie, travel)
 */
function analyzeImageType(imageBuffer) {
  // In a real implementation, you would use image analysis APIs
  // For this mock, we'll use pseudo-random selection based on buffer characteristics
  if (!imageBuffer) return 'portrait'; // default

  const hash = imageBuffer.length % 7;
  const categories = ['portrait', 'landscape', 'food', 'product', 'nature', 'selfie', 'travel'];
  return categories[hash];
}

/**
 * Generate improvement suggestions based on image type
 * @param {string} imageType - The category of the image
 * @returns {Array} - Array of improvement suggestions
 */
function generateImprovements(imageType) {
  const suggestions = suggestionSets[imageType] || suggestionSets.portrait;
  // Return 3-5 random improvements from the set
  const count = 4;
  const shuffled = [...suggestions.improvements].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate captions based on image type
 * @param {string} imageType - The category of the image
 * @returns {Array} - Array of caption suggestions
 */
function generateCaptions(imageType) {
  const captions = suggestionSets[imageType] || suggestionSets.portrait;
  // Return 2-3 random captions from the set
  const count = 3;
  const shuffled = [...captions.captions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get hashtags based on image type
 * @param {string} imageType - The category of the image
 * @returns {string} - Hashtags string
 */
function getHashtags(imageType) {
  const tags = suggestionSets[imageType] || suggestionSets.portrait;
  return tags.hashtags;
}

/**
 * Generate content with text prompt and optional image
 * @param {string} text - Text prompt from user
 * @param {Buffer} imageBuffer - Optional image buffer
 * @returns {Object} - Generated content with suggestions and captions
 */
function generateContent(text, imageBuffer = null) {
  const imageType = analyzeImageType(imageBuffer);
  const improvements = generateImprovements(imageType);
  const captions = generateCaptions(imageType);
  const hashtags = getHashtags(imageType);

  // Craft a comprehensive response
  const response = `
📸 IMAGE ANALYSIS & OPTIMIZATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 DETECTED IMAGE TYPE: ${imageType.toUpperCase()}

📋 IMPROVEMENT SUGGESTIONS:
${improvements.map((sugg, i) => `${i + 1}. ${sugg}`).join('\n')}

💬 CAPTION SUGGESTIONS:
${captions.map((cap, i) => `${i + 1}. "${cap}"`).join('\n\n')}

#️⃣ RECOMMENDED HASHTAGS:
${hashtags}

✨ ENHANCEMENT TIPS:
• Edit in Lightroom or Photoshop for professional results
• Maintain your brand's visual consistency
• Test different captions to see which gets more engagement
• Use relevant hashtags to increase discoverability
• Post at optimal times (typically 11 AM - 2 PM local time)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated on: ${new Date().toLocaleString()}
Your prompt: "${text}"
  `;

  return {
    success: true,
    generatedContent: response.trim(),
    imageType: imageType,
    improvements: improvements,
    captions: captions,
    hashtags: hashtags,
    inputText: text,
    hasImage: !!imageBuffer,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate multiple variations of captions
 * @param {string} text - Text prompt
 * @param {Buffer} imageBuffer - Optional image buffer
 * @param {number} count - Number of variations (default: 3)
 * @returns {Array} - Array of caption variations
 */
function generateVariations(text, imageBuffer = null, count = 3) {
  const imageType = analyzeImageType(imageBuffer);
  const allCaptions = suggestionSets[imageType] || suggestionSets.portrait;
  
  // Get unique captions
  const shuffled = [...allCaptions.captions].sort(() => Math.random() - 0.5);
  const variations = shuffled.slice(0, Math.min(count, shuffled.length));

  return variations;
}

module.exports = {
  generateContent,
  generateVariations,
  analyzeImageType,
  generateImprovements,
  generateCaptions,
  getHashtags,
};
