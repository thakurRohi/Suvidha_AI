import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, postService } from '../services/api';
import { toast } from 'react-toastify';
import './Posts.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await postService.getPosts();
      setPosts(data.posts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postService.deletePost(postId);
      toast.success('Post deleted successfully');
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="posts-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h2>My Posts</h2>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No posts yet</h3>
          <p>Start adding posts from the upload page when you're ready.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              <div className="post-image-container">
                <img
                  src={getImageUrl(post.imageUrl)}
                  alt={post.originalFileName}
                  className="post-image"
                />
                <span className={`post-status status-${post.status}`}>
                  {post.status}
                </span>
              </div>
              
              <div className="post-info">
                <h3 className="post-filename">{post.originalFileName}</h3>
                <p className="post-date">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                
                {post.status === 'analyzed' && (
                  <div className="post-stats">
                    <span>✨ {post.aiGeneratedCaptions?.length || 0} captions</span>
                    <span>🏷️ {post.aiGeneratedHashtags?.length || 0} hashtags</span>
                  </div>
                )}
                
                <div className="post-actions">
                  <Link to={`/posts/${post._id}`} className="btn btn-secondary btn-small">
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="btn btn-danger btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
