const Artist = require('../models/Artist');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');

exports.searchArtist = async (req, res) => {
  try {
    const { name, useAI } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Artist name is required' });
    }

    // First check if artist exists in database
    let artist = await Artist.findOne({ 'name.value': name });

    if (!artist) {
      let data;
      if (useAI === 'true') {
        // Use AI research
        data = await aiResearcher.researchArtist(name);
      } else {
        // Use traditional scraping
        data = await scraperService.scrapeArtist(name);
      }
      artist = new Artist(data);
      await artist.save();
    }

    res.json(artist);
  } catch (error) {
    console.error('Error in searchArtist:', error);
    res.status(500).json({ message: error.message || 'Error searching for artist' });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow updating verified fields
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Update only verified fields
    Object.keys(updates).forEach(field => {
      if (artist[field] && updates[field].verified) {
        artist[field] = updates[field];
      }
    });

    artist.updatedAt = Date.now();
    await artist.save();

    res.json(artist);
  } catch (error) {
    console.error('Error in updateArtist:', error);
    res.status(500).json({ message: 'Error updating artist' });
  }
};

exports.getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find();
    res.json(artists);
  } catch (error) {
    console.error('Error in getAllArtists:', error);
    res.status(500).json({ message: 'Error fetching artists' });
  }
};

exports.getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findById(id);
    
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.json(artist);
  } catch (error) {
    console.error('Error in getArtistById:', error);
    res.status(500).json({ message: 'Error fetching artist' });
  }
}; 