const Raag = require('../models/Raag');
const scraperService = require('../services/scraper');

exports.searchRaag = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Raag name is required' });
    }

    // First check if raag exists in database
    let raag = await Raag.findOne({ 'name.value': name });

    if (!raag) {
      // If not found, scrape data
      const scrapedData = await scraperService.scrapeRaag(name);
      raag = new Raag(scrapedData);
      await raag.save();
    }

    res.json(raag);
  } catch (error) {
    console.error('Error in searchRaag:', error);
    res.status(500).json({ message: 'Error searching for raag' });
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