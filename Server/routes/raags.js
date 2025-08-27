const express = require('express');
const router = express.Router();
const raagController = require('../controllers/raagController');
const { authenticateToken, logUserActivity } = require('../middleware/auth');

// Search for a raag
router.get('/search', authenticateToken, logUserActivity('search', 'raags'), raagController.searchRaag);

// "All About" search for a raag
router.get('/all-about', authenticateToken, logUserActivity('search', 'raags'), raagController.getAllAboutRaag);

// Get verified raags
router.get('/verified', raagController.getVerifiedRaags);

// Get unverified raags
router.get('/unverified', raagController.getUnverifiedRaags);

// Get verification statistics
router.get('/stats', raagController.getVerificationStats);

// Get all raags
router.get('/', raagController.getAllRaags);

// Get raag by ID
router.get('/:id', raagController.getRaagById);

// Update raag
router.put('/:id', authenticateToken, logUserActivity('update', 'raags'), raagController.updateRaag);

// Delete raag
router.delete('/:id', authenticateToken, logUserActivity('delete', 'raags'), raagController.deleteRaag);

// Bulk delete raags
router.delete('/', authenticateToken, logUserActivity('delete', 'raags'), raagController.bulkDeleteRaags);

// Export single raag
router.get('/:id/export', authenticateToken, logUserActivity('export', 'raags'), raagController.exportSingleRaag);

// Export raags
router.post('/export', authenticateToken, logUserActivity('export', 'raags'), raagController.exportRaags);

module.exports = router; 