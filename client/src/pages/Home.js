import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            🚀 Supercharge Your Instagram Growth
          </h1>
          <p className="hero-subtitle">
            AI-powered content optimization for creators who want to grow faster
          </p>
          <div className="hero-features">
            <div className="feature">
              <span className="feature-icon">✨</span>
              <span>AI Caption Generation</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Smart Hashtag Research</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💡</span>
              <span>Content Improvement Tips</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <span>Engagement Optimization</span>
            </div>
          </div>
          
          {user ? (
            <div className="hero-cta">
              <Link to="/upload" className="btn btn-primary btn-large">
                Upload Your First Post
              </Link>
              <Link to="/dashboard" className="btn btn-secondary btn-large">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Your Image</h3>
            <p>Upload the image or video you want to post on Instagram</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get AI Analysis</h3>
            <p>Our AI analyzes your content and generates optimized captions and hashtags</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Copy & Post</h3>
            <p>Copy the suggestions and post to Instagram for maximum engagement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
