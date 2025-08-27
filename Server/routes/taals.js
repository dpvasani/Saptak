const express = require('express');
const router = express.Router();
const taalController = require('../controllers/taalController');
const { authenticateToken, logUserActivity } = require('../middleware/auth');

// Search for a taal
router.get('/search', authenticateToken, logUserActivity('search', 'taals'), taalController.searchTaal);

// "All About" search for a taal
router.get('/all-about', authenticateToken, logUserActivity('search', 'taals'), taalController.getAllAboutTaal);

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
router.put('/:id', authenticateToken, logUserActivity('update', 'taals'), taalController.updateTaal);

// Delete taal
router.delete('/:id', authenticateToken, logUserActivity('delete', 'taals'), taalController.deleteTaal);

// Bulk delete taals
router.delete('/', authenticateToken, logUserActivity('delete', 'taals'), taalController.bulkDeleteTaals);

// Export single taal
router.get('/:id/export', authenticateToken, logUserActivity('export', 'taals'), taalController.exportSingleTaal);

// Export taals
router.post('/export', authenticateToken, logUserActivity('export', 'taals'), taalController.exportTaals);

module.exports = router; 