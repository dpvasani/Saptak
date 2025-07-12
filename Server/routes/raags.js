const express = require('express');
const router = express.Router();
const raagController = require('../controllers/raagController');

// Search for a raag
router.get('/search', raagController.searchRaag);

// Get all raags
router.get('/', raagController.getAllRaags);

// Get raag by ID
router.get('/:id', raagController.getRaagById);

// Update raag
router.put('/:id', raagController.updateRaag);

module.exports = router; 