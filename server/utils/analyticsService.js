const aiService = require('./aiService');

class AnalyticsService {
  /**
   * Generate complete analytics for a post
   */
  async generateCompleteAnalytics(post, imageDescription, userNiche = 'general') {
    try {
      console.log('📊 Generating complete analytics for post...');

      // Get analytics from AI
      const analytics = await aiService.generateAnalytics(
        imageDescription,
        userNiche,
        post.variations?.previousAnalyses || []
      );

      // Generate performance report
      const performanceReport = aiService.generatePerformanceReport(
        analytics,
        post.aiGeneratedCaptions || [],
        post.aiGeneratedHashtags || []
      );

      // Generate content hash for variation tracking
      const contentHash = aiService.generateContentHash(imageDescription, post.aiGeneratedCaptions[0]?.tone || 'engaging');

      // Update post with analytics
      post.analytics = {
        ...analytics,
        generatedAt: new Date()
      };

      post.performanceReport = {
        ...performanceReport,
        generatedAt: new Date()
      };

      post.variations = {
        contentHash,
        diversityScore: 100,
        variationCount: 1,
        previousAnalyses: [{
          captionCount: post.aiGeneratedCaptions.length,
          hashtagCount: post.aiGeneratedHashtags.length,
          analyticsScore: analytics.engagementScore,
          generatedAt: new Date()
        }]
      };

      await post.save();
      console.log('✅ Analytics generated successfully');

      return {
        analytics: post.analytics,
        performanceReport: post.performanceReport,
        variations: post.variations
      };
    } catch (error) {
      console.error('Error generating complete analytics:', error.message);
      throw error;
    }
  }

  /**
   * Regenerate alternative content with diversity tracking
   */
  async regenerateAlternativeContent(post, imageDescription, userNiche = 'general') {
    try {
      console.log('🔄 Regenerating alternative content with diversity check...');

      // Get previous suggestions for diversity comparison
      const previousSuggestions = [
        {
          captions: post.aiGeneratedCaptions.map(c => ({
            text: c.caption,
            tone: c.tone
          }))
        }
      ];

      // Generate alternative captions
      const alternativeCaptions = await aiService.generateAlternativeCaptions(
        imageDescription,
        userNiche,
        post.aiGeneratedCaptions || []
      );

      // Generate alternative hashtags
      const alternativeHashtags = await aiService.generateHashtagVariations(
        imageDescription,
        userNiche,
        post.aiGeneratedHashtags || []
      );

      // Analyze alternative captions effectiveness
      const captionAnalysis = await aiService.analyzeCaptionEffectiveness(
        alternativeCaptions,
        imageDescription,
        userNiche
      );

      // Check diversity score
      const diversityCheck = aiService.checkVariationDiversity(
        {
          captions: alternativeCaptions
        },
        previousSuggestions
      );

      // Store alternative content
      const alternativeContent = {
        captions: alternativeCaptions,
        hashtagSets: alternativeHashtags,
        captionAnalysis,
        generatedAt: new Date()
      };

      // Update post
      if (!post.alternativeContent) {
        post.alternativeContent = [];
      }
      post.alternativeContent.push(alternativeContent);

      // Update variations
      post.variations.diversityScore = diversityCheck.diversityScore;
      post.variations.variationCount = diversityCheck.variations;

      if (!post.variations.previousAnalyses) {
        post.variations.previousAnalyses = [];
      }
      post.variations.previousAnalyses.push({
        captionCount: alternativeCaptions.length,
        hashtagCount: alternativeHashtags.reduce((sum, set) => sum + set.hashtags.length, 0),
        analyticsScore: post.analytics?.engagementScore || 0,
        generatedAt: new Date()
      });

      await post.save();
      console.log('✅ Alternative content generated with diversity score:', diversityCheck.diversityScore);

      return {
        alternativeContent,
        diversityCheck,
        message: diversityCheck.isDiverse 
          ? '✅ Fresh and unique suggestions generated!' 
          : '⚠️ Some similarity detected with previous suggestions'
      };
    } catch (error) {
      console.error('Error regenerating alternative content:', error.message);
      throw error;
    }
  }

  /**
   * Get comparison between different content variations
   */
  async compareVariations(post) {
    try {
      console.log('📈 Comparing content variations...');

      const comparison = {
        totalVariations: post.variations?.variationCount || 1,
        currentDiversityScore: post.variations?.diversityScore || 100,
        captionComparison: {
          original: {
            count: post.aiGeneratedCaptions.length,
            generatedAt: post.createdAt
          },
          alternatives: post.alternativeContent.map((alt, index) => ({
            variation: index + 1,
            count: alt.captions.length,
            generatedAt: alt.generatedAt,
            captionAnalysis: alt.captionAnalysis
          }))
        },
        hashtagComparison: {
          original: {
            total: post.aiGeneratedHashtags.length,
            highVolume: post.aiGeneratedHashtags.filter(h => h.category === 'high-volume').length,
            mediumVolume: post.aiGeneratedHashtags.filter(h => h.category === 'medium-volume').length,
            lowVolume: post.aiGeneratedHashtags.filter(h => h.category === 'low-volume').length
          },
          alternatives: post.alternativeContent.map((alt, index) => ({
            variation: index + 1,
            sets: alt.hashtagSets.map(set => ({
              strategy: set.strategy,
              total: set.hashtags.length,
              highVolume: set.hashtags.filter(h => h.category === 'high-volume').length,
              mediumVolume: set.hashtags.filter(h => h.category === 'medium-volume').length,
              lowVolume: set.hashtags.filter(h => h.category === 'low-volume').length
            }))
          }))
        },
        analyticsProgression: {
          initialScore: post.variations?.previousAnalyses?.[0]?.analyticsScore || post.analytics?.engagementScore || 0,
          currentScore: post.analytics?.engagementScore || 0,
          improvement: (post.analytics?.engagementScore || 0) - (post.variations?.previousAnalyses?.[0]?.analyticsScore || post.analytics?.engagementScore || 0)
        },
        recommendation: this.getVariationRecommendation(post)
      };

      return comparison;
    } catch (error) {
      console.error('Error comparing variations:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed analytics insights
   */
  async getAnalyticsInsights(post) {
    try {
      console.log('💡 Extracting analytics insights...');

      const insights = {
        engagementPotential: {
          score: post.analytics?.engagementScore || 0,
          level: this.getEngagementLevel(post.analytics?.engagementScore || 0),
          predictedMetrics: {
            likes: post.analytics?.predictedLikes || 0,
            comments: post.analytics?.predictedComments || 0,
            shares: post.analytics?.predictedShares || 0,
            totalEngagement: (post.analytics?.predictedLikes || 0) + 
                            (post.analytics?.predictedComments || 0) + 
                            (post.analytics?.predictedShares || 0)
          }
        },
        contentQuality: post.contentAnalysis ? {
          visualScore: post.analytics?.contentQuality?.visualScore || 75,
          copyScore: post.analytics?.contentQuality?.captionScore || 70,
          overallScore: post.analytics?.contentQuality?.overallScore || 72
        } : null,
        targetAudience: {
          demographics: post.analytics?.audienceDemographics || [],
          bestPostingTime: post.suggestions?.bestPostingTime || post.analytics?.seasonalTiming || 'afternoon',
          trendingFactors: post.analytics?.trendingFactors || []
        },
        contentStrengths: {
          mood: post.contentAnalysis?.mood || 'unknown',
          detectedObjects: post.contentAnalysis?.detectedObjects || [],
          colors: post.contentAnalysis?.colors || [],
          description: post.contentAnalysis?.aiDescription || ''
        },
        improvements: post.suggestions?.improvements || post.analytics?.recommendations || [],
        engagementTips: post.suggestions?.engagementTips || [],
        hashtagStrategy: post.performanceReport?.hashtagStrategy || {
          totalHashtags: post.aiGeneratedHashtags.length,
          highVolume: post.aiGeneratedHashtags.filter(h => h.category === 'high-volume').length,
          mediumVolume: post.aiGeneratedHashtags.filter(h => h.category === 'medium-volume').length,
          lowVolume: post.aiGeneratedHashtags.filter(h => h.category === 'low-volume').length
        },
        captionEffectiveness: post.alternativeContent?.[0]?.captionAnalysis || null,
        variationHistory: {
          totalVariations: post.variations?.variationCount || 1,
          diversityScore: post.variations?.diversityScore || 100,
          analysisHistory: post.variations?.previousAnalyses || []
        }
      };

      return insights;
    } catch (error) {
      console.error('Error getting analytics insights:', error.message);
      throw error;
    }
  }

  /**
   * Generate suggestions for improvement
   */
  async generateImprovementSuggestions(post, imageDescription, userNiche = 'general') {
    try {
      console.log('💬 Generating improvement suggestions...');

      const suggestions = {
        contentImprovements: post.suggestions?.improvements || [],
        captionImprovements: post.alternativeContent?.[0]?.captionAnalysis?.combinationTip 
          ? [post.alternativeContent?.[0]?.captionAnalysis?.combinationTip]
          : [],
        hashtagStrategy: {
          recommendation: this.getHashtagRecommendation(post),
          currentMix: {
            highVolume: post.aiGeneratedHashtags.filter(h => h.category === 'high-volume').length,
            mediumVolume: post.aiGeneratedHashtags.filter(h => h.category === 'medium-volume').length,
            lowVolume: post.aiGeneratedHashtags.filter(h => h.category === 'low-volume').length
          }
        },
        engagementOptimization: post.suggestions?.engagementTips || [],
        nextSteps: this.getNextSteps(post),
        customRecommendations: post.analytics?.recommendations || []
      };

      return suggestions;
    } catch (error) {
      console.error('Error generating improvement suggestions:', error.message);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  getEngagementLevel(score) {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }

  getVariationRecommendation(post) {
    const diversityScore = post.variations?.diversityScore || 100;
    if (diversityScore >= 90) {
      return 'Continue with current content strategy - highly diverse!';
    } else if (diversityScore >= 75) {
      return 'Good diversity. Consider regenerating for fresh perspectives.';
    } else {
      return 'Recommend regenerating suggestions for better variety and uniqueness.';
    }
  }

  getHashtagRecommendation(post) {
    const hashtags = post.aiGeneratedHashtags || [];
    const highVolume = hashtags.filter(h => h.category === 'high-volume').length;
    const total = hashtags.length;
    const percentage = (highVolume / total) * 100;

    if (percentage > 50) {
      return 'Heavy on high-volume hashtags - try alternative set with more niche tags for better engagement';
    } else if (percentage < 25) {
      return 'More niche-focused - consider adding high-volume tags for increased reach';
    } else {
      return 'Good balance of hashtag categories - optimal for mixed engagement';
    }
  }

  getNextSteps(post) {
    const steps = [];

    if (!post.analytics?.engagementScore) {
      steps.push('Generate analytics for engagement predictions');
    }

    if (!post.alternativeContent || post.alternativeContent.length === 0) {
      steps.push('Generate alternative captions and hashtags for variety');
    }

    if (post.status === 'draft') {
      steps.push('Review all suggestions and post to Instagram');
    }

    if (post.status === 'posted' && !post.userMetrics?.actualLikes) {
      steps.push('Track actual engagement metrics after posting');
    }

    if (post.variations?.diversityScore < 75) {
      steps.push('Regenerate content variations for better uniqueness');
    }

    return steps.length > 0 ? steps : ['Monitor post performance after publishing'];
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport(post, imageDescription, userNiche = 'general') {
    try {
      console.log('📋 Generating comprehensive report...');

      const insights = await this.getAnalyticsInsights(post);
      const improvements = await this.generateImprovementSuggestions(post, imageDescription, userNiche);
      const comparison = await this.compareVariations(post);

      return {
        postId: post._id,
        generatedAt: new Date(),
        analyticsInsights: insights,
        improvementSuggestions: improvements,
        variationComparison: comparison,
        summary: {
          totalAnalyses: post.variations?.variationCount || 1,
          diversityScore: post.variations?.diversityScore || 100,
          engagementScore: post.analytics?.engagementScore || 0,
          status: post.status,
          readyToPost: post.status === 'analyzed'
        }
      };
    } catch (error) {
      console.error('Error generating comprehensive report:', error.message);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
