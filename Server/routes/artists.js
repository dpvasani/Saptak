const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');

// Search for an artist
router.get('/search', artistController.searchArtist);

// Get all artists
router.get('/', artistController.getAllArtists);

// Get artist by ID
router.get('/:id', artistController.getArtistById);

// Update artist
router.put('/:id', artistController.updateArtist);

module.exports = router; 