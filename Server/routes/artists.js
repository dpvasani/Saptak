const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const asyncHandler = require('../middleware/asyncHandler');
const { validateSearch, validateId, validateArtistUpdate } = require('../middleware/validation');

// Search for an artist
router.get('/search', validateSearch, asyncHandler(artistController.searchArtist));

// Get verified artists
router.get('/verified', asyncHandler(artistController.getVerifiedArtists));

// Get unverified artists
router.get('/unverified', asyncHandler(artistController.getUnverifiedArtists));

// Get verification statistics
router.get('/stats', asyncHandler(artistController.getVerificationStats));

// Get all artists
router.get('/', asyncHandler(artistController.getAllArtists));

// Get artist by ID
router.get('/:id', validateId, asyncHandler(artistController.getArtistById));

// Update artist
router.put('/:id', validateId, validateArtistUpdate, asyncHandler(artistController.updateArtist));

module.exports = router; 