const Raag = require('../models/Raag');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');
const geminiResearcher = require('../services/geminiResearcher');
const perplexityResearcher = require('../services/perplexityResearcher');
const perplexityAllAboutService = require('../services/perplexityAllAboutService');

// Search for a raag
exports.searchRaag = async (req, res) => {
  try {
    const { name, useAI, aiProvider, aiModel } = req.query;
    const userId = req.user?.userId;

    console.log('Search request received:', { name, useAI, aiProvider, aiModel });

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Raag name is required'
      });
    }

    let data;
    const provider = aiProvider || 'openai';
    const model = aiModel || 'default';

    if (useAI === 'true') {
      console.log(`Using ${provider} AI research (${model}) for raag: ${name}`);
      
      try {
        if (provider === 'perplexity') {
          data = await perplexityResearcher.researchRaag(name, model);
        } else if (provider === 'gemini') {
          data = await geminiResearcher.researchRaag(name, model);
        } else {
          data = await aiResearcher.researchRaag(name, model);
        }
        console.log(`${provider} AI research successful, data received:`, Object.keys(data));
      } catch (aiError) {
        console.error(`${provider} AI research failed:`, aiError.message);
        throw new Error(`${provider} AI research failed: ${aiError.message}`);
      }
    } else {
      console.log(`Using web scraping for raag: ${name}`);
      data = await scraperService.scrapeRaag(name);
    }

    // Check if raag already exists
    let existingRaag = await Raag.findOne({ 
      'name.value': { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    let savedRaag;
    if (existingRaag) {
      // Update existing raag with new data
      Object.keys(data).forEach(field => {
        if (data[field] && typeof data[field] === 'object' && data[field].value !== undefined) {
          existingRaag[field] = data[field];
        }
      });
      
      existingRaag.modifiedBy = userId;
      existingRaag.updatedAt = new Date();
      
      // Update search metadata
      existingRaag.searchMetadata = {
        searchMethod: useAI === 'true' ? 'ai' : 'web',
        aiProvider: useAI === 'true' ? provider : null,
        aiModel: useAI === 'true' ? model : null,
        searchQuery: name,
        searchTimestamp: new Date()
      };
      
      savedRaag = await existingRaag.save();
      console.log('Updated existing raag:', savedRaag._id);
    } else {
      // Create new raag
      const raag = new Raag({
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
      
      savedRaag = await raag.save();
      console.log('Created new raag:', savedRaag._id);
    }

    res.json(savedRaag);
  } catch (error) {
    console.error('Error in raag search:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching for raag'
    });
  }
};

// Get all about raag (Summary Mode)
exports.getAllAboutRaag = async (req, res) => {
  try {
    const { name, aiProvider, aiModel, entityId } = req.query;
    const userId = req.user?.userId;

    console.log('🔍 All About search request received for raag:', name, 'Provider:', aiProvider, 'Model:', aiModel, 'Entity ID:', entityId);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Raag name is required'
      });
    }

    const provider = aiProvider || 'perplexity';
    const model = aiModel || 'sonar-pro';
    
    console.log(`Using ${provider} All About mode (${model}) for raag: ${name}`);
    console.log('About to call AI service...');

    let allAboutData;
    try {
      if (provider === 'perplexity') {
        console.log('Calling Perplexity All About service...');
        allAboutData = await perplexityAllAboutService.getAllAboutRaag(name, model);
      } else if (provider === 'openai') {
        console.log('Calling OpenAI All About service...');
        allAboutData = await aiResearcher.getAllAboutRaag(name, model);
      } else if (provider === 'gemini') {
        console.log('Calling Gemini All About service...');
        allAboutData = await geminiResearcher.getAllAboutRaag(name, model);
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

    console.log('Attempting to save All About data for raag:', name);
    console.log('All About data structure before saving:', {
      hasAnswer: !!allAboutData.answer?.value,
      imagesType: typeof allAboutData.images,
      imagesLength: allAboutData.images?.length || 0,
      sourcesType: typeof allAboutData.sources,
      sourcesLength: allAboutData.sources?.length || 0,
      citationsType: typeof allAboutData.citations,
      citationsLength: allAboutData.citations?.length || 0
    });

    let savedRaag;

    // 🎯 SEQUENTIAL PROCESSING: If entityId is provided, use it directly
    if (entityId) {
      console.log('🔗 Sequential processing: Using provided entity ID:', entityId);
      
      try {
        const existingRaag = await Raag.findById(entityId);
        if (existingRaag) {
          console.log('✅ Found existing raag by ID:', entityId);
          
          // Update existing raag with All About data
          existingRaag.allAboutData = {
            answer: allAboutData.answer || { value: '', reference: 'No answer provided', verified: false },
            images: Array.isArray(allAboutData.images) ? allAboutData.images : [],
            sources: Array.isArray(allAboutData.sources) ? allAboutData.sources : [],
            citations: Array.isArray(allAboutData.citations) ? allAboutData.citations : [],
            relatedQuestions: Array.isArray(allAboutData.relatedQuestions) ? allAboutData.relatedQuestions : [],
            searchQuery: allAboutData.metadata?.searchQuery || name,
            aiProvider: allAboutData.metadata?.aiProvider || provider,
            aiModel: allAboutData.metadata?.aiModel || model
          };
          
          existingRaag.modifiedBy = userId;
          existingRaag.updatedAt = new Date();
          
          savedRaag = await existingRaag.save();
          console.log('✅ Successfully updated existing raag with All About data:', savedRaag._id);
        } else {
          console.log('❌ Entity ID provided but raag not found, falling back to name search');
          throw new Error('Entity not found');
        }
      } catch (idError) {
        console.log('❌ Failed to find raag by ID, falling back to name search:', idError.message);
        // Fall back to name-based search
      }
    }

    // If no entityId or ID lookup failed, use name-based search
    if (!savedRaag) {
      console.log('🔍 Searching for existing raag by name:', name);
      
      let existingRaag = await Raag.findOne({ 
        'name.value': { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
      });

      if (existingRaag) {
        console.log('Found existing raag:', existingRaag._id, 'Name:', existingRaag.name.value);
        
        // Update existing raag with All About data
        existingRaag.allAboutData = {
          answer: allAboutData.answer || { value: '', reference: 'No answer provided', verified: false },
          images: Array.isArray(allAboutData.images) ? allAboutData.images : [],
          sources: Array.isArray(allAboutData.sources) ? allAboutData.sources : [],
          citations: Array.isArray(allAboutData.citations) ? allAboutData.citations : [],
          relatedQuestions: Array.isArray(allAboutData.relatedQuestions) ? allAboutData.relatedQuestions : [],
          searchQuery: allAboutData.metadata?.searchQuery || name,
          aiProvider: allAboutData.metadata?.aiProvider || provider,
          aiModel: allAboutData.metadata?.aiModel || model
        };
        
        existingRaag.modifiedBy = userId;
        existingRaag.updatedAt = new Date();
        
        savedRaag = await existingRaag.save();
        console.log('Successfully saved All About data to existing raag:', savedRaag._id);
      } else {
        console.log('No existing raag found for name:', name, 'Creating new raag with All About data...');
        
        // Create new raag with All About data and empty structured fields
        const newRaag = new Raag({
          name: { value: name, reference: 'All About Mode Search', verified: false },
          aroha: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          avroha: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          chalan: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          vadi: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          samvadi: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          thaat: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          rasBhaav: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          tanpuraTuning: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          timeOfRendition: { value: '', reference: 'Use Structured Mode to get detailed field data', verified: false },
          
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
        
        savedRaag = await newRaag.save();
        console.log('Successfully created new raag with All About data:', savedRaag._id);
      }
    }

    res.json({
      success: true,
      data: allAboutData,
      mode: 'summary',
      searchQuery: name,
      provider: provider,
      model: model,
      entityId: savedRaag._id // Return the MongoDB ID for sequential processing
    });
  } catch (error) {
    console.error('Error in All About raag search:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error in All About raag search'
    });
  }
};

// Get all raags
exports.getAllRaags = async (req, res) => {
  try {
    const raags = await Raag.find().sort({ createdAt: -1 });
    res.json(raags);
  } catch (error) {
    console.error('Error fetching raags:', error);
    res.status(500).json({ message: 'Error fetching raags' });
  }
};

// Get raag by ID
exports.getRaagById = async (req, res) => {
  try {
    const { id } = req.params;
    const raag = await Raag.findById(id);
    
    if (!raag) {
      return res.status(404).json({
        success: false,
        message: 'Raag not found'
      });
    }
    
    res.json(raag);
  } catch (error) {
    console.error('Error fetching raag:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching raag'
    });
  }
};

// Update raag
exports.updateRaag = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.userId;
    
    const raag = await Raag.findById(id);
    if (!raag) {
      return res.status(404).json({
        success: false,
        message: 'Raag not found'
      });
    }
    
    // Update fields
    Object.keys(updates).forEach(field => {
      if (raag[field] && typeof updates[field] === 'object') {
        raag[field] = {
          ...raag[field],
          ...updates[field]
        };
      } else if (field === 'allAboutData' && updates[field]) {
        raag[field] = {
          ...raag[field],
          ...updates[field]
        };
      }
    });
    
    raag.modifiedBy = userId;
    raag.updatedAt = new Date();
    await raag.save();
    
    res.json({
      success: true,
      data: raag,
      message: 'Raag updated successfully'
    });
  } catch (error) {
    console.error('Error updating raag:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating raag'
    });
  }
};

// Delete raag
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
    console.error('Error deleting raag:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting raag'
    });
  }
};

// Bulk delete raags
exports.bulkDeleteRaags = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of raag IDs to delete'
      });
    }
    
    const result = await Raag.deleteMany({ _id: { $in: ids } });
    
    res.json({
      success: true,
      message: `${result.deletedCount} raags deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting raags'
    });
  }
};

// Get verified raags
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
          { 'timeOfRendition.verified': true },
          { 'allAboutData.answer.verified': true }
        ]
      };
    }
    
    const raags = await Raag.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: raags
    });
  } catch (error) {
    console.error('Error fetching verified raags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching verified raags'
    });
  }
};

// Get unverified raags
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
          { 'timeOfRendition.verified': false },
          { 'allAboutData.answer.verified': false }
        ]
      };
    }
    
    const raags = await Raag.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: raags
    });
  } catch (error) {
    console.error('Error fetching unverified raags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unverified raags'
    });
  }
};

// Get verification statistics
exports.getVerificationStats = async (req, res) => {
  try {
    const total = await Raag.countDocuments();
    
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
    
    const unverified = total - partiallyVerified;
    
    const fieldStats = {};
    const fields = ['name', 'aroha', 'avroha', 'chalan', 'vadi', 'samvadi', 'thaat', 'rasBhaav', 'tanpuraTuning', 'timeOfRendition'];
    
    for (const field of fields) {
      fieldStats[field] = await Raag.countDocuments({ [`${field}.verified`]: true });
    }
    
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

// Export single raag
exports.exportSingleRaag = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'markdown' } = req.query;
    
    const raag = await Raag.findById(id);
    if (!raag) {
      return res.status(404).json({
        success: false,
        message: 'Raag not found'
      });
    }
    
    if (format === 'markdown') {
      const markdown = this.generateRaagMarkdown(raag);
      res.setHeader('Content-Type', 'text/markdown');
      res.send(markdown);
    } else {
      res.json({
        success: true,
        data: raag
      });
    }
  } catch (error) {
    console.error('Error exporting raag:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting raag'
    });
  }
};

// Export raags
exports.exportRaags = async (req, res) => {
  try {
    const { format = 'markdown', ids } = req.body;
    
    let query = {};
    if (ids && Array.isArray(ids) && ids.length > 0) {
      query._id = { $in: ids };
    }
    
    const raags = await Raag.find(query).sort({ 'name.value': 1 });
    
    if (format === 'markdown') {
      const markdown = raags.map(raag => this.generateRaagMarkdown(raag)).join('\n\n---\n\n');
      res.setHeader('Content-Type', 'text/markdown');
      res.send(markdown);
    } else {
      res.json({
        success: true,
        data: raags
      });
    }
  } catch (error) {
    console.error('Error exporting raags:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting raags'
    });
  }
};

// Helper function to generate markdown
exports.generateRaagMarkdown = (raag) => {
  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'aroha', label: 'Aroha' },
    { key: 'avroha', label: 'Avroha' },
    { key: 'chalan', label: 'Chalan / Pakad' },
    { key: 'vadi', label: 'Vadi' },
    { key: 'samvadi', label: 'Samvadi' },
    { key: 'thaat', label: 'Thaat' },
    { key: 'rasBhaav', label: 'Ras-Bhaav' },
    { key: 'tanpuraTuning', label: 'Tanpura Tuning' },
    { key: 'timeOfRendition', label: 'Time of Rendition' }
  ];

  let markdown = `# ${raag.name.value}\n\n`;
  
  fields.forEach(field => {
    if (field.key !== 'name' && raag[field.key]?.value) {
      markdown += `## ${field.label}\n${raag[field.key].value}\n\n`;
      if (raag[field.key].reference) {
        markdown += `**Source:** ${raag[field.key].reference}\n\n`;
      }
    }
  });
  
  if (raag.allAboutData?.answer?.value) {
    markdown += `## Summary\n${raag.allAboutData.answer.value}\n\n`;
  }
  
  markdown += `**Created:** ${raag.createdAt}\n`;
  markdown += `**Last Updated:** ${raag.updatedAt}\n`;
  
  return markdown;
};