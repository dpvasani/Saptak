const Taal = require('../models/Taal');
const DataActivity = require('../models/DataActivity');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');
const geminiResearcher = require('../services/geminiResearcher');
const perplexityResearcher = require('../services/perplexityResearcher');
const perplexityAllAboutService = require('../services/perplexityAllAboutService');
const { webScrapingLimiter } = require('../middleware/rateLimiter');
const mongoose = require('mongoose');

exports.searchTaal = async (req, res) => {
  try {
    const { name, useAI, aiProvider, aiModel } = req.query;
    const userId = req.user?.userId;
    console.log('Search request received:', { name, useAI, aiProvider, aiModel });
    
    if (!name) {
      return res.status(400).json({ message: 'Taal name is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required for search operations' });
    }

    let data;
    if (useAI === 'true') {
      // Use AI research - always get fresh data
      const provider = aiProvider || 'openai'; // Default to OpenAI
      const model = aiModel || 'default';
      console.log(`Using ${provider} AI research (${model}) for taal:`, name);
      try {
        if (provider === 'perplexity') {
          data = await perplexityResearcher.researchTaal(name, model);
          console.log('Perplexity AI research successful, data received:', data);
        } else if (provider === 'gemini') {
          data = await geminiResearcher.researchTaal(name, model);
          console.log('Gemini AI research successful, data received:', data);
        } else {
          data = await aiResearcher.researchTaal(name, model);
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
      
      console.log('Using traditional scraping for taal:', name);
      data = await scraperService.scrapeTaal(name);
    }

    // Create new taal with the researched data
    const taal = new Taal({
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
    await taal.save();
    console.log('Saved taal to database:', taal);

    res.json(taal);
  } catch (error) {
    console.error('Error in searchTaal:', error);
    res.status(500).json({ message: error.message || 'Error searching for taal' });
  }
};

exports.getAllAboutTaal = async (req, res) => {
  try {
    const { name, aiProvider, aiModel } = req.query;
    const userId = req.user?.userId;
    console.log('Summary search request received for taal:', name);
    
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: 'Taal name is required' 
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
    console.log(`Using ${provider} Summary mode (${model}) for taal:`, name);
    
    let allAboutData;
    if (provider === 'perplexity') {
      allAboutData = await perplexityAllAboutService.getAllAboutTaal(name, model);
    } else if (provider === 'openai') {
      allAboutData = await aiResearcher.getAllAboutTaal(name, model);
    } else if (provider === 'gemini') {
      allAboutData = await geminiResearcher.getAllAboutTaal(name, model);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
    
    // Try to find existing taal by name to save the All About data
    try {
      // First, try to find taal from recent DataActivity within last 10 minutes
      const recentActivity = await DataActivity.findOne({
        user: userId,
        category: 'taals',
        action: { $in: ['search', 'create'] },
        'details.searchQuery': name,
        createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
      }).sort({ createdAt: -1 });
      
      let existingTaal = null;
      
      if (recentActivity?.itemId) {
        console.log('Found recent activity, looking for taal:', recentActivity.itemId);
        existingTaal = await Taal.findById(recentActivity.itemId);
        console.log('Found existing taal from activity:', existingTaal ? existingTaal._id : 'Not found');
      }
      
      // Fallback: search by name if no recent activity found
      if (!existingTaal) {
        console.log('No recent activity found, searching by name...');
        existingTaal = await Taal.findOne({ 
          'name.value': { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
        });
        console.log('Found taal by name:', existingTaal ? existingTaal._id : 'Not found');
      }
      
      if (existingTaal) {
        console.log('Updating existing taal with All About data:', existingTaal._id);
        
        // Ensure allAboutData exists
        if (!existingTaal.allAboutData) {
          existingTaal.allAboutData = {};
        }
        
        // Update the answer field specifically
        existingTaal.allAboutData.answer = {
          value: allAboutData.answer?.value || '',
          reference: allAboutData.answer?.reference || 'Perplexity AI Response',
          verified: false
        };
        
        // Update other fields if they exist
        if (allAboutData.images) existingTaal.allAboutData.images = allAboutData.images;
        if (allAboutData.sources) existingTaal.allAboutData.sources = allAboutData.sources;
        if (allAboutData.citations) existingTaal.allAboutData.citations = allAboutData.citations;
        if (allAboutData.relatedQuestions) existingTaal.allAboutData.relatedQuestions = allAboutData.relatedQuestions;
        if (allAboutData.metadata?.searchQuery) existingTaal.allAboutData.searchQuery = allAboutData.metadata.searchQuery;
        if (allAboutData.metadata?.aiProvider) existingTaal.allAboutData.aiProvider = allAboutData.metadata.aiProvider;
        if (allAboutData.metadata?.aiModel) existingTaal.allAboutData.aiModel = allAboutData.metadata.aiModel;
        
        existingTaal.modifiedBy = userId;
        existingTaal.updatedAt = new Date();
        
        const savedTaal = await existingTaal.save();
        console.log('Successfully updated existing taal with All About data:', savedTaal._id);
      } else {
        console.log('No existing taal found, creating new taal with All About data for:', name);
        const newTaal = new Taal({
          name: { value: name, reference: 'All About Search', verified: false },
          numberOfBeats: { value: '', reference: 'Not searched in All About mode', verified: false },
          divisions: { value: '', reference: 'Not searched in All About mode', verified: false },
          taali: {
            count: { value: '', reference: 'Not searched in All About mode', verified: false },
            beatNumbers: { value: '', reference: 'Not searched in All About mode', verified: false }
          },
          khaali: {
            count: { value: '', reference: 'Not searched in All About mode', verified: false },
            beatNumbers: { value: '', reference: 'Not searched in All About mode', verified: false }
          },
          jaati: { value: '', reference: 'Not searched in All About mode', verified: false },
          allAboutData: {
            answer: {
              value: allAboutData.answer?.value || '',
              reference: allAboutData.answer?.reference || 'Perplexity AI Response',
              verified: false
            },
            images: allAboutData.images || [],
            sources: allAboutData.sources || [],
            citations: allAboutData.citations || [],
            relatedQuestions: allAboutData.relatedQuestions || [],
            searchQuery: allAboutData.metadata?.searchQuery || name,
            aiProvider: allAboutData.metadata?.aiProvider || provider,
            aiModel: allAboutData.metadata?.aiModel || model
          },
          createdBy: userId,
          modifiedBy: userId,
          searchMetadata: {
            searchMethod: 'ai',
            aiProvider: provider,
            aiModel: model,
            searchQuery: name,
            searchTimestamp: new Date()
          }
        });
        
        const savedNewTaal = await newTaal.save();
        console.log('Successfully created new taal with All About data:', savedNewTaal._id);
      }
    } catch (saveError) {
      console.error('Error saving All About data to taal:', saveError);
    }
    
    res.json({
      success: true,
      data: allAboutData,
      itemId: existingTaal?._id || savedNewTaal?._id,
      mode: 'summary',
      searchQuery: name,
      provider: provider,
      model: model
    });
  } catch (error) {
    console.error('Error in getAllAboutTaal:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error in Summary search for taal' 
    });
  }
};

exports.updateTaal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.userId;

    const taal = await Taal.findById(id);
    if (!taal) {
      return res.status(404).json({ message: 'Taal not found' });
    }

    // Update all provided fields (including allAboutData)
    Object.keys(updates).forEach(field => {
      if (updates[field] !== undefined) {
        taal[field] = updates[field];
      }
    });

    if (userId) {
      taal.modifiedBy = userId;
    }
    taal.updatedAt = Date.now();
    await taal.save();

    res.json({
      success: true,
      data: taal,
      message: 'Taal updated successfully'
    });
  } catch (error) {
    console.error('Error in updateTaal:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating taal' 
    });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid taal id' });
    }
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
    const allAboutAnswerVerified = await Taal.countDocuments({ 'allAboutData.answer.verified': true });
    
    const partiallyVerified = await Taal.countDocuments({
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
    
    const fullyVerified = await Taal.countDocuments({
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
        jaati: jaatiVerified,
        allAboutAnswer: allAboutAnswerVerified
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

exports.deleteTaal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid taal id' });
    }
    const taal = await Taal.findByIdAndDelete(id);
    if (!taal) {
      return res.status(404).json({ success: false, message: 'Taal not found' });
    }
    res.json({
      success: true,
      message: 'Taal deleted successfully',
      data: { deletedId: id, deletedName: taal.name?.value || '' }
    });
  } catch (error) {
    console.error('Error in deleteTaal:', error);
    res.status(500).json({ success: false, message: 'Error deleting taal' });
  }
};

exports.bulkDeleteTaals = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Taal IDs array is required' });
    }
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ success: false, message: `Invalid taal IDs: ${invalidIds.join(', ')}` });
    }
    const taalsToDelete = await Taal.find({ _id: { $in: ids } }).select('name.value');
    const deletedNames = taalsToDelete.map(t => t.name.value);
    const result = await Taal.deleteMany({ _id: { $in: ids } });
    res.json({
      success: true,
      message: `${result.deletedCount} taals deleted successfully`,
      data: { deletedCount: result.deletedCount, deletedIds: ids, deletedNames }
    });
  } catch (error) {
    console.error('Error in bulkDeleteTaals:', error);
    res.status(500).json({ success: false, message: 'Error deleting taals' });
  }
};

exports.exportSingleTaal = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid taal id' });
    }
    const taal = await Taal.findById(id);
    if (!taal) {
      return res.status(404).json({ success: false, message: 'Taal not found' });
    }
    const exportData = formatTaalForExport(taal);
    const taalName = taal.name?.value || 'Unknown Taal';
    const shortId = taal._id.toString().slice(-8);
    const filename = `${taalName} ${shortId}`;
    
    switch (format.toLowerCase()) {
      case 'markdown': {
        const md = generateTaalMarkdown([exportData]);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.md"`);
        res.send(md);
        break;
      }
      default:
        res.json({ success: true, data: exportData });
    }
  } catch (error) {
    console.error('Error in exportSingleTaal:', error);
    res.status(500).json({ success: false, message: 'Error exporting taal' });
  }
};

exports.exportTaals = async (req, res) => {
  try {
    const { format = 'json', ids } = req.body || {};
    let query = {};
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({ success: false, message: `Invalid taal IDs: ${invalidIds.join(', ')}` });
      }
      query = { _id: { $in: ids } };
    }
    const taals = await Taal.find(query).sort({ 'name.value': 1 });
    if (taals.length === 0) {
      return res.status(404).json({ success: false, message: 'No taals found to export' });
    }
    const exportData = taals.map(t => formatTaalForExport(t));
    
    let filename;
    if (ids && ids.length > 0) {
      if (ids.length === 1) {
        // Single taal: use taal name with ID
        const taal = taals[0];
        const taalName = taal.name?.value || 'Unknown Taal';
        const shortId = taal._id.toString().slice(-8);
        filename = `${taalName} ${shortId}`;
      } else {
        // Multiple selected taals: use first taal name + count
        const firstTaal = taals[0];
        const firstName = firstTaal.name?.value || 'Unknown';
        filename = `${firstName} And Other ${ids.length - 1}`;
      }
    } else {
      // All taals
      filename = `All Taals ${taals.length}`;
    }
    
    switch (format.toLowerCase()) {
      case 'markdown': {
        const md = generateTaalMarkdown(exportData);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.md"`);
        res.send(md);
        break;
      }
      default:
        res.json({
          success: true,
          data: { taals: exportData, count: taals.length, exported: new Date().toISOString(), filename }
        });
    }
  } catch (error) {
    console.error('Error in exportTaals:', error);
    res.status(500).json({ success: false, message: 'Error exporting taals' });
  }
};

function formatTaalForExport(taal) {
  return {
    id: taal._id,
    name: taal.name?.value || 'N/A',
    numberOfBeats: taal.numberOfBeats?.value || 'N/A',
    divisions: taal.divisions?.value || 'N/A',
    taaliCount: taal.taali?.count?.value || 'N/A',
    taaliBeatNumbers: taal.taali?.beatNumbers?.value || 'N/A',
    khaaliCount: taal.khaali?.count?.value || 'N/A',
    khaaliBeatNumbers: taal.khaali?.beatNumbers?.value || 'N/A',
    jaati: taal.jaati?.value || 'N/A',
    verification: {
      name: taal.name?.verified || false,
      numberOfBeats: taal.numberOfBeats?.verified || false,
      divisions: taal.divisions?.verified || false,
      taaliCount: taal.taali?.count?.verified || false,
      taaliBeatNumbers: taal.taali?.beatNumbers?.verified || false,
      khaaliCount: taal.khaali?.count?.verified || false,
      khaaliBeatNumbers: taal.khaali?.beatNumbers?.verified || false,
      jaati: taal.jaati?.verified || false
    },
    sources: {
      name: taal.name?.reference || 'N/A',
      numberOfBeats: taal.numberOfBeats?.reference || 'N/A',
      divisions: taal.divisions?.reference || 'N/A',
      taaliCount: taal.taali?.count?.reference || 'N/A',
      taaliBeatNumbers: taal.taali?.beatNumbers?.reference || 'N/A',
      khaaliCount: taal.khaali?.count?.reference || 'N/A',
      khaaliBeatNumbers: taal.khaali?.beatNumbers?.reference || 'N/A',
      jaati: taal.jaati?.reference || 'N/A'
    },
    metadata: {
      createdAt: taal.createdAt,
      updatedAt: taal.updatedAt,
      verificationPercentage: calculateTaalVerificationPercentage(taal)
    }
  };
}

function calculateTaalVerificationPercentage(taal) {
  const flags = [
    taal.name?.verified,
    taal.numberOfBeats?.verified,
    taal.divisions?.verified,
    taal.taali?.count?.verified,
    taal.taali?.beatNumbers?.verified,
    taal.khaali?.count?.verified,
    taal.khaali?.beatNumbers?.verified,
    taal.jaati?.verified,
  ];
  const valid = flags.filter(Boolean).length;
  return Math.round((valid / flags.length) * 100);
}

function generateTaalMarkdown(taals) {
  let markdown = '# Indian Classical Music Taals\n\n';
  markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
  markdown += `**Total Taals:** ${taals.length}\n\n`;
  markdown += '---\n\n';
  taals.forEach((t, index) => {
    markdown += `## ${index + 1}. ${t.name}\n\n`;
    markdown += '### Rhythmic Details\n\n';
    if (t.numberOfBeats !== 'N/A') markdown += `**Beats:** ${t.numberOfBeats}\n\n`;
    if (t.divisions !== 'N/A') markdown += `**Divisions:** ${t.divisions}\n\n`;
    if (t.taaliCount !== 'N/A') markdown += `**Taali Count:** ${t.taaliCount}\n\n`;
    if (t.taaliBeatNumbers !== 'N/A') markdown += `**Taali Beats:** ${t.taaliBeatNumbers}\n\n`;
    if (t.khaaliCount !== 'N/A') markdown += `**Khaali Count:** ${t.khaaliCount}\n\n`;
    if (t.khaaliBeatNumbers !== 'N/A') markdown += `**Khaali Beats:** ${t.khaaliBeatNumbers}\n\n`;
    if (t.jaati !== 'N/A') markdown += `**Jaati:** ${t.jaati}\n\n`;

    markdown += '### Verification Status\n\n';
    markdown += `- **Verification Progress:** ${t.metadata.verificationPercentage}%\n`;
    markdown += `- **Name:** ${t.verification.name ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Beats:** ${t.verification.numberOfBeats ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Divisions:** ${t.verification.divisions ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Taali Count:** ${t.verification.taaliCount ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Taali Beats:** ${t.verification.taaliBeatNumbers ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Khaali Count:** ${t.verification.khaaliCount ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Khaali Beats:** ${t.verification.khaaliBeatNumbers ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Jaati:** ${t.verification.jaati ? '✅ Verified' : '❌ Unverified'}\n\n`;

    markdown += '---\n\n';
  });
  return markdown;
}