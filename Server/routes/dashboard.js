const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const Raag = require('../models/Raag');
const Taal = require('../models/Taal');
const { authenticateToken } = require('../middleware/auth');

// Get overall dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get total counts
    const totalArtists = await Artist.countDocuments();
    const totalRaags = await Raag.countDocuments();
    const totalTaals = await Taal.countDocuments();
    
    // Get verification counts for artists
    const artistsFullyVerified = await Artist.countDocuments({
      'name.verified': true,
      'guru.verified': true,
      'gharana.verified': true,
      'notableAchievements.verified': true,
      'disciples.verified': true,
      'summary.verified': true,
      'allAboutData.answer.verified': true
    });
    
    const artistsPartiallyVerified = await Artist.countDocuments({
      $or: [
        { 'name.verified': true },
        { 'guru.verified': true },
        { 'gharana.verified': true },
        { 'notableAchievements.verified': true },
        { 'disciples.verified': true },
        { 'summary.verified': true },
        { 'allAboutData.answer.verified': true }
      ]
    });
    
    // Get verification counts for raags
    const raagsFullyVerified = await Raag.countDocuments({
      'name.verified': true,
      'aroha.verified': true,
      'avroha.verified': true,
      'chalan.verified': true,
      'vadi.verified': true,
      'samvadi.verified': true,
      'thaat.verified': true,
      'rasBhaav.verified': true,
      'tanpuraTuning.verified': true,
      'timeOfRendition.verified': true,
      'allAboutData.answer.verified': true
    });
    
    const raagsPartiallyVerified = await Raag.countDocuments({
      $or: [
        { 'name.verified': true },
        { 'aroha.verified': true },
        { 'avroha.verified': true },
        { 'chalan.verified': true },
        { 'vadi.verified': true },
        { 'samvadi.verified': true },
        { 'thaat.verified': true },
        { 'rasBhaav.verified': true },
        { 'tanpuraTuning.verified': true },
        { 'timeOfRendition.verified': true },
        { 'allAboutData.answer.verified': true }
      ]
    });
    
    // Get verification counts for taals
    const taalsFullyVerified = await Taal.countDocuments({
      'name.verified': true,
      'numberOfBeats.verified': true,
      'divisions.verified': true,
      'taali.count.verified': true,
      'taali.beatNumbers.verified': true,
      'khaali.count.verified': true,
      'khaali.beatNumbers.verified': true,
      'jaati.verified': true,
      'allAboutData.answer.verified': true
    });
    
    const taalsPartiallyVerified = await Taal.countDocuments({
      $or: [
        { 'name.verified': true },
        { 'numberOfBeats.verified': true },
        { 'divisions.verified': true },
        { 'taali.count.verified': true },
        { 'taali.beatNumbers.verified': true },
        { 'khaali.count.verified': true },
        { 'khaali.beatNumbers.verified': true },
        { 'jaati.verified': true },
        { 'allAboutData.answer.verified': true }
      ]
    });
    
    // Get recent additions
    const recentArtists = await Artist.find().sort({ createdAt: -1 }).limit(5);
    const recentRaags = await Raag.find().sort({ createdAt: -1 }).limit(5);
    const recentTaals = await Taal.find().sort({ createdAt: -1 }).limit(5);
    
    res.json({
      overview: {
        totalEntries: totalArtists + totalRaags + totalTaals,
        totalArtists,
        totalRaags,
        totalTaals
      },
      verification: {
        artists: {
          total: totalArtists,
          fullyVerified: artistsFullyVerified,
          partiallyVerified: artistsPartiallyVerified,
          unverified: totalArtists - artistsPartiallyVerified,
          verificationRate: totalArtists > 0 ? ((artistsFullyVerified / totalArtists) * 100).toFixed(2) : 0
        },
        raags: {
          total: totalRaags,
          fullyVerified: raagsFullyVerified,
          partiallyVerified: raagsPartiallyVerified,
          unverified: totalRaags - raagsPartiallyVerified,
          verificationRate: totalRaags > 0 ? ((raagsFullyVerified / totalRaags) * 100).toFixed(2) : 0
        },
        taals: {
          total: totalTaals,
          fullyVerified: taalsFullyVerified,
          partiallyVerified: taalsPartiallyVerified,
          unverified: totalTaals - taalsPartiallyVerified,
          verificationRate: totalTaals > 0 ? ((taalsFullyVerified / totalTaals) * 100).toFixed(2) : 0
        }
      },
      recent: {
        artists: recentArtists.map(artist => ({
          _id: artist._id,
          name: artist.name.value,
          createdAt: artist.createdAt,
          verified: artist.name.verified
        })),
        raags: recentRaags.map(raag => ({
          _id: raag._id,
          name: raag.name.value,
          createdAt: raag.createdAt,
          verified: raag.name.verified
        })),
        taals: recentTaals.map(taal => ({
          _id: taal._id,
          name: taal.name.value,
          createdAt: taal.createdAt,
          verified: taal.name.verified
        }))
      }
    });
  } catch (error) {
    console.error('Error in dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get entries that need verification (priority list)
router.get('/pending-verification', authenticateToken, async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    let results = {};
    
    if (!category || category === 'artists') {
      const pendingArtists = await Artist.find({
        $or: [
          { 'name.verified': false },
          { 'guru.verified': false },
          { 'gharana.verified': false },
          { 'notableAchievements.verified': false },
          { 'disciples.verified': false },
          { 'summary.verified': false },
          { 'allAboutData.answer.verified': false }
        ]
      }).sort({ createdAt: -1 }).limit(parseInt(limit));
      
      results.artists = pendingArtists;
    }
    
    if (!category || category === 'raags') {
      const pendingRaags = await Raag.find({
        $or: [
          { 'name.verified': false },
          { 'aroha.verified': false },
          { 'avroha.verified': false },
          { 'chalan.verified': false },
          { 'vadi.verified': false },
          { 'samvadi.verified': false },
          { 'thaat.verified': false },
          { 'rasBhaav.verified': false },
          { 'tanpuraTuning.verified': false },
          { 'timeOfRendition.verified': false },
          { 'allAboutData.answer.verified': false }
        ]
      }).sort({ createdAt: -1 }).limit(parseInt(limit));
      
      results.raags = pendingRaags;
    }
    
    if (!category || category === 'taals') {
      const pendingTaals = await Taal.find({
        $or: [
          { 'name.verified': false },
          { 'numberOfBeats.verified': false },
          { 'divisions.verified': false },
          { 'taali.count.verified': false },
          { 'taali.beatNumbers.verified': false },
          { 'khaali.count.verified': false },
          { 'khaali.beatNumbers.verified': false },
          { 'jaati.verified': false },
          { 'allAboutData.answer.verified': false }
        ]
      }).sort({ createdAt: -1 }).limit(parseInt(limit));
      
      results.taals = pendingTaals;
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error in pending verification:', error);
    res.status(500).json({ message: 'Error fetching pending verification data' });
  }
});

module.exports = router;