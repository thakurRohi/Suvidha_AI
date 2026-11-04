import React, { useCallback, useState, useEffect } from 'react';
import { postService } from '../services/api';
import { toast } from 'react-toastify';
import './TrendAnalysis.css';

const TrendAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState(null);
  const [selectedNiche, setSelectedNiche] = useState('general');

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const response = await postService.getTrends(selectedNiche);
      setTrends(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trends:', error);
      toast.error('Failed to load trends');
      setLoading(false);
    }
  }, [selectedNiche]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  if (loading) {
    return (
      <div className="trend-analysis-container">
        <div className="loading">Loading trend analysis...</div>
      </div>
    );
  }

  return (
    <div className="trend-analysis-container">
      <div className="trend-header">
        <h1>Trend Analysis</h1>
        <p>Discover trending topics and optimal posting strategies</p>
        <select
          value={selectedNiche}
          onChange={(e) => setSelectedNiche(e.target.value)}
          className="niche-select"
        >
          <option value="general">General</option>
          <option value="fashion">Fashion</option>
          <option value="food">Food</option>
          <option value="travel">Travel</option>
          <option value="fitness">Fitness</option>
          <option value="tech">Tech</option>
        </select>
      </div>

      {trends && (
        <div className="trends-content">
          <div className="trend-section">
            <h2>🔥 Trending Hashtags</h2>
            <div className="hashtags-grid">
              {trends.trendingHashtags.map((hashtag, index) => (
                <div key={index} className="hashtag-item">
                  <span className="hashtag">{hashtag.tag}</span>
                  <span className="growth">+{hashtag.growth}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="trend-section">
            <h2>⏰ Optimal Posting Times</h2>
            <div className="posting-times">
              {trends.optimalPostingTimes.map((time, index) => (
                <div key={index} className="time-slot">
                  <span className="time">{time.time}</span>
                  <span className="engagement">{time.engagement} engagement</span>
                </div>
              ))}
            </div>
          </div>

          <div className="trend-section">
            <h2>📈 Content Performance Insights</h2>
            <div className="insights-grid">
              {trends.contentInsights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <h3>{insight.title}</h3>
                  <p>{insight.description}</p>
                  <span className="metric">{insight.metric}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="trend-section">
            <h2>🎯 Audience Insights</h2>
            <div className="audience-stats">
              <div className="stat-item">
                <span className="stat-label">Peak Activity</span>
                <span className="stat-value">{trends.audienceInsights.peakActivity}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Top Demographics</span>
                <span className="stat-value">{trends.audienceInsights.topDemographics}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Engagement Rate</span>
                <span className="stat-value">{trends.audienceInsights.engagementRate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendAnalysis;