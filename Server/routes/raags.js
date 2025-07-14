const express = require('express');
const router = express.Router();
const raagController = require('../controllers/raagController');

// Search for a raag
router.get('/search', raagController.searchRaag);

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

module.exports = router; 