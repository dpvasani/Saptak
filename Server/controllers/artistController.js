const Artist = require('../models/Artist');
const scraperService = require('../services/scraper');
const aiResearcher = require('../services/aiResearcher');
const geminiResearcher = require('../services/geminiResearcher');
const perplexityResearcher = require('../services/perplexityResearcher');
const perplexityAllAboutService = require('../services/perplexityAllAboutService');
const { aiLimiter, webScrapingLimiter } = require('../middleware/rateLimiter');
const mongoose = require('mongoose');

exports.searchArtist = async (req, res) => {
  try {
    const { name, useAI, aiProvider, aiModel } = req.query;
    console.log('Search request received:', { name, useAI, aiProvider, aiModel });
    
    if (!name) {
      return res.status(400).json({ message: 'Artist name is required' });
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

    // Create new artist with the researched data
    const artist = new Artist(data);
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
    const { name } = req.query;
    console.log('All About search request received for artist:', name);
    
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: 'Artist name is required' 
      });
    }

    // Apply AI rate limiting
    await new Promise((resolve, reject) => {
      aiLimiter(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Using Perplexity "All About" mode for artist:', name);
    const allAboutData = await perplexityAllAboutService.getAllAboutArtist(name);
    
    res.json({
      success: true,
      data: allAboutData,
      mode: 'all-about',
      searchQuery: name
    });
  } catch (error) {
    console.error('Error in getAllAboutArtist:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error in "All About" search for artist' 
    });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow updating verified fields
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Update only verified fields
    Object.keys(updates).forEach(field => {
      if (artist[field] && updates[field].verified) {
        artist[field] = updates[field];
      }
    });

    artist.updatedAt = Date.now();
    await artist.save();

    res.json(artist);
  } catch (error) {
    console.error('Error in updateArtist:', error);
    res.status(500).json({ message: 'Error updating artist' });
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
              { 'disciples.verified': false }
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

exports.exportArtists = async (req, res) => {
  try {
    const { format } = req.query;
    const artists = await Artist.find().sort({ 'name.value': 1 });
    
    if (format === 'markdown') {
      let markdown = '# Indian Classical Music Artists\n\n';
      
      artists.forEach(artist => {
        markdown += `## ${artist.name.value}\n\n`;
        if (artist.guru.value) markdown += `**Guru:** ${artist.guru.value}\n\n`;
        if (artist.gharana.value) markdown += `**Gharana:** ${artist.gharana.value}\n\n`;
        if (artist.notableAchievements.value) markdown += `**Achievements:** ${artist.notableAchievements.value}\n\n`;
        if (artist.disciples.value) markdown += `**Disciples:** ${artist.disciples.value}\n\n`;
        markdown += '---\n\n';
      });
      
      res.setHeader('Content-Type', 'text/markdown');
      res.send(markdown);
    } else {
      // For PDF and Word, return JSON that frontend can process
      res.json(artists);
    }
  } catch (error) {
    console.error('Error in exportArtists:', error);
    res.status(500).json({ message: 'Error exporting artists' });
  }
};

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

    switch (format.toLowerCase()) {
      case 'markdown':
        const markdown = this.generateMarkdown([exportData]);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${artist.name.value.replace(/[^a-zA-Z0-9]/g, '-')}.md"`);
        res.send(markdown);
        break;
        
      case 'pdf':
        // Return structured data for frontend PDF generation
        res.json({
          success: true,
          data: {
            format: 'pdf',
            content: [exportData],
            filename: `${artist.name.value.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
          }
        });
        break;
        
      case 'word':
        // Return structured data for frontend Word generation
        res.json({
          success: true,
          data: {
            format: 'word',
            content: [exportData],
            filename: `${artist.name.value.replace(/[^a-zA-Z0-9]/g, '-')}.docx`
          }
        });
        break;
        
      default:
        res.json({
          success: true,
          data: exportData
        });
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

    const exportData = artists.map(artist => this.formatArtistForExport(artist));
    const filename = ids && ids.length > 0 ? 
      `selected-artists-${ids.length}` : 
      `all-artists-${artists.length}`;

    switch (format.toLowerCase()) {
      case 'markdown':
        const markdown = this.generateMarkdown(exportData);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.md"`);
        res.send(markdown);
        break;
        
      case 'pdf':
        // Return structured data for frontend PDF generation
        res.json({
          success: true,
          data: {
            format: 'pdf',
            content: exportData,
            filename: `${filename}.pdf`,
            count: artists.length
          }
        });
        break;
        
      case 'word':
        // Return structured data for frontend Word generation
        res.json({
          success: true,
          data: {
            format: 'word',
            content: exportData,
            filename: `${filename}.docx`,
            count: artists.length
          }
        });
        break;
        
      default:
        res.json({
          success: true,
          data: {
            artists: exportData,
            count: artists.length,
            exported: new Date().toISOString()
          }
        });
    }
  } catch (error) {
    console.error('Error in exportArtists:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting artists'
    });
  }
};

// Helper method to format artist data for export
exports.formatArtistForExport = (artist) => {
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
      verificationPercentage: this.calculateVerificationPercentage(artist)
    }
  };
};

// Helper method to calculate verification percentage
exports.calculateVerificationPercentage = (artist) => {
  const fields = ['name', 'guru', 'gharana', 'notableAchievements', 'disciples', 'summary'];
  const verifiedFields = fields.filter(field => artist[field]?.verified);
  return Math.round((verifiedFields.length / fields.length) * 100);
};

// Helper method to generate markdown
exports.generateMarkdown = (artists) => {
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
};