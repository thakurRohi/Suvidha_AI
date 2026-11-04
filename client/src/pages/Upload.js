import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/api';
import { toast } from 'react-toastify';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('engaging');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [post, setPost] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    try {
      // Upload image
      const formData = new FormData();
      formData.append('image', file);
      formData.append('description', description);

      const uploadResponse = await postService.uploadPost(formData);
      const postId = uploadResponse.post._id;

      toast.success('Image uploaded successfully!');

      // Analyze with AI
      setAnalyzing(true);
      const analyzeData = {
        imageDescription: description || 'An Instagram post image',
        tone: tone
      };

      const analysisResult = await postService.analyzePost(postId, analyzeData);
      toast.success('AI analysis complete!');
      
      // Get analytics
      const analyticsResult = await postService.getAnalytics(postId);
      
      setPost(analysisResult.post);
      setAnalytics(analyticsResult.insights);
      setShowAnalytics(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleRegenerateAlternatives = async () => {
    if (!post) return;
    
    setRegenerating(true);
    try {
      const response = await postService.regenerateAlternatives(post._id, {
        imageDescription: description || 'An Instagram post image'
      });
      toast.success(response.message);
      
      // Refresh analytics
      const updatedAnalytics = await postService.getAnalytics(post._id);
      setAnalytics(updatedAnalytics.insights);
    } catch (error) {
      toast.error('Failed to regenerate alternatives');
    } finally {
      setRegenerating(false);
    }
  };

  const handleNavigateToPost = () => {
    if (post) {
      navigate(`/posts/${post._id}`);
    }
  };

  if (showAnalytics && post) {
    return (
      <div className="upload-container">
        <div className="upload-card upload-success">
          <div className="success-header">
            <h2>✅ Analysis Complete!</h2>
            <button onClick={() => setShowAnalytics(false)} className="btn-close">×</button>
          </div>

          <div className="success-content">
            <div className="success-image">
              <img src={preview} alt="Uploaded" className="small-preview" />
            </div>

            <div className="analytics-summary">
              {analytics && (
                <>
                  <div className="summary-card">
                    <h3>📊 Engagement Potential</h3>
                    <div className="summary-metrics">
                      <div className="metric">
                        <span className="metric-label">Engagement Score</span>
                        <span className="metric-value">{analytics.engagementPotential?.score || 'N/A'}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Predicted Engagement</span>
                        <span className="metric-value">{analytics.engagementPotential?.predictedMetrics?.totalEngagement || 'N/A'}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Engagement Level</span>
                        <span className="metric-value">{analytics.engagementPotential?.level || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="summary-card">
                    <h3>🏆 Content Quality</h3>
                    {analytics.contentQuality && (
                      <div className="quality-breakdown">
                        <div className="quality-item">
                          <span>Visual Quality: {analytics.contentQuality.visualScore}/100</span>
                          <div className="quality-bar">
                            <div className="quality-fill" style={{width: `${analytics.contentQuality.visualScore}%`}}></div>
                          </div>
                        </div>
                        <div className="quality-item">
                          <span>Copy Quality: {analytics.contentQuality.copyScore}/100</span>
                          <div className="quality-bar">
                            <div className="quality-fill" style={{width: `${analytics.contentQuality.copyScore}%`}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="summary-card">
                    <h3>🎯 Best Posting Time</h3>
                    <p className="posting-time">{analytics.targetAudience?.bestPostingTime || 'N/A'}</p>
                  </div>

                  <div className="summary-card improvements">
                    <h3>💡 Top Improvements</h3>
                    <ul className="improvements-list">
                      {analytics.improvements?.slice(0, 3).map((improvement, idx) => (
                        <li key={idx}>
                          <span className="improvement-bullet">→</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="action-buttons">
              <button
                onClick={handleRegenerateAlternatives}
                disabled={regenerating}
                className="btn btn-secondary"
              >
                {regenerating ? '🔄 Regenerating...' : '🔄 Generate New Variations'}
              </button>
              <button
                onClick={handleNavigateToPost}
                className="btn btn-primary"
              >
                📈 View Full Analytics
              </button>
              <button
                onClick={() => {
                  setShowAnalytics(false);
                  setFile(null);
                  setPreview(null);
                  setPost(null);
                  setAnalytics(null);
                }}
                className="btn btn-outline"
              >
                ↑ Upload Another
              </button>
            </div>

            <div className="helpful-tips">
              <h4>💬 Tips for Better Results</h4>
              <ul>
                <li>Regenerate variations multiple times to get unique suggestions</li>
                <li>Try different caption tones for variety</li>
                <li>Check the diversity score - higher is better!</li>
                <li>Review the hashtag mix (high, medium, low volume)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2 className="upload-title">Upload Your Content</h2>
        <p className="upload-subtitle">Let AI optimize your Instagram post with unique, diverse suggestions</p>

        <div className="upload-area">
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="btn-remove"
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <label className="file-input-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="upload-placeholder">
                <span className="upload-icon">📁</span>
                <p>Click to upload or drag and drop</p>
                <span className="upload-hint">PNG, JPG, GIF up to 10MB</span>
              </div>
            </label>
          )}
        </div>

        {file && (
          <>
            <div className="input-group">
              <label>Describe Your Image (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., A sunset photo at the beach with palm trees"
                rows="3"
              />
              <span className="input-hint">
                Better descriptions lead to better AI suggestions
              </span>
            </div>

            <div className="input-group">
              <label>Caption Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value="engaging">Engaging</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="funny">Funny</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>

            <button
              onClick={handleUploadAndAnalyze}
              className="btn btn-primary btn-full"
              disabled={loading || analyzing}
            >
              {loading ? 'Uploading...' : analyzing ? 'Analyzing with AI...' : '🚀 Upload & Analyze'}
            </button>

            {analyzing && (
              <div className="analyzing-message">
                <div className="spinner"></div>
                <p>AI is analyzing your content and generating unique suggestions...</p>
              </div>
            )}
          </>
        )}

        <div className="features-info">
          <h3>✨ What You'll Get</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <span className="feature-text">Multiple unique captions with different tones</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏷️</span>
              <span className="feature-text">Optimized hashtag strategies</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Engagement predictions and analytics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <span className="feature-text">Regenerate variations anytime for diversity</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Best posting times and audience insights</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💡</span>
              <span className="feature-text">Actionable improvement suggestions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
