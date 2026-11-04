const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  aiGeneratedCaptions: [{
    caption: String,
    tone: {
      type: String,
      enum: ['professional', 'casual', 'funny', 'inspirational', 'engaging']
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiGeneratedHashtags: [{
    tag: String,
    category: String,
    relevance: Number
  }],
  contentAnalysis: {
    detectedObjects: [String],
    colors: [String],
    mood: String,
    aiDescription: String
  },
  suggestions: {
    bestPostingTime: String,
    improvements: [String],
    engagementTips: [String]
  },
  userMetrics: {
    actualLikes: Number,
    actualComments: Number,
    actualShares: Number,
    postedOn: Date
  },
  // NEW ANALYTICS FIELDS
  analytics: {
    engagementScore: {
      type: Number,
      default: 0
    },
    predictedLikes: Number,
    predictedComments: Number,
    predictedShares: Number,
    audienceDemographics: [String],
    contentQuality: {
      visualScore: Number,
      captionScore: Number,
      overallScore: Number
    },
    recommendations: [String],
    trendingFactors: [String],
    seasonalTiming: String,
    generatedAt: Date
  },
  
  // Track unique variations and their diversity
  variations: {
    contentHash: String, // Hash of current content for tracking uniqueness
    diversityScore: {
      type: Number,
      default: 100
    },
    variationCount: {
      type: Number,
      default: 1
    },
    previousAnalyses: [{
      captionCount: Number,
      hashtagCount: Number,
      analyticsScore: Number,
      generatedAt: Date
    }]
  },
  
  // Alternative suggestions (regenerated versions)
  alternativeContent: [{
    captions: [{
      text: String,
      tone: String,
      style: String
    }],
    hashtagSets: [{
      strategy: String, // e.g., "maximum_reach", "niche_engagement"
      hashtags: [{
        tag: String,
        category: String
      }]
    }],
    captionAnalysis: {
      scores: [{
        score: Number,
        strengths: [String],
        weaknesses: [String],
        callToActionScore: Number,
        emotionalAppeals: [String],
        recommendedFix: String
      }],
      bestCaption: String,
      combinationTip: String
    },
    generatedAt: Date
  }],
  
  // Performance report combining all analytics
  performanceReport: {
    summary: {
      engagementLevel: String,
      predictedTotalEngagement: Number,
      recommendedAudience: String,
      bestTimeToPost: String
    },
    contentMetrics: {
      visualQuality: Number,
      copyQuality: Number,
      overallQuality: Number
    },
    engagementPrediction: {
      likes: Number,
      comments: Number,
      shares: Number,
      total: Number
    },
    strategicRecommendations: [String],
    hashtagStrategy: {
      totalHashtags: Number,
      highVolume: Number,
      mediumVolume: Number,
      lowVolume: Number
    },
    captionOptions: Number,
    generatedAt: Date
  },
  
  status: {
    type: String,
    enum: ['draft', 'analyzed', 'posted'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema);
