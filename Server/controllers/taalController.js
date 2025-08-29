const Taal = require('../models/Taal');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');
const geminiResearcher = require('../services/geminiResearcher');
const perplexityResearcher = require('../services/perplexityResearcher');
const perplexityAllAboutService = require('../services/perplexityAllAboutService');

// Search for a taal
exports.searchTaal = async (req, res) => {
  try {
    const { name, useAI, aiProvider, aiModel } = req.query;
    const userId = req.user?.userId;

    console.log('Search request received:', { name, useAI, aiProvider, aiModel });

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Taal name is required'
      });
    }

    let data;
    const provider = aiProvider || 'openai';
    const model = aiModel || 'default';

    if (useAI === 'true') {
      console.log(`Using ${provider} AI research (${model}) for taal: ${name}`);
      
      try {
        if (provider === 'perplexity') {
          data = await perplexityResearcher.researchTaal(name, model);
        } else if (provider === 'gemini') {
          data = await geminiResearcher.researchTaal(name, model);
        } else {
          data = await aiResearcher.researchTaal(name, model);
        }
        console.log(`${provider} AI research successful, data received:`, Object.keys(data));
      } catch (aiError) {
        console.error(`${provider} AI research failed:`, aiError.message);
        throw new Error(`${provider} AI research failed: ${aiError.message}`);
      }
    } else {
      console.log(`Using web scraping for taal: ${name}`);
      data = await scraperService.scrapeTaal(name);
    }

    // Check if taal already exists
    let existingTaal = await Taal.findOne({ 
      'name.value': { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    let savedTaal;
    if (existingTaal) {
      // Update existing taal with new data
      Object.keys(data).forEach(field => {
        if (data[field] && typeof data[field] === 'object' && data[field].value !== undefined) {
          existingTaal[field] = data[field];
        }
      });
      
      existingTaal.modifiedBy = userId;
      existingTaal.updatedAt = new Date();
      
      // Update search metadata
      existingTaal.searchMetadata = {
        searchMethod: useAI === 'true' ? 'ai' : 'web',
        aiProvider: useAI === 'true' ? provider : null,
        aiModel: useAI === 'true' ? model : null,
        searchQuery: name,
        searchTimestamp: new Date()
      };
      
      savedTaal = await existingTaal.save();
      console.log('Updated existing taal:', savedTaal._id);
    } else {
      // Create new taal
      const taal = new Taal({
        ...data,
        createdBy: userId,
        modifiedBy: userId,
        searchMetadata: {
          searchMethod: useAI === 'true' ? 'ai' : 'web',
          aiProvider: useAI === 'true' ? provider : null,
          aiModel: useAI === 'true' ? model : null,
          searchQuery: name,
          searchTimestamp: new Date()
        }
      });
      
      savedTaal = await taal.save();
      console.log('Created new taal:', savedTaal._id);
    }

    res.json(savedTaal);
  } catch (error) {
    console.error('Error in taal search:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching for taal'
    });
  }
};

// Get all about taal (Summary Mode)
exports.getAllAboutTaal = async (req, res) => {
  try {
    const { name, aiProvider, aiModel, entityId } = req.query;
    const userId = req.user?.userId;

    console.log('🔍 All About search request received for taal:', name, 'Provider:', aiProvider, 'Model:', aiModel, 'Entity ID:', entityId);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Taal name is required'
      });
    }

    const provider = aiProvider || 'perplexity';
    const model = aiModel || 'sonar-pro';
    
    console.log(`Using ${provider} All About mode (${model}) for taal: ${name}`);
    console.log('About to call AI service...');

    let allAboutData;
    try {
      if (provider === 'perplexity') {
        console.log('Calling Perplexity All About service...');
        allAboutData = await perplexityAllAboutService.getAllAboutTaal(name, model);
      } else if (provider === 'openai') {
        console.log('Calling OpenAI All About service...');
        allAboutData = await aiResearcher.getAllAboutTaal(name, model);
      } else if (provider === 'gemini') {
        console.log('Calling Gemini All About service...');
        allAboutData = await geminiResearcher.getAllAboutTaal(name, model);
      } else {
        throw new Error(`Unsupported AI provider: ${provider}`);
      }

      console.log('All About data received:', {
        hasAnswer: !!allAboutData.answer?.value,
        answerLength: allAboutData.answer?.value?.length || 0,
        imageCount: allAboutData.images?.length || 0,
        sourceCount: allAboutData.sources?.length || 0,
        hasMetadata: !!allAboutData.metadata
      });
    } catch (aiError) {
      console.error(`${provider} All About search failed:`, aiError.message);
      throw new Error(`${provider} All About search failed: ${aiError.message}`);
    }

    console.log('Attempting to save All About data for taal:', name);
    console.log('All About data structure before saving:', {
      hasAnswer: !!allAboutData.answer?.value,
      imagesType: typeof allAboutData.images,
      imagesLength: allAboutData.images?.length || 0,
      sourcesType: typeof allAboutData.sources,
      sourcesLength: allAboutData.sources?.length || 0,
      citationsType: typeof allAboutData.citations,
      citationsLength: allAboutData.citations?.length || 0
    });

    let savedTaal;

    // 🎯 SEQUENTIAL PROCESSING: If entityId is provided, use it directly
    if (entityId) {
      console.log('🔗 Sequential processing: Using provided entity ID:', entityId);
      
      try {
        const existingTaal = await Taal.findById(entityId);
        if (existingTaal) {
          console.log('✅ Found existing taal by ID:', entityId);
          
          // Update existing taal with All About data
          existingTaal.allAboutData = {
            answer: allAboutData.answer || { value: '', reference: 'No answer provided', verified: false },
            images: Array.isArray(allAboutData.images) ? allAboutData.images : [],
            sources: Array.isArray(allAboutData.sources) ? allAboutData.sources : [],
            citations: Array.isArray(allAboutData.citations) ? allAboutData.citations : [],
            relatedQuestions: Array.isArray(allAboutData.relatedQuestions) ? allAboutData.relatedQuestions : [],
            searchQuery: allAboutData.metadata?.searchQuery || name,
            aiProvider: allAboutData.metadata?.aiProvider || provider,
            aiModel: allAboutData.metadata?.aiModel || model
          };
          
          existingTaal.modifiedBy = userId;
          existingTaal.updatedAt = new Date();
          
          savedTaal = await existingTaal.save();
          console.log('✅ Successfully updated existing taal with All About data:', savedTaal._id);
        } else {
          console.log('❌ Entity ID provided but taal not found, falling back to name search');
          throw new Error('Entity not found');
        }
      } catch (idError) {
        console.log('❌ Failed to find taal by ID, falling back to name search:', idError.message);
        // Fall back to name-based search
      }
    }

    // If no entityId or ID lookup failed, use name-based search
    if (!savedTaal) {
      console.log('🔍 Searching for existing taal by name:', name);
      
      let existingTaal = await Taal.findOne({ 
        'name.value': { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
      });

      if (existingTaal) {
        console.log('Found existing taal:', existingTaal._id, 'Name:', existingTaal.name.value);
        
        // Update existing taal with All About data
        existingTaal.allAboutData = {
          answer: allAboutData.answer || { value: '', reference: 'No answer provided', verified: false },
          images: Array.isArray(allAboutData.images) ? allAboutData.images : [],
          sources: Array.isArray(allAboutData.sources) ? allAboutData.sources : [],
          citations: Array.isArray(allAboutData.citations) ? allAboutData.citations : [],
          relatedQuestions: Array.isArray(allAboutData.relatedQuestions) ? allAboutData.relatedQuestions : [],
          searchQuery: allAboutData.metadata?.searchQuery || name,
          aiProvider: allAboutData.metadata?.aiProvider || provider,
          aiModel: allAboutData.metadata?.aiModel || model
        };
        
        existingTaal.modifiedBy = userId;
        existingTaal.updatedAt = new Date();
        
        savedTaal = await existingTaal.save();
        console.log('Successfully saved All About data to existing taal:', savedTaal._id);
      } else {
        console.log('No existing taal found for name:', name, 'Creating new taal with All About data...');
        
        // Create new taal with All About data and empty structured fields
        const newTaal = new Taal({
          name: { value: name, reference: 'All About Mode Search', verified: false },
          numberOfBeats: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          divisions: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          taali: {
            count: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
            beatNumbers: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false }
          },
          khaali: {
            count: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
            beatNumbers: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false }
          },
          jaati: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          
          allAboutData: {
            answer: allAboutData.answer || { value: '', reference: 'No answer provided', verified: false },
            images: Array.isArray(allAboutData.images) ? allAboutData.images : [],
            sources: Array.isArray(allAboutData.sources) ? allAboutData.sources : [],
            citations: Array.isArray(allAboutData.citations) ? allAboutData.citations : [],
            relatedQuestions: Array.isArray(allAboutData.relatedQuestions) ? allAboutData.relatedQuestions : [],
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
        
        savedTaal = await newTaal.save();
        console.log('Successfully created new taal with All About data:', savedTaal._id);
      }
    }

    res.json({
      success: true,
      data: allAboutData,
      mode: 'summary',
      searchQuery: name,
      provider: provider,
      model: model,
      entityId: savedTaal._id // Return the MongoDB ID for sequential processing
    });
  } catch (error) {
    console.error('Error in All About taal search:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error in All About taal search'
    });
  }
};

// Get all taals
exports.getAllTaals = async (req, res) => {
  try {
    const taals = await Taal.find().sort({ createdAt: -1 });
    res.json(taals);
  } catch (error) {
    console.error('Error fetching taals:', error);
    res.status(500).json({ message: 'Error fetching taals' });
  }
};

// Get taal by ID
exports.getTaalById = async (req, res) => {
  try {
    const { id } = req.params;
    const taal = await Taal.findById(id);
    
    if (!taal) {
      return res.status(404).json({
        success: false,
        message: 'Taal not found'
      });
    }
    
    res.json(taal);
  } catch (error) {
    console.error('Error fetching taal:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching taal'
    });
  }
};

// Update taal
exports.updateTaal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.userId;
    
    const taal = await Taal.findById(id);
    if (!taal) {
      return res.status(404).json({
        success: false,
        message: 'Taal not found'
      });
    }
    
    // Update fields
    Object.keys(updates).forEach(field => {
      if (taal[field] && typeof updates[field] === 'object') {
        taal[field] = {
          ...taal[field],
          ...updates[field]
        };
      } else if (field === 'allAboutData' && updates[field]) {
        taal[field] = {
          ...taal[field],
          ...updates[field]
        };
      }
    });
    
    taal.modifiedBy = userId;
    taal.updatedAt = new Date();
    await taal.save();
    
    res.json({
      success: true,
      data: taal,
      message: 'Taal updated successfully'
    });
  } catch (error) {
    console.error('Error updating taal:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating taal'
    });
  }
};

// Delete taal
exports.deleteTaal = async (req, res) => {
  try {
    const { id } = req.params;
    const taal = await Taal.findByIdAndDelete(id);
    
    if (!taal) {
      return res.status(404).json({
        success: false,
        message: 'Taal not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Taal deleted successfully',
      data: { deletedId: id, deletedName: taal.name.value }
    });
  } catch (error) {
    console.error('Error deleting taal:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting taal'
    });
  }
};

// Bulk delete taals
exports.bulkDeleteTaals = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of taal IDs to delete'
      });
    }
    
    const result = await Taal.deleteMany({ _id: { $in: ids } });
    
    res.json({
      success: true,
      message: `${result.deletedCount} taals deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting taals'
    });
  }
};

// Get verified taals
exports.getVerifiedTaals = async (req, res) => {
  try {
    const { field } = req.query;
    
    let query = {};
    if (field) {
      query[`${field}.verified`] = true;
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
          { 'jaati.verified': true },
          { 'allAboutData.answer.verified': true }
        ]
      };
    }
    
    const taals = await Taal.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: taals
    });
  } catch (error) {
    console.error('Error fetching verified taals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching verified taals'
    });
  }
};

// Get unverified taals
exports.getUnverifiedTaals = async (req, res) => {
  try {
    const { field } = req.query;
    
    let query = {};
    if (field) {
      query[`${field}.verified`] = false;
    } else {
      query = {
        $and: [
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
      };
    }
    
    const taals = await Taal.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: taals
    });
  } catch (error) {
    console.error('Error fetching unverified taals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unverified taals'
    });
  }
};

// Get verification statistics
exports.getVerificationStats = async (req, res) => {
  try {
    const total = await Taal.countDocuments();
    
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
    
    const unverified = total - partiallyVerified;
    
    const fieldStats = {};
    const fields = ['name', 'numberOfBeats', 'divisions', 'jaati'];
    
    for (const field of fields) {
      fieldStats[field] = await Taal.countDocuments({ [`${field}.verified`]: true });
    }
    
    // Add nested field stats
    fieldStats['taali.count'] = await Taal.countDocuments({ 'taali.count.verified': true });
    fieldStats['taali.beatNumbers'] = await Taal.countDocuments({ 'taali.beatNumbers.verified': true });
    fieldStats['khaali.count'] = await Taal.countDocuments({ 'khaali.count.verified': true });
    fieldStats['khaali.beatNumbers'] = await Taal.countDocuments({ 'khaali.beatNumbers.verified': true });
    
    res.json({
      total,
      fullyVerified,
      partiallyVerified,
      unverified,
      fieldStats,
      percentages: {
        fullyVerified: total > 0 ? ((fullyVerified / total) * 100).toFixed(2) : '0.00',
        partiallyVerified: total > 0 ? ((partiallyVerified / total) * 100).toFixed(2) : '0.00',
        unverified: total > 0 ? ((unverified / total) * 100).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    console.error('Error in verification stats:', error);
    res.status(500).json({ message: 'Error fetching verification statistics' });
  }
};

// Export single taal
exports.exportSingleTaal = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'markdown' } = req.query;
    
    const taal = await Taal.findById(id);
    if (!taal) {
      return res.status(404).json({
        success: false,
        message: 'Taal not found'
      });
    }
    
    if (format === 'markdown') {
      const markdown = this.generateTaalMarkdown(taal);
      res.setHeader('Content-Type', 'text/markdown');
      res.send(markdown);
    } else {
      res.json({
        success: true,
        data: taal
      });
    }
  } catch (error) {
    console.error('Error exporting taal:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting taal'
    });
  }
};

// Export taals
exports.exportTaals = async (req, res) => {
  try {
    const { format = 'markdown', ids } = req.body;
    
    let query = {};
    if (ids && Array.isArray(ids) && ids.length > 0) {
      query._id = { $in: ids };
    }
    
    const taals = await Taal.find(query).sort({ 'name.value': 1 });
    
    if (format === 'markdown') {
      const markdown = taals.map(taal => this.generateTaalMarkdown(taal)).join('\n\n---\n\n');
      res.setHeader('Content-Type', 'text/markdown');
      res.send(markdown);
    } else {
      res.json({
        success: true,
        data: taals
      });
    }
  } catch (error) {
    console.error('Error exporting taals:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting taals'
    });
  }
};

// Helper function to generate markdown
exports.generateTaalMarkdown = (taal) => {
  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'numberOfBeats', label: 'Number of Beats' },
    { key: 'divisions', label: 'Divisions' },
    { key: 'taali.count', label: 'Taali Count' },
    { key: 'taali.beatNumbers', label: 'Taali Beat Numbers' },
    { key: 'khaali.count', label: 'Khaali Count' },
    { key: 'khaali.beatNumbers', label: 'Khaali Beat Numbers' },
    { key: 'jaati', label: 'Jaati' }
  ];

  let markdown = `# ${taal.name.value}\n\n`;
  
  fields.forEach(field => {
    if (field.key !== 'name') {
      let value;
      if (field.key.includes('.')) {
        const [parent, child] = field.key.split('.');
        value = taal[parent]?.[child]?.value;
      } else {
        value = taal[field.key]?.value;
      }
      
      if (value) {
        markdown += `## ${field.label}\n${value}\n\n`;
      }
    }
  });
  
  if (taal.allAboutData?.answer?.value) {
    markdown += `## Summary\n${taal.allAboutData.answer.value}\n\n`;
  }
  
  markdown += `**Created:** ${taal.createdAt}\n`;
  markdown += `**Last Updated:** ${taal.updatedAt}\n`;
  
  return markdown;
};