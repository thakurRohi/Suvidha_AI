const axios = require('axios');

class AIService {
  constructor() {
    this.service = process.env.AI_SERVICE || 'gemini';
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    // Support multiple Gemini keys for rotation
    this.geminiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
    ].filter(Boolean); // Remove undefined keys
    
    this.currentKeyIndex = 0;
    this.geminiKey = this.geminiKeys[0]; // Use first key initially
  }
  
  // Rotate to next Gemini API key
  rotateGeminiKey() {
    if (this.geminiKeys.length > 1) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.geminiKeys.length;
      this.geminiKey = this.geminiKeys[this.currentKeyIndex];
      console.log(`🔄 Rotated to Gemini API key ${this.currentKeyIndex + 1} of ${this.geminiKeys.length}`);
    }
  }

  async generateAllContent(imageDescription, tone = 'engaging', userNiche = 'general') {
    console.log('🚀 Starting AI content generation...');
    
    // SKIP AI IF NO KEY CONFIGURED - go straight to fallback
    if (!this.geminiKey && !this.openaiKey && !this.anthropicKey) {
      console.log('⚠️  No AI API key configured - using fallback data');
      return this.getFallbackAllContent(tone, userNiche, imageDescription);
    }

    const prompt = `You are an expert Instagram content optimizer. Analyze this ${userNiche} post and provide comprehensive suggestions.

Image description: ${imageDescription}
Caption tone: ${tone}

Generate ALL of the following in ONE response:

1. THREE unique Instagram captions (${tone} tone)
2. TWENTY hashtags (mix of high, medium, low volume)
3. Content analysis (detected objects, colors, mood, description)
4. Best posting time
5. Three improvement suggestions
6. Three engagement tips

Return ONLY valid JSON in this EXACT format (no markdown, no backticks):
{
  "captions": [
    {"text": "caption 1 with emojis", "tone": "${tone}"},
    {"text": "caption 2 with emojis", "tone": "${tone}"},
    {"text": "caption 3 with emojis", "tone": "${tone}"}
  ],
  "hashtags": [
    {"tag": "hashtagname", "category": "high-volume"},
    {"tag": "hashtagname", "category": "medium-volume"},
    {"tag": "hashtagname", "category": "low-volume"}
  ],
  "analysis": {
    "detectedObjects": ["object1", "object2", "object3"],
    "colors": ["color1", "color2"],
    "mood": "mood",
    "description": "one sentence description"
  },
  "suggestions": {
    "bestPostingTime": "morning/afternoon/evening",
    "improvements": ["tip1", "tip2", "tip3"],
    "engagementTips": ["tip1", "tip2", "tip3"]
  }
}`;

    try {
      console.log('📡 Calling AI API...');
      const response = await Promise.race([
        this.callAI(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI API timeout after 30 seconds')), 30000)
        )
      ]);
      
      console.log('✅ Got AI response, parsing...');
      const parsed = this.parseAllContentResponse(response);
      
      // Verify we got valid data
      if (!parsed.captions || parsed.captions.length === 0) {
        throw new Error('Invalid AI response - no captions generated');
      }
      
      console.log('✅ AI content generation successful!');
      return parsed;
      
    } catch (error) {
      console.error('❌ AI API Error:', error.message);
      console.log('🔄 Using fallback data instead...');
      return this.getFallbackAllContent(tone, userNiche, imageDescription);
    }
  }

  parseAllContentResponse(response) {
    try {
      // Remove markdown code blocks if present
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      return {
        captions: parsed.captions || [],
        hashtags: parsed.hashtags || [],
        analysis: parsed.analysis || {},
        suggestions: parsed.suggestions || {}
      };
    } catch (error) {
      console.error('Error parsing all content:', error);
      return this.getFallbackAllContent('engaging', 'general', '');
    }
  }

  getFallbackAllContent(tone, niche, imageDescription = '') {
    // Analyze image description for characteristics
    const desc = imageDescription.toLowerCase();

    // Detect image characteristics
    const isDark = desc.includes('dark') || desc.includes('night') || desc.includes('low light') || desc.includes('dim');
    const isBright = desc.includes('bright') || desc.includes('sunny') || desc.includes('daylight') || desc.includes('sunlight');
    const isPortrait = desc.includes('portrait') || desc.includes('person') || desc.includes('face') || desc.includes('selfie');
    const isLandscape = desc.includes('landscape') || desc.includes('nature') || desc.includes('scenery') || desc.includes('outdoor');
    const isFood = desc.includes('food') || desc.includes('meal') || desc.includes('dish') || desc.includes('drink');
    const isCloseUp = desc.includes('close-up') || desc.includes('macro') || desc.includes('detail');
    const isWideAngle = desc.includes('wide') || desc.includes('panorama') || desc.includes('group');

    // Generate context-aware suggestions
    let improvements = [];
    let engagementTips = [];
    let bestPostingTime = 'afternoon';
    let detectedObjects = ['content', 'image'];
    let colors = ['vibrant', 'natural'];
    let mood = 'engaging';
    let description = 'An interesting post ready to be shared';

    if (isDark) {
      improvements = [
        '💡 Increase exposure by 1-2 stops to brighten the image',
        '📱 Use a tripod or stabilize your phone for sharper shots in low light',
        '🔦 Add artificial lighting or use the phone flash for better illumination',
        '📐 Shoot during golden hour (sunrise/sunset) when natural light is softer',
        '🎯 Focus on interesting shadows and silhouettes for dramatic effect'
      ];
      engagementTips = [
        'Ask followers about their favorite night photography spots',
        'Create a series of before/after lighting comparisons',
        'Use nighttime-themed emojis in your caption',
        'Tag photography communities for night shot enthusiasts'
      ];
      bestPostingTime = 'evening';
      detectedObjects = ['low light scene', 'shadows', 'ambient lighting'];
      colors = ['deep blues', 'warm ambers', 'contrasting tones'];
      mood = 'mysterious';
      description = 'A moody, atmospheric shot captured in challenging lighting conditions';
    } else if (isBright) {
      improvements = [
        '☀️ Use a polarizing filter to reduce glare and enhance colors',
        '📷 Enable HDR mode to balance bright highlights and dark shadows',
        '👓 Wear sunglasses or use a lens hood to reduce lens flare',
        '⏰ Shoot during the golden hour for more flattering light',
        '🎨 Adjust white balance to match the warm, bright lighting'
      ];
      engagementTips = [
        'Share the exact time and location of the shot',
        'Ask followers about their favorite sunny day activities',
        'Use bright, energetic emojis that match the mood',
        'Create a "bright and beautiful" themed carousel'
      ];
      bestPostingTime = 'morning';
      detectedObjects = ['bright scene', 'highlights', 'natural light'];
      colors = ['vibrant primaries', 'warm tones', 'high contrast'];
      mood = 'energetic';
      description = 'A bright, vibrant shot full of natural light and energy';
    } else if (isPortrait) {
      improvements = [
        '👤 Use the rule of thirds - place eyes along the top horizontal line',
        '💡 Position the light source at a 45-degree angle to your subject',
        '📱 Shoot at eye level for more engaging, personal portraits',
        '🎭 Encourage natural expressions and genuine emotions',
        '🔄 Try different angles - shoot from below for confidence, above for approachability'
      ];
      engagementTips = [
        'Ask followers to share their portrait photography tips',
        'Create a "portrait series" with multiple shots of the same person',
        'Tag the person in the photo and ask for their favorite memory',
        'Use storytelling captions about the person or moment captured'
      ];
      bestPostingTime = 'afternoon';
      detectedObjects = ['person', 'facial features', 'expression'];
      colors = ['skin tones', 'background colors', 'clothing colors'];
      mood = 'personal';
      description = 'An intimate portrait capturing personality and emotion';
    } else if (isLandscape) {
      improvements = [
        '🏔️ Include a foreground element to create depth and scale',
        '📐 Use leading lines (roads, rivers, fences) to guide the viewer\'s eye',
        '⛅ Shoot during golden hour for dramatic lighting and long shadows',
        '📷 Use a wide-angle lens or panorama mode for expansive scenes',
        '🌅 Wait for interesting weather or cloud formations'
      ];
      engagementTips = [
        'Ask followers where they would visit this location',
        'Share interesting facts about the location or landscape',
        'Create a "hidden gems" series featuring lesser-known spots',
        'Use location tags to help others discover the place'
      ];
      bestPostingTime = 'morning';
      detectedObjects = ['natural scenery', 'landforms', 'vegetation'];
      colors = ['earth tones', 'sky colors', 'seasonal colors'];
      mood = 'peaceful';
      description = 'A breathtaking landscape showcasing the beauty of nature';
    } else if (isFood) {
      improvements = [
        '🍽️ Shoot from a 45-degree angle for the most appetizing presentation',
        '💡 Use natural window light from the side to create appealing shadows',
        '📷 Style the food with complementary colors and garnishes',
        '🔪 Clean plate edges and remove distractions from the background',
        '💧 Add steam or freshness indicators (water droplets, herbs)'
      ];
      engagementTips = [
        'Share the recipe or ask followers for their favorite variations',
        'Ask followers about their favorite comfort foods',
        'Create a "food series" featuring different cuisines or meals',
        'Tag restaurants or food brands for potential collaborations'
      ];
      bestPostingTime = 'evening';
      detectedObjects = ['food items', 'ingredients', 'presentation'];
      colors = ['appetizing colors', 'fresh produce tones', 'plate colors'];
      mood = 'appetizing';
      description = 'A delicious-looking dish ready to tempt food lovers';
    } else if (isCloseUp) {
      improvements = [
        '🔍 Use macro mode or get closer to capture fine details',
        '📷 Increase shutter speed to freeze motion in detailed subjects',
        '💡 Use diffused lighting to avoid harsh shadows on small subjects',
        '📐 Fill the frame with your subject for maximum impact',
        '🎯 Focus on textures, patterns, and interesting details'
      ];
      engagementTips = [
        'Ask followers what they notice in the details',
        'Create a "macro monday" series featuring close-up photography',
        'Share interesting facts about the subject being photographed',
        'Challenge followers to find similar details in their environment'
      ];
      bestPostingTime = 'afternoon';
      detectedObjects = ['fine details', 'textures', 'patterns'];
      colors = ['detailed colors', 'subtle variations', 'focused tones'];
      mood = 'intricate';
      description = 'A detailed close-up revealing the beauty in small things';
    } else if (isWideAngle) {
      improvements = [
        '📐 Keep the horizon level using grid lines in your camera app',
        '🏢 Include interesting foreground elements for depth',
        '👥 Position people using the rule of thirds for balanced composition',
        '🌅 Shoot during golden hour for the most flattering wide-angle light',
        '📱 Use panorama mode for ultra-wide scenes'
      ];
      engagementTips = [
        'Ask followers to identify different elements in the wide shot',
        'Share the story of what was happening when the photo was taken',
        'Create a "wide-angle wonders" series showcasing expansive scenes',
        'Tag locations and ask followers about their favorite wide-angle spots'
      ];
      bestPostingTime = 'morning';
      detectedObjects = ['expansive scene', 'multiple elements', 'wide composition'];
      colors = ['varied tones', 'complementary colors', 'balanced palette'];
      mood = 'expansive';
      description = 'A wide-angle shot capturing the full scope of a scene';
    } else {
      // Generic improvements for unrecognized content
      improvements = [
        '📷 Experiment with different shooting angles for more dynamic composition',
        '💡 Adjust lighting to better highlight your subject',
        '🎨 Consider the rule of thirds for better visual balance',
        '📱 Clean up distracting elements in the background',
        '✨ Add personal touches or styling to make the image unique'
      ];
      engagementTips = [
        'Ask followers a question related to your content',
        'Share a personal story or memory connected to the image',
        'Use relevant emojis to make your caption more engaging',
        'Post consistently to build and maintain audience engagement'
      ];
    }

    return {
      captions: this.getFallbackCaptions(tone),
      hashtags: this.getFallbackHashtags(niche),
      analysis: {
        detectedObjects,
        colors,
        mood,
        description
      },
      suggestions: {
        bestPostingTime,
        improvements: improvements.slice(0, 3), // Return top 3 improvements
        engagementTips: engagementTips.slice(0, 3) // Return top 3 tips
      }
    };
  }

  async generateCaptions(imageDescription, tone = 'engaging', userNiche = 'general') {
    const prompt = `You are an expert Instagram content creator. Generate 3 compelling Instagram captions for a ${userNiche} post.

Image description: ${imageDescription}

Tone: ${tone}

Requirements:
- Each caption should be unique and ${tone}
- Include relevant emojis
- Make them engaging and likely to get high engagement
- Keep them concise (1-3 sentences each)
- Don't include hashtags (those will be separate)

Return the response in this exact JSON format:
{
  "captions": [
    {"text": "caption 1", "tone": "${tone}"},
    {"text": "caption 2", "tone": "${tone}"},
    {"text": "caption 3", "tone": "${tone}"}
  ]
}`;

    try {
      const response = await this.callAI(prompt);
      return this.parseCaptionsResponse(response);
    } catch (error) {
      console.error('Error generating captions:', error.message);
      return this.getFallbackCaptions(tone);
    }
  }

  async generateHashtags(imageDescription, userNiche = 'general') {
    const prompt = `You are an expert in Instagram hashtag strategy. Generate 20 relevant hashtags for this ${userNiche} Instagram post.

Image description: ${imageDescription}

Requirements:
- Mix of popular (high volume) and niche (targeted) hashtags
- Include 5-7 high-volume hashtags (500k+ posts)
- Include 8-10 medium-volume hashtags (50k-500k posts)
- Include 5-7 low-volume hashtags (under 50k posts)
- All hashtags must be relevant to the content
- Don't include the # symbol

Return the response in this exact JSON format:
{
  "hashtags": [
    {"tag": "hashtagname", "category": "high-volume"},
    {"tag": "hashtagname", "category": "medium-volume"},
    {"tag": "hashtagname", "category": "low-volume"}
  ]
}`;

    try {
      const response = await this.callAI(prompt);
      return this.parseHashtagsResponse(response);
    } catch (error) {
      console.error('Error generating hashtags:', error.message);
      return this.getFallbackHashtags(userNiche);
    }
  }

  async analyzeContent(imageDescription, userNiche = 'general') {
    const prompt = `You are an expert Instagram content analyst. Analyze this image and provide insights.

Image description: ${imageDescription}
User niche: ${userNiche}

Provide:
1. Detected objects/subjects (list 3-5 main elements)
2. Dominant colors (list 2-3)
3. Overall mood/vibe (one word)
4. A brief engaging description (one sentence)
5. Best posting time (morning/afternoon/evening)
6. 3 improvement suggestions
7. 3 engagement tips

Return the response in this exact JSON format:
{
  "detectedObjects": ["object1", "object2", "object3"],
  "colors": ["color1", "color2"],
  "mood": "mood",
  "description": "description",
  "bestPostingTime": "time",
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "engagementTips": ["tip1", "tip2", "tip3"]
}`;

    try {
      const response = await this.callAI(prompt);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Error analyzing content:', error.message);
      return this.getFallbackAnalysis();
    }
  }

  async callAI(prompt) {
    if (this.service === 'openai' && this.openaiKey) {
      return await this.callOpenAI(prompt);
    } else if (this.service === 'anthropic' && this.anthropicKey) {
      return await this.callAnthropic(prompt);
    } else if (this.service === 'gemini' && this.geminiKey) {
      return await this.callGemini(prompt);
    } else {
      throw new Error('No AI service configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in .env file');
    }
  }

  async callOpenAI(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async callAnthropic(prompt) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': this.anthropicKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
      }
    );
    return response.data.content[0].text;
  }

  async callGemini(prompt, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`🔑 Using Gemini API key ${this.currentKeyIndex + 1} of ${this.geminiKeys.length}`);
        console.log(`📡 Attempt ${attempt + 1}/${retries} to call Gemini API...`);
        
        // Use the latest available Gemini model (2.0-flash is latest, fallback to 1.5-flash)
        const modelName = 'gemini-2.0-flash';
        
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.geminiKey}`,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
          }
        );
        
        console.log('✅ Gemini API call successful!');
        return response.data.candidates[0].content.parts[0].text;
        
      } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.error(`❌ Gemini API error (attempt ${attempt + 1}):`, errorMsg);
        
        // Check for rate limit (429) or quota errors
        if (error.response && (error.response.status === 429 || error.response.status === 403)) {
          
          // Try rotating to next key if available
          if (this.geminiKeys.length > 1) {
            this.rotateGeminiKey();
            console.log(`🔄 Switched to API key ${this.currentKeyIndex + 1}, retrying...`);
            continue;
          }
          
          // If no more keys or last attempt, wait
          if (attempt < retries - 1) {
            const waitTime = Math.pow(2, attempt + 1) * 5000; // 10s, 20s, 40s
            console.log(`⏳ Rate limited! Waiting ${waitTime/1000} seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            console.log('❌ All retries exhausted. Rate limit still active.');
            throw new Error('Gemini API rate limit exceeded. Try: 1) Wait 60 seconds, 2) Use multiple API keys, or 3) Switch to OpenAI/Claude');
          }
        }
        
        // For other errors, throw immediately
        throw new Error(`Gemini API error: ${errorMsg}`);
      }
    }
  }

  parseCaptionsResponse(response) {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed.captions || [];
    } catch (error) {
      console.error('Error parsing captions:', error);
      return this.getFallbackCaptions('engaging');
    }
  }

  parseHashtagsResponse(response) {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed.hashtags || [];
    } catch (error) {
      console.error('Error parsing hashtags:', error);
      return this.getFallbackHashtags('general');
    }
  }

  parseAnalysisResponse(response) {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        detectedObjects: parsed.detectedObjects || [],
        colors: parsed.colors || [],
        mood: parsed.mood || 'neutral',
        description: parsed.description || '',
        bestPostingTime: parsed.bestPostingTime || 'afternoon',
        improvements: parsed.improvements || [],
        engagementTips: parsed.engagementTips || []
      };
    } catch (error) {
      console.error('Error parsing analysis:', error);
      return this.getFallbackAnalysis();
    }
  }

  getFallbackCaptions(tone) {
    return [
      { text: "✨ New moment captured! What do you think? 📸", tone: tone },
      { text: "Loving this vibe! 💫 Drop a ❤️ if you agree!", tone: tone },
      { text: "Making memories one post at a time 🌟", tone: tone }
    ];
  }

  getFallbackHashtags(niche) {
    const common = [
      { tag: 'instagram', category: 'high-volume' },
      { tag: 'instagood', category: 'high-volume' },
      { tag: 'photooftheday', category: 'high-volume' },
      { tag: 'love', category: 'high-volume' },
      { tag: 'beautiful', category: 'medium-volume' },
      { tag: 'happy', category: 'medium-volume' },
      { tag: 'follow', category: 'medium-volume' },
      { tag: 'like4like', category: 'medium-volume' },
      { tag: niche, category: 'low-volume' },
      { tag: `${niche}gram`, category: 'low-volume' }
    ];
    return common;
  }

  getFallbackAnalysis() {
    return {
      detectedObjects: ['content', 'image'],
      colors: ['vibrant', 'natural'],
      mood: 'engaging',
      description: 'An interesting post ready to be shared',
      bestPostingTime: 'afternoon',
      improvements: [
        'Consider adding more lighting',
        'Try different angles',
        'Experiment with filters'
      ],
      engagementTips: [
        'Ask a question in your caption',
        'Use story stickers to boost engagement',
        'Post consistently'
      ]
    };
  }

  // ============ NEW ANALYTICS FEATURES ============

  // Generate unique analytics for the post
  async generateAnalytics(imageDescription, userNiche = 'general', previousAnalyses = []) {
    const prompt = `You are an Instagram analytics expert. Generate unique performance metrics and predictions for this ${userNiche} post.

Image description: ${imageDescription}
User niche: ${userNiche}
This is analysis attempt #${previousAnalyses.length + 1}

Provide analytics in this JSON format:
{
  "engagementScore": <0-100>,
  "predictedLikes": <number>,
  "predictedComments": <number>,
  "predictedShares": <number>,
  "audienceDemographics": ["age_group1", "interest1", "interest2"],
  "contentQuality": {
    "visualScore": <0-100>,
    "captionScore": <0-100>,
    "overallScore": <0-100>
  },
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "trendingFactors": ["trend1", "trend2"],
  "seasonalTiming": "best_season_for_this_content"
}`;

    try {
      const response = await this.callAI(prompt);
      return this.parseAnalyticsResponse(response);
    } catch (error) {
      console.error('Error generating analytics:', error.message);
      return this.getFallbackAnalytics();
    }
  }

  parseAnalyticsResponse(response) {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        engagementScore: parsed.engagementScore || 65,
        predictedLikes: parsed.predictedLikes || Math.floor(Math.random() * 500 + 100),
        predictedComments: parsed.predictedComments || Math.floor(Math.random() * 50 + 10),
        predictedShares: parsed.predictedShares || Math.floor(Math.random() * 20 + 5),
        audienceDemographics: parsed.audienceDemographics || ['18-25', 'photography', 'lifestyle'],
        contentQuality: parsed.contentQuality || {
          visualScore: 75,
          captionScore: 70,
          overallScore: 72
        },
        recommendations: parsed.recommendations || [],
        trendingFactors: parsed.trendingFactors || [],
        seasonalTiming: parsed.seasonalTiming || 'year-round'
      };
    } catch (error) {
      console.error('Error parsing analytics:', error);
      return this.getFallbackAnalytics();
    }
  }

  getFallbackAnalytics() {
    return {
      engagementScore: 68,
      predictedLikes: Math.floor(Math.random() * 500 + 100),
      predictedComments: Math.floor(Math.random() * 50 + 10),
      predictedShares: Math.floor(Math.random() * 20 + 5),
      audienceDemographics: ['18-30', 'engaged_users', 'social_media_enthusiasts'],
      contentQuality: {
        visualScore: 75,
        captionScore: 70,
        overallScore: 72
      },
      recommendations: [
        'Use more storytelling in captions',
        'Add calls-to-action to boost engagement',
        'Consider posting at peak hours'
      ],
      trendingFactors: ['visual_appeal', 'authentic_content'],
      seasonalTiming: 'year-round'
    };
  }

  // Generate alternative captions with different tones and approaches
  async generateAlternativeCaptions(imageDescription, userNiche = 'general', existingCaptions = []) {
    const prompt = `You are a creative Instagram copywriter. Generate 5 completely different captions for a ${userNiche} post.

Image description: ${imageDescription}

Requirements:
- Each caption must be UNIQUE and different in style/approach
- Include: professional, casual, emotional, funny, and motivational variations
- Include relevant emojis
- Make them unique from any previous versions
- Don't repeat: ${existingCaptions.map(c => c.caption).join(' | ') || 'none'}

Return JSON format:
{
  "captions": [
    {"text": "caption", "tone": "professional", "style": "description"},
    {"text": "caption", "tone": "casual", "style": "description"},
    {"text": "caption", "tone": "emotional", "style": "description"},
    {"text": "caption", "tone": "funny", "style": "description"},
    {"text": "caption", "tone": "motivational", "style": "description"}
  ]
}`;

    try {
      const response = await this.callAI(prompt);
      return this.parseAlternativeCaptionsResponse(response);
    } catch (error) {
      console.error('Error generating alternative captions:', error.message);
      return this.getFallbackAlternativeCaptions();
    }
  }

  parseAlternativeCaptionsResponse(response) {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed.captions || [];
    } catch (error) {
      console.error('Error parsing alternative captions:', error);
      return this.getFallbackAlternativeCaptions();
    }
  }

  getFallbackAlternativeCaptions() {
    return [
      { text: "Capturing moments that matter 📸✨", tone: "professional", style: "minimalist" },
      { text: "Just vibing with this one 😎 What do you think?", tone: "casual", style: "friendly" },
      { text: "This picture means everything to me 💚 #grateful", tone: "emotional", style: "heartfelt" },
      { text: "When the camera catches you mid-laugh 😂🎉", tone: "funny", style: "humorous" },
      { text: "Every moment is an opportunity to create something beautiful 🌟", tone: "motivational", style: "inspiring" }
    ];
  }

  // Generate hashtag variations with trending analysis
  async generateHashtagVariations(imageDescription, userNiche = 'general', existingHashtags = []) {
    const prompt = `You are a hashtag strategy expert. Generate 2 different hashtag sets (20 each) for a ${userNiche} Instagram post.

Image description: ${imageDescription}

Requirements:
- SET 1: Maximum reach (high-volume, trending, popular)
- SET 2: Niche engagement (specific, targeted, underrated gems)
- Mix of all volume categories in each set
- Don't repeat: ${existingHashtags.map(h => h.tag).join(', ') || 'none'}

Return JSON format:
{
  "sets": [
    {
      "strategy": "maximum_reach",
      "hashtags": [
        {"tag": "hashtag", "category": "high-volume"},
        ...
      ]
    },
    {
      "strategy": "niche_engagement",
      "hashtags": [
        {"tag": "hashtag", "category": "low-volume"},
        ...
      ]
    }
  ]
}`;

    try {
      const response = await this.callAI(prompt);
      return this.parseHashtagVariationsResponse(response);
    } catch (error) {
      console.error('Error generating hashtag variations:', error.message);
      return this.getFallbackHashtagVariations(userNiche);
    }
  }

  parseHashtagVariationsResponse(response) {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed.sets || [];
    } catch (error) {
      console.error('Error parsing hashtag variations:', error);
      return this.getFallbackHashtagVariations('general');
    }
  }

  getFallbackHashtagVariations(niche) {
    return [
      {
        strategy: "maximum_reach",
        hashtags: [
          { tag: 'instagram', category: 'high-volume' },
          { tag: 'instagood', category: 'high-volume' },
          { tag: 'photooftheday', category: 'high-volume' },
          { tag: 'instapost', category: 'high-volume' },
          { tag: 'socialmedia', category: 'medium-volume' },
          { tag: 'content', category: 'medium-volume' }
        ]
      },
      {
        strategy: "niche_engagement",
        hashtags: [
          { tag: niche, category: 'low-volume' },
          { tag: `${niche}content`, category: 'low-volume' },
          { tag: `${niche}community`, category: 'low-volume' }
        ]
      }
    ];
  }

  // Analyze caption effectiveness
  async analyzeCaptionEffectiveness(captions, imageDescription, userNiche = 'general') {
    const captionTexts = Array.isArray(captions) 
      ? captions.map(c => c.text || c.caption).join('\n---\n')
      : captions;

    const prompt = `You are an Instagram caption analyst. Analyze these captions for effectiveness.

Captions:
${captionTexts}

Image description: ${imageDescription}
User niche: ${userNiche}

Return analysis in JSON format:
{
  "captionScores": [
    {
      "text": "caption_preview",
      "score": <0-100>,
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "callToActionScore": <0-100>,
      "emotionalAppeals": ["appeal1", "appeal2"],
      "recommendedFix": "specific_improvement"
    }
  ],
  "bestCaption": "which_one_to_use",
  "combinationTip": "how_to_improve_overall"
}`;

    try {
      const response = await this.callAI(prompt);
      return this.parseCaptionAnalysisResponse(response);
    } catch (error) {
      console.error('Error analyzing captions:', error.message);
      return this.getFallbackCaptionAnalysis();
    }
  }

  parseCaptionAnalysisResponse(response) {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        captionScores: parsed.captionScores || [],
        bestCaption: parsed.bestCaption || 'First caption',
        combinationTip: parsed.combinationTip || ''
      };
    } catch (error) {
      console.error('Error parsing caption analysis:', error);
      return this.getFallbackCaptionAnalysis();
    }
  }

  getFallbackCaptionAnalysis() {
    return {
      captionScores: [
        {
          score: 75,
          strengths: ['Good emojis', 'Engaging tone'],
          weaknesses: ['Could have CTA'],
          callToActionScore: 60,
          emotionalAppeals: ['Connection', 'Authenticity'],
          recommendedFix: 'Add a question to encourage comments'
        }
      ],
      bestCaption: 'First caption recommended',
      combinationTip: 'The first caption has the best balance of emotion and engagement'
    };
  }

  // Generate performance report
  generatePerformanceReport(analytics, captions, hashtags) {
    const engagementLevel = analytics.engagementScore >= 80 ? 'High' : analytics.engagementScore >= 60 ? 'Medium' : 'Low';
    const predictedTotalEngagement = analytics.predictedLikes + analytics.predictedComments + analytics.predictedShares;

    return {
      summary: {
        engagementLevel,
        predictedTotalEngagement,
        recommendedAudience: analytics.audienceDemographics.join(', '),
        bestTimeToPost: analytics.seasonalTiming
      },
      contentMetrics: {
        visualQuality: analytics.contentQuality.visualScore,
        copyQuality: analytics.contentQuality.captionScore,
        overallQuality: analytics.contentQuality.overallScore
      },
      engagementPrediction: {
        likes: analytics.predictedLikes,
        comments: analytics.predictedComments,
        shares: analytics.predictedShares,
        total: predictedTotalEngagement
      },
      strategicRecommendations: analytics.recommendations,
      hashtagStrategy: {
        totalHashtags: hashtags.length,
        highVolume: hashtags.filter(h => h.category === 'high-volume').length,
        mediumVolume: hashtags.filter(h => h.category === 'medium-volume').length,
        lowVolume: hashtags.filter(h => h.category === 'low-volume').length
      },
      captionOptions: captions.length,
      generatedAt: new Date()
    };
  }

  // Generate unique hash for content variation tracking
  generateContentHash(imageDescription, tone) {
    const crypto = require('crypto');
    const content = `${imageDescription}-${tone}-${Date.now()}`;
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 12);
  }

  // Check variation diversity
  checkVariationDiversity(currentSuggestions, previousSuggestions) {
    if (!previousSuggestions || previousSuggestions.length === 0) {
      return { isDiverse: true, diversityScore: 100, variations: 1 };
    }

    let duplicateCount = 0;
    const currentCaptions = currentSuggestions.captions.map(c => c.text);
    const previousCaptions = previousSuggestions.flatMap(s => s.captions.map(c => c.text || c.caption));

    duplicateCount = currentCaptions.filter(cap => 
      previousCaptions.some(prev => 
        prev.toLowerCase().includes(cap.toLowerCase().substring(0, 20))
      )
    ).length;

    const diversityScore = Math.max(0, 100 - (duplicateCount * 25));
    
    return {
      isDiverse: diversityScore >= 75,
      diversityScore,
      variations: previousSuggestions.length + 1,
      newSuggestions: currentSuggestions.captions.length - duplicateCount
    };
  }

  // Test API connectivity
  async testConnection() {
    console.log('\n🧪 Testing AI Service Connectivity...\n');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test Gemini
    if (this.geminiKey) {
      try {
        console.log('Testing Gemini API...');
        const testPrompt = 'Say "Gemini API is working" in exactly 5 words.';
        const response = await Promise.race([
          this.callGemini(testPrompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]);
        results.tests.gemini = { status: 'success', message: response.substring(0, 50), timestamp: new Date() };
        console.log('✅ Gemini: Working');
      } catch (error) {
        results.tests.gemini = { status: 'failed', error: error.message, timestamp: new Date() };
        console.log('❌ Gemini:', error.message);
      }
    }

    // Test OpenAI
    if (this.openaiKey) {
      try {
        console.log('Testing OpenAI API...');
        const testPrompt = 'Say "OpenAI is working" in exactly 4 words.';
        const response = await Promise.race([
          this.callOpenAI(testPrompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]);
        results.tests.openai = { status: 'success', message: response.substring(0, 50), timestamp: new Date() };
        console.log('✅ OpenAI: Working');
      } catch (error) {
        results.tests.openai = { status: 'failed', error: error.message, timestamp: new Date() };
        console.log('❌ OpenAI:', error.message);
      }
    }

    // Test Anthropic
    if (this.anthropicKey) {
      try {
        console.log('Testing Anthropic API...');
        const testPrompt = 'Say "Claude is working" in exactly 4 words.';
        const response = await Promise.race([
          this.callAnthropic(testPrompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]);
        results.tests.anthropic = { status: 'success', message: response.substring(0, 50), timestamp: new Date() };
        console.log('✅ Anthropic: Working');
      } catch (error) {
        results.tests.anthropic = { status: 'failed', error: error.message, timestamp: new Date() };
        console.log('❌ Anthropic:', error.message);
      }
    }

    console.log('\n' + JSON.stringify(results, null, 2) + '\n');
    return results;
  }
}

module.exports = new AIService();