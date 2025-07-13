const Raag = require('../models/Raag');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');

exports.searchRaag = async (req, res) => {
  try {
    const { name, useAI } = req.query;
    console.log('Search request received:', { name, useAI });
    
    if (!name) {
      return res.status(400).json({ message: 'Raag name is required' });
    }

    let data;
    if (useAI === 'true') {
      // Use AI research - always get fresh data
      console.log('Using AI research for raag:', name);
      try {
        data = await aiResearcher.researchRaag(name);
        console.log('AI research successful, data received:', data);
      } catch (aiError) {
        console.error('AI research failed:', aiError);
        return res.status(500).json({ message: 'AI research failed: ' + aiError.message });
      }
    } else {
      // Use traditional scraping
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