import React, { useState, useEffect } from 'react';
import { postService } from '../services/api';
import { toast } from 'react-toastify';
import './AudienceInsights.css';

const AudienceInsights = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchInsights();
  }, [selectedPeriod]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await postService.getAudienceInsights(selectedPeriod);
      setInsights(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load audience insights');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="insights-container">
        <div className="loading">Loading audience insights...</div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      <div className="insights-header">
        <h1>Audience Insights</h1>
        <p>Understand your audience demographics and engagement patterns</p>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="period-select"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {insights && (
        <div className="insights-content">
          <div className="insights-overview">
            <div className="overview-card">
              <h3>👥 Total Followers</h3>
              <span className="overview-value">{insights.totalFollowers.toLocaleString()}</span>
              <span className="overview-change positive">+{insights.followerGrowth}%</span>
            </div>
            <div className="overview-card">
              <h3>📊 Engagement Rate</h3>
              <span className="overview-value">{insights.engagementRate}%</span>
              <span className="overview-change positive">+{insights.engagementGrowth}%</span>
            </div>
            <div className="overview-card">
              <h3>👁️ Impressions</h3>
              <span className="overview-value">{insights.totalImpressions.toLocaleString()}</span>
              <span className="overview-change positive">+{insights.impressionGrowth}%</span>
            </div>
            <div className="overview-card">
              <h3>❤️ Reach</h3>
              <span className="overview-value">{insights.totalReach.toLocaleString()}</span>
              <span className="overview-change positive">+{insights.reachGrowth}%</span>
            </div>
          </div>

          <div className="insights-section">
            <h2>📈 Demographics</h2>
            <div className="demographics-grid">
              <div className="demographic-card">
                <h4>Age Groups</h4>
                <div className="chart-container">
                  {insights.demographics.ageGroups.map((group, index) => (
                    <div key={index} className="chart-bar">
                      <span className="bar-label">{group.age}</span>
                      <div className="bar">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${group.percentage}%` }}
                        ></div>
                      </div>
                      <span className="bar-value">{group.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="demographic-card">
                <h4>Gender Distribution</h4>
                <div className="gender-chart">
                  {insights.demographics.gender.map((gender, index) => (
                    <div key={index} className="gender-segment">
                      <span className="gender-label">{gender.label}</span>
                      <div className="gender-bar">
                        <div 
                          className="gender-fill" 
                          style={{ width: `${gender.percentage}%`, backgroundColor: gender.color }}
                        ></div>
                      </div>
                      <span className="gender-value">{gender.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="demographic-card">
                <h4>Top Locations</h4>
                <div className="locations-list">
                  {insights.demographics.topLocations.map((location, index) => (
                    <div key={index} className="location-item">
                      <span className="location-name">{location.city}, {location.country}</span>
                      <span className="location-percentage">{location.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="insights-section">
            <h2>⏰ Engagement Patterns</h2>
            <div className="engagement-patterns">
              <div className="pattern-card">
                <h4>Best Posting Times</h4>
                <div className="time-slots">
                  {insights.engagementPatterns.bestTimes.map((time, index) => (
                    <div key={index} className="time-slot">
                      <span className="time">{time.time}</span>
                      <span className="engagement">{time.engagement} engagement</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pattern-card">
                <h4>Content Performance</h4>
                <div className="content-performance">
                  {insights.engagementPatterns.contentTypes.map((type, index) => (
                    <div key={index} className="performance-item">
                      <span className="content-type">{type.type}</span>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill" 
                          style={{ width: `${type.performance}%` }}
                        ></div>
                      </div>
                      <span className="performance-value">{type.performance}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="insights-section">
            <h2>🎯 Audience Interests</h2>
            <div className="interests-cloud">
              {insights.audienceInterests.map((interest, index) => (
                <span 
                  key={index} 
                  className="interest-tag"
                  style={{ fontSize: `${interest.size}px` }}
                >
                  {interest.topic}
                </span>
              ))}
            </div>
          </div>

          <div className="insights-section">
            <h2>💡 Growth Opportunities</h2>
            <div className="opportunities-grid">
              {insights.growthOpportunities.map((opportunity, index) => (
                <div key={index} className="opportunity-card">
                  <h4>{opportunity.title}</h4>
                  <p>{opportunity.description}</p>
                  <span className="potential">Potential: {opportunity.potential}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceInsights;