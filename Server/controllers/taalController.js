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

exports.getVerifiedTaals = async (req, res) => {
  try {
    const { field } = req.query;
    let query = {};
    
    if (field) {
      if (field.includes('.')) {
        // Handle nested fields like taali.count, khaali.beatNumbers
        query[`${field}.verified`] = true;
      } else {
        query[`${field}.verified`] = true;
      }
    } else {
      query = {
        $or: [
          { 'name.verified': true },
          { 'numberOfBeats.verified': true },
          { 'divisions.verified': true },
          { 'taali.count.verified': true },
          { 'taali.beatNumbers.verified': true },
          { 'khaali.count.verified': true },
          { 'khaali.beatNumbers.verified': true },
          { 'jaati.verified': true }
        ]
      };
    }
    
    const taals = await Taal.find(query).sort({ updatedAt: -1 });
    res.json({
      count: taals.length,
      data: taals
    });
  } catch (error) {
    console.error('Error in getVerifiedTaals:', error);
    res.status(500).json({ message: 'Error fetching verified taals' });
  }
};

exports.getUnverifiedTaals = async (req, res) => {
  try {
    const { field } = req.query;
    let query = {};
    
    if (field) {
      if (field.includes('.')) {
        query[`${field}.verified`] = false;
      } else {
        query[`${field}.verified`] = false;
      }
    } else {
      query = {
        'name.verified': false,
        'numberOfBeats.verified': false,
        'divisions.verified': false,
        'taali.count.verified': false,
        'taali.beatNumbers.verified': false,
        'khaali.count.verified': false,
        'khaali.beatNumbers.verified': false,
        'jaati.verified': false
      };
    }
    
    const taals = await Taal.find(query).sort({ createdAt: -1 });
    res.json({
      count: taals.length,
      data: taals
    });
  } catch (error) {
    console.error('Error in getUnverifiedTaals:', error);
    res.status(500).json({ message: 'Error fetching unverified taals' });
  }
};

exports.getVerificationStats = async (req, res) => {
  try {
    const totalTaals = await Taal.countDocuments();
    
    const nameVerified = await Taal.countDocuments({ 'name.verified': true });
    const numberOfBeatsVerified = await Taal.countDocuments({ 'numberOfBeats.verified': true });
    const divisionsVerified = await Taal.countDocuments({ 'divisions.verified': true });
    const taaliCountVerified = await Taal.countDocuments({ 'taali.count.verified': true });
    const taaliBeatNumbersVerified = await Taal.countDocuments({ 'taali.beatNumbers.verified': true });
    const khaaliCountVerified = await Taal.countDocuments({ 'khaali.count.verified': true });
    const khaaliBeatNumbersVerified = await Taal.countDocuments({ 'khaali.beatNumbers.verified': true });
    const jaatiVerified = await Taal.countDocuments({ 'jaati.verified': true });
    
    const partiallyVerified = await Taal.countDocuments({
      $or: [
        { 'name.verified': true },
        { 'numberOfBeats.verified': true },
        { 'divisions.verified': true },
        { 'taali.count.verified': true },
        { 'taali.beatNumbers.verified': true },
        { 'khaali.count.verified': true },
        { 'khaali.beatNumbers.verified': true },
        { 'jaati.verified': true }
      ]
    });
    
    const fullyVerified = await Taal.countDocuments({
      'name.verified': true,
      'numberOfBeats.verified': true,
      'divisions.verified': true,
      'taali.count.verified': true,
      'taali.beatNumbers.verified': true,
      'khaali.count.verified': true,
      'khaali.beatNumbers.verified': true,
      'jaati.verified': true
    });
    
    const unverified = totalTaals - partiallyVerified;
    
    res.json({
      total: totalTaals,
      fullyVerified,
      partiallyVerified,
      unverified,
      fieldStats: {
        name: nameVerified,
        numberOfBeats: numberOfBeatsVerified,
        divisions: divisionsVerified,
        taaliCount: taaliCountVerified,
        taaliBeatNumbers: taaliBeatNumbersVerified,
        khaaliCount: khaaliCountVerified,
        khaaliBeatNumbers: khaaliBeatNumbersVerified,
        jaati: jaatiVerified
      },
      percentages: {
        fullyVerified: totalTaals > 0 ? ((fullyVerified / totalTaals) * 100).toFixed(2) : 0,
        partiallyVerified: totalTaals > 0 ? ((partiallyVerified / totalTaals) * 100).toFixed(2) : 0,
        unverified: totalTaals > 0 ? ((unverified / totalTaals) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error in getVerificationStats:', error);
    res.status(500).json({ message: 'Error fetching verification statistics' });
  }
}; 