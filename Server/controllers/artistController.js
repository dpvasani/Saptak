const Artist = require('../models/Artist');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');
const geminiResearcher = require('../services/geminiResearcher');
const perplexityResearcher = require('../services/perplexityResearcher');
const perplexityAllAboutService = require('../services/perplexityAllAboutService');
const { aiLimiter, webScrapingLimiter } = require('../middleware/rateLimiter');
const mongoose = require('mongoose');
const DataActivity = require('../models/DataActivity');

exports.searchArtist = async (req, res) => {
  try {
    const { name, useAI, aiProvider, aiModel } = req.query;
    const userId = req.user?.userId;
    console.log('Search request received:', { name, useAI, aiProvider, aiModel });
    
    if (!name) {
      return res.status(400).json({ message: 'Artist name is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required for search operations' });
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

    // Create new artist with the researched data and user tracking
    const artist = new Artist({
      ...data,
      createdBy: userId,
      modifiedBy: userId,
      searchMetadata: {
        searchMethod: useAI === 'true' ? 'ai' : 'web',
        aiProvider: useAI === 'true' ? (aiProvider || 'openai') : null,
        aiModel: useAI === 'true' ? (aiModel || 'default') : null,
        searchQuery: name,
        searchTimestamp: new Date(),
        responseTime: Date.now() - Date.now() // Will be calculated properly
      }
    });
    await artist.save();
    console.log('Saved artist to database:', artist);

    res.json(artist);
  } catch (error) {
    console.error('Error in searchArtist:', error);
    res.status(500).json({ message: error.message || 'Error searching for artist' });
  }
};

exports.getAllAboutArtist = async (req, res) => {
  try {
    const { name, aiProvider, aiModel } = req.query;
    const userId = req.user?.userId;
    console.log('All About search request received for artist:', name, 'Provider:', aiProvider, 'Model:', aiModel);
    
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: 'Artist name is required' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required for AI search operations' 
      });
    }

    // Apply AI rate limiting
    await new Promise((resolve, reject) => {
      aiLimiter(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const provider = aiProvider || 'perplexity';
    const model = aiModel || 'sonar-pro';
    console.log(`Using ${provider} All About mode (${model}) for artist:`, name);
    
    let allAboutData;
    console.log('About to call AI service...');
    
    if (provider === 'perplexity') {
      console.log('Calling Perplexity All About service...');
      allAboutData = await perplexityAllAboutService.getAllAboutArtist(name, model);
    } else if (provider === 'openai') {
      console.log('Calling OpenAI All About service...');
      allAboutData = await aiResearcher.getAllAboutArtist(name, model);
    } else if (provider === 'gemini') {
      console.log('Calling Gemini All About service...');
      allAboutData = await geminiResearcher.getAllAboutArtist(name, model);
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
    
    // Save the All About data to the artist record
    try {
      console.log('Attempting to save All About data for artist:', name);
      
     let existingArtist = null;
     let savedNewArtist = null;
     
      // Try multiple strategies to find existing artist
      let existingArtist = null;
      
      // Strategy 1: Exact name match (case insensitive)
      existingArtist = await Artist.findOne({ 
        'name.value': { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
      });
      console.log('Strategy 1 - Exact match result:', existingArtist ? `Found: ${existingArtist._id}` : 'Not found');
      
      // Strategy 2: Partial name match if exact not found
      if (!existingArtist) {
        existingArtist = await Artist.findOne({ 
          'name.value': { $regex: new RegExp(name.trim(), 'i') } 
        });
        console.log('Strategy 2 - Partial match result:', existingArtist ? `Found: ${existingArtist._id}` : 'Not found');
      }
      
      // Strategy 3: Find by similar name (remove common prefixes)
      if (!existingArtist) {
        const cleanName = name.replace(/^(pandit|ustad|pt\.?|sri|shri)\s+/i, '').trim();
        existingArtist = await Artist.findOne({ 
          'name.value': { $regex: new RegExp(cleanName, 'i') } 
        });
        console.log('Strategy 3 - Clean name match result:', existingArtist ? `Found: ${existingArtist._id}` : 'Not found');
      }
      
      // Strategy 4: Find most recent artist if multiple matches
      if (!existingArtist) {
        const allArtists = await Artist.find({}).sort({ createdAt: -1 }).limit(10);
        console.log('Strategy 4 - Recent artists for manual matching:', allArtists.map(a => ({ 
          id: a._id, 
          name: a.name.value, 
          created: a.createdAt 
        })));
        
        // Try to find by any word match
        const nameWords = name.toLowerCase().split(' ');
        existingArtist = allArtists.find(artist => {
          const artistNameLower = artist.name.value.toLowerCase();
          return nameWords.some(word => artistNameLower.includes(word) && word.length > 2);
        });
        
        if (existingArtist) {
          console.log('Strategy 4 - Word match found:', existingArtist._id, existingArtist.name.value);
        }
      }
      // First, try to find artist from recent DataActivity within last 10 minutes
      const recentActivity = await DataActivity.findOne({
        user: userId,
        category: 'artists',
        action: { $in: ['search', 'create'] },
        'details.searchQuery': name,
        createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Last 10 minutes
      }).sort({ createdAt: -1 });
      
      if (recentActivity?.itemId) {
        console.log('Found recent activity, looking for artist:', recentActivity.itemId);
        existingArtist = await Artist.findById(recentActivity.itemId);
        console.log('Found existing artist from activity:', existingArtist ? existingArtist._id : 'Not found');
      }
      
      // Fallback: search by name if no recent activity found
      if (!existingArtist) {
        console.log('No recent activity found, searching by name...');
        existingArtist = await Artist.findOne({ 
          'name.value': { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
        });
        console.log('Found artist by name:', existingArtist ? existingArtist._id : 'Not found');
      }
      
      if (existingArtist) {
        console.log('Found existing artist:', existingArtist._id, 'Name:', existingArtist.name.value);
        
        // Merge All About data with existing data (don't overwrite)
        if (!existingArtist.allAboutData) {
          existingArtist.allAboutData = {};
        }
        
        // Update specific fields
        existingArtist.allAboutData.answer = allAboutData.answer;
        existingArtist.allAboutData.images = allAboutData.images;
        existingArtist.allAboutData.sources = allAboutData.sources;
        existingArtist.allAboutData.citations = allAboutData.citations;
        existingArtist.allAboutData.relatedQuestions = allAboutData.relatedQuestions;
        existingArtist.allAboutData.searchQuery = allAboutData.metadata?.searchQuery;
        existingArtist.allAboutData.aiProvider = allAboutData.metadata?.aiProvider;
        console.log('Updating existing artist with All About data:', existingArtist._id);
        
        // Ensure allAboutData exists
        if (!existingArtist.allAboutData) {
          existingArtist.allAboutData = {};
        }
        
        // Update the answer field specifically
        existingArtist.allAboutData.answer = {
          value: allAboutData.answer?.value || '',
          reference: allAboutData.answer?.reference || 'Perplexity AI Response',
          verified: false
        };
        
        // Update other fields if they exist
        if (allAboutData.images) existingArtist.allAboutData.images = allAboutData.images;
        if (allAboutData.sources) existingArtist.allAboutData.sources = allAboutData.sources;
        if (allAboutData.citations) existingArtist.allAboutData.citations = allAboutData.citations;
        if (allAboutData.relatedQuestions) existingArtist.allAboutData.relatedQuestions = allAboutData.relatedQuestions;
        if (allAboutData.metadata?.searchQuery) existingArtist.allAboutData.searchQuery = allAboutData.metadata.searchQuery;
        if (allAboutData.metadata?.aiProvider) existingArtist.allAboutData.aiProvider = allAboutData.metadata.aiProvider;
        if (allAboutData.metadata?.aiModel) existingArtist.allAboutData.aiModel = allAboutData.metadata.aiModel;
        
        existingArtist.modifiedBy = userId;
        existingArtist.updatedAt = new Date();
        
        const savedArtist = await existingArtist.save();
        console.log('Successfully updated existing artist with All About data:', savedArtist._id);
        console.log('All About answer saved:', !!savedArtist.allAboutData?.answer?.value);
        console.log('Successfully saved All About data to existing artist:', savedArtist._id);
        console.log('Updated artist allAboutData structure:', {
          hasAnswer: !!savedArtist.allAboutData?.answer?.value,
          answerLength: savedArtist.allAboutData?.answer?.value?.length || 0,
          hasImages: !!savedArtist.allAboutData?.images?.length,
          hasSources: !!savedArtist.allAboutData?.sources?.length,
          aiProvider: savedArtist.allAboutData?.aiProvider,
          aiModel: savedArtist.allAboutData?.aiModel
        });
      } else {
        console.log('No existing artist found, creating new artist with All About data for:', name);
        
        // Create new artist with All About data
       savedNewArtist = new Artist({
          name: {
            value: name,
            reference: 'Summary Mode Search',
            verified: false
          },
          guru: {
            value: '',
            reference: 'Not searched in Summary mode',
            verified: false
          },
          gharana: {
            value: '',
            reference: 'Not searched in Summary mode',
            verified: false
          },
          notableAchievements: {
            value: '',
            reference: 'Not searched in Summary mode',
            verified: false
          },
          disciples: {
            value: '',
            reference: 'Not searched in Summary mode',
            verified: false
          },
          summary: {
            value: '',
            reference: 'Not searched in Summary mode',
            verified: false
          },
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
        
       await savedNewArtist.save();
        console.log('Successfully created new artist with All About data:', savedNewArtist._id);
        console.log('All About answer saved:', !!savedNewArtist.allAboutData?.answer?.value);
        console.log('Successfully created new artist with All About data:', savedNewArtist._id);
        console.log('New artist ID for future reference:', savedNewArtist._id);
        console.log('New artist allAboutData structure:', {
          hasAnswer: !!savedNewArtist.allAboutData?.answer?.value,
          answerLength: savedNewArtist.allAboutData?.answer?.value?.length || 0,
          hasImages: !!savedNewArtist.allAboutData?.images?.length,
          hasSources: !!savedNewArtist.allAboutData?.sources?.length,
          aiProvider: savedNewArtist.allAboutData?.aiProvider,
          aiModel: savedNewArtist.allAboutData?.aiModel
        });
      }
    } catch (saveError) {
      console.error('Error saving All About data to artist:', saveError.message);
      // Log the full error for debugging
      console.error('Full save error details:', {
        message: saveError.message,
        stack: saveError.stack,
        name: saveError.name
      });
      console.error('Full save error:', saveError);
      // Don't fail the request if saving fails, but log the error
    }
    
    // Return the All About data directly for frontend display
    res.json({
      success: true,
      data: allAboutData,
      itemId: existingArtist?._id || savedNewArtist?._id,
      mode: 'summary',
      searchQuery: name,
      provider: provider,
      model: model
    });
  } catch (error) {
    console.error('Error in getAllAboutArtist:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error in Summary search for artist' 
    });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.userId;

    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Update all provided fields (including allAboutData)
    Object.keys(updates).forEach(field => {
      if (updates[field] !== undefined) {
        artist[field] = updates[field];
      }
    });

    if (userId) {
      artist.modifiedBy = userId;
    }
    artist.updatedAt = Date.now();
    await artist.save();

    res.json({
      success: true,
      data: artist,
      message: 'Artist updated successfully'
    });
  } catch (error) {
    console.error('Error in updateArtist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating artist' 
    });
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
        $and: [
          { 'name.verified': false },
          { 'guru.verified': false },
          { 'gharana.verified': false },
          { 'notableAchievements.verified': false },
          { 'disciples.verified': false },
          { 'summary.verified': false }
        ]
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
    
    // Count artists with at least one verified field
    const partiallyVerified = await Artist.countDocuments({
      $or: [
        { 'name.verified': true },
        { 'guru.verified': true },
        { 'gharana.verified': true },
        { 'notableAchievements.verified': true },
        { 'disciples.verified': true }
      ]
    });
    
    // Count fully verified artists (all fields verified)
    const fullyVerified = await Artist.countDocuments({
      'name.verified': true,
      'guru.verified': true,
      'gharana.verified': true,
      'notableAchievements.verified': true,
      'disciples.verified': true
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
        disciples: disciplesVerified
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

    res.json({ 
      success: true,
      message: 'Artist deleted successfully',
      data: { deletedId: id, deletedName: artist.name.value }
    });
  } catch (error) {
    console.error('Error in deleteArtist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting artist' 
    });
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
              { 'disciples.verified': false },
              { 'summary.verified': false }
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

// Removed duplicate exportArtists (query-based) to avoid conflicts

exports.bulkDeleteArtists = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Artist IDs array is required'
      });
    }

    // Validate all IDs are valid MongoDB ObjectIds
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid artist IDs: ${invalidIds.join(', ')}`
      });
    }

    // Get artist names before deletion for response
    const artistsToDelete = await Artist.find({ _id: { $in: ids } }).select('name.value');
    const deletedNames = artistsToDelete.map(artist => artist.name.value);

    // Perform bulk deletion
    const result = await Artist.deleteMany({ _id: { $in: ids } });
    
    res.json({
      success: true,
      message: `${result.deletedCount} artists deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
        deletedIds: ids,
        deletedNames: deletedNames
      }
    });
  } catch (error) {
    console.error('Error in bulkDeleteArtists:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting artists'
    });
  }
};

exports.exportSingleArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    const exportData = this.formatArtistForExport(artist);
    const artistName = artist.name?.value || 'Unknown Artist';
    const shortId = artist._id.toString().slice(-8);
    const filename = `${artistName} ${shortId}`;

    switch (format.toLowerCase()) {
      case 'markdown':
        const markdown = this.generateMarkdown([exportData]);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.md"`);
        res.send(markdown);
        break;
        
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(exportData);
        break;
        
      case 'pdf':
        // Generate simple text content for PDF
        const pdfContent = this.generateTextContent([exportData]);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
        res.send(pdfContent);
        break;
        
      case 'word':
        // Generate simple text content for Word
        const wordContent = this.generateTextContent([exportData]);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
        res.send(wordContent);
        break;
        
      default:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(exportData);
        break;
    }
  } catch (error) {
    console.error('Error in exportSingleArtist:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting artist'
    });
  }
};

exports.exportArtists = async (req, res) => {
  try {
    const { format = 'json', ids } = req.body;
    let query = {};
    
    // If specific IDs provided, export only those
    if (ids && Array.isArray(ids) && ids.length > 0) {
      query = { _id: { $in: ids } };
    }
    
    const artists = await Artist.find(query).sort({ 'name.value': 1 });
    
    if (artists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No artists found to export'
      });
    }

    const exportData = artists.map(artist => formatArtistForExport(artist));

    const filename = (ids && ids.length === 1)
      ? `${exportData[0].name} ${artists[0]._id.toString().slice(-8)}`
      : `artists-${artists.length}-${new Date().toISOString().slice(0,10)}`;

    if (format.toLowerCase() === 'markdown') {
      const markdown = generateArtistMarkdown(exportData);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.md"`);
      return res.send(markdown);
    }

    return res.json({
      success: true,
      data: {
        artists: exportData,
        count: artists.length,
        exported: new Date().toISOString(),
        filename: `${filename}.${format.toLowerCase()}`,
        format: format.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Error in exportArtists:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting artists'
    });
  }
};

// Helper function to format artist data for export
function formatArtistForExport(artist) {
  return {
    id: artist._id,
    name: artist.name?.value || 'N/A',
    guru: artist.guru?.value || 'N/A',
    gharana: artist.gharana?.value || 'N/A',
    notableAchievements: artist.notableAchievements?.value || 'N/A',
    disciples: artist.disciples?.value || 'N/A',
    summary: artist.summary?.value || 'N/A',
    verification: {
      name: artist.name?.verified || false,
      guru: artist.guru?.verified || false,
      gharana: artist.gharana?.verified || false,
      notableAchievements: artist.notableAchievements?.verified || false,
      disciples: artist.disciples?.verified || false,
      summary: artist.summary?.verified || false
    },
    sources: {
      name: artist.name?.reference || 'N/A',
      guru: artist.guru?.reference || 'N/A',
      gharana: artist.gharana?.reference || 'N/A',
      notableAchievements: artist.notableAchievements?.reference || 'N/A',
      disciples: artist.disciples?.reference || 'N/A',
      summary: artist.summary?.reference || 'N/A'
    },
    metadata: {
      createdAt: artist.createdAt,
      updatedAt: artist.updatedAt,
      verificationPercentage: calculateArtistVerificationPercentage(artist)
    }
  };
}

// Helper function to calculate verification percentage
function calculateArtistVerificationPercentage(artist) {
  const fields = ['name', 'guru', 'gharana', 'notableAchievements', 'disciples', 'summary'];
  const verifiedFields = fields.filter(field => artist[field]?.verified);
  return Math.round((verifiedFields.length / fields.length) * 100);
}

// Helper function to generate markdown
function generateArtistMarkdown(artists) {
  let markdown = '# Indian Classical Music Artists\n\n';
  markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
  markdown += `**Total Artists:** ${artists.length}\n\n`;
  markdown += '---\n\n';
  
  artists.forEach((artist, index) => {
    markdown += `## ${index + 1}. ${artist.name}\n\n`;
    
    if (artist.summary && artist.summary !== 'N/A') {
      markdown += `### Summary\n${artist.summary}\n\n`;
    }
    
    markdown += '### Details\n\n';
    if (artist.guru !== 'N/A') markdown += `**Guru:** ${artist.guru}\n\n`;
    if (artist.gharana !== 'N/A') markdown += `**Gharana:** ${artist.gharana}\n\n`;
    if (artist.notableAchievements !== 'N/A') markdown += `**Notable Achievements:** ${artist.notableAchievements}\n\n`;
    if (artist.disciples !== 'N/A') markdown += `**Disciples:** ${artist.disciples}\n\n`;
    
    markdown += '### Verification Status\n\n';
    markdown += `- **Verification Progress:** ${artist.metadata.verificationPercentage}%\n`;
    markdown += `- **Name:** ${artist.verification.name ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Guru:** ${artist.verification.guru ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Gharana:** ${artist.verification.gharana ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Achievements:** ${artist.verification.notableAchievements ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Disciples:** ${artist.verification.disciples ? '✅ Verified' : '❌ Unverified'}\n`;
    markdown += `- **Summary:** ${artist.verification.summary ? '✅ Verified' : '❌ Unverified'}\n\n`;
    
    markdown += '### Sources\n\n';
    if (artist.sources.name !== 'N/A') markdown += `**Name Source:** ${artist.sources.name}\n\n`;
    if (artist.sources.guru !== 'N/A') markdown += `**Guru Source:** ${artist.sources.guru}\n\n`;
    if (artist.sources.gharana !== 'N/A') markdown += `**Gharana Source:** ${artist.sources.gharana}\n\n`;
    if (artist.sources.notableAchievements !== 'N/A') markdown += `**Achievements Source:** ${artist.sources.notableAchievements}\n\n`;
    if (artist.sources.disciples !== 'N/A') markdown += `**Disciples Source:** ${artist.sources.disciples}\n\n`;
    if (artist.sources.summary !== 'N/A') markdown += `**Summary Source:** ${artist.sources.summary}\n\n`;
    
    markdown += `**Created:** ${new Date(artist.metadata.createdAt).toLocaleString()}\n\n`;
    markdown += `**Last Updated:** ${new Date(artist.metadata.updatedAt).toLocaleString()}\n\n`;
    
    markdown += '---\n\n';
  });
  
  return markdown;
}