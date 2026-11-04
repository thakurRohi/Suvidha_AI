import React, { useCallback, useState, useEffect } from 'react';
import { postService } from '../services/api';
import { toast } from 'react-toastify';
import './ContentCalendar.css';

const ContentCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [calendar, setCalendar] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const response = await postService.getContentCalendar(selectedWeek);
      setCalendar(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching calendar:', error);
      toast.error('Failed to load content calendar');
      setLoading(false);
    }
  }, [selectedWeek]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="loading">Loading content calendar...</div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Content Calendar</h1>
        <p>AI-powered posting schedule for maximum engagement</p>
        <div className="week-selector">
          <button 
            onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
            disabled={selectedWeek === 0}
            className="week-btn"
          >
            ← Previous Week
          </button>
          <span className="current-week">
            Week {selectedWeek + 1} ({calendar?.weekRange})
          </span>
          <button 
            onClick={() => setSelectedWeek(selectedWeek + 1)}
            className="week-btn"
          >
            Next Week →
          </button>
        </div>
      </div>

      {calendar && (
        <div className="calendar-content">
          <div className="calendar-summary">
            <div className="summary-card">
              <h3>📅 Total Posts</h3>
              <span className="summary-value">{calendar.totalPosts}</span>
            </div>
            <div className="summary-card">
              <h3>🎯 Peak Days</h3>
              <span className="summary-value">{calendar.peakDays.join(', ')}</span>
            </div>
            <div className="summary-card">
              <h3>⭐ Best Time</h3>
              <span className="summary-value">{calendar.bestTime}</span>
            </div>
            <div className="summary-card">
              <h3>📈 Expected Reach</h3>
              <span className="summary-value">{calendar.expectedReach}</span>
            </div>
          </div>

          <div className="calendar-grid">
            {calendar.days.map((day, index) => (
              <div key={index} className={`calendar-day ${day.isPeak ? 'peak-day' : ''}`}>
                <div className="day-header">
                  <h4>{day.dayName}</h4>
                  <span className="date">{day.date}</span>
                </div>
                
                {day.posts.map((post, postIndex) => (
                  <div key={postIndex} className="calendar-post">
                    <div className="post-time">{post.time}</div>
                    <div className="post-content">
                      <div className="post-type">{post.type}</div>
                      <div className="post-idea">{post.idea}</div>
                      <div className="post-hashtags">
                        {post.hashtags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="hashtag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="post-metrics">
                      <span className="engagement">~{post.expectedEngagement}</span>
                    </div>
                  </div>
                ))}
                
                {day.posts.length === 0 && (
                  <div className="no-posts">Rest day</div>
                )}
              </div>
            ))}
          </div>

          <div className="calendar-tips">
            <h3>💡 Weekly Tips</h3>
            <div className="tips-grid">
              {calendar.weeklyTips.map((tip, index) => (
                <div key={index} className="tip-card">
                  <h4>{tip.title}</h4>
                  <p>{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;