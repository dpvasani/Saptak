const express = require('express');
const router = express.Router();
const taalController = require('../controllers/taalController');

// Search for a taal
router.get('/search', taalController.searchTaal);

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
router.put('/:id', taalController.updateTaal);

// Delete taal
router.delete('/:id', taalController.deleteTaal);

// Bulk delete taals
router.delete('/', taalController.bulkDeleteTaals);

// Export single taal
router.get('/:id/export', taalController.exportSingleTaal);

// Export taals
router.post('/export', taalController.exportTaals);

module.exports = router; 