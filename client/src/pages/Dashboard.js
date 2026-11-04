import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { postService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPosts: 0,
    analyzedPosts: 0,
    postedPosts: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await postService.getPosts();
      const posts = data.posts;

      setStats({
        totalPosts: posts.length,
        analyzedPosts: posts.filter(p => p.status === 'analyzed' || p.status === 'posted').length,
        postedPosts: posts.filter(p => p.status === 'posted').length
      });

      setRecentPosts(posts.slice(0, 6));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here's what's happening with your Instagram content</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-content">
            <h3>{stats.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <h3>{stats.analyzedPosts}</h3>
            <p>AI Analyzed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <h3>{stats.postedPosts}</h3>
            <p>Posted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{user?.niche || 'Other'}</h3>
            <p>Your Niche</p>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>🚀 AI-Powered Tools</h2>
        <div className="features-grid">
          <Link to="/trends" className="feature-card">
            <div className="feature-icon">📈</div>
            <div className="feature-content">
              <h3>Trend Analysis</h3>
              <p>Discover trending hashtags and optimal posting strategies</p>
            </div>
          </Link>

          <Link to="/calendar" className="feature-card">
            <div className="feature-icon">📅</div>
            <div className="feature-content">
              <h3>Content Calendar</h3>
              <p>AI-generated posting schedule for maximum engagement</p>
            </div>
          </Link>

          <Link to="/insights" className="feature-card">
            <div className="feature-icon">👥</div>
            <div className="feature-content">
              <h3>Audience Insights</h3>
              <p>Understand your audience demographics and behavior</p>
            </div>
          </Link>

          <Link to="/gemini" className="feature-card">
            <div className="feature-icon">✨</div>
            <div className="feature-content">
              <h3>AI Generator</h3>
              <p>Generate captions and hashtags with advanced AI</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Posts</h2>
          <Link to="/posts" className="view-all-link">View All →</Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="empty-dashboard">
            <span className="empty-icon">📭</span>
            <h3>No posts yet</h3>
            <p>Upload your first image to start optimizing your Instagram content</p>
            <Link to="/upload" className="btn btn-primary">
              Upload Your First Post
            </Link>
          </div>
        ) : (
          <div className="recent-posts-grid">
            {recentPosts.map((post) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="recent-post-card"
              >
                <div className="recent-post-image">
                  <img
                    src={`http://localhost:5000${post.imageUrl}`}
                    alt={post.originalFileName}
                  />
                  <span className={`status-badge status-${post.status}`}>
                    {post.status}
                  </span>
                </div>
                <div className="recent-post-info">
                  <p className="recent-post-filename">{post.originalFileName}</p>
                  <p className="recent-post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="tips-section">
        <h2>💡 Pro Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h3>🎨 Use High-Quality Images</h3>
            <p>Clear, well-lit photos get better AI analysis and engagement</p>
          </div>
          <div className="tip-card">
            <h3>📝 Describe Your Content</h3>
            <p>Adding descriptions helps AI generate more accurate captions</p>
          </div>
          <div className="tip-card">
            <h3>⏰ Post at Peak Times</h3>
            <p>Follow AI suggestions for best posting times based on your niche</p>
          </div>
          <div className="tip-card">
            <h3>🏷️ Mix Hashtag Sizes</h3>
            <p>Use a blend of popular and niche hashtags for better reach</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
