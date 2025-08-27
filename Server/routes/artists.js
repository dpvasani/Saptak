const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const asyncHandler = require('../middleware/asyncHandler');
const { validateSearch, validateId, validateArtistUpdate } = require('../middleware/validation');
const { aiLimiter, searchLimiter, updateLimiter } = require('../middleware/rateLimiter');
const { authenticateToken, logUserActivity } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Search for an artist
router.get('/search', searchLimiter, logUserActivity('search', 'artists'), validateSearch, asyncHandler(artistController.searchArtist));

// "All About" search for an artist
router.get('/all-about', searchLimiter, logUserActivity('search', 'artists'), validateSearch, asyncHandler(artistController.getAllAboutArtist));

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
router.put('/:id', updateLimiter, logUserActivity('update', 'artists'), validateId, validateArtistUpdate, asyncHandler(artistController.updateArtist));

// Delete artist
router.delete('/:id', logUserActivity('delete', 'artists'), validateId, asyncHandler(artistController.deleteArtist));

// Bulk delete artists
router.delete('/', logUserActivity('delete', 'artists'), asyncHandler(artistController.bulkDeleteArtists));

// Get partially verified artists
router.get('/partial', asyncHandler(artistController.getPartiallyVerifiedArtists));

// Export artists
router.post('/export', logUserActivity('export', 'artists'), asyncHandler(artistController.exportArtists));

// Export single artist
router.get('/:id/export', logUserActivity('export', 'artists'), validateId, asyncHandler(artistController.exportSingleArtist));
module.exports = router; 