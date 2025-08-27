const express = require('express');
const router = express.Router();
const taalController = require('../controllers/taalController');
const { authenticateToken, logUserActivity } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);
// Search for a taal
router.get('/search', logUserActivity('search', 'taals'), taalController.searchTaal);

// "All About" search for a taal
router.get('/all-about', logUserActivity('search', 'taals'), taalController.getAllAboutTaal);

// Get verified taals
router.get('/verified', taalController.getVerifiedTaals);

// Get unverified taals
router.get('/unverified', taalController.getUnverifiedTaals);

// Get verification statistics
router.get('/stats', taalController.getVerificationStats);

// Get all taals
router.get('/', taalController.getAllTaals);

// Get taal by ID
router.get('/:id', taalController.getTaalById);

// Update taal
router.put('/:id', logUserActivity('update', 'taals'), taalController.updateTaal);

// Delete taal
router.delete('/:id', logUserActivity('delete', 'taals'), taalController.deleteTaal);

// Bulk delete taals
router.delete('/', logUserActivity('delete', 'taals'), taalController.bulkDeleteTaals);

// Export single taal
router.get('/:id/export', logUserActivity('export', 'taals'), taalController.exportSingleTaal);

// Export taals
router.post('/export', logUserActivity('export', 'taals'), taalController.exportTaals);

module.exports = router; 