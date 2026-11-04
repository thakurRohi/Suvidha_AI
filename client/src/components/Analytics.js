import React, { useState, useEffect } from 'react';
import { postService } from '../services/api';
import { toast } from 'react-toastify';
import './Analytics.css';

const Analytics = ({ postId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [postId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await postService.getAnalytics(postId);
      setAnalytics(response.insights);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
      setLoading(false);
    }
  };

  const handleRegenerateAlternatives = async () => {
    setRegenerating(true);
    try {
      const response = await postService.regenerateAlternatives(postId);
      toast.success(response.message);
      // Refresh analytics
      await fetchAnalytics();
      setRegenerating(false);
    } catch (error) {
      console.error('Error regenerating alternatives:', error);
      toast.error('Failed to regenerate alternatives');
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-container">
        <div className="error">Failed to load analytics</div>
        <button onClick={onBack} className="btn-back">Go Back</button>
      </div>
    );
  }

  const { engagementPotential, contentQuality, targetAudience, contentStrengths, improvements, engagementTips, hashtagStrategy, variationHistory } = analytics;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2> Post Analytics & Insights</h2>
        <button onClick={onBack} className="btn-back">← Back</button>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          Engagement
        </button>
        <button 
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content Quality
        </button>
        <button 
          className={`tab ${activeTab === 'audience' ? 'active' : ''}`}
          onClick={() => setActiveTab('audience')}
        >
          Audience
        </button>
        <button 
          className={`tab ${activeTab === 'improvements' ? 'active' : ''}`}
          onClick={() => setActiveTab('improvements')}
        >
          Improvements
        </button>
        <button 
          className={`tab ${activeTab === 'variations' ? 'active' : ''}`}
          onClick={() => setActiveTab('variations')}
        >
          Variations
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <h3>Analytics Overview</h3>
            <div className="overview-grid">
              <div className="metric-card">
                <div className="metric-label">Engagement Score</div>
                <div className="metric-value">{engagementPotential.score}</div>
                <div className="metric-level">{engagementPotential.level}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Predicted Total Engagement</div>
                <div className="metric-value">{engagementPotential.predictedMetrics.totalEngagement}</div>
                <div className="metric-breakdown">
                   {engagementPotential.predictedMetrics.likes} | 
                   {engagementPotential.predictedMetrics.comments} | 
                   {engagementPotential.predictedMetrics.shares}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Diversity Score</div>
                <div className="metric-value">{variationHistory.diversityScore}%</div>
                <div className="metric-subtext">
                  {variationHistory.totalVariations} {variationHistory.totalVariations === 1 ? 'version' : 'versions'}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Best Posting Time</div>
                <div className="metric-value">{targetAudience.bestPostingTime}</div>
                <div className="metric-subtext">Peak engagement time</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="tab-content">
            <h3>Engagement Predictions</h3>
            <div className="engagement-section">
              <div className="prediction-item">
                <span className="prediction-icon"></span>
                <div className="prediction-details">
                  <div className="prediction-label">Predicted Likes</div>
                  <div className="prediction-value">{engagementPotential.predictedMetrics.likes}</div>
                </div>
              </div>
              <div className="prediction-item">
                <span className="prediction-icon"></span>
                <div className="prediction-details">
                  <div className="prediction-label">Predicted Comments</div>
                  <div className="prediction-value">{engagementPotential.predictedMetrics.comments}</div>
                </div>
              </div>
              <div className="prediction-item">
                <span className="prediction-icon"></span>
                <div className="prediction-details">
                  <div className="prediction-label">Predicted Shares</div>
                  <div className="prediction-value">{engagementPotential.predictedMetrics.shares}</div>
                </div>
              </div>
            </div>

            <h4 style={{ marginTop: '2rem' }}>Engagement Tips</h4>
            <div className="tips-list">
              {engagementTips.map((tip, idx) => (
                <div key={idx} className="tip-item">
                  <span className="tip-icon"></span>
                  <span className="tip-text">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="tab-content">
            <h3>Content Quality Analysis</h3>
            {contentQuality && (
              <div className="quality-scores">
                <div className="score-item">
                  <div className="score-label">Visual Quality</div>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${contentQuality.visualScore}%` }}
                    />
                  </div>
                  <div className="score-number">{contentQuality.visualScore}/100</div>
                </div>

                <div className="score-item">
                  <div className="score-label">Copy Quality</div>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${contentQuality.copyScore}%` }}
                    />
                  </div>
                  <div className="score-number">{contentQuality.copyScore}/100</div>
                </div>

                <div className="score-item">
                  <div className="score-label">Overall Quality</div>
                  <div className="score-bar">
                    <div 
                      className="score-fill overall" 
                      style={{ width: `${contentQuality.overallScore}%` }}
                    />
                  </div>
                  <div className="score-number">{contentQuality.overallScore}/100</div>
                </div>
              </div>
            )}

            <h4 style={{ marginTop: '2rem' }}>Content Strengths</h4>
            <div className="strengths-section">
              <div className="strength-item">
                <strong>Mood/Vibe:</strong> {contentStrengths.mood}
              </div>
              {contentStrengths.detectedObjects.length > 0 && (
                <div className="strength-item">
                  <strong>Detected Elements:</strong> {contentStrengths.detectedObjects.join(', ')}
                </div>
              )}
              {contentStrengths.colors.length > 0 && (
                <div className="strength-item">
                  <strong>Color Palette:</strong> {contentStrengths.colors.join(', ')}
                </div>
              )}
              {contentStrengths.description && (
                <div className="strength-item">
                  <strong>Description:</strong> {contentStrengths.description}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'audience' && (
          <div className="tab-content">
            <h3>Target Audience</h3>
            <div className="audience-section">
              {targetAudience.demographics.length > 0 && (
                <div className="audience-item">
                  <h4>Demographics & Interests</h4>
                  <div className="audience-tags">
                    {targetAudience.demographics.map((demo, idx) => (
                      <span key={idx} className="tag">{demo}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="audience-item">
                <h4>Best Posting Time</h4>
                <div className="time-badge">{targetAudience.bestPostingTime}</div>
              </div>

              {targetAudience.trendingFactors.length > 0 && (
                <div className="audience-item">
                  <h4>Trending Factors</h4>
                  <div className="trending-list">
                    {targetAudience.trendingFactors.map((factor, idx) => (
                      <div key={idx} className="trending-item">
                        <span className="trending-icon"></span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'improvements' && (
          <div className="tab-content">
            <h3>Improvement Recommendations</h3>
            
            <h4>Content Improvements</h4>
            <div className="improvements-list">
              {improvements.map((improvement, idx) => (
                <div key={idx} className="improvement-item">
                  <span className="improvement-icon"></span>
                  <span className="improvement-text">{improvement}</span>
                </div>
              ))}
            </div>

            <h4 style={{ marginTop: '2rem' }}>Hashtag Strategy</h4>
            <div className="hashtag-stats">
              <div className="hashtag-stat">
                <div className="stat-label">Total Hashtags</div>
                <div className="stat-value">{hashtagStrategy.totalHashtags}</div>
              </div>
              <div className="hashtag-stat">
                <div className="stat-label">High Volume</div>
                <div className="stat-value">{hashtagStrategy.highVolume}</div>
              </div>
              <div className="hashtag-stat">
                <div className="stat-label">Medium Volume</div>
                <div className="stat-value">{hashtagStrategy.mediumVolume}</div>
              </div>
              <div className="hashtag-stat">
                <div className="stat-label">Low Volume</div>
                <div className="stat-value">{hashtagStrategy.lowVolume}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'variations' && (
          <div className="tab-content">
            <h3>Content Variations</h3>
            <div className="variations-info">
              <div className="variation-stat">
                <div className="stat-label">Total Versions Generated</div>
                <div className="stat-value">{variationHistory.totalVariations}</div>
              </div>
              <div className="variation-stat">
                <div className="stat-label">Diversity Score</div>
                <div className="stat-value">{variationHistory.diversityScore}%</div>
              </div>
            </div>

            {variationHistory.analysisHistory.length > 0 && (
              <div className="variations-history">
                <h4>Generation History</h4>
                {variationHistory.analysisHistory.map((analysis, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-number">Version {idx + 1}</div>
                    <div className="history-details">
                      <span>{analysis.captionCount} captions</span>
                      <span> {analysis.hashtagCount} hashtags</span>
                      <span>Score: {analysis.analyticsScore}</span>
                      <span>{new Date(analysis.generatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="variations-actions">
              <button 
                onClick={handleRegenerateAlternatives}
                disabled={regenerating}
                className="btn-regenerate"
              >
                {regenerating ? ' Regenerating...' : 'Generate New Variations'}
              </button>
              <p className="variations-hint">Click to generate unique alternative captions and hashtags</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
