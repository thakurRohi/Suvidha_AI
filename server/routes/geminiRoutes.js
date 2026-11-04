const express = require('express');
const router = express.Router();
const { generateContent, generateVariations } = require('../controllers/geminiController');
const { protect } = require('../middleware/auth');
const uploadMemory = require('../middleware/uploadMemory');
const { body, validationResult } = require('express-validator');

// Validation middleware
const generateValidation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Text prompt is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Text must be between 10 and 5000 characters'),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// Routes (protected - requires authentication)
/**
 * POST /api/gemini/generate
 * Generate content using text and/or image
 * Body: { text: string }
 * File: optional image file
 */
router.post(
  '/generate',
  protect,
  uploadMemory.single('image'),
  generateValidation,
  handleValidationErrors,
  generateContent
);

/**
 * POST /api/gemini/generate-variations
 * Generate multiple variations of content
 * Body: { text: string, count?: number (default: 3) }
 * File: optional image file
 */
router.post(
  '/generate-variations',
  protect,
  uploadMemory.single('image'),
  generateValidation,
  handleValidationErrors,
  generateVariations
);

module.exports = router;
