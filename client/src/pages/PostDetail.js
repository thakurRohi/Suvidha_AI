import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService } from '../services/api';
import { toast } from 'react-toastify';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCaption, setCopiedCaption] = useState(null);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const data = await postService.getPost(id);
      setPost(data);
    } catch (error) {
      toast.error('Failed to load post');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'caption') {
      setCopiedCaption(text);
      setTimeout(() => setCopiedCaption(null), 2000);
    } else if (type === 'hashtags') {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const allHashtags = post.aiGeneratedHashtags?.map(h => `#${h.tag}`).join(' ') || '';

  return (
    <div className="post-detail-container">
      <div className="post-detail-header">
        <button onClick={() => navigate('/posts')} className="btn-back">
          ← Back to Posts
        </button>
      </div>

      <div className="post-detail-content">
        <div className="detail-left">
          <div className="detail-image-card">
            <img
              src={`http://localhost:5000${post.imageUrl}`}
              alt={post.originalFileName}
              className="detail-image"
            />
          </div>

          {post.contentAnalysis && (
            <div className="card analysis-card">
              <h3>📊 Content Analysis</h3>
              <div className="analysis-item">
                <strong>Description:</strong>
                <p>{post.contentAnalysis.aiDescription}</p>
              </div>
              <div className="analysis-item">
                <strong>Detected Objects:</strong>
                <div className="tags">
                  {post.contentAnalysis.detectedObjects?.map((obj, idx) => (
                    <span key={idx} className="tag">{obj}</span>
                  ))}
                </div>
              </div>
              <div className="analysis-item">
                <strong>Colors:</strong>
                <div className="tags">
                  {post.contentAnalysis.colors?.map((color, idx) => (
                    <span key={idx} className="tag">{color}</span>
                  ))}
                </div>
              </div>
              <div className="analysis-item">
                <strong>Mood:</strong>
                <span className="tag">{post.contentAnalysis.mood}</span>
              </div>
            </div>
          )}
        </div>

        <div className="detail-right">
          {post.aiGeneratedCaptions && post.aiGeneratedCaptions.length > 0 && (
            <div className="card">
              <h3>✨ AI Generated Captions</h3>
              {post.aiGeneratedCaptions.map((captionObj, idx) => (
                <div key={idx} className="caption-item">
                  <div className="caption-header">
                    <span className="caption-label">Caption {idx + 1}</span>
                    <span className="caption-tone">{captionObj.tone}</span>
                  </div>
                  <p className="caption-text">{captionObj.caption}</p>
                  <button
                    onClick={() => copyToClipboard(captionObj.caption, 'caption')}
                    className="btn btn-secondary btn-small"
                  >
                    {copiedCaption === captionObj.caption ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {post.aiGeneratedHashtags && post.aiGeneratedHashtags.length > 0 && (
            <div className="card">
              <h3>🏷️ Recommended Hashtags</h3>
              <div className="hashtags-container">
                {post.aiGeneratedHashtags.map((hashtagObj, idx) => (
                  <span
                    key={idx}
                    className={`hashtag hashtag-${hashtagObj.category}`}
                  >
                    #{hashtagObj.tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => copyToClipboard(allHashtags, 'hashtags')}
                className="btn btn-primary btn-full"
              >
                {copiedHashtags ? '✓ Copied All!' : '📋 Copy All Hashtags'}
              </button>
            </div>
          )}

          {post.suggestions && (
            <div className="card">
              <h3>💡 Suggestions</h3>
              
              {post.suggestions.bestPostingTime && (
                <div className="suggestion-item">
                  <strong>🕐 Best Posting Time:</strong>
                  <p>{post.suggestions.bestPostingTime}</p>
                </div>
              )}

              {post.suggestions.improvements && post.suggestions.improvements.length > 0 && (
                <div className="suggestion-item">
                  <strong>🔧 Improvements:</strong>
                  <ul>
                    {post.suggestions.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {post.suggestions.engagementTips && post.suggestions.engagementTips.length > 0 && (
                <div className="suggestion-item">
                  <strong>🎯 Engagement Tips:</strong>
                  <ul>
                    {post.suggestions.engagementTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
