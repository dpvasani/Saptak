const Raag = require('../models/Raag');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');
const geminiResearcher = require('../services/geminiResearcher');
const perplexityResearcher = require('../services/perplexityResearcher');
const perplexityAllAboutService = require('../services/perplexityAllAboutService');
const { webScrapingLimiter } = require('../middleware/rateLimiter');
const mongoose = require('mongoose');

exports.searchRaag = async (req, res) => {
  try {
    const { name, useAI, aiProvider, aiModel } = req.query;
    const userId = req.user?.userId;
    console.log('Search request received:', { name, useAI, aiProvider, aiModel });
    
    if (!name) {
      return res.status(400).json({ message: 'Raag name is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required for search operations' });
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
    const raag = new Raag({
      ...data,
      createdBy: userId,
      modifiedBy: userId,
      searchMetadata: {
        searchMethod: useAI === 'true' ? 'ai' : 'web',
        aiProvider: useAI === 'true' ? (aiProvider || 'openai') : null,
        aiModel: useAI === 'true' ? (aiModel || 'default') : null,
        searchQuery: name,
        searchTimestamp: new Date()
      }
    });
    await raag.save();
    console.log('Saved raag to database:', raag);

    res.json(raag);
  } catch (error) {
    console.error('Error in searchRaag:', error);
    res.status(500).json({ message: error.message || 'Error searching for raag' });
  }
};

exports.getAllAboutRaag = async (req, res) => {
  try {
    const { name, aiProvider, aiModel } = req.query;
    const userId = req.user?.userId;
    console.log('Summary search request received for raag:', name);
    
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: 'Raag name is required' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required for AI search operations' 
      });
    }

    const provider = aiProvider || 'perplexity';
    const model = aiModel || 'sonar-pro';
    console.log(`Using ${provider} Summary mode (${model}) for raag:`, name);
    
    let allAboutData;
    if (provider === 'perplexity') {
      allAboutData = await perplexityAllAboutService.getAllAboutRaag(name, model);
    } else if (provider === 'openai') {
      allAboutData = await aiResearcher.getAllAboutRaag(name, model);
    } else if (provider === 'gemini') {
      allAboutData = await geminiResearcher.getAllAboutRaag(name, model);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
    
    res.json({
      success: true,
      data: allAboutData,
      mode: 'summary',
      searchQuery: name,
      provider: provider,
      model: model
    });
  } catch (error) {
    console.error('Error in getAllAboutRaag:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error in Summary search for raag' 
    });
  }
};

exports.updateRaag = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.userId;

    const raag = await Raag.findById(id);
    if (!raag) {
      return res.status(404).json({ message: 'Raag not found' });
    }

    // Update all provided fields (including allAboutData)
    Object.keys(updates).forEach(field => {
      if (updates[field] !== undefined) {
        raag[field] = updates[field];
      }
    });

    if (userId) {
      raag.modifiedBy = userId;
    }
    raag.updatedAt = Date.now();
    await raag.save();

    res.json({
      success: true,
      data: raag,
      message: 'Raag updated successfully'
    });
  } catch (error) {
    console.error('Error in updateRaag:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating raag' 
    });
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
    const allAboutAnswerVerified = await Raag.countDocuments({ 'allAboutData.answer.verified': true });
    
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
        { 'timeOfRendition.verified': true },
        { 'allAboutData.answer.verified': true }
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
      'timeOfRendition.verified': true,
      'allAboutData.answer.verified': true
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
        timeOfRendition: timeOfRenditionVerified,
        allAboutAnswer: allAboutAnswerVerified
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

exports.deleteRaag = async (req, res) => {
  try {
    const { id } = req.params;
    const raag = await Raag.findByIdAndDelete(id);
    
    if (!raag) {
      return res.status(404).json({ 
        success: false,
        message: 'Raag not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Raag deleted successfully',
      data: { deletedId: id, deletedName: raag.name.value }
    });
  } catch (error) {
    console.error('Error in deleteRaag:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting raag' 
    });
  }
};

exports.bulkDeleteRaags = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Raag IDs array is required'
      });
    }

    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid raag IDs: ${invalidIds.join(', ')}`
      });
    }

    const raagsToDelete = await Raag.find({ _id: { $in: ids } }).select('name.value');
    const deletedNames = raagsToDelete.map(raag => raag.name.value);

    const result = await Raag.deleteMany({ _id: { $in: ids } });
    
    res.json({
      success: true,
      message: `${result.deletedCount} raags deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
        deletedIds: ids,
        deletedNames: deletedNames
      }
    });
  } catch (error) {
    console.error('Error in bulkDeleteRaags:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting raags'
    });
  }
};

exports.exportSingleRaag = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    const raag = await Raag.findById(id);
    if (!raag) {
      return res.status(404).json({
        success: false,
        message: 'Raag not found'
      });
    }

    const exportData = formatRaagForExport(raag);

    switch (format.toLowerCase()) {
      case 'markdown':
        const markdown = generateRaagMarkdown([exportData]);
        res.setHeader('Content-Type', 'text/markdown');
        const raagName = raag.name?.value || 'Unknown Raag';
        const shortId = raag._id.toString().slice(-8);
        const cleanName = raagName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
        res.setHeader('Content-Disposition', `attachment; filename="${cleanName} ${shortId}.md"`);
        res.send(markdown);
        break;
        
      default:
        res.json({
          success: true,
          data: exportData
        });
    }
  } catch (error) {
    console.error('Error in exportSingleRaag:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting raag'
    });
  }
};

exports.exportRaags = async (req, res) => {
  try {
    const { format = 'json', ids } = req.body;
    let query = {};
    
    if (ids && Array.isArray(ids) && ids.length > 0) {
      query = { _id: { $in: ids } };
    }
    
    const raags = await Raag.find(query).sort({ 'name.value': 1 });
    
    if (raags.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No raags found to export'
      });
    }

    const exportData = raags.map(raag => formatRaagForExport(raag));
    
    let filename;
    if (ids && ids.length > 0) {
      if (ids.length === 1) {
        // Single raag: use raag name with ID
        const raag = raags[0];
        const raagName = raag.name?.value || 'Unknown Raag';
        const shortId = raag._id.toString().slice(-8);
        filename = `${raagName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')} ${shortId}`;
      } else {
        // Multiple selected raags: use first raag name + count
        const firstRaag = raags[0];
        const firstName = firstRaag.name?.value || 'Unknown';
        filename = `${firstName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')} and ${ids.length - 1} others`;
      }
    } else {
      // All raags
      filename = `All Raags ${raags.length}`;
    }

    switch (format.toLowerCase()) {
      case 'markdown':
        const markdown = generateRaagMarkdown(exportData);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.md"`);
        res.send(markdown);
        break;
        
      default:
        res.json({
          success: true,
          data: {
            raags: exportData,
            count: raags.length,
            exported: new Date().toISOString()
          }
        });
    }
  } catch (error) {
    console.error('Error in exportRaags:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting raags'
    });
  }
};

// Helper functions
function formatRaagForExport(raag) {
  return {
    id: raag._id,
    name: raag.name?.value || 'N/A',
    aroha: raag.aroha?.value || 'N/A',
    avroha: raag.avroha?.value || 'N/A',
    chalan: raag.chalan?.value || 'N/A',
    vadi: raag.vadi?.value || 'N/A',
    samvadi: raag.samvadi?.value || 'N/A',
    thaat: raag.thaat?.value || 'N/A',
    rasBhaav: raag.rasBhaav?.value || 'N/A',
    tanpuraTuning: raag.tanpuraTuning?.value || 'N/A',
    timeOfRendition: raag.timeOfRendition?.value || 'N/A',
    verification: {
      name: raag.name?.verified || false,
      aroha: raag.aroha?.verified || false,
      avroha: raag.avroha?.verified || false,
      chalan: raag.chalan?.verified || false,
      vadi: raag.vadi?.verified || false,
      samvadi: raag.samvadi?.verified || false,
      thaat: raag.thaat?.verified || false,
      rasBhaav: raag.rasBhaav?.verified || false,
      tanpuraTuning: raag.tanpuraTuning?.verified || false,
      timeOfRendition: raag.timeOfRendition?.verified || false
    },
    sources: {
      name: raag.name?.reference || 'N/A',
      aroha: raag.aroha?.reference || 'N/A',
      avroha: raag.avroha?.reference || 'N/A',
      chalan: raag.chalan?.reference || 'N/A',
      vadi: raag.vadi?.reference || 'N/A',
      samvadi: raag.samvadi?.reference || 'N/A',
      thaat: raag.thaat?.reference || 'N/A',
      rasBhaav: raag.rasBhaav?.reference || 'N/A',
      tanpuraTuning: raag.tanpuraTuning?.reference || 'N/A',
      timeOfRendition: raag.timeOfRendition?.reference || 'N/A'
    },
    metadata: {
      createdAt: raag.createdAt,
      updatedAt: raag.updatedAt,
      verificationPercentage: calculateRaagVerificationPercentage(raag)
    }
  };
}

function calculateRaagVerificationPercentage(raag) {
  const fields = ['name', 'aroha', 'avroha', 'chalan', 'vadi', 'samvadi', 'thaat', 'rasBhaav', 'tanpuraTuning', 'timeOfRendition'];
  const verifiedFields = fields.filter(field => raag[field]?.verified);
  return Math.round((verifiedFields.length / fields.length) * 100);
}

function generateRaagMarkdown(raags) {
  let markdown = '# Indian Classical Music Raags\n\n';
  markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
  markdown += `**Total Raags:** ${raags.length}\n\n`;
  markdown += '---\n\n';
  
  raags.forEach((raag, index) => {
    markdown += `## ${index + 1}. ${raag.name}\n\n`;
    
    markdown += '### Musical Details\n\n';
    if (raag.aroha !== 'N/A') markdown += `**Aroha:** ${raag.aroha}\n\n`;
    if (raag.avroha !== 'N/A') markdown += `**Avroha:** ${raag.avroha}\n\n`;
    if (raag.chalan !== 'N/A') markdown += `**Chalan/Pakad:** ${raag.chalan}\n\n`;
    if (raag.vadi !== 'N/A') markdown += `**Vadi:** ${raag.vadi}\n\n`;
    if (raag.samvadi !== 'N/A') markdown += `**Samvadi:** ${raag.samvadi}\n\n`;
    if (raag.thaat !== 'N/A') markdown += `**Thaat:** ${raag.thaat}\n\n`;
    if (raag.rasBhaav !== 'N/A') markdown += `**Ras-Bhaav:** ${raag.rasBhaav}\n\n`;
    if (raag.tanpuraTuning !== 'N/A') markdown += `**Tanpura Tuning:** ${raag.tanpuraTuning}\n\n`;
    if (raag.timeOfRendition !== 'N/A') markdown += `**Time of Rendition:** ${raag.timeOfRendition}\n\n`;
    
    markdown += '### Verification Status\n\n';
    markdown += `- **Verification Progress:** ${raag.metadata.verificationPercentage}%\n`;
    markdown += `- **Name:** ${raag.verification.name ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Aroha:** ${raag.verification.aroha ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Avroha:** ${raag.verification.avroha ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Chalan:** ${raag.verification.chalan ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Vadi:** ${raag.verification.vadi ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Samvadi:** ${raag.verification.samvadi ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Thaat:** ${raag.verification.thaat ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Ras-Bhaav:** ${raag.verification.rasBhaav ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Tanpura Tuning:** ${raag.verification.tanpuraTuning ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Time of Rendition:** ${raag.verification.timeOfRendition ? '✅ Verified' : '❌ Unverified'}\n\n`;
    
    markdown += '---\n\n';
  });
  
  return markdown;
} 