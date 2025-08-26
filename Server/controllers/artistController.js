const Artist = require('../models/Artist');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');
const geminiResearcher = require('../services/geminiResearcher');
const perplexityResearcher = require('../services/perplexityResearcher');
const { aiLimiter, webScrapingLimiter } = require('../middleware/rateLimiter');

exports.searchArtist = async (req, res) => {
  try {
    const { name, useAI, aiProvider, aiModel } = req.query;
    console.log('Search request received:', { name, useAI, aiProvider, aiModel });
    
    if (!name) {
      return res.status(400).json({ message: 'Artist name is required' });
    }

    // Apply AI rate limiting if using AI
    if (useAI === 'true') {
      await new Promise((resolve, reject) => {
        aiLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    let data;
    if (useAI === 'true') {
      // Use AI research - always get fresh data
      const provider = aiProvider || 'openai'; // Default to OpenAI
      const model = aiModel || 'default';
      console.log(`Using ${provider} AI research (${model}) for artist:`, name);
      try {
        if (provider === 'perplexity') {
          data = await perplexityResearcher.researchArtist(name, model);
          console.log('Perplexity AI research successful, data received:', data);
        } else if (provider === 'gemini') {
          data = await geminiResearcher.researchArtist(name, model);
          console.log('Gemini AI research successful, data received:', data);
        } else {
          data = await aiResearcher.researchArtist(name, model);
          console.log('OpenAI research successful, data received:', data);
        }
      } catch (aiError) {
        console.error(`${provider} AI research failed:`, aiError);
        return res.status(500).json({ message: `${provider} AI research (${model}) failed: ` + aiError.message });
      }
    } else {
      // Use traditional scraping
      // Apply web scraping rate limiting
      await new Promise((resolve, reject) => {
        webScrapingLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log('Using enhanced web search (prioritizing official websites) for artist:', name);
      data = await scraperService.scrapeArtist(name);
    }

    // Create new artist with the researched data
    const artist = new Artist(data);
    await artist.save();
    console.log('Saved artist to database:', artist);

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

exports.getVerifiedArtists = async (req, res) => {
  try {
    const { field } = req.query; // Optional: filter by specific field
    let query = {};
    
    if (field) {
      // Get artists where specific field is verified
      query[`${field}.verified`] = true;
    } else {
      // Get artists where at least one field is verified
      query = {
        $or: [
          { 'name.verified': true },
          { 'guru.verified': true },
          { 'gharana.verified': true },
          { 'notableAchievements.verified': true },
          { 'disciples.verified': true }
        ]
      };
    }
    
    const artists = await Artist.find(query).sort({ updatedAt: -1 });
    res.json({
      count: artists.length,
      data: artists
    });
  } catch (error) {
    console.error('Error in getVerifiedArtists:', error);
    res.status(500).json({ message: 'Error fetching verified artists' });
  }
};

exports.getUnverifiedArtists = async (req, res) => {
  try {
    const { field } = req.query; // Optional: filter by specific field
    let query = {};
    
    if (field) {
      // Get artists where specific field is not verified
      query[`${field}.verified`] = false;
    } else {
      // Get artists where all fields are unverified
      query = {
        'name.verified': false,
        'guru.verified': false,
        'gharana.verified': false,
        'notableAchievements.verified': false,
        'disciples.verified': false
      };
    }
    
    const artists = await Artist.find(query).sort({ createdAt: -1 });
    res.json({
      count: artists.length,
      data: artists
    });
  } catch (error) {
    console.error('Error in getUnverifiedArtists:', error);
    res.status(500).json({ message: 'Error fetching unverified artists' });
  }
};

exports.getVerificationStats = async (req, res) => {
  try {
    const totalArtists = await Artist.countDocuments();
    
    // Count verified fields
    const nameVerified = await Artist.countDocuments({ 'name.verified': true });
    const guruVerified = await Artist.countDocuments({ 'guru.verified': true });
    const gharanaVerified = await Artist.countDocuments({ 'gharana.verified': true });
    const achievementsVerified = await Artist.countDocuments({ 'notableAchievements.verified': true });
    const disciplesVerified = await Artist.countDocuments({ 'disciples.verified': true });
    const summaryVerified = await Artist.countDocuments({ 'summary.verified': true });
    
    // Count artists with at least one verified field
    const partiallyVerified = await Artist.countDocuments({
      $or: [
        { 'name.verified': true },
        { 'guru.verified': true },
        { 'gharana.verified': true },
        { 'notableAchievements.verified': true },
        { 'disciples.verified': true },
        { 'summary.verified': true }
        { 'summary.verified': true }
      ]
    });
    
    // Count fully verified artists (all fields verified)
    const fullyVerified = await Artist.countDocuments({
      'name.verified': true,
      'guru.verified': true,
      'gharana.verified': true,
      'notableAchievements.verified': true,
      'disciples.verified': true,
      'summary.verified': true
    });
    
    const unverified = totalArtists - partiallyVerified;
    
    res.json({
      total: totalArtists,
      fullyVerified,
      partiallyVerified,
      unverified,
      fieldStats: {
        name: nameVerified,
        guru: guruVerified,
        gharana: gharanaVerified,
        notableAchievements: achievementsVerified,
        disciples: disciplesVerified,
        summary: summaryVerified
      },
      percentages: {
        fullyVerified: totalArtists > 0 ? ((fullyVerified / totalArtists) * 100).toFixed(2) : 0,
        partiallyVerified: totalArtists > 0 ? ((partiallyVerified / totalArtists) * 100).toFixed(2) : 0,
        unverified: totalArtists > 0 ? ((unverified / totalArtists) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error in getVerificationStats:', error);
    res.status(500).json({ message: 'Error fetching verification statistics' });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findByIdAndDelete(id);
    
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.json({ message: 'Artist deleted successfully' });
  } catch (error) {
    console.error('Error in deleteArtist:', error);
    res.status(500).json({ message: 'Error deleting artist' });
  }
};

exports.getPartiallyVerifiedArtists = async (req, res) => {
  try {
    const { field } = req.query;
    let query = {};
    
    if (field) {
      query = {
        $and: [
          { [`${field}.verified`]: true },
          {
            $or: [
              { 'name.verified': false },
              { 'guru.verified': false },
              { 'gharana.verified': false },
              { 'notableAchievements.verified': false },
              { 'disciples.verified': false }
            ]
          }
        ]
      };
    } else {
      // Artists with some but not all fields verified
      query = {
        $and: [
          {
            $or: [
              { 'name.verified': true },
              { 'guru.verified': true },
              { 'gharana.verified': true },
              { 'notableAchievements.verified': true },
              { 'disciples.verified': true }
            ]
          },
          {
            $or: [
              { 'name.verified': false },
              { 'guru.verified': false },
              { 'gharana.verified': false },
              { 'notableAchievements.verified': false },
              { 'disciples.verified': false }
            ]
          }
        ]
      };
    }
    
    const artists = await Artist.find(query).sort({ updatedAt: -1 });
    res.json({
      count: artists.length,
      data: artists
    });
  } catch (error) {
    console.error('Error in getPartiallyVerifiedArtists:', error);
    res.status(500).json({ message: 'Error fetching partially verified artists' });
  }
};

exports.exportArtists = async (req, res) => {
  try {
    const { format } = req.query;
    const artists = await Artist.find().sort({ 'name.value': 1 });
    
    if (format === 'markdown') {
      let markdown = '# Indian Classical Music Artists\n\n';
      
      artists.forEach(artist => {
        markdown += `## ${artist.name.value}\n\n`;
        if (artist.guru.value) markdown += `**Guru:** ${artist.guru.value}\n\n`;
        if (artist.gharana.value) markdown += `**Gharana:** ${artist.gharana.value}\n\n`;
        if (artist.notableAchievements.value) markdown += `**Achievements:** ${artist.notableAchievements.value}\n\n`;
        if (artist.disciples.value) markdown += `**Disciples:** ${artist.disciples.value}\n\n`;
        markdown += '---\n\n';
      });
      
      res.setHeader('Content-Type', 'text/markdown');
      res.send(markdown);
    } else {
      // For PDF and Word, return JSON that frontend can process
      res.json(artists);
    }
  } catch (error) {
    console.error('Error in exportArtists:', error);
    res.status(500).json({ message: 'Error exporting artists' });
  }
};