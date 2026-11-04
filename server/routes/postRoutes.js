const express = require('express');
const router = express.Router();
const {
  uploadPost,
  analyzePost,
  getPosts,
  getPost,
  deletePost,
  updateMetrics,
  generateAnalytics,
  regenerateAlternatives,
  getAnalytics,
  compareVariations,
  getImprovementSuggestions,
  getComprehensiveReport,
  getTrends,
  getContentCalendar,
  getAudienceInsights,
  testAPIs
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected (require authentication)
router.post('/upload', protect, upload.single('image'), uploadPost);
router.post('/:id/analyze', protect, analyzePost);

// Specific routes must come before parameterized routes
router.get('/trends', protect, getTrends);
router.get('/calendar', protect, getContentCalendar);
router.get('/insights', protect, getAudienceInsights);

router.get('/', protect, getPosts);
router.get('/:id', protect, getPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/metrics', protect, updateMetrics);

// NEW ANALYTICS ROUTES
router.post('/:id/generate-analytics', protect, generateAnalytics);
router.post('/:id/regenerate-alternatives', protect, regenerateAlternatives);
router.get('/:id/analytics', protect, getAnalytics);
router.get('/:id/compare-variations', protect, compareVariations);
router.post('/:id/suggestions', protect, getImprovementSuggestions);
router.post('/:id/comprehensive-report', protect, getComprehensiveReport);

// TEST ENDPOINT (public for debugging)
router.get('/test-apis', testAPIs);

module.exports = router;
