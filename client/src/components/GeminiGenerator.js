import React, { useState } from 'react';
import './GeminiGenerator.css';
import { toast } from 'react-toastify';
import API from '../services/api';

const GeminiGenerator = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const [variations, setVariations] = useState([]);
  const [variationsLoading, setVariationsLoading] = useState(false);

  // Handle text input change
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype && file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Generate content using Gemini API
  const handleGenerateContent = async (e) => {
    e.preventDefault();

    // Validate input
    if (!text.trim()) {
      toast.error('Please enter a text prompt');
      return;
    }

    if (text.trim().length < 10) {
      toast.error('Text prompt must be at least 10 characters');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('text', text);

      if (image) {
        formData.append('image', image);
      }

      console.log('📤 Sending request to /api/gemini/generate', { textLength: text.length, hasImage: !!image });

      const response = await API.post('/gemini/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📥 Response received:', response.data);

      if (response.data.success) {
        setGeneratedContent(response.data.generatedContent);
        setShowVariations(false);
        setVariations([]);
        toast.success('Content generated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to generate content');
      }
    } catch (error) {
      console.error('❌ Error generating content:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error generating content');
    } finally {
      setLoading(false);
    }
  };

  // Generate variations of content
  const handleGenerateVariations = async () => {
    if (!text.trim()) {
      toast.error('Please enter a text prompt');
      return;
    }

    try {
      setVariationsLoading(true);
      const formData = new FormData();
      formData.append('text', text);
      formData.append('count', 3);

      if (image) {
        formData.append('image', image);
      }

      const response = await API.post('/gemini/generate-variations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setVariations(response.data.variations);
        setShowVariations(true);
        toast.success('Variations generated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to generate variations');
      }
    } catch (error) {
      console.error('Error generating variations:', error);
      toast.error(error.response?.data?.message || 'Error generating variations');
    } finally {
      setVariationsLoading(false);
    }
  };

  // Copy text to clipboard
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  // Clear all fields
  const handleClear = () => {
    setText('');
    setImage(null);
    setImagePreview(null);
    setGeneratedContent('');
    setVariations([]);
    setShowVariations(false);
  };

  return (
    <div className="gemini-generator-container">
      <div className="gemini-header">
        <h1> Gemini Content Generator</h1>
        <p>Create amazing content with AI-powered text and image analysis</p>
      </div>

      <div className="gemini-content">
        {/* Input Section */}
        <div className="input-section">
          <form onSubmit={handleGenerateContent}>
            {/* Text Input */}
            <div className="form-group">
              <label htmlFor="prompt">Text Prompt *</label>
              <textarea
                id="prompt"
                value={text}
                onChange={handleTextChange}
                placeholder="Enter your prompt (min 10 characters)..."
                className="text-input"
                rows="4"
              />
              <small>{text.length} / 5000 characters</small>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label htmlFor="image"> Image (Optional)</label>
              <div className="image-upload-wrapper">
                <input
                  type="file"
                  id="image"
                  onChange={handleImageChange}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="file-input"
                  disabled={loading}
                />
                <label htmlFor="image" className="file-input-label">
                  Choose an image or drag and drop
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    ✕ Remove Image
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? ' Generating...' : 'Generate Content'}
              </button>
              {generatedContent && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleGenerateVariations}
                  disabled={variationsLoading || !text.trim()}
                >
                  {variationsLoading ? 'Generating...' : ' Generate Variations'}
                </button>
              )}
              {(generatedContent || text || image) && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleClear}
                  disabled={loading || variationsLoading}
                >
                   Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Output Section */}
        {generatedContent && (
          <div className="output-section">
            <div className="output-header">
              <h2> Generated Content</h2>
              <button
                className="copy-btn"
                onClick={() => handleCopyToClipboard(generatedContent)}
                title="Copy to clipboard"
              >
                 Copy
              </button>
            </div>
            <div className="output-content">
              <p>{generatedContent}</p>
            </div>
          </div>
        )}

        {/* Variations Section */}
        {showVariations && variations.length > 0 && (
          <div className="variations-section">
            <h2>🔀 Content Variations</h2>
            <div className="variations-list">
              {variations.map((variation, index) => (
                <div key={index} className="variation-card">
                  <div className="variation-header">
                    <h3>Variation {index + 1}</h3>
                    <button
                      className="copy-btn-small"
                      onClick={() => handleCopyToClipboard(variation)}
                      title="Copy to clipboard"
                    >
                      
                    </button>
                  </div>
                  <p>{variation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedContent && (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <p>Enter a prompt and optional image to generate amazing content</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiGenerator;
