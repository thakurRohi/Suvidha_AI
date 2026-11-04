const Post = require('../models/Post');
const aiService = require('../utils/aiService');
const analyticsService = require('../utils/analyticsService');
const fs = require('fs').promises;
const path = require('path');

// @desc    Upload image and create post
// @route   POST /api/posts/upload
// @access  Private
const uploadPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const { description } = req.body;

    const post = await Post.create({
      user: req.user._id,
      imageUrl: `/uploads/${req.file.filename}`,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'draft'
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      post: {
        _id: post._id,
        imageUrl: post.imageUrl,
        originalFileName: post.originalFileName,
        status: post.status,
        createdAt: post.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Analyze post with AI
// @route   POST /api/posts/:id/analyze
// @access  Private
const analyzePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns this post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { imageDescription, tone } = req.body;
    const userNiche = req.user.niche || 'general';

    // Use provided description or a default one
    const description = imageDescription || 'An Instagram post image';

    // Generate ALL content in a SINGLE API call (more efficient, less rate limiting)
    console.log('🚀 Generating all content in one call...');
    const allContent = await aiService.generateAllContent(
      description, 
      tone || 'engaging', 
      userNiche
    );

    // Update post with AI-generated content
    post.aiGeneratedCaptions = allContent.captions.map(cap => ({
      caption: cap.text,
      tone: cap.tone,
      generatedAt: new Date()
    }));

    post.aiGeneratedHashtags = allContent.hashtags.map(tag => ({
      tag: tag.tag,
      category: tag.category,
      relevance: tag.category === 'high-volume' ? 0.9 : tag.category === 'medium-volume' ? 0.7 : 0.5
    }));

    post.contentAnalysis = {
      detectedObjects: allContent.analysis.detectedObjects,
      colors: allContent.analysis.colors,
      mood: allContent.analysis.mood,
      aiDescription: allContent.analysis.description
    };

    post.suggestions = {
      bestPostingTime: allContent.suggestions.bestPostingTime,
      improvements: allContent.suggestions.improvements,
      engagementTips: allContent.suggestions.engagementTips
    };

    post.status = 'analyzed';
    await post.save();

    res.json({
      message: 'Post analyzed successfully',
      post: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all user posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      count: posts.length,
      posts: posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns this post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns this post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete image file
    try {
      const filePath = path.join(__dirname, '..', post.imageUrl);
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update post metrics
// @route   PUT /api/posts/:id/metrics
// @access  Private
const updateMetrics = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns this post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { likes, comments, shares } = req.body;

    post.userMetrics = {
      actualLikes: likes || 0,
      actualComments: comments || 0,
      actualShares: shares || 0,
      postedOn: new Date()
    };

    post.status = 'posted';
    await post.save();

    res.json({
      message: 'Metrics updated successfully',
      post: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ NEW ANALYTICS ENDPOINTS ============

// @desc    Generate analytics for post
// @route   POST /api/posts/:id/generate-analytics
// @access  Private
const generateAnalytics = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { imageDescription } = req.body;
    const userNiche = req.user.niche || 'general';
    const description = imageDescription || 'An Instagram post image';

    // Generate analytics using analyticsService
    const result = await analyticsService.generateCompleteAnalytics(
      post,
      description,
      userNiche
    );

    res.json({
      message: 'Analytics generated successfully',
      analytics: result.analytics,
      performanceReport: result.performanceReport,
      variations: result.variations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Regenerate alternative content
// @route   POST /api/posts/:id/regenerate-alternatives
// @access  Private
const regenerateAlternatives = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { imageDescription } = req.body;
    const userNiche = req.user.niche || 'general';
    const description = imageDescription || 'An Instagram post image';

    // Generate alternative content with diversity tracking
    const result = await analyticsService.regenerateAlternativeContent(
      post,
      description,
      userNiche
    );

    res.json({
      message: result.message,
      alternativeContent: result.alternativeContent,
      diversityCheck: result.diversityCheck
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get analytics insights
// @route   GET /api/posts/:id/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get analytics insights
    const insights = await analyticsService.getAnalyticsInsights(post);

    res.json({
      message: 'Analytics retrieved successfully',
      insights: insights
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Compare content variations
// @route   GET /api/posts/:id/compare-variations
// @access  Private
const compareVariations = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Compare variations
    const comparison = await analyticsService.compareVariations(post);

    res.json({
      message: 'Variations compared successfully',
      comparison: comparison
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get improvement suggestions
// @route   GET /api/posts/:id/suggestions
// @access  Private
const getImprovementSuggestions = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { imageDescription } = req.body;
    const userNiche = req.user.niche || 'general';
    const description = imageDescription || 'An Instagram post image';

    // Get improvement suggestions
    const suggestions = await analyticsService.generateImprovementSuggestions(
      post,
      description,
      userNiche
    );

    res.json({
      message: 'Suggestions generated successfully',
      suggestions: suggestions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get comprehensive report
// @route   GET /api/posts/:id/comprehensive-report
// @access  Private
const getComprehensiveReport = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { imageDescription } = req.body;
    const userNiche = req.user.niche || 'general';
    const description = imageDescription || 'An Instagram post image';

    // Generate comprehensive report
    const report = await analyticsService.generateComprehensiveReport(
      post,
      description,
      userNiche
    );

    res.json({
      message: 'Comprehensive report generated successfully',
      report: report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Test AI API connectivity
// @route   GET /api/posts/test-apis
// @access  Public (for debugging)
const testAPIs = async (req, res) => {
  try {
    console.log('\n🧪 API Test Endpoint Called...\n');
    const results = await aiService.testConnection();
    res.json({
      message: 'API test completed',
      results: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'API test failed', 
      error: error.message 
    });
  }
};

// @desc    Get trend analysis data
// @route   GET /api/posts/trends
// @access  Private
const getTrends = async (req, res) => {
  try {
    const { niche = 'general' } = req.query;

    // Mock trend data based on niche
    const trendData = {
      general: {
        trendingHashtags: [
          { tag: '#instadaily', growth: 15 },
          { tag: '#photooftheday', growth: 12 },
          { tag: '#beautiful', growth: 10 },
          { tag: '#happy', growth: 8 },
          { tag: '#love', growth: 7 },
          { tag: '#instagram', growth: 6 }
        ],
        optimalPostingTimes: [
          { time: '7-9 AM', engagement: 'High' },
          { time: '11 AM-1 PM', engagement: 'Medium' },
          { time: '6-8 PM', engagement: 'High' },
          { time: '9-11 PM', engagement: 'Low' }
        ],
        contentInsights: [
          {
            title: 'Carousel Posts',
            description: 'Multi-image posts get 2x more engagement',
            metric: '+150% engagement'
          },
          {
            title: 'Story Highlights',
            description: 'Posts with story highlights see 30% more saves',
            metric: '+30% saves'
          },
          {
            title: 'Question Stickers',
            description: 'Stories with questions get 20% more replies',
            metric: '+20% replies'
          }
        ],
        audienceInsights: {
          peakActivity: '7-9 AM, 6-8 PM',
          topDemographics: '18-34 years',
          engagementRate: '4.2%'
        }
      },
      fashion: {
        trendingHashtags: [
          { tag: '#fashionnova', growth: 20 },
          { tag: '#ootd', growth: 18 },
          { tag: '#style', growth: 15 },
          { tag: '#fashion', growth: 12 },
          { tag: '#outfit', growth: 10 },
          { tag: '#model', growth: 8 }
        ],
        optimalPostingTimes: [
          { time: '8-10 AM', engagement: 'High' },
          { time: '12-2 PM', engagement: 'Medium' },
          { time: '7-9 PM', engagement: 'High' },
          { time: '10 PM-12 AM', engagement: 'Low' }
        ],
        contentInsights: [
          {
            title: 'Outfit Coordination',
            description: 'Complete outfit posts get 3x more saves',
            metric: '+200% saves'
          },
          {
            title: 'Behind the Scenes',
            description: 'BTS styling content sees 40% more comments',
            metric: '+40% comments'
          },
          {
            title: 'Color Stories',
            description: 'Monochromatic outfits trend 25% higher',
            metric: '+25% engagement'
          }
        ],
        audienceInsights: {
          peakActivity: '8-10 AM, 7-9 PM',
          topDemographics: '18-35 years',
          engagementRate: '5.1%'
        }
      },
      food: {
        trendingHashtags: [
          { tag: '#foodie', growth: 25 },
          { tag: '#instafood', growth: 20 },
          { tag: '#foodporn', growth: 18 },
          { tag: '#yummy', growth: 15 },
          { tag: '#delicious', growth: 12 },
          { tag: '#foodstagram', growth: 10 }
        ],
        optimalPostingTimes: [
          { time: '11 AM-1 PM', engagement: 'High' },
          { time: '6-8 PM', engagement: 'High' },
          { time: '8-10 PM', engagement: 'Medium' },
          { time: '2-4 PM', engagement: 'Low' }
        ],
        contentInsights: [
          {
            title: 'Recipe Stories',
            description: 'Step-by-step recipes get 4x more saves',
            metric: '+300% saves'
          },
          {
            title: 'Food Presentation',
            description: 'Styled plating increases engagement by 50%',
            metric: '+50% engagement'
          },
          {
            title: 'Ingredient Close-ups',
            description: 'Fresh ingredient shots see 35% more likes',
            metric: '+35% likes'
          }
        ],
        audienceInsights: {
          peakActivity: '11 AM-1 PM, 6-8 PM',
          topDemographics: '25-44 years',
          engagementRate: '4.8%'
        }
      },
      travel: {
        trendingHashtags: [
          { tag: '#travel', growth: 22 },
          { tag: '#wanderlust', growth: 19 },
          { tag: '#adventure', growth: 16 },
          { tag: '#explore', growth: 14 },
          { tag: '#nature', growth: 11 },
          { tag: '#photography', growth: 9 }
        ],
        optimalPostingTimes: [
          { time: '9-11 AM', engagement: 'High' },
          { time: '7-9 PM', engagement: 'High' },
          { time: '1-3 PM', engagement: 'Medium' },
          { time: '11 PM-1 AM', engagement: 'Low' }
        ],
        contentInsights: [
          {
            title: 'Location Stories',
            description: 'Geo-tagged posts get 2.5x more engagement',
            metric: '+150% engagement'
          },
          {
            title: 'Sunset Shots',
            description: 'Golden hour photos see 60% more saves',
            metric: '+60% saves'
          },
          {
            title: 'Local Culture',
            description: 'Cultural content gets 45% more comments',
            metric: '+45% comments'
          }
        ],
        audienceInsights: {
          peakActivity: '9-11 AM, 7-9 PM',
          topDemographics: '25-40 years',
          engagementRate: '4.5%'
        }
      },
      fitness: {
        trendingHashtags: [
          { tag: '#fitness', growth: 28 },
          { tag: '#gym', growth: 24 },
          { tag: '#workout', growth: 20 },
          { tag: '#motivation', growth: 17 },
          { tag: '#health', growth: 14 },
          { tag: '#training', growth: 11 }
        ],
        optimalPostingTimes: [
          { time: '6-8 AM', engagement: 'High' },
          { time: '5-7 PM', engagement: 'High' },
          { time: '11 AM-1 PM', engagement: 'Medium' },
          { time: '9-11 PM', engagement: 'Low' }
        ],
        contentInsights: [
          {
            title: 'Progress Updates',
            description: 'Before/after posts get 5x more engagement',
            metric: '+400% engagement'
          },
          {
            title: 'Workout Tips',
            description: 'Educational content sees 70% more saves',
            metric: '+70% saves'
          },
          {
            title: 'Community Challenges',
            description: 'Challenge posts get 55% more comments',
            metric: '+55% comments'
          }
        ],
        audienceInsights: {
          peakActivity: '6-8 AM, 5-7 PM',
          topDemographics: '18-35 years',
          engagementRate: '5.5%'
        }
      },
      tech: {
        trendingHashtags: [
          { tag: '#technology', growth: 18 },
          { tag: '#tech', growth: 15 },
          { tag: '#innovation', growth: 13 },
          { tag: '#gadgets', growth: 11 },
          { tag: '#coding', growth: 9 },
          { tag: '#programming', growth: 7 }
        ],
        optimalPostingTimes: [
          { time: '8-10 AM', engagement: 'High' },
          { time: '12-2 PM', engagement: 'Medium' },
          { time: '6-8 PM', engagement: 'High' },
          { time: '10 PM-12 AM', engagement: 'Low' }
        ],
        contentInsights: [
          {
            title: 'Tutorial Content',
            description: 'How-to posts get 3x more saves',
            metric: '+200% saves'
          },
          {
            title: 'Product Reviews',
            description: 'Review content sees 40% more comments',
            metric: '+40% comments'
          },
          {
            title: 'Tech News',
            description: 'Breaking news posts get 25% more engagement',
            metric: '+25% engagement'
          }
        ],
        audienceInsights: {
          peakActivity: '8-10 AM, 6-8 PM',
          topDemographics: '25-40 years',
          engagementRate: '3.8%'
        }
      }
    };

    const data = trendData[niche] || trendData.general;

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get content calendar
// @route   GET /api/posts/calendar
// @access  Private
const getContentCalendar = async (req, res) => {
  try {
    const { week = 0 } = req.query;
    const weekOffset = parseInt(week) || 0;

    // Calculate week dates
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Mock calendar data
    const calendarData = {
      weekRange: `${weekDates[0].toLocaleDateString()} - ${weekDates[6].toLocaleDateString()}`,
      totalPosts: 5,
      peakDays: ['Tuesday', 'Thursday', 'Saturday'],
      bestTime: '7-9 AM',
      expectedReach: '15K-25K',
      days: weekDates.map((date, index) => {
        const dayName = dayNames[date.getDay()];
        const isPeak = ['Tuesday', 'Thursday', 'Saturday'].includes(dayName);
        
        let posts = [];
        if (isPeak) {
          posts = [
            {
              time: '8:00 AM',
              type: 'Carousel Post',
              idea: 'Share your morning routine with tips for productivity',
              hashtags: ['#morningroutine', '#productivity', '#lifestyle'],
              expectedEngagement: '2.5K likes'
            },
            {
              time: '6:00 PM',
              type: 'Story Series',
              idea: 'Behind-the-scenes of your creative process',
              hashtags: ['#bts', '#creative', '#process'],
              expectedEngagement: '1.8K views'
            }
          ];
        } else if (dayName === 'Wednesday' || dayName === 'Friday') {
          posts = [
            {
              time: '12:00 PM',
              type: 'Reel',
              idea: 'Quick tip or tutorial related to your niche',
              hashtags: ['#tips', '#tutorial', '#learn'],
              expectedEngagement: '3.2K views'
            }
          ];
        }

        return {
          dayName,
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          isPeak,
          posts
        };
      }),
      weeklyTips: [
        {
          title: 'Content Variety',
          description: 'Mix static posts, carousels, and reels to keep your audience engaged. Aim for 40% static, 30% carousel, 30% video content.'
        },
        {
          title: 'Engagement Timing',
          description: 'Post during peak hours but also experiment with off-peak times to discover new audience segments.'
        },
        {
          title: 'Story Consistency',
          description: 'Use Instagram Stories daily to maintain visibility. Save highlights from successful stories for evergreen content.'
        },
        {
          title: 'Hashtag Strategy',
          description: 'Use 5-10 relevant hashtags per post. Mix popular and niche-specific tags for broader reach.'
        }
      ]
    };

    res.json(calendarData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get audience insights
// @route   GET /api/posts/insights
// @access  Private
const getAudienceInsights = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Mock audience insights data
    const insightsData = {
      totalFollowers: 15420,
      followerGrowth: 8.5,
      engagementRate: 4.2,
      engagementGrowth: 12.3,
      totalImpressions: 892340,
      impressionGrowth: 15.7,
      totalReach: 456780,
      reachGrowth: 9.2,
      demographics: {
        ageGroups: [
          { age: '18-24', percentage: 35 },
          { age: '25-34', percentage: 42 },
          { age: '35-44', percentage: 18 },
          { age: '45+', percentage: 5 }
        ],
        gender: [
          { label: 'Female', percentage: 68, color: '#e91e63' },
          { label: 'Male', percentage: 30, color: '#2196f3' },
          { label: 'Other', percentage: 2, color: '#9c27b0' }
        ],
        topLocations: [
          { city: 'New York', country: 'USA', percentage: 12.5 },
          { city: 'Los Angeles', country: 'USA', percentage: 9.8 },
          { city: 'London', country: 'UK', percentage: 7.2 },
          { city: 'Toronto', country: 'Canada', percentage: 6.1 },
          { city: 'Sydney', country: 'Australia', percentage: 5.4 }
        ]
      },
      engagementPatterns: {
        bestTimes: [
          { time: '7-9 AM', engagement: 'High' },
          { time: '12-2 PM', engagement: 'Medium-High' },
          { time: '6-8 PM', engagement: 'High' },
          { time: '9-11 PM', engagement: 'Medium' }
        ],
        contentTypes: [
          { type: 'Reels', performance: 85 },
          { type: 'Carousel', performance: 72 },
          { type: 'Static', performance: 58 },
          { type: 'Stories', performance: 45 }
        ]
      },
      audienceInterests: [
        { topic: 'Photography', size: 24 },
        { topic: 'Travel', size: 22 },
        { topic: 'Food', size: 20 },
        { topic: 'Fashion', size: 18 },
        { topic: 'Fitness', size: 16 },
        { topic: 'Art', size: 14 },
        { topic: 'Music', size: 12 },
        { topic: 'Technology', size: 10 },
        { topic: 'Nature', size: 8 },
        { topic: 'Lifestyle', size: 6 }
      ],
      growthOpportunities: [
        {
          title: 'Increase Story Engagement',
          description: 'Your stories have 45% engagement rate. Add more interactive stickers and polls to boost this to 60%.',
          potential: '+25% reach'
        },
        {
          title: 'Leverage Reels',
          description: 'Reels perform 85% better than static posts. Create more short-form video content.',
          potential: '+40% engagement'
        },
        {
          title: 'Collaborate with Similar Creators',
          description: 'Partner with creators in photography and travel niches to tap into new audiences.',
          potential: '+30% followers'
        },
        {
          title: 'Optimize Posting Times',
          description: 'Post more during 7-9 AM and 6-8 PM when your audience is most active.',
          potential: '+15% impressions'
        }
      ]
    };

    res.json(insightsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  uploadPost,
  analyzePost,
  getPosts,
  getPost,
  deletePost,
  updateMetrics,
  generateAnalytics,
  regenerateAlternatives,
  getAnalytics,
  compareVariations,
  getImprovementSuggestions,
  getComprehensiveReport,
  getTrends,
  getContentCalendar,
  getAudienceInsights,
  testAPIs
};