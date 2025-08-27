const express = require('express');
const router = express.Router();
const raagController = require('../controllers/raagController');

// Search for a raag
router.get('/search', raagController.searchRaag);

// "All About" search for a raag
router.get('/all-about', raagController.getAllAboutRaag);

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
router.put('/:id', raagController.updateRaag);

// Delete raag
router.delete('/:id', raagController.deleteRaag);

// Bulk delete raags
router.delete('/', raagController.bulkDeleteRaags);

// Export single raag
router.get('/:id/export', raagController.exportSingleRaag);

// Export raags
router.post('/export', raagController.exportRaags);

module.exports = router; 