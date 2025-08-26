const Raag = require('../models/Raag');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');
const geminiResearcher = require('../services/geminiResearcher');
const perplexityResearcher = require('../services/perplexityResearcher');
const { webScrapingLimiter } = require('../middleware/rateLimiter');
const mongoose = require('mongoose');

exports.searchRaag = async (req, res) => {
  try {
    const { name, useAI, aiProvider, aiModel } = req.query;
    console.log('Search request received:', { name, useAI, aiProvider, aiModel });
    
    if (!name) {
      return res.status(400).json({ message: 'Raag name is required' });
    }

    let data;
    if (useAI === 'true') {
      // Use AI research - always get fresh data
      const provider = aiProvider || 'openai'; // Default to OpenAI
      const model = aiModel || 'default';
      console.log(`Using ${provider} AI research (${model}) for raag:`, name);
      try {
        if (provider === 'perplexity') {
          data = await perplexityResearcher.researchRaag(name, model);
          console.log('Perplexity AI research successful, data received:', data);
        } else if (provider === 'gemini') {
          data = await geminiResearcher.researchRaag(name, model);
          console.log('Gemini AI research successful, data received:', data);
        } else {
          data = await aiResearcher.researchRaag(name, model);
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
      
      console.log('Using traditional scraping for raag:', name);
      data = await scraperService.scrapeRaag(name);
    }

    // Create new raag with the researched data
    const raag = new Raag(data);
    await raag.save();
    console.log('Saved raag to database:', raag);

    res.json(raag);
  } catch (error) {
    console.error('Error in searchRaag:', error);
    res.status(500).json({ message: error.message || 'Error searching for raag' });
  }
};

exports.updateRaag = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow updating verified fields
    const raag = await Raag.findById(id);
    if (!raag) {
      return res.status(404).json({ message: 'Raag not found' });
    }

    // Update only verified fields
    Object.keys(updates).forEach(field => {
      if (raag[field] && updates[field].verified) {
        raag[field] = updates[field];
      }
    });

    raag.updatedAt = Date.now();
    await raag.save();

    res.json(raag);
  } catch (error) {
    console.error('Error in updateRaag:', error);
    res.status(500).json({ message: 'Error updating raag' });
  }
};

exports.getAllRaags = async (req, res) => {
  try {
    const raags = await Raag.find();
    res.json(raags);
  } catch (error) {
    console.error('Error in getAllRaags:', error);
    res.status(500).json({ message: 'Error fetching raags' });
  }
};

exports.getRaagById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid raag id' });
    }
    const raag = await Raag.findById(id);
    
    if (!raag) {
      return res.status(404).json({ message: 'Raag not found' });
    }

    res.json(raag);
  } catch (error) {
    console.error('Error in getRaagById:', error);
    res.status(500).json({ message: 'Error fetching raag' });
  }
};

exports.getVerifiedRaags = async (req, res) => {
  try {
    const { field } = req.query;
    let query = {};
    
    if (field) {
      query[`${field}.verified`] = true;
    } else {
      query = {
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
          { 'timeOfRendition.verified': true }
        ]
      };
    }
    
    const raags = await Raag.find(query).sort({ updatedAt: -1 });
    res.json({
      count: raags.length,
      data: raags
    });
  } catch (error) {
    console.error('Error in getVerifiedRaags:', error);
    res.status(500).json({ message: 'Error fetching verified raags' });
  }
};

exports.getUnverifiedRaags = async (req, res) => {
  try {
    const { field } = req.query;
    let query = {};
    
    if (field) {
      query[`${field}.verified`] = false;
    } else {
      query = {
        $and: [
          { 'name.verified': false },
          { 'aroha.verified': false },
          { 'avroha.verified': false },
          { 'chalan.verified': false },
          { 'vadi.verified': false },
          { 'samvadi.verified': false },
          { 'thaat.verified': false },
          { 'rasBhaav.verified': false },
          { 'tanpuraTuning.verified': false },
          { 'timeOfRendition.verified': false }
        ]
      };
    }
    
    const raags = await Raag.find(query).sort({ createdAt: -1 });
    res.json({
      count: raags.length,
      data: raags
    });
  } catch (error) {
    console.error('Error in getUnverifiedRaags:', error);
    res.status(500).json({ message: 'Error fetching unverified raags' });
  }
};

exports.getVerificationStats = async (req, res) => {
  try {
    const totalRaags = await Raag.countDocuments();
    
    const nameVerified = await Raag.countDocuments({ 'name.verified': true });
    const arohaVerified = await Raag.countDocuments({ 'aroha.verified': true });
    const avrohaVerified = await Raag.countDocuments({ 'avroha.verified': true });
    const chalanVerified = await Raag.countDocuments({ 'chalan.verified': true });
    const vadiVerified = await Raag.countDocuments({ 'vadi.verified': true });
    const samvadiVerified = await Raag.countDocuments({ 'samvadi.verified': true });
    const thaatVerified = await Raag.countDocuments({ 'thaat.verified': true });
    const rasBhaavVerified = await Raag.countDocuments({ 'rasBhaav.verified': true });
    const tanpuraTuningVerified = await Raag.countDocuments({ 'tanpuraTuning.verified': true });
    const timeOfRenditionVerified = await Raag.countDocuments({ 'timeOfRendition.verified': true });
    
    const partiallyVerified = await Raag.countDocuments({
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
        { 'timeOfRendition.verified': true }
      ]
    });
    
    const fullyVerified = await Raag.countDocuments({
      'name.verified': true,
      'aroha.verified': true,
      'avroha.verified': true,
      'chalan.verified': true,
      'vadi.verified': true,
      'samvadi.verified': true,
      'thaat.verified': true,
      'rasBhaav.verified': true,
      'tanpuraTuning.verified': true,
      'timeOfRendition.verified': true
    });
    
    const unverified = totalRaags - partiallyVerified;
    
    res.json({
      total: totalRaags,
      fullyVerified,
      partiallyVerified,
      unverified,
      fieldStats: {
        name: nameVerified,
        aroha: arohaVerified,
        avroha: avrohaVerified,
        chalan: chalanVerified,
        vadi: vadiVerified,
        samvadi: samvadiVerified,
        thaat: thaatVerified,
        rasBhaav: rasBhaavVerified,
        tanpuraTuning: tanpuraTuningVerified,
        timeOfRendition: timeOfRenditionVerified
      },
      percentages: {
        fullyVerified: totalRaags > 0 ? ((fullyVerified / totalRaags) * 100).toFixed(2) : 0,
        partiallyVerified: totalRaags > 0 ? ((partiallyVerified / totalRaags) * 100).toFixed(2) : 0,
        unverified: totalRaags > 0 ? ((unverified / totalRaags) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error in getVerificationStats:', error);
    res.status(500).json({ message: 'Error fetching verification statistics' });
  }
}; 