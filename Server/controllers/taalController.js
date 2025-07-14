const Taal = require('../models/Taal');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');
const geminiResearcher = require('../services/geminiResearcher');

exports.searchTaal = async (req, res) => {
  try {
    const { name, useAI, aiProvider } = req.query;
    console.log('Search request received:', { name, useAI, aiProvider });
    
    if (!name) {
      return res.status(400).json({ message: 'Taal name is required' });
    }

    let data;
    if (useAI === 'true') {
      // Use AI research - always get fresh data
      const provider = aiProvider || 'openai'; // Default to OpenAI
      console.log(`Using ${provider} AI research for taal:`, name);
      try {
        if (provider === 'gemini') {
          data = await geminiResearcher.researchTaal(name);
          console.log('Gemini AI research successful, data received:', data);
        } else {
          data = await aiResearcher.researchTaal(name);
          console.log('OpenAI research successful, data received:', data);
        }
      } catch (aiError) {
        console.error(`${provider} AI research failed:`, aiError);
        return res.status(500).json({ message: `${provider} AI research failed: ` + aiError.message });
      }
    } else {
      // Use traditional scraping
      console.log('Using traditional scraping for taal:', name);
      data = await scraperService.scrapeTaal(name);
    }

    // Create new taal with the researched data
    const taal = new Taal(data);
    await taal.save();
    console.log('Saved taal to database:', taal);

    res.json(taal);
  } catch (error) {
    console.error('Error in searchTaal:', error);
    res.status(500).json({ message: error.message || 'Error searching for taal' });
  }
};

exports.updateTaal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow updating verified fields
    const taal = await Taal.findById(id);
    if (!taal) {
      return res.status(404).json({ message: 'Taal not found' });
    }

    // Update only verified fields
    Object.keys(updates).forEach(field => {
      if (taal[field] && updates[field].verified) {
        taal[field] = updates[field];
      }
    });

    taal.updatedAt = Date.now();
    await taal.save();

    res.json(taal);
  } catch (error) {
    console.error('Error in updateTaal:', error);
    res.status(500).json({ message: 'Error updating taal' });
  }
};

exports.getAllTaals = async (req, res) => {
  try {
    const taals = await Taal.find();
    res.json(taals);
  } catch (error) {
    console.error('Error in getAllTaals:', error);
    res.status(500).json({ message: 'Error fetching taals' });
  }
};

exports.getTaalById = async (req, res) => {
  try {
    const { id } = req.params;
    const taal = await Taal.findById(id);
    
    if (!taal) {
      return res.status(404).json({ message: 'Taal not found' });
    }

    res.json(taal);
  } catch (error) {
    console.error('Error in getTaalById:', error);
    res.status(500).json({ message: 'Error fetching taal' });
  }
}; 