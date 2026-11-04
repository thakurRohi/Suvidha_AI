const mockGeminiService = require('../utils/mockGeminiService');

// Use mock service for development/testing
// Set USE_MOCK_GEMINI=true in .env to use mock, or false to use real Gemini API

const useMockGemini = process.env.USE_MOCK_GEMINI === 'true' || !process.env.GEMINI_API_KEY;

let genAI = null;
if (!useMockGemini) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Generate content using Gemini API or Mock Service with multimodal input (text and/or image)
 * POST /api/gemini/generate
 * 
 * Request body:
 * - text: string (prompt text) - required
 * - image: file (optional) - image buffer from multer
 */
exports.generateContent = async (req, res) => {
  try {
    const { text } = req.body;
    const imageFile = req.file;

    // Validate input
    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Text prompt is required' 
      });
    }

    console.log('🔍 Gemini Controller - generateContent called');
    console.log('📝 Using:', useMockGemini ? 'MOCK Service' : 'Real Gemini API');

    let response;

    if (useMockGemini) {
      // Use mock service
      console.log('🎭 Generating with Mock Service');
      response = mockGeminiService.generateContent(text.trim(), imageFile?.buffer);
      response.timestamp = new Date().toISOString();
    } else {
      // Use real Gemini API
      console.log('🚀 Generating with Real Gemini API');
      console.log('📝 API Key value (first 20 chars):', process.env.GEMINI_API_KEY?.substring(0, 20));
      
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      let content;
      if (imageFile) {
        const base64Image = imageFile.buffer.toString('base64');
        const mimeType = imageFile.mimetype;

        content = [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: text.trim(),
          },
        ];
      } else {
        content = text.trim();
      }

      const result = await model.generateContent(content);
      const generatedText = result.response.text();

      console.log('✅ Gemini API Success');

      response = {
        success: true,
        generatedContent: generatedText,
        inputText: text,
        hasImage: !!imageFile,
        timestamp: new Date().toISOString(),
      };
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Error:', error.message || error);
    
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({
        success: false,
        message: 'API configuration error. Check GEMINI_API_KEY or set USE_MOCK_GEMINI=true',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error generating content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Generate multiple variations of content
 * POST /api/gemini/generate-variations
 */
exports.generateVariations = async (req, res) => {
  try {
    const { text, count = 3 } = req.body;
    const imageFile = req.file;

    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Text prompt is required' 
      });
    }

    console.log('🔍 generateVariations called');
    console.log('📝 Using:', useMockGemini ? 'MOCK Service' : 'Real Gemini API');

    let variations;

    if (useMockGemini) {
      // Use mock service
      console.log('🎭 Generating variations with Mock Service');
      variations = mockGeminiService.generateVariations(text.trim(), imageFile?.buffer, count);
    } else {
      // Use real Gemini API
      console.log('🚀 Generating variations with Real Gemini API');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      variations = [];

      for (let i = 0; i < count; i++) {
        const prompt = `Generate a unique version ${i + 1} of the following: ${text}`;
        
        let content;
        if (imageFile) {
          const base64Image = imageFile.buffer.toString('base64');
          const mimeType = imageFile.mimetype;

          content = [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ];
        } else {
          content = prompt;
        }

        const result = await model.generateContent(content);
        variations.push(result.response.text());
      }
    }

    res.json({
      success: true,
      variations: variations,
      count: variations.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error generating variations:', error.message || error);
    res.status(500).json({
      success: false,
      message: 'Error generating variations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
